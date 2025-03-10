---
slug: /sql-reference/statements/undrop
sidebar_label: UNDROP
---


# UNDROP 表

取消删除表的操作。

从 ClickHouse 版本 23.3 开始，可以在发出 DROP TABLE 语句后的 `database_atomic_delay_before_drop_table_sec` （默认 8 分钟）内对原子数据库中的表进行 UNDROP。已删除的表会列在一个系统表 `system.dropped_tables` 中。

如果您有一个与已删除表关联的没有 `TO` 子句的物化视图，那么您还需要对该视图的内部表进行 UNDROP。

:::tip
另见 [DROP TABLE](/sql-reference/statements/drop.md)
:::

语法：

``` sql
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
行 1:
──────
index:                 0
database:              default
table:                 tab
uuid:                  aa696a1a-1d70-4e60-a841-4c80827706cc
engine:                MergeTree
metadata_dropped_path: /var/lib/clickhouse/metadata_dropped/default.tab.aa696a1a-1d70-4e60-a841-4c80827706cc.sql
table_dropped_time:    2023-04-05 14:12:12

1 行在集合中。已耗时: 0.001 秒。 
```

```sql
UNDROP TABLE tab;

SELECT *
FROM system.dropped_tables
FORMAT Vertical;

```response
好的。

0 行在集合中。已耗时: 0.001 秒。 
```

```sql
DESCRIBE TABLE tab
FORMAT Vertical;
```

```response
行 1:
──────
name:               id
type:               UInt8
default_type:       
default_expression: 
comment:            
codec_expression:   
ttl_expression:     
```
