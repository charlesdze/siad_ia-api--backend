const db = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Fonction de temporisation pour l'IA
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 1. ENREGISTRER UNE NOTE (Client, Employé, Partenaire)
exports.createMessage = async (req, res) => {
    try {
        const { sender_name, sender_role, department, content } = req.body;

        if (!sender_name || !department || !content) {
            return res.status(400).json({ error: "Données manquantes (nom, département ou contenu)." });
        }

        // Nettoyage pour éviter les erreurs de recherche futures
        const cleanName = sender_name.trim();
        const cleanDept = department.trim();

        const query = `INSERT INTO messages (sender_name, sender_role, department, content, status) VALUES (?, ?, ?, ?, 'EN_ATTENTE_DEPARTEMENT')`;
        const [result] = await db.query(query, [cleanName, sender_role, cleanDept, content]);

        console.log(`✅ Message ID ${result.insertId} créé par ${cleanName}`);
        res.status(201).json({ status: 'success', id: result.insertId });
    } catch (err) {
        console.error("❌ Erreur CreateMessage:", err.message);
        res.status(500).json({ error: "Erreur serveur lors de l'envoi." });
    }
};

// 2. RÉCUPÉRER LES MESSAGES (Correction du filtrage TRIM)
exports.getMessages = async (req, res) => {
    try {
        const { role, service, name } = req.query;
        let query = '';
        let params = [];

        console.log(`🔍 Lecture demandée par: ${role} (${name || service})`);

        if (role === 'PDG') {
            query = 'SELECT * FROM messages ORDER BY created_at DESC';
        } else if (role === 'MANAGER') {
            // Utilisation de TRIM pour ignorer les espaces accidentels en BDD
            query = 'SELECT * FROM messages WHERE TRIM(department) = ? ORDER BY created_at DESC';
            params = [service?.trim()];
        } else {
            // Pour Client, Employé, Partenaire : on filtre par leur nom exact
            query = 'SELECT * FROM messages WHERE TRIM(sender_name) = ? ORDER BY created_at DESC';
            params = [name?.trim()];
        }

        const [results] = await db.query(query, params);
        res.json(results);
    } catch (err) {
        console.error("❌ Erreur GetMessages:", err.message);
        res.status(500).json({ error: "Erreur serveur lors de la lecture." });
    }
};

// 3. METTRE À JOUR LE STATUT (Manager et PDG)
exports.updateMessageStatus = async (req, res) => {
    try {
        const messageId = req.params.id;
        const { status, reply } = req.body;

        if (!status) return res.status(400).json({ error: "Le statut est requis." });

        const query = `UPDATE messages SET status = ?, reply = ? WHERE id = ?`;
        const [result] = await db.query(query, [status, reply || '', messageId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Message introuvable." });
        }

        console.log(`✅ Message ${messageId} mis à jour vers : ${status}`);
        res.json({ status: 'success' });
    } catch (err) {
        console.error("❌ Erreur UpdateStatus:", err.message);
        res.status(500).json({ error: "Erreur serveur lors de la mise à jour." });
    }
};

// 4. ANALYSE IA (Correction du modèle gemini-1.5-flash)
exports.getAIAnalyse = async (req, res) => {
    const { role, department } = req.query;
    const apiKey = process.env.GEMINI_API_KEY;

    console.log(`🤖 Analyse IA demandée pour ${role}.`);

    let sql = (role === 'PDG') ? 'SELECT content FROM messages' : 'SELECT content FROM messages WHERE department = ?';
    let p = (role === 'PDG') ? [] : [department];

    // SI CLÉ INVALIDE OU MODE SIMULATION
    if (!apiKey || apiKey.startsWith("VOTRE") || apiKey.startsWith("AQ.")) {
        console.log("⚠️ Mode Simulation STRATOS activé (Clé manquante ou invalide).");
        try {
            const [rows] = await db.query(sql, p);
            const dataText = rows.map(r => r.content).join(" ");

            let simAnalyse = `[RAPPORT DE SIMULATION STRATOS]\n\n`;
            simAnalyse += `Analyse des flux pour le rôle : ${role}\n`;
            if (dataText.includes("panne") || dataText.includes("erreur")) {
                simAnalyse += `🚩 Alerte : Des problèmes techniques ont été détectés dans les messages.\n`;
            }
            simAnalyse += `✅ Recommandation : Maintenir la vigilance opérationnelle.\n`;
            simAnalyse += `📅 Généré le : ${new Date().toLocaleString()}`;

            return res.json({ status: 'success', analysis: simAnalyse });
        } catch (dbErr) {
            return res.status(500).json({ error: "Erreur base de données lors de la simulation." });
        }
    }

    try {
        const [rows] = await db.query(sql, p);
        if (rows.length === 0) return res.json({ analysis: "Pas assez de données pour une analyse." });

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
        });

        const data = rows.map(r => r.content).join("\n");
        const prompt = `En tant qu'expert IA du SIAD, analyse ces messages d'entreprise et propose une synthèse stratégique :\n${data}`;

        const result = await model.generateContent(prompt);
        res.json({ status: 'success', analysis: result.response.text() });
    } catch (err) {
        console.error("❌ Erreur IA:", err.message);
        res.status(500).json({ error: "Service IA indisponible actuellement.", details: err.message });
    }
};
