---
slug: /sql-reference/data-types/tuple
sidebar_position: 34
sidebar_label: タプル(T1, T2, ...)
---

# タプル(T1, T2, ...)

要素のタプルであり、各要素は個別の [型](../../sql-reference/data-types/index.md#data_types) を持ちます。タプルには少なくとも1つの要素が含まれていなければなりません。

タプルは、一時的なカラムグループ化に使用されます。クエリにIN式を使用する際にカラムをグループ化したり、ラムダ関数の特定の形式的パラメータを指定するために使用されます。詳細については、[IN演算子](../../sql-reference/operators/in.md) および [高階関数](../../sql-reference/functions/overview#higher-order-functions) のセクションを参照してください。

タプルはクエリの結果になることがあります。この場合、JSON以外のテキスト形式では、値はカンマで区切られた括弧内に配置されます。JSON形式では、タプルは配列として出力されます（角括弧内）。

## タプルの作成 {#creating-tuples}

関数を使用してタプルを作成できます：

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

構文 `(tuple_element1, tuple_element2)` を使用して、`tuple()` 関数を呼び出さずに複数の要素からなるタプルを作成することができます。

例：

``` sql
SELECT (1, 'a') AS x, (today(), rand(), 'someString') AS y, ('a') AS not_a_tuple;
```

``` text
┌─x───────┬─y──────────────────────────────────────┬─not_a_tuple─┐
│ (1,'a') │ ('2022-09-21',2006973416,'someString') │ a           │
└─────────┴────────────────────────────────────────┴─────────────┘
```

## データ型の検出 {#data-type-detection}

タプルをその場で作成する際、ClickHouseはタプルの引数の型を提供された引数値を格納できる最小の型として推測します。値が [NULL](../../sql-reference/syntax.md#null-literal)の場合、推測された型は [Nullable](../../sql-reference/data-types/nullable.md) になります。

自動データ型検出の例：

``` sql
SELECT tuple(1, NULL) AS x, toTypeName(x)
```

``` text
┌─x─────────┬─toTypeName(tuple(1, NULL))──────┐
│ (1, NULL) │ Tuple(UInt8, Nullable(Nothing)) │
└───────────┴─────────────────────────────────┘
```

## タプル要素の参照 {#referring-to-tuple-elements}

タプルの要素は名前またはインデックスで参照できます：

``` sql
CREATE TABLE named_tuples (`a` Tuple(s String, i Int64)) ENGINE = Memory;
INSERT INTO named_tuples VALUES (('y', 10)), (('x',-10));

SELECT a.s FROM named_tuples; -- 名前による
SELECT a.2 FROM named_tuples; -- インデックスによる
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

## タプルに対する比較演算 {#comparison-operations-with-tuple}

2つのタプルは、左から右への要素を順次比較することによって比較されます。最初のタプルの要素が2番目のタプルの対応する要素より大きい（小さい）場合、最初のタプルは2番目のタプルより大きい（小さい）とみなされます。そうでなければ（両方の要素が等しい場合）、次の要素が比較されます。

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

-- 各キーに対し、最大のdurationを持つ値を見つけましょう。durationが等しい場合は、最大のvalueを選択します。

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
