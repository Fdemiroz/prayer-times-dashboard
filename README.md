<div align="center">

# 🕌 Prayer Times Dashboard

**A beautiful Islamic prayer times display optimized for Google Nest Hub and smart displays**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=flat-square)](https://github.com/Fdemiroz/prayer-times-dashboard/graphs/commit-activity)

[Live Demo](https://prayer-dashboard.vercel.app) · [Report Bug](https://github.com/Fdemiroz/prayer-times-dashboard/issues) · [Request Feature](https://github.com/Fdemiroz/prayer-times-dashboard/issues)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Screenshots](#-screenshots)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Configuration](#%EF%B8%8F-configuration)
- [Deployment](#-deployment)
- [Google Nest Hub Setup](#-google-nest-hub-setup)
- [Google Assistant Routines](#-google-assistant-routines)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Acknowledgments](#-acknowledgments)
- [License](#-license)

---

## 🌙 About

Prayer Times Dashboard is a minimal, elegant Islamic prayer time web application designed for **always-on smart displays** like Google Nest Hub (7-inch, 1024x600). 

Built with modern web technologies, it features a stunning Islamic aesthetic with geometric patterns, mosque silhouettes, and a carefully crafted dark theme that's easy on the eyes during night prayers.

### Why This Project?

- 🕋 **Purpose-built** for Muslim households wanting a dedicated prayer display
- 📺 **Optimized** for Google Nest Hub and similar smart displays
- 🎨 **Beautiful** Islamic-inspired design with attention to detail
- 🌍 **Multi-language** support for diverse communities
- ⚡ **Fast & Reliable** with offline caching and self-healing UI

---

## 📸 Screenshots

<div align="center">

| Islamic Theme | Prayer Timeline |
|:-------------:|:---------------:|
| *Screenshot coming soon* | *Screenshot coming soon* |

</div>

> 💡 **Tip:** Add your own screenshots by placing images in the `public/` folder and updating the paths above.

---

## ✨ Features

### Core Features
| Feature | Description |
|---------|-------------|
| 🕐 **Large Clock Display** | High-contrast time display optimized for viewing from distance |
| 📅 **Hijri Calendar** | Automatic Islamic date with crescent moon icon |
| 🕌 **Prayer Times** | All 5 daily prayers + Sunrise with iqama times |
| ⏱️ **Live Countdown** | Real-time countdown to next prayer with pulse animation |
| 📍 **Geolocation** | Automatic location detection with manual fallback |

### Islamic Design
| Feature | Description |
|---------|-------------|
| 🌟 **Geometric Patterns** | Subtle Islamic star patterns in the background |
| 🏛️ **Mosque Silhouette** | Beautiful skyline with domes and minarets |
| 🌙 **Night Theme** | Dark teal/gold color scheme for OLED displays |
| 📊 **Day Timeline** | Visual progress bar showing prayer times |

### Technical Features
| Feature | Description |
|---------|-------------|
| 🌐 **Multi-language** | English, Nederlands, Türkçe |
| 💾 **Offline Cache** | LocalStorage caching for reliability |
| 🔄 **Self-healing** | Auto-refresh on visibility change and periodic checks |
| 📱 **Responsive** | Optimized for 1024x600 but works on any screen |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18.x or higher
- npm (comes with Node.js) or [yarn](https://yarnpkg.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/Fdemiroz/prayer-times-dashboard.git

# Navigate to the project
cd prayer-times-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### One-Liner

```bash
git clone https://github.com/Fdemiroz/prayer-times-dashboard.git && cd prayer-times-dashboard && npm install && npm run dev
```

---

## ⚙️ Configuration

Edit `lib/config.ts` to customize the dashboard:

### Location Settings

```typescript
export const DEFAULT_LOCATION: LocationConfig = {
  latitude: 52.2659,      // Your latitude
  longitude: 6.7931,      // Your longitude
  city: 'Hengelo',        // Display name
  country: 'Nederland',   // Display name
  timezone: 'Europe/Amsterdam',
};
```

### Prayer Calculation Method

```typescript
export const CALCULATION_METHOD = 13; // Diyanet (Turkey)
```

| ID | Method | Best For |
|----|--------|----------|
| 2 | ISNA | North America |
| 3 | Muslim World League | Europe, Far East |
| 4 | Umm Al-Qura | Saudi Arabia |
| 5 | Egyptian | Africa, Middle East |
| **13** | **Diyanet** | **Turkey, Europe (default)** |
| 15 | Moonsighting Committee | Worldwide |

[View all calculation methods →](https://aladhan.com/calculation-methods)

### Iqama Offsets

```typescript
export const IQAMA_OFFSETS: IqamaOffsets = {
  fajr: 10,     // Minutes after adhan
  dhuhr: 5,
  asr: 5,
  maghrib: 5,
  isha: 10,
};
```

### Language

```typescript
export const DEFAULT_LANGUAGE: Language = 'nl'; // 'en', 'nl', or 'tr'
```

---

## 🌐 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Fdemiroz/prayer-times-dashboard)

Or deploy manually:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Your app will be live at: https://your-app.vercel.app
```

### Netlify

```bash
# Build the app
npm run build

# Deploy via Netlify CLI or drag-and-drop the .next folder
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t prayer-dashboard .
docker run -p 3000:3000 prayer-dashboard
```

---

## 📺 Google Nest Hub Setup

### Why Can't I Cast Localhost?

Google Chromecast/Nest Hub requires:
1. **HTTPS** connection (localhost uses HTTP)
2. **Public network** accessibility (Nest Hub can't reach your localhost)

### Option A: Chrome Tab Casting (Development)

1. Open Chrome → Navigate to `http://localhost:3000`
2. Press `F11` for fullscreen
3. Click **⋮** → **Cast...** → Select your Nest Hub → **Cast tab**

> ⚠️ Your computer must stay on. Not suitable for 24/7 use.

### Option B: Deploy & Cast (Recommended)

1. Deploy to Vercel (see above)
2. Say: *"Hey Google, show `https://your-app.vercel.app` on [device name]"*

### Recommended Nest Hub Settings

| Setting | Recommendation |
|---------|---------------|
| **Volume** | Set to 0% for silent display |
| **Do Not Disturb** | Enable to prevent interruptions |
| **Photo Frame** | Disable or set long timeout |
| **Brightness** | Enable Ambient EQ for auto-adjust |

---

## 🗣️ Google Assistant Routines

### Voice Command Examples

```
"Hey Google, show https://prayer-dashboard.vercel.app on Living Room display"
"Hey Google, open https://prayer-dashboard.vercel.app on all displays"
"Hey Google, stop casting on Living Room display"
```

### Create a Routine

1. Open **Google Home** app
2. **Profile** → **Assistant settings** → **Routines**
3. Tap **+ New routine**

#### Example: Voice Trigger

| Setting | Value |
|---------|-------|
| Starter | "Show prayer times" |
| Action | `Open https://your-app.vercel.app on Living Room display` |

#### Example: Scheduled (Auto-cast at Fajr)

| Setting | Value |
|---------|-------|
| Starter | Scheduled: 5:00 AM daily |
| Action | `Open https://your-app.vercel.app on Living Room display` |

### Home Assistant Integration

```yaml
# automations.yaml
automation:
  - alias: "Cast Prayer Dashboard at Fajr"
    trigger:
      - platform: time
        at: "05:00:00"
    action:
      - service: cast.show_lovelace_view
        data:
          entity_id: media_player.living_room_display
          dashboard_path: lovelace
          view_path: prayer-times
```

---

## 📁 Project Structure

```
prayer-dashboard/
├── app/
│   ├── globals.css       # Tailwind + Islamic patterns + animations
│   ├── layout.tsx        # Root layout with metadata
│   └── page.tsx          # Main dashboard component
├── lib/
│   ├── config.ts         # Location, method, translations
│   ├── prayerUtils.ts    # API fetch, time calculations
│   ├── storage.ts        # LocalStorage caching
│   └── types.ts          # TypeScript interfaces
├── public/               # Static assets (add screenshots here)
├── tailwind.config.ts    # Tailwind configuration
├── next.config.js        # Next.js configuration
├── package.json
└── README.md
```

---

## 📡 API Reference

This project uses the free [Al-Adhan Prayer Times API](https://aladhan.com/prayer-times-api).

### Endpoint

```
GET https://api.aladhan.com/v1/timings/{DD-MM-YYYY}
    ?latitude={lat}
    &longitude={lng}
    &method={calculation_method}
```

### Response Includes

- Prayer times (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha)
- Hijri date (day, month, year)
- Gregorian date
- Calculation metadata

---

## 🔧 Troubleshooting

<details>
<summary><b>Prayer times not loading</b></summary>

1. Check internet connection
2. Verify API: https://api.aladhan.com/v1/timings
3. Open browser console (F12) for errors
4. Clear cache: `localStorage.clear()` in console

</details>

<details>
<summary><b>Geolocation not working</b></summary>

- Geolocation requires **HTTPS** in production
- Check browser permissions (click lock icon in URL bar)
- App falls back to `DEFAULT_LOCATION` in `lib/config.ts`

</details>

<details>
<summary><b>Cast keeps disconnecting</b></summary>

- Ensure stable WiFi on both devices
- Use deployed URL instead of localhost
- Set up scheduled routine to auto-reconnect
- Disable ambient mode on Nest Hub

</details>

<details>
<summary><b>Hijri date is wrong</b></summary>

- Al-Adhan calculates automatically
- Some regions observe dates differently
- Add `&adjustment=1` or `-1` to API call for manual adjustment

</details>

---

## 🗺️ Roadmap

- [ ] **Ramadan Mode** - Suhoor/Iftar countdown, day counter
- [ ] **Adhan Audio** - Optional audio notifications
- [ ] **Qibla Compass** - Direction indicator
- [ ] **Weather Widget** - Current conditions
- [ ] **Prayer Tracker** - Mark prayers as completed
- [ ] **Quran Verse** - Daily verse display
- [ ] **More Languages** - Arabic, Urdu, Indonesian

See the [open issues](https://github.com/Fdemiroz/prayer-times-dashboard/issues) for a full list of proposed features.

---

## 🤝 Contributing

Contributions make the open-source community amazing! Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest features
- 🌍 Add translations
- 📖 Improve documentation
- ⭐ Star the project!

---

## 🙏 Acknowledgments

- [Al-Adhan API](https://aladhan.com/) - Free prayer times API
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Vercel](https://vercel.com/) - Hosting platform
- Islamic geometric patterns inspired by traditional mosque art

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

**If this project helped you, please consider giving it a ⭐**

Made with ❤️ for the Muslim community

[Report Bug](https://github.com/Fdemiroz/prayer-times-dashboard/issues) · [Request Feature](https://github.com/Fdemiroz/prayer-times-dashboard/issues)

</div>
