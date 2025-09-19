<script lang="ts">
  interface TreatmentItem {
    id: number;
    plan_option_id: number;
    name: string;
    quantity: number;
    cost: number;
    teeth: string;
    sequence_order: number;
    created_at: string;
  }

  interface TreatmentPlan {
    insurance_coverage?: number;
    courtesy_amount?: number;
    discount?: number;
  }

  interface PlanOption {
    id: number;
    treatment_plan_id: number;
    name: string;
    sequence_order: number;
    created_at: string;
    items: TreatmentItem[];
  }

  interface Props {
    plan: PlanOption;
    treatmentPlan: TreatmentPlan;
    optionIndex: number;
    scale: number;
    formatPrice: (val: any) => string;
    pluralize: (word: string, quantity: number) => string;
  }

  let { plan, treatmentPlan, optionIndex, scale, formatPrice, pluralize }: Props = $props();

  function calculateTotalCost(): number {
    return plan.items.reduce((sum, item) => sum + (Number(item.cost) || 0) * (item.quantity || 1), 0);
  }

  function calculateBalanceAfterInsurance(): number {
    return calculateTotalCost() - (Number(treatmentPlan.insurance_coverage) || 0);
  }

  function calculateBalanceAfterCourtesy(): number {
    const afterInsurance = calculateBalanceAfterInsurance();
    return afterInsurance * (1 - (treatmentPlan.courtesy_amount || 0) / 100);
  }

  function calculateFinalAmount(): number {
    const afterCourtesy = calculateBalanceAfterCourtesy();
    return afterCourtesy * (1 - (treatmentPlan.discount || 0) / 100);
  }

  function calculatePrepaymentAmount(): number {
    return calculateFinalAmount() * 0.9;
  }

  function calculatePrepaymentSavings(): number {
    return calculateFinalAmount() * 0.1;
  }
</script>

<section class="flex" style="transform: scale({scale});">
  <div class="flex flex-col m-auto w-[60%]">
    <div class="text-center text-gray-500 text-lg mb-4 tracking-widest">-VALID FOR 1 MONTH-</div>
    <div class="text-center mb-[32px]">
      <div class="text-2xl font-bold underline mb-[8px] tracking-wide">Comprehensive Problem Focused Solution: {plan.name || `Option ${optionIndex + 1}`}</div>
      {#each plan.items as item}
        <div class="font-extralight text-2xl tracking-wide">
          {pluralize(item.name, item.quantity)}{item.teeth ? ` (${item.teeth.split(',').map(tooth => `#${tooth.trim()}`).join(', ')})` : ""}
          {item.quantity && item.quantity > 1 ? ` x${item.quantity}` : ""}
          {item.cost ? ` $${formatPrice(Number(item.cost) * (item.quantity || 1))}` : ""}
        </div>
      {/each}
    </div>
    <div class="text-center mb-[24px]">
      <div class="text-3xl font-bold">
        Treatment Total:
        <span class="underline">
          ${formatPrice(calculateTotalCost())}
        </span>
      </div>
      {#if treatmentPlan.insurance_coverage}
        <div class="text-2xl font-semibold text-blue-700">
          Insurance Coverage: - ${formatPrice(treatmentPlan.insurance_coverage)}
        </div>
        <div class="text-2xl font-bold">
          Balance After Insurance:
          <span class="underline">
            ${formatPrice(calculateBalanceAfterInsurance())}
          </span>
        </div>
      {/if}
      {#if Number(treatmentPlan.courtesy_amount)}
        <div class="text-2xl font-semibold text-blue-700">
          Courtesy Discount {treatmentPlan.courtesy_amount}%: - ${formatPrice(calculateBalanceAfterInsurance() * (treatmentPlan.courtesy_amount / 100))}
        </div>
        <div class="text-2xl font-bold">
          Balance After Courtesy:
          <span class="underline">
            ${formatPrice(calculateBalanceAfterCourtesy())}
          </span>
        </div>
      {/if}
    </div>
    {#if Number(treatmentPlan.discount)}
      <div class="text-center mb-[32px] text-2xl">
        <span class="font-bold text-blue-700 underline italic">
          Professional Courtesy {treatmentPlan.discount}%: Treatment Offered at $
          {formatPrice(calculateFinalAmount())}
        </span>
      </div>
    {/if}
    <div class="text-center mb-[8px] text-2xl">
      <span class="font-semibold text-blue-700">*Insurance to reimburse patient*</span>
    </div>
    <div class="flex flex-row justify-center mb-[32px] mx-auto w-full font-bold">
      <div class="bg-blue-700 text-white p-[20px] flex-1 min-w-[350px] text-center">
        <div class=" text-[30px] underline mb-[8px] font-black">Interest-Free Financing</div>
        <div class="text-xl mb-[4px]">
          12 months: $
          {formatPrice(calculateFinalAmount() / 12)} per month
        </div>
        <div class="text-xl">
          24 months: $
          {formatPrice(calculateFinalAmount() / 24)} per month
        </div>
      </div>
      <div class="bg-blue-700 text-white p-[20px] flex-1 min-w-[250px] text-center font-bold">
        <div class="font-black text-xl underline mb-[8px] text-[30px]">10% Off Offer</div>
        <div class="text-xl mb-[4px]">
          Prepayment or Cash Payment: $
          {formatPrice(calculatePrepaymentAmount())}
        </div>
        <div class="text-xl">
          Your Discount Savings: $
          {formatPrice(calculatePrepaymentSavings())}
        </div>
      </div>
    </div>
    <div class="text-center mt-[16px] flex flex-col">
      <div class="text-2xl font-bold italic underline mb-[8px]">Payment Arrangements</div>
      <div class="flex gap-4 mx-auto">
        <a href="https://pay.withcherry.com/smile-design-manhattan" class="text-2xl font-extralight hover:underline text-blue">Cherry Financing</a>
        <a href="https://www.clover.com/pay-widgets/10fae621-b0f5-44ee-b3a1-1e317b094763" class="text-2xl font-extralight hover:underline text-blue">Clover</a>
      </div>
    </div>
  </div>
</section>