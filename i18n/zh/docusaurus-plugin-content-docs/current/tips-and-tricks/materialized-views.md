---
'sidebar_position': 1
'slug': '/tips-and-tricks/materialized-views'
'sidebar_label': '物化视图'
'doc_type': 'guide'
'keywords':
- 'clickhouse materialized views'
- 'materialized view optimization'
- 'materialized view storage issues'
- 'materialized view best practices'
- 'database aggregation patterns'
- 'materialized view anti-patterns'
- 'storage explosion problems'
- 'materialized view performance'
- 'database view optimization'
- 'aggregation strategy'
- 'materialized view troubleshooting'
- 'view storage overhead'
'title': '课程 - 物化视图'
'description': '现实世界中物化视图的例子，问题和解决方案'
---


# 物化视图：它们如何成为一把双刃剑 {#materialized-views-the-double-edged-sword}

*本指南是从社区聚会中获得的一系列发现的一部分。有关更多现实世界解决方案和见解，您可以 [按具体问题浏览](./community-wisdom.md)。*
*数据库受到过多分片的困扰？请查看 [过多分片](./too-many-parts.md) 社区见解指南。*
*了解更多关于 [物化视图](/materialized-views) 的信息。*

## 10倍存储反模式 {#storage-antipattern}

**真实的生产问题：** *“我们有一个物化视图。原始日志表约为20GB，但来自该日志表的视图膨胀到190GB，所以几乎是原始表大小的10倍。这是因为我们为每个属性创建了一行，而每个日志可以有10个属性。”*

**规则：** 如果您的 `GROUP BY` 创建的行数超过它消除的行数，您正在构建一个昂贵的索引，而不是一个物化视图。

## 生产物化视图健康验证 {#mv-health-validation}

此查询可以帮助您在创建物化视图之前预测它是否会压缩或膨胀您的数据。针对您的实际表和列运行它，以避免“190GB爆炸”的情况。

**它显示的内容：**
- **低聚合比**（\<10%） = 良好的物化视图，显著压缩
- **高聚合比**（\>70%） = 不良的物化视图，存储膨胀风险
- **存储倍增器** = 您的物化视图将增大/缩小的倍数

```sql
-- Replace with your actual table and columns
SELECT 
    count() as total_rows,
    uniq(your_group_by_columns) as unique_combinations,
    round(uniq(your_group_by_columns) / count() * 100, 2) as aggregation_ratio
FROM your_table
WHERE your_filter_conditions;

-- If aggregation_ratio > 70%, reconsider your MV design
-- If aggregation_ratio < 10%, you'll get good compression
```

## 何时物化视图会成为问题 {#mv-problems}

**需要监控的警告信号：**
- 插入延迟增加（之前10毫秒的查询现在需要100毫秒以上）
- “太多分片”错误出现得更频繁
- 插入操作期间CPU激增
- 插入超时以前没有发生过

您可以通过使用 `system.query_log` 比较添加物化视图前后的插入性能，以跟踪查询持续时间趋势。

## 视频来源 {#video-sources}
- [ClickHouse 在 CommonRoom - Kirill Sapchuk](https://www.youtube.com/watch?v=liTgGiTuhJE) - “对物化视图过于热情”和“20GB→190GB爆炸”案例研究的来源
