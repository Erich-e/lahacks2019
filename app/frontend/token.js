
function login() {
    payload = {
        email: document.getElementById("emailInput"),
        password: document.getElementById("passwordInput")
    }

    $.post("/users/login", payload, (data, status) => {
        if (status == 200) {
            console.log(token);
            document.cookie = `token=${data}`;
        }
        else {
            // Something bad
        }
    });
}