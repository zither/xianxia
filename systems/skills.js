/**
 * 功法系统
 */

// 获取功法稀有度颜色
function getRarityColor(rarity) {
    const colors = ['', '#888', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800'];
    return colors[rarity] || '#888';
}

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
    console.log('composeSkill called:', fragmentId);
    const fragment = SKILL_FRAGMENTS[fragmentId];
    if (!fragment) {
        console.log('fragment not found:', fragmentId);
        return;
    }
    
    const skillId = fragment.skillId;
    const skill = SKILL_LIB[skillId];
    if (!skill) {
        console.log('skill not found:', skillId);
        return;
    }
    
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
    
    const ownedSkills = gameState.ownedSkills || [];
    const equippedSkills = gameState.skills || [];
    
    let html = '<div class="skill-page">';
    
    // 顶部：功法槽位
    html += '<div class="skill-slots">';
    html += '<div class="skill-slots-title">🎯 已装备功法 (' + equippedSkills.length + '/' + (gameState.maxSkillSlots || 3) + ')</div>';
    html += '<div class="skill-slots-grid">';
    for (let i = 0; i < (gameState.maxSkillSlots || 3); i++) {
        const skillId = equippedSkills[i];
        if (skillId) {
            const skill = SKILL_LIB[skillId];
            html += '<div class="skill-slot equipped" style="border-color:' + getRarityColor(skill.rarity) + '">';
            html += '<div class="skill-slot-name">' + skill.name + '</div>';
            html += '<div class="skill-slot-desc">' + skill.desc + '</div>';
            html += '<button class="unequip-btn" onclick="unequipSkill(\'' + skillId + '\')">卸下</button>';
            html += '</div>';
        } else {
            html += '<div class="skill-slot empty">空</div>';
        }
    }
    html += '</div></div>';
    
    // 碎片仓库
    html += '<div class="skill-section">';
    html += '<div class="section-title">📦 碎片仓库</div>';
    html += '<div class="fragment-grid">';
    
    const fragments = gameState.skillFragments || {};
    const ownedFrags = Object.entries(fragments).filter(([id, count]) => {
        const frag = SKILL_FRAGMENTS[id];
        if (!frag) return false;
        if (ownedSkills.includes(frag.skillId)) return false;
        return count > 0;
    });
    
    if (ownedFrags.length === 0) {
        html += '<div class="empty-card">暂无碎片<br><small>击败敌人获得碎片</small></div>';
    } else {
        ownedFrags.forEach(([fragId, count]) => {
            const frag = SKILL_FRAGMENTS[fragId];
            const skill = SKILL_LIB[frag.skillId];
            const need = FRAGMENT_COMPOSE_COUNT[skill.rarity] || 3;
            const can = count >= need;
            const progress = Math.floor((count / need) * 100);
            
            html += '<div class="fragment-card" style="border-color:' + getRarityColor(skill.rarity) + '">';
            html += '<div class="fragment-icon">💎</div>';
            html += '<div class="fragment-name">' + fragId.replace('碎片','') + '</div>';
            html += '<div class="fragment-progress"><div class="progress-bar" style="width:' + progress + '%"></div></div>';
            html += '<div class="fragment-count">' + count + '/' + need + '</div>';
            if (can) {
                html += '<button class="compose-btn-full" onclick="composeSkill(\'' + fragId + '\')">🎨 合成</button>';
            } else {
                html += '<div class="fragment-need">还差' + (need - count) + '个</div>';
            }
            html += '</div>';
        });
    }
    html += '</div></div>';
    
    // 已拥有功法
    html += '<div class="skill-section">';
    html += '<div class="section-title">📖 已拥有功法</div>';
    html += '<div class="skill-grid">';
    
    if (ownedSkills.length === 0) {
        html += '<div class="empty-card">暂无法功<br><small>合成碎片获得功法</small></div>';
    } else {
        ownedSkills.forEach(skillId => {
            const skill = SKILL_LIB[skillId];
            if (!skill) return;
            const isEquipped = equippedSkills.includes(skillId);
            const meetsRealm = gameState.player.realm >= skill.realmReq;
            
            html += '<div class="skill-card" style="border-color:' + getRarityColor(skill.rarity) + '">';
            html += '<div class="skill-rarity">' + ['', '普通', '稀有', '珍贵', '史诗', '传说'][skill.rarity] + '</div>';
            html += '<div class="skill-name">' + skill.name + '</div>';
            html += '<div class="skill-desc">' + skill.desc + '</div>';
            if (!meetsRealm) {
                html += '<div class="skill-req">需 ' + REALMS[skill.realmReq].name + '</div>';
            }
            if (isEquipped) {
                html += '<div class="skill-equipped">已装备</div>';
            } else if (meetsRealm && equippedSkills.length < (gameState.maxSkillSlots || 3)) {
                html += '<button class="equip-btn-full" onclick="equipSkill(\'' + skillId + '\')">装备</button>';
            }
            html += '</div>';
        });
    }
    html += '</div></div>';
    
    html += '</div>';
    container.innerHTML = html;
}
    
    html += '<div class="skill-section"><h3>获取途径</h3><div class="skill-tips">';
    html += '<p>击败敌人获得碎片</p><p>通关副本获得奖励</p>';
    html += '<p>随机事件</p><p>境界突破奖励</p><p>神秘商人</p></div></div>';
    
    html += '</div>';
    container.innerHTML = html;
}
