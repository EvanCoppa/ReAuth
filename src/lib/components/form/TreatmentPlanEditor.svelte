<script lang="ts">
  import { fly } from "svelte/transition";
  import SearchableItemSelector from "./SearchableItemSelector.svelte";
  import TeethNumberInput from "./TeethNumberInput.svelte";
  
  interface TreatmentItem {
    name: string;
    cost: number;
    code: string;
  }
  
  interface PlanItem extends TreatmentItem {
    teeth?: string;
    na?: boolean;
  }
  
  interface Plan {
    name: string;
    items: PlanItem[];
    codeInput?: string;
    codes?: string[];
  }
  
  interface PopularPlan {
    name: string;
    items: TreatmentItem[];
  }
  
  export let plan: Plan;
  export let planIndex: number;
  export let popularPlans: PopularPlan[] = [];
  export let treatmentItems: TreatmentItem[] = [];
  export let allTreatmentItems: TreatmentItem[] = [];
  
  // Handle quick select for popular plans
  function quickSelect(popularIdx: number) {
    plan.items = popularPlans[popularIdx].items.map((item) => ({
      ...item,
      teeth: "",
      na: false,
    }));
    plan = { ...plan }; // trigger reactivity
  }
  
  // Handle item toggle from checkboxes
  function toggleItem(item: TreatmentItem) {
    const exists = plan.items.some((i) => i.code === item.code);
    if (!exists) {
      plan.items = [...plan.items, { ...item, teeth: "", na: false }];
    } else {
      plan.items = plan.items.filter((i) => i.code !== item.code);
    }
    plan = { ...plan };
  }
  
  // Handle adding item from searchable selector
  function handleItemAdd(item: TreatmentItem) {
    if (!plan.codes?.includes(item.code)) {
      plan.codes = [...(plan.codes || []), item.code];
    }
    if (!plan.items.some((i) => i.code === item.code)) {
      plan.items = [...plan.items, { ...item, teeth: "", na: false }];
    }
    plan = { ...plan };
  }
  
  // Handle removing item from searchable selector
  function handleItemRemove(code: string) {
    plan.codes = plan.codes?.filter(c => c !== code) || [];
    plan.items = plan.items.filter(i => i.code !== code);
    plan = { ...plan };
  }
  
  // Handle teeth input changes
  function handleTeethChange(itemIndex: number, newValue: string) {
    plan.items[itemIndex].teeth = newValue;
    plan = { ...plan };
  }
  
  // Handle N/A toggle
  function handleNAChange(itemIndex: number, isNA: boolean) {
    plan.items[itemIndex].na = isNA;
    if (isNA) {
      plan.items[itemIndex].teeth = "";
    }
    plan = { ...plan };
  }
</script>

<fieldset class="border border-gray-300 rounded-md p-4 space-y-4" in:fly={{ y: 30, duration: 350, opacity: 0.2 }}>
  <legend class="font-bold text-blue-700 mb-0">Treatment Plan {planIndex + 1}</legend>
  
  <label class="block text-gray-700 font-semibold">
    Plan Name:
    <input
      type="text"
      placeholder={`Option ${planIndex + 1}`}
      bind:value={plan.name}
      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus-visible:border-blue-500/70 focus-visible:ring-blue-500/65 focus-visible:ring-[1.5px]"
    />
  </label>
  
  <div class="flex flex-col gap-2">
    <span class="text-gray-600 font-medium pb-2">Quick Select:</span>
    <div class="flex flex-wrap gap-2 items-center">
      {#each popularPlans as popularPlan, idx}
        <button 
          type="button" 
          class="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-3 py-1 rounded transition" 
          on:click={() => quickSelect(idx)}
        >
          {popularPlan.name}
        </button>
      {/each}
    </div>
  </div>

  <SearchableItemSelector
    {allTreatmentItems}
    selectedCodes={plan.codes || []}
    onItemAdd={handleItemAdd}
    onItemRemove={handleItemRemove}
  />

  <div class="flex flex-wrap gap-4">
    <span class="text-gray-600 font-medium w-full">Items:</span>
    {#each treatmentItems as item}
      <label class="inline-flex items-center space-x-2">
        <input 
          type="checkbox" 
          checked={plan.items.some((i) => i.code === item.code)} 
          on:change={() => toggleItem(item)} 
          class="form-checkbox h-5 w-5 text-blue-600" 
        />
        <span>{item.name}</span>
      </label>
    {/each}
  </div>

  <!-- Teeth numbers for selected items -->
  <div class="flex flex-col gap-2 mt-6">
    {#each plan.items as selectedItem, selIdx (selectedItem.code)}
      <TeethNumberInput
        bind:value={selectedItem.teeth}
        bind:isNA={selectedItem.na}
        itemName={selectedItem.name}
        on:change={() => handleTeethChange(selIdx, selectedItem.teeth || "")}
        on:naToggle={() => handleNAChange(selIdx, selectedItem.na || false)}
      />
    {/each}
  </div>
</fieldset>