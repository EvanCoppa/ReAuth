import { SIDEBAR_COOKIE_NAME } from '$lib/components/ui/sidebar/constants';
import { browser } from '$app/environment';

export function getSidebarStateFromCookie(): boolean {
    if (!browser) return true; // Default to open on server
    
    const cookies = document.cookie.split(';');
    const sidebarCookie = cookies.find(cookie => 
        cookie.trim().startsWith(`${SIDEBAR_COOKIE_NAME}=`)
    );
    
    if (sidebarCookie) {
        const value = sidebarCookie.split('=')[1];
        return value === 'true';
    }
    
    return true; // Default to open if no cookie found
}
