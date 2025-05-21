---
description: '最小 `val` 値に対する `arg` 値を計算します。最大の `val` が等しい行が複数ある場合、どの関連する `arg` が返されるかは決定的ではありません。'
sidebar_position: 110
slug: /sql-reference/aggregate-functions/reference/argmin
title: 'argMin'
---


# argMin

最小 `val` 値に対する `arg` 値を計算します。最大の `val` が等しい行が複数ある場合、どの関連する `arg` が返されるかは決定的ではありません。`arg` と `min` の両方は [集約関数](/sql-reference/aggregate-functions/index.md) として振る舞い、処理中に [Null をスキップ](/sql-reference/aggregate-functions/index.md#null-processing) し、利用可能な場合は `Null` でない値を返します。

**構文**

```sql
argMin(arg, val)
```

**引数**

- `arg` — 引数。
- `val` — 値。

**返される値**

- 最小 `val` 値に対応する `arg` 値。

タイプ: `arg` タイプに一致します。

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
SELECT argMin(user, salary) FROM salary
```

結果:

```text
┌─argMin(user, salary)─┐
│ worker               │
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
FROM VALUES((NULL, 0), ('a', 1), ('b', 2), ('c', 2), (NULL, NULL), ('d', NULL));

select * from test;
┌─a────┬────b─┐
│ ᴺᵁᴸᴸ │    0 │
│ a    │    1 │
│ b    │    2 │
│ c    │    2 │
│ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │
│ d    │ ᴺᵁᴸᴸ │
└──────┴──────┘

SELECT argMin(a, b), min(b) FROM test;
┌─argMin(a, b)─┬─min(b)─┐
│ a            │      0 │ -- argMin = a これは最初の `NULL` でない値であり、min(b) は別の行からの値です！
└──────────────┴────────┘

SELECT argMin(tuple(a), b) FROM test;
┌─argMin(tuple(a), b)─┐
│ (NULL)              │ -- aの `Tuple` は `NULL` 値のみを含んでいますが、これは `NULL` ではないため、集約関数はその行をスキップしません。
└─────────────────────┘

SELECT (argMin((a, b), b) as t).1 argMinA, t.2 argMinB from test;
┌─argMinA─┬─argMinB─┐
│ ᴺᵁᴸᴸ    │       0 │ -- `Tuple` を使用して、対応する max(b) のために両方のカラムを取得できます。
└─────────┴─────────┘

SELECT argMin(a, b), min(b) FROM test WHERE a IS NULL and b IS NULL;
┌─argMin(a, b)─┬─min(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- フィルタのため、すべての集約行が少なくとも1つの `NULL` 値を含んでいるため、すべての行がスキップされ、結果は `NULL` になります。
└──────────────┴────────┘

SELECT argMin(a, (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(a, tuple(b, a))─┬─min(tuple(b, a))─┐
│ d                      │ (NULL,NULL)      │ -- 'd' は最小の `NULL` でない値です。
└────────────────────────┴──────────────────┘

SELECT argMin((a, b), (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(tuple(a, b), tuple(b, a))─┬─min(tuple(b, a))─┐
│ (NULL,NULL)                      │ (NULL,NULL)      │ -- argMin はここで (NULL,NULL) を返します。なぜなら `Tuple` により `NULL` をスキップしないことが許可され、min(tuple(b, a)) はこのデータセットの最小値になります。
└──────────────────────────────────┴──────────────────┘

SELECT argMin(a, tuple(b)) FROM test;
┌─argMin(a, tuple(b))─┐
│ d                   │ -- `Tuple` は min において、b の `NULL` 値を持つ行をスキップしないために使用されます。
└─────────────────────┘
```

**参照**

- [Tuple](/sql-reference/data-types/tuple.md)
