<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { toastStore } from '$lib/toast';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { Separator } from '$lib/components/ui/separator';
  import { Switch } from '$lib/components/ui/switch';
  import { Badge } from '$lib/components/ui/badge';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import SearchIcon from '@lucide/svelte/icons/search';
  import UploadIcon from '@lucide/svelte/icons/upload';
  import FileTextIcon from '@lucide/svelte/icons/file-text';
  import EditIcon from '@lucide/svelte/icons/edit';
  import TrashIcon from '@lucide/svelte/icons/trash';
  import CheckIcon from '@lucide/svelte/icons/check';
  import XIcon from '@lucide/svelte/icons/x';
  import InfoIcon from '@lucide/svelte/icons/info';
  import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
  import PrinterIcon from '@lucide/svelte/icons/printer';
  import type { PageData, ActionData } from './$types';
  import type { Billable } from './+page.server';

  export let data: PageData;
  export let form: ActionData;

  // Initialize billables from server data
  let billables: Billable[] = data.billables || [];


  interface ImportError {
    row: number;
    field: string;
    message: string;
    value?: string;
  }

  // State management
  let filtered: Billable[] = [];
  let currentPage = 1;
  const pageSize = 10;
  let editing: string | null = null;
  let editingData: { description: string; cost: number; delimiter: string } = { description: '', cost: 0, delimiter: '' };
  let newBillable: Billable = {
    id: 0,
    billable_code: '',
    description: '',
    cost: 0,
    delimiter: '',
    org_id: 0,
    is_displayed: true
  };
  let paginated: Billable[] = [];
  let totalPages: number;
  let searchQuery = '';
  let showAddForm = false;
  
  // Sorting state
  let sortField: 'billable_code' | 'description' | 'cost' = 'cost';
  let sortDirection: 'asc' | 'desc' = 'desc';
  
  // CSV Import state
  let showImportModal = false;
  let csvFile: File | null = null;
  let csvFileInput: HTMLInputElement;
  let importErrors: ImportError[] = [];
  let importPreview: Billable[] = [];
  let importStep: 'upload' | 'preview' | 'errors' = 'upload';
  let isImporting = false;

  // Required CSV headers
  const requiredHeaders = ['billable_code', 'description', 'cost'];
  const optionalHeaders = ['delimiter', 'is_displayed'];

  function sortBillables(items: Billable[]): Billable[] {
    return [...items].sort((a, b) => {
      let valueA: string | number;
      let valueB: string | number;
      
      if (sortField === 'cost') {
        valueA = a.cost ?? 0;
        valueB = b.cost ?? 0;
        
        // Special sorting for cost: zero cost items go last regardless of direction
        if (valueA === 0 && valueB !== 0) return 1;
        if (valueB === 0 && valueA !== 0) return -1;
        if (valueA === 0 && valueB === 0) return 0;
      } else {
        valueA = a[sortField]?.toString().toLowerCase() ?? '';
        valueB = b[sortField]?.toString().toLowerCase() ?? '';
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  function updateFiltered() {
    const q = searchQuery.toLowerCase();
    let items = !q
      ? billables
      : billables.filter(
          (b) =>
            (b.billable_code && b.billable_code.toLowerCase().includes(q)) ||
            (b.description && b.description.toLowerCase().includes(q))
        );
    
    filtered = sortBillables(items);
  }

  function handleSort(field: 'billable_code' | 'description' | 'cost') {
    if (sortField === field) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortField = field;
      sortDirection = field === 'cost' ? 'desc' : 'asc';
    }
    currentPage = 1;
    refreshData();
  }

  function updateTotalPages() {
    totalPages = Math.ceil(filtered.length / pageSize);
  }

  function createPaginated() {
    paginated = filtered.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }

  function updatePaginated(pageChange: number = 0) {
    currentPage += pageChange;
    currentPage = Math.max(1, Math.min(currentPage, totalPages));
    createPaginated();
  }

  function refreshData() {
    updateFiltered();
    updateTotalPages();
    updatePaginated();
  }

  // Watch for form action results
  $: if (form?.success) {
    if (form.billables) {
      billables = form.billables;
      refreshData();
    }
    if (form.message) {
      toastStore.success(form.message);
    }
  } else if (form?.error) {
    toastStore.error(form.error);
  }

  // Initialize filtered data on mount
  $: {
    refreshData();
  }

  let createForm: HTMLFormElement;

  function handleCreateSubmit() {
    if (!newBillable.billable_code || !newBillable.description) {
      toastStore.error('Please fill in all required fields.');
      return;
    }
    // Form will be submitted via enhance
  }

  function resetNewBillable() {
    newBillable = {
      id: 0,
      billable_code: '',
      description: '',
      cost: 0,
      delimiter: '',
      org_id: 0,
      is_displayed: true
    };
    showAddForm = false;
  }

  let updateForm: HTMLFormElement;
  let currentEditingBillable: Billable | null = null;

  function saveEdit(code: string, data: Partial<Billable>) {
    console.log('🔄 Starting saveEdit for billable:', code, 'with data:', data);

    const billable = billables.find(b => b.billable_code === code);
    if (!billable) {
      console.error('❌ Billable not found:', code);
      toastStore.error('Billable item not found.');
      return;
    }

    console.log('📋 Found billable:', billable);

    // Prepare the updated billable data
    const updatedBillable = {
      ...billable,
      description: data.description || billable.description,
      cost: data.cost ?? billable.cost,
      delimiter: data.delimiter || billable.delimiter || '',
      is_displayed: data.is_displayed ?? billable.is_displayed ?? false
    };

    console.log('📝 Updated billable data:', updatedBillable);

    // Create FormData directly instead of relying on hidden inputs
    const formData = new FormData();
    formData.set('id', updatedBillable.id.toString());
    formData.set('description', updatedBillable.description);
    formData.set('cost', updatedBillable.cost.toString());
    formData.set('delimiter', updatedBillable.delimiter || '');
    formData.set('is_displayed', updatedBillable.is_displayed ? 'true' : 'false');

    console.log('📤 Direct FormData created:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    // Submit the form directly with the FormData
    if (updateForm) {
      console.log('🚀 Submitting form with direct FormData');

      // Create a temporary form submission
      fetch(updateForm.action, {
        method: 'POST',
        body: formData
      }).then(response => {
        console.log('📬 Direct form submission response:', response.status);
        if (response.ok) {
          console.log('✅ Update successful, clearing editing state');
          editing = null;
          editingData = { description: '', cost: 0, delimiter: '' };
          currentEditingBillable = null;
          // Refresh the page data
          location.reload();
        } else {
          console.log('❌ Update failed');
          toastStore.error('Failed to update billable item. Please try again.');
        }
      }).catch(error => {
        console.error('💥 Form submission error:', error);
        toastStore.error('Failed to update billable item. Please try again.');
      });
    } else {
      console.error('❌ Update form not found');
    }
  }

  let deleteForm: HTMLFormElement;
  let currentDeletingBillable: Billable | null = null;

  function remove(code: string) {
    console.log('🗑️ Starting delete for billable:', code);

    const billable = billables.find(b => b.billable_code === code);
    if (!billable) {
      console.error('❌ Billable not found for deletion:', code);
      toastStore.error('Billable item not found.');
      return;
    }

    console.log('📋 Found billable to delete:', billable);

    // Create FormData directly for delete operation
    const formData = new FormData();
    formData.set('id', billable.id.toString());

    console.log('📤 Direct FormData created for delete:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    // Submit the delete form directly with the FormData
    if (deleteForm) {
      console.log('🚀 Submitting delete form with direct FormData');

      // Create a direct form submission for delete
      fetch(deleteForm.action, {
        method: 'POST',
        body: formData
      }).then(response => {
        console.log('📬 Direct delete submission response:', response.status);
        if (response.ok) {
          console.log('✅ Delete successful');
          // Refresh the page data
          location.reload();
        } else {
          console.log('❌ Delete failed');
          toastStore.error('Failed to delete billable item. Please try again.');
        }
      }).catch(error => {
        console.error('💥 Delete submission error:', error);
        toastStore.error('Failed to delete billable item. Please try again.');
      });
    } else {
      console.error('❌ Delete form not found');
    }
  }

  // CSV Import functions
  function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file && file.type === 'text/csv') {
      csvFile = file;
    } else {
      toastStore.error('Please select a valid CSV file.');
      csvFile = null;
    }
  }

  function validateHeaders(headers: string[]): ImportError[] {
    const errors: ImportError[] = [];

    // Check for required headers
    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        errors.push({
          row: 0,
          field: required,
          message: `Missing required header: ${required}`
        });
      }
    }

    // Check for unknown headers
    const allValidHeaders = [...requiredHeaders, ...optionalHeaders];
    for (const header of headers) {
      if (!allValidHeaders.includes(header.toLowerCase())) {
        errors.push({
          row: 0,
          field: header,
          message: `Unknown header: ${header}. Valid headers are: ${allValidHeaders.join(', ')}`
        });
      }
    }

    return errors;
  }

  function validateRow(row: any, rowIndex: number): ImportError[] {
    const errors: ImportError[] = [];

    // Validate billable_code
    if (!row.billable_code || typeof row.billable_code !== 'string' || row.billable_code.trim() === '') {
      errors.push({
        row: rowIndex + 1,
        field: 'billable_code',
        message: 'Billable code is required and must be a non-empty string',
        value: row.billable_code
      });
    }

    // Validate description
    if (!row.description || typeof row.description !== 'string' || row.description.trim() === '') {
      errors.push({
        row: rowIndex + 1,
        field: 'description',
        message: 'Description is required and must be a non-empty string',
        value: row.description
      });
    }

    // Validate cost
    const cost = parseFloat(row.cost);
    if (isNaN(cost) || cost < 0) {
      errors.push({
        row: rowIndex + 1,
        field: 'cost',
        message: 'Cost must be a valid positive number',
        value: row.cost
      });
    }

    return errors;
  }

  async function processCSV() {
    if (!csvFile) {
      toastStore.error('Please select a CSV file first.');
      return;
    }

    isImporting = true;
    importErrors = [];
    importPreview = [];

    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length === 0) {
        toastStore.error('CSV file is empty.');
        isImporting = false;
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      // Validate headers
      const headerErrors = validateHeaders(headers);
      if (headerErrors.length > 0) {
        importErrors = headerErrors;
        importStep = 'errors';
        isImporting = false;
        return;
      }

      // Parse data rows
      const dataRows = lines.slice(1);
      const parsedData: Billable[] = [];
      const rowErrors: ImportError[] = [];

      for (let i = 0; i < dataRows.length; i++) {
        const values = dataRows[i].split(',').map(v => v.trim());
        const row: any = {};

        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        // Validate row
        const errors = validateRow(row, i);
        if (errors.length > 0) {
          rowErrors.push(...errors);
        } else {
          // Check for duplicates in existing data
          const exists = billables.find(b => b.billable_code === row.billable_code);
          if (exists) {
            rowErrors.push({
              row: i + 1,
              field: 'billable_code',
              message: `Billable code '${row.billable_code}' already exists`,
              value: row.billable_code
            });
          } else {
            parsedData.push({
              id: 0,
              billable_code: row.billable_code,
              description: row.description,
              cost: parseFloat(row.cost),
              delimiter: row.delimiter || '',
              org_id: 0,
              is_displayed: row.is_displayed !== 'false' && row.is_displayed !== '0'
            });
          }
        }
      }

      if (rowErrors.length > 0) {
        importErrors = rowErrors;
        importStep = 'errors';
      } else {
        importPreview = parsedData;
        importStep = 'preview';
      }
    } catch (error) {
      console.error('Error processing CSV:', error);
      toastStore.error('Error processing CSV file. Please check the format.');
    } finally {
      isImporting = false;
    }
  }

  async function confirmImport() {
    if (importPreview.length === 0) return;

    isImporting = true;
    try {
      // Import all billables using individual form submissions
      for (const billable of importPreview) {
        const formData = new FormData();
        formData.set('billable_code', billable.billable_code);
        formData.set('description', billable.description);
        formData.set('cost', billable.cost.toString());
        formData.set('delimiter', billable.delimiter || '');
        formData.set('org_id', billable.org_id.toString());
        formData.set('is_displayed', billable.is_displayed ? 'true' : 'false');

        const response = await fetch('?/create', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Failed to import ${billable.billable_code}`);
        }
      }

      // Refresh data
      await invalidateAll();

      // Reset import state
      resetImportModal();
      toastStore.success(`Successfully imported ${importPreview.length} billable items!`);
    } catch (error) {
      console.error('Error importing billables:', error);
      toastStore.error('Error importing some billables. Please try again.');
    } finally {
      isImporting = false;
    }
  }

  function resetImportModal() {
    showImportModal = false;
    csvFile = null;
    importErrors = [];
    importPreview = [];
    importStep = 'upload';
    isImporting = false;
    if (csvFileInput) {
      csvFileInput.value = '';
    }
  }

  function cancelAdd() {
    resetNewBillable();
  }

  function startEdit(billable: Billable) {
    console.log('✏️ Starting edit for billable:', billable);
    editing = billable.billable_code;
    editingData = {
      description: billable.description,
      cost: billable.cost,
      delimiter: billable.delimiter || ''
    };
    console.log('📝 Edit state set:', { editing, editingData });
  }

  function validateCost(value: number): number {
    // Ensure cost is a valid positive number
    const numValue = parseFloat(String(value));
    return isNaN(numValue) || numValue < 0 ? 0 : numValue;
  }

  function cancelEdit() {
    editing = null;
    editingData = { description: '', cost: 0, delimiter: '' };
  }

  function toggleActive(billable: Billable) {
    currentEditingBillable = billable;

    // Set form data and submit
    if (updateForm) {
      const formData = new FormData();
      formData.set('id', billable.id.toString());
      formData.set('description', billable.description);
      formData.set('cost', billable.cost.toString());
      formData.set('delimiter', billable.delimiter || '');
      formData.set('is_displayed', (!(billable.is_displayed ?? false)).toString());

      updateForm.requestSubmit();
    }
  }

  function printBillables() {
    // Create print content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Billable Items - ${new Date().toLocaleDateString()}</title>
        <style>
          @media print {
            @page { margin: 0.5in; }
            body { margin: 0; font-family: Arial, sans-serif; font-size: 12px; }
            .print-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .print-title { font-size: 18px; font-weight: bold; margin: 0; }
            .print-subtitle { font-size: 14px; color: #666; margin: 5px 0 0 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .code { font-family: monospace; }
            .cost { text-align: right; }
            .print-footer { margin-top: 20px; text-align: center; font-size: 10px; color: #666; }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1 class="print-title">Billable Items</h1>
          <p class="print-subtitle">Generated on ${new Date().toLocaleDateString()} • Total Items: ${filtered.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th class="cost">Cost</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(billable => `
              <tr>
                <td class="code">${billable.billable_code}</td>
                <td>${billable.description}</td>
                <td class="cost">$${(billable.cost ?? 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="print-footer">
          <p>Patient Advocate - Dental Practice Management</p>
        </div>
      </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      // printWindow.close();
    }
  }
</script>

<div class="space-y-6 p-4">
  <!-- Page Header -->
  <div class="space-y-2">
    <h1 class="text-2xl font-semibold tracking-tight">Billable Items</h1>
    <p class="text-muted-foreground">
      Manage your billable codes, descriptions, and costs. Import from CSV or add manually.
    </p>
  </div>

  <!-- Actions Bar -->
  <div class="flex items-center justify-between gap-4">
    <div class="flex items-center gap-2">
      <Button onclick={() => showAddForm = !showAddForm} variant="default">
        <PlusIcon />
        Add Billable
      </Button>
      <Button onclick={() => showImportModal = true} variant="outline">
        <UploadIcon />
        Import CSV
      </Button>
      <Button onclick={printBillables} variant="outline">
        <PrinterIcon />
        Print
      </Button>
    </div>
    
    <div class="relative">
      <SearchIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search billables..."
        class="pl-9 w-[300px]"
        bind:value={searchQuery}
        oninput={() => {
          currentPage = 1;
          refreshData();
        }}
      />
    </div>
  </div>

  <!-- Main Content Card -->
  <Card>
    <CardHeader>
      <CardTitle>Billable Items ({filtered.length})</CardTitle>
      <CardDescription>
        Manage billing codes and their associated costs for your practice.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <!-- Add New Form -->
        {#if showAddForm}
          <div class="rounded-lg border p-4 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium">Add New Billable Item</h3>
              <Button onclick={cancelAdd} variant="ghost" size="sm">
                <XIcon />
              </Button>
            </div>
            <form
              id="create-billable-form"
              method="POST"
              action="?/create"
              use:enhance={() => {
                return ({ result }) => {
                  if (result.type === 'success') {
                    resetNewBillable();
                    invalidateAll();
                  }
                };
              }}
            >
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="space-y-2">
                  <label for="billable-code" class="text-sm font-medium">Billable Code *</label>
                  <Input
                    id="billable-code"
                    name="billable_code"
                    type="text"
                    placeholder="e.g., D2740"
                    bind:value={newBillable.billable_code}
                    required
                  />
                </div>
                <div class="space-y-2">
                  <label for="billable-description" class="text-sm font-medium">Description *</label>
                  <Input
                    id="billable-description"
                    name="description"
                    type="text"
                    placeholder="e.g., Crown - porcelain/ceramic"
                    bind:value={newBillable.description}
                    required
                  />
                </div>
                <div class="space-y-2">
                  <label for="billable-cost" class="text-sm font-medium">Cost *</label>
                  <Input
                    id="billable-cost"
                    name="cost"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    bind:value={newBillable.cost}
                    required
                  />
                </div>
                <div class="space-y-2">
                  <label for="billable-delimiter" class="text-sm font-medium">Delimiter</label>
                  <Input
                    id="billable-delimiter"
                    name="delimiter"
                    type="text"
                    placeholder="e.g., teeth"
                    bind:value={newBillable.delimiter}
                  />
                </div>
              </div>
              <div class="flex items-center space-x-2 mt-4">
                <Switch
                  id="billable-displayed"
                  checked={newBillable.is_displayed ?? false}
                  onCheckedChange={(checked: boolean) => {
                    newBillable.is_displayed = checked;
                  }}
                />
                <label for="billable-displayed" class="text-sm font-medium">Displayed</label>
                <input type="hidden" name="is_displayed" value={newBillable.is_displayed ? 'true' : 'false'} />
                <input type="hidden" name="org_id" value={newBillable.org_id} />
              </div>
              <div class="flex justify-end gap-2 mt-4">
                <Button onclick={cancelAdd} variant="outline" type="button">Cancel</Button>
                <Button type="submit">Save Billable</Button>
              </div>
            </form>
          </div>
          <Separator />
        {/if}

        <!-- Table -->
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="cursor-pointer hover:bg-muted/50" onclick={() => handleSort('billable_code')}>
                  <div class="flex items-center gap-1">
                    Code
                    {#if sortField === 'billable_code'}
                      {#if sortDirection === 'asc'}
                        <ChevronUpIcon class="h-4 w-4" />
                      {:else}
                        <ChevronDownIcon class="h-4 w-4" />
                      {/if}
                    {/if}
                  </div>
                </TableHead>
                <TableHead class="cursor-pointer hover:bg-muted/50" onclick={() => handleSort('description')}>
                  <div class="flex items-center gap-1">
                    Description
                    {#if sortField === 'description'}
                      {#if sortDirection === 'asc'}
                        <ChevronUpIcon class="h-4 w-4" />
                      {:else}
                        <ChevronDownIcon class="h-4 w-4" />
                      {/if}
                    {/if}
                  </div>
                </TableHead>
                <TableHead class="text-right cursor-pointer hover:bg-muted/50" onclick={() => handleSort('cost')}>
                  <div class="flex items-center justify-end gap-1">
                    Cost
                    {#if sortField === 'cost'}
                      {#if sortDirection === 'asc'}
                        <ChevronUpIcon class="h-4 w-4" />
                      {:else}
                        <ChevronDownIcon class="h-4 w-4" />
                      {/if}
                    {/if}
                  </div>
                </TableHead>
                <TableHead>Delimiter</TableHead>
                <TableHead class="text-center w-[80px]">Displayed</TableHead>
                <TableHead class="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each paginated as billable (billable.billable_code)}
                <TableRow>
                  {#if editing === billable.billable_code}
                    <TableCell class="font-mono text-sm">{billable.billable_code}</TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        bind:value={editingData.description}
                        class="h-8"
                      />
                    </TableCell>
                    <TableCell class="text-right">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        bind:value={editingData.cost}
                        class="h-8 text-right"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        bind:value={editingData.delimiter}
                        placeholder="e.g., teeth"
                        class="h-8"
                      />
                    </TableCell>
                    <TableCell class="text-center">
                      <Switch
                        checked={billable.is_displayed ?? false}
                        onCheckedChange={() => toggleActive(billable)}
                      />
                    </TableCell>
                    <TableCell>
                      <div class="flex items-center gap-1">
                        <Button
                          onclick={() => {
                            console.log('💾 Save button clicked for billable:', billable.billable_code);
                            console.log('📝 Current editing data:', editingData);

                            if (!editingData.description.trim()) {
                              console.log('❌ Validation failed: empty description');
                              toastStore.error('Description cannot be empty.');
                              return;
                            }

                            console.log('✅ Validation passed, calling saveEdit');
                            saveEdit(billable.billable_code, {
                              description: editingData.description.trim(),
                              cost: validateCost(editingData.cost),
                              delimiter: editingData.delimiter.trim()
                            });
                          }}
                          variant="ghost"
                          size="icon"
                          class="h-8 w-8"
                        >
                          <CheckIcon class="h-4 w-4" />
                        </Button>
                        <Button
                          onclick={cancelEdit}
                          variant="ghost"
                          size="icon"
                          class="h-8 w-8"
                        >
                          <XIcon class="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  {:else}
                    <TableCell class="font-mono text-sm">{billable.billable_code}</TableCell>
                    <TableCell>{billable.description}</TableCell>
                    <TableCell class="text-right">${(billable.cost ?? 0).toFixed(2)}</TableCell>
                    <TableCell>{billable.delimiter || ''}</TableCell>
                    <TableCell class="text-center">
                      {#if billable.is_displayed}
                        <Badge variant="default" class="bg-green-100 text-green-800 hover:bg-green-100">Displayed</Badge>
                      {:else}
                        <Badge variant="secondary" class="bg-gray-100 text-gray-600">Hidden</Badge>
                      {/if}
                    </TableCell>
                    <TableCell>
                      <div class="flex items-center gap-2">
                        <Button 
                          onclick={() => startEdit(billable)}
                          variant="outline"
                          size="sm"
                          class="h-8"
                        >
                          <EditIcon class="h-4 w-4" />
                          Edit
                        </Button>
                        <Button 
                          onclick={() => {
                            if (confirm('Are you sure you want to delete this billable item?')) {
                              remove(billable.billable_code);
                            }
                          }}
                          variant="destructive"
                          size="sm"
                          class="h-8"
                        >
                          <TrashIcon class="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  {/if}
                </TableRow>
              {/each}
              {#if paginated.length === 0}
                <TableRow>
                  <TableCell colspan={6} class="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No billables match your search.' : 'No billable items found. Click "Add Billable" to create your first item.'}
                  </TableCell>
                </TableRow>
              {/if}
            </TableBody>
          </Table>
        </div>

        <!-- Pagination -->
        {#if totalPages > 1}
          <div class="flex items-center justify-between">
            <p class="text-sm text-muted-foreground">
              Showing {Math.min((currentPage - 1) * pageSize + 1, filtered.length)} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
            </p>
            <div class="flex items-center gap-2">
              <Button 
                onclick={() => updatePaginated(-1)} 
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <span class="text-sm">Page {currentPage} of {totalPages}</span>
              <Button 
                onclick={() => updatePaginated(1)} 
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        {/if}
      </div>
    </CardContent>
  </Card>
</div>

<!-- Hidden Forms for Actions -->
<form
  bind:this={updateForm}
  method="POST"
  action="?/update"
  use:enhance={() => {
    console.log('📤 Form enhance triggered for update');
    return ({ result }) => {
      console.log('📬 Update form result:', result);
      if (result.type === 'success') {
        console.log('✅ Update successful, clearing editing state');
        // Clear editing state after successful update
        editing = null;
        editingData = { description: '', cost: 0, delimiter: '' };
        currentEditingBillable = null;
        invalidateAll();
      } else if (result.type === 'failure') {
        console.log('❌ Update failed:', result);
        // Keep editing state on failure so user can retry
        toastStore.error('Failed to update billable item. Please try again.');
      }
    };
  }}
  class="hidden"
>
  {#if currentEditingBillable}
    <!-- Debug: Form data being sent -->
    {console.log('📋 Form hidden inputs data:', {
      id: currentEditingBillable.id,
      description: currentEditingBillable.description,
      cost: currentEditingBillable.cost,
      delimiter: currentEditingBillable.delimiter || '',
      is_displayed: currentEditingBillable.is_displayed ? 'true' : 'false'
    })}
    <input type="hidden" name="id" value={currentEditingBillable.id} />
    <input type="hidden" name="description" value={currentEditingBillable.description} />
    <input type="hidden" name="cost" value={currentEditingBillable.cost} />
    <input type="hidden" name="delimiter" value={currentEditingBillable.delimiter || ''} />
    <input type="hidden" name="is_displayed" value={currentEditingBillable.is_displayed ? 'true' : 'false'} />
  {:else}
    {console.log('⚠️ No currentEditingBillable set - form will not submit data')}
  {/if}
</form>

<form
  bind:this={deleteForm}
  method="POST"
  action="?/delete"
  use:enhance={() => {
    return ({ result }) => {
      if (result.type === 'success') {
        invalidateAll();
      }
    };
  }}
  class="hidden"
>
  {#if currentDeletingBillable}
    <input type="hidden" name="id" value={currentDeletingBillable.id} />
  {/if}
</form>

<!-- CSV Import Modal -->
{#if showImportModal}
  <div class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <Card class="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Import Billables from CSV</CardTitle>
            <CardDescription>
              Upload a CSV file to import multiple billable items at once
            </CardDescription>
          </div>
          <Button onclick={resetImportModal} variant="ghost" size="icon">
            <XIcon />
          </Button>
        </div>
      </CardHeader>
      <CardContent class="space-y-6">
        {#if importStep === 'upload'}
          <!-- Upload Step -->
          <div class="space-y-4">
            <div class="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center space-y-4">
              <div class="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <FileTextIcon class="h-6 w-6 text-muted-foreground" />
              </div>
              <div class="space-y-2">
                <h3 class="text-lg font-medium">Choose CSV File</h3>
                <p class="text-sm text-muted-foreground">
                  Select a CSV file with your billable items
                </p>
              </div>
              <input
                bind:this={csvFileInput}
                type="file"
                accept=".csv"
                onchange={handleFileUpload}
                class="hidden"
              />
              <Button onclick={() => csvFileInput?.click()} variant="outline">
                <UploadIcon />
                Select File
              </Button>
              {#if csvFile}
                <p class="text-sm text-green-600">Selected: {csvFile.name}</p>
              {/if}
            </div>

            <!-- CSV Format Instructions -->
            <div class="bg-muted/50 rounded-lg p-4 space-y-3">
              <div class="flex items-center gap-2">
                <InfoIcon class="h-4 w-4 text-blue-600" />
                <h4 class="font-medium">CSV Format Requirements</h4>
              </div>
              <div class="text-sm space-y-2">
                <p><strong>Required columns:</strong> billable_code, description, cost</p>
                <p><strong>Optional columns:</strong> delimiter, is_displayed</p>
                <p class="text-muted-foreground">
                  Example: billable_code,description,cost,is_displayed<br/>
                  D2740,"Crown - porcelain/ceramic",1200.00,true
                </p>
              </div>
            </div>

            <div class="flex justify-end gap-2">
              <Button onclick={resetImportModal} variant="outline">Cancel</Button>
              <Button onclick={processCSV} disabled={!csvFile || isImporting}>
                {isImporting ? 'Processing...' : 'Process CSV'}
              </Button>
            </div>
          </div>
        
        {:else if importStep === 'preview'}
          <!-- Preview Step -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <CheckIcon class="h-5 w-5 text-green-600" />
              <h3 class="text-lg font-medium">Import Preview</h3>
            </div>
            <p class="text-sm text-muted-foreground">
              {importPreview.length} billable items ready to import. Review the data below.
            </p>
            
            <div class="rounded-md border max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead class="text-right">Cost</TableHead>
                    <TableHead>Delimiter</TableHead>
                    <TableHead class="text-center">Displayed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {#each importPreview as item}
                    <TableRow>
                      <TableCell class="font-mono text-sm">{item.billable_code}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell class="text-right">${(item.cost ?? 0).toFixed(2)}</TableCell>
                      <TableCell>{item.delimiter || ''}</TableCell>
                      <TableCell class="text-center">
                        {#if item.is_displayed}
                          <Badge variant="default" class="bg-green-100 text-green-800 hover:bg-green-100">Displayed</Badge>
                        {:else}
                          <Badge variant="secondary" class="bg-gray-100 text-gray-600">Hidden</Badge>
                        {/if}
                      </TableCell>
                    </TableRow>
                  {/each}
                </TableBody>
              </Table>
            </div>

            <div class="flex justify-end gap-2">
              <Button onclick={resetImportModal} variant="outline">Cancel</Button>
              <Button onclick={() => importStep = 'upload'} variant="outline">Back</Button>
              <Button onclick={confirmImport} disabled={isImporting}>
                {isImporting ? 'Importing...' : `Import ${importPreview.length} Items`}
              </Button>
            </div>
          </div>

        {:else if importStep === 'errors'}
          <!-- Errors Step -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <XIcon class="h-5 w-5 text-red-600" />
              <h3 class="text-lg font-medium">Import Errors</h3>
            </div>
            <p class="text-sm text-muted-foreground">
              Please fix the following errors and try again:
            </p>
            
            <div class="space-y-2 max-h-64 overflow-y-auto">
              {#each importErrors as error}
                <div class="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div class="flex items-start gap-2">
                    <XIcon class="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div class="text-sm">
                      <p class="font-medium text-red-800">
                        {error.row === 0 ? 'Header Error' : `Row ${error.row}`}: {error.field}
                      </p>
                      <p class="text-red-700">{error.message}</p>
                      {#if error.value}
                        <p class="text-red-600 font-mono">Value: "{error.value}"</p>
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            </div>

            <div class="flex justify-end gap-2">
              <Button onclick={resetImportModal} variant="outline">Cancel</Button>
              <Button onclick={() => importStep = 'upload'} variant="outline">Try Again</Button>
            </div>
          </div>
        {/if}
      </CardContent>
    </Card>
  </div>
{/if}