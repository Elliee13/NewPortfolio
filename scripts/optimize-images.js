const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const IMAGE_ROOT = path.join(process.cwd(), "assets", "img");
const SUPPORTED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);
const PHOTO_HINTS = ["apparel", "about", "profile", "perfil", "skill", "vercel"];

function walk(dir) {
  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();

    if (!SUPPORTED_EXTENSIONS.has(extension)) {
      continue;
    }

    if (entry.name.endsWith(".webp") || entry.name.endsWith("-sm.webp")) {
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return `${(bytes / 1024).toFixed(1)} KB`;
}

function toWebpPath(filePath, suffix = "") {
  const extension = path.extname(filePath);
  return filePath.replace(new RegExp(`${extension}$`, "i"), `${suffix}.webp`);
}

function looksPhotographic(filePath) {
  const normalized = filePath.toLowerCase();
  return PHOTO_HINTS.some((hint) => normalized.includes(hint));
}

async function ensureWebp(sourcePath, targetPath, width, quality) {
  if (fs.existsSync(targetPath)) {
    return {
      path: targetPath,
      bytes: fs.statSync(targetPath).size,
      skipped: true,
    };
  }

  let pipeline = sharp(sourcePath, { animated: false }).rotate();

  if (width) {
    pipeline = pipeline.resize({ width, withoutEnlargement: true });
  }

  await pipeline.webp({ quality }).toFile(targetPath);

  return {
    path: targetPath,
    bytes: fs.statSync(targetPath).size,
    skipped: false,
  };
}

async function optimizeImage(sourcePath) {
  const metadata = await sharp(sourcePath).metadata();
  const originalBytes = fs.statSync(sourcePath).size;
  const quality = looksPhotographic(sourcePath) ? 82 : 90;
  const fullPath = toWebpPath(sourcePath);
  const mobilePath = toWebpPath(sourcePath, "-sm");
  const mobileWidth = metadata.width ? Math.max(1, Math.round(metadata.width / 2)) : undefined;

  const full = await ensureWebp(sourcePath, fullPath, undefined, quality);
  const mobile = await ensureWebp(sourcePath, mobilePath, mobileWidth, quality);

  const newBytes = full.bytes + mobile.bytes;
  const savedBytes = Math.max(0, originalBytes - newBytes);
  const savedPercent = originalBytes > 0 ? ((savedBytes / originalBytes) * 100).toFixed(1) : "0.0";

  return {
    sourcePath,
    originalBytes,
    newBytes,
    savedBytes,
    savedPercent,
    quality,
    skipped: full.skipped && mobile.skipped,
  };
}

async function main() {
  if (!fs.existsSync(IMAGE_ROOT)) {
    console.error(`Image directory not found: ${IMAGE_ROOT}`);
    process.exit(1);
  }

  const files = walk(IMAGE_ROOT);

  if (!files.length) {
    console.log("No PNG/JPG images found under assets/img.");
    return;
  }

  const results = [];

  for (const file of files) {
    results.push(await optimizeImage(file));
  }

  const totals = results.reduce(
    (acc, item) => {
      acc.originalBytes += item.originalBytes;
      acc.newBytes += item.newBytes;
      acc.savedBytes += item.savedBytes;
      acc.converted += item.skipped ? 0 : 1;
      return acc;
    },
    { originalBytes: 0, newBytes: 0, savedBytes: 0, converted: 0 }
  );

  console.table(
    results.map((item) => ({
      file: path.relative(process.cwd(), item.sourcePath).replace(/\\/g, "/"),
      quality: item.quality,
      original: formatBytes(item.originalBytes),
      webpSet: formatBytes(item.newBytes),
      saved: `${item.savedPercent}%`,
      status: item.skipped ? "Skipped" : "Converted",
    }))
  );

  const totalSavedPercent =
    totals.originalBytes > 0 ? ((totals.savedBytes / totals.originalBytes) * 100).toFixed(1) : "0.0";

  console.log("");
  console.log(`Processed ${results.length} images (${totals.converted} converted, ${results.length - totals.converted} skipped).`);
  console.log(
    `Total size: ${formatBytes(totals.originalBytes)} -> ${formatBytes(totals.newBytes)} (${totalSavedPercent}% saved).`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
