import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createSupabaseServerClient } from '$lib/supabase.server';
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { formSchema } from "./schema.js";

export const load: PageServerLoad = async (event) => {
    const supabase = createSupabaseServerClient(event);
    const { data: { session } } = await supabase.auth.getSession();

    // Redirect if already logged in
    if (session) {
        throw redirect(302, '/');
    }

    return {
        form: await superValidate(zod(formSchema)),
    };
};


export const actions: Actions = {
    login: async (event) => {
        const supabase = createSupabaseServerClient(event);
        const form = await superValidate(event, zod(formSchema));

        if (!form.valid) {
            return fail(400, {
                form,
            });
        }

        const { error } = await supabase.auth.signInWithPassword({
            email: form.data.email,
            password: form.data.password
        });

        if (error) {
            return fail(400, {
                form,
                error: { message: error.message, status: 400 }
            });
        }

        throw redirect(302, '/');
    },

    logout: async (event) => {
        const supabase = createSupabaseServerClient(event);
        const { error } = await supabase.auth.signOut();

        if (error) {
            return fail(500, {
                error: 'Error logging out'
            });
        }

        throw redirect(302, '/login');
    }
};