---
'description': '最大の `val` 値のための `arg` 値を計算します。'
'sidebar_position': 109
'slug': '/sql-reference/aggregate-functions/reference/argmax'
'title': 'argMax'
'doc_type': 'reference'
---


# argMax

最大の `val` 値に対する `arg` 値を計算します。最大の `val` が同じ複数の行が存在する場合、どの関連する `arg` が返されるかは非決定的です。 `arg` と `max` の両方は [集約関数](/sql-reference/aggregate-functions/index.md) として動作し、両方とも処理中に `Null` を [スキップ](/sql-reference/aggregate-functions/index.md#null-processing)し、利用可能な場合は `Null` でない値を返します。

**構文**

```sql
argMax(arg, val)
```

**引数**

- `arg` — 引数。
- `val` — 値。

**返される値**

- 最大の `val` 値に対応する `arg` 値。

型: `arg` 型と一致します。

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
│ b            │      3 │ -- argMax = 'b' because it the first not Null value, max(b) is from another row!
└──────────────┴────────┘

SELECT argMax(tuple(a), b) FROM test;
┌─argMax(tuple(a), b)─┐
│ (NULL)              │ -- The a `Tuple` that contains only a `NULL` value is not `NULL`, so the aggregate functions won't skip that row because of that `NULL` value
└─────────────────────┘

SELECT (argMax((a, b), b) as t).1 argMaxA, t.2 argMaxB FROM test;
┌─argMaxA─┬─argMaxB─┐
│ ᴺᵁᴸᴸ    │       3 │ -- you can use Tuple and get both (all - tuple(*)) columns for the according max(b)
└─────────┴─────────┘

SELECT argMax(a, b), max(b) FROM test WHERE a IS NULL AND b IS NULL;
┌─argMax(a, b)─┬─max(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- All aggregated rows contains at least one `NULL` value because of the filter, so all rows are skipped, therefore the result will be `NULL`
└──────────────┴────────┘

SELECT argMax(a, (b,a)) FROM test;
┌─argMax(a, tuple(b, a))─┐
│ c                      │ -- There are two rows with b=2, `Tuple` in the `Max` allows to get not the first `arg`
└────────────────────────┘

SELECT argMax(a, tuple(b)) FROM test;
┌─argMax(a, tuple(b))─┐
│ b                   │ -- `Tuple` can be used in `Max` to not skip Nulls in `Max`
└─────────────────────┘
```

**参考**

- [Tuple](/sql-reference/data-types/tuple.md)
