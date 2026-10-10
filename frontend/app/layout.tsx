import "./globals.css";
import { AppProvider } from "../src/context/AppProvider";
import { ToastContainer } from "../src/components/ui/ToastContainer";
import { GoogleOAuthProvider } from "@react-oauth/google";
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
      <body className="bg-[var(--bg-app)] text-[var(--text-main)] font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          <QueryProvider>
            <AppProvider>
              {children}
              <ToastContainer />
            </AppProvider>
          </QueryProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}

