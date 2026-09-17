import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const script = readFileSync("script.js", "utf8");
const styles = readFileSync("styles.css", "utf8");

const pages = [
  ["index.html", "assets/img/favicon.svg"],
  ["estimate/index.html", "../assets/img/favicon.svg"],
  ["compare/index.html", "../assets/img/favicon.svg"],
  ["market/index.html", "../assets/img/favicon.svg"],
  ["profile/index.html", "../assets/img/favicon.svg"]
];

const htmlEntries = [
  "index.html",
  "estimate.html",
  "compare.html",
  "market.html",
  "profile.html",
  "estimate/index.html",
  "compare/index.html",
  "market/index.html",
  "profile/index.html"
];

/* 每个页面都必须引用这三个共享资源，且版本号全站一致 */
const sharedAssets = ["styles.css", "api-services.js", "script.js"];

/* 外壳页面 <-> 同名子目录页面，内容必须一致 */
const mirrorPairs = [
  ["estimate.html", "estimate/index.html"],
  ["compare.html", "compare/index.html"],
  ["market.html", "market/index.html"],
  ["profile.html", "profile/index.html"]
];

assert.ok(
  existsSync("assets/img/favicon.svg"),
  "site should include an explicit favicon asset"
);

for (const [pagePath, faviconPath] of pages) {
  const html = readFileSync(pagePath, "utf8");
  assert.match(
    html,
    new RegExp(`<link\\s+rel="icon"\\s+href="${faviconPath.replaceAll("/", "\\/")}"\\s+type="image\\/svg\\+xml">`),
    `${pagePath} should point to the shared SVG favicon`
  );
}

/* --- 资源引用与版本号一致性 --- */

const versionByAsset = new Map(sharedAssets.map((asset) => [asset, new Map()]));

for (const pagePath of htmlEntries) {
  const html = readFileSync(pagePath, "utf8");
  for (const asset of sharedAssets) {
    const escaped = asset.replaceAll(".", "\\.");
    const match = html.match(new RegExp(`["'/]${escaped}\\?v=([0-9a-z]+)`));
    assert.ok(
      match,
      `${pagePath} should reference ${asset} with a cache-busting version (?v=...)`
    );
    versionByAsset.get(asset).set(pagePath, match[1]);
  }
}

for (const asset of sharedAssets) {
  const entries = [...versionByAsset.get(asset).entries()];
  const distinct = [...new Set(entries.map(([, version]) => version))];
  assert.equal(
    distinct.length,
    1,
    `${asset} is referenced with ${distinct.length} different versions; ` +
      `every page must agree: ${entries.map(([page, v]) => `${page}=${v}`).join(", ")}`
  );
}

/* --- 外壳页面与子目录页面必须同步 ---
   子目录页面是外壳页面的副本，只允许相对路径前缀不同。
   历史上这两份曾经长期不同步（天气模块、二维码分享只加到了外壳页面），
   这条断言就是为了让这种漂移当场暴露出来。 */

function normalizeMirror(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replaceAll('href="./"', 'href=""')
    .replaceAll('"../', '"')
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

for (const [outerPath, subPath] of mirrorPairs) {
  const outerLines = normalizeMirror(readFileSync(outerPath, "utf8"));
  const subLines = normalizeMirror(readFileSync(subPath, "utf8"));
  assert.deepEqual(
    subLines,
    outerLines,
    `${subPath} is out of sync with ${outerPath}; ` +
      "keep the two copies identical apart from their relative path prefix"
  );
}

/* --- 共享资源路径工具 --- */

assert.match(
  script,
  /function\s+assetPath\s*\(/,
  "script.js should expose an assetPath() helper so shared assets resolve correctly from nested pages"
);

assert.match(
  script,
  /<img\s+src="\$\{assetPath\([\w.]+\)\}"/,
  "product cards should render images through assetPath() so nested pages resolve them"
);

assert.match(
  script,
  /\.src\s*=\s*assetPath\([\w.]+\)/,
  "market detail modal should render images through assetPath()"
);

assert.doesNotMatch(
  script,
  /<img\s+src="assets\//,
  "script.js should route every image through assetPath() instead of hardcoding a relative path"
);

/* --- 移动端样式规则 --- */

assert.match(
  script,
  /matchMedia\?\.\("\(max-width:\s*720px\)"\)\.matches/,
  "mobile home headline should keep plain text instead of running split-character animation"
);

assert.match(
  styles,
  /@media\s*\(max-width:\s*720px\)[\s\S]*\.hero-title\s*\{[\s\S]*overflow:\s*visible/,
  "mobile hero title should not clip overflowing split text"
);

assert.match(
  styles,
  /@media\s*\(max-width:\s*720px\)[\s\S]*\.hero-title\s+\.char\s*\{[\s\S]*display:\s*inline/,
  "mobile hero title characters should flow inline for natural wrapping"
);

assert.match(
  styles,
  /@media\s*\(max-width:\s*720px\)[\s\S]*\.hero-inner\s*\{[\s\S]*padding:\s*0\s+16px/,
  "mobile hero content should keep a readable horizontal safe area"
);

assert.match(
  styles,
  /@media\s*\(max-width:\s*720px\)[\s\S]*\.shine-text::after\s*\{[\s\S]*display:\s*none/,
  "mobile hero title should disable the sweeping shine layer to avoid hidden horizontal overflow"
);

console.log("Smoke checks passed");
