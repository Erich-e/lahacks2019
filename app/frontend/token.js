
function login() {
    console.log("login");
    var payload = {
        email: document.getElementById("emailInput").value,
        password: document.getElementById("passwordInput").value
    };
    console.log(payload);

    $.post("/api/users/login", payload, (data, status) => {
        console.log("returned from the server");
        if (status == 200) {
            console.log(token);
            document.cookie = `token=${data}`;
            window.location.replace("http://www.grocersapp.net/dashboard.html");
        }
        else {
            ;
        }
    });
}