import { err, ok, type Result } from '../domain/result';

const DEFAULT_TIMEOUT_MS = 8000;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024; // 2MB safety limit

function isAbortError(error: unknown): boolean {
  if (error instanceof Error && error.name === 'AbortError') {
    return true;
  }
  if (typeof error === 'object' && error !== null && 'name' in error) {
    return (error as { name: string }).name === 'AbortError';
  }
  return false;
}

function isResponseSizeValid(headers: Headers): boolean {
  const contentLength = headers.get('content-length');
  if (!contentLength) {
    return true;
  }
  return parseInt(contentLength, 10) <= MAX_RESPONSE_BYTES;
}

/**
 * Executes a resilient HTTP fetch request returning a safe typed Result.
 */
export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Result<T, string>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });

    if (!response.ok) {
      return err(`http.error.status_${response.status}`);
    }

    if (!isResponseSizeValid(response.headers)) {
      return err('http.error.response_too_large');
    }

    const data = (await response.json()) as T;
    return ok(data);
  } catch (error) {
    if (isAbortError(error)) {
      return err('http.error.timeout');
    }
    return err('http.error.network_failure');
  } finally {
    clearTimeout(timeoutId);
  }
}
