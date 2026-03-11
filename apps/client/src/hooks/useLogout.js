import axios from "../api/axios";
import useAuth from "./useAuth";

const useLogout = () => {
  const { setAuth, setPersist } = useAuth();

  const logout = async () => {
    setAuth({});
    setPersist(false);
    localStorage.removeItem("persist");
    try {
      await axios("/logout", {
        withCredentials: true,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return logout;
};

export default useLogout;
