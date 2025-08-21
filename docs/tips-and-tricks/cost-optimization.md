---
sidebar_position: 1
slug: /community-wisdom/cost-optimization
sidebar_label: 'Cost Optimization'
doc_type: 'overview'
keywords: [
  'cost optimization',
  'storage costs', 
  'partition management',
  'data retention',
  'storage analysis',
  'database optimization',
  'clickhouse cost reduction',
  'storage hot spots',
  'ttl performance',
  'disk usage',
  'compression strategies',
  'retention analysis'
]
title: 'Lessons - cost optimization'
description: 'Cost optimization strategies from ClickHouse community meetups with real production examples and verified techniques.'
---

# Cost optimization: strategies from the community {#cost-optimization}
*This guide is part of a collection of findings gained from community meetups. The findings on this page cover community wisdom related to optimizing cost while using ClickHouse that worked well for their specific experience and setup. For more real world solutions and insights you can [browse by specific problem](./community-wisdom.md).*

*Learn about how [ClickHouse Cloud can help manage operational costs](/cloud/overview)*.

## Compression strategy: LZ4 vs ZSTD in production {#compression-strategy}

When Microsoft Clarity needed to handle hundreds of terabytes of data, they discovered that compression choices have dramatic cost implications. At their scale, every bit of storage savings matters, and they faced a classic trade-off: performance versus storage costs. Microsoft Clarity handles massive volumes—two petabytes of uncompressed data per month across all accounts, processing around 60,000 queries per hour across eight nodes and serving billions of page views from millions of websites. At this scale, compression strategy becomes a critical cost factor.

They initially used ClickHouse's default [LZ4](/sql-reference/statements/create/table#lz4) compression but discovered significant cost savings were possible with [ZSTD](/sql-reference/statements/create/table#zstd). While LZ4 is faster, ZSTD provides better compression at the cost of slightly slower performance. After testing both approaches, they made a strategic decision to prioritize storage savings. The results were significant: 50% storage savings on large tables with manageable performance impact on ingestion and queries.

**Key results:**
- 50% storage savings on large tables through ZSTD compression
- 2 petabytes monthly data processing capacity
- Manageable performance impact on ingestion and queries
- Significant cost reduction at hundreds of TB scale

## Column-based retention strategy {#column-retention}

One of the most powerful cost optimization techniques comes from analyzing which columns are actually being used. Microsoft Clarity implements sophisticated column-based retention strategies using ClickHouse's built-in telemetry capabilities. ClickHouse provides detailed metrics on storage usage by column as well as comprehensive query patterns: which columns are accessed, how frequently, query duration, and overall usage statistics.

This data-driven approach enables strategic decisions about retention policies and column lifecycle management. By analyzing this telemetry data, Microsoft can identify storage hot spots - columns that consume significant space but receive minimal queries. For these low-usage columns, they can implement aggressive retention policies, reducing storage time from 30 months to just one month, or delete the columns entirely if they're not queried at all. This selective retention strategy reduces storage costs without impacting user experience.

**The strategy:**
- Analyze column usage patterns using ClickHouse telemetry
- Identify high-storage, low-query columns
- Implement selective retention policies
- Monitor query patterns for data-driven decisions

**Related docs**
- [Managing Data - Column Level TTL](/observability/managing-data)

## Partition-based data management {#partition-management}

Microsoft Clarity discovered that partitioning strategy impacts both performance and operational simplicity. Their approach: partition by date, order by hour. This strategy delivers multiple benefits beyond just cleanup efficiency—it enables trivial data cleanup, simplifies billing calculations for their customer-facing service, and supports GDPR compliance requirements for row-based deletion.

**Key benefits:**
- Trivial data cleanup (drop partition vs row-by-row deletion)
- Simplified billing calculations
- Better query performance through partition elimination
- Easier operational management

**Related docs**
- [Managing Data - Partitions](/observability/managing-data#partitions)

## String-to-integer conversion strategy {#string-integer-conversion}

Analytics platforms often face a storage challenge with categorical data that appears repeatedly across millions of rows. Microsoft's engineering team encountered this problem with their search analytics data and developed an effective solution that achieved 60% storage reduction on affected datasets.

In Microsoft's web analytics system, search results trigger different types of answers - weather cards, sports information, news articles, and factual responses. Each query result was tagged with descriptive strings like "weather_answer," "sports_answer," or "factual_answer." With billions of search queries processed, these string values were being stored repeatedly in ClickHouse, consuming massive amounts of storage space and requiring expensive string comparisons during queries.

Microsoft implemented a string-to-integer mapping system using a separate MySQL database. Instead of storing the actual strings in ClickHouse, they store only integer IDs. When users run queries through the UI and request data for `weather_answer`, their query optimizer first consults the MySQL mapping table to get the corresponding integer ID, then converts the query to use that integer before sending it to ClickHouse.

This architecture preserves the user experience - people still see meaningful labels like `weather_answer` in their dashboards - while the backend storage and queries operate on much more efficient integers. The mapping system handles all translation transparently, requiring no changes to the user interface or user workflows.

**Key benefits:**
- 60% storage reduction on affected datasets
- Faster query performance on integer comparisons
- Reduced memory usage for joins and aggregations
- Lower network transfer costs for large result sets

:::note
This is a an example specifically used for Microsoft Clarity's data scenario. If you have all your data in ClickHouse or do not have constraints against moving data to ClickHouse, try using [dictionaries](/dictionary) instead.
:::

## Video sources {#video-sources}

- **[Microsoft Clarity and ClickHouse](https://www.youtube.com/watch?v=rUVZlquVGw0)** - Microsoft Clarity Team
- **[ClickHouse journey in Contentsquare](https://www.youtube.com/watch?v=zvuCBAl2T0Q)** - Doron Hoffman & Guram Sigua (ContentSquare)

*These community cost optimization insights represent strategies from companies processing hundreds of terabytes to petabytes of data, showing real-world approaches to reducing ClickHouse operational costs.*