/**
 * 装备系统
 */

// 购买装备
function buyEquipment(type, itemId) {
    const items = EQUIPMENT_LIB[type];
    if (!items) return;
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    if (gameState.player.lingshi < item.cost) {
        showModal('💰 灵石不足', `购买 ${item.name} 需要 ${item.cost} 灵石`);
        return;
    }
    
    if (gameState.equipment[type]) {
        const oldItem = items.find(i => i.id === gameState.equipment[type]);
        if (oldItem) gameState.player.lingshi += Math.floor(oldItem.cost / 2);
    }
    
    gameState.player.lingshi -= item.cost;
    gameState.equipment[type] = item.id;
    showModal('🎉 装备成功', `已装备 ${item.name}！`);
    renderEquipmentShop();
    updateUI();
    saveGame();
}

// 卸下装备
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
    showModal('卸下装备', `已卸下 ${item.name}，返还 ${refund} 灵石`);
    updateUI();
    saveGame();
}

// 属性提升
function upgradeAttribute(attr) {
    const config = ATTRIBUTE_UPGRADE[attr];
    const cost = getAttributeCost(attr);
    
    if (gameState.player.lingshi < cost) {
        showModal('灵石不足', `提升 ${config.name} 需要 ${cost} 灵石`);
        return;
    }
    
    gameState.player.lingshi -= cost;
    gameState.player[attr]++;
    showModal('属性提升', `${config.name} +1\n当前: ${gameState.player[attr]}`);
    checkAchievements();
    updateUI();
    saveGame();
}

// 渲染装备商店
function renderEquipmentShop() {
    renderShopType('weapon', EQUIPMENT_LIB.weapon);
    renderShopType('armor', EQUIPMENT_LIB.armor);
    renderShopType('accessory', EQUIPMENT_LIB.accessory);
}

function renderShopType(type, items) {
    const container = document.getElementById('shop-' + type + '-list');
    if (!container) return;
    container.innerHTML = '';
    
    const typeNames = { weapon: '武器', armor: '防具', accessory: '饰品' };
    const statNames = { weapon: '攻击', armor: '防御', accessory: '防御' };
    
    items.forEach(item => {
        const isEquipped = gameState.equipment[type] === item.id;
        const canBuy = gameState.player.lingshi >= item.cost;
        container.innerHTML += `<div class="shop-item-card ${isEquipped?'equipped':''}">
            <div class="shop-item-info">
                <span class="shop-item-name">${item.name}</span>
                <span class="shop-item-stats">${statNames[type]}: ${item.attack || item.defense}</span>
            </div>
            <div>${isEquipped?'<span class="shop-item-btn equipped">已装备</span>':
                `<button class="shop-item-btn" ${canBuy?'':'disabled'} onclick="buyEquipment('${type}','${item.id}')">购买</button>
                 <span class="shop-item-price">${item.cost}</span>`}</div>
        </div>`;
    });
}

// 渲染食物商店
function renderFoodShop() {
    const container = document.getElementById('food-shop-list');
    if (!container) return;
    container.innerHTML = '';
    
    checkMealReset();
    const remainingMeals = 3 - (gameState.today.eaten || 0);
    
    FOOD_ITEMS.forEach(food => {
        const canBuy = gameState.player.lingshi >= food.cost && remainingMeals > 0;
        container.innerHTML += `<div class="food-item">
            <span class="food-icon">${food.icon}</span>
            <div class="food-info"><div class="food-name">${food.name}</div>
            <div class="food-effects">饱食+${food.hunger} 体力+${food.energy}</div></div>
            <span class="food-price">${food.cost}灵石</span>
            <button class="food-buy-btn" ${canBuy?'':'disabled'} onclick="buyFood('${food.id}')">购买</button>
        </div>`;
    });
}

// 购买食物
function buyFood(foodId) {
    const food = FOOD_ITEMS.find(f => f.id === foodId);
    if (!food) return;
    
    checkMealReset();
    if (gameState.today.eaten >= 3) {
        showModal('🍚 吃饱了', '刚吃完不久，还很饱！');
        return;
    }
    if (gameState.player.lingshi < food.cost) {
        showModal('💰 灵石不足', `需要 ${food.cost} 灵石`);
        return;
    }
    
    gameState.player.lingshi -= food.cost;
    gameState.player.hunger = Math.min(100, gameState.player.hunger + food.hunger);
    gameState.player.energy = Math.min(gameState.player.maxEnergy, gameState.player.energy + food.energy);
    gameState.today.eaten++;
    showModal('🍽️ 用餐成功', `吃了 ${food.name}\n饱食度 +${food.hunger}\n体力 +${food.energy}`);
    renderFoodShop();
    updateUI();
    saveGame();
}

// 吃饭
function eatFood() {
    checkMealReset();
    if (gameState.today.eaten >= 3) {
        showModal('🍚 吃饱了', `刚吃完不久，还很饱！`);
        return;
    }
    let msg = '🍖 用餐\n\n';
    FOOD_ITEMS.forEach((food, idx) => msg += `${idx+1}. ${food.name} 饱食+${food.hunger} 体力+${food.energy} (${food.cost}灵石)\n`);
    msg += '\n输入序号选择';
    
    const choice = prompt(msg);
    if (choice === null) return;
    const idx = parseInt(choice) - 1;
    if (idx >= 0 && idx < FOOD_ITEMS.length) buyFood(FOOD_ITEMS[idx].id);
}

// 吃饭时间重置
let lastMealResetTime = Date.now();
const MEAL_RESET_INTERVAL = 15 * 60 * 1000;

function checkMealReset() {
    const now = Date.now();
    if (now - lastMealResetTime >= MEAL_RESET_INTERVAL) {
        gameState.today.eaten = 0;
        lastMealResetTime = now;
    }
}
