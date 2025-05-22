有两种类型的终止语句：终止查询和终止变更

## KILL QUERY {#kill-query}

```sql
KILL QUERY [ON CLUSTER cluster]
  WHERE <where expression to SELECT FROM system.processes query>
  [SYNC|ASYNC|TEST]
  [FORMAT format]
```

尝试强制终止当前正在运行的查询。
要终止的查询是根据 `KILL` 查询的 `WHERE` 子句中定义的标准，从 system.processes 表中选择的。

示例：

首先，您需要获取未完成查询的列表。此 SQL 查询根据运行时间最长的条件提供这些查询：

来自单个 ClickHouse 节点的列表：
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

来自 ClickHouse 集群的列表：
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

终止查询：
```sql
-- Forcibly terminates all queries with the specified query_id:
KILL QUERY WHERE query_id='2-857d-4a57-9ee0-327da5d60a90'

-- Synchronously terminates all queries run by 'username':
KILL QUERY WHERE user='username' SYNC
```

:::tip 
如果您在 ClickHouse Cloud 或自管理集群中终止查询，请确保使用 ```ON CLUSTER [cluster-name]``` 选项，以确保在所有副本上终止查询。
:::

只读用户只能停止他们自己的查询。

默认情况下，使用查询的异步版本（`ASYNC`），它不等待查询停止的确认。

同步版本（`SYNC`）会等待所有查询停止，并在每个进程停止时显示信息。
响应包含 `kill_status` 列，该列可以采用以下值：

1.  `finished` – 查询已成功终止。
2.  `waiting` – 在发送终止信号后等待查询结束。
3.  其他值解释了查询无法停止的原因。

测试查询（`TEST`）只检查用户的权限，并显示待停止的查询列表。

## KILL MUTATION {#kill-mutation}

长时间运行或未完成的变更通常表明 ClickHouse 服务运行不佳。变更的异步特性可能会导致其消耗系统上所有可用资源。您可能需要：

- 暂停所有新变更、`INSERT` 和 `SELECT`，并允许变更队列完成。
- 或者通过发送 `KILL` 命令手动终止其中一些变更。

```sql
KILL MUTATION
  WHERE <where expression to SELECT FROM system.mutations query>
  [TEST]
  [FORMAT format]
```

尝试取消和移除当前正在执行的 [变更](/sql-reference/statements/alter#mutations)。要取消的变更是从 [`system.mutations`](/operations/system-tables/mutations) 表中根据 `KILL` 查询的 `WHERE` 子句指定的过滤器进行选择的。

测试查询（`TEST`）只检查用户的权限，并显示待停止的变更列表。

示例：

获取未完成变更的 `count()` 数量：

来自单个 ClickHouse 节点的变更计数：
```sql
SELECT count(*)
FROM system.mutations
WHERE is_done = 0;
```

来自 ClickHouse 副本集群的变更计数：
```sql
SELECT count(*)
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

查询未完成变更的列表：

来自单个 ClickHouse 节点的变更列表：
```sql
SELECT mutation_id, *
FROM system.mutations
WHERE is_done = 0;
```

来自 ClickHouse 集群的变更列表：
```sql
SELECT mutation_id, *
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

根据需要终止变更：
```sql
-- Cancel and remove all mutations of the single table:
KILL MUTATION WHERE database = 'default' AND table = 'table'

-- Cancel the specific mutation:
KILL MUTATION WHERE database = 'default' AND table = 'table' AND mutation_id = 'mutation_3.txt'
```

当变更被卡住且无法完成时（例如，如果在应用于表中包含的数据时变更查询中的某个函数抛出异常），该查询非常有用。

变更已做的更改不会被回滚。

:::note 
在 [system.mutations](/operations/system-tables/mutations) 表中的 `is_killed=1` 列（仅 ClickHouse Cloud）不一定意味着变更已经完全完成。如果另一个长时间运行的变更阻塞了已终止的变更，可能会出现变更保持在 `is_killed=1` 和 `is_done=0` 状态的情况。这是一种正常情况。
:::
