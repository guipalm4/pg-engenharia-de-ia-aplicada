describe('Event Registration', () => {
  beforeEach(() => {
    cy.visit('/event/new');
  });

  it('should successfully register a new event', () => {
    // Fill the form fields
    cy.get('#nome').type('Alvaro Neto Conference');
    cy.get('#endereco').type('Main Street, 456');
    cy.get('#capacidade').type('200');
    cy.get('#data').type('2026-06-15');

    // Click the submit button
    cy.get('.submit-btn').click();

    // Assert that the success message is visible
    cy.get('.success-msg').should('be.visible').and('contain', 'Evento cadastrado com sucesso!');
  });

  it('should show error messages when submitting an empty form', () => {
    // Click the submit button without filling anything
    cy.get('.submit-btn').click();

    // Assert that error messages appear for all required fields
    cy.get('.error-text').should('have.length', 4);
    cy.get('.error-text').eq(0).should('contain', 'O nome é obrigatório.');
    cy.get('.error-text').eq(1).should('contain', 'O endereço é obrigatório.');
    cy.get('.error-text').eq(2).should('contain', 'Informe uma capacidade válida (mínimo 1).');
    cy.get('.error-text').eq(3).should('contain', 'A data é obrigatória.');
  });
});
