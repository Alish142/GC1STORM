import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { backendApi } from "@/lib/backendApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Leaf,
  Loader2,
  LogIn,
  ShieldCheck,
} from "lucide-react";

type PageMode = "login" | "request-access";

function readPageMode(search: string): PageMode {
  const params = new URLSearchParams(search);
  return params.get("mode") === "request-access" ? "request-access" : "login";
}

function readNextUrl(search: string) {
  const params = new URLSearchParams(search);
  return params.get("next") || "/dashboard";
}

export default function Login() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { isAuthenticated, refresh: refreshAuth, loading } = useAuth();
  const mode = readPageMode(window.location.search);
  const nextUrl = readNextUrl(window.location.search);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [requestForm, setRequestForm] = useState({
    name: "",
    organization: "",
    workEmail: "",
  });

  const loginMutation = useMutation({
    mutationFn: ({ email: inputEmail, password: inputPassword }: { email: string; password: string }) =>
      backendApi.demoLogin(inputEmail, inputPassword),
    onSuccess: async (result) => {
      queryClient.setQueryData(["auth", "me"], result.user);
      localStorage.setItem("regenify-user-info", JSON.stringify(result.user));
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"], refetchType: "none" });
      void refreshAuth();
      navigate(nextUrl);
    },
    onError: (err) => {
      setErrors({ general: err.message || "Unable to sign in. Please try again." });
    },
  });

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(nextUrl);
    }
  }, [isAuthenticated, loading, navigate, nextUrl]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("loggedOut") === "1") {
      toast.success("Signed out successfully.");
    }
  }, []);

  const validate = () => {
    const nextErrors: typeof errors = {};
    if (!email) nextErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email address";
    if (!password) nextErrors.password = "Password is required";
    else if (password.length < 4) nextErrors.password = "Password must be at least 4 characters";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setErrors({});
    loginMutation.mutate({ email, password });
  };

  const submitAccessRequest = (event: React.FormEvent) => {
    event.preventDefault();
    if (!requestForm.name || !requestForm.organization || !requestForm.workEmail) {
      toast.error("Please complete the form.");
      return;
    }
    toast.success("Request submitted.");
    setRequestForm({ name: "", organization: "", workEmail: "" });
  };

  const isBusy = loginMutation.isPending;

  return (
    <div className="min-h-screen bg-[#f5f3ee]">
      <div className="grid min-h-screen lg:grid-cols-[1.02fr_0.98fr]">
        <section className="relative hidden overflow-hidden bg-[linear-gradient(180deg,rgba(22,54,43,0.22),rgba(22,54,43,0.36)),url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_24%)]" />
          <div className="relative flex h-full flex-col justify-between p-10 text-white">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-semibold">Worldbridgers</div>
                <div className="text-[11px] uppercase tracking-[0.32em] text-white/75">Regenify</div>
              </div>
            </Link>

            <div className="max-w-xl">
              <div className="rounded-[34px] border border-white/15 bg-white/10 p-8 backdrop-blur-md">
                <h1 className="text-5xl font-semibold leading-[1.04]">
                  Sustainable markets, data intelligence, and relationship discovery.
                </h1>
                <p className="mt-5 text-base leading-8 text-white/78">
                  Access a cleaner workspace for issuers, offerings, indices, documents, and connected market intelligence.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm text-white/80">
              {[
                ["340+", "Issuers"],
                ["1,280+", "Offerings"],
                ["48", "Indices"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur">
                  <div className="text-2xl font-semibold text-white">{value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/60">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-xl rounded-[34px] border border-[#e7e1d6] bg-white p-4 shadow-[0_22px_70px_rgba(25,34,22,0.08)] sm:p-6">
            <div className="mb-8 flex items-center justify-between">
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-brand">
                  <Leaf className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Worldbridgers</div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-primary">Regenify</div>
                </div>
              </Link>

              <div className="rounded-full bg-[#f5f3ee] p-1">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    className={`rounded-full px-4 py-2 text-sm font-medium ${mode === "login" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"}`}
                    onClick={() => {
                      window.location.href = "/login";
                    }}
                  >
                    Log In
                  </button>
                  <button
                    className={`rounded-full px-4 py-2 text-sm font-medium ${mode === "request-access" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"}`}
                    onClick={() => {
                      window.location.href = "/login?mode=request-access";
                    }}
                  >
                    Request Access
                  </button>
                </div>
              </div>
            </div>

            {mode === "login" ? (
              <div className="px-1 pb-1">
                <div className="mb-8">
                  <div className="text-xs uppercase tracking-[0.26em] text-muted-foreground">Account Access</div>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">Welcome back</h1>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    Sign in to continue to your workspace.
                  </p>
                </div>

                {errors.general ? (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.general}</AlertDescription>
                  </Alert>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      disabled={isBusy}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setErrors((current) => ({ ...current, email: undefined }));
                      }}
                      className={`h-12 rounded-2xl ${errors.email ? "border-destructive" : ""}`}
                    />
                    {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button type="button" className="text-xs font-medium text-primary hover:underline">
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        disabled={isBusy}
                        onChange={(event) => {
                          setPassword(event.target.value);
                          setErrors((current) => ({ ...current, password: undefined }));
                        }}
                        className={`h-12 rounded-2xl pr-11 ${errors.password ? "border-destructive" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password ? <p className="text-xs text-destructive">{errors.password}</p> : null}
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-[#f7f5f0] px-4 py-3">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(value) => setRememberMe(Boolean(value))}
                    />
                    <Label htmlFor="remember-me" className="cursor-pointer text-sm text-muted-foreground">
                      Remember me
                    </Label>
                  </div>

                  <Button type="submit" className="h-12 w-full rounded-2xl bg-primary text-white shadow-brand hover:bg-primary/90" disabled={isBusy}>
                    {isBusy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4" />
                        Sign in
                      </>
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="px-1 pb-1">
                <div className="mb-8">
                  <div className="text-xs uppercase tracking-[0.26em] text-muted-foreground">Access Request</div>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">Request access</h1>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    Send your details and our team can review your access request.
                  </p>
                </div>

                <form onSubmit={submitAccessRequest} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="request-name">Full name</Label>
                    <Input
                      id="request-name"
                      className="h-12 rounded-2xl"
                      value={requestForm.name}
                      onChange={(event) => setRequestForm((current) => ({ ...current, name: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="request-organization">Organization</Label>
                    <Input
                      id="request-organization"
                      className="h-12 rounded-2xl"
                      value={requestForm.organization}
                      onChange={(event) => setRequestForm((current) => ({ ...current, organization: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="request-email">Work email</Label>
                    <Input
                      id="request-email"
                      type="email"
                      className="h-12 rounded-2xl"
                      value={requestForm.workEmail}
                      onChange={(event) => setRequestForm((current) => ({ ...current, workEmail: event.target.value }))}
                    />
                  </div>

                  <div className="rounded-3xl border border-[#ebe5db] bg-[#faf8f3] p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div className="text-sm leading-7 text-muted-foreground">
                        Requests are reviewed for onboarding and workspace access.
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="h-12 w-full rounded-2xl bg-primary text-white shadow-brand hover:bg-primary/90">
                    <ArrowRight className="h-4 w-4" />
                    Submit request
                  </Button>
                </form>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
