import { API_BASE_URL, authenticatedFetch, getPaymentStatusOptions } from '$lib/api.server';
import type { PaymentStatusOption } from '$lib/types';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export interface TreatmentPlanItem {
  id: number;
  plan_option_id: number;
  name: string;
  quantity: number;
  cost: number;
  teeth: string;
  sequence_order: number;
  created_at: string;
}

export interface TreatmentPlanOption {
  id: number;
  option_name?: string;
  treatment_plan_id?: number;
  name?: string;
  description?: string;
  sequence_order: number;
  total_cost?: number;
  created_at?: string;
  items?: TreatmentPlanItem[];
}

export interface TreatmentPlanDetails {
  id: number;
  patient_name: string;
  doctor_name: string;
  discount: number;
  insurance_coverage: number;
  courtesy_amount: number;
  clientid: number;
  providerid: number;
  payment_status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_active: boolean;
  amount_paid: number;
  active_plan?: number | null;
  presenter_id?: string | null; // UUID of the person who presented the treatment plan
  options: TreatmentPlanOption[];
  // Legacy fields for backward compatibility
  created_by_profile?: {
    auth_user_id: string;
    first_name: string;
    last_name: string;
  } | null;
  presenter_profile?: {
    auth_user_id: string;
    first_name: string;
    last_name: string;
  } | null;
  org_id?: number;
  images?: any[];
  amount?: number;
}

export interface TreatmentPlan {
  visitid: number;
  clientid: number;
  providerid: number;
  visitdate: string;
  paid: boolean;
  notes: string;
  discount: number;
  plan_id: number;
  org_id: number;
  treatment_plan: TreatmentPlanDetails;
  // Computed fields
  activePlanPrice: number;
}

// Helper function to calculate the highest option price
function calculateActivePlanPrice(treatmentPlan: TreatmentPlanDetails): number {
  if (!treatmentPlan.options || treatmentPlan.options.length === 0) {
    return 0;
  }

  // Find the option that matches the active_plan sequence_order
  const activeOption = treatmentPlan.options.find(option => 
    option.sequence_order === treatmentPlan.active_plan
  );
  
  // If no active plan is set or found, use the first option as fallback
  const optionToUse = activeOption || treatmentPlan.options[0];
  
  if (!optionToUse) {
    return 0;
  }
  
  // Use total_cost from new schema if available, otherwise fallback to calculated cost
  if (optionToUse.total_cost !== undefined) {
    return optionToUse.total_cost;
  }
  // Legacy calculation for old schema
  if (!optionToUse.items || optionToUse.items.length === 0) {
    return 0;
  }
  return optionToUse.items.reduce((total, item) => total + (item.cost * item.quantity), 0);
}

export const load: PageServerLoad = async ({ cookies, parent }) => {
  try {
    // Get session data from parent layout
    const { session } = await parent();
    const orgId = cookies.get('orgId');

    // If no valid session, return empty data - don't try to fetch data
    if (!session?.access_token || !session?.user) {
      console.log('[Treatment Plans] No valid session - returning empty data');
      return {
        treatmentPlans: [],
        doctors: [],
        userId: null,
        profiles: [],
        paymentStatusOptions: [],
        error: 'Authentication required'
      };
    }

    // Create authInfo object with fresh session token for API calls
    const authInfo = {
      token: session.access_token,
      user: session.user
    };
    // Fetch treatment plans, profiles, and payment status options in parallel
    const [treatmentPlansResponse, profilesResponse, paymentStatusOptions] = await Promise.all([
      authenticatedFetch(
        `${API_BASE_URL}/treatment-plans-summary`,
        { method: 'GET' },
        authInfo,
        cookies
      ),
      authenticatedFetch(
        `${API_BASE_URL}/profiles/org/${orgId}`,
        { method: 'GET' },
        authInfo,
        cookies
      ),
      getPaymentStatusOptions(authInfo, cookies)
    ]);
    
    if (!treatmentPlansResponse.ok) {
      // Log response details for debugging
      const errorText = await treatmentPlansResponse.text();
      console.error('🚨 Treatment Plans API Error:', {
        status: treatmentPlansResponse.status,
        statusText: treatmentPlansResponse.statusText,
        errorBody: errorText
      });
      throw new Error(`Failed to fetch treatment plans: ${treatmentPlansResponse.statusText}`);
    }

    if (!profilesResponse.ok) {
      console.error('🚨 Profiles API Error:', {
        status: profilesResponse.status,
        statusText: profilesResponse.statusText
      });
      throw new Error(`Failed to fetch profiles: ${profilesResponse.statusText}`);
    }

    const data = await treatmentPlansResponse.json();
    const profilesData = await profilesResponse.json();
    const visitsData = data.data || [];
    const profiles = profilesData.data || [];

    console.log('Treatment Plans API Response Data:', JSON.stringify(data, null, 2));

    // console.log('📊 Treatment Plans: All visits data:', JSON.stringify(visitsData, null, 2));

    // Process the new API response format - data is directly treatment plan objects
    const treatmentPlans: TreatmentPlan[] = visitsData.map((item: any) => {
      // Add missing fields to match TreatmentPlanDetails interface
      const treatmentPlanData: TreatmentPlanDetails = {
        id: item.id,
        patient_name: item.patient_name,
        doctor_name: item.doctor_name,
        discount: item.discount || 0,
        insurance_coverage: item.insurance_coverage || 0,
        courtesy_amount: item.courtesy_amount || 0,
        clientid: item.clientid,
        providerid: item.providerid,
        payment_status: item.payment_status,
        notes: item.notes,
        created_at: item.created_at,
        updated_at: item.updated_at,
        created_by: item.created_by,
        is_active: item.is_active,
        active_plan: item.active_plan || null,
        presenter_id: item.presenter_id || undefined,
        options: item.options || [],
        amount_paid: item.amount_paid,
        created_by_profile: item.created_by_profile || null,
        presenter_profile: item.presenter_profile || null
      };


      const activePlanPrice = calculateActivePlanPrice(treatmentPlanData);

      return {
        visitid: item.id, // Use id as visitid for compatibility with existing UI
        clientid: item.clientid,
        providerid: item.providerid,
        visitdate: item.created_at,
        paid: item.payment_status === 'paid_in_full',
        notes: item.notes,
        discount: item.discount || 0,
        plan_id: item.id,
        org_id: 0, // Not provided in new format
        treatment_plan: treatmentPlanData,
        activePlanPrice
      };
    });

    // Get unique doctors for filtering
    const doctors = Array.from(new Set(treatmentPlans
      .filter(tp => tp.treatment_plan?.doctor_name)
      .map(tp => tp.treatment_plan.doctor_name)
    )).sort();

    // console.log('✅ Treatment Plans: Processed data', {
    //   totalTreatmentPlans: treatmentPlans.length,
    //   uniqueDoctors: doctors,
    //   sampleTreatmentPlan: treatmentPlans[0] || null,
    //   allTreatmentPlans: treatmentPlans
    // });

    return {
      treatmentPlans,
      doctors,
      userId: session.user.id,
      profiles,
      paymentStatusOptions
    };

  } catch (error) {
    console.error('Error loading treatment plans:', error);
    return {
      treatmentPlans: [],
      doctors: [],
      userId: null,
      profiles: [],
      paymentStatusOptions: [],
      error: 'Failed to load treatment plans'
    };
  }
};

export const actions: Actions = {
  generatePublicLink: async (event) => {
    try {
      const formData = await event.request.formData();
      const treatmentPlanId = formData.get('treatmentPlanId') as string;
      const expiresInHours = formData.get('expiresInHours') || '72';

      if (!treatmentPlanId) {
        return fail(400, { error: 'Treatment plan ID is required' });
      }

      const response = await authenticatedFetch(
        `${API_BASE_URL}/treatment-plans/${treatmentPlanId}/generate-public-link`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            expires_in_hours: parseInt(expiresInHours as string)
          })
        },
        undefined,
        event
      );

      if (!response.ok) {
        const errorData = await response.json();
        return fail(response.status, { error: errorData.error || 'Failed to generate public link' });
      }

      const data = await response.json();
      return { success: true, publicLinkData: data.data };
    } catch (error) {
      console.error('Failed to generate public link:', error);
      return fail(500, { error: 'Failed to generate public link' });
    }
  },

  updateTreatmentPlanAmount: async (event) => {
    try {
      const formData = await event.request.formData();
      const treatmentPlanId = formData.get('treatmentPlanId');
      const visitId = formData.get('visitId');
      const amountPaidRaw = formData.get('amountPaid');
      const notes = (formData.get('notes') as string) ?? '';
      const paymentStatus = (formData.get('paymentStatus') as string) ?? 'unpaid';
      const activePlanRaw = formData.get('activePlan');
      const presenterIdRaw = formData.get('presenterId');
      const patientName = (formData.get('patientName') as string) ?? '';
      const doctorName = (formData.get('doctorName') as string) ?? '';
      const discountRaw = formData.get('discount');
      const insuranceCoverageRaw = formData.get('insuranceCoverage');
      const courtesyAmountRaw = formData.get('courtesyAmount');

      if (!treatmentPlanId || !visitId || !amountPaidRaw) {
        return fail(400, { error: 'Missing treatment plan information' });
      }

      const amountPaid = parseFloat(amountPaidRaw.toString());
      if (Number.isNaN(amountPaid) || amountPaid < 0) {
        return fail(400, { error: 'Invalid payment amount' });
      }

      const discount = parseFloat(discountRaw?.toString() ?? '0') || 0;
      const insuranceCoverage = parseFloat(insuranceCoverageRaw?.toString() ?? '0') || 0;
      const courtesyAmount = parseFloat(courtesyAmountRaw?.toString() ?? '0') || 0;
      const activePlan = activePlanRaw ? Number(activePlanRaw.toString()) : null;
      const presenterId = presenterIdRaw?.toString() ? presenterIdRaw.toString() : null;

      const updatedTreatmentPlan = {
        patient_name: patientName,
        doctor_name: doctorName,
        discount,
        insurance_coverage: insuranceCoverage,
        courtesy_amount: courtesyAmount,
        amount_paid: amountPaid,
        notes,
        payment_status: paymentStatus,
        active_plan: activePlan,
        presenter_id: presenterId
      };

      const response = await authenticatedFetch(
        `${API_BASE_URL}/treatment-plans/${treatmentPlanId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updatedTreatmentPlan)
        },
        undefined,
        event
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        return fail(response.status, { error: errorData?.error || 'Failed to update treatment plan' });
      }

      return {
        success: true,
        visitId: Number(visitId),
        amountPaid,
        notes,
        paymentStatus,
        activePlan,
        presenterId
      };
    } catch (error) {
      console.error('Failed to update treatment plan amount:', error);
      return fail(500, { error: 'Failed to update treatment plan' });
    }
  },

  updateVisitPayment: async (event) => {
    try {
      const formData = await event.request.formData();
      const visitId = formData.get('visitId') as string;
      const paid = formData.get('paid') === 'true';

      if (!visitId) {
        return fail(400, { error: 'Visit ID is required' });
      }

      const response = await authenticatedFetch(
        `${API_BASE_URL}/visits/${visitId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ paid })
        },
        undefined,
        event
      );

      if (!response.ok) {
        const errorData = await response.json();
        return fail(response.status, { error: errorData.error || 'Failed to update payment status' });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to update payment status:', error);
      return fail(500, { error: 'Failed to update payment status' });
    }
  },

  updateVisitNotes: async (event) => {
    try {
      const formData = await event.request.formData();
      const visitId = formData.get('visitId') as string;
      const notes = formData.get('notes') as string;

      if (!visitId) {
        return fail(400, { error: 'Visit ID is required' });
      }

      const response = await authenticatedFetch(
        `${API_BASE_URL}/visits/${visitId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes })
        },
        undefined,
        event
      );

      if (!response.ok) {
        const errorData = await response.json();
        return fail(response.status, { error: errorData.error || 'Failed to update notes' });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to update notes:', error);
      return fail(500, { error: 'Failed to update notes' });
    }
  },

  deleteVisit: async (event) => {
    try {
      const formData = await event.request.formData();
      const visitId = formData.get('visitId') as string;

      if (!visitId) {
        return fail(400, { error: 'Visit ID is required' });
      }

      const response = await authenticatedFetch(
        `${API_BASE_URL}/visits/${visitId}`,
        {
          method: 'DELETE'
        },
        undefined,
        event
      );

      if (!response.ok) {
        const errorData = await response.json();
        return fail(response.status, { error: errorData.error || 'Failed to delete visit' });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to delete visit:', error);
      return fail(500, { error: 'Failed to delete visit' });
    }
  },

  batchUpdatePayment: async (event) => {
    try {
      const formData = await event.request.formData();
      const visitIds = JSON.parse(formData.get('visitIds') as string);
      const paid = formData.get('paid') === 'true';

      if (!Array.isArray(visitIds) || visitIds.length === 0) {
        return fail(400, { error: 'Visit IDs are required' });
      }

      const updatePromises = visitIds.map(visitId =>
        authenticatedFetch(
          `${API_BASE_URL}/visits/${visitId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paid })
          },
          undefined,
          cookies
        )
      );

      const results = await Promise.all(updatePromises);
      const successful = results.filter(res => res.ok);

      return {
        success: true,
        updated: successful.length,
        total: visitIds.length
      };
    } catch (error) {
      console.error('Failed to batch update payment status:', error);
      return fail(500, { error: 'Failed to batch update payment status' });
    }
  },

  batchDelete: async (event) => {
    try {
      const formData = await event.request.formData();
      const visitIds = JSON.parse(formData.get('visitIds') as string);

      if (!Array.isArray(visitIds) || visitIds.length === 0) {
        return fail(400, { error: 'Visit IDs are required' });
      }

      const deletePromises = visitIds.map(visitId =>
        authenticatedFetch(
          `${API_BASE_URL}/visits/${visitId}`,
          { method: 'DELETE' },
          undefined,
          cookies
        )
      );

      const results = await Promise.all(deletePromises);
      const successful = results.filter(res => res.ok);

      return {
        success: true,
        deleted: successful.length,
        total: visitIds.length
      };
    } catch (error) {
      console.error('Failed to batch delete visits:', error);
      return fail(500, { error: 'Failed to batch delete visits' });
    }
  }
};
