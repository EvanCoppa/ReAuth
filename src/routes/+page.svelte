<script lang="ts">
  // import { onMount } from "svelte";

  // let windowWidth: number = $state(0);

  // onMount(() => {
  //   windowWidth = window.innerWidth;
  // window.addEventListener('resize', () => windowWidth = window.innerWidth);
  //   // document.documentElement.style.width = "";
  //   // document.body.style.width = "";
  //   // document.body.style.overflowX = "";
    

  // });
 
</script>

<div class="w-full flex flex-col text-center space-y-8 bg-white h-screen md:p-24 px-6 py-12" id="landing">
  <!-- Icon -->

  <div class="flex justify-center">
    <div class="w-18 h-18 bg-black text-white text-4xl flex items-center justify-center rounded-xl shadow-md font-bold">
      <img src="https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/logo.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvbG9nby5zdmciLCJpYXQiOjE3NTU2MjI2NjUsImV4cCI6MTc4NzE1ODY2NX0.XRizHSrXZWdCQYoSqkWBv_v9Q5BTDCjGKArRuhjfPho" alt="" class="h-[80%]" style="filter: invert(1);" />
    </div>
  </div>

  <!-- Headline -->
  <h1 class="text-5xl mb-2 font-bold leading-tight">Patient Advocate</h1>
  <p class="font-extralight text-gray-600">An application for creating speedy professional dental proposals</p>

  <!-- Features -->
  <div class="flex flex-col md:flex-row flex-wrap justify-center gap-4 text-sm sm:text-base text-gray-700 max-w-[500px] mx-auto">
    <div class="flex items-center gap-2">
      <div class="rounded-full bg-black h-7 w-7 flex"><span class="m-auto text-white">&#10003;</span></div>
      <span>Optimality</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="rounded-full bg-black h-7 w-7 flex"><span class="m-auto text-white">&#10003;</span></div>
      <span>Team Collaboration</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="rounded-full bg-black h-7 w-7 flex"><span class="m-auto text-white">&#10003;</span></div>
      <span>Transparent Recordkeeping</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="rounded-full bg-black h-7 w-7 flex"><span class="m-auto text-white">&#10003;</span></div>
      <span>Financing Options</span>
    </div>
  </div>
  <div class="flex mx-auto justify-around">
    <div class="flex gap-5">
      <div>
        <a href="/new-form" class="text-sm md:text-md  inline-block bg-black hover:scale-105 text-white px-6 py-3.5 rounded-lg font-semibold shadow-md transition-transform duration-200 animate-wiggle">
          Create Your Proposal
        </a>
      </div>
      <div>
        <a
          href="/dentist-info"
          class="text-sm md:text-md inline-block text-black border-2 px-6 py-3 rounded-lg font-semibold shadow-md transition hover:scale-105 animate-jump"
        >
          Get Help With Your Proposal
        </a>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes wiggle {
    0% {
      transform: rotate(-1deg) scale(1.02);
    }
    20% {
      transform: rotate(1deg) scale(1.03);
    }
    40% {
      transform: rotate(-2deg) scale(1.05);
    }
    60% {
      transform: rotate(2deg) scale(1.05);
    }
    80% {
      transform: rotate(-2deg) scale(1.05);
    }
    100% {
      transform: rotate(0deg) scale(1);
    }
  }
  .animate-wiggle:hover {
    animation: wiggle 0.6s;
  }
  @keyframes jump {
    0% {
      transform: translateY(0);
      animation-timing-function: ease-in;
    }
    20% {
      transform: translateY(-2px);
      animation-timing-function: ease-out;
    }
    40% {
      transform: translateY(-8px);
      animation-timing-function: ease-in;
    }
    60% {
      transform: translateY(-6px);
      animation-timing-function: ease-out;
    }
    80% {
      transform: translateY(-2px);
      animation-timing-function: ease-in;
    }
    100% {
      transform: translateY(0);
      animation-timing-function: ease-out;
    }
  }
  .animate-jump:hover {
    animation: jump 0.6s;
  }
  
</style>
