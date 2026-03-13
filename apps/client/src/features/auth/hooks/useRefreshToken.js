import { axiosPublic } from "@/api/axios";
import { useAuthStore } from "@/store/authStore";

const useRefreshToken = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  const refresh = async () => {
    const response = await axiosPublic.get("/refresh");
    setAuth((prev) => ({ ...prev, accessToken: response.data.accessToken }));
    return response.data.accessToken;
  };

  return refresh;
};

export default useRefreshToken;
