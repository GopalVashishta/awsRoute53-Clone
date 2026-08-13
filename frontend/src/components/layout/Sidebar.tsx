'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Hosted zones', href: '/hosted-zones' },
  { name: 'Health checks', href: '/health-checks' },
  { name: 'Profiles', href: '/profiles' },
  { name: 'Resolver', href: '/resolver' },
  { name: 'Registered domains', href: '/registered-domains' },
  { name: 'CIDR collections', href: '/cidr-collections' },
  { name: 'Traffic policies', href: '/traffic-policies' },
  { name: 'Policy records', href: '/policy-records' },
  { name: 'DNS Firewall', href: '/dns-firewall' },
  { name: 'Application Recovery Controller', href: '/recovery-controller' }
];

export function Sidebar() {
  const pathname = usePathname();
  
  return (
    <aside className={styles.sidebar}>
      <ul className={styles.navList}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const hasNew = item.name.includes('[New]');
          const cleanName = item.name.replace('[New]', '').trim();
          
          return (
            <li key={item.href} className={styles.navItem}>
              <Link href={item.href} className={`${styles.link} ${isActive ? styles.active : ''}`}>
                {cleanName}
                {hasNew && <span className={styles.badge}>New</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
