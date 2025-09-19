<script lang="ts">
  import "../app.css";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import { invalidateAll } from "$app/navigation";
  import { on } from "svelte/events";
  import { fade } from "svelte/transition";
   import { page } from "$app/state";
  import { navigating } from "$app/stores";
  import { get } from "svelte/store";
  import AppSidebar from "$lib/components/app-sidebar.svelte";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import FloatingMenu from "$lib/components/floating-menu.svelte";
  import Toast from "$lib/components/ui/toast.svelte";
  import FeedbackButton from "$lib/components/ui/feedback-button.svelte";
  import { supabase } from "$lib/supabase";
  import { constructorExtends } from "@ark/util";
  import { cons } from "effect/List";


  let { children, data } = $props();

  let isLoading: boolean = $state(true);
  let showNavigationSpinner: boolean = $state(false);

  let sidebarOpen = $state(true);


  // Initialize sidebar state from cookie and auth state
  onMount(() => {
    // Async initialization
    (async () => {
 
  
      checkAuthAndSetLoading();
    })();

    // Supabase auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      console.log("Auth state change detected");
      invalidateAll();
    });

    return () => {
      subscription.unsubscribe();
    };
  });

  function checkAuthAndSetLoading() {
    // Whitelisted path prefixes - all nested paths are automatically included
    const WHITELISTED_PATHS = ['/slides', '/login', '/register', '/invite', '/portal', '/tester'];
    const currentPath = page.url.pathname;
    
    // Check if current path matches any whitelisted prefix
    const isWhitelisted = WHITELISTED_PATHS.some(path => currentPath.startsWith(path));
    
    if (isWhitelisted) {
      // For whitelisted paths, show content immediately
      isLoading = false;
    } else {
      // For protected paths, check authentication
     
      
      // Valid session, show protected content
      isLoading = false;
    }
  }

  // Handle navigation spinner delay
  $effect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if ($navigating) {
      // Start a timer to show spinner after 500ms if still navigating
      timeoutId = setTimeout(() => {
        if ($navigating) {
          showNavigationSpinner = true;
        }
      }, 500);
    } else {
      // Hide spinner immediately when navigation completes
      showNavigationSpinner = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };
  });

  // Re-check authentication when navigating between pages
  afterNavigate(async () => {
    isLoading = true;

    checkAuthAndSetLoading();
  });
    
   
</script>

<svelte:head>
</svelte:head>

<span class=" flex min-w-screen no-print"> </span>


{#if page?.url?.pathname?.startsWith("/slides") || page?.url?.pathname?.startsWith("/print")}
  <div in:fade={{ duration: 100 }} out:fade={{ duration: 100 }}>
     <FloatingMenu />
     {@render children()}
  </div>
{:else if  page?.url?.pathname?.startsWith("/invite") || page?.url?.pathname?.startsWith("/login") || page?.url?.pathname?.startsWith("/register")}
     {@render children()}
{:else}
  <div in:fade={{ duration: 100 }} out:fade={{ duration: 100 }}>
    <Sidebar.Provider bind:open={sidebarOpen}>
      <AppSidebar />
      <Sidebar.Inset class="no-print flex flex-1 flex-col">
        <header class="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
          <div class="flex items-center gap-2 px-4 flex-1">
            <Sidebar.Trigger class="-ml-1" />
            <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
            {#if page}
              <Breadcrumb.Root>
                <Breadcrumb.List>
                  {#each page.url.pathname.split("/").filter(Boolean) as segment, i (i)}
                    <Breadcrumb.Item class="{i === 0 ? 'hidden md:block' : ''} flex!">
                      {#if i < page.url.pathname.split("/").filter(Boolean).length - 1}
                        <Breadcrumb.Link
                          href={"/" +
                            page.url.pathname
                              .split("/")
                              .filter(Boolean)
                              .slice(0, i + 1)
                              .join("/")}
                        >
                          {segment.length > 18 ? segment.charAt(0).toUpperCase() + segment.slice(1, 17) + "…" : segment.charAt(0).toUpperCase() + segment.slice(1)}
                        </Breadcrumb.Link>
                        <Breadcrumb.Separator class="hidden md:block" />
                      {:else}
                        <Breadcrumb.Page>
                          {segment.length > 18 ? segment.charAt(0).toUpperCase() + segment.slice(1, 17) + "…" : segment.charAt(0).toUpperCase() + segment.slice(1)}
                        </Breadcrumb.Page>
                      {/if}
                    </Breadcrumb.Item>
                  {/each}
                </Breadcrumb.List>
              </Breadcrumb.Root>
            {/if}
          </div>
          <div class="px-4">
            <FeedbackButton />
          </div>
        </header>
        <div class="relative flex-1 overflow-hidden">
          {#if isLoading || showNavigationSpinner}
            <div class="absolute inset-0 z-20 bg-background/80 backdrop-blur" in:fade={{ duration: 1000 }} >
              <div class="flex flex-col items-center gap-3 pt-84">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <div class="text-sm text-muted-foreground">
                  {#if showNavigationSpinner}
                    Loading...
                  {:else}
                    Checking authentication...
                  {/if}
                </div>
              </div>
            </div>
          {/if}
          <div class:opacity-50={isLoading || showNavigationSpinner} class="h-full overflow-auto">
            {@render children()}
          </div>
        </div>
      </Sidebar.Inset>
    </Sidebar.Provider>
  </div>
{/if}

<!-- Toast notifications - available on all pages -->
<Toast />

<!-- Add this to the top of your <script> block if not already present: -->
<!-- import { fade } from 'svelte/transition'; -->

<style>
  @media print {
    @page {
      size: 1400px 850px; /* or 'A4 landscape' */
      margin: 0;
      background: white;
    }
    .no-print {
      display: none !important;
    }
  }
</style>
