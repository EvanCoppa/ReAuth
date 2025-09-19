<script lang="ts">
  import type { Provider } from "$lib/types";
  import type { Client } from "$lib/types/client";
  import { onMount } from "svelte";

let isLoading = $state(false);
let showClientSuggestions = $state(false);
let filteredClients = $state<Client[]>([]);
let selectedClient = $state<Client | null>(null);

  let {
    name = $bindable(""),
    selectedDr = $bindable(""),
    providers = [],
    clients = [],
    useCustomDoctor = $bindable(false),
    selectedProviderId = $bindable(null)
  }: {
    name: string;
    selectedDr: string;
    providers: Provider[];
    clients: Client[];
    useCustomDoctor: boolean;
    selectedProviderId: number | null;
  } = $props();

  function handleProviderChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    if (!value) {
      selectedProviderId = null;
      useCustomDoctor = true;
      selectedDr = '';
      return;
    }
    const id = Number(value);
    selectedProviderId = Number.isNaN(id) ? null : id;
    const provider = providers.find(p => p.id === selectedProviderId || String(p.id) === value);
    if (provider) {
      selectedDr = `${provider.firstname} ${provider.lastname}`;
      useCustomDoctor = false;
    }
  }
  
 
  function handleNameInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    name = value;
    
    if (value.length > 0) {
      filteredClients = clients.filter(client => {
        const fullName = `${client.first_name} ${client.last_name}`.toLowerCase();
        return fullName.includes(value.toLowerCase());
      }).slice(0, 5); // Limit to 5 suggestions
      showClientSuggestions = filteredClients.length > 0;
      
      // Check for exact match
      const exactMatch = clients.find(client => {
        const fullName = `${client.first_name} ${client.last_name}`;
        return fullName.toLowerCase() === value.toLowerCase();
      });
      selectedClient = exactMatch || null;
    } else {
      showClientSuggestions = false;
      filteredClients = [];
      selectedClient = null;
    }
  }

  function selectClient(client: Client) {
    name = `${client.first_name} ${client.last_name}`;
    showClientSuggestions = false;
    filteredClients = [];
    selectedClient = client;
  }

  function handleNameBlur() {
    // Small delay to allow clicking on suggestions
    setTimeout(() => {
      showClientSuggestions = false;
    }, 150);
  }


  
</script>

{#if isLoading}
  <div>Loading...</div>
{:else}
  <div class="space-y-2 flex flex-col md:flex-row gap-8">
    <label class="block text-gray-700 font-semibold md:w-1/2">
      Name:
      <div class="relative">
        <input
          type="text"
          placeholder="Enter patient name"
          value={name}
          oninput={handleNameInput}
          onblur={handleNameBlur}
          onfocus={() => {
            if (name.length > 0 && filteredClients.length > 0) {
              showClientSuggestions = true;
            }
          }}
          required
          class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus-visible:border-blue-500/70 focus-visible:ring-blue-500/65 focus-visible:ring-[1.5px]"
        />
        {#if showClientSuggestions && filteredClients.length > 0}
          <div class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {#each filteredClients as client (client.clientid)}
              <button
                type="button"
                class="w-full px-3 py-2 text-left hover:bg-gray-100 border-b border-gray-200 last:border-b-0 focus:bg-gray-100 focus:outline-none"
                onclick={() => selectClient(client)}
              >
                <div class="font-medium">{client.first_name} {client.last_name}</div>
                {#if client.email || client.phone}
                  <div class="text-sm text-gray-500">
                    {client.email ? client.email : ''}
                    {client.email && client.phone ? ' • ' : ''}
                    {client.phone ? client.phone : ''}
                  </div>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
        {#if selectedClient && selectedClient.dob}
          <div class="text-sm text-green-600 mt-1 ml-2 mb-[-1.5rem]">
            DOB: {selectedClient.dob}
          </div>
        {/if}
      </div>
    </label>

  <label class="block text-gray-700 font-semibold md:w-1/2">
    Doctor:
    <div class="flex items-center">
      
        <select 
          value={selectedProviderId ?? ''}
          onchange={handleProviderChange}
          class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus-visible:border-blue-500/70 focus-visible:ring-blue-500/65 focus-visible:ring-[1.5px]"
        >
          <option value="">Select a doctor</option>
          {#each providers as provider}
            <option value={provider.id}>
              {provider.firstname} {provider.lastname}
            </option>
          {/each}
        </select>
       
         
    </div>
  </label>
</div>
{/if}
