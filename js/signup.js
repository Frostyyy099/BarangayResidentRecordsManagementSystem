document.addEventListener("DOMContentLoaded", () => {

    const signupForm = document.getElementById("signupForm");
    const signupMessage = document.getElementById("signupMessage");

    signupForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const fullName =
            document.getElementById("fullName").value.trim();

        const username =
            document.getElementById("username").value.trim();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        signupMessage.textContent = "";
        signupMessage.className = "auth-message";

        // Check password confirmation
        if (password !== confirmPassword) {

            signupMessage.textContent =
                "Passwords do not match.";

            signupMessage.classList.add("error");

            return;
        }

        try {

            const response = await fetch(
                "http://localhost:3000/api/signup",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        full_name: fullName,
                        username: username,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                signupMessage.textContent =
                    data.message || "Unable to create account.";

                signupMessage.classList.add("error");

                return;
            }

            if (data.success) {

                signupMessage.textContent =
                    "Account created successfully! Redirecting to login...";

                signupMessage.classList.add("success");

                signupForm.reset();

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1000);
            }

        } catch (error) {

            console.error("Signup error:", error);

            signupMessage.textContent =
                "Unable to connect to the BRRMS server.";

            signupMessage.classList.add("error");
        }

    });

});