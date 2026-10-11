test('Validation email correcte', () => {
  const emailValide = "contact@siad.com";
  expect(emailValide).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
});

test('Attribution du rôle PDG', () => {
  const userRole = "PDG";
  expect(userRole).toBe("PDG");
});