import { Link, usePage } from '@inertiajs/react';
import { Crown } from 'lucide-react';
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    Calendar,
    ScatterChart,
    Users,
    PanelLeftClose,
    PanelLeft,
} from 'lucide-react';
import { useUrl } from '@/Lib/utils';

const NAV_ITEMS = [
    { name: 'Dashboard',  href: '/',         icon: LayoutDashboard },
    { name: 'Proyectos',  href: '/projects', icon: FolderKanban },
    { name: 'Tareas',     href: '/tasks',    icon: CheckSquare },
    { name: 'Calendario', href: '/calendar', icon: Calendar },
    { name: 'Matriz',     href: '/matrix',   icon: ScatterChart },
];

const BOTTOM_ITEMS = [
    { name: 'Usuarios', href: '/users', icon: Users },
];

export default function Sidebar({ collapsed, onToggle }) {
    const { url: currentUrl, props } = usePage();
    const url      = useUrl();
    const isAdmin  = props.auth?.user?.is_admin ?? false;

    function isActive(href) {
        const fullHref = url(href);
        if (href === '/') return currentUrl === fullHref;
        return currentUrl.startsWith(fullHref);
    }

    function NavLink({ href, icon: Icon, name }) {
        const active = isActive(href);
        return (
            <Link
                href={url(href)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${active ? 'bg-white/10' : 'hover:bg-white/5'}`}
                style={{ color: active ? 'var(--sidebar-active)' : 'var(--sidebar-text)' }}
                title={collapsed ? name : undefined}
            >
                <Icon size={18} />
                {!collapsed && <span>{name}</span>}
            </Link>
        );
    }

    return (
        <>
            {!collapsed && (
                <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onToggle} />
            )}

            <aside
                className={`fixed top-0 left-0 z-40 flex h-screen flex-col transition-all duration-200 lg:relative lg:z-0 ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'w-[260px] translate-x-0'}`}
                style={{ backgroundColor: 'var(--sidebar-bg)' }}
            >
                {/* Logo */}
                <div className="flex h-14 items-center justify-between px-4">
                    <Link href={url('/')}>
                        <img
                            src={url(collapsed ? '/icon_sinapsys.png' : '/logo_sinapsys.png')}
                            alt="SinapSYS"
                            className={collapsed ? 'h-7' : 'h-8'}
                        />
                    </Link>
                    {!collapsed && (
                        <button
                            onClick={onToggle}
                            className="rounded-md p-1.5 transition-colors hover:bg-white/10"
                            style={{ color: 'var(--sidebar-text)' }}
                        >
                            <PanelLeftClose size={18} />
                        </button>
                    )}
                </div>

                {/* Nav principal */}
                <nav className="mt-2 flex-1 space-y-0.5 px-2">
                    {NAV_ITEMS.map(item => <NavLink key={item.href} {...item} />)}
                </nav>

                {/* Nav inferior — solo admin */}
                {isAdmin && (
                    <div className="space-y-0.5 border-t border-white/10 px-2 py-2">
                        {BOTTOM_ITEMS.map(item => <NavLink key={item.href} {...item} />)}
                    </div>
                )}

                {!collapsed && (
                    <div className="border-t border-white/10 px-4 py-3">
                        <p className="text-xs" style={{ color: 'var(--sidebar-text)' }}>SinapSYS Projects</p>
                    </div>
                )}
            </aside>
        </>
    );
}
