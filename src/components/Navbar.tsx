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
    { href: '/fuzzing/ffuf', label: 'FFUF' },
    { href: '/fuzzing/wfuzz', label: 'WFuzz' },
    { href: '/fuzzing/gobuster', label: 'Gobuster' },
  ];

  const { toggleSidebar, state } = useSidebar();
  const [showNavItems, setShowNavItems] = useState(true);

  const toggleNavItems = () => {
    setShowNavItems(!showNavItems);
  };

  return (
    <nav className="flex-col p-4">
      <div className="flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleNavItems}>
          {showNavItems ? 'Hide' : 'Show'}
        </Button>
      </div>
      <ul className={`flex flex-col space-y-2 ${state === 'collapsed' || !showNavItems ? 'hidden' : ''}`}>
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
