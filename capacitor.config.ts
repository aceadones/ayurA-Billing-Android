import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.nextlayerlabs.ayura.billing",
  appName: "ayurA Billing",
  webDir: "dist",
  android: {
    backgroundColor: "#FAFAF7",
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
