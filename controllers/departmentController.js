const db = require('../config/db');

// 1. RÉCUPÉRER TOUS LES DÉPARTEMENTS
exports.getAllDepartments = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM departments ORDER BY name ASC');
        res.json(results);
    } catch (err) {
        console.error("❌ Erreur GetAllDepartments:", err.message);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des départements." });
    }
};

// 2. CRÉER UN DÉPARTEMENT
exports.createDepartment = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Le nom du département est requis." });

        const [result] = await db.query('INSERT INTO departments (name, is_active) VALUES (?, 1)', [name.trim()]);
        res.status(201).json({ success: true, id: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "Ce département existe déjà." });
        }
        console.error("❌ Erreur CreateDepartment:", err.message);
        res.status(500).json({ error: "Erreur serveur lors de la création." });
    }
};

// 3. ACTIVER / DÉSACTIVER UN DÉPARTEMENT
exports.toggleDepartmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        await db.query('UPDATE departments SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);
        res.json({ success: true });
    } catch (err) {
        console.error("❌ Erreur ToggleDepartment:", err.message);
        res.status(500).json({ error: "Erreur serveur lors de la mise à jour." });
    }
};

// 4. SUPPRIMER UN DÉPARTEMENT (Si pas de messages liés)
exports.deleteDepartment = async (req, res) => {
    try {
        const { id, name } = req.params;

        // Vérifier s'il y a des messages
        const [messages] = await db.query('SELECT id FROM messages WHERE TRIM(department) = ? LIMIT 1', [name.trim()]);

        if (messages.length > 0) {
            return res.status(400).json({ error: "Impossible de supprimer : données historiques présentes." });
        }

        await db.query('DELETE FROM departments WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error("❌ Erreur DeleteDepartment:", err.message);
        res.status(500).json({ error: "Erreur serveur lors de la suppression." });
    }
};
