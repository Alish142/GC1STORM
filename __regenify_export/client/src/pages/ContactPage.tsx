import { useState } from "react";
import { useLocation } from "wouter";
import PublicHeader from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CalendarDays, Leaf } from "lucide-react";

export default function ContactPage() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phoneNumber: "",
    message: "",
  });

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <PublicHeader lightBackground />

      <main className="pt-28">
        <section className="py-20">
          <div className="container">
            <div className="rounded-[42px] border border-[#e6e2d9] bg-[#f3f4f8] p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)] md:p-10">
              <div className="rounded-[34px] border border-[#ece8df] bg-white px-8 py-10 md:px-12 md:py-14">
                <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                  <div className="max-w-[440px]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ebe7de] bg-[#f8f9fb] text-[#111827]">
                      <Leaf className="h-6 w-6" />
                    </div>
                    <h1 className="mt-8 text-4xl font-semibold tracking-[-0.03em] text-[#0f172a] md:text-5xl">
                      Get in Touch
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-[#5f6673]">
                      Share your details and the Worldbridgers Regenify team will follow up with the right conversation for platform access, onboarding, or partnership interest.
                    </p>

                    <div className="mt-16">
                      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#99a0ab]">Company</div>
                      <div className="mt-3 text-xl font-semibold text-[#0f172a]">Worldbridgers Regenify</div>
                    </div>
                  </div>

                  <div className="rounded-[30px] border border-[#f0ece5] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:p-10">
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#212833]">Full Name</label>
                        <Input
                          placeholder="Input"
                          value={form.fullName}
                          onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                          className="h-14 rounded-2xl border-[#ece8df] bg-[#fcfcfb] text-base"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#212833]">Company Name</label>
                        <Input
                          placeholder="Input"
                          value={form.companyName}
                          onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))}
                          className="h-14 rounded-2xl border-[#ece8df] bg-[#fcfcfb] text-base"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#212833]">Email</label>
                        <Input
                          type="email"
                          placeholder="Input"
                          value={form.email}
                          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                          className="h-14 rounded-2xl border-[#ece8df] bg-[#fcfcfb] text-base"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#212833]">Phone Number</label>
                        <Input
                          placeholder="Input"
                          value={form.phoneNumber}
                          onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                          className="h-14 rounded-2xl border-[#ece8df] bg-[#fcfcfb] text-base"
                        />
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      <label className="text-sm font-semibold text-[#212833]">Message</label>
                      <Textarea
                        className="min-h-[190px] rounded-[22px] border-[#ece8df] bg-[#fcfcfb] text-base"
                        placeholder="Input"
                        value={form.message}
                        onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                      />
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button
                        className="h-12 rounded-full px-6 text-sm font-semibold"
                        onClick={() => {
                          toast.success("Contact request saved on the frontend.");
                          setForm({
                            fullName: "",
                            companyName: "",
                            email: "",
                            phoneNumber: "",
                            message: "",
                          });
                        }}
                      >
                        <CalendarDays className="h-4 w-4" />
                        Submit
                      </Button>

                      <Button variant="outline" className="h-12 rounded-full px-6" onClick={() => navigate("/about")}>
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
