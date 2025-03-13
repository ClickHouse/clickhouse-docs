---
slug: /sql-reference/statements/alter/comment
sidebar_position: 51
sidebar_label: COMMENT
---


# ALTER TABLE ... MODIFY COMMENT

添加、修改或删除表的注释，无论之前是否已设置。注释的更改将在 [system.tables](../../../operations/system-tables/tables.md) 和 `SHOW CREATE TABLE` 查询中反映出来。

**语法**

``` sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```

**示例**

创建带注释的表（有关更多信息，请参见 [COMMENT](/sql-reference/statements/create/table#comment-clause) 子句）：

``` sql
CREATE TABLE table_with_comment
(
    `k` UInt64,
    `s` String
)
ENGINE = Memory()
COMMENT '临时表';
```

修改表注释：

``` sql
ALTER TABLE table_with_comment MODIFY COMMENT '新表注释';
SELECT comment FROM system.tables WHERE database = currentDatabase() AND name = 'table_with_comment';
```

新注释的输出：

```text
┌─comment────────────────┐
│ 新表注释              │
└────────────────────────┘
```

删除表注释：

``` sql
ALTER TABLE table_with_comment MODIFY COMMENT '';
SELECT comment FROM system.tables WHERE database = currentDatabase() AND name = 'table_with_comment';
```

删除注释的输出：

```text
┌─comment─┐
│         │
└─────────┘
```

**注意事项**

对于复制表，不同副本上的注释可能不同。修改注释仅适用于单个副本。

该功能自版本 23.9 起可用。在之前的 ClickHouse 版本中无法使用。
