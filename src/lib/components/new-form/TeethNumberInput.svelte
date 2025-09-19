<script lang="ts">
  interface Props {
    value: string;
    itemName: string;
    isNA: boolean;
  }
  
  let { value = $bindable(""), itemName, isNA = $bindable(false) }: Props = $props();
  
  function handleNAToggle() {
    isNA = !isNA;
    if (isNA) {
      value = "";
    }
  }
</script>

<div class="flex flex-col gap-2">
  <label class="text-gray-700 font-semibold flex gap-4">
    Teeth numbers for {itemName}:
  </label>
  <div class="flex">
    {#if !isNA}
      <input
        type="text"
        placeholder="e.g. 12, 13"
        bind:value
        class="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus-visible:border-blue-500/70 focus-visible:ring-blue-500/65 focus-visible:ring-[1.5px]"
      />
    {/if}
    <button 
      type="button" 
      class="ml-2 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium transition"
      class:bg-gray-400={isNA}
      onclick={handleNAToggle}
    >
      N/A
    </button>
  </div>
</div>