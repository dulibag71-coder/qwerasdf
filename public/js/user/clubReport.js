const club = JSON.parse(localStorage.getItem('currentClub'));

document.addEventListener('DOMContentLoaded', async () => {
    requireLogin();
    if (!club) return window.location.href = '/club.html';

    try {
        const data = await apiRequest(`/clubs/${club.id}/report`);
        document.getElementById('totalAnalysis').innerText = data.totalAnalysis + '회';
        document.getElementById('creditsUsed').innerText = data.creditsUsed.toLocaleString();

        // Render Chart
        const ctx = document.getElementById('activityChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Analysis Count',
                    data: [12, 19, 3, 5, 2, 3, 10], // Mock Data for visual as DB doesn't have history populated yet
                    borderColor: '#10B981',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#374151' } },
                    x: { grid: { display: false } }
                }
            }
        });

        // Top List
        const topList = document.getElementById('topList');
        if (data.leaders && data.leaders.length > 0) {
            topList.innerHTML = data.leaders.map((l, i) => `
                <div class="flex justify-between items-center border-b border-gray-700 last:border-0 pb-2 mb-2 last:pb-0 last:mb-0">
                    <span class="text-sm text-white">${i + 1}. ${l.nickname}</span>
                    <span class="text-sm font-bold text-yellow-500">${l.best_score} pts</span>
                </div>
            `).join('');
        } else {
            topList.innerText = '데이터 없음';
        }

    } catch (e) { console.error(e); }
});

function downloadPDF() {
    alert('PDF 다운로드를 시작합니다... (브라우저 인쇄 기능을 사용하세요)');
    window.print();
}
