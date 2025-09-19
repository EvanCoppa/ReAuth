<script lang="ts">
  interface Props {
    scale: number;
  }

  let { scale }: Props = $props();
</script>

<section style="transform: scale({scale});">
  <div class="flex">
    <h2 class="text-7xl font-bold m-12">Join Our Community</h2>
    <button class="bg-blue-500 text-white px-4 py-2 rounded-xl h-16 w-60 my-auto ml-auto mr-12">
      <a href="https://app.nexhealth.com/appt/smiledesignmanhattan?lid=23535&rwg_token=ACgRB3cdDewSch6PkpYzPlMN2Tb0CKoSen5CDXEQMUwq3P-Hou0Rs1va5ZUfF1QNbV21AUz-oxd2LlRETjdzwD13Ae5LBDpt2w%3D%3D">
        Schedule an Appointment
      </a>
    </button>
  </div>
  <div class="flex">
    <div class="flex flex-col w-1/3">
      <img src="https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/1010.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvMTAxMC5qcGciLCJpYXQiOjE3NTU1ODEzMzAsImV4cCI6MTc1NjQ0NTMzMH0.FKEGi3LM0CKpbkVOULUmvV3I0aBrCSR5CTeFODaEYas" alt="" class="h-[450px] w-[350px] mx-auto object-cover" />
      <p class="max-w-[350px] text-2xl mx-auto mt-6">"I skipped the dentist for ten years, now I come every three months." -Smith Jones</p>
    </div>
    <div class="flex flex-col w-1/3">
      <img src="https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/7893.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvNzg5My5wbmciLCJpYXQiOjE3NTU1ODA5NDAsImV4cCI6MTc4NzExNjk0MH0.Ag2B9-Oqwlz6XwfnITcbw2gZUUIaY8XGlycgcsaZeII" alt="" class="h-[450px] w-[350px] mx-auto object-cover" />
      <p class="max-w-[350px] text-2xl mx-auto mt-6">"Smile Design is truly a blessing" -Jane Slotinskyl</p>
    </div>
    <div class="flex flex-col w-1/3">
      <img src="https://zicozssqsqoyyzyhmjmv.supabase.co/storage/v1/object/sign/photos/1009.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82MTk4Y2EwOC00YmJiLTQ5ODgtYTdjOS1mM2I2NzViZTIzMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaG90b3MvMTAwOS5qcGciLCJpYXQiOjE3NTU1ODEzODAsImV4cCI6MTc1NjQ0NTM4MH0.l8Yd361FPGAAvtkV4S0Of7oY_oEbNdThT-sGjNxRRMc" alt="" class="h-[450px] w-[350px] mx-auto object-cover" />
      <p class="max-w-[350px] text-2xl mx-auto mt-6">"New York's Top Dentist By Far." -Vondie Hall</p>
    </div>
  </div>
</section>