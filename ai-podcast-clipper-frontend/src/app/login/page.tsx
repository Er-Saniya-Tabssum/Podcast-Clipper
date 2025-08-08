"use server";

import { redirect } from "next/navigation";
import { LoginForm } from "~/components/login-form";
import { auth } from "~/server/auth";
import { ThemeToggle } from "~/components/theme-toggle";

export default async function Page() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="from-background via-background to-muted flex min-h-screen items-center justify-center bg-gradient-to-br p-6">
      {/* Theme toggle in top right */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Background decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="bg-gradient-primary animate-float absolute -top-40 -right-40 h-80 w-80 rounded-full opacity-20 blur-3xl" />
        <div
          className="bg-gradient-accent animate-float absolute -bottom-40 -left-40 h-80 w-80 rounded-full opacity-20 blur-3xl"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="animate-fade-scale w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
