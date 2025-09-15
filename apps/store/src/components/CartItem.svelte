<script lang="ts">
  import {
    updateQuantity,
    removeFromCart,
    type CartItem,
  } from '$lib/store/cart';

  const { item } = $props<{ item: CartItem }>();

  function handleQuantityChange(newQuantity: number) {
    if (newQuantity < 1) {
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  }

  function handleRemove() {
    removeFromCart(item.id);
  }
</script>

<div class="flex items-center gap-4 p-4 border border-border rounded-lg">
  {#if item.image}
    <div class="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
      <img
        src={item.image}
        alt={item.title}
        class="w-full h-full object-cover"
        width="64"
        height="64"
      />
    </div>
  {:else}
    <div
      class="w-16 h-16 rounded-md bg-muted flex-shrink-0 flex items-center justify-center"
    >
      <div class="text-muted-foreground text-xs text-center">No image</div>
    </div>
  {/if}

  <div class="flex-1 min-w-0">
    <h3 class="font-medium text-foreground truncate">{item.title}</h3>
    <p class="text-muted-foreground text-sm">${item.price.toFixed(2)}</p>

    <div class="flex items-center gap-2 mt-2">
      <button
        class="w-8 h-8 rounded-md border border-border flex items-center justify-center text-lg font-bold disabled:opacity-50"
        on:click={() => handleQuantityChange(item.quantity - 1)}
        disabled={item.quantity <= 1}
      >
        -
      </button>
      <span class="text-sm font-medium w-8 text-center">{item.quantity}</span>
      <button
        class="w-8 h-8 rounded-md border border-border flex items-center justify-center text-lg font-bold"
        on:click={() => handleQuantityChange(item.quantity + 1)}
      >
        +
      </button>

      <button
        class="ml-auto text-destructive hover:text-destructive/80"
        on:click={handleRemove}
        aria-label="Remove item"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </button>
    </div>
  </div>
</div>
