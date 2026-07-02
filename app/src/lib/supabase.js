import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sin env vars la app funciona igual; solo se desactiva la impresión remota.
export const supabase = url && key ? createClient(url, key) : null;
