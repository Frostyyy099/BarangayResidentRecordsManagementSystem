console.log("BRRMS SERVER STARTED");

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3000;

app.use(express.static(__dirname));
app.use(cors());
app.use(express.json());

// =========================
// MYSQL CONNECTION
// =========================

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Licayankim19!",
    database: "brrms_db"
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        return;
    }

    console.log("Connected to MySQL database!");
});

// =========================
// TEST ROUTE
// =========================

app.get("/", (req, res) => {
    res.send("BRRMS Server is running!");
});

// =========================
// SIGN UP
// =========================

app.post("/api/signup", async (req, res) => {

    const { full_name, username, password } = req.body;

    if (!full_name || !username || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }

    try {

        const checkSql = "SELECT * FROM users WHERE username = ?";

        db.query(checkSql, [username], async (err, results) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }

            if (results.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Username already exists."
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const insertSql = `
                INSERT INTO users
                (full_name, username, password, role, date_created)
                VALUES (?, ?, ?, 'Staff', CURDATE())
            `;

            db.query(
                insertSql,
                [full_name, username, hashedPassword],
                (err, result) => {

                    if (err) {
                        console.error(err);

                        return res.status(500).json({
                            success: false,
                            message: "Could not create account."
                        });
                    }

                    res.status(201).json({
                        success: true,
                        message: "Account created successfully!"
                    });

                }
            );

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

// =========================
// LOGIN
// =========================

app.post("/api/login", (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Username and password are required."
        });
    }

    const sql = `
        SELECT *
        FROM users
        WHERE username = ?
    `;

    db.query(sql, [username], async (err, results) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Database error."
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        const user = results[0];

        try {

            const passwordMatch =
                await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid username or password."
                });
            }

            res.json({
                success: true,
                message: "Login successful!",
                user: {
                    user_id: user.user_id,
                    full_name: user.full_name,
                    username: user.username,
                    role: user.role
                }
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: "Login error."
            });
        }
    });
});

// =========================
// GET RESIDENTS
// =========================

app.get("/api/residents", (req, res) => {

    const sql = `
        SELECT
            resident_id,
            resident_code,
            full_name,
            age,
            address,
            contact,
            status,
            date_added
        FROM residents
        ORDER BY resident_id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Failed to retrieve residents."
            });
        }

        res.json(results);
    });
});

// =========================
// ADD RESIDENT
// =========================

app.post("/api/residents", (req, res) => {

    const {
        full_name,
        age,
        address,
        contact,
        status
    } = req.body;

    if (!full_name || !age || !address || !contact || !status) {
        return res.status(400).json({
            success: false,
            message: "All resident fields are required."
        });
    }

    const residentCode =
        "BRR-" +
        Date.now().toString().slice(-4);

    const sql = `
        INSERT INTO residents
        (resident_code, full_name, age, address, contact, status, date_added)
        VALUES (?, ?, ?, ?, ?, ?, CURDATE())
    `;

    db.query(
        sql,
        [
            residentCode,
            full_name,
            age,
            address,
            contact,
            status
        ],
        (err, result) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to add resident."
                });
            }

            res.status(201).json({
                success: true,
                message: "Resident added successfully!",
                resident_id: result.insertId,
                resident_code: residentCode
            });
        }
    );
});

// =========================
// UPDATE RESIDENT
// =========================

app.put("/api/residents/:id", (req, res) => {

    const residentId = req.params.id;

    const {
        full_name,
        age,
        address,
        contact,
        status
    } = req.body;

    const sql = `
        UPDATE residents
        SET
            full_name = ?,
            age = ?,
            address = ?,
            contact = ?,
            status = ?
        WHERE resident_id = ?
    `;

    db.query(
        sql,
        [
            full_name,
            age,
            address,
            contact,
            status,
            residentId
        ],
        (err, result) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to update resident."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Resident not found."
                });
            }

            res.json({
                success: true,
                message: "Resident updated successfully!"
            });
        }
    );
});

// =========================
// DELETE RESIDENT
// =========================

app.delete("/api/residents/:id", (req, res) => {

    const residentId = req.params.id;

    const sql = `
        DELETE FROM residents
        WHERE resident_id = ?
    `;

    db.query(sql, [residentId], (err, result) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Failed to delete resident."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Resident not found."
            });
        }

        res.json({
            success: true,
            message: "Resident deleted successfully!"
        });
    });
});

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
    console.log(`BRRMS server running at http://localhost:${PORT}`);
});