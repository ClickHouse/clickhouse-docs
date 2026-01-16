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

# 性能优化：经过社区验证的策略 \{#performance-optimization\}
*本指南是基于社区 Meetup 活动总结的经验汇总。若想获取更多真实场景中的解决方案与见解，可以[按具体问题浏览](./community-wisdom.md)。*
*在使用物化视图时遇到问题？请查看[物化视图](./materialized-views.md)社区见解指南。*
*如果你遇到查询变慢的问题并希望查看更多示例，我们还提供了[查询优化](/optimize/query-optimization)指南。*

## 按基数排序（从低到高） \{#cardinality-ordering\}
当低基数列排在前面时，ClickHouse 的主索引效果最佳，可以更高效地跳过大块数据。键中后面的高基数列则用于在这些数据块内提供更细粒度的排序。请从具有较少唯一值的列开始（如 status、category、country），最后再放置具有大量唯一值的列（如 user_id、timestamp、session_id）。

在以下文档中了解更多关于基数和主索引的内容：
- [选择主键](/best-practices/choosing-a-primary-key)
- [主索引](/primary-indexes)

## 时间粒度很重要 \{#time-granularity\}

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

## 聚焦单条查询，而不是平均值 \{#focus-on-individual-queries-not-averages\}

在排查 ClickHouse 性能问题时，不要依赖平均查询时间或系统整体指标。相反，要找出为什么某些特定查询会变慢。系统在平均意义上可能表现良好，但单条查询可能会因为内存耗尽、过滤不佳或高基数操作而表现很差。

ClickHouse 的 CTO Alexey 指出：*"正确的做法是问自己，为什么这条特定查询要花五秒钟才处理完……我不在乎中位数和其他查询处理得有多快。我只关心我的这条查询"*。

当某条查询变慢时，不要只看平均值。要问“为什么偏偏是这条查询慢？”，并检查其实际的资源使用模式。

## 内存与行扫描 \{#memory-and-row-scanning\}

Sentry 是一个面向开发者的错误跟踪平台，每天为 400 多万开发者处理数十亿个事件。他们的一个关键认识是：*“在这种特定情形下，驱动内存使用的是分组键的基数（cardinality）”*——高基数聚合拖垮性能，根本原因在于内存被耗尽，而不是扫描了太多行。

当查询失败时，要先判断这是内存问题（分组过多）还是扫描问题（行数过多）。

像 `GROUP BY user_id, error_message, url_path` 这样的查询，会为这三个值的每一种唯一组合创建一个独立的内存状态。随着用户数量、错误类型和 URL 路径的增加，你很容易就会生成数百万个必须同时保存在内存中的聚合状态。

在极端场景下，Sentry 使用确定性采样。10% 的采样可以将内存使用量降低 90%，同时对大多数聚合仍能保持大约 5% 的精度：

```sql
WHERE cityHash64(user_id) % 10 = 0  -- 始终为相同的 10% 用户
```

这可以确保相同的用户在每次查询中都会以相同的方式出现，从而在不同时间段内提供一致的结果。关键在于：`cityHash64()` 会对相同输入生成一致的哈希值，因此 `user_id = 12345` 始终会被哈希到同一个值，保证该用户要么始终出现在你的 10% 样本中，要么从不出现——不会在不同查询之间时有时无。

## Sentry 的位掩码优化 \{#bit-mask-optimization\}

当按高基数列（如 URL）进行聚合时，每个唯一值都会在内存中创建一个单独的聚合状态，最终可能导致内存耗尽。Sentry 的解决方案是：不再按实际的 URL 字符串分组，而是按会被归约为位掩码的布尔表达式分组。

如果你也遇到类似情况，可以在自己的表上运行下面的查询：

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

## 视频资源 \{#video-sources\}

- [Lost in the Haystack - Optimizing High Cardinality Aggregations](https://www.youtube.com/watch?v=paK84-EUJCA) - 来自 Sentry 的生产环境内存优化实战经验
- [ClickHouse Performance Analysis](https://www.youtube.com/watch?v=lxKbvmcLngo) - Alexey Milovidov 讲解性能调试方法论
- [ClickHouse Meetup: Query Optimization Techniques](https://www.youtube.com/watch?v=JBomQk4Icjo) - 社区查询优化策略

**延伸阅读**:
- [查询优化指南](/optimize/query-optimization)
- [物化视图社区洞见](./materialized-views.md)