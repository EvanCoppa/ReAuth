<script lang="ts">
  interface Props {
    scale: number;
  }

  let { scale }: Props = $props();
</script>

<section style="transform: scale({scale});">
  <div class="flex justify-center items-center relative h-[850px]">
    <div class="w-1/2 my-auto flex flex-col items-center">
      <h2 class="text-[60px] text-center mt-8 text-blue-400 max-w-[80%]">
        "Excellence in Dental Care Starts with Every Visit"
      </h2>
      <div class="flex flex-col mt-36">
        <img src="https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/logo.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvbG9nby5zdmciLCJpYXQiOjE3NTU1ODE2ODgsImV4cCI6MjA3MDk0MTY4OH0.eUmDBO37_ktSN8bqEKUAbva2ly82QAHx3GaDaz2jvck" alt="" class="h-[150px] w-[150px] mx-auto" />
        <h3 class="font-extralight text-3xl mt-16">Talent | Technology | Community</h3>
      </div>
    </div>
    <div class="w-1/2 flex my-auto">
      <img src="https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/7893.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvNzg5My5wbmciLCJpYXQiOjE3NTU1ODA3NjUsImV4cCI6MjA3MDk0MDc2NX0.dGOpgpwOEM2wtkmIdajL1IkLi-T3CBI0jzbOIU-r1Qk" alt="Smile Design" class="h-[500px] w-[500px] object-contain m-auto" />
    </div>
  </div>
</section>