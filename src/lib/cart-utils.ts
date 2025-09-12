// src/lib/cart-utils.ts

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export function addToCart(item: CartItem): void {
  const cart = getCart();
  const existingItem = cart.find((cartItem) => cartItem.id === item.id);
  
  if (existingItem) {
    existingItem.quantity += item.quantity;
  } else {
    cart.push({ ...item });
  }
  
  saveCart(cart);
}

export function removeFromCart(id: string): void {
  const cart = getCart();
  const filteredCart = cart.filter((item) => item.id !== id);
  saveCart(filteredCart);
}

export function updateQuantity(id: string, quantity: number): void {
  const cart = getCart();
  const item = cart.find((item) => item.id === id);
  
  if (item) {
    item.quantity = quantity;
    if (item.quantity <= 0) {
      removeFromCart(id);
    } else {
      saveCart(cart);
    }
  }
}

export function getCart(): CartItem[] {
  if (typeof window !== 'undefined') {
    const cartString = localStorage.getItem('cart');
    return cartString ? JSON.parse(cartString) : [];
  }
  return [];
}

export function saveCart(cart: CartItem[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
}

export function getCartTotal(): number {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

export function getCartItemCount(): number {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
}