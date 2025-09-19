<script lang="ts">
  import { fly } from "svelte/transition";
  import SearchableItemSelector from "./SearchableItemSelector.svelte";
  import TeethNumberInput from "./TeethNumberInput.svelte";
  import type { TreatmentItem, QuickTreatmentPlan, Billable, Plan } from "$lib/types";
  
  // Form-specific treatment plan type with required fields for form editing

  let {
    plan = $bindable(),
    planIndex,
    popularPlans = [],
    treatmentItems = [],
    allTreatmentItems = [],
    planNames = $bindable(),
    caseFees = $bindable()
  }: {
    plan: Plan;
    planIndex: number;
    popularPlans?: QuickTreatmentPlan[];
    treatmentItems?: Billable[];
    allTreatmentItems?: Billable[];
    planNames: string[];
    caseFees: number;
  } = $props();
    // Helper function to convert Billable to TreatmentItem
  function billableToTreatmentItem(billable: Billable): TreatmentItem {
    return {
      name: billable.description,
      cost: billable.cost,
      code: billable.billable_code,
      teeth: '',
      na: false,
      index: planIndex
    };
  }


  // Check if a TreatmentItem has an equivalent already in the plan for this specific planIndex
  function hasEquivalentInPlan(item: TreatmentItem | Billable): boolean {
    const code = 'billable_code' in item ? item.billable_code : item.code;
    return plan.items
      .filter(existingItem => existingItem.index === planIndex)
      .some(existingItem => existingItem.code === code);
  }

  // Handle quick select for popular plans
  function quickSelect(popularIdx: number) {
    const quickPlan = popularPlans[popularIdx];
    if (quickPlan.billables) {
      // Remove existing items for this planIndex only, keeping items from other plan indices
      const itemsFromOtherPlans = plan.items.filter(item => item.index !== planIndex);
      
      // Add new items from the selected quick plan
      const newItems = quickPlan.billables.map((billable) => ({
        name: billable.description,
        cost: billable.cost,
        code: billable.billable_code,
        teeth: "",
        na: false,
        index: planIndex
      }));
      
      // Combine items from other plans with new items for this plan
      plan.items = [...itemsFromOtherPlans, ...newItems];
    }
    // No need to manage a global codes list; selected codes derive from items per plan
  }
  
  // Handle item toggle from checkboxes (handles both Billable and TreatmentItem)
  function toggleItem(item: TreatmentItem | Billable) {
    const treatmentItem = 'billable_code' in item ? billableToTreatmentItem(item) : item;
    const code = treatmentItem.code;
    
    if (!hasEquivalentInPlan(item)) {
      // Add to items array only (codes are only added via SearchableItemSelector)
      plan.items = [...plan.items, { ...treatmentItem, teeth: treatmentItem.teeth || "", na: treatmentItem.na || false, index: planIndex }];
    } else {
      // Remove from items array only items that match both code AND planIndex
      plan.items = plan.items.filter((i) => !(i.code === code && i.index === planIndex));
    }
  }
  
 
  // Handle adding item from searchable selector - create adapter to ensure compatibility
  function handleItemAdd(item: any) {
    const treatmentItem: TreatmentItem = {
      name: item.name,
      cost: item.cost,
      code: item.code,
      teeth: item.teeth || "",
      na: item.na || false,
      index: planIndex
    };
    
    if (!hasEquivalentInPlan(treatmentItem)) {
      plan.items = [...plan.items, treatmentItem];
    }
  }
  
  // Handle removing item from searchable selector
  function handleItemRemove(code: string) {
    // Remove only from this plan index
    plan.items = plan.items.filter(i => !(i.code === code && i.index === planIndex));
  }
  
  
</script>

<fieldset class="border border-gray-300 rounded-md p-4 space-y-4" in:fly={{ y: 30, duration: 350, opacity: 0.2 }}>
  <legend class="font-bold text-blue-700 mb-0">Treatment Plan {planIndex + 1}</legend>
  
  <div class="flex gap-4">
    <label class="block text-gray-700 font-semibold flex-1">
      Plan Name:
      <input
        type="text"
        placeholder={`Option ${planIndex + 1}`}
        bind:value={planNames[planIndex]}
        class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus-visible:border-blue-500/70 focus-visible:ring-blue-500/65 focus-visible:ring-[1.5px]"
      />
    </label>
    
    <label class="block text-gray-700 font-semibold">
      Case Fee:
      <input
        type="number"
        min="0"
        step="1"
        placeholder="Enter case fee"
        bind:value={caseFees}
        class="mt-1 block w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus-visible:border-blue-500/70 focus-visible:ring-blue-500/65 focus-visible:ring-[1.5px]"
      />
    </label>
  </div>
  
  <div class="flex flex-col gap-2">
    <span class="text-gray-600 font-medium pb-2">Quick Select:</span>
    <div class="flex flex-wrap gap-2 items-center">
      {#each popularPlans as popularPlan, idx}
        <button 
          type="button" 
          class="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-3 py-1 rounded transition" 
          onclick={() => quickSelect(idx)}
        >
          {popularPlan.name}
        </button>
      {/each}
    </div>
  </div>

  <SearchableItemSelector
    allTreatmentItems={allTreatmentItems.map(billable => ({
      name: billable.description,
      cost: billable.cost,
      code: billable.billable_code,
      teeth: '',
      na: false
    }))}
    selectedCodes={plan.items.filter(i => i.index === planIndex).map(i => i.code)}
    onItemAdd={handleItemAdd}
    onItemRemove={handleItemRemove}
  />

  <div class="flex flex-wrap gap-4">
    <span class="text-gray-600 font-medium w-full">Items:</span>
    {#each treatmentItems as item}
      <label class="inline-flex items-center space-x-2">
        <input 
          type="checkbox" 
          checked={hasEquivalentInPlan(item)} 
          onchange={() => toggleItem(item)} 
          class="form-checkbox h-5 w-5 text-blue-600" 
        />
        <span>{item.description}</span>
      </label>
    {/each}
  </div>

  <!-- Teeth numbers for selected items -->
  <div class="flex flex-col gap-2 mt-6">
    {#each plan.items.filter(item => item.index === planIndex) as selectedItem (selectedItem.code)}
      <TeethNumberInput
        bind:value={selectedItem.teeth}
        bind:isNA={selectedItem.na}
        itemName={selectedItem.name || selectedItem.code}
      />
    {/each}
  </div>
</fieldset>
