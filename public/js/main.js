// WHITEHAT PROTOCOL - Client-side JavaScript
// Educational Security Simulation Game

const socket = io();

// Game state
let gameState = {
  playerName: '',
  playerRole: '',
  roomCode: '',
  currentPhase: '',
  round: 0,
  isWhitehat: false,
  moduleData: null
};

// DOM Elements
const lobbyScreen = document.getElementById('lobby-screen');
const gameScreen = document.getElementById('game-screen');
const gameoverScreen = document.getElementById('gameover-screen');

const playerNameInput = document.getElementById('player-name');
const roomCodeInput = document.getElementById('room-code');
const createRoomBtn = document.getElementById('create-room-btn');
const joinRoomBtn = document.getElementById('join-room-btn');

const lobbyMain = document.getElementById('lobby-main');
const roleSelection = document.getElementById('role-selection');
const currentRoomCodeSpan = document.getElementById('current-room-code');
const playerCountSpan = document.getElementById('player-count');
const playersContainer = document.getElementById('players-container');
const startGameBtn = document.getElementById('start-game-btn');

const whitehatView = document.getElementById('whitehat-view');
const moduleView = document.getElementById('module-view');

const roundNumber = document.getElementById('round-number');
const currentPhaseSpan = document.getElementById('current-phase');
const securityLevelSpan = document.getElementById('security-level');
const alertLevelSpan = document.getElementById('alert-level');

const systemLog = document.getElementById('system-log');
const attackSelectionUI = document.getElementById('attack-selection-ui');
const patchSelectionUI = document.getElementById('patch-selection-ui');
const waitingUI = document.getElementById('waiting-ui');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  addLogEntry(systemLog, 'System initialized. Ready for connection.', 'info');
});

// Setup Event Listeners
function setupEventListeners() {
  createRoomBtn.addEventListener('click', handleCreateRoom);
  joinRoomBtn.addEventListener('click', handleJoinRoom);
  startGameBtn.addEventListener('click', handleStartGame);

  // Role selection buttons
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const role = e.currentTarget.getAttribute('data-role');
      handleRoleSelection(role);
    });
  });

  // Attack buttons
  document.querySelectorAll('.attack-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const attack = e.currentTarget.getAttribute('data-attack');
      handleAttackSelection(attack);
    });
  });

  // Patch buttons
  document.querySelectorAll('.patch-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const patch = e.currentTarget.getAttribute('data-patch');
      handlePatchSelection(patch);
    });
  });

  // Identify vulnerability button
  const identifyBtn = document.getElementById('identify-vuln-btn');
  if (identifyBtn) {
    identifyBtn.addEventListener('click', handleIdentifyVulnerability);
  }

  // Return to lobby button
  const returnLobbyBtn = document.getElementById('return-lobby-btn');
  if (returnLobbyBtn) {
    returnLobbyBtn.addEventListener('click', () => {
      location.reload();
    });
  }

  // Enter key handlers
  playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleCreateRoom();
  });

  roomCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleJoinRoom();
  });
}

// Create Room
function handleCreateRoom() {
  const name = playerNameInput.value.trim();
  if (!name) {
    alert('Please enter your callsign');
    return;
  }

  gameState.playerName = name;

  socket.emit('create-room', (response) => {
    if (response.success) {
      gameState.roomCode = response.roomCode;
      showRoleSelection();
      addLogEntry(systemLog, `Room created: ${response.roomCode}`, 'info');
    } else {
      alert('Failed to create room');
    }
  });
}

// Join Room
function handleJoinRoom() {
  const name = playerNameInput.value.trim();
  const code = roomCodeInput.value.trim().toUpperCase();

  if (!name || !code) {
    alert('Please enter your callsign and room code');
    return;
  }

  gameState.playerName = name;
  gameState.roomCode = code;

  showRoleSelection();
}

// Show Role Selection
function showRoleSelection() {
  lobbyMain.style.display = 'none';
  roleSelection.style.display = 'block';
  currentRoomCodeSpan.textContent = gameState.roomCode;
}

// Handle Role Selection
function handleRoleSelection(role) {
  if (!gameState.playerName || !gameState.roomCode) return;

  socket.emit('join-room', {
    roomCode: gameState.roomCode,
    playerName: gameState.playerName,
    role: role
  }, (response) => {
    if (response.success) {
      gameState.playerRole = role;
      gameState.isWhitehat = (role === 'analyst' || role === 'attacker');

      // Update UI
      document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.remove('selected');
      });
      document.querySelector(`[data-role="${role}"]`).classList.add('selected');

      addLogEntry(systemLog, `Role selected: ${role.toUpperCase()}`, 'info');
    } else {
      alert(response.error || 'Failed to join room');
    }
  });
}

// Handle Start Game
function handleStartGame() {
  socket.emit('start-game');
}

// Handle Attack Selection
function handleAttackSelection(attack) {
  const isAnalyst = gameState.playerRole === 'analyst';
  const isAttacker = gameState.playerRole === 'attacker';

  if (!isAnalyst && !isAttacker) return;

  // Toggle selection
  const btn = document.querySelector(`[data-attack="${attack}"]`);
  const isSelected = btn.classList.contains('selected');

  document.querySelectorAll('.attack-btn').forEach(b => b.classList.remove('selected'));

  if (!isSelected) {
    btn.classList.add('selected');
    socket.emit('vote-attack', { attack, vote: true });
  } else {
    socket.emit('vote-attack', { attack, vote: false });
  }
}

// Handle Patch Selection
function handlePatchSelection(patch) {
  const isAnalyst = gameState.playerRole === 'analyst';
  const isAttacker = gameState.playerRole === 'attacker';

  if (!isAnalyst && !isAttacker) return;

  socket.emit('select-patch', { patch });

  document.querySelectorAll('.patch-btn').forEach(b => b.classList.remove('selected'));
  document.querySelector(`[data-patch="${patch}"]`).classList.add('selected');

  addLogEntry(systemLog, `Patch selected: ${patch}`, 'info');
}

// Handle Identify Vulnerability
function handleIdentifyVulnerability() {
  const module = prompt('Enter module name to identify (auth/network/database/server/ui/monitor):');
  if (module) {
    socket.emit('identify-vulnerability', { module: module.toLowerCase() });
  }
}

// Add Log Entry
function addLogEntry(logElement, message, type = 'info') {
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;

  const timestamp = new Date().toLocaleTimeString();
  entry.innerHTML = `<span style="color: #666">[${timestamp}]</span> ${message}`;

  logElement.appendChild(entry);
  logElement.scrollTop = logElement.scrollHeight;
}

// Update Alert Level Display
function getAlertLevelText(level) {
  if (level === 0) return 'SAFE';
  if (level <= 2) return 'LOW';
  if (level <= 4) return 'MODERATE';
  if (level <= 6) return 'ELEVATED';
  if (level <= 8) return 'HIGH';
  return 'CRITICAL';
}

// Socket Event Handlers
socket.on('room-update', (data) => {
  playerCountSpan.textContent = `${data.players.length}/4`;

  // Update players list
  playersContainer.innerHTML = '';
  data.players.forEach(player => {
    const playerItem = document.createElement('div');
    playerItem.className = 'player-item';
    playerItem.textContent = `${player.name} - ${player.role.toUpperCase()}`;
    playersContainer.appendChild(playerItem);
  });

  // Update role buttons
  document.querySelectorAll('.role-btn').forEach(btn => {
    const role = btn.getAttribute('data-role');
    const isTaken = data.players.some(p => p.role === role);

    if (isTaken && role !== gameState.playerRole) {
      btn.classList.add('taken');
      btn.disabled = true;
    } else {
      btn.classList.remove('taken');
      btn.disabled = false;
    }
  });

  // Show start button if all 4 players connected and you're the first player
  if (data.players.length >= 4 && data.players[0].role === gameState.playerRole) {
    startGameBtn.style.display = 'block';
  }
});

socket.on('game-started', (data) => {
  lobbyScreen.classList.remove('active');
  gameScreen.classList.add('active');

  gameState.currentPhase = data.phase;
  gameState.round = data.round;

  roundNumber.textContent = data.round;
  currentPhaseSpan.textContent = data.phase.replace(/_/g, ' ').toUpperCase();

  // Show appropriate view
  if (gameState.isWhitehat) {
    whitehatView.style.display = 'grid';
    moduleView.style.display = 'none';
    addLogEntry(systemLog, 'WHITEHAT PROTOCOL INITIATED', 'info');
    addLogEntry(systemLog, 'Your mission: Identify system vulnerabilities through ethical testing', 'info');
  } else {
    whitehatView.style.display = 'none';
    moduleView.style.display = 'grid';

    // Set module name
    document.getElementById('module-name').textContent = gameState.playerRole.toUpperCase();

    addLogEntry(document.getElementById('module-log'), `Module ${gameState.playerRole.toUpperCase()} online`, 'info');
  }
});

socket.on('phase-change', (data) => {
  gameState.currentPhase = data.phase;
  gameState.round = data.round;

  roundNumber.textContent = data.round;
  currentPhaseSpan.textContent = data.phase.replace(/_/g, ' ').toUpperCase();

  // Update UI based on phase
  if (gameState.isWhitehat) {
    attackSelectionUI.style.display = 'none';
    patchSelectionUI.style.display = 'none';
    waitingUI.style.display = 'block';

    if (data.phase === 'attack_selection') {
      attackSelectionUI.style.display = 'block';
      waitingUI.style.display = 'none';
      addLogEntry(systemLog, '> Phase: SELECT SECURITY TEST', 'info');
    } else if (data.phase === 'defense_patch') {
      patchSelectionUI.style.display = 'block';
      waitingUI.style.display = 'none';
      addLogEntry(systemLog, '> Phase: APPLY DEFENSE PATCH', 'info');
    } else if (data.phase === 'reconnaissance') {
      addLogEntry(systemLog, '> Phase: RECONNAISSANCE - Analyze previous results', 'info');
    }
  }

  addLogEntry(document.getElementById('module-log'), `Phase: ${data.phase.toUpperCase()}`, 'info');
});

socket.on('vote-update', (data) => {
  if (!gameState.isWhitehat) return;

  const analystVoteSpan = document.getElementById('analyst-vote');
  const attackerVoteSpan = document.getElementById('attacker-vote');

  if (analystVoteSpan) {
    analystVoteSpan.textContent = data.analystVote || '---';
  }
  if (attackerVoteSpan) {
    attackerVoteSpan.textContent = data.attackerVote || '---';
  }
});

socket.on('attack-executed', (data) => {
  const log = data.log;

  if (gameState.isWhitehat) {
    addLogEntry(systemLog, '', 'info');
    addLogEntry(systemLog, `> EXECUTING: ${log.attack}`, 'info');
    addLogEntry(systemLog, `> Test: ${log.attackName}`, 'info');
    addLogEntry(systemLog, `> Scanning target systems...`, 'info');

    setTimeout(() => {
      addLogEntry(systemLog, `> Vulnerability Response Index: ${log.vulnIndex}`,
        log.vulnIndex > 0.7 ? 'warning' : 'info');
      addLogEntry(systemLog, `> Alert Level: ${getAlertLevelText(log.alertLevel)}`,
        log.alertLevel > 6 ? 'critical' : 'warning');
      addLogEntry(systemLog, `> Affected Modules: ${log.affectedCount}`, 'warning');
      addLogEntry(systemLog, `> Response Time Anomaly: +${log.responseTime}ms`, 'info');
      addLogEntry(systemLog, `> Test complete. Analyze data.`, 'info');

      // Update alert level
      alertLevelSpan.textContent = getAlertLevelText(log.alertLevel);
    }, 1000);
  } else {
    addLogEntry(document.getElementById('module-log'), `Security test received: ${log.attack}`, 'warning');
  }
});

socket.on('module-private-data', (data) => {
  if (gameState.isWhitehat) return;

  gameState.moduleData = data;

  // Update module security display
  const securityFill = document.getElementById('security-fill');
  const securityText = document.getElementById('security-text');
  const moduleResponse = document.getElementById('module-response');
  const modulePatches = document.getElementById('module-patches');

  // Note: We don't show the actual security state to maintain secrecy
  // Just show if we responded vulnerably

  if (data.lastResponse) {
    const response = data.lastResponse;

    let responseHTML = `
      <div style="margin: 10px 0;">
        <strong>Attack:</strong> ${response.attack}<br>
        <strong>Your Response:</strong> ${response.vulnerable ?
          '<span style="color: #ffaa00;">VULNERABLE DETECTED</span>' :
          '<span style="color: #00ff41;">PASSED</span>'}<br>
        <strong>Response Time:</strong> +${Math.round(response.responseTime)}ms<br>
        <strong>Vuln Index:</strong> ${response.vulnIndex.toFixed(2)}
      </div>
      <p class="small-text" style="color: #666;">⚠️ This information is private to you</p>
    `;

    moduleResponse.innerHTML = responseHTML;
  }

  // Show patches
  if (data.patches && data.patches.length > 0) {
    modulePatches.innerHTML = data.patches.map(p =>
      `<div style="color: #00ff41;">• ${p}</div>`
    ).join('');
  } else {
    modulePatches.textContent = 'None';
  }
});

socket.on('patch-applied', (data) => {
  if (gameState.isWhitehat) {
    addLogEntry(systemLog, `✓ Patch deployed: ${data.patch}`, 'info');
  }
});

socket.on('vulnerability-identified', (data) => {
  const identifiedVulns = document.getElementById('identified-vulns');

  if (gameState.isWhitehat) {
    const message = data.isCorrect ?
      `✓ CORRECT: ${data.module.toUpperCase()} is vulnerable` :
      `✗ INCORRECT: ${data.module.toUpperCase()} is not vulnerable`;

    addLogEntry(systemLog, message, data.isCorrect ? 'info' : 'warning');

    if (identifiedVulns) {
      identifiedVulns.textContent = `${data.total} identified`;
    }
  }
});

socket.on('new-round', (data) => {
  gameState.round = data.round;
  gameState.currentPhase = data.phase;

  roundNumber.textContent = data.round;
  securityLevelSpan.textContent = data.securityLevel;
  alertLevelSpan.textContent = getAlertLevelText(data.alertLevel);

  if (gameState.isWhitehat) {
    addLogEntry(systemLog, '', 'info');
    addLogEntry(systemLog, `═══ ROUND ${data.round} STARTED ═══`, 'info');
    addLogEntry(systemLog, `Security Level: ${data.securityLevel}%`, 'info');
    addLogEntry(systemLog, `Alert Level: ${getAlertLevelText(data.alertLevel)}`, 'warning');
  } else {
    addLogEntry(document.getElementById('module-log'), `═══ ROUND ${data.round} ═══`, 'info');
  }
});

socket.on('game-over', (data) => {
  gameScreen.classList.remove('active');
  gameoverScreen.classList.add('active');

  const result = document.getElementById('gameover-result');
  const stats = document.getElementById('gameover-stats');

  if (data.victory) {
    result.textContent = '✓ PROTOCOL SUCCESS';
    result.className = 'victory';
  } else {
    result.textContent = '✗ PROTOCOL FAILED';
    result.className = 'defeat';
  }

  stats.innerHTML = `
    <div><strong>Reason:</strong> ${data.reason}</div>
    <div><strong>Rounds Completed:</strong> ${gameState.round}</div>
  `;
});

socket.on('error', (data) => {
  alert(data.message);
  if (gameState.isWhitehat) {
    addLogEntry(systemLog, `ERROR: ${data.message}`, 'critical');
  }
});

// Utility: Format phase name
function formatPhaseName(phase) {
  return phase.replace(/_/g, ' ').toUpperCase();
}

console.log('WHITEHAT PROTOCOL initialized');
console.log('Remember: This is an educational simulation');
