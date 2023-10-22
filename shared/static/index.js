import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export const staticPath = join(dirname(fileURLToPath(import.meta.url)), 'src');
