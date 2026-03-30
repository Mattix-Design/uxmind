/**
 * Batch 14: Outcome-Oriented Design, UX Metrics, Measurable Design Impact,
 * and Evidence-Based Design Decisions — primarily sourced from NNGroup
 *
 * Valid SiteContext enums: ecommerce_general, ecommerce_checkout, ecommerce_discovery,
 *   lead_generation, saas, news_media, content_publishing, mobile_app, landing_pages,
 *   onboarding, forms_data_entry, accessibility, navigation_ia, search_filtering
 *
 * Scoring criterion names MUST exactly match the rubric for each research_type.
 */

import { supabase } from "./supabase-client.js";
import { calculateScore } from "../packages/scoring/src/calculator.js";
import type { ScoreInput } from "../packages/scoring/src/calculator.js";
import type { ResearchType, SiteContext } from "../packages/types/src/research.js";

interface ManualEntry {
  title: string; source_url: string; source_name: string; authors: string[];
  publication_date: string | null; research_type: ResearchType;
  site_contexts: SiteContext[]; attributed_summary: string; key_findings: string[];
  methodology_summary: string | null; sample_size: string | null;
  limitations: string[]; tags: string[]; scores: ScoreInput[];
}

function slugify(t: string) { return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100); }

const entries: ManualEntry[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // 1. Outcome-Oriented Design in the AI Era
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: "Outcome-Oriented Design: The Era of AI Design",
    source_url: "https://www.nngroup.com/videos/the-era-of-ai-design/",
    source_name: "Nielsen Norman Group",
    authors: ["Kate Moran", "Sarah Gibbons"],
    publication_date: "2026-03-23",
    research_type: "user_testing",
    site_contexts: ["saas", "mobile_app", "onboarding"],
    attributed_summary: "NNGroup framework arguing that outcome-oriented design represents a paradigm shift for UX in the AI era. Instead of designing single, static interfaces optimised for average user needs, designers should define adaptive frameworks that respond to individual user goals. The approach moves focus from interface components to measurable user outcomes, enabling AI-driven systems to personalise experiences dynamically based on what each user is trying to achieve.",
    key_findings: [
      "Outcome-oriented design shifts focus from optimising single interfaces to defining adaptive frameworks that respond to individual user goals",
      "Designers should specify desired user outcomes rather than prescriptive UI layouts, letting AI adapt the presentation layer",
      "Traditional persona-based design optimises for 'average' users, whereas outcome-oriented design accommodates the full range of user intentions",
      "Success metrics shift from engagement proxies (clicks, time-on-page) to direct outcome measures (task completion, goal achievement)",
      "AI-adaptive interfaces require designers to define outcome guardrails — boundaries within which the system can personalise freely",
      "Early adopters of outcome-oriented approaches report faster iteration cycles because they test outcomes rather than specific UI configurations",
    ],
    methodology_summary: "Expert framework presentation drawing on NNGroup's ongoing research into AI-driven design patterns, informed by qualitative usability research and case studies from organisations adopting adaptive interfaces.",
    sample_size: null,
    limitations: ["Framework presentation rather than controlled empirical study", "Limited quantitative evidence at this early stage", "Applicability depends on AI maturity of the implementing organisation"],
    tags: ["outcome-oriented-design", "ai-design", "adaptive-interfaces", "user-goals", "personalisation", "design-paradigm"],
    scores: [
      { criterion_name: "Sample size", score: 5 },
      { criterion_name: "Participant recruitment methodology", score: 6 },
      { criterion_name: "Demographic diversity and representation", score: 6 },
      { criterion_name: "Control variables documented", score: 6 },
      { criterion_name: "Variant / treatment clearly defined", score: 8 },
      { criterion_name: "Moderated vs unmoderated", score: 6 },
      { criterion_name: "Task success rate reported", score: 5 },
      { criterion_name: "Error rate documented", score: 5 },
      { criterion_name: "Time-on-task measured", score: 5 },
      { criterion_name: "Peer review status", score: 5 },
      { criterion_name: "Author credentials", score: 10 },
      { criterion_name: "Publication date (recency)", score: 10 },
      { criterion_name: "Limitations and bias disclosed", score: 7 },
      { criterion_name: "Replication or citation count", score: 5 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 2. Statistical vs Practical Significance in UX Measurement
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: "Statistical Significance Isn't the Same as Practical Significance",
    source_url: "https://www.nngroup.com/articles/practical-significance/",
    source_name: "Nielsen Norman Group",
    authors: ["Rachel Banawa"],
    publication_date: "2026-03-06",
    research_type: "analytics_based",
    site_contexts: ["ecommerce_checkout", "saas", "forms_data_entry"],
    attributed_summary: "NNGroup article establishing a critical distinction for outcome-oriented measurement: statistical significance (a result unlikely due to chance, p < 0.05) and practical significance (whether the result is large enough to meaningfully impact real-world decisions). The piece demonstrates that reliability and impact are separate concepts — a statistically significant result may lack practical importance, and vice versa — with direct implications for how UX teams should evaluate A/B tests and usability metrics.",
    key_findings: [
      "A checkout redesign showing 85.0% vs 85.2% completion can be statistically significant (p=0.03) yet practically meaningless — the 0.2% gap is not actionable",
      "A 1-second task-time improvement (55s to 54s) may reach statistical significance with large samples but is imperceptible to users",
      "At scale, even small effects matter: a 0.5% error reduction across 2 million transactions prevents 10,000 failures worth approximately $150,000 annually",
      "In small qualitative studies, 10 of 12 users failing on Design A vs 1 of 12 on Design B shows obvious practical significance despite potential statistical non-significance",
      "UX teams should evaluate three dimensions: user perception (would users notice?), business value (does it justify implementation cost?), and effect size (Cohen's d, risk ratios)",
      "Large datasets can inflate trivial differences to statistical significance, while small samples may obscure genuinely meaningful patterns",
    ],
    methodology_summary: "Expert analysis drawing on worked examples from checkout UX, task-time studies, and high-volume transactional data to illustrate the statistical vs practical significance distinction.",
    sample_size: null,
    limitations: ["Illustrative examples rather than new primary research", "Thresholds for practical significance remain context-dependent", "Does not provide a universal formula for when practical significance is sufficient"],
    tags: ["statistical-significance", "practical-significance", "ux-metrics", "a-b-testing", "effect-size", "measurement", "outcome-measurement"],
    scores: [
      { criterion_name: "Total data volume", score: 5 },
      { criterion_name: "Time period covered", score: 5 },
      { criterion_name: "Industry vertical relevance", score: 8 },
      { criterion_name: "Measurement methodology transparency", score: 9 },
      { criterion_name: "Filtering and noise reduction explained", score: 7 },
      { criterion_name: "Sample representativeness across device types", score: 5 },
      { criterion_name: "Geographic spread of data", score: 4 },
      { criterion_name: "Data collection tool credibility", score: 8 },
      { criterion_name: "Segmentation depth", score: 6 },
      { criterion_name: "Publication date and data freshness", score: 10 },
      { criterion_name: "Conflict of interest disclosure", score: 6 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 3. AI Chatbot UX — Users Can't Tell What It's For
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: "What Is Your Site's AI Chatbot for? Users Can't Tell",
    source_url: "https://www.nngroup.com/articles/site-ai-chatbot/",
    source_name: "Nielsen Norman Group",
    authors: ["Maria Rosala", "Georgia Kenderova", "Tanner Kohler"],
    publication_date: "2026-03-20",
    research_type: "user_testing",
    site_contexts: ["ecommerce_general", "ecommerce_discovery", "saas", "onboarding"],
    attributed_summary: "Qualitative usability study testing 8 commercial AI chatbots (including Amazon Rufus, Home Depot Magic Apron, and Redfin Smarter Search) to understand how users discover, perceive, and interact with site-embedded conversational AI. Found that users frequently failed to notice chatbots, could not determine their purpose or capabilities, and generally found them less efficient than existing search and navigation features. Chatbots succeeded only when scoped to specific, contextual problems that existing UI couldn't easily solve.",
    key_findings: [
      "Users frequently failed to notice site chatbots — icons were small, unlabelled, or visually blended into the page background",
      "Most chatbots did not communicate their purpose clearly, leaving users uncertain about their value: 'Why am I going through all this here?'",
      "Chatbots consistently underperformed compared to search, filters, and navigation — requiring more effort and showing limited results",
      "Past negative chatbot experiences created lasting scepticism, reducing willingness to try new implementations without clear incentives",
      "Chatbots succeeded when scoped to context-specific questions: product-specific queries, complex personal scenarios, and expert reasoning tasks",
      "Users valued chatbots that surfaced information requiring synthesis across multiple pages (e.g., 'Can I take this car on a road trip to Mexico?')",
      "Business-driven messaging within chatbot responses (upselling, promotions) actively undermined user trust",
    ],
    methodology_summary: "Moderated qualitative usability testing with 60-minute sessions. Each participant tested 2-3 AI chatbots relevant to their interests across retail, real estate, government, and travel domains.",
    sample_size: "9 participants with varying digital skill levels and AI competency",
    limitations: ["Small qualitative sample (9 participants)", "Chatbot capabilities are evolving rapidly — findings may date quickly", "Tested commercial implementations which vary in quality"],
    tags: ["ai-chatbot", "conversational-ui", "discoverability", "user-expectations", "task-efficiency", "trust", "outcome-oriented"],
    scores: [
      { criterion_name: "Sample size", score: 4 },
      { criterion_name: "Participant recruitment methodology", score: 7 },
      { criterion_name: "Demographic diversity and representation", score: 6 },
      { criterion_name: "Control variables documented", score: 6 },
      { criterion_name: "Variant / treatment clearly defined", score: 8 },
      { criterion_name: "Moderated vs unmoderated", score: 9 },
      { criterion_name: "Task success rate reported", score: 6 },
      { criterion_name: "Error rate documented", score: 5 },
      { criterion_name: "Time-on-task measured", score: 4 },
      { criterion_name: "Peer review status", score: 4 },
      { criterion_name: "Author credentials", score: 9 },
      { criterion_name: "Publication date (recency)", score: 10 },
      { criterion_name: "Limitations and bias disclosed", score: 7 },
      { criterion_name: "Replication or citation count", score: 3 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 4. Design Process Compression in the AI Era
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: "Design Process Isn't Dead, It's Compressed",
    source_url: "https://www.nngroup.com/articles/design-process-isnt-dead/",
    source_name: "Nielsen Norman Group",
    authors: ["Sarah Gibbons", "Huei-Hsin Wang"],
    publication_date: "2026-03-13",
    research_type: "mixed_methods",
    site_contexts: ["saas", "mobile_app"],
    attributed_summary: "NNGroup analysis challenging the growing narrative that design processes should be abandoned in favour of intuition-driven work. The authors argue that experienced designers don't skip process — they compress it, operating nonlinearly and contextually based on internalised expertise. The piece makes the case that process literacy — deliberately matching process rigour to problem complexity — is essential for outcome-oriented design, especially in high-stakes industries where intuition alone carries unconscious bias.",
    key_findings: [
      "What experienced practitioners call 'intuition' is actually compressed process — internalised through years of practice, not the absence of method",
      "Junior designers lack the accumulated knowledge to rely on intuition reliably, making process literacy a prerequisite for career development",
      "Corporate environments require documented evidence for design decisions, not intuition-based justifications — process provides that audit trail",
      "High-stakes industries (healthcare, finance, government) require rigorous process as a safeguard against costly UX failures",
      "Solution-first design works only in mature problem spaces with established patterns — it fails in novel or ambiguous contexts",
      "AI acceleration enables faster iteration within a process but does not eliminate the need for risk mitigation and user validation",
      "Process literacy means matching rigour to complexity: lightweight validation for known patterns, deep research for novel problems",
    ],
    methodology_summary: "Expert analysis combining qualitative observations from NNGroup's consulting practice with synthesis of industry discourse around AI-era design methodology.",
    sample_size: null,
    limitations: ["Opinion and synthesis piece rather than controlled study", "Examples of 'solution-first' failures reflect survivorship bias in the opposite direction", "Does not quantify the cost of skipping process steps"],
    tags: ["design-process", "process-literacy", "intuition", "ai-design", "outcome-oriented", "risk-mitigation", "evidence-based-design"],
    scores: [
      { criterion_name: "Qualitative and quantitative combination clearly defined", score: 7 },
      { criterion_name: "Whether methods corroborate each other", score: 7 },
      { criterion_name: "Sample sizes meet thresholds for both components", score: 5 },
      { criterion_name: "Integration methodology explained", score: 6 },
      { criterion_name: "Peer review status", score: 5 },
      { criterion_name: "Author credentials", score: 10 },
      { criterion_name: "Limitations of each method disclosed", score: 7 },
      { criterion_name: "Publication date", score: 10 },
      { criterion_name: "Citation count", score: 4 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 5. ROI of Usability — Measurable Design Outcomes
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: "Return on Investment for Usability",
    source_url: "https://www.nngroup.com/articles/return-on-investment-for-usability/",
    source_name: "Nielsen Norman Group",
    authors: ["Jakob Nielsen"],
    publication_date: "2003-01-06",
    research_type: "analytics_based",
    site_contexts: ["ecommerce_general", "ecommerce_checkout", "saas", "lead_generation", "forms_data_entry"],
    attributed_summary: "Foundational analysis of 863 design projects quantifying the business return on usability investment. Nielsen found that development projects should allocate 10% of budget to usability, and that redesigns guided by usability research improved key metrics by an average of 135%. The study provides concrete evidence that outcome-oriented design investment — measuring task completion, conversion, and productivity — delivers measurable financial returns, with intranet usability improvements yielding 8x to 50x ROI depending on organisation size.",
    key_findings: [
      "Analysis of 863 design projects shows development teams should spend 10% of their budget on usability for optimal ROI",
      "42 website redesign case studies showed an average 135% improvement in usability metrics after investment (excluding outliers)",
      "Sales and conversion rates doubled (100% improvement) on average after usability-focused redesigns",
      "Traffic and visitor count increased by 150% on average following usability improvements",
      "User performance and productivity improved by 161% after redesigns guided by usability research",
      "Use of target features increased by 202% — the largest improvement category — indicating that users engage more when interfaces align with their goals",
      "Intranet usability improvements yielded 8x ROI for organisations with 1,000 employees and 50x ROI for those with 100,000 employees",
      "Usability costs don't scale linearly — projects ten times larger typically require only four times more usability investment",
    ],
    methodology_summary: "Meta-analysis of quantitative before-and-after metrics from 863 design projects and detailed case analysis of 42 website redesigns where usability metrics were measured pre- and post-redesign.",
    sample_size: "863 design projects, 42 detailed website redesign cases",
    limitations: ["Data collected primarily from projects that chose to invest in usability (selection bias)", "Older data — originally published 2003 though updated 2018", "Projects varied widely in scope and measurement rigour"],
    tags: ["usability-roi", "design-investment", "conversion", "productivity", "outcome-measurement", "business-case", "cost-benefit"],
    scores: [
      { criterion_name: "Total data volume", score: 9 },
      { criterion_name: "Time period covered", score: 8 },
      { criterion_name: "Industry vertical relevance", score: 9 },
      { criterion_name: "Measurement methodology transparency", score: 7 },
      { criterion_name: "Filtering and noise reduction explained", score: 6 },
      { criterion_name: "Sample representativeness across device types", score: 5 },
      { criterion_name: "Geographic spread of data", score: 6 },
      { criterion_name: "Data collection tool credibility", score: 8 },
      { criterion_name: "Segmentation depth", score: 7 },
      { criterion_name: "Publication date and data freshness", score: 3 },
      { criterion_name: "Conflict of interest disclosure", score: 5 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 6. Usability Metrics — Measuring Design Outcomes
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: "Usability Metrics: Measuring Task Success, Time, Errors, and Satisfaction",
    source_url: "https://www.nngroup.com/articles/usability-metrics/",
    source_name: "Nielsen Norman Group",
    authors: ["Jakob Nielsen"],
    publication_date: "2001-01-20",
    research_type: "user_testing",
    site_contexts: ["ecommerce_general", "saas", "forms_data_entry", "onboarding", "navigation_ia"],
    attributed_summary: "Foundational NNGroup methodology guide defining the four core dimensions of usability measurement: task success rate, time-on-task, error frequency, and user satisfaction. Nielsen argues that while quantitative usability metrics cost roughly four times more than qualitative research, they provide unique strategic value for tracking improvements across releases, competitive benchmarking, go/no-go launch decisions, and performance-based incentives. The guide establishes that quantitative usability testing requires 20+ users per design variant and recommends geometric means over arithmetic averages for combining metrics.",
    key_findings: [
      "Four core usability metrics: task success rate, time-on-task, error frequency, and user satisfaction ratings",
      "Quantitative usability studies require testing 20+ users per design variant to achieve statistically valid confidence intervals",
      "Geometric means should be used instead of arithmetic averages when combining usability metrics, as they prevent single outliers from skewing results",
      "Usability metrics are roughly 4x more expensive than qualitative research but provide four strategic benefits: release tracking, benchmarking, launch gating, and team incentives",
      "Novice users should be tested for public-facing websites, while experienced users are more appropriate for intranets and specialist tools",
      "Task success rate is the most fundamental usability metric — if users cannot complete their goals, no other metric matters",
      "Combining metrics (e.g., success rate × satisfaction) reveals design trade-offs invisible in individual measures",
    ],
    methodology_summary: "Expert methodology framework based on decades of usability testing practice, recommending standardised measurement approaches for quantitative UX assessment.",
    sample_size: null,
    limitations: ["Originally published 2001 — some benchmarks may need updating for modern interfaces", "Cost estimates for quantitative testing predate remote and unmoderated testing tools", "Does not address newer metric categories such as engagement or retention"],
    tags: ["usability-metrics", "task-success", "time-on-task", "error-rate", "user-satisfaction", "outcome-measurement", "quantitative-ux"],
    scores: [
      { criterion_name: "Sample size", score: 5 },
      { criterion_name: "Participant recruitment methodology", score: 6 },
      { criterion_name: "Demographic diversity and representation", score: 5 },
      { criterion_name: "Control variables documented", score: 7 },
      { criterion_name: "Variant / treatment clearly defined", score: 8 },
      { criterion_name: "Moderated vs unmoderated", score: 7 },
      { criterion_name: "Task success rate reported", score: 8 },
      { criterion_name: "Error rate documented", score: 7 },
      { criterion_name: "Time-on-task measured", score: 8 },
      { criterion_name: "Peer review status", score: 4 },
      { criterion_name: "Author credentials", score: 10 },
      { criterion_name: "Publication date (recency)", score: 3 },
      { criterion_name: "Limitations and bias disclosed", score: 6 },
      { criterion_name: "Replication or citation count", score: 9 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 7. Conversion Rate Measurement & Optimisation
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: "Conversion Rates: The Key Outcome Metric for UX Effectiveness",
    source_url: "https://www.nngroup.com/articles/conversion-rates/",
    source_name: "Nielsen Norman Group",
    authors: ["Jakob Nielsen"],
    publication_date: "2013-11-24",
    research_type: "analytics_based",
    site_contexts: ["ecommerce_general", "ecommerce_checkout", "ecommerce_discovery", "lead_generation", "landing_pages"],
    attributed_summary: "NNGroup analysis defining conversion rates as the fundamental outcome metric for measuring UX effectiveness. Nielsen broadens the definition beyond purchases to include registrations, subscriptions, downloads, feature usage, and engagement milestones — any trackable action aligned with business goals. E-commerce conversion rates averaged approximately 3% in 2013 with typical ranges of 1-10% depending on context. The article makes the critical point that form simplification has directly measurable conversion impact, and that optimisation should target value rather than raw conversion maximisation.",
    key_findings: [
      "Conversion rate — the percentage of users who take a desired action — is the primary outcome metric for UX effectiveness",
      "Conversions extend beyond purchases: registrations, subscriptions, downloads, feature usage, and retention milestones all qualify",
      "E-commerce sites averaged approximately 3% conversion rates, with typical ranges of 1-10% depending on industry and context",
      "Microconversions (add-to-cart, email signup) often exceed headline conversion percentages and serve as leading indicators",
      "Simplifying forms by removing unnecessary fields has directly quantifiable conversion impact — each eliminated question has calculable business value",
      "Monthly measurement periods work well for tracking, though ideal timeframes depend on traffic volume, seasonal patterns, and development cycles",
      "Optimisation differs from maximisation: accepting slightly lower conversion rates through strategic pricing can yield superior profitability",
      "Relative conversion rate changes matter more than absolute numbers for assessing design effectiveness",
    ],
    methodology_summary: "Expert analysis drawing on industry benchmarks, case studies from e-commerce redesigns, and NNGroup's usability research practice to define conversion measurement best practices.",
    sample_size: null,
    limitations: ["Benchmark data from 2013 — absolute conversion rates have shifted", "Primarily focused on Western e-commerce patterns", "Does not account for attribution complexity in multi-touch journeys"],
    tags: ["conversion-rate", "outcome-metrics", "e-commerce", "form-optimisation", "measurement", "kpi", "ux-effectiveness"],
    scores: [
      { criterion_name: "Total data volume", score: 6 },
      { criterion_name: "Time period covered", score: 7 },
      { criterion_name: "Industry vertical relevance", score: 9 },
      { criterion_name: "Measurement methodology transparency", score: 8 },
      { criterion_name: "Filtering and noise reduction explained", score: 6 },
      { criterion_name: "Sample representativeness across device types", score: 6 },
      { criterion_name: "Geographic spread of data", score: 5 },
      { criterion_name: "Data collection tool credibility", score: 8 },
      { criterion_name: "Segmentation depth", score: 7 },
      { criterion_name: "Publication date and data freshness", score: 4 },
      { criterion_name: "Conflict of interest disclosure", score: 6 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 8. Measuring Perceived Usability with SUS and Post-Task Scales
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: "Beyond the NPS: Measuring Perceived Usability with the SUS, NASA-TLX, and the Single Ease Question",
    source_url: "https://www.nngroup.com/articles/measuring-perceived-usability/",
    source_name: "Nielsen Norman Group",
    authors: ["Page Laubheimer"],
    publication_date: "2018-02-11",
    research_type: "survey",
    site_contexts: ["saas", "mobile_app", "ecommerce_general", "forms_data_entry"],
    attributed_summary: "NNGroup guide to standardised usability measurement instruments, distinguishing between post-test questionnaires (measuring perceived usability of an entire system) and post-task scales (identifying problematic parts of a design). Establishes SUS benchmarks from 500+ studies: average score of 68, top 10% at 80+, and top 30% at 73+. The article makes the case that outcome-oriented UX measurement requires combining satisfaction ratings with behavioural metrics and follow-up explanations.",
    key_findings: [
      "Post-test questionnaires like SUS measure overall perceived usability; post-task scales like SEQ pinpoint specific problematic interactions",
      "SUS benchmark from 500+ studies: average score is 68, top 10% score 80+, and top 30% score 73+ (scores are not percentages)",
      "The Single Ease Question (SEQ) on a 7-point scale provides immediate post-task feedback with minimal participant burden",
      "NASA-TLX measures six workload dimensions on 21-point scales, useful for complex or professional tool evaluation",
      "Post-test scores are influenced by the peak-end effect — users' strongest and most recent experiences disproportionately shape overall ratings",
      "Quantitative usability research requires 20-30 users minimum for reliable questionnaire data, compared to 5 users for qualitative testing",
      "Combining perceived usability scores with objective performance metrics (task success, errors) reveals gaps between user perception and actual performance",
    ],
    methodology_summary: "Expert methodology review synthesising published validation studies for SUS, SEQ, and NASA-TLX instruments, with benchmarks derived from meta-analysis of 500+ SUS administrations.",
    sample_size: "Meta-analysis of 500+ SUS studies",
    limitations: ["SUS benchmarks aggregate across diverse product types — industry-specific norms may differ", "Post-task measures can interrupt natural usage flow", "Cultural factors in perceived usability are not addressed"],
    tags: ["sus", "usability-questionnaire", "perceived-usability", "seq", "nasa-tlx", "benchmarks", "outcome-measurement", "user-satisfaction"],
    scores: [
      { criterion_name: "Sample size and response rate", score: 8 },
      { criterion_name: "Demographic weighting applied", score: 5 },
      { criterion_name: "Question design bias assessment", score: 8 },
      { criterion_name: "Validated scale used", score: 10 },
      { criterion_name: "Longitudinal vs one-time snapshot", score: 6 },
      { criterion_name: "Recruitment methodology", score: 6 },
      { criterion_name: "Statistical significance reported", score: 7 },
      { criterion_name: "Margin of error disclosed", score: 5 },
      { criterion_name: "Peer review status", score: 5 },
      { criterion_name: "Publication date", score: 6 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 9. Why You Only Need to Test with 5 Users
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: "Why You Only Need to Test with 5 Users",
    source_url: "https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/",
    source_name: "Nielsen Norman Group",
    authors: ["Jakob Nielsen"],
    publication_date: "2000-03-18",
    research_type: "academic",
    site_contexts: ["ecommerce_general", "saas", "mobile_app", "forms_data_entry", "onboarding"],
    attributed_summary: "Seminal paper establishing the mathematical model for diminishing returns in usability testing, now one of the most cited articles in UX research. Nielsen and Landauer's formula N×(1−L)^n demonstrates that a single test user reveals approximately 31% of usability problems, and by the fifth user, the team has uncovered roughly 85% of issues. The article argues that distributing testing budget across multiple small iterative rounds (3 studies of 5 users) yields better design outcomes than one large study of 15 users, because each round allows for redesign before the next test.",
    key_findings: [
      "The Nielsen-Landauer formula N×(1−L)^n models usability problem discovery, where L (proportion found per user) typically equals 0.31",
      "A single test user reveals approximately 31% of all usability problems in a design",
      "By the fifth user, approximately 85% of usability problems have been identified — additional users yield sharply diminishing returns",
      "Testing 15 users discovers nearly all problems, but three iterative rounds of 5 users each produces better design outcomes",
      "Iterative testing (test → redesign → retest) is more effective than one large study because each round fixes issues before the next",
      "The optimal testing strategy allocates budget across multiple small studies rather than concentrating it in one comprehensive round",
      "Zero users tested = zero insights; even one user is dramatically better than none for identifying critical usability failures",
    ],
    methodology_summary: "Mathematical modelling based on empirical data from multiple usability studies, deriving a predictive formula (later known as the Nielsen-Landauer model) for the relationship between number of test participants and proportion of usability problems discovered.",
    sample_size: "Derived from aggregate data across multiple usability studies",
    limitations: ["The 31% detection rate (L) varies across problem types and study contexts", "Assumes usability problems are independent — in practice some problems mask others", "Originally published in 2000 — testing methods have evolved significantly", "Model is most accurate for qualitative formative testing, not quantitative studies"],
    tags: ["usability-testing", "sample-size", "diminishing-returns", "iterative-design", "nielsen-landauer", "test-methodology", "cost-effectiveness"],
    scores: [
      { criterion_name: "Journal impact factor", score: 7 },
      { criterion_name: "Peer review process documented", score: 6 },
      { criterion_name: "Methodology reproducibility", score: 9 },
      { criterion_name: "Ethics approval documented", score: 4 },
      { criterion_name: "Citation count", score: 10 },
      { criterion_name: "Author institutional affiliation", score: 10 },
      { criterion_name: "Funding source transparency", score: 5 },
      { criterion_name: "Sample size and statistical power", score: 7 },
      { criterion_name: "Replication status", score: 9 },
      { criterion_name: "Publication date", score: 2 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 10. 10 Usability Heuristics — The Foundation of Design Evaluation
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: "10 Usability Heuristics for User Interface Design",
    source_url: "https://www.nngroup.com/articles/ten-usability-heuristics/",
    source_name: "Nielsen Norman Group",
    authors: ["Jakob Nielsen"],
    publication_date: "1994-04-24",
    research_type: "academic",
    site_contexts: ["ecommerce_general", "saas", "mobile_app", "forms_data_entry", "navigation_ia", "onboarding", "search_filtering"],
    attributed_summary: "The most widely cited framework in UX design, derived from factor analysis of 249 usability problems. Nielsen's 10 heuristics provide a systematic evaluation framework that has remained unchanged since 1994 and underpins heuristic evaluation methodology used worldwide. The heuristics cover visibility of system status, real-world mapping, user control, consistency, error prevention, recognition over recall, flexibility, minimalist design, error recovery, and help documentation — forming the basis for outcome-oriented design evaluation.",
    key_findings: [
      "10 heuristics derived from factor analysis of 249 usability problems to create an evaluation set with maximum explanatory power",
      "Visibility of system status: systems should always keep users informed about what is going on through timely, appropriate feedback",
      "Match between system and real world: use language, concepts, and conventions familiar to the user rather than system-oriented terms",
      "User control and freedom: provide clearly marked emergency exits (undo, redo) so users feel in control and can recover from mistakes",
      "Consistency and standards: follow platform and industry conventions so users don't have to wonder whether different words or actions mean the same thing",
      "Error prevention: design to prevent problems before they occur — eliminate error-prone conditions or present confirmation before committal actions",
      "Recognition rather than recall: minimise memory load by making objects, actions, and options visible rather than requiring users to remember information",
      "Flexibility and efficiency of use: provide accelerators and shortcuts that allow expert users to speed up interaction without hindering novices",
      "Aesthetic and minimalist design: interfaces should not contain irrelevant or rarely needed information — every extra unit of information competes with relevant content",
      "Help users recover from errors: error messages should be expressed in plain language, precisely indicate the problem, and constructively suggest a solution",
      "The framework has remained relevant and unchanged for 30+ years, demonstrating the enduring nature of fundamental usability principles",
    ],
    methodology_summary: "Factor analysis of 249 categorised usability problems from multiple studies, refined from an earlier collaboration with Rolf Molich (1990) to identify the minimal set of heuristics with maximum explanatory coverage.",
    sample_size: "249 usability problems analysed",
    limitations: ["Heuristics are broad principles, not specific design rules — application requires expert judgement", "Originally developed for desktop interfaces — mobile and voice interfaces may require supplementary heuristics", "Heuristic evaluation depends heavily on evaluator expertise — reliability varies"],
    tags: ["usability-heuristics", "nielsen-heuristics", "design-evaluation", "heuristic-evaluation", "ux-principles", "error-prevention", "design-framework"],
    scores: [
      { criterion_name: "Journal impact factor", score: 7 },
      { criterion_name: "Peer review process documented", score: 7 },
      { criterion_name: "Methodology reproducibility", score: 9 },
      { criterion_name: "Ethics approval documented", score: 3 },
      { criterion_name: "Citation count", score: 10 },
      { criterion_name: "Author institutional affiliation", score: 10 },
      { criterion_name: "Funding source transparency", score: 4 },
      { criterion_name: "Sample size and statistical power", score: 6 },
      { criterion_name: "Replication status", score: 10 },
      { criterion_name: "Publication date", score: 1 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 11. Personas vs Jobs-to-Be-Done — Outcome-Focused User Modelling
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: "Personas vs. Jobs-to-Be-Done: Outcome-Focused User Modelling",
    source_url: "https://www.nngroup.com/articles/personas-jobs-be-done/",
    source_name: "Nielsen Norman Group",
    authors: ["Page Laubheimer"],
    publication_date: "2017-08-06",
    research_type: "mixed_methods",
    site_contexts: ["saas", "ecommerce_general", "mobile_app", "onboarding"],
    attributed_summary: "NNGroup analysis comparing two foundational user-modelling approaches — personas and Jobs-to-Be-Done (JTBD) — and arguing they are complementary rather than competing frameworks. JTBD focuses on desired outcomes rather than features or tasks, defining what users aim to accomplish and their success criteria (functional and emotional). Well-crafted personas should incorporate behavioural insights comparable to JTBD. The key insight for outcome-oriented design: poor personas rely on demographics alone, while quality personas encode the same goal-driven thinking that JTBD formalises.",
    key_findings: [
      "Jobs-to-Be-Done (JTBD) focuses on desired outcomes rather than features or tasks — defining what users aim to accomplish and their success criteria",
      "JTBD captures both functional outcomes (what the user needs to get done) and emotional outcomes (how the user wants to feel)",
      "Well-crafted personas incorporate goals, pain points, and mental models that parallel JTBD definitions — the two frameworks are complementary",
      "Poor personas that rely solely on demographics are substantially less useful than marketing segments for design decisions",
      "Personas provide differentiation among user groups with competing needs, while JTBD clarifies specific user objectives — both are needed",
      "Outcome-oriented design benefits from combining 'who are the users' (personas) with 'what do they need to accomplish' (JTBD)",
      "JTBD is less prescriptive than traditional task analysis, allowing designers to explore novel solutions to the same underlying user job",
    ],
    methodology_summary: "Comparative analysis of two user-modelling frameworks drawing on qualitative UX research methodology, industry case studies, and NNGroup's consulting experience across product design engagements.",
    sample_size: null,
    limitations: ["Framework comparison rather than empirical study", "Does not quantify which approach leads to better design outcomes", "JTBD methodology varies significantly across practitioners"],
    tags: ["personas", "jobs-to-be-done", "jtbd", "user-modelling", "outcome-oriented", "user-goals", "design-methodology"],
    scores: [
      { criterion_name: "Qualitative and quantitative combination clearly defined", score: 7 },
      { criterion_name: "Whether methods corroborate each other", score: 7 },
      { criterion_name: "Sample sizes meet thresholds for both components", score: 5 },
      { criterion_name: "Integration methodology explained", score: 7 },
      { criterion_name: "Peer review status", score: 5 },
      { criterion_name: "Author credentials", score: 9 },
      { criterion_name: "Limitations of each method disclosed", score: 7 },
      { criterion_name: "Publication date", score: 6 },
      { criterion_name: "Citation count", score: 8 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 12. Error Message Design — Measurable Impact on Task Recovery
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: "Error-Message Guidelines: Designing for User Recovery and Task Completion",
    source_url: "https://www.nngroup.com/articles/error-message-guidelines/",
    source_name: "Nielsen Norman Group",
    authors: ["Tim Neusesser", "Evan Sunwall"],
    publication_date: "2023-05-14",
    research_type: "user_testing",
    site_contexts: ["forms_data_entry", "ecommerce_checkout", "saas", "onboarding", "accessibility"],
    attributed_summary: "NNGroup guidelines for error message design grounded in Jakob Nielsen's Heuristic #9 (help users recognise, diagnose, and recover from errors). The article establishes three core principles — visibility, communication, and efficiency — with practical examples from Amazon, Instagram, and Vistaprint. Error messages directly affect task completion outcomes: visible, plain-language messages with constructive suggestions enable faster recovery, while vague or technical error messages cause abandonment. The guidelines emphasise preserving user input during error correction to minimise friction.",
    key_findings: [
      "Error messages must be prominently displayed near the error location using high-contrast styling and redundant visual cues beyond colour alone",
      "Messages should use plain language, precisely describe the issue, and constructively suggest a solution — not blame the user",
      "Systems must preserve user input during error correction to prevent re-entry frustration and form abandonment",
      "Generic error messages ('Something went wrong') provide no recovery path and are a leading cause of task abandonment on forms",
      "Inline validation that shows errors as users complete each field outperforms end-of-form validation for complex forms",
      "Error prevention through design (disabled submit until valid, input masks, smart defaults) is more effective than error messaging",
      "Accessibility requires error indicators beyond colour: icons, text labels, and ARIA attributes for screen reader users",
    ],
    methodology_summary: "Heuristic analysis grounded in Nielsen's usability principles, illustrated with real-world examples from commercial implementations (Amazon, Instagram, Vistaprint) comparing effective and problematic error message patterns.",
    sample_size: null,
    limitations: ["Expert guidelines rather than controlled experiment", "Examples drawn from a limited set of commercial implementations", "Does not quantify error recovery rate improvements for specific message patterns"],
    tags: ["error-messages", "form-validation", "task-completion", "error-recovery", "heuristic-9", "accessibility", "outcome-oriented"],
    scores: [
      { criterion_name: "Sample size", score: 5 },
      { criterion_name: "Participant recruitment methodology", score: 6 },
      { criterion_name: "Demographic diversity and representation", score: 6 },
      { criterion_name: "Control variables documented", score: 7 },
      { criterion_name: "Variant / treatment clearly defined", score: 8 },
      { criterion_name: "Moderated vs unmoderated", score: 6 },
      { criterion_name: "Task success rate reported", score: 6 },
      { criterion_name: "Error rate documented", score: 8 },
      { criterion_name: "Time-on-task measured", score: 5 },
      { criterion_name: "Peer review status", score: 5 },
      { criterion_name: "Author credentials", score: 9 },
      { criterion_name: "Publication date (recency)", score: 8 },
      { criterion_name: "Limitations and bias disclosed", score: 7 },
      { criterion_name: "Replication or citation count", score: 7 },
    ],
  },

];

async function seed() {
  console.log(`Seeding batch 14: ${entries.length} entries...`);
  for (const e of entries) {
    const result = calculateScore(e.research_type, e.scores);
    const score = result.breakdown.weighted_total;
    const slug = slugify(e.title);
    if (!result.passed) { console.log(`✗ [FAIL ${score.toFixed(1)}] ${e.title}`); continue; }
    const { error } = await supabase.from("research_entries").upsert({
      slug, title: e.title, source_url: e.source_url, source_name: e.source_name,
      authors: e.authors, publication_date: e.publication_date,
      research_type: e.research_type, site_contexts: e.site_contexts,
      attributed_summary: e.attributed_summary, key_findings: e.key_findings,
      methodology_summary: e.methodology_summary, sample_size: e.sample_size,
      limitations: e.limitations, tags: e.tags,
      scoring_breakdown: result.breakdown, scoring_track: e.research_type,
      quality_score: score, status: "published",
    }, { onConflict: "slug" });
    console.log(`${error ? "✗" : "✓"} [${score.toFixed(1)}] ${e.title}${error ? " — " + error.message : ""}`);
  }
  console.log("Done.");
}
seed();
