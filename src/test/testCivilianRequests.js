const chai = require("chai");
const chaiHttp = require("chai-http");
const child_process = require("child_process");
const {testOracleConnection, recreateAllTables} = require("../appService");

const SERVER = "localhost:65535";

chai.use(chaiHttp);

const onWindows = process.platform === "win32";

describe("CivilianRequests", function() {
    let server;
    // NOTE: remember to start the db-tunnel as well!
    before(async () => {
        if (!testOracleConnection()) {
            throw new Error("Could not connect to Oracle, check that db-tunnel is started");
        }
        let start_server;
        if (onWindows) {
            start_server = "local-start.cmd";
        } else {
            start_server = "local-start.sh";
        }
        server = child_process.exec(`./${start_server}`, (err, stdout, stderr) => {
                console.log(stdout);
                console.log(stderr);
                if (err) {
                    console.log(`error! ${stderr}`);
                    throw new Error(stderr);
                }
            });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await recreateAllTables();
    });

    after(() => {
        server.kill();
    })

   it("should be able to create a new reporter", () => {
      return chai.request(SERVER)
          .put("/civilian/reporter")
          .send({
             email: "munce@student.ubc.ca",
             name: "William",
             address: "2366 Main Mall",
             phoneNumber: "6048222873"
          }).then((res) => {
              console.log(res.text);
              chai.expect(res.status).to.equal(200);
      });
   });

    it("should handle basic input errors for incident with an error code", async () => {
        await chai.request(SERVER)
            .post("/civilian/incident")
            .send({
                email: "munce",
                description: "Bike theft",
                date: new Date("10 October 2023").toISOString(),
                involved: []
            }).then((res) => {
                chai.expect(res.status).to.equal(400);
                chai.expect(res.text).to.contain("email");
            });

        await chai.request(SERVER)
            .post("/civilian/incident")
            .send({
                email: "munce@student.ubc.ca",
                description: "Bike theft",
                date: "fadjkslfjas",
                involved: []
            }).then((res) => {
                chai.expect(res.status).to.equal(400);
                chai.expect(res.text).to.contain("date");
            });
    });

   it("should be able to send a basic request for making an incident", function() {
        let dateIncident = "2023-10-10";
        return chai.request(SERVER)
           .post("/civilian/incident")
           .send({
               email: "munce@student.ubc.ca",
               description: "Bike theft",
               date: dateIncident,
               involved: []
           }).then((res) => {
               console.log(res.text);
               chai.expect(res.status).to.equal(200);
               chai.expect(res.body).to.have.property("incidentID");
               chai.expect(res.body.incidentID).to.be.greaterThan(0);
           });
   });
});