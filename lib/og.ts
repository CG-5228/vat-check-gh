import { readFile } from 'node:fs/promises';
import path from 'node:path';
export async function ogFonts() {
  const fonts = await Promise.all(
    ([400, 600] as const).map(async (weight) => ({
      name: 'Instrument Sans',
      data: new Uint8Array(
        await readFile(
          path.join(
            process.cwd(),
            'node_modules/@fontsource/instrument-sans/files',
            `instrument-sans-latin-${weight}-normal.woff`,
          ),
        ),
      ).buffer,
      weight,
      style: 'normal' as const,
    })),
  );
  return fonts;
}
