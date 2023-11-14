const express = require('express');
const appService = require('./appService');


const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/demotable', async (req, res) => {
    const tableContent = await appService.fetchDemotableFromDb();
    res.json({data: tableContent});
});

router.post("/initiate-demotable", async (req, res) => {
    const initiateResult = await appService.initiateDemotable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-demotable", async (req, res) => {
    const { id, name } = req.body;
    const insertResult = await appService.insertDemotable(id, name);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});


router.post("/update-name-demotable", async (req, res) => {
    const { oldName, newName } = req.body;
    const updateResult = await appService.updateNameDemotable(oldName, newName);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/count-demotable', async (req, res) => {
    const tableCount = await appService.countDemotable();
    if (tableCount >= 0) {
        res.json({ 
            success: true,  
            count: tableCount
        });
    } else {
        res.status(500).json({ 
            success: false, 
            count: tableCount
        });
    }
});


/* =========================================== */
/* Civilian pages                              */
/* =========================================== */

/**
 * Expected request:
 * {
 *      email: string, (this should be the email of the Reporter)
 *      description: string,
 *      date: string, (in ISO format)
 *      involved: Object[] of the following:
 *      {
 *          name: string,
 *          specialAttributes: {
 *              physicalBuild: string
 *              numPriorOffenses: number
 *              // OR
 *              injuries: string
 *              // OR
 *              phoneNumber: string
 *          }
 *      }
 * }
 * 
 * Successful response:
 * {
 *      incidentID: number (the generated incident ID)
 *      involvedIDs: number[] (generated IDs for each involved person)
 * }
 */
router.post("/civilian/incident", async (req, res) => {
    if (!req.body.email || !req.body.description || !req.body.date || !req.body.involved) {
        res.status(400).json({
            body: "Missing parameters"
        });
    }
    try {
        const result = await(appService.createIncident(req.body));
        res.status(200).json({
            incidentID: result
        });
    } catch (err) {
        let errmsg = `Could hot complete request due to: ${err.message}`;
        res.status(400).send(errmsg);
    }
});


/**
 * Expected request:
 * {
 *     incidentID: number
 * }
 *
 * Successful response:
 * {
 *     deletedInvolvedPersons: number[] (array of personIDs for everyone that was deleted)
 * }
 */
router.delete("/civilian/incident", async (req, res) => {
    // TODO
});


/**
 * Expected request:
 * {
 *     email: string
 * }
 *
 * Successful response:
 * {
 *     name: string,
 *     address: string,
 *     phoneNumber: string
 * }
 */
router.get("/civilian/reporter", async (req, res) => {
    // TODO
});

/**
 * Expected request:
 * {
 *     email: string,
 *     name: string,
 *     address: string,
 *     phoneNumber: string
 * }
 *
 * Successful response will have status 200
 */
router.put("/civilian/reporter", async (req, res) => {
    // TODO
    console.log(req.body.email);
    res.status(500).json({
        body: `not implemented, email was ${req.body.email}`
    });
});

/**
 * Expected request:
 * {
 *      incidentID: number,
 *      date: string (in the form of YYYY-MM-DD),
 *      newDescription: string,
 *      status: string (will only succeed for 'Cancelled' or 'Open')
 * }
 *
 * Successful response will be status 200
 */
router.put("/civilian/incident-update", async (req, res) => {
    if (!req.body.incidentID || !req.body.date || !req.body.newDescription || !req.body.status) {
        req.status(500).json({
            body: "Missing parameters"
        });
    }

    // stub
    res.status(200).json({
        
    });
});

/**
 * Expected request:
 * {
 *     name: string,
 *     location: string, (optional if updating)
 *     // ONE OF THE FOLLOWING:
 *     physicalBuild: string, numPriorOffenses: number
 *     OR
 *     injuries: string
 *     OR
 *     phoneNumber: string
 * }
 * 
 * Successful response:
 * {
 *     personID: number
 * }
 */
router.put("/civilian/involvedperson", async (req, res) => {

});




/* =========================================== */
/* Municipal pages                             */
/* =========================================== */

/**
 * Expected request:
 * {
 *     sort_by: "ascend" | "descend", OPTIONAL
 *     status: "Cancelled" | "Open" | "In progress", OPTIONAL
 *     display: string[] (could include "incidentID", "statusValue", "dateIncident", or "description") OPTIONAL
 * }
 *
 * Successful response: {
 *     incidents: array of objects that could look like (only the attributes from display
 *                in request are kept or all if display was not specified):
 *     {
 *         incidentID: number,
 *         statusValue: string,
 *         dateIncident: string (in the form YYYY-MM-DD),
 *         description: string
 *     }
 * }
 */
router.get("/municipal/incidents", async (req, res) => {
   // TODO
});


/**
 * Expected request:
 * {
 *     incidentID: number,
 *     sort_by: "ascend" | "descend" OPTIONAL,
 *     display: string[] (could include "equipmentID", "type", "weight", or "colour") OPTIONAL
 * }
 *
 * Successful response: {
 *     equipment: array of objects that could look like (only attributes from display are included):
 *     {
 *         equipmentID: numbner,
 *         type: string,
 *         weight: number,
 *         colour: string
 *     }
 * }
 */
router.get("/municipal/equipment", async (req, res) => {
   // TODO
});

/**
 * Expected request:
 * {
 *     professionalID: number
 * }
 *
 * Successful response will have status code 200
 */
router.delete("/municipal/responder", async (req, res) => {
   // TODO
});

/**
 * Expected request:
 * {
 *     professionalID: number,
 *     dept: number (the branch ID of the department this responder works at) (optional if updating)
 *     THE FOLLOWING ARE OPTIONAL BUT AT LEAST ONE SHOULD BE SELECTED
 *     name: string,
 *     occupation: string
 * }
 *
 * Successful response will have status code 200
 */
router.put("/municipal/responder", async (req, res) => {
   // TODO
});

router.get('/municipal/incident', async (req, res) => {
    const { sort_by, status, display } = req.query;
    try {
        const incidents = await appService.getIncidents(sort_by, status, display ? display.split(',') : []);
        res.json(incidents);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving incidents', error: error.message });
    }
});

router.get('/municipal/equipment', async (req, res) => {
    const { incidentID, sort_by, display } = req.query;
    try {
        const equipmentDetails = await appService.getEquipmentDetails(incidentID, sort_by, display ? display.split(',') : []);
        res.json(equipmentDetails);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving equipment details', error: error.message });
    }
});

module.exports = router;