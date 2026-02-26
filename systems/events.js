/**
 * 随机事件系统
 */

const RANDOM_EVENTS = [
    { id: 'find_lingshi', name: '💰 路边拾遗', weight: 15, trigger: () => {
        const amt = Math.floor(10 + Math.random() * 50 * (1 + gameState.player.realm * 0.5));
        gameState.player.lingshi += amt;
        return '捡到 ' + amt + ' 灵石！';
    }},
    { id: 'find_treasure', name: '🎁 偶遇宝藏', weight: 8, trigger: () => {
        const ls = Math.floor(50 + Math.random() * 100 * (1 + gameState.player.realm));
        const exp = Math.floor(20 + Math.random() * 50 * (1 + gameState.player.realm));
        gameState.player.lingshi += ls; gameState.player.exp += exp;
        return '获得 ' + ls + ' 灵石和 ' + exp + ' 修为！';
    }},
    { id: 'sudden_insight', name: '💡 顿悟', weight: 10, trigger: () => {
        const exp = Math.floor(50 + Math.random() * 100 * (1 + gameState.player.realm * 0.5));
        gameState.player.exp += exp;
        return '修为大幅提升 +' + exp + '！';
    }},
    { id: 'mystical_herb', name: '🌿 发现灵草', weight: 8, trigger: () => {
        const lq = Math.floor(30 + Math.random() * 70 * (1 + gameState.player.realm * 0.3));
        gameState.player.lingqi += lq;
        return '灵气 +' + lq + '！';
    }},
    { id: 'immortal_guidance', name: '🧘 仙人指路', weight: 3, trigger: () => {
        const attrs = ['rootBone', 'comprehension', 'fortune', 'blessing'];
        const attr = attrs[Math.floor(Math.random() * attrs.length)];
        gameState.player[attr]++;
        const names = {rootBone:'根骨',comprehension:'悟性',fortune:'机遇',blessing:'福源'};
        return names[attr] + ' +1！仙人指点，受益匪浅！';
    }},
    { id: 'monster_attack', name: '👹 妖兽袭击', weight: 10, trigger: () => {
        const dmg = Math.floor(5 + Math.random() * 15 * (1 + gameState.player.realm * 0.3));
        gameState.player.exp = Math.max(0, gameState.player.exp - dmg);
        return '被妖兽打伤，损失 ' + dmg + ' 修为！';
    }},
    { id: 'trap', name: '🕳️ 误入陷阱', weight: 8, trigger: () => {
        const loss = Math.floor(gameState.player.lingshi * 0.1);
        gameState.player.lingshi = Math.max(0, gameState.player.lingshi - loss);
        return '触发禁制，损失 ' + loss + ' 灵石！';
    }},
    { id: 'find_skill_fragment', name: '📦 发现功法碎片', weight: 8, trigger: () => {
        const realm = gameState.player.realm;
        const frags = Object.entries(SKILL_FRAGMENTS).filter(([id,f]) => f.realmMin <= realm);
        if (frags.length > 0) {
            const [fid] = frags[Math.floor(Math.random() * frags.length)];
            gameState.skillFragments = gameState.skillFragments || {};
            gameState.skillFragments[fid] = (gameState.skillFragments[fid] || 0) + 1;
            return '发现了 ' + fid + '！';
        }
        return '没有发现任何东西...';
    }},
    { id: 'secret_shop', name: '🏪 神秘商人', weight: 4, trigger: () => {
        const all = [...EQUIPMENT_LIB.weapon, ...EQUIPMENT_LIB.armor, ...EQUIPMENT_LIB.accessory];
        const items = [];
        while(items.length < 3 && items.length < all.length) {
            const item = all[Math.floor(Math.random() * all.length)];
            if (!items.find(i => i.id === item.id)) items.push(item);
        }
        let msg = '神秘商人出售：\n\n';
        items.forEach((it, i) => msg += (i+1) + '. ' + it.name + ' - ' + it.cost + '灵石\n');
        msg += '\n输入序号购买';
        const ch = prompt(msg);
        if (ch) {
            const idx = parseInt(ch) - 1;
            if (idx >= 0 && idx < items.length) {
                const it = items[idx];
                if (gameState.player.lingshi >= it.cost) {
                    const type = EQUIPMENT_LIB.weapon.includes(it) ? 'weapon' : EQUIPMENT_LIB.armor.includes(it) ? 'armor' : 'accessory';
                    gameState.player.lingshi -= it.cost;
                    gameState.equipment[type] = it.id;
                    return '购买了 ' + it.name + '！';
                } else return '灵石不足';
            }
        }
        return '你离开了神秘商人';
    }}
];

const EVENT_CHANCE = 0.08;

function triggerRandomEvent() {
    const now = Date.now();
    if (now - lastEventTime < eventCooldown * 1000) return false;
    if (Math.random() > EVENT_CHANCE) return false;
    
    lastEventTime = now;
    const total = RANDOM_EVENTS.reduce((s,e) => s + e.weight, 0);
    let random = Math.random() * total;
    let event = RANDOM_EVENTS[0];
    for (const e of RANDOM_EVENTS) { random -= e.weight; if (random <= 0) { event = e; break; } }
    
    const result = event.trigger();
    showModal(event.name, result);
    addBattleLog('[' + event.name + '] ' + result, '');
    
    gameState.stats.eventsTriggered = (gameState.stats.eventsTriggered || 0) + 1;
    checkAchievements();
    return true;
}
