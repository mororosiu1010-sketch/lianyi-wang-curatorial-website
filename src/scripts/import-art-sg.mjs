import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const [sourceArg, outputArg] = process.argv.slice(2);

if (!sourceArg || !outputArg) {
  throw new Error("Usage: node src/scripts/import-art-sg.mjs <source.html> <output.html>");
}

const source = await readFile(resolve(sourceArg), "utf8");
const match = source.match(/<div class="webrender">([\s\S]*?)<\/div>/);

if (!match) {
  throw new Error("Could not find the article body in the supplied page.");
}

const imageNames = [
  "02-key-visual.jpg",
  "03-art-sg.jpg",
  "04-platform.jpg",
  "05-sam.jpg",
  "06-sea-focus.jpg",
  "07-jw-projects.jpg",
  "08-tagore.jpg",
  "09-israfil-ridhwan.jpg",
  "10-sarah-choo-jing.jpg",
  "11-national-gallery.jpg",
  "12-spurs.jpg",
  "13-vanguard.jpg",
  "14-maven.jpg",
  "15-private-museum.jpg",
  "16-bank.jpg",
  "17-linseed.jpg"
];

const sectionHeadings = new Set([
  "Intro",
  "说说落幕的Art SG和SAW",
  "Art SG表现怎么样？",
  "新加坡本地的当代艺术话题",
  "艺术家和画廊的生存困境",
  "为什么我们应该警惕新加坡的当代艺术生产现状？"
]);

let imageIndex = 0;
let article = match[1]
  .replace(/<img[^>]*>/g, (tag) => {
    const alt = tag.match(/\balt="([^"]*)"/)?.[1] || "";
    const localName = imageNames[imageIndex];
    if (!localName) throw new Error("The source contains more images than expected.");
    imageIndex += 1;
    return `<img src="@@ASSET_PREFIX@@${localName}" alt="${alt}" loading="lazy" decoding="async">`;
  })
  .replace(/<span[^>]*>/g, "")
  .replace(/<\/span>/g, "")
  .replace(/\s(?:style|class|data-nimg|fetchpriority|width|height)="[^"]*"/gi, "")
  .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  .replace(/<p>\s*<strong>([^<]+)<\/strong>\s*<\/p>/g, (paragraph, title) => (
    sectionHeadings.has(title) ? `<h2>${title}</h2>` : paragraph
  ))
  .replace(/(?:<p><code>[\s\S]*?<\/code><\/p>)+/g, (quotation) => (
    `<blockquote>${quotation.replace(/<p><code>([\s\S]*?)<\/code><\/p>/g, "<p>$1</p>")}</blockquote>`
  ))
  .replace(/>\s+</g, "><")
  .trim();

if (imageIndex !== imageNames.length) {
  throw new Error(`Expected ${imageNames.length} article images, found ${imageIndex}.`);
}

await mkdir(dirname(resolve(outputArg)), { recursive: true });
await writeFile(resolve(outputArg), `${article}\n`);
