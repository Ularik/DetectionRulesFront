import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "@/app/styles/globals.css";
import { Providers } from "@/app/providers";
import { cn } from "@/shared/lib/utils";
import { Toaster } from "@/shared/ui/sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CERT-KG SIEM",
  description: "",
  icons: {
    icon: `${process.env.NEXT_BACK_URL}/logo/logo.png`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={cn("h-full", "antialiased", inter.variable, "font-sans", geist.variable)}>
      <body>
        <Toaster/>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
