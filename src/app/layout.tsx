import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "AcctMarket";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: "Nigeria's premier digital accounts marketplace. Buy aged social media accounts, verified profiles, and digital goods instantly with NGN payments.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="bg-white text-gray-900 antialiased font-sans">
        <Providers>
          {children}
          <Toaster position="top-right" toastOptions={{ style: { background: "#fff", color: "#111", border: "1px solid #e5e7eb", borderRadius: "12px" } }} />
        </Providers>
      </body>
    </html>
  );
}
