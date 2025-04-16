
import type {Metadata} from 'next/server';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import {Toaster} from "@/components/ui/toaster"
import {Sidebar, SidebarContent, SidebarInset, SidebarProvider} from "@/components/ui/sidebar"
import Navbar from '@/components/Navbar';
import {metadata} from './metadata';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export {metadata};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <SidebarProvider>
              <Sidebar collapsible="icon">
                  <Navbar />
              </Sidebar>
              <SidebarInset>
                  {children}
                  <Toaster/>
              </SidebarInset>
          </SidebarProvider>
      </body>
    </html>
  );
}


