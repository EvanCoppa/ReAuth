<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';
  import type { Client } from '$lib/types';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import SearchIcon from '@lucide/svelte/icons/search';
  import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
  import EyeIcon from '@lucide/svelte/icons/eye';
  import EditIcon from '@lucide/svelte/icons/edit';
  import TrashIcon from '@lucide/svelte/icons/trash';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import CheckIcon from '@lucide/svelte/icons/check';
  import XIcon from '@lucide/svelte/icons/x';
  import UploadIcon from '@lucide/svelte/icons/upload';
  import { toastStore } from '$lib/toast';
  import NewClientSheet from '$lib/components/NewClientSheet.svelte';
  import ClientCSVImportModal from '$lib/components/ClientCSVImportModal.svelte';
  
  let { data, form }: { data: PageData; form: ActionData } = $props();
  
  let isRefreshing = $state(false);
  let isDeleting = $state(false);
  let isExporting = $state(false);
  let searchTerm = $state('');
  let showNewClientForm = $state(false);
  let showImportModal = $state(false);
  
  // Selection state
  let selectedClientIds = $state<Set<number>>(new Set());

  // Inline editing state
  let editingClientId = $state<number | null>(null);
  let editingClient = $state<Client | null>(null);
  let isUpdating = $state(false);
  
  // Use form result data if available, otherwise use initial page data
  let allClients = $derived(form?.clients || data.clients);
  
  // Filter clients based on search term
  let filteredClients = $derived(filterClients(allClients, searchTerm));
  
  // Derived selection helpers
  let allVisibleSelected = $derived(
    filteredClients && filteredClients.length > 0 && 
    filteredClients.every(client => selectedClientIds.has(client.clientid))
  );
  let someVisibleSelected = $derived(
    filteredClients && filteredClients.some(client => selectedClientIds.has(client.clientid))
  );
  
  function filterClients(clients: Client[], search: string): Client[] {
    if (!search.trim()) {
      return clients || [];
    }
    
    const searchLower = search.toLowerCase().trim();
    return (clients || []).filter(client => {
      return (
        client.first_name?.toLowerCase().includes(searchLower) ||
        client.last_name?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower) ||
        client.phone?.includes(searchLower) ||
        client.address?.toLowerCase().includes(searchLower) ||
        client.insurance_provider?.toLowerCase().includes(searchLower) ||
        client.clientid.toString().includes(searchLower)
      );
    });
  }
  
  // Selection helper functions
  function toggleClient(clientId: number) {
    const newSet = new Set(selectedClientIds);
    if (newSet.has(clientId)) {
      newSet.delete(clientId);
    } else {
      newSet.add(clientId);
    }
    selectedClientIds = newSet;
  }
  
  function toggleAllVisible() {
    if (!filteredClients) return;
    
    const visibleIds = filteredClients.map(c => c.clientid);
    const newSet = new Set(selectedClientIds);
    
    if (allVisibleSelected) {
      // Deselect all visible
      visibleIds.forEach(id => newSet.delete(id));
    } else {
      // Select all visible
      visibleIds.forEach(id => newSet.add(id));
    }
    selectedClientIds = newSet;
  }
  
  function clearSelection() {
    selectedClientIds = new Set();
  }
  
  function handleRefresh() {
    return async ({ result, update }: any) => {
      isRefreshing = false;
      if (result.type === 'success') {
        await update();
        toastStore.success('Clients data refreshed successfully!');
      }
    };
  }

  function handleDelete() {
    return async ({ result, update }: any) => {
      isDeleting = false;
      if (result.type === 'success') {
        await update();
        if (result.data?.success) {
          toastStore.success(result.data.message || 'Clients deleted successfully!');
          clearSelection();
        } else {
          toastStore.error(result.data?.error || 'Failed to delete clients');
        }
      } else {
        toastStore.error('Failed to delete clients');
      }
    };
  }

  function handleExport() {
    return async ({ result }: any) => {
      isExporting = false;
      if (result.type === 'success' && result.data?.success) {
        // Download the PDF
        const pdfData = result.data.pdfData;
        const filename = result.data.filename;
        
        const byteCharacters = atob(pdfData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toastStore.success(`Exported ${selectedClientIds.size} client(s) to PDF`);
        clearSelection();
      } else {
        toastStore.error(result.data?.error || 'Failed to export clients');
      }
    };
  }

  function handleCloseNewClient() {
    showNewClientForm = false;
  }

  function handleCreateClient({ onComplete }: { onComplete: () => void }) {
    return async ({ result, update }: any) => {
      onComplete();
      if (result.type === 'success') {
        await update();
        if (result.data?.success) {
          toastStore.success(result.data.message || 'Client created successfully!');
          handleCloseNewClient();
        } else {
          toastStore.error(result.data?.error || 'Failed to create client');
        }
      } else {
        toastStore.error('Failed to create client');
      }
    };
  }

  // Inline editing functions
  function startEditing(client: Client) {
    // Prevent editing if another client is already being edited
    if (editingClientId !== null) {
      toastStore.error('Please save or cancel the current edit before editing another client');
      return;
    }

    editingClientId = client.clientid;
    editingClient = { ...client };
    // Focus the first input after the DOM updates
    setTimeout(() => {
      const firstInput = document.querySelector('.editing-row input[type="text"]') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
        firstInput.select();
      }
    }, 0);
  }

  function cancelEditing() {
    editingClientId = null;
    editingClient = null;
  }

  function handleUpdate() {
    return async ({ result, update }: any) => {
      isUpdating = false;
      if (result.type === 'success') {
        await update();
        if (result.data?.success) {
          toastStore.success(result.data.message || 'Client updated successfully!');
          cancelEditing();
        } else {
          toastStore.error(result.data?.error || 'Failed to update client');
        }
      } else {
        toastStore.error('Failed to update client');
      }
    };
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && editingClientId) {
      cancelEditing();
    }
    // Ctrl/Cmd + Enter to save
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && editingClientId && editingClient) {
      if (editingClient.first_name && editingClient.last_name) {
        const form = document.querySelector('.editing-row form') as HTMLFormElement;
        if (form) {
          form.requestSubmit();
        }
      }
    }
  }

  function isValidClient(client: Client | null): boolean {
    return !!(client?.first_name?.trim() && client?.last_name?.trim());
  }

  function handleImportComplete(updatedClients: Client[]) {
    // Update the clients data
    if (updatedClients && updatedClients.length > 0) {
      // This will be handled by the form action result
      location.reload(); // Simple reload to get fresh data
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
  <title>Clients - Patient Advocate</title>
</svelte:head>

<div class="space-y-6 p-4">
  <!-- Page Header -->
  <div class="space-y-2">
    <h1 class="text-2xl font-semibold tracking-tight">Clients</h1>
    <p class="text-muted-foreground">
      Manage and view all clients in your organization.
    </p>
  </div>

  <!-- Actions Bar -->
  <div class="flex items-center justify-between gap-4">
    <div class="flex items-center gap-4">
      <div class="relative">
        <SearchIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search clients..."
          class="pl-9 w-[300px]"
          bind:value={searchTerm}
        />
      </div>
      
      {#if selectedClientIds.size > 0}
        <span class="text-sm font-medium">
          {selectedClientIds.size} row(s) selected
        </span>
      {:else}
        <span class="text-sm text-muted-foreground">
          {filteredClients?.length || 0} clients
        </span>
      {/if}
    </div>
    
    <div class="flex items-center gap-2">
      <form method="POST" action="?/export" use:enhance={() => {
        isExporting = true;
        return handleExport();
      }}>
        <input type="hidden" name="clientIds" value={JSON.stringify(Array.from(selectedClientIds))} />
        <Button
          type="submit"
          variant="default"
          size="sm"
          disabled={selectedClientIds.size === 0 || isExporting || editingClientId !== null}
        >
          {#if isExporting}
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Exporting...
          {:else}
            Export Selected
          {/if}
        </Button>
      </form>
      
      <form method="POST" action="?/delete" use:enhance={() => {
        isDeleting = true;
        return handleDelete();
      }}>
        <input type="hidden" name="clientIds" value={JSON.stringify(Array.from(selectedClientIds))} />
        <Button
          type="submit"
          variant="destructive"
          size="sm"
          disabled={selectedClientIds.size === 0 || isDeleting || editingClientId !== null}
        >
          {#if isDeleting}
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Deleting...
          {:else}
            Delete Selected
          {/if}
        </Button>
      </form>
      
      {#if selectedClientIds.size > 0}
        <Button onclick={clearSelection} variant="outline" size="sm">
          Clear Selection
        </Button>
      {/if}
      <form method="POST" action="?/refresh" use:enhance={() => {
        isRefreshing = true;
        return handleRefresh();
      }}>
        <Button
          type="submit"
          disabled={isRefreshing || editingClientId !== null}
          variant="outline"
          size="sm"
        >
          {#if isRefreshing}
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Refreshing...
          {:else}
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          {/if}
        </Button>
      </form>
      <Button
        onclick={() => showNewClientForm = true}
        variant="default"
        size="sm"
        disabled={editingClientId !== null}
      >
        <PlusIcon class="w-4 h-4 " />
        Add Client
      </Button>
      <Button
        onclick={() => showImportModal = true}
        variant="outline"
        size="sm"
        disabled={editingClientId !== null}
      >
        <UploadIcon class="w-4 h-4 mr-2" />
        Import CSV
      </Button>
    </div>
  </div>
  

  {#if data.error}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
      <strong>Error:</strong> {data.error}
    </div>
  {/if}

  {#if form?.error}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
      <strong>Refresh Error:</strong> {form.error}
    </div>
  {/if}

  <!-- Main Content Table -->
  <div class="space-y-4">
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={allVisibleSelected}
                indeterminate={someVisibleSelected && !allVisibleSelected}
                onchange={toggleAllVisible}
                disabled={!filteredClients || filteredClients.length === 0}
              />
            </TableHead>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Insurance Provider</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#if filteredClients && filteredClients.length > 0}
            {#each filteredClients as client}
              <TableRow
                data-state={selectedClientIds.has(client.clientid) ? 'selected' : undefined}
                class={editingClientId === client.clientid ? 'bg-blue-50 editing-row' : ''}
              >
                <TableCell>
                  <input
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={selectedClientIds.has(client.clientid)}
                    onchange={() => toggleClient(client.clientid)}
                    disabled={editingClientId === client.clientid}
                  />
                </TableCell>

                <!-- First Name -->
                <TableCell class="font-medium">
                  {#if editingClientId === client.clientid && editingClient}
                    <Input
                      type="text"
                      bind:value={editingClient.first_name}
                      class="h-8 text-sm"
                      required
                    />
                  {:else}
                    {client.first_name || 'N/A'}
                  {/if}
                </TableCell>

                <!-- Last Name -->
                <TableCell>
                  {#if editingClientId === client.clientid && editingClient}
                    <Input
                      type="text"
                      bind:value={editingClient.last_name}
                      class="h-8 text-sm"
                      required
                    />
                  {:else}
                    {client.last_name || 'N/A'}
                  {/if}
                </TableCell>

                <!-- Date of Birth -->
                <TableCell>
                  {#if editingClientId === client.clientid && editingClient}
                    <Input
                      type="date"
                      bind:value={editingClient.dob}
                      class="h-8 text-sm"
                    />
                  {:else}
                    {client.dob ? new Date(client.dob).toLocaleDateString() : 'N/A'}
                  {/if}
                </TableCell>

                <!-- Phone -->
                <TableCell>
                  {#if editingClientId === client.clientid && editingClient}
                    <Input
                      type="tel"
                      bind:value={editingClient.phone}
                      class="h-8 text-sm"
                    />
                  {:else}
                    {client.phone || 'N/A'}
                  {/if}
                </TableCell>

                <!-- Email -->
                <TableCell>
                  {#if editingClientId === client.clientid && editingClient}
                    <Input
                      type="email"
                      bind:value={editingClient.email}
                      class="h-8 text-sm"
                    />
                  {:else}
                    {client.email || 'N/A'}
                  {/if}
                </TableCell>

                <!-- Address -->
                <TableCell>
                  {#if editingClientId === client.clientid && editingClient}
                    <Input
                      type="text"
                      bind:value={editingClient.address}
                      class="h-8 text-sm"
                    />
                  {:else}
                    <div class="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap" title={client.address || 'N/A'}>
                      {client.address || 'N/A'}
                    </div>
                  {/if}
                </TableCell>

                <!-- Insurance Provider -->
                <TableCell>
                  {#if editingClientId === client.clientid && editingClient}
                    <Input
                      type="text"
                      bind:value={editingClient.insurance_provider}
                      class="h-8 text-sm"
                    />
                  {:else}
                    {client.insurance_provider || 'N/A'}
                  {/if}
                </TableCell>

                <!-- Actions -->
                <TableCell>
                  {#if editingClientId === client.clientid}
                    <!-- Inline Save/Cancel Actions -->
                    <div class="flex items-center gap-2">
                      <form method="POST" action="?/update" use:enhance={() => {
                        isUpdating = true;
                        return handleUpdate();
                      }}>
                        <input type="hidden" name="clientId" value={client.clientid} />
                        <input type="hidden" name="first_name" value={editingClient?.first_name || ''} />
                        <input type="hidden" name="last_name" value={editingClient?.last_name || ''} />
                        <input type="hidden" name="dob" value={editingClient?.dob || ''} />
                        <input type="hidden" name="phone" value={editingClient?.phone || ''} />
                        <input type="hidden" name="email" value={editingClient?.email || ''} />
                        <input type="hidden" name="address" value={editingClient?.address || ''} />
                        <input type="hidden" name="insurance_provider" value={editingClient?.insurance_provider || ''} />
                        <Button
                          type="submit"
                          variant="default"
                          size="sm"
                          class="h-7 w-7 p-0"
                          disabled={isUpdating || !isValidClient(editingClient)}
                        >
                          {#if isUpdating}
                            <svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          {:else}
                            <CheckIcon class="h-3 w-3" />
                          {/if}
                          <span class="sr-only">Save</span>
                        </Button>
                      </form>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        class="h-7 w-7 p-0"
                        onclick={cancelEditing}
                        disabled={isUpdating}
                      >
                        <XIcon class="h-3 w-3" />
                        <span class="sr-only">Cancel</span>
                      </Button>
                    </div>
                  {:else}
                    <!-- Normal Actions Dropdown -->
                    <div class="text-center">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                          <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                            <EllipsisIcon class="h-4 w-4" />
                            <span class="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align="end" class="w-48">
                          <DropdownMenu.Item>
                            <EyeIcon class="mr-2 h-4 w-4" />
                            View
                          </DropdownMenu.Item>
                          <DropdownMenu.Item onclick={() => startEditing(client)} disabled={editingClientId !== null}>
                            <EditIcon class="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator />
                          <DropdownMenu.Item disabled={editingClientId !== null} onclick={() => {
                            selectedClientIds = new Set([client.clientid]);
                            const form = document.createElement('form');
                            form.method = 'POST';
                            form.action = '?/delete';
                            const input = document.createElement('input');
                            input.type = 'hidden';
                            input.name = 'clientIds';
                            input.value = JSON.stringify([client.clientid]);
                            form.appendChild(input);
                            document.body.appendChild(form);
                            form.submit();
                          }}>
                            <TrashIcon class="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    </div>
                  {/if}
                </TableCell>
              </TableRow>
            {/each}
          {:else}
            <TableRow>
              <TableCell colspan={9} class="h-24 text-center">
                {#if searchTerm}
                  No clients match your search.
                {:else}
                  No clients found.
                {/if}
              </TableCell>
            </TableRow>
          {/if}
        </TableBody>
      </Table>
    </div>
  </div>

  <!-- New Client Form Component -->
  <NewClientSheet
    bind:isOpen={showNewClientForm}
    onClose={handleCloseNewClient}
    onSubmit={handleCreateClient}
  />

  <!-- CSV Import Modal -->
  <ClientCSVImportModal
    bind:showImportModal={showImportModal}
    clients={allClients}
    onImportComplete={handleImportComplete}
  />
</div>
