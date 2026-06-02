import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardHeader from "@/components/DashboardHeader";
import { backendApi } from "@/lib/backendApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCircle2,
  HelpCircle,
  Leaf,
  Mail,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";

type AccountView = "profile" | "settings" | "support";

const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const ACCOUNT_TABS: {
  key: AccountView;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    key: "profile",
    label: "Profile",
    icon: User,
    description: "Core account details and platform identity.",
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    description: "Preferences for notifications, security, and access.",
  },
  {
    key: "support",
    label: "Support",
    icon: HelpCircle,
    description: "Help channels and onboarding assistance.",
  },
];

type VisualConfig = {
  tableDots: Record<string, string>;
  hoverLineColor: string;
};

type SupportRequestRecord = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  topic: string;
  message: string;
  status: string;
  createdAt: string;
};

type ContactRequestRecord = {
  id: string;
  fullName: string;
  companyName: string | null;
  email: string;
  phoneNumber: string | null;
  message: string;
  status: string;
  createdAt: string;
};

type CallRequestRecord = {
  id: string;
  userId: string | null;
  fullName: string | null;
  email: string | null;
  organisation: string | null;
  preferredTime: string | null;
  notes: string;
  status: string;
  createdAt: string;
};

type ContactRequestRecord = {
  id: string;
  fullName: string;
  companyName: string | null;
  email: string;
  phoneNumber: string | null;
  message: string;
  status: string;
  createdAt: string;
};

const TABLE_DOT_FIELDS = [
  {
    section: "Issuers page",
    description: "Controls the issuer name dot and the WBX label dot in the Issuers table.",
    fields: [
      { key: "issuerName", label: "Issuer name column dot" },
      { key: "wbxLabel", label: "WBX label column dot" },
    ],
  },
  {
    section: "Offerings page",
    description: "Controls the issuer dot and the Type column dot in the Offerings table.",
    fields: [
      { key: "offeringIssuer", label: "Issuer column dot" },
      { key: "offeringType", label: "Type column dot" },
    ],
  },
  {
    section: "Indices page",
    description: "Controls the Type column dot in the Indices table.",
    fields: [
      { key: "indexType", label: "Type column dot" },
    ],
  },
  {
    section: "Documents page",
    description: "Controls the issuer dot and the Type column dot in the Documents table.",
    fields: [
      { key: "documentIssuer", label: "Issuer column dot" },
      { key: "documentType", label: "Type column dot" },
    ],
  },
] as const;

function getView(search: string): AccountView {
  const params = new URLSearchParams(search);
  const raw = params.get("view");
  if (raw === "settings" || raw === "support") {
    return raw;
  }
  return "profile";
}

function formatSubmittedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export default function Account() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [view, setView] = useState<AccountView>(() =>
    getView(typeof window !== "undefined" ? window.location.search : "")
  );
  const [supportEmailForm, setSupportEmailForm] = useState({
    subject: "",
    message: "",
  });
  const [callRequestForm, setCallRequestForm] = useState({
    organisation: "",
    preferredTime: "",
    notes: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [visualDraft, setVisualDraft] = useState<VisualConfig | null>(null);
  const activeTab = ACCOUNT_TABS.find((tab) => tab.key === view) ?? ACCOUNT_TABS[0];
  const isAdmin = user?.role === "admin";

  const contactRequestsQuery = useQuery({
    queryKey: ["admin", "contact-requests"],
    queryFn: () => backendApi.listContactRequests(),
    enabled: isAdmin && view === "support",
    staleTime: 60_000,
  });

  const contactRequestsData = contactRequestsQuery.data as { data: ContactRequestRecord[] } | undefined;
  const supportRequestCount = contactRequestsData?.data.length ?? 0;

  const deleteRequestMutation = useMutation({
    mutationFn: (id: string) => backendApi.deleteContactRequest(id),
    onSuccess: () => {
      toast.success("Request deleted.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "contact-requests"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Could not delete request.");
    },
  });

  const isDemoRequest = (message: string) => /demo|schedule\s+a\s+demo|demo request/i.test(message);

  const visualConfigQuery = useQuery<VisualConfig>({
    queryKey: ["admin", "visual-config"],
    queryFn: () => backendApi.adminVisualConfig(),
    enabled: isAdmin && view === "settings",
    staleTime: 60_000,
  });

  const supportInboxQuery = useQuery<{ data: SupportRequestRecord[] }>({
    queryKey: ["admin", "support-requests"],
    queryFn: () => backendApi.listSupportRequests(),
    enabled: isAdmin && view === "support",
    staleTime: 30_000,
  });

  const contactInboxQuery = useQuery<{ data: ContactRequestRecord[] }>({
    queryKey: ["admin", "contact-requests"],
    queryFn: () => backendApi.listContactRequests(),
    enabled: isAdmin && view === "support",
    staleTime: 30_000,
  });

  const callInboxQuery = useQuery<{ data: CallRequestRecord[] }>({
    queryKey: ["admin", "call-requests"],
    queryFn: () => backendApi.listCallRequests(),
    enabled: isAdmin && view === "support",
    staleTime: 30_000,
  });

  const visualConfigMutation = useMutation({
    mutationFn: (payload: VisualConfig) => backendApi.updateVisualConfig(payload),
    onSuccess: (nextConfig) => {
      setVisualDraft(nextConfig);
      queryClient.setQueryData(["admin", "visual-config"], nextConfig);
      void queryClient.invalidateQueries({ queryKey: ["issuers"] });
      void queryClient.invalidateQueries({ queryKey: ["offerings"] });
      void queryClient.invalidateQueries({ queryKey: ["indices"] });
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
      void queryClient.invalidateQueries({ queryKey: ["graph-view"] });
      toast.success("Visual settings updated.");
    },
    onError: () => {
      toast.error("Could not save visual settings.");
    },
  });

  const supportRequestMutation = useMutation({
    mutationFn: () =>
      backendApi.createSupportRequest({
        fullName: user?.name ?? "",
        email: user?.email ?? "",
        topic: supportEmailForm.subject,
        message: supportEmailForm.message,
      }),
    onSuccess: () => {
      toast.success("Support request sent.");
      setSupportEmailForm({ subject: "", message: "" });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not send support request.");
    },
  });

  const callRequestMutation = useMutation({
    mutationFn: () =>
      backendApi.createCallRequest({
        fullName: user?.name,
        email: user?.email,
        organisation: callRequestForm.organisation,
        preferredTime: callRequestForm.preferredTime,
        notes: callRequestForm.notes,
      }),
    onSuccess: () => {
      toast.success("Call request sent.");
      setCallRequestForm({ organisation: "", preferredTime: "", notes: "" });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not send call request.");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: () => backendApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword),
    onSuccess: () => {
      toast.success("Password updated.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not update password.");
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    setView(getView(window.location.search));
  }, [location]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncView = () => setView(getView(window.location.search));
    window.addEventListener("popstate", syncView);
    return () => window.removeEventListener("popstate", syncView);
  }, []);

  useEffect(() => {
    if (!visualConfigQuery.data) {
      return;
    }
    setVisualDraft(visualConfigQuery.data);
  }, [visualConfigQuery.data]);

  const openView = (nextView: AccountView) => {
    setView(nextView);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", `/dashboard/account?view=${nextView}`);
    }
  };

  const updateHoverLineColor = (value: string) => {
    setVisualDraft((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        hoverLineColor: value,
      };
    });
  };

  const updateTableDotColor = (key: string, value: string) => {
    setVisualDraft((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        tableDots: {
          ...current.tableDots,
          [key]: value,
        },
      };
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />

      <main className="container flex-1 py-6">
        <section className="overflow-hidden rounded-[28px] border border-border bg-card shadow-card">
          <div className="relative overflow-hidden border-b border-border bg-hero-gradient px-6 py-8 text-white md:px-8">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage:
                "radial-gradient(circle at top left, rgba(255,255,255,0.25), transparent 32%), radial-gradient(circle at bottom right, rgba(74,222,128,0.22), transparent 36%)",
            }} />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/75">
                  <Leaf className="h-3.5 w-3.5" />
                  Account Center
                </div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  {user?.name || "Demo User"}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-white/75">
                  {activeTab.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm md:min-w-[320px]">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <div className="text-white/60">Role</div>
                  <div className="mt-1 font-semibold capitalize">{user?.role || "user"}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <div className="text-white/60">Status</div>
                  <div className="mt-1 flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    Active
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-border bg-background/70 px-4 py-3 md:px-6">
            <div className="flex gap-2 overflow-x-auto">
              {ACCOUNT_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.key === view;
                return (
                  <button
                    key={tab.key}
                    onClick={() => openView(tab.key)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-white shadow-brand"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                    {tab.key === "support" && isAdmin && supportRequestCount > 0 ? (
                      <Badge className="rounded-full bg-red-500 px-2 py-1 text-[10px] font-semibold text-white">
                        {supportRequestCount}
                      </Badge>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 p-4 md:grid-cols-[1.35fr_0.9fr] md:p-6">
            <section className="space-y-6">
              {view === "profile" && (
                <>
                  <div className="rounded-3xl border border-border bg-muted/30 p-6">
                    <h2 className="text-lg font-semibold">Profile details</h2>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-card p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Full name</p>
                        <p className="mt-2 text-sm font-medium">{user?.name || "Demo User"}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Email</p>
                        <p className="mt-2 text-sm font-medium">{user?.email || "demo@regenify.com"}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
                        <p className="mt-2 text-sm font-medium">Worldbridgers Regenify</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Permissions</p>
                        <p className="mt-2 text-sm font-medium">Dashboard, graph, documents</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold">Verification and compliance</h2>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                        <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                        Demo identity verified
                      </Badge>
                      <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/10">
                        Taxonomy aligned access
                      </Badge>
                      <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/10">
                        Onboarding complete
                      </Badge>
                    </div>
                  </div>
                </>
              )}

              {view === "settings" && (
                <div className="space-y-4">
                  {[
                    ["Notifications", "Market alerts, index updates, and document availability."],
                    ["Security", "Session protection and verified access enforcement."],
                    ["Workspace preferences", "Saved filters, table settings, and graph defaults."],
                  ].map(([title, description]) => (
                    <div key={title} className="rounded-3xl border border-border bg-card p-6">
                      <h2 className="text-lg font-semibold">{title}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                    </div>
                  ))}

                  {isAdmin ? (
                    <div className="rounded-3xl border border-border bg-card p-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-lg font-semibold">Visual configuration</h2>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Set dashboard table dot colors and the hover-highlight color for graph connection lines.
                          </p>
                        </div>
                        <Button
                          className="bg-primary text-white hover:bg-primary/90"
                          disabled={!visualDraft || visualConfigMutation.isPending}
                          onClick={() => {
                            if (!visualDraft) {
                              return;
                            }
                            visualConfigMutation.mutate(visualDraft);
                          }}
                        >
                          Save colors
                        </Button>
                      </div>

                      {visualConfigQuery.isLoading ? (
                        <div className="mt-6 text-sm text-muted-foreground">Loading visual settings...</div>
                      ) : visualDraft ? (
                        <div className="mt-6 space-y-6">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Table dots
                            </div>
                            <div className="mt-4 space-y-4">
                              {TABLE_DOT_FIELDS.map((group) => (
                                <div key={group.section} className="rounded-2xl border border-border bg-muted/30 p-4">
                                  <div>
                                    <div className="text-sm font-semibold text-foreground">{group.section}</div>
                                    <p className="mt-1 text-xs leading-6 text-muted-foreground">{group.description}</p>
                                  </div>
                                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    {group.fields.map((field) => (
                                      <div key={field.key} className="rounded-2xl border border-border bg-white p-4">
                                        <div className="flex items-center gap-3">
                                          <span
                                            className="h-3.5 w-3.5 rounded-full border border-white shadow-sm"
                                            style={{ backgroundColor: visualDraft.tableDots[field.key] ?? "#94a3b8" }}
                                          />
                                          <div className="text-sm font-medium text-foreground">{field.label}</div>
                                        </div>
                                        <div className="mt-3 flex gap-3">
                                          <Input
                                            type="color"
                                            value={visualDraft.tableDots[field.key] ?? "#94a3b8"}
                                            onChange={(event) => updateTableDotColor(field.key, event.target.value)}
                                            className="h-11 w-16 p-1"
                                          />
                                          <Input
                                            value={visualDraft.tableDots[field.key] ?? ""}
                                            onChange={(event) => updateTableDotColor(field.key, event.target.value)}
                                            placeholder="#22c55e"
                                            className="font-mono"
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-border bg-muted/30 p-4">
                            <div className="flex items-center gap-3">
                              <span
                                className="h-1.5 w-12 rounded-full"
                                style={{ backgroundColor: visualDraft.hoverLineColor || "#111111" }}
                              />
                              <div className="text-sm font-medium text-foreground">Hovered graph connection line</div>
                            </div>
                            <div className="mt-3 flex gap-3">
                              <Input
                                type="color"
                                value={visualDraft.hoverLineColor || "#111111"}
                                onChange={(event) => updateHoverLineColor(event.target.value)}
                                className="h-11 w-16 p-1"
                              />
                              <Input
                                value={visualDraft.hoverLineColor || ""}
                                onChange={(event) => updateHoverLineColor(event.target.value)}
                                placeholder="#111111"
                                className="font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-6 text-sm text-muted-foreground">
                          No visual settings available yet.
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="rounded-3xl border border-border bg-card p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-lg font-semibold">Change password</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Update your account password while staying signed in.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <Input
                          type="password"
                          placeholder="Current password"
                          value={passwordForm.currentPassword}
                          onChange={(event) =>
                            setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <Input
                          type="password"
                          placeholder="New password"
                          value={passwordForm.newPassword}
                          onChange={(event) =>
                            setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          value={passwordForm.confirmPassword}
                          onChange={(event) =>
                            setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-muted-foreground">
                        Passwords must be 8+ characters with uppercase, lowercase, number, and special character.
                      </p>
                      <Button
                        className="bg-primary text-white hover:bg-primary/90"
                        disabled={
                          changePasswordMutation.isPending ||
                          !passwordForm.currentPassword ||
                          !passwordForm.newPassword ||
                          !STRONG_PASSWORD_PATTERN.test(passwordForm.newPassword) ||
                          passwordForm.newPassword !== passwordForm.confirmPassword
                        }
                        onClick={() => {
                          if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                            toast.error("New password confirmation does not match.");
                            return;
                          }
                          changePasswordMutation.mutate();
                        }}
                      >
                        {changePasswordMutation.isPending ? "Updating..." : "Save password"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {view === "support" && (
                <div className="space-y-4">
                  {isAdmin ? (
                    <>
                      <div className="rounded-3xl border border-border bg-card p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h2 className="text-lg font-semibold">Incoming support inbox</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Review the support, contact, and call requests submitted through the platform.
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => {
                              void supportInboxQuery.refetch();
                              void contactInboxQuery.refetch();
                              void callInboxQuery.refetch();
                            }}
                          >
                            Refresh inbox
                          </Button>
                        </div>

                        <div className="mt-5 grid gap-3 md:grid-cols-3">
                          <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3">
                            <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Support</div>
                            <div className="mt-2 text-2xl font-semibold text-foreground">
                              {supportInboxQuery.data?.data.length ?? 0}
                            </div>
                          </div>
                          <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3">
                            <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Contact</div>
                            <div className="mt-2 text-2xl font-semibold text-foreground">
                              {contactInboxQuery.data?.data.length ?? 0}
                            </div>
                          </div>
                          <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3">
                            <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Call requests</div>
                            <div className="mt-2 text-2xl font-semibold text-foreground">
                              {callInboxQuery.data?.data.length ?? 0}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-border bg-card p-6">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h2 className="text-lg font-semibold">Support requests</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Messages sent from the protected support form.
                            </p>
                          </div>
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                            {supportInboxQuery.data?.data.length ?? 0} total
                          </Badge>
                        </div>
                        <div className="mt-5 space-y-3">
                          {supportInboxQuery.isLoading ? (
                            <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
                              Loading support requests...
                            </div>
                          ) : supportInboxQuery.data?.data.length ? (
                            supportInboxQuery.data.data.map((request) => (
                              <div key={request.id} className="rounded-2xl border border-border bg-muted/20 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div>
                                    <div className="text-sm font-semibold text-foreground">{request.topic}</div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                      {request.fullName} · {request.email}
                                      {request.phoneNumber ? ` · ${request.phoneNumber}` : ""}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{request.status}</Badge>
                                    <span className="text-xs text-muted-foreground">{formatSubmittedAt(request.createdAt)}</span>
                                  </div>
                                </div>
                                <p className="mt-3 text-sm leading-6 text-foreground/85">{request.message}</p>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
                              No support requests have been submitted yet.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-3xl border border-border bg-card p-6">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h2 className="text-lg font-semibold">Contact requests</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Enquiries submitted from the public contact form.
                            </p>
                          </div>
                          <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/10">
                            {contactInboxQuery.data?.data.length ?? 0} total
                          </Badge>
                        </div>
                        <div className="mt-5 space-y-3">
                          {contactInboxQuery.isLoading ? (
                            <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
                              Loading contact requests...
                            </div>
                          ) : contactInboxQuery.data?.data.length ? (
                            contactInboxQuery.data.data.map((request) => (
                              <div key={request.id} className="rounded-2xl border border-border bg-muted/20 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div>
                                    <div className="text-sm font-semibold text-foreground">{request.fullName}</div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                      {request.email}
                                      {request.companyName ? ` · ${request.companyName}` : ""}
                                      {request.phoneNumber ? ` · ${request.phoneNumber}` : ""}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{request.status}</Badge>
                                    <span className="text-xs text-muted-foreground">{formatSubmittedAt(request.createdAt)}</span>
                                  </div>
                                </div>
                                <p className="mt-3 text-sm leading-6 text-foreground/85">{request.message}</p>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
                              No contact requests have been submitted yet.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-3xl border border-border bg-card p-6">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h2 className="text-lg font-semibold">Call requests</h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Follow-up calls requested through the authenticated workspace.
                            </p>
                          </div>
                          <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/10">
                            {callInboxQuery.data?.data.length ?? 0} total
                          </Badge>
                        </div>
                        <div className="mt-5 space-y-3">
                          {callInboxQuery.isLoading ? (
                            <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
                              Loading call requests...
                            </div>
                          ) : callInboxQuery.data?.data.length ? (
                            callInboxQuery.data.data.map((request) => (
                              <div key={request.id} className="rounded-2xl border border-border bg-muted/20 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div>
                                    <div className="text-sm font-semibold text-foreground">
                                      {request.fullName ?? "Workspace user"}
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                      {request.email ?? "No email provided"}
                                      {request.organisation ? ` · ${request.organisation}` : ""}
                                      {request.preferredTime ? ` · ${request.preferredTime}` : ""}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{request.status}</Badge>
                                    <span className="text-xs text-muted-foreground">{formatSubmittedAt(request.createdAt)}</span>
                                  </div>
                                </div>
                                <p className="mt-3 text-sm leading-6 text-foreground/85">{request.notes}</p>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
                              No call requests have been submitted yet.
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-3xl border border-border bg-card p-6">
                        <h2 className="text-lg font-semibold">Email support</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Send a support request about platform access, documents, onboarding, or data questions.
                        </p>
                        <div className="mt-5 space-y-4">
                          <Input
                            placeholder="Support subject"
                            value={supportEmailForm.subject}
                            onChange={(event) => setSupportEmailForm((current) => ({ ...current, subject: event.target.value }))}
                          />
                          <Textarea
                            className="min-h-[140px]"
                            placeholder="Describe the issue or request"
                            value={supportEmailForm.message}
                            onChange={(event) => setSupportEmailForm((current) => ({ ...current, message: event.target.value }))}
                          />
                          <Button
                            className="bg-primary text-white hover:bg-primary/90"
                            disabled={supportRequestMutation.isPending}
                            onClick={() => supportRequestMutation.mutate()}
                          >
                            {supportRequestMutation.isPending ? "Sending..." : "Email support"}
                          </Button>
                        </div>
                      </div>

                  <div className="rounded-3xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold">Request call</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Ask for a follow-up call about structuring offerings, investor workflows, or platform guidance.
                    </p>
                    <div className="mt-5 space-y-4">
                      <Input
                        placeholder="Organisation"
                        value={callRequestForm.organisation}
                        onChange={(event) => setCallRequestForm((current) => ({ ...current, organisation: event.target.value }))}
                      />
                      <Input
                        placeholder="Preferred time or timezone"
                        value={callRequestForm.preferredTime}
                        onChange={(event) => setCallRequestForm((current) => ({ ...current, preferredTime: event.target.value }))}
                      />
                      <Textarea
                        className="min-h-[140px]"
                        placeholder="What would you like to discuss?"
                        value={callRequestForm.notes}
                        onChange={(event) => setCallRequestForm((current) => ({ ...current, notes: event.target.value }))}
                      />
                      <Button
                        variant="outline"
                        disabled={callRequestMutation.isPending}
                        onClick={() => callRequestMutation.mutate()}
                      >
                        {callRequestMutation.isPending ? "Sending..." : "Request call"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <aside className="space-y-4">
              <div className="rounded-3xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold">Quick actions</h2>
                <div className="mt-4 space-y-3">
                  <Button className="w-full justify-start bg-primary text-white hover:bg-primary/90" onClick={() => navigate("/dashboard/graph")}>
                    <Leaf className="h-4 w-4" />
                    Open relationship graph
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/dashboard/documents")}>
                    <Mail className="h-4 w-4" />
                    Review documents
                  </Button>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-muted/30 p-6">
                <h2 className="text-lg font-semibold">Workspace health</h2>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-3">
                    <span className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      {view === "support" && isAdmin ? "Inbox items" : "Alerts"}
                    </span>
                    <span className="font-medium text-foreground">
                      {view === "support" && isAdmin
                        ? (supportInboxQuery.data?.data.length ?? 0) +
                          (contactInboxQuery.data?.data.length ?? 0) +
                          (callInboxQuery.data?.data.length ?? 0)
                        : "3 active"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-3">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Security
                    </span>
                    <span className="font-medium text-foreground">Healthy</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
