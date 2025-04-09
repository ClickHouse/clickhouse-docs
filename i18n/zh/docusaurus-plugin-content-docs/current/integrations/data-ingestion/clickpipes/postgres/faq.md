---
sidebar_label: ClickPipes for Postgres 常见问题
description: 关于 ClickPipes for Postgres 的常见问题解答。
slug: /integrations/clickpipes/postgres/faq
sidebar_position: 2
---


# ClickPipes for Postgres 常见问题

### 空闲如何影响我的 Postgres CDC ClickPipe？ {#how-does-idling-affect-my-postgres-cdc-clickpipe}

如果您的 ClickHouse Cloud 服务处于空闲状态，您的 Postgres CDC ClickPipe 将继续同步数据，您的服务将在下一个同步间隔唤醒以处理传入数据。一旦同步完成并达到空闲期，您的服务将重新回到空闲状态。

举例来说，如果您的同步间隔设置为 30 分钟，您的服务空闲时间设置为 10 分钟，那么您的服务将每 30 分钟唤醒一次，并在 10 分钟内保持活动，然后再次进入空闲状态。

### ClickPipes for Postgres 如何处理 TOAST 列？ {#how-are-toast-columns-handled-in-clickpipes-for-postgres}

请参阅 [处理 TOAST 列](./toast) 页面以获取更多信息。

### ClickPipes for Postgres 如何处理生成列？ {#how-are-generated-columns-handled-in-clickpipes-for-postgres}

请参阅 [Postgres 生成列：注意事项和最佳实践](./generated_columns) 页面以获取更多信息。

### 表格是否需要有主键才能成为 Postgres CDC 的一部分？ {#do-tables-need-to-have-primary-keys-to-be-part-of-postgres-cdc}

是的，对于 CDC，表必须有主键或 [REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY)。REPLICA IDENTITY 可以设置为 FULL 或配置为使用唯一索引。

### 您支持作为 Postgres CDC 一部分的分区表吗？ {#do-you-support-partitioned-tables-as-part-of-postgres-cdc}

是的，只要分区表定义了主键或 REPLICA IDENTITY，分区表就可以开箱即用。主键和 REPLICA IDENTITY 必须出现在父表及其所有分区上。您可以在 [这里](https://blog.peerdb.io/real-time-change-data-capture-for-postgres-partitioned-tables) 阅读更多信息。

### 我可以连接没有公共 IP 或处于私有网络中的 Postgres 数据库吗？ {#can-i-connect-postgres-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

可以！ClickPipes for Postgres 提供两种连接私有网络中数据库的方式：

1. **SSH 隧道**
   - 对大多数用例效果良好
   - 请参见 [这里]( /integrations/clickpipes/postgres#adding-your-source-postgres-database-connection) 的设置说明
   - 在所有区域中均可使用

2. **AWS PrivateLink**
   - 可在三个 AWS 区域使用：
     - us-east-1
     - us-east-2 
     - eu-central-1
   - 有关详细的设置说明，请参阅我们的 [PrivateLink 文档](/knowledgebase/aws-privatelink-setup-for-clickpipes#requirements)
   - 对于 PrivateLink 不可用的区域，请使用 SSH 隧道

### 您如何处理 UPDATE 和 DELETE？ {#how-do-you-handle-updates-and-deletes}

ClickPipes for Postgres 会将 Postgres 中的 INSERT 和 UPDATE 捕获为 ClickHouse 中具有不同版本的新行（使用 `_peerdb_` 版本列）。ReplacingMergeTree 表引擎会定期在后台根据排序键（ORDER BY 列）执行去重，只保留最新的 `_peerdb_` 版本的行。

Postgres 中的 DELETE 会作为标记为删除的新行传播（使用 `_peerdb_is_deleted` 列）。由于去重过程是异步的，您可能会暂时看到重复数据。为了解决这个问题，您需要在查询层处理去重。

有关更多详细信息，请参阅：

* [ReplacingMergeTree 表引擎最佳实践](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling#replacingmergetree-table-engine)
* [Postgres 到 ClickHouse CDC 内部博客](https://clickhouse.com/blog/postgres-to-clickhouse-data-modeling-tips)

### 您支持模式更改吗？ {#do-you-support-schema-changes}

请参阅 [ClickPipes for Postgres：模式更改传播支持](./schema-changes) 页面以获取更多信息。

### ClickPipes for Postgres CDC 的费用是多少？ {#what-are-the-costs-for-clickpipes-for-postgres-cdc}

在预览期间，ClickPipes 是免费的。GA 之后，定价仍待确定。我们的目标是使定价合理，并与外部 ETL 工具高度竞争。

### 我的复制插槽大小不断增长或没有减少；可能是什么问题？ {#my-replication-slot-size-is-growing-or-not-decreasing-what-might-be-the-issue}

如果您注意到 Postgres 复制插槽的大小持续增加或没有下降，通常意味着 **WAL（Write-Ahead Log）记录没有被您的 CDC 管道或复制过程消耗（或“重放”）得够快**。以下是造成此问题的最常见原因以及您可以采取的解决措施。

1. **数据库活动的突然峰值**  
   - 大批量更新、批量插入或显著的模式更改可能会迅速生成大量的 WAL 数据。  
   - 复制插槽将保留这些 WAL 记录，直到它们被消耗，从而导致临时的大小峰值。

2. **长时间运行的事务**  
   - 打开的事务会强制 Postgres 保留自事务开始以来生成的所有 WAL 段，这可能会大幅增加插槽大小。  
   - 将 `statement_timeout` 和 `idle_in_transaction_session_timeout` 设置为合理的值，以防止事务无限期保留：
     ```sql
     SELECT 
         pid,
         state,
         age(now(), xact_start) AS transaction_duration,
         query AS current_query
     FROM 
         pg_stat_activity
     WHERE 
         xact_start IS NOT NULL
     ORDER BY 
         age(now(), xact_start) DESC;
     ```
     使用此查询来识别异常长时间运行的事务。

3. **维护或实用操作（例如 `pg_repack`）**  
   - 像 `pg_repack` 这样的工具可以重写整个表，短时间内生成大量的 WAL 数据。  
   - 请在流量较少的时段安排这些操作，或在它们运行时密切监控 WAL 使用情况。

4. **VACUUM 和 VACUUM ANALYZE**  
   - 尽管对于数据库健康很必要，但这些操作会产生额外的 WAL 流量——尤其是在扫描大型表时。  
   - 考虑使用 autovacuum 调优参数或在非高峰时段安排手动 VACUUM 操作。

5. **复制消费方未积极读取插槽**  
   - 如果您的 CDC 管道（例如 ClickPipes）或其他复制消费方停止、暂停或崩溃，WAL 数据将会在插槽中积累。  
   - 确保您的管道持续运行，并检查日志以获取连接或身份验证错误。

有关此主题的深入探讨，请查看我们的博客文章：[克服 Postgres 逻辑解码的陷阱](https://blog.peerdb.io/overcoming-pitfalls-of-postgres-logical-decoding#heading-beware-of-replication-slot-growth-how-to-monitor-it)。

### Postgres 数据类型如何映射到 ClickHouse？ {#how-are-postgres-data-types-mapped-to-clickhouse}

ClickPipes for Postgres 旨在尽可能原生地映射 Postgres 数据类型到 ClickHouse 侧。本文件提供了每种数据类型及其映射的综合列表：[数据类型矩阵](https://docs.peerdb.io/datatypes/datatype-matrix)。

### 我可以在将数据从 Postgres 复制到 ClickHouse 时定义自己的数据类型映射吗？ {#can-i-define-my-own-data-type-mapping-while-replicating-data-from-postgres-to-clickhouse}

目前，我们不支持在管道中定义自定义数据类型映射。不过，请注意，ClickPipes 使用的默认数据类型映射是高度原生的。Postgres 中的大多数列类型会尽可能接近其在 ClickHouse 上的原生等效项进行复制。例如，Postgres 中的整数数组类型会复制为 ClickHouse 中的整数数组类型。

### JSON 和 JSONB 列如何从 Postgres 复制？ {#how-are-json-and-jsonb-columns-replicated-from-postgres}

JSON 和 JSONB 列在 ClickHouse 中复制为字符串类型。由于 ClickHouse 支持原生的 [JSON 类型](/sql-reference/data-types/newjson)，您可以在 ClickPipes 表上创建一个物化视图以进行必要的转换。或者，您可以直接在字符串列上使用 [JSON 函数](/sql-reference/functions/json-functions)。我们正在积极开发一个功能，将 JSON 和 JSONB 列直接复制到 ClickHouse 的 JSON 类型中。此功能预计将在几个月内上线。

### 当镜像暂停时，插入会发生什么？ {#what-happens-to-inserts-when-a-mirror-is-paused}

当您暂停镜像时，消息会在源 Postgres 的复制插槽中排队，确保它们被缓冲而不会丢失。然而，暂停和恢复镜像将重新建立连接，具体时间取决于源。

在此过程中，同步（从 Postgres 中提取数据并将其流式传输到 ClickHouse 原始表）和规范化（从原始表到目标表）操作都会中止。但是，它们保持所需的状态以可靠地恢复。

- 对于同步，如果在中途被取消，Postgres 中的 confirmed_flush_lsn 不会前进，因此下一个同步将从与中止的同步相同的位置开始，确保数据一致性。
- 对于规范化，ReplacingMergeTree 插入顺序处理去重。

总之，虽然在暂停期间同步和规范化过程会被终止，但这样做是安全的，因为它们可以在没有数据丢失或不一致的情况下恢复。

### ClickPipe 创建可以通过 API 或 CLI 自动化吗？ {#can-clickpipe-creation-be-automated-or-done-via-api-or-cli}

目前，您只能通过 UI 创建 ClickPipe。不过，我们正在积极开发 OpenAPI 和 Terraform 端点。预计将在不久的将来（一个月内）发布。如果您有兴趣成为此功能的设计合作伙伴，请联系 db-integrations-support@clickhouse.com。

### 我如何加速初始加载？ {#how-do-i-speed-up-my-initial-load}

您无法加速已经运行的初始加载。然而，您可以通过调整某些设置来优化未来的初始加载。默认情况下，设置配置为 4 个并行线程，并且每个分区的快照行数设置为 100,000。这些是高级设置，通常对于大多数用例都是足够的。

对于 Postgres 版本 13 或更低版本，CTID 范围扫描较慢，这些设置变得更加关键。在这种情况下，请考虑以下流程来改善性能：

1. **删除现有管道**：这是应用新设置所必需的。
2. **删除 ClickHouse 上的目标表**：确保删除之前管道创建的表。
3. **使用优化设置创建新管道**：通常，将每个分区的快照行数增加到 100 万到 1000 万之间，具体取决于您的特定要求和 Postgres 实例可以处理的负载。

这些调整应显著提高初始加载的性能，特别是对于较旧的 Postgres 版本。如果您使用的是 Postgres 14 或更高版本，这些设置的影响较小，因为对 CTID 范围扫描的支持得到改善。

### 在设置复制时，我应该如何限制我的发布？ {#how-should-i-scope-my-publications-when-setting-up-replication}

您可以让 ClickPipes 管理您的发布（需要写入访问权限），或自己创建它们。使用 ClickPipes 管理的发布，当您编辑管道时，我们会自动处理表的添加和移除。如果自我管理，请仔细限制您的发布，仅包括您需要复制的表——包含不必要的表会减慢 Postgres WAL 解码。

如果您在发布中包含任何表，请确保它有主键或 `REPLICA IDENTITY FULL`。如果您有没有主键的表，则为所有表创建发布将导致这些表中的 DELETE 和 UPDATE 操作失败。

要识别数据库中没有主键的表，您可以使用以下查询：
```sql
SELECT table_schema, table_name
FROM information_schema.tables
WHERE
    (table_catalog, table_schema, table_name) NOT IN (
        SELECT table_catalog, table_schema, table_name
        FROM information_schema.table_constraints
        WHERE constraint_type = 'PRIMARY KEY') AND
    table_schema NOT IN ('information_schema', 'pg_catalog', 'pgq', 'londiste');
```

处理没有主键的表时，您有两个选项：

1. **将没有主键的表排除在 ClickPipes 之外**：
   创建仅包含具有主键的表的发布：
   ```sql
   CREATE PUBLICATION my_publication FOR TABLE table_with_primary_key1, table_with_primary_key2, ...;
   ```

2. **在 ClickPipes 中包含没有主键的表**：
   如果您希望包含没有主键的表，则需要将其副本身份更改为 `FULL`。这确保 UPDATE 和 DELETE 操作正常工作：
   ```sql
   ALTER TABLE table_without_primary_key1 REPLICA IDENTITY FULL;
   ALTER TABLE table_without_primary_key2 REPLICA IDENTITY FULL;
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```

## 推荐的 `max_slot_wal_keep_size` 设置 {#recommended-max_slot_wal_keep_size-settings}

- **至少：**将 [`max_slot_wal_keep_size`](https://www.postgresql.org/docs/devel/runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE) 设置为保留至少 **两天的** WAL 数据。
- **对于大型数据库（高交易量）：**至少保留 **2-3 倍**的峰值 WAL 每天生成。
- **对于存储受限的环境：**谨慎调优，以 **避免磁盘耗尽**，同时确保复制稳定性。

### 如何计算正确的值 {#how-to-calculate-the-right-value}

要确定正确的设置，请测量 WAL 生成速率：

#### 对于 PostgreSQL 10 及以上版本： {#for-postgresql-10}

```sql
SELECT pg_wal_lsn_diff(pg_current_wal_insert_lsn(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

#### 对于 PostgreSQL 9.6 及以下版本： {#for-postgresql-96-and-below}

```sql
SELECT pg_xlog_location_diff(pg_current_xlog_insert_location(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

* 在一天中的不同时间运行上述查询，尤其是在交易量较高的时段。
* 计算每 24 小时生成的 WAL 量。
* 将该数字乘以 2 或 3 以提供足够的保留。
* 将 `max_slot_wal_keep_size` 设置为最终结果值（MB 或 GB）。

#### 示例： {#example}

如果您的数据库每天生成 100 GB 的 WAL，请设置：

```sql
max_slot_wal_keep_size = 200GB
```

### 我的复制插槽无效。该怎么办？ {#my-replication-slot-is-invalidated-what-should-i-do}

恢复 ClickPipe 的唯一方法是触发重新同步，您可以在设置页面完成此操作。

复制插槽无效的最常见原因是 PostgreSQL 数据库上较低的 `max_slot_wal_keep_size` 设置（例如，几 GB）。我们建议增加此值。[请参阅本节]( /integrations/clickpipes/postgres/faq#recommended-max_slot_wal_keep_size-settings) 以调优 `max_slot_wal_keep_size`。理想情况下，这应设置为至少 200GB，以防止复制插槽无效。

在极少数情况下，我们看到即使没有配置 `max_slot_wal_keep_size` 时也会发生此问题。这可能是由于 PostgreSQL 中某种复杂而罕见的错误，尽管原因仍不明确。

### 在 ClickPipe 加载数据时我看到 ClickHouse 的内存不足（OOM）。你能帮忙吗？ {#i-am-seeing-out-of-memory-ooms-on-clickhouse-while-my-clickpipe-is-ingesting-data-can-you-help}

ClickHouse 中 OOM 的一个常见原因是您的服务资源不足。这意味着您当前的服务配置没有足够的资源（例如，内存或 CPU）来有效处理摄取负载。我们强烈建议扩大服务以满足您 ClickPipe 数据摄取的需求。

我们还观察到的另一个原因是存在下游物化视图，其中可能包含未优化的连接：

- 对于 JOIN 的一种常见优化技术是，如果您有一个 `LEFT JOIN`，而右侧表非常大。在这种情况下，重写查询以使用 `RIGHT JOIN`，并将更大的表移到左侧。这使查询规划器可以更加有效地使用内存。

- JOIN 的另一种优化是通过 `subqueries` 或 `CTEs` 显式过滤表，然后在这些子查询之间执行 JOIN。这为规划器提供了提示，说明如何有效过滤行并进行 JOIN。

### 在初始加载过程中，我看到 `invalid snapshot identifier`。该怎么办？ {#i-am-seeing-an-invalid-snapshot-identifier-during-the-initial-load-what-should-i-do}

`invalid snapshot identifier` 错误发生在 ClickPipes 与您的 Postgres 数据库之间的连接中断时。这可能是由于网关超时、数据库重启或其他瞬时问题导致的。

建议在初始加载过程中不要执行任何干扰操作，例如升级或重启您的 Postgres 数据库，并确保与数据库的网络连接稳定。

要解决此问题，您可以从 ClickPipes UI 触发重新同步。这将从头开始重新启动初始加载过程。
