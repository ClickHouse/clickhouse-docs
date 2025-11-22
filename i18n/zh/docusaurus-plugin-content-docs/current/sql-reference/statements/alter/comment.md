---
description: '`ALTER TABLE ... MODIFY COMMENT` 的文档，介绍如何添加、修改或删除表注释'
sidebar_label: 'ALTER TABLE ... MODIFY COMMENT'
sidebar_position: 51
slug: /sql-reference/statements/alter/comment
title: 'ALTER TABLE ... MODIFY COMMENT'
keywords: ['ALTER TABLE', 'MODIFY COMMENT']
doc_type: 'reference'
---



# ALTER TABLE ... MODIFY COMMENT

添加、修改或删除表注释，无论之前是否设置过注释。注释的更改会同时反映在 [`system.tables`](../../../operations/system-tables/tables.md) 中和 `SHOW CREATE TABLE` 查询的结果中。



## 语法 {#syntax}

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY COMMENT 'Comment'
```


## 示例 {#examples}

创建带有注释的表：

```sql
CREATE TABLE table_with_comment
(
    `k` UInt64,
    `s` String
)
ENGINE = Memory()
COMMENT '临时表';
```

修改表注释：

```sql
ALTER TABLE table_with_comment
MODIFY COMMENT '表的新注释';
```

查看修改后的注释：

```sql title="查询"
SELECT comment
FROM system.tables
WHERE database = currentDatabase() AND name = 'table_with_comment';
```

```text title="响应"
┌─comment────────────────┐
│ 表的新注释              │
└────────────────────────┘
```

删除表注释：

```sql
ALTER TABLE table_with_comment MODIFY COMMENT '';
```

验证注释已被删除：

```sql title="查询"
SELECT comment
FROM system.tables
WHERE database = currentDatabase() AND name = 'table_with_comment';
```

```text title="响应"
┌─comment─┐
│         │
└─────────┘
```


## 注意事项 {#caveats}

对于 Replicated 表,不同副本上的注释可能不同。
修改注释仅应用于单个副本。

此功能从 23.9 版本开始提供。在之前的 ClickHouse 版本中不可用。


## 相关内容 {#related-content}

- [`COMMENT`](/sql-reference/statements/create/table#comment-clause) 子句
- [`ALTER DATABASE ... MODIFY COMMENT`](./database-comment.md)
