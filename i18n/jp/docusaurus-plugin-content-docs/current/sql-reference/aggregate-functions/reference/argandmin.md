---
description: '`val` の最小値に対応する `arg` と `val` の値を計算します。最小となる同じ `val` を持つ行が複数存在する場合、どの行の `arg` と `val` が返されるかは非決定的です。'
sidebar_position: 111
slug: /sql-reference/aggregate-functions/reference/argandmin
title: 'argAndMin'
doc_type: 'reference'
---

# argAndMin

最小の `val` 値に対応する `arg` と `val` の値を計算します。最小値となる同じ `val` を持つ行が複数ある場合、どの行に対応する `arg` と `val` が返されるかは決定されていません。
`arg` および `min` の両方は[集約関数](/sql-reference/aggregate-functions/index.md)として動作し、処理中にどちらも[`Null` をスキップ](/sql-reference/aggregate-functions/index.md#null-processing)し、`Null` でない値が存在する場合には `Null` でない値を返します。

:::note
`argMin` との唯一の違いは、`argAndMin` が引数と値の両方を返す点です。
:::

**構文**

```sql
argAndMin(arg, val)
```

**引数**

* `arg` — 引数。
* `val` — 値。

**戻り値**

* 最小の `val` に対応する `arg` の値。
* `val` の最小値。

型: `arg`、`val` の型にそれぞれ対応するタプル。

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
SELECT argAndMin(user, salary) FROM salary
```

結果：

```text
┌─argAndMin(user, salary)─┐
│ ('worker',1000)         │
└─────────────────────────┘
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

SELECT argMin(a,b), argAndMin(a, b), min(b) FROM test;
┌─argMin(a, b)─┬─argAndMin(a, b)─┬─min(b)─┐
│ a            │ ('a',1)         │      0 │ -- argMin = a は最初の非 `NULL` 値であるため。min(b) は別の行から取得されています
└──────────────┴─────────────────┴────────┘

SELECT argAndMin(tuple(a), b) FROM test;
┌─argAndMin((a), b)─┐
│ ((NULL),0)        │ -- `NULL` 値のみを含む 'a' `Tuple` 自体は `NULL` ではないため、集約関数はその `NULL` 値を理由にその行をスキップしません
└───────────────────┘

SELECT (argAndMin((a, b), b) as t).1 argMinA, t.2 argMinB from test;
┌─argMinA──┬─argMinB─┐
│ (NULL,0) │       0 │ -- `Tuple` を使用することで、対応する min(b) の両方（すべて - tuple(*)）の列を取得できます
└──────────┴─────────┘

SELECT argAndMin(a, b), min(b) FROM test WHERE a IS NULL and b IS NULL;
┌─argAndMin(a, b)─┬─min(b)─┐
│ ('',0)          │   ᴺᵁᴸᴸ │ -- フィルタにより集約対象のすべての行に少なくとも1つの `NULL` 値が含まれるため、すべての行がスキップされ、結果は `NULL` になります
└─────────────────┴────────┘

SELECT argAndMin(a, (b, a)), min(tuple(b, a)) FROM test;
┌─argAndMin(a, (b, a))─┬─min((b, a))─┐
│ ('a',(1,'a'))        │ (0,NULL)    │ -- 'a' は min における最初の非 `NULL` 値です
└──────────────────────┴─────────────┘

SELECT argAndMin((a, b), (b, a)), min(tuple(b, a)) FROM test;
┌─argAndMin((a, b), (b, a))─┬─min((b, a))─┐
│ ((NULL,0),(0,NULL))       │ (0,NULL)    │ -- `Tuple` は `NULL` をスキップしないため、argAndMin はここで ((NULL,0),(0,NULL)) を返します。この場合の min(tuple(b, a)) はこのデータセットの最小値です
└───────────────────────────┴─────────────┘

SELECT argAndMin(a, tuple(b)) FROM test;
┌─argAndMin(a, (b))─┐
│ ('a',(1))         │ -- `Tuple` を `min` で使用することで、b に `NULL` 値を持つ行をスキップしないようにできます
└───────────────────┘
```

**関連項目**

* [argMin](/sql-reference/aggregate-functions/reference/argmin.md)
* [Tuple](/sql-reference/data-types/tuple.md)
