import { writable, type Writable } from 'svelte/store';
import type { CollectionEntry } from 'astro:content';

// 定义购物车项目类型
export interface CartItem {
  id: string;
  title: string;
  image?: string;
  price: number;
  quantity: number;
}

// 创建购物车 store
export const cart: Writable<CartItem[]> = writable([]);

// 从 localStorage 初始化购物车
if (typeof localStorage !== 'undefined') {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    try {
      const parsedCart = JSON.parse(savedCart);
      cart.set(parsedCart);
    } catch (e) {
      console.error('Failed to parse cart from localStorage', e);
      cart.set([]);
    }
  }
}

// 订阅购物车变化并保存到 localStorage
cart.subscribe((value) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(value));
  }
});

// 添加到购物车
export function addToCart(product: CollectionEntry<'product'>, quantity: number = 1) {
  cart.update((items) => {
    const existingItemIndex = items.findIndex(item => item.id === product.id);

    if (existingItemIndex >= 0) {
      // 如果产品已在购物车中，更新数量
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      return updatedItems;
    } else {
      // 如果产品不在购物车中，添加新产品
      return [
        ...items,
        {
          id: product.id,
          title: product.data.title,
          image: product.data.image?.src || '',
          price: product.data.price,
          quantity
        }
      ];
    }
  });
}

// 从购物车中移除项目
export function removeFromCart(productId: string) {
  cart.update((items) => {
    return items.filter(item => item.id !== productId);
  });
}

// 更新购物车中项目的数量
export function updateQuantity(productId: string, quantity: number) {
  if (quantity < 1) {
    removeFromCart(productId);
    return;
  }

  cart.update((items) => {
    const updatedItems = [...items];
    const itemIndex = updatedItems.findIndex(item => item.id === productId);

    if (itemIndex >= 0) {
      updatedItems[itemIndex].quantity = quantity;
    }

    return updatedItems;
  });
}

// 清空购物车
export function clearCart() {
  cart.set([]);
}

// 计算购物车总数量
export function getCartTotalQuantity(): number {
  let total = 0;
  const unsubscribe = cart.subscribe((items) => {
    total = items.reduce((sum, item) => sum + item.quantity, 0);
  });
  unsubscribe(); // 立即取消订阅
  return total;
}

// 计算购物车总价
export function getCartTotalPrice(): number {
  let total = 0;
  const unsubscribe = cart.subscribe((items) => {
    total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  });
  unsubscribe(); // 立即取消订阅
  return total;
}