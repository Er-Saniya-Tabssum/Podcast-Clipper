"use client";

import type { VariantProps } from "class-variance-authority";
import { ArrowLeftIcon, CheckIcon } from "lucide-react";
import Link from "next/link";
import { createCheckoutSession, type PriceId } from "~/actions/stripe";
import { Button, type buttonVariants } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface PricingPlan {
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: VariantProps<typeof buttonVariants>["variant"];
  isPopular?: boolean;
  savePercentage?: string;
  priceId: PriceId;
}

const plans: PricingPlan[] = [
  {
    title: "Small Pack",
    price: "$9.99",
    description: "Perfect for occasional podcast creators",
    features: ["50 credits", "No expiration", "Download all clips"],
    buttonText: "Buy 50 credits",
    buttonVariant: "outline",
    priceId: "small",
  },
  {
    title: "Medium Pack",
    price: "$24.99",
    description: "Best value for regular podcasters",
    features: ["150 credits", "No expiration", "Download all clips"],
    buttonText: "Buy 150 credits",
    buttonVariant: "default",
    isPopular: true,
    savePercentage: "Save 17%",
    priceId: "medium",
  },
  {
    title: "Large Pack",
    price: "$69.99",
    description: "Ideal for podcast studioes and agencies",
    features: ["500 credits", "No expiration", "Download all clips"],
    buttonText: "Buy 500 credits",
    buttonVariant: "outline",
    isPopular: false,
    savePercentage: "Save 30%",
    priceId: "large",
  },
];

function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <Card
      className={cn(
        "glass-effect hover-lift relative flex flex-col border-2 transition-all duration-300",
        plan.isPopular
          ? "border-primary shadow-primary/20 scale-105 shadow-2xl"
          : "border-border/30 hover:border-primary/30",
      )}
    >
      {plan.isPopular && (
        <div className="bg-gradient-primary animate-pulse-glow absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-full px-6 py-2 text-sm font-bold whitespace-nowrap text-white shadow-lg">
          ⭐ Most Popular
        </div>
      )}

      <CardHeader className="flex-1 space-y-4 text-center">
        <CardTitle className="text-gradient text-xl font-bold">
          {plan.title}
        </CardTitle>
        <div className="space-y-2">
          <div className="text-foreground text-5xl font-bold">{plan.price}</div>
          {plan.savePercentage && (
            <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
              💰 {plan.savePercentage}
            </div>
          )}
        </div>
        <CardDescription className="text-muted-foreground text-base">
          {plan.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-sm">
              <CheckIcon className="text-primary size-5 flex-shrink-0" />
              <span className="text-foreground font-medium">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-6">
        <form
          action={() => createCheckoutSession(plan.priceId)}
          className="w-full"
        >
          <Button
            variant={plan.buttonVariant}
            className={cn(
              "hover-lift h-12 w-full text-base font-semibold shadow-lg transition-all duration-300",
              plan.isPopular
                ? "bg-gradient-primary text-white hover:opacity-90"
                : "border-primary/20 text-primary hover:bg-primary hover:text-white",
            )}
            type="submit"
          >
            🛒 {plan.buttonText}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

export default function BillingPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col space-y-12 px-4 py-8">
      {/* Header */}
      <div className="relative flex items-center justify-center">
        <Button
          className="hover-lift border-primary/20 text-primary hover:bg-primary absolute top-1/2 left-0 -translate-y-1/2 hover:text-white"
          variant="outline"
          size="icon"
          asChild
        >
          <Link href="/dashboard">
            <ArrowLeftIcon className="size-5" />
          </Link>
        </Button>

        <div className="animate-slide-down space-y-4 text-center">
          <h1 className="text-gradient text-4xl font-bold tracking-tight sm:text-5xl">
            💳 Buy Credits
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
            Power up your content creation with AI credits. The more you buy,
            the better the value! 🚀
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="animate-fade-scale grid grid-cols-1 gap-8 md:grid-cols-3">
        {plans.map((plan, index) => (
          <div
            key={plan.title}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <PricingCard plan={plan} />
          </div>
        ))}
      </div>

      {/* How Credits Work */}
      <Card className="glass-effect border-border/30 hover:border-primary/20 hover-lift animate-fade-scale border-2 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-gradient flex items-center gap-2 text-2xl font-bold">
            🎯 How Credits Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-gradient-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                  1
                </div>
                <div>
                  <h4 className="text-foreground font-semibold">
                    Simple Pricing
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    1 credit = 1 minute of podcast processing
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-gradient-accent flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                  2
                </div>
                <div>
                  <h4 className="text-foreground font-semibold">
                    Smart Output
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Get ~1 clip per 5 minutes of content
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-gradient-secondary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                  3
                </div>
                <div>
                  <h4 className="text-foreground font-semibold">
                    Never Expire
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Credits last forever, use anytime
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                  4
                </div>
                <div>
                  <h4 className="text-foreground font-semibold">
                    Scale with Length
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Longer podcasts need more credits
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-accent flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                  5
                </div>
                <div>
                  <h4 className="text-foreground font-semibold">
                    One-Time Purchase
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    No subscriptions, just buy what you need
                  </p>
                </div>
              </div>

              <div className="from-primary/10 to-accent/10 border-primary/20 rounded-lg border bg-gradient-to-r p-4">
                <p className="text-foreground text-sm font-medium">
                  💡 <strong>Pro Tip:</strong> Start with the Medium Pack for
                  the best value!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
