<script lang="ts">
  import type { PageData, ActionData } from "../../../routes/new-form/$types";
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { toastStore } from "$lib/toast";
  import * as Card from "$lib/components/ui/card/index.js";
  import PatientInfoSection from "$lib/components/new-form/InfoSection.svelte";
  import PhotoUploadSection from "$lib/components/new-form/PhotoUpload.svelte";
  import PlanConfigSection from "$lib/components/new-form/PlanConfigSection.svelte";
  import TreatmentPlanEditor from "$lib/components/new-form/TreatmentPlanEditor.svelte";
  import type { Profile } from "$lib/types";
 
  let { data, form, prefillData, isEditing = false }: { data: PageData; form?: ActionData; prefillData?: any; isEditing?: boolean } = $props();

  // Destructure data for use in template
  let { providers, billables, activeBillables, quickTreatmentPlans, clients, profiles } = $derived(data);

  // Form state variables
  let name = $state("");
  let selectedDr = $state("");
  let useCustomDoctor = $state(false);
  let selectedProviderId = $state<number | null>(null);
  let selectedPresenter = $state<Profile | null>(null);
  let beforePhotos: FileList | undefined = $state(undefined);
  let afterPhotos: FileList | undefined = $state(undefined);
  let isLoading = $state(true);
  let numPlans = $state(1);
  let courtesyAmount = $state(0);
  let insuranceCoverage = $state(0);
  let notes = $state("");
  let planNames = $state<string[]>([]);
  let caseFees = $state<number[]>([]);

  let plan = $state<{
    name: string;
    items: Array<{
      name: string;
      cost: number;
      code: string;
      teeth: string;
      na: boolean;
      index?: number;
    }>;
    codeInput: string;
    codes?: string[];
  }>({
    name: "",
    items: [],
    codeInput: "",
    codes: []
  });

  // Initialize popularPlans with items from billables
  let popularPlans = $derived(
    (quickTreatmentPlans || []).map((qp) => ({
      ...qp,
      items: qp.billables?.map(billable => ({
        name: billable.description,
        cost: billable.cost,
        code: billable.billable_code,
        teeth: "",
        na: false
      })) ?? []
    }))
  );

  // Initialize provider selection
  $effect(() => {
    if (providers.length > 0 && selectedProviderId === null) {
      selectedProviderId = providers[0]?.id ?? null;
    }
  });

  // Function to handle presenter selection
  function handlePresenterSelect(presenter: Profile | null) {
    selectedPresenter = presenter;
  }

  // Initialize planNames and caseFees arrays when numPlans changes
  $effect(() => {
    while (planNames.length < numPlans) {
      planNames.push(`Option ${planNames.length + 1}`);
    }
    if (planNames.length > numPlans) {
      planNames = planNames.slice(0, numPlans);
    }
    
    while (caseFees.length < numPlans) {
      caseFees.push(0);
    }
    if (caseFees.length > numPlans) {
      caseFees = caseFees.slice(0, numPlans);
    }
  });

  // Track if prefill has been completed to prevent loops
  let hasPrefilled = $state(false);

  // Handle form response and display toast messages
  $effect(() => {
    if (form?.error) {
      toastStore.error(form.error);
    }
  });

  // Prefill form data when prefillData is available and data is loaded
  $effect(() => {
    if (prefillData && providers.length > 0 && billables.length > 0 && !hasPrefilled) {
      console.log("Starting prefill with data:", JSON.stringify(prefillData, null, 2));
      notes = prefillData.notes || "";
      // Extract treatment plan data

      const treatmentPlan = prefillData.treatment_plan || prefillData;
      
      // Prefill patient info
      if (treatmentPlan.patient_name && !name) name = treatmentPlan.patient_name;
      selectedDr = treatmentPlan.doctor_name;
      if (treatmentPlan.courtesy_amount !== undefined && courtesyAmount === 0) courtesyAmount = treatmentPlan.courtesy_amount;
      if (treatmentPlan.insurance_coverage !== undefined && insuranceCoverage === 0) insuranceCoverage = treatmentPlan.insurance_coverage;
      // Handle case fees - first set individual case fees from options if they exist
      if (treatmentPlan.options) {
         treatmentPlan.options.forEach((option: any, index: number) => {
          if (option.case_fee !== undefined) {
            caseFees[index] = option.case_fee;
          }
        });
        console.log("Prefilled individual case fees:", caseFees);
       }
      
      // Then use general case_fee as fallback for any plans that don't have individual case fees
      if (treatmentPlan.case_fee !== undefined) {
        caseFees = caseFees.map(fee => fee === 0 ? treatmentPlan.case_fee : fee);
      }

      // Prefill treatment plan options
      if (treatmentPlan.options) {
        numPlans = treatmentPlan.options.length;
        
        // Extract plan names from each option
        planNames = treatmentPlan.options.map((option: any) => option.name || '');
        
        // Convert treatment plan options to our plan format
        const allItems: any[] = [];
        const allCodes: string[] = [];

        treatmentPlan.options.forEach((option: any, planIndex: number) => {
          if (option.items) {
            option.items.forEach((item: any) => {
              // Try to find matching billable by name to get the code
              const matchingBillable = billables.find(b => 
                b.description === item.name || 
                b.billable_code === item.code ||
                b.billable_code === item.billable_code
              );
              
              const itemData = {
                name: item.name || '',
                cost: item.cost || 0,
                code: item.code || item.billable_code || matchingBillable?.billable_code || '',
                teeth: item.teeth || '',
                na: false,
                index: planIndex
              };
              allItems.push(itemData);
              
              // Add code to codes array if not already present
              if (itemData.code && !allCodes.includes(itemData.code)) {
                allCodes.push(itemData.code);
              }
            });
          }
        });

        plan = {
          name: treatmentPlan.options[0]?.name || '',
          items: allItems,
          codeInput: '',
          codes: allCodes
        };
        console.log("Prefilled plan with", allItems.length, "items");
      }
      
      // Find matching provider if doctor name is provided
      if (treatmentPlan.doctor_name && selectedProviderId === null) {
        const matchingProvider = providers.find(p => p.name === treatmentPlan.doctor_name);
        if (matchingProvider) {
          selectedProviderId = matchingProvider.id;
          useCustomDoctor = false;
        } else {
          useCustomDoctor = true;
        }
      }
      
      // Find matching presenter if presenter_id is provided
      if (treatmentPlan.presenter_id && profiles) {
        const matchingPresenter = profiles.find(p => p.auth_user_id === treatmentPlan.presenter_id);
        if (matchingPresenter) {
          selectedPresenter = matchingPresenter;
        }
      }
      
      // Mark prefill as completed
      hasPrefilled = true;
    }
    isLoading = false;
  });

  // Helper function to parse teeth numbers (copied from existing form)
  function parseTeethString(teethStr: string): string[] {
    if (!teethStr) return [];
    return teethStr
      .split(/[,\s]+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .flatMap((part) => {
        if (part.includes("-")) {
          const [start, end] = part.split("-").map(Number);
          if (isNaN(start) || isNaN(end) || start > end) return [];
          return Array.from({ length: end - start + 1 }, (_, i) => String(start + i));
        }
        const num = Number(part);
        return isNaN(num) ? [] : [String(num)];
      });
  }



</script>
{#if isLoading === false}
<Card.Root class="max-w-3xl m-2 lg:mx-auto mb-12 bg-white shadow-md rounded-lg">
  <Card.Content>
    <!-- Main form for saving to slides -->
    <form
      class="flex flex-col gap-6"
      method="POST"
      action={isEditing ? "?/updateVisit" : "?/createVisit"}
      use:enhance={() => {
        return async ({ result }) => {
          if (result.type === 'success' && result.data?.redirectTo) {
            await goto(result.data.redirectTo);
          }
        };
      }}
      enctype="multipart/form-data"
    >
      <!-- Hidden inputs for form data that needs to be preserved -->
      <input type="hidden" name="name" bind:value={name} />
      <input type="hidden" name="selectedDr" bind:value={selectedDr} />
      <input type="hidden" name="useCustomDoctor" value={useCustomDoctor ? 'true' : 'false'} />
      <input type="hidden" name="selectedProviderId" bind:value={selectedProviderId} />
      <input type="hidden" name="selectedPresenterId" value={selectedPresenter?.auth_user_id || ""} />
      <input type="hidden" name="courtesyAmount" bind:value={courtesyAmount} />
      <input type="hidden" name="insuranceCoverage" bind:value={insuranceCoverage} />
      <input type="hidden" name="notes" bind:value={notes} />
      <input type="hidden" name="numPlans" bind:value={numPlans} />
      <input type="hidden" name="planNames" value={JSON.stringify(planNames)} />
      <input type="hidden" name="caseFees" value={JSON.stringify(caseFees)} />
      <input type="hidden" name="planItems" value={JSON.stringify(plan.items)} />
      <input type="hidden" name="redirectTo" value="slides" />

      <PatientInfoSection bind:name bind:selectedDr {providers} {clients} bind:useCustomDoctor bind:selectedProviderId />

      <PhotoUploadSection bind:beforePhotos bind:afterPhotos />
      <PlanConfigSection
        bind:numPlans
        bind:courtesyAmount
        bind:insuranceCoverage
        bind:notes
        {profiles}
        bind:selectedPresenter
        onPresenterSelect={handlePresenterSelect}
      />

      {#each Array(numPlans) as _, planIndex}
        <TreatmentPlanEditor bind:plan {planIndex} {popularPlans} treatmentItems={activeBillables} allTreatmentItems={billables} bind:planNames bind:caseFees={caseFees[planIndex]} />
      {/each}

      <div class="flex flex-col sm:flex-row gap-3 mt-2">
        <button
          type="submit"
          class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-sm shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isEditing ? 'Save Edit' : 'Save Treatment Plan to Slide'}
        </button>
      </div>
    </form>

    <!-- Secondary form for saving to treatment plans -->
    <form
      method="POST"
      action={isEditing ? "?/updateVisit" : "?/createVisit"}
      use:enhance={() => {
        return async ({ result }) => {
          if (result.type === 'success' && result.data?.redirectTo) {
            await goto(result.data.redirectTo);
          }
        };
      }}
      enctype="multipart/form-data"
      class="mt-3"
    >
      <!-- Duplicate hidden inputs for second form -->
      <input type="hidden" name="name" bind:value={name} />
      <input type="hidden" name="selectedDr" bind:value={selectedDr} />
      <input type="hidden" name="useCustomDoctor" value={useCustomDoctor ? 'true' : 'false'} />
      <input type="hidden" name="selectedProviderId" bind:value={selectedProviderId} />
      <input type="hidden" name="selectedPresenterId" value={selectedPresenter?.auth_user_id || ""} />
      <input type="hidden" name="courtesyAmount" bind:value={courtesyAmount} />
      <input type="hidden" name="insuranceCoverage" bind:value={insuranceCoverage} />
      <input type="hidden" name="notes" bind:value={notes} />
      <input type="hidden" name="numPlans" bind:value={numPlans} />
      <input type="hidden" name="planNames" value={JSON.stringify(planNames)} />
      <input type="hidden" name="caseFees" value={JSON.stringify(caseFees)} />
      <input type="hidden" name="planItems" value={JSON.stringify(plan.items)} />
      <input type="hidden" name="redirectTo" value="treatment-plans" />

      <button
        type="submit"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-sm shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        Save & Go to Treatment Plans
      </button>
    </form>
  </Card.Content>
</Card.Root>
{:else}
 <div class="flex min-h-screen items-center justify-center">
    <div class="loading-spinner">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  </div>
{/if}
