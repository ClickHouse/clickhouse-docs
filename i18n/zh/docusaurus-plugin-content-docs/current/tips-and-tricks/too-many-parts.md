---
sidebar_position: 1
slug: /tips-and-tricks/too-many-parts
sidebar_label: 'Too Many Parts 问题'
doc_type: 'guide'
keywords: [
  'clickhouse too many parts',
  'too many parts 错误',
  'clickhouse 插入批处理',
  'part 数量爆炸问题',
  'clickhouse 合并性能',
  '批量插入优化',
  'clickhouse 异步插入',
  '小批量插入问题',
  'clickhouse part 管理',
  '插入性能优化',
  'clickhouse 批处理策略',
  '数据库插入模式'
]
title: '实践经验 - Too Many Parts 问题'
description: 'Too Many Parts 问题的解决方案和防范方法'
---



# 数据分片过多问题 {#the-too-many-parts-problem}

_本指南是社区交流会中总结的系列经验之一。如需了解更多实际解决方案和深入见解,您可以[按具体问题浏览](./community-wisdom.md)。_
_需要更多性能优化建议?请参阅[性能优化](./performance-optimization.md)社区经验指南。_


## 理解问题 {#understanding-the-problem}

ClickHouse 会抛出"Too many parts"错误以防止严重的性能下降。小数据分区会导致多个问题:查询时需要读取和合并更多文件从而降低查询性能,每个分区都需要在内存中保存元数据从而增加内存使用,较小的数据块压缩效果较差从而降低压缩效率,更多的文件句柄和寻址操作导致更高的 I/O 开销,以及后台合并变慢给合并调度器带来更多工作负载。

**相关文档**

- [MergeTree 引擎](/engines/table-engines/mergetree-family/mergetree)
- [数据分区](/parts)
- [Parts 系统表](/operations/system-tables/parts)


## 及早识别问题 {#recognize-parts-problem}

此查询通过分析所有活动表的数据分片数量和大小来监控表碎片化情况。它可以识别出具有过多或过小数据分片的表,这些表可能需要进行合并优化。请定期使用此查询,以便在碎片化问题影响查询性能之前及时发现。

```sql runnable editable
-- 挑战:在生产环境中替换为实际的数据库和表名
-- 实验:根据您的系统调整数据分片数量阈值(1000、500、100)
SELECT
    database,
    table,
    count() as total_parts,
    sum(rows) as total_rows,
    round(avg(rows), 0) as avg_rows_per_part,
    min(rows) as min_rows_per_part,
    max(rows) as max_rows_per_part,
    round(sum(bytes_on_disk) / 1024 / 1024, 2) as total_size_mb,
    CASE
        WHEN count() > 1000 THEN '严重 - 数据分片过多 (>1000)'
        WHEN count() > 500 THEN '警告 - 数据分片较多 (>500)'
        WHEN count() > 100 THEN '注意 - 数据分片数量增多 (>100)'
        ELSE '正常 - 数据分片数量合理'
    END as parts_assessment,
    CASE
        WHEN avg(rows) < 1000 THEN '差 - 数据分片非常小'
        WHEN avg(rows) < 10000 THEN '一般 - 数据分片较小'
        WHEN avg(rows) < 100000 THEN '良好 - 数据分片中等'
        ELSE '优秀 - 数据分片较大'
    END as part_size_assessment
FROM system.parts
WHERE active = 1
  AND database NOT IN ('system', 'information_schema')
GROUP BY database, table
ORDER BY total_parts DESC
LIMIT 20;
```


## 视频资源 {#video-sources}

- [Fast, Concurrent, and Consistent Asynchronous INSERTS in ClickHouse](https://www.youtube.com/watch?v=AsMPEfN5QtM) - ClickHouse 团队成员讲解异步插入和分区过多问题
- [Production ClickHouse at Scale](https://www.youtube.com/watch?v=liTgGiTuhJE) - 来自可观测性平台的实际批处理策略
