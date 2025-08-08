"use server";

import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import NavHeader from "~/components/nav-header";
import { Toaster } from "~/components/ui/sonner";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { credits: true, email: true },
  });

  return (
    <div className="from-background via-background to-muted min-h-screen bg-gradient-to-br">
      {/* Background decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="bg-gradient-primary animate-float absolute -top-40 -right-40 h-80 w-80 rounded-full opacity-10 blur-3xl" />
        <div
          className="bg-gradient-accent animate-float absolute -bottom-40 -left-40 h-80 w-80 rounded-full opacity-10 blur-3xl"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <NavHeader credits={user.credits} email={user.email} />

        <main className="animate-fade-scale flex-1">
          <div className="container mx-auto px-4 py-8">{children}</div>
        </main>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--card-foreground)",
            },
          }}
        />
      </div>
    </div>
  );
}
