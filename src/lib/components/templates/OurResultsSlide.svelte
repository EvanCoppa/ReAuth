<script lang="ts">
  interface Props {
    scale: number;
  }

  let { scale }: Props = $props();
</script>

<section style="transform: scale({scale});" class="flex">
  <div class="flex flex-col m-auto">
    <img src="https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/834.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvODM0LmpwZyIsImlhdCI6MTc1NTU4MTQzNywiZXhwIjoxNzU2NDQ1NDM3fQ.kAnCAvbxwiBjOUQZj4xLGx32bjTN3O8w-x9NpSQTfwI" alt="" class="w-[70%] mx-auto" />
    <div class="flex mx-auto gap-16 mt-12">
      <h2 class="text-[70px] text-blue-300 font-light">Our Results</h2>
      <img src="https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/logo.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvbG9nby5zdmciLCJpYXQiOjE3NTU1ODE2ODgsImV4cCI6MjA3MDk0MTY4OH0.eUmDBO37_ktSN8bqEKUAbva2ly82QAHx3GaDaz2jvck" alt="" class="h-[100px] w-[100px]" />
      <p class="text-sm max-w-[350px]">
        Every smile is unique. The character in a person's smile impacts the way they communicate their confidence, joy, love, and laughter. We create the science behind the most important facial feature" - Dr. Lee Gause
      </p>
    </div>
  </div>
</section>