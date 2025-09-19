import { createSupabaseServerClient } from '$lib/supabase.server';
import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { formSchema } from "./schema.js";
import type { PageServerLoad, Actions } from "./$types.js";

 
export const load: PageServerLoad = async (event) => {
  const { url } = event;
  const supabase = createSupabaseServerClient(event);
  const inviteCode = url.searchParams.get('invite');
  
  const form = await superValidate(zod(formSchema));
  
  // Prefill the orgId if invite code is provided
  if (inviteCode) {
    form.data.orgId = inviteCode;
  }
  
  return {
    form,
    inviteCode
  };
};
 
export const actions: Actions = {
  default: async (event) => {
    const supabase = createSupabaseServerClient(event);
    const form = await superValidate(event, zod(formSchema));
    console.log("Form data:", form.data);
    
    if (!form.valid) {
      return fail(400, {
        form,
      });
    }

    try {
      console.log("Form is valid, proceeding with registration");
      
      const displayName = `${form.data.firstName} ${form.data.lastName}`;
      
      const { data, error } = await supabase.auth.signUp({
        email: form.data.email,
        password: form.data.password,
        options: {
          data: {
            first_name: form.data.firstName,
            last_name: form.data.lastName,
            full_name: displayName
          }
        }
      });

      // Handle Supabase auth errors
      if (error) {
        console.error("Supabase auth error:", error);
        
        // Add specific error messages based on error type
        if (error.message.includes('Invalid email')) {
          return fail(400, {
            form,
            message: "Please enter a valid email address."
          });
        } else if (error.message.includes('User already registered')) {
          return fail(400, {
            form,
            message: "An account with this email already exists. Please try logging in instead."
          });
        } else if (error.message.includes('Password should be at least')) {
          return fail(400, {
            form,
            message: "Password must be at least 6 characters long."
          });
        } else if (error.message.includes('Signup is disabled')) {
          return fail(400, {
            form,
            message: "Account registration is currently disabled. Please contact support."
          });
        } else if (error.message.includes('Email rate limit exceeded')) {
          return fail(400, {
            form,
            message: "Too many registration attempts. Please wait a few minutes before trying again."
          });
        } else {
          return fail(400, {
            form,
            message: `Registration failed: ${error.message}`
          });
        }
      }

      // If user was created, update their auth profile and create their profile
      if (data.user) {
        const userId = data.user.id;
        
        // Update the auth user's display name
        try {
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              display_name: displayName,
              first_name: form.data.firstName,
              last_name: form.data.lastName
            }
          });
          
          if (updateError) {
            console.error('Error updating user display name:', updateError);
          }
        } catch (updateUserError) {
          console.error('Failed to update user metadata:', updateUserError);
        }
        
        try {
          // First, look up the organization ID by code
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('id')
            .eq('code', form.data.orgId)
            .single();
            
          if (orgError || !orgData) {
            console.error("Organization lookup error:", orgError);
            return fail(400, {
              form,
              message: "Invalid organization code"
            });
          }
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({ 
              auth_user_id: userId, 
              org_id: orgData.id, // Use the numeric organization ID
              first_name: form.data.firstName,
              last_name: form.data.lastName,
              pending: true // Set as pending by default - requires manual approval
            });
            
          if (profileError) {
            console.error("Profile creation error:", profileError);
            
            // Handle specific profile creation errors
            if (profileError.message.includes('duplicate key') || profileError.code === '23505') {
              return fail(400, {
                form,
                message: "A profile with this information already exists."
              });
            } else if (profileError.message.includes('foreign key') || profileError.code === '23503') {
              return fail(400, {
                form,
                message: "Invalid organization ID. Please check the organization code and try again."
              });
            } else {
              return fail(400, {
                form,
                message: "Failed to create user profile. Please try again."
              });
            }
          }
        } catch (profileError) {
          console.error("Unexpected profile error:", profileError);
          return fail(500, {
            form,
            message: "An unexpected error occurred during registration. Please try again."
          });
        }
      }

      console.log("Registration successful:", data);
      
    } catch (error) {
      // Check if it's a redirect (which is expected behavior)
      if (error instanceof Response) {
        throw error;
      }
      
      console.error("Unexpected registration error:", error);
      return fail(500, {
        form,
        message: "An unexpected error occurred. Please try again later."
      });
    }

    // Success - redirect to pending page (user needs manual approval)
    throw redirect(302, '/register/pending');
  },
};