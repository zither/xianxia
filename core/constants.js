/**
 * 游戏常量定义
 * 境界、功法、敌人、装备等静态数据
 */

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

// 功法库
const SKILL_LIB = {
    // 修炼类功法
    '呼吸吐纳': { name: '呼吸吐纳', desc: '基础功法，提升修炼速度', type: 'cultivate', effect: { cultivateSpeed: 1 }, rarity: 1, realmReq: 0 },
    '引气入体': { name: '引气入体', desc: '增加灵气获取', type: 'cultivate', effect: { lingqiGain: 1 }, rarity: 1, realmReq: 0 },
    '聚灵阵': { name: '聚灵阵', desc: '大幅提升灵气获取', type: 'cultivate', effect: { lingqiGain: 5 }, rarity: 2, realmReq: 1 },
    '九转丹诀': { name: '九转丹诀', desc: '修炼速度大幅提升', type: 'cultivate', effect: { cultivateSpeed: 5 }, rarity: 3, realmReq: 2 },
    '混沌道经': { name: '混沌道经', desc: '修炼速度极致提升', type: 'cultivate', effect: { cultivateSpeed: 10 }, rarity: 4, realmReq: 4 },
    '太初神诀': { name: '太初神诀', desc: '仙品功法，速度极致', type: 'cultivate', effect: { cultivateSpeed: 20 }, rarity: 5, realmReq: 7 },
    
    // 战斗攻击类
    '基础剑诀': { name: '基础剑诀', desc: '攻击时有概率造成额外伤害', type: 'attack', effect: { extraDamage: 0.2 }, rarity: 1, realmReq: 0 },
    '烈焰刀法': { name: '烈焰刀法', desc: '攻击附加火焰伤害', type: 'attack', effect: { extraDamage: 0.4 }, rarity: 2, realmReq: 1 },
    '天雷破': { name: '天雷破', desc: '攻击有几率触发雷击', type: 'attack', effect: { extraDamage: 0.6 }, rarity: 3, realmReq: 3 },
    '万剑归宗': { name: '万剑归宗', desc: '剑修至高功法', type: 'attack', effect: { extraDamage: 1.0 }, rarity: 4, realmReq: 5 },
    '混沌剑意': { name: '混沌剑意', desc: '仙品剑诀', type: 'attack', effect: { extraDamage: 1.5 }, rarity: 5, realmReq: 8 },
    
    // 防御类
    '灵气护盾': { name: '灵气护盾', desc: '受到伤害时减免', type: 'defense', effect: { damageReduction: 0.1 }, rarity: 1, realmReq: 0 },
    '金刚不坏': { name: '金刚不坏', desc: '大幅提升防御', type: 'defense', effect: { damageReduction: 0.2 }, rarity: 2, realmReq: 2 },
    '玄冰甲': { name: '玄冰甲', desc: '反弹部分伤害', type: 'defense', effect: { damageReduction: 0.3 }, rarity: 3, realmReq: 4 },
    '混沌护体': { name: '混沌护体', desc: '仙品防御', type: 'defense', effect: { damageReduction: 0.5 }, rarity: 5, realmReq: 7 },
    
    // 辅助类
    '神行百变': { name: '神行百变', desc: '提升移动和恢复速度', type: '辅助', effect: { energyRegen: 0.5 }, rarity: 2, realmReq: 1 },
    '妙手回春': { name: '妙手回春', desc: '战斗时缓慢恢复生命', type: '辅助', effect: { hpRegen: 1 }, rarity: 3, realmReq: 3 },
    '天眼通': { name: '天眼通', desc: '看穿敌人弱点，掉落增加', type: '辅助', effect: { fortuneBonus: 0.3 }, rarity: 3, realmReq: 2 },
    '分神术': { name: '分神术', desc: '可同时装备更多功法', type: '辅助', effect: { skillSlot: 1 }, rarity: 4, realmReq: 5 },
    
    // 特殊类
    '噬灵大法': { name: '噬灵大法', desc: '攻击时吸取灵气', type: '特殊', effect: { lifesteal: 0.1 }, rarity: 3, realmReq: 4 },
    '燃命诀': { name: '燃命诀', desc: '牺牲生命换取极致攻击', type: '特殊', effect: { damageOnHp: 0.3 }, rarity: 4, realmReq: 6 },
    '虚空挪移': { name: '虚空挪移', desc: '躲避攻击的概率提升', type: '特殊', effect: { dodge: 0.15 }, rarity: 3, realmReq: 3 },
};

// 功法碎片掉落配置
const SKILL_FRAGMENTS = {
    // 普通碎片 - 炼气期
    '呼吸吐纳碎片': { skillId: '呼吸吐纳', dropRate: 0.1, realmMin: 0 },
    '引气入体碎片': { skillId: '引气入体', dropRate: 0.08, realmMin: 0 },
    '基础剑诀碎片': { skillId: '基础剑诀', dropRate: 0.1, realmMin: 0 },
    '灵气护盾碎片': { skillId: '灵气护盾', dropRate: 0.08, realmMin: 0 },
    
    // 稀有碎片 - 筑基期
    '聚灵阵碎片': { skillId: '聚灵阵', dropRate: 0.05, realmMin: 1 },
    '烈焰刀法碎片': { skillId: '烈焰刀法', dropRate: 0.05, realmMin: 1 },
    '神行百变碎片': { skillId: '神行百变', dropRate: 0.04, realmMin: 1 },
    
    // 珍贵碎片 - 金丹期
    '九转丹诀碎片': { skillId: '九转丹诀', dropRate: 0.03, realmMin: 2 },
    '天雷破碎片': { skillId: '天雷破', dropRate: 0.03, realmMin: 2 },
    '金刚不坏碎片': { skillId: '金刚不坏', dropRate: 0.03, realmMin: 2 },
    '天眼通碎片': { skillId: '天眼通', dropRate: 0.03, realmMin: 2 },
    
    // 稀有碎片 - 元婴期
    '万剑归宗碎片': { skillId: '万剑归宗', dropRate: 0.02, realmMin: 3 },
    '妙手回春碎片': { skillId: '妙手回春', dropRate: 0.02, realmMin: 3 },
    '虚空挪移碎片': { skillId: '虚空挪移', dropRate: 0.02, realmMin: 3 },
    
    // 史诗碎片 - 化神期
    '混沌道经碎片': { skillId: '混沌道经', dropRate: 0.015, realmMin: 4 },
    '玄冰甲碎片': { skillId: '玄冰甲', dropRate: 0.015, realmMin: 4 },
    '噬灵大法碎片': { skillId: '噬灵大法', dropRate: 0.01, realmMin: 4 },
    
    // 传说碎片
    '分神术碎片': { skillId: '分神术', dropRate: 0.008, realmMin: 5 },
    '燃命诀碎片': { skillId: '燃命诀', dropRate: 0.008, realmMin: 6 },
    '混沌剑意碎片': { skillId: '混沌剑意', dropRate: 0.005, realmMin: 7 },
    '混沌护体碎片': { skillId: '混沌护体', dropRate: 0.005, realmMin: 7 },
    '太初神诀碎片': { skillId: '太初神诀', dropRate: 0.003, realmMin: 8 },
};

// 碎片合成所需数量
const FRAGMENT_COMPOSE_COUNT = {
    1: 3,  // 普通3个
    2: 5,  // 稀有5个
    3: 8,  // 珍贵8个
    4: 12, // 史诗12个
    5: 20, // 传说20个
};

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

// 食物数据
const FOOD_ITEMS = [
    { id: '粗茶淡饭', name: '粗茶淡饭', hunger: 20, energy: 10, cost: 5, icon: '🥣' },
    { id: '灵米粥', name: '灵米粥', hunger: 40, energy: 20, cost: 20, icon: '🥣' },
    { id: '灵禽肉', name: '灵禽肉', hunger: 60, energy: 30, cost: 50, icon: '🍖' },
    { id: '千年灵果', name: '千年灵果', hunger: 100, energy: 50, cost: 200, icon: '🍎' }
];

// 副本配置
const DUNGEONS = [
    { name: '新手试炼', minRealm: 0, enemies: 3, reward: 50, fragment: '引气入体碎片' },
    { name: '筑基秘境', minRealm: 1, enemies: 5, reward: 200, fragment: '聚灵阵碎片' },
    { name: '金丹洞府', minRealm: 2, enemies: 8, reward: 1000, fragment: '九转丹诀碎片' },
    { name: '元婴禁地', minRealm: 3, enemies: 10, reward: 3000, fragment: '万剑归宗碎片' },
    { name: '化神遗迹', minRealm: 4, enemies: 15, reward: 10000, fragment: '混沌道经碎片' },
    { name: '合体秘境', minRealm: 5, enemies: 20, reward: 30000, fragment: '分神术碎片' },
    { name: '大乘天宫', minRealm: 6, enemies: 25, reward: 80000, fragment: '混沌剑意碎片' },
    { name: '渡劫神坛', minRealm: 7, enemies: 30, reward: 200000, fragment: '太初神诀碎片' }
];

// 属性提升配置
const ATTRIBUTE_UPGRADE = {
    rootBone: { name: '根骨', desc: '提升修炼速度', cost: 50, costMultiplier: 1.5 },
    comprehension: { name: '悟性', desc: '提升功法效果', cost: 50, costMultiplier: 1.5 },
    fortune: { name: '机遇', desc: '提升掉落几率', cost: 50, costMultiplier: 1.5 },
    blessing: { name: '福源', desc: '提升突破成功率', cost: 50, costMultiplier: 1.5 }
};

// 成就配置
const ACHIEVEMENTS = [
    { id: 'first_cultivate', name: '初入修仙', desc: '完成第一次修炼', check: (s) => s.player.exp >= 1 },
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
    { id: 'event_1', name: '奇遇降临', desc: '触发第一次随机事件', check: (s) => (s.stats.eventsTriggered || 0) >= 1 },
    { id: 'event_10', name: '历练老手', desc: '触发10次随机事件', check: (s) => (s.stats.eventsTriggered || 0) >= 10 },
    { id: 'event_50', name: '天选之人', desc: '触发50次随机事件', check: (s) => (s.stats.eventsTriggered || 0) >= 50 }
];
