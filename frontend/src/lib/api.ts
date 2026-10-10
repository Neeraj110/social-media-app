const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

async function request<T = any>(
  method: string,
  path: string,
  body?: any,
  customHeaders?: Record<string, string>
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('nexus_access_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = path.startsWith('http') ? path : `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await response.text();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('nexus_access_token');
    }
    const errorMsg = data?.detail || data?.message || response.statusText || 'Request failed';
    const error = new Error(errorMsg) as Error & { status: number; data: any };
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return {
    data,
    status: response.status,
    statusText: response.statusText,
  };
}

export const api = {
  get: <T = any>(path: string, headers?: Record<string, string>) =>
    request<T>('GET', path, undefined, headers),
  post: <T = any>(path: string, body?: any, headers?: Record<string, string>) =>
    request<T>('POST', path, body, headers),
  put: <T = any>(path: string, body?: any, headers?: Record<string, string>) =>
    request<T>('PUT', path, body, headers),
  patch: <T = any>(path: string, body?: any, headers?: Record<string, string>) =>
    request<T>('PATCH', path, body, headers),
  delete: <T = any>(path: string, headers?: Record<string, string>) =>
    request<T>('DELETE', path, undefined, headers),
};

export default api;
