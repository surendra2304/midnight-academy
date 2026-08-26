import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);

async function main() {
  const { data: users } = await supabase.from('user_roles').select('user_id').eq('role', 'admin').limit(1);
  if (users?.[0]) {
    console.log("Admin ID:", users[0].user_id);
  }
}
main();
