const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || ''
});

connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'siad_db'}\``, (err) => {
    if (err) {
        console.error('❌ Erreur lors de la création de la base de données:', err.message);
    } else {
        console.log(`✅ Base de données "${process.env.DB_NAME || 'siad_db'}" créée ou déjà existante.`);
    }
    connection.end();
});
