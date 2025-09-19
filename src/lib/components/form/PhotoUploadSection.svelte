<script lang="ts">
  export let beforePhotos: FileList | undefined = undefined;
  export let afterPhotos: FileList | undefined = undefined;
  
  function limitFiles(fileList: FileList | null, setter: (files: FileList) => void, photoType: string) {
    if (!fileList || fileList.length <= 3) return;
    
    // Only keep the first 3 files
    const dt = new DataTransfer();
    for (let i = 0; i < 3; i++) {
      dt.items.add(fileList[i]);
    }
    setter(dt.files);
    alert(`You can only select up to 3 ${photoType} photos.`);
  }
  
  function handleBeforePhotosChange(e: Event) {
    const target = e.target as HTMLInputElement | null;
    if (target?.files) {
      limitFiles(target.files, (files) => {
        beforePhotos = files;
        if (target) target.files = files;
      }, "before");
    }
  }
  
  function handleAfterPhotosChange(e: Event) {
    const target = e.target as HTMLInputElement | null;
    if (target?.files) {
      limitFiles(target.files, (files) => {
        afterPhotos = files;
        if (target) target.files = files;
      }, "after");
    }
  }
</script>

<div class="flex flex-col md:flex-row gap-8">
  <label class="block text-gray-700 font-semibold">
    Before Photos:
    <input
      type="file"
      accept="image/*"
      multiple
      bind:files={beforePhotos}
      on:change={handleBeforePhotosChange}
      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus-visible:border-blue-500/70 focus-visible:ring-blue-500/65 focus-visible:ring-[1.5px]"
    />
  </label>
  
  <label class="block text-gray-700 font-semibold">
    After Photos:
    <input
      type="file"
      accept="image/*"
      multiple
      bind:files={afterPhotos}
      on:change={handleAfterPhotosChange}
      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus-visible:border-blue-500/70 focus-visible:ring-blue-500/65 focus-visible:ring-[1.5px]"
    />
  </label>
</div>