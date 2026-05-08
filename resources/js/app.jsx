import { createInertiaApp, router } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false, minimum: 0.1 });

let timeout = null;
router.on('start', () => {
    timeout = setTimeout(() => NProgress.start(), 150);
});
router.on('finish', (event) => {
    clearTimeout(timeout);
    if (NProgress.isStarted()) {
        if (event.detail.visit.completed) {
            NProgress.done();
        } else if (event.detail.visit.interrupted) {
            NProgress.set(0);
        } else if (event.detail.visit.cancelled) {
            NProgress.done();
            NProgress.remove();
        }
    }
});

createInertiaApp({
    title: (title) => title ? `${title} — SinapSYS Projects` : 'SinapSYS Projects',
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        return pages[`./Pages/${name}.jsx`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
