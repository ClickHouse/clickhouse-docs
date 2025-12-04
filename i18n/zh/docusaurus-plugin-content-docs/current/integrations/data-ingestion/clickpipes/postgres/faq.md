---
sidebar_label: '常见问题'
description: '关于 ClickPipes for Postgres 的常见问题。'
slug: /integrations/clickpipes/postgres/faq
sidebar_position: 2
title: 'ClickPipes for Postgres 常见问题解答'
keywords: ['postgres 常见问题', 'clickpipes', 'toast 列', '复制槽', '发布']
doc_type: 'reference'
---

import failover_slot from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/failover_slot.png'
import Image from '@theme/IdealImage';

# ClickPipes for Postgres 常见问题解答（FAQ） {#clickpipes-for-postgres-faq}

### 空闲状态如何影响我的 Postgres CDC ClickPipe？ {#how-does-idling-affect-my-postgres-cdc-clickpipe}

如果你的 ClickHouse Cloud 服务处于空闲状态，你的 Postgres CDC ClickPipe 仍会继续同步数据，你的服务会在下一次同步间隔时被唤醒以处理传入数据。同步完成并再次达到空闲超时时间后，你的服务会重新进入空闲状态。

例如，如果你的同步间隔设置为 30 分钟，而服务空闲超时时间设置为 10 分钟，那么你的服务将每 30 分钟被唤醒一次，保持活跃 10 分钟，然后回到空闲状态。

### 在 ClickPipes for Postgres 中如何处理 TOAST 列？ {#how-are-toast-columns-handled-in-clickpipes-for-postgres}

请参阅 [Handling TOAST Columns](./toast) 页面以获取更多信息。

### 在 ClickPipes for Postgres 中如何处理生成列（generated columns）？ {#how-are-generated-columns-handled-in-clickpipes-for-postgres}

请参阅 [Postgres Generated Columns: Gotchas and Best Practices](./generated_columns) 页面以获取更多信息。

### 表是否必须具有主键才能参与 Postgres CDC？ {#do-tables-need-to-have-primary-keys-to-be-part-of-postgres-cdc}

要使用 ClickPipes for Postgres 对表进行复制，必须为该表定义主键或 [REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY) 之一。

* **Primary Key（主键）**：最直接的方法是在表上定义主键。这样可以为每一行提供唯一标识符，这对于跟踪更新和删除至关重要。在这种情况下，你可以将 REPLICA IDENTITY 设置为 `DEFAULT`（默认行为）。
* **Replica Identity（副本标识）**：如果表没有主键，你可以设置副本标识。副本标识可以设置为 `FULL`，这意味着整行将用于标识变更。或者，如果表上存在唯一索引，你可以将其设置为使用该唯一索引，然后将 REPLICA IDENTITY 设置为 `USING INDEX index_name`。
  要将副本标识设置为 FULL，可以使用以下 SQL 命令：

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

`REPLICA IDENTITY FULL` 还可以使未更改的 TOAST 列也被复制。更多内容参见[这里](./toast)。

请注意，使用 `REPLICA IDENTITY FULL` 可能会影响性能，并导致 WAL 增长加快，尤其是在没有主键且存在频繁更新或删除操作的表上，因为每次变更都需要记录更多数据。如对如何为表配置主键或 REPLICA IDENTITY 有任何疑问，或在配置过程中需要帮助，请联系支持团队获取指导。

需要特别说明的是，如果既没有定义主键也没有定义 REPLICA IDENTITY，ClickPipes 将无法复制该表的变更，并且在复制过程中可能会遇到错误。因此，建议在创建 ClickPipe 之前，先检查表结构，确保其满足上述要求。

### 你们是否支持作为 Postgres CDC 一部分的分区表？ {#do-you-support-partitioned-tables-as-part-of-postgres-cdc}

支持，只要分区表定义了 PRIMARY KEY 或 REPLICA IDENTITY，即可开箱即用。PRIMARY KEY 和 REPLICA IDENTITY 必须同时存在于父表及其各个分区上。你可以在[这里](https://blog.peerdb.io/real-time-change-data-capture-for-postgres-partitioned-tables)了解更多信息。

### 我可以连接没有公网 IP 或位于私有网络中的 Postgres 数据库吗？ {#can-i-connect-postgres-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

可以！用于 Postgres 的 ClickPipes 提供两种方式连接位于私有网络中的数据库：

1. **SSH Tunneling（SSH 隧道）**
   * 适用于大多数使用场景
   * 配置步骤请参见[这里](/integrations/clickpipes/postgres#adding-your-source-postgres-database-connection)
   * 适用于所有区域

2. **AWS PrivateLink**
   * 在以下三个 AWS 区域可用：
     * us-east-1
     * us-east-2
     * eu-central-1
   * 详细配置说明请参见我们的 [PrivateLink 文档](/knowledgebase/aws-privatelink-setup-for-clickpipes)
   * 在不支持 PrivateLink 的区域，请使用 SSH 隧道

### 如何处理 UPDATE 和 DELETE？ {#how-do-you-handle-updates-and-deletes}

ClickPipes for Postgres 会将来自 Postgres 的 INSERT 和 UPDATE 以不同版本的新行（使用 `_peerdb_` 版本列）写入 ClickHouse。`ReplacingMergeTree` 表引擎会在后台基于排序键（ORDER BY 列）定期执行去重，仅保留具有最新 `_peerdb_` 版本的行。

来自 Postgres 的 DELETE 会被传播为标记为已删除的新行（使用 `_peerdb_is_deleted` 列）。由于去重过程是异步的，你可能会在短时间内看到重复数据。为了解决这一问题，需要在查询层进行去重处理。

另请注意，默认情况下，Postgres 在执行 DELETE 操作时，并不会发送那些不属于主键或 replica identity 的列的列值。如果你希望在 DELETE 时捕获整行数据，可以将 [REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY) 设置为 FULL。

更多详情请参考：

* [ReplacingMergeTree 表引擎最佳实践](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling#replacingmergetree-table-engine)
* [Postgres-to-ClickHouse CDC 内部机制博客](https://clickhouse.com/blog/postgres-to-clickhouse-data-modeling-tips)

### 我可以在 PostgreSQL 中更新主键列吗？ {#can-i-update-primary-key-columns-in-postgresql}

:::warning
默认情况下，PostgreSQL 中的主键更新无法在 ClickHouse 中被正确重放。

这一限制存在的原因是 `ReplacingMergeTree` 的去重是基于 `ORDER BY` 列（通常对应主键）进行的。当主键在 PostgreSQL 中被更新时，在 ClickHouse 中会表现为一个具有不同键的新行，而不是对现有行的更新。这可能导致旧的和新的主键值同时存在于你的 ClickHouse 表中。
:::

请注意，在 PostgreSQL 数据库设计中，更新主键列并不是常见做法，因为主键被设计为不可变的标识符。大多数应用在设计上就避免了主键更新，因此在典型使用场景中很少会遇到这一限制。

有一个实验性设置可以启用主键更新处理，但它会带来显著的性能影响，如未经充分评估，不建议在生产环境中使用。

如果你的使用场景需要在 PostgreSQL 中更新主键列，并且希望这些变更能够在 ClickHouse 中被正确反映，请通过 [db-integrations-support@clickhouse.com](mailto:db-integrations-support@clickhouse.com) 联系我们的支持团队，以讨论你的具体需求和潜在解决方案。

### 是否支持 schema 变更？ {#do-you-support-schema-changes}

请参考 [ClickPipes for Postgres：schema 变更传播支持](./schema-changes) 页面获取更多信息。

### ClickPipes for Postgres CDC 的费用是多少？ {#what-are-the-costs-for-clickpipes-for-postgres-cdc}

有关详细的定价信息，请参考我们计费总览页面中的 [ClickPipes for Postgres CDC 定价部分](/cloud/reference/billing/clickpipes)。

### 我的 replication slot 大小在持续增长或没有下降；可能是什么问题？ {#my-replication-slot-size-is-growing-or-not-decreasing-what-might-be-the-issue}

如果你注意到 Postgres replication slot 的大小持续增长或没有回落，通常意味着 **WAL（Write-Ahead Log）记录未被 CDC 管道或复制进程足够快地消费（或“重放”）**。下面是最常见的原因以及对应的解决方法。

1. **数据库活动的突发峰值**
   - 大批量更新、批量插入或较大的 schema 变更会迅速生成大量 WAL 数据。
   - 在这些 WAL 记录被消费之前，replication slot 会持有它们，从而导致大小的暂时飙升。

2. **长时间运行的事务**
   - 一个未结束的事务会迫使 Postgres 保留自该事务开始以来生成的所有 WAL 段，这可能导致 slot 大小急剧增加。
   - 将 `statement_timeout` 和 `idle_in_transaction_session_timeout` 设置为合理的值，以防止事务无限期保持打开状态：
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

3. **维护或工具类操作（例如 `pg_repack`）**
   - 像 `pg_repack` 这样的工具可能会重写整个表，在短时间内生成大量 WAL 数据。
   - 将这些操作安排在流量较低的时段进行，或在运行期间密切监控 WAL 使用情况。

4. **VACUUM 和 VACUUM ANALYZE**
   - 虽然这些操作对数据库健康至关重要，但它们可能会产生额外的 WAL 流量——尤其是在扫描大型表时。
   - 考虑通过调优 autovacuum 参数，或在非高峰时段安排手动 VACUUM 操作。

5. **复制消费者未主动读取 replication slot**
   - 如果你的 CDC 管道（例如 ClickPipes）或其他复制消费者停止、暂停或崩溃，WAL 数据会在该 slot 中不断累积。
   - 确保你的管道持续运行，并检查日志以排查连接或认证错误。

如需对该主题进行更深入的了解，请参阅我们的博客文章：[Overcoming Pitfalls of Postgres Logical Decoding](https://blog.peerdb.io/overcoming-pitfalls-of-postgres-logical-decoding#heading-beware-of-replication-slot-growth-how-to-monitor-it)。

### Postgres 数据类型如何映射到 ClickHouse？ {#how-are-postgres-data-types-mapped-to-clickhouse}

用于 Postgres 的 ClickPipes 旨在在 ClickHouse 端尽可能以原生方式映射 Postgres 数据类型。该文档提供了每种数据类型及其映射的完整列表：[Data Type Matrix](https://docs.peerdb.io/datatypes/datatype-matrix)。

### 在将数据从 Postgres 复制到 ClickHouse 时，我可以自定义数据类型映射吗？ {#can-i-define-my-own-data-type-mapping-while-replicating-data-from-postgres-to-clickhouse}

目前，我们不支持在 pipe 中定义自定义数据类型映射。不过请注意，ClickPipes 使用的默认数据类型映射与原生类型高度一致。Postgres 中的大多数列类型都会尽可能被复制为 ClickHouse 中对应的原生等价类型。例如，Postgres 中的整数数组类型会被复制为 ClickHouse 中的整数数组类型。

### Postgres 中的 JSON 和 JSONB 列是如何复制的？ {#how-are-json-and-jsonb-columns-replicated-from-postgres}

JSON 和 JSONB 列会在 ClickHouse 中复制为 String 类型。由于 ClickHouse 支持原生的 [JSON 类型](/sql-reference/data-types/newjson)，你可以在 ClickPipes 表之上创建一个物化视图，在需要时完成类型转换。或者，你也可以直接在 String 列上使用 [JSON 函数](/sql-reference/functions/json-functions)。我们正在积极开发一个特性，用于将 JSON 和 JSONB 列直接复制为 ClickHouse 中的 JSON 类型。该特性预计将在几个月内发布。

### 当 mirror 被暂停时，插入会发生什么情况？ {#what-happens-to-inserts-when-a-mirror-is-paused}

当你暂停 mirror 时，消息会在源 Postgres 上的 replication slot 中排队，确保它们被缓冲而不会丢失。不过，暂停并恢复 mirror 会重新建立连接，这可能会根据源端情况花费一定时间。

在此过程中，sync（从 Postgres 拉取数据并将其流式写入 ClickHouse 原始表）和 normalize（从原始表到目标表）这两个操作都会被中止。不过，它们会保留恢复所需的状态，确保可以可靠地继续。

- 对于 sync，如果在中途被取消，Postgres 中的 confirmed_flush_lsn 不会前移，因此下一次 sync 会从与中止时相同的位置开始，保证数据一致性。
- 对于 normalize，ReplacingMergeTree 的插入顺序会处理去重。

总而言之，虽然在暂停期间 sync 和 normalize 进程会被终止，但这样做是安全的，因为它们可以在没有数据丢失或不一致的情况下恢复。

### ClickPipe 的创建可以自动化，或通过 API 或 CLI 完成吗？ {#can-clickpipe-creation-be-automated-or-done-via-api-or-cli}

Postgres ClickPipe 也可以通过 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) 端点进行创建和管理。该功能目前处于 beta 阶段，API 参考文档可以在[这里](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/beta)找到。我们也在积极开发 Terraform 支持，以便创建 Postgres ClickPipes。

### 我该如何加速初始加载？ {#how-do-i-speed-up-my-initial-load}

无法加速已经在运行中的初始加载。不过，可以通过调整某些设置来优化后续的初始加载。默认情况下，这些设置为 4 个并行线程，每个分区的快照行数为 100,000。这些属于高级设置，一般对大多数用例已足够。

对于 Postgres 13 或更低版本，CTID 范围扫描速度较慢，这些设置就变得更加关键。在这种情况下，可以考虑按照以下流程提升性能：

1. **删除现有的 pipe**：这是应用新设置所必需的。
2. **删除 ClickHouse 上的目标表**：确保由之前的 pipe 创建的表已被删除。
3. **使用优化后的设置创建新的 pipe**：通常应将每个分区的快照行数提升到 100 万到 1000 万之间，具体取决于实际需求以及 Postgres 实例可承受的负载。

这些调整应能显著提升初始加载的性能，尤其是针对较旧的 Postgres 版本。如果使用的是 Postgres 14 或更高版本，由于对 CTID 范围扫描的支持有所改进，这些设置的影响会相对较小。

### 在设置复制时，我应该如何确定 publication 的范围？ {#how-should-i-scope-my-publications-when-setting-up-replication}

可以让 ClickPipes 管理 publication（需要额外权限），也可以自行创建。如果使用 ClickPipes 管理的 publication，在编辑 pipe 时我们会自动处理表的新增和移除。如果选择自主管理，需要谨慎限定 publication 的范围，仅包含需要复制的表——包含不必要的表会拖慢 Postgres WAL 解码。

如果在 publication 中包含任何表，请确保该表具有主键或 `REPLICA IDENTITY FULL`。如果存在没有主键的表，却为所有表创建了 publication，那么这些表上的 DELETE 和 UPDATE 操作会失败。

若要在数据库中识别没有主键的表，可以使用以下查询：

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

在处理没有主键的表时，有两种选择：

1. **将没有主键的表排除在 ClickPipes 之外**：
   仅包含具有主键的表来创建 publication：
   ```sql
   CREATE PUBLICATION clickpipes_publication FOR TABLE table_with_primary_key1, table_with_primary_key2, ...;
   ```

2. **在 ClickPipes 中包含没有主键的表**：
   如果要包含没有主键的表，需要将它们的 replica identity 修改为 `FULL`。这样可确保 UPDATE 和 DELETE 操作正常工作：
   ```sql
   ALTER TABLE table_without_primary_key1 REPLICA IDENTITY FULL;
   ALTER TABLE table_without_primary_key2 REPLICA IDENTITY FULL;
   CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>;
   ```

:::tip
如果是手动创建 publication，而不是让 ClickPipes 管理它，我们不建议创建 `FOR ALL TABLES` 的 publication。这样会导致从 Postgres 到 ClickPipes 的流量增加（会发送不在该 pipe 中的其他表的变更），从而降低整体效率。

对于手动创建的 publication，请在将表加入 pipe 之前，先将希望使用的所有表添加到该 publication 中。
:::

:::warning
如果是从 Postgres 的只读副本/热备库进行复制，则需要在主库上创建自己的 publication，该 publication 会自动传播到备库。在这种情况下，由于无法在备库上创建 publication，ClickPipe 将无法管理该 publication。
:::

### 推荐的 `max_slot_wal_keep_size` 设置 {#recommended-max_slot_wal_keep_size-settings}

* **最低要求：** 将 [`max_slot_wal_keep_size`](https://www.postgresql.org/docs/devel/runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE) 设置为至少保留 **两天的** WAL 数据。
* **针对大型数据库（高事务量）：** 至少保留相当于每天峰值 WAL 生成量 **2–3 倍** 的数据。
* **针对存储受限环境：** 谨慎调优以在**避免磁盘耗尽**的同时确保复制稳定性。

#### 如何计算合适的值 {#how-to-calculate-the-right-value}

要确定合适的配置，先测量 WAL 的生成速率：

##### 适用于 PostgreSQL 10+ {#for-postgresql-10}

```sql
SELECT pg_wal_lsn_diff(pg_current_wal_insert_lsn(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

##### 适用于 PostgreSQL 9.6 及更早版本： {#for-postgresql-96-and-below}

```sql
SELECT pg_xlog_location_diff(pg_current_xlog_insert_location(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

* 在一天中的不同时间运行上述查询，尤其是在事务量高峰期。
* 计算每 24 小时内生成的 WAL 总量。
* 将该数值乘以 2 或 3，以提供足够的保留量。
* 将 `max_slot_wal_keep_size` 设置为计算得到的值（以 MB 或 GB 为单位）。

##### 示例 {#example}

如果你的数据库每天生成 100 GB 的 WAL，则将其设置为：

```sql
max_slot_wal_keep_size = 200GB
```

### 我在日志中看到 ReceiveMessage EOF 错误。这意味着什么？ {#im-seeing-a-receivemessage-eof-error-in-the-logs-what-does-it-mean}

`ReceiveMessage` 是 Postgres 逻辑解码协议中的一个函数，用于从复制流中读取消息。EOF（End of File，文件结束）错误表示在尝试从复制流中读取数据时，与 Postgres 服务器的连接被意外关闭。

这是一个可恢复且完全非致命的错误。ClickPipes 会自动尝试重新连接并恢复复制过程。

它可能由以下几个原因导致：

* **`wal_sender_timeout` 设置过低：** 请确保 `wal_sender_timeout` 至少为 5 分钟。该设置控制服务器在关闭连接前等待客户端响应的时间。如果超时时间过低，可能会导致连接过早断开。
* **网络问题：** 临时的网络中断可能会导致连接掉线。
* **Postgres 服务器重启：** 如果 Postgres 服务器被重启或崩溃，连接将会丢失。

### 我的复制槽（replication slot）被作废了。我应该怎么办？ {#my-replication-slot-is-invalidated-what-should-i-do}

恢复 ClickPipe 的唯一方式是触发重新同步（resync），您可以在 Settings 页面中进行此操作。

复制槽失效最常见的原因是 PostgreSQL 数据库上的 `max_slot_wal_keep_size` 设置过低（例如仅为几 GB）。我们建议增大该值。[参阅本节](/integrations/clickpipes/postgres/faq#recommended-max_slot_wal_keep_size-settings) 了解如何调优 `max_slot_wal_keep_size`。理想情况下，该值至少应设置为 200GB，以防止复制槽失效。

在少数情况下，即使未配置 `max_slot_wal_keep_size`，我们也观察到该问题发生。这可能是 PostgreSQL 中一个复杂且罕见的 Bug 所致，尽管具体原因仍不清楚。

### 在 ClickPipe 摄取数据时，我在 ClickHouse 上看到内存不足（OOM）问题。你们能帮忙吗？ {#i-am-seeing-out-of-memory-ooms-on-clickhouse-while-my-clickpipe-is-ingesting-data-can-you-help}

ClickHouse 出现 OOM 的一个常见原因是服务规格过小。这意味着您当前的服务配置没有足够的资源（例如内存或 CPU）来有效处理摄取负载。我们强烈建议对服务进行扩容，以满足 ClickPipe 数据摄取的需求。

我们观察到的另一个原因是下游物化视图（Materialized Views）中存在可能未优化的 JOIN 操作：

* 对 JOIN 的一个常见优化技巧是：如果您有一个 `LEFT JOIN`，且右侧的表非常大，那么可以将查询改写为使用 `RIGHT JOIN`，并将较大的表移动到左侧。这样可以让查询计划器在内存使用方面更加高效。

* 对 JOIN 的另一种优化方式是，通过 `subqueries` 或 `CTEs` 显式地对表进行过滤，然后在这些子查询之间执行 `JOIN`。这为查询计划器提供了关于如何高效过滤行并执行 `JOIN` 的提示。

### 在初始加载过程中，我看到了 `invalid snapshot identifier` 错误。我应该怎么办？ {#i-am-seeing-an-invalid-snapshot-identifier-during-the-initial-load-what-should-i-do}

`invalid snapshot identifier` 错误发生在 ClickPipes 与 Postgres 数据库之间的连接中断时。该问题可能由网关超时、数据库重启或其他瞬时问题引起。

建议在 Initial Load 正在进行时，不要对 Postgres 数据库执行任何具有破坏性的操作，例如升级或重启，并确保到数据库的网络连接稳定。

要解决该问题，您可以在 ClickPipes 的 UI 中触发一次重新同步（resync）。这会从头重新启动初始加载流程。

### 如果我在 Postgres 中删除了 publication，会发生什么？ {#what-happens-if-i-drop-a-publication-in-postgres}

在 Postgres 中删除 publication 会导致您的 ClickPipe 连接中断，因为 ClickPipe 从源端拉取变更时需要依赖该 publication。发生这种情况时，您通常会收到一条错误告警，说明该 publication 已不存在。

在删除 publication 之后，要恢复您的 ClickPipe：

1. 在 Postgres 中创建一个具有相同名称且包含所需表的新 publication
2. 在 ClickPipe 的 Settings 选项卡中点击“Resync tables”按钮

之所以需要执行这次重新同步，是因为即使 publication 名称相同，在 Postgres 中重新创建的 publication 也会拥有不同的 Object Identifier (OID)。重新同步过程会刷新您的目标表并恢复连接。

或者，如果您愿意，也可以创建一个全新的 ClickPipe。

请注意，如果您在使用分区表，请务必使用合适的设置来创建 publication：

```sql
CREATE PUBLICATION clickpipes_publication
FOR TABLE <...>, <...>
WITH (publish_via_partition_root = true);
```

### 如果我看到 `Unexpected Datatype` 错误或 `Cannot parse type XX ...` 怎么办 {#what-if-i-am-seeing-unexpected-datatype-errors}

当源 Postgres 数据库中存在在摄取过程中无法映射的数据类型时，通常会出现此错误。
如需排查更具体的情况，请参考以下几种可能性。

### 我在复制/创建复制槽（slot）时看到类似 `invalid memory alloc request size <XXX>` 的错误 {#postgres-invalid-memalloc-bug}

在 Postgres 补丁版本 17.5/16.9/15.13/14.18/13.21 中引入了一个 bug，某些工作负载会导致内存使用呈指数级增长，从而产生大于 1GB 的内存分配请求，而 Postgres 会认为这类请求无效。该 bug [已经修复](https://github.com/postgres/postgres/commit/d87d07b7ad3b782cb74566cd771ecdb2823adf6a)，并会包含在下一轮 Postgres 补丁版本（17.6...）中。请联系您的 Postgres 服务提供商，了解该补丁版本何时可用于升级。如果暂时无法升级，当出现该错误时，需要对 ClickPipe 进行重新同步（resync）。

### 我需要在 ClickHouse 中保留完整的历史记录，即使源 Postgres 数据库中的数据被删除。是否可以在 ClickPipes 中完全忽略来自 Postgres 的 DELETE 和 TRUNCATE 操作？ {#ignore-delete-truncate}

可以！在创建 Postgres ClickPipe 之前，先创建一个不包含 DELETE 操作的 publication。例如：

```sql
CREATE PUBLICATION <发布名> FOR TABLES IN SCHEMA <模式名> WITH (publish = 'insert,update');
```

然后在[设置](https://clickhouse.com/docs/integrations/clickpipes/postgres#configuring-the-replication-settings) Postgres ClickPipe 时，确保选择该 publication 名称。

请注意，ClickPipes 会忽略 TRUNCATE 操作，这些操作不会被复制到 ClickHouse。

### 为什么我无法复制名称中带点的表？ {#replicate-table-dot}

PeerDB 目前存在一个限制：源表标识符中包含点（即 schema 名称或表名称中有点）时，不支持进行复制，因为在这种情况下，PeerDB 通过点进行拆分时，无法正确区分哪一部分是 schema、哪一部分是表名。
目前正致力于通过分别输入 schema 和表名的方式来绕过这一限制。

### 初始加载完成后，ClickHouse 上没有数据或数据缺失。可能是什么问题？ {#initial-load-issue}

如果初始加载在没有报错的情况下完成，但目标 ClickHouse 表中仍有数据缺失，可能是因为在源 Postgres 表上启用了 RLS（行级安全，Row Level Security）策略。
还应检查以下内容：

* 用户是否具有读取源表的足够权限。
* ClickHouse 端是否存在可能过滤掉数据行的行策略。

### 我能否让 ClickPipe 创建启用故障切换的 replication slot？ {#failover-slot}

可以。对于复制模式为 CDC 或 Snapshot + CDC 的 Postgres ClickPipe，你可以在创建 ClickPipe 时，在 `Advanced Settings` 部分打开下方的开关，让 ClickPipes 创建启用故障切换的 replication slot（复制槽）。请注意，使用该功能时，你的 Postgres 版本必须为 17 或更高。

<Image img={failover_slot} border size="md" />

如果源端按要求完成了配置，那么在故障转移到 Postgres 只读副本后，该复制槽会被保留，从而确保数据持续复制。了解更多信息请参见[此处](https://www.postgresql.org/docs/current/logical-replication-failover.html)。

### 我看到类似 `Internal error encountered during logical decoding of aborted sub-transaction` 的错误 {#transient-logical-decoding-errors}

此错误表明在对已回滚子事务进行逻辑解码时出现短暂性问题，并且是 Aurora Postgres 自定义实现特有的问题。由于该错误来自 `ReorderBufferPreserveLastSpilledSnapshot` 例程，这表明逻辑解码无法读取已溢写到磁盘的快照。建议尝试将 [`logical_decoding_work_mem`](https://www.postgresql.org/docs/current/runtime-config-resource.html#GUC-LOGICAL-DECODING-WORK-MEM) 设置为更大的值。

### 我在 CDC 复制期间看到类似 `error converting new tuple to map` 或 `error parsing logical message` 的错误 {#logical-message-processing-errors}

Postgres 以消息的形式发送变更信息，这些消息遵循固定协议。当 ClickPipe 收到无法解析的消息时（可能是由于传输过程中的损坏，或发送了无效消息）就会出现上述错误。虽然具体问题通常各不相同，但我们在多个 Neon Postgres 源中观察到过这些情况。如果您在使用 Neon 时也遇到此问题，请向他们提交支持工单。在其他情况下，请联系我们的支持团队以获取指导。
