---
slug: /sql-reference/aggregate-functions/reference/argmin
sidebar_position: 110
title: "argMin"
description: "`val`の最小値に対応する`arg`値を計算します。複数の行が同じ最大の`val`を持つ場合、どの関連する`arg`が返されるかは非決定的です。"
---


# argMin

`val`の最小値に対応する`arg`値を計算します。複数の行が同じ最大の`val`を持つ場合、どの関連する`arg`が返されるかは非決定的です。`arg`と`min`の両方は[集約関数](/sql-reference/aggregate-functions/index.md)として動作し、処理中に[Nullをスキップ](/sql-reference/aggregate-functions/index.md#null-processing)し、利用可能な場合は`Null`以外の値を返します。

**構文**

``` sql
argMin(arg, val)
```

**引数**

- `arg` — 引数。
- `val` — 値。

**返される値**

- 最小の`val`値に対応する`arg`値。

タイプ: `arg`の型と一致します。

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
SELECT argMin(user, salary) FROM salary
```

結果:

``` text
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
│ a            │      0 │ -- argMin = a これは最初の`NULL`以外の値であり、min(b)は別の行から取得されます！
└──────────────┴────────┘

SELECT argMin(tuple(a), b) FROM test;
┌─argMin(tuple(a), b)─┐
│ (NULL)              │ -- aの`Tuple`が`NULL`の値のみを含む場合、それは`NULL`ではないので、集約関数はその行をスキップしません
└─────────────────────┘

SELECT (argMin((a, b), b) as t).1 argMinA, t.2 argMinB from test;
┌─argMinA─┬─argMinB─┐
│ ᴺᵁᴸᴸ    │       0 │ -- `Tuple`を使用して、対応するmax(b)のためにすべての（全て - tuple(*)）カラムを取得できます
└─────────┴─────────┘

SELECT argMin(a, b), min(b) FROM test WHERE a IS NULL and b IS NULL;
┌─argMin(a, b)─┬─min(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- フィルターのために集約されたすべての行は少なくとも1つの`NULL`値を含むため、すべての行がスキップされ、結果は`NULL`になります
└──────────────┴────────┘

SELECT argMin(a, (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(a, tuple(b, a))─┬─min(tuple(b, a))─┐
│ d                      │ (NULL,NULL)      │ -- 'd'は最小のための最初の`NULL`以外の値です
└────────────────────────┴──────────────────┘

SELECT argMin((a, b), (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(tuple(a, b), tuple(b, a))─┬─min(tuple(b, a))─┐
│ (NULL,NULL)                      │ (NULL,NULL)      │ -- argMinはここで`Tuple`が`NULL`をスキップしないことを許可するため`(NULL,NULL)`を返します。このデータセットの最小値はmin(tuple(b, a))です
└──────────────────────────────────┴──────────────────┘

SELECT argMin(a, tuple(b)) FROM test;
┌─argMin(a, tuple(b))─┐
│ d                   │ -- `Tuple`は`b`との行もスキップせずに`min`で使用できます
└─────────────────────┘
```

**参照**

- [Tuple](/sql-reference/data-types/tuple.md)
