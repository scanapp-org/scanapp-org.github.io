const fs = require("fs");

const source = process.argv[2] || "assets/css/scanapp-v2.css";
const destination = process.argv[3] || "assets/css/scanapp-v2.min.css";
const css = fs.readFileSync(source, "utf8");

const noSpaceBefore = new Set(["{", "}", ":", ";", ",", ">", "~", ")"]);
const noSpaceAfter = new Set(["{", ":", ";", ">", "~", "("]);

let output = "";
let quote = "";
let pendingSpace = false;
let inComment = false;
let escaped = false;

for (let i = 0; i < css.length; i += 1) {
  const char = css[i];
  const next = css[i + 1];

  if (inComment) {
    if (char === "*" && next === "/") {
      inComment = false;
      i += 1;
    }
    continue;
  }

  if (quote) {
    output += char;
    if (escaped) {
      escaped = false;
    } else if (char === "\\") {
      escaped = true;
    } else if (char === quote) {
      quote = "";
    }
    continue;
  }

  if (char === "/" && next === "*") {
    inComment = true;
    i += 1;
    continue;
  }

  if (char === "\"" || char === "'") {
    if (pendingSpace && output && !noSpaceAfter.has(output[output.length - 1])) {
      output += " ";
    }
    pendingSpace = false;
    quote = char;
    output += char;
    continue;
  }

  if (/\s/.test(char)) {
    pendingSpace = true;
    continue;
  }

  if (noSpaceBefore.has(char)) {
    output = output.replace(/\s+$/, "");
    output += char;
    pendingSpace = false;
    continue;
  }

  if (pendingSpace && output && !noSpaceAfter.has(output[output.length - 1])) {
    output += " ";
  }

  output += char;
  pendingSpace = false;
}

output = output.trim().replace(/;}/g, "}");
fs.writeFileSync(destination, `${output}\n`);

console.log(`Minified ${source} -> ${destination}`);
