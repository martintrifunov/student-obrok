import React, { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import useRefreshToken from "@/features/auth/hooks/useRefreshToken";
import useAuth from "@/features/auth/hooks/useAuth";
import GlobalLoadingProgress from "@/components/ui/GlobalLoadingProgress";

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { auth, persist } = useAuth();
  const authRef = useRef(auth);
  const persistRef = useRef(persist);

  useEffect(() => {
    authRef.current = auth;
    persistRef.current = persist;
  }, [auth, persist]);

  useEffect(() => {
    let isMounted = true;

    const verifyRefreshToken = async () => {
      try {
        await refresh();
      } catch (err) {
      } finally {
        isMounted && setIsLoading(false);
      }
    };

    if (!authRef.current?.accessToken && persistRef.current) {
      verifyRefreshToken();
    } else {
      setIsLoading(false);
    }

    return () => (isMounted = false);
  }, [refresh]);

  return (
    <>
      {!persist ? (
        <Outlet />
      ) : isLoading ? (
        <GlobalLoadingProgress />
      ) : (
        <Outlet />
      )}
    </>
  );
};

export default PersistLogin;
