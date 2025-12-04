# 🐷 Pig Game Deluxe

> *Because life's too short to not gamble with imaginary pigs!*

A modern, feature-rich implementation of the classic Pig dice game. Play locally, against AI, or challenge friends online with real-time multiplayer!

![Pig Game Screenshot](assets/screenshot.png)

## ✨ Features

- 🎲 **Classic Mode** - Traditional two-player local gameplay
- ⚡ **Speed Mode** - 30-second turn timer for intense gameplay
- 🤖 **vs AI** - Four difficulty levels with unique strategies
- 🌐 **Online Multiplayer** - Real-time play with friends via invite links
- 📊 **Statistics** - Track games played, wins, and streaks (persisted locally)
- ⌨️ **Keyboard Controls** - Space to roll, Enter to hold, N for new game
- 🎨 **Beautiful UI** - Smooth animations and responsive design

## 🎮 How to Play

1. **Roll the dice** - Click "Roll" or press `Space`
2. **Accumulate points** - Each roll adds to your current score
3. **Watch out for 1s!** - Rolling a 1 loses your current score
4. **Hold to bank** - Click "Hold" or press `Enter` to save your points
5. **First to 100 wins!** - (Customizable winning score)

## 🏗️ Project Structure

```
pig-game/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styling
├── js/
│   ├── main.js         # Entry point & event handling
│   ├── game.js         # Core game logic
│   ├── ui.js           # DOM manipulation
│   ├── ai.js           # AI opponent logic
│   ├── online.js       # Firebase multiplayer
│   └── utils.js        # Helper functions
├── assets/             # Images, sounds (if any)
└── README.md           # You are here!
```

## 🚀 Quick Start (Local Play)

Just open `index.html` in your browser! No build step required.

```bash
# Clone the repo
git clone https://github.com/yasinm1378/pig-game.git
cd pig-game

# Open in browser
open index.html
# or use a local server
npx serve
```

---

## 🔥 Firebase Setup (For Online Multiplayer)

To enable online multiplayer, you need to set up Firebase Realtime Database. Follow these steps:

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** (or "Add project")
3. Enter a project name (e.g., "pig-game-online")
4. Disable Google Analytics (optional, not needed for this project)
5. Click **"Create project"**

### Step 2: Enable Realtime Database

1. In your Firebase project, click **"Build"** in the left sidebar
2. Select **"Realtime Database"**
3. Click **"Create Database"**
4. Choose a location (pick the closest to your users)
5. Start in **"Test mode"** (we'll secure it later)
6. Click **"Enable"**

### Step 3: Get Your Firebase Config

1. Click the **gear icon** ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"**
4. Click the **web icon** `</>`
5. Register your app with a nickname (e.g., "pig-game-web")
6. You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "pig-game-online.firebaseapp.com",
  databaseURL: "https://pig-game-online-default-rtdb.firebaseio.com",
  projectId: "pig-game-online",
  storageBucket: "pig-game-online.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 4: Add Config to Your Project

1. Open `js/online.js`
2. Find the `FIREBASE_CONFIG` object at the top
3. Replace the placeholder values with your actual config:

```javascript
const FIREBASE_CONFIG = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Step 5: Set Up Database Security Rules

1. In Firebase Console, go to **Realtime Database** → **Rules**
2. Replace the rules with:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        // Auto-delete rooms after 30 minutes of inactivity
        ".validate": "newData.hasChildren(['code', 'createdAt'])"
      }
    }
  }
}
```

> ⚠️ **Note:** These rules allow anyone to read/write rooms. For production, add authentication!

### Step 6: Test Online Mode

1. Open your game in a browser
2. Click **"🌐 Online"** mode
3. Click **"Create Room"**
4. Copy the invite link
5. Open the link in another browser/tab
6. Play! 🎉

---

## 🚀 Deploying to Vercel

Vercel makes it super easy to deploy static sites. Here's how:

### Option A: Deploy via Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com) and sign up/log in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository:
   - Click **"Import Git Repository"**
   - Select your `pig-game` repo
4. Configure the project:
   - **Framework Preset:** Other
   - **Root Directory:** `./` (leave as is)
   - **Build Command:** (leave empty)
   - **Output Directory:** `./` (leave as is)
5. Click **"Deploy"**
6. Wait for deployment (usually < 1 minute)
7. Your site is live! 🎉

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Navigate to your project:
```bash
cd pig-game
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts:
   - Set up and deploy? `Y`
   - Which scope? (select your account)
   - Link to existing project? `N`
   - Project name? `pig-game` (or your choice)
   - Directory? `./`
   - Override settings? `N`

5. Your site is deployed! The CLI will show your URL.

### Option C: Deploy via GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **"Add New..."** → **"Project"**
4. Connect your GitHub account
5. Select the `pig-game` repository
6. Click **"Deploy"**

Now every push to `main` will auto-deploy!

### Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions

---

## 🔧 Configuration Options

### Winning Score
Change the default winning score by modifying the input value in the UI, or edit `index.html`:
```html
<input type="number" id="winning-score" value="100" ...>
```

### AI Difficulty Levels

| Level | Strategy | Hold Threshold |
|-------|----------|----------------|
| Cautious Carl | Very safe | ~12 points |
| Balanced Betty | Moderate | ~18 points |
| Risky Rick | Aggressive | ~28 points |
| Optimal Otto | Adaptive | Based on game state |

### Speed Mode Timer
Modify the timer duration in `js/game.js`:
```javascript
state.timerCleanup = UI.startTimer(state.activePlayer, 30, () => { // 30 seconds
```

---

## 🎯 Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling, animations, CSS Grid/Flexbox
- **Vanilla JavaScript** - ES6 modules, no frameworks
- **Firebase** - Realtime Database for multiplayer
- **Vercel** - Hosting and deployment

---

## 🤝 Contributing

Found a bug? Want to add a feature? PRs are welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📋 Future Ideas

- [ ] Sound effects
- [ ] Dark/light theme toggle
- [ ] Player name customization
- [ ] Match history
- [ ] Achievements system
- [ ] Spectator mode
- [ ] Tournament brackets

---

## 📜 License

MIT License - do whatever you want with it!

---

## 🙏 Credits

- Game concept: Traditional Pig dice game (circa 1945)
- Inspired by: Jonas Schmedtmann's JavaScript course
- Built with: ☕ and questionable life choices

---

<p align="center">
  <b>May your rolls be high and your ones be few! 🐷🎲</b>
</p>

---

## 📞 Contact

- GitHub: [@yasinm1378](https://github.com/yasinm1378)
- Issues: [Report bugs here](https://github.com/yasinm1378/pig-game/issues)
