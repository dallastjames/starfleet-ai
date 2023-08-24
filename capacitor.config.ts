import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dallastjames.starfleet.ai',
  appName: 'StarFleet AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
