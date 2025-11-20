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
description: '性能优化策略的真实实践案例'
---



# 性能优化：社区实践策略 {#performance-optimization}

_本指南汇集了来自社区交流会的实践经验。如需了解更多实际应用场景的解决方案和见解，可以[按具体问题浏览](./community-wisdom.md)。_
_物化视图使用遇到问题？请参阅[物化视图](./materialized-views.md)社区实践指南。_
_如果您的查询性能较慢且需要更多优化示例，我们还提供了[查询优化](/optimize/query-optimization)指南。_


## 按基数排序(从低到高) {#cardinality-ordering}

当低基数列排在前面时,ClickHouse 的主索引效果最佳,这样可以高效地跳过大块数据。键中靠后的高基数列可在这些数据块内提供细粒度排序。建议从具有少量唯一值的列(如 status、category、country)开始,以具有大量唯一值的列(如 user_id、timestamp、session_id)结束。

查看更多关于基数和主索引的文档:

- [选择主键](/best-practices/choosing-a-primary-key)
- [主索引](/primary-indexes)


## 时间粒度很重要 {#time-granularity}

在 ORDER BY 子句中使用时间戳时,需要权衡基数与精度的取舍。微秒精度的时间戳会产生极高的基数(几乎每行一个唯一值),这会降低 ClickHouse 稀疏主索引的效率。对时间戳进行舍入会产生较低的基数,从而实现更好的索引跳过,但会损失基于时间查询的精度。

```sql runnable editable
-- 挑战:尝试不同的时间函数,如 toStartOfMinute 或 toStartOfWeek
-- 实验:使用您自己的时间戳数据比较基数差异
SELECT
    '微秒精度' as granularity,
    uniq(created_at) as unique_values,
    '产生极高基数 - 不利于排序键' as impact
FROM github.github_events
WHERE created_at >= '2024-01-01'
UNION ALL
SELECT
    '小时精度',
    uniq(toStartOfHour(created_at)),
    '更适合排序键 - 支持索引跳过'
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


## 关注单个查询,而非平均值 {#focus-on-individual-queries-not-averages}

在调试 ClickHouse 性能时,不要依赖平均查询时间或整体系统指标。相反,应该找出特定查询缓慢的原因。一个系统可能具有良好的平均性能,但个别查询却可能因内存耗尽、过滤不当或高基数操作而变慢。

据 ClickHouse 首席技术官 Alexey 所说:_"正确的做法是问自己为什么这个特定查询需要五秒钟来处理……我不关心中位数和其他查询是否处理得快。我只关心我的查询"_

当查询缓慢时,不要只看平均值。问"为什么这个特定查询很慢?"并检查实际的资源使用模式。


## 内存与行扫描 {#memory-and-row-scanning}

Sentry 是一个面向开发者的错误跟踪平台,每天处理来自 400 多万开发者的数十亿事件。他们的核心洞察:_"分组键的基数决定了这种特定场景下的内存消耗"_ - 高基数聚合通过内存耗尽而非行扫描导致性能下降。

当查询失败时,需要判断是内存问题(分组过多)还是扫描问题(行数过多)。

像 `GROUP BY user_id, error_message, url_path` 这样的查询会为这三个值的每个唯一组合创建单独的内存状态。随着用户数、错误类型和 URL 路径的增加,很容易产生数百万个必须同时保存在内存中的聚合状态。

对于极端情况,Sentry 使用确定性采样。10% 的采样可将内存使用量减少 90%,同时对大多数聚合保持约 5% 的精度:

```sql
WHERE cityHash64(user_id) % 10 = 0  -- 始终是相同的 10% 用户
```

这确保相同的用户出现在每个查询中,在不同时间段提供一致的结果。核心原理:`cityHash64()` 为相同的输入生成一致的哈希值,因此 `user_id = 12345` 将始终哈希到相同的值,确保该用户要么始终出现在 10% 的样本中,要么永远不出现 - 查询之间不会出现闪烁。


## Sentry 的位掩码优化 {#bit-mask-optimization}

当按高基数列(如 URL)进行聚合时,每个唯一值都会在内存中创建一个单独的聚合状态,导致内存耗尽。Sentry 的解决方案:不按实际的 URL 字符串分组,而是按可折叠为位掩码的布尔表达式分组。

如果这种情况适用于您,以下是一个可以在您自己的表上尝试的查询:

```sql
-- 内存高效聚合模式:每个条件 = 每组一个整数
-- 关键要点:sumIf() 创建有界内存,与数据量无关
-- 每组内存:N 个整数(N * 8 字节),其中 N = 条件数量

SELECT
    your_grouping_column,

    -- 每个 sumIf 为每组创建恰好一个整数计数器
    -- 无论有多少行匹配每个条件,内存保持恒定
    sumIf(1, your_condition_1) as condition_1_count,
    sumIf(1, your_condition_2) as condition_2_count,
    sumIf(1, your_text_column LIKE '%pattern%') as pattern_matches,
    sumIf(1, your_numeric_column > threshold_value) as above_threshold,

    -- 复杂的多条件聚合仍然使用恒定内存
    sumIf(1, your_condition_1 AND your_text_column LIKE '%pattern%') as complex_condition_count,

    -- 用于上下文的标准聚合
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

这种方法不是在内存中存储每个唯一字符串,而是将关于这些字符串的问题的答案存储为整数。无论数据多样性如何,聚合状态都变得有界且极小。

来自 Sentry 工程团队:"这些重型查询的速度提高了 10 倍以上,我们的内存使用量降低了 100 倍(更重要的是,内存使用是有界的)。我们最大的客户在搜索回放时不再看到错误,我们现在可以支持任意规模的客户而不会耗尽内存。"


## 视频资源 {#video-sources}

- [Lost in the Haystack - Optimizing High Cardinality Aggregations](https://www.youtube.com/watch?v=paK84-EUJCA) - Sentry 生产环境内存优化实践经验
- [ClickHouse Performance Analysis](https://www.youtube.com/watch?v=lxKbvmcLngo) - Alexey Milovidov 讲解性能调试方法论
- [ClickHouse Meetup: Query Optimization Techniques](https://www.youtube.com/watch?v=JBomQk4Icjo) - 社区查询优化策略

**延伸阅读**:

- [查询优化指南](/optimize/query-optimization)
- [物化视图社区实践](./materialized-views.md)
