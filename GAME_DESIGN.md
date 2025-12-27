# WHITEHAT PROTOCOL - Game Design Document

## 1. Game Overview

**Genre:** Cooperative Think Game / Security Simulation
**Players:** 2 Human + 2 AI Systems
**Platform:** Web-based multiplayer
**Theme:** Ethical penetration testing education

**Core Philosophy:**
- This is NOT real hacking
- All attacks are conceptual security test simulations
- Focus on education, reasoning, and ethical security practices
- No illegal content or real vulnerability exploitation

---

## 2. Game Structure

### 2.1 Player Roles

#### Whitehats (2 players - Cooperative)
1. **Analyst Hacker**
   - Interprets logs and metrics
   - Analyzes vulnerability patterns
   - Must agree with Attack Hacker to proceed

2. **Attack Hacker**
   - Selects test attacks
   - Proposes defense patches
   - Must agree with Analyst Hacker to proceed

**Cooperation Requirement:** Both must vote YES to execute any action

#### AI Systems (2 automated systems)
AI-controlled systems that respond automatically:

| System | Responsibility | Hidden Security State |
|--------|----------------|----------------------|
| CLIENT SIDE | Authentication + UI (user-facing) | [WEAK / NORMAL / STRONG] |
| SERVER SIDE | Database + Server + Network (backend) | [WEAK / NORMAL / STRONG] |

**AI Behavior:**
- Automatically initialized with random security states
- Respond to attacks based on their security level
- No human interaction needed
- Hidden states remain secret from whitehats

---

## 3. Round Flow Logic

### Phase 1: RECONNAISSANCE (30 sec)
- Whitehats discuss strategy
- System modules prepare their defenses
- No actions executed

### Phase 2: ATTACK SELECTION (45 sec)
- Attack Hacker proposes test attack
- Analyst Hacker reviews and votes
- Both must agree to proceed

### Phase 3: EXECUTION (Auto)
- System calculates attack results
- Each module responds based on hidden security state
- No direct success/failure messages

### Phase 4: LOG ANALYSIS (60 sec)
- Abstract logs displayed:
  - "Vulnerability Response Index: 0.67"
  - "Alert Level: ELEVATED"
  - "Affected Modules: 2"
  - "Response Time Anomaly: +340ms"
- Whitehats interpret data
- System modules see their own response only

### Phase 5: DEFENSE PATCH (30 sec)
- Whitehats select ONE patch to apply
- Patch affects next round's responses
- System modules notified if they receive patch

### Phase 6: ROUND END
- Security level recalculated
- Alert level updated
- Next round begins or game ends

**Total Round Time:** ~3-4 minutes
**Total Rounds:** 8 rounds maximum

---

## 4. Attack System (Security Tests)

All attacks are **conceptual simulations** for educational purposes:

| Attack Code | Full Name | Target Modules | Description |
|-------------|-----------|----------------|-------------|
| PHISH_TEST | Social Engineering Test | AUTH, UI | Tests human factor vulnerabilities |
| BRUTE_SIM | Authentication Strength Test | AUTH | Simulates credential testing |
| INJECT_SIM | Input Validation Test | DATABASE, SERVER | Tests SQL/command injection resistance |
| DOS_SIM | Load Capacity Test | NETWORK, SERVER | Tests system resilience |
| MISCONFIG_SCAN | Configuration Audit | ALL MODULES | Scans for configuration weaknesses |

### Attack Response Matrix

Module security state affects response:

| Security State | Vulnerability Index | Alert Increase | Response Time |
|----------------|--------------------:|---------------:|--------------:|
| WEAK | 0.8 - 1.0 | +2 levels | +400-600ms |
| NORMAL | 0.4 - 0.6 | +1 level | +100-200ms |
| STRONG | 0.0 - 0.2 | +0 levels | +0-50ms |

**Log Output Format:**
```
> EXECUTING: INJECT_SIM
> Scanning input validation layers...
> Vulnerability Response Index: 0.72
> Alert Level: MODERATE → ELEVATED
> Affected Modules: 2
> Response Time Anomaly: +340ms
> Abnormal behavior patterns detected
> Test complete. Analyze data.
```

**Key:** No direct identification of which modules are vulnerable

---

## 5. Defense System (Patches)

Whitehats can apply ONE patch per round:

| Patch Type | Effect | Duration |
|------------|--------|----------|
| AUTH_HARDENING | Reduces BRUTE_SIM vulnerability by 30% | 2 rounds |
| INPUT_VALIDATION | Reduces INJECT_SIM vulnerability by 40% | 2 rounds |
| MONITORING_ENHANCE | Reveals more detailed logs | 3 rounds |
| NETWORK_STABILIZE | Reduces DOS_SIM vulnerability by 35% | 2 rounds |

**Patch Mechanics:**
- Improves specific module's resistance temporarily
- System modules notified if they receive patch
- Multiple patches can stack
- Whitehats must deduce which module needs patch

---

## 6. Victory & Defeat Conditions

### Victory (Whitehats Win)
Achieve ALL of the following by Round 8:
1. Correctly identify 3+ vulnerable modules
2. System Security Level reaches SECURE (≥ 70%)
3. Alert Level below CRITICAL

### Defeat (System Fails)
Any of the following triggers defeat:
1. Alert Level reaches MAXIMUM (level 10)
2. 4+ modules in COMPROMISED state
3. Round 8 ends without victory conditions

### Security Level Calculation
```
Security Level = (Strong Modules × 20 + Normal × 10) / 100 × 100%
```

---

## 7. UI Design Specification

### 7.1 Visual Theme
- **Style:** Terminal / Command-line aesthetic
- **Colors:**
  - Background: #0a0e1a (dark blue-black)
  - Primary text: #00ff41 (matrix green)
  - Warning: #ffaa00 (amber)
  - Critical: #ff3333 (red)
  - Info: #00aaff (cyan)
- **Font:** Monospace (Courier New, Consolas)
- **Animations:** Typing effect for logs, subtle scanlines

### 7.2 Screen Layouts

#### Lobby Screen
```
┌─────────────────────────────────────┐
│  WHITEHAT PROTOCOL v1.0             │
│  [Secure Connection Established]    │
├─────────────────────────────────────┤
│  > CREATE ROOM                      │
│  > JOIN ROOM [____]                 │
│                                     │
│  Room Code: XXXX                    │
│  Players: 2/7                       │
│                                     │
│  [SELECT ROLE]                      │
│  • Analyst Hacker                   │
│  • Attack Hacker                    │
│  • Module: AUTH                     │
│  • Module: NETWORK                  │
│  ...                                │
└─────────────────────────────────────┘
```

#### Whitehat View (During Game)
```
┌─────────────────────────────────────┐
│ ROUND 3/8 | PHASE: ATTACK SELECTION │
│ Security: 45% | Alert: ELEVATED     │
├─────────────────────────────────────┤
│ SYSTEM LOG:                         │
│ > Previous: BRUTE_SIM executed      │
│ > Vuln Index: 0.67                  │
│ > Affected: 2 modules               │
│ > Response anomaly: +340ms          │
│                                     │
├─────────────────────────────────────┤
│ SELECT TEST ATTACK:                 │
│ [ ] PHISH_TEST                      │
│ [x] INJECT_SIM  ← Attack Hacker     │
│ [ ] DOS_SIM     ← Analyst (pending) │
│                                     │
│ SELECT PATCH (1 per round):         │
│ [ ] AUTH_HARDENING                  │
│ [ ] INPUT_VALIDATION                │
│                                     │
│ [VOTE: YES] [VOTE: NO]              │
└─────────────────────────────────────┘
```

#### Module View (During Game)
```
┌─────────────────────────────────────┐
│ MODULE: DATABASE                    │
│ Status: NORMAL | Alert: ELEVATED    │
├─────────────────────────────────────┤
│ YOUR SECURITY STATE:                │
│ [████████░░] NORMAL                 │
│                                     │
│ RECENT TEST RESULTS:                │
│ > INJECT_SIM received               │
│ > Your response: VULNERABLE         │
│ > Response time: +420ms             │
│ > (This info is private)            │
│                                     │
│ PATCHES RECEIVED:                   │
│ • INPUT_VALIDATION (2 rounds left)  │
│                                     │
│ WAITING FOR WHITEHATS...            │
│ Phase: Attack Selection             │
└─────────────────────────────────────┘
```

### 7.3 Responsive Design
- Desktop: Side-by-side panels
- Tablet: Stacked panels with tabs
- Mobile: Single-column, swipeable sections

---

## 8. Technical Implementation Notes

### 8.1 Tech Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js + Express
- **Real-time:** Socket.io
- **Data:** In-memory (no database for MVP)

### 8.2 Key Functions

```javascript
// Attack resolution
function resolveAttack(attackType, modules) {
  let totalVulnIndex = 0;
  let affectedCount = 0;

  modules.forEach(module => {
    if (isVulnerableTo(module, attackType)) {
      totalVulnIndex += getVulnIndex(module.security);
      affectedCount++;
    }
  });

  return {
    vulnIndex: totalVulnIndex / modules.length,
    affectedCount,
    alertIncrease: calculateAlertIncrease(totalVulnIndex)
  };
}
```

### 8.3 Security Considerations
- No real vulnerability scanning
- No external network access from game
- All "attacks" are local calculations
- Educational disclaimers prominently displayed

---

## 9. Educational Value

This game teaches:
1. **Security Mindset:** Think like an ethical penetration tester
2. **Inference Skills:** Interpret indirect data
3. **Cooperation:** Team communication is essential
4. **Defense Prioritization:** Limited resources require smart choices
5. **Risk Assessment:** Balance testing vs. system stability

**Disclaimer (shown in-game):**
"This is an educational simulation. All activities are fictional and for learning purposes only. Real-world hacking without authorization is illegal and unethical."

---

## 10. Future Enhancements

- Campaign mode with multiple scenarios
- Difficulty levels
- Achievement system
- Replay analysis
- AI-controlled modules for smaller groups
- Voice chat integration
- Tournament mode

---

**Document Version:** 1.0
**Last Updated:** 2025-12-27
**Status:** Ready for Implementation
