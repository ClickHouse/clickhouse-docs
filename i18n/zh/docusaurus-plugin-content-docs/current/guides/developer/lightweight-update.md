---
slug: /guides/developer/lightweight-update
sidebar_label: 轻量级更新
title: 轻量级更新
keywords: ['轻量级更新']
---

## 轻量级更新 {#lightweight-update}

当启用轻量级更新时，更新的行会立即标记为已更新，随后的 `SELECT` 查询将自动返回更改的值。当未启用轻量级更新时，您可能需要等待后台进程应用您的变更才能看到更改的值。

通过启用查询级设置 `apply_mutations_on_fly`，可以为 `MergeTree` 家族表启用轻量级更新。

```sql
SET apply_mutations_on_fly = 1;
```

## 示例 {#example}

让我们创建一个表并运行一些变更：
```sql
CREATE TABLE test_on_fly_mutations (id UInt64, v String)
ENGINE = MergeTree ORDER BY id;

-- 禁用变更的后台物化以展示
-- 当未启用轻量级更新时的默认行为
SYSTEM STOP MERGES test_on_fly_mutations;
SET mutations_sync = 0;

-- 在我们的新表中插入一些行
INSERT INTO test_on_fly_mutations VALUES (1, 'a'), (2, 'b'), (3, 'c');

-- 更新行的值
ALTER TABLE test_on_fly_mutations UPDATE v = 'd' WHERE id = 1;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'd';
ALTER TABLE test_on_fly_mutations UPDATE v = 'e' WHERE id = 2;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'e';
```

让我们通过 `SELECT` 查询检查更新的结果：
```sql
-- 显式禁用轻量级更新
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

现在，让我们看看启用轻量级更新时会发生什么：

```sql
-- 启用轻量级更新
SET apply_mutations_on_fly = 1;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

`SELECT` 查询现在立即返回正确的结果，而无需等待变更的应用：

```response
┌─id─┬─v─┐
│  3 │ c │
└────┴───┘
```

## 性能影响 {#performance-impact}

当启用轻量级更新时，变更不会立即物化，而只会在 `SELECT` 查询期间应用。然而，请注意，变更仍会在后台异步物化，这是一个重型过程。

如果提交的变更数量持续超过在某个时间间隔内在后台处理的变更数量，则必须应用的未物化变更的队列将不断增长。这将导致 `SELECT` 查询性能最终下降。

我们建议启用 `apply_mutations_on_fly` 设置，并结合其他 `MergeTree` 级设置，例如 `number_of_mutations_to_throw` 和 `number_of_mutations_to_delay`，以限制未物化变更的无限增长。

## 对子查询和非确定性函数的支持 {#support-for-subqueries-and-non-deterministic-functions}

轻量级更新对子查询和非确定性函数的支持有限。仅支持结果合理大小的标量子查询（由设置 `mutations_max_literal_size_to_replace` 控制）。仅支持常量非确定性函数（例如函数 `now()`）。

这些行为由以下设置控制：

- `mutations_execute_nondeterministic_on_initiator` - 如果为 true，非确定性函数将在发起副本上执行，并在 `UPDATE` 和 `DELETE` 查询中替换为字面量。默认值：`false`。
- `mutations_execute_subqueries_on_initiator` - 如果为 true，标量子查询将在发起副本上执行，并在 `UPDATE` 和 `DELETE` 查询中替换为字面量。默认值：`false`。
- `mutations_max_literal_size_to_replace` - 在 `UPDATE` 和 `DELETE` 查询中替换的字面量的最大序列化大小（以字节为单位）。默认值：`16384`（16 KiB）。
