---
description: 'Calculates the `arg` value for a maximum `val` value.'
sidebar_position: 109
slug: '/sql-reference/aggregate-functions/reference/argmax'
title: 'argMax'
---




# argMax

最大の `val` 値に対する `arg` 値を計算します。同じ `val` が最大である行が複数ある場合、どの関連する `arg` が返されるかは非決定的です。 `arg` と `max` の両方は [集約関数](/sql-reference/aggregate-functions/index.md) として動作し、処理中に `Null` を [スキップ](/sql-reference/aggregate-functions/index.md#null-processing) し、利用可能な場合は `Null` でない値を返します。

**構文**

```sql
argMax(arg, val)
```

**引数**

- `arg` — 引数。
- `val` — 値。

**戻り値**

- 最大の `val` 値に対応する `arg` 値。

タイプ: `arg` タイプと一致します。

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

結果:

```text
┌─argMax(user, salary)─┐
│ director             │
└──────────────────────┘
```

**拡張例**

```sql
CREATE TABLE test
(
    a Nullable(String),
    b Nullable(Int64)
)
ENGINE = Memory AS
SELECT *
FROM VALUES(('a', 1), ('b', 2), ('c', 2), (NULL, 3), (NULL, NULL), ('d', NULL));

select * from test;
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
│ b            │      3 │ -- argMax = 'b' は最初の非 Null 値なので、max(b) は別の行からの値です！
└──────────────┴────────┘

SELECT argMax(tuple(a), b) FROM test;
┌─argMax(tuple(a), b)─┐
│ (NULL)              │ -- a `Tuple` が唯一 `NULL` 値を含むため、その `NULL` 値のおかげで集約関数はこの行をスキップしません
└─────────────────────┘

SELECT (argMax((a, b), b) as t).1 argMaxA, t.2 argMaxB FROM test;
┌─argMaxA─┬─argMaxB─┐
│ ᴺᵁᴸᴸ    │       3 │ -- Tuple を使用して、対応する max(b) のためのすべての (すべて - tuple(*)) カラムを取得できます
└─────────┴─────────┘

SELECT argMax(a, b), max(b) FROM test WHERE a IS NULL AND b IS NULL;
┌─argMax(a, b)─┬─max(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- フィルタのためにすべての集約行が少なくとも1つの `NULL` 値を含むため、すべての行がスキップされ、結果は `NULL` になります
└──────────────┴────────┘

SELECT argMax(a, (b,a)) FROM test;
┌─argMax(a, tuple(b, a))─┐
│ c                      │ -- b=2 の行が2つあるため、`Tuple` を `Max` で使用すると最初の `arg` を得ることができます
└────────────────────────┘

SELECT argMax(a, tuple(b)) FROM test;
┌─argMax(a, tuple(b))─┐
│ b                   │ -- `Tuple` は `Max` 内で使われ、Nulls をスキップしません
└─────────────────────┘
```

**参照**

- [Tuple](/sql-reference/data-types/tuple.md)
