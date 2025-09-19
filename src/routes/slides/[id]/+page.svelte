<script lang="ts">
  import { AspectRatio } from '$lib/components/ui/aspect-ratio';
  import { Provider } from '$lib/components/ui/tooltip';
  import type { PageData } from './$types';

  export let data: PageData;

  // Get visit data from server-side load function
  $: visitData = data.visitData;
  let scale = 1;

  function updateScale() {
    let tempScale = window.innerWidth / 1400;
    if (tempScale > 1) {
      tempScale = 1;
    }
    scale = tempScale;
  }

  function formatPrice(val: any) {
    if (val === null || val === undefined || isNaN(Number(val))) {
      return "";
    }
    const rounded = Math.ceil(Number(val) / 5) * 5;
    return rounded.toLocaleString();
  }

  function pluralize(word: string, quantity: number): string {
    if (quantity === 1) return word;
    
    // Simple pluralization rules
    if (word.endsWith('y') && !['ay', 'ey', 'iy', 'oy', 'uy'].some(ending => word.endsWith(ending))) {
      return word.slice(0, -1) + 'ies';
    } else if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch') || word.endsWith('x') || word.endsWith('z')) {
      return word + 'es';
    } else {
      return word + 's';
    }
  }

  import { onMount } from 'svelte';

  onMount(() => {
    updateScale();
    window.addEventListener('resize', updateScale);

    return () => {
      window.removeEventListener('resize', updateScale);
    };
  });
</script>

<main class="overflow-auto w-screen flex flex-col items-center justify-center relative">
  {#if visitData}
    <!-- Title Slide -->
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
                <h3 class="text-[30px] font-extralight my-auto ml-[0.2in]">Provided By: {visitData.data?.treatment_plan?.doctor_name} </h3>
              </div>
            </div>
            <span class="bg-white h-[130px] w-[2px] mx-8"></span>
            <div>
              <h3 class="text-[40px] my-auto ml-[0.2in] font-light">Designed for:</h3>
              <h3 class="text-[40px] my-auto ml-[0.2in] font-light">{visitData.data?.treatment_plan?.patient_name || 'Patient'}</h3>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Our Results Slide -->
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

    <!-- Introduction/About Slide -->
    <section class="flex" style="transform: scale({scale});">
      <div class="w-1/2 flex relative">
        <div class="h-[500px] w-[500px] m-auto relative">
          <div class="absolute top-0 left-0 h-[96px] w-[96px] bg-blue-600 z-10 translateY(-100%)"></div>
          <img src="https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/4916.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvNDkxNi5qcGciLCJpYXQiOjE3NTY1MDg5OTgsImV4cCI6MjA3MTg2ODk5OH0.3-xobtD2Wl1vslQLnR-z3grhWaFwjk8LLsStzkytafo" alt="" class="absolute h-[556px] object-cover object-[-200px] p-8 z-20" />
          <div class="absolute right-0 w-[96px] h-[96px] bg-blue-600 z-10" style="top: 0; transform: translateY(480%);"></div>
        </div>
      </div>
      <div class="w-1/2 flex flex-col">
        <div class="max-w-[80%] m-auto pr-6 text-lg font-extralight leading-[23px] text-gray-800">
          <p>
            Thank you for your visit to SmileDesign Manhattan. This visit report provides a comprehensive overview of your dental care experience. 
            Our commitment is to provide exceptional dental care with the highest level of service and aesthetic results.
          </p>
          <br />
          <p>
            Our mutual goal is to achieve total health of the oral cavity (teeth, gums, bony support) with the highest possible level of aesthetic, 
            and in the most efficient way. Our team offers all adult dental specialties per the need of the patient.
          </p>
        </div>
      </div>
    </section>

    <!-- Visit Details Slide -->
    <section style="transform: scale({scale});" class="flex">
      <div class="flex flex-col m-auto w-[80%]">
        <div class="text-center mb-8">
          <h2 class="text-[60px] text-blue-400 font-light mb-4">Visit Summary</h2>
          <img src="https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/logo.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvbG9nby5zdmciLCJpYXQiOjE3NTU1ODE2ODgsImV4cCI6MjA3MDk0MTY4OH0.eUmDBO37_ktSN8bqEKUAbva2ly82QAHx3GaDaz2jvck" alt="" class="h-[100px] w-[100px] mx-auto mb-8" />
        </div>
        
        <div class="grid grid-cols-2 gap-8 text-2xl">
          {#if visitData.data?.treatment_plan?.patient_name}
            <div class="bg-gray-50 p-6 rounded-lg">
              <h3 class="font-bold text-blue-600 mb-2">Patient Name</h3>
              <p class="text-gray-800">{visitData.data.treatment_plan.patient_name}</p>
            </div>
          {/if}
          
          {#if visitData.data?.visitdate}
            <div class="bg-gray-50 p-6 rounded-lg">
              <h3 class="font-bold text-blue-600 mb-2">Visit Date</h3>
              <p class="text-gray-800">{(() => {
                const [year, month, day] = visitData.data.visitdate.split('-');
                const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                return date.toLocaleDateString();
              })()}</p>
            </div>
          {/if}
          
          {#if visitData.data?.treatment_plan?.doctor_name}
            <div class="bg-gray-50 p-6 rounded-lg">
              <h3 class="font-bold text-blue-600 mb-2">Attending Doctor</h3>
              <p class="text-gray-800">{visitData.data.treatment_plan.doctor_name}</p>
            </div>
          {/if}
          
          {#if visitData.data?.visitid}
            <div class="bg-gray-50 p-6 rounded-lg">
              <h3 class="font-bold text-blue-600 mb-2">Visit ID</h3>
              <p class="text-gray-800">{visitData.data.visitid}</p>
            </div>
          {/if}
        </div>
      </div>
    </section>

    <!-- Quote Slide -->
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

    <!-- Core Values Slide -->
    <section style="transform: scale({scale});">
      <div class="flex mt-32">
        <div class="w-1/2 flex flex-col gap-4">
          <img src="https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/5036.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvNTAzNi5qcGciLCJpYXQiOjE3NTY1MDg4MTcsImV4cCI6MjA3MTg2ODgxN30.rhRJ3rQwty__F47NPQNPoxrVkBy1xnweYYg0ZPG914c" alt="" class="h-[550px] w-[450px] m-auto object-cover" />
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


    <!-- Individual Photo Slides (one photo per slide) -->
    {#if visitData.data?.treatment_plan?.images && visitData.data.treatment_plan.images.length > 0}
      {#each visitData.data.treatment_plan.images as image}
        <section style="transform: scale({scale});" class="flex">
          <div class="flex flex-col m-auto w-[70%]">
            <div class="text-center mb-8  gap-6">
              <h2 class="text-[60px] text-blue-400 font-light mb-4 capitalize">Photos</h2>
             </div>
            
            <div class="flex flex-col items-center">
              <div class="bg-gray-50 p-6 rounded-lg shadow-md max-w-full">
                <img 
                  src={(() => {
                    if (image.image_data.startsWith('\\x')) {
                      // Convert hex string to actual string
                      const hexString = image.image_data.replace(/\\x/g, '');
                      let decoded = '';
                      for (let i = 0; i < hexString.length; i += 2) {
                        decoded += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));
                      }
                      return decoded;
                    } else if (image.image_data.startsWith('data:')) {
                      return image.image_data;
                    } else {
                      return `data:${image.mime_type || 'image/jpeg'};base64,${image.image_data}`;
                    }
                  })()}
                  alt={image.image_name || `${image.image_type} photo`}
                  class="max-w-full max-h-[600px] object-contain rounded"
                />
              </div>
              
               
            </div>
          </div>
        </section>
      {/each}
    {/if}

    <!-- Fallback for visitimages if treatment_plan.images is not available -->
    {#if visitData.data?.visitimages && visitData.data.visitimages.length > 0 && (!visitData.data?.treatment_plan?.images || visitData.data.treatment_plan.images.length === 0)}
      {#each visitData.data.visitimages as image}
        <section style="transform: scale({scale});" class="flex">
          <div class="flex flex-col m-auto w-[70%]">
            <div class="text-center mb-8">
              <h2 class="text-[60px] text-blue-400 font-light mb-4 capitalize">Photos</h2>
              <img src="https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/logo.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvbG9nby5zdmciLCJpYXQiOjE3NTU1ODE2ODgsImV4cCI6MjA3MDk0MTY4OH0.eUmDBO37_ktSN8bqEKUAbva2ly82QAHx3GaDaz2jvck" alt="" class="h-[100px] w-[100px] mx-auto mb-8" />
            </div>
            
            <div class="flex flex-col items-center">
              <div class="bg-gray-50 p-6 rounded-lg shadow-md max-w-full">
                <img 
                  src={(() => {
                    if (image.image_data.startsWith('\\x')) {
                      // Convert hex string to actual string
                      const hexString = image.image_data.replace(/\\x/g, '');
                      let decoded = '';
                      for (let i = 0; i < hexString.length; i += 2) {
                        decoded += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));
                      }
                      return decoded;
                    } else if (image.image_data.startsWith('data:')) {
                      return image.image_data;
                    } else {
                      return `data:${image.mime_type || 'image/jpeg'};base64,${image.image_data}`;
                    }
                  })()}
                  alt={image.image_name || `${image.image_type} photo`}
                  class="max-w-full max-h-[600px] object-contain rounded"
                />
              </div>
              
              {#if image.image_name}
                <p class="text-2xl text-gray-600 mt-6 font-medium">{image.image_name}</p>
              {/if}
            </div>
          </div>
        </section>
      {/each}
    {/if}

    <!-- Treatment Summary Slide -->
    {#if visitData.data?.treatment_plan?.options && visitData.data.treatment_plan.options.length > 0}
      {#each visitData.data.treatment_plan.options as plan, idx}
        <section class="flex" style="transform: scale({scale});">
          <div class="flex flex-col m-auto w-[60%]">
            <div class="text-center text-gray-500 text-lg mb-4 tracking-widest">-VALID FOR 1 MONTH-</div>
            <div class="text-center mb-[32px]">
              <div class="text-2xl font-bold underline mb-[8px] tracking-wide">Comprehensive Problem Focused Solution: {plan.name || `Option ${idx + 1}`}</div>
              {#each plan.items as item}
                <div class="font-extralight text-2xl tracking-wide">
                  {pluralize(item.name, item.quantity)}{item.teeth ? ` (${item.teeth.split(',').map((tooth: string) => `#${tooth.trim()}`).join(', ')})` : ""}
                  {item.quantity && item.quantity > 1 ? ` x${item.quantity}` : ""}
                  {item.cost ? ` $${formatPrice(Number(item.cost) * (item.quantity || 1))}` : ""}
                </div>
              {/each}
            </div>
            <div class="text-center mb-[24px]">
              <div class="text-3xl font-bold">
                Treatment Total:
                {#if Number(plan.case_fee) > 0}
                  <span class="line-through text-gray-500">
                    ${formatPrice(plan.items.reduce((sum: number, item: any) => sum + (Number(item.cost) || 0) * (item.quantity || 1), 0))}
                  </span>
                  <div class="text-4xl font-bold text-blue-700 mt-2">
                    Case Fee: <span class="underline">${formatPrice(plan.case_fee)}</span>
                  </div>
                {:else}
                  <span class="underline">
                    ${formatPrice(plan.items.reduce((sum: number, item: any) => sum + (Number(item.cost) || 0) * (item.quantity || 1), 0))}
                  </span>
                {/if}
              </div>
              {#if visitData.data?.treatment_plan?.insurance_coverage}
                <div class="text-2xl font-semibold text-blue-700">
                  Insurance Coverage: - ${formatPrice(visitData.data.treatment_plan.insurance_coverage)}
                </div>
                <div class="text-2xl font-bold">
                  Balance After Insurance:
                  <span class="underline">
                    ${formatPrice((Number(plan.case_fee) > 0 ? Number(plan.case_fee) : plan.items.reduce((sum: number, item: any) => sum + (Number(item.cost) || 0) * (item.quantity || 1), 0)) - (Number(visitData.data.treatment_plan.insurance_coverage) || 0))}
                  </span>
                </div>
              {/if}
              {#if Number(visitData.data?.treatment_plan?.courtesy_amount)}
                <div class="text-2xl font-semibold text-blue-700">
                  Courtesy Discount {visitData.data.treatment_plan.courtesy_amount}%: - ${formatPrice(((Number(plan.case_fee) > 0 ? Number(plan.case_fee) : plan.items.reduce((sum: number, item: any) => sum + (Number(item.cost) || 0) * (item.quantity || 1), 0)) - (Number(visitData.data.treatment_plan.insurance_coverage) || 0)) * (visitData.data.treatment_plan.courtesy_amount / 100))}
                </div>
                <div class="text-2xl font-bold">
                  Balance After Courtesy:
                  <span class="underline">
                    ${formatPrice(((Number(plan.case_fee) > 0 ? Number(plan.case_fee) : plan.items.reduce((sum: number, item: any) => sum + (Number(item.cost) || 0) * (item.quantity || 1), 0)) - (Number(visitData.data.treatment_plan.insurance_coverage) || 0)) * (1 - (visitData.data.treatment_plan.courtesy_amount || 0) / 100))}
                  </span>
                </div>
              {/if}
            </div>
            {#if Number(visitData.data?.treatment_plan?.discount)}
              <div class="text-center mb-[32px] text-2xl">
                <span class="font-bold text-blue-700 underline italic">
                  Professional Courtesy {visitData.data.treatment_plan.discount}%: Treatment Offered at $
                  {formatPrice(
                    (((Number(plan.case_fee) > 0 ? Number(plan.case_fee) : plan.items.reduce((sum: number, item: any) => sum + (Number(item.cost) || 0) * (item.quantity || 1), 0)) - (Number(visitData.data.treatment_plan.insurance_coverage) || 0)) * (1 - (visitData.data.treatment_plan.courtesy_amount || 0) / 100)) *
                    (1 - (visitData.data.treatment_plan.discount || 0) / 100)
                  )}
                </span>
              </div>
            {/if}
            <div class="text-center mb-[8px] text-2xl">
              <span class="font-semibold text-blue-700">*Insurance to reimburse office*</span>
            </div>
            <div class="flex flex-row justify-center mb-[32px] mx-auto w-full font-bold">
              <div class="bg-blue-700 text-white p-[20px] flex-1 min-w-[350px] text-center">
                <div class=" text-[30px] underline mb-[8px] font-black">Interest-Free Financing</div>
                <div class="text-xl mb-[4px]">
                  12 months: $
                  {formatPrice(
                    ((((Number(plan.case_fee) > 0 ? Number(plan.case_fee) : plan.items.reduce((sum: number, item: any) => sum + (Number(item.cost) || 0) * (item.quantity || 1), 0)) - (Number(visitData.data.treatment_plan.insurance_coverage) || 0)) * (1 - (visitData.data.treatment_plan.courtesy_amount || 0) / 100)) * (1 - (visitData.data.treatment_plan.discount || 0) / 100)) /
                    12
                  )} per month
                </div>
                <div class="text-xl">
                  24 months: $
                  {formatPrice(
                    ((((Number(plan.case_fee) > 0 ? Number(plan.case_fee) : plan.items.reduce((sum: number, item: any) => sum + (Number(item.cost) || 0) * (item.quantity || 1), 0)) - (Number(visitData.data.treatment_plan.insurance_coverage) || 0)) * (1 - (visitData.data.treatment_plan.courtesy_amount || 0) / 100)) * (1 - (visitData.data.treatment_plan.discount || 0) / 100)) /
                    24
                  )} per month
                </div>
              </div>
              <div class="bg-blue-700 text-white p-[20px] flex-1 min-w-[250px] text-center font-bold">
                <div class="font-black text-xl underline mb-[8px] text-[30px]">10% Off Offer</div>
                <div class="text-xl mb-[4px]">
                  Prepayment or Cash Payment: $
                  {formatPrice(
                    (((Number(plan.case_fee) > 0 ? Number(plan.case_fee) : plan.items.reduce((sum: number, item: any) => sum + (Number(item.cost) || 0) * (item.quantity || 1), 0)) - (Number(visitData.data.treatment_plan.insurance_coverage) || 0)) * (1 - (visitData.data.treatment_plan.courtesy_amount || 0) / 100)) *
                    (1 - (visitData.data.treatment_plan.discount || 0) / 100) *
                    0.9
                  )}
                </div>
                <div class="text-xl">
                  Your Discount Savings: $
                  {formatPrice(
                    (((Number(plan.case_fee) > 0 ? Number(plan.case_fee) : plan.items.reduce((sum: number, item: any) => sum + (Number(item.cost) || 0) * (item.quantity || 1), 0)) - (Number(visitData.data.treatment_plan.insurance_coverage) || 0)) * (1 - (visitData.data.treatment_plan.courtesy_amount || 0) / 100)) *
                    (1 - (visitData.data.treatment_plan.discount || 0) / 100) *
                    0.1
                  )}
                </div>
              </div>
            </div>
            <div class="text-center mt-[16px] flex flex-col">
              <div class="text-2xl font-bold italic underline mb-[8px]">Payment Arrangements</div>
              <div class="flex gap-4 mx-auto">
                <a href="https://pay.withcherry.com/smile-design-manhattan" class="text-2xl font-extralight hover:underline text-blue">Cherry Financing</a>
                <a href="https://www.clover.com/pay-widgets/10fae621-b0f5-44ee-b3a1-1e317b094763" class="text-2xl font-extralight hover:underline text-blue">Clover</a>
              </div>
            </div>
          </div>
        </section>
      {/each}
    {/if}
 


    <!-- Community/Testimonials Slide -->
    <section style="transform: scale({scale});">
      <div class="flex">
        <h2 class="text-7xl font-bold m-12">Join Our Community</h2>
        <button class="bg-blue-500 text-white px-4 py-2 rounded-xl h-16 w-60 my-auto ml-auto mr-12">
          <a href="https://app.nexhealth.com/appt/smiledesignmanhattan?lid=23535&rwg_token=ACgRB3cdDewSch6PkpYzPlMN2Tb0CKoSen5CDXEQMUwq3P-Hou0Rs1va5ZUfF1QNbV21AUz-oxd2LlRETjdzwD13Ae5LBDpt2w%3D%3D">
            Schedule an Appointment
          </a>
        </button>
      </div>
      <div class="flex">
        <div class="flex flex-col w-1/3">
          <img src="https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/1010.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvMTAxMC5qcGciLCJpYXQiOjE3NTY1MDg5MDQsImV4cCI6MjA3MTg2ODkwNH0.7_JdwmYvHSj633mYXTHKI4hQzIlfX_TaYmHSo0aR7uc" alt="" class="h-[450px] w-[350px] mx-auto object-cover" />
          <p class="max-w-[350px] text-2xl mx-auto mt-6">"I skipped the dentist for ten years, now I come every three months." -Smith Jones</p>
        </div>
        <div class="flex flex-col w-1/3">
          <img src="https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/7893.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvNzg5My5wbmciLCJpYXQiOjE3NTU1ODA5NDAsImV4cCI6MTc4NzExNjk0MH0.Ag2B9-Oqwlz6XwfnITcbw2gZUUIaY8XGlycgcsaZeII" alt="" class="h-[450px] w-[350px] mx-auto object-cover" />
          <p class="max-w-[350px] text-2xl mx-auto mt-6">"Smile Design is truly a blessing" -Jane Slotinskyl</p>
        </div>
        <div class="flex flex-col w-1/3">
          <img src="https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/1009.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvMTAwOS5qcGciLCJpYXQiOjE3NTY1MDg2ODksImV4cCI6MjA3MTg2ODY4OX0.RhjDlkiny1pxlXy9e2KhnMlEiUr-FfxS3SxOlN2SWJc" alt="" class="h-[450px] w-[350px] mx-auto object-cover" />
          <p class="max-w-[350px] text-2xl mx-auto mt-6">"New York's Top Dentist By Far." -Vondie Hall</p>
        </div>
      </div>
    </section>
 
<!--  -->

    <!-- Raw Data Slide (for debugging) -->
    <!-- <section style="transform: scale({scale});" class="flex">
      <div class="flex flex-col m-auto w-[90%]">
        <div class="text-center mb-4">
          <h2 class="text-[40px] text-blue-400 font-light mb-4">Complete Visit Data</h2>
          <img src="https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/logo.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvbG9nby5zdmciLCJpYXQiOjE3NTU1ODE2ODgsImV4cCI6MjA3MDk0MTY4OH0.eUmDBO37_ktSN8bqEKUAbva2ly82QAHx3GaDaz2jvck" alt="" class="h-[80px] w-[80px] mx-auto mb-4" />
        </div>
        
        <div class="bg-gray-100 p-4 rounded-lg overflow-auto">
          <pre class="text-sm text-gray-800 whitespace-pre-wrap">{JSON.stringify(visitData, null, 2)}</pre>
        </div>
      </div>
    </section> -->

  {:else}
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-2xl text-red-600">Failed to load visit data</div>
    </div>
  {/if}
</main>

<style>
  @media print {
    section {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      transform: scale(1) !important; /* Force full scale when printing */
    }
  }

  section {
    min-width: 1400px;
    max-width: 1400px;
    min-height: 850px;
    max-height: 850px;
    overflow: visible;
    page-break-after: always;
    background-color: white;
  }

  .text-shadow-xl {
    text-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
</style>
