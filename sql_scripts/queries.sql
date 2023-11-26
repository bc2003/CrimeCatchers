-- INSERT QUERY -> Insert a new tuple in Department, also triggers new tuple in Location (due to foreign key)
-- Query Implementation Reference: (file + directory + line)
INSERT INTO Department (
    branchID,
    specialty,
    locatedAtAddress
) VALUES (
    :branchID,
    :specialty,
    :locatedAtAddress
);

-- DELETE QUERY -> Delete a tuple from IncidentStatus (triggers ON DELETE CASCADE for IncidentInfo)
-- Query Implementation Reference: (file + directory + line)
DELETE FROM IncidentStatus I
WHERE I.description = :description;

-- UPDATE QUERY -> Update an Incident (IncidentInfo) with a new date
-- Query Implementation Reference: (file + directory + line)
UPDATE IncidentInfo
SET dateIncident = :date
WHERE incidentID = :incidentID;

-- SELECTION QUERY -> Select incidents whether they occur before, on, or after the user-inputted date
-- Query Implementation Reference: (file + directory + line)
SELECT II.incidentID, II.dateIncident
FROM IncidentInfo II
WHERE dateIncident < TO_DATE(:date, 'DD-MON-YYYY');

SELECT II.incidentID, II.dateIncident
FROM IncidentInfo II
WHERE dateIncident = TO_DATE(:date, 'DD-MON-YYYY');

SELECT II.incidentID, II.dateIncident
FROM IncidentInfo II
WHERE dateIncident > TO_DATE(:date, 'DD-MON-YYYY');

-- PROJECTION QUERY -> (action)
-- Query Implementation Reference: (file + directory + line)

-- JOIN QUERY -> Join on IncidentInfo and IncidentStatus so we can see the current status of incidents after a certain date
-- Query Implementation Reference: (file + directory + line)
SELECT *
FROM IncidentInfo info, IncidentStatus stat
WHERE info.dateIncident > TO_DATE(:date, 'DD-MON-YYYY') AND info.description = stat.description
-- NOTE: NEED TO ACTUALLY GET USER INPUTTED DATE TO FILTER OUT INCIDENTS THAT HAVE OCCURRED SINCE USER-INPUTTED DATE

-- AGGREGATION w/ GROUP BY QUERY -> Count the number of incidents in each neighbourhood
-- Query Implementation Reference: (file + directory + line)
SELECT L.neighbourhood, COUNT(*) AS Total
FROM OccurredAt OA, Location L
WHERE OA.address = L.address
GROUP BY L.neighbourhood

-- AGGREGATION w/ HAVING QUERY -> Return the total weight of equipment owned by each department with an inventory > 1
-- Query Implementation Reference: (file + directory + line)
SELECT item.belongsToBranchID, SUM(info.weight) AS EquipmentWeight
FROM EquipmentInfo info, EquipmentItem item
WHERE info.type = item.type
GROUP BY item.belongsToBranchID
HAVING COUNT(*) > 1

-- NESTED AGGREGATION w/ GROUP BY QUERY -> (action)
-- Query Implementation Reference: (file + directory + line)
SELECT
FROM
WHERE
GROUP BY
HAVING 

-- DIVISION QUERY -> (action)
-- Query Implementation Reference: (file + directory + line)
