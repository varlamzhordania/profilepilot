import { auth } from '../lib/firebase';

export async function getAuthHeader(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  if (auth.currentUser) {
    try {
      const idToken = await auth.currentUser.getIdToken();
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }
    } catch (e) {
      console.warn('[apiUtils] Failed to retrieve Firebase ID token:', e);
    }
  }
  return headers;
}

export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; status: number; data: T }> {
  try {
    const authHeaders = await getAuthHeader();

    const customHeaders: Record<string, string> = {
      ...authHeaders,
      ...(options?.headers as Record<string, string> || {}),
    };

    const mergedOptions: RequestInit = {
      ...options,
      headers: customHeaders,
    };

    const res = await fetch(url, mergedOptions);
    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        const data = await res.json();
        return { ok: res.ok, status: res.status, data };
      } catch (jsonErr: any) {
        console.warn(`[safeFetchJson] Failed parsing JSON from ${url}:`, jsonErr);
        return {
          ok: false,
          status: res.status,
          data: {
            error: 'InvalidJson',
            message: 'Server response could not be parsed as JSON.',
          } as unknown as T,
        };
      }
    } else {
      const text = await res.text();
      console.warn(`[safeFetchJson] Expected JSON from ${url}, but got ${contentType || 'non-json'}:`, text.slice(0, 150));
      return {
        ok: false,
        status: res.status,
        data: {
          error: 'NonJsonResponse',
          message: res.ok
            ? 'Server returned non-JSON response.'
            : `Server error (${res.status}). Please try again in a few moments.`,
        } as unknown as T,
      };
    }
  } catch (err: any) {
    console.error(`[safeFetchJson] Network request failed for ${url}:`, err);
    return {
      ok: false,
      status: 0,
      data: {
        error: 'NetworkError',
        message: err?.message || 'Network error occurred. Please check your connection and try again.',
      } as unknown as T,
    };
  }
}
