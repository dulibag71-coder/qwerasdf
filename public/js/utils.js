// Utility for API calls and State Management

const API_BASE = '/api';

async function apiRequest(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'API Error');
        return data;
    } catch (err) {
        console.error(err);
        alert(err.message);
        throw err;
    }
}

function getCurrentUser() {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('currentClub');
    window.location.href = '/index.html';
}

function requireLogin() {
    if (!getCurrentUser()) window.location.href = '/index.html';
}

// Format Currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
}
