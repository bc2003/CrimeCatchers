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

window.onload = () => {
    refreshTable(DEFAULT_PARAMS);
};