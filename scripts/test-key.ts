import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const result = config({ path: resolve(__dirname, "../.env"), override: true });

console.log("dotenv parsed keys:", Object.keys(result.parsed || {}));
console.log("ANTHROPIC_API_KEY starts with:", process.env.ANTHROPIC_API_KEY?.slice(0, 15) || "NOT SET");
console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) || "NOT SET");
