/**
 * 仙途 - 修仙挂机游戏
 * 核心游戏逻辑
 */

// ==================== 游戏数据 ====================

// 境界体系
const REALMS = [
    { name: '炼气期', expReq: 100, multiplier: 1 },
    { name: '筑基期', expReq: 500, multiplier: 2 },
    { name: '金丹期', expReq: 2000, multiplier: 4 },
    { name: '元婴期', expReq: 8000, multiplier: 8 },
    { name: '化神期', expReq: 30000, multiplier: 16 },
    { name: '炼虚期', expReq: 100000, multiplier: 32 },
    { name: '合体期', expReq: 350000, multiplier: 64 },
    { name: '大乘期', expReq: 1000000, multiplier: 128 },
    { name: '渡劫期', expReq: 5000000, multiplier: 256 },
    { name: '仙人', expReq: Infinity, multiplier: 512 }
];

// 初始功法库
const SKILL_LIB = [
    { id: '呼吸吐纳', name: '呼吸吐纳', desc: '基础功法，提升修炼速度', type: 'passive', effect: { cultivateSpeed: 1 }, cost: 0 },
    { id: '引气入体', name: '引气入体', desc: '增加灵气获取', type: 'passive', effect: { lingqiGain: 1 }, cost: 10 },
    { id: '基础剑诀', name: '基础剑诀', desc: '攻击时有概率造成额外伤害', type: 'active', effect: { extraDamage: 0.2 }, cost: 20 },
    { id: '灵气护盾', name: '灵气护盾', desc: '受到伤害时减免', type: 'passive', effect: { damageReduction: 0.1 }, cost: 30 },
    { id: '聚灵阵', name: '聚灵阵', desc: '大幅提升灵气获取', type: 'passive', effect: { lingqiGain: 5 }, cost: 100 }
];

// 敌人配置
const ENEMIES = [
    { name: '散修', baseHp: 10, exp: 5, lingshi: 2 },
    { name: '山贼', baseHp: 25, exp: 12, lingshi: 5 },
    { name: '妖兽', baseHp: 50, exp: 25, lingshi: 10 },
    { name: '邪修', baseHp: 100, exp: 50, lingshi: 20 },
    { name: '魔头', baseHp: 200, exp: 100, lingshi: 40 },
    { name: '古魔', baseHp: 500, exp: 250, lingshi: 100 }
];

// ==================== 游戏状态 ====================

let gameState = {
    player: {
        nickname: '修仙者',
        realm: 0,
        exp: 0,
        xiuxei: 0,
        lingqi: 0,
        lingshi: 0
    },
    skills: ['呼吸吐纳'],
    autoCultivate: false,
    autoBattle: false,
    currentEnemy: null,
    enemyHp: 0,
    isCultivating: false,
    isBattling: false
};

// ==================== 本地存储 ====================

function saveGame() {
    localStorage.setItem('xiantu_save', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('xiantu_save');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            gameState = { ...gameState, ...parsed };
            return true;
        } catch (e) {
            console.error('存档读取失败:', e);
        }
    }
    return false;
}

// ==================== 核心计算 ====================

function getRealm() {
    return REALMS[gameState.player.realm];
}

function getNextRealm() {
    return REALMS[gameState.player.realm + 1] || null;
}

function getCultivateSpeed() {
    let base = 1;
    let multiplier = getRealm().multiplier;
    
    // 计算被动功法加成
    gameState.skills.forEach(skillId => {
        const skill = SKILL_LIB.find(s => s.id === skillId);
        if (skill && skill.effect.cultivateSpeed) {
            base += skill.effect.cultivateSpeed;
        }
    });
    
    return base * multiplier;
}

function getLingqiGain() {
    let base = 1;
    gameState.skills.forEach(skillId => {
        const skill = SKILL_LIB.find(s => s.id === skillId);
        if (skill && skill.effect.lingqiGain) {
            base += skill.effect.lingqiGain;
        }
    });
    return base;
}

function getDamage() {
    let base = 5;
    // 境界加成
    base += gameState.player.realm * 2;
    // 功法加成
    gameState.skills.forEach(skillId => {
        const skill = SKILL_LIB.find(s => s.id === skillId);
        if (skill && skill.effect.extraDamage) {
            base *= (1 + skill.effect.extraDamage);
        }
    });
    return Math.floor(base);
}

function getDamageReduction() {
    let reduction = 0;
    gameState.skills.forEach(skillId => {
        const skill = SKILL_LIB.find(s => s.id === skillId);
        if (skill && skill.effect.damageReduction) {
            reduction += skill.effect.damageReduction;
        }
    });
    return Math.min(reduction, 0.8); // 最高80%减伤
}

// ==================== UI 更新 ====================

function updateUI() {
    const realm = getRealm();
    const nextRealm = getNextRealm();
    
    // 顶部信息
    document.getElementById('nickname').textContent = gameState.player.nickname;
    document.getElementById('realm').textContent = realm.name;
    document.getElementById('lingqi').textContent = formatNumber(gameState.player.lingqi);
    document.getElementById('lingshi').textContent = formatNumber(gameState.player.lingshi);
    
    // 经验条
    const expPercent = nextRealm 
        ? Math.min(100, (gameState.player.exp / nextRealm.expReq) * 100)
        : 100;
    document.getElementById('exp-fill').style.width = expPercent + '%';
    document.getElementById('exp-text').textContent = nextRealm
        ? `${formatNumber(gameState.player.exp)} / ${formatNumber(nextRealm.expReq)}`
        : '已满级';
    
    // 修炼状态
    document.getElementById('xiuwei').textContent = formatNumber(gameState.player.xiuxei);
    document.getElementById('cultivate-speed').textContent = `+${getCultivateSpeed()}/秒`;
    
    // 自动修炼状态
    document.getElementById('auto-cultivate').checked = gameState.autoCultivate;
    document.getElementById('btn-cultivate').textContent = gameState.isCultivating ? '修炼中...' : '开始修炼';
    document.getElementById('btn-cultivate').classList.toggle('cultivating', gameState.isCultivating);
    
    // 功法列表
    renderSkills();
    
    // 战斗状态
    if (gameState.currentEnemy) {
        document.getElementById('enemy-name').textContent = `lv.${gameState.player.realm + 1} ${gameState.currentEnemy.name}`;
        const hpPercent = Math.max(0, (gameState.enemyHp / gameState.currentEnemy.baseHp) * 100);
        document.getElementById('enemy-hp-fill').style.width = hpPercent + '%';
        document.getElementById('enemy-hp-text').textContent = `${Math.floor(gameState.enemyHp)}/${gameState.currentEnemy.baseHp}`;
    }
    
    // 自动战斗按钮
    document.getElementById('btn-auto-battle').textContent = gameState.autoBattle ? '停止自动' : '自动战斗';
    document.getElementById('btn-auto-battle').classList.toggle('active', gameState.autoBattle);
}

function renderSkills() {
    const container = document.getElementById('skills-list');
    container.innerHTML = '';
    
    gameState.skills.forEach(skillId => {
        const skill = SKILL_LIB.find(s => s.id === skillId);
        if (!skill) return;
        
        const item = document.createElement('div');
        item.className = 'skill-item';
        item.innerHTML = `
            <div class="skill-info">
                <span class="skill-name">${skill.name}</span>
                <span class="skill-desc">${skill.desc}</span>
            </div>
            <span class="skill-level">${skill.type === 'passive' ? '被动' : '主动'}</span>
        `;
        container.appendChild(item);
    });
}

function addBattleLog(msg, type = '') {
    const log = document.getElementById('battle-log');
    const entry = document.createElement('div');
    entry.className = 'log-entry ' + type;
    entry.textContent = msg;
    log.insertBefore(entry, log.firstChild);
    
    // 限制日志数量
    while (log.children.length > 20) {
        log.removeChild(log.lastChild);
    }
}

// ==================== 游戏逻辑 ====================

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toString();
}

function checkRealmUp() {
    const nextRealm = getNextRealm();
    if (!nextRealm) return false;
    
    if (gameState.player.exp >= nextRealm.expReq) {
        gameState.player.realm++;
        gameState.player.exp -= nextRealm.expReq;
        
        showModal('境界突破！', `恭喜你突破到 ${getRealm().name}！\n修炼速度大幅提升！`);
        
        // 恢复满状态
        spawnEnemy();
        return true;
    }
    return false;
}

// 修炼系统
function startCultivate() {
    if (gameState.isCultivating) {
        gameState.isCultivating = false;
    } else {
        gameState.isCultivating = true;
    }
    updateUI();
}

function doCultivate() {
    if (!gameState.isCultivating) return;
    
    const speed = getCultivateSpeed();
    gameState.player.xiuxei += speed;
    gameState.player.lingqi += getLingqiGain();
    
    // 检查是否需要突破
    checkRealmUp();
    
    updateUI();
    saveGame();
}

// 战斗系统
function spawnEnemy() {
    const realm = Math.min(gameState.player.realm, ENEMIES.length - 1);
    const enemy = ENEMIES[realm];
    
    // 根据境界调整敌人强度
    const hpScale = 1 + (gameState.player.realm * 0.5);
    
    gameState.currentEnemy = {
        ...enemy,
        baseHp: Math.floor(enemy.baseHp * hpScale)
    };
    gameState.enemyHp = gameState.currentEnemy.baseHp;
    
    addBattleLog(`遭遇 ${gameState.currentEnemy.name}！`, '');
}

function attack() {
    if (!gameState.currentEnemy) {
        spawnEnemy();
    }
    
    const damage = getDamage();
    gameState.enemyHp -= damage;
    
    addBattleLog(`对 ${gameState.currentEnemy.name} 造成 ${damage} 点伤害！`, 'damage');
    
    // 检查敌人是否死亡
    if (gameState.enemyHp <= 0) {
        const enemy = gameState.currentEnemy;
        const exp = Math.floor(enemy.exp * (1 + gameState.player.realm * 0.2));
        const lingshi = Math.floor(enemy.lingshi * (1 + gameState.player.realm * 0.2));
        
        gameState.player.exp += exp;
        gameState.player.lingshi += lingshi;
        
        addBattleLog(`击败 ${enemy.name}！获得 ${exp} 修为, ${lingshi} 灵石`, 'loot');
        
        // 立即刷新敌人
        spawnEnemy();
    }
    
    // 敌人反击
    enemyAttack();
    
    updateUI();
    saveGame();
}

function enemyAttack() {
    if (!gameState.currentEnemy) return;
    
    const baseDamage = Math.floor(3 + gameState.player.realm * 1.5);
    const reduction = getDamageReduction();
    const damage = Math.floor(baseDamage * (1 - reduction));
    
    // 临时扣血（不持久化）
    gameState.tempDamage = (gameState.tempDamage || 0) + damage;
    
    // 每10点伤害扣一级经验（简化处理）
    if (gameState.tempDamage >= 10) {
        const expLoss = Math.floor(gameState.tempDamage / 10);
        gameState.player.exp = Math.max(0, gameState.player.exp - expLoss);
        gameState.tempDamage = gameState.tempDamage % 10;
        
        addBattleLog(`受到 ${damage} 点反击伤害！`, 'damage');
    }
}

// 功法系统
function learnSkill() {
    // 找出未学习的功法
    const availableSkills = SKILL_LIB.filter(s => !gameState.skills.includes(s.id));
    
    if (availableSkills.length === 0) {
        showModal('提示', '已学会所有功法！');
        return;
    }
    
    // 显示可学习的功法
    const skill = availableSkills[0];
    const cost = skill.cost;
    
    if (gameState.player.lingshi < cost) {
        showModal('灵石不足', `学习 ${skill.name} 需要 ${cost} 灵石`);
        return;
    }
    
    gameState.player.lingshi -= cost;
    gameState.skills.push(skill.id);
    
    showModal('功法习得', `恭喜学会 ${skill.name}！\n${skill.desc}`);
    
    updateUI();
    saveGame();
}

// ==================== 弹窗 ====================

function showModal(title, message, showCancel = false) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    document.getElementById('modal-cancel').style.display = showCancel ? 'inline-block' : 'none';
    document.getElementById('modal').classList.add('show');
}

function hideModal() {
    document.getElementById('modal').classList.remove('show');
}

// ==================== 游戏循环 ====================

function gameLoop() {
    if (gameState.isCultivating) {
        doCultivate();
    }
    
    if (gameState.autoBattle) {
        attack();
    }
}

// ==================== 初始化 ====================

function init() {
    // 加载存档
    loadGame();
    
    // 初始化敌人
    if (!gameState.currentEnemy) {
        spawnEnemy();
    }
    
    // 绑定事件
    document.getElementById('btn-cultivate').addEventListener('click', startCultivate);
    document.getElementById('auto-cultivate').addEventListener('change', (e) => {
        gameState.autoCultivate = e.target.checked;
        if (gameState.autoCultivate && !gameState.isCultivating) {
            startCultivate();
        }
        saveGame();
    });
    
    document.getElementById('btn-attack').addEventListener('click', attack);
    document.getElementById('btn-auto-battle').addEventListener('click', () => {
        gameState.autoBattle = !gameState.autoBattle;
        updateUI();
        saveGame();
    });
    
    document.getElementById('btn-learn-skill').addEventListener('click', learnSkill);
    
    document.getElementById('modal-confirm').addEventListener('click', hideModal);
    document.getElementById('modal-cancel').addEventListener('click', hideModal);
    
    // Tab 切换（预留）
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
    
    // 启动游戏循环 (1秒)
    setInterval(gameLoop, 1000);
    
    // 首次保存
    saveGame();
    
    // 更新UI
    updateUI();
    
    console.log('仙途游戏初始化完成！');
}

// 启动游戏
document.addEventListener('DOMContentLoaded', init);
