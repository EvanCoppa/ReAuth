<script lang="ts">
  interface Props {
    patientName?: string;
    visitDate?: string;
    doctorName?: string;
    visitId?: number;
    scale: number;
  }

  let { patientName, visitDate, doctorName, visitId, scale }: Props = $props();

  function formatDate(dateString?: string): string {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString();
  }
</script>

<section style="transform: scale({scale});" class="flex">
  <div class="flex flex-col m-auto w-[80%]">
    <div class="text-center mb-8">
      <h2 class="text-[60px] text-blue-400 font-light mb-4">Visit Summary</h2>
      <img src="https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/logo.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvbG9nby5zdmciLCJpYXQiOjE3NTU1ODE2ODgsImV4cCI6MjA3MDk0MTY4OH0.eUmDBO37_ktSN8bqEKUAbva2ly82QAHx3GaDaz2jvck" alt="" class="h-[100px] w-[100px] mx-auto mb-8" />
    </div>
    
    <div class="grid grid-cols-2 gap-8 text-2xl">
      {#if patientName}
        <div class="bg-gray-50 p-6 rounded-lg">
          <h3 class="font-bold text-blue-600 mb-2">Patient Name</h3>
          <p class="text-gray-800">{patientName}</p>
        </div>
      {/if}
      
      {#if visitDate}
        <div class="bg-gray-50 p-6 rounded-lg">
          <h3 class="font-bold text-blue-600 mb-2">Visit Date</h3>
          <p class="text-gray-800">{formatDate(visitDate)}</p>
        </div>
      {/if}
      
      {#if doctorName}
        <div class="bg-gray-50 p-6 rounded-lg">
          <h3 class="font-bold text-blue-600 mb-2">Attending Doctor</h3>
          <p class="text-gray-800">{doctorName}</p>
        </div>
      {/if}
      
      {#if visitId}
        <div class="bg-gray-50 p-6 rounded-lg">
          <h3 class="font-bold text-blue-600 mb-2">Visit ID</h3>
          <p class="text-gray-800">{visitId}</p>
        </div>
      {/if}
    </div>
  </div>
</section>