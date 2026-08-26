import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);

async function main() {
  const { data, error } = await supabase.from('tests').select('*').in('id', ['e1000000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000002']);
  console.log(error || data);
}
main();
