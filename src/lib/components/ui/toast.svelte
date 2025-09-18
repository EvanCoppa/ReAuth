<script lang="ts">
  import { toastStore, type Toast } from '$lib/toast';
  import { fly } from 'svelte/transition';
  import CheckCircleIcon from '@lucide/svelte/icons/check-circle';
  import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
  import AlertTriangleIcon from '@lucide/svelte/icons/alert-triangle';
  import InfoIcon from '@lucide/svelte/icons/info';
  import XIcon from '@lucide/svelte/icons/x';

  let toasts: Toast[] = [];
  
  toastStore.subscribe(value => {
    toasts = value;
  });

  function getIcon(type: Toast['type']) {
    switch (type) {
      case 'success': return CheckCircleIcon;
      case 'error': return AlertCircleIcon;
      case 'warning': return AlertTriangleIcon;
      case 'info': return InfoIcon;
      default: return InfoIcon;
    }
  }

  function getColors(type: Toast['type']) {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  }

  function getIconColor(type: Toast['type']) {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  }
</script>

<!-- Toast Container -->
<div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
  {#each toasts as toast (toast.id)}
    <div
      class="flex items-start p-4 border rounded-lg shadow-lg backdrop-blur-sm {getColors(toast.type)}"
      transition:fly={{ x: 300, duration: 300 }}
      role="alert"
    >
      <!-- Icon -->
      <div class="flex-shrink-0 mr-3">
        <svelte:component this={getIcon(toast.type)} class="h-5 w-5 {getIconColor(toast.type)}" />
      </div>
      
      <!-- Message -->
      <div class="flex-1 text-sm font-medium">
        {toast.message}
      </div>
      
      <!-- Dismiss Button -->
      {#if toast.dismissible}
        <button
          class="flex-shrink-0 ml-3 opacity-70 hover:opacity-100 transition-opacity"
          on:click={() => toastStore.removeToast(toast.id)}
          aria-label="Dismiss"
        >
          <XIcon class="h-4 w-4" />
        </button>
      {/if}
    </div>
  {/each}
</div>