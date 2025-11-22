---
description: '`val` が最大となるときの `arg` の値を計算します。'
sidebar_position: 109
slug: /sql-reference/aggregate-functions/reference/argmax
title: 'argMax'
doc_type: 'reference'
---

# argMax

最大の `val` の値に対応する `arg` の値を計算します。最大となる `val` が同一の行が複数存在する場合、どの行の対応する `arg` が返されるかは保証されません。
`arg` と `max` はどちらも[集約関数](/sql-reference/aggregate-functions/index.md)として動作し、いずれも処理中に[`Null` をスキップ](/sql-reference/aggregate-functions/index.md#null-processing)し、非 `Null` 値が存在する場合は非 `Null` 値を返します。

**構文**

```sql
argMax(arg, val)
```

**引数**

* `arg` — 引数。
* `val` — 値。

**返される値**

* 最大の `val` に対応する `arg` の値。

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

クエリ：

```sql
SELECT argMax(user, salary) FROM salary;
```

結果:

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
│ b            │      3 │ -- argMax = 'b' は最初の非NULL値であるため。max(b) は別の行からのものです!
└──────────────┴────────┘

SELECT argMax(tuple(a), b) FROM test;
┌─argMax(tuple(a), b)─┐
│ (NULL)              │ -- `NULL` 値のみを含む `Tuple` は `NULL` ではないため、集約関数はその `NULL` 値によってその行をスキップしません
└─────────────────────┘

SELECT (argMax((a, b), b) as t).1 argMaxA, t.2 argMaxB FROM test;
┌─argMaxA─┬─argMaxB─┐
│ ᴺᵁᴸᴸ    │       3 │ -- Tupleを使用して、対応するmax(b)の両方(すべて - tuple(*))の列を取得できます
└─────────┴─────────┘

SELECT argMax(a, b), max(b) FROM test WHERE a IS NULL AND b IS NULL;
┌─argMax(a, b)─┬─max(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- フィルタにより、すべての集約行に少なくとも1つの `NULL` 値が含まれているため、すべての行がスキップされ、結果は `NULL` になります
└──────────────┴────────┘

SELECT argMax(a, (b,a)) FROM test;
┌─argMax(a, tuple(b, a))─┐
│ c                      │ -- b=2の行が2つあります。`Max` 内の `Tuple` により、最初の `arg` 以外を取得できます
└────────────────────────┘

SELECT argMax(a, tuple(b)) FROM test;
┌─argMax(a, tuple(b))─┐
│ b                   │ -- `Tuple` を `Max` で使用することで、`Max` 内でNULLをスキップしないようにできます
└─────────────────────┘
```

**関連項目**

* [Tuple](/sql-reference/data-types/tuple.md)
