<script lang="ts">
  import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table';
  import {
    createColumnHelper,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    type ColumnDef,
    type SortingState,
    type RowSelectionState,
    type ColumnFiltersState
  } from '@tanstack/table-core';
  import type { PageData, ActionData } from './$types';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import EditAmountPaidSheet from '$lib/components/EditAmountPaidSheet.svelte';
  import { StatusTag } from '$lib/components/ui/status-tag';
  import { goto } from '$app/navigation';
  import { invalidateAll } from '$app/navigation';
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import type { TreatmentPlan } from './+page.server';
  import { toastStore } from '$lib/toast';
  import SearchIcon from "@lucide/svelte/icons/search";
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
  import EyeIcon from "@lucide/svelte/icons/eye";
  import EditIcon from "@lucide/svelte/icons/edit";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import DollarSignIcon from "@lucide/svelte/icons/dollar-sign";
  import LinkIcon from "@lucide/svelte/icons/link";
  import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";

  const { data, form }: { data: PageData; form: ActionData } = $props();
  console.log('Loaded treatment plans data:', data);
  // Check for data loading errors
  $effect(() => {
    if (data.error) {
      // toastStore.error(`Error loading treatment plans: ${data.error}`);
    } else if (data.treatmentPlans && data.treatmentPlans.length === 0) {
      toastStore.info('No treatment plans found. Create your first visit to get started.');
    }
  });

  // Handle form results
  $effect(() => {
    if (form) {
      const actionType = $page.url.searchParams.get('action');

      if (actionType === 'generatePublicLink') {
        handleGenerateLinkResult(form);
      } else if (actionType === 'batchUpdatePayment') {
        handleBatchResult(form, 'payment');
      } else if (actionType === 'batchDelete') {
        handleBatchResult(form, 'delete');
      }
    }
  });

  // Reactive data from server - updates when data prop changes
  const allTreatmentPlans = $derived(data.treatmentPlans);
  let globalFilter = $state('');
  let selectedDoctor = $state<string>('');
  let columnFilters = $state<ColumnFiltersState>([]);
  let sorting = $state<SortingState>([{ id: 'created_at', desc: true }]);
  let pagination = $state({ pageIndex: 0, pageSize: 10 });
  let rowSelection = $state<RowSelectionState>({});

  // Amount paid editing state
  let editingAmountPaid = $state<TreatmentPlan | null>(null);
  let isEditAmountPaidOpen = $state(false);

  // Column helper for type safety
  const columnHelper = createColumnHelper<TreatmentPlan>();

  // Use all treatment plans directly without filtering
  const treatmentPlans = $derived(() => allTreatmentPlans);

  // Define table columns
  const columns: ColumnDef<TreatmentPlan, any>[] = [
    // Checkbox column
    columnHelper.display({
      id: 'select',
      header: ({ table }) => ({
        checked: table.getIsAllPageRowsSelected(),
        indeterminate: table.getIsSomePageRowsSelected(),
      }),
      cell: ({ row }) => ({
        checked: row.getIsSelected(),
        disabled: !row.getCanSelect(),
      }),
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor(row => row.treatment_plan?.patient_name, {
      id: 'patient_name',
      header: 'Patient Name',
      cell: info => info.getValue() || 'Unknown',
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor(row => row.treatment_plan?.doctor_name, {
      id: 'doctor_name',
      header: 'Doctor',
      cell: info => info.getValue() || 'Unknown',
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor(row => row.treatment_plan?.created_at, {
      id: 'created_at',
      header: 'Visit Created',
      cell: info => {
        const dateStr = info.getValue();
        if (!dateStr) return 'Unknown';
        
        // Parse ISO 8601 timestamp (e.g., 2025-08-05T15:20:53.230678+00:00)
        const date = new Date(dateStr);
        // Format as M/D (e.g., 8/5)
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      },
      sortingFn: (rowA, rowB) => {
        const dateA = rowA.original.treatment_plan?.created_at;
        const dateB = rowB.original.treatment_plan?.created_at;
        
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        // Sort by full timestamp for accurate chronological ordering
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      },
      enableSorting: true,
    }),
    columnHelper.accessor(row => {
      const profile = row.treatment_plan?.presenter_profile;
      return profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown';
    }, {
      id: 'presenter',
      header: 'Presenter',
      cell: info => info.getValue() || 'Unknown',
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor(row => row.treatment_plan?.notes || row.notes, {
      id: 'notes',
      header: 'Notes',
      cell: info => {
        const text = info.getValue();
        return text?.length > 100 ? text.substring(0, 100) + '...' : text;
      },
      enableSorting: false,
    }),
    columnHelper.accessor(row => row.treatment_plan?.payment_status || (row.paid ? 'paid_in_full' : 'unpaid'), {
      id: 'payment_status',
      header: 'Status',
      cell: info => {
        const status = info.getValue();
        if (status === 'paid_in_full') return 'Paid in Full';
        if (status === 'financed') return 'Financed';
        return 'Unpaid';
      },
      enableSorting: true,
    }),
    columnHelper.accessor('activePlanPrice', {
      header: 'Price',
      cell: info => {
        const price = info.getValue();
        return price ? `$${(price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : '$0.00';
      },
      enableSorting: true,
    }),
    columnHelper.accessor(row => row.treatment_plan?.amount_paid || row.treatment_plan?.amount, {
      id: 'amount_paid',
      header: 'Amount Paid',
      cell: info => {
        const amountPaid = info.getValue();
        return amountPaid ? `$${(amountPaid).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : '$0.00';
      },
      enableSorting: true,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: info => {
        const row = info.row.original;
        return { visitId: row.visitid, paid: row.paid };
      },
    }),
  ];

  // Create the table
  const table = createSvelteTable({
    get data() {
      return treatmentPlans();
    },
    columns,
    state: {
      get globalFilter() {
        return globalFilter;
      },
      get columnFilters() {
        return columnFilters;
      },
      get sorting() {
        return sorting;
      },
      get pagination() {
        return pagination;
      },
      get rowSelection() {
        return rowSelection;
      },
    },
    onGlobalFilterChange: (filter) => {
      globalFilter = typeof filter === 'function' ? filter(globalFilter) : filter;
    },
    onColumnFiltersChange: (filtersUpdater) => {
      columnFilters = typeof filtersUpdater === 'function' ? filtersUpdater(columnFilters) : filtersUpdater;
    },
    onSortingChange: (sortingUpdater) => {
      sorting = typeof sortingUpdater === 'function' ? sortingUpdater(sorting) : sortingUpdater;
    },
    onPaginationChange: (paginationUpdater) => {
      pagination = typeof paginationUpdater === 'function' ? paginationUpdater(pagination) : paginationUpdater;
    },
    onRowSelectionChange: (rowSelectionUpdater) => {
      rowSelection = typeof rowSelectionUpdater === 'function' ? rowSelectionUpdater(rowSelection) : rowSelectionUpdater;
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Action handlers
  
  function calculateActivePlanPrice(treatmentPlan: any): number {
    if (!treatmentPlan.options || treatmentPlan.options.length === 0) {
      return 0;
    }

    // Find the option that matches the active_plan sequence_order
    const activeOption = treatmentPlan.options.find((option: any) => 
      option.sequence_order === treatmentPlan.active_plan
    );
    
    // If no active plan is set or found, use the first option as fallback
    const optionToUse = activeOption || treatmentPlan.options[0];
    
    if (!optionToUse) {
      return 0;
    }
    
    // Use total_cost from new schema if available, otherwise fallback to calculated cost
    if (optionToUse.total_cost !== undefined) {
      return optionToUse.total_cost;
    }
    // Legacy calculation for old schema
    if (!optionToUse.items || optionToUse.items.length === 0) {
      return 0;
    }
    return optionToUse.items.reduce((total: number, item: any) => total + (item.cost * item.quantity), 0);
  }

  function viewVisit(visit: TreatmentPlan) {
    goto(`/new-slides/${visit.visitid}`);
  }

  function editVisit(visit: TreatmentPlan) {
    goto(`/new-form/${visit.visitid}`);
  }

  function viewReport(visit: TreatmentPlan) {
    goto(`/visits/${visit.visitid}/report`);
  }

  function editAmountPaid(visit: TreatmentPlan) {
    editingAmountPaid = visit;
    isEditAmountPaidOpen = true;
  }

  function handleAmountPaidUpdate(visitId: number, amountPaid: number, notes: string, paymentStatus: string, activePlan?: number | null) {
    // Refresh data to show updated payment status
    invalidateAll();
  }

  function closeEditAmountPaid() {
    editingAmountPaid = null;
    isEditAmountPaidOpen = false;
  }

  let generateLinkForm: HTMLFormElement | undefined;
  let currentGeneratingVisit: TreatmentPlan | null = null;

  function generatePublicLink(visit: TreatmentPlan) {
    currentGeneratingVisit = visit;
    const treatmentPlanId = visit.treatment_plan?.id || visit.visitid;

    if (generateLinkForm) {
      const treatmentPlanIdInput = generateLinkForm.querySelector('input[name="treatmentPlanId"]') as HTMLInputElement;
      if (treatmentPlanIdInput) {
        treatmentPlanIdInput.value = treatmentPlanId.toString();
        generateLinkForm.requestSubmit();
      }
    }
  }

  function handleGenerateLinkResult(result: any) {
    if (result?.type === 'success' && result?.data?.publicLinkData) {
      const publicLink = `${window.location.origin}/public/treatment-plan/${result.data.publicLinkData.uuid}`;

      // Copy to clipboard
      navigator.clipboard.writeText(publicLink).then(() => {
        toastStore.success('Public link generated and copied to clipboard!');
      }).catch(() => {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = publicLink;
        document.body.appendChild(textArea);
        textArea.select();

        try {
          document.execCommand('copy');
          toastStore.success('Public link generated and copied to clipboard!');
        } catch {
          toastStore.success(`Public link generated: ${publicLink}`);
        } finally {
          document.body.removeChild(textArea);
        }
      });
    } else if (result?.type === 'failure') {
      toastStore.error(`Failed to generate public link: ${result.data?.error || 'Unknown error'}`);
    }
    currentGeneratingVisit = null;
  }

  let batchPaymentForm: HTMLFormElement | undefined;

  function markSelectedAsPaid() {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      alert('Please select at least one treatment plan.');
      return;
    }

    const selectedVisitIds = selectedRows.map(row => row.original.visitid);

    if (batchPaymentForm) {
      const visitIdsInput = batchPaymentForm.querySelector('input[name="visitIds"]') as HTMLInputElement;
      const paidInput = batchPaymentForm.querySelector('input[name="paid"]') as HTMLInputElement;

      if (visitIdsInput && paidInput) {
        visitIdsInput.value = JSON.stringify(selectedVisitIds);
        paidInput.value = 'true';
        batchPaymentForm.requestSubmit();
      }
    }
  }

  function markSelectedAsUnpaid() {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      alert('Please select at least one treatment plan.');
      return;
    }

    const selectedVisitIds = selectedRows.map(row => row.original.visitid);

    if (batchPaymentForm) {
      const visitIdsInput = batchPaymentForm.querySelector('input[name="visitIds"]') as HTMLInputElement;
      const paidInput = batchPaymentForm.querySelector('input[name="paid"]') as HTMLInputElement;

      if (visitIdsInput && paidInput) {
        visitIdsInput.value = JSON.stringify(selectedVisitIds);
        paidInput.value = 'false';
        batchPaymentForm.requestSubmit();
      }
    }
  }

  let batchDeleteForm: HTMLFormElement | undefined;

  function deleteSelectedRows() {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      alert('Please select at least one treatment plan.');
      return;
    }

    const selectedVisitIds = selectedRows.map(row => row.original.visitid);

    if (!confirm(`Delete ${selectedVisitIds.length} selected treatment plan(s)?`)) return;

    if (batchDeleteForm) {
      const visitIdsInput = batchDeleteForm.querySelector('input[name="visitIds"]') as HTMLInputElement;

      if (visitIdsInput) {
        visitIdsInput.value = JSON.stringify(selectedVisitIds);
        batchDeleteForm.requestSubmit();
      }
    }
  }

  async function refreshData() {
    try {
      await invalidateAll();
      toastStore.success('Data refreshed successfully');
    } catch (err) {
      console.error('Failed to refresh data', err);
      toastStore.error('Failed to refresh data');
    }
  }

  function handleBatchResult(result: any, action: string) {
    if (result?.type === 'success') {
      rowSelection = {}; // Clear selection

      if (action === 'payment') {
        const { updated, total } = result.data;
        if (updated === total) {
          toastStore.success(`Successfully updated ${updated} treatment plan(s).`);
        } else {
          toastStore.warning(`${updated} of ${total} treatment plans updated. Some failed to update.`);
        }
      } else if (action === 'delete') {
        const { deleted, total } = result.data;
        if (deleted === total) {
          toastStore.success(`Successfully deleted ${deleted} treatment plan(s).`);
        } else {
          toastStore.warning(`${deleted} of ${total} treatment plans deleted. Some failed to delete.`);
        }
      }
    } else if (result?.type === 'failure') {
      toastStore.error(`Failed to ${action}: ${result.data?.error || 'Unknown error'}`);
    }
  }
</script>

<svelte:head>
  <title>Treatment Plans - Admin</title>
</svelte:head>

<div class="space-y-6 p-4">
  <!-- Page Header -->
  <div class="space-y-2">
    <h1 class="text-2xl font-semibold tracking-tight">Treatment Plans</h1>
    <p class="text-muted-foreground">
      Manage and view all treatment plans across your organization.
    </p>
  </div>

  <!-- Actions Bar -->
  <div class="flex items-center justify-between gap-4">
    <div class="flex items-center gap-4">
      <div class="relative">
        <SearchIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search treatment plans..."
          class="pl-9 w-[300px]"
          bind:value={globalFilter}
        />
      </div>

      <!-- Doctor Filter Dropdown -->
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button variant="outline" class="w-[200px] justify-between">
            {selectedDoctor || 'All Doctors'}
            <ChevronDownIcon class="h-4 w-4" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="start" class="w-[200px]">
          <DropdownMenu.Item onclick={() => {
            selectedDoctor = '';
            columnFilters = columnFilters.filter(filter => filter.id !== 'doctor_name');
          }}>
            All Doctors
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          {#each data.doctors as doctor}
            <DropdownMenu.Item onclick={() => {
              selectedDoctor = doctor;
              columnFilters = [
                ...columnFilters.filter(filter => filter.id !== 'doctor_name'),
                { id: 'doctor_name', value: doctor }
              ];
            }}>
              {doctor}
            </DropdownMenu.Item>
          {/each}
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      {#if Object.keys(rowSelection).length > 0}
        <span class="text-sm font-medium">
          {Object.keys(rowSelection).length} row(s) selected
        </span>
      {:else}
        <span class="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} treatment plans
        </span>
      {/if}
    </div>
    
    <div class="flex items-center gap-2">
      <Button 
        onclick={refreshData}
        variant="outline"
        size="sm"
        title="Refresh data"
      >
        <RefreshCwIcon class="h-4 w-4" />
      </Button>
      <Button 
        onclick={markSelectedAsPaid}
        variant="default"
        size="sm"
        disabled={Object.keys(rowSelection).length === 0}
      >
        Mark as Paid
      </Button>
      <Button 
        onclick={markSelectedAsUnpaid}
        variant="outline"
        size="sm"
        disabled={Object.keys(rowSelection).length === 0}
      >
        Mark as Unpaid
      </Button>
      <Button 
        onclick={deleteSelectedRows}
        variant="destructive"
        size="sm"
        disabled={Object.keys(rowSelection).length === 0}
      >
        Delete Selected
      </Button>
      {#if Object.keys(rowSelection).length > 0}
        <Button onclick={() => rowSelection = {}} variant="outline" size="sm">
          Clear Selection
        </Button>
      {/if}
    </div>
  </div>

  <!-- Main Content Table -->
  <div class="space-y-4">
    <div class="rounded-md border">
        <Table>
          <TableHeader>
            {#each table.getHeaderGroups() as headerGroup}
              <TableRow >
                {#each headerGroup.headers as header}
                  <TableHead class={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}>
                    {#if !header.isPlaceholder}
                      {#if header.column.id === 'select'}
                        <input
                          type="checkbox"
                          class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={table.getIsAllPageRowsSelected()}
                          indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
                          onchange={(e) => table.toggleAllPageRowsSelected((e.target as HTMLInputElement)?.checked)}
                        />
                      {:else}
                        <div 
                          class="flex items-center space-x-2"
                          role="button"
                          tabindex="0"
                          onclick={header.column.getToggleSortingHandler()}
                          onkeydown={header.column.getToggleSortingHandler()}
                        >
                          <FlexRender content={header.column.columnDef.header} context={header.getContext()} />
                          {#if header.column.getCanSort()}
                            <span class="ml-2">
                              {#if header.column.getIsSorted() === 'asc'}
                                ↑
                              {:else if header.column.getIsSorted() === 'desc'}
                                ↓
                              {:else}
                                ↕
                              {/if}
                            </span>
                          {/if}
                        </div>
                      {/if}
                    {/if}
                  </TableHead>
                {/each}
              </TableRow>
            {/each}
          </TableHeader>
          <TableBody>
            {#if table.getRowModel().rows?.length}
              {#each table.getRowModel().rows as row}
                <TableRow data-state={row.getIsSelected() ? 'selected' : undefined} >
                  {#each row.getVisibleCells() as cell}
                    <TableCell>
                      {#if cell.column.id === 'select'}
                        <input
                          type="checkbox"
                          class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={row.getIsSelected()}
                          disabled={!row.getCanSelect()}
                          onchange={(e) => row.toggleSelected((e.target as HTMLInputElement)?.checked)}
                        />
                      {:else if cell.column.id === 'payment_status'}
                        {@const status = cell.getValue() as string}
                        
                        <StatusTag status={status} />
                      {:else if cell.column.id === 'actions'}
                        <div class="text-center">
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger>
                              <Button variant="ghost" size="sm" class="h-8 w-8 p-0 ">
                                <EllipsisIcon class="h-4 w-4" />
                                <span class="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenu.Trigger>
                          <DropdownMenu.Content align="end" class="w-48">
                            <DropdownMenu.Item onclick={() => viewVisit(row.original)}>
                              <EyeIcon class="mr-2 h-4 w-4" />
                              View
                            </DropdownMenu.Item>
                            <DropdownMenu.Item onclick={() => editVisit(row.original)}>
                              <EditIcon class="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenu.Item>
                            <DropdownMenu.Item onclick={() => viewReport(row.original)}>
                              <FileTextIcon class="mr-2 h-4 w-4" />
                              Report
                            </DropdownMenu.Item>
                            <DropdownMenu.Item onclick={() => editAmountPaid(row.original)}>
                              <DollarSignIcon class="mr-2 h-4 w-4" />
                              Quick Edit
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator />
                            <DropdownMenu.Item onclick={() => generatePublicLink(row.original)}>
                              <LinkIcon class="mr-2 h-4 w-4" />
                              Generate Link
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Root>
                        </div>
                      {:else if cell.column.id === 'notes'}
                        <div class="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap" title={row.original.treatment_plan?.notes || row.original.notes}>
                          <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
                        </div>
                      {:else if cell.column.id === 'activePlanPrice'}
                        <div class="font-medium text-green-600">
                          <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
                        </div>
                      {:else if cell.column.id === 'amount_paid'}
                        <div class="text-center">
                          <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
                        </div>
                      {:else}
                        <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
                      {/if}
                    </TableCell>
                  {/each}
                </TableRow>
              {/each}
            {:else}
              <TableRow class="py-2">
                <TableCell colspan={columns.length} class="h-24 text-center">
                  No treatment plans found.
                </TableCell>
              </TableRow>
            {/if}
          </TableBody>
        </Table>
      </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <p class="text-sm text-muted-foreground">
        Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} entries
      </p>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onclick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <span class="text-sm">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
        <Button
          variant="outline"
          size="sm"
          onclick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  </div>

  <!-- Edit Amount Paid Sheet -->
  <EditAmountPaidSheet
    bind:isOpen={isEditAmountPaidOpen}
    treatmentPlan={editingAmountPaid}
    onClose={closeEditAmountPaid}
    onUpdate={handleAmountPaidUpdate}
    profiles={data.profiles}
    paymentStatusOptions={data.paymentStatusOptions}
  />

  <!-- Hidden forms for server actions -->
  <form
    bind:this={generateLinkForm}
    method="POST"
    action="?/generatePublicLink&action=generatePublicLink"
    style="display: none;"
    use:enhance={() => {
      return async ({ result }) => {
        handleGenerateLinkResult(result);
        await invalidateAll();
      };
    }}
  >
    <input type="hidden" name="treatmentPlanId" value="" />
    <input type="hidden" name="expiresInHours" value="72" />
  </form>

  <form
    bind:this={batchPaymentForm}
    method="POST"
    action="?/batchUpdatePayment&action=batchUpdatePayment"
    style="display: none;"
    use:enhance={() => {
      return async ({ result }) => {
        handleBatchResult(result, 'payment');
        await invalidateAll();
      };
    }}
  >
    <input type="hidden" name="visitIds" value="" />
    <input type="hidden" name="paid" value="" />
  </form>

  <form
    bind:this={batchDeleteForm}
    method="POST"
    action="?/batchDelete&action=batchDelete"
    style="display: none;"
    use:enhance={() => {
      return async ({ result }) => {
        handleBatchResult(result, 'delete');
        await invalidateAll();
      };
    }}
  >
    <input type="hidden" name="visitIds" value="" />
  </form>
</div>