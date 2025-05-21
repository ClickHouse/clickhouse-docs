---
description: 'カラムに値を充填する一時ストレージを作成します。'
keywords: ['values', 'table function']
sidebar_label: 'values'
sidebar_position: 210
slug: /sql-reference/table-functions/values
title: 'values'
---


# Values テーブル関数 {#values-table-function}

`Values` テーブル関数を使用すると、カラムに値を充填する一時ストレージを作成できます。これは、迅速なテストやサンプルデータの生成に便利です。

:::note
Values は大文字と小文字を区別しない関数です。つまり、`VALUES` と `values` の両方が有効です。
:::

## 構文 {#syntax}

`VALUES` テーブル関数の基本的な構文は次のとおりです：

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

## 引数 {#arguments}

- `column1_name Type1, ...` (オプション)。 [String](/sql-reference/data-types/string) 
  カラムの名前とタイプを指定します。この引数が省略された場合、カラムは `c1`, `c2` などと名付けられます。
- `(value1_row1, value2_row1)`。 [Tuples](/sql-reference/data-types/tuple) 
   任意のタイプの値を含むタプルです。

:::note
コンマで区切られたタプルは単一の値に置き換えることもできます。この場合、各値は新しい行として扱われます。詳細は [例](#examples) セクションを参照してください。
:::

## 戻り値 {#returned-value}

- 提供された値を含む一時テーブルを返します。

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

`VALUES` はタプルではなく単一の値とともに使用することもできます。例えば：

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

また、行の仕様を提供せずに（`'column1_name Type1, column2_name Type2, ...'`
を [構文](#syntax) で）使用することもでき、その場合、カラムは自動的に名付けられます。

例えば：

```sql title="クエリ"
-- タプルを値として
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

## その他の情報 {#see-also}

- [Values 形式](/interfaces/formats/Values)
