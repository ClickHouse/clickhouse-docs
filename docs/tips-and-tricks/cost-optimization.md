---
sidebar_position: 1
slug: /community-wisdom/cost-optimization
sidebar_label: 'Cost Optimization'
doc_type: 'how-to-guide'
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
title: 'Lessons - Cost Optimization'
description: 'Battle-tested cost optimization strategies from ClickHouse community meetups with real production examples and verified techniques.'
---

# Cost Optimization: Battle-Tested Strategies {#cost-optimization}
*This guide is part of a collection of findings gained from community meetups. The findings on this page cover community wisdom related to optimizing cost while using ClickHouse. For more real world solutions and insights you can [browse by specific problem](./community-wisdom.md).*

## The ContentSquare Migration: 11x Cost Reduction {#contentsquare-migration}

ContentSquare's migration from Elasticsearch to ClickHouse shows the cost optimization potential when moving to ClickHouse for analytics workloads, involving over 1,000 enterprise customers and processing over one billion page views daily. Before migration, ContentSquare ran 14 Elasticsearch clusters, each with 30 nodes, and struggled to make them bigger while keeping them stable. They were unable to host very large clients with high traffic, and frequently had to move clients between clusters as their traffic grew beyond cluster capacity.

ContentSquare took a phased approach to avoid disrupting business operations. They first tested ClickHouse on a new mobile analytics product, which took four months to ship to production. This success convinced them to migrate their main web analytics platform. The full web migration took ten months to port all endpoints, followed by careful client-by-client migration of 600 clients in batches to avoid performance issues. They built extensive automation for non-regression testing, allowing them to complete the migration with zero regressions.

After migration, the infrastructure became 11x cheaper while storing six times more data and delivering 10x faster performance on the 99th percentile queries. *"We are saving multiple millions per year using ClickHouse,"* the team noted. The performance improvements were particularly notable for their slowest queries—while fast queries (200ms on Elasticsearch) only improved to about 100ms on ClickHouse, their worst-performing queries went from over 15 seconds on Elasticsearch to under 2 seconds on ClickHouse.

Their current ClickHouse setup includes 16 clusters across four regions on AWS and Azure, with over 100 nodes total. Each cluster typically has nine shards with two replicas per shard. They process approximately 100,000 analytics queries daily with an average response time of 200 milliseconds, while also increasing data retention from 3 months to 13 months.

**Key Results:**
- 11x reduction in infrastructure costs
- 6x increase in data storage capacity
- 10x faster 99th percentile query performance
- Multiple millions in annual savings
- Increased data retention from 3 months to 13 months
- Zero regressions during migration

## Compression Strategy: LZ4 vs ZSTD in Production {#compression-strategy}

When Microsoft Clarity needed to handle hundreds of terabytes of data, they discovered that compression choices have dramatic cost implications. At their scale, every bit of storage savings matters, and they faced a classic trade-off: performance versus storage costs. Microsoft Clarity handles massive volumes—two petabytes of uncompressed data per month across all accounts, processing around 60,000 queries per hour across eight nodes and serving billions of page views from millions of websites. At this scale, compression strategy becomes a critical cost factor.

They initially used ClickHouse's default LZ4 compression but discovered significant cost savings were possible with ZSTD. While LZ4 is faster, ZSTD provides better compression at the cost of slightly slower performance. After testing both approaches, they made a strategic decision to prioritize storage savings. The results were significant: 50% storage savings on large tables with manageable performance impact on ingestion and queries.

**Key Results:**
- 50% storage savings on large tables through ZSTD compression
- 2 petabytes monthly data processing capacity
- Manageable performance impact on ingestion and queries
- Significant cost reduction at hundreds of TB scale

## Column-Based Retention Strategy {#column-retention}

One of the most powerful cost optimization techniques comes from analyzing which columns are actually being used. Microsoft Clarity implements sophisticated column-based retention strategies using ClickHouse's built-in telemetry capabilities. ClickHouse provides detailed metrics on storage usage by column as well as comprehensive query patterns—which columns are accessed, how frequently, query duration, and overall usage statistics.

This data-driven approach enables strategic decisions about retention policies and column lifecycle management. By analyzing this telemetry data, Microsoft can identify storage hot spots—columns that consume significant space but receive minimal queries. For these low-usage columns, they can implement aggressive retention policies, reducing storage time from 30 months to just one month, or delete the columns entirely if they're not queried at all. This selective retention strategy reduces storage costs without impacting user experience.

**The Strategy:**
- Analyze column usage patterns using ClickHouse telemetry
- Identify high-storage, low-query columns
- Implement selective retention policies
- Monitor query patterns for data-driven decisions

## Partition-Based Data Management {#partition-management}

Microsoft Clarity discovered that partitioning strategy impacts both performance and operational simplicity. Their approach: partition by date, order by hour. This strategy delivers multiple benefits beyond just cleanup efficiency—it enables trivial data cleanup, simplifies billing calculations for their customer-facing service, and supports GDPR compliance requirements for row-based deletion.

**Key Benefits:**
- Trivial data cleanup (drop partition vs row-by-row deletion)
- Simplified billing calculations
- Better query performance through partition elimination
- Easier operational management

## String-to-Integer Conversion Strategy {#string-integer-conversion}

Analytics platforms often face a storage challenge with categorical data that appears repeatedly across millions of rows. Microsoft's engineering team encountered this problem with their search analytics data and developed an effective solution that achieved 60% storage reduction on affected datasets.

In Microsoft's web analytics system, search results trigger different types of answers—weather cards, sports information, news articles, and factual responses. Each query result was tagged with descriptive strings like "weather_answer," "sports_answer," or "factual_answer." With billions of search queries processed, these string values were being stored repeatedly in ClickHouse, consuming massive amounts of storage space and requiring expensive string comparisons during queries.

Microsoft implemented a string-to-integer mapping system using a separate MySQL database. Instead of storing the actual strings in ClickHouse, they store only integer IDs. When users run queries through the UI and request data for "weather_answer," their query optimizer first consults the MySQL mapping table to get the corresponding integer ID, then converts the query to use that integer before sending it to ClickHouse.

This architecture preserves the user experience—people still see meaningful labels like "weather_answer" in their dashboards—while the backend storage and queries operate on much more efficient integers. The mapping system handles all translation transparently, requiring no changes to the user interface or user workflows.

**Key Benefits:**
- 60% storage reduction on affected datasets
- Faster query performance on integer comparisons
- Reduced memory usage for joins and aggregations
- Lower network transfer costs for large result sets

## Video Sources {#video-sources}

- **[Microsoft Clarity and ClickHouse](https://www.youtube.com/watch?v=rUVZlquVGw0)** - Microsoft Clarity Team
- **[ClickHouse journey in Contentsquare](https://www.youtube.com/watch?v=zvuCBAl2T0Q)** - Doron Hoffman & Guram Sigua (ContentSquare)

*These community cost optimization insights represent strategies from companies processing hundreds of terabytes to petabytes of data, showing real-world approaches to reducing ClickHouse operational costs.*