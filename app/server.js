// Backend

// TODO
// fix spanner perms
// sanatize inputs
// auth

const bodyParser = require("body-parser");
const express = require("express");
const googleapis = require("googleapis");
const request = require("request");
const {Spanner} = require('@google-cloud/spanner');
const uuidv4 = require("uuid/v4");

const app = express();
const port = 3000;

app.use(bodyParser.json());

const projectId = "lahacks2019";
const instanceId = "lahacks2019";
const databaseId = "data";
const spanner = new Spanner({projectId: projectId});
const instance = spanner.instance(instanceId);
const db = instance.database(databaseId);

db.runBasic = function(q, res) {
    this.run(q).then(results => {
        console.log(results)
        res.status(200).send(err);
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
}

function verifyToken(token, db) {
    // make sure client is authenticated
}

// Routes

// User stuff
app.get("/users", (req, res) => {
    console.log("/users GET");
    verifyToken("token");
    const q = {sql: `SELECT * FROM users`};
    db.run(q).then((results => {
        res.status(200).json(results[0]);
    })).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
});

app.post("/users", (req, res) => {
    console.log("/users POST");
    verifyToken("token");
    userId = uuidv4();
    email = req.body.email;
    const q = {sql: `INSERT INTO users (userId, email) VALUES ("${userId}", "${email}")`};
    console.log(q);
    db.runBasic(q, res);
});

app.delete("/users/:userId", (req, res) => {
    console.log("/users/userId DELETE");
    verifyToken("token");
    userId = req.params.userId;
    const q = {sql: `DELETE FROM users WHERE userId=="${userId}"`};
    db.runBasic(q, res);
});

// client side ?
app.post("/users/login", (req, res) => {
    userLogin = req.username

    const q = {sql: "SELECT email, password FROM users WHERE "};

    db.run(q).then(results => {
        rows = results[0];
        
    }).catch(err => {
        console.log(err);
    });
});

// Food recommendation
app.get("/users/:userId/recommendation", (req, res) => {
    console.log("/users/userId/recommend POST");
    verifyToken("token");
    user = req.params["userId"];
    
    // magic

    paylad = {
        "something": "special",
    };

    request("https://api.yumly.com/vi", payload, (err, res, body => {
        if (err) {
            return console.log(err);
        }
        // Do something
    }));
    res.send("recommend");
});

// Vendor stuff
app.post("/vendors", (req ,res) => {
    console.log("/vendors POST");
    verifyToken("token");
    vendorId = uuidv4();
    vendorName = req.body.vendorName;
    const q = {sql: `INSERT INTO vendors (vendorId, vendorName) VALUES ("${vendorId}", "${vendorName}")`};
    db.runBasic(q);
})

app.delete("/vendors/:vendorId", (req, res) => {
    console.log("/vendors DELETE");
    verifyToken("token");
    vendorId = req.params.vendorId;
    const q = {sql: `DELETE FROM vendors WHERE vendorId=="${vendorId}"`}
    db.runBasic(q);
})

app.post("/vendors/:vendorId/transactions", (req, res) => {
    verifyToken("token");
    vendorId = params.vendorId;
    userId = req.body.userId;
    time = "spanner.commit_timestamp()";

    res.send("Transaction");
});

app.listen(port, () => console.log(`listening on port ${port}`));