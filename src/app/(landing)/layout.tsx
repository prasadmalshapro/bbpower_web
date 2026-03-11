import { Footer } from "@/components/space/main/footer";
import { Navbar } from "@/components/space/main/navbar";
import { StarsCanvas } from "@/components/space/main/star-background";
import { siteConfig } from "@/config/siteConfig";
import type { Metadata } from "next";

export const metadata: Metadata = siteConfig;

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#030014] overflow-y-scroll overflow-x-hidden">
      <StarsCanvas />
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
