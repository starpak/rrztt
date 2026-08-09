/**
 * 星猫降临 - Galgame 剧本
 * 一个关于救赎的故事：外星猫娘与疲惫打工人的相遇
 */

// 游戏状态
let gameState = {
    currentScene: 0,
    flags: {},
    affinity: 0 // 好感度
};

// 剧本内容
const storyScript = [
    // ========== 开篇 ==========
    {
        type: 'background',
        value: 'linear-gradient(135deg, #2c3e50 0%, #4a5568 100%)'
    },
    {
        type: 'narration',
        text: '深夜的城市，霓虹灯闪烁着疲惫的光芒。'
    },
    {
        type: 'narration',
        text: '我拖着沉重的步伐走在回家的路上，这已经是连续加班的第十五天了。'
    },
    {
        type: 'narration',
        text: '工作、房租、催婚……生活的重担压得我喘不过气来。'
    },
    {
        type: 'narration',
        text: '有时候我在想，这样的生活，真的还有意义吗？'
    },
    
    // ========== 相遇 ==========
    {
        type: 'background',
        value: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
    },
    {
        type: 'showCharacter',
        position: 'center'
    },
    {
        type: 'narration',
        text: '就在我经过公园时，一道奇异的光芒从天而降。'
    },
    {
        type: 'dialogue',
        character: '？？？',
        text: '喵呜……这里是……地球吗？'
    },
    {
        type: 'narration',
        text: '光芒散去后，我看到了一位……长着猫耳的少女？'
    },
    {
        type: 'dialogue',
        character: '神秘少女',
        text: '诶？有人类！那个……请问这里是哪里呀？'
    },
    {
        type: 'dialogue',
        character: '我',
        text: '你是……什么人？为什么会从天上掉下来？'
    },
    {
        type: 'dialogue',
        character: '神秘少女',
        text: '我是从喵星来的！飞船出了故障，迫降在这里了……'
    },
    {
        type: 'dialogue',
        character: '神秘少女',
        text: '啊对了！我叫星奈，是喵星的探险家！'
    },
    {
        type: 'dialogue',
        character: '我',
        text: '（这算什么啊……是在 cosplay 吗？）'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '那个……人类先生，我现在无家可归了，能帮帮我吗？'
    },
    {
        type: 'choice',
        options: [
            { text: '带她回家', affinity: 10, next: 37 },
            { text: '报警求助', affinity: -5, next: 37 }
        ]
    },
    
    // ========== 中间 - 同居生活开始 ==========
    {
        type: 'background',
        value: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '哇！这就是人类的房间吗？好厉害！'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '这个会发光的盒子是什么？（指着电视）'
    },
    {
        type: 'dialogue',
        character: '我',
        text: '那是电视……用来消遣的东西。'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '消遣？喵星人从来不消遣，我们只唱歌！'
    },
    {
        type: 'dialogue',
        character: '我',
        text: '唱歌？你会唱歌吗？'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '当然会！听好了哦～♪'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '喵～喵喵～喵呜～～～♪'
    },
    {
        type: 'narration',
        text: '……怎么说呢，很有活力吧。'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '怎么样怎么样？我唱得好听吗？'
    },
    {
        type: 'dialogue',
        character: '我',
        text: '（还是别打击她了）……嗯，很有特色。'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '太好了！那我以后天天唱给你听！'
    },
    
    // ========== 日常对话 - 展现女主性格 ==========
    {
        type: 'dialogue',
        character: '星奈',
        text: '呐，你每天都在做什么工作呀？看起来很累的样子。'
    },
    {
        type: 'dialogue',
        character: '我',
        text: '就是普通的上班族，做报表、开会、改方案……'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '听起来好无聊哦。在喵星，我们每天都玩捉迷藏！'
    },
    {
        type: 'dialogue',
        character: '我',
        text: '（可能就是因为这样你们才需要星际旅行吧……）'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '不过……看你这么辛苦，我来帮你加油吧！'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '喵星式应援——加油加油加加油！喵！'
    },
    {
        type: 'narration',
        text: '看着她笨拙又认真的样子，我竟然真的感觉轻松了一些。'
    },
    
    // ========== 危机一：被发现 ==========
    {
        type: 'background',
        value: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)'
    },
    {
        type: 'dialogue',
        character: '我',
        text: '糟了……房东说要来检查房屋。'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '检查？为什么要检查？我做错什么了吗？'
    },
    {
        type: 'dialogue',
        character: '我',
        text: '不是你的错……但是如果被人发现有个来历不明的女孩住在这里……'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '那怎么办？要躲起来吗？'
    },
    {
        type: 'dialogue',
        character: '我',
        text: '来不及了……他已经到楼下了。'
    },
    {
        type: 'narration',
        text: '敲门声响起，我的心跳到了嗓子眼。'
    },
    {
        type: 'dialogue',
        character: '房东',
        text: '开门！例行检查！'
    },
    {
        type: 'choice',
        options: [
            { text: '让星奈躲进衣柜', affinity: 5, next: 75 },
            { text: '坦白一切', affinity: 15, next: 75 }
        ]
    },
    
    // ========== 危机二：飞船修复失败 ==========
    {
        type: 'background',
        value: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '……飞船的修复失败了。'
    },
    {
        type: 'dialogue',
        character: '我',
        text: '什么意思？'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '核心部件损坏太严重了，以地球的技术水平……修不好。'
    },
    {
        type: 'dialogue',
        character: '我',
        text: '那岂不是……'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '嗯，我回不了喵星了。'
    },
    {
        type: 'narration',
        text: '她的声音很平静，但我能看到她眼中的失落。'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '对不起，给你添了这么多麻烦，最后还要赖在这里……'
    },
    {
        type: 'dialogue',
        character: '我',
        text: '别说这种话。'
    },
    {
        type: 'dialogue',
        character: '我',
        text: '如果你无处可去……这里就是你的家。'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '……诶？'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '笨蛋……突然说这种话……'
    },
    {
        type: 'narration',
        text: '她的脸红了，猫耳也微微抖动着。'
    },
    
    // ========== 感情升温 ==========
    {
        type: 'background',
        value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '那个……我有件事想告诉你。'
    },
    {
        type: 'dialogue',
        character: '我',
        text: '什么事？'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '其实……刚来的时候我很害怕。陌生的星球，陌生的人类……'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '但是你收留了我，照顾我，听我唱难听的歌……'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '我开始觉得，留在地球好像也不错。'
    },
    {
        type: 'dialogue',
        character: '我',
        text: '星奈……'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '而且……因为你，我第一次明白了什么是"喜欢"。'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '喵星人本来是没有这种感情的……但是和你在一起的时候……'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '心跳会变快，脸会发烫，看到你笑我也会开心……'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '这一定就是"喜欢"吧？'
    },
    
    // ========== 最终 - 表白 ==========
    {
        type: 'background',
        value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
        type: 'dialogue',
        character: '我',
        text: '我也……从来没有想过会遇到你这样的人。'
    },
    {
        type: 'dialogue',
        character: '我',
        text: '在你出现之前，我的生活一片灰暗。'
    },
    {
        type: 'dialogue',
        character: '我',
        text: '是你让我重新找到了活着的意义。'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '那……我们以后一直在一起好不好？'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '就算回不了喵星，只要有你在身边，哪里都是家。'
    },
    {
        type: 'dialogue',
        character: '我',
        text: '嗯，我们一起走下去。'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '拉钩！不许反悔哦！'
    },
    {
        type: 'narration',
        text: '两只小拇指勾在一起，许下了永恒的约定。'
    },
    
    // ========== 刀子 - 尾声 ==========
    {
        type: 'background',
        value: 'linear-gradient(135deg, #000000 0%, #1a1a2e 100%)'
    },
    {
        type: 'narration',
        text: '三年后。'
    },
    {
        type: 'narration',
        text: '我和星奈依然住在这个小城里，过着平凡而幸福的生活。'
    },
    {
        type: 'narration',
        text: '她学会了做饭（虽然还是经常糊锅），找到了工作（在一家宠物店）。'
    },
    {
        type: 'narration',
        text: '而我也不再是那个想要放弃生活的打工人。'
    },
    {
        type: 'narration',
        text: '因为有她在等我回家。'
    },
    {
        type: 'dialogue',
        character: '星奈',
        text: '欢迎回来！今天工作辛苦啦～'
    },
    {
        type: 'dialogue',
        character: '我',
        text: '我回来了。'
    },
    {
        type: 'narration',
        text: '她笑着扑进我怀里，猫耳轻轻蹭着我的下巴。'
    },
    {
        type: 'narration',
        text: '那一刻，我明白了——'
    },
    {
        type: 'narration',
        text: '所谓救赎，不是谁拯救谁。'
    },
    {
        type: 'narration',
        text: '而是两个孤独的灵魂，在茫茫宇宙中相遇，然后彼此温暖。'
    },
    {
        type: 'narration',
        text: '她是我的星猫，我是她的归宿。'
    },
    {
        type: 'ending',
        title: 'True Ending - 星之羁绊',
        description: '感谢你体验完整个故事。\n\n有时候，生活的转机就在下一个转角。\n就像那颗从天而降的星星，\n也许正在向你飞来。',
        showCredits: true
    }
];

// 初始化游戏
function initGame() {
    gameState.currentScene = 0;
    gameState.flags = {};
    gameState.affinity = 0;
    renderScene();
}

// 渲染场景
function renderScene() {
    if (gameState.currentScene >= storyScript.length) {
        return;
    }
    
    const scene = storyScript[gameState.currentScene];
    
    switch (scene.type) {
        case 'background':
            document.querySelector('.game-background').style.background = scene.value;
            gameState.currentScene++;
            setTimeout(renderScene, 100);
            break;
            
        case 'showCharacter':
            const charSprite = document.getElementById('character-sprite');
            charSprite.style.display = 'flex';
            gameState.currentScene++;
            setTimeout(renderScene, 100);
            break;
            
        case 'hideCharacter':
            document.getElementById('character-sprite').style.display = 'none';
            gameState.currentScene++;
            setTimeout(renderScene, 100);
            break;
            
        case 'dialogue':
            showDialogue(scene.character, scene.text);
            break;
            
        case 'narration':
            showDialogue(null, scene.text);
            break;
            
        case 'choice':
            showChoice(scene.options);
            break;
            
        case 'ending':
            showEnding(scene.title, scene.description);
            break;
    }
}

// 显示对话
function showDialogue(character, text) {
    const dialogueBox = document.getElementById('dialogue-box');
    const nameElement = dialogueBox.querySelector('.character-name');
    const textElement = dialogueBox.querySelector('.dialogue-text');
    
    dialogueBox.style.display = 'block';
    
    if (character) {
        nameElement.textContent = character;
        nameElement.style.display = 'block';
    } else {
        nameElement.style.display = 'none';
    }
    
    // 打字机效果
    let index = 0;
    textElement.textContent = '';
    
    const typeInterval = setInterval(() => {
        if (index < text.length) {
            textElement.textContent += text[index];
            index++;
        } else {
            clearInterval(typeInterval);
        }
    }, 50);
    
    // 点击继续
    dialogueBox.onclick = () => {
        if (index < text.length) {
            // 立即显示完整文本
            clearInterval(typeInterval);
            textElement.textContent = text;
            index = text.length;
        } else {
            gameState.currentScene++;
            dialogueBox.onclick = null;
            renderScene();
        }
    };
}

// 显示选择
function showChoice(options) {
    const choiceContainer = document.getElementById('choice-container');
    choiceContainer.innerHTML = '';
    choiceContainer.style.display = 'flex';
    
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = option.text;
        btn.onclick = () => {
            // 更新好感度
            if (option.affinity) {
                gameState.affinity += option.affinity;
            }
            // 跳转到指定场景
            gameState.currentScene = option.next;
            choiceContainer.style.display = 'none';
            renderScene();
        };
        choiceContainer.appendChild(btn);
    });
}

// 显示结局
function showEnding(title, description) {
    const overlay = document.createElement('div');
    overlay.className = 'ending-overlay';
    overlay.innerHTML = `
        <div class="ending-content">
            <h2>${title}</h2>
            <p style="white-space: pre-line;">${description}</p>
            <button class="ending-btn" onclick="location.href='/'">返回主页</button>
        </div>
    `;
    document.body.appendChild(overlay);
}
