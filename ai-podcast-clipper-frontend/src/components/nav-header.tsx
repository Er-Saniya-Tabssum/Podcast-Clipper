"use client";

import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "./theme-toggle";

const NavHeader = ({ credits, email }: { credits: number; email: string }) => {
  return (
    <header className="bg-card/80 border-border/50 animate-slide-down sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 py-2">
        {/* Logo */}
        <Link href="/dashboard" className="group flex items-center">
          <div className="relative">
            <div className="font-sans text-xl font-bold tracking-tight transition-all duration-300 group-hover:scale-105">
              <span className="text-gradient">podcast</span>
              <span className="text-muted-foreground/50">/</span>
              <span className="text-foreground">clipper</span>
            </div>
            <div className="bg-gradient-primary absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full"></div>
          </div>
        </Link>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Credits display */}
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className={`hover-lift h-9 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 ${
                credits === 0
                  ? "animate-pulse bg-gradient-to-r from-orange-500 to-red-500"
                  : "bg-gradient-primary"
              }`}
            >
              ⚡ {credits} credits
              {credits === 0 && " ⚠️"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              asChild
              className={`border-primary/20 text-primary hover:bg-primary/10 hover-lift h-9 text-sm font-medium transition-all duration-300 ${
                credits === 0
                  ? "animate-pulse border-orange-500/50 text-orange-500"
                  : ""
              }`}
            >
              <Link href="/dashboard/billing">
                {credits === 0 ? "⚡ Get Credits" : "💳 Buy more"}
              </Link>
            </Button>
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="hover-lift hover:ring-primary/20 relative h-10 w-10 rounded-full ring-2 ring-transparent transition-all duration-300"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-primary font-semibold text-white">
                    {email?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="glass-effect border-border/50 animate-fade-scale w-56"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm leading-none font-medium">Account</p>
                  <p className="text-muted-foreground text-xs leading-none">
                    {email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem
                asChild
                className="hover:bg-primary/10 cursor-pointer transition-colors duration-200"
              >
                <Link href="/dashboard">🏠 Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="hover:bg-primary/10 cursor-pointer transition-colors duration-200"
              >
                <Link href="/dashboard/billing">💳 Billing</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem
                className="text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer transition-colors duration-200"
                onClick={() => signOut({ redirectTo: "/login" })}
              >
                🚪 Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default NavHeader;
