---
sidebar_position: 1
slug: /tips-and-tricks/too-many-parts
sidebar_label: 'Too Many Parts 问题'
doc_type: 'guide'
keywords: [
  'clickhouse too many parts',
  'too many parts 错误',
  'clickhouse 批量写入',
  'part 过多问题',
  'clickhouse 合并性能',
  '批量写入优化',
  'clickhouse async inserts',
  '小批量写入问题',
  'clickhouse part 管理',
  '写入性能优化',
  'clickhouse 批量写入策略',
  '数据库写入模式'
]
title: '经验总结 - Too Many Parts 问题'
description: 'Too Many Parts 问题的解决方案与预防'
---

# 部分过多问题 {#the-too-many-parts-problem}
*本指南属于一系列基于社区线下交流与经验分享整理而成的内容。若想获取更多真实场景下的解决方案和见解，可以[按具体问题浏览](./community-wisdom.md)。*
*需要更多性能优化方面的建议？请查看[性能优化](./performance-optimization.md)社区洞见指南。*

## 理解问题 {#understanding-the-problem}

ClickHouse 会抛出 “Too many parts” 错误，以避免出现严重的性能下降。过多的小 part 会引发多种问题：查询期间需要读取和合并更多文件，导致查询性能下降；内存使用增加，因为每个 part 都需要在内存中保存元数据；压缩效率降低，因为更小的数据块压缩效果更差；由于更多的文件句柄和寻道操作而带来更高的 I/O 开销；以及后台合并变慢，使合并调度器的工作量显著增加。

**相关文档**
- [MergeTree Engine](/engines/table-engines/mergetree-family/mergetree)
- [Parts](/parts)
- [Parts System Table](/operations/system-tables/parts)

## 及早识别问题 {#recognize-parts-problem}

此查询通过分析所有活动表的分片数量和大小来监控表碎片情况。它会识别出分片数量过多或过小、可能需要合并优化的表。请定期使用此查询，在碎片问题影响查询性能之前将其发现。

```sql runnable editable
-- 挑战：在生产环境中替换为实际的数据库和表名
-- 实验：根据您的系统调整数据分片数量阈值（1000、500、100）
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
        WHEN count() > 1000 THEN 'CRITICAL - 数据分片过多 (>1000)'
        WHEN count() > 500 THEN 'WARNING - 数据分片较多 (>500)'
        WHEN count() > 100 THEN 'CAUTION - 数据分片数量增多 (>100)'
        ELSE 'OK - 数据分片数量合理'
    END as parts_assessment,
    CASE 
        WHEN avg(rows) < 1000 THEN 'POOR - 数据分片过小'
        WHEN avg(rows) < 10000 THEN 'FAIR - 数据分片较小'
        WHEN avg(rows) < 100000 THEN 'GOOD - 数据分片中等'
        ELSE 'EXCELLENT - 数据分片较大'
    END as part_size_assessment
FROM system.parts
WHERE active = 1
  AND database NOT IN ('system', 'information_schema')
GROUP BY database, table
ORDER BY total_parts DESC
LIMIT 20;
```

## 视频资源 {#video-sources}

- [Fast, Concurrent, and Consistent Asynchronous INSERTS in ClickHouse](https://www.youtube.com/watch?v=AsMPEfN5QtM) - 由 ClickHouse 团队成员讲解异步 INSERT 及 “too many parts” 问题
- [Production ClickHouse at Scale](https://www.youtube.com/watch?v=liTgGiTuhJE) - 来自可观测性平台的真实大规模生产环境批处理策略