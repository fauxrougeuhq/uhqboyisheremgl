import { mkdir, readFile, writeFile } from "node:fs/promises";

const channelId = process.env.YT_CHANNEL_ID || "UCd9ThgV9m9ksRpLVit9JS3w";
const apiKey = process.env.YT_API_KEY;
const outputPath = process.env.YT_OUTPUT_PATH || "data/youtube-subs.json";

if (!apiKey) {
  throw new Error("Missing YT_API_KEY. Add it as a GitHub Actions secret.");
}

const url = new URL("https://www.googleapis.com/youtube/v3/channels");
url.searchParams.set("part", "statistics");
url.searchParams.set("id", channelId);
url.searchParams.set("key", apiKey);

const res = await fetch(url, { cache: "no-store" });
if (!res.ok) {
  throw new Error(`YouTube API error: ${res.status}`);
}

const json = await res.json();
const countRaw = json.items?.[0]?.statistics?.subscriberCount;
const subscriberCount = Number(countRaw);

if (!Number.isFinite(subscriberCount)) {
  throw new Error("Could not read subscriberCount from YouTube API response.");
}

let previousCount = null;
try {
  const previous = JSON.parse(await readFile(outputPath, "utf8"));
  previousCount = Number(previous?.subscriberCount);
} catch {
  previousCount = null;
}

if (Number.isFinite(previousCount) && previousCount === subscriberCount) {
  console.log(`No change (${subscriberCount}), skipping file update.`);
  process.exit(0);
}

await mkdir("data", { recursive: true });

const payload = {
  channelId,
  subscriberCount,
  updatedAt: new Date().toISOString()
};

await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Updated ${outputPath} -> ${subscriberCount}`);
