import { API_BASE_URL, authenticatedFetch } from '$lib/api.server';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export interface VisitImage {
  image_data: string;
  image_name?: string;
  image_type?: string;
  mime_type?: string;
}

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
  treatment_plan_id: number;
  name: string;
  sequence_order: number;
  case_fee: number;
  created_at: string;
  items: TreatmentPlanItem[];
}

export interface TreatmentPlan {
  id: number;
  patient_name: string;
  doctor_name: string;
  discount: number;
  insurance_coverage: number;
  courtesy_amount: number;
  created_at: string;
  updated_at: string;
  org_id: number;
  created_by: string | null;
  is_active: boolean;
  options: TreatmentPlanOption[];
  images: VisitImage[];
}

export interface VisitData {
  visitid: number;
  clientid: number;
  providerid: number;
  visitdate: string;
  paid: boolean;
  notes: string;
  discount: number;
  plan_id: number;
  visitdetails: any[];
  visitimages: VisitImage[];
  treatment_plan: TreatmentPlan;
}

export interface VisitApiResponse {
  message: string;
  data: VisitData;
}

export const load: PageServerLoad = async ({ params, cookies }) => {
  try {
    const { id } = params;

    // Get session data from server-side cookies
    const userId = cookies.get('userId');
    const accessToken = cookies.get('accessToken');
    const authenticated = cookies.get('authenticated') === 'true';

    console.log('🔐 New Slides: Server-side cookie check', {
      hasUserId: !!userId,
      userId: userId,
      hasToken: !!accessToken,
      tokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'none',
      authenticated: authenticated,
      visitId: id
    });

    // Fetch visit data using server-side authentication
    const response = await authenticatedFetch(
      `${API_BASE_URL}/visits/${id}`,
      { method: 'GET' },
      undefined,
      cookies
    );

    if (!response.ok) {
      console.error('🚨 Visit Data API Error:', {
        status: response.status,
        statusText: response.statusText,
        visitId: id
      });

      if (response.status === 404) {
        throw error(404, `Visit with ID ${id} not found`);
      }

      throw error(response.status, `Failed to fetch visit data: ${response.statusText}`);
    }

    const visitApiResponse: VisitApiResponse = await response.json();

    console.log('✅ New Slides: Visit data loaded successfully', {
      visitId: id,
      hasData: !!visitApiResponse.data,
      patientName: visitApiResponse.data?.treatment_plan?.patient_name,
      doctorName: visitApiResponse.data?.treatment_plan?.doctor_name,
      optionsCount: visitApiResponse.data?.treatment_plan?.options?.length || 0,
      imagesCount: visitApiResponse.data?.visitimages?.length || 0,
      treatmentPlanImagesCount: visitApiResponse.data?.treatment_plan?.images?.length || 0
    });

    return {
      visitData: visitApiResponse,
      visitId: id
    };

  } catch (error_) {
    console.error('Error loading visit data:', error_);

    // Re-throw SvelteKit errors
    if (error_ && typeof error_ === 'object' && 'status' in error_) {
      throw error_;
    }

    // Handle other errors
    throw error(500, 'Failed to load visit data');
  }
};