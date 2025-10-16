---
'slug': '/guides/developer/on-the-fly-mutations'
'sidebar_label': '动态变更'
'title': '动态变更'
'keywords':
- 'On-the-fly mutation'
'description': '提供动态变更的描述'
'doc_type': 'guide'
---

## 实时突变 {#on-the-fly-mutations}

当实时突变启用时，更新的行会立即标记为已更新，后续的 `SELECT` 查询将自动返回更改后的值。当实时突变未启用时，您可能需要等待后台进程应用突变才能查看更改的值。

可以通过启用查询级设置 `apply_mutations_on_fly` 来为 `MergeTree` 家族表启用实时突变。

```sql
SET apply_mutations_on_fly = 1;
```

## 示例 {#example}

让我们创建一个表并运行一些突变：
```sql
CREATE TABLE test_on_fly_mutations (id UInt64, v String)
ENGINE = MergeTree ORDER BY id;

-- Disable background materialization of mutations to showcase
-- default behavior when on-the-fly mutations are not enabled
SYSTEM STOP MERGES test_on_fly_mutations;
SET mutations_sync = 0;

-- Insert some rows in our new table
INSERT INTO test_on_fly_mutations VALUES (1, 'a'), (2, 'b'), (3, 'c');

-- Update the values of the rows
ALTER TABLE test_on_fly_mutations UPDATE v = 'd' WHERE id = 1;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'd';
ALTER TABLE test_on_fly_mutations UPDATE v = 'e' WHERE id = 2;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'e';
```

现在让我们通过 `SELECT` 查询检查更新的结果：

```sql
-- Explicitly disable on-the-fly-mutations
SET apply_mutations_on_fly = 0;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

请注意，当我们查询新表时，行的值尚未更新：

```response
┌─id─┬─v─┐
│  1 │ a │
│  2 │ b │
│  3 │ c │
└────┴───┘
```

现在让我们看看启用实时突变时会发生什么：

```sql
-- Enable on-the-fly mutations
SET apply_mutations_on_fly = 1;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

`SELECT` 查询现在立即返回正确的结果，无需等待突变应用：

```response
┌─id─┬─v─┐
│  3 │ c │
└────┴───┘
```

## 性能影响 {#performance-impact}

当实时突变启用时，突变不会立即物化，而是在 `SELECT` 查询期间才会应用。然而，请注意，突变仍在后台异步物化，这是一项繁重的过程。

如果提交的突变数量持续超过在某个时间间隔内处理的突变数量，则未物化的突变队列将不断增长。这将导致 `SELECT` 查询性能的最终下降。

我们建议同时启用设置 `apply_mutations_on_fly` 和其他 `MergeTree` 级别的设置，如 `number_of_mutations_to_throw` 和 `number_of_mutations_to_delay`，以限制未物化突变的无限增长。

## 对子查询和非确定性函数的支持 {#support-for-subqueries-and-non-deterministic-functions}

实时突变对子查询和非确定性函数的支持有限。仅支持具有合理大小结果的标量子查询（由设置 `mutations_max_literal_size_to_replace` 控制）。仅支持常量非确定性函数（例如，函数 `now()`）。

这些行为由以下设置控制：

- `mutations_execute_nondeterministic_on_initiator` - 如果为真，非确定性函数将在发起副本上执行，并在 `UPDATE` 和 `DELETE` 查询中替换为字面量。默认值：`false`。
- `mutations_execute_subqueries_on_initiator` - 如果为真，标量子查询将在发起副本上执行，并在 `UPDATE` 和 `DELETE` 查询中替换为字面量。默认值：`false`。
- `mutations_max_literal_size_to_replace` - 要在 `UPDATE` 和 `DELETE` 查询中替换的序列化字面量的最大大小（以字节为单位）。默认值：`16384` (16 KiB)。
