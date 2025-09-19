<script lang="ts">
  import type { PageData } from './$types';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  
  export let data: PageData;
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div class="text-center">
      <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
        Join Organization
      </h2>
      <p class="mt-2 text-sm text-gray-600">
        You've been invited to join an organization
      </p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Organization Invitation</CardTitle>
        <CardDescription>
          You've been invited to join {data.organization.name}
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="p-4 bg-green-50 border border-green-200 rounded-md">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                Valid Invitation
              </h3>
              <div class="mt-2 text-sm text-green-700">
                <p>Organization: <strong>{data.organization.name}</strong></p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex space-x-4">
          <Button href="/register?invite={data.inviteCode}" class="flex-1">
            Accept Invitation
          </Button>
          <Button variant="outline" href="/login" class="flex-1">
            Already have an account?
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</div>