---
'description': '有关 KILL 的文档'
'sidebar_label': 'KILL'
'sidebar_position': 46
'slug': '/sql-reference/statements/kill'
'title': 'KILL 语句'
---

有两种类型的终止语句：终止查询和终止变更

## KILL QUERY {#kill-query}

```sql
KILL QUERY [ON CLUSTER cluster]
  WHERE <where expression to SELECT FROM system.processes query>
  [SYNC|ASYNC|TEST]
  [FORMAT format]
```

尝试强制终止当前正在运行的查询。
要终止的查询通过`KILL`查询的`WHERE`子句中定义的标准从system.processes表中选择。

示例：

首先，您需要获取未完成查询的列表。这个SQL查询根据运行时间最长的查询提供它们：

从单个ClickHouse节点获取列表：
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

从ClickHouse集群获取列表：
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
如果您在ClickHouse Cloud或自管理集群中终止查询，请确保使用```ON CLUSTER [cluster-name]```选项，以确保在所有副本上终止查询。
:::

只读用户只能停止他们自己的查询。

默认情况下，使用的是查询的异步版本（`ASYNC`），它不等待查询已停止的确认。

同步版本（`SYNC`）等待所有查询停止，并在每个进程停止时显示有关该进程的信息。
响应包含`kill_status`列，可以取以下值：

1.  `finished` – 查询已成功终止。
2.  `waiting` – 在给查询发送终止信号后，等待查询结束。
3.  其他值解释了为什么查询无法停止。

测试查询（`TEST`）仅检查用户的权限，并显示要停止的查询列表。

## KILL MUTATION {#kill-mutation}

长时间运行或未完成的变更通常表明ClickHouse服务运行不良。变更的异步特性可能导致它们消耗系统上所有可用资源。您可能需要：

- 暂停所有新的变更、`INSERT`和`SELECT`，并允许变更队列完成。
- 或者通过发送`KILL`命令手动终止某些变更。

```sql
KILL MUTATION
  WHERE <where expression to SELECT FROM system.mutations query>
  [TEST]
  [FORMAT format]
```

尝试取消和移除当前执行的[变更](/sql-reference/statements/alter#mutations)。要取消的变更通过`KILL`查询的`WHERE`子句中指定的过滤器从[`system.mutations`](/operations/system-tables/mutations)表中选择。

测试查询（`TEST`）仅检查用户的权限，并显示要停止的变更列表。

示例：

获取未完成变更的`count()`数量：

从单个ClickHouse节点获取的变更数量：
```sql
SELECT count(*)
FROM system.mutations
WHERE is_done = 0;
```

从ClickHouse副本集群获取的变更数量：
```sql
SELECT count(*)
FROM clusterAllReplicas('default', system.mutations)
WHERE is_done = 0;
```

查询未完成变更的列表：

从单个ClickHouse节点获取的变更列表：
```sql
SELECT mutation_id, *
FROM system.mutations
WHERE is_done = 0;
```

从ClickHouse集群获取的变更列表：
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

当某个变更卡住无法完成时，此查询非常有用（例如，如果变更查询中的某个函数在应用于表中包含的数据时抛出异常）。

变更所做的更改不会进行回滚。

:::note 
在[system.mutations](/operations/system-tables/mutations)表中，`is_killed=1`列（仅限ClickHouse Cloud）并不一定意味着变更已完全完成。变更可能保持在`is_killed=1`和`is_done=0`的状态中很长时间。这种情况可能发生，因为另一个长时间运行的变更正在阻塞被终止的变更。这是一种正常情况。
:::
