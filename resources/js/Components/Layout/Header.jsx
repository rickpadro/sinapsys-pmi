import { Link, router, usePage } from '@inertiajs/react';
import { Sun, Moon, LogOut, Menu, UserCircle } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { useUrl } from '@/Lib/utils';

export default function Header({ title, onMenuClick, darkMode, onToggleDark }) {
    const url = useUrl();
    const { auth } = usePage().props;

    return (
        <header
            className="sticky top-0 z-20 flex h-14 items-center justify-between border-b px-4"
            style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
            }}
        >
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="rounded-md p-1.5 transition-colors lg:hidden"
                    style={{ color: 'var(--text-muted)' }}
                >
                    <Menu size={20} />
                </button>
                <h1
                    className="text-lg font-semibold"
                    style={{ color: 'var(--foreground)' }}
                >
                    {title}
                </h1>
            </div>

            <div className="flex items-center gap-2">
                <Link
                    href={url('/profile')}
                    className="hidden items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5 sm:flex"
                    style={{ color: 'var(--text-muted)' }}
                    title="Mi perfil"
                >
                    <UserCircle size={15} />
                    {auth.user?.name}
                </Link>

                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onToggleDark}
                    title={darkMode ? 'Modo claro' : 'Modo oscuro'}
                >
                    {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                </Button>

                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => router.post(url('/logout'))}
                    title="Cerrar sesión"
                >
                    <LogOut size={16} />
                </Button>
            </div>
        </header>
    );
}
