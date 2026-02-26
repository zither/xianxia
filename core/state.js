/**
 * 游戏状态管理
 */

// 默认游戏状态
const DEFAULT_GAME_STATE = {
    player: {
        nickname: '修仙者',
        realm: 0,
        exp: 0,
        lingqi: 0,
        lingshi: 0,
        hp: 100,
        maxHp: 100,
        hunger: 100,
        maxLingqi: 100,
        energy: 100,
        maxEnergy: 100,
        rootBone: 10,
        comprehension: 10,
        fortune: 10,
        blessing: 10,
        bottleneck: 0
    },
    skills: ['呼吸吐纳'],
    skillFragments: {},
    ownedSkills: ['呼吸吐纳'],
    maxSkillSlots: 3,
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
    today: {
        date: new Date().toDateString(),
        eaten: 0,
        cultivated: 0,
        battles: 0
    },
    stats: {
        enemiesDefeated: 0,
        dungeonsCleared: 0,
        totalDamage: 0,
        totalCultivate: 0,
        consecutiveWins: 0
    },
    achievements: []
};

let gameState = JSON.parse(JSON.stringify(DEFAULT_GAME_STATE));

// 存档相关
function saveGame() {
    localStorage.setItem('xiantu_save', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('xiantu_save');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            gameState = { ...DEFAULT_GAME_STATE, ...parsed };
            // 初始化新字段
            if (gameState.player.hp === undefined) gameState.player.hp = 100;
            if (gameState.player.maxHp === undefined) gameState.player.maxHp = 100;
            if (gameState.player.hunger === undefined) gameState.player.hunger = 100;
            if (gameState.player.maxLingqi === undefined) gameState.player.maxLingqi = 100;
            if (gameState.player.energy === undefined) gameState.player.energy = 100;
            if (gameState.player.maxEnergy === undefined) gameState.player.maxEnergy = 100;
            if (gameState.player.bottleneck === undefined) gameState.player.bottleneck = 0;
            if (!gameState.stats) gameState.stats = {};
            if (!gameState.achievements) gameState.achievements = [];
            return true;
        } catch (e) {
            console.error('存档读取失败:', e);
        }
    }
    return false;
}

function resetGame() {
    if (confirm('确定要重置游戏吗？所有数据将被清除！')) {
        localStorage.removeItem('xiantu_save');
        gameState = JSON.parse(JSON.stringify(DEFAULT_GAME_STATE));
        spawnEnemy();
        updateUI();
        saveGame();
        showModal('重置成功', '游戏已重置为初始状态');
    }
}
