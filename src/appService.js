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

  // Function to make the POST request to the server
  async function reportIncident(incidentData) {

    const url = 'http://localhost:65535/civilian/incident'; // Replace with your actual domain and port
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add other headers like authorization if required
            },
            body: JSON.stringify(incidentData) // Convert the incident data to a JSON string
        });

        if (response.ok) {
            const responseData = await response.json();
            console.log('Incident reported successfully. Incident ID:', responseData.incidentID);
            return responseData; // Contains the incidentID
        } else {
            console.error('Failed to report the incident. Status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error reporting the incident:', error);
        return null;
    }
}


  async function updateIncident(incidentID, newDescription, date) {
    const updateData = {
      incidentID,
      date,
      newDescription,
      Status: 'Cancelled' // Status is hardcoded as "Cancelled"
    };

    try {
      const response = await fetch('/incident-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        console.log('Incident updated successfully.');
      } else {
        console.error('Failed to update the incident. Status:', response.status);
      }
    } catch (error) {
      console.error('Error updating the incident:', error);
    }
  }

  async function deleteIncident(incidentID) {
    try {
      const response = await fetch(`/incident?incidentID=${encodeURIComponent(incidentID)}`, {
        method: 'DELETE',
        // Include headers if necessary, like authorization
      });

      if (response.ok) {
        console.log('Incident deleted successfully.');
      } else {
        console.error('Failed to delete the incident. Status:', response.status);
      }
    } catch (error) {
      console.error('Error deleting the incident:', error);
    }
  }

  async function getReporterDetails(email) {
    try {
      const response = await fetch(`/reporter?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        // Include headers if necessary
      });

      if (response.ok) {
        const reporterDetails = await response.json();
        console.log('Reporter details:', reporterDetails);
        return reporterDetails;
      } else if (response.status === 404) {
        console.error('Reporter not found.');
      } else {
        console.error('Failed to get reporter details. Status:', response.status);
      }
    } catch (error) {
      console.error('Error getting reporter details:', error);
    }
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


  async function getIncidents(sort_by, status, display) {
    const queryParams = new URLSearchParams({
      sort_by,
      status,
      display: display.join(',') // Convert array to comma-separated string
    });

    try {
      const response = await fetch(`/municipal/incident?${queryParams}`, {
        method: 'GET',
        // Include headers if necessary, such as authorization tokens
      });

      if (response.ok) {
        const incidents = await response.json();
        console.log('Incidents retrieved:', incidents);
        return incidents;
      } else {
        console.error('Failed to retrieve incidents. Status:', response.status);
      }
    } catch (error) {
      console.error('Error retrieving incidents:', error);
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
            // TODO: add involved persons with the right type
        }
        await connection.execute(`INSERT INTO IncidentStatus VALUES ('${incidentInfo.description}', '${incidentInfo.status}')`, [], { autoCommit: true });
        let queryInfo = `INSERT INTO IncidentInfo VALUES (${generatedIncidentID}, TO_DATE('${dateIncident}', '${dateFormat}'), '${incidentInfo.description}')`;
        await connection.execute(queryInfo, [], { autoCommit: true });
        await connection.execute(`INSERT INTO ReportedBy VALUES (${generatedIncidentID}, '${incidentInfo.email}', TO_DATE('${dateIncident}', '${dateFormat}'))`);
        return {
            incidentID: generatedIncidentID
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
    createReporter
};