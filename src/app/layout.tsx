import type { Metadata } from "next";
import "@/styles/globals.css";
import ClientLayout from "@/components/layout/ClientLayout";


export const metadata: Metadata = {
  title: "Habit Rabbit",
  description: "The best tracker of habits with little rabbit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
