'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/nmap', label: 'Nmap' },
    { href: '/fuzzing', label: 'Fuzzing' },
  ];

  return (
    <nav className="bg-secondary text-primary-foreground p-4">
      <ul className="flex space-x-4">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`rounded-md p-2 hover:bg-primary hover:text-secondary-foreground ${
                pathname === item.href ? 'bg-primary text-secondary-foreground' : ''
              }`}
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
