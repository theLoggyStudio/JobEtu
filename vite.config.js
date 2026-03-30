import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@constants': path.resolve(__dirname, 'Constants'),
        },
    },
    build: {
        minify: 'esbuild',
        sourcemap: false,
    },
});
