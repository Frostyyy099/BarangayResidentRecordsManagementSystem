/* =========================================
   BRRMS JAVASCRIPT
   Task 5 Interactive Forms
   ========================================= */


/* =========================
   DATA
   ========================= */

let residents =
    JSON.parse(localStorage.getItem("brrmsResidents")) || [];


/* =========================
   ELEMENTS
   ========================= */

const residentModal =
    document.getElementById("residentModal");

const searchModal =
    document.getElementById("searchModal");

const residentForm =
    document.getElementById("residentForm");

const residentTable =
    document.getElementById("residentTable");

const totalResidents =
    document.getElementById("totalResidents");

const activeResidents =
    document.getElementById("activeResidents");

const monthlyResidents =
    document.getElementById("monthlyResidents");

const totalRecords =
    document.getElementById("totalRecords");


/* =========================
   SAVE RESIDENT DATA
   ========================= */

function saveData() {

    localStorage.setItem(
        "brrmsResidents",
        JSON.stringify(residents)
    );

}


/* =========================
   GENERATE RESIDENT ID
   ========================= */

function generateID() {

    return "BRR-" +
        String(residents.length + 1)
        .padStart(4, "0");

}


/* =========================
   UPDATE DASHBOARD
   ========================= */

function updateDashboard() {

    totalResidents.textContent =
        residents.length;


    const active =
        residents.filter(function(resident) {

            return resident.status === "Active";

        }).length;


    activeResidents.textContent =
        active;


    const currentMonth =
        new Date().getMonth();

    const currentYear =
        new Date().getFullYear();


    const monthly =
        residents.filter(function(resident) {

            const date =
                new Date(resident.dateAdded);

            return (
                date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear
            );

        }).length;


    monthlyResidents.textContent =
        monthly;


    totalRecords.textContent =
        residents.length;


    renderTable();

}


/* =========================
   RENDER RESIDENT TABLE
   ========================= */

function renderTable() {

    residentTable.innerHTML = "";


    if (residents.length === 0) {

        residentTable.innerHTML = `
            <tr>
                <td colspan="7" class="empty-row">
                    No resident records yet.
                </td>
            </tr>
        `;

        return;
    }


    const recentResidents =
        [...residents]
        .reverse()
        .slice(0, 10);


    recentResidents.forEach(function(resident) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>${resident.id}</td>

            <td>
                <strong>${resident.name}</strong>
            </td>

            <td>${resident.age}</td>

            <td>${resident.address}</td>

            <td>${resident.contact}</td>

            <td>
                <span class="status">
                    ${resident.status}
                </span>
            </td>

            <td>
                ${resident.dateAdded}
            </td>

        `;


        residentTable.appendChild(row);

    });

}


/* =========================
   OPEN ADD RESIDENT MODAL
   ========================= */

function openAddModal() {

    residentForm.reset();

    document.getElementById("editId").value = "";

    document.getElementById("modalTitle").textContent =
        "Add Resident";

    residentModal.classList.add("show");

}


/* =========================
   CLOSE RESIDENT MODAL
   ========================= */

function closeResidentModal() {

    residentModal.classList.remove("show");

}


/* =========================
   ADD / UPDATE RESIDENT
   ========================= */

residentForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        if (!residentForm.checkValidity()) {

            residentForm.reportValidity();

            return;

        }


        const name =
            document.getElementById("residentName")
            .value
            .trim();


        const age =
            document.getElementById("residentAge")
            .value;


        const address =
            document.getElementById("residentAddress")
            .value
            .trim();


        const contact =
            document.getElementById("residentContact")
            .value
            .trim();


        const status =
            document.getElementById("residentStatus")
            .value;


        const editId =
            document.getElementById("editId")
            .value;


        /* =====================
           UPDATE EXISTING
           ===================== */

        if (editId) {

            const resident =
                residents.find(function(item) {

                    return item.id === editId;

                });


            if (resident) {

                resident.name = name;

                resident.age = age;

                resident.address = address;

                resident.contact = contact;

                resident.status = status;

            }

        }


        /* =====================
           ADD NEW
           ===================== */

        else {

            const newResident = {

                id: generateID(),

                name: name,

                age: age,

                address: address,

                contact: contact,

                status: status,

                dateAdded:
                    new Date()
                    .toLocaleDateString(
                        "en-US",
                        {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                        }
                    )

            };


            residents.push(newResident);

        }


        saveData();

        updateDashboard();

        closeResidentModal();


        alert(
            editId
                ? "Resident information updated successfully!"
                : "Resident successfully added!"
        );

    }
);


/* =========================
   SEARCH
   ========================= */

function openSearch() {

    searchModal.classList.add("show");

    document.getElementById("searchInput").value = "";

    document.getElementById("searchResults").innerHTML = "";

    document.getElementById("searchInput").focus();

}


document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        function() {

            const keyword =
                this.value
                .toLowerCase()
                .trim();


            const results =
                residents.filter(function(resident) {

                    return (

                        resident.name
                            .toLowerCase()
                            .includes(keyword)

                        ||

                        resident.address
                            .toLowerCase()
                            .includes(keyword)

                        ||

                        resident.contact
                            .toLowerCase()
                            .includes(keyword)

                    );

                });


            const container =
                document.getElementById(
                    "searchResults"
                );


            container.innerHTML = "";


            if (!keyword) {

                return;

            }


            if (results.length === 0) {

                container.innerHTML = `
                    <div class="search-result">

                        <strong>
                            No resident found
                        </strong>

                        <span>
                            Try another name or keyword.
                        </span>

                    </div>
                `;

                return;

            }


            results.forEach(function(resident) {

                const result =
                    document.createElement("div");


                result.className =
                    "search-result";


                result.innerHTML = `

                    <strong>
                        ${resident.name}
                    </strong>

                    <span>

                        ID: ${resident.id}<br>

                        Age: ${resident.age}<br>

                        Address: ${resident.address}<br>

                        Contact: ${resident.contact}<br>

                        Status: ${resident.status}

                    </span>

                `;


                container.appendChild(result);

            });

        }
    );


/* =========================
   UPDATE RESIDENT
   ========================= */

function updateResident() {

    if (residents.length === 0) {

        alert(
            "There are no residents to update."
        );

        return;

    }


    const name =
        prompt(
            "Enter the resident name to update:"
        );


    if (!name) {

        return;

    }


    const resident =
        residents.find(function(item) {

            return item.name
                .toLowerCase()
                .includes(
                    name.toLowerCase()
                );

        });


    if (!resident) {

        alert(
            "Resident not found."
        );

        return;

    }


    document.getElementById("editId").value =
        resident.id;


    document.getElementById("residentName").value =
        resident.name;


    document.getElementById("residentAge").value =
        resident.age;


    document.getElementById("residentAddress").value =
        resident.address;


    document.getElementById("residentContact").value =
        resident.contact;


    document.getElementById("residentStatus").value =
        resident.status;


    document.getElementById("modalTitle").textContent =
        "Update Resident";


    residentModal.classList.add("show");

}


/* =========================
   REPORTS
   ========================= */

function showReports() {

    const total =
        residents.length;


    const active =
        residents.filter(function(resident) {

            return resident.status === "Active";

        }).length;


    const inactive =
        residents.filter(function(resident) {

            return resident.status === "Inactive";

        }).length;


    alert(

        "BRRMS REPORT\n\n" +

        "Total Residents: " + total + "\n" +

        "Active Residents: " + active + "\n" +

        "Inactive Residents: " + inactive + "\n\n" +

        "This report is generated from the current browser records."

    );

}


/* =========================
   QUICK ACTION BUTTONS
   ========================= */

document
    .querySelector(".add-action")
    .addEventListener(
        "click",
        openAddModal
    );


document
    .querySelector(".search-action")
    .addEventListener(
        "click",
        openSearch
    );


document
    .querySelector(".update-action")
    .addEventListener(
        "click",
        updateResident
    );


document
    .querySelector(".report-action")
    .addEventListener(
        "click",
        showReports
    );


/* =========================
   CLOSE BUTTONS
   ========================= */

document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeResidentModal
    );


document
    .getElementById("closeSearch")
    .addEventListener(
        "click",
        function() {

            searchModal.classList.remove("show");

        }
    );


/* =========================
   CLICK OUTSIDE MODAL
   ========================= */

residentModal.addEventListener(
    "click",
    function(event) {

        if (event.target === residentModal) {

            closeResidentModal();

        }

    }
);


searchModal.addEventListener(
    "click",
    function(event) {

        if (event.target === searchModal) {

            searchModal.classList.remove("show");

        }

    }
);


/* =========================
   NAVIGATION
   ========================= */

const navigationButtons =
    document.querySelectorAll(
        "[data-page]"
    );


navigationButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                const page =
                    this.dataset.page;


                document
                    .querySelectorAll(
                        ".side-link, .top-link"
                    )
                    .forEach(
                        function(item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                document
                    .querySelectorAll(
                        `[data-page="${page}"]`
                    )
                    .forEach(
                        function(item) {

                            item.classList.add(
                                "active"
                            );

                        }
                    );


                if (page === "residents") {

                    alert(
                        "Residents section selected.\n\n" +
                        "Use the Add Resident or Search Records buttons to manage residents."
                    );

                }


                if (page === "records") {

                    openSearch();

                }


                if (page === "reports") {

                    showReports();

                }

            }
        );

    }
);


/* =========================
   VIEW ALL
   ========================= */

document
    .getElementById("viewAllBtn")
    .addEventListener(
        "click",
        function() {

            openSearch();

        }
    );


/* =========================
   LOGOUT
   ========================= */

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        function() {

            const confirmLogout =
                confirm(
                    "Are you sure you want to log out?"
                );


            if (confirmLogout) {

                alert(
                    "You have been logged out."
                );

            }

        }
    );


/* =========================================================
   TASK 5 - FORM 1
   ADD BARANGAY OFFICIAL
   Corresponds to barangay_officials table
   ========================================================= */

const officialModal =
    document.getElementById("officialModal");

const officialForm =
    document.getElementById("officialForm");

const addOfficialBtn =
    document.getElementById("addOfficialBtn");

const closeOfficial =
    document.getElementById("closeOfficial");

const officialTable =
    document.getElementById("officialTable");


if (
    officialModal &&
    officialForm &&
    addOfficialBtn &&
    closeOfficial &&
    officialTable
) {


    /* OPEN FORM */

    addOfficialBtn.addEventListener(
        "click",
        function() {

            officialForm.reset();

            officialModal.classList.add("show");

        }
    );


    /* CLOSE FORM */

    closeOfficial.addEventListener(
        "click",
        function() {

            officialModal.classList.remove("show");

        }
    );


    /* CLICK OUTSIDE */

    officialModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target === officialModal
            ) {

                officialModal.classList.remove(
                    "show"
                );

            }

        }
    );


    /* SUBMIT FORM */

    officialForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            /* HTML5 VALIDATION */

            if (!officialForm.checkValidity()) {

                officialForm.reportValidity();

                return;

            }


            const code =
                document
                    .getElementById(
                        "officialCode"
                    )
                    .value
                    .trim();


            const name =
                document
                    .getElementById(
                        "officialName"
                    )
                    .value
                    .trim();


            const position =
                document
                    .getElementById(
                        "officialPosition"
                    )
                    .value;


            const contact =
                document
                    .getElementById(
                        "officialContact"
                    )
                    .value
                    .trim();


            const term =
                document
                    .getElementById(
                        "officialTerm"
                    )
                    .value
                    .trim();


            /* CREATE TABLE ROW */

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>${code}</td>

                <td>${name}</td>

                <td>${position}</td>

                <td>${contact}</td>

                <td>${term}</td>

            `;


            officialTable.appendChild(row);


            /* RESET */

            officialForm.reset();


            officialModal.classList.remove(
                "show"
            );


            alert(
                "Barangay official successfully added!"
            );

        }
    );

}


/* =========================================================
   TASK 5 - FORM 2
   ADD BARANGAY CERTIFICATE
   Corresponds to certificates table
   ========================================================= */

const certificateModal =
    document.getElementById(
        "certificateModal"
    );

const certificateForm =
    document.getElementById(
        "certificateForm"
    );

const addCertificateBtn =
    document.getElementById(
        "addCertificateBtn"
    );

const closeCertificate =
    document.getElementById(
        "closeCertificate"
    );

const certificateTable =
    document.getElementById(
        "certificateTable"
    );


if (
    certificateModal &&
    certificateForm &&
    addCertificateBtn &&
    closeCertificate &&
    certificateTable
) {


    /* OPEN FORM */

    addCertificateBtn.addEventListener(
        "click",
        function() {

            certificateForm.reset();

            certificateModal.classList.add(
                "show"
            );

        }
    );


    /* CLOSE FORM */

    closeCertificate.addEventListener(
        "click",
        function() {

            certificateModal.classList.remove(
                "show"
            );

        }
    );


    /* CLICK OUTSIDE */

    certificateModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target === certificateModal
            ) {

                certificateModal.classList.remove(
                    "show"
                );

            }

        }
    );


    /* SUBMIT FORM */

    certificateForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            /* HTML5 VALIDATION */

            if (
                !certificateForm.checkValidity()
            ) {

                certificateForm.reportValidity();

                return;

            }


            const code =
                document
                    .getElementById(
                        "certificateCode"
                    )
                    .value
                    .trim();


            const resident =
                document
                    .getElementById(
                        "certificateResident"
                    )
                    .value
                    .trim();


            const type =
                document
                    .getElementById(
                        "certificateType"
                    )
                    .value;


            const date =
                document
                    .getElementById(
                        "certificateDate"
                    )
                    .value;


            const purpose =
                document
                    .getElementById(
                        "certificatePurpose"
                    )
                    .value
                    .trim();


            /* FORMAT DATE */

            const formattedDate =
                new Date(
                    date + "T00:00:00"
                ).toLocaleDateString(
                    "en-US",
                    {
                        month: "short",
                        day: "2-digit",
                        year: "numeric"
                    }
                );


            /* CREATE TABLE ROW */

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>${code}</td>

                <td>${resident}</td>

                <td>${type}</td>

                <td>${formattedDate}</td>

                <td>${purpose}</td>

            `;


            certificateTable.appendChild(row);


            /* RESET FORM */

            certificateForm.reset();


            certificateModal.classList.remove(
                "show"
            );


            alert(
                "Certificate successfully added!"
            );

        }
    );

}


/* =========================================================
   TASK 5 - ESCAPE KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key !== "Escape") {

            return;

        }


        if (officialModal) {

            officialModal.classList.remove(
                "show"
            );

        }


        if (certificateModal) {

            certificateModal.classList.remove(
                "show"
            );

        }

    }
);



/* =========================================================
   TASK 6 - CLIENT-SIDE DATA INPUT VALIDATION
   ========================================================= */

/*
   Task 6 requirements covered here:
   - Required fields
   - Correct data formats
   - JavaScript submit validation
   - User-friendly error messages
   - Visual invalid/valid feedback
   - Validation for all system forms
*/

const task6Forms = [
    document.getElementById("residentForm"),
    document.getElementById("officialForm"),
    document.getElementById("certificateForm")
].filter(Boolean);


/* -------------------------
   VALIDATION HELPERS
   ------------------------- */

function showTask6Error(field, errorId, message) {

    const error = document.getElementById(errorId);

    field.classList.remove("validation-valid");
    field.classList.add("validation-invalid");

    field.setCustomValidity(message);

    if (error) {
        error.textContent = message;
        error.classList.add("show");
    }
}


function showTask6Success(field, errorId) {

    const error = document.getElementById(errorId);

    field.classList.remove("validation-invalid");
    field.classList.add("validation-valid");

    field.setCustomValidity("");

    if (error) {
        error.textContent = "";
        error.classList.remove("show");
    }
}


function clearTask6State(field, errorId) {

    const error = document.getElementById(errorId);

    field.classList.remove(
        "validation-invalid",
        "validation-valid"
    );

    field.setCustomValidity("");

    if (error) {
        error.textContent = "";
        error.classList.remove("show");
    }
}


/* -------------------------
   INDIVIDUAL FIELD RULES
   ------------------------- */

function validateTask6Field(field, forceShow = false) {

    if (!field) {
        return true;
    }

    const id = field.id;
    const value = field.value.trim();
    const shouldShow = forceShow || field.dataset.touched === "true";

    let errorId = id + "Error";
    let message = "";

    /* Required fields */
    if (field.required && !value) {
        message = "This field is required.";
    }

    /* Names */
    else if (
        ["residentName", "officialName", "certificateResident"].includes(id)
    ) {
        const namePattern = /^[A-Za-zÀ-ÿ .'-]+$/;

        if (value.length < 3) {
            message = "Name must contain at least 3 characters.";
        } else if (!namePattern.test(value)) {
            message = "Enter a valid name using letters, spaces, apostrophes, periods, or hyphens.";
        } else if (value.length > 100) {
            message = "Name must not exceed 100 characters.";
        }
    }

    /* Age */
    else if (id === "residentAge") {

        const age = Number(value);

        if (!Number.isInteger(age) || age < 1 || age > 120) {
            message = "Age must be a whole number from 1 to 120.";
        }
    }

    /* Philippine mobile numbers */
    else if (
        id === "residentContact" ||
        id === "officialContact"
    ) {

        if (!/^09\d{9}$/.test(value)) {
            message = "Enter an 11-digit Philippine mobile number starting with 09.";
        }
    }

    /* Address */
    else if (id === "residentAddress") {

        if (value.length < 5) {
            message = "Address must contain at least 5 characters.";
        } else if (value.length > 255) {
            message = "Address must not exceed 255 characters.";
        }
    }

    /* Resident status */
    else if (id === "residentStatus") {

        if (!["Active", "Inactive"].includes(value)) {
            message = "Please select Active or Inactive.";
        }
    }

    /* Official code */
    else if (id === "officialCode") {

        if (!/^OFF-\d{3}$/.test(value)) {
            message = "Use the format OFF-000, for example OFF-006.";
        }
    }

    /* Official position */
    else if (id === "officialPosition") {

        if (
            ![
                "Barangay Captain",
                "Kagawad",
                "Secretary",
                "Treasurer"
            ].includes(value)
        ) {
            message = "Please select a valid barangay position.";
        }
    }

    /* Official term */
    else if (id === "officialTerm") {

        const match = value.match(/^(\d{4})-(\d{4})$/);

        if (!match) {
            message = "Use the format YYYY-YYYY, for example 2026-2029.";
        } else if (Number(match[2]) <= Number(match[1])) {
            message = "The ending year must be later than the starting year.";
        }
    }

    /* Certificate code */
    else if (id === "certificateCode") {

        if (!/^CERT-\d{3}$/.test(value)) {
            message = "Use the format CERT-000, for example CERT-006.";
        }
    }

    /* Certificate type */
    else if (id === "certificateType") {

        if (
            ![
                "Certificate of Residency",
                "Barangay Clearance",
                "Certificate of Indigency"
            ].includes(value)
        ) {
            message = "Please select a valid certificate type.";
        }
    }

    /* Certificate date */
    else if (id === "certificateDate") {

        const selectedDate = new Date(value + "T00:00:00");
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        if (Number.isNaN(selectedDate.getTime())) {
            message = "Please enter a valid date.";
        } else if (selectedDate > today) {
            message = "Date issued cannot be a future date.";
        }
    }

    /* Certificate purpose */
    else if (id === "certificatePurpose") {

        if (value.length < 3) {
            message = "Purpose must contain at least 3 characters.";
        } else if (value.length > 255) {
            message = "Purpose must not exceed 255 characters.";
        }
    }


    if (message) {

        field.setCustomValidity(message);

        if (shouldShow) {
            showTask6Error(field, errorId, message);
        }

        return false;
    }


    field.setCustomValidity("");

    if (shouldShow && value) {
        showTask6Success(field, errorId);
    } else if (!value) {
        clearTask6State(field, errorId);
    }

    return true;
}


/* -------------------------
   VALIDATE COMPLETE FORM
   ------------------------- */

function validateTask6Form(form) {

    let isValid = true;
    let firstInvalidField = null;

    const fields = form.querySelectorAll(
        "input:not([type='hidden']), select, textarea"
    );

    fields.forEach(function(field) {

        field.dataset.touched = "true";

        const valid = validateTask6Field(field, true);

        if (!valid) {

            isValid = false;

            if (!firstInvalidField) {
                firstInvalidField = field;
            }
        }

    });


    if (!isValid && firstInvalidField) {

        firstInvalidField.focus();

        alert(
            "Please correct the highlighted field(s) before submitting."
        );

        return false;
    }


    return form.checkValidity();
}


/* -------------------------
   SET TODAY AS MAX CERTIFICATE DATE
   ------------------------- */

const certificateDateField =
    document.getElementById("certificateDate");

if (certificateDateField) {

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    certificateDateField.max =
        `${year}-${month}-${day}`;
}


/* -------------------------
   INPUT + BLUR VALIDATION
   ------------------------- */

task6Forms.forEach(function(form) {

    const fields = form.querySelectorAll(
        "input:not([type='hidden']), select, textarea"
    );


    fields.forEach(function(field) {

        field.addEventListener(
            "input",
            function() {

                field.dataset.touched = "true";

                validateTask6Field(field);
            }
        );


        field.addEventListener(
            "change",
            function() {

                field.dataset.touched = "true";

                validateTask6Field(field);
            }
        );


        field.addEventListener(
            "blur",
            function() {

                field.dataset.touched = "true";

                validateTask6Field(field);
            }
        );

    });


    /* Clear visual feedback after reset */
    form.addEventListener(
        "reset",
        function() {

            fields.forEach(function(field) {

                field.dataset.touched = "false";

                clearTask6State(
                    field,
                    field.id + "Error"
                );

            });

        }
    );


    /*
       Capture phase makes Task 6 validation run BEFORE
       the original Task 5 submit handlers.
    */
    form.addEventListener(
        "submit",
        function(event) {

            if (!validateTask6Form(form)) {

                event.preventDefault();
                event.stopImmediatePropagation();

            }

        },
        true
    );

});


/* =========================
   START SYSTEM
   ========================= */

updateDashboard();