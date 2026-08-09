/* ============================================================
   若若子官网 · 音乐页面歌曲播放器 (v1.0.6)
   - 修复：点击播放按钮真正控制音频
   - 修复：完全禁止自动播放
   - 修复：互斥播放（播放一首时自动暂停其他）
   - 修复：背景音乐与歌曲播放器互斥
   - 修复：暂停按钮点击后不会重新播放
   - 优化：播放/暂停图标切换
   ============================================================ */
(function () {
  "use strict";

  var currentAudio = null;
  var currentBtn = null;
  var bgmAudio = document.getElementById("rrz-bgm");
  var musicBtn = document.getElementById("rrz-music-btn");
  var isBgmPlaying = false;

  // 暂停背景音乐
  function pauseBGM() {
    if (bgmAudio && !bgmAudio.paused) {
      bgmAudio.pause();
      isBgmPlaying = false;
      if (musicBtn) {
        musicBtn.classList.remove("is-playing");
        var icon = musicBtn.querySelector(".rrz-music-icon");
        var label = musicBtn.querySelector("#rrz-music-label");
        if (icon) icon.textContent = "▶";
        if (label) label.textContent = "点击播放";
      }
    }
  }

  // 播放背景音乐
  function playBGM() {
    if (bgmAudio) {
      // 先暂停所有歌曲
      if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
        if (currentBtn) updateIcon(currentBtn, false);
        currentAudio = null;
        currentBtn = null;
      }
      bgmAudio.currentTime = 0;
      bgmAudio.play().then(function() {
        isBgmPlaying = true;
        if (musicBtn) {
          musicBtn.classList.add("is-playing");
          var icon = musicBtn.querySelector(".rrz-music-icon");
          var label = musicBtn.querySelector("#rrz-music-label");
          if (icon) icon.textContent = "❚❚";
          if (label) label.textContent = "正在播放";
        }
      }).catch(function(err) {
        console.log("BGM 播放失败:", err);
      });
    }
  }

  // 切换背景音乐
  function toggleBGM() {
    if (isBgmPlaying) {
      pauseBGM();
    } else {
      playBGM();
    }
  }

  // 初始化所有歌曲卡片
  function init() {
    var songItems = document.querySelectorAll(".rrz-song-item");
    if (!songItems || songItems.length === 0) return;

    songItems.forEach(function (item, index) {
      var playBtn = item.querySelector(".rrz-play-btn");
      var audioId = "rrz-audio-" + index;
      var audio = document.getElementById(audioId);
      var playIcon = item.querySelector(".play-icon");
      var pauseIcon = item.querySelector(".pause-icon");

      if (!playBtn || !audio) return;

      // 确保不自动加载
      audio.preload = "none";
      audio.removeAttribute("autoplay");

      // 初始化图标状态
      if (playIcon) playIcon.classList.remove("hidden");
      if (pauseIcon) pauseIcon.classList.add("hidden");

      // 点击播放按钮
      playBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        // 如果点击的是正在播放的歌曲 -> 暂停 (不重置 currentTime)
        if (currentAudio === audio && !audio.paused) {
          audio.pause();
          updateIcon(playBtn, false);
          return;
        }

        // 如果之前有正在播放的 -> 先暂停它
        if (currentAudio && !currentAudio.paused) {
          currentAudio.pause();
          if (currentBtn) {
            updateIcon(currentBtn, false);
          }
        }

        // 暂停背景音乐
        pauseBGM();

        // 播放新的歌曲
        currentAudio = audio;
        currentBtn = playBtn;

        // 如果是从头开始播放才重置时间，否则继续播放
        if (audio.paused || audio.ended) {
          if (audio.ended) {
            audio.currentTime = 0;
          }
          var playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.then(function () {
              updateIcon(playBtn, true);
            }).catch(function (err) {
              console.log("播放失败:", err);
              updateIcon(playBtn, false);
              currentAudio = null;
              currentBtn = null;
            });
          }
        } else {
          // 已经在播放了，更新图标
          updateIcon(playBtn, true);
        }
      });

      // 音频播放结束
      audio.addEventListener("ended", function () {
        updateIcon(playBtn, false);
        currentAudio = null;
        currentBtn = null;
      });

      // 音频被暂停
      audio.addEventListener("pause", function () {
        if (currentAudio === audio) {
          updateIcon(playBtn, false);
        }
      });

      // 音频开始播放
      audio.addEventListener("play", function () {
        updateIcon(playBtn, true);
      });
    });

    // 绑定背景音乐按钮事件
    if (musicBtn) {
      musicBtn.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleBGM();
      });
    }
  }

  // 更新按钮图标
  function updateIcon(btn, isPlaying) {
    if (!btn) return;
    var playIcon = btn.querySelector(".play-icon");
    var pauseIcon = btn.querySelector(".pause-icon");
    if (!playIcon || !pauseIcon) return;

    if (isPlaying) {
      playIcon.classList.add("hidden");
      pauseIcon.classList.remove("hidden");
    } else {
      playIcon.classList.remove("hidden");
      pauseIcon.classList.add("hidden");
    }
  }

  // DOM 加载完成后初始化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
