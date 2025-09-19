import type { PageServerLoad, Actions } from './$types';
import type { Provider, Billable, QuickTreatmentPlan, TreatmentItem, Profile } from '$lib/types';
import type { Client } from '$lib/types';
import { API_BASE_URL, authenticatedFetch } from '$lib/api.server';
import { fail, redirect, type Redirect } from '@sveltejs/kit';

async function getProviderData(token: string, userId: string): Promise<Provider[]> {
    // Use centralized authenticatedFetch with cookie-based auth info
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
    // Use centralized authenticatedFetch with cookie-based auth info
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
    // Use centralized authenticatedFetch with cookie-based auth info
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
    // Use centralized authenticatedFetch with cookie-based auth info
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

async function getTreatmentData(token: string, userId: string): Promise<TreatmentItem[]> {
    // Use centralized authenticatedFetch with cookie-based auth info
    const res = await authenticatedFetch(
        `${API_BASE_URL}/treatment-plans`,
        { method: 'GET' },
        { token, user: { id: userId } }
    );
    
    if (!res.ok) {
        console.error('Error fetching treatments:', res.status, res.statusText);
        throw new Error('Failed to fetch treatments');
    }
    
    const treatmentsData = await res.json();
    
    const treatments: TreatmentItem[] = [];
    treatmentsData.data.forEach((element: any) => {
        treatments.push({
            name: element.name || '',
            cost: element.cost || 0,
            code: element.code || element.treatment_code || '',
            teeth: '',
            na: false
        });
    });

    return treatments;
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

export const load: PageServerLoad = async ({ cookies }) => {
    // Get session data from server-side cookies
    const userId = cookies.get('userId');
    const accessToken = cookies.get('accessToken');
    const orgId = cookies.get('orgId');
    const authenticated = cookies.get('authenticated') === 'true';
    
    if (!authenticated || !accessToken || !userId || !orgId) {
        throw new Error('User not authenticated or missing org info');
    }

    const token = accessToken;

    const [providers, billables, activeBillables, quickPlans, treatments, clients, profiles] = await Promise.all([
        getProviderData(token, userId),
        getBillableData(token, userId),
        getActiveBillableData(token, userId),
        getQuickPlanData(token, userId),
        getTreatmentData(token, userId),
        getClientsData(token, userId),
        getProfilesData(token, userId, orgId)
    ]);

    return { providers, billables, activeBillables, quickTreatmentPlans: quickPlans, treatments, clients, profiles };
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

// Actions for form submission
export const actions: Actions = {
    createVisit: async ({ request, cookies }) => {
        console.log('=== FORM SUBMISSION START ===');

        const userId = cookies.get('userId');
        const accessToken = cookies.get('accessToken');
        const orgId = cookies.get('orgId');
        const authenticated = cookies.get('authenticated') === 'true';

        console.log('Auth check:', { userId, accessToken: !!accessToken, orgId, authenticated });

        if (!authenticated || !accessToken || !userId || !orgId) {
            console.log('AUTH FAILED: Missing credentials');
            return fail(401, { error: 'User not authenticated' });
        }

        console.log('Getting form data...');
        const formData = await request.formData();
        console.log('Form data keys:', Array.from(formData.keys()));

        try {
            console.log('=== EXTRACTING FORM DATA ===');
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

            console.log('Extracted basic form data:', {
                name, selectedDr, useCustomDoctor, selectedProviderId,
                selectedPresenterId, courtesyAmount, insuranceCoverage,
                notes, numPlans, redirectTo
            });
            console.log('JSON strings:', { planNamesJson, caseFeesJson, planItemsJson });

            console.log('=== PARSING JSON DATA ===');
            // Parse JSON data
            const planNames = planNamesJson ? JSON.parse(planNamesJson) : [];
            const caseFees = caseFeesJson ? JSON.parse(caseFeesJson) : [];
            const planItems = planItemsJson ? JSON.parse(planItemsJson) : [];

            console.log('Parsed data:', { planNames, caseFees, planItems });

            console.log('=== CREATING TREATMENT PLANS ===');
            // Create treatment plans
            const treatmentPlans = Array.from({ length: numPlans }, (_, index) => {
                const planName = planNames[index] || `Option ${index + 1}`;
                const currentPlanItems = planItems.filter((item: any) => item.index === index);
                const caseFee = caseFees[index] || 0;

                console.log(`Plan ${index + 1}:`, { planName, currentPlanItems, caseFee });

                const plan = {
                    name: planName,
                    sequence_order: index + 1,
                    case_fee: caseFee,
                    items: currentPlanItems.map((item: any, itemIndex: number) => {
                        const teethArr = parseTeethString(item.teeth || "");
                        const planItem = {
                            name: item.name,
                            quantity: teethArr.length || 1,
                            cost: item.cost,
                            teeth: item.teeth || "",
                            sequence_order: itemIndex + 1
                        };
                        console.log(`  Item ${itemIndex + 1}:`, planItem);
                        return planItem;
                    })
                };
                return plan;
            });

            console.log('Final treatment plans:', treatmentPlans);

            console.log('=== CREATING VISIT PAYLOAD ===');
            // Create visit payload
            const payload = {
                clientid: 1,
                providerid: selectedProviderId,
                visitdate: new Date().toISOString().split("T")[0],
                paid: false,
                notes: notes,
                treatment_plan: {
                    patient_name: name,
                    doctor_name: useCustomDoctor ? selectedDr : selectedDr,
                    discount: 0,
                    insurance_coverage: insuranceCoverage,
                    courtesy_amount: courtesyAmount,
                    org_id: parseInt(orgId, 10),
                    created_by: userId,
                    presenter_id: selectedPresenterId,
                    options: treatmentPlans,
                    images: []
                }
            };

            console.log('Creating visit with payload:', JSON.stringify(payload, null, 2));

            console.log('=== SENDING VISIT REQUEST ===');
            console.log('API URL:', `${API_BASE_URL}/visits`);

            const res = await authenticatedFetch(
                `${API_BASE_URL}/visits`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                },
                undefined,
                cookies
            );

            console.log('Visit response status:', res.status);
            console.log('Visit response headers:', Object.fromEntries(res.headers.entries()));

            if (!res.ok) {
                console.log('VISIT CREATION FAILED');
                const errorText = await res.text();
                console.log('Error response text:', errorText);

                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText || 'Failed to create treatment plan' };
                }

                console.log('Parsed error data:', errorData);
                return fail(res.status, {
                    error: errorData.message || 'Failed to create treatment plan'
                });
            }

            const result = await res.json();
            const visitResponse = result.data || result;

            console.log('Visit created successfully:', visitResponse);
            console.log('Visit ID for images:', visitResponse.visitid);

            console.log('=== HANDLING IMAGE UPLOAD ===');
            // Handle image upload if present
            const beforePhotos = formData.getAll('beforePhotos') as File[];
            const afterPhotos = formData.getAll('afterPhotos') as File[];

            console.log('Photo counts:', {
                beforePhotos: beforePhotos.length,
                afterPhotos: afterPhotos.length
            });

            if (beforePhotos.length > 0 || afterPhotos.length > 0) {
                console.log('Processing photos...');
                try {
                    let beforePhotosArray: any[] = [];
                    let afterPhotosArray: any[] = [];

                    // Process before photos
                    if (beforePhotos.length > 0) {
                        console.log('Processing before photos...');
                        beforePhotosArray = await Promise.all(
                            beforePhotos.map(async (file, index) => {
                                console.log(`Before photo ${index + 1}:`, { name: file.name, size: file.size, type: file.type });
                                const photo = {
                                    image_type: 'before' as const,
                                    file: await convertFileToBase64(file),
                                    image_name: file.name,
                                    mime_type: file.type,
                                    sequence_order: index + 1,
                                    file_size: file.size
                                };
                                console.log(`Before photo ${index + 1} processed`);
                                return photo;
                            })
                        );
                        console.log('Before photos array length:', beforePhotosArray.length);
                    }

                    // Process after photos
                    if (afterPhotos.length > 0) {
                        console.log('Processing after photos...');
                        afterPhotosArray = await Promise.all(
                            afterPhotos.map(async (file, index) => {
                                console.log(`After photo ${index + 1}:`, { name: file.name, size: file.size, type: file.type });
                                const photo = {
                                    image_type: 'after' as const,
                                    file: await convertFileToBase64(file),
                                    image_name: file.name,
                                    mime_type: file.type,
                                    sequence_order: beforePhotosArray.length + index + 1,
                                    file_size: file.size
                                };
                                console.log(`After photo ${index + 1} processed`);
                                return photo;
                            })
                        );
                        console.log('After photos array length:', afterPhotosArray.length);
                    }

                    console.log('=== UPLOADING IMAGES ===');
                    const imagePayload = {
                        treatment_plan_id: visitResponse.visitid,
                        beforePhotos: beforePhotosArray,
                        afterPhotos: afterPhotosArray
                    };

                    console.log('Image upload payload:', {
                        treatment_plan_id: imagePayload.treatment_plan_id,
                        beforePhotosCount: imagePayload.beforePhotos.length,
                        afterPhotosCount: imagePayload.afterPhotos.length
                    });

                    const imgResponse = await authenticatedFetch(
                        `${API_BASE_URL}/images`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(imagePayload)
                        },
                        undefined,
                        cookies
                    );

                    console.log('Image upload response status:', imgResponse.status);

                    if (!imgResponse.ok) {
                        const imgErrorText = await imgResponse.text();
                        console.error('Failed to upload images:', imgErrorText);
                        console.error('Image response headers:', Object.fromEntries(imgResponse.headers.entries()));
                        // Continue with success but note image upload failure
                    } else {
                        const imgResult = await imgResponse.json();
                        console.log('Images uploaded successfully:', imgResult);
                    }
                } catch (imgErr) {
                    console.error('Image upload error:', imgErr);
                    console.error('Image upload error stack:', imgErr instanceof Error ? imgErr.stack : 'No stack trace');
                    // Continue with success but note image upload failure
                }
            } else {
                console.log('No images to upload');
            }

            console.log('=== REDIRECTING ===');
            // Redirect based on user choice
            if (redirectTo === 'slides' && visitResponse.visitid) {
                console.log('Redirecting to slides:', `/slides/${visitResponse.visitid}`);
                throw redirect(303, `/slides/${visitResponse.visitid}`);
            } else {
                console.log('Redirecting to treatment plans');
                throw redirect(303, '/treatment-plans');
            }

        } catch (error) {
            if (error instanceof Response || (error && typeof error === 'object' && 'status' in error && 'location' in error)) {
                console.log('Redirect response, re-throwing');
                throw error; // Re-throw redirect responses
            }

            console.error('=== FORM SUBMISSION ERROR ===');
            console.error('Error type:', typeof error);
            console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
            console.error('Error message:', error instanceof Error ? error.message : error);
            console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
            console.error('Full error object:', error);

            return fail(500, {
                error: 'An unexpected error occurred while creating treatment plan'
            });
        }
    }
};