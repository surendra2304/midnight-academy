const API_URL = import.meta.env['VITE_API_URL'] || "http://localhost:3000";

let inMemoryAccessToken: string | null = null;

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}

export function getAccessToken() {
  return inMemoryAccessToken;
}

export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  
  if (inMemoryAccessToken) {
    headers.set("Authorization", `Bearer ${inMemoryAccessToken}`);
  }

  // Ensure JSON content type if body is present and not form data
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = `${API_URL}${endpoint}`;
  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      // Attempt silent refresh exactly once
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          // Update tokens
          setAccessToken(data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          
          // Retry original request
          headers.set("Authorization", `Bearer ${data.accessToken}`);
          response = await fetch(url, { ...options, headers });
        } else {
          // Refresh failed, clear session
          setAccessToken(null);
          localStorage.removeItem("refreshToken");
        }
      } catch (error) {
        setAccessToken(null);
        localStorage.removeItem("refreshToken");
      }
    } else {
      setAccessToken(null);
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}
