import axios from "axios";
import { BASE_URL } from "./consts";

export default axios.create({
  baseURL: BASE_URL,
});

export const axiostPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});
