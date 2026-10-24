import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        babel({ presets: [reactCompilerPreset()] }),
    ],
    server: {
        proxy: { '/api': 'http://localhost:8080' },
        host: '127.0.0.1',
        allowedHosts: ['laptop.gate-miaplacidus.ts.net'],
    }
});
