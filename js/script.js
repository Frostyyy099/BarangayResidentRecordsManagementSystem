/* =========================================
   BRRMS JAVASCRIPT
   Task 5 Interactive Forms
   ========================================= */


/* =========================
   SESSION CHECK
   ========================= */

const loggedInUser =
    JSON.parse(localStorage.getItem("brrmsUser"));


if (!loggedInUser) {

    window.location.href = "login.html";

}


/* =========================
   PERSONALIZE HEADER
   ========================= */

function personalizeHeader() {

    if (!loggedInUser) {

        return;

    }


    const nameEl =
        document.getElementById("profileName");

    const roleEl =
        document.getElementById("profileRole");

    const initialsEl =
        document.getElementById("profileInitials");

    const greetingEl =
        document.getElementById("heroGreeting");


    if (nameEl) {

        nameEl.textContent =
            loggedInUser.full_name || "Barangay Staff";

    }


    if (roleEl) {

        roleEl.textContent =
            loggedInUser.role || "Staff";

    }


    if (initialsEl && loggedInUser.full_name) {

        const initials =
            loggedInUser.full_name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map(function(part) {

                    return part[0].toUpperCase();

                })
                .join("");

        initialsEl.textContent =
            initials || "BS";

    }


    if (greetingEl) {

        const hour =
            new Date().getHours();

        const timeGreeting =
            hour < 12 ? "GOOD MORNING" :
            hour < 18 ? "GOOD AFTERNOON" :
            "GOOD EVENING";

        const firstName =
            (loggedInUser.full_name || "STAFF")
                .split(" ")[0]
                .toUpperCase();

        greetingEl.textContent =
            `${timeGreeting}, ${firstName}!`;

    }

}


personalizeHeader();


/* =========================
   EDIT PROFILE
   (updates the real MySQL
   users table via server.js)
   ========================= */

const profileModal =
    document.getElementById("profileModal");

const profileForm =
    document.getElementById("profileForm");

const staffProfileBtn =
    document.getElementById("staffProfileBtn");

const closeProfile =
    document.getElementById("closeProfile");

const profileMessage =
    document.getElementById("profileMessage");


if (
    profileModal &&
    profileForm &&
    staffProfileBtn &&
    closeProfile
) {

    function openProfileModal() {

        if (!loggedInUser) {

            return;

        }

        profileForm.reset();

        profileMessage.textContent = "";

        document.getElementById("profileFullName").value =
            loggedInUser.full_name || "";

        document.getElementById("profileEmail").value =
            loggedInUser.email || "";

        document.getElementById("profileUsername").value =
            loggedInUser.username || "";

        profileModal.classList.add("show");

    }


    /* OPEN — but ignore clicks on the theme toggle
       or notification icon inside the same header area */

    staffProfileBtn.addEventListener(
        "click",
        function(event) {

            if (event.target.closest("#themeToggle")) {

                return;

            }

            if (event.target.closest(".notification")) {

                return;

            }

            openProfileModal();

        }
    );


    /* CLOSE */

    closeProfile.addEventListener(
        "click",
        function() {

            profileModal.classList.remove("show");

        }
    );


    profileModal.addEventListener(
        "click",
        function(event) {

            if (event.target === profileModal) {

                profileModal.classList.remove("show");

            }

        }
    );


    /* SUBMIT — validate, then PUT to the real backend */

    profileForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            profileMessage.textContent = "";


            const fullNameInput =
                document.getElementById("profileFullName");

            const emailInput =
                document.getElementById("profileEmail");

            const newPasswordInput =
                document.getElementById("profileNewPassword");

            const confirmPasswordInput =
                document.getElementById("profileConfirmPassword");


            let isValid = true;


            /* Full name */

            if (
                fullNameInput.value.trim().length < 3 ||
                !/^[A-Za-zÀ-ÿ .'-]+$/.test(fullNameInput.value.trim())
            ) {

                document.getElementById("profileFullNameError").textContent =
                    "Enter a valid full name (letters, spaces, apostrophes, periods, hyphens).";

                fullNameInput.classList.add("invalid");

                isValid = false;

            } else {

                document.getElementById("profileFullNameError").textContent = "";

                fullNameInput.classList.remove("invalid");

            }


            /* Email (optional, but must be valid if provided) */

            const emailValue =
                emailInput.value.trim();

            if (
                emailValue &&
                !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(emailValue)
            ) {

                document.getElementById("profileEmailError").textContent =
                    "Enter a valid email address.";

                emailInput.classList.add("invalid");

                isValid = false;

            } else {

                document.getElementById("profileEmailError").textContent = "";

                emailInput.classList.remove("invalid");

            }


            /* New password (optional, but if provided must meet
               length + match confirmation) */

            const newPassword =
                newPasswordInput.value;

            const confirmPassword =
                confirmPasswordInput.value;

            if (newPassword || confirmPassword) {

                if (newPassword.length < 8) {

                    document.getElementById("profileNewPasswordError").textContent =
                        "New password must be at least 8 characters.";

                    newPasswordInput.classList.add("invalid");

                    isValid = false;

                } else {

                    document.getElementById("profileNewPasswordError").textContent = "";

                    newPasswordInput.classList.remove("invalid");

                }

                if (newPassword !== confirmPassword) {

                    document.getElementById("profileConfirmPasswordError").textContent =
                        "Passwords do not match.";

                    confirmPasswordInput.classList.add("invalid");

                    isValid = false;

                } else {

                    document.getElementById("profileConfirmPasswordError").textContent = "";

                    confirmPasswordInput.classList.remove("invalid");

                }

            }


            if (!isValid) {

                return;

            }


            /* SEND TO SERVER */

            const saveBtn =
                document.getElementById("profileSaveBtn");

            const originalBtnText =
                saveBtn.textContent;

            saveBtn.disabled = true;

            saveBtn.textContent = "Saving...";

            profileMessage.textContent = "Saving changes...";

            profileMessage.style.color = "#6b7280";


            fetch(
                `http://localhost:3000/api/users/${loggedInUser.user_id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        full_name: fullNameInput.value.trim(),
                        email: emailValue || null,
                        password: newPassword || undefined
                    })
                }
            )
                .then(function(response) {

                    return response.json().then(function(data) {

                        return { ok: response.ok, data: data };

                    });

                })
                .then(function(result) {

                    saveBtn.disabled = false;

                    saveBtn.textContent = originalBtnText;


                    if (!result.ok || !result.data.success) {

                        profileMessage.textContent =
                            result.data.message || "Could not update profile.";

                        profileMessage.style.color = "#c81e1e";

                        return;

                    }


                    /* Update the local session so the header,
                       and any future page load, show the new info */

                    const updatedUser =
                        Object.assign(
                            {},
                            loggedInUser,
                            result.data.user
                        );

                    localStorage.setItem(
                        "brrmsUser",
                        JSON.stringify(updatedUser)
                    );

                    loggedInUser.full_name = updatedUser.full_name;

                    loggedInUser.email = updatedUser.email;


                    personalizeHeader();

                    profileMessage.textContent =
                        "Profile updated successfully!";

                    profileMessage.style.color = "#2f7a3d";

                    profileForm.querySelector(
                        "#profileNewPassword"
                    ).value = "";

                    profileForm.querySelector(
                        "#profileConfirmPassword"
                    ).value = "";


                    if (typeof showToast === "function") {

                        showToast(
                            "success",
                            "Profile Updated",
                            "Your account information has been saved."
                        );

                    }


                    setTimeout(function() {

                        profileModal.classList.remove("show");

                    }, 900);

                })
                .catch(function(error) {

                    console.error("Profile update error:", error);

                    saveBtn.disabled = false;

                    saveBtn.textContent = originalBtnText;

                    profileMessage.textContent =
                        "Unable to connect to the BRRMS server. Make sure server.js is running.";

                    profileMessage.style.color = "#c81e1e";

                });

        }
    );

}


/* =========================
   ACTIVITY LOG (audit trail)
   ========================= */

let activityLog =
    JSON.parse(localStorage.getItem("brrmsActivityLog")) || [];


function logActivity(icon, text) {

    const actor =
        (loggedInUser && loggedInUser.full_name) ||
        "Someone";


    activityLog.unshift({
        icon: icon,
        text: `${actor} ${text}`,
        time: new Date().toISOString()
    });


    // Keep the log from growing forever
    if (activityLog.length > 50) {

        activityLog = activityLog.slice(0, 50);

    }


    localStorage.setItem(
        "brrmsActivityLog",
        JSON.stringify(activityLog)
    );


    renderActivityLog();

}


function timeAgo(isoString) {

    const seconds =
        Math.floor(
            (Date.now() - new Date(isoString).getTime()) / 1000
        );


    if (seconds < 60) return "just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;

}


function renderActivityLog() {

    const feed =
        document.getElementById("activityFeed");

    if (!feed) {

        return;

    }


    if (activityLog.length === 0) {

        feed.innerHTML = `
            <div class="activity-item">
                <div class="activity-icon">🕓</div>
                <div class="activity-text">
                    No activity yet.
                </div>
            </div>
        `;

        return;

    }


    feed.innerHTML = "";


    activityLog.slice(0, 15).forEach(function(entry) {

        const item =
            document.createElement("div");

        item.className = "activity-item";

        item.innerHTML = `

            <div class="activity-icon">${entry.icon}</div>

            <div class="activity-text">

                ${entry.text}

                <span class="activity-time">
                    ${timeAgo(entry.time)}
                </span>

            </div>

        `;

        feed.appendChild(item);

    });

}


renderActivityLog();


/* =========================
   TOAST NOTIFICATIONS
   ========================= */

function showToast(type, title, message) {

    const container =
        document.getElementById("toastContainer");

    if (!container) {

        return;

    }


    const icons = {
        success: "✅",
        error: "⚠️",
        info: "ℹ️"
    };


    const toast =
        document.createElement("div");

    toast.className = `toast ${type}`;

    toast.innerHTML = `

        <div class="toast-icon">${icons[type] || icons.info}</div>

        <div class="toast-text">
            <strong>${title}</strong>
            ${message || ""}
        </div>

    `;


    container.appendChild(toast);


    setTimeout(function() {

        toast.remove();

    }, 3000);

}


/* =========================
   DARK MODE TOGGLE
   ========================= */

const themeToggle =
    document.getElementById("themeToggle");


function applyTheme(theme) {

    if (theme === "dark") {

        document.documentElement.setAttribute(
            "data-theme",
            "dark"
        );

    } else {

        document.documentElement.removeAttribute(
            "data-theme"
        );

    }

}


const savedTheme =
    localStorage.getItem("brrmsTheme") || "light";

applyTheme(savedTheme);


if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        function() {

            const isDark =
                document.documentElement.getAttribute(
                    "data-theme"
                ) === "dark";

            const newTheme =
                isDark ? "light" : "dark";

            applyTheme(newTheme);

            localStorage.setItem(
                "brrmsTheme",
                newTheme
            );

        }
    );

}


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


    const residentsPageSearch =
        document.getElementById(
            "residentsPageSearch"
        );

    if (residentsPageSearch) {

        renderResidentsPage(
            residentsPageSearch.value
        );

    }

}


/* =========================
   RENDER RESIDENT TABLE
   ========================= */

function buildResidentRow(resident) {

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

        <td>${resident.email || "—"}</td>

        <td>
            <span class="status">
                ${resident.status}
            </span>
        </td>

        <td>
            ${resident.dateAdded}
        </td>

        <td class="row-actions">
            <button type="button" class="row-qr-btn" data-id="${resident.id}" title="QR Code">
                ▦
            </button>
            <button type="button" class="row-edit-btn" data-id="${resident.id}" title="Edit">
                ✎
            </button>
            <button type="button" class="row-delete-btn" data-id="${resident.id}" title="Delete">
                🗑
            </button>
        </td>

    `;


    return row;

}


function renderResidentsInto(tableBody, list) {

    tableBody.innerHTML = "";


    if (list.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-row">
                    <span class="empty-state-icon">🧑‍🤝‍🧑</span>
                    No resident records yet.
                </td>
            </tr>
        `;

        return;
    }


    list.forEach(function(resident) {

        tableBody.appendChild(
            buildResidentRow(resident)
        );

    });

}


function renderTable() {

    const recentResidents =
        [...residents]
        .reverse()
        .slice(0, 10);


    renderResidentsInto(
        residentTable,
        recentResidents
    );

}


function renderResidentsPage(filterKeyword) {

    const pageTable =
        document.getElementById(
            "residentsPageTable"
        );

    if (!pageTable) {

        return;

    }


    const keyword =
        (filterKeyword || "")
        .toLowerCase()
        .trim();


    const list =
        [...residents]
        .reverse()
        .filter(function(resident) {

            if (keyword === "") {

                return true;

            }


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

                ||

                (resident.email || "")
                    .toLowerCase()
                    .includes(keyword)

            );

        });


    renderResidentsInto(
        pageTable,
        list
    );


    const countEl =
        document.getElementById(
            "residentsPageCount"
        );

    if (countEl) {

        countEl.textContent =
            `${list.length} of ${residents.length} residents`;

    }

}


/* =========================
   OPEN EDIT RESIDENT MODAL
   ========================= */

function openEditModal(id) {

    const resident =
        residents.find(function(item) {

            return item.id === id;

        });


    if (!resident) {

        return;

    }


    document.getElementById("editId").value =
        resident.id;

    document.getElementById("residentName").value =
        resident.name;

    document.getElementById("residentAge").value =
        resident.age;

    document.getElementById("residentContact").value =
        resident.contact;

    document.getElementById("residentEmail").value =
        resident.email || "";

    document.getElementById("residentAddress").value =
        resident.address;

    document.getElementById("residentStatus").value =
        resident.status;

    document.getElementById("modalTitle").textContent =
        "Edit Resident";

    residentModal.classList.add("show");

}


/* =========================
   QR CODE MODAL
   ========================= */

const qrModal =
    document.getElementById("qrModal");

const qrCodeCanvas =
    document.getElementById("qrCodeCanvas");


function openQrModal(id) {

    const resident =
        residents.find(function(item) {

            return item.id === id;

        });


    if (!resident) {

        return;

    }


    document.getElementById("qrResidentName").textContent =
        resident.name;

    document.getElementById("qrResidentId").textContent =
        resident.id;


    // Clear any previously generated QR code
    qrCodeCanvas.innerHTML = "";


    // QRCode.js (loaded via CDN in index.html)
    if (typeof QRCode !== "undefined") {

        new QRCode(qrCodeCanvas, {
            text: resident.id,
            width: 180,
            height: 180
        });

    } else {

        qrCodeCanvas.innerHTML =
            "<p style='color:#c81e1e;'>QR library failed to load.</p>";

    }


    qrModal.classList.add("show");

}


if (qrModal) {

    document
        .getElementById("closeQr")
        .addEventListener("click", function() {

            qrModal.classList.remove("show");

        });


    qrModal.addEventListener("click", function(event) {

        if (event.target === qrModal) {

            qrModal.classList.remove("show");

        }

    });

}


/* =========================
   QR / CODE LOOKUP
   ========================= */

const qrLookupBtn =
    document.getElementById("qrLookupBtn");

const qrLookupInput =
    document.getElementById("qrLookupInput");


function performQrLookup() {

    const code =
        qrLookupInput.value.trim();


    if (!code) {

        return;

    }


    const resident =
        residents.find(function(item) {

            return item.id.toLowerCase() ===
                code.toLowerCase();

        });


    if (!resident) {

        showToast(
            "error",
            "Not Found",
            `No resident found with ID "${code}".`
        );

        return;

    }


    qrLookupInput.value = "";

    openEditModal(resident.id);

}


if (qrLookupBtn) {

    qrLookupBtn.addEventListener(
        "click",
        performQrLookup
    );


    qrLookupInput.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                event.preventDefault();

                performQrLookup();

            }

        }
    );

}


/* =========================
   DELETE RESIDENT
   ========================= */

function deleteResident(id) {

    const resident =
        residents.find(function(item) {

            return item.id === id;

        });


    if (!resident) {

        return;

    }


    const confirmDelete =
        confirm(
            `Delete ${resident.name}'s record? This cannot be undone.`
        );


    if (!confirmDelete) {

        return;

    }


    residents =
        residents.filter(function(item) {

            return item.id !== id;

        });


    logActivity(
        "🗑",
        `deleted resident <strong>${resident.name}</strong>`
    );


    saveData();

    updateDashboard();

}


/* =========================
   ROW ACTION BUTTONS
   (event delegation, since
   rows are re-rendered often)
   ========================= */

function handleResidentRowClick(event) {

    const editBtn =
        event.target.closest(".row-edit-btn");

    const deleteBtn =
        event.target.closest(".row-delete-btn");

    const qrBtn =
        event.target.closest(".row-qr-btn");


    if (editBtn) {

        openEditModal(editBtn.dataset.id);

    }


    if (deleteBtn) {

        deleteResident(deleteBtn.dataset.id);

    }


    if (qrBtn) {

        openQrModal(qrBtn.dataset.id);

    }

}


residentTable.addEventListener(
    "click",
    handleResidentRowClick
);


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


        const email =
            document.getElementById("residentEmail")
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

                resident.email = email;

                resident.status = status;

                logActivity(
                    "✎",
                    `updated resident <strong>${name}</strong>`
                );

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

                email: email,

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

            logActivity(
                "🧑",
                `added new resident <strong>${name}</strong>`
            );

        }


        saveData();

        updateDashboard();

        closeResidentModal();


        showToast(
            "success",
            editId ? "Resident Updated" : "Resident Added",
            editId
                ? "Their information has been updated successfully."
                : "The new resident record has been saved."
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


            const container =
                document.getElementById(
                    "searchResults"
                );


            container.innerHTML = "";


            if (!keyword) {

                return;

            }


            const residentMatches =
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

                        ||

                        (resident.email || "")
                            .toLowerCase()
                            .includes(keyword)

                    );

                });


            const officialMatches =
                officials.filter(function(official) {

                    return (

                        official.name
                            .toLowerCase()
                            .includes(keyword)

                        ||

                        official.position
                            .toLowerCase()
                            .includes(keyword)

                        ||

                        official.contact
                            .toLowerCase()
                            .includes(keyword)

                    );

                });


            const certificateMatches =
                certificates.filter(function(certificate) {

                    return (

                        certificate.resident
                            .toLowerCase()
                            .includes(keyword)

                        ||

                        certificate.type
                            .toLowerCase()
                            .includes(keyword)

                        ||

                        certificate.purpose
                            .toLowerCase()
                            .includes(keyword)

                    );

                });


            const totalMatches =
                residentMatches.length +
                officialMatches.length +
                certificateMatches.length;


            if (totalMatches === 0) {

                container.innerHTML = `
                    <div class="search-result">

                        <strong>
                            No matches found
                        </strong>

                        <span>
                            Try another name or keyword.
                        </span>

                    </div>
                `;

                return;

            }


            /* ===== RESIDENTS ===== */

            residentMatches.forEach(function(resident) {

                const result =
                    document.createElement("div");


                result.className =
                    "search-result";


                result.innerHTML = `

                    <strong>
                        🧑 ${resident.name}
                        <span style="font-weight: normal; font-size: 12px; color: #6b7280;">
                            — Resident
                        </span>
                    </strong>

                    <span>

                        ID: ${resident.id}<br>

                        Age: ${resident.age}<br>

                        Address: ${resident.address}<br>

                        Contact: ${resident.contact}<br>

                        Email: ${resident.email || "—"}<br>

                        Status: ${resident.status}

                    </span>

                `;


                container.appendChild(result);

            });


            /* ===== OFFICIALS ===== */

            officialMatches.forEach(function(official) {

                const result =
                    document.createElement("div");


                result.className =
                    "search-result";


                result.innerHTML = `

                    <strong>
                        🏛️ ${official.name}
                        <span style="font-weight: normal; font-size: 12px; color: #6b7280;">
                            — Barangay Official
                        </span>
                    </strong>

                    <span>

                        ID: ${official.id}<br>

                        Position: ${official.position}<br>

                        Contact: ${official.contact}<br>

                        Term: ${official.term}

                    </span>

                `;


                container.appendChild(result);

            });


            /* ===== CERTIFICATES ===== */

            certificateMatches.forEach(function(certificate) {

                const result =
                    document.createElement("div");


                result.className =
                    "search-result";


                result.innerHTML = `

                    <strong>
                        📄 ${certificate.resident}
                        <span style="font-weight: normal; font-size: 12px; color: #6b7280;">
                            — ${certificate.type}
                        </span>
                    </strong>

                    <span>

                        ID: ${certificate.id}<br>

                        Date Issued: ${certificate.date}<br>

                        Purpose: ${certificate.purpose}

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

        showToast(
            "info",
            "No Residents",
            "There are no residents to update yet."
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

        showToast(
            "error",
            "Not Found",
            "No resident matched that name."
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

let statusChartInstance = null;
let ageChartInstance = null;
let positionChartInstance = null;
let certChartInstance = null;


function renderReports() {

    if (typeof Chart === "undefined") {

        return;

    }


    /* ===== RESIDENTS BY STATUS ===== */

    const activeCount =
        residents.filter(function(r) {
            return r.status === "Active";
        }).length;

    const inactiveCount =
        residents.filter(function(r) {
            return r.status === "Inactive";
        }).length;


    if (statusChartInstance) {
        statusChartInstance.destroy();
    }

    statusChartInstance = new Chart(
        document.getElementById("statusChart"),
        {
            type: "doughnut",
            data: {
                labels: ["Active", "Inactive"],
                datasets: [{
                    data: [activeCount, inactiveCount],
                    backgroundColor: ["#22c55e", "#ef4444"]
                }]
            },
            options: {
                plugins: {
                    legend: { position: "bottom" }
                }
            }
        }
    );


    /* ===== RESIDENTS BY AGE GROUP ===== */

    const ageGroups = {
        "0-17": 0,
        "18-30": 0,
        "31-50": 0,
        "51-65": 0,
        "65+": 0
    };

    residents.forEach(function(resident) {

        const age =
            parseInt(resident.age, 10) || 0;

        if (age <= 17) ageGroups["0-17"]++;
        else if (age <= 30) ageGroups["18-30"]++;
        else if (age <= 50) ageGroups["31-50"]++;
        else if (age <= 65) ageGroups["51-65"]++;
        else ageGroups["65+"]++;

    });


    if (ageChartInstance) {
        ageChartInstance.destroy();
    }

    ageChartInstance = new Chart(
        document.getElementById("ageChart"),
        {
            type: "bar",
            data: {
                labels: Object.keys(ageGroups),
                datasets: [{
                    label: "Residents",
                    data: Object.values(ageGroups),
                    backgroundColor: "#1a56db"
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 } }
                }
            }
        }
    );


    /* ===== OFFICIALS BY POSITION ===== */

    const positionCounts = {};

    officials.forEach(function(official) {

        positionCounts[official.position] =
            (positionCounts[official.position] || 0) + 1;

    });


    if (positionChartInstance) {
        positionChartInstance.destroy();
    }

    positionChartInstance = new Chart(
        document.getElementById("positionChart"),
        {
            type: "bar",
            data: {
                labels: Object.keys(positionCounts),
                datasets: [{
                    label: "Officials",
                    data: Object.values(positionCounts),
                    backgroundColor: "#f59e0b"
                }]
            },
            options: {
                indexAxis: "y",
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true, ticks: { precision: 0 } }
                }
            }
        }
    );


    /* ===== CERTIFICATES BY TYPE ===== */

    const certCounts = {};

    certificates.forEach(function(certificate) {

        certCounts[certificate.type] =
            (certCounts[certificate.type] || 0) + 1;

    });


    if (certChartInstance) {
        certChartInstance.destroy();
    }

    certChartInstance = new Chart(
        document.getElementById("certChart"),
        {
            type: "pie",
            data: {
                labels: Object.keys(certCounts),
                datasets: [{
                    data: Object.values(certCounts),
                    backgroundColor: [
                        "#1a56db", "#22c55e", "#f59e0b",
                        "#ef4444", "#8b5cf6", "#0ea5e9"
                    ]
                }]
            },
            options: {
                plugins: { legend: { position: "bottom" } }
            }
        }
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
        function() {

            document
                .querySelector('.side-link[data-page="reports"]')
                .click();

        }
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


                const reportsPageSection =
                    document.getElementById("reportsPage");


                dashboardContentSection.style.display = "none";
                residentsPageSection.style.display = "none";
                reportsPageSection.style.display = "none";


                if (page === "residents" || page === "records") {

                    residentsPageSection.style.display = "block";

                    document.getElementById(
                        "residentsPageSearch"
                    ).value = "";

                    renderResidentsPage("");

                } else if (page === "reports") {

                    reportsPageSection.style.display = "block";

                    renderReports();

                } else {

                    dashboardContentSection.style.display = "block";

                }

            }
        );

    }
);


const dashboardContentSection =
    document.getElementById("mainDashboardContent");

const residentsPageSection =
    document.getElementById("residentsPage");


document
    .getElementById("residentsPageSearch")
    .addEventListener(
        "input",
        function() {

            renderResidentsPage(this.value);

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

            document
                .querySelectorAll(".side-link, .top-link")
                .forEach(function(item) {

                    item.classList.remove("active");

                });

            document
                .querySelectorAll('[data-page="residents"]')
                .forEach(function(item) {

                    item.classList.add("active");

                });


            dashboardContentSection.style.display = "none";

            residentsPageSection.style.display = "block";

            document.getElementById(
                "residentsPageSearch"
            ).value = "";

            renderResidentsPage("");

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

                localStorage.removeItem("brrmsUser");

                window.location.href = "login.html";

            }

        }
    );


/* =========================================================
   DOCUMENT REQUESTS
   Corresponds to document_requests table
   ========================================================= */

const defaultRequests = [
    { id: "REQ-001", resident: "Juan Dela Cruz", type: "Barangay Clearance", date: "Aug. 18, 2026", status: "Completed" },
    { id: "REQ-002", resident: "Maria Santos", type: "Certificate of Residency", date: "Aug. 18, 2026", status: "Pending" },
    { id: "REQ-003", resident: "Pedro Garcia", type: "Barangay Indigency", date: "Aug. 19, 2026", status: "Completed" },
    { id: "REQ-004", resident: "Ana Reyes", type: "Barangay Clearance", date: "Aug. 19, 2026", status: "Processing" },
    { id: "REQ-005", resident: "Carlo Mendoza", type: "Certificate of Residency", date: "Aug. 20, 2026", status: "Pending" }
];

let documentRequests =
    JSON.parse(localStorage.getItem("brrmsRequests")) || defaultRequests;


function saveRequestsData() {

    localStorage.setItem(
        "brrmsRequests",
        JSON.stringify(documentRequests)
    );

}


function requestStatusClass(status) {

    if (status === "Completed") return "completed-status";
    if (status === "Processing") return "processing-status";
    return "pending-status";

}


function renderRequestsTable() {

    const requestTable =
        document.getElementById("requestTable");

    if (!requestTable) {

        return;

    }


    requestTable.innerHTML = "";


    if (documentRequests.length === 0) {

        requestTable.innerHTML = `
            <tr>
                <td colspan="6" class="empty-row">
                    <span class="empty-state-icon">🗂️</span>
                    No document requests yet.
                </td>
            </tr>
        `;

        return;

    }


    documentRequests.forEach(function(request) {

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>${request.id}</td>

            <td>${request.resident}</td>

            <td>${request.type}</td>

            <td>${request.date}</td>

            <td>
                <span class="status ${requestStatusClass(request.status)}">
                    ${request.status}
                </span>
            </td>

            <td class="row-actions">
                <button type="button" class="row-edit-btn request-edit-btn" data-id="${request.id}" title="Edit">
                    ✎
                </button>
                <button type="button" class="row-delete-btn request-delete-btn" data-id="${request.id}" title="Delete">
                    🗑
                </button>
            </td>

        `;

        requestTable.appendChild(row);

    });

}


function generateRequestID() {

    return "REQ-" +
        String(documentRequests.length + 1)
        .padStart(3, "0");

}


const requestModal =
    document.getElementById("requestModal");

const requestForm =
    document.getElementById("requestForm");

const addRequestBtn =
    document.getElementById("addRequestBtn");

const closeRequest =
    document.getElementById("closeRequest");


if (requestModal && requestForm && addRequestBtn && closeRequest) {

    renderRequestsTable();


    /* OPEN ADD MODAL */

    addRequestBtn.addEventListener("click", function() {

        requestForm.reset();

        document.getElementById("requestEditId").value = "";

        document.getElementById("requestModalTitle").textContent =
            "Add Document Request";

        requestModal.classList.add("show");

    });


    /* CLOSE MODAL */

    closeRequest.addEventListener("click", function() {

        requestModal.classList.remove("show");

    });


    requestModal.addEventListener("click", function(event) {

        if (event.target === requestModal) {

            requestModal.classList.remove("show");

        }

    });


    /* EDIT / DELETE (event delegation) */

    document
        .getElementById("requestTable")
        .addEventListener("click", function(event) {

            const editBtn =
                event.target.closest(".request-edit-btn");

            const deleteBtn =
                event.target.closest(".request-delete-btn");


            if (editBtn) {

                const request =
                    documentRequests.find(function(item) {
                        return item.id === editBtn.dataset.id;
                    });

                if (!request) return;

                document.getElementById("requestEditId").value =
                    request.id;

                document.getElementById("requestResident").value =
                    request.resident;

                document.getElementById("requestType").value =
                    request.type;

                document.getElementById("requestStatus").value =
                    request.status;

                const parsedDate =
                    new Date(request.date);

                if (!isNaN(parsedDate)) {

                    const iso =
                        parsedDate.toISOString().split("T")[0];

                    document.getElementById("requestDate").value =
                        iso;

                }

                document.getElementById("requestModalTitle").textContent =
                    "Edit Document Request";

                requestModal.classList.add("show");

            }


            if (deleteBtn) {

                const request =
                    documentRequests.find(function(item) {
                        return item.id === deleteBtn.dataset.id;
                    });

                if (!request) return;

                const confirmDelete =
                    confirm(
                        `Delete the ${request.type} request for ${request.resident}?`
                    );

                if (!confirmDelete) return;

                documentRequests =
                    documentRequests.filter(function(item) {
                        return item.id !== deleteBtn.dataset.id;
                    });

                logActivity(
                    "🗂️",
                    `deleted a document request for <strong>${request.resident}</strong>`
                );

                saveRequestsData();
                renderRequestsTable();

            }

        });


    /* SUBMIT FORM (add or edit) */

    requestForm.addEventListener("submit", function(event) {

        event.preventDefault();


        if (!requestForm.checkValidity()) {

            requestForm.reportValidity();

            return;

        }


        const editId =
            document.getElementById("requestEditId").value;

        const resident =
            document.getElementById("requestResident").value.trim();

        const type =
            document.getElementById("requestType").value;

        const status =
            document.getElementById("requestStatus").value;

        const dateInput =
            document.getElementById("requestDate").value;

        const formattedDate =
            dateInput
                ? new Date(dateInput + "T00:00:00").toLocaleDateString(
                      "en-US",
                      { month: "short", day: "2-digit", year: "numeric" }
                  )
                : new Date().toLocaleDateString(
                      "en-US",
                      { month: "short", day: "2-digit", year: "numeric" }
                  );


        if (editId) {

            const request =
                documentRequests.find(function(item) {
                    return item.id === editId;
                });

            if (request) {

                request.resident = resident;
                request.type = type;
                request.status = status;
                request.date = formattedDate;

                logActivity(
                    "🗂️",
                    `updated a document request for <strong>${resident}</strong>`
                );

            }

        } else {

            documentRequests.push({
                id: generateRequestID(),
                resident: resident,
                type: type,
                date: formattedDate,
                status: status
            });

            logActivity(
                "🗂️",
                `added a new document request for <strong>${resident}</strong>`
            );

        }


        saveRequestsData();
        renderRequestsTable();

        requestForm.reset();
        requestModal.classList.remove("show");

        showToast(
            "success",
            editId ? "Request Updated" : "Request Added",
            editId
                ? "The document request has been updated."
                : "The new document request has been saved."
        );

    });

}


/* =========================================================
   TASK 5 - FORM 1
   ADD BARANGAY OFFICIAL
   Corresponds to barangay_officials table
   ========================================================= */

const defaultOfficials = [
    { id: "OFF-001", name: "Roberto Santos", position: "Barangay Captain", contact: "0917-123-4567", term: "2023-2026" },
    { id: "OFF-002", name: "Elena Cruz", position: "Kagawad", contact: "0918-234-5678", term: "2023-2026" },
    { id: "OFF-003", name: "Mark Reyes", position: "Kagawad", contact: "0919-345-6789", term: "2023-2026" },
    { id: "OFF-004", name: "Linda Garcia", position: "Secretary", contact: "0920-456-7890", term: "2023-2026" },
    { id: "OFF-005", name: "Joseph Dela Cruz", position: "Treasurer", contact: "0921-567-8901", term: "2023-2026" }
];

let officials =
    JSON.parse(localStorage.getItem("brrmsOfficials")) || defaultOfficials;


function saveOfficialsData() {

    localStorage.setItem(
        "brrmsOfficials",
        JSON.stringify(officials)
    );

}


let currentlyEditingOfficialId = null;


function renderOfficialsTable() {

    officialTable.innerHTML = "";


    if (officials.length === 0) {

        officialTable.innerHTML = `
            <tr>
                <td colspan="6" class="empty-row">
                    <span class="empty-state-icon">🏛️</span>
                    No officials recorded yet.
                </td>
            </tr>
        `;

        return;

    }


    officials.forEach(function(official) {

        const row =
            document.createElement("tr");

        if (official.id === currentlyEditingOfficialId) {

            row.classList.add("row-editing");

        }

        row.innerHTML = `

            <td>${official.id}</td>

            <td>${official.name}</td>

            <td>${official.position}</td>

            <td>${official.contact}</td>

            <td>${official.term}</td>

            <td class="row-actions">
                <button type="button" class="row-edit-btn" data-id="${official.id}" title="Edit">
                    ✎
                </button>
                <button type="button" class="row-delete-btn" data-id="${official.id}" title="Delete">
                    🗑
                </button>
            </td>

        `;

        officialTable.appendChild(row);

    });

}


/* =========================
   TASK 8 - EDIT / DELETE OFFICIAL
   ========================= */

function openEditOfficialModal(id) {

    const official =
        officials.find(function(item) {

            return item.id === id;

        });


    if (!official) {

        return;

    }


    currentlyEditingOfficialId = id;


    document.getElementById("officialEditId").value =
        official.id;

    document.getElementById("officialCode").value =
        official.id;

    document.getElementById("officialName").value =
        official.name;

    document.getElementById("officialPosition").value =
        official.position;

    document.getElementById("officialContact").value =
        official.contact;

    document.getElementById("officialTerm").value =
        official.term;

    document.getElementById("officialModalTitle").textContent =
        "Edit Official";

    document.getElementById("officialSaveBtn").textContent =
        "Save Changes";


    renderOfficialsTable();

    officialModal.classList.add("show");

}


function deleteOfficial(id) {

    const official =
        officials.find(function(item) {

            return item.id === id;

        });


    if (!official) {

        return;

    }


    const confirmDelete =
        confirm(
            `Delete ${official.name}'s record? This cannot be undone.`
        );


    if (!confirmDelete) {

        return;

    }


    officials =
        officials.filter(function(item) {

            return item.id !== id;

        });


    logActivity(
        "🗑",
        `removed official <strong>${official.name}</strong>`
    );

    saveOfficialsData();

    renderOfficialsTable();

    showToast(
        "success",
        "Official Removed",
        `${official.name} has been deleted.`
    );

}


function generateOfficialID() {

    return "OFF-" +
        String(officials.length + 1)
        .padStart(3, "0");

}

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

    renderOfficialsTable();


    /* OPEN FORM */

    addOfficialBtn.addEventListener(
        "click",
        function() {

            officialForm.reset();

            currentlyEditingOfficialId = null;

            document.getElementById("officialEditId").value = "";

            document.getElementById("officialCode").value =
                generateOfficialID();

            document.getElementById("officialModalTitle").textContent =
                "Add Barangay Official";

            document.getElementById("officialSaveBtn").textContent =
                "Add Official";

            officialModal.classList.add("show");

        }
    );


    /* CLOSE FORM */

    closeOfficial.addEventListener(
        "click",
        function() {

            officialModal.classList.remove("show");

            currentlyEditingOfficialId = null;

            renderOfficialsTable();

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

                currentlyEditingOfficialId = null;

                renderOfficialsTable();

            }

        }
    );


    /* ROW ACTIONS: EDIT / DELETE */

    officialTable.addEventListener(
        "click",
        function(event) {

            const editBtn =
                event.target.closest(".row-edit-btn");

            const deleteBtn =
                event.target.closest(".row-delete-btn");


            if (editBtn) {

                openEditOfficialModal(editBtn.dataset.id);

            }


            if (deleteBtn) {

                deleteOfficial(deleteBtn.dataset.id);

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


            const editId =
                document
                    .getElementById(
                        "officialEditId"
                    )
                    .value;


            /* =====================
               UPDATE EXISTING
               ===================== */

            if (editId) {

                const official =
                    officials.find(function(item) {

                        return item.id === editId;

                    });


                if (official) {

                    official.id = code;

                    official.name = name;

                    official.position = position;

                    official.contact = contact;

                    official.term = term;


                    logActivity(
                        "✎",
                        `updated official <strong>${name}</strong>'s record`
                    );

                }

            } else {

                /* =====================
                   ADD NEW
                   ===================== */

                officials.push({
                    id: code,
                    name: name,
                    position: position,
                    contact: contact,
                    term: term
                });

                logActivity(
                    "🏛️",
                    `added new official <strong>${name}</strong> (${position})`
                );

            }

            saveOfficialsData();

            currentlyEditingOfficialId = null;

            renderOfficialsTable();


            /* RESET */

            officialForm.reset();


            officialModal.classList.remove(
                "show"
            );


            showToast(
                "success",
                editId ? "Official Updated" : "Official Added",
                editId
                    ? "The official's information has been updated."
                    : "The new barangay official has been saved."
            );

        }
    );

}


/* =========================================================
   TASK 5 - FORM 2
   ADD BARANGAY CERTIFICATE
   Corresponds to certificates table
   ========================================================= */

const defaultCertificates = [
    { id: "CERT-001", resident: "Juan Dela Cruz", type: "Certificate of Residency", date: "Aug 15, 2026", purpose: "Employment" },
    { id: "CERT-002", resident: "Maria Santos", type: "Barangay Clearance", date: "Aug 16, 2026", purpose: "Employment" },
    { id: "CERT-003", resident: "Pedro Garcia", type: "Certificate of Indigency", date: "Aug 17, 2026", purpose: "Financial Assistance" },
    { id: "CERT-004", resident: "Ana Reyes", type: "Certificate of Residency", date: "Aug 18, 2026", purpose: "School Requirement" },
    { id: "CERT-005", resident: "Carlo Mendoza", type: "Barangay Clearance", date: "Aug 19, 2026", purpose: "Business Requirement" }
];

let certificates =
    JSON.parse(localStorage.getItem("brrmsCertificates")) || defaultCertificates;


function saveCertificatesData() {

    localStorage.setItem(
        "brrmsCertificates",
        JSON.stringify(certificates)
    );

}


let currentlyEditingCertificateId = null;


function toDateInputValue(displayDate) {

    const parsed =
        new Date(displayDate);


    if (Number.isNaN(parsed.getTime())) {

        return "";

    }


    const year = parsed.getFullYear();

    const month =
        String(parsed.getMonth() + 1)
        .padStart(2, "0");

    const day =
        String(parsed.getDate())
        .padStart(2, "0");


    return `${year}-${month}-${day}`;

}


function renderCertificatesTable() {

    certificateTable.innerHTML = "";


    if (certificates.length === 0) {

        certificateTable.innerHTML = `
            <tr>
                <td colspan="6" class="empty-row">
                    <span class="empty-state-icon">📄</span>
                    No certificates recorded yet.
                </td>
            </tr>
        `;

        return;

    }


    certificates.forEach(function(certificate) {

        const row =
            document.createElement("tr");

        if (certificate.id === currentlyEditingCertificateId) {

            row.classList.add("row-editing");

        }

        row.innerHTML = `

            <td>${certificate.id}</td>

            <td>${certificate.resident}</td>

            <td>${certificate.type}</td>

            <td>${certificate.date}</td>

            <td>${certificate.purpose}</td>

            <td class="row-actions">
                <button type="button" class="row-edit-btn" data-id="${certificate.id}" title="Edit">
                    ✎
                </button>
                <button type="button" class="row-delete-btn" data-id="${certificate.id}" title="Delete">
                    🗑
                </button>
                <button type="button" class="row-print-btn" data-id="${certificate.id}" title="Print">
                    🖨
                </button>
            </td>

        `;

        certificateTable.appendChild(row);

    });

}


certificateTable.addEventListener(
    "click",
    function(event) {

        const printBtn =
            event.target.closest(".row-print-btn");

        const editBtn =
            event.target.closest(".row-edit-btn");

        const deleteBtn =
            event.target.closest(".row-delete-btn");


        if (printBtn) {

            printCertificate(printBtn.dataset.id);

        }


        if (editBtn) {

            openEditCertificateModal(editBtn.dataset.id);

        }


        if (deleteBtn) {

            deleteCertificate(deleteBtn.dataset.id);

        }

    }
);


/* =========================
   TASK 8 - EDIT / DELETE CERTIFICATE
   ========================= */

function openEditCertificateModal(id) {

    const certificate =
        certificates.find(function(item) {

            return item.id === id;

        });


    if (!certificate) {

        return;

    }


    currentlyEditingCertificateId = id;


    document.getElementById("certificateEditId").value =
        certificate.id;

    document.getElementById("certificateCode").value =
        certificate.id;

    document.getElementById("certificateResident").value =
        certificate.resident;

    document.getElementById("certificateType").value =
        certificate.type;

    document.getElementById("certificateDate").value =
        toDateInputValue(certificate.date);

    document.getElementById("certificatePurpose").value =
        certificate.purpose;

    document.getElementById("certificateModalTitle").textContent =
        "Edit Certificate";

    document.getElementById("certificateSaveBtn").textContent =
        "Save Changes";


    renderCertificatesTable();

    certificateModal.classList.add("show");

}


function deleteCertificate(id) {

    const certificate =
        certificates.find(function(item) {

            return item.id === id;

        });


    if (!certificate) {

        return;

    }


    const confirmDelete =
        confirm(
            `Delete the ${certificate.type} certificate for ${certificate.resident}? This cannot be undone.`
        );


    if (!confirmDelete) {

        return;

    }


    certificates =
        certificates.filter(function(item) {

            return item.id !== id;

        });


    logActivity(
        "🗑",
        `removed a <strong>${certificate.type}</strong> certificate for ${certificate.resident}`
    );

    saveCertificatesData();

    renderCertificatesTable();

    showToast(
        "success",
        "Certificate Removed",
        "The certificate record has been deleted."
    );

}


function printCertificate(id) {

    const certificate =
        certificates.find(function(item) {

            return item.id === id;

        });


    if (!certificate) {

        return;

    }


    const printWindow =
        window.open("", "_blank", "width=850,height=700");


    const issuedDate =
        certificate.date;


    /* =========================
       PULL REAL OFFICIALS DATA
       ========================= */

    const captain =
        officials.find(function(item) {

            return item.position === "Barangay Captain";

        });

    const captainName =
        captain ? captain.name : "Barangay Captain";

    const councilors =
        officials.filter(function(item) {

            return item.position !== "Barangay Captain";

        });

    const councilorsHTML =
        councilors.length > 0
            ? councilors.map(function(item) {

                return `
                    <li>
                        <strong>${item.name}</strong>
                        <span>${item.position}</span>
                    </li>
                `;

            }).join("")
            : `<li><span>No additional officials on record.</span></li>`;


    /* =========================
       SEAL (drawn in SVG, no
       external image needed)
       ========================= */

    const rayAngles =
        [0, 45, 90, 135, 180, 225, 270, 315];

    const raysHTML =
        rayAngles.map(function(angle) {

            return `<polygon points="50,6 55,22 45,22" fill="#f5b301" transform="rotate(${angle} 50 50)"></polygon>`;

        }).join("");

    const sealSVG = `
        <svg width="86" height="86" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="47" fill="none" stroke="#12203b" stroke-width="2"></circle>
            <circle cx="50" cy="50" r="39" fill="none" stroke="#f5b301" stroke-width="1"></circle>
            <g>${raysHTML}</g>
            <circle cx="50" cy="50" r="15" fill="#12203b"></circle>
            <text x="50" y="54" text-anchor="middle" font-size="11" fill="#fff" font-family="Georgia, serif" font-weight="bold">BC</text>
        </svg>
    `;


    printWindow.document.write(`

        <html>
        <head>
            <title>${certificate.type} - ${certificate.resident}</title>
            <style>
                * {
                    box-sizing: border-box;
                }
                body {
                    font-family: Georgia, 'Times New Roman', serif;
                    padding: 50px 60px;
                    color: #12203b;
                }
                .letterhead {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 18px;
                    text-align: center;
                    border-bottom: 2px solid #12203b;
                    padding-bottom: 16px;
                    margin-bottom: 24px;
                }
                .letterhead .small {
                    margin: 1px 0;
                    font-size: 11.5px;
                    color: #555;
                }
                .letterhead h2 {
                    margin: 3px 0;
                    letter-spacing: 2px;
                    font-size: 22px;
                }
                .letterhead .office-line {
                    font-size: 12.5px;
                    font-style: italic;
                    color: #333;
                }
                .page {
                    display: flex;
                    gap: 34px;
                }
                .officials-col {
                    width: 190px;
                    flex-shrink: 0;
                    font-size: 12px;
                    border-right: 1px solid #d6dce5;
                    padding-right: 20px;
                }
                .officials-col .captain-name {
                    font-weight: bold;
                    font-size: 13px;
                }
                .officials-col .captain-title {
                    font-size: 11px;
                    color: #555;
                    margin-bottom: 14px;
                }
                .officials-col .councilors-heading {
                    font-size: 11px;
                    font-weight: bold;
                    letter-spacing: 0.5px;
                    color: #555;
                    margin-bottom: 6px;
                }
                .officials-col ul {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                }
                .officials-col li {
                    margin-bottom: 10px;
                    line-height: 1.4;
                }
                .officials-col li strong {
                    display: block;
                    font-size: 12px;
                }
                .officials-col li span {
                    display: block;
                    font-size: 10.5px;
                    color: #666;
                }
                .body-col {
                    flex: 1;
                }
                .title-wrap {
                    text-align: center;
                }
                .title {
                    display: inline-block;
                    font-size: 22px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin: 6px 0 34px;
                    border-bottom: 2px solid #12203b;
                    padding-bottom: 6px;
                }
                .body-text {
                    font-size: 15px;
                    line-height: 2;
                    margin: 20px 0;
                    text-align: justify;
                }
                .signature {
                    margin-top: 70px;
                    display: flex;
                    justify-content: flex-end;
                }
                .signature div {
                    text-align: center;
                }
                .signature .name {
                    font-weight: bold;
                    margin-bottom: 2px;
                }
                .signature .line {
                    border-top: 1px solid #12203b;
                    width: 230px;
                    margin: 40px 0 6px;
                }
                .cert-id {
                    margin-top: 50px;
                    font-size: 11px;
                    color: #999;
                }
            </style>
        </head>
        <body>

            <div class="letterhead">
                ${sealSVG}
                <div>
                    <p class="small">Republic of the Philippines</p>
                    <p class="small">General Santos City</p>
                    <h2>BARANGAY CONEL</h2>
                    <p class="office-line">Office of the Punong Barangay</p>
                </div>
            </div>

            <div class="page">

                <div class="officials-col">
                    <div class="captain-name">HON. ${captainName}</div>
                    <div class="captain-title">Barangay Captain</div>
                    <div class="councilors-heading">COUNCILORS</div>
                    <ul>
                        ${councilorsHTML}
                    </ul>
                </div>

                <div class="body-col">

                    <div class="title-wrap">
                        <div class="title">${certificate.type}</div>
                    </div>

                    <div class="body-text">
                        This is to certify that <strong>${certificate.resident}</strong>
                        is a bona fide resident of Barangay Conel, and this certificate
                        is being issued upon the request of the above-named person for
                        the purpose of <strong>${certificate.purpose}</strong>.
                        <br><br>
                        Issued this ${issuedDate} at Barangay Conel, General Santos City,
                        Philippines.
                    </div>

                    <div class="signature">
                        <div>
                            <div class="line"></div>
                            <div class="name">HON. ${captainName}</div>
                            Punong Barangay
                        </div>
                    </div>

                    <div class="cert-id">
                        Certificate ID: ${certificate.id}
                    </div>

                </div>

            </div>

        </body>
        </html>

    `);


    printWindow.document.close();

    printWindow.focus();


    setTimeout(function() {

        printWindow.print();

    }, 300);

}


function generateCertificateID() {

    return "CERT-" +
        String(certificates.length + 1)
        .padStart(3, "0");

}

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

    renderCertificatesTable();


    /* OPEN FORM */

    addCertificateBtn.addEventListener(
        "click",
        function() {

            certificateForm.reset();

            currentlyEditingCertificateId = null;

            document.getElementById("certificateEditId").value = "";

            document.getElementById("certificateCode").value =
                generateCertificateID();

            document.getElementById("certificateModalTitle").textContent =
                "Add Barangay Certificate";

            document.getElementById("certificateSaveBtn").textContent =
                "Add Certificate";

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

            currentlyEditingCertificateId = null;

            renderCertificatesTable();

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

                currentlyEditingCertificateId = null;

                renderCertificatesTable();

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


            const editId =
                document
                    .getElementById(
                        "certificateEditId"
                    )
                    .value;


            /* =====================
               UPDATE EXISTING
               ===================== */

            if (editId) {

                const certificate =
                    certificates.find(function(item) {

                        return item.id === editId;

                    });


                if (certificate) {

                    certificate.id = code;

                    certificate.resident = resident;

                    certificate.type = type;

                    certificate.date = formattedDate;

                    certificate.purpose = purpose;


                    logActivity(
                        "✎",
                        `updated a <strong>${type}</strong> certificate for ${resident}`
                    );

                }

            } else {

                /* =====================
                   ADD NEW
                   ===================== */

                certificates.push({
                    id: code,
                    resident: resident,
                    type: type,
                    date: formattedDate,
                    purpose: purpose
                });

                logActivity(
                    "📄",
                    `issued a <strong>${type}</strong> for ${resident}`
                );

            }

            saveCertificatesData();

            currentlyEditingCertificateId = null;

            renderCertificatesTable();


            /* RESET FORM */

            certificateForm.reset();


            certificateModal.classList.remove(
                "show"
            );


            showToast(
                "success",
                editId ? "Certificate Updated" : "Certificate Added",
                editId
                    ? "The certificate has been updated."
                    : "The new certificate has been saved."
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


        if (profileModal) {

            profileModal.classList.remove(
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
    document.getElementById("certificateForm"),
    document.getElementById("requestForm")
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