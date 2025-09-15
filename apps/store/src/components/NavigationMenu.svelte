<script lang="ts">
  import * as NavigationMenu from '$lib/components/ui/navigation-menu';
  import * as Sheet from '$lib/components/ui/sheet';
  import { Menu } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';
  import type { CollectionEntry } from 'astro:content';

  const { categories, posts } = $props<{
    categories: CollectionEntry<'category'>[];
    posts: CollectionEntry<'post'>[];
  }>();
</script>

<!-- Mobile Sheet Version -->
<Sheet.Root>
  <Sheet.Trigger class="md:hidden">
    <Button variant="ghost" size="icon">
      <Menu class="h-6 w-6" />
    </Button>
  </Sheet.Trigger>
  <Sheet.Content side="right" class="w-full sm:w-3/4">
    <Sheet.Header>
      <Sheet.Title>Menu</Sheet.Title>
    </Sheet.Header>
    <div class="my-4">
      <nav class="w-full">
        <ul class="flex flex-col gap-2">
          <!-- Categories -->
          {#each categories as category}
            <li>
              <a
                href={`/category/${category.id}`}
                class="block py-2 text-lg hover:bg-accent hover:text-accent-foreground rounded-md px-2"
              >
                {category.data.title}
              </a>
            </li>
          {/each}

          <!-- About with Posts dropdown -->
          <li>
            <details class="group">
              <summary
                class="py-2 text-lg list-none cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md px-2"
              >
                About
              </summary>
              <ul class="grid w-full gap-2 p-2 mt-1 pl-4">
                {#each posts as post}
                  <li class="flex-row items-center gap-2">
                    <a
                      href={`/posts/${post.id}`}
                      class="font-medium w-auto py-1 text-base hover:underline"
                    >
                      {post.data.title}
                    </a>
                  </li>
                {/each}
              </ul>
            </details>
          </li>
        </ul>
      </nav>
    </div>
  </Sheet.Content>
</Sheet.Root>

<!-- Desktop Version -->
<div class="hidden md:block">
  <NavigationMenu.Root viewport={false}>
    <NavigationMenu.List>
      <!-- Categories -->
      {#each categories as category}
        <NavigationMenu.Item>
          <NavigationMenu.Link href={`/category/${category.id}`}>
            {category.data.title}
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      {/each}

      <!-- About with Posts dropdown -->
      <NavigationMenu.Item>
        <NavigationMenu.Trigger>About</NavigationMenu.Trigger>
        <NavigationMenu.Content>
          <ul class="grid w-[200px] gap-4 p-2">
            {#each posts as post}
              <li class="flex-row items-center gap-2">
                <NavigationMenu.Link href={`/posts/${post.id}`}>
                  <div class="font-medium w-auto">{post.data.title}</div>
                </NavigationMenu.Link>
              </li>
            {/each}
          </ul>
        </NavigationMenu.Content>
      </NavigationMenu.Item>
    </NavigationMenu.List>
  </NavigationMenu.Root>
</div>
