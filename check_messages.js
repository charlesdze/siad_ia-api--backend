const db = require('./config/db');

async function check() {
    try {
        const [rows] = await db.query('SELECT * FROM messages');
        console.log('--- Liste des messages ---');
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error('Erreur:', err.message);
        process.exit(1);
    }
}

check();
