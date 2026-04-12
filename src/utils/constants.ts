export const URLS = {
  LOGIN: '/',
  INVENTORY: '/inventory.html',
  CART: '/cart.html',
  CHECKOUT_STEP_ONE: '/checkout-step-one.html',
  CHECKOUT_STEP_TWO: '/checkout-step-two.html',
  CHECKOUT_COMPLETE: '/checkout-complete.html',
  PRODUCT_DETAIL: '/inventory-item.html',
} as const;

export const SORT_OPTIONS = {
  NAME_ASC: 'az',
  NAME_DESC: 'za',
  PRICE_LOW_HIGH: 'lohi',
  PRICE_HIGH_LOW: 'hilo',
} as const;
