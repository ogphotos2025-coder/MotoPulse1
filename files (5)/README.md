# MotoPulse - Never Ride Alone 🏍️

![MotoPulse Banner](https://via.placeholder.com/1200x300/0A1628/FF4500?text=MotoPulse+-+Ride+Safe,+Ride+Connected)

## Tagline
**Never ride alone, even when you're solo.**

## What is MotoPulse?

MotoPulse is a safety-first ride management tool for motorcyclists that focuses on **Intent-Based Safety**. Unlike generic location trackers, MotoPulse lets riders file a "Flight Plan" before heading out—a planned route that persists even if cellular signal is lost. Combined with automated safety checks and a community-powered roadside assistance network, MotoPulse ensures you're never truly alone on the road.

### Key Features

✅ **Flight Plan System** - File your route and return time before riding  
✅ **Dead Man's Switch** - Automatic emergency alerts if you don't check in  
✅ **Battle Map** - Live view of active riders in your area  
✅ **Mechanical SOS** - Signal for community help instead of expensive tows  
✅ **No Phone? No Problem** - Your route persists even in dead zones  

## 🚀 Quick Start

### What You'll Need

- A modern web browser
- (Optional) Airtable account for backend data
- (Optional) Make.com + Twilio for SMS alerts
- (Optional) Google Maps API for live mapping

### Local Development

1. **Download the files:**
   - `index.html`
   - `styles.css`
   - `app.js`

2. **Open `index.html` in your browser:**
   ```bash
   # Simply double-click index.html, or:
   open index.html  # Mac
   start index.html  # Windows
   ```

3. **Start riding!** The app works completely offline with local storage.

### Production Deployment

Deploy to any static hosting service:

**Netlify (Recommended):**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

**Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**GitHub Pages:**
1. Push files to a GitHub repo
2. Go to Settings → Pages
3. Select branch and save

## 📁 Project Structure

```
motopulse/
├── index.html              # Main HTML structure
├── styles.css              # Styling with safety-focused design
├── app.js                  # Core application logic
├── AIRTABLE_SETUP_GUIDE.md # Backend database setup
├── MAKE_AUTOMATION_GUIDE.md # SMS automation guide
└── README.md               # This file
```

## 🎯 3-Day Build Roadmap

### Day 1: Flight Plan Intake ✅
- [x] Rider information form
- [x] Route URL input
- [x] Return time selector
- [x] Emergency contact field
- [x] Status toggle (Cruising/Mechanical)

### Day 2: Battle Map ✅
- [x] Live riders view
- [x] Status indicators (Green/Yellow)
- [x] Community rider cards
- [x] Route viewing
- [x] Help navigation

### Day 3: Guardian Automation ⚙️
- [ ] Airtable integration (see AIRTABLE_SETUP_GUIDE.md)
- [ ] Make.com scenario setup (see MAKE_AUTOMATION_GUIDE.md)
- [ ] Twilio SMS configuration
- [ ] Automated overdue alerts

## 🔧 Features Breakdown

### Flight Plan Interface
Users can:
- Enter their name and bike details
- Paste a Google Maps route link
- Set a hard return time
- Provide an emergency contact number
- Choose initial status (Cruising or Mechanical Help)

### Active Ride Panel
When a ride is active:
- Live countdown to return time
- Quick status toggle button
- "End Ride Safely" button
- Route access link

### Battle Map
Community features:
- View all active riders in the area
- Green pins for cruising riders
- Yellow pins for mechanical help needed
- One-click navigation to help fellow riders
- View planned routes for context

### My Rides
Personal statistics:
- Total rides completed
- Safe returns count
- Number of riders helped
- Complete ride history

## 🔐 Privacy & Safety

### What MotoPulse Collects
- Rider name (you provide)
- Planned route (link only, no GPS tracking)
- Expected return time
- Emergency contact number
- Ride status

### What MotoPulse Does NOT Collect
- Real-time GPS tracking
- Continuous location data
- Personal identifying information
- Payment information

### Data Storage
- **Local Mode:** All data stored in browser localStorage
- **Backend Mode:** Data stored in your private Airtable base
- **You own your data** - export or delete anytime

## 🛠️ Advanced Setup

### Integrating with Airtable

For persistent data across devices and automated alerts:

1. **Follow the setup guide:** See `AIRTABLE_SETUP_GUIDE.md`
2. **Connect your base:** Add API credentials to `airtable-config.js`
3. **Test the connection:** Create a test ride and verify in Airtable

### Setting Up SMS Alerts

For the "Guardian" automated safety system:

1. **Follow the automation guide:** See `MAKE_AUTOMATION_GUIDE.md`
2. **Configure Twilio:** Set up SMS messaging
3. **Create Make.com scenario:** Automate overdue checks
4. **Test thoroughly:** Run multiple test scenarios

### Google Maps Integration

For live map rendering:

1. **Get an API key:** https://developers.google.com/maps/documentation/javascript/get-api-key
2. **Add the script to index.html:**
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>
   ```
3. **Replace the map placeholder** in the Battle Map view with:
   ```html
   <div id="map" style="height: 500px;"></div>
   ```
4. **Initialize the map** in `app.js`

## 🎨 Customization

### Color Scheme
Edit CSS variables in `styles.css`:
```css
:root {
    --primary: #FF4500;      /* Safety Orange */
    --secondary: #0A1628;    /* Deep Navy */
    --accent: #FFC107;       /* Warning Yellow */
    --success: #00D084;      /* Safe Green */
}
```

### Typography
Currently using:
- **Display:** Orbitron (tech/futuristic feel)
- **Body:** Work Sans (clean readability)

Change in `styles.css`:
```css
--font-display: 'Your Display Font', sans-serif;
--font-body: 'Your Body Font', sans-serif;
```

### SMS Message Template
Customize in Make.com automation:
```
🚨 MotoPulse Alert
[Your custom message format]
```

## 📱 Mobile Optimization

The app is fully responsive and works on:
- iOS (Safari, Chrome)
- Android (Chrome, Firefox, Samsung Internet)
- Desktop (All modern browsers)

### Installing as PWA (Progressive Web App)

Add these files for PWA support:

**manifest.json:**
```json
{
  "name": "MotoPulse",
  "short_name": "MotoPulse",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0A1628",
  "theme_color": "#FF4500",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## 🧪 Testing

### Manual Test Scenarios

**Scenario 1: Create a Ride**
1. Fill out Flight Plan form
2. Submit
3. Verify active ride panel appears
4. Check countdown timer

**Scenario 2: Status Toggle**
1. Start a ride
2. Click "Toggle Status"
3. Verify color changes (Green ↔ Yellow)

**Scenario 3: End Ride**
1. Start a ride
2. Click "End Ride Safely"
3. Verify ride appears in history
4. Check stats updated

**Scenario 4: Community Help**
1. Go to Battle Map
2. Click a yellow pin rider
3. Click "Offer Help"
4. Verify navigation opens

## 🐛 Troubleshooting

### Countdown Not Working
- Check that return time is in the future
- Verify time zone settings in browser

### Data Not Persisting
- Check localStorage is enabled
- Try clearing cache and reloading
- Verify browser supports localStorage

### SMS Alerts Not Sending
- See MAKE_AUTOMATION_GUIDE.md troubleshooting section
- Verify Twilio credentials
- Check phone number format

### Map Not Loading
- Verify Google Maps API key
- Check browser console for errors
- Ensure API key has correct permissions

## 🤝 Contributing

We welcome contributions! Areas we'd love help with:

- [ ] Real GPS integration
- [ ] Mobile native app (React Native)
- [ ] Apple Watch companion
- [ ] Bluetooth helmet integration
- [ ] Group ride coordination
- [ ] Route recommendations

## 📄 License

MIT License - Feel free to use for personal or commercial projects.

## 🙏 Acknowledgments

Built for the motorcycle community, by riders who understand that solo doesn't have to mean alone.

### Inspiration
- Aviation flight plan protocols
- Search & rescue best practices
- Motorcycle touring communities
- Open-source safety tools

## 📞 Support

- **Documentation:** See guides in this repo
- **Issues:** [GitHub Issues](your-repo-url/issues)
- **Community:** [Discord/Forum link]
- **Email:** support@motopulse.app

## 🗺️ Roadmap

### v1.0 (Current - MVP)
- ✅ Flight plan filing
- ✅ Battle map viewer
- ✅ Manual check-ins
- ✅ Local storage

### v1.1 (Next)
- [ ] Airtable integration
- [ ] Make.com automation
- [ ] SMS alerts
- [ ] PWA support

### v2.0 (Future)
- [ ] Real-time GPS tracking
- [ ] Mobile app
- [ ] Group rides
- [ ] Route sharing
- [ ] Weather integration
- [ ] Crash detection

## 💪 Built With

- **Frontend:** Vanilla JavaScript (no frameworks!)
- **Styling:** Pure CSS with custom design system
- **Storage:** Browser localStorage + optional Airtable
- **Automation:** Make.com
- **SMS:** Twilio API
- **Maps:** Google Maps API (optional)

---

**Stay safe out there. File your flight plan. Ride free.** 🏍️💨

*Made with ❤️ by riders, for riders*
