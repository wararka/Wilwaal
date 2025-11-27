// utils/fileHandler.js

const fs = require('fs');
const path = require('path');

// Goobta kaydka userka
const USERS_FILE = path.join(__dirname, '../data/users.json');

/**
 * Akhri xogta userka ee users.json
 * @returns {Array<Object>} Liiska isticmaalayaasha
 */
function getUsers() {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        // Hubi haddii faylku madhan yahay oo celiso liis faaruq ah
        return data ? JSON.parse(data) : [];
    } catch (error) {
        // Haddii faylku aanu jirin ama aan la akhrin karin
        if (error.code === 'ENOENT') {
            console.log("Faylka users.json lama helin, waxaana la abuurayaa mid cusub.");
            return [];
        }
        console.error("Khalad ku yimid akhrinta users.json:", error);
        return [];
    }
}

/**
 * Ku qor xogta cusub users.json
 * @param {Array<Object>} users - Liiska cusub ee isticmaalayaasha
 */
function saveUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 4), 'utf8');
    } catch (error) {
        console.error("Khalad ku yimid qorista users.json:", error);
    }
}

module.exports = {
    getUsers,
    saveUsers
};