/**
 * 战斗系统
 */

let dungeonBattleInterval = null;
let lastEventTime = 0;
const eventCooldown = 60; // 事件冷却60秒

function spawnEnemy() {
    const realm = Math.min(gameState.player.realm, ENEMIES.length - 1);
    const enemy = ENEMIES[realm];
    const hpScale = 1 + (gameState.player.realm * 0.5);
    gameState.currentEnemy = { ...enemy, baseHp: Math.floor(enemy.baseHp * hpScale) };
    gameState.enemyHp = gameState.currentEnemy.baseHp;
    addBattleLog('遭遇 ' + gameState.currentEnemy.name + '！', '');
}

function attack() {
    if (!gameState.currentEnemy) spawnEnemy();
    if (!checkCanAct()) {
        gameState.autoBattle = false;
        updateUI();
        return;
    }
    
    const damage = getDamage();
    gameState.enemyHp -= damage;
    addBattleLog('对 ' + gameState.currentEnemy.name + ' 造成 ' + damage + ' 点伤害！', 'damage');
    gameState.stats.totalDamage = (gameState.stats.totalDamage || 0) + damage;
    gameState.player.energy = Math.max(0, gameState.player.energy - 2);
    
    if (gameState.enemyHp <= 0) {
        const enemy = gameState.currentEnemy;
        const exp = Math.floor(enemy.exp * (1 + gameState.player.realm * 0.2));
        const lingshi = Math.floor(enemy.lingshi * (1 + gameState.player.realm * 0.2) * (1 + getFortuneBonus()));
        gameState.player.exp += exp;
        gameState.player.lingshi += lingshi;
        
        const fragmentId = dropSkillFragment(gameState.player.realm);
        if (fragmentId) addBattleLog('获得 ' + fragmentId + '！', 'loot');
        
        gameState.stats.enemiesDefeated = (gameState.stats.enemiesDefeated || 0) + 1;
        gameState.stats.consecutiveWins = (gameState.stats.consecutiveWins || 0) + 1;
        addBattleLog('击败 ' + enemy.name + '！获得 ' + exp + ' 修为, ' + lingshi + ' 灵石', 'loot');
        
        spawnEnemy();
        gameState.enemyJustDefeated = true;
    } else {
        gameState.stats.consecutiveWins = 0;
        gameState.enemyJustDefeated = false;
    }
    
    enemyAttack();
    updateUI();
    saveGame();
}

function enemyAttack() {
    if (!gameState.currentEnemy) return;
    const baseDamage = Math.floor(3 + gameState.player.realm * 1.5);
    const reduction = getDamageReduction();
    const defense = getDefenseBonus();
    let damage = Math.floor(baseDamage * (1 - reduction) - defense * 0.5);
    damage = Math.max(1, damage);
    
    gameState.tempDamage = (gameState.tempDamage || 0) + damage;
    if (gameState.tempDamage >= 10) {
        const expLoss = Math.floor(gameState.tempDamage / 10);
        gameState.player.exp = Math.max(0, gameState.player.exp - expLoss);
        gameState.tempDamage = gameState.tempDamage % 10;
    }
    addBattleLog('受到 ' + damage + ' 点反击伤害！', 'damage');
}

function addBattleLog(msg, type) {
    const log = document.getElementById('battle-log');
    if (!log) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry ' + type;
    entry.textContent = msg;
    log.insertBefore(entry, log.firstChild);
    while (log.children.length > 20) log.removeChild(log.lastChild);
}

function enterDungeon(index) {
    if (index >= DUNGEONS.length) { showModal('提示', '副本尚未解锁'); return; }
    const dungeon = DUNGEONS[index];
    
    if (gameState.inDungeon) { showModal('提示', '正在挑战副本中'); return; }
    if (gameState.player.realm < dungeon.minRealm) { showModal('境界不足', '需要 ' + REALMS[dungeon.minRealm].name); return; }
    
    const originalAutoBattle = gameState.autoBattle;
    gameState.autoBattle = false;
    gameState.inDungeon = true;
    gameState.currentDungeon = dungeon;
    gameState.dungeonEnemiesDefeated = 0;
    
    updateDungeonButtons(true);
    showModal('副本挑战', '正在挑战 ' + dungeon.name + '...\n击败 ' + dungeon.enemies + ' 个敌人');
    
    if (dungeonBattleInterval) clearInterval(dungeonBattleInterval);
    
    dungeonBattleInterval = setInterval(() => {
        if (!gameState.inDungeon) { clearInterval(dungeonBattleInterval); return; }
        
        attack();
        
        if (gameState.enemyJustDefeated) {
            gameState.dungeonEnemiesDefeated++;
            gameState.enemyJustDefeated = false;
            addBattleLog('击败敌人 ' + gameState.dungeonEnemiesDefeated + '/' + dungeon.enemies, 'loot');
            
            if (gameState.dungeonEnemiesDefeated >= dungeon.enemies) {
                clearInterval(dungeonBattleInterval);
                dungeonBattleInterval = null;
                
                gameState.inDungeon = false;
                gameState.currentDungeon = null;
                gameState.dungeonEnemiesDefeated = 0;
                gameState.autoBattle = originalAutoBattle;
                updateDungeonButtons(false);
                
                gameState.player.lingshi += dungeon.reward;
                gameState.player.exp += dungeon.reward * 2;
                gameState.stats.dungeonsCleared = (gameState.stats.dungeonsCleared || 0) + 1;
                
                showModal('副本完成', '恭喜通关 ' + dungeon.name + '！\n获得 ' + dungeon.reward + ' 灵石, ' + dungeon.reward * 2 + ' 修为');
                updateUI();
                saveGame();
            }
        }
    }, 1000);
}

function updateDungeonButtons(disabled) {
    [0,1,2].forEach(i => {
        const el = document.getElementById('dungeon-' + i);
        if (el) {
            if (disabled) { el.classList.add('disabled'); el.onclick = null; }
            else { el.classList.remove('disabled'); el.onclick = () => enterDungeon(i); }
        }
    });
}
