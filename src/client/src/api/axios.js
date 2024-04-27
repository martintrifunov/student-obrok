import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_API_URL;

export default axios.create({
  baseURL: BASE_URL,
});

export const axiostPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
