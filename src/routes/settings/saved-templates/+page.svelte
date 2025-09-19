<script lang="ts">
  import { fade } from 'svelte/transition';
  import { enhance } from '$app/forms';
  import { toastStore } from '$lib/toast';
  import type { PageData, ActionData } from './$types';


  let { data, form }: { data: PageData; form: ActionData } = $props();
  let searchTerm = $state('');
  let savedTemplates = $state(data.savedTemplates);
  let loading = $state(false);

  const filteredTemplates = $derived(savedTemplates.filter(template => {
    const matchesSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  }));


  $effect(() => {
    if (form?.success && form?.message) {
      toastStore.success(form.message);
    } else if (form?.message && !form?.success) {
      toastStore.error(form.message);
    }

    if (form?.deletedId) {
      savedTemplates = savedTemplates.filter(t => t.id !== form.deletedId);
    }
  });

  function confirmDelete(templateId: string, templateName: string) {
    if (confirm(`Are you sure you want to delete "${templateName}"?`)) {
      const form = document.getElementById(`delete-form-${templateId}`) as HTMLFormElement;
      if (form) {
        form.requestSubmit();
      }
    }
  }



  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString();
  }
</script>

<main class="min-h-screen bg-gray-50 p-6">
  <div class="mx-auto space-y-8">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Saved Templates</h1>
          <p class="text-gray-600 mt-1">View and manage your saved slide template configurations</p>
        </div>
        <div class="flex items-center gap-2 text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>
          <span class="text-sm font-medium">{savedTemplates.length} saved templates</span>
        </div>
      </div>
    </div>

    {#if loading}
      <div class="flex items-center justify-center min-h-64">
        <div class="text-2xl text-gray-600">Loading saved templates...</div>
      </div>
    {:else}
      <!-- Search -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search saved templates..."
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            bind:value={searchTerm}
          />
        </div>
      </div>

      <!-- Templates Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredTemplates as template (template.id)}
          <div 
            class="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
            transition:fade={{ duration: 200 }}
          >
            <!-- Thumbnail -->
            <div class="relative bg-gray-100 aspect-video">
              <div class="absolute inset-0 flex items-center justify-center">
                {#if template.slides.length > 0}
                  <div class="text-gray-400 text-center">
                    <svg class="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p class="text-sm">Template Preview</p>
                  </div>
                {:else}
                  <div class="text-gray-400 text-center">
                    <svg class="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p class="text-sm">Empty Template</p>
                  </div>
                {/if}
              </div>
            </div>

            <!-- Template Info -->
            <div class="p-4">
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900">{template.name}</h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">
                      {template.slides.length} slides
                    </span>
                    <span class="text-xs text-gray-500">
                      Created {formatDate(template.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              
              {#if template.description}
                <p class="text-sm text-gray-600 mb-3">{template.description}</p>
              {/if}
              
              <!-- Slide List -->
              <div class="mb-3">
                <div class="text-xs text-gray-500 mb-1">Slides:</div>
                <div class="flex flex-wrap gap-1">
                  {#each template.slides.slice(0, 3) as slideName}
                    <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {slideName.replace(/Slide$/, '')}
                    </span>
                  {/each}
                  {#if template.slides.length > 3}
                    <span class="text-xs text-gray-400 px-1">
                      +{template.slides.length - 3} more
                    </span>
                  {/if}
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2">
                <form method="POST" action="?/loadTemplate" use:enhance class="flex-1">
                  <input type="hidden" name="slides" value={JSON.stringify(template.slides)} />
                  <input type="hidden" name="templateName" value={template.name} />
                  <button
                    type="submit"
                    class="w-full bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Load
                  </button>
                </form>
                {#if template.id !== '1'}
                  <form
                    id="delete-form-{template.id}"
                    method="POST"
                    action="?/deleteTemplate"
                    use:enhance
                    style="display: none;"
                  >
                    <input type="hidden" name="templateId" value={template.id} />
                    <input type="hidden" name="templateName" value={template.name} />
                  </form>
                  <button
                    type="button"
                    class="bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium py-2 px-3 rounded-md transition-colors flex items-center justify-center"
                    onclick={() => confirmDelete(template.id, template.name)}
                    aria-label="Delete template"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>

      {#if filteredTemplates.length === 0}
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No saved templates found</h3>
          <p class="mt-2 text-gray-600">Create your first template configuration to get started.</p>
        </div>
      {/if}
    {/if}
  </div>
</main>