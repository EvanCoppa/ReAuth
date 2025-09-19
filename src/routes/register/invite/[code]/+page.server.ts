import { createSupabaseServerClient } from '$lib/supabase.server';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
 function decodeInviteCode(encodedCode: string): string | null {
  try {
    const decoded = atob(encodedCode);
    return decoded;
  } catch {
    return null;
  }
}

export const load: PageServerLoad = async (event) => {
  const { params } = event;
  const supabase = createSupabaseServerClient(event);
  const encodedCode = params.code;
  
  if (!encodedCode) {
    throw error(400, 'Invalid invite code');
  }

  const decodedCode = decodeInviteCode(encodedCode);
  
  if (!decodedCode) {
    throw error(400, 'Invalid invite code format');
  }
  try {
     const { data: organization, error: dbError } = await supabase
      .from('organizations')
      .select('name')
      .eq('code', decodedCode)
      .eq('is_active', true)
      .single();
 

    if (dbError || !organization) {
       throw error(404, 'Invalid or expired invite code');
    }
     return {
      valid: true,
      organization: {
        name: organization.name
      },
      inviteCode: decodedCode
    };
  } catch (err) {
    if (err instanceof Error && 'status' in err) {
      throw err;
    }
     throw error(500, 'Failed to verify invite code');
  }
};
