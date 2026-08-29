'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'ภาพรวม', icon: 'pi-home' },
  { href: '/sales', label: 'การขาย', icon: 'pi-shopping-bag' },
  { href: '/costs', label: 'ต้นทุน', icon: 'pi-wallet' },
  { href: '/inventory', label: 'สินค้า', icon: 'pi-box' },
  { href: '/reports', label: 'รายงาน', icon: 'pi-chart-bar' },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <>
      <header className="app-header">
        <div className="app-header__inner">
        <Link href="/" className="brand" aria-label="ไปหน้าภาพรวม">
          <span className="brand__mark" aria-hidden="true">🍨</span>
          <span><strong>ร้านซ้อแก้วไอติมทอด</strong><small>ระบบจัดการร้านไอศกรีมทอด</small></span>
        </Link>
        </div>
      </header>
      <nav className="main-nav bottom-navigation" aria-label="เมนูหลัก">
        {links.map((link) => {
          const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
          return (
            <Link key={link.href} href={link.href} className={active ? 'main-nav__link is-active' : 'main-nav__link'}>
              <i className={`pi ${link.icon}`} aria-hidden="true" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
