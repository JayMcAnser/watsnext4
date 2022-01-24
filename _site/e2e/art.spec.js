describe('Login procedure', () => {

  it('Login', () => {
    cy.visit('http://localhost:3000')
    cy.get('#username').type('info@toxus.nl')
    cy.get('#password').type('123456');
    cy.contains('Sign in').click();
  });
  it('open art menu', () => {
    cy.contains('Art').click();
    cy.contains('List').click();
  })
})
