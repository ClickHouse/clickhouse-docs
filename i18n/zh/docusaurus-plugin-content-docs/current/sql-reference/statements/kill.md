---
description: 'KILL 语句文档'
sidebar_label: 'KILL'
sidebar_position: 46
slug: /sql-reference/statements/kill
title: 'KILL 语句'
doc_type: 'reference'
---

KILL 语句有两种形式：一种用于终止查询，另一种用于终止变更（mutation）操作。



## KILL QUERY {#kill-query}

```sql
KILL QUERY [ON CLUSTER cluster]
  WHERE <where expression to SELECT FROM system.processes query>
  [SYNC|ASYNC|TEST]
  [FORMAT format]
```

尝试强制终止当前正在运行的查询。
要终止的查询通过 `KILL` 查询的 `WHERE` 子句中定义的条件从 system.processes 表中选择。

示例:

首先,您需要获取未完成查询的列表。以下 SQL 查询按运行时间从长到短的顺序返回这些查询:

从单个 ClickHouse 节点获取列表:

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

从 ClickHouse 集群获取列表:

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

终止查询:

```sql
-- 强制终止具有指定 query_id 的所有查询:
KILL QUERY WHERE query_id='2-857d-4a57-9ee0-327da5d60a90'

-- 同步终止由 'username' 运行的所有查询:
KILL QUERY WHERE user='username' SYNC
```

:::tip
如果您要在 ClickHouse Cloud 或自管理集群中终止查询,请务必使用 `ON CLUSTER [cluster-name]` 选项,以确保查询在所有副本上都被终止
:::

只读用户只能停止自己的查询。

默认情况下,使用异步版本 (`ASYNC`),不会等待查询停止的确认。

同步版本 (`SYNC`) 会等待所有查询停止,并在每个进程停止时显示相关信息。
响应包含 `kill_status` 列,该列可以取以下值:

1.  `finished` – 查询已成功终止。
2.  `waiting` – 发送终止信号后等待查询结束。
3.  其他值说明查询无法停止的原因。

测试查询 (`TEST`) 仅检查用户的权限并显示要停止的查询列表。


## KILL MUTATION {#kill-mutation}

长时间运行或未完成的 mutation 操作通常表明 ClickHouse 服务运行状况不佳。mutation 的异步特性可能导致其消耗系统的所有可用资源。您可能需要采取以下措施之一:

- 暂停所有新的 mutation、`INSERT` 和 `SELECT` 操作,并等待 mutation 队列完成。
- 或者通过发送 `KILL` 命令手动终止其中一些 mutation。

```sql
KILL MUTATION
  WHERE <where expression to SELECT FROM system.mutations query>
  [TEST]
  [FORMAT format]
```

尝试取消并移除当前正在执行的 [mutation](/sql-reference/statements/alter#mutations)。要取消的 mutation 从 [`system.mutations`](/operations/system-tables/mutations) 表中选择,使用 `KILL` 查询的 `WHERE` 子句指定的过滤条件。

测试查询(`TEST`)仅检查用户权限并显示要停止的 mutation 列表。

示例:

获取未完成 mutation 数量的 `count()`:

来自单个 ClickHouse 节点的 mutation 计数:

```sql
SELECT count(*)
FROM system.mutations
WHERE is_done = 0;
```

来自 ClickHouse 副本集群的 mutation 计数:

```sql
SELECT count(*)
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

查询未完成 mutation 的列表:

来自单个 ClickHouse 节点的 mutation 列表:

```sql
SELECT mutation_id, *
FROM system.mutations
WHERE is_done = 0;
```

来自 ClickHouse 集群的 mutation 列表:

```sql
SELECT mutation_id, *
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

根据需要终止 mutation:

```sql
-- 取消并移除单个表的所有 mutation:
KILL MUTATION WHERE database = 'default' AND table = 'table'

-- 取消特定的 mutation:
KILL MUTATION WHERE database = 'default' AND table = 'table' AND mutation_id = 'mutation_3.txt'
```

当 mutation 卡住且无法完成时(例如,mutation 查询中的某个函数在应用于表中数据时抛出异常),此查询非常有用。

mutation 已做出的更改不会回滚。

:::note
[system.mutations](/operations/system-tables/mutations) 表中的 `is_killed=1` 列(仅限 ClickHouse Cloud)并不一定意味着 mutation 已完全终结。mutation 可能会在较长时间内保持 `is_killed=1` 和 `is_done=0` 的状态。如果另一个长时间运行的 mutation 阻塞了已终止的 mutation,就会发生这种情况。这是正常现象。
:::
