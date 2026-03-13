export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const BASE_API_URL = `${BASE_URL}/api`;
export const OSRM_URL =
  import.meta.env.VITE_OSRM_URL || "http://localhost:5001/route/v1";
export const RELEASE_VERSION =
  import.meta.env.VITE_RELEASE_VERSION || "Dev Build";
