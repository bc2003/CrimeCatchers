const DEFAULT_PARAMS = {
    display: ["incidentID", "statusValue", "dateIncident", "description"]
};

/**
 * Refresh the table
 * @param params as specified to the /municipal/incidents GET uri params
 *
 * Attribution: see the starter code for CPSC 304 NodeJS
 */
function refreshTable(params) {
    const table = document.getElementById("allIncidents");
    const body = table.querySelector("tbody");

    fetch("/municipal/incidents?" + new URLSearchParams(params), {
        method: 'GET'
    }).then(async (response) => {
        const responseData = await response.json();
        console.log(`result is ${JSON.stringify(responseData)}`);

        if (body) {
            body.innerHTML = '';
        }

        responseData.forEach((incident) => {
            const row= body.insertRow();
            incident.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            })
        })
    });
}

async function getEquipment(event) {
    event.preventDefault();
    console.log("THIS GETS PRINTED")
    const email = document.getElementById("IncidentID").value;
    const response = await fetch('/municipal/equipment', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            deleteID: email,
        })
    });

    const responseStatus = await response.status;
    const messageElement = document.getElementById('getEquipment');

    if (responseStatus === 200) {
        messageElement.textContent = `The equipments are ${responseData.ID}, ${responseData.type},  ${responseData.weight}, ${responseData.color}`;
    } else {
        messageElement.textContent = `There was an error`;
    }
}

async function deleteProfessionalID(event) {
    event.preventDefault();
    console.log("THIS GETS PRINTED")
    const deleteID = document.getElementById("delete_prof").value;
    const response = await fetch('/municipal/incident', {
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

async function addProfessionalReporter(event) {
    event.preventDefault();
    console.log("THIS GETS PRINTED")
    const professionalID = document.getElementById("ProfessionalreporterID").value;
    const dept = document.getElementById("departmentNumber").value;
    const name = document.getElementById("ResponderName").value;
    const occupation = document.getElementById("Occupation").value;

    const response = await fetch('/municipal/responder', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            professionalID: professionalID,
            dept: dept,
            name: name,
            occupation: occupation
        })
    });

    const responseStatus = await response.status;
    const messageElement = document.getElementById('addProfessionalReporter');

    if (responseStatus === 200) {
        messageElement.textContent = `Added the responder`;
    } else {
        messageElement.textContent = `There was an error`;
    }
}


async function ViewNeighbourHood(event) {
    event.preventDefault();
    fetch('/municipal/neighbourhood/incidents')
        .then(response => response.json())
        .then(data => {
            const resultsContainer = document.getElementById('results');
            resultsContainer.innerHTML = '';
            data.forEach(item => {
                resultsContainer.innerHTML += `<p>${item[0]}: ${item[1]}</p>`;
            });
        })
        .catch(error => console.error('Error:', error));
}

async function ViewEquipmentWeights(event) {
    event.preventDefault();
    fetch('/municipal/neighbourhood/weight')
        .then(response => response.json())
        .then(data => {
            const resultsContainer = document.getElementById('results');
            resultsContainer.innerHTML = '';
            data.forEach(item => {
                resultsContainer.innerHTML += `<p>${item[0]}: ${item[1]}</p>`;
            });
        })
        .catch(error => console.error('Error:', error));
}

async function ViewNeighbourPolice(event) {
    event.preventDefault();
    fetch('/municipal/neighbourhood/police')
        .then(response => response.json())
        .then(data => {
            const resultsContainer = document.getElementById('results');
            resultsContainer.innerHTML = '';
            data.forEach(item => {
                resultsContainer.innerHTML += `<p>${item[0]}: ${item[1]}</p>`;
            });
        })
        .catch(error => console.error('Error:', error));
}

async function ViewOutStanding(event) {
    event.preventDefault();
    fetch('/municipal/neighbourhood/outstanding')
        .then(response => response.json())
        .then(data => {
            const resultsContainer = document.getElementById('results');
            resultsContainer.innerHTML = '';
            data.forEach(item => {
                resultsContainer.innerHTML += `<p>${item[0]}: ${item[1]}</p>`;
            });
        })
        .catch(error => console.error('Error:', error));
}


window.onload = () => {
    refreshTable(DEFAULT_PARAMS);
    document.getElementById("getEquipment").addEventListener("submit", getEquipment, true);
    document.getElementById("delete_prof").addEventListener("submit", deleteProfessionalID, true);
    document.getElementById("addProfessionalReporter").addEventListener("submit", addProfessionalReporter, true);
    document.getElementById("NeightbourHoodReports").addEventListener("click", ViewNeighbourHood, true);
    document.getElementById("EquipmentWeights").addEventListener("click", ViewEquipmentWeights, true);
    document.getElementById("FireStations").addEventListener("click", ViewNeighbourPolice, true);
    document.getElementById("NoFireStations").addEventListener("click", ViewOutStanding, true);

};