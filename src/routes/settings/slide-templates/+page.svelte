
<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { enhance } from '$app/forms';
  import { toastStore } from '$lib/toast';
  import type { PageData, ActionData } from './$types';
  import TitleSlide from '$lib/components/templates/TitleSlide.svelte';
  import OurResultsSlide from '$lib/components/templates/OurResultsSlide.svelte';
  import IntroductionSlide from '$lib/components/templates/IntroductionSlide.svelte';
  import VisitSummarySlide from '$lib/components/templates/VisitSummarySlide.svelte';
  import QuoteSlide from '$lib/components/templates/QuoteSlide.svelte';
  import CoreValuesSlide from '$lib/components/templates/CoreValuesSlide.svelte';
  import TreatmentSummarySlide from '$lib/components/templates/TreatmentSummarySlide.svelte';
  import PhotoSlide from '$lib/components/templates/PhotoSlide.svelte';
  import CommunitySlide from '$lib/components/templates/CommunitySlide.svelte';

  const slideComponents = {
    TitleSlide,
    OurResultsSlide,
    IntroductionSlide,
    VisitSummarySlide,
    QuoteSlide,
    CoreValuesSlide,
    TreatmentSummarySlide,
    PhotoSlide,
    CommunitySlide
  } as const;

  type SlideComponentName = keyof typeof slideComponents;

  interface TemplateMetadata {
    name: SlideComponentName;
    displayName: string;
    description: string;
    category: string;
    previewScale: number;
  }

  const templateMetadata: TemplateMetadata[] = [
    {
      name: 'TitleSlide',
      displayName: 'Title Slide',
      description: 'Brand header with patient and doctor information',
      category: 'Header',
      previewScale: 0.2
    },
    {
      name: 'OurResultsSlide',
      displayName: 'Our Results',
      description: 'Before/after results showcase with testimonial',
      category: 'Showcase',
      previewScale: 0.2
    },
    {
      name: 'IntroductionSlide',
      displayName: 'Introduction',
      description: 'About section with practice image and welcome text',
      category: 'Content',
      previewScale: 0.2
    },
    {
      name: 'VisitSummarySlide',
      displayName: 'Visit Summary',
      description: 'Patient visit details in organized grid layout',
      category: 'Content',
      previewScale: 0.2
    },
    {
      name: 'QuoteSlide',
      displayName: 'Quote Slide',
      description: 'Inspirational quote with branding elements',
      category: 'Content',
      previewScale: 0.2
    },
    {
      name: 'CoreValuesSlide',
      displayName: 'Core Values',
      description: 'Company values list with professional imagery',
      category: 'Content',
      previewScale: 0.2
    },
    {
      name: 'TreatmentSummarySlide',
      displayName: 'Treatment Summary',
      description: 'Treatment plan with detailed pricing calculations',
      category: 'Treatment',
      previewScale: 0.2
    },
    {
      name: 'PhotoSlide',
      displayName: 'Photo Slide',
      description: 'Individual treatment photos display',
      category: 'Treatment',
      previewScale: 0.2
    },
    {
      name: 'CommunitySlide',
      displayName: 'Community',
      description: 'Testimonials and appointment scheduling',
      category: 'Footer',
      previewScale: 0.2
    }
  ];

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let selectedTemplates = $state<Set<SlideComponentName>>(new Set(data.selectedTemplates));
  let searchTerm = $state('');
  let selectedCategory = $state('All');
  let previewTemplate = $state<SlideComponentName | null>(null);
  let loading = $state(false);

  const categories = ['All', 'Header', 'Content', 'Treatment', 'Showcase', 'Footer'];

  const filteredTemplates = $derived(templateMetadata.filter(template => {
    const matchesSearch = searchTerm === '' || 
      template.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }));

  // Mock data for previews
  const mockData = {
    doctorName: 'Dr. Sample',
    patientName: 'John Doe',
    visitDate: '2024-01-15',
    visitId: 123,
    scale: 0.2,
    plan: {
      name: 'Sample Plan',
      items: [
        { id: 1, name: 'Crown', quantity: 1, cost: 1500, teeth: '14', sequence_order: 1 }
      ]
    },
    treatmentPlan: {
      insurance_coverage: 500,
      courtesy_amount: 10,
      discount: 5
    },
    image: {
      image_data: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TYW1wbGUgSW1hZ2U8L3RleHQ+PC9zdmc+',
      image_type: 'sample',
      image_name: 'Sample Photo'
    },
    formatPrice: (val: any) => {
      if (val === null || val === undefined || isNaN(Number(val))) return "";
      return Math.ceil(Number(val) / 5) * 5;
    },
    pluralize: (word: string, quantity: number) => quantity === 1 ? word : word + 's'
  };

  $effect(() => {
    if (form?.success && form?.message) {
      toastStore.success(form.message);
    } else if (form?.message && !form?.success) {
      toastStore.error(form.message);
    }

    if (form?.selectedTemplates) {
      selectedTemplates = new Set(form.selectedTemplates);
    }
  });

  function handleToggleTemplate(templateName: SlideComponentName) {
    const form = document.getElementById(`toggle-form-${templateName}`) as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  }



  function openPreview(templateName: SlideComponentName) {
    previewTemplate = templateName;
  }

  function closePreview() {
    previewTemplate = null;
  }

  function getTemplateProps(templateName: SlideComponentName) {
    switch (templateName) {
      case 'TitleSlide':
        return { doctorName: mockData.doctorName, patientName: mockData.patientName, scale: mockData.scale };
      case 'VisitSummarySlide':
        return { 
          patientName: mockData.patientName, 
          visitDate: mockData.visitDate, 
          doctorName: mockData.doctorName, 
          visitId: mockData.visitId, 
          scale: mockData.scale 
        };
      case 'TreatmentSummarySlide':
        return { 
          plan: mockData.plan, 
          treatmentPlan: mockData.treatmentPlan, 
          optionIndex: 0, 
          scale: mockData.scale,
          formatPrice: mockData.formatPrice,
          pluralize: mockData.pluralize
        };
      case 'PhotoSlide':
        return { image: mockData.image, scale: mockData.scale };
      default:
        return { scale: mockData.scale };
    }
  }
</script>



<main class="min-h-screen bg-gray-50 p-6">
  <div class="mx-auto space-y-8">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Slide Templates</h1>
          <p class="text-gray-600 mt-1">Configure which slide templates are available for presentations</p>
        </div>
        <div class="flex items-center gap-2 text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span class="text-sm font-medium">Auto-save enabled</span>
        </div>
      </div>
    </div>

    {#if loading}
      <div class="flex items-center justify-center min-h-64">
        <div class="text-2xl text-gray-600">Loading templates...</div>
      </div>
    {:else}
      <!-- Search and Filter -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1 relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search templates..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              bind:value={searchTerm}
            />
          </div>

          <!-- Category Filter -->
          <div class="md:w-48">
            <select 
              class="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              bind:value={selectedCategory}
            >
              {#each categories as category}
                <option value={category}>{category}</option>
              {/each}
            </select>
          </div>
        </div>

        <!-- Selection Summary -->
        <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-blue-800">
              {selectedTemplates.size} of {templateMetadata.length} templates selected
            </span>
            <div class="flex gap-2">
              <form method="POST" action="?/selectAll" use:enhance style="display: inline;">
                <input type="hidden" name="allTemplates" value={JSON.stringify(templateMetadata.map(t => t.name))} />
                <button
                  type="submit"
                  class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Select All
                </button>
              </form>
              <span class="text-gray-300">|</span>
              <form method="POST" action="?/clearAll" use:enhance style="display: inline;">
                <button
                  type="submit"
                  class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear All
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Template Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredTemplates as template (template.name)}
          <div 
            class="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
            transition:fade={{ duration: 200 }}
          >
            <!-- Preview Container -->
            <div 
              class="relative bg-gray-100 aspect-video cursor-pointer group"
              onclick={() => openPreview(template.name)}
            >
              <div class="absolute inset-0 flex items-center justify-center overflow-hidden">
                <div class="transform origin-top-left" style="transform: scale({template.previewScale}); width: 1400px; height: 850px;">
                  <svelte:component 
                    this={slideComponents[template.name]} 
                    {...getTemplateProps(template.name)}
                  />
                </div>
              </div>
              <!-- Overlay -->
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                <div class="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-2 shadow-lg">
                  <svg class="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Template Info -->
            <div class="p-4">
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900">{template.displayName}</h3>
                  <span class="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full mt-1">
                    {template.category}
                  </span>
                </div>
                <form
                  id="toggle-form-{template.name}"
                  method="POST"
                  action="?/toggleTemplate"
                  use:enhance
                  style="display: none;"
                >
                  <input type="hidden" name="templateName" value={template.name} />
                  <input type="hidden" name="isSelected" value={selectedTemplates.has(template.name)} />
                  <input type="hidden" name="currentTemplates" value={JSON.stringify(Array.from(selectedTemplates))} />
                </form>
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={selectedTemplates.has(template.name)}
                    onchange={() => handleToggleTemplate(template.name)}
                  />
                </label>
              </div>
              <p class="text-sm text-gray-600">{template.description}</p>
              
              <button
                class="mt-3 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2"
                onclick={() => openPreview(template.name)}
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </button>
            </div>
          </div>
        {/each}
      </div>

      {#if filteredTemplates.length === 0}
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2-5H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No templates found</h3>
          <p class="mt-2 text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      {/if}
    {/if}
  </div>

  <!-- Preview Modal -->
  {#if previewTemplate}
    <div 
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onclick={closePreview}
      transition:fade={{ duration: 200 }}
    >
      <div 
        class="bg-white rounded-lg shadow-xl max-w-6xl max-h-full overflow-auto"
        onclick={(e) => e.stopPropagation()}
        transition:scale={{ duration: 200 }}
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="text-lg font-semibold">
            {templateMetadata.find(t => t.name === previewTemplate)?.displayName} Preview
          </h3>
          <button
            class="text-gray-400 hover:text-gray-600 transition-colors"
            onclick={closePreview}
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Preview Content -->
        <div class="p-4 bg-gray-100">
          <div class="bg-white shadow-lg" style="width: 1400px; height: 850px; transform: scale(0.6); transform-origin: top left;">
            <svelte:component 
              this={slideComponents[previewTemplate]} 
              {...getTemplateProps(previewTemplate)}
              scale={1}
            />
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-between p-4 border-t bg-gray-50">
          <div class="text-sm text-gray-600">
            {templateMetadata.find(t => t.name === previewTemplate)?.description}
          </div>
          <div class="flex gap-2">
            <form
              id="toggle-form-preview-{previewTemplate}"
              method="POST"
              action="?/toggleTemplate"
              use:enhance
              style="display: none;"
            >
              <input type="hidden" name="templateName" value={previewTemplate} />
              <input type="hidden" name="isSelected" value={selectedTemplates.has(previewTemplate)} />
              <input type="hidden" name="currentTemplates" value={JSON.stringify(Array.from(selectedTemplates))} />
            </form>
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={selectedTemplates.has(previewTemplate)}
                onchange={() => {
                  const form = document.getElementById(`toggle-form-preview-${previewTemplate}`) as HTMLFormElement;
                  if (form) {
                    form.requestSubmit();
                  }
                }}
              />
              <span class="text-sm font-medium">Include in presentations</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  {/if}
</main>