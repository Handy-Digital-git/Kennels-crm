import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabasePublicEnv = Boolean(supabaseUrl && supabaseKey);

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
	if (!hasSupabasePublicEnv) {
		return null;
	}

	if (!browserClient) {
		browserClient = createBrowserClient(supabaseUrl!, supabaseKey!);
	}

	return browserClient;
}