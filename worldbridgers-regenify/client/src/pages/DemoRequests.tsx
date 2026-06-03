import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardHeader from "@/components/DashboardHeader";
import { backendApi } from "@/lib/backendApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

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

export default function DemoRequests() {
  const queryClient = useQueryClient();

  const listQ = useQuery({
    queryKey: ["admin", "contact-requests"],
    queryFn: () => backendApi.listContactRequests(),
    staleTime: 10_000,
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => backendApi.deleteContactRequest(id),
    onSuccess: () => {
      toast.success("Request deleted.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "contact-requests"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not delete request."),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      backendApi.updateContactRequestStatus(id, status),
    onSuccess: () => {
      toast.success("Request status updated.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "contact-requests"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not update request."),
  });

  const requests: ContactRequestRecord[] = (listQ.data as { data: ContactRequestRecord[] } | undefined)?.data ?? [];
  const unreadCount = requests.filter((r) => r.status !== "read").length;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container py-8">
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <section className="space-y-4">
            <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">Admin dashboard</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Demo Requests</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Review guest demo scheduling requests and contact inquiries in one place. Mark requests as read, respond offline, or remove outdated entries.
                  </p>
                </div>
                <div className="rounded-3xl border border-border bg-white/90 p-4 text-right shadow-sm">
                  <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Pending review</div>
                  <div className="mt-2 text-3xl font-semibold text-foreground">{unreadCount}</div>
                  <div className="mt-1 text-sm text-muted-foreground">Unread requests</div>
                </div>
              </div>
            </div>

            <Card className="overflow-hidden border border-border bg-card shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-100">
                      <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listQ.isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                          Loading requests...
                        </TableCell>
                      </TableRow>
                    ) : requests.length ? (
                      requests.map((req, idx) => {
                        const isUnread = req.status !== "read";
                        const rowBg = idx % 2 === 0 ? "bg-white" : "bg-slate-50";
                        const statusClasses = req.status === "read"
                          ? "bg-muted text-muted-foreground"
                          : req.status === "handled"
                          ? "bg-blue-100 text-blue-800"
                          : req.status === "closed"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-emerald-100 text-emerald-800"; // new/unread

                        return (
                          <TableRow key={req.id} className={`${rowBg} ${isUnread ? "ring-1 ring-emerald-50" : ""}`}>
                            <TableCell className="font-semibold text-foreground flex items-center gap-3">
                              {isUnread ? <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> : <span className="inline-block h-2 w-2 rounded-full bg-transparent" />}
                              <span>{req.fullName}</span>
                            </TableCell>
                            <TableCell className="space-y-1 text-sm text-muted-foreground">
                              <div>{req.companyName || "Guest"}</div>
                              <div>{req.email}</div>
                              {req.phoneNumber ? <div>{req.phoneNumber}</div> : null}
                              <div className="mt-2 text-sm text-foreground">{req.message}</div>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusClasses}>
                                {req.status === "read" ? "Read" : req.status === "handled" ? "Handled" : req.status === "closed" ? "Closed" : "New"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(req.createdAt).toLocaleString()}
                            </TableCell>
                            <TableCell className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => statusMutation.mutate({ id: req.id, status: req.status === "read" ? "unread" : "read" })}
                              >
                                {req.status === "read" ? "Mark unread" : "Mark read"}
                              </Button>
                              <Button
                                variant="ghost"
                                className="text-destructive"
                                size="sm"
                                onClick={() => {
                                  if (!confirm("Delete this request? This action cannot be undone.")) return;
                                  deleteMutation.mutate(req.id);
                                }}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                          No demo or guest contact requests found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <div className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">Request insights</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                The list updates in near real time and keeps unread items visible for quick follow-up.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between rounded-3xl border border-border bg-white/90 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Total requests</p>
                    <p className="mt-1 text-xl font-semibold text-foreground">{requests.length}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-3xl border border-border bg-white/90 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Unread</p>
                    <p className="mt-1 text-xl font-semibold text-foreground">{unreadCount}</p>
                  </div>
                </div>
                <div className="rounded-3xl border border-border bg-white/90 p-4 text-sm text-muted-foreground">
                  New demo requests and contact messages will appear automatically. Use the status controls to keep the inbox tidy.
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
