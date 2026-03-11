import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | BB Charge - Power Bank Rental System",
  description: "Sign in to BB Charge - Power Bank Rental System",
};

export default function SignIn() {
  return <SignInForm />;
}
