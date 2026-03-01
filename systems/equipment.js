/**
 * 装备系统
 */

function buyEquipment(type, itemId) {
    const items = EQUIPMENT_LIB[type];
    if (!items) return;
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    if (gameState.player.lingshi < item.cost) {
        showModal('灵石不足', '购买 ' + item.name + ' 需要 ' + item.cost + ' 灵石');
        return;
    }
    
    if (gameState.equipment[type]) {
        const oldItem = items.find(i => i.id === gameState.equipment[type]);
        if (oldItem) gameState.player.lingshi += Math.floor(oldItem.cost / 2);
    }
    
    gameState.player.lingshi -= item.cost;
    gameState.equipment[type] = item.id;
    showModal('装备成功', '已装备 ' + item.name + '！');
    renderEquipmentShop();
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
    const refund = Math.floor(item.cost / 2);
    gameState.player.lingshi += refund;
    gameState.equipment[type] = null;
    showModal('卸下装备', '已卸下 ' + item.name + '，返还 ' + refund + ' 灵石');
    updateUI();
    saveGame();
}

function upgradeAttribute(attr) {
    const config = ATTRIBUTE_UPGRADE[attr];
    const cost = getAttributeCost(attr);
    
    if (gameState.player.lingshi < cost) {
        showModal('灵石不足', '提升 ' + config.name + ' 需要 ' + cost + ' 灵石');
        return;
    }
    
    gameState.player.lingshi -= cost;
    gameState.player[attr]++;
    showModal('属性提升', config.name + ' +1\n当前: ' + gameState.player[attr]);
    checkAchievements();
    updateUI();
    saveGame();
}

function renderEquipmentShop() {
    // Render as grid
    const container = document.getElementById('shop-weapon-list');
    if (container) {
        container.innerHTML = renderEquipmentGrid('weapon', EQUIPMENT_LIB.weapon);
    }
    const container2 = document.getElementById('shop-armor-list');
    if (container2) {
        container2.innerHTML = renderEquipmentGrid('armor', EQUIPMENT_LIB.armor);
    }
    const container3 = document.getElementById('shop-accessory-list');
    if (container3) {
        container3.innerHTML = renderEquipmentGrid('accessory', EQUIPMENT_LIB.accessory);
    }
}

function renderEquipmentGrid(type, items) {
    let html = '<div class="shop-grid">';
    const icons = {weapon: '⚔️', armor: '🛡️', accessory: '💍'};
    const stats = {weapon: '攻击', armor: '防御', accessory: '防御'};
    const typeName = {weapon: '武器', armor: '防具', accessory: '饰品'};
    
    html += '<div class="shop-type-header">' + icons[type] + ' ' + typeName[type] + '</div>';
    
    items.forEach(item => {
        const isEquipped = gameState.equipment[type] === item.id;
        const canBuy = gameState.player.lingshi >= item.cost;
        
        html += '<div class="shop-slot ' + (isEquipped?'equipped':'') + '">';
        html += '<div class="shop-slot-icon">' + icons[type] + '</div>';
        html += '<div class="shop-slot-name">' + item.name + '</div>';
        html += '<div class="shop-slot-stat">' + stats[type] + ':' + (item.attack || item.defense) + '</div>';
        
        if (isEquipped) {
            html += '<div class="shop-slot-status">已装备</div>';
        } else if (canBuy) {
            html += '<button class="shop-slot-btn" onclick="buyEquipment(\'' + type + '\',\'' + item.id + '\')">' + item.cost + '灵石</button>';
        } else {
            html += '<div class="shop-slot-status disabled">' + item.cost + '灵石</div>';
        }
        html += '</div>';
    });
    
    html += '</div>';
    return html;
}

function renderFoodShop() {
    const categories = {
        noodles: { el: document.getElementById('food-noodles-list'), icon: '🍜', name: '面食' },
        drinks: { el: document.getElementById('food-drinks-list'), icon: '🧋', name: '饮品' },
        special: { el: document.getElementById('food-special-list'), icon: '🍱', name: '特色' }
    };
    
    checkMealReset();
    const remainingMeals = 3 - (gameState.today.eaten || 0);
    
    Object.keys(categories).forEach(cat => {
        const container = categories[cat].el;
        if (!container) return;
        
        const foods = FOOD_ITEMS.filter(f => f.category === cat);
        
        let html = '<div class="shop-grid">';
        html += '<div class="shop-type-header">' + categories[cat].icon + ' ' + categories[cat].name + '</div>';
        
        foods.forEach(food => {
            const canBuy = gameState.player.lingshi >= food.cost && remainingMeals > 0;
            
            html += '<div class="shop-slot">';
            html += '<div class="shop-slot-icon">' + food.icon + '</div>';
            html += '<div class="shop-slot-name">' + food.name + '</div>';
            html += '<div class="shop-slot-stat">饱食+' + food.hunger + ' 体力+' + food.energy + '</div>';
            
            if (canBuy) {
                html += '<button class="shop-slot-btn" onclick="buyFood(\'' + food.id + '\')">' + food.cost + '灵石</button>';
            } else {
                html += '<div class="shop-slot-status disabled">' + food.cost + '灵石</div>';
            }
            html += '</div>';
        });
        
        html += '</div>';
        container.innerHTML = html;
    });
}

function buyFood(foodId) {
    const food = FOOD_ITEMS.find(f => f.id === foodId);
    if (!food) return;
    
    checkMealReset();
    if (gameState.today.eaten >= 3) {
        showModal('吃饱了', '刚吃完不久，还很饱！');
        return;
    }
    if (gameState.player.lingshi < food.cost) {
        showModal('灵石不足', '需要 ' + food.cost + ' 灵石');
        return;
    }
    
    gameState.player.lingshi -= food.cost;
    gameState.player.hunger = Math.min(100, gameState.player.hunger + food.hunger);
    gameState.player.energy = Math.min(gameState.player.maxEnergy, gameState.player.energy + food.energy);
    gameState.today.eaten++;
    showModal('用餐成功', '吃了 ' + food.name + '\n饱食度 +' + food.hunger + '\n体力 +' + food.energy);
    renderFoodShop();
    updateUI();
    saveGame();
}

function eatFood() {
    checkMealReset();
    if (gameState.today.eaten >= 3) {
        showModal('吃饱了', '刚吃完不久，还很饱！');
        return;
    }
    let msg = '选择食物:\n\n';
    FOOD_ITEMS.forEach((food, idx) => msg += (idx+1) + '. ' + food.name + ' 饱食+' + food.hunger + ' 体力+' + food.energy + ' (' + food.cost + '灵石)\n');
    msg += '\n输入序号（0取消）';
    
    const choice = prompt(msg);
    if (choice === null) return;
    const idx = parseInt(choice) - 1;
    if (idx >= 0 && idx < FOOD_ITEMS.length) buyFood(FOOD_ITEMS[idx].id);
}

let lastMealResetTime = Date.now();
const MEAL_RESET_INTERVAL = 15 * 60 * 1000;

function checkMealReset() {
    const now = Date.now();
    if (now - lastMealResetTime >= MEAL_RESET_INTERVAL) {
        gameState.today.eaten = 0;
        lastMealResetTime = now;
    }
}

function renderInventory() {
    const container = document.getElementById('inventory-list');
    if (!container) return;
    
    const gridSize = 24;
    let html = '<div class="inventory-grid">';
    
    for (let i = 0; i < gridSize; i++) {
        let slotContent = '';
        let slotClass = 'inventory-slot';
        
        const skillIndex = i;
        if (skillIndex < (gameState.ownedSkills || []).length) {
            const skillId = gameState.ownedSkills[skillIndex];
            const skill = SKILL_LIB[skillId];
            if (skill) {
                const isEquipped = gameState.skills.includes(skillId);
                slotContent = '<div class="slot-item" style="border-color:' + getRarityColor(skill.rarity) + '" onclick="showItemInfo(\'' + skillId + '\', \'skill\')">';
                slotContent += '<span class="slot-icon">📜</span>';
                slotContent += '<span class="slot-name">' + skill.name + '</span>';
                if (isEquipped) slotContent += '<span class="slot-equipped">已装备</span>';
                slotContent += '</div>';
                slotClass += ' has-item';
            }
        }
        
        if (!slotContent && i >= 12) {
            const fragIndex = i - 12;
            const ownedSkills = gameState.ownedSkills || [];
            const fragments = Object.entries(gameState.skillFragments || {}).filter(([id, c]) => {
                const frag = SKILL_FRAGMENTS[id];
                if (!frag) return false;
                // 过滤掉已合成功法的碎片
                if (ownedSkills.includes(frag.skillId)) return false;
                return c > 0;
            });
            if (fragIndex < fragments.length) {
                const [fragId, count] = fragments[fragIndex];
                const frag = SKILL_FRAGMENTS[fragId];
                if (frag) {
                    const skill = SKILL_LIB[frag.skillId];
                    const need = skill ? (FRAGMENT_COMPOSE_COUNT[skill.rarity] || 3) : 3;
                    slotContent = '<div class="slot-item fragment" onclick="showItemInfo(\'' + fragId + '\', \'fragment\')">';
                    slotContent += '<span class="slot-icon">💎</span>';
                    slotContent += '<span class="slot-name">' + fragId.replace('碎片','') + '</span>';
                    slotContent += '<span class="slot-count">' + count + '</span>';
                    if (count >= need) slotContent += '<span class="slot-can-compose">可合成</span>';
                    slotContent += '</div>';
                    slotClass += ' has-item';
                }
            }
        }
        
        if (!slotContent && i >= 21) {
            const equipIndex = i - 21;
            const types = ['weapon', 'armor', 'accessory'];
            if (equipIndex < types.length) {
                const type = types[equipIndex];
                const eqId = gameState.equipment[type];
                if (eqId) {
                    const items = EQUIPMENT_LIB[type];
                    const item = items.find(e => e.id === eqId);
                    if (item) {
                        const icons = {weapon: '⚔️', armor: '🛡️', accessory: '💍'};
                        slotContent = '<div class="slot-item equipment">';
                        slotContent += '<span class="slot-icon">' + icons[type] + '</span>';
                        slotContent += '<span class="slot-name">' + item.name + '</span>';
                        slotContent += '<span class="slot-stat">' + (item.attack || item.defense) + '</span>';
                        slotContent += '</div>';
                        slotClass += ' has-item equipped';
                    }
                }
            }
        }
        
        html += '<div class="' + slotClass + '">' + slotContent + '</div>';
    }
    html += '</div>';
    
    html += '<div class="inventory-info">';
    html += '<p>功法: ' + (gameState.ownedSkills || []).length + ' | 碎片: ' + Object.keys(gameState.skillFragments || {}).filter(k => (gameState.skillFragments[k] || 0) > 0).length + '</p>';
    html += '</div>';
    
    container.innerHTML = html;
}

function showItemInfo(itemId, type) {
    if (type === 'skill') {
        const skill = SKILL_LIB[itemId];
        if (!skill) return;
        const isEquipped = gameState.skills.includes(itemId);
        let msg = skill.name + '\n' + skill.desc + '\n\n稀有度: ' + getRarityText(skill.rarity) + '\n类型: ' + skill.type;
        if (gameState.player.realm < skill.realmReq) {
            msg += '\n\n需要境界: ' + REALMS[skill.realmReq].name;
        }
        msg += '\n\n' + (isEquipped ? '【已装备】' : (gameState.skills.length < gameState.maxSkillSlots && gameState.player.realm >= skill.realmReq) ? '点击装备' : '无法装备');
        showModal('物品信息', msg);
    } else if (type === 'fragment') {
        const frag = SKILL_FRAGMENTS[itemId];
        if (!frag) return;
        const skill = SKILL_LIB[frag.skillId];
        if (!skill) return;
        const count = gameState.skillFragments[itemId] || 0;
        const need = FRAGMENT_COMPOSE_COUNT[skill.rarity] || 3;
        const canCompose = count >= need;
        
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        
        modalTitle.textContent = '📦 ' + itemId;
        modalMessage.innerHTML = `
            <div style="text-align:center;padding:10px;">
                <p style="font-size:16px;font-weight:bold;margin-bottom:10px;">${skill.name}</p>
                <p style="color:#888;font-size:12px;">稀有度: ${getRarityText(skill.rarity)}</p>
                <p style="margin:15px 0;">碎片: <span style="color:${canCompose?'#4CAF50':'#f44336'}">${count}</span> / ${need}</p>
                <button class="btn-primary" style="width:100%;${canCompose?'':'display:none'}" onclick="console.log('compose btn clicked:', '${itemId}');composeSkill('${itemId}');hideModal();">
                    🎨 合成功法
                </button>
                ${!canCompose ? '<p style="color:#888;font-size:12px;">碎片不足，还需 ' + (need - count) + ' 个</p>' : ''}
            </div>
        `;
        
        document.getElementById('modal-cancel').style.display = 'inline-block';
        document.getElementById('modal-cancel').textContent = '关闭';
        modal.classList.add('show');
    }
}
