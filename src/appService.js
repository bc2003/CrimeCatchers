const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');
const fetch = require('node-fetch');
const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`
};


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
  
  // Call the function with the incident data
  reportIncident(incidentData).then(responseData => {
    if (responseData) {
      // Do something with the responseData.incidentID
    }
  });


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
          // Include any other headers like authorization tokens if required
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

module.exports = {
    testOracleConnection,
    fetchDemotableFromDb,
    initiateDemotable, 
    insertDemotable, 
    updateNameDemotable, 
    countDemotable
};