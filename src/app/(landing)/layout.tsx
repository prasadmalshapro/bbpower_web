import { LandingFooter as Footer } from "@/components/landing/LandingFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BBPower",
  description: "Power bank rental",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#030014] overflow-y-scroll overflow-x-hidden flex flex-col">
      {children}
      <Footer />
    </div>
  );
}
