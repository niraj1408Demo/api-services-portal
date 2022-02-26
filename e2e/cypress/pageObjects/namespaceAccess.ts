class NamespaceAccessPage {

  userNameInput: string = 'input[name="username"]'
  grantPermission(accessRqst : any) {
    cy.get(this.userNameInput).type(accessRqst.userName);
    let accessRole: Array<string> = accessRqst.accessRole
    accessRole.forEach(function(accessName)
    {
      cy.contains("Permissions").next().find('ul').find('li').each(($el, index, $list) => {

        const textAccessRoleName=$el.text()
        cy.log(textAccessRoleName)
        if(textAccessRoleName===accessName)
        {
          cy.wrap($el).click()
        }
        })
    })   
    cy.contains("Share").click()
  }
  
  // revokePermission(accessRqst : any) {
  //   let accessRole: Array<string> = accessRqst
  //   accessRole.forEach(function(accessName)
  //   {
  //     cy.contains(accessName).find('button').click()
  //     cy.wait(1500)
  //   })   
  // }
  revokePermission(revokePermission : any) {
    cy.contains(revokePermission.userName).parents('tr').find('td:nth-child(2)').find('span').each(($e1, index, $list) => {

      const text=$e1.text()
      if(text.includes(revokePermission.accessRole))
      {
        cy.wrap($e1).find('button').click()
        cy.wait(5000)
      }
    })
  }

  path: string = '/manager/namespace-access'

  clickGrantUserAccessButton() {
    cy.contains("Grant User Access").click()
  }   
}
  export default NamespaceAccessPage
  
