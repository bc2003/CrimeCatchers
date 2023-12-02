-- INSERT QUERY -> Insert a new tuple in IncidentInfo, also triggers new tuple in IncidentStatus (due to foreign key)
-- Query Implementation Reference: appService.js in createIncident(), starting at line XXX
INSERT INTO IncidentInfo VALUES (
    :incidentID,
    TO_DATE(:dateIncident, 'yyyy-MM-dd'),
    :description
);

-- DELETE QUERY -> Delete a tuple from IncidentStatus (triggers ON DELETE SET NULL for IncidentInfo)
-- Query Implementation Reference: appService.js in updateIncident(), starting at line XXX
DELETE FROM IncidentStatus I
WHERE I.description = :description;

-- UPDATE QUERY -> Update an Incident (IncidentInfo relation) with a new date
-- Query Implementation Reference: appService.js in updateIncident(), starting at line
UPDATE IncidentInfo
SET dateIncident = TO_DATE(:ndate, 'yyyy-MM-dd'),
    description = :newDescription
WHERE incidentID = :incidentID;

-- SELECTION QUERY -> Select incidents based on who the user inputted as the email
-- Query Implementation Reference: appService.js in getIncidents(), starting at line
SELECT II.incidentID, II.dateIncident
FROM IncidentInfo II
WHERE dateIncident < TO_DATE(:date, 'DD-MON-YYYY');

SELECT II.incidentID, II.dateIncident
FROM IncidentInfo II
WHERE dateIncident = TO_DATE(:date, 'DD-MON-YYYY');

SELECT II.incidentID, II.dateIncident
FROM IncidentInfo II
WHERE dateIncident > TO_DATE(:date, 'DD-MON-YYYY');

-- PROJECTION QUERY -> allows user to choose a few columns to display
-- Query Implementation Reference: appService.js in getIncidents(), starting at line
SELECT :col1, :col2, :col3
FROM :tableName;

-- JOIN QUERY -> Join on IncidentInfo and IncidentStatus so we can see the current status of incidents after a certain date
-- Query Implementation Reference: appService.js in getIncidents(), starting at line
SELECT *
FROM IncidentInfo info, IncidentStatus stat
WHERE info.dateIncident > TO_DATE(:date, 'DD-MON-YYYY') AND info.description = stat.description;

-- AGGREGATION w/ GROUP BY QUERY -> Count the number of incidents in each neighbourhood
-- Query Implementation Reference: appService.js in (), starting at line
SELECT L.neighbourhood, COUNT(*) AS TotalIncidents
FROM OccurredAt OA, Location L
WHERE OA.address = L.address
GROUP BY L.neighbourhood;

-- AGGREGATION w/ HAVING QUERY -> Return the total weight of equipment owned by each department with an inventory > 1
-- Query Implementation Reference: appService.js in (), starting at line
SELECT item.belongsToBranchID, SUM(info.weight) AS EquipmentWeight
FROM EquipmentInfo info, EquipmentItem item
WHERE info.type = item.type
GROUP BY item.belongsToBranchID
HAVING COUNT(*) > 1;

-- NESTED AGGREGATION w/ GROUP BY QUERY -> Return the neighbourhoods with more police stations than fire stations
-- Query Implementation Reference: appService.js in (), starting at line
SELECT L1.neighbourhood
FROM Department D1, Location L1
WHERE D1.locatedAtAddress = L1.address and D1.specialty = 'police'
GROUP BY L1.neighbourhood
HAVING COUNT(*) > (
    SELECT COUNT(*)
    FROM Department D2, Location L2
    WHERE D2.locatedAtAddress = L2.address and D2.specialty = 'fire' and L1.neighbourhood = L2.neighbourhood
);

-- DIVISION QUERY -> Return all the neighbourhoods which had an incident, but does not have any first responder departments
-- Query Implementation Reference: appService.js in (), starting at line
SELECT L.neighbourhood
FROM OccurredAt OA, Location L
WHERE OA.address = L.address
GROUP BY L.neighbourhood
MINUS
SELECT L.neighbourhood
FROM Department D, Location L
WHERE D.locatedAtAddress = L.address
GROUP BY L.neighbourhood;