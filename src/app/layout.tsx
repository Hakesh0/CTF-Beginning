'use client'

import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import {Toaster} from "@/components/ui/toaster"
import {Sidebar, SidebarContent, SidebarInset, SidebarProvider} from "@/components/ui/sidebar"
import Navbar from '@/components/Navbar';
import { useState } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CTF Toolkit',
  description: 'A toolkit for solving CTF challenges.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const [showNavbar, setShowNavbar] = useState(true);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <SidebarProvider>
              {showNavbar && (
                  <Sidebar collapsible="icon">
                    <Navbar />
                  </Sidebar>
              )}
              <SidebarInset>
                  {children}
                  <Toaster/>
              </SidebarInset>
          </SidebarProvider>
      </body>
    </html>
  );
}


