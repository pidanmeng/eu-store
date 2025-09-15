<script>
  import * as Carousel from '$lib/components/ui/carousel';
  import banner1 from '$/assets/banner-1.png';
  import banner2 from '$/assets/banner-2.png';
  import banner3 from '$/assets/banner-3.png';
  const banners = [banner1, banner2, banner3];
</script>

<div class="w-full">
  <Carousel.Root class="h-64 md:h-96">
    <Carousel.Content>
      {#each banners as banner}
        <Carousel.Item>
          <div class="relative w-full h-64 md:h-96 overflow-hidden rounded-lg">
            <img
              src={banner.src}
              alt="Banner 1"
              class="w-full h-full object-cover"
              width={1200}
              height={600}
            />
         </div>
       </Carousel.Item>
      {/each}
    </Carousel.Content>
    <Carousel.Previous class="left-4" />
    <Carousel.Next class="right-4" />
  </Carousel.Root>
</div>
