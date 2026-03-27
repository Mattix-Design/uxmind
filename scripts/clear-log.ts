import { supabase } from "./supabase-client.js";

const source = process.argv[2];

async function main() {
  if (source) {
    const { error } = await supabase
      .from("ingestion_log")
      .delete()
      .eq("source_name", source);
    console.log(error ? `Error: ${error.message}` : `Cleared ingestion log for ${source}`);
  } else {
    const { error } = await supabase
      .from("ingestion_log")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    console.log(error ? `Error: ${error.message}` : "Cleared all ingestion logs");
  }
}

main();
