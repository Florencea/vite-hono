import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir =
  typeof __dirname !== "undefined" ? __dirname : dirname(fileURLToPath(import.meta.url));

const readText = (relPath: string, fallback = "") => {
  try {
    return readFileSync(join(currentDir, relPath), "utf-8");
  } catch {
    return fallback;
  }
};

export const openapiDescription = readText(
  "description.md",
  "- All datetime string use ISO8601 `2023-07-30T14:00:30.590Z`",
);

export const customCss = readText("assets/custom.css");
export const themeCss = readText("assets/theme.css");
export const cookieCss = readText("assets/cookie.css");
export const customScript = readText("assets/custom.js");

export const openapiStyles = `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap');

html {
  box-sizing: border-box;
  overflow: -moz-scrollbars-vertical;
  overflow-y: scroll;
}

*, *:before, *:after {
  box-sizing: inherit;
}

body {
  margin: 0;
  background: #fafafa;
  font-feature-settings: "calt", "dlig", "ss01", "cv05", "cv08", "tnum", "opsz";
}

html.dark-mode,
html.dark-mode body {
  background: #1c2022;
  color: #e4e6e6;
}

${cookieCss}
${customCss}
${themeCss}
`;
