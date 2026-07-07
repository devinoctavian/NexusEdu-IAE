import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

import { defineConfig } from 'prisma/config';

const base = process.env.BASE_DATABASE_URL || '';
const rawUrl = process.env.AUTH_DATABASE_URL || '';
const finalUrl = rawUrl.replace('${BASE_DATABASE_URL}', base);

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: finalUrl,
  },
});
