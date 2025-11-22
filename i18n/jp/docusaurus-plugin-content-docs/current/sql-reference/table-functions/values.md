---
description: '列を値で埋めるための一時ストレージを作成します。'
keywords: ['values', 'table function']
sidebar_label: 'values'
sidebar_position: 210
slug: /sql-reference/table-functions/values
title: 'values'
doc_type: 'reference'
---



# Values テーブル関数 {#values-table-function}

`Values` テーブル関数は、値を列に格納する一時的なストレージを作成します。クイックテストやサンプルデータの生成に便利です。

:::note
Values は大文字小文字を区別しない関数です。すなわち、`VALUES` と `values` のどちらも有効です。
:::


## 構文 {#syntax}

`VALUES`テーブル関数の基本構文は以下の通りです:

```sql
VALUES([structure,] values...)
```

一般的には以下のように使用されます:

```sql
VALUES(
    ['column1_name Type1, column2_name Type2, ...'],
    (value1_row1, value2_row1, ...),
    (value1_row2, value2_row2, ...),
    ...
)
```


## 引数 {#arguments}

- `column1_name Type1, ...` (オプション)。カラム名と型を指定する[String](/sql-reference/data-types/string)。この引数を省略した場合、カラムは`c1`、`c2`などと命名されます。
- `(value1_row1, value2_row1)`。任意の型の値を含む[Tuples](/sql-reference/data-types/tuple)。

:::note
カンマ区切りのタプルは単一の値に置き換えることもできます。この場合、各値は新しい行として扱われます。詳細については[examples](#examples)セクションを参照してください。
:::


## 戻り値 {#returned-value}

- 指定された値を含む一時テーブルを返します。


## 例 {#examples}

```sql title="クエリ"
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

```response title="レスポンス"
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

`VALUES`はタプルではなく単一の値でも使用できます。例:

```sql title="クエリ"
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

```response title="レスポンス"
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

または、行の仕様([構文](#syntax)における`'column1_name Type1, column2_name Type2, ...'`)を指定せずに使用することもでき、その場合は列名が自動的に付けられます。

例:

```sql title="クエリ"
-- 値としてのタプル
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

```response title="レスポンス"
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
-- 単一の値
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

```response title="レスポンス"
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


## 関連項目 {#see-also}

- [Values形式](/interfaces/formats/Values)
