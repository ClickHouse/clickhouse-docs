---
'description': '最小 `val` 値のために `arg` 値を計算します。複数の行が同じ `val` を持つ場合、どの関連する `arg` が返されるかは決定論的ではありません。'
'sidebar_position': 110
'slug': '/sql-reference/aggregate-functions/reference/argmin'
'title': 'argMin'
'doc_type': 'reference'
---


# argMin

最小の `val` 値に対する `arg` 値を計算します。`val` が最大で同値の行が複数存在する場合、どの関連する `arg` が返されるかは非決定的です。 `arg` と `min` の両方は、[集約関数](/sql-reference/aggregate-functions/index.md)として動作し、処理中に [`Null` をスキップ](/sql-reference/aggregate-functions/index.md#null-processing)し、利用可能な `Null` でない値がある場合は `Null` でない値を返します。

**構文**

```sql
argMin(arg, val)
```

**引数**

- `arg` — 引数。
- `val` — 値。

**返される値**

- 最小の `val` 値に対応する `arg` 値。

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
│ a            │      0 │ -- argMin = a because it the first not `NULL` value, min(b) is from another row!
└──────────────┴────────┘

SELECT argMin(tuple(a), b) FROM test;
┌─argMin(tuple(a), b)─┐
│ (NULL)              │ -- The a `Tuple` that contains only a `NULL` value is not `NULL`, so the aggregate functions won't skip that row because of that `NULL` value
└─────────────────────┘

SELECT (argMin((a, b), b) as t).1 argMinA, t.2 argMinB from test;
┌─argMinA─┬─argMinB─┐
│ ᴺᵁᴸᴸ    │       0 │ -- you can use `Tuple` and get both (all - tuple(*)) columns for the according max(b)
└─────────┴─────────┘

SELECT argMin(a, b), min(b) FROM test WHERE a IS NULL and b IS NULL;
┌─argMin(a, b)─┬─min(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- All aggregated rows contains at least one `NULL` value because of the filter, so all rows are skipped, therefore the result will be `NULL`
└──────────────┴────────┘

SELECT argMin(a, (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(a, tuple(b, a))─┬─min(tuple(b, a))─┐
│ d                      │ (NULL,NULL)      │ -- 'd' is the first not `NULL` value for the min
└────────────────────────┴──────────────────┘

SELECT argMin((a, b), (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(tuple(a, b), tuple(b, a))─┬─min(tuple(b, a))─┐
│ (NULL,NULL)                      │ (NULL,NULL)      │ -- argMin returns (NULL,NULL) here because `Tuple` allows to don't skip `NULL` and min(tuple(b, a)) in this case is minimal value for this dataset
└──────────────────────────────────┴──────────────────┘

SELECT argMin(a, tuple(b)) FROM test;
┌─argMin(a, tuple(b))─┐
│ d                   │ -- `Tuple` can be used in `min` to not skip rows with `NULL` values as b.
└─────────────────────┘
```

**関連項目**

- [タプル](/sql-reference/data-types/tuple.md)
