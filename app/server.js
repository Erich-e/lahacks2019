// Backend

// TODO
// sanatize inputs
// auth

const bodyParser = require("body-parser");
const crypto = require("crypto");
const express = require("express");
const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const request = require("request");
const uuidv4 = require("uuid/v4");
var path = require('path');

const app = express();
const port = 3000;
var router = express.Router();

// TODO get this from kms
const mySecret = crypto.randomBytes(8)

app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, 'frontend')));

const sqlParams = {
    "host": "35.235.122.3",
    "user": "root",
    "password": "root", // danger
    "database": "data"
};
const db = new mysql.createConnection(sqlParams);

db.queryBasic = function(q, res) {
    this.query(q, (err, results, fields) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        return res.status(200).json(results[0]);
    });
};

db.connect((err) => {
    if (err) {
       throw err;
    }
});


// Middleware
function verifyToken(req, res, next) {
    let token = req.headers["x-access-token"] || req.headers["Authorizatin"];
    if (token) {
        jwt.verify(token, mySecret, (err, decoded) => {
            if (err) {
                console.log(err);
                return res.status(401).send(err);
            }
            else {
                req.decoded = decoded;
                next();
            }
        });
    }
    else {
        return res.status(401).send("No auth token provided");
    }
}

// Routes
app.get("/", (req,res) => {
  res.sendFile(path.join(__dirname + "/frontend/index.html"));
})

app.get("/sign-up", (req,res) => {
  res.sendFile(path.join(__dirname + "/frontend/sign-up.html"));
})

app.get("/recipes", (req,res) => {
  res.sendFile(path.join(__dirname + "/frontend/recipes.html"));
})

app.get("/grocery-list", (req,res) => {
  res.sendFile(path.join(__dirname + "/frontend/grocery-list.html"));
})

// User stuff
router.get("/users", verifyToken, (req, res) => {
    console.log("/users GET");
    const q = `SELECT * FROM users`;
    db.queryBasic(q, res);
});

router.post("/users", (req, res) => {
    console.log("/users POST");
    userId = uuidv4();
    email = req.body.email;
    salt = crypto.randomBytes(16).toString("hex");
    password = crypto.pbkdf2Sync(req.body.password, salt, 1000, 256, "sha256").toString("hex");

    const q = `INSERT INTO users (userId, email, salt, password)
    SELECT "${userId}", "${email}", "${salt}", "${password}"
    WHERE NOT("${email}" IN (SELECT email FROM users))`;
    db.query(q, (err, results, fields) => {
        if (err) {
            return res.status(500).send(err);
        }
        let token = jwt.sign({email: email}, mySecret, {expiresIn: "24h"});
        return res.status(200).send(token);
    });
});

router.delete("/users/:userId", verifyToken, (req, res) => {
    console.log("/users/userId DELETE");
    userId = req.params.userId;
    const q = `DELETE FROM users WHERE userId="${userId}"`;
    db.queryBasic(q, res);
});

router.post("/users/login", (req, res) => {
    console.log("/users/login POST");
    email = req.body.email;

    const q = `SELECT email, salt, password FROM users WHERE email=${email}`;
    db.query(q, (err, results, feilds) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        else {
            userRow = results[0][0];
            formPassword = crypto.pbkdf2Sync(req.body.password, userRow["salt"], 1000, 256, "sha256").toString("hex");
            if (formPassword == userRow["password"]) {
                console.log(`${email} logged in successfully`);
                // Create a new jwt key
                let token = jwt.sign({email: email}, mySecret, {expiresIn: "24h"});
                return res.status(200).send(token);
            }
            else {
                return res.status(401).end();
            }
        }
    });
});

// Food recommendation
router.get("/users/:userId/recommendation", verifyToken, (req, res) => {
    console.log("/users/userId/recommend POST");
    user = req.params["userId"];

    // magic

    payload = {
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
router.post("/vendors", verifyToken, (req ,res) => {
    console.log("/vendors POST");
    if (!verifyToken(req)) {
        return res.status(401).end();
    }
    vendorId = uuidv4();
    vendorName = req.body.vendorName;
    const q = `INSERT INTO vendors (vendorId, vendorName)
    SELECT "${vendorId}", "${vendorName}"
    WHERE NOT("${vendorName}" IN (SELECT vendorName FROM vendors))`;
    db.queryBasic(q, res);
})

router.delete("/vendors/:vendorId", verifyToken, (req, res) => {
    console.log("/vendors DELETE");
    if (!verifyToken(req)) {
        return res.status(401).end();
    }
    vendorId = req.params.vendorId;
    const q = `DELETE FROM vendors WHERE vendorId="${vendorId}"`;
    db.queryBasic(q, res);
})

router.get("/vendors/:vendorId/transactions", verifyToken, (req, res) => {
    console.log("/vendors/vendorId/transactions GET");
    if (!verifyToken(req)) {
        return res.status(401).end();
    }
    vendorId = req.params.vendorId;
    const q = `SELECT * FROM transactions WHERE vendorId="${vendorId}"`;
    db.queryBasic(q, res);
});

router.post("/vendors/:vendorId/transactions", verifyToken, (req, res) => {
    console.log("/vendors/vendorId/transactions POST");
    if (!verifyToken(req)) {
        return res.status(401).end();
    }
    transactionId = uuidv4();
    vendorId = params.vendorId;
    userId = req.body.userId;
    time = "spanner.commit_timestamp()";
    const q = `INSERT INTO transactions (transactionId, vendorId, userId, foodItems, time)
        VALUES ("${transactionId}", "${vendorId}", "${userId}", "${foodItems}", "${time}")`;
    db.queryBasic(q, res);
});

app.use("/api", router);

app.get("/healthz", (req, res) => {
    res.send("yee haw");
})

app.listen(port, () => console.log(`listening on port ${port}`));
