---
slug: /sql-reference/table-functions/values
sidebar_position: 210
sidebar_label: values
title: 'values'
description: 'カラムに値を埋める一時ストレージを作成します。'
keywords: ['values', 'table function']
---


# Values テーブル関数 {#values-table-function}

`Values` テーブル関数は、カラムに値を埋める一時ストレージを作成することを可能にします。これは、短時間のテストやサンプルデータの生成に便利です。

:::note
Values は大文字と小文字を区別しない関数です。つまり、`VALUES` または `values` はどちらも有効です。
:::

## 構文 {#syntax}

`VALUES` テーブル関数の基本的な構文は次の通りです：

```sql
VALUES([構造,] values...)
```

一般的には次のように使用されます：

```sql
VALUES(
    ['カラム1の名前 タイプ1, カラム2の名前 タイプ2, ...'],
    (value1_row1, value2_row1, ...),
    (value1_row2, value2_row2, ...),
    ...
)
```

## 引数 {#arguments}

- `カラム1の名前 タイプ1, ...` (オプション)。 [String](/sql-reference/data-types/string) 
  カラム名とタイプを指定します。この引数を省略すると、カラムは `c1`, `c2` などと名前付けされます。
- `(value1_row1, value2_row1)`。 [Tuples](/sql-reference/data-types/tuple) 
   任意のタイプの値を含むタプル。

:::note
カンマで区切られたタプルは、単一の値に置き換えることもできます。この場合、各値は新しい行と見なされます。詳細については、[例](#examples) セクションを参照してください。
:::

## 戻り値 {#returned-value}

- 提供された値を含む一時テーブルを返します。

## 例 {#examples}

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

`VALUES` はタプルの代わりに単一の値でも使用できます。例えば：

```sql title="Query"
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

または、行の仕様を提供せずに使用することもできます（`'カラム1の名前 タイプ1, カラム2の名前 タイプ2, ...'`は[構文](#syntax)において）が、この場合、カラムは自動的に名前付けされます。

例えば：

```sql title="Query"
-- 値のタプル
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

-- 単一の値
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

## 関連項目 {#see-also}

- [Values フォーマット](/interfaces/formats/Values)
