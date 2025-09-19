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

  if (authInfo?.token) {
    token = authInfo.token;
  } else if (isRequestEvent(eventOrCookies)) {
    supabaseClient = createSupabaseServerClient(eventOrCookies);
    const { data: { session } } = await supabaseClient.auth.getSession();
    token = session?.access_token;
  } else if (isCookies(eventOrCookies)) {
    token = eventOrCookies.get('accessToken') ?? undefined;
  }

  if (!token) {
    throw new Error('No authentication token available');
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
      if (supabaseClient) {
        const { data: { session }, error } = await supabaseClient.auth.refreshSession();

        if (session?.access_token && !error) {
          const retryResponse = await makeRequest(session.access_token);
          if (retryResponse.ok) {
            return retryResponse;
          }
        }
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
  const response = await authenticatedFetch(`${API_BASE_URL}/clients`, { method: 'GET' }, authInfo, event);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Failed to fetch clients: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json().catch(() => null);
  const clients = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
      ? payload
      : [];

  return clients as Client[];
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
