describe('Cadastro de Eventos - AI Driven Testing', () => {
  it('Deve executar o fluxo de cadastro e validar o sucesso de forma semântica', () => {
    cy.visit('/event/new');

    // Múltiplos passos em uma única chamada de array para otimizar o LLM
    cy.prompt([
      'Type "Auditório Oracle" in the event name field',
      'Type "Av. Dr. Chucri Zaidan, SP" in the address field',
      'Type "500" in the capacity field',
      'Type "2026-12-31" in the date field',
      'Click the button that submits or saves the event'
    ]);

    // Asserção baseada na intenção visual
    cy.prompt(['Verify that a success message is visible']);
  });
});
