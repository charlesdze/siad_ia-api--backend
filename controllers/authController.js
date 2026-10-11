const db = require('../config/db');
const bcrypt = require('bcryptjs');

// 1. INSCRIPTION
exports.register = async (req, res) => {
    try {
        const { username, email, password, role, service } = req.body;

        if (!username || !email || !password || !role) {
            return res.status(400).json({ error: "Champs obligatoires manquants (username, email, password, role)." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // On utilise 'name' pour stocker 'username' pour coller à la structure de db.js
        const query = 'INSERT INTO users (name, email, password, role, service) VALUES (?, ?, ?, ?, ?)';
        await db.query(query, [username, email, hashedPassword, role, service || '']);

        res.status(201).json({ status: 'success', message: "Utilisateur créé avec succès." });
    } catch (err) {
        console.error("❌ Erreur Register:", err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "Cet email est déjà utilisé." });
        }
        res.status(500).json({ error: "Erreur lors de la création du compte." });
    }
};

// 2. CONNEXION
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email et mot de passe requis." });
        }

        const query = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db.query(query, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: "Utilisateur non trouvé." });
        }

        const user = rows[0];

        // Vérification si le compte est actif
        if (user.is_active === 0) {
            return res.status(403).json({ error: "Ce compte a été désactivé par l'administrateur." });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Mot de passe incorrect." });
        }

        res.json({
            status: 'success',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                service: user.service
            }
        });
    } catch (err) {
        console.error("❌ Erreur Login:", err.message);
        res.status(500).json({ error: "Erreur serveur lors de la connexion." });
    }
};

// 3. RÉCUPÉRER TOUS LES UTILISATEURS (Pour l'Admin)
exports.getUsers = async (req, res) => {
    try {
        const query = 'SELECT id, name, email, role, service, is_active FROM users ORDER BY id DESC';
        const [rows] = await db.query(query);
        console.log(`📡 [Backend] getUsers appelé. Nombre d'utilisateurs trouvés: ${rows.length}`);
        res.json(rows);
    } catch (err) {
        console.error("❌ Erreur GetUsers:", err.message);
        res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
    }
};

// 4. ACTIVER / DÉSACTIVER UN UTILISATEUR
exports.toggleUserStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const { is_active } = req.body;

        const query = 'UPDATE users SET is_active = ? WHERE id = ?';
        await db.query(query, [is_active, userId]);

        res.json({ status: 'success', message: `Statut de l'utilisateur mis à jour.` });
    } catch (err) {
        console.error("❌ Erreur ToggleStatus:", err.message);
        res.status(500).json({ error: "Erreur lors du changement de statut." });
    }
};

// 5. METTRE À JOUR UN UTILISATEUR
exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, role, service } = req.body;

        const query = 'UPDATE users SET name = ?, email = ?, role = ?, service = ? WHERE id = ?';
        await db.query(query, [name, email, role, service, userId]);

        res.json({ status: 'success', message: "Profil utilisateur mis à jour." });
    } catch (err) {
        console.error("❌ Erreur UpdateUser:", err.message);
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur." });
    }
};

// 6. STATISTIQUES GLOBALES POUR L'ADMIN
exports.getStats = async (req, res) => {
    try {
        const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
        const [msgCount] = await db.query('SELECT COUNT(*) as count FROM messages');
        const [activeUsers] = await db.query('SELECT COUNT(*) as count FROM users WHERE is_active = 1');

        res.json({
            totalUsers: userCount[0].count,
            totalMessages: msgCount[0].count,
            activeUsers: activeUsers[0].count
        });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la récupération des statistiques." });
    }
};
