/**
 * Authentication Server Actions
 * ============================
 *
 * Handles user registration and Stripe customer creation.
 * Provides secure server-side authentication logic with validation.
 *
 * Features:
 * - User signup with email/password validation
 * - Secure password hashing
 * - Automatic Stripe customer creation
 * - Initial credit allocation for new users
 * - Duplicate email prevention
 *
 * Author: Deepak Singhal
 */

"use server";

import { hashPassword } from "~/lib/auth";
import { signupSchema, type SignupFormValues } from "~/schemas/auth";
import { db } from "~/server/db";
import Stripe from "stripe";
import { env } from "~/env";

type SignupResult = {
  success: boolean;
  error?: string;
};

export async function signUp(data: SignupFormValues): Promise<SignupResult> {
  // Validate input data against schema
  const validationResult = signupSchema.safeParse(data);
  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { email, password } = validationResult.data;

  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });

    if (existingUser) {
      return {
        success: false,
        error: "Email already in use",
      };
    }

    const hashedPassword = await hashPassword(password);

    const stripe = new Stripe(env.STRIPE_SECRET_KEY);

    const stripeCustomer = await stripe.customers.create({
      email: email.toLowerCase(),
    });

    await db.user.create({
      data: {
        email,
        password: hashedPassword,
        stripeCustomerId: stripeCustomer.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Stripe")) {
        return {
          success: false,
          error: "Payment system configuration error. Please try again later.",
        };
      }
      if (
        error.message.includes("database") ||
        error.message.includes("connect")
      ) {
        return {
          success: false,
          error: "Database connection error. Please try again later.",
        };
      }
    }

    return {
      success: false,
      error: "An error occurred during signup. Please try again.",
    };
  }
}
