<script lang="ts">
  interface Props {
    scale: number;
  }

  let { scale }: Props = $props();
</script>

<section style="transform: scale({scale});">
  <div class="flex mt-32">
    <div class="w-1/2 flex flex-col gap-4">
      <img src="https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/5036.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvNTAzNi5qcGciLCJpYXQiOjE3NTU1ODE0MTAsImV4cCI6MTc1NjQ0NTQxMH0.IlvnUrmUqPB0hZmA5qnhV7oQFbzq4WsRYcuiO7APxOE" alt="" class="h-[550px] w-[450px] m-auto object-cover" />
      <div class="max-w-450px mx-auto flex gap-4">
        <img src="https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/logo.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvbG9nby5zdmciLCJpYXQiOjE3NTU1ODE2ODgsImV4cCI6MjA3MDk0MTY4OH0.eUmDBO37_ktSN8bqEKUAbva2ly82QAHx3GaDaz2jvck" alt="" class="h-[100px] w-[100px] mx-auto" />
        <h3 class="text-5xl m-auto">Smile Design</h3>
      </div>
    </div>
    <div class="flex w-1/2">
      <div class="flex flex-col mx-auto">
        <h2 class="font-bold text-5xl">Our Core Values</h2>
        <ul class="text-3xl font-light space-y-4 mt-12 ml-8 list-disc list-inside">
          <li>Fidelity of Practice</li>
          <li>Accessible Luxury</li>
          <li>Natural Esthetics</li>
          <li>Comfortable Experience</li>
          <li>Thought Leadership</li>
          <li>Transparency</li>
          <li>Technology</li>
          <li>Artistic Edge</li>
          <li>Community</li>
          <li>Predictability</li>
        </ul>
      </div>
    </div>
  </div>
</section>