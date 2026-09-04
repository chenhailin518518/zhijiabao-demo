/*
  智价宝官网 - 原生 JavaScript 交互（竞赛增强版）
  说明：全部数据均为静态数据，不连接后端、数据库或外部接口。
  增强维度：AI估价引擎多维度算法、AI分析过程可视化、localStorage数据持久化、
            表单验证、错误处理、键盘无障碍、图片懒加载、智能推荐、AI问答助手。
*/

"use strict";

/* =========================
   数据层
   ========================= */
const DATA = {
  products: [
    { id: "fan", name: "故宫云纹折扇", scenic: "故宫博物院", category: "北京", image: "assets/img/product-fan.png", condition: "95新", official: 168, low: 92, market: 118, seller: "澄禾", tag: "限定联名", desc: "宫廷云纹扇面，适合收藏和夏季旅拍，近三日热度上升 18%。", heat: 92, retention: 0.72 },
    { id: "cup", name: "西湖荷影陶瓷杯", scenic: "杭州西湖", category: "杭州", image: "assets/img/product-cup.png", condition: "9成新", official: 128, low: 58, market: 76, seller: "湖畔旧物", tag: "实用文创", desc: "青釉杯身与荷影纹样，适合作为伴手礼，二手成交速度较快。", heat: 78, retention: 0.58 },
    { id: "bookmark", name: "敦煌飞天金属书签", scenic: "莫高窟", category: "敦煌", image: "assets/img/product-bookmark.png", condition: "全新尾货", official: 69, low: 36, market: 44, seller: "鸣沙商铺", tag: "商户尾货", desc: "轻薄金属材质，适合批量清仓，平台建议活动价 39-45 元。", heat: 65, retention: 0.62 },
    { id: "pin", name: "黄山迎客松徽章", scenic: "黄山风景区", category: "黄山", image: "assets/img/product-pin.png", condition: "95新", official: 45, low: 22, market: 29, seller: "山行者", tag: "轻收藏", desc: "小件高频交易商品，适合作为游客离园后的二次流转入口。", heat: 71, retention: 0.64 },
    { id: "tea", name: "武夷山岩茶纪念罐", scenic: "武夷山", category: "福建", image: "assets/img/product-tea.png", condition: "8成新", official: 198, low: 88, market: 119, seller: "岩骨花香", tag: "礼盒周边", desc: "茶罐包装完整但有轻微磨痕，适合展示收藏和低价捡漏。", heat: 58, retention: 0.60 },
    { id: "sachet", name: "平遥古城香囊", scenic: "平遥古城", category: "山西", image: "assets/img/product-sachet.png", condition: "全新", official: 59, low: 31, market: 38, seller: "古城手作", tag: "非遗手作", desc: "刺绣纹样保存良好，适合节庆活动和校园文创交换场。", heat: 69, retention: 0.66 },
    { id: "bell", name: "大雁塔祈福铜铃", scenic: "大雁塔", category: "西安", image: "assets/img/product-bell.png", condition: "9成新", official: 108, low: 55, market: 72, seller: "长安慢递", tag: "祈福纪念", desc: "铜色光泽自然，平台相似商品近期成交价集中在 68-79 元。", heat: 74, retention: 0.67 },
    { id: "postcard", name: "丽江古城手绘明信片", scenic: "丽江古城", category: "云南", image: "assets/img/product-postcard.png", condition: "全新尾货", official: 35, low: 18, market: 24, seller: "木府文创", tag: "清仓组合", desc: "套装余量较多，适合商户清仓和游客拼单购买。", heat: 62, retention: 0.55 }
  ],
  records: [
    ["故宫云纹折扇", "AI估价 ¥118", "2026-06-15"],
    ["西湖荷影陶瓷杯", "AI估价 ¥76", "2026-06-14"],
    ["大雁塔祈福铜铃", "AI估价 ¥72", "2026-06-12"]
  ],
  posts: [
    ["黄山迎客松徽章", "已发布", "浏览 268"],
    ["平遥古城香囊", "交易中", "咨询 19"],
    ["丽江明信片套装", "已成交", "成交 ¥24"]
  ]
};

/* =========================
   工具函数
   ========================= */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const scriptAssetPrefix = (() => {
  const src = document.currentScript?.getAttribute("src") || "";
  return src.startsWith("../") ? "../" : "";
})();

function assetPath(path) {
  if (!path || /^(?:[a-z]+:|\/|#)/i.test(path)) return path;
  return `${scriptAssetPrefix}${path}`;
}

/* 防抖 */
function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn.apply(this, args), delay);
  };
}

/* 节流 */
function throttle(fn, limit = 200) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      window.setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

/* 安全的 localStorage 操作 */
const safeStorage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn("[storage] read failed:", key, e);
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn("[storage] write failed:", key, e);
      return false;
    }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }
};

/* 格式化日期 */
function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* 转义HTML，防止XSS */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = String(str ?? "");
  return div.innerHTML;
}

/* =========================
   轻量音效系统
   ========================= */
const interactionSound = (() => {
  let audioContext = null;
  let masterGain = null;
  let lastPlay = 0;

  const presets = {
    tap: { from: 540, to: 690, duration: 0.12, volume: 0.026 },
    page: { from: 360, to: 250, duration: 0.18, volume: 0.024 },
    modal: { from: 420, to: 760, duration: 0.22, volume: 0.03 },
    close: { from: 430, to: 280, duration: 0.12, volume: 0.022 },
    theme: { from: 520, to: 860, duration: 0.24, volume: 0.028 },
    success: { from: 660, to: 880, duration: 0.2, volume: 0.028 },
    error: { from: 320, to: 200, duration: 0.18, volume: 0.026 }
  };

  function ensureContext() {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    if (!audioContext) {
      audioContext = new AudioCtor();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.34;
      masterGain.connect(audioContext.destination);
    }
    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }
    return audioContext;
  }

  function play(type = "tap") {
    const nowMs = Date.now();
    if (nowMs - lastPlay < 48) return;
    lastPlay = nowMs;
    const ctx = ensureContext();
    if (!ctx || !masterGain) return;
    const preset = presets[type] || presets.tap;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = "sine";
    osc.frequency.setValueAtTime(preset.from, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(80, preset.to), now + preset.duration);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.exponentialRampToValueAtTime(900, now + preset.duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(preset.volume, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + preset.duration);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + preset.duration + 0.04);
  }

  return { play };
})();

/* =========================
   全局初始化
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  try {
    initThemeToggle();
    initInteractionSounds();
    initCursorGlow();
    initSkeletonScreen();
    initParticles();
    initPageTransitions();
    initHeader();
    initReveal();
    initHeroText();
    initProductLoops();
    initKeyboardAccessibility();
    initLazyImages();
    initErrorBoundary();
    initScrollProgress();
    initBackToTop();
    initRippleEffect();
    initCardTilt();
    initFavorites();
    initAIAssistant();
    initDashboardPulse();
    initPagePreload();

    const page = document.body.dataset.page;
    if (page === "home") initHome();
    if (page === "estimate") initEstimator();
    if (page === "compare") initCompare();
    if (page === "market") initMarket();
    if (page === "profile") initProfile();
  } catch (e) {
    console.error("[init] fatal error:", e);
  }
});

/* =========================
   错误边界：捕获未处理异常，避免白屏
   ========================= */
function initErrorBoundary() {
  window.addEventListener("error", (event) => {
    console.error("[global error]", event.message, event.filename, event.lineno);
  });
  window.addEventListener("unhandledrejection", (event) => {
    console.error("[unhandled promise]", event.reason);
  });
}

/* =========================
   键盘无障碍：ESC关闭弹窗、焦点管理
   ========================= */
function initKeyboardAccessibility() {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const openModals = $$(".modal-backdrop.is-open");
      if (openModals.length > 0) {
        const topModal = openModals[openModals.length - 1];
        closeModal(topModal);
        interactionSound.play("close");
      }
    }
  });
}

/* =========================
   图片懒加载
   ========================= */
function initLazyImages() {
  if (!("IntersectionObserver" in window)) {
    $$("img[data-src]").forEach((img) => { img.src = img.dataset.src; });
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
        }
        observer.unobserve(img);
      }
    });
  }, { rootMargin: "200px" });
  $$("img[data-src]").forEach((img) => observer.observe(img));
}

/* =========================
   骨架屏
   ========================= */
function initSkeletonScreen() {
  const skeleton = $("#skeletonScreen");
  if (!skeleton) {
    document.body.classList.remove("skeleton-active");
    return;
  }
  const start = Date.now();
  const minVisibleMs = 680;
  function hideSkeleton() {
    const wait = Math.max(0, minVisibleMs - (Date.now() - start));
    window.setTimeout(() => {
      skeleton.classList.add("is-hidden");
      document.body.classList.remove("skeleton-active");
      window.setTimeout(() => skeleton.remove(), 720);
    }, wait);
  }
  if (document.readyState === "complete") {
    hideSkeleton();
  } else {
    window.addEventListener("load", hideSkeleton, { once: true });
    window.setTimeout(hideSkeleton, 2200);
  }
}

/* =========================
   主题切换
   ========================= */
function initThemeToggle() {
  const button = $("#themeToggle");
  const icon = button?.querySelector(".theme-toggle-icon");
  const storageKey = "zhijiabao-theme";
  function applyTheme(theme, withMotion = false) {
    const isDark = theme === "dark";
    document.body.classList.toggle("theme-dark", isDark);
    if (button) {
      button.setAttribute("aria-pressed", String(isDark));
      button.setAttribute("aria-label", isDark ? "切换浅色国风主题" : "切换深色国风主题");
      button.title = isDark ? "切换浅色国风" : "切换深色国风";
    }
    if (icon) icon.textContent = isDark ? "日" : "☾";
    if (withMotion) {
      document.body.classList.add("theme-transition");
      window.setTimeout(() => document.body.classList.remove("theme-transition"), 680);
    }
  }
  const saved = safeStorage.get(storageKey);
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
  button?.addEventListener("click", () => {
    const next = document.body.classList.contains("theme-dark") ? "light" : "dark";
    safeStorage.set(storageKey, next);
    applyTheme(next, true);
    interactionSound.play("theme");
  });
}

/* =========================
   交互音效
   ========================= */
function initInteractionSounds() {
  document.addEventListener("click", (event) => {
    const target = event.target.closest("button, .btn, .filter-tag, .condition-option");
    if (!target) return;
    if (target.closest("#themeToggle")) return;
    if (target.closest("a[data-transition]")) return;
    interactionSound.play("tap");
  });
}

/* =========================
   鼠标跟随微光
   ========================= */
function initCursorGlow() {
  if (window.matchMedia?.("(pointer: coarse)").matches) return;
  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  glow.setAttribute("aria-hidden", "true");
  const dots = Array.from({ length: 9 }, () => {
    const dot = document.createElement("span");
    dot.className = "cursor-trail-dot";
    dot.setAttribute("aria-hidden", "true");
    document.body.appendChild(dot);
    return dot;
  });
  document.body.appendChild(glow);
  const points = dots.map(() => ({ x: window.innerWidth / 2, y: window.innerHeight / 2, alpha: 0 }));
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let visible = false;
  function animate() {
    points[0].x += (mouseX - points[0].x) * 0.38;
    points[0].y += (mouseY - points[0].y) * 0.38;
    points[0].alpha = visible ? 1 : 0;
    for (let i = 1; i < points.length; i += 1) {
      points[i].x += (points[i - 1].x - points[i].x) * 0.34;
      points[i].y += (points[i - 1].y - points[i].y) * 0.34;
      points[i].alpha = Math.max(0, points[i - 1].alpha - 0.09);
    }
    glow.style.opacity = visible ? "1" : "0";
    glow.style.transform = `translate3d(${mouseX - 64}px, ${mouseY - 64}px, 0) scale(${visible ? 1 : 0.82})`;
    dots.forEach((dot, index) => {
      const point = points[index];
      const scale = Math.max(0.24, 1 - index * 0.075);
      dot.style.opacity = String(point.alpha * (0.52 - index * 0.035));
      dot.style.transform = `translate3d(${point.x - 10}px, ${point.y - 10}px, 0) scale(${scale})`;
    });
    requestAnimationFrame(animate);
  }
  window.addEventListener("pointermove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    visible = true;
  }, { passive: true });
  window.addEventListener("pointerleave", () => { visible = false; });
  requestAnimationFrame(animate);
}

/* =========================
   粒子背景
   ========================= */
function initParticles() {
  const canvas = $("#particleCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const particles = [];
  let width = 0;
  let height = 0;
  let rafId = 0;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles.length = 0;
    const count = Math.min(76, Math.floor(width * height / 18000));
    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1.4 + Math.random() * 3.2,
        vx: -0.12 + Math.random() * 0.24,
        vy: -0.08 - Math.random() * 0.18,
        alpha: 0.16 + Math.random() * 0.3,
        hue: Math.random() > 0.5 ? "36,72,83" : "171,132,91"
      });
    }
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -20) p.y = height + 20;
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue},${p.alpha})`;
      ctx.fill();
    });
    rafId = requestAnimationFrame(draw);
  }
  resize();
  draw();
  window.addEventListener("resize", debounce(resize, 200));
  window.addEventListener("beforeunload", () => cancelAnimationFrame(rafId));
}

/* =========================
   页面转场
   ========================= */
function initPageTransitions() {
  const mask = $(".transition-mask");
  $$("a[data-transition]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || link.target === "_blank") return;
      event.preventDefault();
      interactionSound.play("page");
      mask?.classList.add("is-active");
      document.body.classList.add("is-leaving");
      window.setTimeout(() => { window.location.href = href; }, 430);
    });
  });
}

/* =========================
   顶部导航
   ========================= */
function initHeader() {
  const hero = $(".hero, .page-hero");
  function update() {
    const y = window.scrollY;
    document.body.classList.toggle("nav-compact", y > 42);
    if (hero) {
      hero.style.backgroundPosition = `center ${Math.round(y * 0.12)}px`;
    }
  }
  update();
  window.addEventListener("scroll", throttle(update, 100), { passive: true });
}

/* =========================
   滚动渐显
   ========================= */
function initReveal() {
  const nodes = $$(".reveal");
  nodes.forEach((node, index) => {
    node.style.transitionDelay = `${Math.min(index % 8, 7) * 70}ms`;
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  nodes.forEach((node) => observer.observe(node));
}

function initHeroText() {
  const title = $("[data-split-text]");
  if (!title) return;
  if (window.matchMedia?.("(max-width: 720px)").matches) return;
  const text = title.textContent.trim();
  title.textContent = "";
  [...text].forEach((ch, index) => {
    const span = document.createElement("span");
    span.className = "char";
    span.style.animationDelay = `${index * 42}ms`;
    span.textContent = ch === " " ? "\u00A0" : ch;
    title.appendChild(span);
  });
}

function initProductLoops() {
  $$(".product-card.float-loop").forEach((card, index) => {
    card.style.animationDelay = `${index * -0.55}s`;
  });
}

/* =========================
   产品卡片渲染
   ========================= */
function productCard(product, mode = "home") {
  const sources = mode === "compare"
    ? `
      <div class="market-source">
        <div class="source-row"><span>官方商城</span><strong>¥${product.official}</strong></div>
        <div class="source-row"><span>平台低价</span><strong>¥${product.low}</strong></div>
        <div class="source-row"><span>建议成交</span><strong>¥${product.market}</strong></div>
      </div>`
    : "";
  const seller = mode === "market"
    ? `<div class="seller-row"><span class="avatar">${escapeHtml(product.seller.slice(0, 1))}</span><span>${escapeHtml(product.seller)}</span><strong>¥${product.market}</strong></div>`
    : "";
  const imgSrc = product.image;
  return `
    <article class="product-card ${mode === "home" ? "float-loop" : ""}" data-id="${escapeHtml(product.id)}">
      <div class="product-image"><img src="${assetPath(imgSrc)}" alt="${escapeHtml(product.name)}" loading="lazy"></div>
      <div class="product-body">
        <div class="tag-row">
          <span class="tag">${escapeHtml(product.scenic)}</span>
          <span class="price-chip">¥${product.market}</span>
        </div>
        <h3>${escapeHtml(product.name)}</h3>
        <p class="muted">${escapeHtml(product.desc)}</p>
        ${sources}
        ${seller}
        <div class="hover-float">${escapeHtml(product.condition)} · ${escapeHtml(product.tag)} · 智价宝建议价 ¥${product.market}</div>
      </div>
    </article>
  `;
}

/* =========================
   数字动画
   ========================= */
function animateNumber(node, target, duration) {
  const start = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = Math.round(target * eased);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* =========================
   弹窗通用控制
   ========================= */
function closeModal(modal) {
  const card = modal?.querySelector(".modal-card");
  if (!modal || !card) return;
  card.classList.add("is-closing");
  interactionSound.play("close");
  window.setTimeout(() => {
    modal.classList.remove("is-open");
    card.classList.remove("is-closing");
  }, 260);
}

/* =========================
   Toast 提示
   ========================= */
function showToast(message, type = "info") {
  const old = $(".publish-toast");
  old?.remove();
  const toast = document.createElement("div");
  toast.className = "publish-toast";
  toast.textContent = message;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  document.body.appendChild(toast);
  interactionSound.play(type === "error" ? "error" : "success");
  window.setTimeout(() => toast.remove(), 2500);
}

/* =========================
   首页
   ========================= */
function initHome() {
  const hot = $("#hotProducts");
  if (hot) {
    hot.innerHTML = DATA.products.slice(0, 4).map((item) => productCard(item, "home")).join("");
  }
  initDashboardCounters();
}

function initDashboardCounters() {
  const counters = $$("[data-count]");
  if (!counters.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      const target = Number(node.dataset.count || 0);
      animateNumber(node, target, 900);
      observer.unobserve(node);
    });
  }, { threshold: 0.6 });
  counters.forEach((node) => observer.observe(node));
}

/* =========================
   AI 智能估价引擎（竞赛增强版）
   增强点：
   1. 多维度估价算法（品相系数、景区热度、品类保值率、季节系数、供需指数）
   2. AI分析过程可视化（5个步骤动画）
   3. 估价结果增强（市场趋势、保值率预测、建议策略、置信度）
   4. 估价历史自动保存到 localStorage
   5. 表单验证
   ========================= */

/* AI分析步骤定义 */
const AI_ANALYSIS_STEPS = [
  { key: "image", label: "图像识别", desc: "识别文创品类、材质与视觉特征" },
  { key: "feature", label: "特征提取", desc: "提取景区来源、品相等级、限定属性" },
  { key: "match", label: "样本匹配", desc: "匹配全网同类成交样本与历史价格" },
  { key: "predict", label: "价格预测", desc: "多维度加权计算建议成交价区间" },
  { key: "confidence", label: "置信度评估", desc: "评估数据充分度与价格可信度" }
];

/* 景区热度系数表 */
const SCENIC_HEAT_MAP = {
  "故宫博物院": { heat: 95, bonus: 1.12, retention: 0.78 },
  "杭州西湖": { heat: 82, bonus: 1.04, retention: 0.62 },
  "敦煌莫高窟": { heat: 76, bonus: 1.02, retention: 0.70 },
  "黄山风景区": { heat: 70, bonus: 0.98, retention: 0.65 },
  "平遥古城": { heat: 64, bonus: 0.95, retention: 0.66 },
  "武夷山": { heat: 58, bonus: 0.92, retention: 0.60 },
  "大雁塔": { heat: 72, bonus: 1.00, retention: 0.67 },
  "丽江古城": { heat: 68, bonus: 0.97, retention: 0.58 }
};

/* 品相系数表 */
const CONDITION_FACTOR_MAP = {
  "100": { factor: 0.82, label: "全新" },
  "95": { factor: 0.72, label: "95新" },
  "90": { factor: 0.62, label: "9成新" },
  "80": { factor: 0.48, label: "8成新" }
};

/* 季节系数（当前月份） */
function getSeasonFactor() {
  const month = new Date().getMonth() + 1;
  if (month >= 4 && month <= 6) return 1.08; /* 春游旺季 */
  if (month >= 7 && month <= 8) return 1.12; /* 暑假旺季 */
  if (month >= 9 && month <= 11) return 1.05; /* 秋游旺季 */
  return 0.92; /* 淡季 */
}

/* 多维度AI估价核心算法 */
function aiValuationEngine(original, conditionValue, scenic, productNote = "") {
  const condition = CONDITION_FACTOR_MAP[conditionValue] || CONDITION_FACTOR_MAP["95"];
  const scenicData = SCENIC_HEAT_MAP[scenic] || { heat: 70, bonus: 1.0, retention: 0.65 };
  const seasonFactor = getSeasonFactor();

  /* 关键词热度加成 */
  let keywordBonus = 1.0;
  const note = (productNote || "").toLowerCase();
  if (/限定|限量|联名|绝版/.test(note)) keywordBonus += 0.08;
  if (/全新|未拆|包装完整/.test(note)) keywordBonus += 0.03;
  if (/瑕疵|磨损|使用痕迹/.test(note)) keywordBonus -= 0.05;

  /* 供需指数（模拟，基于景区热度） */
  const supplyDemand = 0.85 + (scenicData.heat / 100) * 0.3;

  /* 核心估价公式：原价 × 品相系数 × 景区系数 × 季节系数 × 关键词加成 × 供需指数 */
  const basePrice = original * condition.factor * scenicData.bonus * seasonFactor * keywordBonus * supplyDemand;
  const result = Math.max(18, Math.round(basePrice));

  /* 价格区间 */
  const minPrice = Math.max(12, Math.round(result * 0.88));
  const maxPrice = Math.round(result * 1.15);

  /* 保值率预测（1年后） */
  const retentionRate = Math.min(0.85, scenicData.retention * condition.factor * 0.9);
  const futureValue = Math.round(result * retentionRate);

  /* 置信度（基于原价和数据充分度） */
  const confidence = original >= 30 && original <= 300 ? 92 : 78;

  /* 市场趋势 */
  const trend = scenicData.heat >= 80 ? "上升" : scenicData.heat >= 65 ? "稳定" : "偏弱";

  return {
    result,
    original,
    conditionLabel: condition.label,
    conditionFactor: condition.factor,
    scenic,
    scenicHeat: scenicData.heat,
    scenicBonus: scenicData.bonus,
    seasonFactor,
    keywordBonus,
    supplyDemand,
    minPrice,
    maxPrice,
    retentionRate: Math.round(retentionRate * 100),
    futureValue,
    confidence,
    trend,
    listingPrice: result + 8,
    rushPrice: Math.max(10, result - 12)
  };
}

function initEstimator() {
  const upload = $("#uploadZone");
  const file = $("#imageUpload");
  const preview = $("#uploadPreview");
  const button = $("#estimateBtn");
  const progress = $("#progressPanel");
  const fill = $("#progressFill");
  const modal = $("#resultModal");
  const close = $("#closeResult");
  const progressText = progress?.querySelector("p");

  /* 拖拽上传支持 */
  upload?.addEventListener("dragover", (event) => {
    event.preventDefault();
    upload.style.borderColor = "rgba(213,189,146,0.9)";
  });
  upload?.addEventListener("dragleave", () => {
    upload.style.borderColor = "";
  });
  upload?.addEventListener("drop", (event) => {
    event.preventDefault();
    upload.style.borderColor = "";
    const dropped = event.dataTransfer?.files?.[0];
    if (dropped && dropped.type.startsWith("image/")) {
      preview.src = URL.createObjectURL(dropped);
      upload.classList.add("has-image");
    }
  });

  upload?.addEventListener("click", () => file?.click());
  file?.addEventListener("change", () => {
    const selected = file.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      showToast("请选择图片文件", "error");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      showToast("图片大小不能超过10MB", "error");
      return;
    }
    preview.src = URL.createObjectURL(selected);
    upload.classList.add("has-image");
  });

  button?.addEventListener("click", () => {
    /* 表单验证 */
    const originalInput = $("#originalPrice");
    const original = Number(originalInput?.value || 0);
    if (!original || original <= 0) {
      showToast("请输入有效的购买原价", "error");
      originalInput?.focus();
      return;
    }
    if (original > 99999) {
      showToast("原价输入过大，请检查", "error");
      return;
    }

    const condition = $("[name='condition']:checked")?.value;
    if (!condition) {
      showToast("请选择产品品相", "error");
      return;
    }

    const scenic = $("#scenicSelect")?.value || "故宫博物院";
    const productNote = $("#productNote")?.value || "";

    /* 执行AI估价 */
    const valuation = aiValuationEngine(original, condition, scenic, productNote);

    /* 显示AI分析过程 */
    progress?.classList.add("is-active");
    fill.style.width = "0%";
    button.disabled = true;
    button.style.opacity = "0.6";

    let stepIndex = 0;
    let current = 0;

    const updateProgressText = () => {
      if (stepIndex < AI_ANALYSIS_STEPS.length && progressText) {
        const step = AI_ANALYSIS_STEPS[stepIndex];
        progressText.innerHTML = `<strong>步骤 ${stepIndex + 1}/5：${step.label}</strong><br><span style="opacity:0.7;font-size:12px;">${step.desc}</span>`;
      }
    };
    updateProgressText();

    const timer = window.setInterval(() => {
      current += 4 + Math.random() * 8;
      fill.style.width = `${Math.min(current, 100)}%`;

      /* 根据进度切换分析步骤 */
      const expectedStep = Math.min(4, Math.floor(current / 20));
      if (expectedStep > stepIndex) {
        stepIndex = expectedStep;
        updateProgressText();
      }

      if (current >= 100) {
        window.clearInterval(timer);
        window.setTimeout(() => {
          button.disabled = false;
          button.style.opacity = "";
          progress?.classList.remove("is-active");
          if (progressText) progressText.textContent = "正在识别图像、匹配价格样本并计算品相折旧...";
          openEstimateModal(valuation);
          /* 保存估价记录 */
          saveEstimateRecord(valuation);
        }, 420);
      }
    }, 130);
  });

  close?.addEventListener("click", () => closeModal(modal));
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal(modal);
  });
}

/* 保存估价记录到 localStorage */
function saveEstimateRecord(valuation) {
  try {
    const records = safeStorage.get("zhijiabao-estimate-records", []);
    const record = {
      id: `est-${Date.now()}`,
      name: `${valuation.scenic}文创`,
      scenic: valuation.scenic,
      original: valuation.original,
      result: valuation.result,
      condition: valuation.conditionLabel,
      confidence: valuation.confidence,
      date: formatDate(new Date()),
      timestamp: Date.now()
    };
    records.unshift(record);
    /* 最多保留50条 */
    safeStorage.set("zhijiabao-estimate-records", records.slice(0, 50));
  } catch (e) {
    console.warn("[estimate] save record failed:", e);
  }
}

function openEstimateModal(valuation) {
  const modal = $("#resultModal");
  const number = $("#priceNumber");
  const lines = $("#resultLines");
  const grid = $("#valuationGrid");
  if (!modal || !number || !lines) return;

  number.textContent = "0";

  if (grid) {
    grid.innerHTML = `
      <div class="valuation-item"><span>原价折损</span><strong>${Math.round((valuation.result / valuation.original) * 100)}%</strong></div>
      <div class="valuation-item"><span>品相系数</span><strong>${valuation.conditionLabel}</strong></div>
      <div class="valuation-item"><span>景区热度</span><strong>${valuation.scenicHeat > 80 ? "高热" : valuation.scenicHeat > 65 ? "稳中上升" : "平稳"}</strong></div>
      <div class="valuation-item"><span>成交区间</span><strong>¥${valuation.minPrice}-¥${valuation.maxPrice}</strong></div>
      <div class="valuation-item"><span>AI置信度</span><strong>${valuation.confidence}%</strong></div>
      <div class="valuation-item"><span>市场趋势</span><strong>${valuation.trend}</strong></div>
      <div class="valuation-item"><span>一年保值率</span><strong>${valuation.retentionRate}%</strong></div>
      <div class="valuation-item"><span>季节系数</span><strong>${valuation.seasonFactor.toFixed(2)}</strong></div>
    `;
  }

  lines.innerHTML = `
    <p style="animation-delay: 120ms">官方原价 ¥${valuation.original}，AI综合品相折旧（系数${valuation.conditionFactor}）、景区热度（${valuation.scenicHeat}）、季节系数（${valuation.seasonFactor.toFixed(2)}）与供需指数生成建议价。</p>
    <p style="animation-delay: 240ms">同景区相似文创近 7 日成交区间集中在 ¥${valuation.minPrice} - ¥${valuation.maxPrice}，AI置信度 ${valuation.confidence}%。</p>
    <p style="animation-delay: 360ms">建议上架价 ¥${valuation.listingPrice}（预留议价空间）；急售可降至 ¥${valuation.rushPrice}；预计一年后保值约 ¥${valuation.futureValue}（保值率${valuation.retentionRate}%）。</p>
  `;

  modal.classList.add("is-open");
  interactionSound.play("modal");
  animateNumber(number, valuation.result, 900);
}

/* =========================
   全网比价页（增强：搜索历史、智能排序）
   ========================= */
function initCompare() {
  const list = $("#compareList");
  const search = $("#compareSearch");
  const range = $("#priceRange");
  const rangeText = $("#rangeText");
  let activeCategory = "全部";

  /* 恢复搜索历史 */
  const searchHistory = safeStorage.get("zhijiabao-search-history", []);

  function render() {
    if (!list) return;
    list.classList.add("is-switching");
    window.setTimeout(() => {
      const keyword = (search?.value || "").trim();
      const maxPrice = Number(range?.value || 220);
      let filtered = DATA.products.filter((p) => {
        const matchCategory = activeCategory === "全部" || p.category === activeCategory || p.scenic.includes(activeCategory);
        const matchKeyword = !keyword || `${p.name}${p.scenic}${p.tag}`.includes(keyword);
        return matchCategory && matchKeyword && p.market <= maxPrice;
      });
      /* 智能排序：按热度+保值率综合评分 */
      filtered = filtered.sort((a, b) => (b.heat + b.retention * 100) - (a.heat + a.retention * 100));
      list.innerHTML = filtered.map((item) => productCard(item, "compare")).join("");
      list.classList.remove("is-switching");
    }, 220);
  }

  $$(".filter-tag[data-category]").forEach((tag) => {
    tag.addEventListener("click", () => {
      $$(".filter-tag[data-category]").forEach((item) => item.classList.remove("active"));
      tag.classList.add("active");
      activeCategory = tag.dataset.category || "全部";
      render();
    });
  });

  const debouncedSearch = debounce(() => {
    render();
  }, 250);

  search?.addEventListener("input", () => {
    search.closest(".search-box")?.classList.add("is-typing");
    window.clearTimeout(search._typingTimer);
    search._typingTimer = window.setTimeout(() => search.closest(".search-box")?.classList.remove("is-typing"), 360);
    debouncedSearch();
  });

  /* 搜索回车保存历史 */
  search?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const keyword = search.value.trim();
      if (keyword && keyword.length <= 20) {
        const history = safeStorage.get("zhijiabao-search-history", []);
        if (!history.includes(keyword)) {
          history.unshift(keyword);
          safeStorage.set("zhijiabao-search-history", history.slice(0, 10));
        }
      }
    }
  });

  range?.addEventListener("input", () => {
    rangeText.textContent = `¥${range.value} 以下`;
    render();
  });

  render();
}

/* =========================
   二手交易集市页（增强：收藏、发布持久化、表单验证）
   ========================= */
function initMarket() {
  const list = $("#marketList");
  const segment = $("#marketSegment");
  const detail = $("#detailModal");
  const publishModal = $("#publishModal");
  let mode = "personal";
  let renderCount = 6;
  const userItems = safeStorage.get("zhijiabao-user-products", []);
  const favorites = safeStorage.get("zhijiabao-favorites", []);

  function visibleData() {
    const base = mode === "personal"
      ? DATA.products.filter((_, index) => index % 2 === 0)
      : DATA.products.filter((_, index) => index % 2 === 1);
    const looped = mode === "personal" ? [...userItems] : [];
    while (looped.length < renderCount) looped.push(...base);
    return looped.slice(0, renderCount);
  }

  function render(isAppend = false) {
    if (!list) return;
    const html = visibleData().map((item, index) => {
      const clone = { ...item, id: `${item.id}-${index}`, market: item.market + (index % 3) * 3 };
      return productCard(clone, "market").replace("product-card", `product-card market-card ${isAppend && index >= renderCount - 3 ? "is-new" : ""}`);
    }).join("");
    list.innerHTML = html;

    $$(".market-card", list).forEach((card, index) => {
      card.addEventListener("click", () => openMarketDetail(visibleData()[index % visibleData().length], detail));
    });
  }

  segment?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-mode]");
    if (!button) return;
    mode = button.dataset.mode;
    segment.dataset.active = mode === "merchant" ? "merchant" : "personal";
    $$("button[data-mode]", segment).forEach((btn) => btn.classList.toggle("active", btn === button));
    list.classList.add("is-switching");
    window.setTimeout(() => {
      renderCount = 6;
      render();
      list.classList.remove("is-switching");
    }, 230);
  });

  let loadingMore = false;
  window.addEventListener("scroll", throttle(() => {
    if (loadingMore || document.body.dataset.page !== "market") return;
    const nearBottom = window.innerHeight + window.scrollY > document.body.offsetHeight - 380;
    if (!nearBottom || renderCount >= 15) return;
    loadingMore = true;
    window.setTimeout(() => {
      renderCount += 3;
      render(true);
      loadingMore = false;
    }, 380);
  }, 200), { passive: true });

  initDraggableModal(detail);
  $("#closeDetail")?.addEventListener("click", () => closeModal(detail));
  detail?.addEventListener("click", (event) => {
    if (event.target === detail) closeModal(detail);
  });

  $("#openPublish")?.addEventListener("click", () => {
    publishModal?.classList.add("is-open");
    interactionSound.play("modal");
  });

  $("#closePublish")?.addEventListener("click", () => closeModal(publishModal));
  publishModal?.addEventListener("click", (event) => {
    if (event.target === publishModal) closeModal(publishModal);
  });

  $("#submitPublish")?.addEventListener("click", () => {
    /* 表单验证 */
    const nameInput = $("#publishName");
    const name = nameInput?.value.trim();
    if (!name || name.length < 2) {
      showToast("请输入有效的商品名称（至少2个字）", "error");
      nameInput?.focus();
      return;
    }
    if (name.length > 50) {
      showToast("商品名称不能超过50个字", "error");
      return;
    }

    const originalInput = $("#publishOriginal");
    const original = Number(originalInput?.value || 0);
    if (!original || original <= 0) {
      showToast("请输入有效的原价", "error");
      originalInput?.focus();
      return;
    }

    const priceInput = $("#publishPrice");
    const expected = Number(priceInput?.value || 0);
    if (!expected || expected <= 0) {
      showToast("请输入有效的期望价", "error");
      priceInput?.focus();
      return;
    }
    if (expected > original) {
      showToast("期望价不宜高于原价，建议合理定价", "error");
      return;
    }

    const scenic = $("#publishScenic")?.value || "故宫博物院";
    const item = {
      id: `user-${Date.now()}`,
      name: escapeHtml(name),
      scenic,
      category: scenic.slice(0, 2),
      image: "assets/img/product-pin.png",
      condition: "95新",
      official: original,
      low: Math.max(9, expected - 12),
      market: expected,
      seller: "我",
      tag: "刚刚发布",
      desc: escapeHtml($("#publishDesc")?.value.trim() || "包装完整，支持平台担保交易。"),
      heat: 60,
      retention: 0.6,
      isUser: true,
      createdAt: Date.now()
    };
    userItems.unshift(item);
    safeStorage.set("zhijiabao-user-products", userItems.slice(0, 30));
    mode = "personal";
    segment.dataset.active = "personal";
    $$("button[data-mode]", segment).forEach((btn) => btn.classList.toggle("active", btn.dataset.mode === "personal"));
    renderCount = Math.max(renderCount, 6);
    render(true);
    closeModal(publishModal);
    showToast("发布成功：商品已加入个人闲置列表并保存");
  });

  render();
}

function openMarketDetail(product, modal) {
  if (!modal) return;
  $("#detailTitle").textContent = product.name;
  $("#detailImage").src = assetPath(product.image);
  $("#detailImage").alt = product.name;
  $("#detailMeta").innerHTML = `
    <span class="tag">${escapeHtml(product.scenic)}</span>
    <span class="tag">${escapeHtml(product.condition)}</span>
    <span class="price-chip">¥${product.market}</span>
  `;
  $("#detailDesc").textContent = `${product.desc} 卖家 ${product.seller} 已通过平台基础信用校验，支持担保交易和品相复核。`;
  modal.classList.add("is-open");
  interactionSound.play("modal");
}

function initDraggableModal(modal) {
  const card = modal?.querySelector(".modal-card");
  if (!card) return;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  card.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    try { card.setPointerCapture(event.pointerId); } catch (e) { /* ignore */ }
  });
  card.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const dx = Math.max(-18, Math.min(18, event.clientX - startX));
    const dy = Math.max(-18, Math.min(18, event.clientY - startY));
    card.style.transform = `translate(${dx}px, ${dy}px) scale(1)`;
  });
  card.addEventListener("pointerup", () => {
    dragging = false;
    card.style.transform = "";
  });
  card.addEventListener("pointercancel", () => {
    dragging = false;
    card.style.transform = "";
  });
}

/* =========================
   个人中心页（增强：从 localStorage 读取真实记录）
   ========================= */
function initProfile() {
  const login = $("#loginCard");
  const loginBtn = $("#loginBtn");
  const records = $("#estimateRecords");
  const posts = $("#postRecords");

  /* 渲染估价记录：优先显示localStorage中的真实记录，回退到静态数据 */
  if (records) {
    const savedRecords = safeStorage.get("zhijiabao-estimate-records", []);
    if (savedRecords.length > 0) {
      records.innerHTML = savedRecords.slice(0, 8).map((r) => `
        <div class="record-row">
          <div>
            <strong>${escapeHtml(r.name)}</strong>
            <div class="muted">${escapeHtml(r.date)} · 原价¥${r.original} · 置信度${r.confidence}%</div>
          </div>
          <span class="tag">AI估价 ¥${r.result}</span>
        </div>
      `).join("");
    } else {
      records.innerHTML = DATA.records.map((row) => recordRow(row)).join("");
    }
  }

  /* 渲染发布记录：优先显示localStorage中的真实记录 */
  if (posts) {
    const userProducts = safeStorage.get("zhijiabao-user-products", []);
    if (userProducts.length > 0) {
      posts.innerHTML = userProducts.slice(0, 8).map((p) => `
        <div class="record-row">
          <div>
            <strong>${escapeHtml(p.name)}</strong>
            <div class="muted">${escapeHtml(p.scenic)} · 期望价¥${p.market}</div>
          </div>
          <span class="tag">已发布</span>
        </div>
      `).join("");
    } else {
      posts.innerHTML = DATA.posts.map((row) => recordRow(row)).join("");
    }
  }

  /* 登录状态持久化 */
  const isLoggedIn = safeStorage.get("zhijiabao-logged-in", false);
  if (isLoggedIn) {
    const statusEl = $("#loginStatus");
    if (statusEl) statusEl.textContent = "已登录：陈海林 · 智价宝项目队长";
  }

  loginBtn?.addEventListener("click", () => {
    login.classList.add("loading");
    window.setTimeout(() => {
      login.classList.remove("loading");
      $("#loginStatus").textContent = "已登录：陈海林 · 智价宝项目队长";
      safeStorage.set("zhijiabao-logged-in", true);
      showToast("登录成功，欢迎回来");
    }, 900);
  });
}

function recordRow([title, status, time]) {
  return `
    <div class="record-row">
      <div>
        <strong>${escapeHtml(title)}</strong>
        <div class="muted">${escapeHtml(time)}</div>
      </div>
      <span class="tag">${escapeHtml(status)}</span>
    </div>
  `;
}

/* ============================================================
   第二轮增强：视觉微交互与功能深化（不改UI布局）
   ============================================================ */

/* =========================
   1. 滚动进度条：顶部国风渐变进度条
   ========================= */
function initScrollProgress() {
  const bar = document.createElement("div");
  bar.className = "scroll-progress-bar";
  bar.setAttribute("aria-hidden", "true");
  Object.assign(bar.style, {
    position: "fixed",
    top: "0",
    left: "0",
    height: "3px",
    width: "0%",
    background: "linear-gradient(90deg, #244853, #789c8f, #ab845b)",
    zIndex: "9999",
    transition: "width 120ms ease-out",
    boxShadow: "0 0 12px rgba(171,132,91,0.6)"
  });
  document.body.appendChild(bar);

  const update = throttle(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    bar.style.width = `${progress}%`;
  }, 50);

  window.addEventListener("scroll", update, { passive: true });
  update();
}

/* =========================
   2. 回到顶部按钮：滚动超过一屏后显示
   ========================= */
function initBackToTop() {
  const btn = document.createElement("button");
  btn.className = "back-to-top-btn";
  btn.type = "button";
  btn.setAttribute("aria-label", "回到顶部");
  btn.innerHTML = '<span style="font-size:20px;font-weight:900;">↑</span>';
  Object.assign(btn.style, {
    position: "fixed",
    right: "24px",
    bottom: "110px",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: "1px solid rgba(213,189,146,0.5)",
    color: "#f7f4ec",
    cursor: "pointer",
    background: "linear-gradient(135deg, #244853, #4f827a 48%, #ab845b)",
    boxShadow: "0 12px 28px rgba(36,72,83,0.28)",
    opacity: "0",
    transform: "translateY(20px) scale(0.8)",
    transition: "opacity 320ms ease, transform 320ms cubic-bezier(.2,1.45,.35,1)",
    zIndex: "900",
    display: "grid",
    placeItems: "center",
    pointerEvents: "none"
  });
  document.body.appendChild(btn);

  const update = throttle(() => {
    const show = window.scrollY > window.innerHeight * 0.6;
    btn.style.opacity = show ? "1" : "0";
    btn.style.transform = show ? "translateY(0) scale(1)" : "translateY(20px) scale(0.8)";
    btn.style.pointerEvents = show ? "auto" : "none";
  }, 100);

  window.addEventListener("scroll", update, { passive: true });

  btn.addEventListener("click", () => {
    interactionSound.play("tap");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  update();
}

/* =========================
   3. 按钮波纹效果：点击时产生国风水墨波纹
   ========================= */
function initRippleEffect() {
  document.addEventListener("click", (event) => {
    const target = event.target.closest(".btn, button, .filter-tag, .condition-option, .nav-link");
    if (!target) return;
    if (target.closest("#themeToggle")) return;

    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement("span");
    Object.assign(ripple.style, {
      position: "absolute",
      left: `${event.clientX - rect.left - size / 2}px`,
      top: `${event.clientY - rect.top - size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(255,255,255,0.5), rgba(213,189,146,0.3) 40%, transparent 70%)",
      transform: "scale(0)",
      animation: "rippleExpand 600ms ease-out forwards",
      pointerEvents: "none",
      zIndex: "1"
    });

    const originalPosition = getComputedStyle(target).position;
    if (originalPosition === "static") {
      target.style.position = "relative";
    }
    target.style.overflow = "hidden";
    target.appendChild(ripple);

    window.setTimeout(() => ripple.remove(), 650);
  });

  /* 注入波纹动画关键帧 */
  if (!document.getElementById("ripple-keyframes")) {
    const style = document.createElement("style");
    style.id = "ripple-keyframes";
    style.textContent = `
      @keyframes rippleExpand {
        to { transform: scale(2.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

/* =========================
   4. 商品卡片3D倾斜：悬停时根据鼠标位置微倾斜
   ========================= */
function initCardTilt() {
  if (window.matchMedia?.("(pointer: coarse)").matches) return;

  const maxTilt = 6;
  document.addEventListener("pointermove", throttle((event) => {
    const card = event.target.closest(".product-card, .glass-card, .panel");
    if (!card) return;
    if (card.closest(".modal-card")) return;

    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    card.style.transform = `perspective(800px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg) translateY(-4px) scale(1.012)`;
    card.style.transition = "transform 120ms ease-out";
  }, 16));

  document.addEventListener("pointerout", (event) => {
    const card = event.target.closest(".product-card, .glass-card, .panel");
    if (!card) return;
    card.style.transform = "";
    card.style.transition = "transform 380ms cubic-bezier(.2,1.45,.35,1)";
  });
}

/* =========================
   5. 收藏功能：商品卡片动态添加收藏按钮，状态持久化
   ========================= */
function initFavorites() {
  const FAV_KEY = "zhijiabao-favorites";
  let favorites = safeStorage.get(FAV_KEY, []);

  /* 为所有商品卡片添加收藏按钮 */
  function addFavButtons() {
    $$(".product-card").forEach((card) => {
      if (card.querySelector(".fav-btn")) return;
      const productId = card.dataset.id || card.querySelector("h3")?.textContent || "unknown";
      const isFav = favorites.includes(productId);

      const btn = document.createElement("button");
      btn.className = "fav-btn";
      btn.type = "button";
      btn.setAttribute("aria-label", isFav ? "取消收藏" : "收藏");
      btn.innerHTML = isFav
        ? '<span style="color:#a84e43;font-size:18px;">♥</span>'
        : '<span style="color:rgba(36,72,83,0.4);font-size:18px;">♡</span>';
      Object.assign(btn.style, {
        position: "absolute",
        top: "12px",
        right: "12px",
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.6)",
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(8px)",
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        zIndex: "5",
        transition: "transform 260ms cubic-bezier(.2,1.45,.35,1), background 260ms ease",
        boxShadow: "0 4px 12px rgba(36,72,83,0.12)"
      });

      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        event.preventDefault();
        const idx = favorites.indexOf(productId);
        if (idx > -1) {
          favorites.splice(idx, 1);
          btn.innerHTML = '<span style="color:rgba(36,72,83,0.4);font-size:18px;">♡</span>';
          btn.setAttribute("aria-label", "收藏");
          showToast("已取消收藏");
        } else {
          favorites.push(productId);
          btn.innerHTML = '<span style="color:#a84e43;font-size:18px;">♥</span>';
          btn.setAttribute("aria-label", "取消收藏");
          btn.style.transform = "scale(1.3)";
          window.setTimeout(() => { btn.style.transform = ""; }, 300);
          showToast("收藏成功");
        }
        safeStorage.set(FAV_KEY, favorites);
        interactionSound.play("tap");
      });

      btn.addEventListener("mouseenter", () => { btn.style.transform = "scale(1.12)"; });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });

      const imageWrap = card.querySelector(".product-image");
      if (imageWrap) {
        imageWrap.style.position = "relative";
        imageWrap.appendChild(btn);
      }
    });
  }

  /* 初始添加 + 监听DOM变化（比价/集市页动态渲染后自动添加） */
  addFavButtons();
  const observer = new MutationObserver(debounce(addFavButtons, 300));
  const list = $("#compareList, #marketList, #hotProducts");
  if (list) observer.observe(list, { childList: true, subtree: true });

  /* 个人中心显示收藏数量 */
  if (document.body.dataset.page === "profile" && favorites.length > 0) {
    const profileCard = $(".profile-card");
    if (profileCard) {
      const tagRow = profileCard.querySelector(".tag-row");
      if (tagRow) {
        const favTag = document.createElement("span");
        favTag.className = "tag";
        favTag.textContent = `收藏 ${favorites.length} 件`;
        tagRow.appendChild(favTag);
      }
    }
  }
}

/* =========================
   6. AI智能问答助手：右下角浮动按钮 + 问答面板
   ========================= */
function initAIAssistant() {
  /* 预设问答库 */
  const QA_PAIRS = [
    { keywords: ["估价", "价格", "多少钱", "估值"], answer: "AI智能估价综合景区热度、品相折旧、季节系数、供需指数和历史成交样本，5秒内生成建议成交价。点击顶部「AI智能估价」即可体验。" },
    { keywords: ["比价", "对比", "哪个便宜", "全网"], answer: "全网比价聚合官方商城价、商户清仓价和二手成交价，支持按景区筛选和价格区间过滤，帮你找到最合理的购买价格。" },
    { keywords: ["交易", "购买", "卖", "出售", "发布"], answer: "二手集市支持个人闲置和商户尾货发布，平台担保交易，确认收货后放款，保障买卖双方权益。" },
    { keywords: ["保真", "真假", "验真", "品相"], answer: "平台通过图片识别、包装完整度核验、瑕疵描述和卖家信用体系降低交易争议，支持品相复核和售后申诉。" },
    { keywords: ["景区", "故宫", "西湖", "敦煌", "黄山"], answer: "智价宝已覆盖故宫、西湖、敦煌、黄山、平遥等28个核心景区的文创产品，支持按景区来源筛选和估价。" },
    { keywords: ["你好", "在吗", "hi", "hello", "帮助"], answer: "你好！我是智价宝AI助手，可以为你解答估价、比价、交易、保真等相关问题。请问有什么可以帮你的？" },
    { keywords: ["谢谢", "感谢", "thanks"], answer: "不客气！很高兴能帮到你。如果还有其他问题，随时问我。" }
  ];

  /* 创建浮动按钮 */
  const fab = document.createElement("button");
  fab.className = "ai-assistant-fab";
  fab.type = "button";
  fab.setAttribute("aria-label", "AI智能助手");
  fab.innerHTML = '<span style="font-size:22px;font-weight:900;">智</span>';
  Object.assign(fab.style, {
    position: "fixed",
    right: "24px",
    bottom: "24px",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    border: "1px solid rgba(213,189,146,0.6)",
    color: "#f7f4ec",
    cursor: "pointer",
    background: "linear-gradient(135deg, #244853, #4f827a 48%, #ab845b)",
    boxShadow: "0 16px 40px rgba(36,72,83,0.32), 0 0 24px rgba(171,132,91,0.3)",
    zIndex: "950",
    display: "grid",
    placeItems: "center",
    transition: "transform 320ms cubic-bezier(.2,1.45,.35,1), box-shadow 320ms ease",
    animation: "fabPulse 3s ease-in-out infinite"
  });
  document.body.appendChild(fab);

  /* 创建问答面板 */
  const panel = document.createElement("div");
  panel.className = "ai-assistant-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "AI智能助手");
  Object.assign(panel.style, {
    position: "fixed",
    right: "24px",
    bottom: "92px",
    width: "min(360px, calc(100vw - 48px))",
    maxHeight: "480px",
    borderRadius: "24px",
    background: "linear-gradient(135deg, rgba(255,255,255,0.82), rgba(247,244,236,0.72))",
    border: "1px solid rgba(255,255,255,0.7)",
    boxShadow: "0 28px 80px rgba(19,41,50,0.28)",
    backdropFilter: "blur(20px)",
    zIndex: "960",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    opacity: "0",
    transform: "translateY(20px) scale(0.92)",
    transition: "opacity 320ms ease, transform 320ms cubic-bezier(.2,1.45,.35,1)",
    pointerEvents: "none"
  });

  panel.innerHTML = `
    <div style="padding:18px 20px;background:linear-gradient(135deg, #244853, #4f827a);color:#f7f4ec;display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.18);display:grid;place-items:center;font-weight:900;">智</div>
        <div>
          <div style="font-weight:900;font-size:15px;">智价宝AI助手</div>
          <div style="font-size:11px;opacity:0.7;">在线 · 随时为你解答</div>
        </div>
      </div>
      <button class="ai-panel-close" type="button" style="background:none;border:none;color:#f7f4ec;font-size:20px;cursor:pointer;padding:4px 8px;border-radius:8px;">×</button>
    </div>
    <div class="ai-chat-messages" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;min-height:240px;max-height:300px;">
      <div style="display:flex;gap:8px;align-items:flex-start;">
        <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#244853,#ab845b);color:#fff;display:grid;place-items:center;font-size:12px;font-weight:900;flex-shrink:0;">智</div>
        <div style="background:rgba(255,255,255,0.7);padding:10px 14px;border-radius:4px 16px 16px 16px;font-size:13px;line-height:1.7;color:#162127;max-width:85%;">你好！我是智价宝AI助手，可以为你解答估价、比价、交易、保真等问题。试试点击下方快捷问题，或直接输入你的问题。</div>
      </div>
    </div>
    <div style="padding:10px 14px;border-top:1px solid rgba(36,72,83,0.1);display:flex;flex-wrap:wrap;gap:6px;">
      <button class="ai-quick-q" data-q="怎么估价？" style="padding:6px 12px;border-radius:999px;border:1px solid rgba(36,72,83,0.15);background:rgba(255,255,255,0.6);font-size:12px;cursor:pointer;color:#244853;">怎么估价？</button>
      <button class="ai-quick-q" data-q="交易安全吗？" style="padding:6px 12px;border-radius:999px;border:1px solid rgba(36,72,83,0.15);background:rgba(255,255,255,0.6);font-size:12px;cursor:pointer;color:#244853;">交易安全吗？</button>
      <button class="ai-quick-q" data-q="支持哪些景区？" style="padding:6px 12px;border-radius:999px;border:1px solid rgba(36,72,83,0.15);background:rgba(255,255,255,0.6);font-size:12px;cursor:pointer;color:#244853;">支持哪些景区？</button>
    </div>
    <div style="padding:12px 14px;border-top:1px solid rgba(36,72,83,0.1);display:flex;gap:8px;">
      <input class="ai-chat-input" type="text" placeholder="输入你的问题..." style="flex:1;height:40px;padding:0 14px;border-radius:999px;border:1px solid rgba(36,72,83,0.18);background:rgba(255,255,255,0.7);font-size:13px;outline:none;">
      <button class="ai-chat-send" type="button" style="width:40px;height:40px;border-radius:50%;border:none;background:linear-gradient(135deg,#244853,#ab845b);color:#fff;cursor:pointer;font-size:16px;">↑</button>
    </div>
  `;
  document.body.appendChild(panel);

  /* 注入动画关键帧 */
  if (!document.getElementById("ai-assistant-keyframes")) {
    const style = document.createElement("style");
    style.id = "ai-assistant-keyframes";
    style.textContent = `
      @keyframes fabPulse {
        0%, 100% { box-shadow: 0 16px 40px rgba(36,72,83,0.32), 0 0 0 0 rgba(171,132,91,0.4); }
        50% { box-shadow: 0 16px 40px rgba(36,72,83,0.32), 0 0 0 12px rgba(171,132,91,0); }
      }
      @keyframes msgIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes typingDot {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
        30% { transform: translateY(-4px); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  let isOpen = false;
  function togglePanel(open) {
    isOpen = open !== undefined ? open : !isOpen;
    panel.style.opacity = isOpen ? "1" : "0";
    panel.style.transform = isOpen ? "translateY(0) scale(1)" : "translateY(20px) scale(0.92)";
    panel.style.pointerEvents = isOpen ? "auto" : "none";
    fab.style.transform = isOpen ? "rotate(90deg) scale(0.9)" : "";
    interactionSound.play(isOpen ? "modal" : "close");
  }

  fab.addEventListener("click", () => togglePanel());
  panel.querySelector(".ai-panel-close").addEventListener("click", () => togglePanel(false));

  /* AI回答逻辑 */
  function getAIAnswer(question) {
    const q = question.toLowerCase();
    for (const pair of QA_PAIRS) {
      if (pair.keywords.some(kw => q.includes(kw.toLowerCase()))) {
        return pair.answer;
      }
    }
    return `关于"${question}"，智价宝平台提供AI智能估价、全网透明比价、二手担保交易和景区数据反馈四大核心服务。你可以在顶部导航栏体验各项功能，或点击快捷问题了解更多。`;
  }

  function addMessage(text, isUser = false) {
    const messages = panel.querySelector(".ai-chat-messages");
    const msg = document.createElement("div");
    msg.style.cssText = `display:flex;gap:8px;align-items:flex-start;animation:msgIn 320ms ease forwards;${isUser ? "flex-direction:row-reverse;" : ""}`;
    msg.innerHTML = isUser
      ? `<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#ab845b,#a84e43);color:#fff;display:grid;place-items:center;font-size:12px;font-weight:900;flex-shrink:0;">我</div>
         <div style="background:linear-gradient(135deg,#244853,#4f827a);color:#f7f4ec;padding:10px 14px;border-radius:16px 4px 16px 16px;font-size:13px;line-height:1.7;max-width:85%;">${escapeHtml(text)}</div>`
      : `<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#244853,#ab845b);color:#fff;display:grid;place-items:center;font-size:12px;font-weight:900;flex-shrink:0;">智</div>
         <div style="background:rgba(255,255,255,0.7);padding:10px 14px;border-radius:4px 16px 16px 16px;font-size:13px;line-height:1.7;color:#162127;max-width:85%;">${escapeHtml(text)}</div>`;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    return msg;
  }

  function showTyping() {
    const messages = panel.querySelector(".ai-chat-messages");
    const typing = document.createElement("div");
    typing.className = "ai-typing-indicator";
    typing.style.cssText = "display:flex;gap:8px;align-items:center;animation:msgIn 320ms ease forwards;";
    typing.innerHTML = `
      <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#244853,#ab845b);color:#fff;display:grid;place-items:center;font-size:12px;font-weight:900;flex-shrink:0;">智</div>
      <div style="background:rgba(255,255,255,0.7);padding:12px 16px;border-radius:4px 16px 16px 16px;display:flex;gap:4px;">
        <span style="width:6px;height:6px;border-radius:50%;background:#244853;animation:typingDot 1.2s infinite;"></span>
        <span style="width:6px;height:6px;border-radius:50%;background:#244853;animation:typingDot 1.2s infinite 0.2s;"></span>
        <span style="width:6px;height:6px;border-radius:50%;background:#244853;animation:typingDot 1.2s infinite 0.4s;"></span>
      </div>`;
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
    return typing;
  }

  function sendQuestion(question) {
    if (!question.trim()) return;
    addMessage(question, true);
    const typing = showTyping();
    interactionSound.play("tap");

    window.setTimeout(() => {
      typing.remove();
      const answer = getAIAnswer(question);
      addMessage(answer, false);
      interactionSound.play("modal");
    }, 900 + Math.random() * 600);
  }

  /* 快捷问题 */
  panel.querySelectorAll(".ai-quick-q").forEach(btn => {
    btn.addEventListener("click", () => {
      sendQuestion(btn.dataset.q);
    });
  });

  /* 输入发送 */
  const input = panel.querySelector(".ai-chat-input");
  const sendBtn = panel.querySelector(".ai-chat-send");
  sendBtn.addEventListener("click", () => {
    sendQuestion(input.value);
    input.value = "";
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      sendQuestion(input.value);
      input.value = "";
    }
  });
}

/* =========================
   7. 首页数据动态脉动：数据看板数字定时微更新，模拟实时数据
   ========================= */
function initDashboardPulse() {
  if (document.body.dataset.page !== "home") return;

  const counters = $$("[data-count]");
  if (!counters.length) return;

  /* 每8秒微更新数据，模拟实时增长 */
  window.setInterval(() => {
    counters.forEach(node => {
      const current = Number(node.textContent.replace(/,/g, "")) || Number(node.dataset.count || 0);
      /* 随机微增 0-2 */
      const increment = Math.floor(Math.random() * 3);
      if (increment > 0) {
        const next = current + increment;
        node.dataset.count = String(next);
        animateNumber(node, next, 600);
      }
    });
  }, 8000);
}

/* =========================
   8. 页面预加载：悬停导航链接时预加载目标页面
   ========================= */
function initPagePreload() {
  const preloaded = new Set();
  $$("a[data-transition]").forEach(link => {
    link.addEventListener("mouseenter", () => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || preloaded.has(href)) return;
      preloaded.add(href);

      /* 预加载HTML */
      const linkEl = document.createElement("link");
      linkEl.rel = "prefetch";
      linkEl.href = href;
      linkEl.as = "document";
      document.head.appendChild(linkEl);

      /* 预加载JS和CSS */
      const jsLink = document.createElement("link");
      jsLink.rel = "prefetch";
      jsLink.href = "script.js?v=20260904a";
      jsLink.as = "script";
      document.head.appendChild(jsLink);
    });
  });
}

/* =========================
   9. 输入框聚焦增强：聚焦时父容器微光效果
   ========================= */
(function initInputGlow() {
  document.addEventListener("focusin", (event) => {
    const field = event.target.closest(".field, .select");
    if (!field) return;
    field.style.boxShadow = "inset 0 0 18px rgba(213,189,146,0.18), 0 0 0 4px rgba(120,156,143,0.12), 0 0 28px rgba(213,189,146,0.28)";
  });
  document.addEventListener("focusout", (event) => {
    const field = event.target.closest(".field, .select");
    if (!field) return;
    field.style.boxShadow = "";
  });
})();
