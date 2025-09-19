<script lang="ts">
  import { fade } from "svelte/transition";
  import { enhance } from "$app/forms";
  import { toastStore } from "$lib/toast";
  import { invalidateAll } from "$app/navigation";

  let { data, form } = $props();

  interface Provider {
    id?: number;
    firstname: string;
    lastname: string;
  }
  interface QuickPlan {
    id?: number;
    name: string;
    codes: string[];
  }
  interface Billable {
    name: string;
    cost: number;
    code: string;
  }

  let providers = $state([...data.providers] as Provider[]);
  let displayCodes = $state([...data.displayCodes]);
  let quickPlans = $state([...data.quickPlans] as QuickPlan[]);
  let allItems: Billable[] = data.billables;

  let treatmentSearchTerm = $state("");
  let quickPlanSearchTerms = $state<string[]>([]);
  let displayCodesForm: HTMLFormElement;

  // Form element references
  let providerForms: HTMLFormElement[] = [];
  let quickPlanForms: HTMLFormElement[] = [];

  $effect(() => {
    if (form?.success && form?.message) {
      toastStore.success(form.message);
    } else if (form?.error) {
      toastStore.error(form.error);
    }
  });

  $effect(() => {
    quickPlanSearchTerms = new Array(quickPlans.length).fill("");
  });

  let filteredTreatmentItems = $derived(
    allItems.filter((item) => treatmentSearchTerm === "" || item.name.toLowerCase().includes(treatmentSearchTerm.toLowerCase()) || item.code.toLowerCase().includes(treatmentSearchTerm.toLowerCase()))
  );

  function getFilteredItemsForPlan(planIndex: number) {
    const searchTerm = quickPlanSearchTerms[planIndex] || "";
    return allItems.filter((item) => searchTerm === "" || item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.code.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  function addDoctor() {
    providers = [...providers, { firstname: "", lastname: "" }];
  }

  function addQuickPlan() {
    quickPlans = [...quickPlans, { name: "New Plan", codes: [] }];
    quickPlanSearchTerms = [...quickPlanSearchTerms, ""];
  }

  function removeQuickPlanLocal(i: number) {
    quickPlans.splice(i, 1);
    quickPlans = [...quickPlans];
    quickPlanSearchTerms.splice(i, 1);
    quickPlanSearchTerms = [...quickPlanSearchTerms];
  }

  function removeProviderLocal(i: number) {
    providers.splice(i, 1);
    providers = [...providers];
  }

  function toggleCodeLocal(code: string) {
    if (displayCodes.includes(code)) {
      displayCodes = displayCodes.filter((c) => c !== code);
    } else {
      displayCodes = [...displayCodes, code];
    }
  }

  function togglePlanCodeLocal(pIdx: number, code: string) {
    const plan = quickPlans[pIdx];
    if (plan.codes.includes(code)) {
      plan.codes = plan.codes.filter((c) => c !== code);
    } else {
      plan.codes = [...plan.codes, code];
    }
    quickPlans = [...quickPlans];
  }

  // Debounce function for input changes
  let saveTimeouts: { [key: string]: NodeJS.Timeout } = {};

  function debouncedSubmit(key: string, formElement: HTMLFormElement, delay = 500) {
    if (saveTimeouts[key]) {
      clearTimeout(saveTimeouts[key]);
    }
    saveTimeouts[key] = setTimeout(() => {
      formElement.requestSubmit();
    }, delay);
  }
</script>

<main class="min-h-screen bg-gray-50 p-6">
  <div class=" mx-auto space-y-8">
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
          <p class="text-gray-600 mt-1">Manage your practice settings and configurations - changes save automatically</p>
        </div>
        <div class="flex items-center gap-2 text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span class="text-sm font-medium">Auto-save enabled</span>
        </div>
      </div>
    </div>

    <!-- Providers Section -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        Doctors
      </h2>
      <div class="space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="text-sm font-medium text-gray-700">First Name</div>
          <div class="text-sm font-medium text-gray-700">Last Name</div>
        </div>

        {#each providers as provider, i}
          <div class="flex items-center gap-3">
            <form
              method="POST"
              action="?/{provider.id ? 'updateProvider' : 'createProvider'}"
              bind:this={providerForms[i]}
              use:enhance={({ formData }) => {
                if (provider.id) {
                  formData.append("id", provider.id.toString());
                }
                return async ({ result, update }) => {
                  if (result.type === "success") {
                    await invalidateAll();
                  }
                  update();
                };
              }}
              class="flex items-center gap-3 flex-1"
            >
              <input
                name="firstname"
                class="border border-gray-300 rounded-md px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                bind:value={provider.firstname}
                placeholder="Enter first name"
                oninput={() => {
                  if (provider.id && providerForms[i]) {
                    debouncedSubmit(`provider-${i}`, providerForms[i]);
                  }
                }}
              />
              <input
                name="lastname"
                class="border border-gray-300 rounded-md px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                bind:value={provider.lastname}
                placeholder="Enter last name"
                oninput={() => {
                  if (provider.id && providerForms[i]) {
                    debouncedSubmit(`provider-${i}`, providerForms[i]);
                  }
                }}
              />
              {#if !provider.id}
                <button
                  type="submit"
                  class="bg-green-500 hover:bg-green-600 text-white rounded-md px-3 py-2 transition"
                  aria-label="Save doctor"
                  title="Save doctor"
                  transition:fade={{ duration: 300 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              {/if}
            </form>

            {#if provider.id}
              <form
                method="POST"
                action="?/deleteProvider"
                use:enhance={({ formData }) => {
                  if (provider.id) {
                    formData.append("id", provider.id.toString());
                  }
                  return async ({ result, update }) => {
                    if (result.type === "success") {
                      removeProviderLocal(i);
                      await invalidateAll();
                    }
                    update();
                  };
                }}
              >
                <button type="submit" class="bg-red-500 hover:bg-red-600 text-white rounded-md px-3 py-2 transition" aria-label="Remove doctor" title="Remove doctor">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </form>
            {:else}
              <button class="bg-red-500 hover:bg-red-600 text-white rounded-md px-3 py-2 transition" onclick={() => removeProviderLocal(i)} aria-label="Remove doctor" title="Remove doctor">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            {/if}
          </div>
        {/each}
      </div>
      <button class="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 mt-4 transition flex items-center gap-2 font-medium" onclick={addDoctor}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Doctor
      </button>
    </div>

    <!-- Treatment Items Section -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mt-2">
      <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        Treatment Items Shown
      </h2>

      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search treatment items..."
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          bind:value={treatmentSearchTerm}
        />
      </div>

      <form
        method="POST"
        action="?/updateDisplayCodes"
        bind:this={displayCodesForm}
        use:enhance={({ formData }) => {
          displayCodes.forEach((code) => {
            formData.append("codes", code);
          });
          return async ({ result, update }) => {
            if (result.type === "success") {
              update({ invalidateAll: false, reset: false });
              // optional: setTimeout(() => invalidateAll(), 500);
            } else {
              update(); // keep default handling for errors
            }
          };
        }}
      >
        <div class="border rounded-lg shadow-sm bg-white overflow-hidden mt-2">
          <div class="max-h-[600px] overflow-y-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Selected </th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Code </th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Description </th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Cost </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each filteredTreatmentItems as item}
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        class="accent-blue-600 w-4 h-4 rounded"
                        checked={displayCodes.includes(item.code)}
                        onchange={() => {
                          toggleCodeLocal(item.code);
                          if (displayCodesForm) {
                            debouncedSubmit("displayCodes", displayCodesForm, 300);
                          }
                        }}
                      />
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <span class="font-mono text-blue-700 font-semibold text-sm">{item.code}</span>
                    </td>
                    <td class="px-4 py-3">
                      <span class="text-gray-900 text-sm">{item.name}</span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <span class="text-gray-600 text-sm">${item.cost.toLocaleString()}</span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
            {#if filteredTreatmentItems.length === 0}
              <div class="text-center py-8 text-gray-500">
                <svg class="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2-5H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2z"
                  />
                </svg>
                <p class="mt-2">No treatment items found matching "{treatmentSearchTerm}"</p>
              </div>
            {/if}
          </div>
        </div>
      </form>

      {#if displayCodes.length > 0}
        <div class="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
          <h4 class="text-sm font-medium text-blue-800 mb-2">Selected Treatment Items ({displayCodes.length}):</h4>
          <div class="flex flex-wrap gap-2">
            {#each displayCodes as code}
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {code}
                <button
                  class="ml-1 text-blue-600 hover:text-blue-800"
                  onclick={() => {
                    toggleCodeLocal(code);
                    if (displayCodesForm) {
                      debouncedSubmit("displayCodes", displayCodesForm, 300);
                    }
                  }}
                  title="Remove {code}"
                  aria-label="Remove {code}"
                >
                  <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </button>
              </span>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Quick Plans Section -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Quick Plans
      </h2>
      <div class="space-y-4">
        {#each quickPlans as plan, pIdx}
          <div class="border rounded-lg shadow-sm bg-gray-50 p-6 space-y-4">
            <div class="flex items-center gap-3">
              <form
                method="POST"
                action="?/{plan.id ? 'updateQuickPlan' : 'createQuickPlan'}"
                bind:this={quickPlanForms[pIdx]}
                use:enhance={({ formData }) => {
                  if (plan.id) {
                    formData.append("id", plan.id.toString());
                  }
                  plan.codes.forEach((code) => {
                    formData.append("codes", code);
                  });
                  return async ({ result, update }) => {};
                }}
                class="flex-1"
              >
                <input
                  name="name"
                  class="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  bind:value={plan.name}
                  placeholder="Plan Name"
                  oninput={() => {
                    if (quickPlanForms[pIdx]) {
                      debouncedSubmit(`quickplan-${pIdx}`, quickPlanForms[pIdx]);
                    }
                  }}
                />
              </form>

              {#if plan.id}
                <form
                  method="POST"
                  action="?/deleteQuickPlan"
                  use:enhance={({ formData }) => {
                    if (plan.id) {
                      formData.append("id", plan.id.toString());
                    }
                    return async ({ result, update }) => {
                      if (result.type === "success") {
                        removeQuickPlanLocal(pIdx);
                        await invalidateAll();
                      }
                      update();
                    };
                  }}
                >
                  <button type="submit" class="bg-red-500 hover:bg-red-600 text-white rounded-md px-3 py-2 transition flex items-center gap-2" aria-label="Remove quick plan" title="Remove quick plan">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Remove Plan
                  </button>
                </form>
              {:else}
                <button
                  class="bg-red-500 hover:bg-red-600 text-white rounded-md px-3 py-2 transition flex items-center gap-2"
                  onclick={() => removeQuickPlanLocal(pIdx)}
                  aria-label="Remove quick plan"
                  title="Remove quick plan"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Remove Plan
                </button>
              {/if}
            </div>

            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search items for this plan..."
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                bind:value={quickPlanSearchTerms[pIdx]}
              />
            </div>

            <div class="border rounded-lg bg-gray-50 overflow-hidden">
              <div class="max-h-[525px] overflow-y-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-100 sticky top-0">
                    <tr>
                      <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Include </th>
                      <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Code </th>
                      <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Description </th>
                      <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Cost </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each getFilteredItemsForPlan(pIdx) as item}
                      <tr class="hover:bg-blue-50 transition-colors">
                        <td class="px-3 py-2 whitespace-nowrap">
                          <input
                            type="checkbox"
                            class="accent-blue-600 w-4 h-4 rounded"
                            checked={plan.codes.includes(item.code)}
                            onchange={() => {
                              togglePlanCodeLocal(pIdx, item.code);
                              if (quickPlanForms[pIdx]) {
                                debouncedSubmit(`quickplan-${pIdx}`, quickPlanForms[pIdx], 300);
                              }
                            }}
                          />
                        </td>
                        <td class="px-3 py-2 whitespace-nowrap">
                          <span class="font-mono text-blue-700 font-semibold text-sm">{item.code}</span>
                        </td>
                        <td class="px-3 py-2">
                          <span class="text-gray-900 text-sm">{item.name}</span>
                        </td>
                        <td class="px-3 py-2 whitespace-nowrap">
                          <span class="text-gray-600 text-sm">${item.cost.toLocaleString()}</span>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
                {#if getFilteredItemsForPlan(pIdx).length === 0}
                  <div class="text-center py-6 text-gray-500">
                    <svg class="mx-auto h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2-5H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2z"
                      />
                    </svg>
                    <p class="mt-1 text-sm">No items found matching "{quickPlanSearchTerms[pIdx]}"</p>
                  </div>
                {/if}
              </div>
            </div>

            {#if plan.codes.length > 0}
              <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
                <h4 class="text-sm font-medium text-blue-800 mb-2">Selected Items ({plan.codes.length}):</h4>
                <div class="flex flex-wrap gap-2">
                  {#each plan.codes as code}
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {code}
                      <button
                        class="ml-1 text-blue-600 hover:text-blue-800"
                        onclick={() => {
                          togglePlanCodeLocal(pIdx, code);
                          if (quickPlanForms[pIdx]) {
                            debouncedSubmit(`quickplan-${pIdx}`, quickPlanForms[pIdx], 300);
                          }
                        }}
                        title="Remove {code}"
                        aria-label="Remove {code}"
                      >
                        <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                          ></path>
                        </svg>
                      </button>
                    </span>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
      <button class="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 mt-4 transition flex items-center gap-2 font-medium" onclick={addQuickPlan}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Quick Plan
      </button>
    </div>
  </div>
</main>
