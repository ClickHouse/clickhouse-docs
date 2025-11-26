---
slug: /guides/developer/on-the-fly-mutations
sidebar_label: '实时变更'
title: '实时变更'
keywords: ['实时变更']
description: '介绍实时变更'
doc_type: 'guide'
---



## 实时变更

当启用实时变更时，被更新的行会立即被标记为已更新，之后的 `SELECT` 查询会自动返回已更改的值。当未启用实时变更时，你可能需要等待后台进程应用这些变更后，才能看到更新后的值。

通过启用查询级别设置 `apply_mutations_on_fly`，可以为 `MergeTree` 系列表启用实时变更。

```sql
SET apply_mutations_on_fly = 1;
```


## 示例

让我们创建一张表并执行一些变更操作（mutation）：

```sql
CREATE TABLE test_on_fly_mutations (id UInt64, v String)
ENGINE = MergeTree ORDER BY id;

-- 禁用后台 mutation 物化以演示
-- 未启用即时 mutation 时的默认行为
SYSTEM STOP MERGES test_on_fly_mutations;
SET mutations_sync = 0;

-- 向新表中插入若干行数据
INSERT INTO test_on_fly_mutations VALUES (1, 'a'), (2, 'b'), (3, 'c');

-- 更新行中的值
ALTER TABLE test_on_fly_mutations UPDATE v = 'd' WHERE id = 1;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'd';
ALTER TABLE test_on_fly_mutations UPDATE v = 'e' WHERE id = 2;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'e';
```

让我们通过执行一条 `SELECT` 查询来检查更新的结果：

```sql
-- 显式禁用即时变更
SET apply_mutations_on_fly = 0;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

请注意，当我们查询新表时，其中各行的值尚未更新：

```response
┌─id─┬─v─┐
│  1 │ a │
│  2 │ b │
│  3 │ c │
└────┴───┘
```

现在来看一下启用即时变更后会发生什么：

```sql
-- 启用即时变更
SET apply_mutations_on_fly = 1;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

`SELECT` 查询现在会立即返回正确结果，而无需等待变更应用完成：

```response
┌─id─┬─v─┐
│  3 │ c │
└────┴───┘
```


## 性能影响 {#performance-impact}

当启用实时应用变更（on-the-fly mutations）时，变更不会被立即物化，而只会在执行 `SELECT` 查询时才会被应用。不过，请注意，变更仍会在后台以异步方式进行物化，而这是一个开销较大的过程。

如果在某段时间内，提交的变更数量持续超过后台能够处理的变更数量，那么需要被应用的“未物化变更”队列会不断增长。这将最终导致 `SELECT` 查询性能下降。

我们建议在启用 `apply_mutations_on_fly` 设置的同时，配合使用其他 `MergeTree` 级别的设置，例如 `number_of_mutations_to_throw` 和 `number_of_mutations_to_delay`，以限制未物化变更的无限增长。



## 对子查询和非确定性函数的支持 {#support-for-subqueries-and-non-deterministic-functions}

即时变更（on-the-fly mutations）对子查询和非确定性函数的支持是有限的。仅支持结果大小在合理范围内的标量子查询（由设置 `mutations_max_literal_size_to_replace` 控制）。仅支持常量型非确定性函数（例如函数 `now()`）。

这些行为由以下设置控制：

- `mutations_execute_nondeterministic_on_initiator` - 若为 true，则在发起者副本上执行非确定性函数，并在 `UPDATE` 和 `DELETE` 查询中将其替换为字面量。默认值：`false`。
- `mutations_execute_subqueries_on_initiator` - 若为 true，则在发起者副本上执行标量子查询，并在 `UPDATE` 和 `DELETE` 查询中将其替换为字面量。默认值：`false`。
- `mutations_max_literal_size_to_replace` - 在 `UPDATE` 和 `DELETE` 查询中可被替换的序列化字面量的最大大小（字节）。默认值：`16384`（16 KiB）。
