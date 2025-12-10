const club = JSON.parse(localStorage.getItem('currentClub'));

document.addEventListener('DOMContentLoaded', () => {
    requireLogin();
    if (!club) return window.location.href = '/club.html';
    loadPosts();
});

async function writePost() {
    const content = document.getElementById('postContent').value.trim();
    if (!content) return;
    const type = document.getElementById('postType').value;

    // Check permission for notice (client side check only for UX)
    if (type === 'notice' && !['owner', 'manager'].includes(club.role)) {
        return alert('공지는 관리자만 작성 가능합니다.');
    }

    try {
        await apiRequest(`/clubs/${club.id}/posts`, 'POST', {
            clubId: club.id,
            userId: getCurrentUser().id,
            content,
            type
        });
        document.getElementById('postContent').value = '';
        loadPosts();
    } catch (e) { }
}

async function loadPosts() {
    const list = document.getElementById('postList');
    try {
        const posts = await apiRequest(`/clubs/${club.id}/posts`);
        if (posts.length === 0) {
            list.innerHTML = '<div class="text-center text-gray-500 py-10">첫 글을 남겨보세요!</div>';
            return;
        }

        list.innerHTML = posts.map(p => `
            <div class="glass-panel p-4 rounded-xl relative group hover:bg-white/5 transition duration-300">
                <div class="flex items-center gap-3 mb-3">
                    <img src="${p.profile_img || 'https://via.placeholder.com/40'}" class="w-10 h-10 rounded-full bg-gray-700 border border-white/10">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-sm text-white">${p.nickname}</span>
                            ${p.type === 'notice' ? '<span class="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/30">NOTICE</span>' : ''}
                        </div>
                        <span class="text-[10px] text-gray-500">${new Date(p.created_at).toLocaleString()}</span>
                    </div>
                </div>
                <p class="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed mb-4">${p.content}</p>
                
                <div class="flex items-center gap-4 text-xs text-gray-500 border-t border-white/5 pt-3">
                    <button onclick="likePost('${p.id}')" class="flex items-center gap-1 hover:text-pink-500 transition group/btn">
                        <span class="material-icons text-sm ${p.likes > 0 ? 'text-pink-500' : 'text-gray-600'} group-hover/btn:scale-110 transition">favorite</span>
                        <span>${p.likes || 0} Likes</span>
                    </button>
                    <button class="flex items-center gap-1 hover:text-blue-400 transition">
                        <span class="material-icons text-sm">chat_bubble_outline</span>
                        <span>Comment</span>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (e) { }
}

async function likePost(id) {
    try {
        await apiRequest(`/posts/${id}/like`, 'POST');
        loadPosts(); // Reload to show updated count
    } catch (e) { }
}
