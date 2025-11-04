---
'sidebar_position': 1
'slug': '/community-wisdom/performance-optimization'
'sidebar_label': '性能优化'
'doc_type': 'guide'
'keywords':
- 'performance optimization'
- 'query performance'
- 'database tuning'
- 'slow queries'
- 'memory optimization'
- 'cardinality analysis'
- 'indexing strategies'
- 'aggregation optimization'
- 'sampling techniques'
- 'database performance'
- 'query analysis'
- 'performance troubleshooting'
'title': '课程 - 性能优化'
'description': '性能优化策略的实际案例'
---


# 性能优化：社区测试策略 {#performance-optimization}
*本指南是从社区会议中获得的一系列发现的一部分。有关更多现实世界的解决方案和见解，您可以[按特定问题浏览](./community-wisdom.md)。*
*对物化视图有疑问吗？请查看[物化视图](./materialized-views.md)社区见解指南。*
*如果您遇到慢查询并希望获得更多示例，我们还有[查询优化](/optimize/query-optimization)指南。*

## 按基数排序（从低到高） {#cardinality-ordering}
ClickHouse 的主索引在低基数列位于前面时效果最佳，这使其能够有效地跳过大块数据。基数高的列在键的后面提供了在这些块内的细粒度排序。从具有少量唯一值的列（如状态、类别、国家）开始，并以具有许多唯一值的列（如 user_id、时间戳、session_id）结束。

查看有关基数和主索引的更多文档：
- [选择主键](/best-practices/choosing-a-primary-key)
- [主索引](/primary-indexes)

## 时间粒度重要性 {#time-granularity}
在使用时间戳的 ORDER BY 子句时，请考虑基数与精度的权衡。微秒级精度的时间戳会产生非常高的基数（几乎每行一个唯一值），这降低了 ClickHouse 的稀疏主索引的有效性。四舍五入的时间戳创建较低的基数，从而实现更好的索引跳过，但您会失去基于时间的查询的精度。

```sql runnable editable
-- Challenge: Try different time functions like toStartOfMinute or toStartOfWeek
-- Experiment: Compare the cardinality differences with your own timestamp data
SELECT 
    'Microsecond precision' as granularity,
    uniq(created_at) as unique_values,
    'Creates massive cardinality - bad for sort key' as impact
FROM github.github_events
WHERE created_at >= '2024-01-01'
UNION ALL
SELECT 
    'Hour precision',
    uniq(toStartOfHour(created_at)),
    'Much better for sort key - enables skip indexing'
FROM github.github_events
WHERE created_at >= '2024-01-01'
UNION ALL  
SELECT 
    'Day precision',
    uniq(toStartOfDay(created_at)),
    'Best for reporting queries'
FROM github.github_events
WHERE created_at >= '2024-01-01';
```

## 着重于单个查询，而非平均值 {#focus-on-individual-queries-not-averages}

在调试 ClickHouse 性能时，不要依赖平均查询时间或整体系统指标。相反，要找出特定查询缓慢的原因。一个系统可能具有良好的平均性能，而单个查询却因内存耗尽、过滤不佳或高基数操作而变得缓慢。

据 ClickHouse 的首席技术官 Alexey 所说：*"正确的方法是问自己，为什么这个特别的查询耗时五秒……我不关心中位数和其他查询处理得快。我只关心我的查询"*

当查询缓慢时，不要仅仅查看平均值。问“为什么这个特定的查询缓慢？”并检查实际的资源使用模式。

## 内存和行扫描 {#memory-and-row-scanning}

Sentry 是一个以开发者为首的错误跟踪平台，每天处理来自 400 多万开发者的数十亿事件。他们的关键见解是：*"在这种特定情况下，驱动内存的分组键的基数"* - 高基数聚合会通过内存耗尽而损害性能，而不是行扫描。

当查询失败时，确定问题是内存问题（组太多）还是扫描问题（行太多）。

像 `GROUP BY user_id, error_message, url_path` 这样的查询为所有三种值的每个唯一组合创建一个单独的内存状态。随着用户、错误类型和 URL 路径的负载增加，您可能会轻松生成必须在内存中同时保持的数百万个聚合状态。

对于极端情况，Sentry 使用确定性抽样。10% 的样本将内存使用量减少 90%，同时保持大约 5% 的聚合精度：

```sql
WHERE cityHash64(user_id) % 10 = 0  -- Always same 10% of users
```

这确保相同的用户在每个查询中出现，从而在时间段之间提供一致的结果。关键见解是：`cityHash64()` 为相同输入生成一致的哈希值，因此 `user_id = 12345` 总是会哈希到相同的值，确保该用户要么始终出现在您的 10% 样本中，要么从未出现 - 在查询之间没有闪烁。

## Sentry 的位掩码优化 {#bit-mask-optimization}

在按高基数列（如 URL）聚合时，每个唯一值在内存中创建一个单独的聚合状态，导致内存耗尽。Sentry 的解决方案是：不按实际的 URL 字符串分组，而是按布尔表达式分组，以合并为位掩码。

这是您可以在自己表上尝试的查询，如果这种情况适用于您：

```sql
-- Memory-Efficient Aggregation Pattern: Each condition = one integer per group
-- Key insight: sumIf() creates bounded memory regardless of data volume
-- Memory per group: N integers (N * 8 bytes) where N = number of conditions

SELECT 
    your_grouping_column,

    -- Each sumIf creates exactly one integer counter per group
    -- Memory stays constant regardless of how many rows match each condition
    sumIf(1, your_condition_1) as condition_1_count,
    sumIf(1, your_condition_2) as condition_2_count,
    sumIf(1, your_text_column LIKE '%pattern%') as pattern_matches,
    sumIf(1, your_numeric_column > threshold_value) as above_threshold,

    -- Complex multi-condition aggregations still use constant memory
    sumIf(1, your_condition_1 AND your_text_column LIKE '%pattern%') as complex_condition_count,

    -- Standard aggregations for context
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

您不是在内存中存储每个唯一字符串，而是将有关这些字符串的问题的答案存储为整数。无论数据多样性如何，聚合状态的大小都变得有限且微小。

来自 Sentry 工程团队的反馈：“这些重查询的速度提高了十倍以上，我们的内存使用降低了 100 倍（更重要的是，保持在一定范围内）。我们的最大客户在搜索回放时不再看到错误，我们现在可以支持任意规模的客户，而不会耗尽内存。”

## 视频来源 {#video-sources}

- [Lost in the Haystack - 优化高基数聚合](https://www.youtube.com/watch?v=paK84-EUJCA) - Sentry 在内存优化方面的生产经验教训
- [ClickHouse 性能分析](https://www.youtube.com/watch?v=lxKbvmcLngo) - Alexey Milovidov 关于调试方法论
- [ClickHouse 会议：查询优化技术](https://www.youtube.com/watch?v=JBomQk4Icjo) - 社区优化策略

**下一步阅读**:
- [查询优化指南](/optimize/query-optimization)
- [物化视图社区见解](./materialized-views.md)
