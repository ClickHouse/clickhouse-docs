---
description: '表 TTL 操作相关文档'
sidebar_label: 'TTL'
sidebar_position: 44
slug: /sql-reference/statements/alter/ttl
title: '表 TTL 操作'
doc_type: 'reference'
---

# 表 TTL 操作 {#manipulations-with-table-ttl}

:::note
如果你想了解如何使用 TTL 管理历史数据的更多信息，请参阅用户指南：[使用 TTL 管理数据](/guides/developer/ttl.md)。下文演示了如何修改或删除现有的 TTL 规则。
:::

## 修改 TTL {#modify-ttl}

你可以使用如下形式的请求来修改[表 TTL](../../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)：

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] MODIFY TTL ttl_expression;
```

## 移除 TTL {#remove-ttl}

可以使用以下查询移除表上的 TTL 属性：

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] REMOVE TTL
```

**示例**

考虑以下带有表级 `TTL` 的表：

```sql
CREATE TABLE table_with_ttl
(
    event_time DateTime,
    UserID UInt64,
    Comment String
)
ENGINE MergeTree()
ORDER BY tuple()
TTL event_time + INTERVAL 3 MONTH
SETTINGS min_bytes_for_wide_part = 0;

INSERT INTO table_with_ttl VALUES (now(), 1, '用户名1');

INSERT INTO table_with_ttl VALUES (now() - INTERVAL 4 MONTH, 2, '用户名2');
```

运行 `OPTIMIZE` 以强制触发 `TTL` 清理：

```sql
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```

表中的第二行已被删除。

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
└───────────────────────┴─────────┴──────────────┘
```

现在使用以下查询删除表的 `TTL`：

```sql
ALTER TABLE table_with_ttl REMOVE TTL;
```

重新插入已删除的行，并使用 `OPTIMIZE` 再次强制触发 `TTL` 清理：

```sql
INSERT INTO table_with_ttl VALUES (now() - INTERVAL 4 MONTH, 2, 'username2');
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```

`TTL` 已移除，因此第二行不会被删除：

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
│   2020-08-11 12:44:57 │       2 │    username2 │
└───────────────────────┴─────────┴──────────────┘
```

**另请参阅**

* 关于 [TTL 表达式](../../../sql-reference/statements/create/table.md#ttl-expression) 的更多信息。
* [使用 TTL 修改列](/sql-reference/statements/alter/ttl)。
