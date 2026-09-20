document.addEventListener("DOMContentLoaded", () => {

    const loginForm =
        document.getElementById("loginForm");

    const loginMessage =
        document.getElementById("loginMessage");


    const usernameInput =
        document.getElementById("username");

    const passwordInput =
        document.getElementById("password");

    const emailVerificationCodeInput =
        document.getElementById("emailVerificationCode");

    const mfaInput =
        document.getElementById("mfaCode");

    const sendCodeBtn =
        document.getElementById("sendCodeBtn");


    const usernameError =
        document.getElementById("usernameError");

    const passwordError =
        document.getElementById("passwordError");

    const emailVerificationCodeError =
        document.getElementById("emailVerificationCodeError");

    const mfaError =
        document.getElementById("mfaError");


    // =========================
    // CLEAR VALIDATION
    // =========================

    function clearValidation() {

        usernameError.textContent = "";
        passwordError.textContent = "";
        emailVerificationCodeError.textContent = "";
        mfaError.textContent = "";

        usernameInput.classList.remove(
            "invalid",
            "valid"
        );

        passwordInput.classList.remove(
            "invalid",
            "valid"
        );

        emailVerificationCodeInput.classList.remove(
            "invalid",
            "valid"
        );

        mfaInput.classList.remove(
            "invalid",
            "valid"
        );

    }


    // =========================
    // SEND VERIFICATION CODE
    // =========================

    sendCodeBtn.addEventListener(
        "click",
        async () => {

            const username =
                usernameInput.value.trim();

            if (username === "" || username.length < 3) {

                usernameError.textContent =
                    "Enter your username or email above first.";

                usernameInput.classList.add(
                    "invalid"
                );

                return;

            }

            const originalText =
                sendCodeBtn.textContent;

            sendCodeBtn.disabled = true;
            sendCodeBtn.textContent = "Sending...";

            loginMessage.textContent = "";
            loginMessage.className = "auth-message";

            try {

                const response = await fetch(
                    "http://localhost:3000/api/login/send-code",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            username: username
                        })
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {

                    loginMessage.textContent =
                        data.message ||
                        "Unable to send verification code.";

                    loginMessage.className =
                        "auth-message error";

                } else {

                    loginMessage.textContent =
                        data.message ||
                        "Verification code sent to your email.";

                    loginMessage.className =
                        "auth-message success";

                }

            } catch (error) {

                console.error(
                    "Send code error:",
                    error
                );

                loginMessage.textContent =
                    "Unable to connect to the BRRMS server.";

                loginMessage.className =
                    "auth-message error";

            } finally {

                // Simple cooldown so the user can't spam-click
                let secondsLeft = 30;

                const interval = setInterval(() => {

                    sendCodeBtn.textContent =
                        `Resend in ${secondsLeft}s`;

                    secondsLeft -= 1;

                    if (secondsLeft < 0) {

                        clearInterval(interval);

                        sendCodeBtn.disabled = false;
                        sendCodeBtn.textContent = originalText;

                    }

                }, 1000);

            }

        }
    );


    // =========================
    // LOGIN
    // =========================

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            clearValidation();

            loginMessage.textContent = "";

            loginMessage.className =
                "auth-message";


            let isValid = true;


            // =========================
            // USERNAME / EMAIL
            // =========================

            const username =
                usernameInput.value.trim();


            if (username === "") {

                usernameError.textContent =
                    "Username or email is required.";

                usernameInput.classList.add(
                    "invalid"
                );

                isValid = false;

            } else if (username.length < 3) {

                usernameError.textContent =
                    "Username or email must be at least 3 characters.";

                usernameInput.classList.add(
                    "invalid"
                );

                isValid = false;

            } else {

                usernameInput.classList.add(
                    "valid"
                );

            }


            // =========================
            // PASSWORD
            // =========================

            const password =
                passwordInput.value;


            if (password === "") {

                passwordError.textContent =
                    "Password is required.";

                passwordInput.classList.add(
                    "invalid"
                );

                isValid = false;

            } else if (password.length < 8) {

                passwordError.textContent =
                    "Password must be at least 8 characters.";

                passwordInput.classList.add(
                    "invalid"
                );

                isValid = false;

            } else {

                passwordInput.classList.add(
                    "valid"
                );

            }


            // =========================
            // EMAIL VERIFICATION CODE
            // =========================

            const emailVerificationCode =
                emailVerificationCodeInput.value.trim();


            if (emailVerificationCode === "") {

                emailVerificationCodeError.textContent =
                    "Email verification code is required.";

                emailVerificationCodeInput.classList.add(
                    "invalid"
                );

                isValid = false;

            } else if (!/^[0-9]{6}$/.test(emailVerificationCode)) {

                emailVerificationCodeError.textContent =
                    "Verification code must contain exactly 6 digits.";

                emailVerificationCodeInput.classList.add(
                    "invalid"
                );

                isValid = false;

            } else {

                emailVerificationCodeInput.classList.add(
                    "valid"
                );

            }


            // =========================
            // MFA CODE
            // =========================

            const mfaCode =
                mfaInput.value.trim();


            if (mfaCode === "") {

                mfaError.textContent =
                    "MFA code is required.";

                mfaInput.classList.add(
                    "invalid"
                );

                isValid = false;

            } else if (!/^[0-9]{6}$/.test(mfaCode)) {

                mfaError.textContent =
                    "MFA code must contain exactly 6 digits.";

                mfaInput.classList.add(
                    "invalid"
                );

                isValid = false;

            } else {

                mfaInput.classList.add(
                    "valid"
                );

            }


            // =========================
            // STOP IF INVALID
            // =========================

            if (!isValid) {
                return;
            }


            // =========================
            // SEND TO SERVER
            // =========================

            try {

                loginMessage.textContent =
                    "Logging in...";

                loginMessage.classList.add(
                    "loading"
                );


                const response =
                    await fetch(
                        "http://localhost:3000/api/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                username: username,

                                password: password,

                                emailVerificationCode: emailVerificationCode,

                                mfaCode: mfaCode

                            })
                        }
                    );


                const data =
                    await response.json();


                // =========================
                // LOGIN ERROR
                // =========================

                if (!response.ok) {

                    loginMessage.textContent =
                        data.message ||
                        "Login failed.";

                    loginMessage.className =
                        "auth-message error";

                    return;

                }


                // =========================
                // SUCCESS
                // =========================

                if (data.success) {

                    const user =
                        data.user;


                    // Save user information

                    localStorage.setItem(
                        "brrmsUser",
                        JSON.stringify(user)
                    );


                    // =========================
                    // ROLE MESSAGE
                    // =========================

                    if (
                        user.role ===
                        "Administrator"
                    ) {

                        loginMessage.textContent =
                            "Login successful! Welcome, Administrator.";

                    }

                    else if (
                        user.role ===
                        "Staff"
                    ) {

                        loginMessage.textContent =
                            "Login successful! Welcome, Staff.";

                    }

                    else if (
                        user.role ===
                        "Barangay Captain"
                    ) {

                        loginMessage.textContent =
                            "Login successful! Welcome, Barangay Captain.";

                    }

                    else {

                        loginMessage.textContent =
                            "Login successful!";

                    }


                    loginMessage.className =
                        "auth-message success";


                    // =========================
                    // WELCOME PAGE
                    // =========================

                    setTimeout(() => {

                        window.location.href =
                            "welcome.html";

                    }, 800);

                }

            }


            catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                loginMessage.textContent =
                    "Unable to connect to the BRRMS server.";

                loginMessage.className =
                    "auth-message error";

            }

        }
    );

});