<script lang="ts">
  interface ImageData {
    image_data: string;
    image_type?: string;
    image_name?: string;
    mime_type?: string;
  }

  interface Props {
    image: ImageData;
    scale: number;
    showLogo?: boolean;
  }

  let { image, scale, showLogo = false }: Props = $props();

  function processImageData(imageData: string, mimeType?: string): string {
    if (imageData.startsWith('\\x')) {
      // Convert hex string to actual string
      const hexString = imageData.replace(/\\x/g, '');
      let decoded = '';
      for (let i = 0; i < hexString.length; i += 2) {
        decoded += String.fromCharCode(parseInt(hexString.substr(i, 2), 16));
      }
      return decoded;
    } else if (imageData.startsWith('data:')) {
      return imageData;
    } else {
      return `data:${mimeType || 'image/jpeg'};base64,${imageData}`;
    }
  }
</script>

<section style="transform: scale({scale});" class="flex">
  <div class="flex flex-col m-auto w-[70%]">
    <div class="text-center mb-8">
      <h2 class="text-[60px] text-blue-400 font-light mb-4 capitalize">{image.image_type || 'Treatment'} Photo</h2>
      {#if showLogo}
        <img src="https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/logo.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvbG9nby5zdmciLCJpYXQiOjE3NTU1ODE2ODgsImV4cCI6MjA3MDk0MTY4OH0.eUmDBO37_ktSN8bqEKUAbva2ly82QAHx3GaDaz2jvck" alt="" class="h-[100px] w-[100px] mx-auto mb-8" />
      {/if}
    </div>
    
    <div class="flex flex-col items-center">
      <div class="bg-gray-50 p-6 rounded-lg shadow-md max-w-full">
        <img 
          src={processImageData(image.image_data, image.mime_type)}
          alt={image.image_name || `${image.image_type} photo`}
          class="max-w-full max-h-[600px] object-contain rounded"
        />
      </div>
      
      {#if image.image_name}
        <p class="text-2xl text-gray-600 mt-6 font-medium">{image.image_name}</p>
      {/if}
    </div>
  </div>
</section>