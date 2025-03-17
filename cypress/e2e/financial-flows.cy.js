// Cypress end-to-end tests for critical financial workflows

describe('Financial Workflows - Critical Path Tests', () => {
  beforeEach(() => {
    // Set up the test environment
    cy.intercept('GET', '/api/monite/entities*', { fixture: 'entities.json' }).as('getEntities');
    cy.intercept('GET', '/api/monite/payables*', { fixture: 'payables.json' }).as('getPayables');
    cy.intercept('GET', '/api/monite/receivables*', { fixture: 'receivables.json' }).as('getReceivables');
    cy.intercept('GET', '/api/monite/payment-methods*', { fixture: 'payment-methods.json' }).as('getPaymentMethods');
    cy.intercept('GET', '/api/monite/quickpay/history*', { fixture: 'payment-history.json' }).as('getPaymentHistory');
    
    // Mock login/authentication
    cy.setCookie('auth-token', 'test-token');
    cy.visit('/dashboard');
  });

  context('Bill Pay Flow', () => {
    it('should display bills and allow filtering', () => {
      cy.visit('/dashboard/bill-pay');
      cy.wait('@getPayables');
      
      // Verify page loads with data
      cy.contains('h1', 'Bill Pay').should('be.visible');
      cy.get('[data-testid="bill-list"]').should('exist');
      
      // Test filtering functionality
      cy.get('[data-testid="filter-dropdown"]').click();
      cy.get('[data-testid="filter-option-pending"]').click();
      cy.get('[data-testid="bill-status-badge"]').each(($el) => {
        expect($el.text().toLowerCase()).to.include('pending');
      });
    });
    
    it('should create a new bill successfully', () => {
      cy.intercept('POST', '/api/monite/payables', {
        statusCode: 201,
        body: {
          id: 'new-bill-123',
          status: 'draft',
          created_at: new Date().toISOString(),
        }
      }).as('createBill');
      
      cy.visit('/dashboard/bill-pay');
      cy.get('[data-testid="create-bill-button"]').click();
      
      // Fill form fields
      cy.get('[name="vendor_id"]').select('vendor-123');
      cy.get('[name="amount"]').type('1500.00');
      cy.get('[name="currency"]').select('USD');
      cy.get('[name="due_date"]').type('2025-12-31');
      cy.get('[name="description"]').type('Office supplies and equipment');
      
      // Submit form
      cy.get('[data-testid="submit-bill-button"]').click();
      
      // Verify request was made correctly
      cy.wait('@createBill');
      
      // Verify success message and redirect
      cy.contains('Bill created successfully').should('be.visible');
      cy.url().should('include', '/dashboard/bill-pay');
    });
    
    it('should process bill payment', () => {
      cy.intercept('POST', '/api/monite/payables/*/pay', {
        statusCode: 200,
        body: {
          success: true,
          status: 'processing'
        }
      }).as('payBill');
      
      cy.visit('/dashboard/bill-pay');
      cy.get('[data-testid="bill-item"]').first().click();
      cy.get('[data-testid="pay-bill-button"]').click();
      
      // Select payment method
      cy.get('[data-testid="payment-method-option"]').first().click();
      cy.get('[data-testid="confirm-payment-button"]').click();
      
      // Verify payment request and success message
      cy.wait('@payBill');
      cy.contains('Payment initiated successfully').should('be.visible');
    });
  });
  
  context('Receivables/Invoicing Flow', () => {
    it('should display invoices and allow tab navigation', () => {
      cy.visit('/dashboard/receivables');
      cy.wait('@getReceivables');
      
      // Verify page loads with data
      cy.contains('h1', 'Receivables').should('be.visible');
      cy.get('[data-testid="invoice-list"]').should('exist');
      
      // Test tab navigation
      cy.get('[data-testid="tab-overdue"]').click();
      cy.url().should('include', '?status=overdue');
      cy.get('[data-testid="invoice-status-badge"]').each(($el) => {
        expect($el.text().toLowerCase()).to.include('overdue');
      });
      
      cy.get('[data-testid="tab-paid"]').click();
      cy.url().should('include', '?status=paid');
      cy.get('[data-testid="invoice-status-badge"]').each(($el) => {
        expect($el.text().toLowerCase()).to.include('paid');
      });
    });
    
    it('should create a new invoice successfully', () => {
      cy.intercept('POST', '/api/monite/receivables', {
        statusCode: 201,
        body: {
          id: 'new-invoice-123',
          status: 'draft',
          created_at: new Date().toISOString(),
        }
      }).as('createInvoice');
      
      cy.visit('/dashboard/create-invoice');
      
      // Fill form fields
      cy.get('[name="customer_id"]').select('customer-123');
      cy.get('[name="invoice_number"]').type('INV-2025-001');
      cy.get('[name="issue_date"]').type('2025-03-15');
      cy.get('[name="due_date"]').type('2025-04-15');
      
      // Add line items
      cy.get('[data-testid="add-line-item"]').click();
      cy.get('[name="items[0].description"]').type('Consulting services');
      cy.get('[name="items[0].quantity"]').type('10');
      cy.get('[name="items[0].price"]').type('150');
      
      // Add another line item
      cy.get('[data-testid="add-line-item"]').click();
      cy.get('[name="items[1].description"]').type('Software license');
      cy.get('[name="items[1].quantity"]').type('1');
      cy.get('[name="items[1].price"]').type('500');
      
      // Submit form
      cy.get('[data-testid="submit-invoice-button"]').click();
      
      // Verify request was made correctly
      cy.wait('@createInvoice');
      
      // Verify success message
      cy.contains('Invoice created successfully').should('be.visible');
    });
    
    it('should download invoice PDF', () => {
      cy.intercept('GET', '/api/monite/receivables/*/pdf', {
        statusCode: 200,
        headers: {
          'content-type': 'application/pdf',
          'content-disposition': 'attachment; filename="invoice-123.pdf"'
        },
        body: new Uint8Array(10)
      }).as('downloadPdf');
      
      cy.visit('/dashboard/receivables');
      cy.get('[data-testid="invoice-item"]').first().click();
      cy.get('[data-testid="download-pdf-button"]').click();
      
      // Verify PDF download request
      cy.wait('@downloadPdf');
    });
  });
  
  context('Entity Management Flow', () => {
    it('should display entities and allow searching', () => {
      cy.visit('/dashboard/clients-vendors');
      cy.wait('@getEntities');
      
      // Verify page loads with data
      cy.contains('h1', 'Clients & Vendors').should('be.visible');
      cy.get('[data-testid="entity-card"]').should('have.length.greaterThan', 0);
      
      // Test search functionality
      cy.get('[data-testid="search-input"]').type('acme');
      cy.get('[data-testid="entity-card"]').should('have.length', 1);
      cy.contains('Acme Corporation').should('be.visible');
    });
    
    it('should create a new organization entity', () => {
      cy.intercept('POST', '/api/monite/entities', {
        statusCode: 201,
        body: {
          id: 'new-entity-123',
          type: 'organization',
          created_at: new Date().toISOString(),
        }
      }).as('createEntity');
      
      cy.visit('/dashboard/clients-vendors');
      cy.get('[data-testid="add-entity-button"]').click();
      
      // Select organization type
      cy.get('[data-testid="entity-type-organization"]').click();
      
      // Fill organization form
      cy.get('[name="legal_name"]').type('Dunder Mifflin Inc.');
      cy.get('[name="name"]').type('Dunder Mifflin');
      cy.get('[name="email"]').type('info@dundermifflin.com');
      cy.get('[name="tax_id"]').type('123456789');
      
      // Fill address information
      cy.get('[name="country"]').type('US');
      cy.get('[name="city"]').type('Scranton');
      cy.get('[name="state"]').type('PA');
      cy.get('[name="postal_code"]').type('18503');
      cy.get('[name="line1"]').type('1725 Slough Avenue');
      
      // Submit form
      cy.get('[data-testid="create-entity-button"]').click();
      
      // Verify request was made correctly
      cy.wait('@createEntity');
      
      // Verify success message
      cy.contains('Entity created successfully').should('be.visible');
    });
  });
  
  context('QuickPay Flow', () => {
    it('should allow making a quick payment', () => {
      cy.intercept('POST', '/api/monite/quickpay', {
        statusCode: 200,
        body: {
          id: 'payment-123',
          status: 'processing',
          created_at: new Date().toISOString(),
          amount: 250.00,
          currency: 'USD'
        }
      }).as('createPayment');
      
      cy.visit('/dashboard/quickpay');
      cy.wait(['@getEntities', '@getPaymentMethods', '@getPaymentHistory']);
      
      // Start new payment
      cy.get('[data-testid="new-payment-button"]').click();
      
      // Select recipient
      cy.get('[data-testid="recipient-selector"]').click();
      cy.get('[data-testid="recipient-option"]').first().click();
      
      // Fill payment details
      cy.get('[name="amount"]').type('250.00');
      cy.get('[name="description"]').type('Consulting fee');
      
      // Select payment method
      cy.get('[data-testid="payment-method-selector"]').click();
      cy.get('[data-testid="payment-method-option"]').first().click();
      
      // Submit payment
      cy.get('[data-testid="process-payment-button"]').click();
      
      // Verify payment request and success message
      cy.wait('@createPayment');
      cy.contains('Payment processed successfully').should('be.visible');
    });
  });
});
