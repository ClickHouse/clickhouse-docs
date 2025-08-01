---
description: '列に値を入れて一時的なストレージを作成します。'
keywords:
- 'values'
- 'table function'
sidebar_label: '値'
sidebar_position: 210
slug: '/sql-reference/table-functions/values'
title: 'values'
---




# Values Table Function {#values-table-function}

`Values` テーブル関数を使用すると、値でカラムを埋める一時ストレージを作成できます。これは、迅速なテストやサンプルデータの生成に役立ちます。

:::note
Values は大文字と小文字を区別しない関数です。つまり、`VALUES` または `values` の両方が有効です。
:::

## Syntax {#syntax}

`VALUES` テーブル関数の基本構文は次のとおりです：

```sql
VALUES([structure,] values...)
```

一般的に次のように使用されます：

```sql
VALUES(
    ['column1_name Type1, column2_name Type2, ...'],
    (value1_row1, value2_row1, ...),
    (value1_row2, value2_row2, ...),
    ...
)
```

## Arguments {#arguments}

- `column1_name Type1, ...`（オプション）。 [String](/sql-reference/data-types/string) 
  カラム名とタイプを指定します。この引数が省略されると、カラムは `c1`、`c2` などと名付けられます。
- `(value1_row1, value2_row1)`。 [Tuples](/sql-reference/data-types/tuple) 
   任意の型の値を含むタプル。

:::note
カンマ区切りのタプルは単一の値に置き換えることもできます。この場合、各値は新しい行と見なされます。詳細については [examples](#examples) セクションを参照してください。
:::

## Returned value {#returned-value}

- 提供された値を含む一時テーブルを返します。

## Examples {#examples}

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

`VALUES` はタプルではなく単一の値でも使用できます。例えば：

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

また、行の仕様を提供せずに（[syntax](#syntax) の `'column1_name Type1, column2_name Type2, ...'`）、その場合はカラムが自動的に名前付けされます。

例えば：

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

## See also {#see-also}

- [Values format](/interfaces/formats/Values)
