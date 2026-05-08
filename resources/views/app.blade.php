<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

        {{-- Favicon --}}
        <link rel="icon" type="image/png" href="{{ env('APP_BASE_PATH', '') }}/favicon.png">
        <link rel="apple-touch-icon" href="{{ env('APP_BASE_PATH', '') }}/icon_sinapsys.png">

        {{-- PWA --}}
        <link rel="manifest" href="{{ env('APP_BASE_PATH', '') }}/manifest.json">
        <meta name="theme-color" content="#4A6CF7">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="SinapSYS">
        <meta name="mobile-web-app-capable" content="yes">

        {{-- Fonts --}}
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

        <title>SinapSYS Projects</title>

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead

        {{-- Service Worker registration --}}
        <script>
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                    navigator.serviceWorker
                        .register('{{ env("APP_BASE_PATH", "") }}/sw.js', {
                            scope: '{{ env("APP_BASE_PATH", "") }}/'
                        })
                        .catch(function (err) {
                            console.warn('SW registration failed:', err);
                        });
                });
            }
        </script>
    </head>
    <body>
        @inertia
    </body>
</html>
