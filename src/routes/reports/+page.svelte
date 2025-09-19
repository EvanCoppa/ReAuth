<script lang="ts">
  import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table';
  import {
    createColumnHelper,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    type ColumnDef,
    type SortingState,
    type RowSelectionState
  } from '@tanstack/table-core';
  import type { PageData, ActionData } from './$types';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { Label } from '$lib/components/ui/label';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { generatePDF } from '$lib/api';
  import { toastStore } from '$lib/toast';
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import SearchIcon from "@lucide/svelte/icons/search";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import UserIcon from "@lucide/svelte/icons/user";
  import StethoscopeIcon from "@lucide/svelte/icons/stethoscope";
  import PresentationIcon from "@lucide/svelte/icons/presentation";
  import LoaderIcon from "@lucide/svelte/icons/loader";
  import DownloadIcon from "@lucide/svelte/icons/download";
  import PrinterIcon from "@lucide/svelte/icons/printer";
  import CalendarIcon from "@lucide/svelte/icons/calendar";

  import type { TreatmentPlanReportData } from './+page.server';

  const { data, form }: { data: PageData; form: ActionData } = $props();

  // Reactive state
  let filterType = $state<'provider' | 'presenter' | 'creator'>('provider');
  let selectedId = $state<string>('');
  let treatmentPlans = $state<TreatmentPlanReportData[]>([]);
  let isLoading = $state(false);
  let hasSearched = $state(false);
  let totalCost = $state(0);
  let totalAmountPaid = $state(0);
  let fromDate = $state('');
  let toDate = $state('');

  // Table state
  let globalFilter = $state('');
  let presenterFilter = $state('');
  let sorting = $state<SortingState>([{ id: 'created_at', desc: true }]);
  let rowSelection = $state<RowSelectionState>({});

  // Form element reference
  let formElement: HTMLFormElement;

  // Column helper for type safety
  const columnHelper = createColumnHelper<TreatmentPlanReportData>();

  // Get options for the selected filter type
  const getFilterOptions = () => {
    switch (filterType) {
      case 'provider':
        return data.providers.map(p => ({
          value: p.providerid.toString(),
          label: `${p.prefix || 'Dr.'} ${p.firstname} ${p.lastname}${p.specialty ? ` (${p.specialty})` : ''}`
        }));
      case 'presenter':
        return data.presenters.map(p => ({
          value: p.auth_user_id,
          label: `${p.first_name} ${p.last_name}`
        }));
      case 'creator':
        return data.creators.map(p => ({
          value: p.auth_user_id,
          label: `${p.first_name} ${p.last_name}`
        }));
      default:
        return [];
    }
  };

  // Handle form submission for fetching treatment plans
  const submitForm = () => {
    if (!selectedId) {
      toastStore.error('Please select a filter option');
      return;
    }
    formElement.requestSubmit();
  };

  // Handle End of Day quick filter
  const handleEndOfDay = () => {
    const today = new Date().toISOString().split('T')[0];
    fromDate = today;
    toDate = today;

    submitForm();
  };

  // Calculate total cost of all treatment plans
  const calculateTotalCost = (plans: TreatmentPlanReportData[]) => {
    return plans.reduce((total, plan) => {
      const planCost = plan.options?.[0]?.total_cost || 0;
      return total + planCost;
    }, 0);
  };

  // Calculate total amount paid of all treatment plans
  const calculateTotalAmountPaid = (plans: TreatmentPlanReportData[]) => {
    return plans.reduce((total, plan) => {
      const amountPaid = plan.amount_paid || 0;
      return total + amountPaid;
    }, 0);
  };

  // Get unique presenters from current treatment plans
  const getUniquePresenterOptions = () => {
    const uniquePresenters = new Set<string>();
    treatmentPlans.forEach(plan => {
      if (plan.presenter_id) {
        const presenter = data.presenters.find(p => p.auth_user_id === plan.presenter_id);
        const presenterName = presenter ? `${presenter.first_name} ${presenter.last_name}` : plan.presenter_id.substring(0, 8);
        uniquePresenters.add(presenterName);
      } else {
        uniquePresenters.add('None');
      }
    });
    return Array.from(uniquePresenters).sort();
  };

  // Update treatment plans and totals when form result changes
  $effect(() => {
    if (form?.success && form.treatmentPlans) {
      treatmentPlans = form.treatmentPlans;
      hasSearched = true;

      if (form.message) {
        if (form.treatmentPlans.length === 0) {
          toastStore.info(form.message);
        } else {
          toastStore.success(form.message);
        }
      }
    } else if (form?.error) {
      toastStore.error(form.error);
      treatmentPlans = [];
      hasSearched = false;
    }
  });

  // Update totals when treatment plans change
  $effect(() => {
    totalCost = calculateTotalCost(treatmentPlans);
    totalAmountPaid = calculateTotalAmountPaid(treatmentPlans);
  });

  // Reset selection when filter type changes
  $effect(() => {
    filterType; // Track filterType changes
    selectedId = '';
    treatmentPlans = [];
    hasSearched = false;
    totalCost = 0;
    totalAmountPaid = 0;
    fromDate = '';
    toDate = '';
    globalFilter = '';
    presenterFilter = '';
  });

  // Define table columns
  const columns: ColumnDef<TreatmentPlanReportData, any>[] = [
    columnHelper.accessor('patient_name', {
      header: 'Patient Name',
      cell: info => info.getValue() || 'Unknown',
      enableSorting: true,
    }),
    columnHelper.accessor('created_at', {
      header: 'Created Date',
      cell: info => {
        const dateStr = info.getValue();
        if (!dateStr) return 'Unknown';
        
        try {
          const date = new Date(dateStr);
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        } catch (e) {
          return 'Invalid Date';
        }
      },
      enableSorting: true,
    }),
    columnHelper.accessor('doctor_name', {
      header: 'Doctor',
      cell: info => info.getValue() || 'Unknown',
      enableSorting: true,
    }),
    columnHelper.accessor('payment_status', {
      header: 'Payment Status',
      cell: info => {
        const status = info.getValue();
        const getStatusBadge = (status: string) => {
          switch (status?.toLowerCase()) {
            case 'paid_in_full':
              return { variant: 'default', text: 'Paid in Full' };
            case 'partially_paid':
              return { variant: 'secondary', text: 'Partially Paid' };
            case 'unpaid':
              return { variant: 'destructive', text: 'Unpaid' };
            default:
              return { variant: 'outline', text: status || 'Unknown' };
          }
        };
        
        const { variant, text } = getStatusBadge(status);
        return { variant, text };
      },
      enableSorting: true,
    }),
    columnHelper.accessor('amount_paid', {
      header: 'Amount Paid',
      cell: info => {
        const amount = info.getValue();
        return amount ? `$${amount.toLocaleString()}` : '$0';
      },
      enableSorting: true,
    }),
    columnHelper.accessor(row => row.options?.[0]?.total_cost || 0, {
      id: 'total_cost',
      header: 'Plan Cost',
      cell: info => {
        const cost = info.getValue();
        return cost ? `$${cost.toLocaleString()}` : '$0';
      },
      enableSorting: true,
    }),
    columnHelper.accessor(row => {
      if (row.presenter_id) {
        const presenter = data.presenters.find(p => p.auth_user_id === row.presenter_id);
        return presenter ? `${presenter.first_name} ${presenter.last_name}` : row.presenter_id.substring(0, 8);
      }
      return 'None';
    }, {
      id: 'presenter_name',
      header: 'Presenter',
      cell: info => info.getValue(),
      enableSorting: true,
    }),
    columnHelper.accessor(row => row.created_by_profile ? `${row.created_by_profile.first_name} ${row.created_by_profile.last_name}` : row.created_by?.substring(0, 8) || 'Unknown', {
      id: 'created_by_name',
      header: 'Created By',
      cell: info => info.getValue(),
      enableSorting: true,
    }),
  ];

  // Create table
  const table = createSvelteTable({
    get data() {
      // Apply presenter filter to the data
      if (presenterFilter === '') {
        return treatmentPlans;
      }
      return treatmentPlans.filter(plan => {
        const presenterName = plan.presenter_id
          ? (data.presenters.find(p => p.auth_user_id === plan.presenter_id)?.first_name + ' ' + data.presenters.find(p => p.auth_user_id === plan.presenter_id)?.last_name) || plan.presenter_id.substring(0, 8)
          : 'None';
        return presenterName === presenterFilter;
      });
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      get sorting() { return sorting; },
      get globalFilter() { return globalFilter; },
      get rowSelection() { return rowSelection; },
    },
    onSortingChange: (updater) => {
      sorting = typeof updater === 'function' ? updater(sorting) : updater;
    },
    onGlobalFilterChange: (filter) => {
      globalFilter = filter;
    },
    onRowSelectionChange: (updater) => {
      rowSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
    },
    enableRowSelection: true,
  });

  // PDF Print functionality
  const handlePrintPDF = async () => {
    if (treatmentPlans.length === 0) {
      toastStore.error('No data to print');
      return;
    }

    try {
      const toastId = toastStore.info('Generating PDF, please wait...', { duration: 25000 });

      // Get the printable content (filters + results)
      const printableElement = document.querySelector('#printable-content');
      if (!printableElement) {
        toastStore.removeToast(toastId);
        toastStore.error('Unable to find content to print');
        return;
      }

      // Create a clean HTML structure for PDF
      const currentDate = new Date().toLocaleDateString();
      const filterTypeLabel = filterType === 'provider' ? 'Provider' : filterType === 'presenter' ? 'Presenter' : 'Creator';
      const selectedOption = getFilterOptions().find(opt => opt.value === selectedId);
      const selectedLabel = selectedOption?.label || 'Unknown';

      const printHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Treatment Plans Report</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              margin: 20px;
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
            }
            .report-info {
              margin-bottom: 20px;
              padding: 15px;
              background-color: #f9fafb;
              border-radius: 8px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #d1d5db; 
              padding: 8px; 
              text-align: left;
            }
            th { 
              background-color: #f3f4f6; 
              font-weight: 600;
            }
            .badge { 
              padding: 2px 8px; 
              border-radius: 4px; 
              font-size: 10px; 
              font-weight: 500;
            }
            .badge-paid { background-color: #d1fae5; color: #065f46; }
            .badge-partial { background-color: #fef3c7; color: #92400e; }
            .badge-unpaid { background-color: #fee2e2; color: #991b1b; }
            .badge-outline { background-color: #f3f4f6; color: #374151; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Treatment Plans Report</h1>
            <p>Generated on ${currentDate}</p>
          </div>
          <div class="report-info">
            <p><strong>Report Type:</strong> By ${filterTypeLabel}</p>
            <p><strong>Selected ${filterTypeLabel}:</strong> ${selectedLabel}</p>
            <p><strong>Total Plans:</strong> ${treatmentPlans.length}</p>
          </div>
          ${printableElement.innerHTML}
        </body>
        </html>
      `;
      
      const response = await generatePDF(printHTML);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `treatment-plans-report-${filterType}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toastStore.removeToast(toastId);
        toastStore.success('PDF downloaded successfully');
      } else {
        const errorText = await response.text();
        console.error('PDF generation failed:', errorText);
        toastStore.removeToast(toastId);
        toastStore.error(`Failed to generate PDF: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toastStore.error(`Error generating PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Export functionality
  const exportToCSV = () => {
    if (treatmentPlans.length === 0) {
      toastStore.error('No data to export');
      return;
    }

    const headers = ['Patient Name', 'Created Date', 'Doctor', 'Payment Status', 'Amount Paid', 'Plan Cost', 'Presenter', 'Created By'];
    const csvContent = [
      headers.join(','),
      ...treatmentPlans.map(plan => {
        const presenterName = plan.presenter_id
          ? (data.presenters.find(p => p.auth_user_id === plan.presenter_id)?.first_name + ' ' + data.presenters.find(p => p.auth_user_id === plan.presenter_id)?.last_name) || plan.presenter_id.substring(0, 8)
          : 'None';

        return [
          `"${plan.patient_name || 'Unknown'}"`,
          `"${plan.created_at ? new Date(plan.created_at).toLocaleDateString() : 'Unknown'}"`,
          `"${plan.doctor_name || 'Unknown'}"`,
          `"${plan.payment_status || 'Unknown'}"`,
          plan.amount_paid || 0,
          plan.options?.[0]?.total_cost || 0,
          `"${presenterName}"`,
          `"${plan.created_by_profile ? `${plan.created_by_profile.first_name} ${plan.created_by_profile.last_name}` : plan.created_by?.substring(0, 8) || 'Unknown'}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `treatment-plans-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toastStore.success('Report exported successfully');
  };
</script>

<svelte:head>
  <title>Reports - Treatment Plans | Guaranteeth</title>
</svelte:head>

<div class="container mx-auto p-6 space-y-6">
  <!-- Page Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Reports</h1>
      <p class="text-muted-foreground">Generate treatment plan reports by provider, presenter, or creator</p>
    </div>
    <FileTextIcon class="h-8 w-8 text-muted-foreground" />
  </div>

  <!-- Filter and Summary Section -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Filter Section -->
    <Card class="lg:col-span-2">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <SearchIcon class="h-5 w-5" />
          Report Filters
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- Filter Type Selection -->
        <div class="space-y-3">
          <Label class="text-sm font-medium">Report Type</Label>
          <div class="flex gap-6">
            <div class="flex items-center space-x-2">
              <input 
                type="radio" 
                id="provider" 
                name="filterType" 
                value="provider" 
                bind:group={filterType}
                class="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
              />
              <label for="provider" class="text-sm font-medium flex items-center gap-2 cursor-pointer">
                <StethoscopeIcon class="h-4 w-4" />
                By Provider
              </label>
            </div>
            <div class="flex items-center space-x-2">
              <input 
                type="radio" 
                id="presenter" 
                name="filterType" 
                value="presenter" 
                bind:group={filterType}
                class="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
              />
              <label for="presenter" class="text-sm font-medium flex items-center gap-2 cursor-pointer">
                <PresentationIcon class="h-4 w-4" />
                By Presenter
              </label>
            </div>
            <div class="flex items-center space-x-2">
              <input 
                type="radio" 
                id="creator" 
                name="filterType" 
                value="creator" 
                bind:group={filterType}
                class="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
              />
              <label for="creator" class="text-sm font-medium flex items-center gap-2 cursor-pointer">
                <UserIcon class="h-4 w-4" />
                By Creator
              </label>
            </div>
          </div>
        </div>

        <!-- Dynamic Dropdown -->
        <div class="space-y-2">
          <Label class="text-sm font-medium">
            Select {filterType === 'provider' ? 'Provider' : filterType === 'presenter' ? 'Presenter' : 'Creator'}
          </Label>
          <div class="flex gap-3">
            <select 
              bind:value={selectedId}
              class="w-full px-3 py-2 border border-input bg-background text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Choose a {filterType}...</option>
              {#each getFilterOptions() as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
            <Button
              onclick={submitForm}
              disabled={!selectedId || isLoading}
              class="whitespace-nowrap"
            >
              {#if isLoading}
                <LoaderIcon class="h-4 w-4 mr-2 animate-spin" />
                Loading...
              {:else}
                <SearchIcon class="h-4 w-4 mr-2" />
                Generate Report
              {/if}
            </Button>
          </div>
        </div>

        <!-- Date Range Filter -->
        <div class="space-y-2">
          <Label class="text-sm font-medium">Date Range (Optional)</Label>
          <div class="flex gap-3 items-end">
            <div class="flex-1">
              <Label class="text-xs text-muted-foreground">From</Label>
              <input
                type="date"
                bind:value={fromDate}
                class="w-full px-3 py-2 border border-input bg-background text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                placeholder="Start date"
              />
            </div>
            <div class="flex-1">
              <Label class="text-xs text-muted-foreground">To</Label>
              <input
                type="date"
                bind:value={toDate}
                class="w-full px-3 py-2 border border-input bg-background text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                placeholder="End date"
              />
            </div>
            <Button 
              variant="outline"
              onclick={handleEndOfDay} 
              disabled={!selectedId || isLoading}
              class="whitespace-nowrap"
            >
              <CalendarIcon class="h-4 w-4 mr-2" />
              End of Day
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Total Cost Summary -->
    <Card class="relative overflow-hidden border-2 border-border/50 bg-gradient-to-br from-background via-background to-muted/20">
      <CardHeader class="pb-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-lg bg-primary/10 text-primary">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Total Value</p>
            </div>
          </div>
          <div class="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
            {treatmentPlans.length} plans
          </div>
        </div>
      </CardHeader>
      <CardContent class="pt-0">
        <div class="space-y-4">
          <!-- Main Total Plan Value -->
          <div class="relative">
            <div class="text-xs text-muted-foreground mb-1">Total Plan Value</div>
            <div class="text-4xl font-black tracking-tighter text-foreground leading-none">
              ${Math.floor(totalCost).toLocaleString('en-US')}
              <span class="text-xl text-muted-foreground font-bold">
                .{(totalCost % 1).toFixed(2).slice(2)}
              </span>
            </div>
          </div>

          <!-- Amount Paid -->
          <div class="relative">
            <div class="text-xs text-muted-foreground mb-1">Amount Paid</div>
            <div class="text-3xl font-bold tracking-tight text-green-600 leading-none">
              ${Math.floor(totalAmountPaid).toLocaleString('en-US')}
              <span class="text-lg text-green-500 font-semibold">
                .{(totalAmountPaid % 1).toFixed(2).slice(2)}
              </span>
            </div>
          </div>

          <!-- Outstanding Balance -->
          {#if treatmentPlans.length > 0}
            {@const outstanding = totalCost - totalAmountPaid}
            <div class="relative">
              <div class="text-xs text-muted-foreground mb-1">Outstanding</div>
              <div class="text-2xl font-bold tracking-tight {outstanding > 0 ? 'text-orange-600' : 'text-green-600'} leading-none">
                ${Math.floor(outstanding).toLocaleString('en-US')}
                <span class="text-base {outstanding > 0 ? 'text-orange-500' : 'text-green-500'} font-semibold">
                  .{(outstanding % 1).toFixed(2).slice(2)}
                </span>
              </div>
            </div>
          {/if}
          
          <!-- Stats Row -->
          {#if treatmentPlans.length > 0}
            <div class="flex items-center justify-between text-xs pt-2 border-t border-border/50">
              <div class="flex items-center gap-1">
                <span class="text-muted-foreground">Payment Rate:</span>
                <span class="font-mono font-semibold text-primary">
                  {totalCost > 0 ? Math.round((totalAmountPaid / totalCost) * 100) : 0}%
                </span>
              </div>
              <div class="text-xs text-muted-foreground">
                {treatmentPlans.length} plans
              </div>
            </div>
          {:else}
            <div class="text-sm text-muted-foreground pt-2 border-t border-border/50">
              No data loaded
            </div>
          {/if}
        </div>
      </CardContent>
      
 
    </Card>
  </div>

  <!-- Hidden form for server actions -->
  <form
    bind:this={formElement}
    method="POST"
    action="?/fetchTreatmentPlans"
    use:enhance={() => {
      isLoading = true;
      return async ({ update }) => {
        isLoading = false;
        await update();
      };
    }}
    style="display: none;"
  >
    <input type="hidden" name="filterType" value={filterType} />
    <input type="hidden" name="selectedId" value={selectedId} />
    <input type="hidden" name="fromDate" value={fromDate} />
    <input type="hidden" name="toDate" value={toDate} />
  </form>

  <!-- Results Section -->
  {#if hasSearched}
    <Card>
      <CardHeader class="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Report Results</CardTitle>
          <p class="text-sm text-muted-foreground">
            {treatmentPlans.length} treatment plan{treatmentPlans.length !== 1 ? 's' : ''} found
          </p>
        </div>
        {#if treatmentPlans.length > 0}
          <div class="flex gap-2">
            <Button variant="outline" onclick={exportToCSV}>
              <DownloadIcon class="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onclick={handlePrintPDF}>
              <PrinterIcon class="h-4 w-4 mr-2" />
              Print PDF
            </Button>
          </div>
        {/if}
      </CardHeader>
      
      {#if treatmentPlans.length > 0}
        <CardContent class="space-y-4">
          <!-- Search and Filter -->
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <SearchIcon class="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search treatment plans..."
                bind:value={globalFilter}
                class="max-w-sm"
              />
            </div>
            <div class="flex items-center gap-2">
              <PresentationIcon class="h-4 w-4 text-muted-foreground" />
              <select
                bind:value={presenterFilter}
                class="px-3 py-2 border border-input bg-background text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-w-[150px]"
              >
                <option value="">All Presenters</option>
                {#each getUniquePresenterOptions() as presenterName}
                  <option value={presenterName}>{presenterName}</option>
                {/each}
              </select>
            </div>
          </div>

          <!-- Printable Content -->
          <div id="printable-content">
            <!-- Table -->
            <div class="rounded-md border">
            <Table>
              <TableHeader>
                {#each table.getHeaderGroups() as headerGroup}
                  <TableRow>
                    {#each headerGroup.headers as header}
                      <TableHead
                        class="cursor-pointer select-none"
                        onclick={header.column.getToggleSortingHandler()}
                      >
                        <FlexRender
                          content={header.column.columnDef.header}
                          context={header.getContext()}
                        />
                        {#if header.column.getIsSorted() === 'asc'}
                          ↑
                        {:else if header.column.getIsSorted() === 'desc'}
                          ↓
                        {/if}
                      </TableHead>
                    {/each}
                  </TableRow>
                {/each}
              </TableHeader>
              <TableBody>
                {#each table.getRowModel().rows as row}
                  <TableRow>
                    {#each row.getVisibleCells() as cell}
                      <TableCell>
                        {#if cell.column.id === 'payment_status'}
                          {@const cellValue = cell.getValue()}
                          {#if cellValue && typeof cellValue === 'object' && 'variant' in cellValue && 'text' in cellValue}
                            <Badge variant={cellValue.variant as any}>{String(cellValue.text)}</Badge>
                          {:else}
                            <Badge variant="outline">{String(cellValue || 'Unknown')}</Badge>
                          {/if}
                        {:else}
                          <FlexRender
                            content={cell.column.columnDef.cell}
                            context={cell.getContext()}
                          />
                        {/if}
                      </TableCell>
                    {/each}
                  </TableRow>
                {/each}
              </TableBody>
            </Table>
            </div>
          </div>

          <!-- Results Summary -->
          <div class="text-sm text-muted-foreground text-center">
            Showing all {treatmentPlans.length} result(s)
          </div>
        </CardContent>
      {:else}
        <CardContent>
          <div class="text-center py-8">
            <FileTextIcon class="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 class="mt-4 text-lg font-medium">No treatment plans found</h3>
            <p class="text-muted-foreground">
              No treatment plans were found for the selected {filterType}.
            </p>
          </div>
        </CardContent>
      {/if}
    </Card>
  {/if}

  <!-- Loading State -->
  {#if isLoading}
    <Card>
      <CardContent class="py-8">
        <div class="text-center">
          <LoaderIcon class="h-8 w-8 mx-auto animate-spin text-primary" />
          <p class="mt-2 text-muted-foreground">Generating report...</p>
        </div>
      </CardContent>
    </Card>
  {/if}
</div>