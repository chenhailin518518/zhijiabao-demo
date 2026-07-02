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

for (const pagePath of htmlEntries) {
  const html = readFileSync(pagePath, "utf8");
  assert.doesNotMatch(
    html,
    /v=20260617b/,
    `${pagePath} should not reference the previous asset cache version`
  );
  assert.match(
    html,
    /v=20260703a/,
    `${pagePath} should reference the current asset cache version`
  );
}

assert.match(
  script,
  /function\s+assetPath\s*\(/,
  "script.js should expose an assetPath() helper so shared assets resolve correctly from nested pages"
);

assert.match(
  script,
  /<img\s+src="\$\{assetPath\(product\.image\)\}"/,
  "product cards should render images through assetPath(product.image)"
);

assert.match(
  script,
  /\$\("#detailImage"\)\.src\s*=\s*assetPath\(product\.image\)/,
  "market detail modal should render images through assetPath(product.image)"
);

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
