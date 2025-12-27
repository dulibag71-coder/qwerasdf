# WHITEHAT PROTOCOL

**Educational Cooperative Security Simulation Game**

![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Educational](https://img.shields.io/badge/purpose-educational-orange)

## ⚠️ DISCLAIMER

**This is an educational simulation game for learning security concepts.**

- All activities are fictional and for learning purposes only
- No real hacking or vulnerability exploitation occurs
- Real-world hacking without authorization is illegal and unethical
- This game teaches ethical penetration testing concepts only

---

## 📖 Overview

**WHITEHAT PROTOCOL** is a cooperative multiplayer think game where players work together to identify and patch security vulnerabilities in a simulated system. The game emphasizes:

- **Ethical security testing** - Learn white hat hacking principles
- **Deductive reasoning** - Analyze indirect data to find vulnerabilities
- **Team cooperation** - Whitehats must work together
- **Risk management** - Balance testing vs. system stability

### Game Stats
- **Players:** 4 (2 Whitehats + 2 System Roles)
- **Duration:** 8 rounds (~20-25 minutes)
- **Platform:** Web-based multiplayer
- **Age:** 14+ (educational purposes)

---

## 🎮 How to Play

### Roles

#### Whitehats (2 players - Cooperative)
1. **Analyst Hacker** - Interprets logs and metrics
2. **Attack Hacker** - Executes security tests

**Both must agree to take any action!**

#### System Roles (2 players)
- **CLIENT SIDE** - Authentication + UI (user-facing layer)
- **SERVER SIDE** - Database + Server + Network (backend layer)

Each system has a **hidden security state**: WEAK / NORMAL / STRONG

---

## 🎯 Objective

### Victory Conditions (All required)
- Identify 1+ vulnerable system correctly
- Reach Security Level ≥ 70%
- Keep Alert Level below CRITICAL

### Defeat Conditions (Any triggers defeat)
- Alert Level reaches MAXIMUM
- Both systems compromised
- Round 8 ends without victory

---

## 🚀 Quick Start

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd whitehat-protocol
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the server**
```bash
npm start
```

4. **Open in browser**
```
http://localhost:3000
```

### Requirements
- Node.js 14+
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for multiplayer

---

## 🌐 Online Deployment

Deploy your game online for FREE in minutes!

### Quick Deploy to Render.com (Recommended)

1. **Push to GitHub** (already done!)
2. **Sign up at [render.com](https://render.com)** with GitHub
3. **Create New Web Service** → Connect your repository
4. **Select branch:** `claude/check-file-storage-XD92m`
5. **Click "Create Web Service"** (auto-detects settings from `render.yaml`)
6. **Wait 5 minutes** → Your game is LIVE! 🎉

**Your URL:** `https://whitehat-protocol.onrender.com`

### Other Options
- **Railway.app** - Fast and simple
- **Fly.io** - Global edge deployment
- **Heroku** - Classic option (paid)

📖 **See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions**

---

## 🎲 Gameplay Guide

### Game Flow

Each round consists of 6 phases:

1. **RECONNAISSANCE** (30s)
   - Whitehats discuss strategy
   - Modules prepare defenses

2. **ATTACK SELECTION** (45s)
   - Whitehats select a security test
   - Both must vote YES to proceed

3. **EXECUTION** (Auto)
   - Test attack executes
   - System responds

4. **LOG ANALYSIS** (60s)
   - Review attack results
   - Analyze vulnerability indicators
   - Data is intentionally vague - you must deduce!

5. **DEFENSE PATCH** (30s)
   - Whitehats apply ONE patch
   - Improves system defenses

6. **ROUND END** (10s)
   - Check victory/defeat conditions
   - Next round begins

---

## 🔧 Attack Types

All attacks are **educational simulations** - no real hacking occurs!

| Attack | Description | Targets |
|--------|-------------|---------|
| **PHISH_TEST** | Social engineering resistance | CLIENT SIDE |
| **BRUTE_SIM** | Authentication strength | CLIENT SIDE |
| **INJECT_SIM** | Input validation | SERVER SIDE |
| **DOS_SIM** | Load capacity | SERVER SIDE |
| **MISCONFIG_SCAN** | Configuration audit | ALL SYSTEMS |

### Reading Attack Results

Results are intentionally indirect - you must analyze:
- **Vulnerability Response Index** (0.0-1.0) - Higher = more vulnerable
- **Alert Level** - How suspicious the activity looks
- **Affected Modules** - Count (not specific modules)
- **Response Time Anomaly** - Unusual delays indicate issues

**Example:**
```
> EXECUTING: INJECT_SIM
> Vulnerability Response Index: 0.72
> Alert Level: MODERATE → ELEVATED
> Affected Modules: 2
> Response Time Anomaly: +340ms
```

**Analysis:** High vuln index (0.72) + 2 affected modules suggests DATABASE and/or SERVER are vulnerable to injection attacks.

---

## 🛡️ Defense Patches

Whitehats can apply ONE patch per round:

| Patch | Effect | Duration |
|-------|--------|----------|
| **AUTH_HARDENING** | -30% BRUTE_SIM vulnerability | 2 rounds |
| **INPUT_VALIDATION** | -40% INJECT_SIM vulnerability | 2 rounds |
| **MONITORING_ENHANCE** | More detailed logs | 3 rounds |
| **NETWORK_STABILIZE** | -35% DOS_SIM vulnerability | 2 rounds |

---

## 💡 Strategy Tips

### For Whitehats
1. **Start broad** - Use MISCONFIG_SCAN to test all modules
2. **Look for patterns** - High response times often indicate vulnerability
3. **Communicate constantly** - Both hackers must agree
4. **Patch strategically** - Focus on modules you suspect are weak
5. **Don't max out alerts** - Balance testing with system stability

### For Modules
1. **Keep your security state secret** - Don't reveal if you're weak!
2. **Observe patterns** - Learn which attacks affect you
3. **Track patches** - Know what defenses you've received
4. **Support whitehats** - Your goal is cooperative success

---

## 📁 Project Structure

```
whitehat-protocol/
├── server.js              # Node.js server with Socket.io
├── package.json           # Dependencies
├── GAME_DESIGN.md         # Complete design document
├── README.md              # This file
└── public/
    ├── index.html         # Main game interface
    ├── css/
    │   └── style.css      # Terminal-style UI
    └── js/
        └── main.js        # Client-side game logic
```

---

## 🔧 Technical Details

### Tech Stack
- **Backend:** Node.js + Express
- **Real-time:** Socket.io
- **Frontend:** Vanilla JavaScript (no frameworks)
- **Styling:** CSS3 with terminal aesthetic

### Key Features
- Real-time multiplayer synchronization
- Room-based matchmaking
- Role-based gameplay
- Mobile/tablet responsive design
- No database required (in-memory state)

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🎨 UI Design

The game features a **terminal/command-line aesthetic**:
- Matrix green (#00ff41) primary color
- Cyber blue (#00aaff) for highlights
- Amber (#ffaa00) for warnings
- Red (#ff3333) for critical alerts
- Monospace fonts (Courier New, Consolas)
- Subtle scanline effects
- Minimal animations for professional feel

---

## 🐛 Troubleshooting

### Connection Issues
- Ensure server is running on port 3000
- Check firewall settings
- Try `localhost` instead of IP address

### Game Won't Start
- Need minimum 5 players (2 whitehats + 3 modules)
- All players must select roles
- First whitehat to join can start game

### UI Issues
- Clear browser cache
- Try different browser
- Check console for errors (F12)

---

## 📚 Educational Value

This game teaches:
- **Security fundamentals** - Attack vectors and defenses
- **Ethical hacking** - Authorized testing mindset
- **Log analysis** - Interpreting security data
- **Risk assessment** - Balancing security vs. operations
- **Team communication** - Cooperative problem-solving
- **Deductive reasoning** - Making decisions with incomplete info

Perfect for:
- Cybersecurity students
- IT training programs
- Security awareness workshops
- Team building exercises
- Game-based learning

---

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional attack types
- More complex patch mechanics
- AI-controlled modules for smaller groups
- Campaign mode with scenarios
- Achievement system
- Voice chat integration

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

Created for educational purposes to promote:
- Ethical security practices
- Cybersecurity awareness
- Cooperative gaming
- Critical thinking skills

---

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check GAME_DESIGN.md for detailed mechanics
- Review server logs for debugging

---

## 🎓 Learning Resources

To learn more about the concepts in this game:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Penetration Testing Basics](https://www.offensive-security.com/)
- [Ethical Hacking Fundamentals](https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/)

**Remember: Always practice security testing ethically and with proper authorization!**

---

**Made with 💚 for education and security awareness**

**Version:** 1.0.0
**Status:** Ready to Play
**Educational Use:** ✓ Approved
