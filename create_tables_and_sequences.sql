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
