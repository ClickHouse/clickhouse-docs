---
description: 'カラムを値で埋めるための一時ストレージを作成します。'
keywords: ['値', 'テーブル関数']
sidebar_label: 'values'
sidebar_position: 210
slug: /sql-reference/table-functions/values
title: 'values'
doc_type: 'reference'
---

# Values テーブル関数 \{#values-table-function\}

`Values` テーブル関数を使用すると、一時的なストレージを作成し、そのカラムを値で埋めることができます。簡単なテストやサンプルデータの生成に便利です。

:::note
Values は大文字小文字を区別しない関数です。つまり、`VALUES` と `values` のどちらも有効です。
:::

## 構文 \{#syntax\}

`VALUES` テーブル関数の基本構文は次のとおりです。

```sql
VALUES([structure,] values...)
```

一般的には次のように使われます：

```sql
VALUES(
    ['column1_name Type1, column2_name Type2, ...'],
    (value1_row1, value2_row1, ...),
    (value1_row2, value2_row2, ...),
    ...
)
```

## 引数 \{#arguments\}

* `column1_name Type1, ...` (省略可) 。カラム名と型を指定する[String](/sql-reference/data-types/string) 型。
  この引数を省略した場合、カラム名は `c1`、`c2` などになります。
* `(value1_row1, value2_row1)`。[Tuples](/sql-reference/data-types/tuple)
  任意の型の値を含むタプル。

:::note
カンマ区切りのタプルは、単一の値で置き換えることもできます。この場合、
各値は新しい行として扱われます。詳細は[例](#examples)セクションを参照してください。
:::

## 戻り値 \{#returned-value\}

* 指定された値を含む一時テーブルを返します。

## 使用例 \{#examples\}

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

`VALUES` はタプルだけでなく、単一の値にも使用できます。例:

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

または、[構文](#syntax)内で行仕様 (`'column1_name Type1, column2_name Type2, ...'`) を指定しない場合は、カラム名が自動的に割り当てられます。

例：

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

## SQL標準のVALUES句 \{#sql-standard-values-clause\}

ClickHouse は、PostgreSQL、MySQL、DuckDB、SQL Server と同様に、`FROM` 句内のテーブル式として SQL 標準の `VALUES` 句もサポートしています。この構文は内部的に、前述の `values` テーブル関数を使う形式へ書き換えられます。

:::note
この機能は実験的です。有効にするには、`allow_experimental_sql_standard_values_clause = 1` を設定してください。
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

CTE でも使用できます:

```sql title="Query"
WITH cte AS (SELECT * FROM (VALUES (1, 'one'), (2, 'two')) AS t(id, name))
SELECT * FROM cte;
```

JOINでは:

```sql title="Query"
SELECT t1.id, t1.val, t2.val2
FROM (VALUES (1, 'a'), (2, 'b')) AS t1(id, val)
JOIN (VALUES (1, 'x'), (2, 'y')) AS t2(id, val2) ON t1.id = t2.id;
```

:::note
`AS t(col1, col2, ...)` の後に指定するカラムの別名は、派生テーブルの
カラム名を付けるための標準的な SQL 構文に従います。省略した場合、カラム名は `c1`、`c2` などになります。
:::

## 関連項目 \{#see-also\}

* [Values 形式](/interfaces/formats/Values)