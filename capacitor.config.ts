import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.biswajit.geniusai',
  appName: 'UPSC Genius AI',
  webDir: 'www',
  server: {
    // Point installed app to the published web app so it always serves the latest build.
    url: 'https://www.upscgenius.co.in/',
    androidScheme: 'https',
    cleartext: false,
    allowNavigation: [
      '*.upscgenius.co.in',
      'www.upscgenius.co.in',
      '*.lovable.app',
      '*.supabase.co',
      '*.googleapis.com',
      'accounts.google.com',
      '*.google.com',
      '*.gstatic.com',
      'api.telegram.org',
      '*.telegram.org',
    ],
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    appendUserAgent: 'UPSCGeniusAI-Android',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#1a1f3a',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1a1f3a',
    },
  },
};

export default config;