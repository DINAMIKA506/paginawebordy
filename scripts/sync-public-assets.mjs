import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const repositoryAssetBase =
  "https://raw.githubusercontent.com/DINAMIKA506/paginawebordy/main";

const assets = {
  "hero-main.png": "public/brand/hero-main.png",
  "Ordy_con_agenda.png": "public/brand/ordy-agenda.png",
  "ordy-leyendo.png": "public/brand/ordy-leyendo.png",
  "ordy-logo.png": "public/brand/ordy-logo.png",
  "cabu.png": "public/characters/cabu.png",
  "carey.png": "public/characters/carey.png",
  "glau.png": "public/characters/glau.png",
  "lumi.png": "public/characters/lumi.png",
  "marty.png": "public/characters/marty.png",
  "navi.png": "public/characters/navi.png",
  "ordy.png": "public/characters/ordy.png",
  "pepe.png": "public/characters/pepe.png",
  "regi.png": "public/characters/regi.png",
  "favicon.png": "public/favicon.png",
  "cabu-tool.png": "public/tools/cabu.png",
  "char-glau.png": "public/tools/glau.png",
  "regi-tool.png": "public/tools/regi.png",
};

await Promise.all(
  Object.entries(assets).map(async ([source, destination]) => {
    const target = join(process.cwd(), destination);
    await mkdir(dirname(target), { recursive: true });

    try {
      await copyFile(join(process.cwd(), source), target);
    } catch {
      const response = await fetch(
        `${repositoryAssetBase}/${encodeURIComponent(source)}`,
      );

      if (!response.ok) {
        throw new Error(`Unable to load Ordy asset: ${source}`);
      }

      await writeFile(target, Buffer.from(await response.arrayBuffer()));
    }
  }),
);
