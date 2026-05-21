import PublicHeader from "@/components/PublicHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";
import { useLocation } from "wouter";

export default function Contact() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader lightBackground />

      <section className="border-b border-border bg-gradient-to-br from-slate-50 to-slate-100 py-24">
        <div className="container">
          <Badge variant="secondary" className="bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary hover:bg-primary/10">
            Contact
          </Badge>
          <h1 className="mt-6 text-4xl font-bold text-foreground md:text-5xl">
            Contact Regenify
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Reach out for partnership inquiries, product information, or platform support. Our team is ready to help.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              className="h-12 rounded-xl bg-primary px-6 text-base font-semibold text-white shadow-brand hover:bg-primary/90"
              onClick={() => navigate("/login")}
            >
              Sign in to connect
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-xl border-white/20 bg-white/5 px-6 text-base font-semibold text-white hover:bg-white/10"
              onClick={() => navigate("/")}
            >
              Back to home
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Mail,
              title: "Email",
              text: "support@regenify.example",
            },
            {
              icon: Phone,
              title: "Telephone",
              text: "+44 20 1234 5678",
            },
            {
              icon: MapPin,
              title: "Office",
              text: "London, United Kingdom",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-[20px] border border-border bg-card p-8 shadow-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-foreground">{item.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container text-center">
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Need a response?</p>
          <h2 className="mt-4 text-3xl font-bold text-foreground">We respond within one business day</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Reach out with your inquiry and our team will provide concise, practical support in a timely manner.
          </p>
        </div>
      </section>
    </div>
  );
}
