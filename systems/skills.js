/**
 * 功法系统
 */

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

function equipSkill(skillId) {
    const skill = SKILL_LIB[skillId];
    if (!skill) return;
    if (gameState.player.realm < skill.realmReq) {
        showModal('境界不足', '需要 ' + REALMS[skill.realmReq].name + ' 才能装备');
        return;
    }
    if (gameState.skills.includes(skillId)) {
        showModal('提示', '此功法已经装备');
        return;
    }
    if (gameState.skills.length >= gameState.maxSkillSlots) {
        showModal('装备槽已满', '最多只能装备 ' + gameState.maxSkillSlots + ' 个功法');
        return;
    }
    gameState.skills.push(skillId);
    renderSkillPanel();
    updateUI();
    saveGame();
    showModal('功法装备', '已装备 ' + skill.name + '！');
}

function unequipSkill(skillId) {
    const index = gameState.skills.indexOf(skillId);
    if (index === -1) return;
    gameState.skills.splice(index, 1);
    renderSkillPanel();
    updateUI();
    saveGame();
}

function composeSkill(fragmentId) {
    const fragment = SKILL_FRAGMENTS[fragmentId];
    if (!fragment) return;
    const skillId = fragment.skillId;
    const skill = SKILL_LIB[skillId];
    if (!skill) return;
    
    const current = gameState.skillFragments[fragmentId] || 0;
    const need = FRAGMENT_COMPOSE_COUNT[skill.rarity] || 3;
    
    if (current < need) {
        showModal('碎片不足', '合成需要 ' + need + ' 个碎片，当前 ' + current + ' 个');
        return;
    }
    
    gameState.skillFragments[fragmentId] = current - need;
    if (!gameState.ownedSkills.includes(skillId)) gameState.ownedSkills.push(skillId);
    
    if (gameState.skills.length < gameState.maxSkillSlots && gameState.player.realm >= skill.realmReq) {
        gameState.skills.push(skillId);
    }
    
    renderSkillPanel();
    updateUI();
    saveGame();
    showModal('功法合成成功', '恭喜获得 ' + skill.name + '！');
    if (gameState.ownedSkills.length >= 3) checkAchievements();
}

function renderSkillPanel() {
    const container = document.getElementById('skills-list');
    if (!container) return;
    
    let html = '<div class="skill-panel">';
    
    html += '<div class="skill-section"><h3>碎片仓库</h3><div class="fragment-list">';
    const fragments = gameState.skillFragments || {};
    const owned = Object.entries(fragments).filter(([id, count]) => count > 0);
    
    if (owned.length === 0) {
        html += '<div class="empty-tip">暂无碎片</div>';
    } else {
        owned.forEach(([fragId, count]) => {
            const frag = SKILL_FRAGMENTS[fragId];
            if (!frag) return;
            const skill = SKILL_LIB[frag.skillId];
            if (!skill) return;
            const need = FRAGMENT_COMPOSE_COUNT[skill.rarity] || 3;
            const can = count >= need;
            html += '<div class="fragment-item" style="border-color:' + getRarityColor(skill.rarity) + '">';
            html += '<div class="fragment-info"><span class="fragment-name">' + fragId.replace('碎片','') + '</span>';
            html += '<span class="fragment-count">' + count + '/' + need + '</span></div>';
            html += '<button class="compose-btn ' + (can?'':'disabled') + '" onclick="composeSkill(\'' + fragId + '\')" ' + (can?'':'disabled') + '>' + (can?'合成':'不足') + '</button>';
            html += '</div>';
        });
    }
    html += '</div></div>';
    
    html += '<div class="skill-section"><h3>已拥有功法</h3><div class="owned-skill-list">';
    const ownedSkills = gameState.ownedSkills || [];
    if (ownedSkills.length === 0) {
        html += '<div class="empty-tip">暂无法功</div>';
    } else {
        ownedSkills.forEach(skillId => {
            const skill = SKILL_LIB[skillId];
            if (!skill) return;
            const isEquipped = gameState.skills.includes(skillId);
            const canEquip = !isEquipped && gameState.skills.length < gameState.maxSkillSlots;
            const meetsRealm = gameState.player.realm >= skill.realmReq;
            html += '<div class="owned-skill-item" style="border-left:3px solid ' + getRarityColor(skill.rarity) + '">';
            html += '<div class="skill-info"><span class="skill-name">' + skill.name + '</span>';
            html += '<span class="skill-desc">' + skill.desc + '</span>';
            if (!meetsRealm) html += '<span class="realm-req">需要:' + REALMS[skill.realmReq].name + '</span></div>';
            html += '<button class="equip-btn ' + (isEquipped?'equipped':(!canEquip||!meetsRealm?'disabled':'')) + '" ';
            html += 'onclick="equipSkill(\'' + skillId + '\')" ' + (isEquipped||!canEquip||!meetsRealm?'disabled':'') + '>';
            html += (isEquipped?'已装备':'装备') + '</button>';
            html += '</div>';
        });
    }
    html += '</div></div>';
    
    html += '<div class="skill-section"><h3>获取途径</h3><div class="skill-tips">';
    html += '<p>击败敌人获得碎片</p><p>通关副本获得奖励</p>';
    html += '<p>随机事件</p><p>境界突破奖励</p><p>神秘商人</p></div></div>';
    
    html += '</div>';
    container.innerHTML = html;
}
