<script lang="ts">
  import type { Profile } from "$lib/types";
  import PresenterSelector from "./PresenterSelector.svelte";

  let {
    numPlans = $bindable(1),
    courtesyAmount = $bindable(0),
    insuranceCoverage = $bindable(0),
    notes = $bindable(""),
    profiles = [],
    selectedPresenter = $bindable(null),
    onPresenterSelect = $bindable()
  }: {
    numPlans: number;
    courtesyAmount: number;
    insuranceCoverage: number;
    notes: string;
    profiles: Profile[];
    selectedPresenter: Profile | null;
    onPresenterSelect: (presenter: Profile | null) => void;
  } = $props();
</script>

<div class="space-y-2 lg:flex gap-5 flex-col">
  <div class="flex flex-col md:flex-row gap-4">
    <label class="block text-gray-700 font-semibold">
      No. Plans:
      <input 
        type="number" 
        min="1" 
        max="5" 
        bind:value={numPlans} 
        class="mt-1 block w-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus-visible:border-blue-500/70 focus-visible:ring-blue-500/65 focus-visible:ring-[1.5px]" 
      />
    </label>
    
    <label class="block text-gray-700 font-semibold">
      Courtesy Amount %:
      <input
        type="number"
        min="0"
        step="1"
        placeholder="Enter courtesy amount"
        bind:value={courtesyAmount}
        class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus-visible:border-blue-500/70 focus-visible:ring-blue-500/65 focus-visible:ring-[1.5px]"
      />
    </label>
    
    <label class="block text-gray-700 font-semibold">
      Insurance Coverage:
      <input
        type="number"
        min="0"
        step="1"
        placeholder="Enter insurance amount"
        bind:value={insuranceCoverage}
        class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus-visible:border-blue-500/70 focus-visible:ring-blue-500/65 focus-visible:ring-[1.5px]"
      />
    </label>
    
  </div>

  <PresenterSelector 
    {profiles} 
    {selectedPresenter} 
    {onPresenterSelect} 
  />
  
  <label class="block text-gray-700 font-semibold">
    Notes:
    <textarea 
      placeholder="Enter notes" 
      bind:value={notes} 
      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus-visible:border-blue-500/70 focus-visible:ring-blue-500/65 focus-visible:ring-[1.5px]"
    ></textarea>
  </label>
</div>