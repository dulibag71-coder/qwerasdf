// Main Club Logic

document.addEventListener('DOMContentLoaded', async () => {
    requireLogin();
    const user = getCurrentUser();

    // Check if user has clubs
    try {
        const clubs = await apiRequest(`/users/${user.id}/clubs`);
        if (clubs && clubs.length > 0) {
            // User has club, load dashboard
            const currentClub = clubs[0]; // Simple single club mode for now
            localStorage.setItem('currentClub', JSON.stringify(currentClub));
            loadDashboard(currentClub);
        } else {
            // No club
            document.getElementById('noClubView').classList.remove('hidden');
        }
    } catch (e) {
        console.error(e);
    }
});

async function createClub() {
    const name = document.getElementById('newClubName').value;
    if (!name) return alert('클럽 이름을 입력하세요');

    const user = getCurrentUser();
    try {
        await apiRequest('/clubs/create', 'POST', { userId: user.id, name, description: 'Created via V11' });
        window.location.reload();
    } catch (e) { }
}

async function joinClub() {
    const code = document.getElementById('joinCode').value;
    if (!code) return alert('코드를 입력하세요');

    const user = getCurrentUser();
    try {
        await apiRequest('/clubs/join', 'POST', { userId: user.id, inviteCode: code });
        window.location.reload();
    } catch (e) { }
}

function loadDashboard(club) {
    document.getElementById('dashboardView').classList.remove('hidden');
    document.getElementById('clubNameDisplay').innerText = club.name;
    document.getElementById('clubCreditDisplay').innerText = club.credits.toLocaleString() + ' C';
    document.getElementById('userRoleDisplay').innerText = club.role.toUpperCase();

    // Show Admin Nav if allowed
    if (['owner', 'manager'].includes(club.role)) {
        document.getElementById('adminNav').classList.remove('hidden');
        document.getElementById('adminNav').classList.add('flex');
    }

    loadLeaderboard(club.id);
}

// Analysis Logic
function previewVideo(input) {
    const file = input.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        const vid = document.getElementById('videoPreview');
        vid.src = url;
        vid.classList.remove('hidden');
        document.getElementById('uploadPlaceholder').classList.add('hidden');
    }
}

async function requestAnalysis() {
    const input = document.getElementById('swingVideoInput');
    if (!input.files[0]) return alert('영상을 선택하세요');

    const user = getCurrentUser();
    const club = JSON.parse(localStorage.getItem('currentClub'));

    const formData = new FormData();
    formData.append('video', input.files[0]);
    formData.append('userId', user.id);
    formData.append('clubId', club.id);

    // We utilize fetch directly for FormData usage usually, but let's use a wrapper if possible or raw fetch
    try {
        const res = await fetch('/api/analyze', {
            method: 'POST',
            body: formData // No Content-Type header manually set for FormData
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Analysis Failed');

        // Success and Show Premium Modal
        showResultModal(data);
        // alert(`분석 완료! 점수: ${data.score}`); // Legacy
        document.getElementById('analysisModal').classList.add('hidden');
    } catch (e) {
        alert(e.message);
    }
}

function showResultModal(data) {
    const modal = document.getElementById('resultModal');
    document.getElementById('resTier').innerText = data.tier;
    document.getElementById('resScore').innerText = data.score;

    // Comparison
    const diff = data.comparison;
    const compEl = document.getElementById('resComp');
    compEl.innerText = diff > 0 ? `+${diff}` : diff;
    compEl.className = diff >= 0 ? 'font-bold text-green-400' : 'font-bold text-red-400';

    document.getElementById('resTempo').innerText = data.tempo;
    document.getElementById('resBal').innerText = data.balance;
    document.getElementById('resRot').innerText = data.rotation;
    document.getElementById('resFeedback').innerText = data.feedback;

    // Drills
    const drillsEl = document.getElementById('resDrills');
    drillsEl.innerHTML = data.drills.map(d => `
        <div onclick="window.open('${d.url}')" class="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5 cursor-pointer hover:bg-black/60">
            <div class="flex items-center gap-2">
                <span class="material-icons text-red-500 text-sm">play_circle</span>
                <span class="text-sm text-gray-300">${d.title}</span>
            </div>
            <span class="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded">${d.tag}</span>
        </div>
    `).join('');

    modal.classList.remove('hidden');
}

function closeResultModal() {
    document.getElementById('resultModal').classList.add('hidden');
    window.location.reload();
}

// Mock Leaderboard Loader
async function loadLeaderboard(clubId) {
    // In a real app we fetch /api/clubs/:id/report or specific endpoint
    // For now we mock it or fetch report endpoint
    const list = document.getElementById('leaderboardList');
    try {
        const report = await apiRequest(`/clubs/${clubId}/report`);
        if (report.leaders && report.leaders.length > 0) {
            list.innerHTML = report.leaders.map((l, i) => `
                <div class="flex items-center justify-between bg-gray-800 p-2 rounded">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-gray-500 w-4">${i + 1}</span>
                        <span>${l.nickname}</span>
                    </div>
                    <span class="font-bold text-green-400">${l.best_score}점</span>
                </div>
            `).join('');
        } else {
            list.innerHTML = '<p class="text-sm text-gray-500">아직 데이터가 없습니다.</p>';
        }
    } catch (e) {
        console.error("Leaderboard load error", e);
        list.innerHTML = '<p class="text-sm text-red-500">로드 실패</p>';
    }
}
