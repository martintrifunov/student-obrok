import { fetchPublic } from "@/api/fetch";
import { useAuthStore } from "@/store/authStore";

const useRefreshToken = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  const refresh = async () => {
    const data = await fetchPublic("/refresh");
    setAuth((prev) => ({ ...prev, accessToken: data.accessToken }));
    return data.accessToken;
  };

  return refresh;
};

export default useRefreshToken;
