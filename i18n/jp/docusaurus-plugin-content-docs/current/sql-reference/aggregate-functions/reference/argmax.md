---
slug: /sql-reference/aggregate-functions/reference/argmax
sidebar_position: 109
title: "argMax"
description: "`val` の最大値に対する `arg` 値を計算します。"
---


# argMax

`val` の最大値に対する `arg` 値を計算します。同じ最大の `val` を持つ行が複数ある場合、どの関連する `arg` が返されるかは非決定的です。`arg` と `max` の両方は [集約関数](/sql-reference/aggregate-functions/index.md) として動作し、処理中に `Null` を [スキップ](/sql-reference/aggregate-functions/index.md#null-processing) し、`Null` 値が利用可能な場合に `Null` ではない値を返します。

**構文**

``` sql
argMax(arg, val)
```

**引数**

- `arg` — 引数。
- `val` — 値。

**戻り値**

- 最大 `val` 値に対応する `arg` 値。

タイプ: `arg` タイプに一致します。

**例**

入力テーブル:

``` text
┌─user─────┬─salary─┐
│ director │   5000 │
│ manager  │   3000 │
│ worker   │   1000 │
└──────────┴────────┘
```

クエリ:

``` sql
SELECT argMax(user, salary) FROM salary;
```

結果:

``` text
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
│ b            │      3 │ -- argMax = 'b' は最初の非 Null 値であり、max(b) は別の行からの値です！
└──────────────┴────────┘

SELECT argMax(tuple(a), b) FROM test;
┌─argMax(tuple(a), b)─┐
│ (NULL)              │ -- `Tuple` の a が `NULL` 値のみを含むため、その行はスキップされません
└─────────────────────┘

SELECT (argMax((a, b), b) as t).1 argMaxA, t.2 argMaxB FROM test;
┌─argMaxA─┬─argMaxB─┐
│ ᴺᵁᴸᴸ    │       3 │ -- Tuple を使用して、最大の b に対応するすべてのカラムを取得できます
└─────────┴─────────┘

SELECT argMax(a, b), max(b) FROM test WHERE a IS NULL AND b IS NULL;
┌─argMax(a, b)─┬─max(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- 集約されたすべての行にはフィルタリングのために少なくとも1つの `NULL` 値が含まれているため、すべての行がスキップされ、結果は `NULL` になります
└──────────────┴────────┘

SELECT argMax(a, (b,a)) FROM test;
┌─argMax(a, tuple(b, a))─┐
│ c                      │ -- b=2 の行が2つあり、`Tuple` の `Max` により最初の `arg` ではなくなります
└────────────────────────┘

SELECT argMax(a, tuple(b)) FROM test;
┌─argMax(a, tuple(b))─┐
│ b                   │ -- `Tuple` を使用して `Max` で Null をスキップしないことができます
└─────────────────────┘
```

**関連情報**

- [Tuple](/sql-reference/data-types/tuple.md)
