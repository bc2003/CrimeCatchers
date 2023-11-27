const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');
const fs = require("fs");

// load queries here from sql_scripts/queries.sql (TODO)

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`
};

// See https://stackoverflow.com/a/1373724
const EMAIL_REGEX = "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

async function fetchDemotableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM DEMOTABLE');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function initiateDemotable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE DEMOTABLE`);
        } catch(err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE DEMOTABLE (
                id NUMBER PRIMARY KEY,
                name VARCHAR2(20)
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

// Define the incident data according to your ER diagram and functionality requirements
const incidentData = {
    Email: 'user@example.com',
    Description: 'Description of the incident',
    Date: new Date().toISOString(),
    Status: 'created',
    Involved: [
      {
        name: 'John Doe',
        specialAttributes: { /* special attributes as per your ER diagram */ }
      },
      // ... other involved persons
    ]
  };


/**
 * Get information about a reporter.
 * @param {String} email email of the reporter to look up
 * @returns {Object} reporterInfo
 * @returns {String} reporterInfo.name the name of the reporter
 * @returns {String} reporterInfo.address the address of the reporter
 * @returns {String} reporterInfo.phoneNumber the phone number of the reporter
 */
async function getReporter(email) {
    let reporterInfo;

    return withOracleDB((connection) => {
        return connection.execute("SELECT * FROM Reporter WHERE email=:email",
            [email], { autoCommit: true } )
            .then((result) => {
                reporterInfo.name = result.rows[0].NAME;
                reporterInfo.address = result.rows[0].ADDRESS;
                reporterInfo.phoneNumber = result.rows[0].PHONENUMBER;
                return reporterInfo;
            });
    });
}

/**
 * Get incidents, filtering by the filter info.
 * @param filterInfo - filter all incidents by keys in here (all optional)
 * @param filterInfo.email - filter all incidents for those whose reporter email matches
 * @returns {Promise<void>}
 */
async function getIncidents(filterInfo) {
    return withOracleDB((connection) => {
        return connection.execute(`SELECT i.incidentID, i.description, i.dateIncident, s.statusValue
            FROM IncidentInfo i, IncidentStatus s, ReportedBy b
            WHERE i.description = s.description AND b.incidentID = i.incidentID AND b.email = :email`,
            [filterInfo.email], {autoCommit: true})
            .then((result) => {
                console.log("returning rows");
                console.log(JSON.stringify(result.rows));
                return result.rows;
            });
    });
}

  async function updateReporterDetails(name, address, phoneNumber, email) {
    const reporterData = {
      Name: name,
      Address: address,
      PhoneNumber: phoneNumber,
      Email: email
    };

    try {
      const response = await fetch('/reporter', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Include any other headers like authorization tokens if required
        },
        body: JSON.stringify(reporterData)
      });

      if (response.ok) {
        console.log('Reporter details updated successfully.');
      } else {
        console.error('Failed to update reporter details. Status:', response.status);
      }
    } catch (error) {
      console.error('Error updating reporter details:', error);
    }
  }


  async function getEquipmentDetails(incidentID, sort_by, display) {
    const queryParams = new URLSearchParams({
      incidentID,
      sort_by,
      display: display.join(',') // Convert array to comma-separated string
    });

    try {
      const response = await fetch(`/municipal/equipment?${queryParams}`, {
        method: 'GET',
        // Include headers if necessary
      });

      if (response.ok) {
        const equipmentDetails = await response.json();
        console.log('Equipment details retrieved:', equipmentDetails);
        return equipmentDetails;
      } else {
        console.error('Failed to retrieve equipment details. Status:', response.status);
      }
    } catch (error) {
      console.error('Error retrieving equipment details:', error);
    }
  }


async function insertDemotable(id, name) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO DEMOTABLE (id, name) VALUES (:id, :name)`,
            [id, name],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function updateNameDemotable(oldName, newName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE DEMOTABLE SET name=:newName where name=:oldName`,
            [newName, oldName],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function countDemotable() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT Count(*) FROM DEMOTABLE');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}

/**
 * Creates a reporter with the following info
 * @param {Object} reporterInfo
 * @param {string} reporterInfo.email             Email of reporter
 * @param {string} reporterInfo.name              Name of reporter
 * @param {string} reporterInfo.address           Address of reporter
 * @param {string} reporterInfo.phoneNumber       Phone # of reporter
 */
function createReporter(reporterInfo) {
    if (!reporterInfo.email.match(EMAIL_REGEX)) {
        throw new Error("Invalid email");
    }

    return withOracleDB((connection) => {
       return connection.execute(`INSERT INTO Reporter VALUES ('${reporterInfo.name}', '${reporterInfo.address}', '${reporterInfo.phoneNumber}', '${reporterInfo.email}')`,
           [], { autoCommit: true });
    });
}

/**
 * Creates an incident with the following info
 * @param {Object} incidentInfo              Some incident info
 * @param {string} incidentInfo.email        Email of the reporting person
 * @param {string} incidentInfo.description  Description of the incident
 * @param {string} incidentInfo.date         Date of incident (in ISO format)
 * @param {Object[]} incidentInfo.involved   Involved people
 * @param {string} incidentInfo.involved.name Name of involved person
 * @param {Object} incidentInfo.involved.specialAttributes Identifier for the type of Involved Person
 *
 * @note incidentInfo.involved.physicalBuild and incidentInfo.involved.numPriorOffenses for Suspect,
 *       incidentInfo.involved.injuries for Victim,
 *       incidentInfo.involved.phoneNumber for Bystander
 *
 * @returns {Object} generated - Generated ids
 * @returns {number} generated.incidentID - incident ID
 * @returns {number[]} generated.involvedIDs - IDs for all involved people
 *
 * @throws {Error} if updating the database fails
 */
async function createIncident(incidentInfo) {
    // validate email and date in expected formats

    // https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
    // for the regex
    if (!incidentInfo.email.match(EMAIL_REGEX)) {
        throw new Error("Invalid email");
    }

    const dateNum = Date.parse(incidentInfo.date);
    if (isNaN(dateNum)) {
        throw new Error("Invalid date");
    }

    return await withOracleDB(async (connection) => {
        // const dateIncident = incidentInfo.date.substring(0, 10);
        const dateIncident = incidentInfo.date;
        const dateFormat = "yyyy-MM-dd";
        let generatedIncidentID = await connection.execute("SELECT incidentid.nextval FROM dual", [], { outFormat: oracledb.OUT_FORMAT_OBJECT })
            .then((result) => {
                return result.rows[0].NEXTVAL
            });
        for (let involved of incidentInfo.involved) {
            await addInvolvedPerson(involved);
        }

        // Note: these are protected from injection when using bound variables
        await connection.execute(`INSERT INTO IncidentStatus VALUES (:incident_description, :incident_status)`, [incidentInfo.description, incidentInfo.status], { autoCommit: true });
        let queryInfo = `INSERT INTO IncidentInfo VALUES (${generatedIncidentID}, TO_DATE('${dateIncident}', '${dateFormat}'), '${incidentInfo.description}')`; // TODO bindings
        await connection.execute(queryInfo, [], { autoCommit: true });
        await connection.execute(`INSERT INTO ReportedBy VALUES (${generatedIncidentID}, '${incidentInfo.email}', TO_DATE('${dateIncident}', '${dateFormat}'))`, [], { autoCommit: true });
        return {
            incidentID: generatedIncidentID
        };
    });
}

async function updateIncident(incidentInfo) {
    return withOracleDB((connection) => {
        // TODO use incidentInfo
        return connection.execute(`UPDATE IncidentInfo SET date = TO_DATE(:date, "yyyy-MM-dd"), description = newDescription`);
    });
}

/**
 * Add a location
 * @param {String} location the address
 * @param {String} neighbourhood the nehighbourhood that this address is located at
 * @returns {Promise<void>}
 */
async function addLocation(location, neighbourhood) {
    return withOracleDB(((connection) => {
        return connection.execute(`INSERT INTO Location VALUES (:location, :neighbourhood)`,
            [location, neighbourhood], { autoCommit: true });
    }));
}

/**
 * Add an involved person
 * @param {Object} involvedInfo   The info for the involved person
 * @param {String} involvedInfo.name Name of the involved person
 * @param {String} involvedInfo.location Location of the involved person
 * then ONE OF THE FOLLOWING:
 * physicalBuild: string, numPriorOffenses: number
 * OR
 * injuries: string
 * OR
 * phoneNumber: string
 *
 * @returns {Promise<{personID: number}>} generated personID for the new involved person
 */
async function addInvolvedPerson(involvedInfo) {
    // make sure that a specific kind of involved person is specified
    if (involvedInfo.physicalBuild && involvedInfo.numPriorOffenses && (involvedInfo.injuries || involvedInfo.phoneNumber)) {
        throw new Error("Not a valid suspect");
    }
    if (involvedInfo.injuries && (involvedInfo.physicalBuild || involvedInfo.numPriorOffenses || involvedInfo.phoneNumber)) {
        throw new Error("Not a valid victim");
    }
    if (involvedInfo.phoneNumber && (involvedInfo.physicalBuild || involvedInfo.numPriorOffenses || involvedInfo.injuries)) {
        throw new Error("Not a valid bystander");
    }

    try {
        await addLocation(involvedInfo.location, involvedInfo.neighbourhood);
    } catch (err) {
        if (err.message.includes("unique constraint")) {
            // this is ok
            console.log("Location already exists, ok");
        } else {
            throw new Error(err);
        }
    }

    return withOracleDB(async (connection) => {
        const personID = await connection.execute(`SELECT personID.nextval from dual`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT })
            .then((result) => {
                return result.rows[0].NEXTVAL
            });
        await connection.execute(`INSERT INTO InvolvedPerson VALUES (:name, :personID, :presentAtAddress)`,
            [involvedInfo.name, personID, involvedInfo.location], { autoCommit: true });

        if (involvedInfo.physicalBuild) {
            await connection.execute(`INSERT INTO Suspect
                                      VALUES (:personID, :physicalBuild, :numPriorOffenses)`,
                [personID, involvedInfo.physicalBuild, involvedInfo.numPriorOffenses], {autoCommit: true});
        } else if (involvedInfo.injuries) {
            await connection.execute(`INSERT INTO Victim VALUES (:personID, :injuries)`,
                [personID, involvedInfo.injuries]);
        } else if (involvedInfo.phoneNumber) {
            await connection.execute(`INSERT INTO Bystander VALUES (:personID, :phoneNumber)`,
                [personID, involvedInfo.phoneNumber], { autoCommit: true });
        }
        return {
            personID: personID
        };
    });
}

/**
 * Drop and then create all the tables again.
 *
 * WARNING: this WILL lead to a loss of data!
 */
async function recreateAllTables() {
    return withOracleDB(async (connection) => {
        const tables = ["IncidentStatus", "IncidentInfo", "Location", "OccurredAt", "Department",
            "Responder", "AssignedTo", "InvolvedPerson", "Involves", "Suspect", "Victim",
            "Bystander", "Reporter", "ReportedBy", "EquipmentInfo", "EquipmentItem",
            "VehicleSpecs", "VehicleInfo"].reverse(); // reverse to delete dependencies first

        const sequences = ["incidentID", "branchID", "professionalID", "personID", "equipmentID"];

        for (let table of tables) {
            // cannot do async due to max connection limit
            try {
                await withOracleDB((connection) => {
                    return connection.execute(`DROP TABLE ${table}`);
                });
            } catch (ignored) {}
        }

        for (let seq of sequences) {
            try {
                await withOracleDB((connection) => {
                    return connection.execute(`DROP SEQUENCE ${seq}`);
                });
            } catch (ignored) {}
        }

        // create the tables again using the .sql file
        const fileName = "create_tables_and_sequences.sql";
        let commands = fs.readFileSync(fileName, 'utf-8').toString().split(";");
        commands = commands.filter((c) => c !== "");
        for (let command of commands) {
            await withOracleDB(async (connection) => {
                try {
                    await connection.execute(command);
                } catch (err) {
                    console.log(`error executing ${command}`);
                }
            });
        }
    });
}

module.exports = {
    testOracleConnection,
    fetchDemotableFromDb,
    initiateDemotable, 
    insertDemotable, 
    updateNameDemotable, 
    countDemotable,
    createIncident,
    recreateAllTables,
    createReporter,
    getReporter,
    updateIncident,
    addInvolvedPerson,
    getIncidents
};