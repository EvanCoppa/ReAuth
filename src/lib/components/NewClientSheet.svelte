<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import * as Sheet from '$lib/components/ui/sheet';
  import { enhance } from '$app/forms';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (enhance: any) => any;
  }

  let { isOpen = $bindable(), onClose, onSubmit }: Props = $props();

  let isCreating = $state(false);
  let newClient = $state({
    first_name: '',
    last_name: '',
    dob: '',
    phone: '',
    email: '',
    address: '',
    insurance_provider: ''
  });

  function resetForm() {
    newClient = {
      first_name: '',
      last_name: '',
      dob: '',
      phone: '',
      email: '',
      address: '',
      insurance_provider: ''
    };
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleEnhance() {
    isCreating = true;
    return onSubmit({
      onComplete: () => {
        isCreating = false;
        resetForm();
      }
    });
  }
</script>

<Sheet.Root bind:open={isOpen}>
  <Sheet.Content class="sm:max-w-md">
    <Sheet.Header>
      <Sheet.Title>Add New Client</Sheet.Title>
      <Sheet.Description>
        Create a new client record by filling out their information below.
      </Sheet.Description>
    </Sheet.Header>
    
    <form method="POST" action="?/create" use:enhance={handleEnhance}>
      <div class="grid gap-4 py-4 m-4">
        <div class="grid gap-2">
          <Label for="first-name">First Name *</Label>
          <Input
            id="first-name"
            name="first_name"
            type="text"
            placeholder="Enter first name"
            required
            bind:value={newClient.first_name}
          />
        </div>
        
        <div class="grid gap-2">
          <Label for="last-name">Last Name *</Label>
          <Input
            id="last-name"
            name="last_name"
            type="text"
            placeholder="Enter last name"
            required
            bind:value={newClient.last_name}
          />
        </div>
        
        <div class="grid gap-2">
          <Label for="dob">Date of Birth</Label>
          <Input
            id="dob"
            name="dob"
            type="date"
            bind:value={newClient.dob}
          />
        </div>
        
        <div class="grid gap-2">
          <Label for="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Enter phone number"
            bind:value={newClient.phone}
          />
        </div>
        
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter email address"
            bind:value={newClient.email}
          />
        </div>
        
        <div class="grid gap-2">
          <Label for="address">Address</Label>
          <textarea
            id="address"
            name="address"
            placeholder="Enter full address"
            rows="3"
            class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            bind:value={newClient.address}
          ></textarea>
        </div>
        
        <div class="grid gap-2">
          <Label for="insurance">Insurance Provider</Label>
          <Input
            id="insurance"
            name="insurance_provider"
            type="text"
            placeholder="Enter insurance provider"
            bind:value={newClient.insurance_provider}
          />
        </div>
      </div>
      
      <Sheet.Footer>
        <Button type="button" variant="outline" onclick={handleClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isCreating}>
          {#if isCreating}
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating...
          {:else}
            Create Client
          {/if}
        </Button>
      </Sheet.Footer>
    </form>
  </Sheet.Content>
</Sheet.Root>