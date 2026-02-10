import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata = {
  title: "LGPSM — AI-synlighetsplattform for merkevarer",
  description:
    "Overvåk og forbedre merkevarens synlighet i AI-søkemotorer som ChatGPT og Perplexity.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#a78bfa",
          colorBackground: "#0a0a0a",
          colorInputBackground: "#111111",
          colorText: "#ffffff",
          colorTextSecondary: "rgba(255,255,255,0.6)",
        },
        elements: {
          card: { backgroundColor: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)" },
          formButtonPrimary: { backgroundColor: "#7c3aed" },
        },
      }}
    >
      <html lang="no" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var t=localStorage.getItem("lgpsm-theme");if(t==="light")document.documentElement.setAttribute("data-theme","light")}catch(e){}})()`,
            }}
          />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
