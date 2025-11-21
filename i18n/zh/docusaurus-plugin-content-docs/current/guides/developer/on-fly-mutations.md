---
slug: /guides/developer/on-the-fly-mutations
sidebar_label: '在线变更'
title: '在线变更'
keywords: ['在线变更']
description: '介绍在线变更机制'
doc_type: 'guide'
---



## 即时变更 {#on-the-fly-mutations}

启用即时变更后,更新的行会立即标记为已更新,后续的 `SELECT` 查询将自动返回变更后的值。未启用即时变更时,您需要等待变更通过后台进程应用完成后才能看到变更后的值。

通过启用查询级设置 `apply_mutations_on_fly`,可以为 `MergeTree` 系列表启用即时变更。

```sql
SET apply_mutations_on_fly = 1;
```


## 示例 {#example}

让我们创建一个表并运行一些 mutation 操作:

```sql
CREATE TABLE test_on_fly_mutations (id UInt64, v String)
ENGINE = MergeTree ORDER BY id;

-- 禁用 mutation 的后台物化以演示
-- 未启用即时 mutation 时的默认行为
SYSTEM STOP MERGES test_on_fly_mutations;
SET mutations_sync = 0;

-- 在新表中插入一些行
INSERT INTO test_on_fly_mutations VALUES (1, 'a'), (2, 'b'), (3, 'c');

-- 更新行的值
ALTER TABLE test_on_fly_mutations UPDATE v = 'd' WHERE id = 1;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'd';
ALTER TABLE test_on_fly_mutations UPDATE v = 'e' WHERE id = 2;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'e';
```

让我们通过 `SELECT` 查询来检查更新结果:

```sql
-- 显式禁用即时 mutation
SET apply_mutations_on_fly = 0;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

注意,当我们查询新表时,行的值尚未更新:

```response
┌─id─┬─v─┐
│  1 │ a │
│  2 │ b │
│  3 │ c │
└────┴───┘
```

现在让我们看看启用即时 mutation 时会发生什么:

```sql
-- 启用即时 mutation
SET apply_mutations_on_fly = 1;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

`SELECT` 查询现在立即返回正确的结果,无需等待 mutation 应用完成:

```response
┌─id─┬─v─┐
│  3 │ c │
└────┴───┘
```


## 性能影响 {#performance-impact}

启用即时变更(on-the-fly mutations)后,变更不会立即物化,而是仅在执行 `SELECT` 查询时应用。但请注意,变更仍会在后台异步物化,这是一个资源密集型的过程。

如果在某个时间段内,提交的变更数量持续超过后台处理的变更数量,待应用的未物化变更队列将持续增长。这最终会导致 `SELECT` 查询性能下降。

建议将 `apply_mutations_on_fly` 设置与其他 `MergeTree` 级别的设置(如 `number_of_mutations_to_throw` 和 `number_of_mutations_to_delay`)配合使用,以限制未物化变更的无限增长。


## 对子查询和非确定性函数的支持 {#support-for-subqueries-and-non-deterministic-functions}

即时变更对子查询和非确定性函数的支持有限。仅支持结果大小合理的标量子查询(由设置 `mutations_max_literal_size_to_replace` 控制)。仅支持常量非确定性函数(例如函数 `now()`)。

这些行为由以下设置控制:

- `mutations_execute_nondeterministic_on_initiator` - 如果为 true,非确定性函数将在发起副本上执行,并在 `UPDATE` 和 `DELETE` 查询中替换为字面量。默认值:`false`。
- `mutations_execute_subqueries_on_initiator` - 如果为 true,标量子查询将在发起副本上执行,并在 `UPDATE` 和 `DELETE` 查询中替换为字面量。默认值:`false`。
- `mutations_max_literal_size_to_replace` - 在 `UPDATE` 和 `DELETE` 查询中要替换的序列化字面量的最大字节大小。默认值:`16384`(16 KiB)。
