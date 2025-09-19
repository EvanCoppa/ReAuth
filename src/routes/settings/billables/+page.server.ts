import { API_BASE_URL, authenticatedFetch } from '$lib/api.server';
import type { Actions, PageServerLoad } from './$types';

export interface Billable {
  id: number;
  billable_code: string;
  description: string;
  cost: number;
  delimiter?: string;
  org_id: number;
  is_displayed: boolean | null;
}

async function fetchBillablesData(cookies: any): Promise<Billable[]> {
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/billables`,
      { method: 'GET' },
      undefined,
      cookies
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🚨 Billables API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText
      });
      throw new Error(`Failed to fetch billables: ${response.statusText}`);
    }

    const data = await response.json();
    const billables: Billable[] = data.data || [];
    return billables;
  } catch (error) {
    console.error('Error fetching billables:', error);
    throw error;
  }
}

export const load: PageServerLoad = async ({ cookies }) => {
  try {
    const userId = cookies.get('userId');
    const accessToken = cookies.get('accessToken');
    const authenticated = cookies.get('authenticated') === 'true';


    const billables = await fetchBillablesData(cookies);

  
    return {
      billables: billables as Billable[],
      userId
    };

  } catch (error) {
    console.error('Error loading billables:', error);
    return {
      billables: [],
      userId: null,
      error: 'Failed to load billables'
    };
  }
};

export const actions: Actions = {
  create: async ({ request, cookies }) => {
    try {
      const formData = await request.formData();
      const billableData = {
        billable_code: formData.get('billable_code') as string,
        description: formData.get('description') as string,
        cost: parseFloat(formData.get('cost') as string),
        delimiter: formData.get('delimiter') as string || '',
        org_id: parseInt(formData.get('org_id') as string) || 0,
        is_displayed: formData.get('is_displayed') === 'true'
      };

      // Validate required fields
      if (!billableData.billable_code || !billableData.description) {
        return {
          success: false,
          error: 'Billable code and description are required'
        };
      }

      const response = await authenticatedFetch(
        `${API_BASE_URL}/billables`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(billableData)
        },
        undefined,
        cookies
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🚨 Create billable API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        return {
          success: false,
          error: `Failed to create billable: ${response.statusText}`
        };
      }

      const result = await response.json();
      console.log('✅ Billable created:', result);

      // Refresh the billable list after creation
      const updatedBillables = await fetchBillablesData(cookies);

      return {
        success: true,
        billables: updatedBillables,
        message: `Billable ${billableData.billable_code} created successfully`
      };
    } catch (error) {
      console.error('Error creating billable:', error);
      return {
        success: false,
        error: 'Failed to create billable'
      };
    }
  },

  update: async ({ request, cookies }) => {
    console.log('📝 Update action triggered');
    try {
      const formData = await request.formData();

      // Log all form data received
      console.log('📋 All form data entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
      }

      const billableId = formData.get('id') as string;
      const updateData = {
        description: formData.get('description') as string,
        cost: parseFloat(formData.get('cost') as string),
        delimiter: formData.get('delimiter') as string || '',
        is_displayed: formData.get('is_displayed') === 'true'
      };

      console.log('🔍 Parsed form data:', {
        billableId,
        updateData
      });

      if (!billableId) {
        console.log('❌ No billable ID provided');
        return {
          success: false,
          error: 'Billable ID is required'
        };
      }

      console.log('🚀 Making PUT request to:', `${API_BASE_URL}/billables/${billableId}`);
      console.log('📤 Request body:', JSON.stringify(updateData, null, 2));

      const response = await authenticatedFetch(
        `${API_BASE_URL}/billables/${billableId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        },
        undefined,
        cookies
      );

      console.log('📬 API Response status:', response.status);
      console.log('📬 API Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🚨 Update billable API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
          url: `${API_BASE_URL}/billables/${billableId}`,
          requestData: updateData
        });
        return {
          success: false,
          error: `Failed to update billable: ${response.statusText}`
        };
      }

      const result = await response.json();
      console.log('✅ Billable updated successfully:', result);

      // Refresh the billable list after update
      console.log('🔄 Fetching updated billables list...');
      const updatedBillables = await fetchBillablesData(cookies);
      console.log('📊 Updated billables count:', updatedBillables.length);

      return {
        success: true,
        billables: updatedBillables,
        message: 'Billable updated successfully'
      };
    } catch (error) {
      console.error('💥 Error updating billable:', error);
      console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return {
        success: false,
        error: 'Failed to update billable'
      };
    }
  },

  delete: async ({ request, cookies }) => {
    console.log('🗑️ Delete action triggered');
    try {
      const formData = await request.formData();

      // Log all form data received
      console.log('📋 All delete form data entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
      }

      const billableId = formData.get('id') as string;

      console.log('🔍 Parsed delete form data:', {
        billableId
      });

      if (!billableId) {
        console.log('❌ No billable ID provided for deletion');
        return {
          success: false,
          error: 'Billable ID is required'
        };
      }

      console.log('🚀 Making DELETE request to:', `${API_BASE_URL}/billables/${billableId}`);

      const response = await authenticatedFetch(
        `${API_BASE_URL}/billables/${billableId}`,
        { method: 'DELETE' },
        undefined,
        cookies
      );

      console.log('📬 DELETE API Response status:', response.status);
      console.log('📬 DELETE API Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🚨 Delete billable API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
          url: `${API_BASE_URL}/billables/${billableId}`
        });
        return {
          success: false,
          error: `Failed to delete billable: ${response.statusText}`
        };
      }

      console.log('✅ Billable deleted successfully');

      // Refresh the billable list after deletion
      console.log('🔄 Fetching updated billables list after deletion...');
      const updatedBillables = await fetchBillablesData(cookies);
      console.log('📊 Updated billables count after deletion:', updatedBillables.length);

      return {
        success: true,
        billables: updatedBillables,
        message: 'Billable deleted successfully'
      };
    } catch (error) {
      console.error('💥 Error deleting billable:', error);
      console.error('💥 Delete error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return {
        success: false,
        error: 'Failed to delete billable'
      };
    }
  },

  refresh: async ({ cookies }) => {
    try {
      const billables = await fetchBillablesData(cookies);
      console.log('🔄 Billables refreshed:', billables.length);

      return {
        success: true,
        billables: billables as Billable[]
      };
    } catch (error) {
      console.error('Error refreshing billables:', error);
      return {
        success: false,
        error: 'Failed to refresh billables'
      };
    }
  }
};