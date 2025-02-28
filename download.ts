import * as fs from "node:fs";

fs.mkdirSync("images", { recursive: true });

const imgUrl = (step: string) =>
  `https://cdn.shopify.com/s/files/1/0655/4127/5819/files/rotating_sweatshirt_${step}.webp?v=1740686102?width=1600&height=900&crop=center`;

for (let i = 1; i <= 60; i++) {
  const step = i.toString().padStart(4, "0");
  const url = imgUrl(step);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download image ${step}`);
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(`./images/${step}.webp`, Buffer.from(buffer));
  process.stdout.write(".");
}
console.log(" Download complete");
