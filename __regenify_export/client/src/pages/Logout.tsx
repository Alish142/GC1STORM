import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function Logout() {
  const { logout } = useAuth();

  useEffect(() => {
    const run = async () => {
      void logout();
      toast.success("Logout successful.");
      window.location.replace("/");
    };

    void run();
  }, [logout]);

  return null;
}
