const db = require('./config/db');

async function check() {
    try {
        const [rows] = await db.query('SELECT name, email, role FROM users');
        console.log('--- Liste des utilisateurs ---');
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error('Erreur:', err.message);
        process.exit(1);
    }
}

check();
