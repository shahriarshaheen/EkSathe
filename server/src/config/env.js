import dotenv from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const envPath = resolve(__dirname, "../../.env");

console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });
console.log('CLIENT_URL loaded as:', process.env.CLIENT_URL);