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

// 装备库
const EQUIPMENT_LIB = {
    weapon: [
        { id: '木剑', name: '木剑', attack: 2, cost: 10 },
        { id: '铁剑', name: '铁剑', attack: 5, cost: 50 },
        { id: '精钢剑', name: '精钢剑', attack: 12, cost: 200 },
        { id: '灵器飞剑', name: '灵器飞剑', attack: 30, cost: 1000 },
        { id: '法宝青虹', name: '法宝青虹', attack: 80, cost: 5000 }
    ],
    armor: [
        { id: '布衣', name: '布衣', defense: 1, cost: 10 },
        { id: '皮甲', name: '皮甲', defense: 3, cost: 50 },
        { id: '铁甲', name: '铁甲', defense: 8, cost: 200 },
        { id: '灵甲', name: '灵甲', defense: 20, cost: 1000 },
        { id: '仙衣', name: '仙衣', defense: 50, cost: 5000 }
    ],
    accessory: [
        { id: '平安符', name: '平安符', defense: 1, cost: 20 },
        { id: '护身玉', name: '护身玉', defense: 3, cost: 80 },
        { id: '灵犀佩', name: '灵犀佩', defense: 8, cost: 300 },
        { id: '乾坤环', name: '乾坤环', defense: 20, cost: 1500 },
        { id: '先天至宝', name: '先天至宝', defense: 60, cost: 8000 }
    ]
};

// ==================== 游戏状态 ====================

let gameState = {
    player: {
        nickname: '修仙者',
        realm: 0,
        exp: 0,
        xiuxei: 0,
        lingqi: 0,
        lingshi: 0,
        // 真实感系统
        hp: 100,           // 生命值
        maxHp: 100,        // 最大生命值
        hunger: 100,        // 饱食度 (0=饿死)
        maxLingqi: 100,    // 灵气上限
        energy: 100,        // 体力 (战斗消耗)
        maxEnergy: 100,    // 最大体力
        // 属性
        rootBone: 10,
        comprehension: 10,
        fortune: 10,
        blessing: 10,
        // 境界瓶颈
        bottleneck: 0       // 瓶颈值
    },
    skills: ['呼吸吐纳'],
    equipment: {
        weapon: null,
        armor: null,
        accessory: null
    },
    autoCultivate: false,
    autoBattle: false,
    currentEnemy: null,
    enemyHp: 0,
    isCultivating: false,
    isBattling: false,
    inDungeon: false,
    currentDungeon: null,
    dungeonEnemiesDefeated: 0,
    // 今日次数
    today: {
        date: new Date().toDateString(),
        eaten: 0,           // 吃饭次数
        cultivated: 0,      // 修炼次数
        battles: 0         // 战斗次数
    }
};

// 副本战斗定时器引用（用于清除）
let dungeonBattleInterval = null;

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
            
            // 初始化新字段（兼容旧存档）
            if (gameState.player.hp === undefined) gameState.player.hp = 100;
            if (gameState.player.maxHp === undefined) gameState.player.maxHp = 100;
            if (gameState.player.hunger === undefined) gameState.player.hunger = 100;
            if (gameState.player.maxLingqi === undefined) gameState.player.maxLingqi = 100;
            if (gameState.player.energy === undefined) gameState.player.energy = 100;
            if (gameState.player.maxEnergy === undefined) gameState.player.maxEnergy = 100;
            if (gameState.player.bottleneck === undefined) gameState.player.bottleneck = 0;
            if (gameState.today === undefined) gameState.today = { date: new Date().toDateString(), eaten: 0, cultivated: 0, battles: 0 };
            
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
    
    // 根骨加成
    base *= (1 + getRootBoneBonus());
    
    return Math.floor(base * multiplier);
}

function getLingqiGain() {
    let base = 1;
    gameState.skills.forEach(skillId => {
        const skill = SKILL_LIB.find(s => s.id === skillId);
        if (skill && skill.effect.lingqiGain) {
            base += skill.effect.lingqiGain;
        }
    });
    return base || 1;
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
    // 悟性加成
    base *= (1 + getComprehensionBonus());
    // 装备攻击加成
    base += getAttackBonus();
    
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
    // 装备加成
    if (gameState.equipment.accessory) {
        const acc = EQUIPMENT_LIB.accessory.find(e => e.id === gameState.equipment.accessory);
        if (acc) reduction += acc.defense * 0.01;
    }
    return Math.min(reduction, 0.8); // 最高80%减伤
}

// 获取攻击加成
function getAttackBonus() {
    let attack = 0;
    if (gameState.equipment.weapon) {
        const weapon = EQUIPMENT_LIB.weapon.find(e => e.id === gameState.equipment.weapon);
        if (weapon) attack += weapon.attack;
    }
    return attack;
}

// 获取防御加成
function getDefenseBonus() {
    let defense = 0;
    if (gameState.equipment.armor) {
        const armor = EQUIPMENT_LIB.armor.find(e => e.id === gameState.equipment.armor);
        if (armor) defense += armor.defense;
    }
    if (gameState.equipment.accessory) {
        const acc = EQUIPMENT_LIB.accessory.find(e => e.id === gameState.equipment.accessory);
        if (acc) defense += acc.defense;
    }
    return defense;
}

// 获取根骨加成（影响修炼速度）
function getRootBoneBonus() {
    const rootBone = gameState.player.rootBone || 10;
    return rootBone * 0.05; // 每点根骨+5%修炼速度
}

// 获取悟性加成（影响功法效果）
function getComprehensionBonus() {
    const comp = gameState.player.comprehension || 10;
    return comp * 0.03; // 每点悟性+3%功法效果
}

// 获取福源加成（影响掉落）
function getFortuneBonus() {
    const fortune = gameState.player.fortune || 10;
    return fortune * 0.02; // 每点机遇+2%掉落
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
    
    // 更新属性面板
    updateAttributesPanel();
    
    // 更新装备面板
    updateEquipmentPanel();
    
    // 更新状态条
    updateStatusBars();
}

function updateAttributesPanel() {
    const attrs = ['rootBone', 'comprehension', 'fortune', 'blessing'];
    const labels = ['根骨', '悟性', '机遇', '福源'];
    
    attrs.forEach((attr, index) => {
        const el = document.getElementById(`attr-${attr}`);
        if (el) {
            el.textContent = gameState.player[attr];
        }
    });
    
    // 更新属性提升提示
    const tipEl = document.getElementById('attr-tip');
    if (tipEl) {
        const cost = getAttributeCost('rootBone');
        tipEl.textContent = `点击 + 提升属性（下次消耗 ${cost} 灵石）`;
    }
}

function updateEquipmentPanel() {
    const types = ['weapon', 'armor', 'accessory'];
    
    types.forEach(type => {
        const el = document.getElementById(`equip-${type}`);
        if (el) {
            const equipId = gameState.equipment[type];
            if (equipId) {
                const items = EQUIPMENT_LIB[type];
                const item = items.find(e => e.id === equipId);
                el.innerHTML = `<span class="equipped-name">${item.name}</span>`;
            } else {
                el.innerHTML = '<span class="no-equip">未装备</span>';
            }
        }
    });
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
    const lingqiGain = getLingqiGain();
    
    gameState.player.xiuxei += speed;
    gameState.player.lingqi += lingqiGain;
    
    // 统计修炼
    gameState.stats.totalCultivate = (gameState.stats.totalCultivate || 0) + speed;
    
    // 触发随机事件
    triggerRandomEvent();
    
    // 检查是否需要突破
    checkRealmUp();
    
    // 检查成就
    checkAchievements();
    
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
    
    // 统计伤害
    gameState.stats.totalDamage = (gameState.stats.totalDamage || 0) + damage;
    
    // 检查敌人是否死亡
    if (gameState.enemyHp <= 0) {
        const enemy = gameState.currentEnemy;
        const exp = Math.floor(enemy.exp * (1 + gameState.player.realm * 0.2));
        const lingshi = Math.floor(enemy.lingshi * (1 + gameState.player.realm * 0.2) * (1 + getFortuneBonus()));
        
        gameState.player.exp += exp;
        gameState.player.lingshi += lingshi;
        
        // 统计
        gameState.stats.enemiesDefeated = (gameState.stats.enemiesDefeated || 0) + 1;
        gameState.stats.consecutiveWins = (gameState.stats.consecutiveWins || 0) + 1;
        
        addBattleLog(`击败 ${enemy.name}！获得 ${exp} 修为, ${lingshi} 灵石`, 'loot');
        
        // 检查成就
        checkAchievements();
        
        // 立即刷新敌人
        spawnEnemy();
        
        // 标记敌人刚刚被击败（供副本系统使用）
        gameState.enemyJustDefeated = true;
    } else {
        // 未击败敌人，连胜中断
        gameState.stats.consecutiveWins = 0;
        gameState.enemyJustDefeated = false;
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
    const defense = getDefenseBonus();
    // 最终伤害 = 基础伤害 * (1 - 减伤) - 防御
    let damage = Math.floor(baseDamage * (1 - reduction) - defense * 0.5);
    damage = Math.max(1, damage); // 最低1点伤害
    
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
    
    // 检查成就
    gameState.autoCultivateUsed = true;
    checkAchievements();
    
    updateUI();
    saveGame();
}

// 属性提升系统
const ATTRIBUTE_UPGRADE = {
    rootBone: { name: '根骨', desc: '提升修炼速度', cost: 50, costMultiplier: 1.5 },
    comprehension: { name: '悟性', desc: '提升功法效果', cost: 50, costMultiplier: 1.5 },
    fortune: { name: '机遇', desc: '提升掉落几率', cost: 50, costMultiplier: 1.5 },
    blessing: { name: '福源', desc: '提升突破成功率', cost: 50, costMultiplier: 1.5 }
};

function getAttributeCost(attr) {
    const config = ATTRIBUTE_UPGRADE[attr];
    const currentLevel = gameState.player[attr];
    return Math.floor(config.cost * Math.pow(config.costMultiplier, currentLevel - 10));
}

function upgradeAttribute(attr) {
    const config = ATTRIBUTE_UPGRADE[attr];
    const cost = getAttributeCost(attr);
    
    if (gameState.player.lingshi < cost) {
        showModal('灵石不足', `提升 ${config.name} 需要 ${cost} 灵石`);
        return;
    }
    
    gameState.player.lingshi -= cost;
    gameState.player[attr]++;
    
    showModal('属性提升', `${config.name} +1\n${config.desc}\n当前: ${gameState.player[attr]}`);
    
    // 检查成就
    checkAchievements();
    
    updateUI();
    saveGame();
}

// 装备系统
function openEquipmentShop(type) {
    const items = EQUIPMENT_LIB[type];
    if (!items) return;
    
    let message = `${type === 'weapon' ? '武器' : type === 'armor' ? '防具' : '饰品'}商店\n\n`;
    items.forEach((item, index) => {
        const equipped = gameState.equipment[type] === item.id;
        message += `${index + 1}. ${item.name} ${equipped ? '【已装备】' : ''}\n`;
        message += `   攻击:${item.attack || 0} 防御:${item.defense || 0} 价格:${item.cost}\n`;
    });
    message += `\n输入序号购买/穿戴装备`;
    
    const choice = prompt(message);
    if (choice === null) return;
    
    const index = parseInt(choice) - 1;
    if (index < 0 || index >= items.length) {
        showModal('提示', '无效的选择');
        return;
    }
    
    const item = items[index];
    
    // 如果已装备，直接返回
    if (gameState.equipment[type] === item.id) {
        showModal('提示', `${item.name} 已装备`);
        return;
    }
    
    // 检查灵石
    if (gameState.player.lingshi < item.cost) {
        showModal('灵石不足', `购买 ${item.name} 需要 ${item.cost} 灵石`);
        return;
    }
    
    gameState.player.lingshi -= item.cost;
    gameState.equipment[type] = item.id;
    
    showModal('装备成功', `已装备 ${item.name}！\n攻击+${item.attack || 0} 防御+${item.defense || 0}`);
    
    updateUI();
    saveGame();
}

function unequip(type) {
    if (!gameState.equipment[type]) {
        showModal('提示', '没有装备该类型的装备');
        return;
    }
    
    const itemId = gameState.equipment[type];
    const items = EQUIPMENT_LIB[type];
    const item = items.find(e => e.id === itemId);
    
    // 返还一半灵石
    const refund = Math.floor(item.cost / 2);
    gameState.player.lingshi += refund;
    gameState.equipment[type] = null;
    
    showModal('卸下装备', `已卸下 ${item.name}，返还 ${refund} 灵石`);
    
    updateUI();
    saveGame();
}

// 副本系统
function enterDungeon(dungeonIndex) {
    const dungeons = [
        { name: '新手试炼', minRealm: 0, enemies: 3, reward: 50 },
        { name: '筑基秘境', minRealm: 1, enemies: 5, reward: 200 },
        { name: '金丹洞府', minRealm: 2, enemies: 8, reward: 1000 }
    ];
    
    if (dungeonIndex >= dungeons.length) {
        showModal('提示', '副本尚未解锁');
        return;
    }
    
    const dungeon = dungeons[dungeonIndex];
    
    // 🔧 修复：检查是否已在副本中
    if (gameState.inDungeon) {
        showModal('提示', '你正在挑战副本中，请完成后再次进入！');
        return;
    }
    
    if (gameState.player.realm < dungeon.minRealm) {
        showModal('境界不足', `需要 ${REALMS[dungeon.minRealm].name} 才能进入`);
        return;
    }
    
    // 🔧 修复：保存当前状态，关闭自动战斗
    const originalAutoBattle = gameState.autoBattle;
    gameState.autoBattle = false;
    
    // 🔧 修复：设置副本状态
    gameState.inDungeon = true;
    gameState.currentDungeon = dungeon;
    gameState.dungeonEnemiesDefeated = 0;
    
    // 禁用副本按钮
    updateDungeonButtons(true);
    
    showModal('副本挑战', `正在挑战 ${dungeon.name}...\n击败 ${dungeon.enemies} 个敌人`);
    
    // 🔧 修复：保存定时器引用，确保只运行一个
    if (dungeonBattleInterval) {
        clearInterval(dungeonBattleInterval);
    }
    
    dungeonBattleInterval = setInterval(() => {
        // 🔧 修复：检查副本状态
        if (!gameState.inDungeon) {
            clearInterval(dungeonBattleInterval);
            dungeonBattleInterval = null;
            return;
        }
        
        // 执行攻击
        attack();
        
        // 🔧 修复：使用标志检测敌人是否被击败
        if (gameState.enemyJustDefeated) {
            // 敌人被击败
            gameState.dungeonEnemiesDefeated++;
            gameState.enemyJustDefeated = false; // 重置标志
            
            addBattleLog(`击败敌人 ${gameState.dungeonEnemiesDefeated}/${dungeon.enemies}`, 'loot');
            
            // 检查是否通关
            if (gameState.dungeonEnemiesDefeated >= dungeon.enemies) {
                // 通关！
                clearInterval(dungeonBattleInterval);
                dungeonBattleInterval = null;
                
                // 🔧 修复：重置副本状态
                gameState.inDungeon = false;
                gameState.currentDungeon = null;
                gameState.dungeonEnemiesDefeated = 0;
                
                // 恢复自动战斗状态
                gameState.autoBattle = originalAutoBattle;
                
                // 启用副本按钮
                updateDungeonButtons(false);
                
                // 发放奖励
                gameState.player.lingshi += dungeon.reward;
                gameState.player.exp += dungeon.reward * 2;
                
                // 统计副本通关
                gameState.stats.dungeonsCleared = (gameState.stats.dungeonsCleared || 0) + 1;
                
                // 检查成就
                checkAchievements();
                
                showModal('🎉 副本完成', `恭喜通关 ${dungeon.name}！\n获得 ${dungeon.reward} 灵石, ${dungeon.reward * 2} 修为`);
                updateUI();
                saveGame();
            }
        }
    }, 1000); // 🔧 修复：1秒间隔，避免过快
}

// 🔧 新增：更新副本按钮状态
function updateDungeonButtons(disabled) {
    const dungeonIds = ['dungeon-0', 'dungeon-1', 'dungeon-2'];
    
    dungeonIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (disabled) {
                el.classList.add('disabled');
                el.onclick = null; // 移除点击事件
            } else {
                el.classList.remove('disabled');
                // 恢复点击事件
                const index = parseInt(id.split('-')[1]);
                el.onclick = () => enterDungeon(index);
            }
        }
    });
}

// 重置游戏
function resetGame() {
    if (confirm('确定要重置游戏吗？所有数据将被清除！')) {
        localStorage.removeItem('xiantu_save');
        
        // 重置状态
        gameState = {
            player: {
                nickname: '修仙者',
                realm: 0,
                exp: 0,
                xiuxei: 0,
                lingqi: 0,
                lingshi: 0,
                rootBone: 10,
                comprehension: 10,
                fortune: 10,
                blessing: 10
            },
            skills: ['呼吸吐纳'],
            equipment: {
                weapon: null,
                armor: null,
                accessory: null
            },
            autoCultivate: false,
            autoBattle: false,
            currentEnemy: null,
            enemyHp: 0,
            isCultivating: false,
            isBattling: false
        };
        
        spawnEnemy();
        updateUI();
        saveGame();
        
        showModal('重置成功', '游戏已重置为初始状态');
    }
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

// ==================== 成就系统 ====================

const ACHIEVEMENTS = [
    { id: 'first_cultivate', name: '初入修仙', desc: '完成第一次修炼', check: (s) => s.player.xiuxei >= 1 },
    { id: 'reach_qi', name: '引气入体', desc: '累计获得100点灵气', check: (s) => s.player.lingqi >= 100 },
    { id: 'first_battle', name: '初战告捷', desc: '击败第一个敌人', check: (s) => s.stats.enemiesDefeated >= 1 },
    { id: 'reach_zhuanke', name: '筑基成功', desc: '突破到筑基期', check: (s) => s.player.realm >= 1 },
    { id: 'rich', name: '小有积蓄', desc: '拥有1000灵石', check: (s) => s.player.lingshi >= 1000 },
    { id: 'millionaire', name: '灵石大亨', desc: '拥有10000灵石', check: (s) => s.player.lingshi >= 10000 },
    { id: 'reach_jindan', name: '结成金丹', desc: '突破到金丹期', check: (s) => s.player.realm >= 2 },
    { id: 'reach_yuanying', name: '元婴大成', desc: '突破到元婴期', check: (s) => s.player.realm >= 3 },
    { id: 'skill_master', name: '功法小成', desc: '学会3种功法', check: (s) => s.skills.length >= 3 },
    { id: 'equip_master', name: '全副武装', desc: '装备武器、防具、饰品', check: (s) => s.equipment.weapon && s.equipment.armor && s.equipment.accessory },
    { id: 'killer', name: '斩妖除魔', desc: '击败100个敌人', check: (s) => (s.stats.enemiesDefeated || 0) >= 100 },
    { id: 'dungeon_clear', name: '副本首通', desc: '通关任意副本', check: (s) => (s.stats.dungeonsCleared || 0) >= 1 },
    { id: 'auto_cultivate', name: '自动修炼', desc: '使用自动修炼功能', check: (s) => s.autoCultivateUsed },
    { id: 'auto_battle', name: '战斗达人', desc: '使用自动战斗功能', check: (s) => s.autoBattleUsed },
    { id: 'realm_5', name: '化神期修士', desc: '突破到化神期', check: (s) => s.player.realm >= 4 },
    { id: 'realm_8', name: '大乘期大能', desc: '突破到大乘期', check: (s) => s.player.realm >= 7 },
    { id: 'legend', name: '传说仙人', desc: '突破到仙人境界', check: (s) => s.player.realm >= 9 },
    { id: 'collector', name: '收藏家', desc: '拥有5件不同装备', check: (s) => getAllEquipment(s.equipment).length >= 5 },
    { id: 'high_attr', name: '天赋异禀', desc: '单项属性超过30', check: (s) => Math.max(s.player.rootBone, s.player.comprehension, s.player.fortune, s.player.blessing) >= 30 },
    { id: 'warrior', name: '百战百胜', desc: '连续击败10个敌人', check: (s) => (s.stats.consecutiveWins || 0) >= 10 },
    // 随机事件成就
    { id: 'event_1', name: '奇遇降临', desc: '触发第一次随机事件', check: (s) => (s.stats.eventsTriggered || 0) >= 1 },
    { id: 'event_10', name: '历练老手', desc: '触发10次随机事件', check: (s) => (s.stats.eventsTriggered || 0) >= 10 },
    { id: 'event_50', name: '天选之人', desc: '触发50次随机事件', check: (s) => (s.stats.eventsTriggered || 0) >= 50 }
];

function getAllEquipment(equipment) {
    const items = [];
    if (equipment.weapon) items.push(equipment.weapon);
    if (equipment.armor) items.push(equipment.armor);
    if (equipment.accessory) items.push(equipment.accessory);
    return items;
}

// 初始化统计
if (!gameState.stats) {
    gameState.stats = {
        enemiesDefeated: 0,
        dungeonsCleared: 0,
        totalDamage: 0,
        totalCultivate: 0,
        consecutiveWins: 0
    };
}

// 初始化成就
if (!gameState.achievements) {
    gameState.achievements = [];
}

// 检查并解锁成就
function checkAchievements() {
    const newAchievements = [];
    
    ACHIEVEMENTS.forEach(ach => {
        if (!gameState.achievements.includes(ach.id) && ach.check(gameState)) {
            gameState.achievements.push(ach.id);
            newAchievements.push(ach);
        }
    });
    
    // 显示新成就通知
    if (newAchievements.length > 0) {
        showAchievementNotification(newAchievements);
    }
    
    return newAchievements;
}

function showAchievementNotification(achievements) {
    achievements.forEach((ach, index) => {
        setTimeout(() => {
            showModal('🏆 成就解锁！', `【${ach.name}】\n${ach.desc}`);
        }, index * 500);
    });
}

function renderAchievements() {
    const container = document.getElementById('achievements-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    ACHIEVEMENTS.forEach(ach => {
        const unlocked = gameState.achievements.includes(ach.id);
        const item = document.createElement('div');
        item.className = `achievement-item ${unlocked ? 'unlocked' : 'locked'}`;
        item.innerHTML = `
            <div class="achievement-icon">${unlocked ? '🏆' : '🔒'}</div>
            <div class="achievement-info">
                <span class="achievement-name">${ach.name}</span>
                <span class="achievement-desc">${ach.desc}</span>
            </div>
            <span class="achievement-status">${unlocked ? '已达成' : '未达成'}</span>
        `;
        container.appendChild(item);
    });
}

function updateAchievementsStats() {
    const statAchievements = document.getElementById('stat-achievements');
    const statEnemies = document.getElementById('stat-enemies');
    const statDungeons = document.getElementById('stat-dungeons');
    
    if (statAchievements) statAchievements.textContent = gameState.achievements.length;
    if (statEnemies) statEnemies.textContent = formatNumber(gameState.stats?.enemiesDefeated || 0);
    if (statDungeons) statDungeons.textContent = formatNumber(gameState.stats?.dungeonsCleared || 0);
}

// ==================== 离线收益 ====================

let lastSaveTime = Date.now();

function calculateOfflineEarnings() {
    if (!gameState.lastPlayTime) return 0;
    
    const now = Date.now();
    const offlineSeconds = Math.floor((now - gameState.lastPlayTime) / 1000);
    
    // 最多计算24小时的离线收益
    const maxOfflineSeconds = 24 * 60 * 60;
    const effectiveSeconds = Math.min(offlineSeconds, maxOfflineSeconds);
    
    if (effectiveSeconds < 60) return 0; // 少于1分钟不计
    
    // 计算收益
    const speed = getCultivateSpeed();
    const lingqiGain = getLingqiGain();
    
    const xiuxei = speed * effectiveSeconds;
    const lingqi = lingqiGain * effectiveSeconds;
    
    return {
        seconds: effectiveSeconds,
        xiuxei: xiuxei,
        lingqi: lingqi
    };
}

function applyOfflineEarnings() {
    const earnings = calculateOfflineEarnings();
    
    if (earnings.xiuxei > 0 || earnings.lingqi > 0) {
        gameState.player.xiuxei += earnings.xiuxei;
        gameState.player.lingqi += earnings.lingqi;
        
        showModal('📥 离线收益', 
            `离线 ${formatOfflineTime(earnings.seconds)} 修炼收益：\n\n` +
            `修为 +${formatNumber(earnings.xiuxei)}\n` +
            `灵气 +${formatNumber(earnings.lingqi)}`
        );
    }
}

// 离线收益时间格式化
function formatOfflineTime(seconds) {
    if (seconds >= 86400) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        return `${days}天${hours}小时`;
    } else if (seconds >= 3600) {
        return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分钟`;
    } else if (seconds >= 60) {
        return `${Math.floor(seconds / 60)}分钟`;
    }
    return `${seconds}秒`;
}

// 记录最后在线时间
function recordPlayTime() {
    gameState.lastPlayTime = Date.now();
    saveGame();
}

// ==================== 初始化 ====================

function init() {
    // 加载存档
    loadGame();
    
    // 初始化统计和成就（兼容旧存档）
    if (!gameState.stats) gameState.stats = {};
    if (!gameState.achievements) gameState.achievements = [];
    
    // 计算并应用离线收益
    applyOfflineEarnings();
    
    // 初始化敌人
    if (!gameState.currentEnemy) {
        spawnEnemy();
    }
    
    // 记录开始时间
    recordPlayTime();
    
    // 绑定修炼事件
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
        if (gameState.autoCultivate && !gameState.isCultivating) {
            startCultivate();
        }
        gameState.autoCultivateUsed = true;
        checkAchievements();
        saveGame();
    });
    
    // 绑定战斗事件
    document.getElementById('btn-attack').addEventListener('click', () => {
        attack();
        gameState.autoBattleUsed = true;
        checkAchievements();
    });
    document.getElementById('btn-auto-battle').addEventListener('click', () => {
        gameState.autoBattle = !gameState.autoBattle;
        if (gameState.autoBattle) {
            gameState.autoBattleUsed = true;
            checkAchievements();
        }
        updateUI();
        saveGame();
    });
    
    // 绑定功法事件
    document.getElementById('btn-learn-skill').addEventListener('click', learnSkill);
    
    // 绑定吃饭事件
    document.getElementById('btn-eat')?.addEventListener('click', eatFood);
    
    // 绑定装备事件
    document.getElementById('btn-weapon-shop')?.addEventListener('click', () => openEquipmentShop('weapon'));
    document.getElementById('btn-armor-shop')?.addEventListener('click', () => openEquipmentShop('armor'));
    document.getElementById('btn-accessory-shop')?.addEventListener('click', () => openEquipmentShop('accessory'));
    document.getElementById('btn-unequip-weapon')?.addEventListener('click', () => unequip('weapon'));
    document.getElementById('btn-unequip-armor')?.addEventListener('click', () => unequip('armor'));
    document.getElementById('btn-unequip-accessory')?.addEventListener('click', () => unequip('accessory'));
    document.getElementById('btn-reset-game')?.addEventListener('click', resetGame);
    
    // 绑定弹窗事件
    document.getElementById('modal-confirm').addEventListener('click', hideModal);
    document.getElementById('modal-cancel').addEventListener('click', hideModal);
    
    // Tab 切换
    initTabs();
    
    // 启动游戏循环 (1秒)
    let loopCounter = 0;
    function gameLoop() {
        // 恢复饱食度和体力
        restoreStamina();
        
        if (gameState.isCultivating) {
            doCultivate();
        }
        
        if (gameState.autoBattle) {
            attack();
        }
        
        // 每10秒保存一次并检查成就
        loopCounter++;
        if (loopCounter >= 10) {
            loopCounter = 0;
            recordPlayTime();
            checkAchievements();
        }
    }
    
    setInterval(gameLoop, 1000);
    
    // 首次保存
    saveGame();
    
    // 更新UI
    updateUI();
    
    console.log('仙途游戏初始化完成！');
}

function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const panels = {
        'home': document.getElementById('panel-home'),
        'skills': document.getElementById('panel-skills'),
        'dungeon': document.getElementById('panel-dungeon'),
        'achievements': document.getElementById('panel-achievements'),
        'profile': document.getElementById('panel-profile')
    };
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有active
            tabs.forEach(t => t.classList.remove('active'));
            
            // 添加当前active
            tab.classList.add('active');
            
            // 显示对应面板
            const tabName = tab.dataset.tab;
            Object.keys(panels).forEach(key => {
                if (panels[key]) {
                    panels[key].style.display = key === tabName ? 'block' : 'none';
                }
            });
            
            // 成就页面特殊处理
            if (tabName === 'achievements') {
                renderAchievements();
                updateAchievementsStats();
            }
        });
    });
}

// 启动游戏
document.addEventListener('DOMContentLoaded', init);


// ==================== 随机事件系统 ====================

// 随机事件配置
const RANDOM_EVENTS = [
    // 正面事件
    {
        id: 'find_lingshi',
        name: '💰 路边拾遗',
        desc: '在路边发现了一些灵石',
        type: 'good',
        weight: 15,
        trigger: () => {
            const amount = Math.floor(10 + Math.random() * 50 * (1 + gameState.player.realm * 0.5));
            gameState.player.lingshi += amount;
            return `捡到 ${amount} 灵石！`;
        }
    },
    {
        id: 'find_treasure',
        name: '🎁 偶遇宝藏',
        desc: '发现了一个神秘的宝箱',
        type: 'good',
        weight: 8,
        trigger: () => {
            const lingshi = Math.floor(50 + Math.random() * 100 * (1 + gameState.player.realm));
            const exp = Math.floor(20 + Math.random() * 50 * (1 + gameState.player.realm));
            gameState.player.lingshi += lingshi;
            gameState.player.exp += exp;
            return `获得 ${lingshi} 灵石和 ${exp} 修为！`;
        }
    },
    {
        id: 'sudden_insight',
        name: '💡 顿悟',
        desc: '修炼中突然有所领悟',
        type: 'good',
        weight: 10,
        trigger: () => {
            const exp = Math.floor(50 + Math.random() * 100 * (1 + gameState.player.realm * 0.5));
            gameState.player.exp += exp;
            return `修为大幅提升 +${exp}！`;
        }
    },
    {
        id: 'mystical_herb',
        name: '🌿 发现灵草',
        desc: '发现了一株珍贵的灵草',
        type: 'good',
        weight: 8,
        trigger: () => {
            const lingqi = Math.floor(30 + Math.random() * 70 * (1 + gameState.player.realm * 0.3));
            gameState.player.lingqi += lingqi;
            return `灵气 +${lingqi}！`;
        }
    },
    {
        id: 'stranger_gift',
        name: '🎁 神秘礼物',
        desc: '一位神秘修士送给了你礼物',
        type: 'good',
        weight: 5,
        trigger: () => {
            const lingshi = Math.floor(100 + Math.random() * 200 * (1 + gameState.player.realm));
            const bonus = Math.random() > 0.5;
            if (bonus) {
                gameState.player.lingshi += lingshi;
                return `获得神秘礼包：${lingshi} 灵石！`;
            } else {
                const exp = Math.floor(50 + Math.random() * 100);
                gameState.player.exp += exp;
                return `获得神秘礼包：${exp} 修为！`;
            }
        }
    },
    {
        id: 'immortal_guidance',
        name: '🧘 仙人指路',
        desc: '遇到仙人指点迷津',
        type: 'good',
        weight: 3,
        trigger: () => {
            const attr = ['rootBone', 'comprehension', 'fortune', 'blessing'][Math.floor(Math.random() * 4)];
            gameState.player[attr]++;
            const attrNames = { rootBone: '根骨', comprehension: '悟性', fortune: '机遇', blessing: '福源' };
            return `${attrNames[attr]} +1！仙人指点，受益匪浅！`;
        }
    },
    // 中性事件
    {
        id: 'traveler_encounter',
        name: '🚶 旅者相遇',
        desc: '遇到一位云游修士',
        type: 'neutral',
        weight: 12,
        trigger: () => {
            const topics = [
                '谈论修仙心得',
                '交流功法奥秘',
                '分享修炼经验',
                '讲述修仙界的奇闻异事'
            ];
            const topic = topics[Math.floor(Math.random() * topics.length)];
            const exp = Math.floor(10 + Math.random() * 30);
            gameState.player.exp += exp;
            return `${topic}，修为 +${exp}`;
        }
    },
    {
        id: 'old_book',
        name: '📜 古籍残片',
        desc: '发现一张古老的功法残片',
        type: 'neutral',
        weight: 6,
        trigger: () => {
            if (Math.random() > 0.7 && gameState.skills.length < SKILL_LIB.length) {
                const unlearned = SKILL_LIB.filter(s => !gameState.skills.includes(s.id));
                if (unlearned.length > 0) {
                    const skill = unlearned[Math.floor(Math.random() * unlearned.length)];
                    if (gameState.player.lingshi >= skill.cost) {
                        gameState.player.lingshi -= skill.cost;
                        gameState.skills.push(skill.id);
                        return `学会新功法【${skill.name}】！`;
                    }
                }
            }
            const exp = Math.floor(20 + Math.random() * 40);
            gameState.player.exp += exp;
            return `从残片中领悟到一些心得，修为 +${exp}`;
        }
    },
    // 负面事件
    {
        id: 'monster_attack',
        name: '👹 妖兽袭击',
        desc: '遭遇野生妖兽袭击',
        type: 'bad',
        weight: 10,
        trigger: () => {
            const damage = Math.floor(5 + Math.random() * 15 * (1 + gameState.player.realm * 0.3));
            gameState.player.exp = Math.max(0, gameState.player.exp - damage);
            return `被妖兽打伤，损失 ${damage} 修为！`;
        }
    },
    {
        id: 'trap',
        name: '🕳️ 误入陷阱',
        desc: '不小心触发了禁制',
        type: 'bad',
        weight: 8,
        trigger: () => {
            const loss = Math.floor(gameState.player.lingshi * 0.1);
            gameState.player.lingshi = Math.max(0, gameState.player.lingshi - loss);
            return `触发禁制，损失 ${loss} 灵石！`;
        }
    },
    {
        id: 'pickpocket',
        name: '👤 遭遇窃贼',
        desc: '被修仙界的窃贼盯上了',
        type: 'bad',
        weight: 6,
        trigger: () => {
            const loss = Math.floor(10 + Math.random() * 30);
            gameState.player.lingshi = Math.max(0, gameState.player.lingshi - loss);
            return `被盗贼偷走 ${loss} 灵石！`;
        }
    },
    {
        id: 'cultivation_fail',
        name: '🔥 走火入魔',
        desc: '修炼时心境不稳',
        type: 'bad',
        weight: 5,
        trigger: () => {
            const loss = Math.floor(gameState.player.exp * 0.05);
            gameState.player.exp = Math.max(0, gameState.player.exp - loss);
            return `真元紊乱，损失 ${loss} 修为！`;
        }
    },
    // 特殊事件
    {
        id: 'secret_shop',
        name: '🏪 神秘商人',
        desc: '遇到一位神秘商人',
        type: 'special',
        weight: 4,
        trigger: () => {
            const items = [];
            const allItems = [...EQUIPMENT_LIB.weapon, ...EQUIPMENT_LIB.armor, ...EQUIPMENT_LIB.accessory];
            const count = Math.min(3, allItems.length);
            
            for (let i = 0; i < count; i++) {
                const item = allItems[Math.floor(Math.random() * allItems.length)];
                if (!items.find(i => i.id === item.id)) {
                    items.push(item);
                }
            }
            
            let msg = '神秘商人出售以下物品：\n\n';
            items.forEach((item, idx) => {
                msg += `${idx + 1}. ${item.name} - ${item.cost} 灵石\n`;
                msg += `   攻击:${item.attack || 0} 防御:${item.defense || 0}\n`;
            });
            msg += '\n输入序号购买（取消则离开）';
            
            const choice = prompt(msg);
            if (choice !== null) {
                const idx = parseInt(choice) - 1;
                if (idx >= 0 && idx < items.length) {
                    const item = items[idx];
                    if (gameState.player.lingshi >= item.cost) {
                        const type = EQUIPMENT_LIB.weapon.includes(item) ? 'weapon' : 
                                    EQUIPMENT_LIB.armor.includes(item) ? 'armor' : 'accessory';
                        gameState.player.lingshi -= item.cost;
                        gameState.equipment[type] = item.id;
                        return `购买了 ${item.name}！`;
                    } else {
                        return '灵石不足，无法购买';
                    }
                }
            }
            return '你离开了神秘商人';
        }
    },
    {
        id: 'trial',
        name: '⚔️ 挑战者',
        desc: '有人向你发起挑战',
        type: 'special',
        weight: 5,
        trigger: () => {
            const enemyRealm = Math.max(0, Math.min(gameState.player.realm + Math.floor(Math.random() * 3) - 1, ENEMIES.length - 1));
            const enemy = ENEMIES[enemyRealm];
            const hp = Math.floor(enemy.baseHp * (1 + enemyRealm * 0.5));
            const damage = getDamage();
            
            if (damage >= hp * 0.5) {
                const exp = Math.floor(enemy.exp * 1.5);
                const lingshi = Math.floor(enemy.lingshi * 1.5);
                gameState.player.exp += exp;
                gameState.player.lingshi += lingshi;
                return `击败挑战者！获得 ${exp} 修为, ${lingshi} 灵石！`;
            } else {
                const loss = Math.floor(gameState.player.exp * 0.1);
                gameState.player.exp = Math.max(0, gameState.player.exp - loss);
                return `挑战失败，损失 ${loss} 修为！`;
            }
        }
    }
];

// 随机事件触发概率（每次修炼/战斗）
const EVENT_CHANCE = 0.08; // 8% 概率触发

// 记录上次事件时间
let lastEventTime = 0;
let eventCooldown = 30; // 事件冷却时间（秒）

// 触发随机事件
function triggerRandomEvent() {
    const now = Date.now();
    if (now - lastEventTime < eventCooldown * 1000) return false;
    if (Math.random() > EVENT_CHANCE) return false;
    
    lastEventTime = now;
    
    // 根据权重计算概率
    const totalWeight = RANDOM_EVENTS.reduce((sum, e) => sum + e.weight, 0);
    let random = Math.random() * totalWeight;
    let event = RANDOM_EVENTS[0];
    
    for (const e of RANDOM_EVENTS) {
        random -= e.weight;
        if (random <= 0) {
            event = e;
            break;
        }
    }
    
    // 根据境界过滤一些事件
    if (gameState.player.realm < 2 && event.id === 'secret_shop') return false;
    
    // 触发事件
    const result = event.trigger();
    const typeLabels = { good: '🎉', neutral: '📢', bad: '💔', special: '⭐' };
    
    showModal(`${typeLabels[event.type]} ${event.name}`, result);
    addBattleLog(`[${event.name}] ${result}`, event.type === 'good' ? 'loot' : event.type === 'bad' ? 'damage' : '');
    
    // 统计事件
    gameState.stats.eventsTriggered = (gameState.stats.eventsTriggered || 0) + 1;
    
    // 事件成就检查
    checkEventAchievements();
    
    updateUI();
    saveGame();
    return true;
}

// 事件相关成就
function checkEventAchievements() {
    const events = gameState.stats.eventsTriggered || 0;
    if (events >= 1 && !gameState.achievements.includes('event_1')) {
        gameState.achievements.push('event_1');
        gameState.stats.firstEvent = true;
    }
    if (events >= 10 && !gameState.achievements.includes('event_10')) {
        gameState.achievements.push('event_10');
    }
    if (events >= 50 && !gameState.achievements.includes('event_50')) {
        gameState.achievements.push('event_50');
    }
}


// ==================== 真实感修仙系统 ====================

// 恢复饱食度和体力
function restoreStamina() {
    // 每10秒恢复一点饱食度
    if (gameState.player.hunger < 100) {
        gameState.player.hunger = Math.min(100, gameState.player.hunger + 0.5);
    }
    // 每10秒恢复体力
    if (gameState.player.energy < gameState.player.maxEnergy) {
        gameState.player.energy = Math.min(gameState.player.maxEnergy, gameState.player.energy + 1);
    }
}

// 检查是否无法修炼/战斗
function checkCanAct() {
    // 饥饿检查
    if (gameState.player.hunger <= 0) {
        showModal('☠️ 饿死边缘', '你已经饿了几天了！快去吃点东西吧！\n\n没有饱食度无法修炼和战斗！');
        gameState.isCultivating = false;
        gameState.autoBattle = false;
        return false;
    }
    // 体力检查
    if (gameState.player.energy < 10) {
        showModal('💨 体力不支', '你的体力已经耗尽了！\n\n休息一下再继续吧。');
        gameState.isCultivating = false;
        gameState.autoBattle = false;
        return false;
    }
    // 生命值检查
    if (gameState.player.hp <= 0) {
        showModal('💀 重伤昏迷', '你被打成重伤，昏迷了过去！\n\n修为损失严重！');
        gameState.player.hp = gameState.player.maxHp;
        gameState.player.exp = Math.floor(gameState.player.exp * 0.8);
        gameState.isCultivating = false;
        gameState.autoBattle = false;
        return false;
    }
    return true;
}

// 吃饭恢复
function eatFood() {
    // 检查今天吃饭次数
    const today = new Date().toDateString();
    if (gameState.today.date !== today) {
        gameState.today.date = today;
        gameState.today.eaten = 0;
    }
    
    if (gameState.today.eaten >= 3) {
        showModal('🍚 吃饱了', '今天已经吃了很多了，明天再来吧！');
        return;
    }
    
    const foods = [
        { name: '粗茶淡饭', hunger: 20, energy: 10, cost: 5 },
        { name: '灵米粥', hunger: 40, energy: 20, cost: 20 },
        { name: '灵禽肉', hunger: 60, energy: 30, cost: 50 },
        { name: '千年灵果', hunger: 100, energy: 50, cost: 200 }
    ];
    
    let msg = '🍖 用餐\n\n';
    foods.forEach((food, idx) => {
        msg += `${idx + 1}. ${food.name} 饱食+${food.hunger} 体力+${food.energy} (${food.cost}灵石)\n`;
    });
    msg += '\n输入序号选择（取消退出）';
    
    const choice = prompt(msg);
    if (choice === null) return;
    
    const idx = parseInt(choice) - 1;
    if (idx < 0 || idx >= foods.length) return;
    
    const food = foods[idx];
    
    if (gameState.player.lingshi < food.cost) {
        showModal('💰 灵石不足', `需要 ${food.cost} 灵石`);
        return;
    }
    
    gameState.player.lingshi -= food.cost;
    gameState.player.hunger = Math.min(100, gameState.player.hunger + food.hunger);
    gameState.player.energy = Math.min(gameState.player.maxEnergy, gameState.player.energy + food.energy);
    gameState.today.eaten++;
    
    showModal('🍽️ 用餐成功', `吃了 ${food.name}\n饱食度 +${food.hunger}\n体力 +${food.energy}`);
    updateUI();
    saveGame();
}

// 境界瓶颈系统
function checkBottleneck() {
    const nextRealm = getNextRealm();
    if (!nextRealm) return false;
    
    const realm = gameState.player.realm;
    const expRequired = nextRealm.expReq;
    const currentExp = gameState.player.exp;
    const progress = currentExp / expRequired;
    
    // 瓶颈：当修为达到境界要求的80%时开始出现
    if (progress >= 0.8 && gameState.player.bottleneck < 100) {
        // 瓶颈增加
        gameState.player.bottleneck = Math.min(100, (progress - 0.8) * 500);
        
        // 瓶颈高时，修炼效率下降
        if (gameState.player.bottleneck > 50) {
            const efficiency = 1 - (gameState.player.bottleneck - 50) / 100;
            return efficiency;
        }
    } else {
        // 瓶颈重置
        gameState.player.bottleneck = 0;
    }
    
    return 1; // 正常效率
}

// 突破境界（有失败概率）
function breakthrough() {
    const nextRealm = getNextRealm();
    if (!nextRealm) {
        showModal('🎉 已成仙人', '你已经是仙人了！');
        return;
    }
    
    if (gameState.player.exp < nextRealm.expReq) {
        showModal('❌ 修为不足', `突破到 ${nextRealm.name} 需要 ${nextRealm.expReq} 修为\n当前: ${gameState.player.exp}`);
        return;
    }
    
    if (gameState.player.bottleneck < 80) {
        showModal('⚠️ 瓶颈未破', '你的瓶颈还不够深厚，无法突破。\n\n继续修炼，当修为达到要求的80%时会触发瓶颈。');
        return;
    }
    
    // 计算突破成功率
    const baseSuccess = 0.3; // 基础30%成功率
    const blessingBonus = gameState.player.blessing * 0.02; // 福源加成
    const realmPenalty = gameState.player.realm * 0.05; // 境界越高越难
    const successRate = Math.max(0.1, Math.min(0.8, baseSuccess + blessingBonus - realmPenalty));
    
    if (Math.random() < successRate) {
        // 突破成功
        gameState.player.realm++;
        gameState.player.exp -= nextRealm.expReq;
        gameState.player.bottleneck = 0;
        
        // 境界提升，全属性恢复
        gameState.player.maxHp += 50;
        gameState.player.hp = gameState.player.maxHp;
        gameState.player.maxLingqi += 100;
        gameState.player.lingqi = gameState.player.maxLingqi;
        gameState.player.maxEnergy += 20;
        gameState.player.energy = gameState.player.maxEnergy;
        
        showModal('🎊 境界突破！', `恭喜突破到 ${getRealm().name}！\n\n修炼速度大幅提升！\n最大生命 +50，灵气上限 +100`);
        
        spawnEnemy();
        checkAchievements();
    } else {
        // 突破失败
        const expLoss = Math.floor(nextRealm.expReq * 0.3);
        gameState.player.exp = Math.max(0, gameState.player.exp - expLoss);
        gameState.player.bottleneck = 0;
        
        showModal('💔 突破失败', `突破失败！损失 ${expLoss} 修为。\n\n再接再厉！`);
    }
    
    updateUI();
    saveGame();
}

// 更新状态条显示
function updateStatusBars() {
    // 获取值，提供默认值
    const hunger = gameState.player.hunger || 0;
    const energy = gameState.player.energy || 0;
    const maxEnergy = gameState.player.maxEnergy || 100;
    const hp = gameState.player.hp || 0;
    const maxHp = gameState.player.maxHp || 100;
    
    // 饱食度
    const hungerEl = document.getElementById('hunger-bar');
    if (hungerEl) {
        hungerEl.style.width = Math.max(0, Math.min(100, hunger)) + '%';
        hungerEl.style.background = hunger < 30 ? 'var(--accent-red)' : 
                                     hunger < 60 ? 'var(--accent-gold)' : 'var(--accent-green)';
    }
    
    // 体力
    const energyEl = document.getElementById('energy-bar');
    if (energyEl) {
        energyEl.style.width = Math.max(0, Math.min(100, (energy / maxEnergy * 100))) + '%';
    }
    
    // 生命值
    const hpEl = document.getElementById('hp-bar');
    if (hpEl) {
        hpEl.style.width = Math.max(0, Math.min(100, (hp / maxHp * 100))) + '%';
    }
}

// 修改修炼函数 - 消耗饱食度和体力
const originalDoCultivate = doCultivate;
doCultivate = function() {
    if (!gameState.isCultivating) return;
    if (!checkCanAct()) {
        gameState.isCultivating = false;
        updateUI();
        return;
    }
    
    // 瓶颈效率
    const efficiency = checkBottleneck();
    
    const speed = Math.floor(getCultivateSpeed() * efficiency);
    const lingqiGain = getLingqiGain();
    const maxLingqi = gameState.player.maxLingqi || 100;
    
    gameState.player.xiuxei += speed;
    gameState.player.lingqi = Math.min(maxLingqi, gameState.player.lingqi + lingqiGain);
    
    // 修炼消耗饱食度和体力
    gameState.player.hunger = Math.max(0, gameState.player.hunger - 0.5);
    gameState.player.energy = Math.max(0, gameState.player.energy - 1);
    
    // 统计修炼
    gameState.stats.totalCultivate = (gameState.stats.totalCultivate || 0) + speed;
    
    // 触发随机事件
    triggerRandomEvent();
    
    // 检查是否需要突破
    checkRealmUp();
    
    // 检查成就
    checkAchievements();
    
    updateUI();
    saveGame();
};

// 修改战斗函数 - 消耗体力
const originalAttack = attack;
attack = function() {
    if (!gameState.currentEnemy) {
        spawnEnemy();
    }
    
    // 检查能否战斗
    if (!checkCanAct()) {
        gameState.autoBattle = false;
        updateUI();
        return;
    }
    
    const damage = getDamage();
    gameState.enemyHp -= damage;
    
    addBattleLog(`对 ${gameState.currentEnemy.name} 造成 ${damage} 点伤害！`, 'damage');
    
    // 统计伤害
    gameState.stats.totalDamage = (gameState.stats.totalDamage || 0) + damage;
    
    // 战斗消耗体力
    gameState.player.energy = Math.max(0, gameState.player.energy - 2);
    
    // 检查敌人是否死亡
    if (gameState.enemyHp <= 0) {
        const enemy = gameState.currentEnemy;
        const exp = Math.floor(enemy.exp * (1 + gameState.player.realm * 0.2));
        const lingshi = Math.floor(enemy.lingshi * (1 + gameState.player.realm * 0.2) * (1 + getFortuneBonus()));
        
        gameState.player.exp += exp;
        gameState.player.lingshi += lingshi;
        
        // 统计
        gameState.stats.enemiesDefeated = (gameState.stats.enemiesDefeated || 0) + 1;
        gameState.stats.consecutiveWins = (gameState.stats.consecutiveWins || 0) + 1;
        
        addBattleLog(`击败 ${enemy.name}！获得 ${exp} 修为, ${lingshi} 灵石`, 'loot');
        
        checkAchievements();
        
        spawnEnemy();
        gameState.enemyJustDefeated = true;
    } else {
        gameState.stats.consecutiveWins = 0;
        gameState.enemyJustDefeated = false;
    }
    
    enemyAttack();
    
    updateUI();
    saveGame();
};
