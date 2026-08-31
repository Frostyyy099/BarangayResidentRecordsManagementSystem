document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const loginMessage = document.getElementById("loginMessage");

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        loginMessage.textContent = "";
        loginMessage.className = "auth-message";

        try {

            const response = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                loginMessage.textContent = data.message || "Login failed.";
                loginMessage.classList.add("error");
                return;
            }

            if (data.success) {

                loginMessage.textContent = "Login successful!";
                loginMessage.classList.add("success");

                // Save logged-in user information
                localStorage.setItem(
                    "brrmsUser",
                    JSON.stringify(data.user)
                );

                // Go to dashboard
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 500);
            }

        } catch (error) {

            console.error("Login error:", error);

            loginMessage.textContent =
                "Unable to connect to the BRRMS server.";

            loginMessage.classList.add("error");
        }

    });

});