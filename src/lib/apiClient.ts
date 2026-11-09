/** Bounded requests with a single, consistent API error contract. */
export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    signal: options.signal ?? AbortSignal.timeout(15000),
  });
  const body = await response.json();
  if (!response.ok || body.success === false || body.fallback) {
    throw new Error(body.message || body.error || "Database unavailable. Please try again.");
  }
  return body as T;
}
