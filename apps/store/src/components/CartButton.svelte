<script lang="ts">
  import { onMount } from 'svelte';
  import { cart } from '$lib/store/cart';
  import { ShoppingCart } from '@lucide/svelte';
  import * as Sheet from '$lib/components/ui/sheet';
  import CartItem from './CartItem.svelte';

  let cartItems: any[] = [];
  let totalQuantity = 0;

  // 订阅购物车变化
  const unsubscribe = cart.subscribe((items) => {
    cartItems = items;
    totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  });

  onMount(() => {
    return () => {
      unsubscribe();
    };
  });

  function handleCheckout() {
    // 这里可以实现结账逻辑
    console.log('Checkout clicked');
    // 临时关闭 sheet
    const closeBtn = document.querySelector(
      '[data-sheet-close]',
    ) as HTMLButtonElement;
    if (closeBtn) {
      closeBtn.click();
    }
  }
</script>

<!-- Shopping cart icon with quantity badge -->
<Sheet.Root>
  <Sheet.Trigger
    class="text-foreground hover:opacity-80 focus:outline-none relative"
    aria-label="Shopping cart"
  >
    <ShoppingCart class="h-6 w-6" />
    {#if totalQuantity > 0}
      <span
        class="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1"
      >
        {totalQuantity > 99 ? '99+' : totalQuantity}
      </span>
    {/if}
  </Sheet.Trigger>

  <Sheet.Content side="right" class="w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
    <Sheet.Header>
      <Sheet.Title>Shopping Cart</Sheet.Title>
    </Sheet.Header>

    <div class="p-4 flex-1 overflow-y-auto">
      {#if cartItems.length > 0}
        <div class="space-y-4">
          {#each cartItems as item}
            <CartItem {item} />
          {/each}
        </div>
      {:else}
        <p class="text-muted-foreground text-center py-8">Your cart is empty</p>
      {/if}
    </div>

    <Sheet.Footer class="mt-auto">
      {#if cartItems.length > 0}
        <div class="w-full">
          <div class="flex justify-between items-center mb-4">
            <span class="text-lg font-semibold">Total:</span>
            <span class="text-lg font-bold">
              ${cartItems
                .reduce((sum, item) => sum + item.price * item.quantity, 0)
                .toFixed(2)}
            </span>
          </div>
          <button
            class="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 px-4 rounded-md font-medium transition-colors"
            onclick={handleCheckout}
          >
            Checkout
          </button>
        </div>
      {/if}
    </Sheet.Footer>
  </Sheet.Content>
</Sheet.Root>
