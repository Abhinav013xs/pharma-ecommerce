import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { BRAND_CONFIG } from "../utils/brandConfig";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND_CONFIG.name} | Trusted Healthcare Delivered`,
    template: `%s | ${BRAND_CONFIG.name}`
  },
  description: `${BRAND_CONFIG.slogan}. Order prescription drugs, OTC medicines, health supplements, and medical devices. Secure delivery and verified pharmacists.`,
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: `${BRAND_CONFIG.name} | Premium Online Pharmacy`,
    description: `${BRAND_CONFIG.slogan}. HIPAA compliant medical verification.`,
    url: "/",
    siteName: BRAND_CONFIG.name,
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_CONFIG.name} | E-Commerce Healthcare`,
    description: BRAND_CONFIG.slogan
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-light text-dark selection:bg-primary/20 selection:text-primary-hover">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            {/* Margins to push down content below the fixed navbar */}
            <main className="flex-grow pt-24 pb-12">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
