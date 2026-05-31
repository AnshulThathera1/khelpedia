'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TabNavigation({ gameName, tagLine }) {
  const pathname = usePathname();
  const encodedName = encodeURIComponent(gameName);
  const encodedTag = encodeURIComponent(tagLine);
  
  const basePath = `/valorant/${encodedName}/${encodedTag}`;

  const tabs = [
    { name: 'Overview', href: basePath },
    { name: 'Matches', href: `${basePath}/matches` },
    { name: 'Agents', href: `${basePath}/agents` },
    { name: 'Weapons', href: `${basePath}/weapons` },
    { name: 'Maps', href: `${basePath}/maps` },
  ];

  return (
    <nav className="flex items-center gap-6 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`py-4 text-sm font-bold tracking-widest uppercase border-b-2 whitespace-nowrap transition-colors ${
              isActive
                ? 'border-red-500 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
}
