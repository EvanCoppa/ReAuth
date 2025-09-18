<script lang="ts">
  interface Props {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    fullScreen?: boolean;
  }

  let { message = 'Loading...', size = 'md', fullScreen = false }: Props = $props();

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
</script>

<div class="flex items-center justify-center {fullScreen ? 'min-h-[400px]' : 'py-8'}">
  <div class="flex flex-col items-center gap-3">
    <div class="animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100 {sizeClasses[size]}"></div>
    {#if message}
      <div class="text-sm text-muted-foreground">
        {message}
      </div>
    {/if}
  </div>
</div>