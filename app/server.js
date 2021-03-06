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

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, 'frontend')));
app.set('view engine', 'ejs');

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
        return res.status(200).json(results);
    });
};

db.connect((err) => {
    if (err) {
       throw err;
    }
});


// Middleware

function getToken(req) {
    console.log("getting token");
    var token;
    var rc = req.headers.cookie;
    console.log(rc);
    rc && rc.split(";").forEach( (cookie) => {
        var parts = cookie.split("=");
        console.log(parts);
        if (parts[0].trim() == "token") {
            token = parts[1].trim();
        }
    });
    console.log("token");
    console.log(token);
    if (token == undefined) {
        token = req.headers["x-access-token"] || req.headers["Authorization"];
    }
    return token;
}

function verifyToken(req, res, next) {
    var token = getToken(req);
    if (token) {
        jwt.verify(token, mySecret, (err, decoded) => {
            if (err) {
                console.log(err);
                console.log("redirecting");
                return res.redirect(302, "http://localhost:3000/index.html");
            }
            else {
                req.decoded = decoded;
                next();
            }
        });
    }
    else {
        console.log("redirecting..")
        return res.redirect(302, "http://localhost:3000/index.html");
    }
}

// Routes
app.get("/", (req,res) => {
  res.sendFile(path.join(__dirname + "/frontend/index.html"));
})

app.get("/sign-up", (req,res) => {
  res.sendFile(path.join(__dirname + "/frontend/sign-up.html"));
})

app.get("/dashboard", verifyToken, (req,res) => {
  res.render(path.join(__dirname + "/frontend/dashboard.ejs"));

})

app.get("/recipes", verifyToken, (req,res) => {
  res.render(path.join(__dirname + "/frontend/recipes.ejs"));

})

app.get("/grocery-list", verifyToken, (req,res) => {
  res.render(path.join(__dirname + "/frontend/grocery-list.ejs"));
})

//
// app.get("/recipes", (req,res) => {
//  res.render(path.join(__dirname + "/frontend/recipes.ejs"));
//})

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
        let token = jwt.sign({email: email, userId: userId}, mySecret, {expiresIn: "24h"});
        return res.status(200).send(token);
    });
});

router.delete("/users/:userId", verifyToken, (req, res) => {
    console.log("/users/userId DELETE");
    userId = req.decoded.userId;
    const q = `DELETE FROM users WHERE userId="${userId}"`;
    db.queryBasic(q, res);
});

router.get("/users/transactions", verifyToken, (req, res) => {
    console.log("/users/userId/transactions GET");
    userId = req.params.userId;
    const q = `SELECT transactions.transactionId, transactions.foodItems, vendor.vendorName FROM transactions
    INNER JOIN vendors ON vendors.vendorID=transactions.vendorId
    WHERE transactions.userId="${userId}"`;
    db.queryBasic(q, res);
});

router.post("/users/login", (req, res) => {
    console.log("/users/login POST");
    console.log(req.headers);
    var email = req.body.email;

    const q = `SELECT * FROM users WHERE email="${email}"`;
    db.query(q, (err, results, feilds) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        else {
            userRow = results[0];
            console.log(userRow);
            if (userRow == undefined) {
                return res.status(404).end();
            }
            formPassword = crypto.pbkdf2Sync(req.body.password, userRow["salt"], 1000, 256, "sha256").toString("hex");
            if (formPassword == userRow["password"]) {
                console.log(`${email} logged in successfully`);
                // Create a new jwt key
                let token = jwt.sign({email: email, userId: userRow["userId"]}, mySecret, {expiresIn: "24h"});
                // return res.redirect(301, "http://localhost:3000/dashboard");
                console.log("sending key");
                return res.status(200).send(token);
            }
            else {
                return res.status(401).end();
            }
        }
    });
});

// Food recommendation
//v changed from "router" to "app" to render page directly w/ template engine
app.get("/users/:userId/recommendation", verifyToken, (req, res) => {
  app.use('/', express.static(path.join(__dirname, 'frontend')));
    console.log("/users/userId/recommend POST");
    user = req.params["userId"];

    payload = {
        "ingredients": ["pineapple", "avocado", "strawberry"]
    };

    var ingredients = payload[Object.keys(payload)[0]];

    var yummlyApiReq = "http://api.yummly.com/v1/api/recipes?_app_id=90b7b4e2&_app_key=abe8fbf732dd7d47a7c26321652d126c&requirePictures=true"

    ingredients.forEach(function(element){
      yummlyApiReq = yummlyApiReq + "&allowedIngredient[]=" + element
    })

    request(yummlyApiReq, function (error, response, body) {
      if (error) {
          return console.log(err);
          res.render(path.join(__dirname + "/frontend/recipes.ejs"), err);
      }

      var imagesToPush = []
      var titlesToPush = []

      var recommendations = JSON.parse(body)[Object.keys(JSON.parse(body))[1]]

console.log()

       for(var i = 0; i < recommendations.length;i++){
        imagesToPush.push(recommendations[i].smallImageUrls[0])
       }

       for(var i = 0; i < recommendations.length;i++){
        titlesToPush.push(recommendations[i].recipeName)
       }

       var theArray = []
       theArray.push(imagesToPush, titlesToPush)

       console.log(titlesToPush)
       console.log(imagesToPush)

      res.render(path.join(__dirname + "/frontend/recipes.ejs"));

    });


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
