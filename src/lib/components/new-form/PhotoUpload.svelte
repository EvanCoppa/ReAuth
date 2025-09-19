<script lang="ts">
  import { compressFileList, getFileSize } from '$lib/utils/imageCompression';

  let { beforePhotos = $bindable(), afterPhotos = $bindable() }: {
    beforePhotos?: FileList | undefined;
    afterPhotos?: FileList | undefined;
  } = $props();
  
  let isCompressing = $state(false);
  let compressionProgress = $state('');

  function limitFiles(fileList: FileList | null, setter: (files: FileList) => void, photoType: string) {
    if (!fileList || fileList.length <= 10) return fileList;
    
    // Only keep the first 10 files
    const dt = new DataTransfer();
    for (let i = 0; i < 10; i++) {
      dt.items.add(fileList[i]);
    }
    const limitedFiles = dt.files;
    setter(limitedFiles);
    alert(`You can only select up to 10 ${photoType} photos.`);
    return limitedFiles;
  }
  
  async function handleBeforePhotosChange(e: Event) {
    const target = e.target as HTMLInputElement | null;
    if (target?.files) {
      const limitedFiles = limitFiles(target.files, (files) => {
        beforePhotos = files;
      }, "before");
      
      if (limitedFiles) {
        await compressAndSetFiles(limitedFiles, 'before', (compressedFiles) => {
          beforePhotos = compressedFiles;
          if (target) target.files = compressedFiles;
        });
      }
    }
  }
  
  async function handleAfterPhotosChange(e: Event) {
    const target = e.target as HTMLInputElement | null;
    if (target?.files) {
      const limitedFiles = limitFiles(target.files, (files) => {
        afterPhotos = files;
      }, "after");
      
      if (limitedFiles) {
        await compressAndSetFiles(limitedFiles, 'after', (compressedFiles) => {
          afterPhotos = compressedFiles;
          if (target) target.files = compressedFiles;
        });
      }
    }
  }

  async function compressAndSetFiles(files: FileList, type: string, setter: (files: FileList) => void) {
    if (files.length === 0) return;
    
    try {
      isCompressing = true;
      compressionProgress = `Compressing ${type} photos...`;
      
      const compressedFiles = await compressFileList(files, {
        quality: 0.7,
        maxWidth: 1920,
        maxHeight: 1920
      }, (current, total) => {
        compressionProgress = `Compressing ${type} photos: ${current}/${total}`;
      });
      
      setter(compressedFiles);
    } catch (error) {
      console.error('Compression failed:', error);
      alert(`Failed to compress ${type} photos. Using original files.`);
      setter(files);
    } finally {
      isCompressing = false;
      compressionProgress = '';
    }
  }

  function getFileSizeDisplay(fileList: FileList | undefined): string {
    if (!fileList || fileList.length === 0) return '';
    
    const totalSize = Array.from(fileList).reduce((sum, file) => sum + file.size, 0);
    return `${fileList.length} file(s) - ${getFileSize(totalSize)}`;
  }
</script>

<div class="flex flex-col md:flex-row gap-8">
  <div class="flex-1">
    <label class="block text-gray-700 font-semibold">
      Before Photos:
      <input
        type="file"
        accept="image/*"
        multiple
        bind:files={beforePhotos}
        onchange={handleBeforePhotosChange}
        disabled={isCompressing}
        class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus-visible:border-blue-500/70 focus-visible:ring-blue-500/65 focus-visible:ring-[1.5px] disabled:opacity-50"
      />
    </label>
    {#if beforePhotos && beforePhotos.length > 0}
      <div class="text-sm text-gray-500 mt-1">
        {getFileSizeDisplay(beforePhotos)}
      </div>
    {/if}
  </div>
  
  <div class="flex-1">
    <label class="block text-gray-700 font-semibold">
      After Photos:
      <input
        type="file"
        accept="image/*"
        multiple
        bind:files={afterPhotos}
        onchange={handleAfterPhotosChange}
        disabled={isCompressing}
        class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus-visible:border-blue-500/70 focus-visible:ring-blue-500/65 focus-visible:ring-[1.5px] disabled:opacity-50"
      />
    </label>
    {#if afterPhotos && afterPhotos.length > 0}
      <div class="text-sm text-gray-500 mt-1">
        {getFileSizeDisplay(afterPhotos)}
      </div>
    {/if}
  </div>
</div>

{#if isCompressing}
  <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
    <div class="text-blue-700 text-sm font-medium">
      {compressionProgress}
    </div>
    <div class="mt-2">
      <div class="bg-blue-200 rounded-full h-2">
        <div class="bg-blue-500 h-2 rounded-full animate-pulse" style="width: 100%"></div>
      </div>
    </div>
  </div>
{/if}