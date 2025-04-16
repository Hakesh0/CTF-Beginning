'use client';

import Link from 'next/link';
import {useState} from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';

const Navbar = () => {
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/nmap', label: 'Nmap' },
    { href: '/fuzzing', label: 'Fuzzing' },
  ];

  const { toggleSidebar, state } = useSidebar();

  return (
    <nav className="flex-col p-4">
      <div className="flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <PanelLeft className="h-4 w-4" />
        </Button>
      </div>
      <ul className={`flex flex-col space-y-2 ${state === 'collapsed' ? 'hidden' : ''}`}>
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`rounded-md p-2 hover:bg-primary hover:text-secondary-foreground`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;

