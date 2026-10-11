const request = require('supertest');
// // Changez ceci :
// const API_URL = "http://localhost:3000";

// Par cela :
const API_URL = "http://127.0.0.1:3000";

describe('🔥 TEST COMPLET DU SYSTEME SIAD', () => {

    // --- TEST 1 : AUTHENTIFICATION ---
    it('doit connecter un administrateur existant', async () => {
        const res = await request(API_URL)
            .post('/api/siad/auth/login')
            .send({
                email: "admin@mail.com",
                password: "12345678"
            });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.user).toHaveProperty('role', 'PDG');
        console.log("   ✅ Connexion réussie : " + res.body.user.name);
    });

    // --- TEST 2 : FLUX DE MESSAGES ---
    it('doit permettre d\'envoyer une nouvelle note', async () => {
        const res = await request(API_URL)
            .post('/api/siad/messages')
            .send({
                sender_name: "Test Robot",
                sender_role: "EMPLOYE",
                department: "Informatique",
                content: "Ceci est un test de fonctionnement global du système."
            });
        
        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe('success');
        console.log("   ✅ Envoi de message : OK");
    });

    // --- TEST 3 : ACCÈS AUX DONNÉES ---
    it('doit récupérer les messages du département Informatique', async () => {
        const res = await request(API_URL)
            .get('/api/siad/messages?role=MANAGER&service=Informatique');
        
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        console.log(`   ✅ Lecture messages (${res.body.length} trouvés) : OK`);
    });

    // --- TEST 4 : INTELLIGENCE ARTIFICIELLE ---
    it('doit générer un rapport Stratos pour le PDG', async () => {
        // Ce test peut être long selon la vitesse de Gemini
        const res = await request(API_URL)
            .get('/api/siad/ai/analyse?role=PDG');
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('analysis');
        console.log("   ✅ Analyse Stratos générée avec succès");
    }, 15000); // Timeout de 15s pour laisser l'IA répondre

});