let adminToken = null;

async function adminLogin() {
    const pw = document.getElementById('adminPass').value;
    try {
        const res = await apiRequest('/admin-login', 'POST', { password: pw });
        adminToken = res.token;
        document.getElementById('adminLogin').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        loadPayments();
    } catch (e) { }
}

async function loadPayments() {
    try {
        const list = await apiRequest('/admin/payments');
        const tbody = document.getElementById('paymentTable');
        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-gray-500">대기 중인 요청이 없습니다.</td></tr>';
            return;
        }

        tbody.innerHTML = list.map(p => `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-2 text-sm text-gray-600">${new Date(p.created_at).toLocaleString()}</td>
                <td class="p-2 font-bold">${p.club_name}</td>
                <td class="p-2">${p.requester_name}</td>
                <td class="p-2"><span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${p.plan_type}</span></td>
                <td class="p-2 font-mono">${p.amount.toLocaleString()}원</td>
                <td class="p-2">
                    <button onclick="approvePayment('${p.id}')" class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">승인</button>
                </td>
            </tr>
        `).join('');
    } catch (e) { }
}

async function approvePayment(id) {
    if (!confirm('승인하시겠습니까?')) return;
    try {
        await apiRequest('/admin/payments/confirm', 'POST', { paymentId: id, adminId: 'SYSADMIN' });
        alert('승인 완료');
        loadPayments();
    } catch (e) { console.error(e); }
}
