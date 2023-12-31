const DEFAULT_PARAMS = {
    display: ["incidentID", "statusValue", "dateIncident", "description"]
};

/**
 * Refresh the table
 * @param params as specified to the /municipal/incidents GET uri params
 *
 * @param headers array that includes at least one of ["incidentID", "description", "dateIncident","statusValue"]
 *
 * Attribution: see the starter code for CPSC 304 NodeJS
 */
function refreshTable(params, headers) {
    const table = document.getElementById("allIncidents");
    const body = table.querySelector("tbody");

    fetch("/municipal/incidents?" + new URLSearchParams(params), {
        method: 'GET'
    }).then(async (response) => {
        if (!response.ok) {
            throw new Error(await response.text());
        }
        const responseData = await response.json();
        console.log(`result was ${JSON.stringify(responseData)}`);
        const header = table.querySelector("thead");
        header.deleteRow(0);
        let row = header.insertRow(0);
        for (let i = 0; i < headers.length; i++) {
            let cell = row.insertCell(i);
            cell.innerHTML = `<b>${headers[i]}</b>`;
        }

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
    })
        .catch((error) => {
            const incidentHTML = document.getElementById("getIncidents");
            incidentHTML.textContent = `Error loading the incidents: ${error}`;
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
    getAllTablesFromDB();

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
    getAllTablesFromDB();

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
    getAllTablesFromDB();

}


async function ViewNeighbourHood(event) {
    event.preventDefault();
    fetch('/municipal/neighbourhood/incidents')
        .then(response => response.json())
        .then(data => {
            const resultsContainer = document.getElementById('neighbourhoodResults');
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
            const resultsContainer = document.getElementById('weightResults');
            resultsContainer.innerHTML = '';
            data.forEach(item => {
                resultsContainer.innerHTML += `<p>Department ID ${item[0]} has weight ${item[1]}</p>`;
            });
        })
        .catch(error => console.error('Error:', error));
}

async function ViewNeighbourPolice(event) {
    event.preventDefault();
    fetch('/municipal/neighbourhood/police')
        .then(response => response.json())
        .then(data => {
            const resultsContainer = document.getElementById('fireStationResults');
            resultsContainer.innerHTML = '';
            data.forEach(item => {
                resultsContainer.innerHTML += `<p>${item[0]}</p>`;
            });
        })
        .catch(error => console.error('Error:', error));
}

async function ViewOutStanding(event) {
    event.preventDefault();
    fetch('/municipal/neighbourhood/outstanding')
        .then(response => response.json())
        .then(data => {
            const resultsContainer = document.getElementById('incidentsNoDepartmentResults');
            resultsContainer.innerHTML = '';
            data.forEach(item => {
                resultsContainer.innerHTML += `<p>${item[0]}</p>`;
            });
        })
        .catch(error => console.error('Error:', error));
}

function getAndSendTableUpdate() {
    let sending = {};

    const filterParams = ["beforeDate", "onDate", "afterDate", "none", "sortID", "sortDate", "sortStatus",
        "ascend", "descend", "noOrder"];
    const columns = ["includeId", "includeDescription", "includeDate", "includeStatus"];

    sending["display"] = [];
    let columnNames = [];

    if (document.getElementById(columns[0]).checked) {
        sending["display"].push("incidentID");
        columnNames.push("ID");
    }
    if (document.getElementById(columns[3]).checked) {
        sending["display"].push("statusValue");
        columnNames.push("Status");
    }
    if (document.getElementById(columns[2]).checked) {
        sending["display"].push("dateIncident");
        columnNames.push("Date");
    }
    if (document.getElementById(columns[1]).checked) {
        sending["display"].push("description");
        columnNames.push("Description");
    }

    const date = document.getElementById("filterDate")
    if (date && date.value !== "") {
        const selection = document.getElementById("dateComparison");
        if (selection.value === "filterLess") {
            sending["dateLesser"] = date.value;
        } else if (selection.value === "filterEqual") {
            sending["dateEqual"] = date.value;
        } else {
            sending["dateGreater"] = date.value;
        }
    }

    const sorting = document.getElementById("category");
    const isNoOrderChecked = document.getElementById("noOrder").checked;
    if (!isNoOrderChecked && sorting.value !== "none") {
        sending["sort_col"] = sorting.value;
        if (document.getElementById("ascend").checked) {
            sending["sort_by"] = "asc";
        } else {
            sending["sort_by"] = "desc";
        }
    }

    sending["or"] = document.getElementById("or").checked;

    const searchEmail = document.getElementById("searchEmail").value;
    if (searchEmail !== "") {
        sending["email"] = searchEmail;
    }
    const searchStatus = document.getElementById("searchStatus").value;
    if (searchStatus !== "") {
        sending["stazus"] = searchStatus;
    }


    refreshTable(sending, columnNames);
    getAllTablesFromDB();

}

async function onUpdateFilter(event) {
    event.preventDefault();
    getAndSendTableUpdate();
    getAllTablesFromDB();

}

function getAllTablesFromDB() {
    const allTables = document.getElementById("fillInTables");

    return fetch("/municipal/tables")
        .then(async (response) => {
            let json = await response.json();
            json.forEach((table) => {
                console.log(`table is ${JSON.stringify(table)}`);
                const h2 = document.createElement("h2");
                h2.textContent = table["name"];
                allTables.appendChild(h2);
                const tbl = document.createElement("table");
                allTables.appendChild(tbl);
                const thead = document.createElement("thead");
                tbl.appendChild(thead);
                const tr = document.createElement("tr");
                thead.appendChild(tr);
                // const headerTitles = header.createElement("tr");
                for (const result of Object.keys(table["rows"][0])) {
                    const td = document.createElement("td");
                    const b = document.createElement("b");
                    b.textContent = result;
                    td.appendChild(b);
                    tr.appendChild(td);
                }
                const tbody = document.createElement("tbody");
                tbl.appendChild(tbody);
                const rows = table["rows"];
                for (let i = 0; i < rows.length; i++) {
                    const values = Object.values(rows[i]);
                    const newTr = document.createElement("tr");
                    for (const value of values) {
                        const newTd = document.createElement("td");
                        newTd.textContent = value;
                        newTr.append(newTd);
                    }
                    tbody.appendChild(newTr);
                }
            });
        });
}


window.onload = () => {
    // refreshTable(DEFAULT_PARAMS, ["ID", "Status", "Date", "Description"]);
    getAndSendTableUpdate();
    getAllTablesFromDB();
    document.getElementById("getEquipment").addEventListener("submit", getEquipment, true);
    document.getElementById("delete_prof").addEventListener("submit", deleteProfessionalID, true);
    document.getElementById("addProfessionalReporter").addEventListener("submit", addProfessionalReporter, true);
    document.getElementById("NeighbourHoodReports").addEventListener("click", ViewNeighbourHood, true);
    document.getElementById("EquipmentWeights").addEventListener("click", ViewEquipmentWeights, true);
    document.getElementById("FireStations").addEventListener("click", ViewNeighbourPolice, true);
    document.getElementById("NoFireStations").addEventListener("click", ViewOutStanding, true);
    const filterId = document.getElementById("filterParams");
    filterId.addEventListener("change", onUpdateFilter, true);
};