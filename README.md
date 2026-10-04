# Samsung 43 Crystal UHD Remote

Responsive Samsung Tizen TV remote UI inspired by the supplied screenshot.

## Run
1. Install Node.js 18+.
2. Run `npm install`
3. Run `npm start`
4. Open `http://localhost:3000`
5. Put phone and TV on the same Wi-Fi.
6. Enter the TV IP address.
7. On first pairing, press **Allow** on the TV.

## Architecture
Browser UI -> local WebSocket proxy -> Samsung TV WSS port 8002.

Samsung Tizen remote implementations commonly use the secure WebSocket endpoint on port 8002 and send `ms.remote.control` key commands. The TV may ask for one-time pairing approval and returns a token for later connections.

## Notes
- This project is a responsive web remote, not an official Samsung app.
- App-launch IDs vary by TV/region/model, so the four top app buttons are currently UI placeholders.
- Power-on from a fully-off TV can require Wake-on-LAN and a model/network-specific implementation.
