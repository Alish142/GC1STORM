import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

type PageMode = "login" | "request-access" | "create-account";

function readPageMode(search: string): PageMode {
  const params = new URLSearchParams(search);
  const mode = params.get("mode");
  if (mode === "request-access" || mode === "create-account") {
    return mode;
  }
  return "login";
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
  const [createForm, setCreateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dateOfBirth: "",
  });

  const finalizeAuth = async (user: { id: number; openId?: string; email: string; name: string; role: string }) => {
    queryClient.setQueryData(["auth", "me"], user);
    localStorage.setItem("regenify-user-info", JSON.stringify(user));
    await queryClient.invalidateQueries({ queryKey: ["auth", "me"], refetchType: "none" });
    void refreshAuth();
    navigate(nextUrl);
  };

  const loginMutation = useMutation({
    mutationFn: ({ email: inputEmail, password: inputPassword }: { email: string; password: string }) =>
      backendApi.demoLogin(inputEmail, inputPassword),
    onSuccess: async (result) => {
      await finalizeAuth(result.user);
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
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === "demo@regenify.com") {
      loginMutation.mutate({ email, password });
      return;
    }

    backendApi
      .loginLocalAccount(email, password)
      .then((result) => finalizeAuth(result.user))
      .catch((err: Error) => {
        setErrors({ general: err.message || "Unable to sign in. Please try again." });
      });
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

  const submitCreateAccount = async (event: React.FormEvent) => {
    event.preventDefault();

    if (
      !createForm.firstName ||
      !createForm.lastName ||
      !createForm.email ||
      !createForm.password ||
      !createForm.dateOfBirth
    ) {
      toast.error("Please complete all account fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) {
      toast.error("Enter a valid email address.");
      return;
    }

    if (createForm.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      const result = await backendApi.registerLocalAccount(createForm);
      toast.success("Account created.");
      await finalizeAuth(result.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to create account.";
      toast.error(message);
    }
  };

  const isBusy = loginMutation.isPending;
  const loginStatsQuery = useQuery({
    queryKey: ["login-left-stats"],
    queryFn: async () => {
      const [issuers, offerings, indices, documents] = await Promise.all([
        backendApi.issuers(new URLSearchParams({ page: "1", page_size: "1" })),
        backendApi.offerings(new URLSearchParams({ page: "1", page_size: "1" })),
        backendApi.indices(new URLSearchParams({ page: "1", page_size: "1" })),
        backendApi.documents(new URLSearchParams({ page: "1", page_size: "1" })),
      ]);

      return [
        { value: `${issuers.total}+`, label: "Verified Issuers" },
        { value: `${offerings.total}+`, label: "Active Offerings" },
        { value: `${indices.total}`, label: "ESG Indices" },
        { value: `${documents.total}+`, label: "Documents" },
      ];
    },
    staleTime: 60_000,
  });
  const loginStats =
    loginStatsQuery.data ??
    [
      { value: "340+", label: "Verified Issuers" },
      { value: "1,280+", label: "Active Offerings" },
      { value: "48", label: "ESG Indices" },
      { value: "5,600+", label: "Documents" },
    ];

  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-[1.02fr_0.98fr]">
        <section className="relative hidden overflow-hidden bg-[linear-gradient(180deg,#091229,#111d3c_58%,#162541)] lg:block">
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(74,222,128,0.12),transparent_26%)]" />
          <div className="relative flex h-full flex-col px-8 py-8 text-white">
            <Link href="/" className="inline-flex items-center gap-3 self-start">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#49a35f] text-white shadow-[0_10px_24px_rgba(73,163,95,0.28)]">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-semibold">Worldbridgers</div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-[#7ee08f]">Regenify</div>
              </div>
            </Link>

            <div className="mt-[94px] max-w-[540px]">
              <h1 className="max-w-[500px] text-[3.28rem] font-semibold leading-[1.08] tracking-[-0.03em]">
                The intelligent platform for{" "}
                <span className="bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent">
                  regenerative finance
                </span>
              </h1>
              <p className="mt-6 max-w-[500px] text-[0.97rem] leading-8 text-white/72">
                Access real-time ESG data, explore relationship graphs, and connect with verified opportunities across global markets.
              </p>
            </div>

            <div className="mt-[56px] w-full max-w-[548px]">
              <div className="grid grid-cols-2 gap-x-3 gap-y-4 text-sm text-white/80">
                {loginStats.map((item) => (
                  <div
                    key={item.label}
                    className="relative min-h-[72px] overflow-hidden rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[0_14px_28px_rgba(4,10,24,0.18)] backdrop-blur-sm"
                  >
                    <div className="relative">
                      <div className="text-[1.9rem] font-semibold leading-none text-white">{item.value}</div>
                      <div className="mt-1.5 text-[0.76rem] text-white/56">{item.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-8">
              <div className="flex flex-wrap gap-2 text-[0.76rem] text-white/50">
                <span>EU Taxonomy Aligned</span>
                <span>·</span>
                <span>SFDR Compliant</span>
                <span>·</span>
                <span>ISO 14001 Certified</span>
              </div>
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
                    className={`rounded-full px-4 py-2 text-sm font-medium ${mode === "login" || mode === "create-account" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"}`}
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
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
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

                <div className="mt-5 text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    className="font-medium text-primary hover:underline"
                    onClick={() => {
                      window.location.href = "/login?mode=create-account";
                    }}
                  >
                    Create account
                  </button>
                </div>
              </div>
            ) : mode === "create-account" ? (
              <div className="px-1 pb-1">
                <div className="mb-8">
                  <div className="text-xs uppercase tracking-[0.26em] text-muted-foreground">Create Account</div>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">Create your account</h1>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Start with a basic account and use your new email and password to log in again.
                  </p>
                </div>

                <form onSubmit={submitCreateAccount} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="create-first-name">First name</Label>
                      <Input
                        id="create-first-name"
                        className="h-12 rounded-2xl"
                        value={createForm.firstName}
                        onChange={(event) =>
                          setCreateForm((current) => ({ ...current, firstName: event.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-last-name">Last name</Label>
                      <Input
                        id="create-last-name"
                        className="h-12 rounded-2xl"
                        value={createForm.lastName}
                        onChange={(event) =>
                          setCreateForm((current) => ({ ...current, lastName: event.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-email">Email</Label>
                    <Input
                      id="create-email"
                      type="email"
                      placeholder="name@company.com"
                      className="h-12 rounded-2xl"
                      value={createForm.email}
                      onChange={(event) =>
                        setCreateForm((current) => ({ ...current, email: event.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-password">Password</Label>
                    <Input
                      id="create-password"
                      type="password"
                      placeholder="Create your password"
                      className="h-12 rounded-2xl"
                      value={createForm.password}
                      onChange={(event) =>
                        setCreateForm((current) => ({ ...current, password: event.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-dob">Date of birth</Label>
                    <Input
                      id="create-dob"
                      type="date"
                      className="h-12 rounded-2xl"
                      value={createForm.dateOfBirth}
                      onChange={(event) =>
                        setCreateForm((current) => ({ ...current, dateOfBirth: event.target.value }))
                      }
                    />
                  </div>

                  <Button type="submit" className="h-12 w-full rounded-2xl bg-primary text-white shadow-brand hover:bg-primary/90">
                    <ArrowRight className="h-4 w-4" />
                    Create account
                  </Button>
                </form>

                <div className="mt-5 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="font-medium text-primary hover:underline"
                    onClick={() => {
                      window.location.href = "/login";
                    }}
                  >
                    Log in
                  </button>
                </div>
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
