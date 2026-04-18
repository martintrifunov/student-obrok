import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import useRefreshToken from "@/features/auth/hooks/useRefreshToken";
import useAuth from "@/features/auth/hooks/useAuth";
import GlobalLoadingProgress from "@/components/ui/GlobalLoadingProgress";

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { auth, persist } = useAuth();

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

    if (!auth?.accessToken && persist) {
      verifyRefreshToken();
    } else {
      setIsLoading(false);
    }

    return () => (isMounted = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
