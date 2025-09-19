<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Form from "$lib/components/ui/form/index.js";
  import PasswordInput from "$lib/components/ui/password-input.svelte";
  import { formSchema, type FormSchema } from "./schema";
  import { type SuperValidated, type Infer, superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { page } from '$app/stores';
  import { toastStore } from "$lib/stores/toast";

  let { data }: { data: { form: SuperValidated<Infer<FormSchema>>, inviteCode?: string } } = $props();

  const form = superForm(data.form, {
    validators: zodClient(formSchema),
    validationMethod: 'submit-only',
    clearOnSubmit: 'errors-and-message',
    onResult: ({ result }) => {
      if (result.type === 'success') {
        toastStore.success('Registration successful! Welcome to the platform.');
      } else if (result.type === 'failure') {
        const message = result.data?.message;
        if (message) {
          toastStore.error(`Registration failed: ${message}`);
        } else {
          toastStore.error('Registration failed. Please check your information and try again.');
        }
      }
    },
    onError: () => {
      toastStore.error('An unexpected error occurred during registration. Please try again.');
    }
  });

  const { form: formData, enhance, submitting } = form;
</script>

<Card.Root class="m-auto w-full max-w-md">
  <Card.Header>
    <Card.Title class="text-2xl">Register</Card.Title>
    <Card.Description>
      {#if data.inviteCode}
        Complete your registration using the organization invite
      {:else}
        Enter your information below to create your account
      {/if}
    </Card.Description>
  </Card.Header>
  <Card.Content>
    <form method="POST" use:enhance class="max-w-2xl flex flex-col m-auto gap-5">
      <div class="grid grid-cols-2 gap-4">
        <Form.Field {form} name="firstName">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>First Name</Form.Label>
              <Input {...props} bind:value={$formData.firstName} />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
        <Form.Field {form} name="lastName">
          <Form.Control>
            {#snippet children({ props })}
              <Form.Label>Last Name</Form.Label>
              <Input {...props} bind:value={$formData.lastName} />
            {/snippet}
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
      </div>
      <Form.Field {form} name="email">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Email</Form.Label>
            <Input {...props} bind:value={$formData.email} />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Field {form} name="password">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Password </Form.Label>

            <PasswordInput {...props} bind:value={$formData.password} />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Field {form} name="orgId">
        <Form.Control>
          {#snippet children({ props })}
            <Form.Label>Organization ID</Form.Label>
            {#if data.inviteCode}
              <Input {...props} bind:value={$formData.orgId} readonly class="bg-gray-50" />
              <p class="text-sm text-green-600 mt-1">✓ Using invite code</p>
            {:else}
              <Input {...props} bind:value={$formData.orgId} placeholder="Enter 7-letter organization code" />
            {/if}
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Button disabled={$submitting}>
        {#if $submitting}
          <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Creating Account...
        {:else}
          Create Account
        {/if}
      </Form.Button>
    </form>
  </Card.Content>
</Card.Root>
