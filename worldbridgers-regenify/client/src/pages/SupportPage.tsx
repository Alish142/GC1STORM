import { useState } from "react";
import { useLocation } from "wouter";
import PublicHeader from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowRight, Headset, LifeBuoy, Mail, PhoneCall } from "lucide-react";

export default function SupportPage() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "",
    message: "",
  });

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader lightBackground />

      <main className="pt-28">
        <section className="border-b border-border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-20 text-white">
          <div className="container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="max-w-xl">
              <Badge className="bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/15">
                Support
              </Badge>
              <h1 className="mt-5 text-4xl font-bold md:text-5xl">Get help with access, documents, and onboarding</h1>
              <p className="mt-5 text-lg leading-8 text-white/72">
                Reach the Worldbridgers Regenify support flow for dashboard access, document questions, platform guidance, and onboarding support.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  { icon: LifeBuoy, title: "Platform help", text: "Support for navigation, search, table filtering, and graph exploration." },
                  { icon: Mail, title: "Document access", text: "Questions about metadata, issuer-linked records, and support files." },
                  { icon: Headset, title: "Onboarding assistance", text: "Help with account setup, access requests, and workspace entry." },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                        <Icon className="h-5 w-5 text-emerald-300" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{item.title}</div>
                        <div className="mt-1 text-sm leading-6 text-white/68">{item.text}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[30px] border border-border bg-white p-6 text-foreground shadow-card md:p-8">
              <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Support request</div>
              <h2 className="mt-3 text-3xl font-semibold">Contact the support desk</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Send a support request and we&apos;ll route it to the right team area.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Input
                  placeholder="Full name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                />
              </div>

              <Input
                className="mt-4"
                placeholder="Support topic"
                value={form.topic}
                onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))}
              />

              <Textarea
                className="mt-4 min-h-[150px]"
                placeholder="How can we help?"
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              />

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  className="bg-primary text-white hover:bg-primary/90"
                  onClick={() => {
                    toast.success("Support request saved on the frontend.");
                    setForm({ name: "", email: "", topic: "", message: "" });
                  }}
                >
                  Send support request
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => navigate("/login?mode=create-account")}>
                  Request platform access
                </Button>
                <Button variant="ghost" onClick={() => navigate("/contact")}>
                  <PhoneCall className="h-4 w-4" />
                  Request a call
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
