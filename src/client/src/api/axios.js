import axios from "axios";
const BASE_URL = "http://localhost:3050/api";

export default axios.create({
  baseURL: BASE_URL,
});

export const axiostPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
