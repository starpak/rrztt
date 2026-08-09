/**
 * Galgame 示例剧本
 * 演示完整的 galgame 流程，包括分支、选择和多结局
 */

// ==================== 序幕场景 ====================
const prologueScript = `
@scene school_gate
@music bgm.mp3

旁白：这是一个普通的春日早晨。
旁白：樱花飘落的校门前，我像往常一样等待着。

若叶子:早上好！今天也一起走吧？
旁白：若叶子是我的青梅竹马，每天都会在门口等我。

@set met_ruohaizi=true
@jump classroom
`;

// ==================== 教室场景 ====================
const classroomScript = `
@scene classroom

若叶子:呐，你知道吗？听说学校后山有个神秘的社团。
旁白：若叶子兴奋地说着，眼睛里闪烁着好奇的光芒。

选项：要一起去看看吗？|investigate_club,还是算了|skip_club

@jump investigate_club
`;

// ==================== 调查社团场景 ====================
const investigateClubScript = `
@scene mountain_path
@effect wind

旁白：放学后，我们来到了后山。
旁白：一条小路通向山顶，那里有一座古老的建筑。

若叶子:看！就是那里！
旁白：那是一座日式风格的旧校舍。

神秘声音:你们是谁？来这里做什么？
旁白：一个陌生的声音从身后传来。

@set met_mysterious=true
@jump meet_stranger
`;

// ==================== 遇见陌生人场景 ====================
const meetStrangerScript = `
@scene mountain_path

学长：我是超自然研究会的会长，叫我学长大人就好。
若叶子：超自然研究会？听起来好厉害！

学长：既然来了，要不要加入我们？
学长：我们正在寻找传说中的"时空之门"。

选项：加入他们|join_club,拒绝邀请|refuse_club

@jump join_club
`;

// ==================== 加入社团分支 ====================
const joinClubScript = `
@scene club_room

旁白：就这样，我和若叶子加入了超自然研究会。
旁白：从此，我们的日常开始发生奇妙的变化...

@set joined_club=true
@inject club_joined

旁白：新的故事，即将开始——

@ending normal
`;

// ==================== 拒绝社团分支 ====================
const refuseClubScript = `
@scene mountain_path

若叶子：对不起学长，我们还有事，先走了！
旁白：若叶子拉着我的手，飞快地跑下山。

若叶子：呼...总觉得那个学长有点可疑呢。
旁白：虽然拒绝了邀请，但心中却有些在意。

@set joined_club=false
@jump daily_life
`;

// ==================== 跳过社团场景 ====================
const skipClubScript = `
@scene classroom

旁白：最终我们没有去调查那个社团。
旁白：日子一天天过去，生活恢复了平静。

若叶子：不过偶尔还是会好奇呢...
旁白：若叶子小声嘀咕着。

@jump daily_life
`;

// ==================== 日常生活场景 ====================
const dailyLifeScript = `
@scene street

旁白：平凡的日常继续着。
旁白：虽然没有冒险，但这种平淡也很珍贵。

@if joined_club==true then good_ending
@jump normal_ending
`;

// ==================== Good Ending ====================
const goodEndingScript = `
@scene sunset

旁白：在超自然研究会，我们经历了许多不可思议的事件。
旁白：每一次冒险，都让我们的羁绊更加深厚。

若叶子：谢谢你一直陪着我。
旁白：夕阳下，若叶子的笑容格外美丽。

@ending good
`;

// ==================== Normal Ending ====================
const normalEndingScript = `
@scene cherry_blossom

旁白：春天又来了，樱花再次绽放。
旁白：虽然没有什么特别的事情发生，但这样的日常也很美好。

若叶子：明年也要一起看樱花哦！
旁白：我们约定好了，明年的春天也要在一起。

@ending normal
`;

// ==================== Bad Ending (隐藏结局) ====================
const badEndingScript = `
@scene dark_room

旁白：某些选择会带来意想不到的后果...
旁白：黑暗中，真相逐渐浮现。

？？？：这一切都是注定的。
旁白：命运的齿轮开始逆转。

@ending bad
`;

// 导出剧本
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        prologueScript,
        classroomScript,
        investigateClubScript,
        meetStrangerScript,
        joinClubScript,
        refuseClubScript,
        skipClubScript,
        dailyLifeScript,
        goodEndingScript,
        normalEndingScript,
        badEndingScript
    };
} else {
    window.scripts = {
        prologue: prologueScript,
        classroom: classroomScript,
        investigate_club: investigateClubScript,
        meet_stranger: meetStrangerScript,
        join_club: joinClubScript,
        refuse_club: refuseClubScript,
        skip_club: skipClubScript,
        daily_life: dailyLifeScript,
        good_ending: goodEndingScript,
        normal_ending: normalEndingScript,
        bad_ending: badEndingScript
    };
}
