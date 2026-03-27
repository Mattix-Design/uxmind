import {
  BaseScraper,
  type ScrapedArticle,
  type IngestableEntry,
} from "./base-scraper.js";
import { calculateScore, type ScoreInput } from "../../packages/scoring/src/calculator.js";
import type { ResearchType, SiteContext } from "../../packages/types/src/research.js";

// NNGroup pages to discover research articles from
const TOPIC_URLS = [
  "https://www.nngroup.com/articles/",
  "https://www.nngroup.com/topic/web-usability/",
  "https://www.nngroup.com/topic/mobile-ux/",
  "https://www.nngroup.com/topic/ecommerce/",
  "https://www.nngroup.com/topic/search/",
  "https://www.nngroup.com/topic/form-design/",
  "https://www.nngroup.com/topic/navigation/",
  "https://www.nngroup.com/topic/writing-web/",
  "https://www.nngroup.com/topic/accessibility-usability/",
  "https://www.nngroup.com/topic/user-testing/",
  "https://www.nngroup.com/topic/eyetracking/",
  "https://www.nngroup.com/topic/analytics-metrics/",
];

// Site context keyword mapping
const CONTEXT_KEYWORDS: Record<string, SiteContext> = {
  "e-commerce": "ecommerce_general",
  "ecommerce": "ecommerce_general",
  "checkout": "ecommerce_checkout",
  "cart": "ecommerce_checkout",
  "product page": "ecommerce_discovery",
  "search": "search_filtering",
  "filter": "search_filtering",
  "navigation": "navigation_ia",
  "menu": "navigation_ia",
  "information architecture": "navigation_ia",
  "mobile": "mobile_app",
  "form": "forms_data_entry",
  "input": "forms_data_entry",
  "onboarding": "onboarding",
  "saas": "saas",
  "dashboard": "saas",
  "accessibility": "accessibility",
  "a11y": "accessibility",
  "wcag": "accessibility",
  "landing page": "landing_pages",
  "conversion": "landing_pages",
  "lead gen": "lead_generation",
};

export class NNGroupScraper extends BaseScraper {
  sourceName = "NNGroup";
  baseUrl = "https://www.nngroup.com";

  async discoverArticleUrls(): Promise<string[]> {
    const urls: string[] = [];

    for (const topicUrl of TOPIC_URLS) {
      try {
        const html = await this.fetchPage(topicUrl);
        const $ = this.loadHtml(html);

        // NNGroup topic pages link to individual articles
        $('a[href^="/articles/"]').each((_, el) => {
          const href = $(el).attr("href");
          if (
            href &&
            href !== "/articles/" &&
            !href.includes("#") &&
            !href.includes("/author/") &&
            !href.includes("/topic/")
          ) {
            const fullUrl = `${this.baseUrl}${href}`;
            if (!urls.includes(fullUrl)) {
              urls.push(fullUrl);
            }
          }
        });

        await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`  [warn] Skipping topic page ${topicUrl}: ${msg}`);
      }
    }

    return urls;
  }

  async scrapeArticle(url: string): Promise<ScrapedArticle> {
    const html = await this.fetchPage(url);
    const $ = this.loadHtml(html);

    const title =
      $("h1").first().text().trim() ||
      $('meta[property="og:title"]').attr("content") ||
      "";

    // Authors
    const authors: string[] = [];
    $('a[href*="/articles/author/"], .article-author, [rel="author"]').each(
      (_, el) => {
        const name = $(el).text().trim();
        if (name && !authors.includes(name)) {
          authors.push(name);
        }
      }
    );

    // Publication date
    const dateStr =
      $('meta[property="article:published_time"]').attr("content") ||
      $("time").attr("datetime") ||
      null;

    const publication_date = dateStr ? dateStr.split("T")[0] : null;

    // Main article content
    const contentSelectors = [
      "article",
      ".article-body",
      ".article-content",
      '[role="main"]',
      "main",
    ];

    let content_text = "";
    for (const sel of contentSelectors) {
      const text = $(sel).text().trim();
      if (text.length > 200) {
        content_text = text;
        break;
      }
    }

    if (!content_text) {
      content_text = $("body").text().trim();
    }

    return {
      title,
      url,
      authors,
      publication_date,
      content_text,
      methodology_summary: null,
      sample_size: null,
    };
  }

  async buildEntry(article: ScrapedArticle): Promise<IngestableEntry | null> {
    if (!article.title || article.content_text.length < 300) {
      return null;
    }

    const researchType = this.detectResearchType(article.content_text);
    const siteContexts = this.detectSiteContexts(
      article.title + " " + article.content_text
    );
    const keyFindings = this.extractKeyFindings(article.content_text);
    const summary = this.generateSummary(article);

    // Score the entry
    const scoreInputs = this.buildScoreInputs(article, researchType);
    const result = calculateScore(researchType, scoreInputs);

    return {
      title: article.title,
      slug: this.slugify(article.title),
      attributed_summary: summary,
      source_url: article.url,
      source_name: this.sourceName,
      authors: article.authors,
      publication_date: article.publication_date,
      research_type: researchType,
      site_contexts: siteContexts,
      quality_score: result.breakdown.weighted_total,
      scoring_track: researchType,
      scoring_breakdown: result.breakdown,
      key_findings: keyFindings,
      methodology_summary: article.methodology_summary,
      sample_size: article.sample_size,
      limitations: [],
      tags: this.extractTags(article),
      status: "published",
    };
  }

  private detectResearchType(text: string): ResearchType {
    const lower = text.toLowerCase();

    const signals: Record<ResearchType, string[]> = {
      user_testing: [
        "usability test",
        "user test",
        "task completion",
        "think aloud",
        "moderated",
        "unmoderated",
        "participants",
        "eye tracking",
      ],
      analytics_based: [
        "analytics",
        "page views",
        "sessions",
        "bounce rate",
        "click-through",
        "heatmap",
        "conversion rate",
        "a/b test",
      ],
      survey: [
        "survey",
        "questionnaire",
        "respondents",
        "likert",
        "nps",
        "sus score",
        "satisfaction",
      ],
      academic: [
        "peer-reviewed",
        "journal",
        "doi",
        "et al",
        "hypothesis",
        "statistical significance",
        "p-value",
      ],
      mixed_methods: [
        "mixed method",
        "qualitative and quantitative",
        "triangulat",
      ],
    };

    let best: ResearchType = "user_testing";
    let bestCount = 0;

    for (const [type, keywords] of Object.entries(signals)) {
      const count = keywords.filter((kw) => lower.includes(kw)).length;
      if (count > bestCount) {
        bestCount = count;
        best = type as ResearchType;
      }
    }

    return best;
  }

  private detectSiteContexts(text: string): SiteContext[] {
    const lower = text.toLowerCase();
    const contexts: SiteContext[] = [];

    for (const [keyword, context] of Object.entries(CONTEXT_KEYWORDS)) {
      if (lower.includes(keyword) && !contexts.includes(context)) {
        contexts.push(context);
      }
    }

    return contexts.length > 0 ? contexts : ["ecommerce_general"];
  }

  private extractKeyFindings(text: string): string[] {
    // Extract sentences that look like findings (contain research-like language)
    const sentences = text
      .replace(/\n+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.length > 40 && s.length < 300);

    const findingSignals = [
      "found that",
      "showed that",
      "results indicate",
      "users prefer",
      "increased by",
      "decreased by",
      "more likely",
      "less likely",
      "significant",
      "on average",
      "percent",
      "%",
    ];

    const findings = sentences
      .filter((s) => {
        const lower = s.toLowerCase();
        return findingSignals.some((signal) => lower.includes(signal));
      })
      .slice(0, 5);

    return findings.length > 0
      ? findings
      : sentences.slice(0, 3).map((s) => s.trim());
  }

  private generateSummary(article: ScrapedArticle): string {
    // Take the first ~500 chars of content as a summary base,
    // trimmed to the last complete sentence
    const raw = article.content_text.slice(0, 600);
    const lastPeriod = raw.lastIndexOf(".");
    const summary = lastPeriod > 100 ? raw.slice(0, lastPeriod + 1) : raw;

    return `${article.title}. ${summary} (Source: ${this.sourceName}, ${article.url})`;
  }

  private buildScoreInputs(
    article: ScrapedArticle,
    researchType: ResearchType
  ): ScoreInput[] {
    const text = article.content_text.toLowerCase();

    // NNGroup is a high-authority source, so baseline scores reflect that
    const authorCredentials = 8; // NNGroup authors are established UX researchers
    const peerReview = 4; // Not formally peer-reviewed, but editorially reviewed

    // Detect methodology quality signals in the text
    const hasSampleSize =
      /\d+\s*(participants?|users?|people|respondents?)/.test(text);
    const hasMetrics =
      text.includes("task success") ||
      text.includes("completion rate") ||
      text.includes("error rate");
    const hasTimeOnTask =
      text.includes("time on task") || text.includes("seconds");
    const hasLimitations =
      text.includes("limitation") || text.includes("caveat");

    // Calculate recency score
    let recencyScore = 5;
    if (article.publication_date) {
      const pubYear = new Date(article.publication_date).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - pubYear;
      if (age <= 2) recencyScore = 10;
      else if (age <= 5) recencyScore = 7;
      else recencyScore = 4;
    }

    // Build inputs based on research type
    // These are conservative baseline scores — a human reviewer should adjust them
    if (researchType === "user_testing") {
      return [
        { criterion_name: "Sample size", score: hasSampleSize ? 7 : 4 },
        { criterion_name: "Participant recruitment methodology", score: 5 },
        { criterion_name: "Demographic diversity and representation", score: 5 },
        { criterion_name: "Control variables documented", score: 5 },
        { criterion_name: "Variant / treatment clearly defined", score: 6 },
        { criterion_name: "Moderated vs unmoderated", score: 7 },
        { criterion_name: "Task success rate reported", score: hasMetrics ? 7 : 4 },
        { criterion_name: "Error rate documented", score: hasMetrics ? 6 : 3 },
        { criterion_name: "Time-on-task measured", score: hasTimeOnTask ? 7 : 3 },
        { criterion_name: "Peer review status", score: peerReview },
        { criterion_name: "Author credentials", score: authorCredentials },
        { criterion_name: "Publication date (recency)", score: recencyScore },
        { criterion_name: "Limitations and bias disclosed", score: hasLimitations ? 7 : 4 },
        { criterion_name: "Replication or citation count", score: 6 },
      ];
    }

    if (researchType === "analytics_based") {
      return [
        { criterion_name: "Total data volume", score: 6 },
        { criterion_name: "Time period covered", score: 6 },
        { criterion_name: "Industry vertical relevance", score: 7 },
        { criterion_name: "Measurement methodology transparency", score: 6 },
        { criterion_name: "Filtering and noise reduction explained", score: 5 },
        { criterion_name: "Sample representativeness across device types", score: 6 },
        { criterion_name: "Geographic spread of data", score: 5 },
        { criterion_name: "Data collection tool credibility", score: 7 },
        { criterion_name: "Segmentation depth", score: 5 },
        { criterion_name: "Publication date and data freshness", score: recencyScore },
        { criterion_name: "Conflict of interest disclosure", score: 6 },
      ];
    }

    if (researchType === "survey") {
      return [
        { criterion_name: "Sample size and response rate", score: hasSampleSize ? 7 : 5 },
        { criterion_name: "Demographic weighting applied", score: 5 },
        { criterion_name: "Question design bias assessment", score: 5 },
        { criterion_name: "Validated scale used", score: 6 },
        { criterion_name: "Longitudinal vs one-time snapshot", score: 4 },
        { criterion_name: "Recruitment methodology", score: 5 },
        { criterion_name: "Statistical significance reported", score: 5 },
        { criterion_name: "Margin of error disclosed", score: 4 },
        { criterion_name: "Peer review status", score: peerReview },
        { criterion_name: "Publication date", score: recencyScore },
      ];
    }

    if (researchType === "academic") {
      return [
        { criterion_name: "Journal impact factor", score: 5 },
        { criterion_name: "Peer review process documented", score: peerReview },
        { criterion_name: "Methodology reproducibility", score: 5 },
        { criterion_name: "Ethics approval documented", score: 3 },
        { criterion_name: "Citation count", score: 6 },
        { criterion_name: "Author institutional affiliation", score: authorCredentials },
        { criterion_name: "Funding source transparency", score: 4 },
        { criterion_name: "Sample size and statistical power", score: hasSampleSize ? 6 : 4 },
        { criterion_name: "Replication status", score: 4 },
        { criterion_name: "Publication date", score: recencyScore },
      ];
    }

    // mixed_methods
    return [
      { criterion_name: "Qualitative and quantitative combination clearly defined", score: 6 },
      { criterion_name: "Whether methods corroborate each other", score: 6 },
      { criterion_name: "Sample sizes meet thresholds for both components", score: hasSampleSize ? 6 : 4 },
      { criterion_name: "Integration methodology explained", score: 5 },
      { criterion_name: "Peer review status", score: peerReview },
      { criterion_name: "Author credentials", score: authorCredentials },
      { criterion_name: "Limitations of each method disclosed", score: hasLimitations ? 6 : 4 },
      { criterion_name: "Publication date", score: recencyScore },
      { criterion_name: "Citation count", score: 5 },
    ];
  }

  private extractTags(article: ScrapedArticle): string[] {
    const tags: string[] = ["ux", "nngroup"];
    const lower = (article.title + " " + article.content_text).toLowerCase();

    const tagKeywords: Record<string, string> = {
      "usability": "usability",
      "accessibility": "accessibility",
      "mobile": "mobile",
      "responsive": "responsive",
      "e-commerce": "ecommerce",
      "checkout": "checkout",
      "navigation": "navigation",
      "search": "search",
      "form": "forms",
      "typography": "typography",
      "color": "color",
      "layout": "layout",
      "cognitive load": "cognitive-load",
      "user research": "user-research",
      "information architecture": "information-architecture",
      "interaction design": "interaction-design",
      "visual design": "visual-design",
    };

    for (const [keyword, tag] of Object.entries(tagKeywords)) {
      if (lower.includes(keyword) && !tags.includes(tag)) {
        tags.push(tag);
      }
    }

    return tags;
  }
}
