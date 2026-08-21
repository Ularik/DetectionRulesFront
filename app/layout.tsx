import type { Metadata } from "next";
import { Montserrat, Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/provider";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Правила обнаружения",
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
    <html className={cn("h-full", "antialiased", montserrat.variable, "font-sans", geist.variable)}>
      <body>
        <Toaster/>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
