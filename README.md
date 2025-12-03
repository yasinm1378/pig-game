# 🐷 The Pig Game 🎲

> *Because life's too short to not gamble with imaginary pigs*

[![Made with Love](https://img.shields.io/badge/Made%20with-Love-ff69b4.svg)](https://github.com/yasinm1378/pig-game)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

Welcome to **The Pig Game** – where fortune favors the bold, and pigs somehow became associated with dice rolling. This isn't just any dice game; it's a battle of wits, nerves, and questionable decision-making skills!

## 🎯 What's This All About?

The Pig Game is a classic dice game reimagined for the digital age. Two players compete in a high-stakes showdown where greed battles caution, and that innocent little die decides your fate. One wrong roll and *poof* – your points vanish faster than your New Year's resolutions.

Think of it as Vegas, but with fewer lights and more oinking.

## 🎮 How to Play (aka The Sacred Rules)

### The Basics
1. **Two players take turns** rolling a single die (Player 1 vs. Player 2 – may the luckiest win!)
2. **Each roll** gets added to your **current score** for that turn
3. **But here's the twist** 🌪️: Roll a **1** and you lose EVERYTHING from that turn
4. **Feel lucky?** Keep rolling to stack up those points
5. **Feeling nervous?** Hit **HOLD** to bank your current score to your total
6. **First to 100 points** wins! 🏆 (Or whatever winning score you set)

### The Strategy
- **Greedy pigs get slaughtered** 🔪 – Roll too many times and that 1 will haunt you
- **Scared pigs starve** 🍂 – Play it too safe and you'll never reach 100
- **Smart pigs win** 🧠 – Find that sweet spot between risk and reward

> *"To roll or not to roll? That is the question." - William Shakes-pig-eare*

## 🚀 Quick Start

Ready to join the pig party? Here's how:

### Option 1: The Lightning-Fast Way ⚡
```bash
# Just open index.html in your browser. Yes, it's that easy.
open index.html
# or double-click it like it's 1999
```

### Option 2: The Developer Way 💻
```bash
# Clone this bad boy
git clone https://github.com/yasinm1378/pig-game.git

# Navigate to the farm
cd pig-game

# Open in your favorite browser
# Chrome, Firefox, Safari, Opera, Edge... we don't judge
```

### Option 3: The "I'm Fancy" Way 🎩
```bash
# Use a local server (because why not?)
npx serve
# or
python -m http.server 8000
# Then open http://localhost:8000
```

## 🎨 Features That'll Make You Squeal

- ✨ **Sleek UI**: Clean, modern design that doesn't hurt your eyes
- 🎲 **Realistic Dice**: Digital dice that actually looks like it's rolling
- 🔊 **Sound Effects**: (If implemented) Satisfying clicks and cheers
- 📱 **Responsive**: Play on desktop, tablet, or phone – we're inclusive like that
- 🎯 **Score Tracking**: Keep tabs on who's winning (or losing spectacularly)
- 🔄 **New Game Button**: Start fresh after your devastating loss
- 🎨 **Visual Feedback**: Know whose turn it is without squinting
- 🏆 **Winner Animation**: Celebrate in style when you crush your opponent

## 🛠️ Tech Stack

Built with the holy trinity of web development:

- **HTML5** – The bones
- **CSS3** – The beauty
- **Vanilla JavaScript** – The brains (no frameworks needed!)

No npm packages. No build tools. No webpack confusion. Just pure, unadulterated code.

## 🎓 Game Rules (The Fine Print)

### Winning Condition
First player to reach **100 points** (or more) wins the game!

### Detailed Gameplay
1. **Starting**: Player 1 goes first (because someone has to)
2. **Rolling**: Click "Roll Dice" to roll a single die
   - Roll 2-6: Points added to your current score ✅
   - Roll 1: Current score goes to 0, turn ends ❌
3. **Holding**: Click "Hold" to:
   - Add current score to your total score
   - End your turn
   - Pass the dice to your opponent
4. **Winning**: First to 100 total points wins!
5. **New Game**: Reset everything and start the rivalry anew

### Pro Tips 🎯
- **The Rule of 20**: Many players hold when they reach 20+ points per turn
- **Early Aggression**: Be aggressive early; play it safe when ahead
- **Mind Games**: Trash talk is encouraged (but keep it friendly!)
- **The Comeback**: Down 80-20? Time to channel your inner gambling addiction

## 🎨 Screenshots

```
┌─────────────────────────────────────────┐
│                                         │
│     PLAYER 1          🎲          PLAYER 2
│       85                            42   │
│    ┌────────┐                  ┌────────┐
│    │CURRENT │                  │CURRENT │
│    │   14   │                  │   0    │
│    └────────┘                  └────────┘
│                                         │
│         [🎲 ROLL DICE]                  │
│         [💰 HOLD]                       │
│         [🔄 NEW GAME]                   │
│                                         │
└─────────────────────────────────────────┘
```

## 🏗️ Project Structure

```
pig-game/
│
├── index.html          # The stage where magic happens
├── style.css           # Making it pretty since day 1
├── script.js           # Where the sausage is made
├── dice-1.png          # The cursed one
├── dice-2.png          # 
├── dice-3.png          # The dice images
├── dice-4.png          # 
├── dice-5.png          # 
├── dice-6.png          # The golden ticket
└── README.md           # You are here! 📍
```

## 🤝 Contributing

Found a bug? Want to add a feature? Have a pig-related pun?

1. Fork it
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Ideas for Contributions
- 🎨 Add themes (Dark mode, Neon pig, Cyberpig 2077)
- 🎵 Add sound effects
- 🤖 Create an AI opponent
- 🌐 Add multiplayer support
- 📊 Add statistics tracking
- 🏆 Add achievements system
- 🎮 Add game modes (speed pig, extreme pig, zen pig)

## 🐛 Known Issues

- None yet! (Or we're just really good at hiding them)
- If you find any, please create an issue

## 📚 What I Learned

This project is perfect for learning:
- ✅ DOM Manipulation
- ✅ Event Listeners
- ✅ Game State Management
- ✅ CSS Animations
- ✅ JavaScript Logic
- ✅ How pigs became associated with dice games (still unclear)

## 🎭 Fun Facts

- The Pig Game dates back to at least 1945 (older than your grandma's recipes)
- Mathematically, you should hold at 20 points (but where's the fun in that?)
- The probability of rolling a 1 is 16.67% (trust the math, not your feelings)
- This game has caused more friendships to end than Monopoly
- Pigs can't actually roll dice (they lack opposable thumbs)

## 📜 License

This project is licensed under the MIT License – which means you can do whatever you want with it. Build upon it, sell it, trade it for actual pigs, we don't care!

## 🙏 Acknowledgments

- Jonas Schmedtmann for inspiring countless JavaScript learners
- The ancient inventors of the Pig Game (whoever you were)
- Coffee ☕ – The real MVP
- Stack Overflow – For obvious reasons
- My rubber duck 🦆 – Best debugging partner ever

## 💬 Final Words

Remember: In the game of pigs, you either win or you roll a 1.

Now stop reading and start playing! 🎲

---

<div align="center">

**Made with 💖 and questionable life choices**

[⭐ Star this repo](https://github.com/yasinm1378/pig-game) if you're feeling generous!

*"May your rolls be high and your ones be few"* 🐷

</div>

---

## 📞 Contact

Got questions? Found a game-breaking bug? Just want to chat about pigs?

- GitHub: [@yasinm1378](https://github.com/yasinm1378)
- Issues: [Report here](https://github.com/yasinm1378/pig-game/issues)

---

<div align="center">

### 🎮 Ready to Play?

**[PLAY NOW](https://yasinm1378.github.io/pig-game)** | **[Report Bug](https://github.com/yasinm1378/pig-game/issues)** | **[Request Feature](https://github.com/yasinm1378/pig-game/issues)**

</div>
