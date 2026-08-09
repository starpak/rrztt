/**
 * Galgame Engine - Core Module
 * 包含开始菜单、对话框、选择系统、分支与多结局、剧情注入等核心组件
 */

// ==================== 游戏状态管理 ====================
class GameState {
    constructor() {
        this.currentScene = 'start';
        this.flags = {}; // 剧情标志
        this.variables = {}; // 变量存储
        this.history = []; // 历史对话记录
        this.endings = []; // 已解锁结局
        this.saveSlot = null;
    }

    setFlag(flag, value) {
        this.flags[flag] = value;
    }

    getFlag(flag, defaultValue = false) {
        return this.flags[flag] !== undefined ? this.flags[flag] : defaultValue;
    }

    setVariable(name, value) {
        this.variables[name] = value;
    }

    getVariable(name, defaultValue = null) {
        return this.variables[name] !== undefined ? this.variables[name] : defaultValue;
    }

    addHistory(entry) {
        this.history.push(entry);
        if (this.history.length > 100) {
            this.history.shift();
        }
    }

    unlockEnding(endingId) {
        if (!this.endings.includes(endingId)) {
            this.endings.push(endingId);
        }
    }

    save(slot) {
        const data = {
            currentScene: this.currentScene,
            flags: { ...this.flags },
            variables: { ...this.variables },
            history: [...this.history],
            endings: [...this.endings],
            timestamp: Date.now()
        };
        localStorage.setItem(`galgame_save_${slot}`, JSON.stringify(data));
        this.saveSlot = slot;
    }

    load(slot) {
        const data = localStorage.getItem(`galgame_save_${slot}`);
        if (data) {
            const parsed = JSON.parse(data);
            this.currentScene = parsed.currentScene;
            this.flags = parsed.flags;
            this.variables = parsed.variables;
            this.history = parsed.history;
            this.endings = parsed.endings;
            this.saveSlot = slot;
            return true;
        }
        return false;
    }

    reset() {
        this.currentScene = 'start';
        this.flags = {};
        this.variables = {};
        this.history = [];
        this.endings = [];
        this.saveSlot = null;
    }
}

// ==================== 剧情脚本解析器 ====================
class ScriptParser {
    constructor(engine) {
        this.engine = engine;
        this.injections = {}; // 剧情注入点
    }

    // 注册剧情注入点
    registerInjection(pointId, callback) {
        if (!this.injections[pointId]) {
            this.injections[pointId] = [];
        }
        this.injections[pointId].push(callback);
    }

    // 执行剧情注入
    async executeInjection(pointId) {
        if (this.injections[pointId]) {
            for (const callback of this.injections[pointId]) {
                await callback(this.engine);
            }
        }
    }

    // 解析单行指令
    parseLine(line) {
        if (!line || line.trim().startsWith('//')) {
            return null;
        }

        // 对话格式: "角色名:对话内容"
        const dialogueMatch = line.match(/^([^:]+):(.+)$/);
        if (dialogueMatch) {
            return {
                type: 'dialogue',
                character: dialogueMatch[1].trim(),
                text: dialogueMatch[2].trim()
            };
        }

        // 指令格式: "@指令 参数"
        const commandMatch = line.match(/^@(\w+)\s*(.*)$/);
        if (commandMatch) {
            return {
                type: 'command',
                command: commandMatch[1],
                args: commandMatch[2].trim()
            };
        }

        // 纯文本作为旁白
        return {
            type: 'narration',
            text: line.trim()
        };
    }

    // 解析整个剧本
    parseScript(script) {
        const lines = script.split('\n');
        const result = [];

        for (const line of lines) {
            const parsed = this.parseLine(line);
            if (parsed) {
                result.push(parsed);
            }
        }

        return result;
    }
}

// ==================== 开始菜单组件 ====================
class StartMenu {
    constructor(engine) {
        this.engine = engine;
        this.element = null;
        this.visible = false;
    }

    create() {
        const menu = document.createElement('div');
        menu.className = 'start-menu';
        menu.innerHTML = `
            <div class="menu-container">
                <h1 class="game-title">${this.engine.config.title}</h1>
                <div class="menu-options">
                    <button class="menu-btn" data-action="start">开始游戏</button>
                    <button class="menu-btn" data-action="load">读取存档</button>
                    <button class="menu-btn" data-action="gallery">回想画廊</button>
                    <button class="menu-btn" data-action="settings">设置</button>
                    <button class="menu-btn" data-action="exit">退出</button>
                </div>
                <div class="menu-version">Ver ${this.engine.config.version}</div>
            </div>
        `;

        menu.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            transition: opacity 0.5s ease;
        `;

        document.body.appendChild(menu);
        this.element = menu;

        // 绑定事件
        menu.querySelectorAll('.menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleAction(action);
            });
        });

        this.visible = true;
    }

    handleAction(action) {
        switch (action) {
            case 'start':
                this.hide();
                this.engine.startGame();
                break;
            case 'load':
                this.showLoadMenu();
                break;
            case 'gallery':
                this.showGallery();
                break;
            case 'settings':
                this.showSettings();
                break;
            case 'exit':
                this.showExitConfirm();
                break;
        }
    }

    showLoadMenu() {
        alert('读取存档功能 - 请选择存档槽位');
        // 实际实现可以弹出存档选择界面
    }

    showGallery() {
        alert('回想画廊 - 展示已解锁的CG和场景');
        // 实际实现可以展示画廊界面
    }

    showSettings() {
        alert('设置 - 音量、文字速度、全屏等选项');
        // 实际实现可以弹出设置面板
    }

    showExitConfirm() {
        if (confirm('确定要退出游戏吗？')) {
            location.reload();
        }
    }

    hide() {
        if (this.element) {
            this.element.style.opacity = '0';
            setTimeout(() => {
                this.element.style.display = 'none';
            }, 500);
            this.visible = false;
        }
    }

    show() {
        if (this.element) {
            this.element.style.display = 'flex';
            setTimeout(() => {
                this.element.style.opacity = '1';
            }, 10);
            this.visible = true;
        }
    }
}

// ==================== 对话框组件 ====================
class DialogueBox {
    constructor(engine) {
        this.engine = engine;
        this.element = null;
        this.nameElement = null;
        this.textElement = null;
        this.isTyping = false;
        this.typingSpeed = 50; // 毫秒/字符
        this.fullText = '';
        this.currentIndex = 0;
        this.typingTimer = null;
    }

    create() {
        const box = document.createElement('div');
        box.className = 'dialogue-box';
        box.innerHTML = `
            <div class="character-name"></div>
            <div class="dialogue-text"></div>
            <div class="next-indicator">▼</div>
        `;

        box.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            min-height: 150px;
            background: rgba(0, 0, 0, 0.75);
            border: 2px solid #4a90d9;
            border-radius: 10px;
            padding: 20px;
            color: white;
            font-size: 18px;
            line-height: 1.6;
            cursor: pointer;
            user-select: none;
        `;

        this.element = box;
        this.nameElement = box.querySelector('.character-name');
        this.textElement = box.querySelector('.dialogue-text');

        // 点击事件处理
        box.addEventListener('click', () => this.handleClick());

        document.getElementById('game-container').appendChild(box);
        return box;
    }

    show(character, text) {
        // 显示角色名
        if (character) {
            this.nameElement.textContent = character;
            this.nameElement.style.cssText = `
                position: absolute;
                top: -15px;
                left: 20px;
                background: #4a90d9;
                padding: 5px 20px;
                border-radius: 15px;
                font-weight: bold;
                font-size: 16px;
            `;
        } else {
            this.nameElement.textContent = '';
        }

        // 打字机效果显示文本
        this.fullText = text;
        this.currentIndex = 0;
        this.isTyping = true;
        this.textElement.textContent = '';

        clearInterval(this.typingTimer);
        this.typingTimer = setInterval(() => {
            if (this.currentIndex < this.fullText.length) {
                this.textElement.textContent += this.fullText[this.currentIndex];
                this.currentIndex++;
            } else {
                this.finishTyping();
            }
        }, this.typingSpeed);
    }

    handleClick() {
        if (this.isTyping) {
            // 如果正在打字，立即完成
            this.finishTyping();
        } else {
            // 否则继续下一句
            this.engine.next();
        }
    }

    finishTyping() {
        clearInterval(this.typingTimer);
        this.textElement.textContent = this.fullText;
        this.isTyping = false;
        this.currentIndex = this.fullText.length;
    }

    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
    }

    showUI() {
        if (this.element) {
            this.element.style.display = 'block';
        }
    }
}

// ==================== 选择系统组件 ====================
class ChoiceSystem {
    constructor(engine) {
        this.engine = engine;
        this.element = null;
        this.choices = [];
        this.isVisible = false;
    }

    create() {
        const container = document.createElement('div');
        container.className = 'choice-container';
        container.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            gap: 15px;
            z-index: 1000;
            display: none;
        `;

        this.element = container;
        document.getElementById('game-container').appendChild(container);
        return container;
    }

    show(choices) {
        this.choices = choices;
        this.element.innerHTML = '';
        this.element.style.display = 'flex';

        choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice.text;
            btn.style.cssText = `
                padding: 15px 40px;
                font-size: 18px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                border: 2px solid #4a90d9;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 300px;
            `;

            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(74, 144, 217, 0.8)';
                btn.style.transform = 'scale(1.05)';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(0, 0, 0, 0.8)';
                btn.style.transform = 'scale(1)';
            });

            btn.addEventListener('click', () => {
                this.select(index);
            });

            this.element.appendChild(btn);
        });

        this.isVisible = true;
    }

    select(index) {
        const choice = this.choices[index];
        this.hide();

        // 记录选择到历史
        this.engine.gameState.addHistory({
            type: 'choice',
            text: choice.text,
            timestamp: Date.now()
        });

        // 执行选择结果
        if (choice.callback) {
            choice.callback();
        }

        // 跳转到指定场景
        if (choice.scene) {
            this.engine.jumpTo(choice.scene);
        }
    }

    hide() {
        this.element.style.display = 'none';
        this.element.innerHTML = '';
        this.choices = [];
        this.isVisible = false;
    }
}

// ==================== 分支与结局系统 ====================
class BranchSystem {
    constructor(engine) {
        this.engine = engine;
        this.branches = {};
        this.endings = {};
    }

    // 定义分支点
    defineBranch(branchId, conditions) {
        this.branches[branchId] = conditions;
    }

    // 检查分支条件
    checkBranch(branchId) {
        const conditions = this.branches[branchId];
        if (!conditions) return null;

        for (const condition of conditions) {
            if (this.evaluateCondition(condition)) {
                return condition.result;
            }
        }

        return null;
    }

    // 评估单个条件
    evaluateCondition(condition) {
        const { flag, operator, value } = condition;

        const actualValue = this.engine.gameState.getFlag(flag);

        switch (operator) {
            case 'equals':
                return actualValue === value;
            case 'notEquals':
                return actualValue !== value;
            case 'greaterThan':
                return actualValue > value;
            case 'lessThan':
                return actualValue < value;
            case 'exists':
                return actualValue !== undefined && actualValue !== null;
            default:
                return false;
        }
    }

    // 定义结局
    defineEnding(endingId, config) {
        this.endings[endingId] = config;
    }

    // 触发结局
    triggerEnding(endingId) {
        const ending = this.endings[endingId];
        if (ending) {
            this.engine.gameState.unlockEnding(endingId);

            // 显示结局画面
            this.showEnding(ending);

            // 保存结局解锁状态
            localStorage.setItem('galgame_endings', JSON.stringify(
                this.engine.gameState.endings
            ));
        }
    }

    showEnding(ending) {
        const overlay = document.createElement('div');
        overlay.className = 'ending-overlay';
        overlay.innerHTML = `
            <div class="ending-content">
                <h2>${ending.title || '结局'}</h2>
                <p>${ending.description || ''}</p>
                <button class="ending-btn">返回标题</button>
            </div>
        `;

        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        const content = overlay.querySelector('.ending-content');
        content.style.cssText = `
            background: linear-gradient(135deg, #2c3e50 0%, #1a252f 100%);
            padding: 40px;
            border-radius: 15px;
            text-align: center;
            color: white;
            max-width: 600px;
        `;

        overlay.querySelector('.ending-btn').addEventListener('click', () => {
            overlay.remove();
            this.engine.showStartMenu();
        });

        document.body.appendChild(overlay);
    }

    // 根据条件自动跳转分支
    autoBranch(branchId, scenes) {
        const result = this.checkBranch(branchId);
        if (result && scenes[result]) {
            this.engine.jumpTo(scenes[result]);
            return true;
        }
        return false;
    }
}

// ==================== 主游戏引擎 ====================
class GalgameEngine {
    constructor(config = {}) {
        this.config = {
            title: config.title || 'Galgame',
            version: config.version || '1.0.0',
            autoPlayDelay: config.autoPlayDelay || 2000,
            ...config
        };

        this.gameState = new GameState();
        this.scriptParser = new ScriptParser(this);
        this.startMenu = new StartMenu(this);
        this.dialogueBox = new DialogueBox(this);
        this.choiceSystem = new ChoiceSystem(this);
        this.branchSystem = new BranchSystem(this);

        this.currentScript = null;
        this.currentIndex = 0;
        this.isRunning = false;
        this.isAutoPlaying = false;
        this.autoPlayTimer = null;

        this.scenes = {};
        this.container = null;
    }

    // 初始化游戏
    init() {
        this.createGameContainer();
        this.startMenu.create();
        this.dialogueBox.create();
        this.choiceSystem.create();

        // 加载已解锁的结局
        const savedEndings = localStorage.getItem('galgame_endings');
        if (savedEndings) {
            this.gameState.endings = JSON.parse(savedEndings);
        }

        console.log(`${this.config.title} v${this.config.version} 初始化完成`);
    }

    createGameContainer() {
        const container = document.createElement('div');
        container.id = 'game-container';
        container.style.cssText = `
            position: relative;
            width: 100%;
            height: 100vh;
            overflow: hidden;
            background: #000;
        `;

        document.body.appendChild(container);
        this.container = container;
    }

    // 注册场景
    registerScene(sceneId, script) {
        this.scenes[sceneId] = this.scriptParser.parseScript(script);
    }

    // 注册剧情注入
    inject(pointId, callback) {
        this.scriptParser.registerInjection(pointId, callback);
    }

    // 开始游戏
    startGame() {
        if (this.gameState.currentScene === 'start') {
            this.jumpTo('prologue');
        } else {
            this.loadScene(this.gameState.currentScene);
        }
    }

    // 跳转到场景
    jumpTo(sceneId) {
        if (this.scenes[sceneId]) {
            this.gameState.currentScene = sceneId;
            this.loadScene(sceneId);
        } else {
            console.error(`场景 "${sceneId}" 不存在`);
        }
    }

    // 加载场景
    loadScene(sceneId) {
        this.currentScript = this.scenes[sceneId];
        this.currentIndex = 0;
        this.isRunning = true;

        // 执行场景注入点
        this.scriptParser.executeInjection(`scene_${sceneId}_start`);

        this.executeNext();
    }

    // 执行下一行
    next() {
        if (!this.isRunning) return;

        this.stopAutoPlay();
        this.executeNext();
    }

    executeNext() {
        if (this.currentIndex >= this.currentScript.length) {
            this.isRunning = false;
            return;
        }

        const instruction = this.currentScript[this.currentIndex];
        this.currentIndex++;

        this.processInstruction(instruction);
    }

    processInstruction(instruction) {
        switch (instruction.type) {
            case 'dialogue':
                this.showDialogue(instruction.character, instruction.text);
                this.gameState.addHistory({
                    type: 'dialogue',
                    character: instruction.character,
                    text: instruction.text,
                    timestamp: Date.now()
                });
                break;

            case 'narration':
                this.showDialogue(null, instruction.text);
                this.gameState.addHistory({
                    type: 'narration',
                    text: instruction.text,
                    timestamp: Date.now()
                });
                break;

            case 'command':
                this.executeCommand(instruction.command, instruction.args);
                break;
        }
    }

    showDialogue(character, text) {
        this.dialogueBox.show(character, text);

        if (this.isAutoPlaying) {
            this.startAutoPlay();
        }
    }

    executeCommand(command, args) {
        switch (command) {
            case 'scene':
                this.setBackground(args);
                break;

            case 'character':
                this.showCharacter(args);
                break;

            case 'choice':
                this.handleChoiceCommand(args);
                break;

            case 'set':
                this.handleSetCommand(args);
                break;

            case 'if':
                this.handleIfCommand(args);
                break;

            case 'jump':
                this.jumpTo(args);
                break;

            case 'ending':
                this.branchSystem.triggerEnding(args);
                break;

            case 'inject':
                this.scriptParser.executeInjection(args);
                break;

            case 'save':
                this.gameState.save(parseInt(args) || 1);
                console.log(`游戏已保存到槽位 ${args}`);
                break;

            case 'music':
                this.playMusic(args);
                break;

            case 'effect':
                this.playEffect(args);
                break;
        }
    }

    handleChoiceCommand(args) {
        // 解析选择项: @choice 选项 1|scene1,选项 2|scene2
        const options = args.split(',').map(opt => {
            const [text, scene] = opt.split('|');
            return {
                text: text.trim(),
                scene: scene ? scene.trim() : null
            };
        });

        this.choiceSystem.show(options);
        this.isRunning = false; // 暂停直到玩家选择
    }

    handleSetCommand(args) {
        // @set flag_name=value
        const [name, value] = args.split('=');
        const parsedValue = value === 'true' ? true :
                           value === 'false' ? false :
                           isNaN(value) ? value : Number(value);
        this.gameState.setFlag(name.trim(), parsedValue);
        this.executeNext();
    }

    handleIfCommand(args) {
        // @if flag_name==value then scene_id
        const match = args.match(/(\w+)==(\w+)\s+then\s+(\w+)/);
        if (match) {
            const [, flag, expectedValue, targetScene] = match;
            if (this.gameState.getFlag(flag) == expectedValue) {
                this.jumpTo(targetScene);
                return;
            }
        }
        this.executeNext();
    }

    setBackground(sceneName) {
        // 实现背景切换逻辑
        console.log(`切换背景到：${sceneName}`);
        this.executeNext();
    }

    showCharacter(characterName) {
        // 实现角色立绘显示逻辑
        console.log(`显示角色：${characterName}`);
        this.executeNext();
    }

    playMusic(musicFile) {
        // 实现背景音乐播放
        console.log(`播放音乐：${musicFile}`);
        this.executeNext();
    }

    playEffect(effectFile) {
        // 实现音效播放
        console.log(`播放音效：${effectFile}`);
        this.executeNext();
    }

    startAutoPlay() {
        this.isAutoPlaying = true;
        this.autoPlayTimer = setTimeout(() => {
            if (this.isAutoPlaying && !this.choiceSystem.isVisible) {
                this.next();
            }
        }, this.config.autoPlayDelay);
    }

    stopAutoPlay() {
        this.isAutoPlaying = false;
        if (this.autoPlayTimer) {
            clearTimeout(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }

    toggleAutoPlay() {
        if (this.isAutoPlaying) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    showStartMenu() {
        this.startMenu.show();
        this.stopAutoPlay();
    }

    // 获取游戏状态
    getState() {
        return {
            currentScene: this.gameState.currentScene,
            flags: this.gameState.flags,
            history: this.gameState.history,
            endings: this.gameState.endings
        };
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GalgameEngine,
        GameState,
        ScriptParser,
        StartMenu,
        DialogueBox,
        ChoiceSystem,
        BranchSystem
    };
} else {
    window.GalgameEngine = GalgameEngine;
    window.GameState = GameState;
    window.ScriptParser = ScriptParser;
    window.StartMenu = StartMenu;
    window.DialogueBox = DialogueBox;
    window.ChoiceSystem = ChoiceSystem;
    window.BranchSystem = BranchSystem;
}
