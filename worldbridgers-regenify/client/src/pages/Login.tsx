import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Leaf, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const utils = trpc.useUtils();
  const { refresh: refreshAuth } = useAuth();

  const loginMutation = trpc.auth.demoLogin.useMutation({
    onSuccess: async () => {
      // Refresh auth state to pick up the new session cookie
      await utils.auth.me.invalidate();
      await refreshAuth();
      // Small delay to ensure state is updated before navigation
      setTimeout(() => navigate("/dashboard"), 100);
    },
    onError: (err) => {
      setErrors({ general: err.message || "Invalid credentials. Please try again." });
      setIsLoading(false);
    },
  });

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Enter a valid email address";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 4) newErrors.password = "Password must be at least 4 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});
    loginMutation.mutate({ email, password });
  };

  const handleDemoLogin = () => {
    setEmail("demo@regenify.com");
    setPassword("demo1234");
    setIsLoading(true);
    setErrors({});
    loginMutation.mutate({ email: "demo@regenify.com", password: "demo1234" });
  };

  // Redirect if already logged in
  useEffect(() => {
    const user = localStorage.getItem("manus-runtime-user-info");
    if (user && user !== "null") {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-hero-gradient flex-col justify-between p-12 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 25% 25%, rgba(74,222,128,0.4) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(96,165,250,0.4) 0%, transparent 50%)"
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(100,200,160,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(100,200,160,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-brand">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold">Worldbridgers</div>
            <div className="text-green-400 text-xs font-semibold tracking-widest uppercase">Regenify</div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            The intelligent platform for{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #4ade80, #60a5fa)" }}>
              regenerative finance
            </span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Access real-time ESG data, explore relationship graphs, and connect with verified opportunities across global markets.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "340+", label: "Verified Issuers" },
              { value: "1,280+", label: "Active Offerings" },
              { value: "48", label: "ESG Indices" },
              { value: "5,600+", label: "Documents" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative flex items-center gap-2 text-slate-500 text-xs">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          EU Taxonomy Aligned · SFDR Compliant · ISO 14001 Certified
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">Worldbridgers</div>
              <div className="text-primary text-[10px] font-semibold tracking-widest uppercase">Regenify</div>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground text-sm">
              Sign in to access your dashboard and portfolio.
            </p>
          </div>

          {/* Demo hint */}
          <div className="mb-6 p-3 rounded-xl bg-primary/8 border border-primary/20">
            <p className="text-xs text-primary font-medium mb-2">Demo Access</p>
            <p className="text-xs text-muted-foreground">
              Use <strong>demo@regenify.com</strong> / <strong>demo1234</strong> or click the button below.
            </p>
          </div>

          {errors.general && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
                className={`h-11 ${errors.email ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <button type="button" className="text-xs text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); }}
                  className={`h-11 pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(v) => setRememberMe(!!v)}
              />
              <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                Remember me for 30 days
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold shadow-brand"
              disabled={isLoading || loginMutation.isPending}
            >
              {isLoading || loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground bg-background px-3">
              or
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-11 font-medium"
            onClick={handleDemoLogin}
            disabled={isLoading || loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Leaf className="mr-2 w-4 h-4 text-primary" />
                Continue with Demo Account
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Don't have an account?{" "}
            <button className="text-primary font-medium hover:underline" onClick={() => navigate("/login")}>
              Request Access
            </button>
          </p>

          <p className="text-center text-[10px] text-muted-foreground/60 mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
