const fs = require("fs");
const content = fs.readFileSync(
  "background_dither_dilution_fridge_nextjs_webl.js",
  "utf8"
);
const match = content.match(
  /const EMBEDDED_IMAGE = "(data:image\/webp;base64,[^"]+)"/
);
if (!match) {
  console.error("Could not find EMBEDDED_IMAGE");
  process.exit(1);
}
const base64 = match[1].split(",")[1];
fs.writeFileSync("public/hero.webp", Buffer.from(base64, "base64"));
console.log("wrote", fs.statSync("public/hero.webp").size, "bytes");
