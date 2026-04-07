import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function Logout() {
  const [, navigate] = useLocation();
  const { logout } = useAuth();
  const [status, setStatus] = useState<"loading" | "done">("loading");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await logout();
      if (cancelled) {
        return;
      }

      setStatus("done");
      toast.success("Logout successful.");
      window.setTimeout(() => {
        if (!cancelled) {
          navigate("/");
        }
      }, 650);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-hero-gradient text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[28px] border border-white/15 bg-white/10 backdrop-blur-xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            {status === "loading" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            )}
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-white/60">Session</p>
            <h1 className="text-2xl font-semibold">
              {status === "loading" ? "Signing you out" : "Signed out"}
            </h1>
          </div>
        </div>

        <p className="text-sm leading-6 text-white/75">
          {status === "loading"
            ? "We’re clearing your session and bringing you back to the landing page."
            : "Your account session has been closed successfully."}
        </p>

        <div className="mt-6 flex gap-3">
          <Button
            className="flex-1 bg-white text-slate-900 hover:bg-white/90"
            onClick={() => navigate("/")}
          >
            Return to landing
          </Button>
          <Button
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
            onClick={() => navigate("/")}
          >
            <LogOut className="h-4 w-4" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
