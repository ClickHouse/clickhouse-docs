# AI Writing Tells -- Detection and Remediation Catalogue

Reference document for the `docs-pr-review` skill. Each entry describes a pattern that signals AI-generated writing, with examples and concrete fixes.

Severity levels:
- **High** -- almost never appears in human writing; strong AI signal on its own
- **Medium** -- occasionally appears in human writing but AI overuses it; becomes a tell when combined with others
- **Low** -- common in human writing too, but AI uses it at a higher rate; flag only when frequency is unusual

---

## 1. Punctuation

### 1.1 Em-dash overuse

**Severity:** High (when 3+ per article) / Medium (1-2 instances)

**Description:** AI inserts em-dashes where commas, parentheses, or separate sentences would be more natural. The pattern is especially strong when em-dashes appear in consecutive paragraphs or multiple times in a single paragraph.

**Examples:**
- "ClickHouse uses a columnar storage format -- making it ideal for analytical queries -- that compresses data efficiently."
- "The new release includes three features -- query caching, async inserts, and lightweight deletes -- that users have been requesting."
- "This approach -- unlike traditional row-oriented databases -- prioritizes read performance."

**Why it's a tell:** Human writers use em-dashes sparingly. AI scatters them throughout because they're a convenient way to inject parenthetical information without committing to a sentence structure. When you see 4+ em-dashes in a 1000-word piece, it's almost certainly AI.

**Remediation:**
- Use parentheses for true asides: "ClickHouse uses a columnar storage format (ideal for analytical queries) that compresses data efficiently."
- Break into two sentences: "ClickHouse uses a columnar storage format. This makes it ideal for analytical queries while compressing data efficiently."
- Use a comma if the aside is short: "ClickHouse, a columnar database, compresses data efficiently."
- Keep at most one em-dash per 500 words. If you have more, rewrite the rest.

### 1.2 Semicolon overuse in casual/blog writing

**Severity:** Medium

**Description:** AI uses semicolons to join related independent clauses far more often than human blog writers do. Semicolons are fine in academic writing but feel stiff in blog posts and marketing content.

**Examples:**
- "Query performance improved by 3x; memory usage dropped by half."
- "The team rewrote the parser in Rust; the results exceeded expectations."
- "ClickHouse handles this natively; no external tools are required."

**Why it's a tell:** Most blog writers use periods or conjunctions. Semicolons in informal writing feel like AI trying to sound sophisticated. One per article is fine. Three or more is a flag.

**Remediation:**
- Split into two sentences: "Query performance improved by 3x. Memory usage dropped by half."
- Use a conjunction: "Query performance improved by 3x, and memory usage dropped by half."
- Use "while" or "and" to connect: "Query performance improved by 3x while memory usage dropped by half."

### 1.3 Colon-led dramatic reveals

**Severity:** High

**Description:** AI uses colons to set up a dramatic reveal or key point, often after a short declarative setup. The pattern is: short emphatic sentence fragment, colon, the "punchline."

**Examples:**
- "Here's the thing: most databases weren't built for this workload."
- "The result: a 10x improvement in query latency."
- "The takeaway: you don't need a separate analytics stack."
- "The bottom line: ClickHouse handles this out of the box."

**Why it's a tell:** Human writers occasionally use this structure, but AI uses it as a crutch to create emphasis. When multiple paragraphs use the same colon-reveal pattern, it reads as formulaic.

**Remediation:**
- Just state the point directly: "Most databases weren't built for this workload."
- Integrate into the preceding sentence: "We found that most databases weren't built for this workload."
- Use the colon-reveal at most once per piece, and only when it genuinely adds punch.

### 1.4 Exclamation marks for forced enthusiasm

**Severity:** Medium

**Description:** AI adds exclamation marks to inject energy into statements that don't warrant it, particularly in introductions and conclusions.

**Examples:**
- "We're excited to announce the release of ClickHouse 24.8!"
- "And the best part? It's completely free!"
- "Let's dive in!"

**Why it's a tell:** Genuine technical writing rarely needs exclamation marks. Human writers in tech tend to understate rather than overstate. Exclamation marks in a technical blog post feel like AI mimicking enthusiasm.

**Remediation:**
- Drop the exclamation mark: "We're releasing ClickHouse 24.8 today."
- Let the content carry the excitement: "ClickHouse 24.8 ships with async inserts, query caching, and lightweight deletes."
- Reserve exclamation marks for genuinely surprising metrics or results, if ever.

### 1.5 Ellipsis for false suspense

**Severity:** Low

**Description:** AI uses ellipses to create artificial suspense or trailing thoughts in contexts where a period works fine.

**Examples:**
- "But there's a catch..."
- "The answer might surprise you..."
- "We needed something faster, more reliable, more scalable..."

**Why it's a tell:** Blog and marketing writers do use ellipses occasionally, but AI reaches for them to manufacture intrigue. Combined with other tells, they contribute to an overall AI pattern.

**Remediation:**
- End with a period: "But there's a catch."
- Remove the suspense framing entirely: "The limitation is that partitions aren't designed for query optimization."

---

## 2. Sentence Patterns

### 2.1 "It's not X, it's Y" contrast pattern

**Severity:** High

**Description:** AI loves this rhetorical structure where something is reframed by negating one characterization and asserting another. Often appears in introductions and topic sentences.

**Examples:**
- "It's not just a database -- it's a real-time analytics engine."
- "This isn't a minor update; it's a fundamental rethink of how we handle joins."
- "ClickHouse isn't just fast. It's fast at scale."
- "This isn't about speed. It's about giving analysts their time back."

**Why it's a tell:** This is one of the most reliable AI tells. Human writers use this pattern occasionally, but AI uses it in almost every piece of persuasive or explanatory writing. Two or more instances in a single article is a near-certain AI flag.

**Remediation:**
- State the positive claim directly: "ClickHouse is a real-time analytics engine."
- Lead with what it does, not what it isn't: "ClickHouse processes analytical queries at scale, returning results in milliseconds."
- If you must contrast, do it in two separate sentences with specifics: "Most databases trade query speed for write throughput. ClickHouse doesn't -- it handles 1M inserts/sec while maintaining sub-second query latency."

### 2.2 "Let's be clear:" / "Let's be honest:" openers

**Severity:** High

**Description:** AI uses these phrases to signal a shift to directness, as if the previous text was somehow unclear or dishonest. Often appears at the start of a paragraph.

**Examples:**
- "Let's be clear: ClickHouse is not a replacement for your transactional database."
- "Let's be honest: most observability tools are overpriced."
- "Make no mistake: this changes how teams think about analytics."

**Why it's a tell:** Human writers who are actually being clear don't announce it. This is AI mimicking a rhetorical move it's seen in opinion writing and speeches. It appears with high frequency in AI output and low frequency in human blog writing.

**Remediation:**
- Delete the prefix and start with the actual claim: "ClickHouse is not a replacement for your transactional database."
- If you want directness, just be direct. The words do the work, not the preamble.

### 2.3 "Here's the reality:" / "The truth is" declarations

**Severity:** High

**Description:** Similar to 2.2 but framed as revealing a hidden truth. AI uses these to set up a contrarian or corrective point.

**Examples:**
- "Here's the reality: most teams don't need a data lake."
- "The truth is, columnar databases have been around for decades."
- "The reality is that performance tuning is rarely about hardware."
- "Here's what most people get wrong: partitioning isn't a performance feature."

**Why it's a tell:** Same problem as "Let's be clear" -- it's a rhetorical crutch that AI leans on heavily. Human writers state their contrarian takes without preamble.

**Remediation:**
- Delete the preamble: "Most teams don't need a data lake."
- If the point is contrarian, let the argument itself convey that: "Columnar databases have been around for decades. What's new is making them usable without a team of database engineers."

### 2.4 Question-then-immediate-answer pattern

**Severity:** Medium

**Description:** AI poses a rhetorical question and immediately answers it in the next sentence. Often used as a paragraph opener.

**Examples:**
- "So why does this matter? Because query performance directly impacts user experience."
- "What makes ClickHouse different? It was designed from the ground up for analytical workloads."
- "But can it handle real-time data? Absolutely."

**Why it's a tell:** Human writers sometimes do this, but AI does it repeatedly and predictably. When every other paragraph opens with a question that gets answered immediately, the rhythm becomes mechanical.

**Remediation:**
- Merge into a direct statement: "Query performance matters because it directly impacts user experience."
- Use the question only when you genuinely want the reader to pause and think. Don't answer it in the very next sentence -- let it breathe.
- Limit to one per article at most.

### 2.5 "In other words" / "Put simply" re-explanation

**Severity:** Medium

**Description:** AI explains something, then re-explains it in simpler terms immediately after, using a transition phrase.

**Examples:**
- "ClickHouse uses vectorized query execution, processing data in batches rather than row by row. In other words, it processes thousands of values simultaneously."
- "The MergeTree engine sorts data by primary key on disk. Put simply, queries that filter on the primary key can skip most of the data."

**Why it's a tell:** AI is trained to be helpful and accessible, so it often provides redundant re-explanations. Human writers pick one level of explanation and commit to it.

**Remediation:**
- Pick the better explanation and delete the other: "ClickHouse processes data in batches of thousands of values at once, rather than row by row."
- If both levels are needed (for a mixed audience), structure them as a progression, not a restatement.

### 2.6 Tricolon negation lists

**Severity:** High

**Description:** AI produces dramatic three-item lists of things that are eliminated or no longer needed, typically proper nouns or technical components. The pattern is: "No X. No Y. No Z." or "No X, no Y, no Z." Used to emphasise simplicity by listing what was removed.

**Examples:**
- "No Kafka. No Connect workers. No Debezium configuration."
- "No Hadoop. No Spark. No MapReduce."
- "No sharding keys. No manual rebalancing. No topology management."
- "No ETL pipelines. No staging tables. No batch windows."

**Why it's a tell:** This is a distinctive AI rhetorical pattern. Human writers occasionally use it in marketing copy, but AI produces it with very high frequency, especially when describing how a product simplifies a workflow. The three-item structure with parallel "No X" phrasing is a strong signal. It's particularly obvious when the items are proper nouns for well-known tools.

**Remediation:**
- Describe what you do instead of listing what you don't: "ClickHouse ingests data directly -- skip the Kafka-to-Connect-to-database pipeline."
- If simplicity is the point, show it with a before/after comparison or a concrete example rather than a negation list.
- One "no X" is fine. Three in a row is a pattern to avoid.

---

## 3. Transition Words

### 3.1 "Moreover" / "Furthermore"

**Severity:** High

**Description:** AI uses "moreover" and "furthermore" as default paragraph connectors. These words are formal and academic, and rarely appear in casual or technical blog writing.

**Examples:**
- "Moreover, ClickHouse supports real-time inserts alongside analytical queries."
- "Furthermore, the new materialized view syntax simplifies pipeline management."
- "Moreover, this approach reduces operational complexity."

**Why it's a tell:** "Moreover" and "furthermore" are the most commonly flagged AI transition words. Human blog writers almost never use them. They add nothing -- the paragraph that follows is obviously an additional point; you don't need to announce it.

**Remediation:**
- Delete the word and start with the content: "ClickHouse supports real-time inserts alongside analytical queries."
- If a transition is needed, use a simple one: "And" or "Also" or just a new paragraph.
- Often no transition is needed at all. Paragraphs don't always need explicit connectors.

### 3.2 "Notably" / "Importantly" / "Crucially"

**Severity:** High

**Description:** AI uses these adverbs to signal that the following point is significant. They appear at the start of sentences as a way to elevate what comes next.

**Examples:**
- "Notably, this is the first release to support async inserts natively."
- "Importantly, the data remains fully queryable during ingestion."
- "Crucially, this change is backward compatible."

**Why it's a tell:** These signal words are AI trying to manage the reader's attention. Human writers assume their reader is paying attention and don't need to flag which points are important -- the structure and argument do that work.

**Remediation:**
- Delete the adverb: "This is the first release to support async inserts natively."
- If the point really is crucial, restructure to show why: "Backward compatibility matters here because teams can upgrade without rewriting their ingestion pipelines."

### 3.3 "Interestingly" / "Surprisingly" / "Fascinatingly"

**Severity:** High

**Description:** AI tells the reader how to feel about the information instead of letting the information speak for itself.

**Examples:**
- "Interestingly, ClickHouse outperformed the alternatives even without tuning."
- "Surprisingly, the smaller cluster handled the load better."
- "Fascinatingly, this pattern emerges across all deployment sizes."

**Why it's a tell:** Human writers with genuine expertise don't editorialize their own findings this way. If something is surprising, the context makes that clear. "Fascinatingly" is almost exclusively AI -- humans rarely use it in prose.

**Remediation:**
- State the fact and let the reader decide if it's interesting: "ClickHouse outperformed the alternatives even without tuning."
- If surprise is part of the story, show it through context: "We expected the larger cluster to win. It didn't -- the smaller cluster handled the load better, by a margin of 40%."

### 3.4 "That said" / "That being said"

**Severity:** Medium

**Description:** AI uses these as pivot transitions to acknowledge a counter-point or caveat. They appear with high frequency in AI-generated balanced arguments.

**Examples:**
- "That said, there are trade-offs to consider."
- "That being said, the approach isn't suitable for every workload."
- "That said, it's worth considering the operational overhead."

**Why it's a tell:** Human writers use "that said" occasionally, but AI uses it as a default hedge mechanism. When paired with the overly-balanced voice pattern (see section 8), it's a strong signal.

**Remediation:**
- Use "but" or "however" once, or restructure: "The trade-off is operational overhead."
- Often the caveat can be folded into the preceding paragraph rather than split out as a new thought.

### 3.5 "It's worth noting that" / "It bears mentioning"

**Severity:** High

**Description:** AI inserts these phrases to introduce additional context that it doesn't want to state directly. The phrase adds nothing -- if it's worth noting, just note it.

**Examples:**
- "It's worth noting that ClickHouse Cloud handles replication automatically."
- "It bears mentioning that this feature is still in experimental status."
- "It should be noted that these benchmarks were run on a single node."

**Why it's a tell:** This is AI hedging. Human writers state facts; they don't preface them with meta-commentary about whether the fact is worth stating.

**Remediation:**
- Delete the preamble: "ClickHouse Cloud handles replication automatically."
- If it's a caveat, state it as one: "These benchmarks were run on a single node, so multi-node performance may differ."

---

## 4. Hedging and Filler

### 4.1 "One could argue" / "Some might say"

**Severity:** High

**Description:** AI attributes viewpoints to hypothetical people rather than stating them directly or attributing them to real sources.

**Examples:**
- "One could argue that columnar databases are overkill for small datasets."
- "Some might say this adds unnecessary complexity."
- "It could be argued that the trade-off isn't worth it for smaller teams."

**Why it's a tell:** Human writers either own their argument or cite a real person. AI creates imaginary interlocutors because it's trained to present multiple perspectives without committing.

**Remediation:**
- Own the claim: "Columnar databases are overkill for small datasets."
- Attribute to a real source: "Developers on Hacker News frequently push back on this, arguing the complexity isn't worth it for small datasets."
- If you're presenting a counterargument, frame it directly: "The counterargument: columnar databases add complexity that small teams don't need."

### 4.2 "In today's fast-paced world" / "In an era of"

**Severity:** High

**Description:** AI opens pieces with sweeping temporal context-setting that adds nothing. This is pure filler to create a sense of relevance.

**Examples:**
- "In today's data-driven world, real-time analytics is no longer a luxury."
- "In an era of ever-growing data volumes, efficient storage is critical."
- "In today's fast-paced business environment, speed matters more than ever."
- "As organizations increasingly rely on data-driven decision making..."

**Why it's a tell:** This is one of the most cliched AI patterns. No human writer with a deadline wastes their opening on "in today's fast-paced world." It's filler that signals the AI had nothing specific to say.

**Remediation:**
- Delete the entire sentence and start with the actual point.
- If context-setting is needed, be specific: "When Uber's analytics team hit 10TB of daily ingestion, their existing database couldn't keep up."

### 4.3 "While X is beyond the scope of this article"

**Severity:** Medium

**Description:** AI acknowledges related topics it won't cover, which is a pattern from training on academic and educational text.

**Examples:**
- "While a full comparison of OLAP databases is beyond the scope of this post, it's worth noting that ClickHouse excels in several areas."
- "Though we won't dive into the internals of MergeTree here, understanding the basics helps."

**Why it's a tell:** Blog writers either cover a topic or don't mention it. They don't apologize for not covering it. This is AI hedging against the possibility that the reader expected more.

**Remediation:**
- Delete the scope disclaimer. If you're not covering it, don't bring it up.
- If a reference is helpful, just link: "For a deep dive on MergeTree internals, see [this post]."

### 4.4 "Without further ado" / "Without getting too deep into"

**Severity:** Medium

**Description:** AI uses these meta-commentary phrases to transition from introduction to content, acknowledging the transition explicitly instead of just making it.

**Examples:**
- "Without further ado, let's look at the benchmarks."
- "Without getting too deep into the implementation details, here's how it works."
- "With that context in mind, let's explore the solution."

**Why it's a tell:** Human writers just start the next section. They don't narrate the structural transitions of their own article.

**Remediation:**
- Delete and move to the content: show the benchmarks, explain how it works.
- If you need a transition, a section heading does the job.

### 4.5 "As we'll see" / "As we've seen"

**Severity:** Medium

**Description:** AI references other parts of the article as if guiding the reader through a live presentation.

**Examples:**
- "As we'll see in the next section, this has major implications for query performance."
- "As we've seen, ClickHouse's approach to storage differs fundamentally from row-oriented databases."
- "As mentioned earlier, the primary key determines sort order on disk."

**Why it's a tell:** This is AI mimicking an instructor or tour guide. Blog posts aren't presentations -- readers can scroll. Occasional cross-references are fine, but AI does this reflexively.

**Remediation:**
- Delete the cross-reference and just make the point.
- If a callback is genuinely needed, be specific: "The sort order we configured in the CREATE TABLE statement determines which queries benefit from data skipping."

---

## 5. Superlatives and Buzzwords

### 5.1 "Groundbreaking" / "Revolutionary" / "Game-changing"

**Severity:** High

**Description:** AI reaches for the biggest adjective available when describing features, releases, or approaches. These words have been so overused that they now signal marketing fluff.

**Examples:**
- "This groundbreaking feature enables real-time analytics at scale."
- "The revolutionary approach to query processing sets ClickHouse apart."
- "This is a game-changing improvement for observability teams."

**Why it's a tell:** Human technical writers avoid these words because they know the audience will dismiss the claim. AI uses them because they appeared frequently in its training data (marketing copy, press releases, product pages).

**Remediation:**
- Replace with specific claims: "This feature reduces query latency from minutes to milliseconds for time-series workloads."
- Let the reader decide if it's groundbreaking. Show the impact with numbers, benchmarks, or user quotes.
- If it's truly significant, explain why concretely: "Before this release, teams needed a separate streaming pipeline. Now it's one SQL statement."

### 5.2 "Seamless" / "Seamlessly"

**Severity:** High

**Description:** AI describes integrations, migrations, and experiences as "seamless" without qualification. Nothing in software is seamless.

**Examples:**
- "ClickHouse seamlessly integrates with your existing data stack."
- "The migration was seamless, with zero downtime."
- "This provides a seamless experience for end users."

**Why it's a tell:** "Seamless" is the number one AI marketing word. Human writers know that integrations have seams -- they describe the actual experience instead of papering over it.

**Remediation:**
- Be specific about what works well: "ClickHouse connects to Kafka, S3, and PostgreSQL through native table engines. No ETL pipeline needed."
- Acknowledge friction where it exists: "Migration required rewriting three queries, but the rest worked without changes."

### 5.3 "Robust" / "Comprehensive" / "Cutting-edge"

**Severity:** Medium

**Description:** AI uses these adjectives as generic amplifiers that sound impressive but convey nothing specific.

**Examples:**
- "ClickHouse offers a robust set of analytical functions."
- "The comprehensive documentation covers every feature."
- "This cutting-edge technology powers some of the world's largest deployments."

**Why it's a tell:** These words are vague by design. AI uses them when it doesn't have specific details to cite. Human writers with domain knowledge describe what makes something robust or comprehensive.

**Remediation:**
- Replace with specifics: "ClickHouse supports 150+ aggregate functions, including approximate algorithms like HyperLogLog and quantileTDigest."
- If you can't be specific, the adjective is probably not needed: "The documentation covers installation, configuration, SQL reference, and troubleshooting."

### 5.4 "Powerful" / "Elegant" / "Intuitive"

**Severity:** Medium

**Description:** AI applies subjective quality judgments that the reader has no reason to trust. These are opinion words dressed up as descriptions.

**Examples:**
- "ClickHouse provides a powerful query engine."
- "The elegant solution avoids the complexity of traditional approaches."
- "The intuitive interface makes it easy for analysts to get started."

**Why it's a tell:** These are lazy descriptors. "Powerful" compared to what? "Elegant" by whose standard? AI uses them because they sound positive without requiring evidence.

**Remediation:**
- Show don't tell: "ClickHouse's query engine processes 1 billion rows/sec on a single node." (That's powerful -- but you showed it instead of claiming it.)
- Replace "elegant" with a description of the actual design: "The solution uses a single materialized view instead of three separate ETL jobs."
- Replace "intuitive" with what the user actually does: "Analysts write standard SQL -- no proprietary query language to learn."

### 5.5 "Unlock" / "Leverage" / "Empower"

**Severity:** High

**Description:** AI uses these verbs as corporate-speak substitutes for simple verbs like "use," "enable," or "help."

**Examples:**
- "Unlock the full potential of your data with ClickHouse."
- "Leverage real-time analytics to drive better decisions."
- "This empowers teams to iterate faster."

**Why it's a tell:** These are SaaS marketing verbs. They appear in almost every AI-generated product description. Human technical writers use plain language.

**Remediation:**
- Use plain verbs: "Use ClickHouse for real-time analytics."
- Be specific about the action: "Teams can query live data instead of waiting for overnight batch jobs."
- "Empower" is almost always replaceable with "let" or "help": "This lets teams iterate faster."

---

## 6. Structural Tells

### 6.1 Every paragraph opens with a topic sentence

**Severity:** Medium

**Description:** AI produces paragraphs that each begin with a clear topic sentence summarizing the paragraph's point, followed by supporting details. This is textbook essay structure.

**Examples:**
A typical AI article might have consecutive paragraphs opening with:
- "Query performance is the primary advantage of columnar storage."
- "Data compression further reduces storage costs."
- "Replication ensures high availability for production workloads."
- "The ecosystem of integrations connects ClickHouse to existing tools."

**Why it's a tell:** Human blog writing is less structured. Writers lead with examples, start with a question, drop in mid-thought, or build to the point instead of stating it first. Perfect topic-sentence-first structure for every paragraph reads like an essay outline.

**Remediation:**
- Vary paragraph openings: start some with examples, questions, or anecdotes.
- Sometimes build to the point instead of leading with it: "We tried three different approaches to the ingestion pipeline. The first hit memory limits. The second couldn't keep up with the write rate. The third -- async inserts into ClickHouse -- handled the full load in 40% of the time."
- Let some paragraphs just continue the thought from the previous one without a new topic sentence.

### 6.2 Perfectly parallel list items

**Severity:** Medium

**Description:** AI constructs bullet lists or numbered lists where every item follows exactly the same grammatical structure -- same length, same verb tense, same format.

**Examples:**
- "Faster query execution through vectorized processing"
- "Lower storage costs through columnar compression"
- "Better reliability through built-in replication"
- "Easier operations through automated cluster management"

**Why it's a tell:** Human writers make lists where items vary in length, structure, and detail. Some items get a brief note; others get a full sentence. Perfect parallelism across 5+ items is AI.

**Remediation:**
- Let items vary naturally in length and structure:
  - "Vectorized query execution"
  - "Columnar compression cuts storage costs -- typically 5-10x vs row-oriented"
  - "Built-in replication (no ZooKeeper required since 24.1)"
  - "Automated cluster management"

### 6.3 Formulaic intro-body-conclusion

**Severity:** Medium

**Description:** AI follows a rigid structure: introductory paragraph that previews the article, body sections that deliver on the preview, concluding paragraph that summarizes and looks forward. Every time.

**Examples:**
- Intro: "In this post, we'll explore how ClickHouse handles joins, why it matters, and how to optimize your queries."
- Conclusion: "As we've seen, ClickHouse provides multiple join strategies that can handle even the most demanding analytical workloads. With the techniques discussed above, you're well-equipped to optimize your queries for any scenario."

**Why it's a tell:** Human blog writers rarely preview their article structure in the intro, and they almost never write a summary conclusion. They either end with a call to action, a final thought, or just stop when the content is done.

**Remediation:**
- Open with the problem or a hook, not a preview: "JOINs in ClickHouse have a reputation for being slow. It's mostly undeserved."
- End with a specific takeaway or next step, not a summary: "Start with hash joins and switch to partial merge joins only when memory is the constraint. For the full syntax reference, see the docs."
- Don't announce what the article will cover. Just cover it.

### 6.4 Three-part rhythm / rule of three

**Severity:** Low

**Description:** AI consistently groups things in threes -- three examples, three benefits, three paragraphs per section. This creates an unnaturally regular rhythm.

**Examples:**
- "ClickHouse is fast, efficient, and scalable."
- "This matters for three reasons: performance, cost, and reliability."
- Every section has exactly three subsections.

**Why it's a tell:** The rule of three is a known rhetorical device, and AI applies it reflexively. Human writing has more irregular rhythms -- sometimes two points, sometimes five, sometimes one that gets a full paragraph.

**Remediation:**
- Vary the count. Sometimes there are two reasons. Sometimes there are seven. Don't force things into triples.
- If you naturally have three points, that's fine -- but check whether the third is actually adding something or just padding.

### 6.5 Section headers that form a complete narrative outline

**Severity:** Low

**Description:** AI generates section headers that, read in sequence, form a complete summary of the article. Each header is a full phrase or sentence rather than a short label.

**Examples:**
- "Why Query Performance Matters"
- "How ClickHouse Achieves Sub-Second Latency"
- "Optimizing Your Queries for Maximum Performance"
- "Real-World Results: A Case Study"
- "Getting Started with ClickHouse Today"

**Why it's a tell:** Human writers use shorter, less formulaic headers. They're labels for sections, not miniature thesis statements. The progression from "why" to "how" to "results" to "getting started" is a template AI follows predictably.

**Remediation:**
- Use shorter headers: "Performance", "Under the hood", "Benchmarks", "Try it"
- Don't force a narrative arc in the headers. Let the content create the arc.

---

## 7. Metaphor and Cliche

### 7.1 "Landscape" / "Ecosystem"

**Severity:** High

**Description:** AI describes any industry, market, or technology space as a "landscape" or "ecosystem." These metaphors are so overused they've lost all meaning.

**Examples:**
- "The data analytics landscape has evolved significantly in recent years."
- "Within the modern data ecosystem, ClickHouse plays a central role."
- "Navigating the observability landscape can be challenging."

**Why it's a tell:** Human writers in tech almost never use "landscape" unless they're literally discussing terrain. AI uses it as a default framing for any broad topic.

**Remediation:**
- Be specific: "There are more analytics databases now than there were five years ago. Most of them are bad."
- Replace with the actual thing you're describing: "Within a typical data stack -- Kafka for ingestion, ClickHouse for analytics, Grafana for dashboards -- ClickHouse handles the heavy lifting."

### 7.2 "Tapestry" / "Mosaic" / "Fabric"

**Severity:** High

**Description:** AI reaches for woven-material metaphors to describe complexity or interconnection.

**Examples:**
- "The rich tapestry of data sources feeding into the pipeline."
- "A mosaic of tools and technologies that work together."
- "The fabric of modern data infrastructure."

**Why it's a tell:** Nobody in tech talks like this. These metaphors come from AI's training on literary and journalistic text. They sound absurd in a technical blog post.

**Remediation:**
- Delete the metaphor entirely and describe the actual thing: "The pipeline ingests from Kafka, S3, and PostgreSQL."
- If you want to convey complexity, use concrete details: "The team manages 47 data sources, 12 transformation jobs, and 3 analytics databases."

### 7.3 "Paradigm shift" / "Game-changer"

**Severity:** High

**Description:** AI uses these for any significant change or improvement. They've been meaningless for at least a decade.

**Examples:**
- "ClickHouse represents a paradigm shift in analytical database design."
- "Async inserts are a game-changer for high-volume ingestion."
- "This paradigm shift in observability is driven by cost pressures."

**Why it's a tell:** These phrases scream "I have nothing specific to say but I want to sound important." Human writers who understand the technology describe the actual change.

**Remediation:**
- Describe the actual shift: "Before ClickHouse, analytical queries on 10TB meant waiting minutes. Now they take seconds."
- Explain what changed and why it matters: "Async inserts let you write millions of rows per second without blocking queries. Before this, you needed a buffer layer like Kafka to smooth out the write load."

### 7.4 "North star" / "Guiding principle"

**Severity:** High

**Description:** AI uses navigation metaphors for strategic priorities or design goals.

**Examples:**
- "Performance has always been the north star for the ClickHouse team."
- "Our guiding principle is simplicity."
- "Query speed remains the north star of the project."

**Why it's a tell:** "North star" entered mainstream corporate vocabulary around 2018-2020 and AI absorbed it. It's now the default metaphor for "important goal" in AI output.

**Remediation:**
- State it plainly: "The ClickHouse team optimizes for query speed above all else."
- Use specifics: "Every design decision starts with one question: does this make queries faster?"

### 7.5 "At the end of the day" / "When all is said and done"

**Severity:** Medium

**Description:** AI uses these colloquialisms to introduce a concluding or summary point. They add nothing and make the writing sound like a talk-show interview.

**Examples:**
- "At the end of the day, what matters is query performance."
- "When all is said and done, the results speak for themselves."
- "At the end of the day, ClickHouse delivers on its promise."

**Why it's a tell:** Human technical writers don't use these phrases in writing (some use them in speech). AI drops them into blog posts as a way to signal a concluding thought.

**Remediation:**
- Delete the filler and state the point: "What matters is query performance."
- Even better, be specific: "The only metric that mattered to the team was p99 query latency, and ClickHouse kept it under 200ms."

---

## 8. Voice and Tone

### 8.1 Overly balanced "on one hand / on the other hand"

**Severity:** High

**Description:** AI presents every topic as a balanced debate, giving equal weight to pros and cons, advantages and disadvantages. This is AI being trained to be fair and objective, but it produces writing that lacks conviction.

**Examples:**
- "On one hand, ClickHouse offers exceptional query performance. On the other hand, it requires careful schema design to achieve optimal results."
- "While columnar storage excels at analytical queries, it's important to note that transactional workloads may be better served by row-oriented databases."
- "There are clear advantages to this approach, but there are also trade-offs to consider."

**Why it's a tell:** Human writers with expertise take positions. They know what's good, what's bad, and they say so. AI hedges because it's designed to avoid appearing biased. The result reads as mealy-mouthed.

**Remediation:**
- Take a position: "ClickHouse is the fastest option for analytical queries. It's not designed for transactions, and you shouldn't use it for them."
- Acknowledge limitations directly, without the two-handed framing: "Schema design matters. A bad primary key means bad performance. Here's how to pick the right one."

### 8.2 Excessive hedging

**Severity:** Medium

**Description:** AI qualifies every claim with hedge words: "may," "might," "could," "potentially," "arguably," "to some extent." One or two per piece is fine. Five or more is AI.

**Examples:**
- "This could potentially improve query performance."
- "ClickHouse may be a good fit for some observability workloads."
- "This approach might arguably be considered more efficient."
- "To some extent, the results suggest that columnar storage could offer advantages."

**Why it's a tell:** AI is trained to avoid absolute claims, which produces writing that never commits to anything. The accumulation of hedge words makes the writer sound uncertain about their own topic.

**Remediation:**
- Commit to the claim: "This improves query performance by 3-5x in our benchmarks."
- If uncertainty is genuine, say why: "We haven't tested this with sorted data, so performance on pre-sorted datasets may differ."
- Reserve "may" and "might" for actual uncertainty, not as a default qualifier.

### 8.3 Lack of opinion or point of view

**Severity:** Medium

**Description:** AI writes informational content that describes what things are and how they work without ever expressing a viewpoint on whether they're good, bad, overrated, or underappreciated.

**Examples:**
An AI article about ClickHouse vs. PostgreSQL might describe both databases' features in detail without ever saying which one to pick or expressing a preference. Each section reads like a Wikipedia article.

**Why it's a tell:** Human experts have opinions. Blog posts from practitioners include statements like "I prefer X because..." or "X is the wrong tool for this" or "I've never understood why people use X for Y." Opinionless writing signals AI.

**Remediation:**
- Add a recommendation: "For analytical queries over 1TB, use ClickHouse. Below that, PostgreSQL with proper indexing is simpler and good enough."
- Express opinions where warranted: "Partitioning by date is overused. Most teams do it out of habit, not because it helps their queries."
- Include first-hand experience where available.

### 8.4 Diplomatic/corporate tone in informal contexts

**Severity:** Medium

**Description:** AI defaults to a cautious, professional tone that avoids anything sharp, funny, or informal. Even in a blog post that should have personality, AI writes like a press release.

**Examples:**
- "We are pleased to introduce..." instead of "We shipped..."
- "We believe this represents a significant step forward" instead of "This is a big deal"
- "We are committed to continually improving..." instead of just describing the improvement

**Why it's a tell:** Corporate blog posts from real humans often have personality, humor, and directness. AI plays it safe with sanitized corporate language.

**Remediation:**
- Write like a human talking to a peer: "We shipped async inserts. Here's why you should care."
- Use contractions naturally: "We've" not "We have," "can't" not "cannot," "it's" not "it is."
- Include personality where appropriate: a joke, a wry observation, a candid admission of difficulty.

### 8.5 Thanking the reader

**Severity:** High

**Description:** AI closes articles by thanking the reader for their time or interest. Human blog writers almost never do this.

**Examples:**
- "Thank you for reading, and we hope this guide has been helpful."
- "Thanks for following along. We'd love to hear your thoughts in the comments."
- "We appreciate you taking the time to explore this topic with us."

**Why it's a tell:** This is AI performing politeness. It appears in the vast majority of AI-generated articles and almost zero human-written tech blog posts.

**Remediation:**
- End with a call to action, a link, or a final technical point.
- Just stop when the content is done. "Try it yourself: `clickhouse-client --query 'SELECT count() FROM hits'`"
- If you must close, close with substance, not thanks.

---

## 9. Formatting Tells

### 9.1 Excessive bold for emphasis

**Severity:** Medium

**Description:** AI bolds key terms and phrases throughout the text, treating bold as a highlighting tool rather than using it sparingly for structure.

**Examples:**
- "ClickHouse uses **columnar storage**, which means it reads only the **columns needed** for each query, resulting in **significant performance improvements**."
- "The **key advantage** of this approach is **reduced I/O**, which leads to **faster query execution**."

**Why it's a tell:** Human writers use bold for headings, subheadings, and occasionally a key term on first introduction. AI uses bold as emphasis scattered through body text, often hitting 5+ bold phrases per paragraph.

**Remediation:**
- Remove most bold from body text. Let sentence structure create emphasis.
- Use bold only for actual key terms on first introduction, or not at all in body text.
- If a sentence needs emphasis, rewrite it to be stronger, don't bold it.

### 9.2 Every section exactly the same length

**Severity:** Medium

**Description:** AI produces sections of remarkably uniform length -- each gets 2-3 paragraphs, each about the same word count. Real articles have sections that vary significantly based on topic complexity.

**Examples:**
A 2000-word article where each of 5 sections is exactly 350-400 words. Each section has exactly 3 paragraphs. No section is noticeably longer or shorter than the others.

**Why it's a tell:** Human writers spend more time on complex or important topics and less on simple or peripheral ones. Uniform section length means the AI is budgeting words rather than writing until the topic is covered.

**Remediation:**
- Let some sections be long and detailed, others short and to the point.
- A section can be one paragraph if that's all it needs. It can also be 8 paragraphs if the topic requires it.
- Don't pad shorter sections to match longer ones.

### 9.3 Numbered lists for everything

**Severity:** Medium

**Description:** AI converts naturally flowing content into numbered lists, even when the items don't have a meaningful order or sequence.

**Examples:**
- "There are several benefits to this approach: 1. Faster queries 2. Lower storage costs 3. Simpler operations 4. Better compression"
- "To get started: 1. Install ClickHouse 2. Create a database 3. Define your schema 4. Insert data 5. Run queries"

(The second example is fine -- it's a sequential process. The first is not -- the benefits have no inherent order.)

**Why it's a tell:** AI defaults to numbered lists because they're structured and easy to generate. Human writers use numbered lists for sequential steps and bullet lists (or plain prose) for unordered items.

**Remediation:**
- Use numbered lists only for sequential steps.
- Use bullet lists for unordered items.
- Consider whether a list is even needed -- sometimes a sentence works better: "The main benefits are faster queries and lower storage costs."

### 9.4 Summary/TLDR at the top that repeats the content

**Severity:** Medium

**Description:** AI adds a summary or TLDR section at the beginning of an article that previews every point the article will make, then the article makes all those points again.

**Examples:**
- "**TLDR:** ClickHouse 24.8 ships with async inserts for high-volume ingestion, query caching for repeated analytical queries, and lightweight deletes for GDPR compliance." (Followed by an article that covers these three things in sections with almost identical wording.)

**Why it's a tell:** Human writers either write a TLDR or write the article, rarely both with the same content. AI produces both because it generates the TLDR as a summary of its own upcoming output.

**Remediation:**
- If the audience wants a TLDR, write one that's genuinely condensed and uses different wording than the body.
- Often, just skip the TLDR and write a strong opening paragraph that pulls the reader in.

### 9.5 Overuse of horizontal rules / section dividers

**Severity:** Low

**Description:** AI inserts horizontal rules (`---`) between every major section, creating a visually segmented document even when the sections flow naturally.

**Examples:**
A post where every H2 section is preceded by a horizontal rule, breaking the page into visually separate "cards." Human-written blog posts typically let headings create the visual hierarchy.

**Why it's a tell:** This is a formatting habit from AI's exposure to README files and documentation. Blog posts don't usually need explicit section dividers -- headings handle it.

**Remediation:**
- Use headings for structure, not horizontal rules.
- Reserve horizontal rules for a genuine change in topic or a shift (like an epilogue or appendix).

---

## Detection Guidance

When reviewing content, don't flag individual tells in isolation (except high-severity ones like "tapestry" or "paradigm shift" which are strong signals alone). Look for **patterns of accumulation:**

- **3+ tells from different categories** in a single piece = likely AI-generated or AI-assisted
- **5+ tells from the same category** = the writer is leaning on AI for that aspect (e.g., transitions, structure)
- **High-severity tells in the opening or closing paragraphs** = especially suspect, as AI follows predictable intro/conclusion patterns

**Frequency matters more than presence.** One em-dash is fine. Six em-dashes in 1000 words is a tell. One "moreover" is forgivable. Three "moreovers" is AI.

**Context matters.** A formal whitepaper may legitimately use some of these patterns (semicolons, topic sentences, parallel lists). A blog post or marketing page should not.

When running in **correct mode**, prioritize high-severity tells first, then address medium-severity ones that appear in clusters. Low-severity tells should only be corrected when they contribute to an overall pattern.