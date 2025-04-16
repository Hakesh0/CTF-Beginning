'use client';

import Link from 'next/link';
import {useState} from 'react';

const Navbar = () => {
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/nmap', label: 'Nmap' },
    { href: '/fuzzing', label: 'Fuzzing' },
  ];

  const [showNavbar, setShowNavbar] = useState(true);

  return (
    <nav className="flex-col p-4">
      <ul className="flex flex-col space-y-2">
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


