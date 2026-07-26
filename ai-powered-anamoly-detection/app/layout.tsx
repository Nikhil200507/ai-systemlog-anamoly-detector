import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Benzene — AI-Powered Behavioral Anomaly Detection System",
  description: "Next-generation zero-signature cybersecurity platform powered by machine learning UEBA. Real-time detection of credential misuse, brute-force attacks, lateral movement, impossible travel, and device spoofing with explainable risk metrics.",
  keywords: ["AI Cybersecurity", "Behavioral Anomaly Detection", "UEBA", "Machine Learning", "Explainable AI", "SHAP", "Concept Drift", "Cyber Threat Intelligence"],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#050507] text-white selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}
