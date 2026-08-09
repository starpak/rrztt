/* ============================================================
   若若子官网 · SPA 路由交互脚本
   - 开场加载动画流程（匹配 CSS 的复杂框架）
   - SPA 路由：history.pushState（非 hash）+ 视图过渡
   - 滚动揭示（双向 IntersectionObserver：进场+退场）
   - 导航高亮（基于当前 SPA 路由）
   - 回到顶部 + 立绘点击彩蛋
   - 标题逐字拆分 / 切换视图后重跑拆分与揭示
   ============================================================ */
(function () {
  "use strict";

  var body = document.body;
  var htmlEl = document.documentElement;
  var revealIO = null; // 双向 IntersectionObserver 实例
  var revealSet = new WeakSet();

  /* ============================================================
     标题逐字拆分（含视图切换后重跑）
     ============================================================ */
  function splitTitle(scope) {
    var root = scope || document;
    root.querySelectorAll("[data-rrz-split]").forEach(function (el) {
      if (el.dataset.rrzSplitDone) return;
      var text = el.textContent;
      el.textContent = "";
      el.classList.add("rrz-split");
      var chars = Array.from(text);
      chars.forEach(function (ch, i) {
        var span = document.createElement("span");
        span.className = "rrz-ch";
        span.textContent = ch === " " ? "\u00A0" : ch;
        span.style.transitionDelay = 120 + i * 80 + "ms";
        el.appendChild(span);
      });
      el.dataset.rrzSplitDone = "1";
    });
  }

  /* ============================================================
     开场加载动画 - 竖向进度条版本（左侧，百分比与进度条严格同步）
     ============================================================ */
  function runLoader() {
    var loader = document.getElementById("rrz-loader");
    if (!loader) {
      body.classList.add("rrz-ready");
      return;
    }
    body.classList.add("rrz-loading");

    // 更新百分比显示和进度条高度（严格同步）
    var percentEl = loader.querySelector(".rrz-loader-percent");
    var progressEl = loader.querySelector(".rrz-loader-progress");
    
    if (percentEl && progressEl) {
      var duration = 2000; // 2 秒
      var interval = 50;
      var steps = duration / interval;
      var currentStep = 0;
      
      var timer = setInterval(function() {
        currentStep++;
        var percent = Math.min(100, Math.floor((currentStep / steps) * 100));
        percentEl.textContent = percent + "%";
        
        // 同步更新进度条高度（从底部向上增长）
        progressEl.style.height = percent + "%";
        
        // 同步更新百分比位置（跟随进度条顶部，从上向下移动）
        // 当进度条高度为 percent% 时，顶部位置是 (100 - percent)%
        var topPos = 100 - percent;
        percentEl.style.top = topPos + "%";
        percentEl.style.transform = "translateY(-" + (100 - topPos) + "%)";
        
        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, interval);
    }

    function reveal() {
      loader.classList.add("is-done");
      body.classList.remove("rrz-loading");
      body.classList.add("rrz-ready");
      setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 800);
      // 第一次进入：先跑首视图拆分 + 揭示（限定到激活视图 scope）
      var first = getCurrentRoute();
      var firstView = document.querySelector('[data-rrz-view="' + first + '"]');
      splitTitle(firstView);
      initReveal(firstView);
    }

    var minTime = new Promise(function (r) { setTimeout(r, 2100); });
    var load = "complete" === document.readyState
      ? Promise.resolve()
      : new Promise(function (r) { window.addEventListener("load", r); });
    Promise.all([minTime, load]).then(reveal);
  }

  /* ============================================================
     滚动揭示（双向 IntersectionObserver：进场+退场）
     ============================================================ */
  function destroyReveal() {
    if (revealIO) {
      try { revealIO.disconnect(); } catch (e) {}
      revealIO = null;
    }
  }
  function initReveal(scope) {
    var root = scope || document;
    // 先销毁旧的，再建新的（双向）
    destroyReveal();
    var items = root.querySelectorAll(".rrz-reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("rrz-in"); });
      return;
    }

    revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        if (entry.isIntersecting) {
          // 进场
          if (!revealSet.has(el)) {
            var delay = el.dataset.rrzDelay ? parseInt(el.dataset.rrzDelay, 10) : 0;
            setTimeout(function () { el.classList.add("rrz-in"); }, delay);
            revealSet.add(el);
          } else {
            // 再次进入仍需显示
            el.classList.add("rrz-in");
          }
        } else {
          // 退场（双向：滚出后移除 rrz-in，下次再进入可以再次播放，前提不是首次已经 unobserve）
          // 注意：首次触发的元素不移除 class，避免过快闪烁；但允许再次入场动画从退场态触发
          if (entry.boundingClientRect.top > window.innerHeight || entry.boundingClientRect.bottom < 0) {
            // 完全离开时，移除 class 以便下次进入重新动画（仅限非首屏、或用户希望双向）
            // 为避免频繁闪烁，仅当元素完全离开后超过一定距离才退场（此处简单处理：退场）
            el.classList.remove("rrz-in");
            revealSet.delete(el);
          }
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { revealIO.observe(el); });
  }

  /* ============================================================
     SPA 路由：history.pushState（非 hash）
     ============================================================ */
  var VIEW_LOCK = false;
  var ROUTE_MAP = {
    "/": { view: "home",  title: "若若子 · rrztt.site" },
    "/index.html": { view: "home",  title: "若若子 · rrztt.site" },
    "/about": { view: "about", title: "关于 · 若若子" },
    "/about.html": { view: "about", title: "关于 · 若若子" },
    "/live": { view: "live",  title: "直播间 · 若若子" },
    "/live.html": { view: "live",  title: "直播间 · 若若子" },
    "/music": { view: "music", title: "音乐 · 若若子" },
    "/music.html": { view: "music", title: "音乐 · 若若子" },
    "/changelog": { view: "changelog", title: "更新日志 · 若若子" },
    "/changelog.html": { view: "changelog", title: "更新日志 · 若若子" },
    "/contributors": { view: "contributors", title: "贡献者名单 · 若若子" },
    "/contributors.html": { view: "contributors", title: "贡献者名单 · 若若子" },
    "/game": { view: "game", title: "星猫降临 · Galgame" },
    "/game.html": { view: "game", title: "星猫降临 · Galgame" },
    "/assets/game/game.html": { view: "game", title: "星猫降临 · Galgame" },
  };

  function getCurrentRoute() {
    var path = window.location.pathname || "/";
    var base = window.location.pathname.replace(/\/[^/]*$/, "");
    // 去掉 base 前缀，得到相对路由
    var rel = path;
    if (base && path.indexOf(base) === 0) rel = path.slice(base.length) || "/";
    if (rel.charAt(0) !== "/") rel = "/" + rel;
    if (ROUTE_MAP[rel]) return ROUTE_MAP[rel].view;
    // 兜底：/ 首页
    return "home";
  }
  function resolveRoute(path) {
    if (ROUTE_MAP[path]) return ROUTE_MAP[path];
    // 去除 .html 再试
    var nohtml = path.replace(/\.html$/, "");
    if (ROUTE_MAP[nohtml]) return ROUTE_MAP[nohtml];
    // 最后兜底：首页
    return ROUTE_MAP["/"];
  }
  function highlightNavByRoute(viewName) {
    document.querySelectorAll(".rrz-nav-link").forEach(function (a) {
      a.classList.remove("is-active");
      var href = (a.getAttribute("href") || "").replace(/\/+$/, "");
      if (!href || href === "/") href = "/";
      var matchView = "home";
      if (href === "/about" || href === "/about.html") matchView = "about";
      else if (href === "/live" || href === "/live.html") matchView = "live";
      else if (href === "/music" || href === "/music.html") matchView = "music";
      else if (href === "/changelog" || href === "/changelog.html") matchView = "changelog";
      else if (href === "/game" || href === "/game.html") matchView = "game";
      if (matchView === viewName) a.classList.add("is-active");
    });
  }
  function switchView(newView, pushState, targetPath) {
    if (VIEW_LOCK) return;
    var current = document.querySelector(".rrz-view.rrz-view-active");
    var next = document.querySelector('.rrz-view[data-rrz-view="' + newView + '"]');
    if (!next) return;
    if (current && current === next) {
      // 相同视图，仅滚动到顶部或目标锚点
      return;
    }

    VIEW_LOCK = true;
    if (pushState) {
      try {
        var state = { view: newView, path: targetPath };
        history.pushState(state, document.title, targetPath);
      } catch (e) { /* ignore */ }
    }

    // 更新 title
    var meta = resolveRoute(targetPath);
    if (meta && meta.title) { document.title = meta.title; }
    highlightNavByRoute(newView);

    // 1) 旧视图：离场
    if (current) {
      current.classList.remove("rrz-view-active");
      current.classList.add("rrz-view-leaving");
    }
    // 2) 滚动回顶（切换后）
    window.scrollTo({ top: 0, behavior: "auto" });

    // 3) 等待过渡 + 新视图入场
    setTimeout(function () {
      if (current) {
        current.classList.remove("rrz-view-leaving");
        current.style.display = '';
      }
      // 拆分标题 + 重置 reveal
      splitTitle(next);
      // 先移除新视图内所有 reveal 的 rrz-in，确保再次进入时动画从头播放
      next.querySelectorAll(".rrz-reveal").forEach(function (el) {
        el.classList.remove("rrz-in");
        revealSet.delete(el);
      });
      // 先设 display:block + 强制 reflow，再添加 active 类触发过渡
      next.style.display = 'block';
      next.offsetHeight; // force reflow
      next.classList.add("rrz-view-active");
      // 等一帧让 display:block 生效后再初始化 reveal（否则 IO 无法检测到元素位置）
      requestAnimationFrame(function () {
        initReveal(next);
      });
      VIEW_LOCK = false;
      // 触发一次 lucide 重建（若 view 内有图标）
      try { if (window.lucide) window.lucide.createIcons(); } catch (e) {}
    }, 360);
  }
  function initSPA() {
    // 初始路由状态替换
    var initView = getCurrentRoute();
    highlightNavByRoute(initView);

    // 所有 data-rrz-route 的 a 标签拦截（包括移动端菜单）
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[data-rrz-route]");
      if (!a) return;
      var href = a.getAttribute("href");
      if (!href) return;
      // 纯锚点：不处理
      if (href.charAt(0) === "#") return;
      // 修饰键 / 新标签：不处理
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank") return;
      e.preventDefault();
      var route = resolveRoute(href);
      switchView(route.view, true, href);
      // 关闭移动端菜单
      var mobileMenu = document.getElementById("rrz-mobile-menu");
      if (mobileMenu) mobileMenu.classList.remove("is-open");
    });

    // popstate：浏览器前进/后退
    window.addEventListener("popstate", function () {
      var path = window.location.pathname || "/";
      var base = window.location.pathname.replace(/\/[^/]*$/, "");
      var rel = path;
      if (base && path.indexOf(base) === 0) rel = path.slice(base.length) || "/";
      if (rel.charAt(0) !== "/") rel = "/" + rel;
      var route = resolveRoute(rel);
      switchView(route.view, false, rel);
    });
  }

  /* ============================================================
     移动端汉堡菜单切换
     ============================================================ */
  function initMobileMenu() {
    var toggle = document.getElementById("rrz-menu-toggle");
    var menu = document.getElementById("rrz-mobile-menu");
    if (!toggle || !menu) return;
    
    toggle.addEventListener("click", function() {
      menu.classList.toggle("is-open");
    });
    
    // 点击菜单外部关闭
    document.addEventListener("click", function(e) {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove("is-open");
      }
    });
  }

  /* ============================================================
     回到顶部
     ============================================================ */
  function initToTop() {
    var btn = document.getElementById("rrz-to-top");
    if (!btn) return;
    function onScroll() {
      if (window.scrollY > 480) btn.classList.add("is-show");
      else btn.classList.remove("is-show");
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ============================================================
     立绘点击彩蛋：rua 一下弹出可爱文字气泡
     ============================================================ */
  function initPortraitClick() {
    var portrait = document.getElementById("rrz-portrait-click");
    if (!portrait) return;
    var words = [
      "喵～rua到我啦！",
      "嘿嘿嘿～好痒",
      "呼噜呼噜～",
      "尾巴要摇起来啦！",
      "再摸摸我嘛～",
      "主人你手好暖",
      "(｡>ω<｡)",
      "若若子被rua了！",
    ];
    portrait.addEventListener("click", function (e) {
      var rect = portrait.getBoundingClientRect();
      var pop = document.createElement("div");
      pop.className = "rrz-rua-pop";
      pop.textContent = words[Math.floor(Math.random() * words.length)];
      // 鼠标点击位置，或居中
      var x = e.clientX, y = e.clientY;
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height * 0.4;
      }
      pop.style.left = x + "px";
      pop.style.top = y + "px";
      document.body.appendChild(pop);
      setTimeout(function () { if (pop.parentNode) pop.parentNode.removeChild(pop); }, 1400);
    });
  }

  /* ============================================================
     B站直播状态实时查询
     API: https://api.bilibili.com/x/space/acc/info?mid=520292668
     返回 data.live_room.liveStatus: 1=正在直播, 0=未直播
     ============================================================ */
  var BILI_UID = "520292668";
  var liveTimer = null;

  function showLiveState(state, title, roomUrl) {
    var loading = document.getElementById("rrz-live-loading");
    var onEl = document.getElementById("rrz-live-on");
    var offEl = document.getElementById("rrz-live-off");
    if (!loading || !onEl || !offEl) return;

    loading.style.display = "none";
    if (state === "on") {
      onEl.style.display = "flex";
      offEl.style.display = "none";
      if (title) {
        var titleEl = document.getElementById("rrz-live-title");
        if (titleEl) titleEl.textContent = title;
      }
      if (roomUrl) {
        var linkEl = document.getElementById("rrz-live-link");
        if (linkEl) linkEl.href = roomUrl;
      }
    } else {
      onEl.style.display = "none";
      offEl.style.display = "flex";
    }
  }

  function fetchLiveStatus() {
    // B 站 API 支持 CORS，可直接 fetch
    var url = "https://api.bilibili.com/x/space/acc/info?mid=" + BILI_UID;
    fetch(url, { method: "GET", credentials: "omit" })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (json.code !== 0 || !json.data || !json.data.live_room) {
          showLiveState("off");
          return;
        }
        var room = json.data.live_room;
        if (room.liveStatus === 1) {
          showLiveState("on", room.title || "若若子正在直播", room.url || ("https://live.bilibili.com/" + room.roomid));
        } else {
          showLiveState("off");
        }
      })
      .catch(function () {
        // 请求失败（网络/CORS），显示未直播状态兜底
        showLiveState("off");
      });
  }

  function initLiveStatus() {
    var statusEl = document.getElementById("rrz-live-status");
    if (!statusEl) return;
    // 首次查询
    fetchLiveStatus();
    // 每 60 秒轮询一次
    if (liveTimer) clearInterval(liveTimer);
    liveTimer = setInterval(fetchLiveStatus, 60000);
  }

  /* ============================================================
     初始化入口
     ============================================================ */
  function updateThemeColor() {
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) return;
    var isDark = htmlEl.classList.contains('dark');
    metaTheme.setAttribute('content', isDark ? '#0a0a0a' : '#f5f5f5');
  }

  function init() {
    runLoader();
    initSPA();
    initMobileMenu();
    initToTop();
    initPortraitClick();
    initLiveStatus();
    initMusicPlayer();
    updateThemeColor();
    
    // 监听主题切换（如果有）
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'class') {
          updateThemeColor();
        }
      });
    });
    observer.observe(htmlEl, { attributes: true });
  }

  /* ============================================================
     音乐页面播放器管理（网易云风格 - 互斥播放）
     ============================================================ */
  function initMusicPlayer() {
    var songItems = document.querySelectorAll('.rrz-song-item');
    if (!songItems.length) return;

    var currentAudio = null;
    var currentBtn = null;
    var isPlaying = false;

    songItems.forEach(function(item) {
      var btn = item.querySelector('.rrz-play-btn');
      var audio = item.querySelector('audio');
      var playIcon = item.querySelector('.play-icon');
      var pauseIcon = item.querySelector('.pause-icon');

      if (!btn || !audio) return;

      btn.addEventListener('click', function() {
        // 如果点击的是正在播放的歌曲，则暂停
        if (currentAudio === audio && isPlaying) {
          audio.pause();
          isPlaying = false;
          if (playIcon) playIcon.classList.remove('hidden');
          if (pauseIcon) pauseIcon.classList.add('hidden');
          currentAudio = null;
          currentBtn = null;
          return;
        }

        // 暂停之前正在播放的歌曲
        if (currentAudio && currentAudio !== audio) {
          currentAudio.pause();
          var prevItem = currentBtn.closest('.rrz-song-item');
          if (prevItem) {
            var prevPlayIcon = prevItem.querySelector('.play-icon');
            var prevPauseIcon = prevItem.querySelector('.pause-icon');
            if (prevPlayIcon) prevPlayIcon.classList.remove('hidden');
            if (prevPauseIcon) prevPauseIcon.classList.add('hidden');
          }
        }

        // 播放新歌曲
        audio.currentTime = 0;
        audio.play().then(function() {
          currentAudio = audio;
          currentBtn = btn;
          isPlaying = true;
          if (playIcon) playIcon.classList.add('hidden');
          if (pauseIcon) pauseIcon.classList.remove('hidden');
        }).catch(function(err) {
          console.log('播放失败:', err);
        });

        // 播放结束时重置图标
        audio.onended = function() {
          isPlaying = false;
          if (playIcon) playIcon.classList.remove('hidden');
          if (pauseIcon) pauseIcon.classList.add('hidden');
          currentAudio = null;
          currentBtn = null;
        };
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
