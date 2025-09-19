import { API_BASE_URL, authenticatedFetch } from '$lib/api.server';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export interface Provider {
  id: number;
  providerid: number;
  prefix: string;
  firstname: string;
  lastname: string;
  specialty?: string;
  phone?: string;
  email?: string;
}

export interface Profile {
  profile_id: number;
  auth_user_id: string;
  first_name: string;
  last_name: string;
  role_id?: number;
  org_id: number;
  pending?: boolean;
}

export interface TreatmentPlanReportData {
  id: number;
  patient_name: string;
  doctor_name: string;
  created_at: string;
  payment_status: string;
  amount_paid: number;
  created_by: string;
  presenter_id?: string;
  providerid: number;
  options: Array<{
    id: number;
    option_name: string;
    sequence_order: number;
    total_cost: number;
  }>;
  created_by_profile?: {
    auth_user_id: string;
    first_name: string;
    last_name: string;
  } | null;
}

export const load: PageServerLoad = async ({ cookies, parent }) => {
  try {
    // Get session data from parent layout
    const { session } = await parent();

    // If no valid session, return empty data
    if (!session?.access_token || !session?.user) {
      console.log('[Reports] No valid session - returning empty data');
      return {
        providers: [],
        presenters: [],
        creators: [],
        userId: null,
        error: 'Authentication required'
      };
    }

    // Create authInfo object with fresh session token for API calls
    const authInfo = {
      token: session.access_token,
      user: session.user
    };

    // Fetch providers, presenters, and creators in parallel
    const [providersResponse, presentersResponse, creatorsResponse] = await Promise.all([
      authenticatedFetch(
        `${API_BASE_URL}/providers`,
        { method: 'GET' },
        authInfo,
        cookies
      ),
      // Get unique presenters from treatment plans
      authenticatedFetch(
        `${API_BASE_URL}/presenters`,
        { method: 'GET' },
        authInfo,
        cookies
      ).catch(() => null),
      // Get unique creators from treatment plans
      authenticatedFetch(
        `${API_BASE_URL}/creators`,
        { method: 'GET' },
        authInfo,
        cookies
      ).catch(() => null)
    ]);

    if (!providersResponse.ok) {
      const errorText = await providersResponse.text();
      console.error('🚨 Providers API Error:', {
        status: providersResponse.status,
        statusText: providersResponse.statusText,
        errorBody: errorText
      });
      throw new Error(`Failed to fetch providers: ${providersResponse.statusText}`);
    }

    const providersData = await providersResponse.json();
    const providers: Provider[] = providersData.data || [];

    // Get presenters from the dedicated endpoint
    let presenters: Profile[] = [];
    
    if (presentersResponse?.ok) {
      const presentersData = await presentersResponse.json();
      if (presentersData.data && Array.isArray(presentersData.data)) {
        // Convert presenter data to Profile format for compatibility
        presenters = presentersData.data.map((presenter: any) => ({
          profile_id: 0, // We don't have this from the presenters endpoint
          auth_user_id: presenter.auth_user_id,
          first_name: presenter.first_name,
          last_name: presenter.last_name,
          org_id: 0, // We don't have this from the presenters endpoint
        }));
      }
    }

    // Get creators from the dedicated endpoint
    let creators: Profile[] = [];
    
    if (creatorsResponse?.ok) {
      const creatorsData = await creatorsResponse.json();
      if (creatorsData.data && Array.isArray(creatorsData.data)) {
        // Convert creator data to Profile format for compatibility
        creators = creatorsData.data.map((creator: any) => ({
          profile_id: 0, // We don't have this from the creators endpoint
          auth_user_id: creator.auth_user_id,
          first_name: creator.first_name,
          last_name: creator.last_name,
          org_id: 0, // We don't have this from the creators endpoint
        }));
      }
    }

    // Note: If both endpoints fail, the dropdowns will be empty, which is acceptable
    // as it indicates a server issue rather than trying to show incomplete/fallback data

    console.log('✅ Reports Page: Data loaded', {
      providersCount: providers.length,
      presentersCount: presenters.length,
      creatorsCount: creators.length,
      sampleProvider: providers[0] || null,
      samplePresenter: presenters[0] || null,
      sampleCreator: creators[0] || null,
    });

    return {
      providers,
      presenters,
      creators,
      userId: session.user.id
    };

  } catch (error) {
    console.error('Error loading reports page data:', error);
    return {
      providers: [],
      presenters: [],
      creators: [],
      userId: null,
      error: 'Failed to load reports data'
    };
  }
};

export const actions: Actions = {
  fetchTreatmentPlans: async (event) => {
    const { request, cookies } = event;
    try {
      const formData = await request.formData();
      const filterType = formData.get('filterType') as string;
      const selectedId = formData.get('selectedId') as string;
      const fromDate = formData.get('fromDate') as string;
      const toDate = formData.get('toDate') as string;

      // Validate required fields
      if (!filterType || !selectedId) {
        return fail(400, {
          error: 'Filter type and selection are required',
          success: false
        });
      }

      // Validate filter type
      if (!['provider', 'presenter', 'creator'].includes(filterType)) {
        return fail(400, {
          error: 'Invalid filter type',
          success: false
        });
      }

      console.log('🔐 Reports Action: Fetching treatment plans', {
        filterType,
        selectedId,
        fromDate,
        toDate
      });

      // Build endpoint based on filter type
      let baseEndpoint = '';
      switch (filterType) {
        case 'provider':
          baseEndpoint = `${API_BASE_URL}/treatment-plans/by-provider/${selectedId}`;
          break;
        case 'presenter':
          baseEndpoint = `${API_BASE_URL}/treatment-plans/by-presenter/${selectedId}`;
          break;
        case 'creator':
          baseEndpoint = `${API_BASE_URL}/treatment-plans/by-creator/${selectedId}`;
          break;
      }

      // Build query parameters for date filtering
      const params = new URLSearchParams();
      if (fromDate) {
        params.append('startDate', fromDate);
      }
      if (toDate) {
        params.append('endDate', toDate);
      }

      // Construct final endpoint with query parameters
      const endpoint = params.toString() ? `${baseEndpoint}?${params.toString()}` : baseEndpoint;

      console.log('📡 Reports Action: Making API request to', endpoint);

      // Pass the full event so authenticatedFetch can access session data
      const response = await authenticatedFetch(endpoint, { method: 'GET' }, undefined, event);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🚨 Treatment Plans API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });

        return fail(response.status, {
          error: `Failed to fetch treatment plans: ${response.statusText}`,
          success: false
        });
      }

      const responseData = await response.json();
      const treatmentPlans: TreatmentPlanReportData[] = responseData.data || [];

      console.log('✅ Reports Action: Treatment plans fetched successfully', {
        count: treatmentPlans.length,
        filterType,
        selectedId
      });

      return {
        success: true,
        treatmentPlans,
        filterType,
        selectedId,
        fromDate,
        toDate,
        message: treatmentPlans.length === 0
          ? 'No treatment plans found for the selected criteria'
          : `Found ${treatmentPlans.length} treatment plan(s)`
      };

    } catch (error) {
      console.error('Error in fetchTreatmentPlans action:', error);
      return fail(500, {
        error: 'Failed to fetch treatment plans. Please try again.',
        success: false
      });
    }
  }
};