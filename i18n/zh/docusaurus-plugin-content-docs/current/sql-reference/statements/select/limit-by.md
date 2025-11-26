---
description: 'LIMIT BY 子句的文档'
sidebar_label: 'LIMIT BY'
slug: /sql-reference/statements/select/limit-by
title: 'LIMIT BY 子句'
doc_type: 'reference'
---



# LIMIT BY 子句

带有 `LIMIT n BY expressions` 子句的查询，会为 `expressions` 每个不同的取值选出前 `n` 行。`LIMIT BY` 的键可以包含任意数量的[表达式](/sql-reference/syntax#expressions)。

ClickHouse 支持以下语法形式：

- `LIMIT [offset_value, ]n BY expressions`
- `LIMIT n OFFSET offset_value BY expressions`

在查询处理过程中，ClickHouse 会选取按排序键排序的数据。排序键可以通过 [ORDER BY](/sql-reference/statements/select/order-by) 子句显式设置，或者作为表引擎的属性隐式设置（只有在使用 [ORDER BY](/sql-reference/statements/select/order-by) 时才保证行顺序，否则由于多线程，数据块之间的行顺序不被保证）。然后 ClickHouse 应用 `LIMIT n BY expressions`，并为每个不同的 `expressions` 组合返回前 `n` 行。如果指定了 `OFFSET`，则对于属于每个不同 `expressions` 组合的每个数据块，ClickHouse 从块的开头跳过 `offset_value` 行，并最多返回 `n` 行作为结果。如果 `offset_value` 大于数据块中的行数，ClickHouse 将从该块返回 0 行。

:::note    
`LIMIT BY` 与 [LIMIT](../../../sql-reference/statements/select/limit.md) 无关。它们可以在同一条查询中同时使用。
:::

如果希望在 `LIMIT BY` 子句中使用列序号而不是列名，请启用设置 [enable_positional_arguments](/operations/settings/settings#enable_positional_arguments)。    



## 示例

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

`SELECT * FROM limit_by ORDER BY id, val LIMIT 2 OFFSET 1 BY id` 查询返回相同结果。

下面的查询会返回每个 `domain, device_type` 组合的前 5 个引荐来源（referrer），并且总行数最多为 100 行（`LIMIT n BY + LIMIT`）。

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


## LIMIT BY ALL

`LIMIT BY ALL` 等价于列出 SELECT 中所有不是聚合函数的表达式。

例如：

```sql
SELECT col1, col2, col3 FROM table LIMIT 2 BY ALL
```

与……相同

```sql
SELECT col1, col2, col3 FROM table LIMIT 2 BY col1, col2, col3
```

对于一种特殊情况，如果存在一个函数，其参数同时包含聚合函数和其他字段，则 `LIMIT BY` 键会包含我们能够从中提取的尽可能多的非聚合字段。

例如：

```sql
SELECT substring(a, 4, 2), substring(substring(a, 1, 2), 1, count(b)) FROM t LIMIT 2 BY ALL
```

与……相同

```sql
SELECT substring(a, 4, 2), substring(substring(a, 1, 2), 1, count(b)) FROM t LIMIT 2 BY substring(a, 4, 2), substring(a, 1, 2)
```


## 示例

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

`SELECT * FROM limit_by ORDER BY id, val LIMIT 2 OFFSET 1 BY id` 查询会返回相同的结果。

使用 `LIMIT BY ALL`：

```sql
SELECT id, val FROM limit_by ORDER BY id, val LIMIT 2 BY ALL
```

这等同于：

```sql
SELECT id, val FROM limit_by ORDER BY id, val LIMIT 2 BY id, val
```

下面的查询会返回每个 `domain, device_type` 组合的前 5 个引荐来源，总计最多返回 100 行（通过 `LIMIT n BY + LIMIT` 实现）。

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
