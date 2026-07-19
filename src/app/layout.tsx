import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ComputerJobs.ir | پلتفرم استخدام فناوری",
    template: "%s | ComputerJobs.ir",
  },
  description:
    "پلتفرم استخدام AI-Native برای مهندسان نرم‌افزار، هوش مصنوعی، DevOps و متخصصان فناوری در ایران.",
  metadataBase: new URL(
    process.env.APP_URL ?? "https://computerjobs.ir",
  ),
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://computerjobs.ir",
    siteName: "ComputerJobs.ir",
    title: "ComputerJobs.ir | پلتفرم استخدام فناوری",
    description:
      "پلتفرم استخدام AI-Native برای مهندسان نرم‌افزار، هوش مصنوعی، DevOps و متخصصان فناوری در ایران.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ComputerJobs.ir",
    description:
      "پلتفرم استخدام AI-Native برای متخصصان فناوری در ایران.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
