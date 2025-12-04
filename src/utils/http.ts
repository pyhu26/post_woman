import type { Request, RequestResponse, KeyValue } from '@/types';

export async function sendRequest(request: Request): Promise<RequestResponse> {
  const startTime = performance.now();

  // Build URL with query params
  const url = new URL(request.url);
  request.params
    .filter((p) => p.enabled && p.key)
    .forEach((p) => url.searchParams.append(p.key, p.value));

  // Build headers
  const headers: Record<string, string> = {};
  request.headers
    .filter((h) => h.enabled && h.key)
    .forEach((h) => {
      headers[h.key] = h.value;
    });

  // Build fetch options
  const options: RequestInit = {
    method: request.method,
    headers,
  };

  // Add body for methods that support it
  if (['POST', 'PUT', 'PATCH'].includes(request.method) && request.body) {
    options.body = request.body;
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  }

  try {
    const response = await fetch(url.toString(), options);
    const endTime = performance.now();

    // Get response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Get response body
    let body = '';
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const json = await response.json();
      body = JSON.stringify(json, null, 2);
    } else {
      body = await response.text();
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body,
      time: Math.round(endTime - startTime),
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      status: 0,
      statusText: 'Error',
      headers: {},
      body: error instanceof Error ? error.message : 'Unknown error occurred',
      time: Math.round(endTime - startTime),
    };
  }
}

export function createKeyValue(key = '', value = '', enabled = true): KeyValue {
  return {
    id: crypto.randomUUID(),
    key,
    value,
    enabled,
  };
}
