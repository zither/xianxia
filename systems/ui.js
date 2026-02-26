/**
 * UI系统
 */

function updateUI() {
    const realm = getRealm();
    const nextRealm = getNextRealm();
    
    document.getElementById('nickname').textContent = gameState.player.nickname;
    document.getElementById('realm').textContent = realm.name;
    document.getElementById('lingqi').textContent = formatNumber(gameState.player.lingqi);
    document.getElementById('lingshi').textContent = formatNumber(gameState.player.lingshi);
    
    const expPercent = nextRealm ? Math.min(100, (gameState.player.exp / nextRealm.expReq) * 100) : 100;
    document.getElementById('exp-fill').style.width = expPercent + '%';
    document.getElementById('exp-text').textContent = nextRealm ? `${formatNumber(gameState.player.exp)} / ${formatNumber(nextRealm.expReq)}` : '已满级';
    
    document.getElementById('xiuwei').textContent = formatNumber(gameState.player.exp);
    document.getElementById('cultivate-speed').textContent = `+${getCultivateSpeed()}/秒`;
    document.getElementById('auto-cultivate').checked = gameState.autoCultivate;
    document.getElementById('btn-cultivate').textContent = gameState.isCultivating ? '修炼中...' : '开始修炼';
    document.getElementById('btn-cultivate').classList.toggle('cultivating', gameState.isCultivating);
    
    renderSkills();
    
    if (gameState.currentEnemy) {
        document.getElementById('enemy-name').textContent = `lv.${gameState.player.realm + 1} ${gameState.currentEnemy.name}`;
        document.getElementById('enemy-hp-fill').style.width = Math.max(0, (gameState.enemyHp / gameState.currentEnemy.baseHp) * 100) + '%';
        document.getElementById('enemy-hp-text').textContent = `${Math.floor(gameState.enemyHp)}/${gameState.currentEnemy.baseHp}`;
    }
    
    document.getElementById('btn-auto-battle').textContent = gameState.autoBattle ? '停止自动' : '自动战斗';
    document.getElementById('btn-auto-battle').classList.toggle('active', gameState.autoBattle);
    updateAttributesPanel();
    updateEquipmentPanel();
    updateStatusBars();
}

function updateAttributesPanel() {
    ['rootBone', 'comprehension', 'fortune', 'blessing'].forEach(attr => {
        const el = document.getElementById('attr-' + attr);
        if (el) el.textContent = gameState.player[attr];
    });
    const tip = document.getElementById('attr-tip');
    if (tip) tip.textContent = `点击 + 提升属性（下次消耗 ${getAttributeCost('rootBone')} 灵石）`;
}

function updateEquipmentPanel() {
    ['weapon', 'armor', 'accessory'].forEach(type => {
        const el = document.getElementById('equip-' + type);
        if (el) {
            const id = gameState.equipment[type];
            if (id) {
                const item = EQUIPMENT_LIB[type].find(e => e.id === id);
                el.innerHTML = `<span class="equipped-name">${item.name}</span>`;
            } else el.innerHTML = '<span class="no-equip">未装备</span>';
        }
    });
}

function updateStatusBars() {
    const hunger = gameState.player.hunger || 0;
    const energy = gameState.player.energy || 0;
    const maxEnergy = gameState.player.maxEnergy || 100;
    const hp = gameState.player.hp || 0;
    const maxHp = gameState.player.maxHp || 100;
    
    const he = document.getElementById('hunger-bar');
    if (he) { he.style.width = Math.max(0, Math.min(100, hunger)) + '%'; he.style.background = hunger < 30 ? 'var(--accent-red)' : hunger < 60 ? 'var(--accent-gold)' : 'var(--accent-green)'; }
    const ee = document.getElementById('energy-bar');
    if (ee) ee.style.width = Math.max(0, Math.min(100, energy / maxEnergy * 100)) + '%';
    const hpe = document.getElementById('hp-bar');
    if (hpe) hpe.style.width = Math.max(0, Math.min(100, hp / maxHp * 100)) + '%';
}

function renderSkills() {
    const container = document.getElementById('skills-list');
    if (!container) return;
    container.innerHTML = '';
    gameState.skills.forEach(skillId => {
        const skill = SKILL_LIB[skillId];
        if (!skill) return;
        container.innerHTML += `<div class="skill-item">
            <div class="skill-info"><span class="skill-name">${skill.name}</span>
            <span class="skill-desc">${skill.desc}</span></div>
            <span class="skill-level">${getRarityText(skill.rarity)}</span>
        </div>`;
    });
    if (gameState.skills.length === 0) container.innerHTML = '<div class="empty-tip">还没有装备功法</div>';
}

function showModal(title, message, showCancel = false) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    document.getElementById('modal-cancel').style.display = showCancel ? 'inline-block' : 'none';
    document.getElementById('modal').classList.add('show');
}

function hideModal() {
    document.getElementById('modal').classList.remove('show');
}

function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const panels = {
        'home': document.getElementById('panel-home'),
        'skills': document.getElementById('panel-skills'),
        'food': document.getElementById('panel-food'),
        'dungeon': document.getElementById('panel-dungeon'),
        'achievements': document.getElementById('panel-achievements'),
        'profile': document.getElementById('panel-profile')
    };
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const name = tab.dataset.tab;
            Object.keys(panels).forEach(k => { if (panels[k]) panels[k].style.display = k === name ? 'block' : 'none'; });
            if (name === 'achievements') { renderAchievements(); updateAchievementsStats(); }
            if (name === 'food') renderFoodShop();
            if (name === 'dungeon') renderEquipmentShop();
        });
    });
}
