import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
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
  Building2,
  Eye,
  EyeOff,
  Leaf,
  Loader2,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
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
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { isAuthenticated, refresh: refreshAuth, loading } = useAuth();

  const mode = useMemo(() => readPageMode(window.location.search), [location]);
  const nextUrl = useMemo(() => readNextUrl(window.location.search), [location]);
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
      localStorage.setItem("manus-runtime-user-info", JSON.stringify(result.user));
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"], refetchType: "none" });
      void refreshAuth();
      toast.success("Signed in successfully.");
      navigate(nextUrl);
    },
    onError: (err) => {
      setErrors({ general: err.message || "Invalid credentials. Please try again." });
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
      toast.success("You’ve been signed out.");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setErrors({});
    loginMutation.mutate({ email, password });
  };

  const handleDemoLogin = () => {
    setEmail("demo@regenify.com");
    setPassword("demo1234");
    setErrors({});
    loginMutation.mutate({ email: "demo@regenify.com", password: "demo1234" });
  };

  const submitAccessRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.name || !requestForm.organization || !requestForm.workEmail) {
      toast.error("Please complete the access request form.");
      return;
    }

    toast.success("Access request captured. A specialist can follow up from this information.");
    navigate("/login");
  };

  const isBusy = loginMutation.isPending;

  return (
    <div className="min-h-screen bg-[#f4f7f2]">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden bg-hero-gradient px-6 py-10 text-white lg:px-12 lg:py-12">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }} />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 shadow-brand">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-semibold">Worldbridgers</div>
                <div className="text-xs uppercase tracking-[0.35em] text-emerald-300">Regenify</div>
              </div>
            </div>

            <div className="py-14 lg:max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.24em] text-white/75">
                <Sparkles className="h-3.5 w-3.5" />
                Standardized Access Experience
              </div>
              <h1 className="max-w-2xl text-4xl font-semibold leading-tight md:text-5xl">
                One clean entry point for market intelligence, compliant access, and user workflows.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/72">
                Sign in with the demo credentials, request access for a new workspace, and move
                straight into the dashboard without broken navigation or placeholder actions.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Functional menus", description: "Public and dashboard navigation now route to real destinations." },
                  { label: "Standard auth flow", description: "Dedicated login and logout pages with clear redirects." },
                  { label: "Polished UI", description: "A more consistent visual system across public and authenticated screens." },
                  { label: "Request capture", description: "A usable request-access form for onboarding handoff." },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="mt-2 text-sm leading-6 text-white/68">{item.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 text-sm text-white/70 sm:grid-cols-3">
              {[
                ["Verified issuers", "340+"],
                ["Live offerings", "1,280+"],
                ["Indexed documents", "5,600+"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                  <div className="text-2xl font-semibold text-white">{value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em]">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 lg:px-10">
          <div className="w-full max-w-xl rounded-[32px] border border-border bg-white p-4 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-6">
            <div className="rounded-[28px] bg-muted/35 p-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`rounded-[20px] px-4 py-3 text-sm font-medium transition-colors ${
                    mode === "login" ? "bg-white text-foreground shadow-card" : "text-muted-foreground"
                  }`}
                  onClick={() => navigate("/login")}
                >
                  <span className="inline-flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Log In
                  </span>
                </button>
                <button
                  className={`rounded-[20px] px-4 py-3 text-sm font-medium transition-colors ${
                    mode === "request-access" ? "bg-white text-foreground shadow-card" : "text-muted-foreground"
                  }`}
                  onClick={() => navigate("/login?mode=request-access")}
                >
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Request Access
                  </span>
                </button>
              </div>
            </div>

            {mode === "login" ? (
              <div className="px-2 pb-2 pt-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-semibold tracking-tight text-foreground">Welcome back</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Sign in to continue to your dashboard, saved filters, and relationship graph workspace.
                  </p>
                </div>

                <div className="mb-6 rounded-3xl border border-primary/15 bg-primary/[0.06] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Demo Access</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Use <strong>demo@regenify.com</strong> and <strong>demo1234</strong>, or launch the demo account directly.
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
                      value={email}
                      placeholder="you@example.com"
                      disabled={isBusy}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((current) => ({ ...current, email: undefined }));
                      }}
                      className={`h-12 rounded-2xl ${errors.email ? "border-destructive" : ""}`}
                    />
                    {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button
                        type="button"
                        className="text-xs font-medium text-primary hover:underline"
                        onClick={() => toast.message("Forgot password flow is not configured in this demo app yet.")}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        placeholder="Enter your password"
                        disabled={isBusy}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrors((current) => ({ ...current, password: undefined }));
                        }}
                        className={`h-12 rounded-2xl pr-11 ${errors.password ? "border-destructive" : ""}`}
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword((current) => !current)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password ? <p className="text-xs text-destructive">{errors.password}</p> : null}
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-muted/35 px-4 py-3">
                    <Checkbox checked={rememberMe} onCheckedChange={(value) => setRememberMe(Boolean(value))} id="remember-me" />
                    <Label htmlFor="remember-me" className="cursor-pointer text-sm text-muted-foreground">
                      Remember me for 30 days
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
                        Sign in
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="my-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <Button variant="outline" className="h-12 w-full rounded-2xl" onClick={handleDemoLogin} disabled={isBusy}>
                  {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Leaf className="h-4 w-4 text-primary" />}
                  Continue with Demo Account
                </Button>
              </div>
            ) : (
              <div className="px-2 pb-2 pt-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-semibold tracking-tight text-foreground">Request platform access</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Share your details and intended use case so the onboarding team can route your access correctly.
                  </p>
                </div>

                <form onSubmit={submitAccessRequest} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="request-name">Full name</Label>
                    <Input
                      id="request-name"
                      className="h-12 rounded-2xl"
                      value={requestForm.name}
                      onChange={(e) => setRequestForm((current) => ({ ...current, name: e.target.value }))}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="request-organization">Organization</Label>
                    <Input
                      id="request-organization"
                      className="h-12 rounded-2xl"
                      value={requestForm.organization}
                      onChange={(e) => setRequestForm((current) => ({ ...current, organization: e.target.value }))}
                      placeholder="Company, fund, or institution"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="request-email">Work email</Label>
                    <Input
                      id="request-email"
                      type="email"
                      className="h-12 rounded-2xl"
                      value={requestForm.workEmail}
                      onChange={(e) => setRequestForm((current) => ({ ...current, workEmail: e.target.value }))}
                      placeholder="name@company.com"
                    />
                  </div>

                  <div className="rounded-3xl border border-border bg-muted/35 p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">What happens next?</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          Your request can be reviewed for onboarding, permissions, and workspace setup. This demo keeps the flow local and shows a confirmation state.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="h-12 w-full rounded-2xl bg-primary text-white shadow-brand hover:bg-primary/90">
                    <Mail className="h-4 w-4" />
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
