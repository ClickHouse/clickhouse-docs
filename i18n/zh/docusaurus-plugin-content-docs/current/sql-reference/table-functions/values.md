---
slug: /sql-reference/table-functions/values
sidebar_position: 210
sidebar_label: values
title: 'values'
description: '创建一个临时存储，用于填充列的值。'
keywords: ['values', 'table function']
---


# Values 表函数 {#values-table-function}

`Values` 表函数允许您创建临时存储，用于填充列的值。它对于快速测试或生成示例数据非常有用。

:::note
Values 是一个不区分大小写的函数，即 `VALUES` 和 `values` 都是有效的。
:::

## 语法 {#syntax}

`VALUES` 表函数的基本语法为：

```sql
VALUES([structure,] values...)
```

它通常被使用为：

```sql
VALUES(
    ['column1_name Type1, column2_name Type2, ...'],
    (value1_row1, value2_row1, ...),
    (value1_row2, value2_row2, ...),
    ...
)
```

## 参数 {#arguments}

- `column1_name Type1, ...` （可选）。[String](/sql-reference/data-types/string) 
  指定列的名称和类型。如果省略此参数，列将命名为 `c1`，`c2` 等。
- `(value1_row1, value2_row1)`。[Tuples](/sql-reference/data-types/tuple) 
  包含任何类型的值。

:::note
用逗号分隔的元组也可以被单个值替换。在这种情况下，每个值被视为新的一行。详情请参见 [示例](#examples) 部分。
:::

## 返回值 {#returned-value}

- 返回一个包含提供值的临时表。

## 示例 {#examples}

```sql title="查询"
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

```response title="响应"
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

`VALUES` 也可以与单个值一起使用，而不是元组。例如：

```sql title="查询"
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

```response title="响应"
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

或者在没有提供行规格的情况下 (`'column1_name Type1, column2_name Type2, ...'`
在[语法](#syntax)中)，在这种情况下，列会被自动命名。

例如：

```sql title="查询"
-- 元组作为值
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

-- 单个值
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

```response title="响应"
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

## 另请参见 {#see-also}

- [Values 格式](/interfaces/formats/Values)
