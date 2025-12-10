let selectedPlan = null;
const club = JSON.parse(localStorage.getItem('currentClub'));

document.addEventListener('DOMContentLoaded', () => {
    requireLogin();
    if (!club) return window.location.href = '/club.html';

    document.getElementById('inviteCodeDisplay').innerText = club.invite_code;
    loadMembers();
});

function copyCode() {
    navigator.clipboard.writeText(club.invite_code);
    alert('초대 코드가 복사되었습니다: ' + club.invite_code);
}

function selectPlan(plan) {
    selectedPlan = plan;
    document.getElementById('planMonth').classList.remove('border-green-500', 'bg-gray-700');
    document.getElementById('planYear').classList.remove('border-green-500', 'bg-gray-700');

    const el = plan === 'month' ? document.getElementById('planMonth') : document.getElementById('planYear');
    el.classList.add('border-green-500', 'bg-gray-700');

    document.getElementById('paymentInfo').classList.remove('hidden');
}

async function submitPayment() {
    if (!selectedPlan) return;
    const user = getCurrentUser();

    if (!confirm('정말로 입금하셨습니까? 허위 요청 시 이용이 제한될 수 있습니다.')) return;

    try {
        const res = await apiRequest('/clubs/payment-request', 'POST', {
            clubId: club.id,
            userId: user.id,
            planType: selectedPlan
        });
        if (res.success) {
            alert('요청되었습니다. 관리자 승인 대기 중입니다.');
            window.location.reload();
        }
    } catch (e) { }
}

async function loadMembers() {
    const list = document.getElementById('memberList');
    try {
        const members = await apiRequest(`/clubs/${club.id}/members`);
        list.innerHTML = members.map(m => `
            <div class="flex items-center justify-between bg-gray-800 p-3 rounded-lg border border-gray-700">
                <div class="flex items-center gap-3">
                    <img src="${m.profile_img || 'https://via.placeholder.com/40'}" class="w-8 h-8 rounded-full bg-gray-600">
                    <div>
                        <p class="font-bold text-sm">${m.nickname}</p>
                        <p class="text-xs text-gray-500">${new Date(m.joined_at).toLocaleDateString()}</p>
                    </div>
                </div>
                <span class="text-xs px-2 py-1 rounded ${m.role === 'owner' ? 'bg-yellow-900 text-yellow-400' : 'bg-gray-700 text-gray-400'}">
                    ${m.role.toUpperCase()}
                </span>
            </div>
        `).join('');
    } catch (e) { }
}
