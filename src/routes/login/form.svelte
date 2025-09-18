<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Form from "$lib/components/ui/form/index.js";
  import PasswordInput from "$lib/components/ui/password-input.svelte";
  import { formSchema, type FormSchema } from "./schema";
  import { type SuperValidated, type Infer, superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { toastStore } from "$lib/toast";

  let { data }: { data: { form: SuperValidated<Infer<FormSchema>> } } = $props();

  const form = superForm(data.form, {
    validators: zodClient(formSchema),
    validationMethod: 'submit-only',
    clearOnSubmit: 'errors-and-message',
    onResult: ({ result }) => {
      if (result.type === 'success') {
        toastStore.success('Login successful! Welcome back.');
      } else if (result.type === 'failure') {
        const error = result.data?.error;
        if (error?.message) {
          toastStore.error(`Login failed: ${error.message}`);
        } else {
          toastStore.error('Login failed. Please check your credentials and try again.');
        }
      }
    },
    onError: () => {
      toastStore.error('An unexpected error occurred. Please try again.');
    }
  });

  const { form: formData, enhance } = form;
</script>

<Card.Root class="m-auto w-full max-w-sm max-h-[450px]">
  <Card.Header>
    <Card.Title class="text-2xl">Login</Card.Title>
    <Card.Description>Enter your email below to login to your account</Card.Description>
  </Card.Header>
  <Card.Content>
    <form method="POST" action="?/login" use:enhance class="max-w-2xl flex flex-col m-auto gap-5">
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
            <Form.Label>Password <a href="##" class="ml-auto inline-block text-sm underline-offset-4 hover:underline"> Forgot your password? </a></Form.Label>

            <PasswordInput {...props} bind:value={$formData.password} />
          {/snippet}
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      
      <Form.Button>Submit</Form.Button>
    </form>
    
    <div class="mt-4 text-center text-sm">
      Don't have an account?{" "}
      <a href="/register" class="text-blue-600 hover:text-blue-500 font-medium underline underline-offset-4">
        Sign up here
      </a>
    </div>
  </Card.Content>
</Card.Root>
