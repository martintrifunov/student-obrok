import { useAuthStore } from "@/store/authStore";

const useAuth = () => {
  const auth = useAuthStore((state) => state.auth);
  const setAuth = useAuthStore((state) => state.setAuth);
  const persist = useAuthStore((state) => state.persist);
  const setPersist = useAuthStore((state) => state.setPersist);

  return { auth, setAuth, persist, setPersist };
};

export default useAuth;
