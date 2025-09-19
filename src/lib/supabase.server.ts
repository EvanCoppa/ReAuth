import { createServerClient } from '@supabase/ssr'
import { type RequestEvent } from '@sveltejs/kit'
import {
	PUBLIC_SUPABASE_ANON_KEY,
	PUBLIC_SUPABASE_URL,
} from '$env/static/public'

export const createSupabaseServerClient = (event: RequestEvent) => {
	return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => {
				const cookies = event.cookies.getAll();
				console.log('[SupabaseServer] Getting cookies:', cookies.length, 'cookies found');
				return cookies;
			},
			setAll: (cookiesToSet: { name: string; value: string; options: any }[]) => {
				console.log('[SupabaseServer] Setting cookies:', cookiesToSet.length, 'cookies');
				cookiesToSet.forEach(({ name, value, options }) => {
					const cookieOptions = {
						...options,
						path: '/',
						httpOnly: false,
						secure: process.env.NODE_ENV === 'production',
						sameSite: 'lax' as const
					};
					console.log(`[SupabaseServer] Setting cookie: ${name}`, { hasValue: !!value, options: cookieOptions });
					event.cookies.set(name, value, cookieOptions);
				})
			},
		},
	})
}