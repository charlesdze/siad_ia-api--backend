const mysql = require('mysql2');
require('dotenv').config();

// Utilisation d'un Pool pour éviter les déconnexions intempestives et accélérer les requêtes
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'siad_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Vérification de la connexion et création automatique des tables au démarrage
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Erreur de connexion à MySQL (Pool):', err.message);
        return;
    }
    console.log('✅ Connecté avec succès au Pool de la base de données MySQL (XAMPP)');
    
    // 1. REQUÊTE TABLE MESSAGES
    const createMessagesTableQuery = `
        CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender_name VARCHAR(255) NOT NULL,
            sender_role VARCHAR(255) NOT NULL,
            department VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            status VARCHAR(255) DEFAULT 'EN_ATTENTE_DEPARTEMENT',
            reply TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    
    // 2. REQUÊTE TABLE USERS
    const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL,
            service VARCHAR(255) NOT NULL,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    // 3. REQUÊTE TABLE DEPARTMENTS
    const createDepartmentsTableQuery = `
        CREATE TABLE IF NOT EXISTS departments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    // Exécution de la création de la table messages
    connection.query(createMessagesTableQuery, (err) => {
        if (err) {
            console.error('❌ Erreur lors de la création de la table messages:', err.message);
            connection.release();
            return;
        }
        console.log('ℹ️ Table "messages" vérifiée et opérationnelle.');

        connection.query(createUsersTableQuery, (err) => {
            if (err) {
                console.error('❌ Erreur lors de la création de la table users:', err.message);
                connection.release();
                return;
            }
            console.log('ℹ️ Table "users" vérifiée et opérationnelle.');

            connection.query(createDepartmentsTableQuery, (err) => {
                connection.release();
                if (err) {
                    console.error('❌ Erreur lors de la création de la table departments:', err.message);
                } else {
                    console.log('ℹ️ Table "departments" vérifiée et opérationnelle.');
                }
            });
        });
    });
});

// Exportation de la version promise-based pour un code asynchrone moderne et rapide
module.exports = pool.promise();