---
description: 'KILL 文档'
sidebar_label: 'KILL'
sidebar_position: 46
slug: /sql-reference/statements/kill
title: 'KILL 语句'
doc_type: 'reference'
---

有两种 KILL 语句：一种用于终止查询，另一种用于终止变更。

## KILL QUERY（终止查询） \{#kill-query\}

```sql
KILL QUERY [ON CLUSTER cluster]
  WHERE <where expression to SELECT FROM system.processes query>
  [SYNC|ASYNC|TEST]
  [FORMAT format]
```

尝试强制终止当前正在执行的查询。
需要终止的查询是根据 `KILL` 查询中 `WHERE` 子句定义的条件，从 system.processes 表中选取的。

示例：

首先，需要获取未完成查询的列表。以下 SQL 查询会按运行时间从长到短列出这些查询：

从单个 ClickHouse 节点上列出：

```sql
SELECT
  initial_query_id,
  query_id,
  formatReadableTimeDelta(elapsed) AS time_delta,
  query,
  *
  FROM system.processes
  WHERE query ILIKE 'SELECT%'
  ORDER BY time_delta DESC;
```

ClickHouse 集群中的列表：

```sql
SELECT
  initial_query_id,
  query_id,
  formatReadableTimeDelta(elapsed) AS time_delta,
  query,
  *
  FROM clusterAllReplicas(default, system.processes)
  WHERE query ILIKE 'SELECT%'
  ORDER BY time_delta DESC;
```

终止该查询：

```sql
-- Forcibly terminates all queries with the specified query_id:
KILL QUERY WHERE query_id='2-857d-4a57-9ee0-327da5d60a90'

-- Synchronously terminates all queries run by 'username':
KILL QUERY WHERE user='username' SYNC
```

:::tip
如果你要在 ClickHouse Cloud 或自管集群中终止查询，请务必使用 `ON CLUSTER [cluster-name]` 选项，以确保在所有副本上终止该查询。
:::

只读用户只能停止自己的查询。

默认情况下，使用的是查询的异步版本（`ASYNC`），它不会等待查询已停止的确认。

同步版本（`SYNC`）会等待所有查询停止，并在每个进程停止时显示相关信息。
响应中包含 `kill_status` 列，其可能取值如下：

1. `finished` – 查询已成功终止。
2. `waiting` – 在向查询发送终止信号后，正在等待该查询结束。
3. 其他值说明了为什么无法停止该查询。

测试查询（`TEST`）仅检查用户权限，并显示要停止的查询列表。

## KILL MUTATION \{#kill-mutation\}

存在长时间运行或未完成的 mutation 往往表明 ClickHouse 服务运行状况不佳。mutation 的异步特性可能导致其耗尽系统上的所有可用资源。你可能需要：

* 暂停所有新的 mutation、`INSERT` 和 `SELECT`，并让 mutation 队列执行完成。
* 或通过发送 `KILL` 命令手动终止其中部分 mutation。

```sql
KILL MUTATION
  WHERE <where expression to SELECT FROM system.mutations query>
  [TEST]
  [FORMAT format]
```

尝试取消并移除当前正在执行的 [mutation](/sql-reference/statements/alter#mutations)。要取消的 mutation 会通过在 [`system.mutations`](/operations/system-tables/mutations) 表中使用 `KILL` 查询的 `WHERE` 子句指定的过滤条件来选取。

测试查询（`TEST`）只检查用户权限并显示要停止的 mutation 列表。

示例：

获取未完成 mutation 的数量（使用 `count()`）：

统计单个 ClickHouse 节点上的 mutation 数量：

```sql
SELECT count(*)
FROM system.mutations
WHERE is_done = 0;
```

ClickHouse 副本集群中的变更操作次数：

```sql
SELECT count(*)
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

查询未完成的 mutation 列表：

来自单个 ClickHouse 节点的 mutation 列表：

```sql
SELECT mutation_id, *
FROM system.mutations
WHERE is_done = 0;
```

ClickHouse 集群中的变更列表：

```sql
SELECT mutation_id, *
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

按需终止这些 mutation：

```sql
-- Cancel and remove all mutations of the single table:
KILL MUTATION WHERE database = 'default' AND table = 'table'

-- Cancel the specific mutation:
KILL MUTATION WHERE database = 'default' AND table = 'table' AND mutation_id = 'mutation_3.txt'
```

当某个 mutation 卡住且无法完成时，此查询会很有用（例如，在对表中数据执行 mutation 查询时，某个函数在应用到数据时抛出了异常）。

mutation 已经做出的更改不会被回滚。

:::note
在 [system.mutations](/operations/system-tables/mutations) 表中，`is_killed` 列为 `1`（仅适用于 ClickHouse Cloud）并不一定意味着该 mutation 已经完全结束。一个 mutation 可能会在 `is_killed=1` 且 `is_done=0` 的状态下保持较长时间。如果有另一个长时间运行的 mutation 阻塞了已被终止的 mutation，就会出现这种情况。这是一种正常现象。
:::
