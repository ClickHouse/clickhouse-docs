---
'description': 'LIMIT BY 子句的文档'
'sidebar_label': 'LIMIT BY'
'slug': '/sql-reference/statements/select/limit-by'
'title': 'LIMIT BY 子句'
---


# LIMIT BY 子句

带有 `LIMIT n BY expressions` 子句的查询为每个独特的 `expressions` 值选择前 `n` 行。`LIMIT BY` 的键可以包含任意数量的 [expressions](/sql-reference/syntax#expressions)。

ClickHouse 支持以下语法变体：

- `LIMIT [offset_value, ]n BY expressions`
- `LIMIT n OFFSET offset_value BY expressions`

在查询处理过程中，ClickHouse 按照排序键选择数据。排序键通过 [ORDER BY](/sql-reference/statements/select/order-by) 子句显式设置，或作为表引擎的属性隐式设置（只有在使用 [ORDER BY](/sql-reference/statements/select/order-by) 时才能保证行的顺序，否则由于多线程，行块将不会有序）。然后，ClickHouse 应用 `LIMIT n BY expressions`，并返回每个独特的 `expressions` 组合的前 `n` 行。如果指定了 `OFFSET`，那么对于属于独特 `expressions` 组合的每个数据块，ClickHouse 从块的开头跳过 `offset_value` 行，并返回最多 `n` 行作为结果。如果 `offset_value` 大于数据块中的行数，ClickHouse 将从块中返回零行。

:::note    
`LIMIT BY` 与 [LIMIT](../../../sql-reference/statements/select/limit.md) 无关。它们可以在同一查询中同时使用。
:::

如果您希望在 `LIMIT BY` 子句中使用列编号而不是列名，请启用设置 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments)。    
    

## 示例 {#examples}

示例表：

```sql
CREATE TABLE limit_by(id Int, val Int) ENGINE = Memory;
INSERT INTO limit_by VALUES (1, 10), (1, 11), (1, 12), (2, 20), (2, 21);
```

查询：

```sql
SELECT * FROM limit_by ORDER BY id, val LIMIT 2 BY id
```

```text
┌─id─┬─val─┐
│  1 │  10 │
│  1 │  11 │
│  2 │  20 │
│  2 │  21 │
└────┴─────┘
```

```sql
SELECT * FROM limit_by ORDER BY id, val LIMIT 1, 2 BY id
```

```text
┌─id─┬─val─┐
│  1 │  11 │
│  1 │  12 │
│  2 │  21 │
└────┴─────┘
```

`SELECT * FROM limit_by ORDER BY id, val LIMIT 2 OFFSET 1 BY id` 查询将返回相同的结果。

以下查询返回每对 `domain, device_type` 的前 5 个引荐来源，总计最多 100 行（`LIMIT n BY + LIMIT`）。

```sql
SELECT
    domainWithoutWWW(URL) AS domain,
    domainWithoutWWW(REFERRER_URL) AS referrer,
    device_type,
    count() cnt
FROM hits
GROUP BY domain, referrer, device_type
ORDER BY cnt DESC
LIMIT 5 BY domain, device_type
LIMIT 100
```
