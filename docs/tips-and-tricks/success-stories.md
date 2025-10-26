---
sidebar_position: 1
slug: /community-wisdom/creative-use-cases
sidebar_label: 'Success stories'
doc_type: 'guide'
keywords: [
  'clickhouse creative use cases',
  'clickhouse success stories',
  'unconventional database uses',
  'clickhouse rate limiting',
  'analytics database applications',
  'clickhouse mobile analytics',
  'customer-facing analytics',
  'database innovation',
  'clickhouse real-time applications',
  'alternative database solutions',
  'breaking database conventions',
  'production success stories'
]
title: 'Lessons - Creative Use Cases'
description: 'Find solutions to the most common ClickHouse problems including slow queries, memory errors, connection issues, and configuration problems.'
---

# Success stories {#breaking-the-rules}

*This guide is part of a collection of findings gained from community meetups. For more real world solutions and insights you can [browse by specific problem](./community-wisdom.md).*
*Need tips on debugging an issue in prod? Check out the [Debugging Insights](./debugging-insights.md) community guide.*

These stories showcase how companies found success by using ClickHouse for their use cases, some even challenging traditional database categories and proving that sometimes the "wrong" tool becomes exactly the right solution.

## ClickHouse as rate limiter {#clickhouse-rate-limiter}

When Craigslist needed to add tier-one rate limiting to protect their users, they faced the same decision every engineering team encounters -  follow conventional wisdom and use Redis, or explore something different. Brad Lhotsky, working at Craigslist, knew Redis was the standard choice - virtually every rate limiting tutorial and example online uses Redis for good reason. It has rich primitives for rate limiting operations, well-established patterns, and proven track record. But Craigslist's experience with Redis wasn't matching the textbook examples. *"Our experience with Redis is not like what you've seen in the movies... there are a lot of weird maintenance issues that we've hit where we reboot a node in a Redis cluster and some latency spike hits the front end."* For a small team that values maintenance simplicity, these operational headaches were becoming a real problem.

So when Brad was approached with the rate limiting requirements, he took a different approach: *"I asked my boss, 'What do you think of this idea? Maybe I can try this with ClickHouse?'"* The idea was unconventional - using an analytical database for what's typically a caching layer problem - but it addressed their core requirements: fail open, impose no latency penalties, and be maintenance-safe for a small team. The solution leveraged their existing infrastructure where access logs were already flowing into ClickHouse via Kafka. Instead of maintaining a separate Redis cluster, they could analyze request patterns directly from the access log data and inject rate limiting rules into their existing ACL API. The approach meant slightly higher latency than Redis, which *"is kind of cheating by instantiating that data set upfront"* rather than doing real-time aggregate queries, but the queries still completed in under 100 milliseconds.

**Key Results:**
- Dramatic improvement over Redis infrastructure
- Built-in TTL for automatic cleanup eliminated maintenance overhead
- SQL flexibility enabled complex rate limiting rules beyond simple counters
- Leveraged existing data pipeline instead of requiring separate infrastructure

## ClickHouse for customer analytics {#customer-analytics}

When ServiceNow needed to upgrade their mobile analytics platform, they faced a simple question: *"Why would we replace something that works?"* Amir Vaza from ServiceNow knew their existing system was reliable, but customer demands were outgrowing what it could handle. *"The motivation to replace an existing reliable model is actually from the product world,"* Amir explained. ServiceNow offered mobile analytics as part of their solution for web, mobile, and chatbots, but customers wanted analytical flexibility that went beyond pre-aggregated data.

Their previous system used about 30 different tables with pre-aggregated data segmented by fixed dimensions: application, app version, and platform. For custom properties—key-value pairs that customers could send—they created separate counters for each group. This approach delivered fast dashboard performance but came with a major limitation. *"While this is great for quick value breakdown, I mentioned limitation leads to a lot of loss of analytical context,"* Amir noted. Customers couldn't perform complex customer journey analysis or ask questions like "how many sessions started with the search term 'research RSA token'" and then analyze what those users did next. The pre-aggregated structure destroyed the sequential context needed for multi-step analysis, and every new analytical dimension required engineering work to pre-aggregate and store.

So when the limitations became clear, ServiceNow moved to ClickHouse and eliminated these pre-computation constraints entirely. Instead of calculating every variable upfront, they broke metadata into data points and inserted everything directly into ClickHouse. They used ClickHouse's async insert queue, which Amir called *"actually amazing,"* to handle data ingestion efficiently. The approach meant customers could now create their own segments, slice data freely across any dimensions, and perform complex customer journey analysis that wasn't possible before.

**Key Results:**
- Dynamic segmentation across any dimensions without pre-computation
- Complex customer journey analysis became possible
- Customers could create their own segments and slice data freely  
- No more engineering bottlenecks for new analytical requirements

## Video sources {#video-sources}

- **[Breaking the Rules - Building a Rate Limiter with ClickHouse](https://www.youtube.com/watch?v=wRwqrbUjRe4)** - Brad Lhotsky (Craigslist)
- **[ClickHouse as an Analytical Solution in ServiceNow](https://www.youtube.com/watch?v=b4Pmpx3iRK4)** - Amir Vaza (ServiceNow)

*These stories demonstrate how questioning conventional database wisdom can lead to breakthrough solutions that redefine what's possible with analytical databases.*