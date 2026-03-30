/**
 * UXMind Broken Link Fixer
 *
 * Updates source_url values in research_entries where the original URL
 * has been verified as broken (404) and a specific replacement has been found.
 *
 * Run with: npx tsx scripts/fix-broken-links.ts
 * Dry run:  npx tsx scripts/fix-broken-links.ts --dry-run
 */

import { supabase } from "./supabase-client.js";

interface UrlFix {
  old_url: string;
  new_url: string;
  confidence: "high" | "medium";
  note: string;
}

// ── Verified replacement URLs ───────────────────────────────────────────────
// Each entry was individually researched via web search to find the specific
// article or its new location. No generic homepage links are used.

const fixes: UrlFix[] = [
  // ─── NNGroup (URL slug changes) ──────────────────────────────────────────
  {
    old_url: "https://www.nngroup.com/articles/banner-blindness-revisited/",
    new_url: "https://www.nngroup.com/articles/banner-blindness-old-and-new-findings/",
    confidence: "high",
    note: "Article renamed. Same content on banner blindness with 2024 eyetracking study.",
  },
  {
    old_url: "https://www.nngroup.com/articles/color-contrast-accessibility/",
    new_url: "https://www.nngroup.com/articles/low-contrast/",
    confidence: "high",
    note: "NNGroup article on color contrast. Covers WCAG ratios and readability impact.",
  },
  {
    old_url: "https://www.nngroup.com/articles/dashboard-design/",
    new_url: "https://www.nngroup.com/articles/dashboards-preattentive/",
    confidence: "high",
    note: "Dashboard design article moved to new slug. Covers cognitive load and chart readability.",
  },
  {
    old_url: "https://www.nngroup.com/articles/error-messages/",
    new_url: "https://www.nngroup.com/articles/errors-forms-design-guidelines/",
    confidence: "high",
    note: "NNGroup error message design guidelines — 10 guidelines for reporting errors in forms.",
  },
  {
    old_url: "https://www.nngroup.com/articles/ia-findability/",
    new_url: "https://www.nngroup.com/articles/navigation-ia-tests/",
    confidence: "high",
    note: "IA and findability article. Covers four testing methods to identify findability issues.",
  },
  {
    old_url: "https://www.nngroup.com/articles/push-notification-ux/",
    new_url: "https://www.nngroup.com/articles/push-notification/",
    confidence: "high",
    note: "Push notification UX article renamed. Five mistakes in designing mobile push notifications.",
  },
  {
    old_url: "https://www.nngroup.com/articles/pricing-pages/",
    new_url: "https://www.nngroup.com/articles/show-price/",
    confidence: "medium",
    note: "NNGroup pricing article. Covers how pricing information gives sites a competitive advantage.",
  },
  {
    old_url: "https://www.nngroup.com/articles/pricing-page-ux/",
    new_url: "https://www.nngroup.com/articles/show-prices-for-common-scenarios/",
    confidence: "medium",
    note: "NNGroup pricing UX article. Covers showing prices for common scenarios and plan layouts.",
  },
  {
    old_url: "https://www.nngroup.com/articles/scroll-depth-engagement/",
    new_url: "https://www.nngroup.com/articles/scrolling-and-attention/",
    confidence: "high",
    note: "Scroll depth and engagement article. Covers eyetracking data on how attention drops below the fold.",
  },
  {
    old_url: "https://www.nngroup.com/articles/top-navigation-ia/",
    new_url: "https://www.nngroup.com/articles/menu-design/",
    confidence: "high",
    note: "Top navigation IA article. Menu-Design Checklist with 17 UX guidelines.",
  },

  // ─── Smashing Magazine ───────────────────────────────────────────────────
  {
    old_url: "https://www.smashingmagazine.com/2022/08/checkboxes-toggles/",
    new_url: "https://www.smashingmagazine.com/2022/08/toggle-button-case-study-part-1/",
    confidence: "high",
    note: "URL restructured. Same Aug 2022 toggle button case study (Part 1).",
  },
  {
    old_url: "https://www.smashingmagazine.com/2022/12/thumb-zone-mobile-ux/",
    new_url: "https://www.smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users/",
    confidence: "medium",
    note: "Original thumb zone article by Steven Hoober. The 2022 article may have been consolidated.",
  },

  // ─── Contentsquare (site restructured /insights/ → /blog/ or /guides/) ─
  {
    old_url: "https://contentsquare.com/blog/digital-experience-benchmarks/",
    new_url: "https://contentsquare.com/blog/digital-experience-benchmark-report-2024/",
    confidence: "high",
    note: "Annual benchmark report. URL updated for 2024 edition.",
  },
  {
    old_url: "https://contentsquare.com/insights/ecommerce-benchmark/",
    new_url: "https://contentsquare.com/guides/cart-abandonment/stats/",
    confidence: "medium",
    note: "E-commerce benchmark data. Specific page with cart abandonment statistics and checkout friction data.",
  },
  {
    old_url: "https://contentsquare.com/insights/frustration-signals/",
    new_url: "https://contentsquare.com/blog/rage-clicks/",
    confidence: "medium",
    note: "Frustration signals article. Covers rage clicks, dead clicks, and user frustration patterns.",
  },
  {
    old_url: "https://contentsquare.com/insights/digital-frustration-report/",
    new_url: "https://contentsquare.com/guides/frustrated-users/",
    confidence: "medium",
    note: "Digital frustration report moved to guides section. Covers identifying and reducing user frustration.",
  },
  {
    old_url: "https://contentsquare.com/insights/mobile-vs-desktop/",
    new_url: "https://contentsquare.com/blog/mobile-vs-desktop-en/",
    confidence: "high",
    note: "Mobile vs desktop comparison article. Covers engagement and conversion differences.",
  },

  // ─── Baymard Institute (research URLs restructured) ──────────────────────
  {
    old_url: "https://baymard.com/research/account-and-registration",
    new_url: "https://baymard.com/checkout-usability/benchmark/step-type/account",
    confidence: "medium",
    note: "Account selection benchmark page with 1000+ design examples on guest checkout vs account creation.",
  },
  {
    old_url: "https://baymard.com/research/mobile-ecommerce",
    new_url: "https://baymard.com/research/mcommerce-usability",
    confidence: "high",
    note: "Mobile e-commerce research renamed to mcommerce-usability. Same comprehensive mobile UX guidelines.",
  },
  {
    old_url: "https://baymard.com/research/payment-and-trust",
    new_url: "https://baymard.com/blog/perceived-security-of-payment-form",
    confidence: "medium",
    note: "Payment trust research. Specific article on how users perceive security during checkout.",
  },
  {
    old_url: "https://baymard.com/research/product-listings-and-filtering",
    new_url: "https://baymard.com/blog/current-state-product-list-and-filtering",
    confidence: "high",
    note: "Product listing and filtering UX best practices 2025. Covers filtering, sorting and catalogue navigation.",
  },

  // ─── Hotjar (URLs restructured to new paths) ────────────────────────────
  {
    old_url: "https://hotjar.com/blog/exit-intent/",
    new_url: "https://www.hotjar.com/exit-intent-popup-survey/",
    confidence: "high",
    note: "Exit intent content moved to dedicated section. Covers why users leave and exit survey patterns.",
  },
  {
    old_url: "https://www.hotjar.com/blog/scroll-depth/",
    new_url: "https://www.hotjar.com/blog/scroll-tracking/",
    confidence: "high",
    note: "Scroll depth article renamed. Covers best ways to track scroll depth and content engagement.",
  },
  {
    old_url: "https://www.hotjar.com/heatmaps/research/",
    new_url: "https://www.hotjar.com/heatmap-analysis/",
    confidence: "high",
    note: "Heatmap research moved to heatmap-analysis. Covers heatmap analysis for UX research.",
  },
  {
    old_url: "https://hotjar.com/blog/heatmap-analysis/",
    new_url: "https://www.hotjar.com/heatmap-analysis/",
    confidence: "high",
    note: "Heatmap analysis moved from /blog/ to dedicated path.",
  },

  // ─── Appcues (blog restructured) ────────────────────────────────────────
  {
    old_url: "https://www.appcues.com/blog/mobile-app-onboarding-benchmarks",
    new_url: "https://www.appcues.com/blog/mobile-app-user-onboarding-statistics",
    confidence: "high",
    note: "Mobile onboarding benchmarks article renamed. 4 stats on why mobile onboarding matters.",
  },
  {
    old_url: "https://www.appcues.com/blog/user-onboarding-benchmarks",
    new_url: "https://www.appcues.com/blog/user-onboarding-metrics-and-kpis",
    confidence: "high",
    note: "Onboarding benchmarks renamed to metrics and KPIs. 8 user onboarding metrics to measure.",
  },

  // ─── Microsoft Clarity ───────────────────────────────────────────────────
  {
    old_url: "https://clarity.microsoft.com/blog/dead-clicks-insights",
    new_url: "https://clarity.microsoft.com/blog/introducing-new-types-of-click-heatmaps/",
    confidence: "medium",
    note: "Dead clicks content now in click heatmaps article. Covers dead clicks, rage clicks, and error clicks.",
  },

  // ─── Maze ────────────────────────────────────────────────────────────────
  {
    old_url: "https://maze.co/resources/state-of-ux-research/",
    new_url: "https://maze.co/resources/user-research-report/",
    confidence: "high",
    note: "Report renamed to 'Future of User Research Report'. Same annual industry report.",
  },

  // ─── User Interviews ────────────────────────────────────────────────────
  {
    old_url: "https://www.userinterviews.com/state-of-ux-research-2024",
    new_url: "https://www.userinterviews.com/state-of-user-research-2024-report",
    confidence: "high",
    note: "URL changed from 'ux-research' to 'user-research'. Same 2024 report with 750+ respondents.",
  },

  // ─── Material Design ────────────────────────────────────────────────────
  {
    old_url: "https://m3.material.io/foundations/accessible-design/accessibility-basics",
    new_url: "https://m3.material.io/foundations/accessible-design/overview",
    confidence: "high",
    note: "M3 accessibility page renamed from 'basics' to 'overview'. Same content on accessible design.",
  },

  // ─── PriceIntelligently (acquired by Paddle) ────────────────────────────
  {
    old_url: "https://www.priceintelligently.com/blog/saas-pricing-page-best-practices",
    new_url: "https://www.paddle.com/blog/saas-pricing-models-strategies-fltr",
    confidence: "medium",
    note: "PriceIntelligently acquired by Paddle. Content migrated to Paddle's blog on SaaS pricing.",
  },

  // ─── Adobe ──────────────────────────────────────────────────────────────
  {
    old_url: "https://www.adobe.com/express/learn/blog/creative-trends",
    new_url: "https://business.adobe.com/resources/creative-trends-report.html",
    confidence: "medium",
    note: "Adobe creative trends article moved to business resources. Covers design quality and brand perception.",
  },

  // ─── GWI ────────────────────────────────────────────────────────────────
  {
    old_url: "https://www.gwi.com/reports/digital-consumer-trends",
    new_url: "https://www.gwi.com/connecting-the-dots",
    confidence: "medium",
    note: "GWI digital consumer trends report renamed to 'Connecting the Dots'. Annual consumer trends analysis.",
  },

  // ─── Shopify ────────────────────────────────────────────────────────────
  {
    old_url: "https://www.shopify.com/research/product-reviews",
    new_url: "https://www.shopify.com/retail/how-to-encourage-customer-reviews-and-why-you-should",
    confidence: "medium",
    note: "Shopify product reviews research page. Covers how reviews influence purchase decisions.",
  },

  // ─── MIT AgeLab ─────────────────────────────────────────────────────────
  {
    old_url: "https://agelab.mit.edu/typography-research",
    new_url: "https://agelab.mit.edu/transportation-and-livable-communities/projects/glance-based-legibility/",
    confidence: "medium",
    note: "MIT AgeLab typography research now under glance-based legibility project. Covers font size and readability for older adults.",
  },

  // ─── web.dev ────────────────────────────────────────────────────────────
  {
    old_url: "https://web.dev/mobile-ux/",
    new_url: "https://web.dev/learn/design",
    confidence: "medium",
    note: "web.dev mobile UX content consolidated into Learn Responsive Design course.",
  },

  // ─── Academic DOIs (corrected) ──────────────────────────────────────────
  {
    old_url: "https://link.springer.com/article/10.1007/s11747-011-0264-5",
    new_url: "https://link.springer.com/article/10.1007/s11747-010-0245-y",
    confidence: "medium",
    note: "DOI likely had a typo. Corrected to 'Exciting Red and Competent Blue' by Labrecque & Milne (2012) in J. of the Academy of Marketing Science.",
  },
  {
    old_url: "https://doi.org/10.1016/j.chb.2022.107264",
    new_url: "https://doi.org/10.1016/j.chb.2021.106976",
    confidence: "medium",
    note: "Corrected DOI for 'The personalisation-privacy paradox' by Ameen, Hosany & Paul in Computers in Human Behavior.",
  },
];

// ── URLs that could not be reliably replaced ──────────────────────────────
// These are flagged for manual review. The UI will show a fallback search link.
const unreplaceable = [
  "https://doi.org/10.1016/j.chb.2023.107801",     // Decision fatigue - DOI may be incorrect
  "https://doi.org/10.1509/jmr.14.0057",            // Text difficulty in consumer evaluations - JMR DOI not found
  "https://doi.org/10.1016/S1071-5819(00)00009-3",  // Old IJHCS DOI format - may be unavailable
  "https://doi.org/10.1109/TVCG.2020.2981432",      // IEEE TVCG paper - DOI not found in search
];

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  if (dryRun) {
    console.log("🔍 DRY RUN — no changes will be made\n");
  }

  console.log(`Processing ${fixes.length} URL replacements...\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const fix of fixes) {
    // Find the entry with this old URL
    const { data: entries } = await supabase
      .from("research_entries")
      .select("id, title")
      .eq("source_url", fix.old_url);

    if (!entries || entries.length === 0) {
      console.log(`  SKIP (not found in DB): ${fix.old_url}`);
      skipped++;
      continue;
    }

    for (const entry of entries) {
      const icon = fix.confidence === "high" ? "✓" : "~";
      console.log(`  ${icon} [${fix.confidence}] ${entry.title.slice(0, 60)}`);
      console.log(`    Old: ${fix.old_url}`);
      console.log(`    New: ${fix.new_url}`);

      if (!dryRun) {
        const { error } = await supabase
          .from("research_entries")
          .update({ source_url: fix.new_url })
          .eq("id", entry.id);

        if (error) {
          console.error(`    ERROR: ${error.message}`);
          errors++;
          continue;
        }
      }
      updated++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`${dryRun ? "[DRY RUN] " : ""}Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors}`);

  if (unreplaceable.length > 0) {
    console.log(`\n⚠ ${unreplaceable.length} URLs could not be replaced (DOIs may be incorrect):`);
    for (const url of unreplaceable) {
      console.log(`  - ${url}`);
    }
    console.log("\nThese will show a fallback 'Search for this article' link in the UI.");
  }
}

main();
