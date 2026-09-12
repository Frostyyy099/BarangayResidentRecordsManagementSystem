document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const loginMessage = document.getElementById("loginMessage");

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const mfaInput = document.getElementById("mfaCode");

    const usernameError = document.getElementById("usernameError");
    const passwordError = document.getElementById("passwordError");
    const mfaError = document.getElementById("mfaError");


    // =========================
    // CLEAR VALIDATION
    // =========================

    function clearValidation() {

        usernameError.textContent = "";
        passwordError.textContent = "";
        mfaError.textContent = "";

        usernameInput.classList.remove("invalid", "valid");
        passwordInput.classList.remove("invalid", "valid");
        mfaInput.classList.remove("invalid", "valid");
    }


    // =========================
    // LOGIN VALIDATION
    // =========================

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        clearValidation();

        loginMessage.textContent = "";
        loginMessage.className = "auth-message";

        let isValid = true;


        // USERNAME / EMAIL
        const username = usernameInput.value.trim();

        if (username === "") {

            usernameError.textContent =
                "Username or email is required.";

            usernameInput.classList.add("invalid");

            isValid = false;

        } else if (username.length < 3) {

            usernameError.textContent =
                "Username or email must be at least 3 characters.";

            usernameInput.classList.add("invalid");

            isValid = false;

        } else {

            usernameInput.classList.add("valid");
        }


        // PASSWORD
        const password = passwordInput.value;

        if (password === "") {

            passwordError.textContent =
                "Password is required.";

            passwordInput.classList.add("invalid");

            isValid = false;

        } else if (password.length < 8) {

            passwordError.textContent =
                "Password must be at least 8 characters.";

            passwordInput.classList.add("invalid");

            isValid = false;

        } else {

            passwordInput.classList.add("valid");
        }


        // MFA
        const mfaCode = mfaInput.value.trim();

        if (mfaCode === "") {

            mfaError.textContent =
                "MFA code is required.";

            mfaInput.classList.add("invalid");

            isValid = false;

        } else if (!/^[0-9]{6}$/.test(mfaCode)) {

            mfaError.textContent =
                "MFA code must contain exactly 6 digits.";

            mfaInput.classList.add("invalid");

            isValid = false;

        } else {

            mfaInput.classList.add("valid");
        }


        // STOP IF VALIDATION FAILS
        if (!isValid) {
            return;
        }


        // =========================
        // SEND LOGIN TO SERVER
        // =========================

        try {

            const response = await fetch(
                "http://localhost:3000/api/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                }
            );


            const data = await response.json();


            // SERVER ERROR
            if (!response.ok) {

                loginMessage.textContent =
                    data.message || "Login failed.";

                loginMessage.classList.add("error");

                return;
            }


            // LOGIN SUCCESS
            if (data.success) {

                loginMessage.textContent =
                    "Login successful!";

                loginMessage.classList.add("success");


                // Save logged-in user
                localStorage.setItem(
                    "brrmsUser",
                    JSON.stringify(data.user)
                );


                // Go to your actual dashboard
                setTimeout(() => {

                    window.location.href = "index.html";

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