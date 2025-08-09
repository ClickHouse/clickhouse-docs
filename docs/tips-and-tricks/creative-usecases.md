---
sidebar_position: 1
slug: /community-wisdom/creative-use-cases
sidebar_label: 'Creative Use Cases'
doc_type: 'how-to-guide'
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

# Breaking the Rules: Success Stories {#breaking-the-rules}
*This guide is part of a collection of findings gained from community meetups. For more real world solutions and insights you can [browse by specific problem](./community-wisdom.md).*
*Need tips on debugging an issue in prod? Check out the [Debugging Toolkit](./debugging-toolkit.md) community insights guide.*

## ClickHouse as Rate Limiter (Craigslist Story) {#clickhouse-rate-limiter}

**Conventional wisdom:** Use Redis for rate limiting.

**Craigslist's breakthrough:** *"Everyone uses Redis for rate limiter implementations... Why not just do it in Redis?"*

**The problem with Redis:** *"Our experience with Redis is not like what you've seen in the movies... weird maintenance issues... we will reboot a node in a Redis cluster and some weird latency spike hits the front end"*

**Test rate limiting logic using ClickHouse approach:**

```sql runnable editable
-- Challenge: Try different rate limit thresholds (100, 50) or time windows (hour vs minute)
-- Experiment: Test with different user patterns by changing the HAVING clause
SELECT 
    actor_login as user_id,
    toStartOfHour(created_at) as hour,
    count() as requests_per_hour,
    CASE 
        WHEN count() > 100 THEN 'RATE_LIMITED'
        WHEN count() > 50 THEN 'WARNING' 
        ELSE 'ALLOWED'
    END as rate_limit_status
FROM github.github_events 
WHERE created_at >= '2024-01-15'
  AND created_at < '2024-01-16'
GROUP BY actor_login, hour
HAVING count() > 10
ORDER BY requests_per_hour DESC
LIMIT 20;
```

**Results:** *"Running untouched for nearly a year without any alert"* - a dramatic improvement over Redis infrastructure.

**Why it works:**
- Incredible write performance for access log data
- Built-in TTL for automatic cleanup  
- SQL flexibility for complex rate limiting rules
- No Redis cluster maintenance headaches

## Mobile Analytics: The 7-Eleven Success Story {#mobile-analytics}

**Conventional wisdom:** Analytics databases aren't for mobile applications.

**The reality:** *"People out in the factory floors... people out in health care facilities construction sites... they like to be able to look at reports... to sit at a computer at a desktop... is just not optimal"*

**7-Eleven's breakthrough:** Store managers using ClickHouse-powered analytics on mobile devices.

```sql runnable editable
-- Challenge: Modify this to show weekly or monthly patterns instead of daily
-- Experiment: Add different metrics like peak activity hours or user retention patterns
SELECT 
    'Daily Sales Summary' as report_type,
    toDate(created_at) as date,
    count() as total_transactions,
    uniq(actor_login) as unique_customers,
    round(count() / uniq(actor_login), 1) as avg_transactions_per_customer,
    'Perfect for mobile dashboard' as mobile_optimized
FROM github.github_events 
WHERE created_at >= today() - 7
GROUP BY date
ORDER BY date DESC;
```

**The use case:** *"The person who runs a store they're going back and forth between the stock room out to the front into the register and then going between stores"*

**Success metrics:**
- Daily sales by store (corporate + franchise)
- Out-of-stock alerts in real-time
- *"Full feature capability between your phone and your desktop"*

## Customer-Facing Real-Time Applications {#customer-facing-applications}

**Conventional wisdom:** ClickHouse is for internal analytics, not customer-facing apps.

**ServiceNow's reality:** *"We offer an analytic solution both for internal needs and for customers across web mobile and chatbots"*

**The breakthrough insight:** *"It enables you to build applications that are highly responsive... customer facing applications... whether they're web apps or mobile apps"*

```sql runnable editable
-- Challenge: Try different segmentation approaches like geographic or time-based grouping  
-- Experiment: Add percentage calculations or ranking functions for customer insights
SELECT 
    'Customer Segmentation' as feature,
    event_type as segment,
    count() as segment_size,
    round(count() * 100.0 / sum(count()) OVER(), 1) as percentage,
    'Real-time customer insights' as value_proposition
FROM github.github_events 
WHERE created_at >= '2024-01-01'
  AND created_at < '2024-01-02'
GROUP BY event_type
ORDER BY segment_size DESC;
```

**Why this breaks conventional rules:**
- **Real-time customer segmentation:** *"Give customers the ability to real-time segments the data and dynamically slicing"*
- **User expectations:** *"In 2024 we have been very much trained to expect a certain degree of responsiveness"* 
- **Retention impact:** *"If that repeats often enough you're either not going to come back"*

**Success pattern:** ClickHouse's speed enables customer-facing applications with sub-second response times, challenging the notion that analytical databases are only for internal use.

### The Rule-Breaking Philosophy {#rule-breaking-philosophy}

**Common thread:** These successes came from questioning assumptions:
- *"I asked my boss like what do you think of this idea maybe I can try this with ClickHouse"* - Craigslist
- *"Mobile first actually became a big part of how we thought about this"* - Mobile analytics pioneers  
- *"We wanted to give customers the ability to... slice and dice everything as much as they wanted"* - ServiceNow

**The lesson:** Sometimes the "wrong" tool for the job becomes the right tool when you understand its strengths and design around them.
