const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        const hashedPassword = await bcrypt.hash('12345678', 10);
        const query = 'INSERT INTO users (name, email, password, role, service) VALUES (?, ?, ?, ?, ?)';
        await db.query(query, ['Admin', 'admin@mail.com', hashedPassword, 'PDG', 'Direction Générale']);
        console.log('✅ Utilisateur admin@mail.com créé avec succès !');
        process.exit(0);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            console.log('ℹ️ L\'utilisateur existe déjà.');
        } else {
            console.error('❌ Erreur:', err.message);
        }
        process.exit(1);
    }
}

seed();
