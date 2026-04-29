import { defineConfig } from 'prisma/config';
import 'dotenv/config'; // Load environment variables

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});