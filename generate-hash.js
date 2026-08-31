const bcrypt = require("bcrypt");

async function generateHashes() {

    const adminHash = await bcrypt.hash("admin123", 10);
    const staffHash = await bcrypt.hash("staff123", 10);

    console.log("\nADMIN PASSWORD HASH:");
    console.log(adminHash);

    console.log("\nSTAFF PASSWORD HASH:");
    console.log(staffHash);

}

generateHashes();