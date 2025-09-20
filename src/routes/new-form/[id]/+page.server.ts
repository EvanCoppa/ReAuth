import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { Provider, Billable, QuickTreatmentPlan, Profile } from '$lib/types';
import type { Client } from '$lib/types';
import { API_BASE_URL, authenticatedFetch } from '$lib/api.server';

async function getProviderData(token: string, userId: string): Promise<Provider[]> {
    const res = await authenticatedFetch(
        `${API_BASE_URL}/providers`,
        { method: 'GET' },
        { token, user: { id: userId } }
    );
    
    if (!res.ok) {
        throw new Error('Failed to fetch providers');
    }
    
    const providersData = await res.json();
 
    const providers: Provider[] = [];
    providersData.data.forEach((element: any) => {
        providers.push({
            id: element.providerid,
            prefix: element.prefix || '',
            firstname: element.firstname || '',
            lastname: element.lastname || '',
            name: element.name
        });
    });

    return providers;
}

async function getBillableData(token: string, userId: string): Promise<Billable[]> {
    const res = await authenticatedFetch(
        `${API_BASE_URL}/billables`,
        { method: 'GET' },
        { token, user: { id: userId } }
    );
    
    if (!res.ok) {
        throw new Error('Failed to fetch billables');
    }
    
    const billablesData = await res.json();
 
    const billables: Billable[] = [];
    billablesData.data.forEach((element: any) => {
        billables.push({
            id: element.id,
            billable_code: element.billable_code || '',
            description: element.description || '',
            cost: element.cost || 0,
            is_active: element.is_active
        });
    });

    return billables;
}

async function getActiveBillableData(token: string, userId: string): Promise<Billable[]> {
    const res = await authenticatedFetch(
        `${API_BASE_URL}/billables/displayed`,
        { method: 'GET' },
        { token, user: { id: userId } }
    );
    
    if (!res.ok) {
        throw new Error('Failed to fetch active billables');
    }
    
    const activeBillablesData = await res.json();
 
    const activeBillables: Billable[] = [];
    activeBillablesData.data.forEach((element: any) => {
        activeBillables.push({
            id: element.id,
            billable_code: element.billable_code || '',
            description: element.description || '',
            cost: element.cost || 0,
            is_active: element.is_active
        });
    });

    return activeBillables;
}

async function getQuickPlanData(token: string, userId: string): Promise<QuickTreatmentPlan[]> {
    const res = await authenticatedFetch(
        `${API_BASE_URL}/quick-plans`,
        { method: 'GET' },
        { token, user: { id: userId } }
    );
    
    if (!res.ok) {
        console.error('Error fetching quick plans:', res.status, res.statusText);
        throw new Error('Failed to fetch quick plans');
    }
    
    const quickPlansData = await res.json();
 
    const quickPlans: QuickTreatmentPlan[] = [];
    quickPlansData.data.forEach((element: any) => {
        quickPlans.push({
            id: element.id,
            name: element.name || '',
            codes: element.codes || [],
            billables: element.billables || []
        });
    });

    return quickPlans;
}

async function getProfilesData(token: string, userId: string, orgId: string): Promise<Profile[]> {
    const res = await authenticatedFetch(
        `${API_BASE_URL}/profiles/org/${orgId}`,
        { method: 'GET' },
        { token, user: { id: userId } }
    );
    
    if (!res.ok) {
        console.error('Error fetching profiles:', res.status, res.statusText);
        throw new Error('Failed to fetch profiles');
    }
    
    const profilesData = await res.json();
    
    const profiles: Profile[] = [];
    profilesData.data.forEach((element: any) => {
        profiles.push({
            auth_user_id: element.auth_user_id || '',
            first_name: element.first_name || '',
            last_name: element.last_name || '',
            org_id: element.org_id || 0,
            email: element.email || '',
            role: element.role || ''
        });
    });

    return profiles;
}

async function getClientsData(token: string, userId: string): Promise<Client[]> {
    const res = await authenticatedFetch(
        `${API_BASE_URL}/clients`,
        { method: 'GET' },
        { token, user: { id: userId } }
    );
    
    if (!res.ok) {
        console.error('Error fetching clients:', res.status, res.statusText);
        throw new Error('Failed to fetch clients');
    }
    
    const clientsData = await res.json();
    
    const clients: Client[] = [];
    clientsData.data.forEach((element: any) => {
        clients.push({
            clientid: element.clientid || element.id,
            first_name: element.first_name || '',
            last_name: element.last_name || '',
            dob: element.dob || null,
            phone: element.phone || null,
            email: element.email || null,
            address: element.address || null,
            org_id: element.org_id || null,
            insurance_provider: element.insurance_provider || null
        });
    });

    return clients;
}

export const load: PageServerLoad = async ({ params, cookies, parent }) => {
  const treatmentPlanId = params.id;

  // Get session data from parent layout
  const { session } = await parent();
  const orgId = cookies.get('orgId');

  // If no valid session, throw error
  if (!session?.access_token || !session?.user || !orgId) {
    throw error(401, 'Authentication required or missing organization info');
  }

  const token = session.access_token;
  const userId = session.user.id;

  try {
    // Fetch visit data (which contains treatment plan)
    const treatmentPlanResponse = await authenticatedFetch(
      `${API_BASE_URL}/visits/${treatmentPlanId}`,
      { method: 'GET' },
      { token, user: { id: userId } }
    );

    if (!treatmentPlanResponse.ok) {
      throw error(404, 'Treatment plan not found');
    }

    const treatmentPlanData = await treatmentPlanResponse.json();

    // Fetch the same data as the original new-form page
    const [providers, billables, activeBillables, quickPlans, profiles, clients] = await Promise.all([
        getProviderData(token, userId),
        getBillableData(token, userId),
        getActiveBillableData(token, userId),
        getQuickPlanData(token, userId),
        getProfilesData(token, userId, orgId),
        getClientsData(token, userId)
    ]);

    return {
      providers,
      billables,
      activeBillables,
      quickTreatmentPlans: quickPlans,
      profiles,
      clients,
      prefillData: treatmentPlanData.data || treatmentPlanData,
      treatmentPlanId
    };
  } catch (err) {
    console.error('Error loading treatment plan:', err);
    throw error(500, 'Failed to load treatment plan data');
  }
};

// Helper function to parse teeth numbers
function parseTeethString(teethStr: string): string[] {
    if (!teethStr) return [];
    return teethStr
        .split(/[,\s]+/)
        .map((part) => part.trim())
        .filter(Boolean)
        .flatMap((part) => {
            if (part.includes("-")) {
                const [start, end] = part.split("-").map(Number);
                if (isNaN(start) || isNaN(end) || start > end) return [];
                return Array.from({ length: end - start + 1 }, (_, i) => String(start + i));
            }
            const num = Number(part);
            return isNaN(num) ? [] : [String(num)];
        });
}

// Helper function to convert File to base64
async function convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export const actions: Actions = {
    updateVisit: async (event) => {
        const { request, cookies, params } = event;
        const orgId = cookies.get('orgId');
        const visitId = params.id;

        if (!orgId) {
            return fail(401, { error: 'User not authenticated' });
        }

        if (!visitId) {
            return fail(400, { error: 'Visit ID is required' });
        }

        const formData = await request.formData();

        try {
            // Extract form data
            const name = formData.get('name') as string;
            const selectedDr = formData.get('selectedDr') as string;
            const useCustomDoctor = formData.get('useCustomDoctor') === 'true';
            const selectedProviderId = parseInt(formData.get('selectedProviderId') as string) || 1;
            const selectedPresenterId = formData.get('selectedPresenterId') as string || null;
            const courtesyAmount = parseFloat(formData.get('courtesyAmount') as string) || 0;
            const insuranceCoverage = parseFloat(formData.get('insuranceCoverage') as string) || 0;
            const notes = formData.get('notes') as string || "Consultation with treatment plan";
            const numPlans = parseInt(formData.get('numPlans') as string) || 1;
            const planNamesJson = formData.get('planNames') as string;
            const caseFeesJson = formData.get('caseFees') as string;
            const planItemsJson = formData.get('planItems') as string;
            const redirectTo = formData.get('redirectTo') as string || 'slides';

            // Parse JSON data
            const planNames = planNamesJson ? JSON.parse(planNamesJson) : [];
            const caseFees = caseFeesJson ? JSON.parse(caseFeesJson) : [];
            const planItems = planItemsJson ? JSON.parse(planItemsJson) : [];

            // Create treatment plans
            const treatmentPlans = Array.from({ length: numPlans }, (_, index) => {
                const planName = planNames[index] || `Option ${index + 1}`;
                const currentPlanItems = planItems.filter((item: any) => item.index === index);
                const caseFee = caseFees[index] || 0;

                return {
                    name: planName,
                    sequence_order: index + 1,
                    case_fee: caseFee,
                    items: currentPlanItems.map((item: any, itemIndex: number) => {
                        const teethArr = parseTeethString(item.teeth || "");
                        return {
                            name: item.name,
                            quantity: teethArr.length || 1,
                            cost: item.cost,
                            teeth: item.teeth || "",
                            sequence_order: itemIndex + 1
                        };
                    })
                };
            });

            // Create update payload - format for updateTreatmentPlan
            const payload = {
                patient_name: name,
                doctor_name: useCustomDoctor ? selectedDr : selectedDr,
                discount: 0,
                insurance_coverage: insuranceCoverage,
                courtesy_amount: courtesyAmount,
                clientid: 1,
                providerid: selectedProviderId,
                presenter_id: selectedPresenterId,
                notes: notes,
                options: treatmentPlans,
                images: []
            };

            console.log('Updating visit with payload:', JSON.stringify(payload, null, 2));

            const res = await authenticatedFetch(
                `${API_BASE_URL}/visits/${visitId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                },
                undefined,
                event
            );

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                return fail(res.status, {
                    error: errorData.message || 'Failed to update treatment plan'
                });
            }

            const result = await res.json();
            const visitResponse = result.data || result;

            console.log('Visit updated successfully:', visitResponse);

            // Handle image upload if present
            const beforePhotos = formData.getAll('beforePhotos') as File[];
            const afterPhotos = formData.getAll('afterPhotos') as File[];

            if (beforePhotos.length > 0 || afterPhotos.length > 0) {
                try {
                    let beforePhotosArray: any[] = [];
                    let afterPhotosArray: any[] = [];

                    // Process before photos
                    if (beforePhotos.length > 0) {
                        beforePhotosArray = await Promise.all(
                            beforePhotos.map(async (file, index) => ({
                                image_type: 'before' as const,
                                file: await convertFileToBase64(file),
                                image_name: file.name,
                                mime_type: file.type,
                                sequence_order: index + 1,
                                file_size: file.size
                            }))
                        );
                    }

                    // Process after photos
                    if (afterPhotos.length > 0) {
                        afterPhotosArray = await Promise.all(
                            afterPhotos.map(async (file, index) => ({
                                image_type: 'after' as const,
                                file: await convertFileToBase64(file),
                                image_name: file.name,
                                mime_type: file.type,
                                sequence_order: beforePhotosArray.length + index + 1,
                                file_size: file.size
                            }))
                        );
                    }

                    const imgResponse = await authenticatedFetch(
                        `${API_BASE_URL}/images`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                treatment_plan_id: visitId,
                                beforePhotos: beforePhotosArray,
                                afterPhotos: afterPhotosArray
                            })
                        },
                        undefined,
                        event
                    );

                    if (!imgResponse.ok) {
                        console.error('Failed to upload images:', await imgResponse.text());
                        // Continue with success but note image upload failure
                    }
                } catch (imgErr) {
                    console.error('Image upload error:', imgErr);
                    // Continue with success but note image upload failure
                }
            }
            console.log('Redirecting to:', redirectTo === 'slides' ? `/slides/${visitId}` : '/treatment-plans');
            // Return success with redirect info instead of throwing
            return {
                success: true,
                redirectTo: redirectTo === 'slides' ? `/slides/${visitId}` : '/treatment-plans'
            };

        } catch (error) {
            if (error instanceof Response) {
                throw error; // Re-throw redirect responses
            }

            console.error('Form update error:', error);
            return fail(500, {
                error: 'An unexpected error occurred while updating treatment plan'
            });
        }
    }
};