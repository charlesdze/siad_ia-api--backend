const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    // 1. Récupérer le header d'authentification
    const authHeader = req.headers['authorization'];

    // Le header doit être sous la forme "Bearer <TOKEN>"
    const token = authHeader && authHeader.split(' ')[1];

    // Si aucun token n'est fourni
    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Accès refusé. Aucun token d\'authentification fourni.'
        });
    }

    try {
        // 2. Vérifier et décoder le token
        const jwtSecret = process.env.JWT_SECRET || 'SIAD_SUPER_SECRET_KEY_2026';
        const decoded = jwt.verify(token, jwtSecret);

        // 3. Injecter les données de l'utilisateur dans l'objet 'req'
        // De cette façon, n'importe quel contrôleur qui vient après aura accès à req.user
        req.user = decoded;

        // 4. Passer au middleware ou contrôleur suivant
        next();
    } catch (err) {
        console.error("Erreur de validation JWT:", err.message);
        return res.status(403).json({
            status: 'error',
            message: 'Token invalide ou expiré.'
        });
    }
};