import "./globals.css";
import { AppProvider } from "../src/context/AppProvider";
import { ToastContainer } from "../src/components/ui/ToastContainer";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ImageKitProvider } from "@imagekit/next";
import QueryProvider from "../src/context/QueryProvider";

export const metadata = {
  title: "Nexus — Spatial Social Network & AI Workspace",
  description:
    "Next-generation social media ecosystem combining curated feeds, reactive 3D canvas cards, direct messaging, friends graph, and autonomous AI copilot.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[var(--bg-app)] text-[var(--text-main)] font-sans antialiased selection:bg-primary/20 selection:text-primary-hover">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          <QueryProvider>
            <AppProvider>
              <ImageKitProvider urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}>
                {children}
                <ToastContainer />
              </ImageKitProvider>
            </AppProvider>
          </QueryProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}

