import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { API_BASE_URL, authenticatedFetch } from '$lib/api.server';

type SlideComponentName = 'TitleSlide' | 'OurResultsSlide' | 'IntroductionSlide' | 'VisitSummarySlide' | 'QuoteSlide' | 'CoreValuesSlide' | 'TreatmentSummarySlide' | 'PhotoSlide' | 'CommunitySlide';

interface TemplateSettings {
  id?: string;
  selectedTemplates: SlideComponentName[];
}

export const load: PageServerLoad = async ({ cookies }) => {
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/slide-template-settings`,
      { method: 'GET' },
      undefined,
      cookies
    );

    if (response.ok) {
      const data = await response.json();
      console.log('Loaded slide template settings:', data.data);

      // Extract template names from the Data arrays in the response
      const templateNames = data.data?.flatMap((item: any) => item.Data || []) || [];

      return {
        selectedTemplates: templateNames as SlideComponentName[],
        settingsId: data.id
      };
    } else {
      // Default to empty selection if no settings exist
      return {
        selectedTemplates: [] as SlideComponentName[],
        settingsId: null
      };
    }
  } catch (error) {
    console.error('Failed to load template settings:', error);
    return {
      selectedTemplates: [] as SlideComponentName[],
      settingsId: null,
      error: 'Failed to load template settings'
    };
  }
};

export const actions: Actions = {
  toggleTemplate: async ({ request, cookies }) => {
    const data = await request.formData();
    const templateName = data.get('templateName') as SlideComponentName;
    const isSelected = data.get('isSelected') === 'true';
    const currentTemplatesJson = data.get('currentTemplates') as string;

    if (!templateName) {
      return fail(400, { message: 'Missing template name' });
    }

    try {
      let currentTemplates: SlideComponentName[] = [];
      if (currentTemplatesJson) {
        currentTemplates = JSON.parse(currentTemplatesJson);
      }

      // Toggle the template
      if (isSelected) {
        // Remove template
        currentTemplates = currentTemplates.filter(t => t !== templateName);
      } else {
        // Add template
        if (!currentTemplates.includes(templateName)) {
          currentTemplates.push(templateName);
        }
      }

      // Save the updated settings
      const saveResult = await saveTemplateSettings(currentTemplates, cookies);

      if (saveResult.success) {
        return {
          success: true,
          selectedTemplates: currentTemplates,
          message: `Template ${isSelected ? 'removed' : 'added'} successfully`
        };
      } else {
        return fail(500, { message: saveResult.error || 'Failed to update template settings' });
      }
    } catch (error) {
      console.error('Failed to toggle template:', error);
      return fail(500, { message: 'Failed to update template settings' });
    }
  },

  selectAll: async ({ request, cookies }) => {
    const data = await request.formData();
    const allTemplatesJson = data.get('allTemplates') as string;

    if (!allTemplatesJson) {
      return fail(400, { message: 'Missing template list' });
    }

    try {
      const allTemplates: SlideComponentName[] = JSON.parse(allTemplatesJson);

      const saveResult = await saveTemplateSettings(allTemplates, cookies);

      if (saveResult.success) {
        return {
          success: true,
          selectedTemplates: allTemplates,
          message: 'All templates selected'
        };
      } else {
        return fail(500, { message: saveResult.error || 'Failed to select all templates' });
      }
    } catch (error) {
      console.error('Failed to select all templates:', error);
      return fail(500, { message: 'Failed to select all templates' });
    }
  },

  clearAll: async ({ cookies }) => {
    try {
      const saveResult = await saveTemplateSettings([], cookies);

      if (saveResult.success) {
        return {
          success: true,
          selectedTemplates: [],
          message: 'All templates cleared'
        };
      } else {
        return fail(500, { message: saveResult.error || 'Failed to clear templates' });
      }
    } catch (error) {
      console.error('Failed to clear all templates:', error);
      return fail(500, { message: 'Failed to clear all templates' });
    }
  }
};

async function saveTemplateSettings(selectedTemplates: SlideComponentName[], cookies: any): Promise<{ success: boolean; error?: string }> {
  try {
    // First, try to get the existing record to find the ID
    const getResponse = await authenticatedFetch(
      `${API_BASE_URL}/slide-template-settings`,
      { method: 'GET' },
      undefined,
      cookies
    );

    if (getResponse.ok) {
      const existingData = await getResponse.json();
      // If we have an existing record, update it using PUT with the ID
      if (existingData.id) {
        const putResponse = await authenticatedFetch(
          `${API_BASE_URL}/slide-template-settings/${existingData.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Data: selectedTemplates })
          },
          undefined,
          cookies
        );

        if (putResponse.ok) {
          return { success: true };
        } else {
          return { success: false, error: `Failed to update settings: ${putResponse.statusText}` };
        }
      }
    }

    // If GET failed or no existing record, create a new one with POST
    const postResponse = await authenticatedFetch(
      `${API_BASE_URL}/slide-template-settings`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Data: selectedTemplates })
      },
      undefined,
      cookies
    );

    if (postResponse.ok) {
      return { success: true };
    } else {
      return { success: false, error: `Failed to create settings: ${postResponse.statusText}` };
    }
  } catch (error) {
    console.error('Failed to save template settings:', error);
    return { success: false, error: 'Network error occurred' };
  }
}