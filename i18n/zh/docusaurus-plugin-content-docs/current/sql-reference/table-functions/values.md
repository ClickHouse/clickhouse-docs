---
'description': '创建一个临时存储，用值填充列。'
'keywords':
- 'values'
- 'table function'
'sidebar_label': '值'
'sidebar_position': 210
'slug': '/sql-reference/table-functions/values'
'title': 'values'
---




# Values 表函数 {#values-table-function}

`Values` 表函数允许你创建临时存储，用于填充列的值。它对于快速测试或生成示例数据非常有用。

:::note
Values 是一个不区分大小写的函数。即 `VALUES` 或 `values` 都有效。
:::

## 语法 {#syntax}

`VALUES` 表函数的基本语法是：

```sql
VALUES([structure,] values...)
```

它通常用作：

```sql
VALUES(
    ['column1_name Type1, column2_name Type2, ...'],
    (value1_row1, value2_row1, ...),
    (value1_row2, value2_row2, ...),
    ...
)
```

## 参数 {#arguments}

- `column1_name Type1, ...`（可选）。 [String](/sql-reference/data-types/string) 
  指定列的名称和类型。如果省略此参数，列将命名为 `c1`、`c2` 等。
- `(value1_row1, value2_row1)`。 [Tuples](/sql-reference/data-types/tuple) 
  包含任意类型的值。

:::note
用逗号分隔的元组也可以用单个值替代。在这种情况下，每个值将被视为新的一行。有关详细信息，请参见 [示例](#examples) 部分。
:::

## 返回值 {#returned-value}

- 返回一个包含提供值的临时表。

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

或者在不提供行规范（在 [语法](#syntax) 中的 `'column1_name Type1, column2_name Type2, ...'`）的情况下，此时列名将自动生成。

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

## 另见 {#see-also}

- [Values 格式](/interfaces/formats/Values)
