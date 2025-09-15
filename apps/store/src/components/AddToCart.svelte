<script lang="ts">
  import { onMount } from 'svelte';
  import {
    cart,
    addToCart as addProductToCart,
    updateQuantity as updateCartQuantity,
  } from '$lib/store/cart';
  import type { CollectionEntry } from 'astro:content';

  let quantity = $state(1);
  let isInCart = $state(false);

  const { product } = $props<{
    product: CollectionEntry<'product'>;
  }>();

  // 订阅购物车变化
  let unsubscribe: () => void;

  onMount(() => {
    unsubscribe = cart.subscribe((items) => {
      const productInCart = items.find((item) => item.id === product.id);
      if (productInCart) {
        isInCart = true;
      } else {
        isInCart = false;
      }
    });

    // 清理订阅
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  });

  function handleAddToCart() {
    addProductToCart(product, quantity);
  }

  function handleQuantityChange(newQuantity: number) {
    if (newQuantity < 1) newQuantity = 1;
    quantity = newQuantity;
  }

  function handleQuantityInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value);
    if (!isNaN(value)) {
      handleQuantityChange(value);
    }
  }
</script>

<div class="mt-6">
  <div class="flex items-center gap-4 mb-4">
    <button
      class="w-10 h-10 rounded-md border border-border flex items-center justify-center text-lg font-bold disabled:opacity-50"
      onclick={() => handleQuantityChange(quantity - 1)}
      disabled={quantity <= 1}
    >
      -
    </button>
    <input
      type="number"
      min="1"
      bind:value={quantity}
      oninput={handleQuantityInput}
      class="w-16 text-center border border-border rounded-md py-2 px-3 text-lg font-medium flex-1"
    />
    <button
      class="w-10 h-10 rounded-md border border-border flex items-center justify-center text-lg font-bold"
      onclick={() => handleQuantityChange(quantity + 1)}
    >
      +
    </button>
  </div>

  <button
    class="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 px-4 rounded-md font-medium transition-colors"
    onclick={handleAddToCart}
  >
    {isInCart ? 'Update Cart' : 'Add to Cart'}
  </button>
</div>
