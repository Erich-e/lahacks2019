// Backend

// TODO
// fix spanner perms
// sanatize inputs
// auth

const bodyParser = require("body-parser");
const express = require("express");
const mysql = require("mysql");
const request = require("request");
const uuidv4 = require("uuid/v4");

const app = express();
const port = 3000;

app.use(bodyParser.json());

const sqlParams = {
    "host": "35.233.234.172",
    "user": "root",
    "pass": "root",
    "database": "data"
};
const db = new mysql.createConnection(sqlParams);

db.queryBasic = function(q, res) {
    console.log("querying basic");
    this.query(q, (err, results, fields) => {
        console.log("running callback");
        if (err) {
            console.log(err);
            res.status(500).send(err);
        }
        else {
            res.status(200).json(results[0]);
        }
    });
};

db.connect((err) => {
    if (err) {
        throw err;
    }
});


function verifyToken(token, db) {
    // make sure client is authenticated
}

// Routes

// User stuff
app.get("/users", (req, res) => {
    console.log("/users GET");
    verifyToken("token");
    const q = `SELECT * FROM users`;
    db.queryBasic(q, res);
});

app.post("/users", (req, res) => {
    console.log("/users POST");
    verifyToken("token");
    userId = uuidv4();
    email = req.body.email;
    const q = `INSERT INTO users (userId, email) VALUES ("${userId}", "${email}")`;
    console.log(q);
    db.queryBasic(q, res);
});

app.delete("/users/:userId", (req, res) => {
    console.log("/users/userId DELETE");
    verifyToken("token");
    userId = req.params.userId;
    const q = {sql: `DELETE FROM users WHERE userId=="${userId}"`};
    db.queryBasic(q, res);
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
    db.queryBasic(q, res);
})

app.delete("/vendors/:vendorId", (req, res) => {
    console.log("/vendors DELETE");
    verifyToken("token");
    vendorId = req.params.vendorId;
    const q = {sql: `DELETE FROM vendors WHERE vendorId=="${vendorId}"`}
    db.queryBasic(q, res);
})

app.get("/vendors/:vendorId/transactions", (res, req) => {
    console.log("/vendors/vendorId/transactions GET");
    verifyToken("token");
    vendorId = req.params.vendorId;
    const q = `SELECT * FROM transactions WHERE vendorId=="${vendorId}"`;
    db.queryBasic(q, res);
});

app.post("/vendors/:vendorId/transactions", (req, res) => {
    console.log("/vendors/vendorId/transactions POST");
    verifyToken("token");
    transactionId = uuidv4();
    vendorId = params.vendorId;
    userId = req.body.userId;
    time = "spanner.commit_timestamp()";
    const q = `INSERT INTO transactions (transactionId, vendorId, userId, foodItems, time)
        VALUES ("${transactionId}", "${vendorId}", "${userId}", "${foodItems}", "${time}")`;
    db.queryBasic(q, res);
});

app.listen(port, () => console.log(`listening on port ${port}`));