const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Game state storage
const rooms = new Map();

// Game constants
const ROLES = {
  ANALYST: 'analyst',
  ATTACKER: 'attacker',
  CLIENT: 'client',
  SERVER: 'server',
  SPECTATOR: 'spectator'
};

const SECURITY_STATES = ['WEAK', 'NORMAL', 'STRONG'];

const ATTACKS = {
  PHISH_TEST: { name: '피싱 공격 테스트', nameEN: 'Phishing Test', targets: ['client'], points: 10 },
  BRUTE_SIM: { name: '무차별 대입 공격', nameEN: 'Brute Force', targets: ['client'], points: 15 },
  INJECT_SIM: { name: 'SQL 인젝션 공격', nameEN: 'SQL Injection', targets: ['server'], points: 20 },
  DOS_SIM: { name: '서비스 거부 공격', nameEN: 'DDoS Attack', targets: ['server'], points: 18 },
  MISCONFIG_SCAN: { name: '설정 오류 스캔', nameEN: 'Config Scan', targets: ['client', 'server'], points: 12 },

  // 새로운 공격 타입 추가
  XSS_ATTACK: { name: 'XSS 공격 시뮬레이션', nameEN: 'XSS Attack', targets: ['client'], points: 17 },
  CSRF_TEST: { name: 'CSRF 취약점 테스트', nameEN: 'CSRF Test', targets: ['client'], points: 16 },
  MITM_SCAN: { name: '중간자 공격 스캔', nameEN: 'MITM Scan', targets: ['client', 'server'], points: 22 },
  BUFFER_OVERFLOW: { name: '버퍼 오버플로우 테스트', nameEN: 'Buffer Overflow', targets: ['server'], points: 25 },
  PRIVILEGE_ESC: { name: '권한 상승 공격', nameEN: 'Privilege Escalation', targets: ['server'], points: 23 },
  RANSOMWARE_SIM: { name: '랜섬웨어 시뮬레이션', nameEN: 'Ransomware Sim', targets: ['client', 'server'], points: 30 },
  ZERO_DAY: { name: '제로데이 공격 시뮬레이션', nameEN: 'Zero-Day Attack', targets: ['client', 'server'], points: 35 }
};

const PATCHES = {
  AUTH_HARDENING: { name: '인증 강화', duration: 2, reduces: 'BRUTE_SIM', amount: 0.3, points: 15 },
  INPUT_VALIDATION: { name: '입력 검증 강화', duration: 2, reduces: 'INJECT_SIM', amount: 0.4, points: 20 },
  MONITORING_ENHANCE: { name: '모니터링 강화', duration: 3, effect: 'detailed_logs', points: 12 },
  NETWORK_STABILIZE: { name: '네트워크 안정화', duration: 2, reduces: 'DOS_SIM', amount: 0.35, points: 18 },

  // 새로운 패치 추가
  XSS_FILTER: { name: 'XSS 필터링', duration: 2, reduces: 'XSS_ATTACK', amount: 0.45, points: 17 },
  CSRF_TOKEN: { name: 'CSRF 토큰', duration: 3, reduces: 'CSRF_TEST', amount: 0.5, points: 16 },
  ENCRYPTION_UPGRADE: { name: '암호화 업그레이드', duration: 3, reduces: 'MITM_SCAN', amount: 0.4, points: 22 },
  MEMORY_PROTECTION: { name: '메모리 보호', duration: 2, reduces: 'BUFFER_OVERFLOW', amount: 0.55, points: 25 },
  ACCESS_CONTROL: { name: '접근 제어 강화', duration: 2, reduces: 'PRIVILEGE_ESC', amount: 0.5, points: 23 },
  BACKUP_SYSTEM: { name: '백업 시스템', duration: 4, reduces: 'RANSOMWARE_SIM', amount: 0.6, points: 30 },
  FIREWALL_BOOST: { name: '방화벽 강화', duration: 3, reduces: 'ZERO_DAY', amount: 0.35, points: 28 },
  INTRUSION_DETECTION: { name: '침입 탐지 시스템', duration: 4, effect: 'advanced_detection', points: 25 }
};

const PHASES = {
  LOBBY: 'lobby',
  RECONNAISSANCE: 'reconnaissance',
  ATTACK_SELECTION: 'attack_selection',
  EXECUTION: 'execution',
  LOG_ANALYSIS: 'log_analysis',
  DEFENSE_PATCH: 'defense_patch',
  ROUND_END: 'round_end',
  GAME_OVER: 'game_over'
};

// Generate random room code
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Initialize game room
function createRoom(roomCode) {
  return {
    code: roomCode,
    players: new Map(),
    phase: PHASES.LOBBY,
    round: 0,
    maxRounds: 8,
    alertLevel: 0,
    securityLevel: 50,
    logs: [],
    votes: { analyst: null, attacker: null },
    selectedAttack: null,
    selectedPatch: null,
    modules: initializeModules(),
    identifiedVulnerabilities: [],
    gameStarted: false,

    // 점수 시스템
    score: 0,
    combo: 0,
    maxCombo: 0,
    achievements: [],
    statistics: {
      attacksExecuted: 0,
      patchesApplied: 0,
      vulnerabilitiesFound: 0,
      perfectRounds: 0
    }
  };
}

// Initialize system modules with random security states
function initializeModules() {
  const moduleNames = ['client', 'server'];
  const modules = {};

  moduleNames.forEach(name => {
    // Ensure at least 1 WEAK module for gameplay
    const random = Math.random();
    let security;
    if (Object.keys(modules).length < 1 && random < 0.5) {
      security = 'WEAK';
    } else if (random < 0.4) {
      security = 'WEAK';
    } else if (random < 0.7) {
      security = 'NORMAL';
    } else {
      security = 'STRONG';
    }

    modules[name] = {
      name: name,
      security: security,
      patches: [],
      lastResponse: null
    };
  });

  return modules;
}

// Calculate vulnerability index
function getVulnIndex(securityState, patches = [], attackType) {
  let baseIndex;

  switch(securityState) {
    case 'WEAK': baseIndex = 0.8 + Math.random() * 0.2; break;
    case 'NORMAL': baseIndex = 0.4 + Math.random() * 0.2; break;
    case 'STRONG': baseIndex = 0.0 + Math.random() * 0.2; break;
    default: baseIndex = 0.5;
  }

  // Apply patch reductions
  patches.forEach(patch => {
    if (PATCHES[patch] && PATCHES[patch].reduces === attackType) {
      baseIndex *= (1 - PATCHES[patch].amount);
    }
  });

  return Math.max(0, Math.min(1, baseIndex));
}

// Resolve attack
function resolveAttack(room, attackType) {
  const attack = ATTACKS[attackType];
  let totalVulnIndex = 0;
  let affectedCount = 0;
  let totalResponseTime = 0;

  Object.values(room.modules).forEach(module => {
    if (attack.targets.includes(module.name)) {
      const vulnIndex = getVulnIndex(module.security, module.patches, attackType);
      totalVulnIndex += vulnIndex;

      if (vulnIndex > 0.5) {
        affectedCount++;
      }

      // Calculate response time anomaly
      let responseTime = 0;
      if (module.security === 'WEAK') {
        responseTime = 400 + Math.random() * 200;
      } else if (module.security === 'NORMAL') {
        responseTime = 100 + Math.random() * 100;
      } else {
        responseTime = 0 + Math.random() * 50;
      }

      totalResponseTime += responseTime;

      // Store module response (private to module)
      module.lastResponse = {
        attack: attackType,
        vulnerable: vulnIndex > 0.5,
        vulnIndex: vulnIndex,
        responseTime: responseTime
      };
    }
  });

  const avgVulnIndex = totalVulnIndex / attack.targets.length;
  const avgResponseTime = Math.round(totalResponseTime / attack.targets.length);

  // Calculate alert level increase
  let alertIncrease = 0;
  if (avgVulnIndex > 0.7) alertIncrease = 2;
  else if (avgVulnIndex > 0.4) alertIncrease = 1;

  room.alertLevel = Math.min(10, room.alertLevel + alertIncrease);

  // Generate log
  const log = {
    round: room.round,
    attack: attackType,
    attackName: attack.name,
    vulnIndex: avgVulnIndex.toFixed(2),
    affectedCount: affectedCount,
    responseTime: avgResponseTime,
    alertLevel: room.alertLevel,
    timestamp: new Date().toISOString()
  };

  room.logs.push(log);

  return log;
}

// Calculate security level
function calculateSecurityLevel(modules) {
  let score = 0;
  Object.values(modules).forEach(module => {
    if (module.security === 'STRONG') score += 20;
    else if (module.security === 'NORMAL') score += 10;
  });
  return Math.round((score / 40) * 100);
}

// Apply patch
function applyPatch(room, patchType) {
  // Logic to determine which module gets the patch
  // For MVP, apply to the most vulnerable module of relevant type
  const patch = PATCHES[patchType];

  Object.values(room.modules).forEach(module => {
    // Simple logic: apply to weak modules
    if (module.security === 'WEAK' || module.security === 'NORMAL') {
      if (!module.patches.includes(patchType)) {
        module.patches.push(patchType);

        // Schedule patch removal
        setTimeout(() => {
          const index = module.patches.indexOf(patchType);
          if (index > -1) {
            module.patches.splice(index, 1);
          }
        }, patch.duration * 60000); // Convert rounds to approximate time
      }
    }
  });
}

// Check victory conditions
function checkVictoryConditions(room) {
  if (room.identifiedVulnerabilities.length >= 1 &&
      room.securityLevel >= 70 &&
      room.alertLevel < 9) {
    return { victory: true, reason: 'All victory conditions met!' };
  }

  if (room.alertLevel >= 10) {
    return { defeat: true, reason: 'Alert level reached MAXIMUM!' };
  }

  const compromisedModules = Object.values(room.modules).filter(m =>
    m.lastResponse && m.lastResponse.vulnerable
  ).length;

  if (compromisedModules >= 2) {
    return { defeat: true, reason: 'All systems compromised!' };
  }

  if (room.round >= room.maxRounds) {
    if (room.identifiedVulnerabilities.length >= 1 && room.securityLevel >= 70) {
      return { victory: true, reason: 'Victory conditions met!' };
    } else {
      return { defeat: true, reason: 'Round limit reached without victory!' };
    }
  }

  return { continue: true };
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Create room
  socket.on('create-room', (callback) => {
    const roomCode = generateRoomCode();
    const room = createRoom(roomCode);
    rooms.set(roomCode, room);

    socket.join(roomCode);
    socket.roomCode = roomCode;

    console.log(`Room created: ${roomCode}`);
    callback({ success: true, roomCode });
  });

  // Join room
  socket.on('join-room', ({ roomCode, playerName, role }, callback) => {
    console.log(`📡 Join room request: ${playerName} -> ${roomCode} (${role})`);
    console.log(`📊 Available rooms:`, Array.from(rooms.keys()));

    const room = rooms.get(roomCode);

    if (!room) {
      console.log(`❌ Room not found: ${roomCode}`);
      return callback({ success: false, error: 'Room not found' });
    }

    if (room.players.size >= 100) {
      console.log(`❌ Room full: ${roomCode}`);
      return callback({ success: false, error: 'Room is full' });
    }

    // Check if role is already taken (except spectator - unlimited)
    if (role !== 'spectator') {
      const roleTaken = Array.from(room.players.values()).some(p => p.role === role);
      if (roleTaken) {
        console.log(`❌ Role taken: ${role} in ${roomCode}`);
        return callback({ success: false, error: 'Role already taken' });
      }
    }

    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.playerName = playerName;
    socket.role = role;

    room.players.set(socket.id, {
      id: socket.id,
      name: playerName,
      role: role
    });

    console.log(`✅ Player joined: ${playerName} (${role}) -> ${roomCode}`);
    console.log(`📊 Room ${roomCode} now has ${room.players.size} players`);

    // Send room state to all players
    io.to(roomCode).emit('room-update', {
      players: Array.from(room.players.values()),
      gameStarted: room.gameStarted
    });

    callback({ success: true, role });
  });

  // Start game
  socket.on('start-game', () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;

    // Check minimum players (2 whitehats only - systems are AI)
    if (room.players.size < 2) {
      socket.emit('error', { message: 'Need 2 whitehat players to start' });
      return;
    }

    // Verify both whitehats are present
    const roles = Array.from(room.players.values()).map(p => p.role);
    if (!roles.includes('analyst') || !roles.includes('attacker')) {
      socket.emit('error', { message: 'Need both Analyst and Attacker roles' });
      return;
    }

    room.gameStarted = true;
    room.phase = PHASES.RECONNAISSANCE;
    room.round = 1;

    io.to(socket.roomCode).emit('game-started', {
      phase: room.phase,
      round: room.round
    });

    // Start first phase timer
    setTimeout(() => {
      advancePhase(room);
    }, 30000); // 30 seconds
  });

  // Vote for attack
  socket.on('vote-attack', ({ attack, vote }) => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.phase !== PHASES.ATTACK_SELECTION) return;

    const player = room.players.get(socket.id);
    if (!player) return;

    if (player.role === ROLES.ANALYST) {
      room.votes.analyst = vote ? attack : null;
    } else if (player.role === ROLES.ATTACKER) {
      room.votes.attacker = vote ? attack : null;
    }

    // Broadcast vote update
    io.to(socket.roomCode).emit('vote-update', {
      analystVote: room.votes.analyst,
      attackerVote: room.votes.attacker
    });

    // Check if both voted yes for same attack
    if (room.votes.analyst === attack && room.votes.attacker === attack) {
      room.selectedAttack = attack;
      advancePhase(room);
    }
  });

  // Select patch
  socket.on('select-patch', ({ patch }) => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.phase !== PHASES.DEFENSE_PATCH) return;

    const player = room.players.get(socket.id);
    if (!player || (player.role !== ROLES.ANALYST && player.role !== ROLES.ATTACKER)) return;

    room.selectedPatch = patch;
    applyPatch(room, patch);

    io.to(socket.roomCode).emit('patch-applied', { patch });

    advancePhase(room);
  });

  // Identify vulnerability
  socket.on('identify-vulnerability', ({ module }) => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;

    if (!room.identifiedVulnerabilities.includes(module)) {
      room.identifiedVulnerabilities.push(module);

      // Check if correct
      const isCorrect = room.modules[module] && room.modules[module].security === 'WEAK';

      io.to(socket.roomCode).emit('vulnerability-identified', {
        module,
        isCorrect,
        total: room.identifiedVulnerabilities.length
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);

    const room = rooms.get(socket.roomCode);
    if (room) {
      room.players.delete(socket.id);

      io.to(socket.roomCode).emit('room-update', {
        players: Array.from(room.players.values()),
        gameStarted: room.gameStarted
      });

      // If room is empty, delete it
      if (room.players.size === 0) {
        rooms.delete(socket.roomCode);
      }
    }
  });
});

// Advance game phase
function advancePhase(room) {
  const phaseOrder = [
    PHASES.RECONNAISSANCE,
    PHASES.ATTACK_SELECTION,
    PHASES.EXECUTION,
    PHASES.LOG_ANALYSIS,
    PHASES.DEFENSE_PATCH,
    PHASES.ROUND_END
  ];

  const currentIndex = phaseOrder.indexOf(room.phase);

  if (currentIndex === -1) return;

  if (room.phase === PHASES.EXECUTION) {
    // Execute attack
    if (room.selectedAttack) {
      const log = resolveAttack(room, room.selectedAttack);

      io.to(room.code).emit('attack-executed', {
        log,
        modules: getPublicModuleData(room.modules)
      });

      // Send private data to each module
      room.players.forEach((player, socketId) => {
        if (player.role in room.modules) {
          const moduleData = room.modules[player.role];
          io.to(socketId).emit('module-private-data', {
            lastResponse: moduleData.lastResponse,
            patches: moduleData.patches
          });
        }
      });
    }
  }

  if (room.phase === PHASES.ROUND_END) {
    // Check victory conditions
    const result = checkVictoryConditions(room);

    if (result.victory || result.defeat) {
      room.phase = PHASES.GAME_OVER;
      io.to(room.code).emit('game-over', result);
      return;
    }

    // Start new round
    room.round++;
    room.phase = PHASES.RECONNAISSANCE;
    room.votes = { analyst: null, attacker: null };
    room.selectedAttack = null;
    room.selectedPatch = null;
    room.securityLevel = calculateSecurityLevel(room.modules);

    io.to(room.code).emit('new-round', {
      round: room.round,
      phase: room.phase,
      securityLevel: room.securityLevel,
      alertLevel: room.alertLevel
    });

    setTimeout(() => advancePhase(room), 30000);
    return;
  }

  // Move to next phase
  const nextPhase = phaseOrder[currentIndex + 1];
  if (nextPhase) {
    room.phase = nextPhase;

    io.to(room.code).emit('phase-change', {
      phase: room.phase,
      round: room.round
    });

    // Set timer for next phase
    let timer = 45000; // Default
    if (nextPhase === PHASES.RECONNAISSANCE) timer = 30000;
    if (nextPhase === PHASES.EXECUTION) timer = 5000;
    if (nextPhase === PHASES.LOG_ANALYSIS) timer = 60000;
    if (nextPhase === PHASES.DEFENSE_PATCH) timer = 30000;
    if (nextPhase === PHASES.ROUND_END) timer = 10000;

    setTimeout(() => advancePhase(room), timer);
  }
}

// Get public module data (hide security states)
function getPublicModuleData(modules) {
  const publicData = {};
  Object.keys(modules).forEach(key => {
    publicData[key] = {
      name: modules[key].name,
      // Security state is hidden
      hasPatches: modules[key].patches.length > 0
    };
  });
  return publicData;
}

// Start server
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║   WHITEHAT PROTOCOL Server v1.0      ║
║   Educational Security Simulation    ║
╚══════════════════════════════════════╝

Server running on port ${PORT}
Access: http://localhost:${PORT}

Ready for secure connections...
  `);
});
