---
description: 'ClickHouse における Tuple データ型に関するドキュメント'
sidebar_label: 'Tuple(T1, T2, ...)'
sidebar_position: 34
slug: /sql-reference/data-types/tuple
title: 'Tuple(T1, T2, ...)'
doc_type: 'reference'
---



# Tuple(T1, T2, ...)

それぞれが個別の[型](/sql-reference/data-types)を持つ要素から構成されるタプルです。Tuple 型には少なくとも 1 つの要素が含まれている必要があります。

タプルはカラムを一時的にグループ化するために使用されます。クエリで `IN` 式を使用する場合や、ラムダ関数の特定の仮引数を指定する場合にカラムをグループ化できます。詳細は、[IN 演算子](../../sql-reference/operators/in.md)および[高階関数](/sql-reference/functions/overview#higher-order-functions)のセクションを参照してください。

タプルはクエリ結果として出力されることがあります。この場合、JSON 以外のテキストフォーマットでは、値は丸かっこ内でカンマ区切りで出力されます。JSON フォーマットでは、タプルは配列（角かっこ）として出力されます。



## タプルの作成 {#creating-tuples}

関数を使用してタプルを作成できます：

```sql
tuple(T1, T2, ...)
```

タプル作成の例：

```sql
SELECT tuple(1, 'a') AS x, toTypeName(x)
```

```text
┌─x───────┬─toTypeName(tuple(1, 'a'))─┐
│ (1,'a') │ Tuple(UInt8, String)      │
└─────────┴───────────────────────────┘
```

タプルは単一の要素を含むことができます

例：

```sql
SELECT tuple('a') AS x;
```

```text
┌─x─────┐
│ ('a') │
└───────┘
```

`tuple()` 関数を呼び出さずに複数の要素からなるタプルを作成するには、構文 `(tuple_element1, tuple_element2)` を使用できます。

例：

```sql
SELECT (1, 'a') AS x, (today(), rand(), 'someString') AS y, ('a') AS not_a_tuple;
```

```text
┌─x───────┬─y──────────────────────────────────────┬─not_a_tuple─┐
│ (1,'a') │ ('2022-09-21',2006973416,'someString') │ a           │
└─────────┴────────────────────────────────────────┴─────────────┘
```


## データ型の検出 {#data-type-detection}

タプルを動的に作成する際、ClickHouseは提供された引数値を保持できる最小の型としてタプル引数の型を推論します。値が[NULL](/operations/settings/formats#input_format_null_as_default)の場合、推論される型は[Nullable](../../sql-reference/data-types/nullable.md)となります。

自動データ型検出の例:

```sql
SELECT tuple(1, NULL) AS x, toTypeName(x)
```

```text
┌─x─────────┬─toTypeName(tuple(1, NULL))──────┐
│ (1, NULL) │ Tuple(UInt8, Nullable(Nothing)) │
└───────────┴─────────────────────────────────┘
```


## タプル要素の参照 {#referring-to-tuple-elements}

タプル要素は名前またはインデックスで参照できます:

```sql
CREATE TABLE named_tuples (`a` Tuple(s String, i Int64)) ENGINE = Memory;
INSERT INTO named_tuples VALUES (('y', 10)), (('x',-10));

SELECT a.s FROM named_tuples; -- 名前で参照
SELECT a.2 FROM named_tuples; -- インデックスで参照
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


## Tupleの比較演算 {#comparison-operations-with-tuple}

2つのタプルは、左から右へ順に要素を比較することで比較されます。最初のタプルの要素が2番目のタプルの対応する要素より大きい（小さい）場合、最初のタプルは2番目より大きい（小さい）と判定されます。それ以外の場合（両方の要素が等しい場合）は、次の要素が比較されます。

例：

```sql
SELECT (1, 'z') > (1, 'a') c1, (2022, 01, 02) > (2023, 04, 02) c2, (1,2,3) = (3,2,1) c3;
```

```text
┌─c1─┬─c2─┬─c3─┐
│  1 │  0 │  0 │
└────┴────┴────┘
```

実用例：

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

-- 各キーについて最大のdurationを持つ値を見つけます。durationが等しい場合は最大のvalueを選択します

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
