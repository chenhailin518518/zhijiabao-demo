/*
  智价宝官网 - 原生 JavaScript 交互
  说明：全部数据均为静态数据，不连接后端、数据库或外部接口。
*/

const DATA = {
  products: [
    {
      id: "fan",
      name: "故宫云纹折扇",
      scenic: "故宫博物院",
      category: "北京",
      image: "assets/img/product-fan.png",
      condition: "95新",
      official: 168,
      low: 92,
      market: 118,
      seller: "澄禾",
      tag: "限定联名",
      desc: "宫廷云纹扇面，适合收藏和夏季旅拍，近三日热度上升 18%。"
    },
    {
      id: "cup",
      name: "西湖荷影陶瓷杯",
      scenic: "杭州西湖",
      category: "杭州",
      image: "assets/img/product-cup.png",
      condition: "9成新",
      official: 128,
      low: 58,
      market: 76,
      seller: "湖畔旧物",
      tag: "实用文创",
      desc: "青釉杯身与荷影纹样，适合作为伴手礼，二手成交速度较快。"
    },
    {
      id: "bookmark",
      name: "敦煌飞天金属书签",
      scenic: "莫高窟",
      category: "敦煌",
      image: "assets/img/product-bookmark.png",
      condition: "全新尾货",
      official: 69,
      low: 36,
      market: 44,
      seller: "鸣沙商铺",
      tag: "商户尾货",
      desc: "轻薄金属材质，适合批量清仓，平台建议活动价 39-45 元。"
    },
    {
      id: "pin",
      name: "黄山迎客松徽章",
      scenic: "黄山风景区",
      category: "黄山",
      image: "assets/img/product-pin.png",
      condition: "95新",
      official: 45,
      low: 22,
      market: 29,
      seller: "山行者",
      tag: "轻收藏",
      desc: "小件高频交易商品，适合作为游客离园后的二次流转入口。"
    },
    {
      id: "tea",
      name: "武夷山岩茶纪念罐",
      scenic: "武夷山",
      category: "福建",
      image: "assets/img/product-tea.png",
      condition: "8成新",
      official: 198,
      low: 88,
      market: 119,
      seller: "岩骨花香",
      tag: "礼盒周边",
      desc: "茶罐包装完整但有轻微磨痕，适合展示收藏和低价捡漏。"
    },
    {
      id: "sachet",
      name: "平遥古城香囊",
      scenic: "平遥古城",
      category: "山西",
      image: "assets/img/product-sachet.png",
      condition: "全新",
      official: 59,
      low: 31,
      market: 38,
      seller: "古城手作",
      tag: "非遗手作",
      desc: "刺绣纹样保存良好，适合节庆活动和校园文创交换场。"
    },
    {
      id: "bell",
      name: "大雁塔祈福铜铃",
      scenic: "大雁塔",
      category: "西安",
      image: "assets/img/product-bell.png",
      condition: "9成新",
      official: 108,
      low: 55,
      market: 72,
      seller: "长安慢递",
      tag: "祈福纪念",
      desc: "铜色光泽自然，平台相似商品近期成交价集中在 68-79 元。"
    },
    {
      id: "postcard",
      name: "丽江古城手绘明信片",
      scenic: "丽江古城",
      category: "云南",
      image: "assets/img/product-postcard.png",
      condition: "全新尾货",
      official: 35,
      low: 18,
      market: 24,
      seller: "木府文创",
      tag: "清仓组合",
      desc: "套装余量较多，适合商户清仓和游客拼单购买。"
    }
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

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const interactionSound = (() => {
  let audioContext = null;
  let masterGain = null;
  let lastPlay = 0;

  const presets = {
    tap: { from: 540, to: 690, duration: 0.12, volume: 0.026 },
    page: { from: 360, to: 250, duration: 0.18, volume: 0.024 },
    modal: { from: 420, to: 760, duration: 0.22, volume: 0.03 },
    close: { from: 430, to: 280, duration: 0.12, volume: 0.022 },
    theme: { from: 520, to: 860, duration: 0.24, volume: 0.028 }
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
      audioContext.resume();
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

document.addEventListener("DOMContentLoaded", () => {
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

  const page = document.body.dataset.page;
  if (page === "home") initHome();
  if (page === "estimate") initEstimator();
  if (page === "compare") initCompare();
  if (page === "market") initMarket();
  if (page === "profile") initProfile();
});

/* =========================
   初始骨架屏：资源加载完成后平滑淡出
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
   主题切换：浅色国风 / 深色国风
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

  const saved = localStorage.getItem(storageKey);
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));

  button?.addEventListener("click", () => {
    const next = document.body.classList.contains("theme-dark") ? "light" : "dark";
    localStorage.setItem(storageKey, next);
    applyTheme(next, true);
    interactionSound.play("theme");
  });
}

/* =========================
   轻量音效：按钮、弹窗、页面切换统一反馈
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
   鼠标跟随微光：桌面端渐变光轨
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

  window.addEventListener("pointerleave", () => {
    visible = false;
  });

  requestAnimationFrame(animate);
}

/* =========================
   全局粒子背景：轻量国风漂浮粒子
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
  window.addEventListener("resize", resize);
  window.addEventListener("beforeunload", () => cancelAnimationFrame(rafId));
}

/* =========================
   全局路由切换转场
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
      window.setTimeout(() => {
        window.location.href = href;
      }, 430);
    });
  });
}

/* =========================
   顶部导航：滚动收缩、视差变量
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
  window.addEventListener("scroll", update, { passive: true });
}

/* =========================
   滚动渐显：顺序延迟入场
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
    ? `<div class="seller-row"><span class="avatar">${product.seller.slice(0, 1)}</span><span>${product.seller}</span><strong>¥${product.market}</strong></div>`
    : "";

  return `
    <article class="product-card ${mode === "home" ? "float-loop" : ""}" data-id="${product.id}">
      <div class="product-image"><img src="${product.image}" alt="${product.name}"></div>
      <div class="product-body">
        <div class="tag-row">
          <span class="tag">${product.scenic}</span>
          <span class="price-chip">¥${product.market}</span>
        </div>
        <h3>${product.name}</h3>
        <p class="muted">${product.desc}</p>
        ${sources}
        ${seller}
        <div class="hover-float">${product.condition} · ${product.tag} · 智价宝建议价 ¥${product.market}</div>
      </div>
    </article>
  `;
}

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
   AI 智能估价页
   ========================= */
function initEstimator() {
  const upload = $("#uploadZone");
  const file = $("#imageUpload");
  const preview = $("#uploadPreview");
  const button = $("#estimateBtn");
  const progress = $("#progressPanel");
  const fill = $("#progressFill");
  const modal = $("#resultModal");
  const close = $("#closeResult");

  upload?.addEventListener("click", () => file?.click());
  file?.addEventListener("change", () => {
    const selected = file.files?.[0];
    if (!selected) return;
    preview.src = URL.createObjectURL(selected);
    upload.classList.add("has-image");
  });

  button?.addEventListener("click", () => {
    const original = Number($("#originalPrice")?.value || 168);
    const condition = $("[name='condition']:checked")?.value || "95";
    const factorMap = { "100": 0.78, "95": 0.68, "90": 0.58, "80": 0.43 };
    const factor = factorMap[condition] || 0.62;
    const scenicBonus = ($("#scenicSelect")?.value || "").includes("故宫") ? 1.08 : 1;
    const result = Math.max(18, Math.round(original * factor * scenicBonus));

    progress?.classList.add("is-active");
    fill.style.width = "0%";
    button.disabled = true;

    let current = 0;
    const timer = window.setInterval(() => {
      current += 7 + Math.random() * 15;
      fill.style.width = `${Math.min(current, 100)}%`;
      if (current >= 100) {
        window.clearInterval(timer);
        window.setTimeout(() => {
          button.disabled = false;
          progress?.classList.remove("is-active");
          openEstimateModal(result, original);
        }, 380);
      }
    }, 150);
  });

  close?.addEventListener("click", () => closeModal(modal));
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeModal(modal);
  });
}

function openEstimateModal(value, original) {
  const modal = $("#resultModal");
  const number = $("#priceNumber");
  const lines = $("#resultLines");
  const grid = $("#valuationGrid");
  if (!modal || !number || !lines) return;

  number.textContent = "0";
  const condition = $("[name='condition']:checked")?.parentElement?.textContent.trim() || "95新";
  const scenic = $("#scenicSelect")?.value || "示范景区";
  const minPrice = Math.max(12, value - 18);
  const maxPrice = value + 24;
  const listing = value + 8;

  if (grid) {
    grid.innerHTML = `
      <div class="valuation-item"><span>原价折损</span><strong>${Math.round((value / original) * 100)}%</strong></div>
      <div class="valuation-item"><span>品相系数</span><strong>${condition}</strong></div>
      <div class="valuation-item"><span>景区热度</span><strong>${scenic.includes("故宫") ? "高热" : "稳中上升"}</strong></div>
      <div class="valuation-item"><span>成交区间</span><strong>¥${minPrice}-¥${maxPrice}</strong></div>
    `;
  }

  lines.innerHTML = `
    <p style="animation-delay: 120ms">官方原价 ¥${original}，结合品相折旧、景区热度和同类成交样本生成建议价。</p>
    <p style="animation-delay: 240ms">同景区相似文创近 7 日成交区间集中在 ¥${minPrice} - ¥${maxPrice}。</p>
    <p style="animation-delay: 360ms">建议上架价可设置为 ¥${listing}，预留小幅议价空间；急售可下调至 ¥${Math.max(10, value - 10)}。</p>
  `;
  modal.classList.add("is-open");
  interactionSound.play("modal");
  animateNumber(number, value, 900);
}

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
   全网比价页
   ========================= */
function initCompare() {
  const list = $("#compareList");
  const search = $("#compareSearch");
  const range = $("#priceRange");
  const rangeText = $("#rangeText");
  let activeCategory = "全部";

  function render() {
    if (!list) return;
    list.classList.add("is-switching");
    window.setTimeout(() => {
      const keyword = (search?.value || "").trim();
      const maxPrice = Number(range?.value || 220);
      const filtered = DATA.products.filter((p) => {
        const matchCategory = activeCategory === "全部" || p.category === activeCategory || p.scenic.includes(activeCategory);
        const matchKeyword = !keyword || `${p.name}${p.scenic}${p.tag}`.includes(keyword);
        return matchCategory && matchKeyword && p.market <= maxPrice;
      });
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

  search?.addEventListener("input", () => {
    search.closest(".search-box")?.classList.add("is-typing");
    window.clearTimeout(search._typingTimer);
    search._typingTimer = window.setTimeout(() => search.closest(".search-box")?.classList.remove("is-typing"), 360);
    render();
  });

  range?.addEventListener("input", () => {
    rangeText.textContent = `¥${range.value} 以下`;
    render();
  });

  render();
}

/* =========================
   二手交易集市页
   ========================= */
function initMarket() {
  const list = $("#marketList");
  const segment = $("#marketSegment");
  const detail = $("#detailModal");
  const publishModal = $("#publishModal");
  let mode = "personal";
  let renderCount = 6;
  const userItems = [];

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
  window.addEventListener("scroll", () => {
    if (loadingMore || document.body.dataset.page !== "market") return;
    const nearBottom = window.innerHeight + window.scrollY > document.body.offsetHeight - 380;
    if (!nearBottom || renderCount >= 15) return;
    loadingMore = true;
    window.setTimeout(() => {
      renderCount += 3;
      render(true);
      loadingMore = false;
    }, 380);
  }, { passive: true });

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
    const expected = Number($("#publishPrice")?.value || 49);
    const original = Number($("#publishOriginal")?.value || 88);
    const scenic = $("#publishScenic")?.value || "故宫博物院";
    const item = {
      id: `user-${Date.now()}`,
      name: $("#publishName")?.value.trim() || "新发布文旅闲置",
      scenic,
      category: scenic.slice(0, 2),
      image: "assets/img/product-pin.png",
      condition: "95新",
      official: original,
      low: Math.max(9, expected - 12),
      market: expected,
      seller: "我",
      tag: "刚刚发布",
      desc: $("#publishDesc")?.value.trim() || "包装完整，支持平台担保交易。"
    };
    userItems.unshift(item);
    mode = "personal";
    segment.dataset.active = "personal";
    $$("button[data-mode]", segment).forEach((btn) => btn.classList.toggle("active", btn.dataset.mode === "personal"));
    renderCount = Math.max(renderCount, 6);
    render(true);
    closeModal(publishModal);
    showToast("发布成功：商品已加入个人闲置列表");
  });

  render();
}

function openMarketDetail(product, modal) {
  if (!modal) return;
  $("#detailTitle").textContent = product.name;
  $("#detailImage").src = product.image;
  $("#detailMeta").innerHTML = `
    <span class="tag">${product.scenic}</span>
    <span class="tag">${product.condition}</span>
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
    card.setPointerCapture(event.pointerId);
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
}

function showToast(message) {
  const old = $(".publish-toast");
  old?.remove();
  const toast = document.createElement("div");
  toast.className = "publish-toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  interactionSound.play("modal");
  window.setTimeout(() => toast.remove(), 2500);
}

/* =========================
   个人中心页
   ========================= */
function initProfile() {
  const login = $("#loginCard");
  const loginBtn = $("#loginBtn");
  const records = $("#estimateRecords");
  const posts = $("#postRecords");

  if (records) {
    records.innerHTML = DATA.records.map((row) => recordRow(row)).join("");
  }
  if (posts) {
    posts.innerHTML = DATA.posts.map((row) => recordRow(row)).join("");
  }

  loginBtn?.addEventListener("click", () => {
    login.classList.add("loading");
    window.setTimeout(() => {
      login.classList.remove("loading");
      $("#loginStatus").textContent = "已登录：陈海林 · 智价宝项目队长";
    }, 900);
  });
}

function recordRow([title, status, time]) {
  return `
    <div class="record-row">
      <div>
        <strong>${title}</strong>
        <div class="muted">${time}</div>
      </div>
      <span class="tag">${status}</span>
    </div>
  `;
}
