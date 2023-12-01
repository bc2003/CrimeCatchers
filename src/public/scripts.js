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

let displayedEmailIncidentTable = '';


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



async function refreshIncidentTable(submittedEmail) {
    if (submittedEmail !== displayedEmailIncidentTable) {
        return;
    }

    const tableElement = document.getElementById('myIncidents');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch(`/civilian/incidents/${submittedEmail}`, {
        method: 'GET'
    });

    const responseData = await response.json();
    console.log(JSON.stringify(responseData));

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    responseData.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

function fetchIncidentData(event) {
    event.preventDefault();

    displayedEmailIncidentTable = document.getElementById("civilianEmail").value;
    return refreshIncidentTable(displayedEmailIncidentTable);
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
    const messageElement = document.getElementById('addIncidentResponse');

    if (responseStatus === 200) {
        const responseData = await response.json();
        refreshIncidentTable(emailValue).finally(() => {
            messageElement.textContent = `Added incident successfully with ID ${responseData.incidentID}`;
        });
    } else {
        console.log("handling failure");
        const errorText = await response.text();
        messageElement.textContent = `There was an error - ${errorText}`;
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
            newDescription: new_desc,
            status: status,
            incidentID: incidentID
        })
    });

    const responseStatus = await response.status;
    const responseData = await response.json();
    console.log(`got response data ${JSON.stringify(responseData)}`);
    const messageElement = document.getElementById('updateIncidentResponse');

    if (responseStatus === 200) {
        refreshIncidentTable(responseData.email).finally(() => {
            messageElement.textContent = `Updated incident successfully`;
        });
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






async function addInvolvedWitness(event) {
    event.preventDefault();
    const name = document.getElementById("involvedName").value;
    const address = document.getElementById("involvedLocation").value;
    const neighbourhood = document.getElementById("involvedNeighbourhood").value;
    const phoneNumber = document.getElementById("involvedPhoneNumber").value;
    const incidentID = document.getElementById("involvedIncidentID").value;

    let input = {
        name: name,
        location: address,
        neighbourhood: neighbourhood,
        phoneNumber: phoneNumber
    };

    if (incidentID) {
        input.incidentID = incidentID
    };

    const response = await fetch("/civilian/involvedperson", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
    });

    const responseStatus = response.status;
    const responseData = await response.json();

    const messageElement = document.getElementById("involvedPersonResult");

    if (responseStatus === 200) {
        messageElement.textContent = `Successfully added a involved witness with ID ${responseData.personID}`;
    } else {
        const text = await response.text();
        messageElement.textContent = `There was an error - ${text}`;
    }
}













// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    checkDbConnection();

    document.getElementById("showIncidents").addEventListener("submit", fetchIncidentData, true);
    document.getElementById("InvolvedPerson").addEventListener("submit", addInvolvedWitness, true);
    document.getElementById("addReporter").addEventListener("submit", addReporter, true);
    document.getElementById("updateIncident").addEventListener("submit", updateIncident, true);
    document.getElementById("addIncident").addEventListener("submit", addIncident,true);
    document.getElementById("deleteIncident").addEventListener("submit", deleteIncident, true);
    document.getElementById("getReporterDetailsForm").addEventListener("submit", getReporter, true);
};
