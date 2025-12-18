---
description: '`UNDROP TABLE` 文档'
sidebar_label: 'UNDROP'
slug: /sql-reference/statements/undrop
title: 'UNDROP TABLE'
doc_type: 'reference'
---

# UNDROP TABLE {#undrop-table}

撤销删除表的操作。

从 ClickHouse 版本 23.3 开始，可以在 Atomic 数据库中，在执行 DROP TABLE 语句后的 `database_atomic_delay_before_drop_table_sec`（默认 8 分钟）时间窗口内，对表执行 UNDROP 操作。被删除的表会列在名为 `system.dropped_tables` 的系统表中。

如果存在一个与已删除表关联且没有 `TO` 子句的物化视图，则还需要对该视图的内部表执行 UNDROP 操作。

:::tip
另请参阅 [DROP TABLE](/sql-reference/statements/drop.md)
:::

语法：

```sql
UNDROP TABLE [db.]name [UUID '<uuid>'] [ON CLUSTER cluster]
```

**示例**

```sql
CREATE TABLE tab
(
    `id` UInt8
)
ENGINE = MergeTree
ORDER BY id;

DROP TABLE tab;

SELECT *
FROM system.dropped_tables
FORMAT Vertical;
```

```response
Row 1:
──────
index:                 0
database:              default
table:                 tab
uuid:                  aa696a1a-1d70-4e60-a841-4c80827706cc
engine:                MergeTree
metadata_dropped_path: /var/lib/clickhouse/metadata_dropped/default.tab.aa696a1a-1d70-4e60-a841-4c80827706cc.sql
table_dropped_time:    2023-04-05 14:12:12

1 row in set. Elapsed: 0.001 sec. 
```

```sql
UNDROP TABLE tab;

SELECT *
FROM system.dropped_tables
FORMAT Vertical;

```response
Ok.

0 rows in set. Elapsed: 0.001 sec. 
```

```sql
DESCRIBE TABLE tab
FORMAT Vertical;
```

```response
第 1 行:
──────
名称:               id
类型:               UInt8
默认类型:       
默认表达式: 
注释:            
编解码器表达式:   
TTL 表达式:     
```
