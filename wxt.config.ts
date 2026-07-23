import { defineConfig } from 'wxt';

//name of extension : DigiTwinz
// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest : {
    name: "Digital Twin", 
    permissions: ['storage', 'alarms', 'notifications', 'sidePanel'],
    host_permissions: [
      'https://www.reddit.com/*',
      "*://*.reddit.com/*",
    ],
  },
  runner: {
    disabled: true,
  },
});
