import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.biswajit.geniusai',
  appName: 'UPSC Genius AI',
  webDir: 'www',
  server: {
    // Point installed app to the published web app so it always serves the latest build.
    url: 'https://open-hello-bloom.lovable.app',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#1a1f3a',
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