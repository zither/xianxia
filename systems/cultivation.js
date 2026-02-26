/**
 * 修炼系统
 */

// 修炼
function startCultivate() {
    gameState.isCultivating = !gameState.isCultivating;
    updateUI();
}

function doCultivate() {
    if (!gameState.isCultivating) return;
    if (!checkCanAct()) {
        gameState.isCultivating = false;
        updateUI();
        return;
    }
    
    const efficiency = checkBottleneck();
    const speed = Math.floor(getCultivateSpeed() * efficiency);
    const lingqiGain = getLingqiGain();
    const maxLingqi = gameState.player.maxLingqi || 100;
    
    gameState.player.exp += speed;
    gameState.player.lingqi = Math.min(maxLingqi, gameState.player.lingqi + lingqiGain);
    
    // 消耗饱食度和体力
    gameState.player.hunger = Math.max(0, gameState.player.hunger - 0.5);
    gameState.player.energy = Math.max(0, gameState.player.energy - 1);
    
    // 顿悟系统
    if (Math.random() < 0.02) {
        triggerEnlightenment();
    }
    
    gameState.stats.totalCultivate = (gameState.stats.totalCultivate || 0) + speed;
    triggerRandomEvent();
    checkRealmUp();
    checkAchievements();
    
    updateUI();
    saveGame();
}

// 顿悟系统
function triggerEnlightenment() {
    const types = [
        { name: '💡 修为顿悟', effect: () => {
            const exp = Math.floor(50 + Math.random() * 100 * (1 + gameState.player.realm * 0.5));
            gameState.player.exp += exp;
            return `修为 +${exp}！`;
        }},
        { name: '💎 灵石顿悟', effect: () => {
            const lingshi = Math.floor(20 + Math.random() * 50 * (1 + gameState.player.realm * 0.3));
            gameState.player.lingshi += lingshi;
            return `灵石 +${lingshi}！`;
        }},
        { name: '🧬 属性顿悟', effect: () => {
            const attrs = ['rootBone', 'comprehension', 'fortune', 'blessing'];
            const attr = attrs[Math.floor(Math.random() * attrs.length)];
            gameState.player[attr]++;
            const names = { rootBone: '根骨', comprehension: '悟性', fortune: '机遇', blessing: '福源' };
            return `${names[attr]} +1！`;
        }},
        { name: '⚡ 灵气爆发', effect: () => {
            const lingqi = Math.floor(30 + Math.random() * 70 * (1 + gameState.player.realm * 0.3));
            gameState.player.lingqi += lingqi;
            gameState.player.lingqi = Math.min(gameState.player.maxLingqi, gameState.player.lingqi);
            return `灵气 +${lingqi}！`;
        }},
        { name: '📦 功法碎片', effect: () => {
            const realm = Math.min(gameState.player.realm, 8);
            const fragments = Object.entries(SKILL_FRAGMENTS).filter(([id, f]) => f.realmMin <= realm);
            if (fragments.length > 0) {
                const [fragId] = fragments[Math.floor(Math.random() * fragments.length)];
                gameState.skillFragments = gameState.skillFragments || {};
                gameState.skillFragments[fragId] = (gameState.skillFragments[fragId] || 0) + 1;
                return `获得 ${fragId}！`;
            }
            return '什么也没找到...';
        }}
    ];
    
    const en = types[Math.floor(Math.random() * types.length)];
    const result = en.effect();
    showModal(`🌟 顿悟！${en.name}`, result);
    addBattleLog(`【顿悟】${result}`, 'loot');
    gameState.stats.enlightenments = (gameState.stats.enlightenments || 0) + 1;
    checkAchievements();
}

// 潜能激发
function openPotentialPanel() {
    let msg = '🔥 潜能激发\n\n消耗修为来激发潜能，提升属性！\n\n当前修为: ' + formatNumber(gameState.player.exp) + '\n\n';
    
    const costs = { rootBone: {name:'根骨',cost:100}, comprehension:{name:'悟性',cost:100}, 
                   fortune:{name:'机遇',cost:100}, blessing:{name:'福源',cost:100} };
    
    Object.entries(costs).forEach(([k,v], i) => msg += `${i+1}. ${v.name}: ${v.cost}修为\n`);
    msg += '\n输入序号选择（0取消）';
    
    const choice = prompt(msg);
    if (!choice || choice === '0') return;
    
    const keys = Object.keys(costs);
    const idx = parseInt(choice) - 1;
    if (idx >= 0 && idx < keys.length) {
        const attr = keys[idx];
        const cfg = costs[attr];
        if (gameState.player.exp < cfg.cost) {
            showModal('❌ 修为不足', `需要 ${cfg.cost} 修为`);
            return;
        }
        gameState.player.exp -= cfg.cost;
        gameState.player[attr]++;
        showModal('🔥 潜能激发成功', `${cfg.name} +1！`);
        updateUI();
        saveGame();
    }
}

// 瓶颈系统
function checkBottleneck() {
    const nextRealm = getNextRealm();
    if (!nextRealm) return 1;
    
    const progress = gameState.player.exp / nextRealm.expReq;
    
    if (progress >= 0.8 && gameState.player.bottleneck < 100) {
        gameState.player.bottleneck = Math.min(100, (progress - 0.8) * 500);
        if (gameState.player.bottleneck > 50) {
            return 1 - (gameState.player.bottleneck - 50) / 100;
        }
    } else {
        gameState.player.bottleneck = 0;
    }
    return 1;
}

// 境界突破
function breakthrough() {
    const nextRealm = getNextRealm();
    if (!nextRealm) { showModal('🎉 已成仙人', '你已经是仙人了！'); return; }
    if (gameState.player.exp < nextRealm.expReq) {
        showModal('❌ 修为不足', `突破到 ${nextRealm.name} 需要 ${nextRealm.expReq} 修为`);
        return;
    }
    if (gameState.player.bottleneck < 80) {
        showModal('⚠️ 瓶颈未破', '继续修炼，当修为达到要求的80%时会触发瓶颈。');
        return;
    }
    
    const baseSuccess = 0.3;
    const blessingBonus = gameState.player.blessing * 0.02;
    const realmPenalty = gameState.player.realm * 0.05;
    const successRate = Math.max(0.1, Math.min(0.8, baseSuccess + blessingBonus - realmPenalty));
    
    if (Math.random() < successRate) {
        gameState.player.realm++;
        gameState.player.exp -= nextRealm.expReq;
        gameState.player.bottleneck = 0;
        gameState.player.maxHp += 50;
        gameState.player.hp = gameState.player.maxHp;
        gameState.player.maxLingqi += 100;
        gameState.player.lingqi = gameState.player.maxLingqi;
        gameState.player.maxEnergy += 20;
        gameState.player.energy = gameState.player.maxEnergy;
        showModal('🎊 境界突破！', `恭喜突破到 ${getRealm().name}！修炼速度大幅提升！`);
        spawnEnemy();
        checkAchievements();
    } else {
        const loss = Math.floor(nextRealm.expReq * 0.3);
        gameState.player.exp = Math.max(0, gameState.player.exp - loss);
        gameState.player.bottleneck = 0;
        showModal('💔 突破失败', `损失 ${loss} 修为，再接再厉！`);
    }
    updateUI();
    saveGame();
}

// 检查境界升级
function checkRealmUp() {
    const nextRealm = getNextRealm();
    if (!nextRealm) return false;
    if (gameState.player.exp >= nextRealm.expReq) {
        gameState.player.realm++;
        gameState.player.exp -= nextRealm.expReq;
        showModal('境界突破！', `恭喜你突破到 ${getRealm().name}！修炼速度大幅提升！`);
        spawnEnemy();
        return true;
    }
    return false;
}

// 恢复饱食度和体力
function restoreStamina() {
    if (gameState.player.hunger < 100) gameState.player.hunger = Math.min(100, gameState.player.hunger + 0.5);
    if (gameState.player.energy < gameState.player.maxEnergy) 
        gameState.player.energy = Math.min(gameState.player.maxEnergy, gameState.player.energy + 1);
}

// 检查能否行动
function checkCanAct() {
    if (gameState.player.hunger <= 0) {
        showModal('☠️ 饿死边缘', '你已经饿了几天了！快去吃点东西吧！');
        gameState.isCultivating = false;
        gameState.autoBattle = false;
        return false;
    }
    if (gameState.player.energy < 10) {
        showModal('💨 体力不支', '你的体力已经耗尽了！');
        gameState.isCultivating = false;
        gameState.autoBattle = false;
        return false;
    }
    if (gameState.player.hp <= 0) {
        showModal('💀 重伤昏迷', '你被打成重伤，昏迷了过去！');
        gameState.player.hp = gameState.player.maxHp;
        gameState.player.exp = Math.floor(gameState.player.exp * 0.8);
        gameState.isCultivating = false;
        gameState.autoBattle = false;
        return false;
    }
    return true;
}
