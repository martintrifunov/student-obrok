import axios from "axios";
import { BASE_API_URL } from "./consts";

export const axiosPublic = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
});

export const axiosPrivate = axios.create({
  baseURL: BASE_API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export default axiosPublic;
