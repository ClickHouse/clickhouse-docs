---
description: '创建一个临时存储，用于为列填充值。'
keywords: ['values', '表函数']
sidebar_label: 'values'
sidebar_position: 210
slug: /sql-reference/table-functions/values
title: 'values'
doc_type: 'reference'
---

# Values 表函数 \{#values-table-function\}

`Values` 表函数允许你创建一个临时存储，用于为列填充值。它对于快速测试或生成示例数据非常有用。

:::note
Values 是不区分大小写的函数。也就是说，`VALUES` 或 `values` 都是有效的写法。
:::

## 语法 \{#syntax\}

`VALUES` 表函数的基本语法如下：

```sql
VALUES([structure,] values...)
```

通常用作：

```sql
VALUES(
    ['column1_name Type1, column2_name Type2, ...'],
    (value1_row1, value2_row1, ...),
    (value1_row2, value2_row2, ...),
    ...
)
```

## 参数 \{#arguments\}

* `column1_name Type1, ...` (可选) 。[String](/sql-reference/data-types/string)
  用于指定列名和类型。如果省略该参数，列名将依次为 `c1`、`c2` 等。
* `(value1_row1, value2_row1)`。[Tuples](/sql-reference/data-types/tuple)
  包含任意类型的值。

:::note
以逗号分隔的元组也可以用单个值代替。在这种情况下，每个值都被视为一行新数据。详情参见[示例](#examples)部分。
:::

## 返回值 \{#returned-value\}

* 返回一个包含传入值的临时表。

## 示例 \{#examples\}

```sql title="Query"
SELECT *
FROM VALUES(
    'person String, place String',
    ('Noah', 'Paris'),
    ('Emma', 'Tokyo'),
    ('Liam', 'Sydney'),
    ('Olivia', 'Berlin'),
    ('Ilya', 'London'),
    ('Sophia', 'London'),
    ('Jackson', 'Madrid'),
    ('Alexey', 'Amsterdam'),
    ('Mason', 'Venice'),
    ('Isabella', 'Prague')
)
```

```response title="Response"
    ┌─person───┬─place─────┐
 1. │ Noah     │ Paris     │
 2. │ Emma     │ Tokyo     │
 3. │ Liam     │ Sydney    │
 4. │ Olivia   │ Berlin    │
 5. │ Ilya     │ London    │
 6. │ Sophia   │ London    │
 7. │ Jackson  │ Madrid    │
 8. │ Alexey   │ Amsterdam │
 9. │ Mason    │ Venice    │
10. │ Isabella │ Prague    │
    └──────────┴───────────┘
```

`VALUES` 也可以用于单个值，而不仅限于元组。例如：

```sql title="Query"
SELECT *
FROM VALUES(
    'person String',
    'Noah',
    'Emma',
    'Liam',
    'Olivia',
    'Ilya',
    'Sophia',
    'Jackson',
    'Alexey',
    'Mason',
    'Isabella'
)
```

```response title="Response"
    ┌─person───┐
 1. │ Noah     │
 2. │ Emma     │
 3. │ Liam     │
 4. │ Olivia   │
 5. │ Ilya     │
 6. │ Sophia   │
 7. │ Jackson  │
 8. │ Alexey   │
 9. │ Mason    │
10. │ Isabella │
    └──────────┘
```

或者不提供行规范 (在[语法](#syntax)中为 `'column1_name Type1, column2_name Type2, ...'`) ，此时系统会自动为列命名。

例如：

```sql title="Query"
-- tuples as values
SELECT *
FROM VALUES(
    ('Noah', 'Paris'),
    ('Emma', 'Tokyo'),
    ('Liam', 'Sydney'),
    ('Olivia', 'Berlin'),
    ('Ilya', 'London'),
    ('Sophia', 'London'),
    ('Jackson', 'Madrid'),
    ('Alexey', 'Amsterdam'),
    ('Mason', 'Venice'),
    ('Isabella', 'Prague')
)
```

```response title="Response"
    ┌─c1───────┬─c2────────┐
 1. │ Noah     │ Paris     │
 2. │ Emma     │ Tokyo     │
 3. │ Liam     │ Sydney    │
 4. │ Olivia   │ Berlin    │
 5. │ Ilya     │ London    │
 6. │ Sophia   │ London    │
 7. │ Jackson  │ Madrid    │
 8. │ Alexey   │ Amsterdam │
 9. │ Mason    │ Venice    │
10. │ Isabella │ Prague    │
    └──────────┴───────────┘
```

```sql
-- single values
SELECT *
FROM VALUES(
    'Noah',
    'Emma',
    'Liam',
    'Olivia',
    'Ilya',
    'Sophia',
    'Jackson',
    'Alexey',
    'Mason',
    'Isabella'
)
```

```response title="Response"
    ┌─c1───────┐
 1. │ Noah     │
 2. │ Emma     │
 3. │ Liam     │
 4. │ Olivia   │
 5. │ Ilya     │
 6. │ Sophia   │
 7. │ Jackson  │
 8. │ Alexey   │
 9. │ Mason    │
10. │ Isabella │
    └──────────┘
```

## SQL 标准 `VALUES` 子句 \{#sql-standard-values-clause\}

ClickHouse 也支持 SQL 标准中的 `VALUES` 子句，可在 `FROM` 中作为表表达式使用，
其用法与 PostgreSQL、MySQL、DuckDB 和 SQL Server 相同。该语法
在内部会被重写为使用上述 `values` 表函数。

:::note
此功能仍处于实验阶段。要启用，请设置 `allow_experimental_sql_standard_values_clause = 1`。
:::

```sql title="Query"
SET allow_experimental_sql_standard_values_clause = 1;
SELECT * FROM (VALUES (1, 'a'), (2, 'b'), (3, 'c')) AS t(id, val);
```

```response title="Response"
┌─id─┬─val─┐
│  1 │ a   │
│  2 │ b   │
│  3 │ c   │
└────┴─────┘
```

它可在 CTE 中使用：

```sql title="Query"
WITH cte AS (SELECT * FROM (VALUES (1, 'one'), (2, 'two')) AS t(id, name))
SELECT * FROM cte;
```

以及在 JOIN 操作中：

```sql title="Query"
SELECT t1.id, t1.val, t2.val2
FROM (VALUES (1, 'a'), (2, 'b')) AS t1(id, val)
JOIN (VALUES (1, 'x'), (2, 'y')) AS t2(id, val2) ON t1.id = t2.id;
```

:::note
`AS t(col1, col2, ...)` 后面的列别名遵循标准 SQL 语法，用于
为派生表中的列命名。若省略，则列名默认为 `c1`、`c2` 等。
:::

## 另请参阅 \{#see-also\}

* [Values 格式](/interfaces/formats/Values)