---
sidebar_label: '故障排查与最佳实践'
slug: /integrations/fivetran/troubleshooting
sidebar_position: 4
description: 'Fivetran ClickHouse 目标端的常见错误、调试技巧和最佳实践。'
title: '故障排查与最佳实践'
doc_type: 'guide'
keywords: ['fivetran', 'clickhouse destination', '故障排查', '最佳实践', '调试']
---

# 故障排查与最佳实践 \{#troubleshooting-best-practices\}

## 常见错误 \{#common-errors\}

### 授权测试失败，或因权限问题导致相关操作失败 \{#grants-test-failed\}

**错误信息：**

```sh
Test grants failed, cause: user is missing the required grants on *.*: ALTER, CREATE DATABASE, CREATE TABLE, INSERT, SELECT
```

**原因：** Fivetran 用户没有所需的特权。该连接器要求在 `*.*` (所有数据库和表) 上授予 `ALTER`、`CREATE DATABASE`、`CREATE TABLE`、`INSERT` 和 `SELECT`。

:::note
授权检查会查询 `system.grants`，且只匹配直接授予用户的授权。通过 ClickHouse 角色分配的特权无法被检测到。更多详情请参阅[基于角色的授权](/integrations/fivetran/troubleshooting#role-based-grants)部分。
:::

**解决方案：**

将所需特权直接授予 Fivetran 用户：

```sql
GRANT CURRENT GRANTS ON *.* TO fivetran_user;
```

### 等待所有 mutation 完成时发生错误 \{#mutations-not-completed\}

**错误信息：**

```sh
error while waiting for all mutations to be completed: ... initial cause: ...
```

**原因：** 已提交 `ALTER TABLE ... UPDATE` 或 `ALTER TABLE ... DELETE` mutation，但连接器在等待该 mutation 在所有副本上完成时超时。错误中的“初始原因”部分通常包含原始的 ClickHouse 错误 (通常是代码 341，即“Unfinished”) 。

这可能发生在以下情况下：

* ClickHouse Cloud 集群负载过重。
* 一个或多个节点在执行 mutation 期间宕机。

**解决方案：**

1. **检查 mutation 进度**：运行以下查询，检查是否存在待处理的 mutation：
   ```sql
   SELECT database, table, mutation_id, command, create_time, is_done
   FROM system.mutations
   WHERE NOT is_done
   ORDER BY create_time DESC;
   ```
2. **检查集群健康状况**：确保所有节点均正常。
3. **等待并再试行**：集群恢复健康后，mutation 最终会完成。Fivetran 会自动再次试行同步。

### 列不匹配错误 \{#column-mismatch-error\}

**错误信息：**

如果列不匹配是由源端 schema 发生变化导致的，可能会出现不同的错误。例如：

```sh
columns count in ClickHouse table (8) does not match the input file (6). Expected columns: id, name, ..., got: id, name, ...
```

或：

```sh
column user_email was not found in the table definition. Table columns: ...; input file columns: ...
```

**原因：**ClickHouse 目标表中的列与正在同步的数据列不一致。出现这种情况通常是因为：

* 有人手动向 ClickHouse 表中添加或删除了列。
* 源端的 schema 修改未被正确传递。

**解决方案：**

1. **请勿手动修改由 Fivetran 管理的表。**参见[最佳实践](/integrations/fivetran/troubleshooting#dont-modify-tables)。
2. **将列修改回去**：如果你清楚该列应使用哪种类型，请参考[类型转换对照](/integrations/fivetran/reference#type-mapping)，将该列修改回预期类型。
3. **重新同步该表**：在 Fivetran 仪表板中，为受影响的表触发一次历史重新同步。
4. **删除并重新创建**：作为最后的手段，删除目标表，让 Fivetran 在下一次同步时重新创建该表。

### AST 过于庞大 (代码 168) \{#ast-too-big\}

**错误信息：**

```sh
code: 168, message: AST is too big. Maximum: 50000
```

或

```sh
code: 62, message: Max query size exceeded
```

**原因：** 大批次的 UPDATE 或 DELETE 操作会生成抽象语法树非常复杂的 SQL 语句。这种情况在宽表或启用历史模式时很常见。

**解决方案：**

在[进阶配置](/integrations/fivetran/reference#advanced-configuration)文件中调低 `mutation_batch_size` 和 `hard_delete_batch_size`。两者的默认值均为 `1500`，可接受的取值范围为 `200` 到 `1500`。

***

### 内存超限 / OOM (代码 241) \{#memory-limit-exceeded\}

**错误信息：**

```sh
code: 241, message: (total) memory limit exceeded: would use 14.01 GiB
```

**原因：** `INSERT` 操作所需内存超过了可用内存。通常发生在大规模初始同步、Wide 表或并发批次操作期间。

**解决方案：**

1. **降低 `write_batch_size`**：对于大型表，尝试将其调低到 50,000。
2. **降低数据库负载**：检查 ClickHouse Cloud 服务的负载情况，确认是否过载。
3. **扩容 ClickHouse Cloud 服务** 以提供更多内存。

***

### 意外 EOF / 连接错误 \{#unexpected-eof\}

**错误消息：**

```sh
ClickHouse connection error: unexpected EOF
```

或者在 Fivetran 日志中出现没有堆栈跟踪的 `FAILURE_WITH_TASK`。

**原因：**

* IP 访问列表未配置为允许 Fivetran 的流量。
* Fivetran 与 ClickHouse Cloud 之间出现暂时性的网络问题。
* 损坏或无效的源数据导致目标连接器崩溃。

**解决方案：**

1. **检查 IP 访问列表**：在 ClickHouse Cloud 中，前往 **设置 &gt; 安全**，添加 [Fivetran IP addresses](https://fivetran.com/docs/using-fivetran/ips)，或允许任意来源访问。
2. **重试**：较新的连接器版本会自动重试 EOF 错误。偶发错误 (每天 1–2 次) 通常属于暂时性问题。
3. **如果问题持续存在**：向 ClickHouse 提交支持工单，并提供错误发生的时间范围。同时联系 Fivetran 支持团队，协助排查源数据质量问题。

***

### 无法映射 UInt64 类型 \{#uint64-type-error\}

**错误信息：**

```sh
cause: can't map type UInt64 to Fivetran types
```

**原因：** 该连接器会将 `LONG` 映射为 `Int64`，不会映射为 `UInt64`。当在由 Fivetran 管理的表中手动更改列类型时，就会出现此错误。

**解决方案：**

1. **不要手动修改列类型**，尤其不要修改由 Fivetran 管理的表中的列类型。
2. **如需恢复**：将该列改回预期类型 (例如 `Int64`) ，或者删除该表并重新同步。
3. **对于自定义类型**：可在由 Fivetran 管理的表上创建 [materialized view](/sql-reference/statements/create/view#materialized-view)。

***

### 表没有主键 \{#no-primary-keys\}

**错误信息：**

```sh
Failed to alter table ... cause: no primary keys for table
```

**原因：**每个 ClickHouse 表都需要定义 `ORDER BY`。当源端没有主键时，Fivetran 会自动添加 `_fivetran_id`。如果源端定义了主键，但数据中不包含该主键，就可能在某些边缘情况下出现此错误。

**解决方案：**

1. **联系 Fivetran 支持团队**，排查源管道。
2. **检查源 schema**：确保数据中包含主键列。

***

### 基于角色的授权失败 \{#role-based-grants\}

**错误信息：**

```sh
user is missing the required grants on *.*: ALTER, CREATE DATABASE, CREATE TABLE, INSERT, SELECT
```

**原因：**连接器会使用以下方式检查授权：

```sql
SELECT access_type, database, table, column FROM system.grants WHERE user_name = 'my_user'
```

这只会返回直接授权。通过 ClickHouse 角色分配的特权会显示为 `user_name = NULL` 和 `role_name = 'my_role'`，因此此检查无法识别它们。

**解决方案：**

**直接向 Fivetran 用户授予特权：**

```sql
GRANT CURRENT GRANTS ON *.* TO fivetran_user;
```

***

## 最佳实践 \{#best-practices\}

### Fivetran 专用 ClickHouse 服务 \{#dedicated-service\}

如果摄取负载较高，可考虑使用 ClickHouse Cloud 的 [compute-compute separation](/cloud/reference/warehouses) 为 Fivetran 写入工作负载创建专用服务。这样可以将摄取与分析查询隔离开来，避免资源争用。

例如，可以采用以下架构：

* **Service A (writer)**：Fivetran 目标端 + 其他摄取工具 (ClickPipes、Kafka 连接器)
* **Service B (reader)**：BI 工具、仪表板、即席查询

### 优化读取查询 \{#optimizing-reading-queries\}

ClickHouse 对 Fivetran 目标表使用 `SharedReplacingMergeTree`，它是 ClickHouse Cloud 中 [`ReplacingMergeTree` 表引擎](/guides/replacing-merge-tree) 的一个变体。具有相同主键的重复行属于正常现象——去重会在后台合并过程中异步进行。读取时，需要注意避免返回重复行，因为某些行可能尚未完成去重。

使用 `FINAL` 关键字是避免重复行的最简单方式，因为它会在读取时强制合并所有尚未去重的行：

```sql
SELECT * FROM schema.table FINAL WHERE ...
```

有几种方法可以优化此 `FINAL` 操作——例如，在 `WHERE` 条件中对键列进行过滤。有关更多详细信息，请参阅 ReplacingMergeTree 指南中的 [FINAL 性能](/guides/replacing-merge-tree#final-performance) 一节。

如果这些优化仍然不够，您还有其他选项，可以在不使用 `FINAL` 的情况下正确处理重复项：

* 如果您要查询一个始终递增的数值列，[您可以使用 `max(the_column)`](/guides/developer/deduplication#avoiding-final)。
* 如果您需要获取某个特定键对应的某些列的最新值，您可以使用 [`argMax(the_column, _fivetran_id)`](https://clickhouse.com/blog/10-best-practice-tips#perfecting_replacingmergetree)。

### 主键与 ORDER BY 优化 \{#primary-key-optimization\}

Fivetran 会将源表的主键复制为 ClickHouse 的 `ORDER BY` 子句。当源表没有主键时，`_fivetran_id` (一个 UUID) 会成为排序键，这可能导致查询性能不佳，因为 ClickHouse 会基于 `ORDER BY` 列构建其[稀疏主索引](/guides/best-practices/sparse-primary-indexes)。

**如果其他优化措施仍不足够，可考虑以下建议：**

1. **将 Fivetran 表视为原始暂存表。** 不要直接将其用于分析查询。
2. **如果查询性能仍然不够理想**，请使用[可刷新materialized view](/materialized-view/refreshable-materialized-view)创建该表的副本，并将 `ORDER BY` 优化为更适合你的查询模式。与增量materialized view不同，可刷新materialized view会按计划重新运行完整查询，因此能够正确处理 Fivetran 在同步期间执行的 `UPDATE` 和 `DELETE` 操作：

   ```sql
   CREATE MATERIALIZED VIEW schema.table_optimized
   REFRESH EVERY 1 HOUR
   ENGINE = ReplacingMergeTree()
   ORDER BY (user_id, event_date)
   AS SELECT * FROM schema.table_raw FINAL;
   ```

   :::note
   对于由 Fivetran 管理的表，应避免使用增量 (不可刷新) materialized view。由于 Fivetran 会执行 `UPDATE` 和 `DELETE` 操作来保持数据同步，增量materialized view无法反映这些变更，因此会包含过时或错误的数据。
   :::

### 不要手动修改由 Fivetran 管理的表 \{#dont-modify-tables\}

避免对由 Fivetran 管理的表手动执行 DDL 变更 (例如 `ALTER TABLE ... MODIFY COLUMN`) 。连接器要求使用其创建的 schema。手动修改可能导致[类型映射错误](#uint64-type-error)以及 schema 不匹配问题。

如需自定义转换，请使用 materialized view。

## 调试操作 \{#debugging\}

诊断故障时：

* 检查 ClickHouse `system.query_log`，排查服务器端问题。
* 如遇客户端问题，请联系 Fivetran 寻求帮助。

如果是连接器缺陷，请[创建 GitHub issue](https://github.com/ClickHouse/clickhouse-fivetran-destination/issues)或联系 [ClickHouse Support](/about-us/support)。

### 调试 Fivetran 同步 \{#debugging-fivetran-syncs\}

使用以下查询来诊断 ClickHouse 端的同步失败问题。

#### 检查近期与 Fivetran 相关的 ClickHouse 错误 \{#check-errors\}

```sql
SELECT event_time, query, exception_code, exception
FROM system.query_log
WHERE client_name LIKE 'fivetran-destination%'
  AND exception_code > 0
ORDER BY event_time DESC
LIMIT 50;
```

#### 查看最近的 Fivetran 用户活动 \{#check-activity\}

```sql
SELECT event_time, query_kind, query, exception_code, exception
FROM system.query_log
WHERE user = '{fivetran_user}'
ORDER BY event_time DESC
LIMIT 100;
```
