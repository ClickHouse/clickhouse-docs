---
'description': 'Kill的文档'
'sidebar_label': '终止'
'sidebar_position': 46
'slug': '/sql-reference/statements/kill'
'title': 'Kill语句'
---



有两种类型的 KILL 语句：用于终止查询和用于终止变更。

## KILL QUERY {#kill-query}

```sql
KILL QUERY [ON CLUSTER cluster]
  WHERE <where expression to SELECT FROM system.processes query>
  [SYNC|ASYNC|TEST]
  [FORMAT format]
```

尝试强制终止当前正在运行的查询。要终止的查询是从 system.processes 表中根据 `KILL` 查询的 `WHERE` 子句中定义的条件进行选择的。

示例：

首先，您需要获取未完成查询的列表。以下 SQL 查询根据运行时间最长的查询提供这些信息：

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
如果您在 ClickHouse Cloud 或自管理集群中终止查询，请确保使用 ```ON CLUSTER [cluster-name]``` 选项，以确保查询在所有副本上被终止。
:::

只读用户只能停止自己的查询。

默认情况下，使用查询的异步版本 (`ASYNC`)，它不等待确认查询已停止。

同步版本 (`SYNC`) 等待所有查询停止，并在每个进程停止时显示相关信息。响应包含 `kill_status` 列，该列可以取以下值：

1.  `finished` – 查询已成功终止。
2.  `waiting` – 在发送终止信号后，等待查询结束。
3.  其他值说明了为什么查询无法被停止。

测试查询 (`TEST`) 仅检查用户的权限并显示待停止查询的列表。

## KILL MUTATION {#kill-mutation}

长时间运行或未完成的变更往往表明 ClickHouse 服务运行不佳。变更的异步特性可能会使其消耗系统上的所有可用资源。您可能需要：

- 暂停所有新的变更、 `INSERT` 和 `SELECT`，并允许变更队列完成。
- 或通过发送 `KILL` 命令手动终止其中的一些变更。

```sql
KILL MUTATION
  WHERE <where expression to SELECT FROM system.mutations query>
  [TEST]
  [FORMAT format]
```

尝试取消并移除当前正在执行的 [mutations](/sql-reference/statements/alter#mutations)。要取消的变更是从 [`system.mutations`](/operations/system-tables/mutations) 表中根据 `KILL` 查询的 `WHERE` 子句中指定的过滤条件进行选择的。

测试查询 (`TEST`) 仅检查用户的权限并显示待停止变更的列表。

示例：

获取未完成变更的 `count()`：

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

当变更被卡住且无法完成时，此查询非常有用（例如，如果变更查询中的某些函数在应用于表中包含的数据时抛出异常）。

变更已做的更改不会被回滚。

:::note 
`is_killed=1` 列（仅 ClickHouse Cloud）在 [system.mutations](/operations/system-tables/mutations) 表中并不一定意味着变更已完全完成。变更可能会保持在 `is_killed=1` 和 `is_done=0` 的状态，持续一段时间。这可能发生在另一个长时间运行的变更阻塞了被终止的变更。这是一种正常情况。
:::
