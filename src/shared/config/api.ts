const RENDER_API_BASE_URL = "https://saasproback.onrender.com/api/v1";
const LOCAL_API_BASE_URL = "http://localhost:3000/api/v1";

function resolveApiBaseUrl() {
  const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configuredApiBaseUrl) {
    return configuredApiBaseUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return LOCAL_API_BASE_URL;
    }
  }

  return RENDER_API_BASE_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();
