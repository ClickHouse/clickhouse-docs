---
description: '表 TTL 操作相关文档'
sidebar_label: 'TTL'
sidebar_position: 44
slug: /sql-reference/statements/alter/ttl
title: '表 TTL 操作'
doc_type: 'reference'
---



# 表 TTL 操作

:::note
如果你在查找如何使用 TTL 管理历史数据的详细信息，请参阅[使用 TTL 管理数据](/guides/developer/ttl.md)用户指南。以下文档演示如何修改或移除现有的 TTL 规则。
:::



## 修改 TTL {#modify-ttl}

可以通过以下形式的请求来修改[表 TTL](../../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl):

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] MODIFY TTL ttl_expression;
```


## REMOVE TTL {#remove-ttl}

可以使用以下查询从表中移除 TTL 属性:

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] REMOVE TTL
```

**示例**

考虑以下带有表级 `TTL` 的表:

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

INSERT INTO table_with_ttl VALUES (now(), 1, 'username1');

INSERT INTO table_with_ttl VALUES (now() - INTERVAL 4 MONTH, 2, 'username2');
```

运行 `OPTIMIZE` 强制执行 `TTL` 清理:

```sql
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```

第二行已从表中删除。

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
└───────────────────────┴─────────┴──────────────┘
```

现在使用以下查询移除表级 `TTL`:

```sql
ALTER TABLE table_with_ttl REMOVE TTL;
```

重新插入已删除的行,并使用 `OPTIMIZE` 再次强制执行 `TTL` 清理:

```sql
INSERT INTO table_with_ttl VALUES (now() - INTERVAL 4 MONTH, 2, 'username2');
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```

`TTL` 已不再存在,因此第二行未被删除:

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
│   2020-08-11 12:44:57 │       2 │    username2 │
└───────────────────────┴─────────┴──────────────┘
```

**另请参阅**

- 有关 [TTL 表达式](../../../sql-reference/statements/create/table.md#ttl-expression) 的更多信息。
- 修改[带有 TTL 的列](/sql-reference/statements/alter/ttl)。
