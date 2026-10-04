# Samsung 43 Crystal UHD Remote — Personal / Local Only

A personal-use Samsung TV remote UI based on the supplied reference screenshot.

## Privacy / storage
- No cloud database.
- No login/account.
- No analytics.
- No external API is required for the remote itself.
- TV IP, device name and Samsung pairing token are stored only in this browser's localStorage.
- The Node.js process runs locally on your own device/computer.

## Run locally
1. Install Node.js 18+.
2. Open this folder in a terminal.
3. Run `npm install`
4. Run `npm start`
5. Open `http://localhost:3000` on the same device.
6. Keep the phone/device and Samsung TV on the same Wi-Fi.
7. Enter the TV's local IP address.
8. On first connection, approve the remote on the TV.

## How it works
Phone/browser -> local Node.js WebSocket proxy -> Samsung TV on your LAN.

The proxy is local only. It is not a hosted backend and does not upload your TV information.

## Important
This is an unofficial personal remote and not a Samsung app.
Netflix / Prime Video / YouTube buttons are currently UI buttons; exact app-launch commands can vary by Samsung model/region.
