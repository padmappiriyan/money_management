import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env before any other app modules read process.env
dotenv.config({ path: path.join(__dirname, '../.env') });
