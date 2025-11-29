---
description: '`val` の最大値に対応する `arg` と `val` の値を計算します。最大値となる `val` を持つ行が複数ある場合、どの行に対応する `arg` と `val` が返されるかは決定的ではありません。'
sidebar_position: 111
slug: /sql-reference/aggregate-functions/reference/argandmax
title: 'argAndMax'
doc_type: 'reference'
---

# argAndMax {#argandmax}

最大の`val`値に対応する`arg`と`val`の値を計算します。最大値となる`val`が等しい行が複数存在する場合、どの`arg`と`val`の組み合わせが返されるかは非決定的です。
`arg`と`max`の両方の部分は[集約関数](/sql-reference/aggregate-functions/index.md)として動作し、処理中に[`Null`をスキップ](/sql-reference/aggregate-functions/index.md#null-processing)し、`Null`でない値が利用可能な場合は`Null`でない値を返します。

:::note
`argMax`との唯一の違いは、`argAndMax`が引数と値の両方を返す点です。
:::

**構文**

```sql
argAndMax(arg, val)
```

**引数**

* `arg` — 引数。
* `val` — 値

**戻り値**

* 最大の `val` に対応する `arg` の値。
* `val` の最大値

型: `arg`、`val` の各型に対応するタプル。

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
SELECT argAndMax(user, salary) FROM salary;
```

結果:

```text
┌─argAndMax(user, salary)─┐
│ ('director',5000)       │
└─────────────────────────┘
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

SELECT * FROM test;
┌─a────┬────b─┐
│ a    │    1 │
│ b    │    2 │
│ c    │    2 │
│ ᴺᵁᴸᴸ │    3 │
│ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │
│ d    │ ᴺᵁᴸᴸ │
└──────┴──────┘

SELECT argMax(a, b), argAndMax(a, b), max(b) FROM test;
┌─argMax(a, b)─┬─argAndMax(a, b)─┬─max(b)─┐
│ b            │ ('b',2)         │      3 │ -- argMax = b は最初の非NULL値であるため、max(b)は別の行から取得されます！
└──────────────┴─────────────────┴────────┘

SELECT argAndMax(tuple(a), b) FROM test;
┌─argAndMax((a), b)─┐
│ ((NULL),3)        │-- `NULL`値のみを含む`Tuple`は`NULL`ではないため、集約関数はその`NULL`値によってその行をスキップしません
└───────────────────┘

SELECT (argMax((a, b), b) as t).1 argMaxA, t.2 argMaxB FROM test;
┌─argMaxA──┬─argMaxB─┐
│ (NULL,3) │       3 │ -- Tupleを使用して、対応するmax(b)の両方の列（すべて - tuple(*)）を取得できます
└──────────┴─────────┘

SELECT argAndMax(a, b), max(b) FROM test WHERE a IS NULL AND b IS NULL;
┌─argAndMax(a, b)─┬─max(b)─┐
│ ('',0)          │   ᴺᵁᴸᴸ │-- フィルタにより集約されたすべての行に少なくとも1つの`NULL`値が含まれるため、すべての行がスキップされ、結果は`NULL`になります
└─────────────────┴────────┘

SELECT argAndMax(a, (b,a)) FROM test;
┌─argAndMax(a, (b, a))─┐
│ ('c',(2,'c'))        │ -- b=2の行が2つあり、`Max`内の`Tuple`を使用することで最初の`arg`以外を取得できます
└──────────────────────┘

SELECT argAndMax(a, tuple(b)) FROM test;
┌─argAndMax(a, (b))─┐
│ ('b',(2))         │ -- `Max`内で`Tuple`を使用することで、`Max`でNULLをスキップしないようにできます
└───────────────────┘
```

**関連項目**

* [argMax](/sql-reference/aggregate-functions/reference/argmax.md)
* [Tuple](/sql-reference/data-types/tuple.md)