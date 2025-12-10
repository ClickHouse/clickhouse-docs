---
description: '`val` の最小値に対応する `arg` の値を計算します。`val` が同じ最小値を持つ行が複数存在する場合、どの行に対応する `arg` が返されるかは規定されていません。'
sidebar_position: 110
slug: /sql-reference/aggregate-functions/reference/argmin
title: 'argMin'
doc_type: 'reference'
---

# argMin {#argmin}

最小の `val` 値に対応する `arg` の値を計算します。`val` が最小となる行が複数ある場合、どの行に対応する `arg` が返されるかは非決定的です。
`arg` 部分および `min` 部分の両方は[集約関数](/sql-reference/aggregate-functions/index.md)として動作し、処理中はどちらも[`Null` をスキップ](/sql-reference/aggregate-functions/index.md#null-processing)し、`Null` ではない値が存在する場合には `Null` ではない値を返します。

**構文**

```sql
argMin(arg, val)
```

**引数**

* `arg` — 引数。
* `val` — 値。

**返される値**

* `val` が最小となる行の `arg` の値。

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
SELECT argMin(user, salary) FROM salary
```

結果：

```text
┌─argMin(user, salary)─┐
│ worker               │
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
FROM VALUES((NULL, 0), ('a', 1), ('b', 2), ('c', 2), (NULL, NULL), ('d', NULL));

SELECT * FROM test;
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
│ a            │      0 │ -- argMin = a となるのは、最初の非 `NULL` 値であるため。min(b) は別の行から取得される
└──────────────┴────────┘

SELECT argMin(tuple(a), b) FROM test;
┌─argMin(tuple(a), b)─┐
│ (NULL)              │ -- `NULL` 値のみを含む `Tuple` 自体は `NULL` ではないため、集約関数はその `NULL` 値を理由にその行をスキップしない
└─────────────────────┘

SELECT (argMin((a, b), b) as t).1 argMinA, t.2 argMinB from test;
┌─argMinA─┬─argMinB─┐
│ ᴺᵁᴸᴸ    │       0 │ -- `Tuple` を使用することで、対応する max(b) の両方(すべて - tuple(*))の列を取得できる
└─────────┴─────────┘

SELECT argMin(a, b), min(b) FROM test WHERE a IS NULL and b IS NULL;
┌─argMin(a, b)─┬─min(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- フィルタにより集約対象のすべての行に少なくとも1つの `NULL` 値が含まれるため、すべての行がスキップされ、結果は `NULL` となる
└──────────────┴────────┘

SELECT argMin(a, (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(a, tuple(b, a))─┬─min(tuple(b, a))─┐
│ d                      │ (NULL,NULL)      │ -- 'd' は min に対する最初の非 `NULL` 値である
└────────────────────────┴──────────────────┘

SELECT argMin((a, b), (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(tuple(a, b), tuple(b, a))─┬─min(tuple(b, a))─┐
│ (NULL,NULL)                      │ (NULL,NULL)      │ -- `Tuple` は `NULL` をスキップしないため argMin はここで (NULL,NULL) を返し、この場合の min(tuple(b, a)) はこのデータセットの最小値となる
└──────────────────────────────────┴──────────────────┘

SELECT argMin(a, tuple(b)) FROM test;
┌─argMin(a, tuple(b))─┐
│ d                   │ -- `Tuple` を `min` で使用することで、b に `NULL` 値を持つ行をスキップしないようにできる
└─────────────────────┘
```

**関連項目**

* [Tuple](/sql-reference/data-types/tuple.md)
