/** Backend origin for static assets (e.g. /uploads) when API is on another host. */
export function getApiOrigin(): string {
  const apiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (!apiUrl || !/^https?:\/\//i.test(apiUrl)) return '';

  try {
    return new URL(apiUrl).origin;
  } catch {
    return '';
  }
}
