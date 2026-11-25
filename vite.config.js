import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const isNative = mode === 'native';

  return {
    base: isNative ? './' : '/',
    clearScreen: false,
    envPrefix: ['VITE_', 'TAURI_'],
    plugins: [
      react(),
      !isNative &&
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['vite.svg'],
          manifest: {
            name: 'My Habit Mastery',
            short_name: 'MyHabitMastery',
            description: 'Track your habits, master your life.',
            theme_color: '#0f172a',
            background_color: '#0f172a',
            display: 'standalone',
            orientation: 'portrait',
            start_url: '/',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png',
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
              },
            ],
          },
        }),
    ].filter(Boolean),
    server: {
      port: 3000,
      strictPort: true,
    },
  };
});
