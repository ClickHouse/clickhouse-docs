---
description: '创建一个临时存储，用于为列填充值。'
keywords: ['values', '表函数']
sidebar_label: 'values'
sidebar_position: 210
slug: /sql-reference/table-functions/values
title: 'values'
doc_type: 'reference'
---

# Values 表函数 {#values-table-function}

`Values` 表函数允许你创建一个临时存储，用于为列填充值。它对于快速测试或生成示例数据非常有用。

:::note
Values 是不区分大小写的函数。也就是说，`VALUES` 或 `values` 都是有效的写法。
:::

## 语法 {#syntax}

`VALUES` 表函数的基本语法如下：

```sql
VALUES([结构,] 值...)
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

## 参数 {#arguments}

- `column1_name Type1, ...`（可选）。[String](/sql-reference/data-types/string) 
  用于指定列名和类型。如果省略该参数，列名将依次为 `c1`、`c2` 等。
- `(value1_row1, value2_row1)`。[Tuples](/sql-reference/data-types/tuple) 
   包含任意类型的值。

:::note
以逗号分隔的元组也可以用单个值代替。在这种情况下，每个值都被视为一行新数据。详情参见[示例](#examples)部分。
:::

## 返回值 {#returned-value}

- 返回一个包含传入值的临时表。

## 示例 {#examples}

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
 1. │ Noah     │ 巴黎      │
 2. │ Emma     │ 东京      │
 3. │ Liam     │ 悉尼      │
 4. │ Olivia   │ 柏林      │
 5. │ Ilya     │ 伦敦      │
 6. │ Sophia   │ 伦敦      │
 7. │ Jackson  │ 马德里    │
 8. │ Alexey   │ 阿姆斯特丹│
 9. │ Mason    │ 威尼斯    │
10. │ Isabella │ 布拉格    │
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

或者不提供行规范（在[语法](#syntax)中为 `'column1_name Type1, column2_name Type2, ...'`），此时系统会自动为列命名。

例如：

```sql title="Query"
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
-- 单值
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

## 另请参阅 {#see-also}

- [Values 格式](/interfaces/formats/Values)
