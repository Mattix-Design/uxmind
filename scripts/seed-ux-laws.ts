/**
 * Seeds UX Laws & Principles + Debunked Myths from the PRD
 */

import { supabase } from "./supabase-client.js";

const uxLaws = [
  {
    name: "Hick's Law",
    slug: "hicks-law",
    description: "Decision time increases with the number and complexity of choices.",
    detailed_explanation:
      "Hick's Law (or the Hick-Hyman Law) describes the time it takes for a person to make a decision as a result of the possible choices. Increasing the number of choices will increase the decision time logarithmically. In UX design, this means reducing the number of options presented at any one time to speed up decision-making. It applies to navigation menus, form fields, product filters, and any interface where users must choose between alternatives.",
    category: "Cognitive",
    confidence_flag: "proven",
    examples: [
      { title: "Navigation menus", description: "Limiting top-level navigation items to 5-7 reduces decision paralysis" },
      { title: "Checkout flows", description: "Single-column checkout with progressive disclosure reduces abandonment" },
    ],
    source_attribution: "Hick, W.E. (1952). On the rate of gain of information. Quarterly Journal of Experimental Psychology, 4(1), 11-26.",
    sort_order: 1,
  },
  {
    name: "Fitts's Law",
    slug: "fitts-law",
    description: "Time to reach a target relates to its size and distance from the starting point.",
    detailed_explanation:
      "Fitts's Law predicts that the time required to rapidly move to a target area is a function of the ratio between the distance to the target and the width of the target. In practical terms: make important interactive elements large and place them near where the user's cursor or finger is likely to be. This has direct implications for button sizing, touch target areas, and the placement of primary CTAs.",
    category: "Motor",
    confidence_flag: "proven",
    examples: [
      { title: "Touch targets", description: "Apple's 44x44pt and Android's 48x48dp minimum touch targets are derived from Fitts's Law" },
      { title: "CTA placement", description: "Primary action buttons placed near the user's natural resting position get more clicks" },
    ],
    source_attribution: "Fitts, P.M. (1954). The information capacity of the human motor system in controlling the amplitude of movement. Journal of Experimental Psychology, 47(6), 381-391.",
    sort_order: 2,
  },
  {
    name: "Miller's Law",
    slug: "millers-law",
    description: "Working memory holds approximately 7 (plus or minus 2) items at once.",
    detailed_explanation:
      "Miller's Law states that the average person can hold about 7 (±2) items in their working memory at a time. This has been widely applied in UX to justify chunking information, limiting navigation items, and breaking complex forms into steps. However, the original research was about short-term memory capacity for simple stimuli — its application to complex UI design has been debated. Modern research suggests the effective number for complex items may be closer to 4.",
    category: "Cognitive",
    confidence_flag: "well_supported",
    examples: [
      { title: "Phone numbers", description: "Phone numbers are chunked into groups (e.g., 020-7946-0958) to aid recall" },
      { title: "Form chunking", description: "Breaking a 15-field form into 3-4 step wizard reduces cognitive load" },
    ],
    source_attribution: "Miller, G.A. (1956). The magical number seven, plus or minus two. Psychological Review, 63(2), 81-97.",
    sort_order: 3,
  },
  {
    name: "Jakob's Law",
    slug: "jakobs-law",
    description: "Users expect your site to work like sites they already know.",
    detailed_explanation:
      "Jakob's Law (named after Jakob Nielsen) states that users spend most of their time on other websites, so they prefer your site to work the same way as all the other sites they already know. This means leveraging existing mental models and established conventions rather than reinventing interaction patterns. Novel interfaces must provide significantly better value to justify the learning cost.",
    category: "Behavioural",
    confidence_flag: "well_supported",
    examples: [
      { title: "E-commerce layout", description: "Users expect the cart icon in the top right, search at the top, and logo linking to homepage" },
      { title: "Form patterns", description: "Users expect labels above inputs, submit buttons at the bottom, and asterisks for required fields" },
    ],
    source_attribution: "Nielsen, J. (2000). End of Web Design. NNGroup.",
    sort_order: 4,
  },
  {
    name: "Law of Proximity",
    slug: "law-of-proximity",
    description: "Elements close together are perceived as related.",
    detailed_explanation:
      "From Gestalt psychology, the Law of Proximity states that objects near each other tend to be grouped together perceptually. In interface design, this means spacing and grouping are powerful tools for communicating relationships between elements without explicit labels or borders. Related form fields, navigation items, or content blocks should be grouped with less spacing than unrelated elements.",
    category: "Visual",
    confidence_flag: "proven",
    examples: [
      { title: "Form design", description: "Grouping related fields (name + email) with less spacing than between groups (personal info vs billing)" },
      { title: "Card layouts", description: "Image, title, and description placed close together are perceived as a single content unit" },
    ],
    source_attribution: "Wertheimer, M. (1923). Laws of organization in perceptual forms. Psycologische Forschung, 4, 301-350.",
    sort_order: 5,
  },
  {
    name: "Law of Similarity",
    slug: "law-of-similarity",
    description: "Similar elements are perceived as grouped.",
    detailed_explanation:
      "The Law of Similarity states that elements that share visual characteristics (colour, shape, size, orientation) are perceived as belonging to the same group. In UI design, consistent styling signals function — all links should look alike, all primary buttons should be styled consistently, and visual differentiation should be used to separate different categories of content or action.",
    category: "Visual",
    confidence_flag: "proven",
    examples: [
      { title: "Button hierarchy", description: "Primary (filled), secondary (outlined), and tertiary (text) buttons use visual similarity to group by importance" },
      { title: "Navigation", description: "Active nav items styled differently from inactive ones use similarity to show current state" },
    ],
    source_attribution: "Wertheimer, M. (1923). Laws of organization in perceptual forms.",
    sort_order: 6,
  },
  {
    name: "Tesler's Law",
    slug: "teslers-law",
    description: "Every system has inherent complexity that cannot be reduced below a certain point.",
    detailed_explanation:
      "Also known as the Law of Conservation of Complexity, Tesler's Law states that for any system there is a certain amount of complexity that cannot be reduced. The question is who bears that complexity — the system (developer/designer) or the user. Good design shifts as much complexity as possible from the user to the system. This doesn't mean hiding complexity, but absorbing it through smart defaults, progressive disclosure, and automation.",
    category: "Cognitive",
    confidence_flag: "well_supported",
    examples: [
      { title: "Email", description: "Email clients hide SMTP/IMAP complexity from users — the system absorbs it" },
      { title: "Auto-complete", description: "Address forms that auto-fill from postcode shift complexity from user to system" },
    ],
    source_attribution: "Tesler, L. (2007). As described in Saffer, D. Designing for Interaction.",
    sort_order: 7,
  },
  {
    name: "Doherty Threshold",
    slug: "doherty-threshold",
    description: "System response under 400ms increases productivity and engagement.",
    detailed_explanation:
      "Research by Doherty and Kelisky at IBM showed that when computer response time dropped below 400 milliseconds, productivity increased dramatically and users became 'addicted' to the interaction. The relationship between response time and productivity is not linear — there is a threshold effect where sub-400ms responses qualitatively change the user experience from waiting to flowing.",
    category: "Cognitive",
    confidence_flag: "well_supported",
    examples: [
      { title: "Search-as-you-type", description: "Instant search results appearing as users type creates an addictive, flowing interaction" },
      { title: "Optimistic UI", description: "Showing the result of an action immediately (before server confirmation) maintains the flow state" },
    ],
    source_attribution: "Doherty, W.J. & Kelisky, R.P. (1979). Managing VM/CMS systems for user effectiveness. IBM Systems Journal, 18(1), 143-163.",
    sort_order: 8,
  },
  {
    name: "Peak-End Rule",
    slug: "peak-end-rule",
    description: "People judge experiences by their peak moment and end, not the average.",
    detailed_explanation:
      "Research by Kahneman and colleagues showed that people judge an experience largely based on how they felt at its most intense point (the peak) and at its end, rather than based on the sum or average of every moment. In UX design, this means the most critical moments are your best feature interaction and the final step of the user journey (e.g., checkout confirmation, onboarding completion).",
    category: "Behavioural",
    confidence_flag: "proven",
    examples: [
      { title: "Checkout confirmation", description: "A delightful order confirmation page leaves users with a positive final impression" },
      { title: "Onboarding", description: "Ending onboarding with a quick win (first task completed) creates a positive peak-end memory" },
    ],
    source_attribution: "Kahneman, D. et al. (1993). When more pain is preferred to less. Psychological Science, 4(6), 401-405.",
    sort_order: 9,
  },
  {
    name: "Von Restorff Effect",
    slug: "von-restorff-effect",
    description: "Items that stand out visually are more likely to be remembered.",
    detailed_explanation:
      "Also known as the Isolation Effect, the Von Restorff Effect predicts that when multiple similar objects are present, the one that differs from the rest is most likely to be remembered. In design, this is used to make primary CTAs, important notifications, or key pricing tiers visually distinct from surrounding elements.",
    category: "Cognitive",
    confidence_flag: "proven",
    examples: [
      { title: "Pricing tables", description: "The recommended plan is visually highlighted (different colour, larger, badge) to draw attention" },
      { title: "CTAs", description: "Primary action buttons use a distinct colour that contrasts with the rest of the page" },
    ],
    source_attribution: "Von Restorff, H. (1933). Über die Wirkung von Bereichsbildungen im Spurenfeld. Psychologische Forschung, 18(1), 299-342.",
    sort_order: 10,
  },
  {
    name: "Goal Gradient Effect",
    slug: "goal-gradient-effect",
    description: "Effort and motivation increase as people get closer to a goal.",
    detailed_explanation:
      "The Goal Gradient Effect shows that people accelerate their behaviour as they get closer to a goal. Originally observed in animal behaviour, it has been extensively validated in human contexts including loyalty programmes, progress bars, and multi-step forms. Users are more likely to complete a process when they can see they are making progress toward the end.",
    category: "Behavioural",
    confidence_flag: "proven",
    examples: [
      { title: "Progress bars", description: "Showing '3 of 5 steps complete' motivates users to finish the remaining steps" },
      { title: "Loyalty cards", description: "Coffee shop cards pre-stamped with 2/10 stamps get completed faster than blank 8-stamp cards" },
    ],
    source_attribution: "Kivetz, R., Urminsky, O., & Zheng, Y. (2006). The goal-gradient hypothesis resurrected. Journal of Marketing Research, 43(1), 39-58.",
    sort_order: 11,
  },
  {
    name: "Aesthetic Usability Effect",
    slug: "aesthetic-usability-effect",
    description: "Users perceive attractive designs as more usable, even when they are not.",
    detailed_explanation:
      "Research shows that users are more tolerant of minor usability issues when the design is aesthetically pleasing. Attractive interfaces create a positive emotional response that makes users more patient, more forgiving of errors, and more likely to perceive the product as easier to use. This does not mean aesthetics can replace usability — but it does mean visual polish is not superficial.",
    category: "Cognitive",
    confidence_flag: "well_supported",
    examples: [
      { title: "First impressions", description: "Users form aesthetic judgements within 50ms of seeing a page, influencing all subsequent interaction" },
      { title: "Error tolerance", description: "Users retry failed actions more times on attractive interfaces before giving up" },
    ],
    source_attribution: "Tractinsky, N., Katz, A.S., & Ikar, D. (2000). What is beautiful is usable. Interacting with Computers, 13(2), 127-145.",
    sort_order: 12,
  },
  {
    name: "Serial Position Effect",
    slug: "serial-position-effect",
    description: "Users remember the first and last items in a list best.",
    detailed_explanation:
      "The Serial Position Effect describes the tendency to recall the first items (primacy effect) and last items (recency effect) in a list better than middle items. In interface design, this means placing the most important actions or navigation items at the beginning and end of lists, menus, and toolbars.",
    category: "Cognitive",
    confidence_flag: "proven",
    examples: [
      { title: "Navigation bars", description: "Most important items placed at the start and end of the nav bar get the most attention" },
      { title: "Mobile tab bars", description: "iOS and Android place Home and Profile at the start and end of bottom tab bars" },
    ],
    source_attribution: "Ebbinghaus, H. (1885). Memory: A Contribution to Experimental Psychology.",
    sort_order: 13,
  },
  {
    name: "Law of Pragnanz",
    slug: "law-of-pragnanz",
    description: "People interpret ambiguous images in the simplest possible form.",
    detailed_explanation:
      "The Law of Pragnanz (also known as the Law of Good Figure or Law of Simplicity) is the central law of Gestalt psychology. It states that people will perceive and interpret ambiguous or complex images as the simplest form possible. In design, this means simple, clear layouts are perceived more quickly and accurately than complex ones. Users should never have to work to understand the structure of your interface.",
    category: "Visual",
    confidence_flag: "proven",
    examples: [
      { title: "Logo design", description: "Simple geometric logos (Apple, Nike) are more recognisable than complex illustrations" },
      { title: "Layout clarity", description: "Clean grid-based layouts are parsed faster than asymmetric or overlapping designs" },
    ],
    source_attribution: "Koffka, K. (1935). Principles of Gestalt Psychology.",
    sort_order: 14,
  },
  {
    name: "Zeigarnik Effect",
    slug: "zeigarnik-effect",
    description: "People remember uncompleted tasks better than completed ones.",
    detailed_explanation:
      "The Zeigarnik Effect describes the tendency to remember uncompleted or interrupted tasks better than completed ones. In UX design, this is leveraged through progress indicators, incomplete profile prompts, and gamification elements that create a sense of unfinished business, motivating users to return and complete actions.",
    category: "Behavioural",
    confidence_flag: "well_supported",
    examples: [
      { title: "LinkedIn profile strength", description: "Showing profile completeness (e.g., 70%) motivates users to fill in remaining sections" },
      { title: "Onboarding checklists", description: "Showing 3/5 setup tasks complete creates a pull to finish the remaining 2" },
    ],
    source_attribution: "Zeigarnik, B. (1927). Das Behalten erledigter und unerledigter Handlungen. Psychologische Forschung, 9, 1-85.",
    sort_order: 15,
  },
  {
    name: "Postel's Law",
    slug: "postels-law",
    description: "Be conservative in what you send, liberal in what you accept.",
    detailed_explanation:
      "Originally a principle of network protocol design (the Robustness Principle), Postel's Law has been adopted in UX to mean: accept a wide range of user inputs (flexible input formats, forgiving form validation) while providing clear, consistent, structured output. For example, accept phone numbers in any format but store and display them consistently.",
    category: "Interaction",
    confidence_flag: "well_supported",
    examples: [
      { title: "Phone input", description: "Accepting '020 7946 0958', '02079460958', and '+44 20 7946 0958' as valid phone numbers" },
      { title: "Search", description: "Handling typos, synonyms, and varied phrasings in search queries gracefully" },
    ],
    source_attribution: "Postel, J. (1980). RFC 761: DoD Standard Transmission Control Protocol.",
    sort_order: 16,
  },
  {
    name: "Law of Common Region",
    slug: "law-of-common-region",
    description: "Elements enclosed in the same area are perceived as grouped.",
    detailed_explanation:
      "The Law of Common Region states that elements tend to be perceived as groups if they are sharing an area with a clearly defined boundary. In UI design, cards, containers, bordered sections, and background colours are all applications of this law — they visually group related content without requiring explicit labels.",
    category: "Visual",
    confidence_flag: "proven",
    examples: [
      { title: "Card components", description: "Cards with borders or shadows group title, image, and description as a single unit" },
      { title: "Form sections", description: "Background colour changes to delineate billing vs shipping sections in a form" },
    ],
    source_attribution: "Palmer, S.E. (1992). Common region: A new principle of perceptual grouping. Cognitive Psychology, 24(3), 436-447.",
    sort_order: 17,
  },
  {
    name: "Law of Uniform Connectedness",
    slug: "law-of-uniform-connectedness",
    description: "Visually connected elements are perceived as related.",
    detailed_explanation:
      "Elements that are visually connected by lines, arrows, or visual flow are perceived as more related than elements that are not connected. This is used in step indicators, flowcharts, timelines, and breadcrumb navigation to show sequence, hierarchy, or relationship between elements.",
    category: "Visual",
    confidence_flag: "proven",
    examples: [
      { title: "Step indicators", description: "Connected dots or a progress line showing checkout steps 1→2→3→4" },
      { title: "Timelines", description: "A vertical line connecting events shows chronological relationship" },
    ],
    source_attribution: "Palmer, S.E. & Rock, I. (1994). Rethinking perceptual organization. Psychonomic Bulletin & Review, 1(1), 29-55.",
    sort_order: 18,
  },
];

const debunkedMyths = [
  {
    myth: "The three-click rule",
    reality: "No evidence that users leave after three clicks — task completion and satisfaction matter more than click count.",
    source_attribution: "Zaphiris, P. (2000). Depth vs breadth in the arrangement of web links. Proceedings of the IEA 2000/HFES 2000 Congress.",
    sort_order: 1,
  },
  {
    myth: "Above the fold",
    reality: "Users do scroll if content is engaging and there are cues to scroll. The concept of a fixed fold is outdated given the diversity of screen sizes.",
    source_attribution: "Scrolling and Attention — NNGroup (2010); Chartbeat research on 2 billion page views (2013).",
    sort_order: 2,
  },
  {
    myth: "Users read web pages",
    reality: "Users scan, not read — they look for relevant keywords and visual anchors. 79% of users scan any new page (Nielsen, 1997).",
    source_attribution: "Nielsen, J. (1997). How Users Read on the Web. NNGroup.",
    sort_order: 3,
  },
  {
    myth: "More features = more value",
    reality: "Feature bloat directly harms usability and increases cognitive load. Products with fewer, better-designed features consistently outperform feature-heavy alternatives in user satisfaction.",
    source_attribution: "Thompson, D.V., Hamilton, R.W., & Rust, R.T. (2005). Feature Fatigue. Journal of Marketing Research.",
    sort_order: 4,
  },
  {
    myth: "Users always read instructions",
    reality: "They rarely do — design must work without instructions being read. Users are goal-oriented and skip anything that isn't directly on the path to their objective.",
    source_attribution: "Carroll, J.M. (1990). The Nurnberg Funnel: Designing Minimalist Instruction for Practical Computer Skill.",
    sort_order: 5,
  },
];

async function seed() {
  console.log("Seeding UX Laws...\n");

  let lawsInserted = 0;
  for (const law of uxLaws) {
    const { data: existing } = await supabase
      .from("ux_laws")
      .select("id")
      .eq("slug", law.slug)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`  [skip] ${law.name} — already exists`);
      continue;
    }

    const { error } = await supabase.from("ux_laws").insert(law);
    if (error) {
      console.error(`  [error] ${law.name}: ${error.message}`);
    } else {
      console.log(`  [inserted] ${law.name}`);
      lawsInserted++;
    }
  }

  console.log(`\nSeeding Debunked Myths...\n`);

  let mythsInserted = 0;
  for (const myth of debunkedMyths) {
    const { data: existing } = await supabase
      .from("debunked_myths")
      .select("id")
      .eq("myth", myth.myth)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`  [skip] "${myth.myth}" — already exists`);
      continue;
    }

    const { error } = await supabase.from("debunked_myths").insert(myth);
    if (error) {
      console.error(`  [error] "${myth.myth}": ${error.message}`);
    } else {
      console.log(`  [inserted] "${myth.myth}"`);
      mythsInserted++;
    }
  }

  console.log(`\nComplete: ${lawsInserted} laws, ${mythsInserted} myths inserted`);
}

seed().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
