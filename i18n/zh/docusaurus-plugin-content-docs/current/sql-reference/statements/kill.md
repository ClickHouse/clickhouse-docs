---
slug: /sql-reference/statements/kill
sidebar_position: 46
sidebar_label: KILL
title: "KILL 语句"
---

有两种类型的 kill 语句：终止查询和终止变更

## KILL QUERY {#kill-query}

``` sql
KILL QUERY [ON CLUSTER cluster]
  WHERE <where expression to SELECT FROM system.processes query>
  [SYNC|ASYNC|TEST]
  [FORMAT format]
```

该命令尝试强制终止当前正在运行的查询。
要终止的查询是通过 `KILL` 查询的 `WHERE` 子句中定义的标准，从 `system.processes` 表中选择的。

示例：

首先，您需要获取未完成查询的列表。此 SQL 查询根据运行时间最长的查询提供它们：

从单个 ClickHouse 节点获取列表：
``` sql
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

从 ClickHouse 集群获取列表：
``` sql
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

终止查询：
``` sql
-- 强制终止所有具有指定 query_id 的查询：
KILL QUERY WHERE query_id='2-857d-4a57-9ee0-327da5d60a90'

-- 同步终止所有由 'username' 运行的查询：
KILL QUERY WHERE user='username' SYNC
```

:::tip 
如果您在 ClickHouse Cloud 或自管理集群中终止查询，请确保使用 `ON CLUSTER [cluster-name]` 选项，以确保查询在所有副本上都被终止。
:::

只读用户只能停止自己的查询。

默认情况下，使用异步版本的查询（`ASYNC`），它不等待确认查询已停止。

同步版本（`SYNC`）会等待所有查询停止，并在每个进程停止时显示相关信息。
响应包含 `kill_status` 列，可以取以下值：

1.  `finished` – 查询成功终止。
2.  `waiting` – 在发送终止信号后等待查询结束。
3.  其他值解释了查询无法停止的原因。

测试查询（`TEST`）仅检查用户的权限，并显示一份要停止的查询列表。

## KILL MUTATION {#kill-mutation}

长时间运行或未完成的变更通常表明 ClickHouse 服务运行不良。变更的异步特性可能导致它们占用系统上所有可用资源。您可能需要选择：

- 暂停所有新的变更、`INSERT` 和 `SELECT`，并允许变更队列完成。
- 或者通过发送 `KILL` 命令手动终止其中的一些变更。

``` sql
KILL MUTATION
  WHERE <where expression to SELECT FROM system.mutations query>
  [TEST]
  [FORMAT format]
```

尝试取消和移除当前正在执行的 [变更](/sql-reference/statements/alter#mutations)。要取消的变更是通过 `KILL` 查询的 `WHERE` 子句中指定的过滤器，从 [`system.mutations`](/operations/system-tables/mutations) 表中选择的。

测试查询（`TEST`）仅检查用户的权限，并显示一份要停止的变更列表。

示例：

获取未完成变更的 `count()`：

从单个 ClickHouse 节点获取变更计数：
``` sql
SELECT count(*)
FROM system.mutations
WHERE is_done = 0;
```

从 ClickHouse 集群获取变更计数：
``` sql
SELECT count(*)
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

查询未完成变更的列表：

从单个 ClickHouse 节点获取变更列表：
``` sql
SELECT mutation_id, *
FROM system.mutations
WHERE is_done = 0;
```

从 ClickHouse 集群获取变更列表：
``` sql
SELECT mutation_id, *
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

根据需要终止变更：
``` sql
-- 取消并移除单表的所有变更：
KILL MUTATION WHERE database = 'default' AND table = 'table'

-- 取消特定的变更：
KILL MUTATION WHERE database = 'default' AND table = 'table' AND mutation_id = 'mutation_3.txt'
```

当变更卡住并无法完成时（例如，如果变更查询中的某个函数在应用于表中数据时抛出异常），该查询非常有用。

已经由变更进行的更改不会被回滚。

:::note 
`is_killed=1` 列（仅适用于 ClickHouse Cloud）在 [system.mutations](/operations/system-tables/mutations) 表中并不一定意味着变更已经完全完成。变更可能会保持在 `is_killed=1` 和 `is_done=0` 的状态下持续一段时间。这可能发生在另一个长时间运行的变更阻塞了被终止的变更时。这是一种正常情况。
:::
