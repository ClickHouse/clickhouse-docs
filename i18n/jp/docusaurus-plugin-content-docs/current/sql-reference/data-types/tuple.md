---
description: 'ClickHouse の Tuple データ型に関するドキュメント'
sidebar_label: 'Tuple(T1, T2, ...)'
sidebar_position: 34
slug: /sql-reference/data-types/tuple
title: 'Tuple(T1, T2, ...)'
doc_type: 'reference'
---

# Tuple(T1, T2, ...) \{#tuplet1-t2\}

それぞれが個別の[型](/sql-reference/data-types)を持つ要素からなるタプルです。Tuple には少なくとも 1 つの要素が含まれている必要があります。

タプルは一時的な列のグループ化に使用されます。クエリで `IN` 式を使用する場合や、ラムダ関数の特定の仮引数を指定する場合に、列をグループ化できます。詳細は、[IN 演算子](../../sql-reference/operators/in.md) と [高階関数](/sql-reference/functions/overview#higher-order-functions) のセクションを参照してください。

タプルはクエリ結果として返されることがあります。この場合、JSON 以外のテキスト形式では、値は丸かっこ内でカンマ区切りになります。JSON 形式では、タプルは配列（角かっこ内）として出力されます。

## タプルの作成 \{#creating-tuples\}

関数を使用してタプルを作成できます。

```sql
tuple(T1, T2, ...)
```

タプルの作成例:

```sql
SELECT tuple(1, 'a') AS x, toTypeName(x)
```

```text
┌─x───────┬─toTypeName(tuple(1, 'a'))─┐
│ (1,'a') │ Tuple(UInt8, String)      │
└─────────┴───────────────────────────┘
```

タプルは 1 つの要素だけを含むこともできます

例：

```sql
SELECT tuple('a') AS x;
```

```text
┌─x─────┐
│ ('a') │
└───────┘
```

構文 `(tuple_element1, tuple_element2)` を使うと、`tuple()` 関数を呼び出さずに複数の要素から成るタプルを作成できます。

例:

```sql
SELECT (1, 'a') AS x, (today(), rand(), 'someString') AS y, ('a') AS not_a_tuple;
```

```text
┌─x───────┬─y──────────────────────────────────────┬─not_a_tuple─┐
│ (1,'a') │ ('2022-09-21',2006973416,'someString') │ a           │
└─────────┴────────────────────────────────────────┴─────────────┘
```

## データ型の自動判定 \{#data-type-detection\}

タプルをその場で作成する場合、ClickHouse はタプルの引数の値を保持できる最小の型として、その引数の型を推論します。値が [NULL](/operations/settings/formats#input_format_null_as_default) の場合、推論される型は [Nullable](../../sql-reference/data-types/nullable.md) になります。

自動的なデータ型判定の例:

```sql
SELECT tuple(1, NULL) AS x, toTypeName(x)
```

```text
┌─x─────────┬─toTypeName(tuple(1, NULL))──────┐
│ (1, NULL) │ Tuple(UInt8, Nullable(Nothing)) │
└───────────┴─────────────────────────────────┘
```

## タプル要素の参照 \{#referring-to-tuple-elements\}

タプル要素は名前またはインデックスで参照できます。

```sql
CREATE TABLE named_tuples (`a` Tuple(s String, i Int64)) ENGINE = Memory;
INSERT INTO named_tuples VALUES (('y', 10)), (('x',-10));

SELECT a.s FROM named_tuples; -- by name
SELECT a.2 FROM named_tuples; -- by index
```

結果:

```text
┌─a.s─┐
│ y   │
│ x   │
└─────┘

┌─tupleElement(a, 2)─┐
│                 10 │
│                -10 │
└────────────────────┘
```

## Tuple による比較演算 \{#comparison-operations-with-tuple\}

2 つのタプルは、左から右へ順に要素を比較していきます。最初のタプルの要素が 2 番目のタプルの対応する要素より大きい（または小さい）場合、最初のタプルは 2 番目のタプルより大きい（または小さい）とみなされます。そうでない場合（両方の要素が等しい場合）は、次の要素を比較します。

例:

```sql
SELECT (1, 'z') > (1, 'a') c1, (2022, 01, 02) > (2023, 04, 02) c2, (1,2,3) = (3,2,1) c3;
```

```text
┌─c1─┬─c2─┬─c3─┐
│  1 │  0 │  0 │
└────┴────┴────┘
```

実際の使用例:

```sql
CREATE TABLE test
(
    `year` Int16,
    `month` Int8,
    `day` Int8
)
ENGINE = Memory AS
SELECT *
FROM values((2022, 12, 31), (2000, 1, 1));

SELECT * FROM test;

┌─year─┬─month─┬─day─┐
│ 2022 │    12 │  31 │
│ 2000 │     1 │   1 │
└──────┴───────┴─────┘

SELECT *
FROM test
WHERE (year, month, day) > (2010, 1, 1);

┌─year─┬─month─┬─day─┐
│ 2022 │    12 │  31 │
└──────┴───────┴─────┘
CREATE TABLE test
(
    `key` Int64,
    `duration` UInt32,
    `value` Float64
)
ENGINE = Memory AS
SELECT *
FROM values((1, 42, 66.5), (1, 42, 70), (2, 1, 10), (2, 2, 0));

SELECT * FROM test;

┌─key─┬─duration─┬─value─┐
│   1 │       42 │  66.5 │
│   1 │       42 │    70 │
│   2 │        1 │    10 │
│   2 │        2 │     0 │
└─────┴──────────┴───────┘

-- 各キーについて最大のdurationを持つvalueを検索します。durationが同じ場合は最大のvalueを選択します

SELECT
    key,
    max(duration),
    argMax(value, (duration, value))
FROM test
GROUP BY key
ORDER BY key ASC;

┌─key─┬─max(duration)─┬─argMax(value, tuple(duration, value))─┐
│   1 │            42 │                                    70 │
│   2 │             2 │                                     0 │
└─────┴───────────────┴───────────────────────────────────────┘
```
