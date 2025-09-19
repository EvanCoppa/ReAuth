<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Sheet from '$lib/components/ui/sheet';
	import { toastStore } from '$lib/toast';
	import type { PaymentStatusOption } from '$lib/types';
	import type { TreatmentPlan } from '../../routes/treatment-plans/+page.server';

  interface Props {
    isOpen: boolean;
    treatmentPlan: TreatmentPlan | null;
    onClose: () => void;
    onUpdate: (visitId: number, amountPaid: number, notes: string, paymentStatus: string, activePlan?: number | null) => void;
    profiles: any[];
    paymentStatusOptions: PaymentStatusOption[];
  }

  let { isOpen = $bindable(), treatmentPlan, onClose, onUpdate, profiles, paymentStatusOptions }: Props = $props();

	let tempAmountPaid = $state<string>('');
	let tempNotes = $state<string>('');
	let tempPaymentStatus = $state<string>('unpaid');
	let tempActivePlan = $state<number | null>(null);
	let tempPresenterId = $state<string>('');
	let searchTerm = $state<string>('');
	let isDropdownOpen = $state<boolean>(false);
	let isSubmitting = $state(false);
	let updateForm: HTMLFormElement | undefined;


  // Update temp values when treatment plan changes
  $effect(() => {
    if (treatmentPlan) {
      tempAmountPaid = (treatmentPlan.treatment_plan?.amount_paid || treatmentPlan.treatment_plan?.amount || 0).toString();
      tempNotes = treatmentPlan.treatment_plan?.notes || treatmentPlan.notes || '';
      tempPaymentStatus = treatmentPlan.treatment_plan?.payment_status || (treatmentPlan.paid ? 'paid_in_full' : 'unpaid');
      tempActivePlan = (treatmentPlan.treatment_plan as any)?.active_plan || null;
      tempPresenterId = treatmentPlan.treatment_plan?.presenter_id || '';
      // Reset search when treatment plan changes
      searchTerm = '';
      isDropdownOpen = false;
    }
  });

  // Filtered profiles based on search
  const filteredProfiles = $derived(profiles.filter(profile => 
    `${profile.first_name} ${profile.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  ));


	async function saveAmountPaid() {
		if (!treatmentPlan || !treatmentPlan.treatment_plan) {
			toastStore.error('No treatment plan selected for editing.');
			return;
		}

		const amountPaid = parseFloat(tempAmountPaid);
		if (isNaN(amountPaid) || amountPaid < 0) {
			toastStore.error('Please enter a valid amount.');
			return;
		}

		if (!updateForm) {
			toastStore.error('Unable to submit update. Please try again.');
			return;
		}

		isSubmitting = true;
		updateForm.requestSubmit();
	}

	function handleClose() {
		tempAmountPaid = '';
		tempNotes = '';
		tempPaymentStatus = 'unpaid';
		tempActivePlan = null;
		tempPresenterId = '';
		searchTerm = '';
		isDropdownOpen = false;
		isSubmitting = false;
		onClose();
	}

  function selectPresenter(profile: any) {
    tempPresenterId = profile.auth_user_id;
    searchTerm = `${profile.first_name} ${profile.last_name}`;
    isDropdownOpen = false;
  }

  function clearPresenter() {
    tempPresenterId = '';
    searchTerm = '';
    isDropdownOpen = false;
  }

  function getSelectedPresenterName() {
    if (!tempPresenterId) return '';
    const profile = profiles.find(p => p.auth_user_id === tempPresenterId);
    return profile ? `${profile.first_name} ${profile.last_name}` : '';
  }
</script>

<Sheet.Root bind:open={isOpen}>
	<Sheet.Content class="sm:max-w-md">
		<form
			method="POST"
			action="?/updateTreatmentPlanAmount"
			class="contents"
			bind:this={updateForm}
			use:enhance={({ formData }) => {
				if (!treatmentPlan || !treatmentPlan.treatment_plan) {
					toastStore.error('No treatment plan selected for editing.');
					isSubmitting = false;
					return;
				}

				const amountPaid = parseFloat(tempAmountPaid);
				if (isNaN(amountPaid) || amountPaid < 0) {
					toastStore.error('Please enter a valid amount.');
					isSubmitting = false;
					return;
				}

				formData.set('treatmentPlanId', `${treatmentPlan.treatment_plan.id}`);
				formData.set('visitId', `${treatmentPlan.visitid}`);
				formData.set('amountPaid', tempAmountPaid);
				formData.set('notes', tempNotes);
				formData.set('paymentStatus', tempPaymentStatus);
				formData.set('activePlan', tempActivePlan != null ? `${tempActivePlan}` : '');
				formData.set('presenterId', tempPresenterId);
				formData.set('patientName', treatmentPlan.treatment_plan.patient_name || '');
				formData.set('doctorName', treatmentPlan.treatment_plan.doctor_name || '');
				formData.set('discount', `${treatmentPlan.treatment_plan.discount ?? 0}`);
				formData.set('insuranceCoverage', `${treatmentPlan.treatment_plan.insurance_coverage ?? 0}`);
				formData.set('courtesyAmount', `${treatmentPlan.treatment_plan.courtesy_amount ?? 0}`);

				return async ({ result, update }) => {
					const payload = 'data' in result ? result.data : undefined;
					const data = (payload ?? {}) as {
						success?: boolean;
						visitId?: number | string;
						amountPaid?: number | string;
						notes?: string;
						paymentStatus?: string;
						activePlan?: number | string | null;
						presenterId?: string | null;
						error?: string;
					};

					try {
						if (result.type === 'success' && data.success) {
							toastStore.success('Treatment plan updated successfully.');
							const normalizedVisitId = Number(data.visitId ?? treatmentPlan?.visitid ?? 0);
							const normalizedAmountPaid = Number(data.amountPaid ?? tempAmountPaid);
							const normalizedNotes = data.notes ?? tempNotes;
							const normalizedPaymentStatus = data.paymentStatus ?? tempPaymentStatus;
							const normalizedActivePlan = data.activePlan != null ? Number(data.activePlan) : null;
							onUpdate(
								normalizedVisitId,
								normalizedAmountPaid,
								normalizedNotes,
								normalizedPaymentStatus,
								normalizedActivePlan
							);
							tempPresenterId = typeof data.presenterId === 'string' ? data.presenterId : tempPresenterId;
							handleClose();
						} else if (result.type === 'failure') {
							const errorMessage = typeof data.error === 'string'
								? data.error
								: 'Failed to update treatment plan. Please try again.';
							toastStore.error(errorMessage);
						} else if (result.type === 'error') {
							toastStore.error(result.error?.message || 'Failed to update treatment plan.');
						}
					} finally {
						isSubmitting = false;
					}
					update({ invalidateAll: false, reset: false });
				};
			}}
		>
			<Sheet.Header>
				<Sheet.Title>Edit Treatment Plan</Sheet.Title>
				<Sheet.Description>
					Update the payment details for {treatmentPlan?.treatment_plan?.patient_name || 'this treatment plan'}.
				</Sheet.Description>
			</Sheet.Header>
			
			<div class="grid gap-4 py-4 m-4">
      <div class="grid gap-2">
        <Label for="amount-paid">Amount Paid</Label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            id="amount-paid"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            class="pl-8"
            bind:value={tempAmountPaid}
          />
        </div>
      </div>
      
      <div class="grid gap-2">
        <Label for="payment-status">Payment Status</Label>
        <select 
          id="payment-status"
          bind:value={tempPaymentStatus}
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {#each paymentStatusOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>

      <div class="grid gap-2">
        <Label for="presenter">Presenter</Label>
        <div class="relative">
          <Input
            id="presenter"
            type="text"
            placeholder="Search presenters..."
            bind:value={searchTerm}
            onfocus={() => {
              isDropdownOpen = true;
              if (!searchTerm && tempPresenterId) {
                searchTerm = getSelectedPresenterName();
              }
            }}
            onblur={() => {
              // Delay closing to allow for selection
              setTimeout(() => {
                if (!tempPresenterId && searchTerm) {
                  // If typing but no selection, keep the search term
                  searchTerm = searchTerm;
                } else if (tempPresenterId && !searchTerm) {
                  // If there's a selection but no search term, show the selected name
                  searchTerm = getSelectedPresenterName();
                }
                isDropdownOpen = false;
              }, 200);
            }}
            oninput={() => {
              isDropdownOpen = true;
              // Clear selection when typing
              if (searchTerm !== getSelectedPresenterName()) {
                tempPresenterId = '';
              }
            }}
          />
          
          {#if tempPresenterId}
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onclick={clearPresenter}
            >
              <span class="text-sm">✕</span>
            </button>
          {/if}

          {#if isDropdownOpen && filteredProfiles.length > 0}
            <div class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
              {#each filteredProfiles.slice(0, 10) as profile (profile.auth_user_id)}
                <button
                  type="button"
                  class="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  onclick={() => selectPresenter(profile)}
                >
                  <div class="flex flex-col">
                    <span class="font-medium">{profile.first_name} {profile.last_name}</span>
                  </div>
                </button>
              {/each}
            </div>
          {/if}
        </div>
        {#if tempPresenterId}
          <p class="text-xs text-green-600">Selected: {getSelectedPresenterName()}</p>
        {:else}
          <p class="text-xs text-muted-foreground">No presenter assigned</p>
        {/if}
      </div>
      
      {#if treatmentPlan?.treatment_plan?.options && treatmentPlan.treatment_plan.options.length > 0}
      <div class="grid gap-2">
        <Label for="active-plan">Treatment Option</Label>
        <div class="space-y-2">
          {#each treatmentPlan.treatment_plan.options as option}
            {@const optionPrice = option.total_cost || (option.items?.reduce((total, item) => total + (item.cost * item.quantity), 0) || 0)}
            <div class="flex items-center space-x-2 p-3 border rounded-md {tempActivePlan === option.sequence_order ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}">
              <input
                type="radio"
                id="option-{option.sequence_order}"
                name="active-plan"
                value={option.sequence_order}
                bind:group={tempActivePlan}
                class="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <label for="option-{option.sequence_order}" class="flex-1 cursor-pointer">
                <div class="flex justify-between items-center">
                  <div>
                    <div class="font-medium text-sm">
                      {option.option_name || option.name || `Option ${option.sequence_order}`}
                    </div>
                    {#if option.description}
                      <div class="text-xs text-muted-foreground">{option.description}</div>
                    {/if}
                  </div>
                  <div class="text-sm font-medium text-green-600">
                    ${optionPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </label>
            </div>
          {/each}
        </div>
        {#if !tempActivePlan}
          <p class="text-xs text-muted-foreground">No active treatment option selected</p>
        {/if}
      </div>
      {:else}
      <div class="grid gap-2">
        <Label>Treatment Option</Label>
        <div class="p-3 border rounded-md border-gray-200 bg-gray-50">
          <p class="text-xs text-muted-foreground">
            {#if treatmentPlan?.treatment_plan?.options && treatmentPlan.treatment_plan.options.length === 0}
              No treatment options available for this plan
            {:else}
              Only one treatment option available
            {/if}
          </p>
        </div>
      </div>
      {/if}
      
      <div class="grid gap-2">
        <Label for="notes">Notes</Label>
        <textarea
          id="notes"
          bind:value={tempNotes}
          placeholder="Add notes about this treatment plan..."
          rows="3"
          class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        ></textarea>
      </div>
		</div>
		
		<Sheet.Footer>
			<Button type="button" variant="outline" onclick={handleClose}>
				Cancel
			</Button>
			<Button
				type="button"
				onclick={saveAmountPaid}
				disabled={isSubmitting}
			>
				{isSubmitting ? 'Saving...' : 'Save Changes'}
			</Button>
		</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
