import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://zicozssqsqoyyzyhmjmv.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppY296c3Nxc3FveXl6eWhtam12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjkzNDYsImV4cCI6MjA2ODAwNTM0Nn0.-D3a_a0a7utql6zjyV7yYYw0mNmlAyT8mHaF1IOB5Ms";

const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
 function decodeInviteCode(encodedCode: string): string | null {
  try {
    const decoded = atob(encodedCode);
    return decoded;
  } catch {
    return null;
  }
}

export const load: PageServerLoad = async ({ params }) => {
  const encodedCode = params.code;
  
  if (!encodedCode) {
    throw error(400, 'Invalid invite code');
  }

  const decodedCode = decodeInviteCode(encodedCode);
  
  if (!decodedCode) {
    throw error(400, 'Invalid invite code format');
  }
  try {
     const { data: organization, error: dbError } = await supabaseServer
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
