---
'description': '计算最大 `val` 值的 `arg` 值。'
'sidebar_position': 109
'slug': '/sql-reference/aggregate-functions/reference/argmax'
'title': 'argMax'
'doc_type': 'reference'
---


# argMax

计算最大 `val` 值的 `arg` 值。如果有多行具有相等的最大 `val`，则返回的相关 `arg` 不具备确定性。两个部分 `arg` 和 `max` 都作为 [聚合函数](/sql-reference/aggregate-functions/index.md) 行为，它们在处理过程中都 [跳过 `Null`](/sql-reference/aggregate-functions/index.md#null-processing)，并在有可用的非 `Null` 值时返回非 `Null` 值。

**语法**

```sql
argMax(arg, val)
```

**参数**

- `arg` — 参数。
- `val` — 值。

**返回值**

- 与最大 `val` 值相对应的 `arg` 值。

类型：与 `arg` 类型匹配。

**示例**

输入表：

```text
┌─user─────┬─salary─┐
│ director │   5000 │
│ manager  │   3000 │
│ worker   │   1000 │
└──────────┴────────┘
```

查询：

```sql
SELECT argMax(user, salary) FROM salary;
```

结果：

```text
┌─argMax(user, salary)─┐
│ director             │
└──────────────────────┘
```

**扩展示例**

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

**另见**

- [元组](/sql-reference/data-types/tuple.md)
