
function login() {
    console.log("login");
    payload = {
        email: document.getElementById("emailInput").value,
        password: document.getElementById("passwordInput").value
    }
    console.log(payload);

    $.post("/api/users/login", payload, (data, status) => {
        if (status == 200) {
            console.log(token);
            document.cookie = `token=${data}`;
            window.location.replace("http://www.grocersapp.net/dashboard.html");
        }
        else {
            document.getElementById("passwordInput").css({ "background-color": red});
        }
    });
}