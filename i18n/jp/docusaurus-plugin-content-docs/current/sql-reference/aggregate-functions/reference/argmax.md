---
description: '最大の `val` に対応する `arg` の値を計算します。'
sidebar_position: 109
slug: /sql-reference/aggregate-functions/reference/argmax
title: 'argMax'
doc_type: 'reference'
---

# argMax {#argmax}

最大の `val` 値に対応する `arg` の値を計算します。最大値の `val` を持つ行が複数ある場合、どの行の `arg` が返されるかは決定的ではありません。
`arg` 側と `max` 側はどちらも[集約関数](/sql-reference/aggregate-functions/index.md)として動作し、処理中はいずれも[`Null` をスキップ](/sql-reference/aggregate-functions/index.md#null-processing)し、`Null` 以外の値が存在する場合には `Null` 以外の値を返します。

**構文**

```sql
argMax(arg, val)
```

**引数**

* `arg` — 引数。
* `val` — 値。

**戻り値**

* `val` の最大値に対応する `arg` の値。

型: `arg` と同じ型。

**例**

入力テーブル:

```text
┌─user─────┬─salary─┐
│ director │   5000 │
│ manager  │   3000 │
│ worker   │   1000 │
└──────────┴────────┘
```

クエリ:

```sql
SELECT argMax(user, salary) FROM salary;
```

結果：

```text
┌─argMax(user, salary)─┐
│ director             │
└──────────────────────┘
```

**詳細な例**

```sql
CREATE TABLE test
(
    a Nullable(String),
    b Nullable(Int64)
)
ENGINE = Memory AS
SELECT *
FROM VALUES(('a', 1), ('b', 2), ('c', 2), (NULL, 3), (NULL, NULL), ('d', NULL));

SELECT * FROM test;
┌─a────┬────b─┐
│ a    │    1 │
│ b    │    2 │
│ c    │    2 │
│ ᴺᵁᴸᴸ │    3 │
│ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │
│ d    │ ᴺᵁᴸᴸ │
└──────┴──────┘

SELECT argMax(a, b), max(b) FROM test;
┌─argMax(a, b)─┬─max(b)─┐
│ b            │      3 │ -- argMax = 'b' は最初の非NULL値であるため。max(b) は別の行から取得されます!
└──────────────┴────────┘

SELECT argMax(tuple(a), b) FROM test;
┌─argMax(tuple(a), b)─┐
│ (NULL)              │ -- `NULL` 値のみを含む `Tuple` は `NULL` ではないため、集約関数はその `NULL` 値によってその行をスキップしません
└─────────────────────┘

SELECT (argMax((a, b), b) as t).1 argMaxA, t.2 argMaxB FROM test;
┌─argMaxA─┬─argMaxB─┐
│ ᴺᵁᴸᴸ    │       3 │ -- Tuple を使用して、対応する max(b) の両方(すべて - tuple(*))の列を取得できます
└─────────┴─────────┘

SELECT argMax(a, b), max(b) FROM test WHERE a IS NULL AND b IS NULL;
┌─argMax(a, b)─┬─max(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- フィルタにより集約されたすべての行に少なくとも1つの `NULL` 値が含まれるため、すべての行がスキップされ、結果は `NULL` になります
└──────────────┴────────┘

SELECT argMax(a, (b,a)) FROM test;
┌─argMax(a, tuple(b, a))─┐
│ c                      │ -- b=2 の行が2つあります。`Max` 内の `Tuple` を使用すると、最初の `arg` 以外を取得できます
└────────────────────────┘

SELECT argMax(a, tuple(b)) FROM test;
┌─argMax(a, tuple(b))─┐
│ b                   │ -- `Max` 内で `Tuple` を使用することで、`Max` で NULL をスキップしないようにできます
└─────────────────────┘
```

**関連項目**

* [Tuple](/sql-reference/data-types/tuple.md)
