import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { usePage } from '@inertiajs/react';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Prefix a path with the app's base path (for XAMPP subdirectory support).
 * Usage: url('/projects') → '/00_SinapSYS/08_PMI_SinapSYS/projects'
 */
export function useUrl() {
    const { basePath } = usePage().props;
    return (path) => `${basePath || ''}${path}`;
}
