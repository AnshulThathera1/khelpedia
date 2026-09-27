import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
}

let _supabaseInstance = null;

function getClient() {
  if (!_supabaseInstance) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn(
        "⚠️ Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
      );
    }

    _supabaseInstance = createClient(
      supabaseUrl || "https://placeholder.supabase.co",
      supabaseKey || "placeholder-key"
    );
  }
  return _supabaseInstance;
}

export const supabase = new Proxy({}, {
  get(target, prop) {
    const instance = getClient();
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});


