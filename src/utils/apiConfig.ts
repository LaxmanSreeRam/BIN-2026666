/**
 * API configuration and utility helpers for multi-environment deployments.
 * Handles both full-stack environments (AI Studio dev/preview) and static hosts (GitHub Pages / verdetech.systems).
 */

export function getApiBaseUrl(): string {
  // If explicitly configured via Vite env variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return (import.meta.env.VITE_API_BASE_URL as string).replace(/\/+$/, '');
  }
  return '';
}

export function getApiUrl(endpoint: string): string {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return base ? `${base}${cleanEndpoint}` : cleanEndpoint;
}

export function isStaticHost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host.endsWith('github.io') || host === 'verdetech.systems';
}
