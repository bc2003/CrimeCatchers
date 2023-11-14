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
router.post('/civilian/incident', async (req, res) => {
    try {
        // Your logic to handle the request...
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Internal Server Error');
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

router.post('/civilian/incident', async (req, res) => {
    // Extract relevant data from request body
    const { Email, Description, Date, Status, Involved } = req.body;
    // Construct incident data based on the request
    const incidentData = {
        Email,
        Description,
        Date: Date || new Date().toISOString(),
        Status: Status || 'created',
        Involved
    };

    try {
        const responseData = await reportIncident(incidentData);
        if (responseData) {
            res.status(200).json(responseData);
        } else {
            res.status(500).json({ message: 'Failed to report the incident' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error reporting the incident', error: error.message });
    }
});

router.post('/incident-update', async (req, res) => {
    const { incidentID, newDescription, date } = req.body;
    try {
        const updateResult = await appService.updateIncident(incidentID, newDescription, date);
        if (updateResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating the incident', error: error.message });
    }
});

router.delete('/incident', async (req, res) => {
    const { incidentID } = req.query;
    try {
        const deleteResult = await appService.deleteIncident(incidentID);
        if (deleteResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting the incident', error: error.message });
    }
});

router.get('/reporter', async (req, res) => {
    const { email } = req.query;
    try {
        const reporterDetails = await appService.getReporterDetails(email);
        if (reporterDetails) {
            res.json(reporterDetails);
        } else {
            res.status(404).json({ message: 'Reporter not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving reporter details', error: error.message });
    }
});

router.put('/reporter', async (req, res) => {
    const { name, address, phoneNumber, email } = req.body;
    try {
        const updateResult = await appService.updateReporterDetails(name, address, phoneNumber, email);
        if (updateResult) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating reporter details', error: error.message });
    }
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


module.exports = router;