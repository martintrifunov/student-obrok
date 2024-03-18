import axios from "axios";
import { API_ROOT } from "../../../server/conifg";

export default axios.create({
  baseURL: API_ROOT,
});
