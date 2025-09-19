<script lang="ts">
  import { cn } from "$lib/utils";

  interface StatusTagProps {
    status: string;
    class?: string;
  }

  let { status, class: className }: StatusTagProps = $props();

  // Define color mappings for known status codes
  const statusColorMap: Record<string, { bg: string; text: string; ring: string }> = {
    'paidinfull': {
      bg: 'bg-green-50',
      text: 'text-green-700',
      ring: 'ring-1 ring-inset ring-green-600/20'
    },
    'financed': {
      bg: 'bg-blue-50',
      text: 'text-blue-700', 
      ring: 'ring-1 ring-inset ring-blue-600/20'
    },
    'unpaid': {
      bg: 'bg-red-50',
      text: 'text-red-700',
      ring: 'ring-1 ring-inset ring-red-600/20'
    },
    'pending': {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      ring: 'ring-1 ring-inset ring-yellow-600/20'
    }
  };

  // Normalize status by removing spaces and converting to lowercase
  const normalizeStatus = (status: string): string => {
    return status.toLowerCase().replace(/\s+/g, '').replace(/_/g, '');
  };

  // Format status for display by capitalizing words
  const formatStatusText = (status: string): string => {
    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Get the normalized status key for color mapping
  const normalizedStatus = $derived(normalizeStatus(status));
  
  // Get colors for this status, fallback to neutral gray
  const colors = $derived(statusColorMap[normalizedStatus] || {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    ring: 'ring-1 ring-inset ring-gray-600/20'
  });

  // Format the display text
  const displayText = $derived(formatStatusText(status));
</script>

<span 
  class={cn(
    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
    colors.bg,
    colors.text,
    colors.ring,
    className
  )}
>
  {displayText}
</span>