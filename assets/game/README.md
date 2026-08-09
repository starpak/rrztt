# Galgame Engine 使用文档

## 目录结构

```
assets/game/
├── galgame-core.js      # 核心引擎代码
├── galgame-styles.css   # 样式文件
├── sample-script.js     # 示例剧本
└── README.md           # 本文档
```

## 快速开始

### 1. 引入引擎

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的 Galgame</title>
    <link rel="stylesheet" href="assets/game/galgame-styles.css">
</head>
<body>
    <script src="assets/game/galgame-core.js"></script>
    <script src="assets/game/sample-script.js"></script>
    <script>
        // 初始化游戏引擎
        const game = new GalgameEngine({
            title: '我的 Galgame',
            version: '1.0.0',
            autoPlayDelay: 2000
        });

        // 注册场景
        game.registerScene('prologue', window.scripts.prologue);
        game.registerScene('classroom', window.scripts.classroom);
        game.registerScene('investigate_club', window.scripts.investigate_club);
        game.registerScene('meet_stranger', window.scripts.meet_stranger);
        game.registerScene('join_club', window.scripts.join_club);
        game.registerScene('refuse_club', window.scripts.refuse_club);
        game.registerScene('skip_club', window.scripts.skip_club);
        game.registerScene('daily_life', window.scripts.daily_life);
        game.registerScene('good_ending', window.scripts.good_ending);
        game.registerScene('normal_ending', window.scripts.normal_ending);

        // 定义结局
        game.branchSystem.defineEnding('good', {
            title: 'Good Ending - 新的冒险',
            description: '你和若叶子加入了超自然研究会，开始了奇妙的冒险之旅...'
        });

        game.branchSystem.defineEnding('normal', {
            title: 'Normal Ending - 平凡的日常',
            description: '日子平静地流逝，樱花年复一年地绽放。这样的日常，也很美好。'
        });

        // 注册剧情注入
        game.inject('club_joined', (engine) => {
            console.log('社团加入事件触发！');
            // 可以在这里播放特殊动画或音效
        });

        // 初始化并启动
        game.init();
    </script>
</body>
</html>
```

## 核心组件

### 1. GalgameEngine - 主引擎

游戏的核心控制器，管理所有组件和流程。

```javascript
const game = new GalgameEngine({
    title: '游戏标题',
    version: '1.0.0',
    autoPlayDelay: 2000  // 自动播放延迟（毫秒）
});
```

**主要方法：**
- `init()` - 初始化游戏
- `registerScene(sceneId, script)` - 注册场景
- `jumpTo(sceneId)` - 跳转到指定场景
- `next()` - 继续下一句对话
- `inject(pointId, callback)` - 注册剧情注入点
- `startGame()` - 开始游戏
- `showStartMenu()` - 显示开始菜单

### 2. GameState - 游戏状态管理

管理游戏进度、标志位、变量和存档。

```javascript
// 设置剧情标志
game.gameState.setFlag('met_heroine', true);

// 获取标志
if (game.gameState.getFlag('met_heroine')) {
    // ...
}

// 设置变量
game.gameState.setVariable('affection', 50);

// 获取变量
const affection = game.gameState.getVariable('affection', 0);

// 保存游戏
game.gameState.save(1);  // 保存到槽位 1

// 读取游戏
game.gameState.load(1);  // 从槽位 1 读取

// 重置游戏
game.gameState.reset();
```

### 3. ScriptParser - 剧本解析器

解析 galgame 专用剧本语法。

**支持的语法：**

```
// 注释
角色名：对话内容
@指令 参数
普通文本作为旁白
```

**内置指令：**
- `@scene 场景名` - 切换背景
- `@character 角色名` - 显示角色立绘
- `@choice 选项 1|场景 1，选项 2|场景 2` - 显示选择支
- `@set 变量=值` - 设置变量
- `@if 条件==值 then 场景` - 条件分支
- `@jump 场景名` - 跳转场景
- `@ending 结局 ID` - 触发结局
- `@inject 注入点 ID` - 执行剧情注入
- `@save 槽位号` - 保存游戏
- `@music 音乐文件` - 播放背景音乐
- `@effect 音效文件` - 播放音效

### 4. StartMenu - 开始菜单

提供游戏主菜单界面。

```javascript
// 菜单选项：
// - 开始游戏
// - 读取存档
// - 回想画廊
// - 设置
// - 退出
```

### 5. DialogueBox - 对话框

显示角色对话和旁白，支持打字机效果。

**特性：**
- 角色名称标签
- 打字机效果
- 点击立即完成
- 点击继续下一句
- 下一个指示器动画

### 6. ChoiceSystem - 选择系统

处理玩家选择，影响剧情分支。

```javascript
// 在剧本中使用
@choice 跟她一起去|route_a,一个人留下|route_b

// 或者在代码中
game.choiceSystem.show([
    { text: '选项 A', scene: 'scene_a' },
    { text: '选项 B', scene: 'scene_b' }
]);
```

### 7. BranchSystem - 分支与结局系统

管理剧情分支和多结局。

```javascript
// 定义分支条件
game.branchSystem.defineBranch('heroine_route', [
    { flag: 'affection', operator: 'greaterThan', value: 50, result: 'good' },
    { flag: 'affection', operator: 'greaterThan', value: 20, result: 'normal' },
    { flag: 'affection', operator: 'lessThan', value: 20, result: 'bad' }
]);

// 定义结局
game.branchSystem.defineEnding('good', {
    title: 'Good Ending',
    description: '完美的结局描述...'
});

// 触发结局
game.branchSystem.triggerEnding('good');

// 检查分支
const route = game.branchSystem.checkBranch('heroine_route');
```

## 剧本编写指南

### 基础格式

```javascript
const myScript = `
@scene classroom
@music gentle.mp3

旁白：这是一个普通的下午。
旁白：阳光透过窗户洒进教室。

若叶子：呐，你在做什么呢？
主角：只是在看书而已。

若叶子：什么书这么有趣？
@set curiosity=true

@choice 告诉她实话|tell_truth,神秘地微笑|mysterious

@jump tell_truth
`;
```

### 分支剧情示例

```javascript
const branchExample = `
@scene park

若叶子：今天天气真好呢！

@if weather_good==true then happy_scene
@jump sad_scene

happy_scene:
@scene sunny_park
若叶子：笑容满面地拉着你的手
@set affection+=10
@jump date_scene

sad_scene:
@scene cloudy_park
若叶子：看起来有些失落
@jump comfort_scene
`;
```

### 多结局示例

```javascript
// 在剧本中
@scene final_chapter

旁白：终于到了做出选择的时刻...

@choice 接受她的心意|accept,委婉拒绝|reject

// 在代码中定义结局
game.branchSystem.defineEnding('accept', {
    title: 'True Ending - 从此幸福',
    description: '你们开始了甜蜜的恋爱...'
});

game.branchSystem.defineEnding('reject', {
    title: 'Friend Ending - 珍贵的友谊',
    description: '虽然没能成为恋人，但友谊更加深厚...'
});
```

## 剧情注入系统

剧情注入允许你在特定点插入自定义逻辑。

```javascript
// 注册注入点
game.inject('scene_prologue_start', (engine) => {
    console.log('序幕开始！');
    // 可以播放开场动画
});

game.inject('first_meeting', (engine) => {
    // 第一次相遇时的特殊处理
    engine.gameState.unlockCG('cg_001');
});

// 在剧本中调用
@inject first_meeting
```

## 存档系统

```javascript
// 保存
game.gameState.save(1);  // 槽位 1
game.gameState.save(2);  // 槽位 2

// 读取
if (game.gameState.load(1)) {
    game.startGame();  // 从存档继续
}

// 存档数据结构
{
    currentScene: 'chapter_3',
    flags: { met_heroine: true, affection: 50 },
    variables: { score: 100 },
    history: [...],
    endings: ['normal_1'],
    timestamp: 1234567890
}
```

## 快捷键

在游戏中可以使用以下快捷键：

- `Space` / `Enter` - 继续对话
- `Ctrl` - 快进
- `A` - 切换自动播放
- `S` - 打开保存菜单
- `L` - 打开加载菜单
- `M` - 隐藏/显示菜单
- `Esc` - 返回标题画面

## 自定义样式

可以通过 CSS 自定义游戏外观：

```css
/* 覆盖默认样式 */
.dialogue-box {
    background: rgba(0, 0, 0, 0.9);
    border-color: #gold;
}

.character-name {
    background: linear-gradient(135deg, gold, orange);
}

.menu-btn:hover {
    background: rgba(255, 215, 0, 0.4);
}
```

## 最佳实践

1. **剧本组织**：将不同章节的剧本分开存放
2. **标志位命名**：使用有意义的变量名，如 `met_heroine_chapter1`
3. **存档槽位**：提供至少 3 个存档槽位
4. **结局解锁**：使用本地存储持久化解锁状态
5. **性能优化**：大型图片资源使用预加载
6. **错误处理**：为不存在的场景提供回退处理

## 扩展示例

### 添加角色好感度系统

```javascript
// 扩展 GameState
class ExtendedGameState extends GameState {
    addAffection(character, value) {
        const key = `affection_${character}`;
        const current = this.getVariable(key, 0);
        this.setVariable(key, current + value);
    }

    getAffection(character) {
        return this.getVariable(`affection_${character}`, 0);
    }
}

// 使用
game.gameState.addAffection('ruohaizi', 10);
const affection = game.gameState.getAffection('ruohaizi');

// 根据好感度触发不同剧情
if (affection > 50) {
    game.jumpTo('love_confession');
} else if (affection > 20) {
    game.jumpTo('friend_zone');
} else {
    game.jumpTo('stranger_ending');
}
```

### 添加 CG 收集系统

```javascript
// 在 GameState 中添加
class CGGallery extends GameState {
    unlockCG(cgId) {
        if (!this.cgCollection) {
            this.cgCollection = [];
        }
        if (!this.cgCollection.includes(cgId)) {
            this.cgCollection.push(cgId);
            localStorage.setItem('galgame_cg', JSON.stringify(this.cgCollection));
        }
    }

    hasCG(cgId) {
        return this.cgCollection && this.cgCollection.includes(cgId);
    }

    getCGCount() {
        return this.cgCollection ? this.cgCollection.length : 0;
    }
}
```

## 常见问题

**Q: 如何实现语音播放？**
```javascript
// 在 executeCommand 中添加
case 'voice':
    const audio = new Audio(`voices/${args}.mp3`);
    audio.play();
    break;
```

**Q: 如何实现转场效果？**
```javascript
// 使用 CSS 动画
.setBackground(sceneName) {
    const bg = document.querySelector('.game-background');
    bg.classList.add('fade-out');
    setTimeout(() => {
        bg.style.backgroundImage = `url(images/${sceneName}.jpg)`;
        bg.classList.remove('fade-out');
        bg.classList.add('fade-in');
    }, 500);
}
```

**Q: 如何支持多语言？**
```javascript
// 创建文本字典
const translations = {
    zh: { start: '开始游戏', load: '读取存档' },
    en: { start: 'Start Game', load: 'Load Game' },
    ja: { start: 'ゲーム開始', load: 'ロード' }
};

// 根据语言设置切换
```

## License

MIT License - 可自由使用和修改
