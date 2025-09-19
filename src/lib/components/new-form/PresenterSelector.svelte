<script lang="ts">
  import type { Profile } from "$lib/types";
  
  interface Props {
    profiles?: Profile[];
    selectedPresenter?: Profile | null;
    onPresenterSelect: (presenter: Profile | null) => void;
  }
  
  let { 
    profiles = [], 
    selectedPresenter = null,
    onPresenterSelect 
  }: Props = $props();

  let searchInput = $state("");
  let searchResults = $state<Profile[]>([]);
  let isDropdownOpen = $state(false);
  let isUserEditing = $state(false);
  
  function updateSearchResults() {
    isUserEditing = true;
    const query = searchInput.toLowerCase().trim();
    
    if (!query) {
      searchResults = [];
      isDropdownOpen = false;
      // If user manually cleared the input, clear the selection
      if (selectedPresenter) {
        onPresenterSelect(null);
      }
      return;
    }
    
    searchResults = profiles
      .filter(profile => 
        profile.first_name.toLowerCase().includes(query) || 
        profile.last_name.toLowerCase().includes(query) ||
        `${profile.first_name} ${profile.last_name}`.toLowerCase().includes(query)
      )
      .slice(0, 5);
    isDropdownOpen = searchResults.length > 0;
  }
  
  function handlePresenterSelect(profile: Profile) {
    isSelecting = true;
    isUserEditing = false; // This is a programmatic selection, not user editing
    onPresenterSelect(profile);
    searchInput = `${profile.first_name} ${profile.last_name}`;
    searchResults = [];
    isDropdownOpen = false;
    // Reset flag after a short delay
    setTimeout(() => {
      isSelecting = false;
    }, 100);
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && searchInput.trim()) {
      e.preventDefault();
      const query = searchInput.trim().toLowerCase();
      const profile = profiles.find(p => 
        `${p.first_name} ${p.last_name}`.toLowerCase() === query
      );
      if (profile) {
        handlePresenterSelect(profile);
      }
    } else if (e.key === "Escape") {
      searchResults = [];
      isDropdownOpen = false;
    }
  }
  
  function handleClearSelection() {
    isUserEditing = false; // This is a programmatic clear, not user editing
    onPresenterSelect(null);
    searchInput = "";
    searchResults = [];
    isDropdownOpen = false;
  }

  function handleFocus() {
    if (searchInput && !isDropdownOpen) {
      isUserEditing = true; // User is starting to edit
      updateSearchResults();
    }
  }

  let isSelecting = $state(false);
  
  function handleBlur() {
    // Don't close dropdown if user is selecting
    if (isSelecting) return;
    
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => {
      if (!isSelecting) {
        isDropdownOpen = false;
        // Reset user editing flag when focus is lost (unless they're selecting)
        if (!isSelecting) {
          isUserEditing = false;
        }
      }
    }, 200);
  }

  // Update search input when selectedPresenter changes externally (but not during user editing)
  $effect(() => {
    // Only auto-update input if user is not actively editing
    if (!isUserEditing) {
      if (selectedPresenter && !isDropdownOpen) {
        searchInput = `${selectedPresenter.first_name} ${selectedPresenter.last_name}`;
      } else if (!selectedPresenter) {
        searchInput = "";
      }
    }
  });

  // Reset user editing flag after a short delay when input stops changing
  $effect(() => {
    if (isUserEditing) {
      const timeoutId = setTimeout(() => {
        isUserEditing = false;
      }, 1000); // Reset after 1 second of no input changes
      
      return () => clearTimeout(timeoutId);
    }
  });
</script>

<div class="flex flex-col gap-2 relative">
  <label for="presenter-search" class="text-gray-700 font-semibold">Presenter:</label>
  <div class="flex items-center gap-2">
    <div class="flex-1 relative">
      <input
        id="presenter-search"
        type="text"
        placeholder="Search for presenter..."
        bind:value={searchInput}
        oninput={updateSearchResults}
        onkeydown={handleKeydown}
        onfocus={handleFocus}
        onblur={handleBlur}
        class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus-visible:border-blue-500/70 focus-visible:ring-blue-500/65 focus-visible:ring-[1.5px]"
      />
      {#if isDropdownOpen && searchResults.length > 0}
        <ul class="absolute z-10 bg-white border border-gray-200 rounded-md mt-1 w-full max-h-40 overflow-auto shadow-lg">
          {#each searchResults as profile}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <li 
              class="px-3 py-2 hover:bg-blue-100 cursor-pointer border-b border-gray-100 last:border-b-0" 
              onmousedown={(e) => { e.preventDefault(); handlePresenterSelect(profile); }}
              onclick={() => handlePresenterSelect(profile)}
            >
              <div class="font-medium">{profile.first_name} {profile.last_name}</div>
              {#if profile.email}
                <div class="text-sm text-gray-500">{profile.email}</div>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    {#if selectedPresenter}
      <button
        type="button"
        class="text-red-500 hover:text-red-700 px-2 py-1 rounded text-sm"
        onclick={handleClearSelection}
        aria-label="Clear presenter selection"
      >
        Clear
      </button>
    {/if}
  </div>
  {#if selectedPresenter}
    <div class="text-sm text-gray-600">
      Selected: <span class="font-medium">{selectedPresenter.first_name} {selectedPresenter.last_name}</span>
    </div>
  {/if}
</div>