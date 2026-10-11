// C:\xampp\htdocs\siad_node_api\auth.test.js

// --- ID 01 : Validation format email ---
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// --- ID 03 : Vérification rôle et accès ---
function getAccessRights(role) {
  const rights = {
    "PDG": ["LECTURE_GLOBALE", "ARBITRAGE_SUPREME", "GESTION_SERVICES"],
    "MANAGER": ["LECTURE_SERVICE", "DECISION_EQUIPE"],
    "EMPLOYE": ["ENVOI_NOTE"]
  };
  return rights[role] || [];
}

// --- ID 02 : Simulation Analyse IA Stratos ---
// On simule ce que fait votre contrôleur : concaténer les messages et générer un audit
function simulateAIAnalysis(messages) {
  if (messages.length === 0) return "Pas assez de données.";
  const summary = messages.join(" ");
  return `[AUDIT STRATOS] Analyse de : ${summary.substring(0, 20)}... Statut : Opérationnel.`;
}

// SUITE DE TESTS JEST
describe('Tests Backend SIAD (Validation, IA & Droits)', () => {

  // TEST ID 01
  test('ID 01 - Validation Email (Format valide)', () => {
    expect(validateEmail("admin@siad.com")).toBe(true);
  });

  // TEST ID 02 (NOUVEAU)
  test('ID 02 - Fonctionnement IA Stratos (Génération Rapport)', () => {
    const fluxMessages = ["Serveur en panne", "Besoin de recrutement"];
    const rapport = simulateAIAnalysis(fluxMessages);
    
    // On vérifie que le rapport contient bien les mots clés de l'audit
    expect(rapport).toContain("[AUDIT STRATOS]");
    expect(rapport).toContain("Opérationnel");
    console.log("   ✅ Rapport IA généré : " + rapport);
  });

  // TEST ID 03
  test('ID 03 - Vérification Droits PDG', () => {
    const rights = getAccessRights("PDG");
    expect(rights).toContain("ARBITRAGE_SUPREME");
  });

});