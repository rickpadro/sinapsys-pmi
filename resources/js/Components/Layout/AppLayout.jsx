import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Sidebar from '@/Components/Layout/Sidebar';
import Header from '@/Components/Layout/Header';
import Toast from '@/Components/Layout/Toast';
import OfflineBanner from '@/Components/Layout/OfflineBanner';

export default function AppLayout({ title, children }) {
    const [collapsed, setCollapsed] = useState(true);
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('darkMode') === 'true';
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    // On desktop, default sidebar expanded
    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1024px)');
        setCollapsed(!mq.matches);
        const handler = (e) => setCollapsed(!e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    return (
        <>
        <Head title={title} />
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed(!collapsed)}
            />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header
                    title={title}
                    onMenuClick={() => setCollapsed(!collapsed)}
                    darkMode={darkMode}
                    onToggleDark={() => setDarkMode(!darkMode)}
                />

                <OfflineBanner />

                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>

            <Toast />
        </div>
        </>
    );
}
