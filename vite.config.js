import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
            '@inertiajs/react': path.resolve(__dirname, 'resources/js/demo/mock-inertia.tsx'),
            'ziggy-js': path.resolve(__dirname, 'resources/js/demo/mock-ziggy.ts'),
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    esbuild: {
        jsx: 'automatic',
    },
});