---
sidebar_position: 1
slug: /tips-and-tricks/materialized-views
sidebar_label: '物化视图'
doc_type: 'guide'
keywords: [
  'ClickHouse 物化视图',
  '物化视图优化',
  '物化视图存储问题',
  '物化视图最佳实践',
  '数据库聚合模式',
  '物化视图反模式',
  '存储爆炸问题',
  '物化视图性能',
  '数据库视图优化',
  '聚合策略',
  '物化视图故障排查',
  '视图存储开销'
]
title: '物化视图实践经验'
description: '物化视图的真实案例、常见问题与解决方案'
---

# 物化视图：如何让它成为一把双刃剑 {#materialized-views-the-double-edged-sword}

*本指南是从社区线下交流活动中总结出的经验的一部分。想获取更多真实场景的解决方案和洞察，可以[按具体问题浏览](./community-wisdom.md)。*
*过多的数据分片正在拖慢你的数据库吗？请查看 [Too Many Parts](./too-many-parts.md) 社区洞察指南。*
*进一步了解[物化视图](/materialized-views)。*

## 10 倍存储反模式 {#storage-antipattern}

**真实生产问题：** *“我们有一个物化视图。原始日志表大约是 20GB，但基于这个日志表的视图膨胀到了 190GB，几乎是原始表大小的 10 倍。之所以会这样，是因为我们为每个属性创建了一行，而每条日志可以有 10 个属性。”*

**规则：** 如果你的 `GROUP BY` 产生的行数多于它减少的行数，那你构建的是一个代价高昂的索引，而不是物化视图。

## 生产环境物化视图健康状况验证 {#mv-health-validation}

此查询可帮助你在创建物化视图之前预测，它是会压缩数据还是导致数据膨胀。请在实际的表和列上运行此查询，以避免出现类似 “190GB 爆炸” 的情况。

**该查询显示：**

* **低聚合比**（&lt;10%）= 优秀的 MV，具有显著压缩效果
* **高聚合比**（&gt;70%）= 糟糕的 MV，存在存储膨胀风险
* **存储倍数** = 你的 MV 相比原始表会放大/缩小多少倍

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

## 当物化视图开始带来问题时 {#mv-problems}

**需要监控的预警信号：**
- 写入延迟增加（原本耗时 10ms 的查询现在需要 100ms 以上）
- "Too many parts" 错误出现得更频繁
- 写入操作期间出现 CPU 峰值
- 出现此前从未发生过的写入超时

你可以使用 `system.query_log` 比较添加物化视图前后的写入性能，以跟踪查询耗时趋势。

## 视频来源 {#video-sources}
- [ClickHouse at CommonRoom - Kirill Sapchuk](https://www.youtube.com/watch?v=liTgGiTuhJE) - “过度迷恋物化视图”和“20GB→190GB 激增”案例研究的出处