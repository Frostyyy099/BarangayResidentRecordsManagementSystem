# Barangay Resident Records Management System (BRRMS)

## Project Description

The Barangay Resident Records Management System (BRRMS) is a
web-based system designed to help barangay staff manage resident
records, barangay officials, and issued certificates in one place.

The system replaces manual, paper-based record keeping with a
digital workflow that supports validated data entry, persistent
storage, and full record management (create, view, update, delete),
making resident information faster to search, verify, and maintain.

## Organization

Barangay Office

## Location

General Santos City, Philippines

## System Category

Transaction Processing System (TPS)

## Technologies Used

**Frontend**
- HTML
- CSS
- JavaScript (DOM manipulation, client-side validation)
- Chart.js (dashboard statistics)
- QRCode.js (resident QR codes)

**Backend**
- Node.js
- Express.js
- MySQL

## Main Features

- **Staff Authentication** — login and signup with session handling
- **Resident Records Management** — add, view, search, update, and
  delete resident records
- **Barangay Officials Management** — full CRUD for official records
  (name, position, contact, term)
- **Certificate Issuance** — create and manage barangay certificates
  (Residency, Clearance, Indigency) with printable output
- **Form Validation** — real-time client-side validation with
  inline error messages for all data entry forms
- **Data Persistence** — submitted records are saved and reloaded
  automatically, so data is not lost on page refresh
- **Dynamic Interface Updates** — tables and dashboard update
  instantly via JavaScript DOM manipulation, without reloading the
  page
- **QR Code Generation** — quick lookup of resident records via QR
  code
- **Dashboard Interface** — overview of resident, official, and
  certificate statistics
- **Search** — unified search across residents, officials, and
  certificates

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- [MySQL](https://www.mysql.com/) installed and running

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/FrostyyyO99/BarangayResidentRecordsManagementSystem.git
   cd BarangayResidentRecordsManagementSystem
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up the MySQL database
   - Create a database for the project
   - Update your database connection settings (host, user,
     password, database name) in the server configuration

4. Start the server
   ```bash
   node server.js
   ```

5. Open the app in your browser
   - Navigate to `login.html` (or the address shown in your
     terminal) to log in or create an account

## Developers

- Kim Andre Licayan
- Christian Dave W. Waling
- Amier D. Jalani

## Project Purpose

This project was developed as the final system output for the
Barangay Resident Records Management System, demonstrating form
validation, data storage, dynamic record display, and full CRUD
(Create, Read, Update, Delete) functionality.