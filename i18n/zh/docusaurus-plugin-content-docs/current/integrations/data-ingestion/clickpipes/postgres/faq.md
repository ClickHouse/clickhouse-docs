---
sidebar_label: '常见问题'
description: '关于 ClickPipes for Postgres 的常见问题。'
slug: /integrations/clickpipes/postgres/faq
sidebar_position: 2
title: 'ClickPipes for Postgres 常见问题'
keywords: ['postgres 常见问题', 'clickpipes', 'toast 列', '复制槽', '发布']
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import failover_slot from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/failover_slot.png'
import Image from '@theme/IdealImage';


# Postgres 版 ClickPipes 常见问题解答（FAQ） \{#clickpipes-for-postgres-faq\}

### 空闲状态如何影响我的 Postgres CDC ClickPipe？ \{#how-does-idling-affect-my-postgres-cdc-clickpipe\}

如果您的 ClickHouse Cloud 服务处于空闲状态，您的 Postgres CDC ClickPipe 仍会继续同步数据；您的服务会在下一次同步间隔到来时被唤醒，以处理新到达的数据。一旦同步完成并再次达到空闲时间阈值，您的服务就会重新进入空闲状态。

例如，如果您的同步间隔设置为 30 分钟，而服务空闲时间设置为 10 分钟，您的服务将每隔 30 分钟被唤醒并保持活跃 10 分钟，然后再回到空闲状态。

### 在 ClickPipes for Postgres 中如何处理 TOAST 列？ \{#how-are-toast-columns-handled-in-clickpipes-for-postgres\}

请参阅 [处理 TOAST 列](./toast) 页面以获取更多信息。

### 在 ClickPipes for Postgres 中如何处理生成列（generated columns）？ \{#how-are-generated-columns-handled-in-clickpipes-for-postgres\}

如需了解更多信息，请参阅 [Postgres Generated Columns: Gotchas and Best Practices](./generated_columns) 页面。

### Postgres CDC 中的表是否必须具有主键？ \{#do-tables-need-to-have-primary-keys-to-be-part-of-postgres-cdc\}

要使用 ClickPipes for Postgres 复制某个表，该表必须定义主键或 [REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY)。

* **Primary Key**：最直接的方法是在表上定义主键。主键为每一行提供唯一标识符，这对跟踪更新和删除操作至关重要。在这种情况下，可以将 REPLICA IDENTITY 保持为 `DEFAULT`（默认行为）。
* **Replica Identity**：如果表没有主键，可以设置 replica identity。replica identity 可以设置为 `FULL`，这意味着将使用整行数据来标识变更。或者，如果表上存在唯一索引，也可以将其设置为使用该唯一索引，然后将 REPLICA IDENTITY 设置为 `USING INDEX index_name`。
  要将 replica identity 设置为 FULL，可以使用以下 SQL 命令：

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

`REPLICA IDENTITY FULL` 还会启用对未更改 TOAST 列的复制。更多信息请参见[此处](./toast)。

请注意，使用 `REPLICA IDENTITY FULL` 可能会带来性能影响，并导致 WAL 日志增长更快，尤其是对于没有主键且频繁执行更新或删除操作的表，因为它需要为每次变更记录更多数据。如果有任何疑问，或在为表配置主键或 replica identity 时需要协助，请联系支持团队获取指导。

同样需要注意的是，如果既没有定义主键，也没有定义 replica identity，ClickPipes 将无法为该表复制变更，您可能会在复制过程中遇到错误。因此，建议在设置 ClickPipe 之前，先检查表模式，确保其满足上述要求。


### 你们是否支持 Postgres CDC 中的分区表？ \{#do-you-support-partitioned-tables-as-part-of-postgres-cdc\}

是的，开箱即用地支持分区表，只要它们定义了 PRIMARY KEY 或 REPLICA IDENTITY 即可。PRIMARY KEY 和 REPLICA IDENTITY 必须同时存在于父表及其各个分区上。你可以在[这里](https://blog.peerdb.io/real-time-change-data-capture-for-postgres-partitioned-tables)阅读更多相关内容。

### 我可以连接没有公共 IP 或位于私有网络中的 Postgres 数据库吗？ \{#can-i-connect-postgres-databases-that-dont-have-a-public-ip-or-are-in-private-networks\}

可以！ClickPipes for Postgres 提供两种方式来连接位于私有网络中的数据库：

1. **SSH Tunneling**
   - 适用于大多数使用场景
   - 请参阅[此处](/integrations/clickpipes/postgres#adding-your-source-postgres-database-connection)的配置步骤
   - 适用于所有区域

2. **AWS PrivateLink**
   - 在以下三个 AWS 区域可用：
     - us-east-1
     - us-east-2
     - eu-central-1
   - 详细配置步骤请参阅我们的 [PrivateLink 文档](/knowledgebase/aws-privatelink-setup-for-clickpipes)
   - 在无法使用 PrivateLink 的区域，请使用 SSH Tunneling

### 如何处理 UPDATE 和 DELETE？ \{#how-do-you-handle-updates-and-deletes\}

ClickPipes for Postgres 会将来自 Postgres 的 INSERT 和 UPDATE 捕获为在 ClickHouse 中带有不同版本（使用 `_peerdb_` 版本列）的新行。ReplacingMergeTree 表引擎会在后台定期基于排序键（ORDER BY 列）执行去重，仅保留具有最新 `_peerdb_` 版本的行。

来自 Postgres 的 DELETE 会被下推为标记为已删除的新行（使用 `_peerdb_is_deleted` 列）。由于去重过程是异步的，可能会在短时间内看到重复数据。为了解决这一问题，需要在查询层处理去重。

另外需要注意的是，默认情况下，Postgres 在执行 DELETE 操作时，不会发送不属于主键或 replica identity 的列的列值。如果希望在 DELETE 时捕获完整行数据，可以将 [REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY) 设置为 FULL。

更多详细信息，请参阅：

* [ReplacingMergeTree 表引擎最佳实践](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling#replacingmergetree-table-engine)
* [Postgres-to-ClickHouse CDC 内部机制博文](https://clickhouse.com/blog/postgres-to-clickhouse-data-modeling-tips)

### 我可以在 PostgreSQL 中更新主键列吗？ \{#can-i-update-primary-key-columns-in-postgresql\}

:::warning
默认情况下，PostgreSQL 中的主键更新无法在 ClickHouse 中被正确处理。

出现这一限制的原因是，`ReplacingMergeTree` 的去重机制是基于 `ORDER BY` 列工作的（这些列通常对应主键）。当主键在 PostgreSQL 中被更新时，在 ClickHouse 中会表现为具有不同键的新行，而不是对现有行的更新。这可能导致旧的和新的主键值同时存在于你的 ClickHouse 表中。
:::

请注意，在 PostgreSQL 数据库设计中，更新主键列并不是常见做法，因为主键旨在作为不可变标识符。大多数应用在设计时就会避免更新主键，因此在典型用例中很少会遇到这一限制。

目前有一个实验性设置可用于启用主键更新处理，但它会带来显著的性能开销，未经充分评估，不建议在生产环境中使用。

如果你的用例需要在 PostgreSQL 中更新主键列，并且希望这些更改能够在 ClickHouse 中被正确反映，请联系我们的支持团队 [db-integrations-support@clickhouse.com](mailto:db-integrations-support@clickhouse.com)，以讨论你的具体需求和潜在解决方案。

### 是否支持架构更改？ \{#do-you-support-schema-changes\}

请参阅 [ClickPipes for Postgres：Schema Changes Propagation Support](./schema-changes) 页面以了解更多信息。

### ClickPipes for Postgres CDC 的费用是多少？ \{#what-are-the-costs-for-clickpipes-for-postgres-cdc\}

有关详细的定价信息，请参阅[我们计费总览页面中的“ClickPipes for Postgres CDC 定价”部分](/cloud/reference/billing/clickpipes)。

### 我的 replication slot 大小在持续增长或没有减小；可能是什么问题？ \{#my-replication-slot-size-is-growing-or-not-decreasing-what-might-be-the-issue\}

如果你注意到 Postgres replication slot 的大小不断增加，或者始终没有回落，通常意味着 **你的 CDC（变更数据捕获）pipeline 或复制进程没有足够快地消费（或“重放”）WAL（Write-Ahead Log，预写日志）记录**。下面是最常见的原因以及对应的处理方法。

1. **数据库活动的突然激增**
   - 大批量更新、批量插入或重大 schema 变更会在短时间内生成大量 WAL 数据。
   - 在这些 WAL 记录被消费之前，replication slot 会保留它们，从而导致大小的短暂激增。

2. **长时间运行的事务**
   - 一个未结束的事务会迫使 Postgres 保留自事务开始以来生成的所有 WAL 段，这会显著增加 slot 的大小。
   - 将 `statement_timeout` 和 `idle_in_transaction_session_timeout` 设置为合理的值，以防事务无限期保持打开状态：
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

3. **维护或工具操作（例如 `pg_repack`）**
   - 像 `pg_repack` 这类工具可能会重写整张表，在短时间内生成大量 WAL 数据。
   - 将这些操作安排在流量较低的时段执行，或在其运行期间密切监控 WAL 使用情况。

4. **VACUUM 和 VACUUM ANALYZE**
   - 尽管这些操作对数据库健康是必要的，但它们会产生额外的 WAL 流量——尤其是在扫描大表时。
   - 可以考虑调优 autovacuum 参数，或将手动 VACUUM 操作安排在非高峰时段。

5. **复制消费端未主动读取 slot**
   - 如果你的 CDC pipeline（例如 ClickPipes）或其他复制消费端停止、暂停或崩溃，WAL 数据会在 slot 中不断积累。
   - 确保你的 pipeline 持续运行，并检查日志以排查连接或认证错误。

如需对该主题的深入讲解，请查看我们的博客文章：[克服 Postgres 逻辑解码的常见陷阱](https://blog.peerdb.io/overcoming-pitfalls-of-postgres-logical-decoding#heading-beware-of-replication-slot-growth-how-to-monitor-it)。

### Postgres 数据类型如何映射到 ClickHouse？ \{#how-are-postgres-data-types-mapped-to-clickhouse\}

ClickPipes for Postgres 致力于在 ClickHouse 侧尽可能以原生方式映射 Postgres 数据类型。本文档提供了每种数据类型及其映射的完整列表：[数据类型矩阵（Data Type Matrix）](https://docs.peerdb.io/datatypes/datatype-matrix)。

### 在从 Postgres 复制数据到 ClickHouse 时，我可以自定义数据类型映射吗？ \{#can-i-define-my-own-data-type-mapping-while-replicating-data-from-postgres-to-clickhouse\}

目前，我们不支持在管道中定义自定义数据类型映射。但请注意，ClickPipes 使用的默认数据类型映射与原生类型高度贴合。Postgres 中的大多数列类型都会尽可能映射为 ClickHouse 中对应的原生类型。例如，Postgres 中的整数数组类型会被映射为 ClickHouse 中的整数数组类型。

### 如何从 Postgres 复制 JSON 和 JSONB 列？ \{#how-are-json-and-jsonb-columns-replicated-from-postgres\}

JSON 和 JSONB 列会以 String 类型的形式复制到 ClickHouse 中。由于 ClickHouse 支持原生的 [JSON type](/sql-reference/data-types/newjson)，如果需要，你可以在 ClickPipes 表之上创建一个 materialized view 来完成类型转换。或者，你也可以直接在 String 列上使用 [JSON functions](/sql-reference/functions/json-functions)。我们正在积极开发一项功能，使 JSON 和 JSONB 列能够直接复制为 ClickHouse 中的 JSON type。该功能预计将在几个月内可用。

### 暂停镜像时插入会发生什么？ \{#what-happens-to-inserts-when-a-mirror-is-paused\}

当你暂停镜像时，消息会在源 Postgres 上的 replication slot 中排队，确保它们被缓冲而不会丢失。不过，暂停并恢复镜像会重新建立与源的连接，根据源端情况，这可能需要一些时间。

在此过程中，同步（从 Postgres 拉取数据并将其流式写入 ClickHouse 原始表）和规范化（从原始表写入目标表）操作都会被中止。但它们会保留恢复所需的状态，因此可以可靠地继续执行。

- 对于同步，如果在中途被取消，Postgres 中的 `confirmed_flush_lsn` 不会推进，因此下一次同步会从与被中止同步相同的位置开始，从而确保数据一致性。
- 对于规范化，由 ReplacingMergeTree 的插入顺序来处理去重。

总之，尽管在暂停期间同步和规范化过程会被终止，但这样做是安全的，因为它们可以在不发生数据丢失或不一致的情况下恢复。

### ClickPipe 的创建可以自动化，或者通过 API 或 CLI 完成吗？ \{#can-clickpipe-creation-be-automated-or-done-via-api-or-cli\}

Postgres ClickPipe 也可以通过 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) 端点进行创建和管理。该功能目前处于测试（beta）阶段，API 参考文档可以在[这里](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/beta)找到。我们也在积极开发 Terraform 支持，以便创建 Postgres ClickPipes。

### 如何加速初始加载？ \{#how-do-i-speed-up-my-initial-load\}

你无法加速已经在运行的初始加载。不过，你可以通过调整某些设置来优化后续的初始加载。默认情况下，这些设置为 4 个并行线程，以及每个分区的快照行数为 100,000。这些属于高级设置，对大多数用例通常已经足够。

对于 Postgres 13 或更低版本，CTID 范围扫描非常慢，因此 ClickPipes 不会使用它们。相反，我们会将整张表作为单个分区来读取，本质上变为单线程执行（因此会忽略“每个分区的行数”和“并行线程数”这两个设置）。在这种情况下，如果要加速初始加载，可以增加 `snapshot number of tables in parallel`，或者为大表指定一个自定义的、已建立索引的分区列。

### 在设置复制时，我应该如何限定 publication 的范围？ \{#how-should-i-scope-my-publications-when-setting-up-replication\}

你可以让 ClickPipes 管理你的 publication（需要额外权限），也可以自行创建。使用 ClickPipes 托管的 publication 时，当你编辑管道时，我们会自动处理表的新增和移除。如果你选择自行管理，请谨慎限定 publication 的范围，只包含需要复制的表——包含不必要的表会减慢 Postgres WAL 解码速度。

如果你在 publication 中包含任何表，请确保该表要么有主键，要么配置了 `REPLICA IDENTITY FULL`。如果你的表没有主键，而你为所有表创建了一个 publication，那么这些表上的 DELETE 和 UPDATE 操作将会失败。

要识别数据库中没有主键的表，你可以使用以下查询：

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

在处理没有主键的表时，你有两个选择：

1. **将没有主键的表从 ClickPipes 中排除**：
   仅包含具有主键的表来创建 publication：
   ```sql
   CREATE PUBLICATION clickpipes_publication FOR TABLE table_with_primary_key1, table_with_primary_key2, ...;
   ```

2. **在 ClickPipes 中包含没有主键的表**：
   如果你希望包含没有主键的表，需要将它们的 replica identity 修改为 `FULL`。这样可以确保 UPDATE 和 DELETE 操作正常工作：
   ```sql
   ALTER TABLE table_without_primary_key1 REPLICA IDENTITY FULL;
   ALTER TABLE table_without_primary_key2 REPLICA IDENTITY FULL;
   CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>;
   ```

:::tip
如果你是手动创建 publication，而不是让 ClickPipes 管理它，我们不建议创建 `FOR ALL TABLES` 的 publication，这会导致从 Postgres 到 ClickPipes 的流量增大（因为会发送不在 pipe 中的其他表的变更），从而降低整体效率。

对于手动创建的 publication，请在将表添加到 pipe 之前，先将你需要的任意表添加到该 publication 中。
:::

:::warning
如果你是从 Postgres 只读副本/热备节点进行复制，则需要在主实例上创建你自己的 publication，它会自动传播到备用节点。在这种情况下，ClickPipe 将无法管理该 publication，因为你无法在备用节点上创建 publication。
:::


### 推荐的 `max_slot_wal_keep_size` 设置 \{#recommended-max_slot_wal_keep_size-settings\}

- **最低要求：** 将 [`max_slot_wal_keep_size`](https://www.postgresql.org/docs/devel/runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE) 设置为至少保留 **两天的** WAL 数据。
- **对于大型数据库（高事务量）：** 至少保留每天峰值 WAL 生成量的 **2–3 倍**。
- **对于存储受限的环境：** 谨慎调整该值，在确保复制稳定性的同时，**避免磁盘空间耗尽**。

#### 如何计算合适的取值 \{#how-to-calculate-the-right-value\}

要计算合适的取值，需要先测量 WAL 的生成速率：

##### 适用于 PostgreSQL 10 及以上版本 \{#for-postgresql-10\}

```sql
SELECT pg_wal_lsn_diff(pg_current_wal_insert_lsn(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```


##### 适用于 PostgreSQL 9.6 及以下版本： \{#for-postgresql-96-and-below\}

```sql
SELECT pg_xlog_location_diff(pg_current_xlog_insert_location(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

* 在一天中不同的时间运行上述查询，尤其是在事务量很高的时段。
* 计算 24 小时内产生的 WAL 量。
* 将该数值乘以 2 或 3，以留出足够的保留裕量。
* 将 `max_slot_wal_keep_size` 设置为所得的数值（单位为 MB 或 GB）。


##### 示例 \{#example\}

如果你的数据库每天产生 100 GB 的 WAL，请设置：

```sql
max_slot_wal_keep_size = 200GB
```


### 我在日志中看到 ReceiveMessage EOF 错误。这意味着什么？ \{#im-seeing-a-receivemessage-eof-error-in-the-logs-what-does-it-mean\}

`ReceiveMessage` 是 Postgres 逻辑解码协议中的一个函数，用于从复制流中读取消息。EOF（End of File，文件结束）错误表示在尝试从复制流中读取数据时，与 Postgres 服务器的连接被意外关闭。

这是一个可恢复的、完全不是致命错误。ClickPipes 会自动尝试重新连接并继续复制过程。

出现该问题可能有以下几个原因：

- **wal_sender_timeout 过低：** 请确保 `wal_sender_timeout` 设置为 5 分钟或更长时间。该设置控制服务器在关闭连接之前等待客户端响应的时间。如果超时时间过低，可能会导致连接过早断开。
- **网络问题：** 临时的网络中断可能导致连接断开。
- **Postgres 服务器重启：** 如果 Postgres 服务器被重启或发生崩溃，连接将会丢失。

### 我的 replication slot 失效了。我该怎么办？ \{#my-replication-slot-is-invalidated-what-should-i-do\}

恢复 ClickPipe 的唯一方式是触发一次重新同步（resync），你可以在 Settings 页面中执行此操作。

replication slot 失效最常见的原因是 PostgreSQL 数据库上的 `max_slot_wal_keep_size` 设置过小（例如只有几个 GB）。我们建议增大该值。请[参阅本节](/integrations/clickpipes/postgres/faq#recommended-max_slot_wal_keep_size-settings)以调优 `max_slot_wal_keep_size`。理想情况下，应将其设置为至少 200GB，以防止 replication slot 失效。

在少数情况下，即使未配置 `max_slot_wal_keep_size`，我们也观察到会出现该问题。这可能是 PostgreSQL 中一个较为复杂且罕见的 bug 所致，尽管其根本原因仍不清楚。

### 在 ClickPipe 摄取数据时，ClickHouse 出现内存不足（OOM）情况。可以如何处理？ \{#i-am-seeing-out-of-memory-ooms-on-clickhouse-while-my-clickpipe-is-ingesting-data-can-you-help\}

ClickHouse 出现 OOM 的一个常见原因是服务规格过小。这意味着当前的服务配置没有足够的资源（例如内存或 CPU）来有效处理摄取负载。我们强烈建议对服务进行扩容，以满足 ClickPipe 数据摄取的需求。

我们观察到的另一个原因是下游存在可能未对 `JOIN` 做好优化的 Materialized Views：

- 对于 `JOIN`，一个常见的优化技巧是：如果使用的是 `LEFT JOIN`，且右侧表非常大，可以将查询改写为使用 `RIGHT JOIN`，并把较大的表移动到左侧。这样可以让查询规划器在内存使用上更加高效。

- 对于 `JOIN` 的另一种优化方式是，先通过 `subqueries` 或 `CTEs` 显式过滤各个表，然后在这些 subqueries 上执行 `JOIN`。这可以为规划器提供有关如何高效过滤行并执行 `JOIN` 的提示。

### 在初始加载过程中出现 `invalid snapshot identifier` 错误。我该怎么办？ \{#i-am-seeing-an-invalid-snapshot-identifier-during-the-initial-load-what-should-i-do\}

当 ClickPipes 与 Postgres 数据库之间的连接中断时，会出现 `invalid snapshot identifier` 错误。这可能是由于网关超时、数据库重启或其他瞬时性问题导致的。

建议在 Initial Load 正在进行时，不要在 Postgres 数据库上执行诸如升级或重启等可能造成中断的操作，并确保到数据库的网络连接保持稳定。

要解决此问题，可以在 ClickPipes UI 中触发一次重新同步（resync）。这将从头重新启动初始加载过程。

### 如果我在 Postgres 中删除了一个 publication，会发生什么？ \{#what-happens-if-i-drop-a-publication-in-postgres\}

在 Postgres 中删除 publication 会中断您的 ClickPipe 连接，因为 ClickPipe 需要依赖该 publication 从源数据库拉取变更。发生这种情况时，您通常会收到一条错误告警，提示该 publication 已不存在。

在删除 publication 之后，要恢复您的 ClickPipe：

1. 在 Postgres 中使用相同名称并包含所需表创建一个新的 publication
2. 在 ClickPipe 的 Settings 选项卡中点击 “Resync tables” 按钮

这个重新同步步骤是必要的，因为即使名称相同，重新创建的 publication 在 Postgres 中也会拥有不同的 Object Identifier (OID)。重新同步过程会刷新目标表并恢复连接。

另外，如果您愿意，也可以创建一个全新的 pipe。

请注意，如果您正在使用分区表，务必使用合适的设置来创建您的 publication：

```sql
CREATE PUBLICATION clickpipes_publication
FOR TABLE <...>, <...>
WITH (publish_via_partition_root = true);
```


### 如果我看到 `Unexpected Datatype` 错误或 `Cannot parse type XX ...` 怎么办 \{#what-if-i-am-seeing-unexpected-datatype-errors\}

通常在源 Postgres 数据库中存在某种在摄取过程中无法映射的数据类型时，会出现此错误。
针对更具体的问题，请参考下面列出的几种可能情况。

### 在复制/复制槽创建期间出现 `invalid memory alloc request size <XXX>` 之类的错误 \{#postgres-invalid-memalloc-bug\}

Postgres 补丁版本 17.5/16.9/15.13/14.18/13.21 中引入了一个 bug，在某些负载下会导致内存使用呈指数级增长，最终触发一次大于 1GB 的内存分配请求，而 Postgres 会将其视为无效。该 bug [已经被修复](https://github.com/postgres/postgres/commit/d87d07b7ad3b782cb74566cd771ecdb2823adf6a)，并会包含在下一轮 Postgres 补丁发布（17.6...）中。请与您的 Postgres 服务提供商确认该补丁版本何时可用于升级。如果暂时无法升级，那么在触发该错误时，需要对管道（pipe）进行一次重新同步（resync）。

### 我需要在 ClickHouse 中保留完整的历史记录，即使源 Postgres 数据库中的数据被删除也是如此。在 ClickPipes 中，我能否完全忽略对 Postgres 的 DELETE 和 TRUNCATE 操作？ \{#ignore-delete-truncate\}

可以！在创建 Postgres ClickPipe 之前，先创建一个不包含 DELETE 操作的 publication（发布）。例如：

```sql
CREATE PUBLICATION <pub_name> FOR TABLES IN SCHEMA <schema_name> WITH (publish = 'insert,update');
```

然后在[配置](https://clickhouse.com/docs/integrations/clickpipes/postgres#configuring-the-replication-settings) Postgres ClickPipe 时，确保选择了这个 publication 名称。

请注意，ClickPipes 会忽略 TRUNCATE 操作，这些操作不会被复制到 ClickHouse 中。


### 为什么我无法复制名称中带点的表？ \{#replicate-table-dot\}

PeerDB 目前有一个限制：当源表标识符中包含点（即 schema 名称或表名中带有点）时，不支持进行复制，因为在这种情况下，PeerDB 在按点分隔后无法区分哪一部分是 schema、哪一部分是表名。
我们正在改进，以支持分别输入 schema 和表名，从而绕过这一限制。

### 初始加载已完成，但在 ClickHouse 中没有数据或存在缺失。这可能是什么问题？ \{#initial-load-issue\}

如果初始加载在没有报错的情况下完成，但目标 ClickHouse 表中仍然缺少数据，可能是因为在源 Postgres 表上启用了 RLS（Row Level Security，行级安全）策略。
还应检查以下内容：

- 用户是否具有读取源表的足够权限。
- 在 ClickHouse 端是否存在可能过滤掉行的行策略（row policy）。

### 我可以让 ClickPipe 创建启用了故障转移的 replication slot 吗？ \{#failover-slot\}

可以，对于复制模式为 CDC 或 Snapshot + CDC 的 Postgres ClickPipe，你可以在创建 ClickPipe 时，在 `Advanced Settings` 部分打开下方的开关，让 ClickPipes 创建启用了故障转移的 replication slot。请注意，你的 Postgres 版本必须是 17 或更高才能使用此功能。

<Image img={failover_slot} border size="md"/>

如果源端按相应方式完成配置，在发生故障转移到 Postgres 只读副本后，该 slot 会被保留，从而确保数据复制可以持续进行。你可以在[此处](https://www.postgresql.org/docs/current/logical-replication-failover.html)了解更多信息。

### 我遇到了类似 `Internal error encountered during logical decoding of aborted sub-transaction` 的错误 \{#transient-logical-decoding-errors\}

此错误表明在对已中止子事务进行逻辑解码时出现了短暂性问题，并且这是 Aurora Postgres 自定义实现所特有的。由于该错误来自 `ReorderBufferPreserveLastSpilledSnapshot` 例程，这表明逻辑解码无法读取已落盘的快照。可以尝试将 [`logical_decoding_work_mem`](https://www.postgresql.org/docs/current/runtime-config-resource.html#GUC-LOGICAL-DECODING-WORK-MEM) 调整为更高的值。

### 在进行 CDC 复制时，我看到类似 `error converting new tuple to map` 或 `error parsing logical message` 的错误 \{#logical-message-processing-errors\}

Postgres 以遵循固定协议的消息形式发送变更信息。当 ClickPipe 收到无法解析的消息时（可能是由于传输过程中数据损坏，或发送了无效消息），就会产生这些错误。虽然具体问题各不相同，但我们已经在多个来自 Neon Postgres 的数据源中观察到这种情况。如果您在使用 Neon 时也遇到此问题，请向他们提交支持工单。在其他情况下，请联系我们的支持团队以获取指导。

### 我可以把最初从复制中排除的列再包含进来吗？ \{#include-excluded-columns\}

目前尚不支持这样做，替代方案是对包含这些列的[表进行重新同步](./table_resync.md)。

### 我注意到我的 ClickPipe 已进入快照（Snapshot）阶段，但没有数据流入，这可能是什么问题？ \{#snapshot-no-data-flow\}

这可能有多种原因，主要与执行快照所需的一些前置条件耗时比平时更长有关。要了解更多信息，请阅读我们关于并行快照的文档 [此处](./parallel_initial_load.md)。

#### 并行快照在获取分区阶段耗时较长 \{#parallel-snapshotting-taking-time\}

并行快照在初始阶段需要执行几个步骤，以为表获取逻辑分区。若表较小，此过程通常会在几秒内完成；但对于非常大的表（数量级为 TB），则可能需要更长时间。你可以在 **Source** 选项卡中监控 Postgres 源上的正在运行查询，查看是否存在与获取快照分区相关的长时间运行查询。一旦分区获取完成，数据就会开始流入。

#### 复制槽创建被事务锁定 \{#replication-slot-creation-transaction-locked\}

在 Activity 部分下的 **Source** 选项卡中，您会看到 `CREATE_REPLICATION_SLOT` 查询卡在 `Lock` 状态。这可能是因为另一个事务在 Postgres 创建复制槽时，占用了其所需对象上的锁。
要查看阻塞它的查询，您可以在 Postgres 源上运行下面的查询：

```sql
SELECT
  blocked.pid AS blocked_pid,
  blocked.query AS blocked_query,
  blocking.pid AS blocking_pid,
  blocking.query AS blocking_query,
  blocking.state AS blocking_state
FROM pg_locks blocked_lock
JOIN pg_stat_activity blocked
  ON blocked_lock.pid = blocked.pid
JOIN pg_locks blocking_lock
  ON blocking_lock.locktype = blocked_lock.locktype
  AND blocking_lock.database IS NOT DISTINCT FROM blocked_lock.database
  AND blocking_lock.relation IS NOT DISTINCT FROM blocked_lock.relation
  AND blocking_lock.page IS NOT DISTINCT FROM blocked_lock.page
  AND blocking_lock.tuple IS NOT DISTINCT FROM blocked_lock.tuple
  AND blocking_lock.virtualxid IS NOT DISTINCT FROM blocked_lock.virtualxid
  AND blocking_lock.transactionid IS NOT DISTINCT FROM blocked_lock.transactionid
  AND blocking_lock.classid IS NOT DISTINCT FROM blocked_lock.classid
  AND blocking_lock.objid IS NOT DISTINCT FROM blocked_lock.objid
  AND blocking_lock.objsubid IS NOT DISTINCT FROM blocked_lock.objsubid
  AND blocking_lock.pid != blocked_lock.pid
JOIN pg_stat_activity blocking
  ON blocking_lock.pid = blocking.pid
WHERE NOT blocked_lock.granted;
```

一旦你确定了阻塞查询，就可以决定是等待其完成，还是在其不关键时将其取消。阻塞查询处理完成后，复制槽的创建应当继续进行，使快照得以启动并开始接收数据。
