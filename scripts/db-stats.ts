import { supabase } from "./supabase-client.js";

async function stats() {
  const { count: researchCount } = await supabase
    .from("research_entries")
    .select("*", { count: "exact", head: true });

  const { count: lawsCount } = await supabase
    .from("ux_laws")
    .select("*", { count: "exact", head: true });

  const { count: mythsCount } = await supabase
    .from("debunked_myths")
    .select("*", { count: "exact", head: true });

  const { data: bySource } = await supabase
    .from("research_entries")
    .select("source_name");

  const sourceCounts: Record<string, number> = {};
  for (const row of bySource || []) {
    sourceCounts[row.source_name] = (sourceCounts[row.source_name] || 0) + 1;
  }

  const { data: byType } = await supabase
    .from("research_entries")
    .select("research_type");

  const typeCounts: Record<string, number> = {};
  for (const row of byType || []) {
    typeCounts[row.research_type] = (typeCounts[row.research_type] || 0) + 1;
  }

  console.log("UXMind Database Stats\n");
  console.log(`Research entries: ${researchCount}`);
  console.log(`UX Laws:         ${lawsCount}`);
  console.log(`Debunked Myths:  ${mythsCount}`);
  console.log(`\nBy source:`);
  for (const [source, count] of Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${source}: ${count}`);
  }
  console.log(`\nBy research type:`);
  for (const [type, count] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type}: ${count}`);
  }
}

stats();
