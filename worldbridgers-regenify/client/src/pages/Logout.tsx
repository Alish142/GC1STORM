import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Logout() {
  const { logout } = useAuth();

  useEffect(() => {
    let active = true;

    const run = async () => {
      await logout();
      if (!active) return;

      toast.success("Logout successful.");
      window.location.replace("/");
    };

    void run();
    return () => {
      active = false;
    };
  }, [logout]);

  return null;
}
