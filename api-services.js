/* =========================================================
   智价宝 - 外部 API 服务模块
   封装：Open-Meteo 天气 / 地理编码 / 二维码生成
   特点：纯前端可用、免费无 Key、自带 localStorage 缓存
   ========================================================= */

"use strict";

/* =========================
   景区坐标映射表（WGS84）
   ========================= */
const SCENIC_COORDINATES = {
  "故宫博物院":   { lat: 39.9163, lon: 116.3972, city: "北京" },
  "杭州西湖":     { lat: 30.2416, lon: 120.1551, city: "杭州" },
  "敦煌莫高窟":   { lat: 40.0370, lon: 94.8092,  city: "敦煌" },
  "黄山风景区":   { lat: 30.1333, lon: 118.1667, city: "黄山" },
  "平遥古城":     { lat: 37.1897, lon: 112.1764, city: "晋中" },
  "武夷山":       { lat: 27.7500, lon: 117.9500, city: "南平" },
  "大雁塔":       { lat: 34.2247, lon: 108.9628, city: "西安" },
  "丽江古城":     { lat: 26.8721, lon: 100.2296, city: "丽江" }
};

/* =========================
   WMO 天气代码映射
   ========================= */
const WEATHER_CODE_MAP = {
  0:  { label: "晴",       icon: "☀️", factor: 1.03 },
  1:  { label: "大部晴",   icon: "🌤️", factor: 1.02 },
  2:  { label: "多云",     icon: "⛅", factor: 1.01 },
  3:  { label: "阴",       icon: "☁️", factor: 0.99 },
  45: { label: "雾",       icon: "🌫️", factor: 0.97 },
  48: { label: "冻雾",     icon: "🌫️", factor: 0.95 },
  51: { label: "小毛毛雨", icon: "🌦️", factor: 0.97 },
  53: { label: "毛毛雨",   icon: "🌦️", factor: 0.96 },
  55: { label: "大毛毛雨", icon: "🌧️", factor: 0.94 },
  56: { label: "冻毛毛雨", icon: "🌧️", factor: 0.93 },
  57: { label: "强冻毛毛雨", icon: "🌧️", factor: 0.92 },
  61: { label: "小雨",     icon: "🌦️", factor: 0.96 },
  63: { label: "中雨",     icon: "🌧️", factor: 0.94 },
  65: { label: "大雨",     icon: "🌧️", factor: 0.91 },
  66: { label: "冻雨",     icon: "🌧️", factor: 0.90 },
  67: { label: "强冻雨",   icon: "🌧️", factor: 0.89 },
  71: { label: "小雪",     icon: "🌨️", factor: 0.94 },
  73: { label: "中雪",     icon: "🌨️", factor: 0.92 },
  75: { label: "大雪",     icon: "❄️", factor: 0.90 },
  77: { label: "雪粒",     icon: "❄️", factor: 0.91 },
  80: { label: "小阵雨",   icon: "🌦️", factor: 0.96 },
  81: { label: "阵雨",     icon: "🌧️", factor: 0.94 },
  82: { label: "强阵雨",   icon: "⛈️", factor: 0.90 },
  85: { label: "小阵雪",   icon: "🌨️", factor: 0.93 },
  86: { label: "强阵雪",   icon: "❄️", factor: 0.90 },
  95: { label: "雷暴",     icon: "⛈️", factor: 0.87 },
  96: { label: "雷暴伴小冰雹", icon: "⛈️", factor: 0.86 },
  99: { label: "雷暴伴大冰雹", icon: "⛈️", factor: 0.84 }
};

/* =========================
   缓存工具（自带过期时间）
   ========================= */
const APICache = {
  _prefix: "zhijiabao-api-cache-",
  _defaultTTL: 30 * 60 * 1000, /* 默认30分钟 */

  get(key) {
    try {
      const raw = localStorage.getItem(this._prefix + key);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (Date.now() > data.expireAt) {
        localStorage.removeItem(this._prefix + key);
        return null;
      }
      return data.value;
    } catch (e) {
      console.warn("[APICache] read failed:", key, e);
      return null;
    }
  },

  set(key, value, ttl = this._defaultTTL) {
    try {
      const data = { value, expireAt: Date.now() + ttl };
      localStorage.setItem(this._prefix + key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn("[APICache] write failed:", key, e);
      return false;
    }
  },

  clear() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(this._prefix))
        .forEach(k => localStorage.removeItem(k));
    } catch (e) { /* ignore */ }
  }
};

/* =========================
   安全的 fetch 封装（带超时和降级）
   ========================= */
async function safeFetch(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { ...options, signal: controller.signal });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(timer);
  }
}

/* =========================
   天气服务（Open-Meteo，免费无 Key）
   文档：https://open-meteo.com/
   ========================= */
const WeatherService = {
  /**
   * 获取景区实时天气
   * @param {string} scenic - 景区名称
   * @returns {Promise<Object>} 天气数据对象
   */
  async getCurrent(scenic) {
    const coord = SCENIC_COORDINATES[scenic];
    if (!coord) {
      console.warn("[Weather] 未找到景区坐标:", scenic);
      return null;
    }

    /* 先查缓存 */
    const cacheKey = `weather-${scenic}`;
    const cached = APICache.get(cacheKey);
    if (cached) {
      console.log("[Weather] 命中缓存:", scenic);
      return cached;
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coord.lat}&longitude=${coord.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=1`;

      const data = await safeFetch(url);
      const current = data.current || {};
      const daily = data.daily || {};
      const weatherInfo = WEATHER_CODE_MAP[current.weather_code] || { label: "未知", icon: "❓", factor: 1.0 };

      /* 温度修正因子 */
      const temp = current.temperature_2m;
      let tempFactor = 1.0;
      if (temp >= 15 && temp <= 28) tempFactor = 1.02;  /* 舒适温度，游客多 */
      else if (temp > 32 || temp < 5) tempFactor = 0.96;  /* 极端温度，游客少 */
      else if (temp > 28 && temp <= 32) tempFactor = 0.99;
      else if (temp >= 5 && temp < 15) tempFactor = 0.98;

      /* 综合天气因子 = 天气代码因子 × 温度因子 */
      const weatherFactor = Math.round(weatherInfo.factor * tempFactor * 1000) / 1000;

      const result = {
        scenic,
        city: coord.city,
        temperature: Math.round(temp),
        apparentTemp: Math.round(current.apparent_temperature ?? temp),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        windDirection: current.wind_direction_10m,
        weatherCode: current.weather_code,
        weatherLabel: weatherInfo.label,
        weatherIcon: weatherInfo.icon,
        tempMax: Math.round(daily.temperature_2m_max?.[0] ?? temp),
        tempMin: Math.round(daily.temperature_2m_min?.[0] ?? temp),
        precipProbability: daily.precipitation_probability_max?.[0] ?? 0,
        weatherFactor,
        tempFactor,
        baseFactor: weatherInfo.factor,
        fetchedAt: new Date().toISOString()
      };

      /* 写入缓存（15分钟） */
      APICache.set(cacheKey, result, 15 * 60 * 1000);
      console.log("[Weather] 获取成功:", scenic, result.weatherLabel, `${result.temperature}°C`);
      return result;
    } catch (e) {
      console.error("[Weather] 获取失败:", scenic, e.message);
      /* 降级：返回默认天气数据，不阻塞估价 */
      return {
        scenic,
        city: coord.city,
        temperature: null,
        weatherLabel: "数据获取中",
        weatherIcon: "🔄",
        weatherFactor: 1.0,
        tempFactor: 1.0,
        baseFactor: 1.0,
        isDegraded: true,
        fetchedAt: new Date().toISOString()
      };
    }
  },

  /**
   * 批量获取多个景区天气（并行）
   * @param {string[]} scenics - 景区名称数组
   */
  async getBatch(scenics) {
    const unique = [...new Set(scenics)];
    const results = await Promise.all(unique.map(s => this.getCurrent(s)));
    const map = {};
    results.forEach((r, i) => { if (r) map[unique[i]] = r; });
    return map;
  }
};

/* =========================
   地理编码服务（Open-Meteo Geocoding）
   ========================= */
const GeocodingService = {
  /**
   * 根据地名搜索坐标
   * @param {string} name - 地名
   * @returns {Promise<Object|null>}
   */
  async search(name) {
    if (!name || name.trim().length < 2) return null;

    const cacheKey = `geo-${name.trim().toLowerCase()}`;
    const cached = APICache.get(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=3&language=zh&format=json`;
      const data = await safeFetch(url);
      const results = (data.results || []).map(r => ({
        name: r.name,
        country: r.country,
        admin1: r.admin1,
        lat: r.latitude,
        lon: r.longitude,
        timezone: r.timezone
      }));
      APICache.set(cacheKey, results, 24 * 60 * 60 * 1000); /* 缓存24小时 */
      return results;
    } catch (e) {
      console.error("[Geocoding] 搜索失败:", name, e.message);
      return [];
    }
  }
};

/* =========================
   二维码服务（QRServer / goqr.me，免费无 Key）
   ========================= */
const QRCodeService = {
  /**
   * 生成二维码图片 URL
   * @param {string} text - 要编码的文本/链接
   * @param {number} size - 尺寸（px），默认 200
   * @returns {string} 二维码图片 URL
   */
  generateUrl(text, size = 200) {
    const encoded = encodeURIComponent(text);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=10&color=162127&bgcolor=ffffff`;
  },

  /**
   * 生成二维码并返回 data URL（适合离线保存）
   * @param {string} text - 要编码的文本
   * @param {number} size - 尺寸
   * @returns {Promise<string>} base64 data URL
   */
  async generateDataUrl(text, size = 200) {
    try {
      const url = this.generateUrl(text, size);
      const resp = await fetch(url);
      const blob = await resp.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("[QRCode] 生成失败:", e.message);
      return this.generateUrl(text, size); /* 降级返回URL */
    }
  }
};

/* =========================
   统一导出（挂到 window，供 script.js 调用）
   ========================= */
window.ZhijiabaoAPI = {
  SCENIC_COORDINATES,
  WEATHER_CODE_MAP,
  WeatherService,
  GeocodingService,
  QRCodeService,
  APICache,
  version: "1.0.0"
};

console.log("%c[智价宝API服务] 已加载 v1.0.0 | 天气/地理编码/二维码", "color:#4f827a;font-weight:bold;");
