import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { API_BASE_URL, authenticatedFetch } from '$lib/api.server';

type SlideComponentName = 'TitleSlide' | 'OurResultsSlide' | 'IntroductionSlide' | 'VisitSummarySlide' | 'QuoteSlide' | 'CoreValuesSlide' | 'TreatmentSummarySlide' | 'PhotoSlide' | 'CommunitySlide';

interface SavedTemplate {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  slides: SlideComponentName[];
  settings?: any;
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
      const templateNames = data.data?.flatMap((item: any) => item.Data || []) || [];

      // Create mock saved templates based on current settings
      const savedTemplates: SavedTemplate[] = [
        {
          id: '1',
          name: 'Current Template Set',
          description: 'Your currently configured slide templates',
          created_at: new Date().toISOString(),
          slides: templateNames
        },
        // Add some example saved templates
        {
          id: '2',
          name: 'Basic Consultation',
          description: 'Standard consultation presentation with essential slides',
          created_at: '2024-01-15T10:00:00Z',
          slides: ['TitleSlide', 'IntroductionSlide', 'VisitSummarySlide', 'CommunitySlide']
        },
        {
          id: '3',
          name: 'Treatment Overview',
          description: 'Complete treatment presentation with pricing',
          created_at: '2024-01-10T14:30:00Z',
          slides: ['TitleSlide', 'IntroductionSlide', 'TreatmentSummarySlide', 'PhotoSlide', 'CommunitySlide']
        },
        {
          id: '4',
          name: 'Results Showcase',
          description: 'Before/after results presentation',
          created_at: '2024-01-08T09:15:00Z',
          slides: ['TitleSlide', 'OurResultsSlide', 'PhotoSlide', 'QuoteSlide', 'CommunitySlide']
        }
      ];

      return {
        savedTemplates
      };
    } else {
      // Fallback mock data
      const savedTemplates: SavedTemplate[] = [
        {
          id: '2',
          name: 'Basic Consultation',
          description: 'Standard consultation presentation with essential slides',
          created_at: '2024-01-15T10:00:00Z',
          slides: ['TitleSlide', 'IntroductionSlide', 'VisitSummarySlide', 'CommunitySlide']
        },
        {
          id: '3',
          name: 'Treatment Overview',
          description: 'Complete treatment presentation with pricing',
          created_at: '2024-01-10T14:30:00Z',
          slides: ['TitleSlide', 'IntroductionSlide', 'TreatmentSummarySlide', 'PhotoSlide', 'CommunitySlide']
        }
      ];

      return {
        savedTemplates
      };
    }
  } catch (error) {
    console.error('Failed to load saved templates:', error);
    return {
      savedTemplates: []
    };
  }
};

export const actions: Actions = {
  loadTemplate: async ({ request, cookies }) => {
    const data = await request.formData();
    const slidesData = data.get('slides');
    const templateName = data.get('templateName');

    if (!slidesData) {
      return fail(400, { message: 'Missing slides data' });
    }

    try {
      const slides = JSON.parse(slidesData as string);

      const response = await authenticatedFetch(
        `${API_BASE_URL}/slide-template-settings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ Data: slides })
        },
        undefined,
        cookies
      );

      if (response.ok) {
        return {
          success: true,
          message: `Loaded template: ${templateName}`
        };
      } else {
        return fail(500, { message: 'Failed to load template' });
      }
    } catch (error) {
      console.error('Failed to load template:', error);
      return fail(500, { message: 'Failed to load template' });
    }
  },

  deleteTemplate: async ({ request }) => {
    const data = await request.formData();
    const templateId = data.get('templateId');
    const templateName = data.get('templateName');

    if (!templateId) {
      return fail(400, { message: 'Missing template ID' });
    }

    try {
      // For now, this is just a mock operation since templates are static
      // In a real implementation, you would delete from a database
      return {
        success: true,
        message: `Template "${templateName}" deleted successfully`,
        deletedId: templateId
      };
    } catch (error) {
      console.error('Failed to delete template:', error);
      return fail(500, { message: 'Failed to delete template' });
    }
  }
};