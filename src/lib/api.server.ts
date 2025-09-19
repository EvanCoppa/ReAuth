import type { Cookies, RequestEvent } from '@sveltejs/kit';
import { createSupabaseServerClient } from './supabase.server';
import { toastStore } from './toast';

import type { Client, ClientPayload, PaymentStatusOption } from './types';

// DriveKind API Configuration
export const API_BASE_URL = 'https://smile-design-manhattan-api.vercel.app';

export interface AuthInfo {
  token?: string;
  user?: any;
}

type EventContext = RequestEvent | Cookies | undefined;

function isRequestEvent(value: EventContext): value is RequestEvent {
  return !!value && typeof value === 'object' && 'request' in value && 'cookies' in value;
}

function isCookies(value: EventContext): value is Cookies {
  return (
    !!value &&
    typeof value === 'object' &&
    'get' in value &&
    typeof (value as Cookies).get === 'function'
  );
}

async function checkAuthenticationStatus(authInfo?: AuthInfo, eventOrCookies?: EventContext): Promise<{ isAuthenticated: boolean; token?: string; error?: string }> {
  try {
    let token: string | undefined;

    if (authInfo?.token) {
      token = authInfo.token;
      return { isAuthenticated: true, token };
    }

    if (isRequestEvent(eventOrCookies)) {
      const supabaseClient = createSupabaseServerClient(eventOrCookies);
      const { data: { session }, error } = await supabaseClient.auth.getSession();

      if (error) {
        return { isAuthenticated: false, error: error.message };
      }

      if (session?.access_token) {
        return { isAuthenticated: true, token: session.access_token };
      }
    } else if (isCookies(eventOrCookies)) {
      token = eventOrCookies.get('accessToken') ?? undefined;
      if (token) {
        return { isAuthenticated: true, token };
      }
    }

    return { isAuthenticated: false, error: 'No valid authentication found' };
  } catch (error) {
    return { isAuthenticated: false, error: `Authentication check failed: ${error}` };
  }
}
export interface AuthInfo {
  token?: string;
  user?: any;
}


export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
  authInfo?: AuthInfo,
  eventOrCookies?: EventContext
): Promise<Response> {
  let token: string | undefined;
  let supabaseClient: any = null;

  console.log('[AuthenticatedFetch] Starting request to:', url);
  console.log('[AuthenticatedFetch] AuthInfo provided:', !!authInfo?.token);
  console.log('[AuthenticatedFetch] EventOrCookies type:',
    isRequestEvent(eventOrCookies) ? 'RequestEvent' :
    isCookies(eventOrCookies) ? 'Cookies' : 'undefined');

  if (authInfo?.token) {
    token = authInfo.token;
    console.log('[AuthenticatedFetch] Using provided authInfo token');
  } else if (isRequestEvent(eventOrCookies)) {
    supabaseClient = createSupabaseServerClient(eventOrCookies);
    const { data: { session }, error } = await supabaseClient.auth.getSession();

    console.log('[AuthenticatedFetch] Session data:', {
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      userId: session?.user?.id,
      error: error?.message
    });

    if (error) {
      console.error('[AuthenticatedFetch] Session error:', error);
    }

    token = session?.access_token;
  } else if (isCookies(eventOrCookies)) {
    token = eventOrCookies.get('accessToken') ?? undefined;
    console.log('[AuthenticatedFetch] Cookie token found:', !!token);
  }

  if (!token) {
    console.error('[AuthenticatedFetch] JWT validation failed: Token validation error: Auth session missing!');
    console.error('[AuthenticatedFetch] No authentication token available. AuthInfo:', !!authInfo, 'EventContext:', !!eventOrCookies);
    throw new Error('JWT validation failed: Token validation error: Auth session missing!');
  }

  const makeRequest = async (accessToken: string): Promise<Response> => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });
  };

  try {
    const response = await makeRequest(token);

    if (response.ok) {
      return response;
    }

    if (response.status === 401 || response.status === 403) {
      console.warn(`[AuthenticatedFetch] Authentication failed (${response.status}) for URL: ${url}`);

      if (supabaseClient) {
        console.log('[AuthenticatedFetch] Attempting to refresh session...');
        const { data: { session }, error } = await supabaseClient.auth.refreshSession();

        console.log('[AuthenticatedFetch] Refresh result:', {
          hasNewSession: !!session,
          hasNewAccessToken: !!session?.access_token,
          refreshError: error?.message
        });

        if (session?.access_token && !error) {
          console.log('[AuthenticatedFetch] Retrying request with refreshed token...');
          const retryResponse = await makeRequest(session.access_token);
          if (retryResponse.ok) {
            console.log('[AuthenticatedFetch] Retry successful');
            return retryResponse;
          } else {
            console.error('[AuthenticatedFetch] Retry failed with status:', retryResponse.status);
          }
        } else {
          console.error('[AuthenticatedFetch] Session refresh failed:', error?.message);
        }
      } else {
        console.error('[AuthenticatedFetch] No supabase client available for token refresh');
      }

      // Only show toast error if we're in a browser context
      if (typeof window !== 'undefined') {
        toastStore.error('Your session has expired. Please log out and log back in to continue.', {
          duration: 8000
        });
      }
    }

    return response;

  } catch (fetchError) {
    throw fetchError;
  }
}

// Authenticated API functions
export async function getClients(authInfo?: AuthInfo, event?: EventContext): Promise<Client[]> {
  try {
    console.log('[API] Getting clients...');
    const response = await authenticatedFetch(`${API_BASE_URL}/clients`, { method: 'GET' }, authInfo, event);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] Failed to fetch clients:', response.status, errorText);
      throw new Error(errorText || `Failed to fetch clients: ${response.status} ${response.statusText}`);
    }

    const payload = await response.json().catch(() => null);
    const clients = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : [];

    console.log(`[API] Successfully fetched ${clients.length} clients`);
    return clients as Client[];
  } catch (error) {
    console.error('[API] Error in getClients:', error);
    throw error;
  }
}

export async function deleteClientById(clientId: string, authInfo?: AuthInfo, event?: EventContext): Promise<Response> {
  return await authenticatedFetch(`${API_BASE_URL}/clients/${clientId}`, { method: 'DELETE' }, authInfo, event);
}

export async function createClient(client: ClientPayload, authInfo?: AuthInfo, event?: EventContext): Promise<Response> {
  return await authenticatedFetch(
    `${API_BASE_URL}/clients`,
    {
      method: 'POST',
      body: JSON.stringify(client)
    },
    authInfo,
    event
  );
}

export async function updateClient(clientId: string, client: ClientPayload, authInfo?: AuthInfo, event?: EventContext): Promise<Response> {
  return await authenticatedFetch(
    `${API_BASE_URL}/clients/${clientId}`,
    {
      method: 'PUT',
      body: JSON.stringify(client)
    },
    authInfo,
    event
  );
}

const DEFAULT_PAYMENT_STATUS_OPTIONS: PaymentStatusOption[] = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid_in_full', label: 'Paid in Full' },
  { value: 'financed', label: 'Financed' }
];

function normalizePaymentStatusOption(raw: any): PaymentStatusOption | null {
  if (!raw) return null;

  const value = raw.value ?? raw.code ?? raw.id;
  const label = raw.label ?? raw.name ?? raw.title ?? value;

  if (!value || !label) {
    return null;
  }

  return {
    value: String(value),
    label: String(label),
    description: raw.description ?? raw.details ?? undefined,
    color: raw.color ?? raw.hex_color ?? undefined
  };
}

export async function getPaymentStatusOptions(authInfo?: AuthInfo, event?: EventContext): Promise<PaymentStatusOption[]> {
  try {
    const response = await authenticatedFetch(
      `${API_BASE_URL}/payment-status-options`,
      { method: 'GET' },
      authInfo,
      event
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to fetch payment status options: ${response.status} ${response.statusText}`);
    }

    const payload = await response.json().catch(() => null);
    const rawOptions = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : [];

    const normalized = (rawOptions as unknown[])
      .map((item) => normalizePaymentStatusOption(item))
      .filter((option): option is PaymentStatusOption => option !== null);

    return normalized.length ? normalized : DEFAULT_PAYMENT_STATUS_OPTIONS;
  } catch (error) {
    console.error('Error fetching payment status options:', error);
    return DEFAULT_PAYMENT_STATUS_OPTIONS;
  }
}
