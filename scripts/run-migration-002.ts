import { supabase } from "./supabase-client.js";

async function main() {
  console.log("Running migration 002: Add impact_score columns...");

  // Add columns one at a time via rpc/raw SQL
  const { error: e1 } = await supabase.rpc("exec_sql", {
    sql: "ALTER TABLE research_entries ADD COLUMN IF NOT EXISTS impact_score NUMERIC(5,2)",
  });

  if (e1) {
    // If rpc doesn't exist, try via REST — fall back to direct column check
    console.log("RPC not available, trying alternative...");
    // Try inserting a dummy update to see if column exists
    const { error: checkErr } = await supabase
      .from("research_entries")
      .update({ impact_score: null })
      .eq("id", "00000000-0000-0000-0000-000000000000");

    if (checkErr?.message?.includes("does not exist")) {
      console.log("Column does not exist. Please run this SQL in the Supabase dashboard:");
      console.log("");
      console.log("  ALTER TABLE research_entries ADD COLUMN impact_score NUMERIC(5,2);");
      console.log("  ALTER TABLE research_entries ADD COLUMN impact_breakdown JSONB;");
      console.log("  CREATE INDEX idx_research_impact ON research_entries (impact_score DESC);");
      console.log("");
    } else {
      console.log("Column already exists or was added successfully.");
    }
    return;
  }

  console.log("✓ impact_score column added");

  const { error: e2 } = await supabase.rpc("exec_sql", {
    sql: "ALTER TABLE research_entries ADD COLUMN IF NOT EXISTS impact_breakdown JSONB",
  });
  if (e2) console.log("✗ impact_breakdown:", e2.message);
  else console.log("✓ impact_breakdown column added");

  const { error: e3 } = await supabase.rpc("exec_sql", {
    sql: "CREATE INDEX IF NOT EXISTS idx_research_impact ON research_entries (impact_score DESC)",
  });
  if (e3) console.log("✗ index:", e3.message);
  else console.log("✓ index created");

  console.log("Done.");
}

main();
