---
slug: /use-cases/observability/clickstack/demo-days/2026/2026-06-05
title: 'Demo days - 2026-06-05'
sidebar_label: '2026-06-05'
sidebar_position: -20260605
pagination_prev: null
pagination_next: null
description: 'ClickStack demo days for 2026-06-05'
doc_type: 'guide'
keywords: ['ClickStack', 'Demo days']
---

## Split trace view and extended trace view {#split-trace-view-and-extended-trace-view}

*Demo by [@karl-power](https://github.com/karl-power)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/L4sduqf3CR8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

The trace panel now has a split view mode: as you click through spans in the timeline, the detail panel updates in place on the right rather than opening beneath the selected span as before. This keeps the full timeline visible while you're digging into individual spans.

You can also expand to an extended trace view for a full-width timeline with scroll and zoom support. Both panels can be opened and closed independently, making it easier to switch between a high-level overview and detailed span inspection without losing your place.

**Related PRs:** [#2402](https://github.com/hyperdxio/hyperdx/pull/2402) feat: trace panel inline split detail

## Lucene search is alias aware {#lucene-search-is-alias-aware}

*Demo by [@karl-power](https://github.com/karl-power)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/-Y6VKZG6O9s" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Lucene search now understands alias columns. Previously, filtering on an alias would either silently return wrong results or fail the query entirely — the parser had no way to know whether a field name referred to a real column or an alias.

The search engine now resolves aliases correctly, so filters on aliased fields behave the same as filters on native columns. Queries that previously errored out now return the expected results.

**Related PRs:** [#2422](https://github.com/hyperdxio/hyperdx/pull/2422) fix: unknown lucene field falls through in search, [#2431](https://github.com/hyperdxio/hyperdx/pull/2431) fix: use cloud versions for usable ALIAS columns

## Source-level required filters {#source-level-required-filters}

*Demo by [@pulpdrew](https://github.com/pulpdrew)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/RcAl8Sl5GFM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Sources can now declare required filters that are automatically surfaced on any dashboard that uses them. Rather than adding the same filter manually to every dashboard that references a source, ClickStack detects the requirement and hoists the filter to the dashboard level — scoped only to tiles that actually use that source.

Individual tiles can override the dashboard-level value if they need different filter values, and the required filters flow down into the chart editor preview so you can validate queries without stripping them out. Required source filters also integrate with the SQL filters macro for SQL-based charts, and when setting up dashboard-to-dashboard links ClickStack automatically includes them as candidates for the link parameters.

## Fit Y-axis to data {#fit-y-axis-to-data}

*Demo by [@pulpdrew](https://github.com/pulpdrew)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/cNiGHy1OqhU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Line charts have a new "Fit Y-axis to data" display setting. By default the Y-axis is anchored at zero, which compresses the visible range when values are large but vary only slightly — making trends invisible at a glance.

With this option enabled, the Y-axis range is dynamically computed from the actual data range, so fluctuations in high-valued series are visible without having to manually configure axis bounds.

**Related PRs:** [#2417](https://github.com/hyperdxio/hyperdx/pull/2417) feat(charts): add 'Fit Y-Axis to Data' display setting for line charts

## Anomaly alerts {#anomaly-alerts}

*Demo by [@fleon](https://github.com/fleon)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/aAgN3ZlQz8M" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

ClickStack now supports anomaly-based alerting using Z-score detection. Instead of a fixed threshold, you set how many standard deviations from the expected mean should trigger an alert. The seasonality window (hourly or daily) controls how the baseline is computed, and the alert editor highlights the windows that would have fired so you can tune sensitivity before saving.

This addresses a common problem with threshold alerts: users often don't know what numeric value to set. Seeing the potential alert windows update live as you adjust the Z-score makes it practical to find a threshold that catches genuine spikes without producing excessive noise. Alerts can be scoped to fire only when values exceed the expected range (not when they drop below it), and an occurrence setting lets you require the condition to hold for multiple consecutive data points before firing. Currently uses a standard moving average; exponential moving average support is planned.

## Notebooks generated by Claude {#notebooks-generated-by-claude}

*Demo by [@MikeShi42](https://github.com/MikeShi42)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/vGYse0I-D9M" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

A prototype showing how Claude Code investigations can be converted into shareable ClickStack notebooks. The workflow reads the tool call history from a Claude Code session, maps MCP tool calls into actual ClickStack queries, and uploads the result as a notebook the rest of your team can open and explore directly.

Beyond the basic query translation, the prototype supports citations: claims in the notebook link to the specific chart used as evidence. The goal is to make it easy for an SRE to share a complete investigation as a reproducible notebook rather than a Slack thread with screenshots.

## Clearer configuration for API and AI agents {#clearer-configuration-for-api-and-ai-agents}

*Demo by [@alex-fedotyev](https://github.com/alex-fedotyev)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/gpQA-Vso1XI" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

ClickStack settings now has a dedicated API and Agents tab that co-locates API keys and MCP connection setup. One-click buttons for Claude, Cursor, and OpenCode remove the need to manually construct connection commands — the Cursor button, for example, opens a terminal with the right install command pre-filled. OpenCode users get a copyable system prompt snippet to paste in directly. A generic JSON config option covers other MCP clients. 

**Related PRs:** [#2407](https://github.com/hyperdxio/hyperdx/pull/2407) feat(team-settings): connect your AI assistant

## Color selection for number charts {#color-selection-for-number-charts}

*Demo by [@alex-fedotyev](https://github.com/alex-fedotyev)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/qsZ-I6FEsNw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Number tiles now support both a static color picker and conditional color rules. The chart palette has been updated with human-readable color names — "blue" and "gray" instead of "color-1" and "color-10" — making it much easier to reason about what you're selecting.

Conditional coloring lets you define ordered threshold rules, such as green below a target value, amber in a warning range, and red above a critical threshold. This makes number tiles genuinely useful as status indicators on dashboards, especially for metrics like error rates or P99 latency where you want instant visual feedback without reading the number.

**Related PRs:** [#2386](https://github.com/hyperdxio/hyperdx/pull/2386) Number tile conditional color rules (ordered thresholds), [#2265](https://github.com/hyperdxio/hyperdx/pull/2265) feat(app): number tile static color picker

## Schema migrations {#schema-migrations}

*Demo by [@wrn14897](https://github.com/wrn14897)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/qVV8vQqctfM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

ClickStack now has a Schema Migrations tab in settings (enterprise) for making controlled, versioned DDL changes to your data schemas. You write a migration, give it a version number, and a background job picks it up and runs it with retry logic and strict ordering — if one migration fails, dependent later migrations won't run until it's resolved or deleted.

The versioned model also enables ClickHouse to push managed schema optimisations to ClickStack Cloud teams without requiring manual ALTER TABLE work. Teams can review pending migrations and unblock them at their own pace. Phase one covers additive changes; primary key modifications are planned for phase two.

## Out-of-the-box browser RUM dashboards {#out-of-the-box-browser-rum-dashboards}

*Demo by [@teeohhem](https://github.com/teeohhem)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Kmq9qwTnObw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

ClickStack now ships a pre-built Browser RUM dashboard that covers the full set of web performance metrics. The dashboard includes a performance overview with page views and P90 load time, and web vitals — LCP, INP, and CLS — with tiered thresholds so you can immediately see whether each metric is healthy, needs improvement, or is poor.

Additional sections cover page views over time, long tasks, device breakdown, slowest pages, top erroring sessions, JavaScript error rates, and API failures. Custom row actions let you click into any table row to drill through to the relevant session or trace data. Top-of-page filters let you slice by service, environment, service version, and page. Country filtering is in progress pending Browser SDK improvements to emit geo data.

**Related PRs:** [#2413](https://github.com/hyperdxio/hyperdx/pull/2413) feat: add Browser RUM dashboard template

## Dependent dashboard filters {#dependent-dashboard-filters}

*Demo by [@teeohhem](https://github.com/teeohhem)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/nTnBmZ-MvFg" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Dashboard filters can now be made dependent on each other, so selecting a value in one filter automatically constrains the available options in downstream filters. The Kubernetes dashboard is the first to use this: selecting a pod now narrows the deployment and node dropdowns to only the values relevant to that pod, rather than showing every option across the whole cluster.

This means you're never offered a filter combination that would return empty data. The feature ships in the Kubernetes dashboard template today.
