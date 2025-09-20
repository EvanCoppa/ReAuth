<script lang="ts">
  import { toastStore } from '$lib/toast';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import UploadIcon from '@lucide/svelte/icons/upload';
  import FileTextIcon from '@lucide/svelte/icons/file-text';
  import CheckIcon from '@lucide/svelte/icons/check';
  import XIcon from '@lucide/svelte/icons/x';
  import InfoIcon from '@lucide/svelte/icons/info';
  import type { Client } from '$lib/types';

  export let showImportModal: boolean = false;
  export let clients: Client[] = [];
  export let onImportComplete: (clients: Client[]) => void = () => {};

  interface ImportError {
    row: number;
    field: string;
    message: string;
    value?: string;
  }

  // State management
  let csvFile: File | null = null;
  let csvFileInput: HTMLInputElement;
  let importErrors: ImportError[] = [];
  let importPreview: Client[] = [];
  let importStep: 'upload' | 'preview' | 'errors' = 'upload';
  let isImporting = false;

  // Required CSV headers
  const requiredHeaders = ['first_name', 'last_name'];
  const optionalHeaders = ['dob', 'phone', 'email', 'address', 'insurance_provider'];

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

    // Validate first_name
    if (!row.first_name || typeof row.first_name !== 'string' || row.first_name.trim() === '') {
      errors.push({
        row: rowIndex + 1,
        field: 'first_name',
        message: 'First name is required and must be a non-empty string',
        value: row.first_name
      });
    }

    // Validate last_name
    if (!row.last_name || typeof row.last_name !== 'string' || row.last_name.trim() === '') {
      errors.push({
        row: rowIndex + 1,
        field: 'last_name',
        message: 'Last name is required and must be a non-empty string',
        value: row.last_name
      });
    }

    // Validate email format if provided
    if (row.email && row.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        errors.push({
          row: rowIndex + 1,
          field: 'email',
          message: 'Email must be a valid email address',
          value: row.email
        });
      }
    }

    // Validate date of birth format if provided
    if (row.dob && row.dob.trim() !== '') {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(row.dob)) {
        errors.push({
          row: rowIndex + 1,
          field: 'dob',
          message: 'Date of birth must be in YYYY-MM-DD format',
          value: row.dob
        });
      }
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
      const parsedData: Client[] = [];
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
          const exists = clients.find(c =>
            c.first_name.toLowerCase() === row.first_name.toLowerCase() &&
            c.last_name.toLowerCase() === row.last_name.toLowerCase() &&
            (row.email ? c.email?.toLowerCase() === row.email?.toLowerCase() : false)
          );
          if (exists) {
            rowErrors.push({
              row: i + 1,
              field: 'duplicate',
              message: `Client '${row.first_name} ${row.last_name}' ${row.email ? `with email '${row.email}'` : ''} already exists`,
              value: `${row.first_name} ${row.last_name}`
            });
          } else {
            parsedData.push({
              clientid: 0, // Will be assigned by server
              first_name: row.first_name,
              last_name: row.last_name,
              dob: row.dob || null,
              phone: row.phone || null,
              email: row.email || null,
              address: row.address || null,
              insurance_provider: row.insurance_provider || null,
              org_id: null // Will be assigned by server
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
      // Use FormData to submit to the SvelteKit action
      const formData = new FormData();
      formData.set('clients', JSON.stringify(importPreview));

      const response = await fetch('?/bulkImport', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to import clients');
      }

      // Parse the response as text first, then try to parse as JSON
      const responseText = await response.text();
      let result;

      try {
        result = JSON.parse(responseText);
      } catch {
        // If it's not JSON, it might be a redirect or HTML response
        if (response.status === 200 || response.status === 303) {
          // Success case - reset and notify
          resetImportModal();
          toastStore.success(`Successfully imported ${importPreview.length} clients!`);
          onImportComplete([]);
          return;
        } else {
          throw new Error('Unexpected response format');
        }
      }

      if (result.success || result.type === 'success') {
        // Reset import state
        resetImportModal();
        toastStore.success(`Successfully imported ${importPreview.length} clients!`);

        // Notify parent component
        onImportComplete(result.clients || []);
      } else {
        throw new Error(result.error || 'Import failed');
      }
    } catch (error) {
      console.error('Error importing clients:', error);
      toastStore.error('Error importing clients. Please try again.');
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
</script>

<!-- CSV Import Modal -->
{#if showImportModal}
  <div class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <Card class="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Import Clients from CSV</CardTitle>
            <CardDescription>
              Upload a CSV file to import multiple clients at once
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
                  Select a CSV file with your client data
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
                <p><strong>Required columns:</strong> first_name, last_name</p>
                <p><strong>Optional columns:</strong> dob, phone, email, address, insurance_provider</p>
                <p class="text-muted-foreground">
                  Example: first_name,last_name,email,phone,dob<br/>
                  John,Doe,john.doe@email.com,555-123-4567,1990-01-15
                </p>
                <p class="text-muted-foreground">
                  <strong>Date format:</strong> Use YYYY-MM-DD for dates (e.g., 1990-01-15)
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
              {importPreview.length} clients ready to import. Review the data below.
            </p>

            <div class="rounded-md border max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Insurance Provider</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {#each importPreview as client}
                    <TableRow>
                      <TableCell class="font-medium">{client.first_name}</TableCell>
                      <TableCell>{client.last_name}</TableCell>
                      <TableCell>{client.email || 'N/A'}</TableCell>
                      <TableCell>{client.phone || 'N/A'}</TableCell>
                      <TableCell>{client.dob ? new Date(client.dob).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>{client.address || 'N/A'}</TableCell>
                      <TableCell>{client.insurance_provider || 'N/A'}</TableCell>
                    </TableRow>
                  {/each}
                </TableBody>
              </Table>
            </div>

            <div class="flex justify-end gap-2">
              <Button onclick={resetImportModal} variant="outline">Cancel</Button>
              <Button onclick={() => importStep = 'upload'} variant="outline">Back</Button>
              <Button onclick={confirmImport} disabled={isImporting}>
                {isImporting ? 'Importing...' : `Import ${importPreview.length} Clients`}
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