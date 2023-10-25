import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const staticPath = join(dirname(fileURLToPath(import.meta.url)), 'src');
