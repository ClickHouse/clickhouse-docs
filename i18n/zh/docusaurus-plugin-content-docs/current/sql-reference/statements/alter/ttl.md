---
'description': '与表生存时间 (TTL) 操作的文档'
'sidebar_label': 'TTL'
'sidebar_position': 44
'slug': '/sql-reference/statements/alter/ttl'
'title': '与表生存时间 (TTL) 的操作'
---


# Manipulations with Table TTL

:::note
如果您想了解使用 TTL 管理旧数据的详细信息，请查看 [使用 TTL 管理数据](/guides/developer/ttl.md) 用户指南。以下文档演示了如何更改或删除现有的 TTL 规则。
:::

## MODIFY TTL {#modify-ttl}

您可以通过以下形式的请求更改 [表 TTL](../../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)：

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] MODIFY TTL ttl_expression;
```

## REMOVE TTL {#remove-ttl}

可以通过以下查询从表中删除 TTL 属性：

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] REMOVE TTL
```

**示例**

考虑具有表 `TTL` 的表：

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

运行 `OPTIMIZE` 强制执行 `TTL` 清理：

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

现在使用以下查询删除表 `TTL`：

```sql
ALTER TABLE table_with_ttl REMOVE TTL;
```

重新插入已删除的行，并通过 `OPTIMIZE` 强制执行 `TTL` 清理：

```sql
INSERT INTO table_with_ttl VALUES (now() - INTERVAL 4 MONTH, 2, 'username2');
OPTIMIZE TABLE table_with_ttl FINAL;
SELECT * FROM table_with_ttl FORMAT PrettyCompact;
```

`TTL` 不再存在，因此第二行未被删除：

```text
┌─────────event_time────┬──UserID─┬─────Comment──┐
│   2020-12-11 12:44:57 │       1 │    username1 │
│   2020-08-11 12:44:57 │       2 │    username2 │
└───────────────────────┴─────────┴──────────────┘
```

**另见**

- 了解更多关于 [TTL 表达式](../../../sql-reference/statements/create/table.md#ttl-expression) 的信息。
- 修改列 [使用 TTL](/sql-reference/statements/alter/ttl)。
