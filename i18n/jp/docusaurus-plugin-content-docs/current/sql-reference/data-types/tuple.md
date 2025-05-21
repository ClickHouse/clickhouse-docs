description: 'ClickHouseにおけるTupleデータ型のドキュメント'
sidebar_label: 'Tuple(T1, T2, ...)'
sidebar_position: 34
slug: /sql-reference/data-types/tuple
title: 'Tuple(T1, T2, ...)'
```


# Tuple(T1, T2, ...)

それぞれが個別の [type](/sql-reference/data-types) を持つ要素のタプルです。タプルは少なくとも1つの要素を含まなければなりません。

タプルは、一時的なカラムのグループ化に使用されます。IN式がクエリ内で使用されるとき、またはラムダ関数の特定の形式パラメータを指定する際に、カラムをグループ化できます。詳細については、[INオペレーター](../../sql-reference/operators/in.md) と [高階関数](/sql-reference/functions/overview#higher-order-functions) のセクションを参照してください。

タプルはクエリの結果として出力されることがあります。この場合、JSON以外のテキスト形式では、値はカンマ区切りの括弧内に表示されます。JSON形式では、タプルは配列（中括弧内）として出力されます。

## Tuplesの作成 {#creating-tuples}

関数を使用してタプルを作成できます。

```sql
tuple(T1, T2, ...)
```

タプルを作成する例：

```sql
SELECT tuple(1, 'a') AS x, toTypeName(x)
```

```text
┌─x───────┬─toTypeName(tuple(1, 'a'))─┐
│ (1,'a') │ Tuple(UInt8, String)      │
└─────────┴───────────────────────────┘
```

タプルは1つの要素を含むことができます。

例：

```sql
SELECT tuple('a') AS x;
```

```text
┌─x─────┐
│ ('a') │
└───────┘
```

構文 `(tuple_element1, tuple_element2)` を使用して、`tuple()` 関数を呼び出さずに複数の要素を持つタプルを作成できます。

例：

```sql
SELECT (1, 'a') AS x, (today(), rand(), 'someString') AS y, ('a') AS not_a_tuple;
```

```text
┌─x───────┬─y──────────────────────────────────────┬─not_a_tuple─┐
│ (1,'a') │ ('2022-09-21',2006973416,'someString') │ a           │
└─────────┴────────────────────────────────────────┴─────────────┘
```

## データ型検出 {#data-type-detection}

タプルをオンザフライで作成するとき、ClickHouseはタプルの引数の型を提供された引数の値を保持可能な最小の型として推測します。値が [NULL](/operations/settings/formats#input_format_null_as_default) の場合、推測された型は [Nullable](../../sql-reference/data-types/nullable.md) です。

自動データ型検出の例：

```sql
SELECT tuple(1, NULL) AS x, toTypeName(x)
```

```text
┌─x─────────┬─toTypeName(tuple(1, NULL))──────┐
│ (1, NULL) │ Tuple(UInt8, Nullable(Nothing)) │
└───────────┴─────────────────────────────────┘
```

## タプル要素への参照 {#referring-to-tuple-elements}

タプルの要素は名前またはインデックスで参照できます。

```sql
CREATE TABLE named_tuples (`a` Tuple(s String, i Int64)) ENGINE = Memory;
INSERT INTO named_tuples VALUES (('y', 10)), (('x',-10));

SELECT a.s FROM named_tuples; -- 名前で
SELECT a.2 FROM named_tuples; -- インデックスで
```

結果：

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

## タプルとの比較操作 {#comparison-operations-with-tuple}

2つのタプルは、左から右へ順にその要素を比較することによって比較されます。最初のタプルの要素が2番目のタプルの対応する要素より大きい（小さい）場合、最初のタプルは2番目のタプルより大きい（小さい）と見なされます。そうでなければ（両方の要素が等しい場合）、次の要素が比較されます。

例：

```sql
SELECT (1, 'z') > (1, 'a') c1, (2022, 01, 02) > (2023, 04, 02) c2, (1,2,3) = (3,2,1) c3;
```

```text
┌─c1─┬─c2─┬─c3─┐
│  1 │  0 │  0 │
└────┴────┴────┘
```

実例：

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

-- 各キーに対して最大のdurationの値を見つけます。同じdurationの場合は、最大のvalueを選択します

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
