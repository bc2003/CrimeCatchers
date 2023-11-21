/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */


// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    loadingGifElem.style.display = 'none';
    // Display the statusElem's text in the placeholder.
    statusElem.style.display = 'inline';

    response.text()
    .then((text) => {
        statusElem.textContent = text;
    })
    .catch((error) => {
        statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
    });
}

// Fetches data from the demotable and displays it.
async function fetchAndDisplayUsers() {
    const tableElement = document.getElementById('demotable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/demotable', {
        method: 'GET'
    });

    const responseData = await response.json();
    const demotableContent = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    demotableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// This function resets or initializes the demotable.
async function resetDemotable() {
    const response = await fetch("/initiate-demotable", {
        method: 'POST'
    });
    const responseData = await response.json();

    if (responseData.success) {
        const messageElement = document.getElementById('resetResultMsg');
        messageElement.textContent = "demotable initiated successfully!";
        fetchTableData();
    } else {
        alert("Error initiating table!");
    }
}

// Inserts new records into the demotable.
async function insertDemotable(event) {
    event.preventDefault();

    const idValue = document.getElementById('insertId').value;
    const nameValue = document.getElementById('insertName').value;

    const response = await fetch('/insert-demotable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: idValue,
            name: nameValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('insertResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error inserting data!";
    }
}


// Inserts new records into the demotable.
async function addIncident(event) {
    event.preventDefault();

    const emailValue = document.getElementById("email_add").value;
    const descriptionValue = document.getElementById("description_add").value;
    const dateValue = document.getElementById("date_add").value;

    console.log(dateValue);

    const response = await fetch('/civilian/incident', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: emailValue,
            description: descriptionValue,
            date: dateValue,
            involved: []
        })
    });

    const responseStatus = await response.status;
    const responseData = await response.json();
    const messageElement = document.getElementById('addIncidentResponse');

    if (responseStatus === 200) {
        messageElement.textContent = `Added incident successfully with ID ${responseData.incidentID}`;
    } else {
        messageElement.textContent = `There was an error`;
    }
}


// Inserts new records into the demotable.
async function updateIncident(event) {
    event.preventDefault();
    const date = document.getElementById("date_update").value;
    const incidentID = document.getElementById("incidentID_update").value;
    const new_desc = document.getElementById("newDescription").value;
    const status = document.getElementById("status_update").value;
    const response = await fetch('/civilian/incident-update', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            date: date,
            description: new_desc,
            status: status,
            incidentID: incidentID
        })
    });

    const responseStatus = await response.status;
    const responseData = await response.json();
    const messageElement = document.getElementById('updateIncidentResponse');

    if (responseStatus === 200) {
        messageElement.textContent = `Updated incident successfully with ID`;
    } else {
        messageElement.textContent = `There was an error`;
    }
}

async function addReporter(event) {
    event.preventDefault();
    console.log("THIS GETS PRINTED")
    const reporterEmail = document.getElementById("reporterEmail").value;
    const reporterName = document.getElementById("reporterName").value;
    const reporterAddress = document.getElementById("reporterAddress").value;
    const phone = document.getElementById("reporterPhone").value;
    const response = await fetch('/civilian/reporter', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: reporterEmail,
            name: reporterName,
            address: reporterAddress,
            phoneNumber: phone
        })
    });

    const responseStatus = await response.status;
    const messageElement = document.getElementById('addReporter_text');

    if (responseStatus === 200) {
        messageElement.textContent = `Added the reporter`;
    } else {
        messageElement.textContent = `There was an error`;
    }
}

async function deleteIncident(event) {
    event.preventDefault();
    console.log("THIS GETS PRINTED")
    const deleteID = document.getElementById("delete_ID").value;
    const response = await fetch('/civilian/incident', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            deleteID: deleteID,
        })
    });

    const responseStatus = await response.status;
    const messageElement = document.getElementById('deleted_Incident');

    if (responseStatus === 200) {
        messageElement.textContent = `The incident was deleted`;
    } else {
        messageElement.textContent = `There was an error`;
    }
}

async function getReporter(event) {
    event.preventDefault();
    console.log("THIS GETS PRINTED")
    const email = document.getElementById("getEmail").value;
    const response = await fetch('/civilian/reporter', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            deleteID: email,
        })
    });

    const responseStatus = await response.status;
    const messageElement = document.getElementById('getReporterDetails');

    if (responseStatus === 200) {
        messageElement.textContent = `Added reporter Details are ${responseData.name}, ${responseData.address},  ${responseData.phoneNumber}`;
    } else {
        messageElement.textContent = `There was an error`;
    }
}






// Updates names in the demotable.
async function updateNameDemotable(event) {
    event.preventDefault();
    const oldNameValue = document.getElementById('updateOldName').value;
    const newNameValue = document.getElementById('updateNewName').value;

    const response = await fetch('/update-name-demotable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            oldName: oldNameValue,
            newName: newNameValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateNameResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Name updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating name!";
    }
}

// Counts rows in the demotable.
// Modify the function accordingly if using different aggregate functions or procedures.
async function countDemotable() {
    const response = await fetch("/count-demotable", {
        method: 'GET'
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('countResultMsg');

    if (responseData.success) {
        const tupleCount = responseData.count;
        messageElement.textContent = `The number of tuples in demotable: ${tupleCount}`;
    } else {
        alert("Error in count demotable!");
    }
}


// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    checkDbConnection();
    fetchTableData();
    document.getElementById("addReporter").addEventListener("submit", addReporter);
    document.getElementById("updateIncident").addEventListener("submit", updateIncident);
    document.getElementById("addIncident").addEventListener("submit", addIncident);
    document.getElementById("resetDemotable").addEventListener("click", resetDemotable);
    document.getElementById("insertDemotable").addEventListener("submit", insertDemotable);
    document.getElementById("updataNameDemotable").addEventListener("submit", updateNameDemotable);
    document.getElementById("countDemotable").addEventListener("click", countDemotable);
    document.getElementById("deleteIncident").addEventListener("submit", deleteIncident);
    document.getElementById("getReporterDetailsForm").addEventListener("submit", getReporter);



};

// General function to refresh the displayed table data. 
// You can invoke this after any table-modifying operation to keep consistency.
function fetchTableData() {
    fetchAndDisplayUsers();
}
