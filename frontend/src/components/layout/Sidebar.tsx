'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

interface NavItem {
  name: string;
  href?: string;
  isNew?: boolean;
  children?: NavItem[];
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Hosted zones', href: '/hosted-zones' },
  { name: 'Health checks', href: '/health-checks' },
  { name: 'Profiles', href: '/profiles' },
  {
    name: 'Global Resolver',
    children: [
      { name: 'Global resolvers', href: '/resolver', isNew: true },
      { name: 'Shared DNS views', href: '/resolver', isNew: true },
    ],
  },
  {
    name: 'VPC Resolver',
    children: [
      { name: 'VPCs', href: '/resolver' },
      { name: 'Inbound endpoints', href: '/resolver' },
      { name: 'Outbound endpoints', href: '/resolver' },
      { name: 'Rules', href: '/resolver' },
      { name: 'Query logging', href: '/resolver' },
      { name: 'Outposts', href: '/resolver' },
    ],
  },
  {
    name: 'Domains',
    children: [
      { name: 'Registered domains', href: '/registered-domains' },
      { name: 'Requests', href: '/registered-domains' },
    ],
  },
  {
    name: 'IP-based routing',
    children: [
      { name: 'CIDR collections', href: '/cidr-collections' },
    ],
  },
  {
    name: 'Traffic flow',
    children: [
      { name: 'Traffic policies', href: '/traffic-policies' },
      { name: 'Policy records', href: '/policy-records' },
    ],
  },
  { name: 'DNS Firewall', href: '/dns-firewall' },
  { name: 'Application Recovery Controller', href: '/recovery-controller' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Global Resolver': true,
    'VPC Resolver': true,
    'Domains': true,
    'IP-based routing': true,
    'Traffic flow': true,
  });

  const toggleGroup = (name: string) => {
    setExpandedGroups(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Route 53</h2>
        <button className={styles.collapseBtn} title="Collapse navigation">‹</button>
      </div>

      <ul className={styles.navList}>
        {NAV_ITEMS.map(item => {
          if(item.children){
            const isExpanded = expandedGroups[item.name] ?? false;
            return (
              <li key={item.name} className={styles.navItem}>
                <button className={styles.groupBtn} onClick={() => toggleGroup(item.name)}>
                  <span className={styles.arrow}>{isExpanded ? '▼' : '▶'}</span>
                  <span>{item.name}</span>
                </button>

                {isExpanded && (
                  <ul className={styles.subList}>
                    {item.children.map(child => {
                      const isActive = pathname === child.href;
                      return (
                        <li key={child.name}>
                          <Link href={child.href!} className={`${styles.link} ${isActive ? styles.active : ''}`}>
                            <span>{child.name}</span>
                            {child.isNew && <span className={styles.badgeNew}>New</span>}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          }

          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href!));
          return (
            <li key={item.name} className={styles.navItem}>
              <Link href={item.href!} className={`${styles.link} ${isActive ? styles.active : ''}`}>
                <span>{item.name}</span>
                {item.isNew && <span className={styles.badgeNew}>New</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
