// app/config.ts
// Choose the correct API base URL depending on where you run the app.
// - For Android emulator (AVD): "http://10.0.2.2:8000"
// - For iOS simulator: "http://127.0.0.1:8000"
// - For physical device / Expo Go: use your machine LAN IP, e.g. "http://192.168.31.42:8000"
// Replace LAN_IP with your machine IP if you're running on a device.


const LAN_IP = "192.168.31.42"; // <<< REPLACE this with your machine IP when using a physical device
const PORT = "8000";

export const DEFAULTS: Record<string, string> = {
  androidEmulator: `http://10.0.2.2:${PORT}`,
  iosSimulator: `http://127.0.0.1:${PORT}`,
  lan: `http://${LAN_IP}:${PORT}`,
};

// Best effort pick:
export const API_BASE_URL = DEFAULTS.lan;


// If you run on a physical device, manually override like:
// export const API_BASE_URL = DEFAULTS.lan;
