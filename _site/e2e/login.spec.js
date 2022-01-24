describe('Login procedure', () => {
  it('Login as user', () => {
    cy.visit('http://localhost:3000')
    cy.contains('Sign in')
    cy.contains('Sign in').click();
    cy.contains('E-mail and password are required')
    cy.get('#username').type('info@toxus.nl')
    cy.contains('Sign in').click();
    cy.contains('E-mail and password are required')
    cy.get('#password').type('1234');
    cy.contains('Sign in').click();
    cy.contains('invalid email/password');
    cy.get('#password').type('56');
    cy.contains('Sign in').click();
    // assert.isFalse(false);
    //expect(true).to.equal(false)
  })
})
