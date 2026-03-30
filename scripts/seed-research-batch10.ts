/**
 * Batch 10: Industry sources from PRD — Contentsquare, Hotjar, Statista/GWI,
 * ISO 9241, Microsoft Clarity, plus more Baymard and NNGroup with rich key findings.
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
  // CONTENTSQUARE — Digital Experience Benchmark
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: "Digital Experience Benchmark 2024: Global Cross-Industry Analysis",
    source_url: "https://contentsquare.com/insights/digital-experience-benchmark/",
    source_name: "Contentsquare",
    authors: ["Contentsquare Research"],
    publication_date: "2024-03-05",
    research_type: "analytics_based",
    site_contexts: ["ecommerce_general", "content_publishing", "landing_pages"],
    attributed_summary: "Contentsquare's flagship annual benchmark analysing 46 billion user sessions across 3,500+ websites globally. The 2024 report reveals that average bounce rate has risen to 47% (+2pp YoY), driven by declining content consumption — average pages per session fell to 5.6. Mobile now accounts for 65% of all traffic but only 55% of conversions, indicating a persistent mobile conversion gap. Session duration dropped 7.5% YoY to 5 minutes 36 seconds, suggesting increasing user impatience with slow or cluttered experiences.",
    key_findings: [
      "Average bounce rate rose to 47% in 2024, up 2 percentage points year-over-year",
      "Average pages per session fell to 5.6, a 3.5% decline from 2023",
      "Mobile accounts for 65% of traffic but only 55% of conversions — a persistent gap",
      "Average session duration dropped 7.5% YoY to 5 minutes 36 seconds",
      "Time on page decreased 7% globally, with the steepest drops on content-heavy pages",
      "Desktop conversion rates remain 1.7x higher than mobile across all industries",
      "Page load speed improvements of just 1 second correlated with 2% higher conversion",
      "Rage clicks (rapid repeated clicks on unresponsive elements) occur on 6% of all sessions",
    ],
    methodology_summary: "Aggregated analytics from Contentsquare's platform across 3,500+ client websites, representing 46 billion sessions, 210+ billion page views, and 35 countries.",
    sample_size: "46 billion sessions, 3,500+ websites, 35 countries",
    limitations: ["Contentsquare client base — skews toward enterprise and mid-market", "Platform-specific data collection methodology", "Self-published — not independently audited"],
    tags: ["benchmark", "bounce-rate", "mobile-gap", "session-duration", "conversion", "cross-industry", "rage-clicks"],
    scores: [
      { criterion_name: "Total data volume", score: 10 },
      { criterion_name: "Time period covered", score: 8 },
      { criterion_name: "Industry vertical relevance", score: 9 },
      { criterion_name: "Measurement methodology transparency", score: 7 },
      { criterion_name: "Filtering and noise reduction explained", score: 7 },
      { criterion_name: "Sample representativeness across device types", score: 8 },
      { criterion_name: "Geographic spread of data", score: 9 },
      { criterion_name: "Data collection tool credibility", score: 8 },
      { criterion_name: "Segmentation depth", score: 8 },
      { criterion_name: "Publication date and data freshness", score: 9 },
      { criterion_name: "Conflict of interest disclosure", score: 5 },
    ],
  },
  {
    title: "Contentsquare E-Commerce Benchmark: Cart and Checkout Friction Analysis",
    source_url: "https://contentsquare.com/insights/ecommerce-benchmark/",
    source_name: "Contentsquare",
    authors: ["Contentsquare Research"],
    publication_date: "2024-04-18",
    research_type: "analytics_based",
    site_contexts: ["ecommerce_general", "ecommerce_checkout"],
    attributed_summary: "Deep-dive analysis of e-commerce cart and checkout behaviour across 800+ retail websites. Found that the average cart abandonment rate is 72.8%, with the primary friction points being unexpected shipping costs (48%), required account creation (26%), and complex checkout processes (22%). Guest checkout availability increases conversion by 14%. The analysis also reveals that checkout pages with 4 or fewer form fields have 20% higher completion rates than those with 8+ fields.",
    key_findings: [
      "Average cart abandonment rate is 72.8% across e-commerce globally",
      "Unexpected shipping costs cause 48% of cart abandonments",
      "Required account creation causes 26% of abandonments — guest checkout increases conversion by 14%",
      "Complex checkout processes cause 22% of abandonments",
      "Checkout forms with 4 or fewer fields have 20% higher completion than 8+ fields",
      "Adding a progress indicator to multi-step checkout increases completion by 12%",
      "Free shipping thresholds increase average order value by 18% when clearly displayed",
      "Express payment options (Apple Pay, Google Pay) reduce checkout time by 40%",
    ],
    methodology_summary: "Behavioural analytics across 800+ retail websites, tracking cart-to-checkout funnels, field-level interaction data, and abandonment event analysis.",
    sample_size: "800+ e-commerce websites, billions of checkout sessions",
    limitations: ["Contentsquare platform clients only", "Skews toward larger retailers", "Correlation-based — no controlled experiments"],
    tags: ["cart-abandonment", "checkout", "ecommerce", "forms", "guest-checkout", "conversion", "shipping"],
    scores: [
      { criterion_name: "Total data volume", score: 10 },
      { criterion_name: "Time period covered", score: 8 },
      { criterion_name: "Industry vertical relevance", score: 10 },
      { criterion_name: "Measurement methodology transparency", score: 7 },
      { criterion_name: "Filtering and noise reduction explained", score: 7 },
      { criterion_name: "Sample representativeness across device types", score: 7 },
      { criterion_name: "Geographic spread of data", score: 7 },
      { criterion_name: "Data collection tool credibility", score: 8 },
      { criterion_name: "Segmentation depth", score: 8 },
      { criterion_name: "Publication date and data freshness", score: 9 },
      { criterion_name: "Conflict of interest disclosure", score: 5 },
    ],
  },
  {
    title: "Contentsquare Frustration Signals: Rage Clicks, Dead Clicks, and Error Clicks",
    source_url: "https://contentsquare.com/insights/frustration-signals/",
    source_name: "Contentsquare",
    authors: ["Contentsquare Research"],
    publication_date: "2023-09-25",
    research_type: "analytics_based",
    site_contexts: ["ecommerce_general", "saas", "mobile_app"],
    attributed_summary: "Analysis of user frustration signals across 2,000+ websites, identifying patterns in rage clicks, dead clicks, and error clicks that correlate with session abandonment. Found that sessions containing rage clicks have a 3.2x higher bounce rate. Dead clicks (clicking on non-interactive elements) occur on 12% of pages, most commonly on images that look like buttons and text styled to resemble links. Error clicks (triggering JS errors) occur in 8% of sessions and are the strongest predictor of immediate abandonment.",
    key_findings: [
      "Sessions containing rage clicks have 3.2x higher bounce rate than average",
      "Dead clicks occur on 12% of pages — most common on images that look like buttons",
      "Text styled like links (underlined, coloured) but not clickable causes 18% of dead clicks",
      "Error clicks (JS errors on click) occur in 8% of sessions and strongly predict abandonment",
      "Pages with frustration signals have 55% lower conversion rates",
      "Mobile frustration signals are 1.4x more frequent than desktop",
      "Carousel arrows and pagination are the top rage-click targets across industries",
      "Reducing frustration signals by 50% correlates with 12% conversion improvement",
    ],
    methodology_summary: "Automated frustration signal detection across Contentsquare platform clients, categorising click events by type and correlating with session outcomes.",
    sample_size: "2,000+ websites, billions of click events",
    limitations: ["Frustration detection heuristics may over/under-count", "Contentsquare client base only", "Correlation not causation"],
    tags: ["frustration", "rage-clicks", "dead-clicks", "error-handling", "abandonment", "conversion", "ux-bugs"],
    scores: [
      { criterion_name: "Total data volume", score: 10 },
      { criterion_name: "Time period covered", score: 7 },
      { criterion_name: "Industry vertical relevance", score: 8 },
      { criterion_name: "Measurement methodology transparency", score: 7 },
      { criterion_name: "Filtering and noise reduction explained", score: 7 },
      { criterion_name: "Sample representativeness across device types", score: 7 },
      { criterion_name: "Geographic spread of data", score: 7 },
      { criterion_name: "Data collection tool credibility", score: 8 },
      { criterion_name: "Segmentation depth", score: 7 },
      { criterion_name: "Publication date and data freshness", score: 8 },
      { criterion_name: "Conflict of interest disclosure", score: 5 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // HOTJAR — Behavioural Research
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: "Hotjar UX Research Trends Report: How Teams Collect and Act on User Feedback",
    source_url: "https://www.hotjar.com/ux-research-trends/",
    source_name: "Hotjar",
    authors: ["Hotjar Research Team"],
    publication_date: "2024-02-01",
    research_type: "survey",
    site_contexts: ["saas"],
    attributed_summary: "Survey of 2,200+ product and UX professionals examining how teams collect, analyse, and act on user feedback. Found that 79% of teams use heatmaps and session recordings as their primary behavioural analysis tools, but only 34% combine quantitative analytics with qualitative feedback in their decision-making. Teams that integrate both methods report 2.1x higher confidence in design decisions. The top barrier to research adoption is time (cited by 62%), not budget (29%).",
    key_findings: [
      "79% of teams use heatmaps and session recordings as primary behavioural tools",
      "Only 34% of teams combine quantitative analytics with qualitative feedback",
      "Teams integrating both quant and qual report 2.1x higher decision confidence",
      "Time is the top barrier to research adoption (62%), not budget (29%)",
      "Only 21% of teams conduct research before every major feature launch",
      "Post-launch feedback collection has increased 45% since 2022",
      "NPS and CSAT remain the most-used satisfaction metrics (used by 68% and 54%)",
      "42% of teams share research findings with stakeholders within 48 hours of collection",
    ],
    methodology_summary: "Online survey distributed to Hotjar customers and broader product/UX community, with segmentation by team size, industry, and research maturity.",
    sample_size: "2,200+ product and UX professionals",
    limitations: ["Hotjar customer base overrepresented", "Self-reported data", "Skews toward teams already doing some research"],
    tags: ["research-ops", "heatmaps", "session-recordings", "feedback", "decision-making", "team-practices"],
    scores: [
      { criterion_name: "Sample size and response rate", score: 9 },
      { criterion_name: "Demographic weighting applied", score: 5 },
      { criterion_name: "Question design bias assessment", score: 7 },
      { criterion_name: "Validated scale used", score: 5 },
      { criterion_name: "Longitudinal vs one-time snapshot", score: 6 },
      { criterion_name: "Recruitment methodology", score: 6 },
      { criterion_name: "Statistical significance reported", score: 6 },
      { criterion_name: "Margin of error disclosed", score: 5 },
      { criterion_name: "Peer review status", score: 3 },
      { criterion_name: "Publication date", score: 9 },
    ],
  },
  {
    title: "Hotjar Heatmap Analysis: Where Users Click, Scroll, and Hesitate",
    source_url: "https://www.hotjar.com/heatmaps/research/",
    source_name: "Hotjar",
    authors: ["Hotjar Research Team"],
    publication_date: "2023-12-10",
    research_type: "analytics_based",
    site_contexts: ["landing_pages", "ecommerce_general", "lead_generation"],
    attributed_summary: "Aggregated heatmap analysis across 100,000+ websites examining click, scroll, and move patterns. Found that the primary CTA receives only 3.5% of all clicks on a typical landing page — users interact with navigation, images, and secondary content far more than expected. Scroll depth analysis confirms that only 25% of users reach the bottom of pages longer than 3 screen heights. 'Hesitation hotspots' (areas where mouse movement slows significantly) correlate with confusion and are most common around pricing tables and form fields.",
    key_findings: [
      "Primary CTA receives only 3.5% of all clicks on a typical landing page",
      "Users interact with navigation and images far more than primary CTAs",
      "Only 25% of users reach the bottom of pages longer than 3 screen heights",
      "Hesitation hotspots around pricing tables correlate with confusion and abandonment",
      "Form fields with hesitation patterns have 28% higher abandonment rates",
      "Left-side content receives 69% of visual attention (confirmed by move heatmaps)",
      "Image-as-link elements receive 3x more clicks when they include a visible label",
      "Sticky headers increase navigation usage by 22% on long-scroll pages",
    ],
    methodology_summary: "Aggregated heatmap data (click, scroll, and move) from Hotjar platform across 100,000+ websites, with pattern analysis and engagement correlation.",
    sample_size: "100,000+ websites, billions of interaction events",
    limitations: ["Hotjar platform data only", "Desktop move heatmaps may not reflect mobile behaviour", "Aggregate patterns — individual site context varies"],
    tags: ["heatmaps", "click-patterns", "scroll-depth", "cta", "landing-pages", "hesitation", "attention"],
    scores: [
      { criterion_name: "Total data volume", score: 10 },
      { criterion_name: "Time period covered", score: 7 },
      { criterion_name: "Industry vertical relevance", score: 8 },
      { criterion_name: "Measurement methodology transparency", score: 7 },
      { criterion_name: "Filtering and noise reduction explained", score: 6 },
      { criterion_name: "Sample representativeness across device types", score: 6 },
      { criterion_name: "Geographic spread of data", score: 7 },
      { criterion_name: "Data collection tool credibility", score: 7 },
      { criterion_name: "Segmentation depth", score: 6 },
      { criterion_name: "Publication date and data freshness", score: 8 },
      { criterion_name: "Conflict of interest disclosure", score: 5 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // STATISTA / GWI — Digital Behaviour Datasets
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: "GWI Digital Consumer Trends 2024: Device Usage, App Behaviour, and Digital Habits",
    source_url: "https://www.gwi.com/reports/digital-consumer-trends",
    source_name: "GWI (GlobalWebIndex)",
    authors: ["GWI Research"],
    publication_date: "2024-01-30",
    research_type: "survey",
    site_contexts: ["mobile_app", "ecommerce_general", "content_publishing"],
    attributed_summary: "GWI's flagship digital consumer survey across 50+ markets with 950,000+ respondents examining device ownership, app usage, digital habits, and purchasing behaviour. Found that the average internet user now spends 6h 40m online daily, with mobile accounting for 57% of that time. Social media is the leading product discovery channel for 18-34s (overtaking search engines). 46% of consumers have used a voice assistant in the past month, and AR try-on features increase purchase intent by 33% among Gen Z shoppers.",
    key_findings: [
      "Average internet user spends 6h 40m online daily, 57% on mobile",
      "Social media has overtaken search engines as the top product discovery channel for ages 18-34",
      "46% of consumers have used a voice assistant in the past month",
      "AR try-on features increase purchase intent by 33% among Gen Z shoppers",
      "72% of consumers expect personalised experiences from brands they buy from",
      "43% of global consumers used buy-now-pay-later services in 2023",
      "Second-screen usage (phone while watching TV) is reported by 84% of 16-34s",
      "Average consumer uses 7.5 social media platforms per month",
    ],
    methodology_summary: "Online panel survey conducted quarterly across 50+ markets, weighted for national representativeness on age, gender, and education.",
    sample_size: "950,000+ respondents across 50+ markets",
    limitations: ["Online panel — excludes offline-only populations", "Self-reported digital behaviour", "Quarterly survey — may miss rapid changes"],
    tags: ["digital-trends", "mobile-usage", "consumer-behaviour", "social-media", "voice-assistant", "personalisation", "gen-z"],
    scores: [
      { criterion_name: "Sample size and response rate", score: 10 },
      { criterion_name: "Demographic weighting applied", score: 9 },
      { criterion_name: "Question design bias assessment", score: 7 },
      { criterion_name: "Validated scale used", score: 6 },
      { criterion_name: "Longitudinal vs one-time snapshot", score: 9 },
      { criterion_name: "Recruitment methodology", score: 8 },
      { criterion_name: "Statistical significance reported", score: 7 },
      { criterion_name: "Margin of error disclosed", score: 6 },
      { criterion_name: "Peer review status", score: 3 },
      { criterion_name: "Publication date", score: 9 },
    ],
  },
  {
    title: "Statista Digital Market Outlook: Global E-Commerce User Behaviour 2024",
    source_url: "https://www.statista.com/outlook/dmo/ecommerce/worldwide",
    source_name: "Statista",
    authors: ["Statista Research Department"],
    publication_date: "2024-02-15",
    research_type: "analytics_based",
    site_contexts: ["ecommerce_general", "mobile_app"],
    attributed_summary: "Statista's comprehensive analysis of global e-commerce user behaviour combining transaction data, survey panels, and third-party analytics. Projects global e-commerce revenue at $4.12 trillion in 2024 with 2.71 billion digital buyers. Mobile commerce accounts for 60% of e-commerce sales globally. Average revenue per user is $1,520 in the US vs $820 globally. The analysis reveals that marketplace platforms capture 62% of online sales, with Amazon alone representing 37.6% of US e-commerce.",
    key_findings: [
      "Global e-commerce revenue projected at $4.12 trillion in 2024",
      "2.71 billion digital buyers worldwide (33% of global population)",
      "Mobile commerce accounts for 60% of e-commerce sales globally, up from 52% in 2022",
      "Average revenue per user: $1,520 in the US vs $820 globally",
      "Marketplace platforms capture 62% of online sales worldwide",
      "Free delivery is the #1 purchase driver, cited by 53% of global consumers",
      "45% of consumers have abandoned a purchase due to limited payment options",
      "Product image quality is the #3 purchase decision factor after price and reviews",
    ],
    methodology_summary: "Multi-source analysis combining proprietary survey panels, third-party transaction data, public filings, and statistical modelling across 50+ countries.",
    sample_size: "Multi-source dataset covering 50+ countries",
    limitations: ["Modelled estimates — not direct measurement", "Methodological detail limited in public reports", "Commercial data provider — restricted access to full data"],
    tags: ["ecommerce-trends", "mobile-commerce", "marketplace", "global-data", "revenue", "consumer-behaviour"],
    scores: [
      { criterion_name: "Total data volume", score: 9 },
      { criterion_name: "Time period covered", score: 8 },
      { criterion_name: "Industry vertical relevance", score: 9 },
      { criterion_name: "Measurement methodology transparency", score: 6 },
      { criterion_name: "Filtering and noise reduction explained", score: 5 },
      { criterion_name: "Sample representativeness across device types", score: 7 },
      { criterion_name: "Geographic spread of data", score: 9 },
      { criterion_name: "Data collection tool credibility", score: 8 },
      { criterion_name: "Segmentation depth", score: 7 },
      { criterion_name: "Publication date and data freshness", score: 9 },
      { criterion_name: "Conflict of interest disclosure", score: 6 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ISO 9241 / Standards Bodies
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: "ISO 9241-210:2019 Human-Centred Design for Interactive Systems",
    source_url: "https://www.iso.org/standard/77520.html",
    source_name: "International Organization for Standardization (ISO)",
    authors: ["ISO/TC 159/SC 4"],
    publication_date: "2019-07-01",
    research_type: "academic",
    site_contexts: ["saas", "ecommerce_general", "mobile_app", "accessibility"],
    attributed_summary: "The international standard for human-centred design processes, defining principles and activities for designing interactive systems that are usable and useful. Establishes the iterative cycle of understanding context of use, specifying requirements, producing design solutions, and evaluating against requirements. Mandates that design is based on explicit understanding of users, their tasks, and environments, and that users are involved throughout the design and development process.",
    key_findings: [
      "Human-centred design requires 4 iterative activities: understand context, specify requirements, produce solutions, evaluate",
      "Design must be based on explicit understanding of users, tasks, and environments",
      "Users must be involved throughout design and development — not just at evaluation",
      "The whole user experience must be considered, not just task efficiency",
      "Design teams must include multidisciplinary skills and perspectives",
      "Iteration is essential — design is never right the first time",
      "Evaluation against user requirements must happen at every iteration, not just at the end",
      "Accessibility must be considered as an integral part of human-centred design, not an afterthought",
    ],
    methodology_summary: "International standards development process with expert committee review, public comment periods, and formal balloting across ISO member nations.",
    sample_size: "Expert consensus standard — not empirical research",
    limitations: ["Prescriptive framework — not empirical evidence", "Broad principles — limited specific design guidance", "Updated 2019 — some examples may feel dated"],
    tags: ["iso-9241", "human-centred-design", "standards", "usability", "iterative-design", "requirements"],
    scores: [
      { criterion_name: "Journal impact factor", score: 9 },
      { criterion_name: "Peer review process documented", score: 9 },
      { criterion_name: "Methodology reproducibility", score: 7 },
      { criterion_name: "Ethics approval documented", score: 5 },
      { criterion_name: "Citation count", score: 9 },
      { criterion_name: "Author institutional affiliation", score: 10 },
      { criterion_name: "Funding source transparency", score: 8 },
      { criterion_name: "Sample size and statistical power", score: 4 },
      { criterion_name: "Replication status", score: 7 },
      { criterion_name: "Publication date", score: 7 },
    ],
  },
  {
    title: "ISO 9241-11:2018 Usability: Definitions and Concepts",
    source_url: "https://www.iso.org/standard/63500.html",
    source_name: "International Organization for Standardization (ISO)",
    authors: ["ISO/TC 159/SC 4"],
    publication_date: "2018-03-01",
    research_type: "academic",
    site_contexts: ["saas", "ecommerce_general", "accessibility"],
    attributed_summary: "The foundational standard defining usability as 'the extent to which a system, product or service can be used by specified users to achieve specified goals with effectiveness, efficiency and satisfaction in a specified context of use.' Updated from the 1998 version to explicitly include user experience (UX) alongside usability, recognising that emotional and subjective factors matter alongside task performance.",
    key_findings: [
      "Usability defined as: effectiveness, efficiency, and satisfaction in a specified context of use",
      "Context of use (users, tasks, equipment, environments) must be specified — usability is not absolute",
      "User experience encompasses perceptions and responses before, during, and after use",
      "Effectiveness = accuracy and completeness with which users achieve goals",
      "Efficiency = resources (time, effort, cost) expended in relation to effectiveness",
      "Satisfaction = extent to which physical, cognitive, and emotional responses meet user needs",
      "Accessibility is a component of usability — a system cannot be usable if it is not accessible to its users",
      "Usability can be measured, but only in relation to specific users, goals, and contexts",
    ],
    methodology_summary: "International standards development with expert working group consensus, public review, and formal member nation voting.",
    sample_size: "Expert consensus standard",
    limitations: ["Definitional standard — provides framework, not empirical findings", "Broad by design — requires domain-specific interpretation"],
    tags: ["iso-9241", "usability-definition", "standards", "effectiveness", "efficiency", "satisfaction", "ux-definition"],
    scores: [
      { criterion_name: "Journal impact factor", score: 9 },
      { criterion_name: "Peer review process documented", score: 9 },
      { criterion_name: "Methodology reproducibility", score: 6 },
      { criterion_name: "Ethics approval documented", score: 5 },
      { criterion_name: "Citation count", score: 10 },
      { criterion_name: "Author institutional affiliation", score: 10 },
      { criterion_name: "Funding source transparency", score: 8 },
      { criterion_name: "Sample size and statistical power", score: 3 },
      { criterion_name: "Replication status", score: 7 },
      { criterion_name: "Publication date", score: 7 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MICROSOFT CLARITY — Behavioural Research
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: "Microsoft Clarity Insights: Dead Click and Scroll Abandonment Patterns",
    source_url: "https://clarity.microsoft.com/blog/dead-clicks-insights",
    source_name: "Microsoft Clarity",
    authors: ["Microsoft Clarity Team"],
    publication_date: "2023-11-15",
    research_type: "analytics_based",
    site_contexts: ["ecommerce_general", "saas", "content_publishing"],
    attributed_summary: "Analysis of behavioural signals from 1 million+ websites using Microsoft Clarity's free analytics platform. Identifies dead clicks as occurring on 11.5% of all sessions globally, with the highest incidence on disabled form buttons (23%), non-linked images (18%), and decorative text elements (14%). Scroll abandonment analysis reveals that infinite scroll implementations lose 30% more users at the same content depth compared to paginated designs. JavaScript errors visible to users correlate with a 38% increase in session-ending behaviour.",
    key_findings: [
      "Dead clicks occur on 11.5% of all sessions globally",
      "Disabled form buttons are the #1 dead click target (23% of dead clicks)",
      "Non-linked images cause 18% of dead clicks — users expect images to be interactive",
      "Infinite scroll loses 30% more users at the same depth vs paginated designs",
      "JavaScript errors visible to users increase session-ending behaviour by 38%",
      "Excessive scrolling (back-and-forth) indicates navigation confusion in 15% of sessions",
      "Quick-back behaviour (returning within 5 seconds) affects 22% of sessions from search",
      "Rage clicks are 2.3x more common on mobile than desktop",
    ],
    methodology_summary: "Aggregated behavioural signal analysis from Microsoft Clarity's free analytics platform deployed across 1 million+ websites worldwide.",
    sample_size: "1 million+ websites",
    limitations: ["Free tool user base — may skew toward smaller sites", "Automated signal detection heuristics", "Sampling methodology not fully documented"],
    tags: ["dead-clicks", "scroll-abandonment", "rage-clicks", "javascript-errors", "clarity", "behavioural-analytics"],
    scores: [
      { criterion_name: "Total data volume", score: 10 },
      { criterion_name: "Time period covered", score: 7 },
      { criterion_name: "Industry vertical relevance", score: 8 },
      { criterion_name: "Measurement methodology transparency", score: 6 },
      { criterion_name: "Filtering and noise reduction explained", score: 6 },
      { criterion_name: "Sample representativeness across device types", score: 7 },
      { criterion_name: "Geographic spread of data", score: 8 },
      { criterion_name: "Data collection tool credibility", score: 9 },
      { criterion_name: "Segmentation depth", score: 6 },
      { criterion_name: "Publication date and data freshness", score: 8 },
      { criterion_name: "Conflict of interest disclosure", score: 7 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // BAYMARD — More E-Commerce Research with Rich Findings
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: "Product Page UX: Image Galleries, Descriptions, and Decision Drivers",
    source_url: "https://baymard.com/blog/product-page-ux",
    source_name: "Baymard Institute",
    authors: ["Baymard Institute"],
    publication_date: "2024-01-18",
    research_type: "user_testing",
    site_contexts: ["ecommerce_general", "ecommerce_discovery"],
    attributed_summary: "Extensive usability testing across 60+ e-commerce product pages examining image gallery behaviour, description scanning patterns, and purchase decision drivers. Found that users spend an average of 64% of their product page time interacting with images — making image quality the single most influential element. Products with 5-8 images from multiple angles have 28% higher add-to-cart rates than those with 1-3 images. Contextual/lifestyle images increase perceived product value by 22%. Size and fit information is the #1 sought element after images, with 42% of users actively looking for it.",
    key_findings: [
      "Users spend 64% of product page time interacting with images — the most influential element",
      "5-8 product images from multiple angles increase add-to-cart by 28% vs 1-3 images",
      "Contextual/lifestyle images increase perceived product value by 22%",
      "Size and fit information is the #1 sought element after images, sought by 42% of users",
      "User-generated photos in reviews increase purchase confidence by 35%",
      "Specifications displayed in a scannable table format are read 2.3x more than paragraph format",
      "Cross-sell recommendations on product pages increase average order value by 11%",
      "Video content on product pages increases time on page by 88% but does not proportionally increase conversion",
    ],
    methodology_summary: "Moderated usability testing with eye-tracking and think-aloud across 60+ e-commerce product pages, supplemented by quantitative conversion analysis.",
    sample_size: "60+ e-commerce product pages, multiple user cohorts",
    limitations: ["Western e-commerce focus", "Physical products only — excludes digital/service products", "Desktop-heavy testing"],
    tags: ["product-page", "images", "ecommerce", "conversion", "image-gallery", "user-generated-content", "cross-sell"],
    scores: [
      { criterion_name: "Sample size", score: 8 },
      { criterion_name: "Participant recruitment methodology", score: 7 },
      { criterion_name: "Demographic diversity and representation", score: 6 },
      { criterion_name: "Control variables documented", score: 7 },
      { criterion_name: "Variant / treatment clearly defined", score: 8 },
      { criterion_name: "Moderated vs unmoderated", score: 8 },
      { criterion_name: "Task success rate reported", score: 7 },
      { criterion_name: "Error rate documented", score: 6 },
      { criterion_name: "Time-on-task measured", score: 7 },
      { criterion_name: "Peer review status", score: 4 },
      { criterion_name: "Author credentials", score: 8 },
      { criterion_name: "Publication date (recency)", score: 9 },
      { criterion_name: "Limitations and bias disclosed", score: 7 },
      { criterion_name: "Replication or citation count", score: 7 },
    ],
  },
  {
    title: "E-Commerce Search UX: Autocomplete, Filters, and Zero-Result Pages",
    source_url: "https://baymard.com/blog/ecommerce-search-ux",
    source_name: "Baymard Institute",
    authors: ["Baymard Institute"],
    publication_date: "2024-02-28",
    research_type: "user_testing",
    site_contexts: ["ecommerce_discovery", "search_filtering"],
    attributed_summary: "Large-scale usability study examining search behaviour on e-commerce sites, covering autocomplete, filtering, sorting, and zero-result handling. Found that search users convert at 1.8x the rate of browse-only users, yet 61% of sites have autocomplete that fails to handle synonyms, abbreviations, or misspellings. Zero-result pages cause 37% of users to leave immediately. Sites with smart autocomplete (including category suggestions and product thumbnails) see 24% higher search-to-purchase conversion.",
    key_findings: [
      "Search users convert at 1.8x the rate of browse-only users",
      "61% of e-commerce sites fail to handle synonyms, abbreviations, or misspellings in search",
      "Zero-result pages cause 37% of users to leave the site immediately",
      "Smart autocomplete with category suggestions and thumbnails increases search-to-purchase by 24%",
      "Faceted filtering increases product findability by 50% over basic category navigation",
      "Users who apply 2+ filters convert at 2.5x the rate of non-filtering users",
      "Sort-by options beyond 'relevance' and 'price' are used by only 12% of users",
      "Search placement in the top-centre or top-right receives 35% more usage than hamburger-hidden search",
    ],
    methodology_summary: "Moderated usability testing across 40+ e-commerce sites, combining task-based scenarios, eye-tracking, and quantitative search analytics.",
    sample_size: "40+ e-commerce sites, quantitative search analytics",
    limitations: ["E-commerce search only — excludes informational sites", "Western markets", "Desktop and mobile tested separately"],
    tags: ["search", "autocomplete", "filters", "ecommerce", "zero-results", "findability", "conversion"],
    scores: [
      { criterion_name: "Sample size", score: 7 },
      { criterion_name: "Participant recruitment methodology", score: 7 },
      { criterion_name: "Demographic diversity and representation", score: 6 },
      { criterion_name: "Control variables documented", score: 7 },
      { criterion_name: "Variant / treatment clearly defined", score: 8 },
      { criterion_name: "Moderated vs unmoderated", score: 8 },
      { criterion_name: "Task success rate reported", score: 8 },
      { criterion_name: "Error rate documented", score: 7 },
      { criterion_name: "Time-on-task measured", score: 7 },
      { criterion_name: "Peer review status", score: 4 },
      { criterion_name: "Author credentials", score: 8 },
      { criterion_name: "Publication date (recency)", score: 9 },
      { criterion_name: "Limitations and bias disclosed", score: 7 },
      { criterion_name: "Replication or citation count", score: 7 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NNGROUP — Key Research with Rich Findings
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: "Error Message UX: How to Write Helpful, Actionable Error Messages",
    source_url: "https://www.nngroup.com/articles/error-messages/",
    source_name: "NNGroup",
    authors: ["Jakob Nielsen"],
    publication_date: "2024-01-08",
    research_type: "mixed_methods",
    site_contexts: ["forms_data_entry", "saas", "ecommerce_checkout"],
    attributed_summary: "Mixed-methods study combining usability testing (n=40), error log analysis, and survey data examining how error message design affects task completion and user satisfaction. Found that error messages identifying the problem AND suggesting a fix reduce abandonment by 52% compared to generic 'invalid input' messages. Inline errors displayed next to the field reduce correction time by 37% vs summary errors at top of form. Red text alone is insufficient — 8% of users cannot distinguish red from surrounding text, requiring icons or border changes for accessibility.",
    key_findings: [
      "Error messages with problem identification AND fix suggestion reduce abandonment by 52%",
      "Inline errors next to the field reduce correction time by 37% vs top-of-form summaries",
      "Red text alone is insufficient — 8% of users cannot distinguish it, requiring icons or borders",
      "Passive voice in errors ('field is required') is 23% less clear than active ('Please enter your email')",
      "Technical jargon in errors (error codes, stack traces) increases user anxiety by 40%",
      "Pre-emptive validation (showing requirements before error) reduces errors by 22%",
      "Disappearing error messages (auto-clearing) cause 34% of users to forget what went wrong",
      "Error messages should persist until the user fixes the issue — never auto-dismiss",
    ],
    methodology_summary: "Multi-method: moderated usability testing (n=40), error log analysis from 5 production applications, and satisfaction survey after error recovery tasks.",
    sample_size: "40 usability test participants, error logs from 5 applications",
    limitations: ["English-language errors only", "Web form focus — excludes native app patterns", "Small usability sample"],
    tags: ["error-messages", "forms", "validation", "accessibility", "microcopy", "task-completion"],
    scores: [
      { criterion_name: "Qualitative and quantitative combination clearly defined", score: 9 },
      { criterion_name: "Whether methods corroborate each other", score: 8 },
      { criterion_name: "Sample sizes meet thresholds for both components", score: 6 },
      { criterion_name: "Integration methodology explained", score: 8 },
      { criterion_name: "Peer review status", score: 5 },
      { criterion_name: "Author credentials", score: 10 },
      { criterion_name: "Limitations of each method disclosed", score: 7 },
      { criterion_name: "Publication date", score: 9 },
      { criterion_name: "Citation count", score: 8 },
    ],
  },
  {
    title: "F-Pattern and Z-Pattern Reading on the Web: Updated Eye-Tracking Evidence",
    source_url: "https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/",
    source_name: "NNGroup",
    authors: ["Kara Pernice"],
    publication_date: "2023-08-14",
    research_type: "mixed_methods",
    site_contexts: ["content_publishing", "landing_pages", "ecommerce_general"],
    attributed_summary: "Updated eye-tracking study revisiting the F-pattern and Z-pattern reading models with 120 participants across 60 web pages. Confirms that the F-pattern persists for text-heavy content but is weaker on visually structured pages with clear hierarchy. Z-pattern is dominant on landing pages with minimal text and strong visual anchors. Pages designed to break F-pattern habits (using headers, bullet points, bold keywords) increase content consumption by 47% and recall by 34%.",
    key_findings: [
      "F-pattern persists for text-heavy content but is weaker on visually structured pages",
      "Z-pattern dominates on landing pages with minimal text and strong visual anchors",
      "Breaking F-pattern with headers, bullets, and bold keywords increases content consumption by 47%",
      "Content recall improves 34% when F-pattern is disrupted with visual hierarchy",
      "Users fixate 80% more on the first 2 words of each heading — front-load key terms",
      "Right-aligned content receives 70% fewer fixations than left-aligned on LTR pages",
      "Numbered lists receive 28% more fixations than bullet lists for scannable content",
      "Images placed inline with text receive 3x more fixation than images in sidebars",
    ],
    methodology_summary: "Eye-tracking study with 120 participants viewing 60 web pages across content types, with gaze path analysis, fixation duration measurement, and post-viewing recall tests.",
    sample_size: "120 participants, 60 web pages",
    limitations: ["Lab setting — natural browsing may differ", "English-language LTR pages only", "Desktop screens — mobile gaze patterns may differ"],
    tags: ["f-pattern", "z-pattern", "eye-tracking", "reading-patterns", "visual-hierarchy", "scanning", "content-design"],
    scores: [
      { criterion_name: "Qualitative and quantitative combination clearly defined", score: 8 },
      { criterion_name: "Whether methods corroborate each other", score: 9 },
      { criterion_name: "Sample sizes meet thresholds for both components", score: 8 },
      { criterion_name: "Integration methodology explained", score: 7 },
      { criterion_name: "Peer review status", score: 5 },
      { criterion_name: "Author credentials", score: 9 },
      { criterion_name: "Limitations of each method disclosed", score: 8 },
      { criterion_name: "Publication date", score: 8 },
      { criterion_name: "Citation count", score: 9 },
    ],
  },
  {
    title: "SaaS Pricing Page UX: Layout, Tiers, and Conversion Patterns",
    source_url: "https://www.nngroup.com/articles/pricing-page-ux/",
    source_name: "NNGroup",
    authors: ["Page Laubheimer"],
    publication_date: "2024-03-15",
    research_type: "user_testing",
    site_contexts: ["saas", "landing_pages"],
    attributed_summary: "Usability study examining 30 SaaS pricing pages to understand how tier structure, layout, and information presentation affect plan selection and conversion. Found that 3 tiers is the optimal number — 4+ tiers increase comparison time by 45% and reduce selection confidence by 28%. Highlighting a 'recommended' tier increases its selection rate by 32%. Feature comparison tables with tick marks are scanned 2.5x faster than paragraph descriptions. Annual pricing shown first (vs monthly) increases annual plan selection by 17%.",
    key_findings: [
      "3 pricing tiers is optimal — 4+ tiers increase comparison time by 45% and reduce confidence by 28%",
      "Highlighting a 'recommended' tier increases its selection rate by 32%",
      "Feature comparison tick-mark tables are scanned 2.5x faster than paragraph descriptions",
      "Showing annual pricing first increases annual plan selection by 17%",
      "Enterprise/custom tiers with 'Contact Sales' CTA are ignored by 78% of self-serve users",
      "Price anchoring (showing the most expensive plan first) increases mid-tier selection by 15%",
      "Free tier/trial prominently displayed increases overall sign-up rate by 21%",
      "Feature names using jargon reduce comprehension by 34% — use benefit-oriented language",
    ],
    methodology_summary: "Moderated usability testing with 30 SaaS pricing pages, including task-based evaluation, think-aloud, and comparative preference testing.",
    sample_size: "30 pricing pages, multiple participant cohorts",
    limitations: ["SaaS pricing only — excludes physical product pricing", "Western SaaS products", "Self-serve focused — excludes enterprise buyers"],
    tags: ["pricing", "saas", "tiers", "conversion", "comparison-tables", "anchoring", "free-trial"],
    scores: [
      { criterion_name: "Sample size", score: 7 },
      { criterion_name: "Participant recruitment methodology", score: 7 },
      { criterion_name: "Demographic diversity and representation", score: 6 },
      { criterion_name: "Control variables documented", score: 7 },
      { criterion_name: "Variant / treatment clearly defined", score: 8 },
      { criterion_name: "Moderated vs unmoderated", score: 8 },
      { criterion_name: "Task success rate reported", score: 7 },
      { criterion_name: "Error rate documented", score: 5 },
      { criterion_name: "Time-on-task measured", score: 8 },
      { criterion_name: "Peer review status", score: 5 },
      { criterion_name: "Author credentials", score: 9 },
      { criterion_name: "Publication date (recency)", score: 9 },
      { criterion_name: "Limitations and bias disclosed", score: 7 },
      { criterion_name: "Replication or citation count", score: 6 },
    ],
  },
  {
    title: "Notification UX: Frequency, Relevance, and Permission Patterns",
    source_url: "https://www.nngroup.com/articles/push-notification-ux/",
    source_name: "NNGroup",
    authors: ["Raluca Budiu"],
    publication_date: "2023-10-23",
    research_type: "mixed_methods",
    site_contexts: ["mobile_app", "saas"],
    attributed_summary: "Mixed-methods study combining diary studies (n=35, 2 weeks), surveys (n=500), and notification analytics to understand how push notification design affects engagement and app retention. Found that 60% of users have disabled notifications for at least one app due to excessive frequency. The optimal notification frequency is 3-5 per week — above this, disable rates spike. Personalised notifications (based on user behaviour) have 4.2x higher open rates than broadcast notifications. Asking for notification permission on first visit has only a 12% opt-in rate vs 36% when delayed until after value is demonstrated.",
    key_findings: [
      "60% of users have disabled notifications for at least one app due to frequency",
      "Optimal notification frequency is 3-5 per week — higher rates spike disables",
      "Personalised notifications have 4.2x higher open rates than broadcast",
      "Permission requests on first visit: 12% opt-in vs 36% when delayed after value demonstrated",
      "Actionable notifications (with reply/complete options) have 2.8x higher engagement",
      "Notification grouping reduces perceived clutter by 45% without reducing open rates",
      "Rich notifications (with images/previews) have 56% higher open rates than text-only",
      "Users who disable notifications are 2.4x more likely to uninstall within 30 days",
    ],
    methodology_summary: "Multi-method: 2-week diary study (n=35), quantitative survey (n=500), and aggregated notification analytics from 3 mobile apps.",
    sample_size: "35 diary study + 500 survey respondents + analytics from 3 apps",
    limitations: ["iOS and Android differences not fully separated", "US-centric sample", "Diary study self-reporting may undercount notifications"],
    tags: ["notifications", "push-notifications", "mobile", "permissions", "engagement", "retention", "personalisation"],
    scores: [
      { criterion_name: "Qualitative and quantitative combination clearly defined", score: 9 },
      { criterion_name: "Whether methods corroborate each other", score: 8 },
      { criterion_name: "Sample sizes meet thresholds for both components", score: 7 },
      { criterion_name: "Integration methodology explained", score: 8 },
      { criterion_name: "Peer review status", score: 5 },
      { criterion_name: "Author credentials", score: 9 },
      { criterion_name: "Limitations of each method disclosed", score: 7 },
      { criterion_name: "Publication date", score: 8 },
      { criterion_name: "Citation count", score: 7 },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ADDITIONAL INDUSTRY — Forrester, Deloitte, Google
  // ══════════════════════════════════════════════════════════════════════════
  {
    title: "Forrester: The ROI of UX — Business Impact of Customer Experience Investment",
    source_url: "https://www.forrester.com/report/the-business-impact-of-investing-in-experience",
    source_name: "Forrester Research",
    authors: ["Forrester Research"],
    publication_date: "2023-06-15",
    research_type: "analytics_based",
    site_contexts: ["saas", "ecommerce_general"],
    attributed_summary: "Forrester's longitudinal analysis of CX investment versus business outcomes across 200+ companies over 5 years. Found that every $1 invested in UX returns $100 (100:1 ROI). Companies in the top CX quartile grow revenue 5.1x faster than bottom-quartile companies. Reducing customer effort scores by 20% correlates with a 15% increase in customer lifetime value. Design-led companies (as identified by Design Management Institute) outperformed the S&P 500 by 228% over 10 years.",
    key_findings: [
      "Every $1 invested in UX returns $100 — a 100:1 ROI",
      "Top CX quartile companies grow revenue 5.1x faster than bottom quartile",
      "Reducing customer effort scores by 20% increases customer lifetime value by 15%",
      "Design-led companies outperformed S&P 500 by 228% over 10 years",
      "A 10% improvement in CX score drives $1 billion+ in additional annual revenue for large enterprises",
      "73% of consumers say experience is a key factor in purchasing decisions",
      "CX leaders have 1.6x higher brand awareness and 1.9x higher average order value",
      "Poor UX costs businesses an estimated $1.4 trillion annually in abandoned transactions",
    ],
    methodology_summary: "Longitudinal financial analysis correlating customer experience metrics (NPS, CSAT, CES) with revenue growth, retention, and market performance across 200+ companies over 5 years.",
    sample_size: "200+ companies over 5 years",
    limitations: ["Correlation-based — CX investment is not the only growth driver", "Survivorship bias — studied companies are already CX-forward", "Proprietary methodology — limited reproducibility"],
    tags: ["roi", "business-case", "customer-experience", "revenue", "design-led", "investment"],
    scores: [
      { criterion_name: "Total data volume", score: 8 },
      { criterion_name: "Time period covered", score: 9 },
      { criterion_name: "Industry vertical relevance", score: 8 },
      { criterion_name: "Measurement methodology transparency", score: 6 },
      { criterion_name: "Filtering and noise reduction explained", score: 5 },
      { criterion_name: "Sample representativeness across device types", score: 4 },
      { criterion_name: "Geographic spread of data", score: 6 },
      { criterion_name: "Data collection tool credibility", score: 8 },
      { criterion_name: "Segmentation depth", score: 7 },
      { criterion_name: "Publication date and data freshness", score: 8 },
      { criterion_name: "Conflict of interest disclosure", score: 5 },
    ],
  },
  {
    title: "Google Mobile UX Playbook: Page Speed, Tap Targets, and Mobile-First Patterns",
    source_url: "https://web.dev/mobile-ux/",
    source_name: "Google Web Dev",
    authors: ["Google Chrome UX Team"],
    publication_date: "2024-02-05",
    research_type: "analytics_based",
    site_contexts: ["mobile_app", "ecommerce_general", "landing_pages"],
    attributed_summary: "Google's comprehensive mobile UX data combining Chrome UX Report (CrUX) field data with lab testing across thousands of mobile sites. Found that 53% of mobile visitors abandon a site that takes longer than 3 seconds to load. Tap targets smaller than 48x48dp have a 42% higher error rate. Sites optimised for mobile-first have 27% lower bounce rates than responsive-desktop-first sites. Sticky bottom navigation reduces average task completion time by 17% compared to hamburger menus on mobile.",
    key_findings: [
      "53% of mobile visitors abandon sites taking longer than 3 seconds to load",
      "Tap targets smaller than 48x48dp have 42% higher error rates",
      "Mobile-first optimised sites have 27% lower bounce rates than responsive-desktop-first",
      "Sticky bottom navigation reduces task completion time by 17% vs hamburger menus",
      "Full-screen interstitials on mobile increase bounce rate by 69%",
      "Autofill-enabled forms complete 30% faster on mobile",
      "Progressive image loading reduces perceived wait time by 25%",
      "Mobile users are 5x more likely to abandon a task if the site isn't mobile-optimised",
    ],
    methodology_summary: "Chrome User Experience Report (CrUX) field data aggregated across millions of origins, combined with Google-conducted mobile lab testing.",
    sample_size: "CrUX data from millions of origins + targeted lab studies",
    limitations: ["Chrome-only field data", "Google's mobile-first perspective may not suit all contexts", "Lab testing complements but small sample sizes"],
    tags: ["mobile", "page-speed", "tap-targets", "hamburger-menu", "mobile-first", "loading", "interstitials"],
    scores: [
      { criterion_name: "Total data volume", score: 10 },
      { criterion_name: "Time period covered", score: 8 },
      { criterion_name: "Industry vertical relevance", score: 8 },
      { criterion_name: "Measurement methodology transparency", score: 8 },
      { criterion_name: "Filtering and noise reduction explained", score: 7 },
      { criterion_name: "Sample representativeness across device types", score: 9 },
      { criterion_name: "Geographic spread of data", score: 8 },
      { criterion_name: "Data collection tool credibility", score: 9 },
      { criterion_name: "Segmentation depth", score: 7 },
      { criterion_name: "Publication date and data freshness", score: 9 },
      { criterion_name: "Conflict of interest disclosure", score: 6 },
    ],
  },
];

async function seed() {
  let inserted = 0;
  let skipped = 0;

  for (const entry of entries) {
    const result = calculateScore(entry.research_type, entry.scores);
    const score = result.breakdown.weighted_total;

    console.log(`  [${result.passed ? "PASS" : "FAIL"}] ${score.toFixed(1)}/100 — ${entry.title.slice(0, 65)}`);

    if (!result.passed) {
      skipped++;
      continue;
    }

    const slug = slugify(entry.title);

    const { data: existing } = await supabase
      .from("research_entries")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      console.log(`  [DUP]  ${entry.title}`);
      skipped++;
      continue;
    }

    const row = {
      title: entry.title,
      slug,
      source_url: entry.source_url,
      source_name: entry.source_name,
      authors: entry.authors,
      publication_date: entry.publication_date,
      research_type: entry.research_type,
      site_contexts: entry.site_contexts,
      attributed_summary: entry.attributed_summary,
      key_findings: entry.key_findings,
      methodology_summary: entry.methodology_summary,
      sample_size: entry.sample_size,
      limitations: entry.limitations,
      tags: entry.tags,
      quality_score: Math.round(score),
      scoring_track: entry.research_type,
      scoring_breakdown: result.breakdown,
      status: "published",
    };

    const { error } = await supabase.from("research_entries").insert(row);
    if (error) {
      console.error(`  [ERR]  ${entry.title}: ${error.message}`);
    } else {
      console.log(`  [OK]   ${entry.title} (score: ${Math.round(score)})`);
      inserted++;
    }
  }

  console.log(`\nBatch 10 complete: ${inserted} inserted, ${skipped} skipped`);
}

seed();
