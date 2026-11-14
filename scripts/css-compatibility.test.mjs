import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

const stylesheet = fileURLToPath(new URL("../src/app/globals.css", import.meta.url));
const compiled = await postcss([tailwindcss(), autoprefixer()]).process(
  await readFile(stylesheet, "utf8"),
  { from: stylesheet },
);

test("essential portal styles do not require modern CSS parsing", () => {
  assert.deepEqual(compiled.warnings(), []);
  compiled.root.walkAtRules((rule) => {
    assert.ok(!["layer", "theme", "property", "tailwind"].includes(rule.name),
      `Unsupported or uncompiled @${rule.name} would hide styles on older phones`);
    if (rule.name === "media") {
      assert.doesNotMatch(rule.params, /(?:width|height)\s*[<>]=?/,
        "Responsive styles must use compatible min/max media queries");
    }
  });
  compiled.root.walkDecls((declaration) => {
    assert.doesNotMatch(declaration.value, /\b(?:oklch|oklab|color-mix)\(/,
      `Older browsers cannot render ${declaration.prop}: ${declaration.value}`);
  });
  compiled.root.walkRules((rule) => {
    assert.notEqual(rule.parent.type, "rule", "Native CSS nesting must be compiled away");
  });
});

test("the build includes custom styles, utility colors, spacing and responsive states", () => {
  const selectors = new Set();
  compiled.root.walkRules((rule) => selectors.add(rule.selector));
  for (const selector of [
    ":root", "body", ".home-hero", ".mobile-nav", ".flex", ".grid",
    ".size-12", ".p-6", ".bg-white", ".bg-blue-600", ".text-gray-600",
    ".shadow-sm", ".hover\\:bg-gray-50:hover", ".focus\\:ring-2:focus", ".sm\\:p-8",
  ]) {
    assert.ok(selectors.has(selector), `Missing portal style: ${selector}`);
  }
});

test("quiz widget color tokens use valid HSL channels in light and dark modes", () => {
  const tokens = new Set();
  compiled.root.walkDecls((declaration) => {
    for (const match of declaration.value.matchAll(/hsl\(var\((--[\w-]+)\)/g)) {
      tokens.add(match[1]);
    }
  });
  compiled.root.walkDecls((declaration) => {
    if (!tokens.has(declaration.prop)) return;
    assert.match(declaration.value, /^-?[\d.]+ [\d.]+% [\d.]+%$/,
      `${declaration.prop} must supply HSL channels, not RGB channels or a hex color`);
  });
});

test("mobile navigation and the testimonial gallery retain legacy viewport heights", async () => {
  const gallery = postcss.parse(await readFile(new URL(
    "../src/components/testimonials/TopScorersCarousel.module.css", import.meta.url,
  ), "utf8"));
  for (const root of [compiled.root, gallery]) {
    root.walkDecls("height", (declaration) => {
      if (!/\d[ds]vh\b/.test(declaration.value)) return;
      const fallback = declaration.prev();
      assert.equal(fallback?.prop, "height");
      assert.equal(fallback.value, declaration.value.replace(/([\d.])[ds]vh\b/g, "$1vh"),
        `Missing vh fallback for ${declaration.parent.selector}`);
    });
  }
});
