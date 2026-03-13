import { axiosPublic } from "@/api/axios";
import { useAuthStore } from "@/store/authStore";

const useLogout = () => {
  const logoutAction = useAuthStore((state) => state.logout);

  const logout = async () => {
    logoutAction();
    try {
      await axiosPublic.get("/logout");
    } catch (err) {
      console.error(err);
    }
  };

  return logout;
};

export default useLogout;
