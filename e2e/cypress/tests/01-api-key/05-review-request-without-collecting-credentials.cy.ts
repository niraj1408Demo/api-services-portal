import ConsumersPage from '../../pageObjects/consumers'
import LoginPage from '../../pageObjects/login'
import HomePage from '../../pageObjects/home'
import ProductPage from '../../pageObjects/products'

describe('Approve Pending Request without collecting credentials Spec', () => {
  const login = new LoginPage()
  const consumers = new ConsumersPage()
  const home = new HomePage()

  before(() => {
    cy.visit('/')
    cy.deleteAllCookies()
    cy.reload()
  })

  beforeEach(() => {
    cy.preserveCookies()
    cy.fixture('access-manager').as('access-manager')
    cy.fixture('apiowner').as('apiowner')
    cy.fixture('developer').as('developer')
    cy.fixture('state/store').as('store')
  })

  it('authenticates Mark (Access-Manager)', () => {
    cy.get('@apiowner').then(({ namespace }: any) => {
      cy.get('@access-manager').then(({ user }: any) => {
        cy.login(user.credentials.username, user.credentials.password)
        home.useNamespace(namespace);
      })
    })
  })

  it('Navigate to Consumer page', () => {
    cy.visit(consumers.path);
  })

  it('verify that pending request is not displayed', () => {
    const flag = consumers.reviewThePendingRequest()
    assert.isFalse(flag, 'Review request popup is displayed')
  })

  after(() => {
    cy.logout()
    cy.clearLocalStorage({ log: true })
    cy.deleteAllCookies()
  })

})