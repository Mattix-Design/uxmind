# UXMind.ai PRD Addendum: Dual Scoring System

**Version:** 1.1
**Date:** 2026-03-28
**Status:** Approved
**Supersedes:** PRD v1.0, Section 5 (Research Quality Scoring)

---

## Version History

| Version | Date | Change |
|---------|------|--------|
| v1.0 | — | Single "Research Quality Score" framework |
| v1.1 | 2026-03-28 | Added Impact Score dimension to scoring framework |

---

## 1. Scoring System Update: Dual Metrics

UXMind v1.0 shipped with a single composite score per research entry, referred to as the "Research Quality Score." While effective at measuring methodology rigor, user feedback and internal analysis revealed a fundamental ambiguity: a score of 75/100 could mean "the research is pretty good quality" or "the finding strongly supports this design choice" — and users had no way to distinguish between the two.

v1.1 replaces the single score with two complementary metrics that separate **trustworthiness** from **usefulness**.

---

### 1a. Evidence Score (formerly Quality Score)

> Answers the question: **"How trustworthy is this research?"**

The Evidence Score is unchanged from v1.0. It measures the methodological rigor of the underlying research.

- **Rubrics:** 5 research-type-specific scoring tracks (User Testing, Analytics-Based, Survey, Academic, Mixed Methods)
- **Criteria per track:** 10-14 weighted factors including sample size adequacy, peer review status, methodology transparency, statistical validity, and researcher credibility
- **Scale:** 0-100
- **Minimum threshold:** 65/100 — entries scoring below this are rejected from the library
- **Core IP:** The rubric weights and scoring logic remain proprietary

---

### 1b. Impact Score (NEW)

> Answers the question: **"How useful is this for my design decisions?"**

The Impact Score measures how actionable and impactful a study's findings are for practitioners making design decisions. Unlike the Evidence Score, it uses a single **universal rubric** applied identically across all research types — because practical impact is not methodology-dependent.

**Criteria:**

| # | Criterion | Weight | Description |
|---|-----------|--------|-------------|
| 1 | Effect size / magnitude | 25% | How large is the measured effect? Larger effects translate to more meaningful design changes. |
| 2 | Actionability | 20% | Does the study provide clear, specific design recommendations that a practitioner can act on? |
| 3 | Generalizability | 20% | How broadly applicable are the findings across different products, platforms, and user populations? |
| 4 | Consistency of findings | 15% | Are results consistent across experimental conditions, user segments, or repeated measurements? |
| 5 | Real-world validation | 10% | Were findings validated in production environments, or do they exist only in lab/controlled settings? |
| 6 | User outcome clarity | 10% | Does the study report a clear, measurable user outcome (e.g., task completion rate, error reduction)? |

- **Scale:** 0-100
- **Minimum threshold:** None — all published entries receive an Impact Score. This metric is informational, not a quality gate.

---

### 1c. How the Two Scores Work Together

The dual-score system captures the reality that research quality and research usefulness are independent dimensions.

| Scenario | Evidence Score | Impact Score | Interpretation |
|----------|--------------|-------------|----------------|
| Gold standard | High (85+) | High (85+) | Rigorous study with highly actionable findings. Surface prominently. |
| Trustworthy but inconclusive | High (85+) | Low (<65) | Well-designed study, but results are narrow, ambiguous, or lack clear recommendations. |
| Small but actionable | Moderate (65-74) | High (85+) | Smaller or less rigorous study, but findings are clear and directly applicable. Flag the evidence limitation. |
| Baseline reference | Moderate (65-74) | Moderate (65-74) | Solid supporting material. Useful in combination with other sources. |

Users can sort and filter the research library by either metric independently. The chat interface surfaces both scores as part of its citation confidence system.

---

## 2. Display Guidelines

### Color Scheme

- **Evidence Score:** Coral / Amber / Green gradient (carried forward from v1.0)
- **Impact Score:** Blue gradient (new)

Using distinct color families ensures users can immediately distinguish which metric they are looking at.

### Score Labels

| Range | Evidence Score Label | Impact Score Label |
|-------|---------------------|-------------------|
| 85-100 | Strong | Highly Actionable |
| 70-84 | Good | Actionable |
| 65-69 | Moderate | Moderate |
| Below 65 | *(rejected at ingestion)* | Low Impact |

### Display Locations

Both scores must appear wherever research entries are surfaced:

- **Research library cards** — Both scores shown as compact badges
- **Research detail pages** — Full score breakdown with per-criterion scores
- **Chat citations** — Inline confidence indicators using both metrics
- **Search/filter controls** — Independent range sliders for each score

---

## 3. Scoring Process

### Evidence Score
- **Assigned at:** Ingestion (before entry is published to the library)
- **Method:** AI-assisted scoring using the type-specific rubric, with human review for edge cases
- **Gate:** Entries scoring below 65 are rejected

### Impact Score
- **Assigned at:** Post-ingestion, during findings analysis
- **Method:** AI analysis of the study's findings, conclusions, and practical recommendations using the universal rubric. All AI-generated Impact Scores are flagged for human review.
- **Gate:** None — score is published alongside the entry

### Storage
Both scores are stored in the `research_entries` table:

- `evidence_score` (integer, 0-100, NOT NULL)
- `impact_score` (integer, 0-100, nullable until scored)
- `evidence_breakdown` (JSONB — per-criterion scores)
- `impact_breakdown` (JSONB — per-criterion scores)

---

## 4. Rationale: Why Two Scores?

A single "confidence score" conflates two distinct qualities that users care about independently:

1. **Trustworthiness** — Can I rely on this research? Was it conducted rigorously?
2. **Usefulness** — Will this research help me make a better design decision right now?

These dimensions are not correlated. A meticulously designed eye-tracking study (high evidence) might conclude with "more research is needed" (low impact). Conversely, a practitioner's A/B test on a live product (moderate evidence) might demonstrate a 40% improvement in conversion from a specific button placement (high impact).

By separating these into explicit, labeled metrics, UXMind gives practitioners the information they need to make informed judgment calls about which research to prioritize — rather than hiding that nuance behind a single number.

---

*End of addendum. All other sections of PRD v1.0 remain in effect.*
