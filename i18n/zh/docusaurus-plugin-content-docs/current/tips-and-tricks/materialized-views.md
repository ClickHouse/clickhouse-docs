---
sidebar_position: 1
slug: /tips-and-tricks/materialized-views
sidebar_label: '物化视图'
doc_type: 'guide'
keywords: [
  'clickhouse materialized views',
  'materialized view optimization',
  'materialized view storage issues',
  'materialized view best practices',
  'database aggregation patterns',
  'materialized view anti-patterns',
  'storage explosion problems',
  'materialized view performance',
  'database view optimization',
  'aggregation strategy',
  'materialized view troubleshooting',
  'view storage overhead'
]
title: '实践经验：物化视图'
description: '物化视图的真实案例、常见问题与解决方案'
---



# 物化视图:一把双刃剑 {#materialized-views-the-double-edged-sword}

_本指南是从社区交流会中总结的系列经验之一。如需了解更多实际解决方案和见解,可以[按具体问题浏览](./community-wisdom.md)。_
_数据分片过多导致数据库性能下降?请参阅[数据分片过多](./too-many-parts.md)社区经验指南。_
_了解更多关于[物化视图](/materialized-views)的信息。_


## 10倍存储反模式 {#storage-antipattern}

**真实生产问题：** _"我们有一个物化视图。原始日志表大约 20 GB，但从该日志表生成的视图膨胀到了 190 GB，几乎是原始表大小的 10 倍。这是因为我们为每个属性创建了一行，而每条日志可能有 10 个属性。"_

**规则：** 如果您的 `GROUP BY` 创建的行数多于它消除的行数，那么您构建的是一个昂贵的索引，而不是物化视图。


## 生产环境物化视图健康状况验证 {#mv-health-validation}

此查询可帮助您在创建物化视图之前预测其是否会压缩或膨胀数据。针对实际的表和列运行此查询,以避免"190GB 膨胀"场景的发生。

**查询结果说明:**

- **低聚合比率** (\<10%) = 物化视图设计良好,数据显著压缩
- **高聚合比率** (\>70%) = 物化视图设计不佳,存在存储膨胀风险
- **存储倍数** = 物化视图相对于源表的存储大小变化倍数

```sql
-- 替换为您的实际表和列
SELECT
    count() as total_rows, -- 总行数
    uniq(your_group_by_columns) as unique_combinations, -- 唯一组合数
    round(uniq(your_group_by_columns) / count() * 100, 2) as aggregation_ratio -- 聚合比率
FROM your_table
WHERE your_filter_conditions;

-- 如果 aggregation_ratio > 70%,请重新考虑物化视图设计
-- 如果 aggregation_ratio < 10%,将获得良好的压缩效果
```


## 当物化视图成为问题时 {#mv-problems}

**需要监控的警告信号:**

- 插入延迟增加(原本耗时 10ms 的查询现在需要 100ms 以上)
- "Too many parts" 错误出现得更加频繁
- 插入操作期间 CPU 出现峰值
- 之前未曾发生的插入超时

您可以使用 `system.query_log` 跟踪查询持续时间趋势,以比较添加物化视图前后的插入性能。


## 视频资源 {#video-sources}

- [ClickHouse at CommonRoom - Kirill Sapchuk](https://www.youtube.com/watch?v=liTgGiTuhJE) - "过度使用物化视图"和"20GB→190GB 数据膨胀"案例研究的来源
