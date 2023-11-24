-- Create Table Statements
-- Note: Oracle does not allow ON UPDATE, hence the absence of it in our table initializations
CREATE TABLE IncidentStatus(
    description VARCHAR(200) PRIMARY KEY,
    statusValue VARCHAR(20)
    );

CREATE TABLE IncidentInfo(
    incidentID INT PRIMARY KEY,
    dateIncident DATE,
    description VARCHAR(200),
    FOREIGN KEY (description) REFERENCES IncidentStatus(description)
   	 ON DELETE SET NULL
    );

CREATE TABLE Location(
    address VARCHAR(100) PRIMARY KEY,
    neighbourhood VARCHAR(30)
    );
 
CREATE TABLE OccurredAt(
    incidentID INT,
    address VARCHAR(100),
    PRIMARY KEY(incidentID, address),
    FOREIGN KEY (incidentID) REFERENCES IncidentInfo(incidentID)
   	 ON DELETE CASCADE,
    FOREIGN KEY (address) REFERENCES Location(address)
   	 ON DELETE SET NULL
    );

CREATE TABLE Department(
    branchID INT PRIMARY KEY,
    speciality VARCHAR(20),
    locatedAtAddress VARCHAR(100) NOT NULL,
    FOREIGN KEY (locatedAtAddress) REFERENCES Location(address) 
    );

CREATE TABLE Responder(
    professionalID INT PRIMARY KEY,
    name VARCHAR(20),
    occupation VARCHAR(20),
    worksForBranchID INT NOT NULL,
    FOREIGN KEY (worksForBranchID) REFERENCES Department(branchID) 
    );

CREATE TABLE AssignedTo(
    incidentID INT,
    professionalID INT,
    PRIMARY KEY (incidentID, professionalID),
    FOREIGN KEY (incidentID) REFERENCES IncidentInfo(incidentID)
     ON DELETE CASCADE,
    FOREIGN KEY (professionalID) REFERENCES Responder(professionalID)
     ON DELETE CASCADE
    );
    
CREATE TABLE InvolvedPerson(
    name VARCHAR(20),
    personID INT PRIMARY KEY,
    presentAtAddress VARCHAR(100) NOT NULL,
    FOREIGN KEY (presentAtAddress) REFERENCES Location(address)
    );

CREATE TABLE Involves(
    incidentID INT,
    personID INT,
    PRIMARY KEY (incidentID, personID),
    FOREIGN KEY (incidentID) REFERENCES IncidentInfo(incidentID)
   	 ON DELETE CASCADE,
    FOREIGN KEY (personID) REFERENCES InvolvedPerson(personID)
   	 ON DELETE CASCADE
    );

CREATE TABLE Suspect(
    personID INT PRIMARY KEY,
    physicalBuild VARCHAR(20),
    numPriorOffenses INT,
    FOREIGN KEY (personID) REFERENCES InvolvedPerson(personID)
   	 ON DELETE CASCADE
    );

CREATE TABLE Victim(
    personID INT PRIMARY KEY,
    injuries VARCHAR(100),
    FOREIGN KEY (personID) REFERENCES InvolvedPerson(personID)
   	 ON DELETE CASCADE
    );

CREATE TABLE Bystander(
    personID INT PRIMARY KEY,
    phoneNumber CHAR(10),
    FOREIGN KEY (personID) REFERENCES InvolvedPerson(personID)
   	 ON DELETE CASCADE
    );

CREATE TABLE Reporter(
    name VARCHAR(50),
    address VARCHAR(100),
    phoneNumber CHAR(10),
    email VARCHAR(50) PRIMARY KEY
    );
    
CREATE TABLE ReportedBy(
	incidentID INT,
	email VARCHAR(50),
	dateReported DATE,
	PRIMARY KEY (incidentID, email),
	FOREIGN KEY (incidentID) REFERENCES IncidentInfo(incidentID)
     ON DELETE CASCADE,
	FOREIGN KEY (email) REFERENCES Reporter(email)
     ON DELETE CASCADE
);

CREATE TABLE EquipmentInfo(
    type VARCHAR(20) PRIMARY KEY,
    weight INT,
    color VARCHAR(10)
    );

CREATE TABLE EquipmentItem(
    equipmentID INT,
    belongsToBranchID INT,
    type VARCHAR(20),
    PRIMARY KEY (equipmentID, belongsToBranchID),
    FOREIGN KEY (belongsToBranchID) REFERENCES Department(branchID)
   	 ON DELETE CASCADE,
    FOREIGN KEY (type) REFERENCES EquipmentInfo(type)
   	 ON DELETE CASCADE
    );
    
CREATE TABLE VehicleSpecs(
    model VARCHAR(20) PRIMARY KEY,
    numSeats INT
    );

CREATE TABLE VehicleInfo(
    licensePlate CHAR(7) PRIMARY KEY,
    model VARCHAR(20),
    color VARCHAR(10),
    ownedByBranchID INT NOT NULL,
    FOREIGN KEY (model) REFERENCES VehicleSpecs(model)
   	 ON DELETE CASCADE,
    FOREIGN KEY (ownedByBranchID) REFERENCES Department(branchID)
    );

CREATE SEQUENCE incidentID START WITH 1;
CREATE SEQUENCE branchID START WITH 1;
CREATE SEQUENCE professionalID START WITH 1;
CREATE SEQUENCE personID START WITH 1;
CREATE SEQUENCE equipmentID START WITH 1;

-- Populate Table Statements

-- IncidentStatus Table
INSERT INTO IncidentStatus(description, statusValue) 
VALUES ('stabbing', 'in-progress');
INSERT INTO IncidentStatus(description, statusValue) 
VALUES ('murder', 'in-progress');
INSERT INTO IncidentStatus(description, statusValue) 
VALUES ('shooting', 'closed');
INSERT INTO IncidentStatus(description, statusValue) 
VALUES ('burglary', 'closed');
INSERT INTO IncidentStatus(description, statusValue) 
VALUES ('bomb threat', 'in-progress');
INSERT INTO IncidentStatus(description, statusValue) 
VALUES ('arson', 'in-progress');
INSERT INTO IncidentStatus(description, statusValue) 
VALUES ('vehicle theft', 'closed');

-- IncidentInfo Table
INSERT INTO IncidentInfo(incidentID, dateIncident, description)
VALUES (1, 20-OCT-2023, 'stabbing');
INSERT INTO IncidentInfo(incidentID, dateIncident, description) 
VALUES (2, 17-NOV-2011, 'arson');
INSERT INTO IncidentInfo(incidentID, dateIncident, description) 
VALUES (3, 29-FEB-2020, 'shooting');
INSERT INTO IncidentInfo(incidentID, dateIncident, description) 
VALUES (4, 09-MAY-2017, 'bomb threat');
INSERT INTO IncidentInfo(incidentID, dateIncident, description) 
VALUES (5, 05-JAN-2010, 'vehicle theft');
INSERT INTO IncidentInfo(incidentID, dateIncident, description) 
VALUES (6, 16-NOV-2010, 'burglary');
INSERT INTO IncidentInfo(incidentID, dateIncident, description) 
VALUES (7, 08-JUN-2023, 'murder');

-- Location Table
INSERT INTO Location(address, neighbourhood)
VALUES ('1755 E 55th Ave.', 'Victoria-Fraserview');
INSERT INTO Location(address, neighbourhood)
VALUES ('142 Water St.', 'Downtown');
INSERT INTO Location(address, neighbourhood)
VALUES ('100 W 49th Ave.', 'Marpole');
INSERT INTO Location(address, neighbourhood)
VALUES ('6426 Kerr St.', 'Killarney');
INSERT INTO Location(address, neighbourhood)
VALUES ('712 Lost Lagoon Path', 'Stanley Park');
INSERT INTO Location(address, neighbourhood)
VALUES ('1688 W 29th Ave.', 'Shaughnessy');
INSERT INTO Location(address, neighbourhood)
VALUES ('2996 W 5th Ave.', 'Kitsilano');
INSERT INTO Location(address, neighbourhood)
VALUES ('2120 Cambie St.', 'Mount Pleasant');
INSERT INTO Location(address, neighbourhood)
VALUES ('1081 Burrard St.', 'Downtown');
INSERT INTO Location(address, neighbourhood)
VALUES ('238 E Cordova St.', 'Downtown');
INSERT INTO Location(address, neighbourhood)
VALUES ('1475 W 10th Ave.', 'Fairview');
INSERT INTO Location(address, neighbourhood)
VALUES ('5425 Carnarvon St.', 'Kerrisdale');

-- OccurredAt Table
INSERT INTO OccurredAt(incidentID, address)
VALUES (1, '142 Water St.');
INSERT INTO OccurredAt(incidentID, address)
VALUES (2, '6426 Kerr St.');
INSERT INTO OccurredAt(incidentID, address)
VALUES (3, '100 W 49th Ave.');
INSERT INTO OccurredAt(incidentID, address)
VALUES (4, '1755 E 55th Ave.');
INSERT INTO OccurredAt(incidentID, address)
VALUES (5, '2996 W 5th Ave.');
INSERT INTO OccurredAt(incidentID, address)
VALUES (6, '1688 W 29th Ave.');
INSERT INTO OccurredAt(incidentID, address)
VALUES (7, '712 Lost Lagoon Path');

-- Department Table
INSERT INTO Department(branchID, specialty, address)
VALUES (1, 'police', '2120 Cambie St.');
INSERT INTO Department(branchID, specialty, address)
VALUES (2, 'hospital', '1081 Burrard St.');
INSERT INTO Department(branchID, specialty, address)
VALUES (3, 'police', '238 E Cordova St.');
INSERT INTO Department(branchID, specialty, address)
VALUES (4, 'fire', '1475 W 10th Ave.');
INSERT INTO Department(branchID, specialty, address)
VALUES (5, 'fire', '5425 Carnarvon St.');

-- Responder Table
INSERT INTO Responder(professionalID, name, occupation, worksForBranchID)
VALUES (21, 'Jim Jones', 'firefighter', 4);
INSERT INTO Responder(professionalID, name, occupation, worksForBranchID)
VALUES (23, 'Jared Fogle', 'firefighter', 5);
INSERT INTO Responder(professionalID, name, occupation, worksForBranchID)
VALUES (31, 'Jason Somerville', 'police officer', 3);
INSERT INTO Responder(professionalID, name, occupation, worksForBranchID)
VALUES (36, 'Charity Johnson', 'police officer', 3);
INSERT INTO Responder(professionalID, name, occupation, worksForBranchID)
VALUES (37, 'Chairiddee Jawnsen', 'police officer', 1);
INSERT INTO Responder(professionalID, name, occupation, worksForBranchID)
VALUES (40, 'Melina del Cortez', 'nurse', 3);
INSERT INTO Responder(professionalID, name, occupation, worksForBranchID)
VALUES (53, 'Tyler Chu', 'doctor', 3);

-- AssignedTo Table
INSERT INTO AssignedTo(incidentID, professionalID)
VALUES (1, 40);
INSERT INTO AssignedTo(incidentID, professionalID)
VALUES (1, 53);
INSERT INTO AssignedTo(incidentID, professionalID)
VALUES (2, 21);
INSERT INTO AssignedTo(incidentID, professionalID)
VALUES (3, 53);
INSERT INTO AssignedTo(incidentID, professionalID)
VALUES (4, 31);
INSERT INTO AssignedTo(incidentID, professionalID)
VALUES (5, 36);
INSERT INTO AssignedTo(incidentID, professionalID)
VALUES (6, 36);
INSERT INTO AssignedTo(incidentID, professionalID)
VALUES (7, 37);
INSERT INTO AssignedTo(incidentID, professionalID)
VALUES (2, 23);

-- InvolvedPerson Table
INSERT INTO InvolvedPerson(name, personID, address)
VALUES ('John Smith', 10, '1755 E 55th Ave.');
(INSERT INTO InvolvedPerson(name, personID, address)
VALUES 'Jon Smith', 12, '142 Water St.');
(INSERT INTO InvolvedPerson(name, personID, address)
VALUES 'Yohan Smith', 13, '142 Water St.');
INSERT INTO InvolvedPerson(name, personID, address)
VALUES ('Gianni Smith', 14, '100 W 49th Ave.');
INSERT INTO InvolvedPerson(name, personID, address)
VALUES ('Johnny Smith', 16, '6426 Kerr St.');
INSERT INTO InvolvedPerson(name, personID, address)
VALUES ('Joanna Smith', 18, '712 Lost Lagoon Path');
INSERT INTO InvolvedPerson(name, personID, address)
VALUES ('Joann Smith', 19, '1688 W 29th Ave.');
INSERT INTO InvolvedPerson(name, personID, address)
VALUES ('Joanne Smith Sr.', 21, '2996 W 5th Ave.');
INSERT INTO InvolvedPerson(name, personID, address)
VALUES ('Joanne Smith Jr.', 22, '2996 W 5th Ave.');

-- Involves Table
INSERT INTO Involves(incidentID, personID)
VALUES (1, 10);
INSERT INTO Involves(incidentID, personID)
VALUES (2, 12);
INSERT INTO Involves(incidentID, personID)
VALUES (2, 13);
INSERT INTO Involves(incidentID, personID)
VALUES (3, 14);
INSERT INTO Involves(incidentID, personID)
VALUES (4, 16);
INSERT INTO Involves(incidentID, personID)
VALUES (5, 18);
INSERT INTO Involves(incidentID, personID)
VALUES (6, 19);
INSERT INTO Involves(incidentID, personID)
VALUES (7, 21);
INSERT INTO Involves(incidentID, personID)
VALUES (7, 22);

-- Suspect Table
INSERT INTO Suspect(personID, physicalBuild, numPriorOffenses)
VALUES (12, 'stocky', 5);
INSERT INTO Suspect(personID, physicalBuild, numPriorOffenses)
VALUES (13, 'stocky', 8);
INSERT INTO Suspect(personID, physicalBuild, numPriorOffenses)
VALUES (22, 'thin', 0);

-- Victim Table
INSERT INTO Victim(personID, injuries)
VALUES (21, 'internal bleeding');

-- Bystander Table
INSERT INTO Bystander(personID, phoneNumber)
VALUES (10, '2363223280');
INSERT INTO Bystander(personID, phoneNumber)
VALUES (14, '7786043914');
INSERT INTO Bystander(personID, phoneNumber)
VALUES (16, '6043210987');
INSERT INTO Bystander(personID, phoneNumber)
VALUES (18, '6046046046'),
INSERT INTO Bystander(personID, phoneNumber)
VALUES (19, '7787787788');

-- Reporter Table
INSERT INTO Reporter(name, address, phoneNumber, email)
VALUES ('Captain Marvel', '123 Hero Lane, Super City', '555-1111-987', 'captain.marvel@gmail.com');
INSERT INTO Reporter(name, address, phoneNumber, email)
VALUES ('Iron Man', '456 Stark Tower, New York City', '555-2222-987', 'iron.man@gmail.com');
INSERT INTO Reporter(name, address, phoneNumber, email)
VALUES ('Wonder Woman', '789 Amazon Island, Paradise', '555-3333-987', 'wonder.woman@gmail.com');
INSERT INTO Reporter(name, address, phoneNumber, email)
VALUES ('Spider-Man', '101 Web Avenue, Marvel City', '555-4444-987', 'spider.man@gmail.com');
INSERT INTO Reporter(name, address, phoneNumber, email)
VALUES ('Black Widow', '202 Spy Street, Shadowland', '555-5555-987', 'black.widow@gmail.com');

-- ReportedBy Table
INSERT INTO ReportedBy(incidentID, email, dateReported)
VALUES (1, 'captain.marvel@gmail.com', 20-OCT-2023);
INSERT INTO ReportedBy(incidentID, email, dateReported)
VALUES (2, 'iron.man@gmail.com', 18-NOV-2011);
INSERT INTO ReportedBy(incidentID, email, dateReported)
VALUES (3, 'wonder.woman@gmail.com', 29-FEB-2020);
INSERT INTO ReportedBy(incidentID, email, dateReported)
VALUES (4, 'spider.man@gmail.com', 09-MAY-2017);
INSERT INTO ReportedBy(incidentID, email, dateReported)
VALUES (5, 'black.widow@gmail.com', 07-JAN-2010);

-- EquipmentInfo Table
INSERT INTO EquipmentInfo(type, weight, color)
VALUES ('fire-extinguisher', 10, 'red');
INSERT INTO EquipmentInfo(type, weight, color)
VALUES ('grenade', 2, 'black');
INSERT INTO EquipmentInfo(type, weight, color)
VALUES ('hose', 20, 'yellow');
INSERT INTO EquipmentInfo(type, weight, color)
VALUES ('laptop', 1, 'black');
INSERT INTO EquipmentInfo(type, weight, color)
VALUES ('gauze', 1, 'white');

-- EquipmentItem Table
INSERT INTO EquipmentItem(equipmentID, belongsToBranchID, type)
VALUES (1234, 4, 'fire-extinguisher');
INSERT INTO EquipmentItem(equipmentID, belongsToBranchID, type)
VALUES (1235, 3, 'grenade');
INSERT INTO EquipmentItem(equipmentID, belongsToBranchID, type)
VALUES (1236, 5, 'hose');
INSERT INTO EquipmentItem(equipmentID, belongsToBranchID, type)
VALUES (1237, 4, 'laptop');
INSERT INTO EquipmentItem(equipmentID, belongsToBranchID, type)
VALUES (1238, 2, 'gauze');

-- VehicleSpecs Table
INSERT INTO VehicleSpecs(model, numSeats)
VALUES ('Toyota Corolla', 5);
INSERT INTO VehicleSpecs(model, numSeats)
VALUES ('Toyota Camry Hybrid', 5);
INSERT INTO VehicleSpecs(model, numSeats)
VALUES ('ambulance', 7);
INSERT INTO VehicleSpecs(model, numSeats)
VALUES ('firetruck', 15);
INSERT INTO VehicleSpecs(model, numSeats)
VALUES ('Dodge Charger', 5);

-- VehicleInfo Table
INSERT INTO VehicleInfo(licensePlate, model, color, ownedByBranchID)
VALUES ('DONDA4', 'Toyota Corolla', 'black', 1);
INSERT INTO VehicleInfo(licensePlate, model, color, ownedByBranchID)
VALUES ('YANDH1', 'Toyota Camry Hybrid', 'grey', 3);
INSERT INTO VehicleInfo(licensePlate, model, color, ownedByBranchID)
VALUES ('DRI22Y', 'ambulance', 'white', 2);
INSERT INTO VehicleInfo(licensePlate, model, color, ownedByBranchID)
VALUES ('CHANC3', 'firetruck', 'red', 4);
INSERT INTO VehicleInfo(licensePlate, model, color, ownedByBranchID)
VALUES ('SHREK6', 'Dodge Charger', 'navy blue', 2);

-- Clear Database Statement (TODO - time permitting)