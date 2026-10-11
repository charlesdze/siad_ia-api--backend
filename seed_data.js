const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        const password = await bcrypt.hash('12345678', 10);

        // Configuration des départements avec abréviations pour les emails
        const departments = [
            { name: 'RH', alias: 'rh' },
            { name: 'Informatique', alias: 'info' },
            { name: 'Finance', alias: 'fin' },
            { name: 'Ventes', alias: 'ventes' },
            { name: 'Communication', alias: 'comm' }
        ];

        console.log('🚀 Réinitialisation et peuplement avec emails courts...');

        // 1. Création de l'ADMINISTRATEUR Système (Le vrai !)
        await db.query(
            'INSERT IGNORE INTO users (name, email, password, role, service) VALUES (?, ?, ?, ?, ?)',
            ['Admin SIAD', 'admin.system@gmail.com', password, 'ADMIN', 'Administration']
        );

        for (const dept of departments) {
            // 2. Création d'un Manager par département
            await db.query(
                'INSERT IGNORE INTO users (name, email, password, role, service) VALUES (?, ?, ?, ?, ?)',
                [`Manager ${dept.name}`, `manager.${dept.alias}@gmail.com`, password, 'MANAGER', dept.name]
            );

            // 3. Création de 2 employés par département
            for (let i = 1; i <= 2; i++) {
                await db.query(
                    'INSERT IGNORE INTO users (name, email, password, role, service) VALUES (?, ?, ?, ?, ?)',
                    [`Employé ${i} ${dept.name}`, `emp${i}.${dept.alias}@gmail.com`, password, 'EMPLOYE', dept.name]
                );
            }
        }

        console.log('✅ Base de données mise à jour : Admin, Managers et Employés créés !');
        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur de seeding:', err.message);
        process.exit(1);
    }
}

seed();
