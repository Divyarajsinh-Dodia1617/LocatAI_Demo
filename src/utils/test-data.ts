export const USERS = {
  STANDARD: { username: 'standard_user', password: 'secret_sauce' },
  LOCKED_OUT: { username: 'locked_out_user', password: 'secret_sauce' },
  PROBLEM: { username: 'problem_user', password: 'secret_sauce' },
} as const;

export const CHECKOUT_INFO = {
  VALID: { firstName: 'John', lastName: 'Doe', zipCode: '12345' },
} as const;

export const PRODUCTS = {
  BACKPACK: { name: 'Sauce Labs Backpack', price: '$29.99' },
  BIKE_LIGHT: { name: 'Sauce Labs Bike Light', price: '$9.99' },
  BOLT_TSHIRT: { name: 'Sauce Labs Bolt T-Shirt', price: '$15.99' },
  FLEECE_JACKET: { name: 'Sauce Labs Fleece Jacket', price: '$49.99' },
  ONESIE: { name: 'Sauce Labs Onesie', price: '$7.99' },
  RED_TSHIRT: { name: 'Test.allTheThings() T-Shirt (Red)', price: '$15.99' },
} as const;
