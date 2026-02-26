/**
 * 核心计算函数
 */

// 获取当前境界
function getRealm() {
    return REALMS[gameState.player.realm];
}

// 获取下一境界
function getNextRealm() {
    return REALMS[gameState.player.realm + 1] || null;
}

// 数字格式化
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toString();
}

// 获取修炼速度
function getCultivateSpeed() {
    let base = 1;
    let multiplier = getRealm().multiplier;
    
    gameState.ownedSkills.forEach(skillId => {
        const skill = SKILL_LIB[skillId];
        if (skill && skill.effect && skill.effect.cultivateSpeed) {
            base += skill.effect.cultivateSpeed;
        }
    });
    
    base *= (1 + getRootBoneBonus());
    return Math.floor(base * multiplier);
}

// 获取灵气获取
function getLingqiGain() {
    let base = 1;
    gameState.ownedSkills.forEach(skillId => {
        const skill = SKILL_LIB[skillId];
        if (skill && skill.effect && skill.effect.lingqiGain) {
            base += skill.effect.lingqiGain;
        }
    });
    return base || 1;
}

// 获取攻击力
function getDamage() {
    let base = 5;
    base += gameState.player.realm * 2;
    gameState.ownedSkills.forEach(skillId => {
        const skill = SKILL_LIB[skillId];
        if (skill && skill.effect && skill.effect.extraDamage) {
            base *= (1 + skill.effect.extraDamage);
        }
    });
    base *= (1 + getComprehensionBonus());
    base += getAttackBonus();
    return Math.floor(base);
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

// 获取攻击加成
function getAttackBonus() {
    let attack = 0;
    if (gameState.equipment.weapon) {
        const weapon = EQUIPMENT_LIB.weapon.find(e => e.id === gameState.equipment.weapon);
        if (weapon) attack += weapon.attack;
    }
    return attack;
}

// 获取减伤
function getDamageReduction() {
    let reduction = 0;
    gameState.ownedSkills.forEach(skillId => {
        const skill = SKILL_LIB[skillId];
        if (skill && skill.effect && skill.effect.damageReduction) {
            reduction += skill.effect.damageReduction;
        }
    });
    if (gameState.equipment.accessory) {
        const acc = EQUIPMENT_LIB.accessory.find(e => e.id === gameState.equipment.accessory);
        if (acc) reduction += acc.defense * 0.01;
    }
    return Math.min(reduction, 0.8);
}

// 根骨加成
function getRootBoneBonus() {
    const rootBone = gameState.player.rootBone || 10;
    return rootBone * 0.05;
}

// 悟性加成
function getComprehensionBonus() {
    const comp = gameState.player.comprehension || 10;
    return comp * 0.03;
}

// 福源加成
function getFortuneBonus() {
    const fortune = gameState.player.fortune || 10;
    return fortune * 0.02;
}

// 属性提升消耗
function getAttributeCost(attr) {
    const config = ATTRIBUTE_UPGRADE[attr];
    const currentLevel = gameState.player[attr];
    return Math.floor(config.cost * Math.pow(config.costMultiplier, currentLevel - 10));
}

// 获取所有装备
function getAllEquipment(equipment) {
    const items = [];
    if (equipment.weapon) items.push(equipment.weapon);
    if (equipment.armor) items.push(equipment.armor);
    if (equipment.accessory) items.push(equipment.accessory);
    return items;
}

// 获取功法稀有度文字
function getRarityText(rarity) {
    const texts = ['', '普通', '稀有', '珍贵', '史诗', '传说'];
    return texts[rarity] || '普通';
}

// 获取功法稀有度颜色
function getRarityColor(rarity) {
    const colors = ['', '#888', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800'];
    return colors[rarity] || '#888';
}

// 功法碎片掉落
function dropSkillFragment(enemyRealm) {
    const realm = Math.min(enemyRealm, 8);
    const available = Object.entries(SKILL_FRAGMENTS).filter(([id, frag]) => frag.realmMin <= realm);
    if (available.length === 0) return null;
    
    let total = available.reduce((sum, [id, frag]) => sum + frag.dropRate * 1000, 0);
    let random = Math.random() * total;
    
    for (const [fragmentId, fragment] of available) {
        random -= fragment.dropRate * 1000;
        if (random <= 0) {
            gameState.skillFragments = gameState.skillFragments || {};
            gameState.skillFragments[fragmentId] = (gameState.skillFragments[fragmentId] || 0) + 1;
            return fragmentId;
        }
    }
    return null;
}
