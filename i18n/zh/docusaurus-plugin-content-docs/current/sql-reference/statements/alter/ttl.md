
# 表 TTL 操作

:::note
如果您想了解有关使用 TTL 管理旧数据的详细信息，请查看 [使用 TTL 管理数据](/guides/developer/ttl.md) 用户指南。下面的文档演示了如何更改或删除现有的 TTL 规则。
:::

## 修改 TTL {#modify-ttl}

您可以使用以下格式的请求来更改 [表 TTL](../../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)：

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] MODIFY TTL ttl_expression;
```

## 删除 TTL {#remove-ttl}

可以使用以下查询从表中删除 TTL 属性：

```sql
ALTER TABLE [db.]table_name [ON CLUSTER cluster] REMOVE TTL
```

**示例**

考虑带有表 `TTL` 的表：

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

运行 `OPTIMIZE` 来强制执行 `TTL` 清理：

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

重新插入被删除的行，并再次使用 `OPTIMIZE` 强制执行 `TTL` 清理：

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

**另请参见**

- 关于 [TTL 表达式](../../../sql-reference/statements/create/table.md#ttl-expression) 的更多信息。
- 修改列 [带有 TTL](/sql-reference/statements/alter/ttl)。
