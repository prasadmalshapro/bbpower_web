import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | PowerBB - Power Bank Rental System",
  description: "Sign up for PowerBB - Power Bank Rental System",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
