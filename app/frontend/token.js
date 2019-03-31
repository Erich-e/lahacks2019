
function login() {
    console.log("login");
    var payload = {
        email: document.getElementById("emailInput").value,
        password: document.getElementById("passwordInput").value
    };
    console.log(payload);

    $.post("/api/users/login", payload, (data, status) => {
        console.log("returned from the server");
        console.log(data);
        console.log(status);
        if (status == "success") {
            console.log(data);
            document.cookie = `token=${data}`;
            window.location.replace("http://localhost:3000/dashboard");
        }
        else {
            document.getElementById("emailInput").value = "";
            document.getElementById("passwordInput").value = "";
            console.log(status);
            alert(data);
        }
    });
};

function signup() {
    console.log("signup");
    var payload = {
        email: document.getElementById("emailInput").value,
        password: document.getElementById("passwordInput").value
    };
    console.log(payload);

    $( document ).ajaxError(function() {
        alert("Something went wrong");
    });

    $.post("/api/users", payload, (data, status) => {
        console.log("returned from the server");
        if (status == "success") {
            document.cookie = `token=${data}`;
            window.location.replace("http://localhost:3000/dashboard");
        }
    }).complete( () => {
        document.getElementById("emailInput").value = "";
        document.getElementById("passwordInput").value = "";
    });
}

function logout() {
    console.log("logout");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    window.location.replace("http://localhost:3000/index.html");
};

function currentUserTransactions(transactions) {
    $.get("/api/users/transactions", (data, status) => {
        console.log("returned from the server");
        if (status == "success") {
            transactions.data = data;
        }
    })
};