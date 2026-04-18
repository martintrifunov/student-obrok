import { fetchPublic } from "@/api/fetch";
import { useAuthStore } from "@/store/authStore";

const useLogout = () => {
  const logoutAction = useAuthStore((state) => state.logout);

  const logout = async () => {
    logoutAction();
    try {
      await fetchPublic("/logout");
    } catch (err) {
      console.error(err);
    }
  };

  return logout;
};

export default useLogout;
