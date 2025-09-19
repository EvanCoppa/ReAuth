<script lang="ts">
  interface Props {
    scale: number;
  }

  let { scale }: Props = $props();
</script>

<section class="flex" style="transform: scale({scale});">
  <div class="w-1/2 flex relative">
    <div class="h-[500px] w-[500px] m-auto relative">
      <div class="absolute top-0 left-0 h-[96px] w-[96px] bg-blue-600 z-10 translateY(-100%)"></div>
      <img src="https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/4916.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvNDkxNi5qcGciLCJpYXQiOjE3NTU1ODE1MDIsImV4cCI6MTc1NjQ0NTUwMn0.CSXhMuqhiCEp6vvdHoi5qeNebPXkKS8Taa0Vh2Iabo0" alt="" class="absolute h-[556px] object-cover object-[-200px] p-8 z-20" />
      <div class="absolute right-0 w-[96px] h-[96px] bg-blue-600 z-10" style="top: 0; transform: translateY(480%);"></div>
    </div>
  </div>
  <div class="w-1/2 flex flex-col">
    <div class="max-w-[80%] m-auto pr-6 text-lg font-extralight leading-[23px] text-gray-800">
      <p>
        Thank you for your visit to SmileDesign Manhattan. This visit report provides a comprehensive overview of your dental care experience. 
        Our commitment is to provide exceptional dental care with the highest level of service and aesthetic results.
      </p>
      <br />
      <p>
        Our mutual goal is to achieve total health of the oral cavity (teeth, gums, bony support) with the highest possible level of aesthetic, 
        and in the most efficient way. Our team offers all adult dental specialties per the need of the patient.
      </p>
    </div>
  </div>
</section>