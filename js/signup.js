// =========================
// BRRMS SIGN UP VALIDATION
// TASK 6 - DATA INPUT VALIDATION
// =========================

document.addEventListener("DOMContentLoaded", () => {

    const signupForm = document.getElementById("signupForm");

    const fullName = document.getElementById("fullName");
    const email = document.getElementById("email");
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const mfaCode = document.getElementById("mfaCode");

    const fullNameError = document.getElementById("fullNameError");
    const emailError = document.getElementById("emailError");
    const usernameError = document.getElementById("usernameError");
    const passwordError = document.getElementById("passwordError");
    const confirmPasswordError = document.getElementById("confirmPasswordError");
    const mfaCodeError = document.getElementById("mfaError");

    const signupMessage = document.getElementById("signupMessage");


    // =========================
    // VALIDATION FUNCTIONS
    // =========================

    function validateFullName() {

        const value = fullName.value.trim();

        if (value === "") {
            showError(fullName, fullNameError, "Full name is required.");
            return false;
        }

        if (value.length < 3) {
            showError(
                fullName,
                fullNameError,
                "Full name must be at least 3 characters."
            );
            return false;
        }

        if (value.length > 100) {
            showError(
                fullName,
                fullNameError,
                "Full name must not exceed 100 characters."
            );
            return false;
        }

        // Letters, spaces, periods, apostrophes and hyphens only
        if (!/^[A-Za-zÀ-ÿ .'-]+$/.test(value)) {
            showError(
                fullName,
                fullNameError,
                "Full name may contain letters, spaces, periods, apostrophes, and hyphens only."
            );
            return false;
        }

        showSuccess(fullName, fullNameError);
        return true;
    }


    // =========================
    // EMAIL VALIDATION
    // =========================

    function validateEmail() {

        const value = email.value.trim();

        if (value === "") {
            showError(
                email,
                emailError,
                "Email address is required."
            );
            return false;
        }

        if (value.length > 100) {
            showError(
                email,
                emailError,
                "Email address must not exceed 100 characters."
            );
            return false;
        }

        // Basic valid email format
        const emailPattern =
            /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

        if (!emailPattern.test(value)) {
            showError(
                email,
                emailError,
                "Please enter a valid email address."
            );
            return false;
        }

        showSuccess(email, emailError);
        return true;
    }


    // =========================
    // USERNAME VALIDATION
    // =========================

    function validateUsername() {

        const value = username.value.trim();

        if (value === "") {
            showError(
                username,
                usernameError,
                "Username is required."
            );
            return false;
        }

        if (value.length < 3) {
            showError(
                username,
                usernameError,
                "Username must be at least 3 characters."
            );
            return false;
        }

        if (value.length > 50) {
            showError(
                username,
                usernameError,
                "Username must not exceed 50 characters."
            );
            return false;
        }

        // Letters, numbers, periods, underscores and hyphens only
        if (!/^[A-Za-z0-9._-]+$/.test(value)) {
            showError(
                username,
                usernameError,
                "Username may contain letters, numbers, periods, underscores, and hyphens only."
            );
            return false;
        }

        showSuccess(username, usernameError);
        return true;
    }


    // =========================
    // PASSWORD VALIDATION
    // =========================

    function validatePassword() {

        const value = password.value;

        if (value === "") {
            showError(
                password,
                passwordError,
                "Password is required."
            );
            return false;
        }

        if (value.length < 8) {
            showError(
                password,
                passwordError,
                "Password must be at least 8 characters."
            );
            return false;
        }

        if (!/[A-Z]/.test(value)) {
            showError(
                password,
                passwordError,
                "Password must contain at least one uppercase letter."
            );
            return false;
        }

        if (!/[a-z]/.test(value)) {
            showError(
                password,
                passwordError,
                "Password must contain at least one lowercase letter."
            );
            return false;
        }

        if (!/[0-9]/.test(value)) {
            showError(
                password,
                passwordError,
                "Password must contain at least one number."
            );
            return false;
        }

        if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(value)) {
            showError(
                password,
                passwordError,
                "Password must contain at least one special character."
            );
            return false;
        }

        showSuccess(password, passwordError);
        return true;
    }


    // =========================
    // CONFIRM PASSWORD
    // =========================

    function validateConfirmPassword() {

        const value = confirmPassword.value;

        if (value === "") {
            showError(
                confirmPassword,
                confirmPasswordError,
                "Please confirm your password."
            );
            return false;
        }

        if (value !== password.value) {
            showError(
                confirmPassword,
                confirmPasswordError,
                "Passwords do not match."
            );
            return false;
        }

        showSuccess(confirmPassword, confirmPasswordError);
        return true;
    }


    // =========================
    // MFA CODE VALIDATION
    // =========================

    function validateMfaCode() {

        const value = mfaCode.value.trim();

        if (value === "") {
            showError(
                mfaCode,
                mfaCodeError,
                "MFA Code is required."
            );
            return false;
        }

        // Exactly 6 digits
        if (!/^\d{6}$/.test(value)) {
            showError(
                mfaCode,
                mfaCodeError,
                "MFA Code must contain exactly 6 digits."
            );
            return false;
        }

        showSuccess(mfaCode, mfaCodeError);
        return true;
    }


    // =========================
    // ERROR / SUCCESS DISPLAY
    // =========================

    function showError(input, errorElement, message) {

        input.classList.remove("valid");
        input.classList.add("invalid");

        errorElement.textContent = message;
        errorElement.classList.add("show");
    }


    function showSuccess(input, errorElement) {

        input.classList.remove("invalid");
        input.classList.add("valid");

        errorElement.textContent = "";
        errorElement.classList.remove("show");
    }


    // =========================
    // LIVE VALIDATION
    // =========================

    fullName.addEventListener(
        "input",
        validateFullName
    );

    email.addEventListener(
        "input",
        validateEmail
    );

    username.addEventListener(
        "input",
        validateUsername
    );

    password.addEventListener(
        "input",
        () => {

            validatePassword();

            if (confirmPassword.value !== "") {
                validateConfirmPassword();
            }

        }
    );

    confirmPassword.addEventListener(
        "input",
        validateConfirmPassword
    );

    mfaCode.addEventListener(
        "input",
        validateMfaCode
    );


    // =========================
    // FORM SUBMISSION
    // =========================

    signupForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            signupMessage.textContent = "";
            signupMessage.className = "auth-message";


            // Validate ALL fields

            const validFullName =
                validateFullName();

            const validEmail =
                validateEmail();

            const validUsername =
                validateUsername();

            const validPassword =
                validatePassword();

            const validConfirmPassword =
                validateConfirmPassword();

            const validMfaCode =
                validateMfaCode();


            // =========================
            // STOP IF INVALID
            // =========================

            if (
                !validFullName ||
                !validEmail ||
                !validUsername ||
                !validPassword ||
                !validConfirmPassword ||
                !validMfaCode
            ) {

                signupMessage.textContent =
                    "Please correct the errors before creating your account.";

                signupMessage.classList.add("error");

                return;
            }


            // =========================
            // SEND DATA TO SERVER
            // =========================

            const userData = {

                full_name:
                    fullName.value.trim(),

                username:
                    username.value.trim(),

                password:
                    password.value

            };


            try {

                signupMessage.textContent =
                    "Creating account...";

                signupMessage.className =
                    "auth-message loading";


                const response = await fetch(
                    "http://localhost:3000/api/signup",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(userData)
                    }
                );


                const data =
                    await response.json();


                // =========================
                // SERVER REJECTED REQUEST
                // =========================

                if (!response.ok) {

                    signupMessage.textContent =
                        data.message ||
                        "Unable to create account.";

                    signupMessage.className =
                        "auth-message error";

                    return;
                }


                // =========================
                // SUCCESS
                // =========================

                signupMessage.textContent =
                    data.message ||
                    "Account created successfully!";

                signupMessage.className =
                    "auth-message success";


                // Clear form

                signupForm.reset();


                // Remove validation styles

                [
                    fullName,
                    email,
                    username,
                    password,
                    confirmPassword,
                    mfaCode
                ].forEach(input => {

                    input.classList.remove(
                        "valid",
                        "invalid"
                    );

                });


                // Remove error messages

                [
                    fullNameError,
                    emailError,
                    usernameError,
                    passwordError,
                    confirmPasswordError,
                    mfaCodeError
                ].forEach(error => {

                    error.textContent = "";

                    error.classList.remove(
                        "show"
                    );

                });


                // Redirect to login

                setTimeout(() => {

                    window.location.href =
                        "login.html";

                }, 1500);


            } catch (error) {

                console.error(
                    "Signup error:",
                    error
                );

                signupMessage.textContent =
                    "Cannot connect to the server. Make sure your BRRMS server is running.";

                signupMessage.className =
                    "auth-message error";

            }

        }
    );

});
