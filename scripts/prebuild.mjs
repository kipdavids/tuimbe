// 1) Builds public/data/index.json from every file in public/data/collections  2) Renders PNG icons from icon.svg
import fs from "node:fs"; import path from "node:path"; import sharp from "sharp";
const dir = "public/data/collections";
const index = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((file) => {
  const j = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  return { id: j.id ?? file.replace(/\.json$/, ""), file };
});
fs.writeFileSync("public/data/index.json", JSON.stringify(index, null, 2));
const svg = fs.readFileSync("public/icons/icon.svg");
for (const [name, size] of [["icon-192", 192], ["icon-512", 512], ["apple-touch-icon", 180], ["favicon", 48]])
  await sharp(svg).resize(size, size).png().toFile(`public/icons/${name}.png`);
await sharp(svg).resize(400, 400).extend({ top: 56, bottom: 56, left: 56, right: 56, background: "#1E40AF" }).png().toFile("public/icons/maskable-512.png");
console.log(`Indexed ${index.length} collection(s), icons generated.`);
