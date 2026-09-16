"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import QueryProvider from "./query.provider"; // নিশ্চিত করুন এটি default export
import GoogleAuthProvider from "./google.Provider"; // নিশ্চিত করুন এটি default export

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <GoogleAuthProvider>
        <QueryProvider>{children}</QueryProvider>
      </GoogleAuthProvider>
    </ThemeProvider>
  );
}