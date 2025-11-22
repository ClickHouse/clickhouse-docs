---
description: 'LIMIT BY 子句文档'
sidebar_label: 'LIMIT BY'
slug: /sql-reference/statements/select/limit-by
title: 'LIMIT BY 子句'
doc_type: 'reference'
---



# LIMIT BY 子句

带有 `LIMIT n BY expressions` 子句的查询，会为 `expressions` 的每个不同取值选取前 `n` 行。`LIMIT BY` 的键可以包含任意数量的[表达式](/sql-reference/syntax#expressions)。

ClickHouse 支持以下语法变体：

- `LIMIT [offset_value, ]n BY expressions`
- `LIMIT n OFFSET offset_value BY expressions`

在查询处理过程中，ClickHouse 会根据排序键对数据进行排序。排序键可以通过 [ORDER BY](/sql-reference/statements/select/order-by) 子句显式设置，也可以作为表引擎的属性隐式设置（只有使用 [ORDER BY](/sql-reference/statements/select/order-by) 时才保证行顺序，否则由于多线程，行块不会被排序）。然后 ClickHouse 应用 `LIMIT n BY expressions`，并为 `expressions` 的每个不同组合返回前 `n` 行。如果指定了 `OFFSET`，则对于属于某个 `expressions` 唯一组合的每个数据块，ClickHouse 会从该块开头跳过 `offset_value` 行，并最多返回 `n` 行作为结果。如果 `offset_value` 大于数据块中的行数，ClickHouse 会从该块返回 0 行。

:::note    
`LIMIT BY` 与 [LIMIT](../../../sql-reference/statements/select/limit.md) 无关。它们可以同时在同一个查询中使用。
:::

如果希望在 `LIMIT BY` 子句中使用列序号而不是列名，请启用设置 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments)。    



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

`SELECT * FROM limit_by ORDER BY id, val LIMIT 2 OFFSET 1 BY id` 查询返回相同的结果。

以下查询返回每个 `domain, device_type` 组合的前 5 个引荐来源，总行数最多为 100 行（`LIMIT n BY + LIMIT`）。

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


## LIMIT BY ALL {#limit-by-all}

`LIMIT BY ALL` 等同于列出所有非聚合函数的 SELECT 表达式。

例如:

```sql
SELECT col1, col2, col3 FROM table LIMIT 2 BY ALL
```

等同于

```sql
SELECT col1, col2, col3 FROM table LIMIT 2 BY col1, col2, col3
```

对于特殊情况,如果某个函数的参数中同时包含聚合函数和其他字段,则 `LIMIT BY` 键将包含从中提取的所有非聚合字段。

例如:

```sql
SELECT substring(a, 4, 2), substring(substring(a, 1, 2), 1, count(b)) FROM t LIMIT 2 BY ALL
```

等同于

```sql
SELECT substring(a, 4, 2), substring(substring(a, 1, 2), 1, count(b)) FROM t LIMIT 2 BY substring(a, 4, 2), substring(a, 1, 2)
```


## 示例 {#examples-limit-by-all}

示例表:

```sql
CREATE TABLE limit_by(id Int, val Int) ENGINE = Memory;
INSERT INTO limit_by VALUES (1, 10), (1, 11), (1, 12), (2, 20), (2, 21);
```

查询:

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

查询 `SELECT * FROM limit_by ORDER BY id, val LIMIT 2 OFFSET 1 BY id` 返回相同的结果。

使用 `LIMIT BY ALL`:

```sql
SELECT id, val FROM limit_by ORDER BY id, val LIMIT 2 BY ALL
```

这等价于:

```sql
SELECT id, val FROM limit_by ORDER BY id, val LIMIT 2 BY id, val
```

以下查询返回每个 `domain, device_type` 组合的前 5 个引荐来源,总行数最多为 100 行(`LIMIT n BY + LIMIT`)。

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
