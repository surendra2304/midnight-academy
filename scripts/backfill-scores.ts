import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);

async function main() {
    const ids = [
        "5515d49b-b847-46b5-9dee-49fe551914da",
        "16d9d2a6-00c6-4a93-a871-52dc5694abd8",
        "63a8daa8-3bbf-4b85-a909-3489a99cfed5"
    ];
    
    // Quick script to calculate and update score
    for (const id of ids) {
        const { data: answers } = await supabase.from("attempt_answers").select("score").eq("attempt_id", id);
        if (answers && answers.length > 0) {
            const valid = answers.filter(a => typeof a.score === 'number');
            const overall = valid.length ? Math.round((valid.reduce((sum, r) => sum + r.score, 0) / valid.length) * 10) : 0;
            
            await supabase.from("attempts").update({
                score: overall,
                status: "evaluated"
            }).eq("id", id);
            console.log(`Updated ${id} to ${overall}`);
        } else {
             await supabase.from("attempts").update({
                score: 0,
                status: "evaluated"
            }).eq("id", id);
            console.log(`Updated ${id} to 0`);
        }
    }
}
main();
