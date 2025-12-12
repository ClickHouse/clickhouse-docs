---
sidebar_position: 1
slug: /community-wisdom/performance-optimization
sidebar_label: '性能优化'
doc_type: 'guide'
keywords: [
  '性能优化',
  '查询性能',
  '数据库调优',
  '慢查询',
  '内存优化',
  '基数分析',
  '索引策略',
  '聚合优化',
  '采样技术',
  '数据库性能',
  '查询分析',
  '性能故障排查'
]
title: '实践经验 - 性能优化'
description: '性能优化策略的真实案例'
---

# 性能优化：经过社区验证的策略 {#performance-optimization}
*本指南是基于社区 Meetup 活动总结的经验汇总。若想获取更多真实场景中的解决方案与见解，可以[按具体问题浏览](./community-wisdom.md)。*
*在使用物化视图时遇到问题？请查看[物化视图](./materialized-views.md)社区见解指南。*
*如果你遇到查询变慢的问题并希望查看更多示例，我们还提供了[查询优化](/optimize/query-optimization)指南。*

## 按基数排序（从低到高） {#cardinality-ordering}
当低基数列排在前面时，ClickHouse 的主索引效果最佳，可以更高效地跳过大块数据。键中后面的高基数列则用于在这些数据块内提供更细粒度的排序。请从具有较少唯一值的列开始（如 status、category、country），最后再放置具有大量唯一值的列（如 user_id、timestamp、session_id）。

在以下文档中了解更多关于基数和主索引的内容：
- [选择主键](/best-practices/choosing-a-primary-key)
- [主索引](/primary-indexes)

## 时间粒度很重要 {#time-granularity}

在 ORDER BY 子句中使用时间戳时，需要权衡基数与精度之间的取舍。微秒级精度的时间戳会产生非常高的基数（几乎每行一个唯一值），从而降低 ClickHouse 稀疏主索引的效率。对时间戳进行取整可以降低基数，从而实现更好的索引跳过，但会在基于时间的查询中损失时间精度。

```sql runnable editable
-- 挑战：尝试不同的时间函数，如 toStartOfMinute 或 toStartOfWeek
-- 实验：使用您自己的时间戳数据比较基数差异
SELECT 
    '微秒精度' as granularity,
    uniq(created_at) as unique_values,
    '产生大量基数 - 不适合作为排序键' as impact
FROM github.github_events
WHERE created_at >= '2024-01-01'
UNION ALL
SELECT 
    '小时精度',
    uniq(toStartOfHour(created_at)),
    '更适合作为排序键 - 支持跳数索引'
FROM github.github_events
WHERE created_at >= '2024-01-01'
UNION ALL  
SELECT 
    '天精度',
    uniq(toStartOfDay(created_at)),
    '最适合报表查询'
FROM github.github_events
WHERE created_at >= '2024-01-01';
```

## Focus on individual queries, not averages {#focus-on-individual-queries-not-averages}

When debugging ClickHouse performance, don't rely on average query times or overall system metrics. Instead, identify why specific queries are slow. A system can have good average performance while individual queries suffer from memory exhaustion, poor filtering, or high cardinality operations.

According to Alexey, CTO of ClickHouse: *"The right way is to ask yourself why this particular query was processed in five seconds... I don't care if median and other queries process quickly. I only care about my query"*

When a query is slow, don't just look at averages. Ask "Why was THIS specific query slow?" and examine the actual resource usage patterns.

## Memory and row scanning {#memory-and-row-scanning}

Sentry is a developer-first error tracking platform processing billions of events daily from 4+ million developers. Their key insight: *"The cardinality of the grouping key that's going to drive memory in this particular situation"* - High cardinality aggregations kill performance through memory exhaustion, not row scanning.

When queries fail, determine if it's a memory problem (too many groups) or scanning problem (too many rows).

A query like `GROUP BY user_id, error_message, url_path` creates a separate memory state for every unique combination of all three values together. With a higher load of users, error types, and URL paths, you could easily generate millions of aggregation states that must be held in memory simultaneously.

For extreme cases, Sentry uses deterministic sampling. A 10% sample reduces memory usage by 90% while maintaining roughly 5% accuracy for most aggregations:

```sql
WHERE cityHash64(user_id) % 10 = 0  -- 始终为相同的 10% 用户
```

This ensures the same users appear in every query, providing consistent results across time periods. The key insight: `cityHash64()` produces consistent hash values for the same input, so `user_id = 12345` will always hash to the same value, ensuring that user either always appears in your 10% sample or never does - no flickering between queries.

## Sentry's bit mask optimization {#bit-mask-optimization}

When aggregating by high-cardinality columns (like URLs), each unique value creates a separate aggregation state in memory, leading to memory exhaustion. Sentry's solution: instead of grouping by the actual URL strings, group by boolean expressions that collapse into bit masks.

Here is a query that you can try on your own tables if this situation applies to you:

```sql
-- 内存高效聚合模式：每个条件 = 每组一个整数
-- 核心要点：sumIf() 创建有界内存，与数据量无关
-- 每组内存：N 个整数（N * 8 字节），其中 N = 条件数量

SELECT 
    your_grouping_column,
    
    -- 每个 sumIf 为每组创建恰好一个整数计数器
    -- 无论有多少行匹配每个条件，内存保持恒定
    sumIf(1, your_condition_1) as condition_1_count,
    sumIf(1, your_condition_2) as condition_2_count,
    sumIf(1, your_text_column LIKE '%pattern%') as pattern_matches,
    sumIf(1, your_numeric_column > threshold_value) as above_threshold,
    
    -- 复杂的多条件聚合仍使用恒定内存
    sumIf(1, your_condition_1 AND your_text_column LIKE '%pattern%') as complex_condition_count,
    
    -- 标准聚合（用于上下文）
    count() as total_rows,
    avg(your_numeric_column) as average_value,
    max(your_timestamp_column) as latest_timestamp
    
FROM your_schema.your_table
WHERE your_timestamp_column >= 'start_date' 
  AND your_timestamp_column < 'end_date'
GROUP BY your_grouping_column
HAVING condition_1_count > minimum_threshold 
   OR condition_2_count > another_threshold
ORDER BY (condition_1_count + condition_2_count + pattern_matches) DESC
LIMIT 20
```

与其在内存中存储每一个唯一字符串，不如只存储针对这些字符串的问题的答案，并用整数来表示。无论数据多么多样，聚合状态都被严格限制在一个非常小的范围内。

来自 Sentry 工程团队的反馈：“这些重量级查询的速度提升了 10 倍以上，而内存使用降低了 100 倍（更重要的是，现在是有上界的）。我们最大的一些客户在搜索回放时不再遇到错误，我们现在也可以在不耗尽内存的情况下支持任意规模的客户。”

## 视频资源 {#video-sources}

- [Lost in the Haystack - Optimizing High Cardinality Aggregations](https://www.youtube.com/watch?v=paK84-EUJCA) - 来自 Sentry 的生产环境内存优化实战经验
- [ClickHouse Performance Analysis](https://www.youtube.com/watch?v=lxKbvmcLngo) - Alexey Milovidov 讲解性能调试方法论
- [ClickHouse Meetup: Query Optimization Techniques](https://www.youtube.com/watch?v=JBomQk4Icjo) - 社区查询优化策略

**延伸阅读**:
- [查询优化指南](/optimize/query-optimization)
- [物化视图社区洞见](./materialized-views.md)