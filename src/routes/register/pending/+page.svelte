<script lang="ts">
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Separator } from '$lib/components/ui/separator';
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  
  async function signOut() {
    try {
      await supabase.auth.signOut();
      goto('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  async function refreshStatus() {
    // Force a page reload to check if approval status has changed
    window.location.reload();
  }
</script>

<svelte:head>
  <title>Account Pending Approval - Patient Advocate</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div class="text-center">
      <div class="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
        <svg class="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 class="mt-6 text-3xl font-bold text-gray-900">
        Account Pending Approval
      </h2>
      <p class="mt-2 text-sm text-gray-600">
        Your registration was successful, but your account requires administrator approval before you can access the system.
      </p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-lg">What happens next?</CardTitle>
        <CardDescription>
          Here's what you can expect during the approval process
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-4">
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div class="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium text-blue-600">1</span>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-900">Administrator Review</h3>
              <p class="text-sm text-gray-600">
                An administrator will review your registration details and verify your account information.
              </p>
            </div>
          </div>

          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div class="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium text-blue-600">2</span>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-900">Email Notification</h3>
              <p class="text-sm text-gray-600">
                You'll receive an email notification once your account has been approved or if additional information is needed.
              </p>
            </div>
          </div>

          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div class="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium text-blue-600">3</span>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-900">Access Granted</h3>
              <p class="text-sm text-gray-600">
                Once approved, you'll be able to log in and access all features of the Patient Advocate platform.
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div class="bg-blue-50 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800">
                Typical approval time
              </h3>
              <div class="mt-1 text-sm text-blue-700">
                Most accounts are reviewed and approved within 1-2 business days. If you haven't heard back within 3 business days, please contact support.
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <Button 
            onclick={refreshStatus}
            variant="default" 
            class="w-full"
          >
            Check Approval Status
          </Button>
          
          <Button 
            onclick={signOut}
            variant="outline" 
            class="w-full"
          >
            Sign Out
          </Button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            Need help or have questions?
          </p>
          <a href="mailto:support@guaranteethslides.com" class="text-sm text-blue-600 hover:text-blue-500 font-medium">
            Contact Support
          </a>
        </div>
      </CardContent>
    </Card>

    <div class="text-center">
      <p class="text-xs text-gray-500">
        This is an automated system. Please do not reply to system emails.
      </p>
    </div>
  </div>
</div>
