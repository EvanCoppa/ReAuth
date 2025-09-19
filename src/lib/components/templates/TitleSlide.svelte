<script lang="ts">
  interface Props {
    doctorName?: string;
    patientName?: string;
    scale: number;
  }

  let { doctorName = '', patientName = 'Patient', scale }: Props = $props();
</script>

<section style="background: url('https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/landing.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvbGFuZGluZy5qcGciLCJpYXQiOjE3NTU1ODIxOTAsImV4cCI6MjA3MDk0MjE5MH0.hXSpPtvPM1vHqrKJtZmatbCKHYRvrTv0IQ_SwjwlagY') center center / cover no-repeat; transform: scale({scale});" class="flex bg-white">
  <div class="flex flex-col text-white ml-4 mt-auto text-shadow-xl">
    <div class="my-auto flex flex-col">
      <div class="flex flex-row gap-[16px]">
        <div class="flex">
          <img class="w-[75px] mb-auto invert ml-4" src="https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/logo.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvbG9nby5zdmciLCJpYXQiOjE3NTU1ODE2ODgsImV4cCI6MjA3MDk0MTY4OH0.eUmDBO37_ktSN8bqEKUAbva2ly82QAHx3GaDaz2jvck" alt="Smile Design Logo" />
        </div>
        <div class="mt-2">
          <h1 class="text-[100px] leading-[50px] mb-[8px]">Smile Design</h1>
          <div class="flex">
            <h2 class="text-[55px] mb-4">Manhattan</h2>
            <h3 class="text-[30px] font-extralight my-auto ml-[0.2in]">Provided By: {doctorName}</h3>
          </div>
        </div>
        <span class="bg-white h-[130px] w-[2px] mx-8"></span>
        <div>
          <h3 class="text-[40px] my-auto ml-[0.2in] font-light">Designed for:</h3>
          <h3 class="text-[40px] my-auto ml-[0.2in] font-light">{patientName}</h3>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .text-shadow-xl {
    text-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
</style>