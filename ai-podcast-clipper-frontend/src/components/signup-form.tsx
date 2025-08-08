"use client";

import { cn } from "~/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import { signupSchema, type SignupFormValues } from "~/schemas/auth";
import { signUp } from "~/actions/auth";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const result = await signUp(data);
      if (!result.success) {
        setError(result.error ?? "An error occured during signup");
        return;
      }

      const signUpResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      console.log("Sign in result:", signUpResult);

      if (signUpResult?.error) {
        setError(
          "Account created successfully but couldn't sign in automatically. Please try signing in manually.",
        );
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setError("An unexpected error occured");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Logo/Header */}
      <div className="animate-slide-down space-y-2 text-center">
        <div className="mx-auto mb-4">
          <h1 className="text-gradient text-3xl font-bold">podcast/clipper</h1>
        </div>
        <h2 className="text-foreground text-2xl font-bold">
          Join the Revolution! 🎉
        </h2>
        <p className="text-muted-foreground">
          Create your account and start making viral clips today
        </p>
      </div>

      <Card className="glass-effect border-border/20 hover:border-primary/30 hover-lift border-2 transition-all duration-300">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-xl font-semibold">
            ✨ Create Account
          </CardTitle>
          <CardDescription className="text-base">
            Join thousands of creators already making amazing content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                📧 Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 h-12 transition-all duration-300"
                required
                {...register("email")}
              />
              {errors.email && (
                <p className="text-destructive flex items-center gap-1 text-sm">
                  ❌ {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                🔑 Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 h-12 transition-all duration-300"
                required
                {...register("password")}
              />
              {errors.password && (
                <p className="text-destructive flex items-center gap-1 text-sm">
                  ❌ {errors.password.message}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border-destructive/20 animate-fade-scale rounded-lg border p-4">
                <p className="text-destructive flex items-center gap-2 text-sm">
                  ⚠️ {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="bg-gradient-primary hover-lift h-12 w-full text-base font-semibold text-white shadow-lg hover:opacity-90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account...
                </>
              ) : (
                <>🎯 Create Account</>
              )}
            </Button>

            {/* Login Link */}
            <div className="border-border/30 border-t pt-4 text-center">
              <p className="text-muted-foreground text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors duration-200 hover:underline"
                >
                  Sign in here 🔐
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
