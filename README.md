# Prayer Times Dashboard

A minimal Islamic prayer time web dashboard optimized for Google Nest Hub (7-inch, 1024x600 landscape display).

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## Features

- Large current time display
- Hijri date (from Al-Adhan API)
- Daily prayer times with current prayer highlight
- Countdown to next prayer
- Iqama times (configurable offsets)
- Auto-refresh at midnight
- LocalStorage caching
- Multi-language support (English, Dutch, Turkish)
- Dark mode only, optimized for always-on displays
- No user interaction required

---

## 1. Local Development Setup

### Prerequisites

- **Node.js** 18.x or higher
- **npm** (comes with Node.js) or **yarn**

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd prayer-dashboard

# Install dependencies
npm install
# or
yarn install
```

### Running Locally

```bash
# Start development server
npm run dev
# or
yarn dev
```

The app will be available at:

```
http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Configuration

Edit `lib/config.ts` to customize:

| Setting | Description | Default |
|---------|-------------|---------|
| `DEFAULT_LOCATION` | Latitude, longitude, city, country | Hengelo, NL |
| `CALCULATION_METHOD` | Al-Adhan API method (see comments) | 13 (Diyanet) |
| `IQAMA_OFFSETS` | Minutes after adhan for iqama | 5-10 min |
| `DEFAULT_LANGUAGE` | UI language (`en`, `nl`, `tr`) | `nl` |

---

## 2. Casting to Google Nest Hub

### Why Localhost Cannot Be Cast Directly

Google Chromecast/Nest Hub requires:
1. **HTTPS** connection (localhost uses HTTP)
2. **Public network accessibility** (localhost is not accessible from your Nest Hub)

The Nest Hub is a separate device on your network and cannot reach `localhost` on your computer.

### Option A: Chrome Tab Casting (Development/Testing)

This is a hacky workaround for local development:

1. **Open Chrome** on your computer
2. **Navigate to** `http://localhost:3000`
3. **Enable Kiosk Mode** (optional, for cleaner display):
   - Press `F11` for fullscreen
   - Or launch Chrome with: `google-chrome --kiosk http://localhost:3000`
4. **Cast the tab**:
   - Click the three-dot menu (⋮) → **Cast...**
   - Select your **Nest Hub** device
   - Choose **Cast tab** (not Cast screen)

**Limitations:**
- Your computer must stay on and connected
- Quality depends on your network
- Not suitable for 24/7 display

### Option B: Deploy to Public URL (Recommended)

Deploy your dashboard to a hosting service and cast the public URL:

#### Vercel (Easiest)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts, get your URL like:
# https://prayer-dashboard-xxx.vercel.app
```

#### Netlify

```bash
# Build the app
npm run build

# Drag the `.next` folder to Netlify dashboard
# Or use Netlify CLI
```

#### Self-Hosted (Docker)

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
docker build -t prayer-dashboard .
docker run -p 3000:3000 prayer-dashboard
```

Then set up a reverse proxy (nginx/Caddy) with HTTPS.

---

## 3. Google Assistant Routine Setup

Once your dashboard is deployed to a public HTTPS URL, you can set up Google Assistant routines.

### Casting via Voice Command

Say to your Nest Hub:

> "Hey Google, show `https://your-dashboard-url.vercel.app` on this display"

Or:

> "Hey Google, open `https://your-dashboard-url.vercel.app`"

### Creating a Routine

1. Open the **Google Home** app on your phone
2. Tap your **Profile icon** → **Assistant settings**
3. Tap **Routines**
4. Tap **+ New routine**

#### Example: Voice Trigger Routine

| Setting | Value |
|---------|-------|
| **Starter** | "Show prayer times" |
| **Action** | Custom command: `Open https://your-url.vercel.app on Living Room display` |

Now say: **"Hey Google, show prayer times"**

#### Example: Scheduled Routine (Auto-cast at Fajr)

| Setting | Value |
|---------|-------|
| **Starter** | Scheduled time: 5:00 AM daily |
| **Action** | `Open https://your-url.vercel.app on Living Room display` |

The dashboard will automatically appear on your Nest Hub every morning.

#### Example: Sunrise Routine (Turn off after Sunrise)

| Setting | Value |
|---------|-------|
| **Starter** | Sunrise |
| **Action** | `Stop casting on Living Room display` |

### Routine Command Examples

```
# Cast to specific device
"Open https://prayer-dashboard.vercel.app on Kitchen display"

# Cast to all displays
"Open https://prayer-dashboard.vercel.app on all displays"

# Stop casting
"Stop casting on Living Room display"
"Hey Google, stop"
```

---

## 4. Recommended Nest Hub Settings

### Volume Settings

For a quiet prayer dashboard:

```
"Hey Google, set volume to 0"
```

Or in Google Home app:
- Device settings → **Audio** → **Alarm & timer volume**: 0%

### Do Not Disturb

Enable to prevent interruptions:

```
"Hey Google, turn on Do Not Disturb"
```

Or schedule DND:
- Google Home → Device → **Do Not Disturb** → Set schedule

### Ambient Mode / Photo Frame

Disable to prevent the dashboard from being replaced:

1. Open **Google Home** app
2. Select your **Nest Hub**
3. Tap **Settings** (gear icon)
4. Go to **Photo Frame**
5. Set to **Off** or set a very long timeout

Alternatively, keep the dashboard cast continuously via a scheduled routine.

### Screen Brightness

For bedroom use, set adaptive brightness:

```
"Hey Google, set brightness to 50%"
```

Or enable **Ambient EQ** in device settings for automatic adjustment.

### Screen Timeout

The Nest Hub doesn't have a screen timeout when casting. The cast will remain active until:
- You say "Hey Google, stop"
- Another cast takes over
- Network disconnection

---

## 5. Optional Improvements

### Home Assistant Integration

Integrate with Home Assistant for advanced automation:

```yaml
# configuration.yaml
rest_command:
  cast_prayer_dashboard:
    url: "http://homeassistant.local:8123/api/services/media_player/play_media"
    method: POST
    headers:
      Authorization: "Bearer YOUR_TOKEN"
    payload: '{"entity_id": "media_player.nest_hub", "media_content_id": "https://your-dashboard.vercel.app", "media_content_type": "cast"}'

# automations.yaml
automation:
  - alias: "Cast Prayer Dashboard at Fajr"
    trigger:
      - platform: time
        at: "05:00:00"
    action:
      - service: rest_command.cast_prayer_dashboard
```

Or use the [Home Assistant Cast integration](https://www.home-assistant.io/integrations/cast/):

```yaml
automation:
  - alias: "Show Prayer Times"
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

### Ramadan Mode

Ideas for Ramadan-specific features:

- **Suhoor countdown**: Time remaining until Fajr (end of eating)
- **Iftar countdown**: Time remaining until Maghrib (breaking fast)
- **Ramadan day counter**: "Day 15 of Ramadan"
- **Special Ramadan theme**: Gold/purple accent colors
- **Taraweeh reminder**: After Isha notification

Implementation approach:
```typescript
// Add to lib/config.ts
export const RAMADAN_MODE = {
  enabled: true,
  startDate: '2025-02-28', // 1 Ramadan 1446
  endDate: '2025-03-29',   // 29/30 Ramadan
};

// Add Suhoor countdown in page.tsx
const getSuhoorCountdown = () => {
  // Suhoor ends at Fajr
  return prayerStatus?.current === 'isha' 
    ? formatCountdown(prayerStatus.secondsUntilNext)
    : null;
};
```

### Iqama Countdown Timers

Show countdown to iqama after adhan time passes:

```typescript
// In page.tsx, add iqama countdown logic
const getIqamaCountdown = (prayer: PrayerName) => {
  const adhanMinutes = timeToMinutes(prayerTimes[prayer]);
  const iqamaMinutes = adhanMinutes + IQAMA_OFFSETS[prayer];
  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  if (nowMinutes >= adhanMinutes && nowMinutes < iqamaMinutes) {
    const remaining = (iqamaMinutes - nowMinutes) * 60 - currentTime.getSeconds();
    return formatCountdown(remaining);
  }
  return null;
};
```

### Audio Adhan Notifications

Add audio adhan playback (requires user interaction to enable):

```typescript
// Add to page.tsx
const playAdhan = () => {
  const audio = new Audio('/adhan.mp3');
  audio.play();
};

// Trigger when prayer time arrives
useEffect(() => {
  if (prayerStatus && prayerStatus.secondsUntilNext <= 0) {
    playAdhan();
  }
}, [prayerStatus]);
```

Note: Browsers require user interaction before playing audio. For Nest Hub, consider using Google Assistant TTS instead.

### Additional Feature Ideas

- **Qibla direction compass** (requires device orientation API)
- **Weather integration** (OpenWeatherMap API)
- **Multiple location support** (family members in different cities)
- **Prayer tracker** (mark prayers as completed)
- **Quran verse of the day**
- **Islamic events calendar** (Eid, Laylatul Qadr, etc.)

---

## Project Structure

```
prayer-dashboard/
├── app/
│   ├── globals.css      # Tailwind + custom styles
│   ├── layout.tsx       # Root layout with metadata
│   └── page.tsx         # Main dashboard component
├── lib/
│   ├── config.ts        # Location, method, translations
│   ├── prayerUtils.ts   # API fetch, time calculations
│   ├── storage.ts       # LocalStorage caching
│   └── types.ts         # TypeScript interfaces
├── public/              # Static assets
├── tailwind.config.ts   # Tailwind configuration
├── next.config.js       # Next.js configuration
├── package.json
└── README.md
```

---

## API Reference

This project uses the [Al-Adhan Prayer Times API](https://aladhan.com/prayer-times-api):

```
GET https://api.aladhan.com/v1/timings/{date}
  ?latitude={lat}
  &longitude={lng}
  &method={calculation_method}
```

### Calculation Methods

| ID | Method |
|----|--------|
| 0 | Shia Ithna-Ashari |
| 1 | University of Islamic Sciences, Karachi |
| 2 | Islamic Society of North America (ISNA) |
| 3 | Muslim World League |
| 4 | Umm Al-Qura University, Makkah |
| 5 | Egyptian General Authority of Survey |
| 13 | **Diyanet İşleri Başkanlığı, Turkey** (default) |
| 15 | Moonsighting Committee Worldwide |

See full list: https://aladhan.com/calculation-methods

---

## Troubleshooting

### Prayer times not loading

1. Check your internet connection
2. Verify the Al-Adhan API is accessible: https://api.aladhan.com/v1/timings
3. Check browser console for errors
4. Clear localStorage: `localStorage.clear()`

### Geolocation not working

- The app falls back to `DEFAULT_LOCATION` in `lib/config.ts`
- Geolocation requires HTTPS in production
- Check browser permissions

### Cast keeps disconnecting

- Ensure stable WiFi connection
- Keep your computer awake (if using tab casting)
- Use a deployed URL instead of localhost
- Set up a scheduled routine to re-cast

### Hijri date is wrong

The Al-Adhan API calculates Hijri dates automatically. For manual adjustment:
- Some regions observe Hijri dates differently
- You can add a `hijriAdjustment` parameter to the API call

---

## License

MIT License - Feel free to use and modify for personal or commercial use.

---

## Contributing

Contributions welcome! Please open an issue or PR for:
- Bug fixes
- New language translations
- Feature improvements
- Documentation updates
