import fs from 'fs';
import path from 'path';

const SOURCE_ROOT = path.resolve(process.cwd(), 'src');
const ALLOWED_FILE = path.resolve(SOURCE_ROOT, 'lib/haptics.ts');
const HAPTICS_IMPORT_PATTERN = /from\s+['"]expo-haptics['"]/;

function collectSourceFiles(dir: string, out: string[]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') continue;
      collectSourceFiles(fullPath, out);
      continue;
    }

    if (!fullPath.endsWith('.ts') && !fullPath.endsWith('.tsx')) continue;
    out.push(fullPath);
  }
}

describe('haptics import guard', () => {
  it('only allows expo-haptics import in src/lib/haptics.ts', () => {
    const files: string[] = [];
    collectSourceFiles(SOURCE_ROOT, files);

    const offenders = files.filter((file) => {
      if (path.resolve(file) === ALLOWED_FILE) return false;
      const contents = fs.readFileSync(file, 'utf8');
      return HAPTICS_IMPORT_PATTERN.test(contents);
    });

    expect(offenders).toEqual([]);
  });
});
