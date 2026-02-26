/**
 * 游戏主入口
 */

// 初始化
function init() {
    loadGame();
    
    if (!gameState.currentEnemy) spawnEnemy();
    
    recordPlayTime();
    applyOfflineEarnings();
    
    // 绑定事件
    document.getElementById('btn-cultivate').addEventListener('click', () => {
        startCultivate();
        if (gameState.isCultivating) {
            gameState.autoCultivateUsed = true;
            checkAchievements();
        }
        saveGame();
    });
    
    document.getElementById('auto-cultivate').addEventListener('change', (e) => {
        gameState.autoCultivate = e.target.checked;
        if (gameState.autoCultivate && !gameState.isCultivating) startCultivate();
        gameState.autoCultivateUsed = true;
        checkAchievements();
        saveGame();
    });
    
    document.getElementById('btn-attack').addEventListener('click', () => {
        attack();
        gameState.autoBattleUsed = true;
        checkAchievements();
    });
    
    document.getElementById('btn-auto-battle').addEventListener('click', () => {
        gameState.autoBattle = !gameState.autoBattle;
        if (gameState.autoBattle) { gameState.autoBattleUsed = true; checkAchievements(); }
        updateUI();
        saveGame();
    });
    
    document.getElementById('btn-learn-skill').addEventListener('click', learnSkill);
    document.getElementById('btn-reset-game')?.addEventListener('click', resetGame);
    document.getElementById('modal-confirm').addEventListener('click', hideModal);
    document.getElementById('modal-cancel').addEventListener('click', hideModal);
    
    initTabs();
    
    // 游戏循环
    let loopCounter = 0;
    setInterval(() => {
        restoreStamina();
        if (gameState.isCultivating) doCultivate();
        if (gameState.autoBattle) attack();
        
        loopCounter++;
        if (loopCounter >= 10) {
            loopCounter = 0;
            recordPlayTime();
            checkAchievements();
        }
    }, 1000);
    
    saveGame();
    updateUI();
    console.log('仙途游戏初始化完成！');
}

// 离线收益
function calculateOfflineEarnings() {
    if (!gameState.lastPlayTime) return { exp: 0, lingqi: 0 };
    const offlineMinutes = Math.floor((Date.now() - gameState.lastPlayTime) / 1000 / 60);
    if (offlineMinutes < 1) return { exp: 0, lingqi: 0 };
    const gameDays = Math.floor(offlineMinutes / 15);
    const effectiveDays = Math.min(gameDays, 30);
    if (effectiveDays < 1) return { exp: 0, lingqi: 0 };
    
    const speed = getCultivateSpeed();
    const lingqiGain = getLingqiGain();
    return {
        exp: Math.floor(speed * 100 * effectiveDays),
        lingqi: Math.floor(lingqiGain * 100 * effectiveDays)
    };
}

function applyOfflineEarnings() {
    const earnings = calculateOfflineEarnings();
    if (earnings.exp > 0 || earnings.lingqi > 0) {
        gameState.player.exp += earnings.exp;
        gameState.player.lingqi += earnings.lingqi;
        showModal('📥 离线收益', `离线收益\n修为 +${formatNumber(earnings.exp)}\n灵气 +${formatNumber(earnings.lingqi)}`);
    }
}

function recordPlayTime() {
    gameState.lastPlayTime = Date.now();
    saveGame();
}

// 启动
document.addEventListener('DOMContentLoaded', init);
