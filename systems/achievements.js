/**
 * 成就系统
 */

function checkAchievements() {
    const newAchievements = [];
    ACHIEVEMENTS.forEach(ach => {
        if (!gameState.achievements.includes(ach.id) && ach.check(gameState)) {
            gameState.achievements.push(ach.id);
            newAchievements.push(ach);
        }
    });
    if (newAchievements.length > 0) {
        newAchievements.forEach((ach, i) => setTimeout(() => showModal('🏆 成就解锁！', `【${ach.name}】\n${ach.desc}`), i * 500));
    }
    return newAchievements;
}

function renderAchievements() {
    const container = document.getElementById('achievements-list');
    if (!container) return;
    container.innerHTML = '';
    ACHIEVEMENTS.forEach(ach => {
        const unlocked = gameState.achievements.includes(ach.id);
        container.innerHTML += `<div class="achievement-item ${unlocked?'unlocked':'locked'}">
            <div class="achievement-icon">${unlocked?'🏆':'🔒'}</div>
            <div class="achievement-info"><span class="achievement-name">${ach.name}</span>
            <span class="achievement-desc">${ach.desc}</span></div>
            <span class="achievement-status">${unlocked?'已达成':'未达成'}</span>
        </div>`;
    });
}

function updateAchievementsStats() {
    const sa = document.getElementById('stat-achievements'), se = document.getElementById('stat-enemies'), sd = document.getElementById('stat-dungeons');
    if (sa) sa.textContent = gameState.achievements.length;
    if (se) se.textContent = formatNumber(gameState.stats?.enemiesDefeated || 0);
    if (sd) sd.textContent = formatNumber(gameState.stats?.dungeonsCleared || 0);
}
