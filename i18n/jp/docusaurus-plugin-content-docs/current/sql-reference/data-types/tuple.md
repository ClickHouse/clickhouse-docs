---
slug: '/sql-reference/data-types/tuple'
sidebar_position: 34
sidebar_label: 'Tuple(T1, T2, ...)'
keywords: ['Tuple', 'data types', 'ClickHouse']
description: 'Tuple data type in ClickHouse allows grouping of multiple values of different types.'
---


# Tuple(T1, T2, ...)

要素のタプルであり、各要素は個別の [タイプ](/sql-reference/data-types) を持ちます。タプルは少なくとも1つの要素を含む必要があります。

タプルは、一時的なカラムのグルーピングに使用されます。カラムはクエリ内でIN演算子が使用されるときにグループ化され、ラムダ関数の特定の形式パラメータを指定するためにも使用されます。詳細については、[IN演算子](../../sql-reference/operators/in.md) と [高階関数](/sql-reference/functions/overview#higher-order-functions) のセクションを参照してください。

タプルはクエリの結果になることがあります。この場合、JSON以外のテキストフォーマットでは、値はカンマで区切られてブラケット内に表示されます。JSONフォーマットでは、タプルは配列として出力されます（角括弧内）。

## Tuplesの作成 {#creating-tuples}

関数を使用してタプルを作成できます。

``` sql
tuple(T1, T2, ...)
```

タプルを作成する例：

``` sql
SELECT tuple(1, 'a') AS x, toTypeName(x)
```

``` text
┌─x───────┬─toTypeName(tuple(1, 'a'))─┐
│ (1,'a') │ Tuple(UInt8, String)      │
└─────────┴───────────────────────────┘
```

タプルは単一の要素を含むことができます。

例：

``` sql
SELECT tuple('a') AS x;
```

``` text
┌─x─────┐
│ ('a') │
└───────┘
```

構文 `(tuple_element1, tuple_element2)` を使用して、 `tuple()` 関数を呼び出さずに複数の要素のタプルを作成できます。

例：

``` sql
SELECT (1, 'a') AS x, (today(), rand(), 'someString') AS y, ('a') AS not_a_tuple;
```

``` text
┌─x───────┬─y──────────────────────────────────────┬─not_a_tuple─┐
│ (1,'a') │ ('2022-09-21',2006973416,'someString') │ a           │
└─────────┴────────────────────────────────────────┴─────────────┘
```

## データタイプの検出 {#data-type-detection}

タプルをその場で作成するとき、ClickHouseはタプルの引数のタイプを提供された引数値を保持できる最小のタイプとして推測します。値が [NULL](/operations/settings/formats#input_format_null_as_default) の場合、推測されたタイプは [Nullable](../../sql-reference/data-types/nullable.md) になります。

自動データタイプ検出の例：

``` sql
SELECT tuple(1, NULL) AS x, toTypeName(x)
```

``` text
┌─x─────────┬─toTypeName(tuple(1, NULL))──────┐
│ (1, NULL) │ Tuple(UInt8, Nullable(Nothing)) │
└───────────┴─────────────────────────────────┘
```

## タプル要素への参照 {#referring-to-tuple-elements}

タプルの要素には、名前またはインデックスで参照できます：

``` sql
CREATE TABLE named_tuples (`a` Tuple(s String, i Int64)) ENGINE = Memory;
INSERT INTO named_tuples VALUES (('y', 10)), (('x',-10));

SELECT a.s FROM named_tuples; -- 名前で
SELECT a.2 FROM named_tuples; -- インデックスで
```

結果：

``` text
┌─a.s─┐
│ y   │
│ x   │
└─────┘

┌─tupleElement(a, 2)─┐
│                 10 │
│                -10 │
└────────────────────┘
```

## タプルを使った比較演算 {#comparison-operations-with-tuple}

2つのタプルは、左から右にかけてその要素を順に比較して比較されます。最初のタプルの要素が2番目のタプルの対応する要素よりも大きい（小さい）場合、最初のタプルは2番目のタプルよりも大きい（小さい）とされ、そうでない場合（両方の要素が等しい場合）、次の要素が比較されます。

例：

```sql
SELECT (1, 'z') > (1, 'a') c1, (2022, 01, 02) > (2023, 04, 02) c2, (1,2,3) = (3,2,1) c3;
```

``` text
┌─c1─┬─c2─┬─c3─┐
│  1 │  0 │  0 │
└────┴────┴────┘
```

実際の例：

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

-- 各キーに対して最も長いdurationの値を見つけます。durationが等しい場合は、最も大きい値を選択します。

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
