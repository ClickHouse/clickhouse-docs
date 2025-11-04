---
'sidebar_label': 'FAQ'
'description': '关于 ClickPipes for Postgres 的常见问题。'
'slug': '/integrations/clickpipes/postgres/faq'
'sidebar_position': 2
'title': 'ClickPipes for Postgres 常见问题解答'
'doc_type': 'reference'
---

import failover_slot from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/failover_slot.png'
import Image from '@theme/IdealImage';


# ClickPipes for Postgres 常见问题解答

### 闲置状态如何影响我的 Postgres CDC ClickPipe? {#how-does-idling-affect-my-postgres-cdc-clickpipe}

如果您的 ClickHouse Cloud 服务处于闲置状态，您的 Postgres CDC ClickPipe 将继续同步数据，您的服务将在下一个同步间隔唤醒以处理传入的数据。一旦同步完成并达到闲置期，您的服务将再次进入闲置状态。

举例来说，如果您的同步间隔设置为 30 分钟，而您的服务闲置时间设置为 10 分钟，您的服务将每 30 分钟唤醒一次并活动 10 分钟，然后再次进入闲置状态。

### ClickPipes 如何处理 Postgres 中的 TOAST 列? {#how-are-toast-columns-handled-in-clickpipes-for-postgres}

有关更多信息，请参阅 [处理 TOAST 列](./toast) 页面。

### ClickPipes 如何处理 Postgres 中的生成列? {#how-are-generated-columns-handled-in-clickpipes-for-postgres}

有关更多信息，请参阅 [Postgres 生成列：注意事项和最佳实践](./generated_columns) 页面。

### 表是否需要有主键才能成为 Postgres CDC 的一部分? {#do-tables-need-to-have-primary-keys-to-be-part-of-postgres-cdc}

为了通过 ClickPipes for Postgres 复制表，表必须定义主键或 [REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY)。

- **主键**：最直接的方法是在表上定义主键。这为每一行提供唯一标识符，这对于跟踪更新和删除至关重要。在这种情况下，您可以将 REPLICA IDENTITY 设置为 `DEFAULT`（默认行为）。
- **副本身份标识**：如果表没有主键，您可以设置副本身份标识。副本身份标识可以设置为 `FULL`，这意味着整个行将用于识别更改。或者，您可以选择如果表上已经存在唯一索引，则将其设置为使用该索引，然后将 REPLICA IDENTITY 设置为 `USING INDEX index_name`。
要将副本身份标识设置为 FULL，您可以使用以下 SQL 命令：
```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```
REPLICA IDENTITY FULL 还启用未更改的 TOAST 列的复制。更多内容请见 [这里](./toast)。

请注意，使用 `REPLICA IDENTITY FULL` 可能会对性能产生影响，也会导致更快的 WAL 增长，特别是对于没有主键且频繁更新或删除的表，因为它需要记录更多数据以反映每个更改。如果您对设置表的主键或副本身份标识有任何疑问或需要帮助，请与我们的支持团队联系以获取指导。

重要的是要注意，如果未定义主键或副本身份标识，ClickPipes 将无法复制该表的更改，您可能会在复制过程期间遇到错误。因此，建议在设置 ClickPipe 之前检查您的表模式并确保其满足这些要求。

### 您支持作为 Postgres CDC 一部分的分区表吗? {#do-you-support-partitioned-tables-as-part-of-postgres-cdc}

是的，分区表在开箱即用时得到支持，只要它们定义了主键或副本身份标识。主键和副本身份标识必须在父表及其分区中均存在。您可以在 [这里](https://blog.peerdb.io/real-time-change-data-capture-for-postgres-partitioned-tables) 阅读更多有关此方面的信息。

### 我可以连接没有公共 IP 或位于私有网络的 Postgres 数据库吗? {#can-i-connect-postgres-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

可以！ ClickPipes for Postgres 提供两种连接私有网络数据库的方法：

1. **SSH 隧道**
   - 适用于大多数用例
   - 有关设置说明，请参见 [这里](/integrations/clickpipes/postgres#adding-your-source-postgres-database-connection)
   - 在所有区域均可使用

2. **AWS PrivateLink**
   - 在三个 AWS 区域中可用：
     - us-east-1
     - us-east-2
     - eu-central-1
   - 有关详细的设置说明，请参见我们的 [PrivateLink 文档](/knowledgebase/aws-privatelink-setup-for-clickpipes)
   - 对于未提供 PrivateLink 的区域，请使用 SSH 隧道

### 您如何处理 UPDATE 和 DELETE？ {#how-do-you-handle-updates-and-deletes}

ClickPipes for Postgres 捕获 Postgres 中的 INSERT 和 UPDATE 作为在 ClickHouse 中具有不同版本的新行（使用 `_peerdb_` 版本列）。ReplacingMergeTree 表引擎根据排序键（ORDER BY 列）在后台定期执行去重，只保留具有最新 `_peerdb_` 版本的行。

来自 Postgres 的 DELETE 作为标记为已删除的新行传播（使用 `_peerdb_is_deleted` 列）。由于去重过程是异步的，您可能会暂时看到重复项。为了解决此问题，您需要在查询层处理去重。

还要注意，默认情况下，Postgres 在 DELETE 操作期间不会发送不属于主键或副本身份标识的列值。如果您想在 DELETE 操作期间捕获完整的行数据，您可以将 [REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY) 设置为 FULL。

有关更多详细信息，请参考：

* [ReplacingMergeTree 表引擎最佳实践](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling#replacingmergetree-table-engine)
* [Postgres 到 ClickHouse CDC 内部原理博客](https://clickhouse.com/blog/postgres-to-clickhouse-data-modeling-tips)

### 我可以在 PostgreSQL 中更新主键列吗? {#can-i-update-primary-key-columns-in-postgresql}

:::warning
PostgreSQL 中的主键更新不能在 ClickHouse 中被正确重放。

此限制存在的原因是 `ReplacingMergeTree` 去重是基于 `ORDER BY` 列（通常与主键对应）进行的。当 PostgreSQL 中的主键被更新时，它在 ClickHouse 中表现为具有不同键的新行，而不是现有行的更新。这可能导致 ClickHouse 表中存在旧的和新的主键值。
:::

请注意，在 PostgreSQL 数据库设计中，更新主键列并不常见，因为主键旨在是不可变的标识符。大多数应用程序通过设计避免主键更新，这使得此限制在典型用例中很少遇到。

有一个实验性设置可以启用主键更新处理，但它具有显著的性能影响，并且不建议在未经过仔细考虑的情况下用于生产。

如果您的用例需要在 PostgreSQL 中更新主键列并希望这些更改在 ClickHouse 中正确反映，请通过 [db-integrations-support@clickhouse.com](mailto:db-integrations-support@clickhouse.com) 联系我们的支持团队，讨论您的具体需求和潜在解决方案。

### 您支持架构更改吗？ {#do-you-support-schema-changes}

有关更多信息，请参阅 [ClickPipes for Postgres：架构更改传播支持](./schema-changes) 页面。

### ClickPipes for Postgres CDC 的费用是多少？ {#what-are-the-costs-for-clickpipes-for-postgres-cdc}

有关详细定价信息，请参阅 [我们主要计费概述页面上的 ClickPipes for Postgres CDC 定价部分](/cloud/reference/billing/clickpipes)。

### 我的复制插槽大小正在增长或没有减少；可能是什么问题？ {#my-replication-slot-size-is-growing-or-not-decreasing-what-might-be-the-issue}

如果您注意到 Postgres 复制插槽的大小持续增加或未下降，这通常意味着 **WAL（预写日志）记录没有被您的 CDC 管道或复制过程快速消费（或“重放”）**。以下是最常见的原因以及如何解决它们。

1. **数据库活动的突然激增**
   - 大批量更新、批量插入或重大架构更改可以迅速生成大量 WAL 数据。
   - 复制插槽将保存这些 WAL 记录，直到它们被消费，从而导致暂时的规模激增。

2. **长时间运行的事务**
   - 打开的事务会强制 Postgres 保留自事务开始以来生成的所有 WAL 段，这可能会显著增加插槽大小。
   - 将 `statement_timeout` 和 `idle_in_transaction_session_timeout` 设置为合理值，以防止事务无限期保持开放：
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
     使用此查询识别异常长时间运行的事务。

3. **维护或实用程序操作（例如，`pg_repack`）**
   - 像 `pg_repack` 这样的工具可以重写整个表，在短时间内生成大量 WAL 数据。
   - 在流量较低的时间进行这些操作，或在它们运行时密切监控您的 WAL 使用情况。

4. **VACUUM 和 VACUUM ANALYZE**
   - 尽管对数据库健康至关重要，这些操作可能会产生额外的 WAL 流量，特别是如果它们扫描大表。
   - 考虑使用 autovacuum 调优参数或在非高峰时段安排手动 VACUUM 操作。

5. **复制消费者未积极读取槽**
   - 如果您的 CDC 管道（例如 ClickPipes）或其他复制消费者停止、暂停或崩溃，WAL 数据将积累在插槽中。
   - 确保您的管道持续运行并检查日志以查看连接或身份验证错误。

有关此主题的深入探讨，可以查看我们的博客文章：[克服 Postgres 逻辑解码的陷阱](https://blog.peerdb.io/overcoming-pitfalls-of-postgres-logical-decoding#heading-beware-of-replication-slot-growth-how-to-monitor-it)。

### Postgres 数据类型如何映射到 ClickHouse？ {#how-are-postgres-data-types-mapped-to-clickhouse}

ClickPipes for Postgres 旨在尽可能原生地在 ClickHouse 端映射 Postgres 数据类型。此文档提供了每种数据类型及其映射的全面列表：[数据类型矩阵](https://docs.peerdb.io/datatypes/datatype-matrix)。

### 我可以在将数据从 Postgres 复制到 ClickHouse 时定义自己的数据类型映射吗？ {#can-i-define-my-own-data-type-mapping-while-replicating-data-from-postgres-to-clickhouse}

目前，我们不支持在管道中定义自定义数据类型映射。但是，请注意，ClickPipes 使用的默认数据类型映射是高度原生的。大多数 Postgres 中的列类型在 ClickHouse 中被尽可能接近其原生等效物进行复制。例如，Postgres 中的整数数组类型在 ClickHouse 中被复制为整数数组类型。

### JSON 和 JSONB 列如何从 Postgres 复制？ {#how-are-json-and-jsonb-columns-replicated-from-postgres}

JSON 和 JSONB 列在 ClickHouse 中作为字符串类型进行复制。由于 ClickHouse 支持原生 [JSON 类型](/sql-reference/data-types/newjson)，您可以在 ClickPipes 表上创建物化视图来执行翻译，如有需要。或者，您可以直接在字符串列上使用 [JSON 函数](/sql-reference/functions/json-functions)。我们正在积极开发一个功能，可以直接将 JSON 和 JSONB 列复制到 ClickHouse 的 JSON 类型中。预计该功能将在几个月内可用。

### 当镜像暂停时插入会发生什么？ {#what-happens-to-inserts-when-a-mirror-is-paused}

当您暂停镜像时，消息会在源 Postgres 的复制插槽中排队，确保它们被缓冲并不会丢失。然而，暂停和恢复镜像将重新建立连接，这可能需要一些时间，具体取决于源。

在此过程中，同步（从 Postgres 拉取数据并将其流式传输到 ClickHouse 原始表）和规范化（从原始表到目标表）操作会被中止。然而，它们保留了所需的状态以确保可以持久地恢复。

- 对于同步，如果中途被取消，则 Postgres 中的 confirmed_flush_lsn 不会被推进，因此下一个同步将从与中止的同步相同的位置开始，以确保数据一致性。
- 对于规范化，ReplacingMergeTree 插入顺序处理去重。

总之，虽然在暂停期间同步和规范化过程会被终止，但这样做是安全的，因为它们可以在没有数据丢失或不一致的情况下恢复。

### ClickPipe 创建可以自动化或通过 API 或 CLI 完成吗？ {#can-clickpipe-creation-be-automated-or-done-via-api-or-cli}

Postgres ClickPipe 也可以通过 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) 端点创建和管理。该功能正在测试中，API 参考可以在 [这里](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/beta) 找到。我们还在积极开发 Terraform 支持，以创建 Postgres ClickPipes。

### 我如何加速我的初始加载？ {#how-do-i-speed-up-my-initial-load}

您不能加速已经运行的初始加载。但是，您可以通过调整某些设置来优化未来的初始加载。默认情况下，这些设置配置为 4 个并行线程，每个分区的快照行数设置为 100,000。这些是高级设置，通常对大多数用例足够。

对于 PostgreSQL 版本 13 或更低，CTID 范围扫描较慢，这些设置变得更为关键。在这种情况下，请考虑以下过程来提高性能：

1. **删除现有管道**：这对于应用新设置是必要的。
2. **删除 ClickHouse 上的目标表**：确保移除由之前的管道创建的表。
3. **使用优化的设置创建新的管道**：通常，将每个分区的快照行数增加到 100 万到 1000 万之间，具体取决于您的特定要求以及您的 Postgres 实例可以处理的负载。

这些调整应该显著增强初始加载的性能，特别是对于较旧的 Postgres 版本。如果您使用的是 Postgres 14 或更高版本，这些设置的影响较小，因为对 CTID 范围扫描的支持有所改善。

### 在设置复制时，我应该如何界定我的发布范围？ {#how-should-i-scope-my-publications-when-setting-up-replication}

您可以让 ClickPipes 管理您的发布（需要额外权限）或自己创建。通过 ClickPipes 管理的发布，我们会在您编辑管道时自动处理表的添加和删除。如果自主管理，请仔细界定您的发布范围，仅包括您需要复制的表——包括不必要的表将减慢 Postgres WAL 解码的速度。

如果您在发布中包含任何表，请确保它至少具有主键或 `REPLICA IDENTITY FULL`。如果您有没有主键的表，为所有表创建发布将导致这些表的 DELETE 和 UPDATE 操作失败。

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

在处理没有主键的表时，您有两个选择：

1. **从 ClickPipes 中排除没有主键的表**：
   仅使用具有主键的表创建发布：
```sql
CREATE PUBLICATION clickpipes_publication FOR TABLE table_with_primary_key1, table_with_primary_key2, ...;
```

2. **在 ClickPipes 中包含没有主键的表**：
   如果要包括没有主键的表，则需要将它们的副本身份标识更改为 `FULL`。这确保 UPDATE 和 DELETE 操作能够正常工作：
```sql
ALTER TABLE table_without_primary_key1 REPLICA IDENTITY FULL;
ALTER TABLE table_without_primary_key2 REPLICA IDENTITY FULL;
CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>;
```

:::tip
如果您手动创建发布而不是让 ClickPipes 管理它，我们不建议创建 `FOR ALL TABLES` 的发布，这会导致更多来自 Postgres 到 ClickPipes 的流量（向其他未在管道中的表发送更改），并降低整体效率。

对于手动创建的发布，请在将任何表添加到管道之前，将它们添加到发布中。
:::

:::warning
如果您正在从 Postgres 读取副本/热备份进行复制，您需要在主实例上创建自己的发布，这将自动传播到备份。在这种情况下，ClickPipe 将无法管理发布，因为您无法在备份上创建发布。
:::

### 推荐的 `max_slot_wal_keep_size` 设置 {#recommended-max_slot_wal_keep_size-settings}

- **至少：**设置 [`max_slot_wal_keep_size`](https://www.postgresql.org/docs/devel/runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE) 以保留至少 **两天的** WAL 数据。
- **对于大型数据库（高事务量）：**至少保留 **2-3 倍** 的每天峰值 WAL 生成。
- **对于存储受限的环境：**适度调整以 **避免磁盘耗尽**，同时确保复制的稳定性。

#### 如何计算正确值 {#how-to-calculate-the-right-value}

要确定正确的设置，请测量 WAL 生成率：

##### 对于 PostgreSQL 10+ {#for-postgresql-10}

```sql
SELECT pg_wal_lsn_diff(pg_current_wal_insert_lsn(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

##### 对于 PostgreSQL 9.6 及以下版本： {#for-postgresql-96-and-below}

```sql
SELECT pg_xlog_location_diff(pg_current_xlog_insert_location(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

* 在一天中的不同时间运行上述查询，特别是在高交易期间。
* 计算每 24 小时生成多少 WAL。
* 将该数字乘以 2 或 3 以提供足够的保留。
* 将 `max_slot_wal_keep_size` 设置为以 MB 或 GB 为单位的结果值。

##### 示例 {#example}

如果您的数据库每天生成 100 GB 的 WAL，请设置：

```sql
max_slot_wal_keep_size = 200GB
```

### 我在日志中看到 ReceiveMessage EOF 错误。这意味着什么？ {#im-seeing-a-receivemessage-eof-error-in-the-logs-what-does-it-mean}

`ReceiveMessage` 是 Postgres 逻辑解码协议中的一个函数，用于从复制流中读取消息。EOF（文件结束）错误表示在尝试从复制流中读取时，与 Postgres 服务器的连接意外关闭。

这是一种可恢复的，完全无害的错误。ClickPipes 会自动尝试重新连接并恢复复制过程。

可能出现这种情况的原因有几个：
- **低 wal_sender_timeout:** 请确保 `wal_sender_timeout` 至少为 5 分钟或更长。此设置控制服务器在关闭连接之前等待来自客户端的响应的时间。如果超时时间过短，可能会导致过早断开连接。
- **网络问题：**临时网络中断可能导致连接中断。
- **Postgres 服务器重启：**如果 Postgres 服务器重启或崩溃，则连接将丢失。

### 我的复制插槽失效了。我该怎么做？ {#my-replication-slot-is-invalidated-what-should-i-do}

恢复 ClickPipe 的唯一方法是触发重新同步，您可以在“设置”页面执行此操作。

复制插槽失效的最常见原因是 PostgreSQL 数据库上 `max_slot_wal_keep_size` 设置过低（例如，几 GB）。我们建议增加此值。有关 `max_slot_wal_keep_size` 的调优，请参阅 [本节](/integrations/clickpipes/postgres/faq#recommended-max_slot_wal_keep_size-settings)。理想情况下，此值应设置为至少 200GB，以防止复制插槽失效。

在极少数情况下，我们发现即使未配置 `max_slot_wal_keep_size` 也会出现此问题。这可能是由于 PostgreSQL 中的一种复杂且罕见的错误，尽管原因依然不清楚。

### 在 ClickHouse 中，我在 ClickPipe 数据摄取时看到内存不足（OOM）。你能帮忙吗？ {#i-am-seeing-out-of-memory-ooms-on-clickhouse-while-my-clickpipe-is-ingesting-data-can-you-help}

ClickHouse 上 OOM 的一个常见原因是您的服务配置不足。这意味着您当前的服务配置没有足够的资源（例如内存或 CPU）来有效处理摄取负载。我们强烈建议增加服务规模，以满足 ClickPipe 数据摄取的需求。

我们观察到的另一个原因是下游物化视图存在潜在的未优化连接：

- 对于 JOIN 的一项常见优化技术是，如果您具有关联一个非常大的右侧表的 `LEFT JOIN`。在这种情况下，请重写查询以使用 `RIGHT JOIN`，并将较大的表移动到左侧。这使查询规划更具内存效率。

- 对于 JOIN 的另一种优化是通过 `子查询` 或 `CTE` 明确过滤表，然后跨这些子查询执行 `JOIN`。这为规划器提供提示，以有效过滤行和执行 `JOIN`。

### 在初始加载期间，我在看到 `invalid snapshot identifier` 错误。我该怎么办？ {#i-am-seeing-an-invalid-snapshot-identifier-during-the-initial-load-what-should-i-do}

`invalid snapshot identifier` 错误发生在 ClickPipes 和您的 Postgres 数据库之间存在连接中断时。这可能是由于网关超时、数据库重启或其他瞬态问题。

建议您在初始加载进行时不要进行任何破坏性操作，例如升级或重启您的 Postgres 数据库，并确保与数据库的网络连接稳定。

要解决此问题，您可以从 ClickPipes UI 触发重新同步。这将从头开始重新启动初始加载过程。

### 如果我在 Postgres 中放弃发布会发生什么？ {#what-happens-if-i-drop-a-publication-in-postgres}

在 Postgres 中放弃发布将破坏您的 ClickPipe 连接，因为必须发布才能从源中提取更改。当发生这种情况时，您通常会收到错误警报，指示该发布不再存在。

在删除发布后恢复 ClickPipe：

1. 在 Postgres 中创建一个具有相同名称和所需表的新发布
2. 在 ClickPipe 的设置选项卡中点击“重新同步表”按钮

重新同步是必要的，因为重新创建的发布将在 Postgres 中具有不同的对象标识符（OID），即使它具有相同的名称。重新同步过程刷新您的目标表并恢复连接。

或者，如果您愿意，也可以创建一个全新的管道。

请注意，如果您使用的是分区表，请确保使用适当的设置创建发布：

```sql
CREATE PUBLICATION clickpipes_publication
FOR TABLE <...>, <...>
WITH (publish_via_partition_root = true);
```

### 如果我看到 `Unexpected Datatype` 错误或 `Cannot parse type XX ...` 怎么办？ {#what-if-i-am-seeing-unexpected-datatype-errors}

此错误通常发生于源 Postgres 数据库具有无法在摄取期间映射的数据类型。
有关更具体的问题，请参阅以下可能性。

### `Cannot parse type Decimal(XX, YY), expected non-empty binary data with size equal to or less than ...` {#cannot-parse-type-decimal-expected-non-empty-binary-data-with-size-equal-to-or-less-than}

Postgres `NUMERIC` 具有非常高的精度（在小数点前最多 131072 位；在小数点后最多 16383 位），而 ClickHouse Decimal 类型允许的最大值为 (76 位，39 位小数)。
系统假定 _通常_ 大小不会达到如此之高，并在同一源表可以具有大量行或行可以在 CDC 阶段到达的情况下进行乐观施加转换。

当前的解决方法是将 NUMERIC 类型映射为 ClickHouse 中的字符串。要启用此功能，请向支持团队提出请求，将为您的 ClickPipes 启用该功能。

### 在复制/创建槽期间，我看到错误 `invalid memory alloc request size <XXX>` {#postgres-invalid-memalloc-bug}

在 Postgres 补丁版本 17.5/16.9/15.13/14.18/13.21 中引入了一个错误，导致某些工作负载可造成内存使用量的指数增加，导致内存分配请求 >1GB，这 Postgres 视为无效。此错误 [已被修复](https://github.com/postgres/postgres/commit/d87d07b7ad3b782cb74566cd771ecdb2823adf6a) 并将在下一个 Postgres 补丁系列中（17.6...）发布。请与您的 Postgres 提供商确认此补丁版本何时可供升级。如果立即无法升级，可能需要重新同步管道，因为它会触发错误。

### 我需要在 ClickHouse 中维护完整的历史记录，即使在源 Postgres 数据库中删除数据时。我可以在 ClickPipes 中完全忽略来自 Postgres 的 DELETE 和 TRUNCATE 操作吗？ {#ignore-delete-truncate}

可以！在创建 Postgres ClickPipe 之前，创建一个没有 DELETE 操作的发布。例如：
```sql
CREATE PUBLICATION <pub_name> FOR TABLES IN SCHEMA <schema_name> WITH (publish = 'insert,update');
```
然后在设置您的 Postgres ClickPipe 时，请确保选择此发布名称。

请注意，TRUNCATE 操作将被 ClickPipes 忽略，且不会复制到 ClickHouse。

### 为什么我不能复制包含点的表？ {#replicate-table-dot}
PeerDB 当前存在一个限制，即源表标识符（即架构名称或表名称）中的点不受支持，因为 PeerDB 无法辨别在这种情况下什么是架构，什么是表，因为它在点上拆分。
我们正在努力支持单独输入架构和表，以绕过此限制。

### 初始加载完成，但 ClickHouse 中没有/缺少数据。这可能是什么问题？ {#initial-load-issue}
如果您的初始加载已完成且没有错误，但目标 ClickHouse 表缺少数据，可能是您在源 Postgres 表上启用了 RLS（行级安全）政策。
还值得检查的是：
- 用户是否具有读取源表的足够权限。
- ClickHouse 侧是否存在任何行政策，这可能在过滤行。

### ClickPipe 能否创建带有故障转移启用的复制槽？ {#failover-slot}
可以，对于复制模式为 CDC 或快照 + CDC 的 Postgres ClickPipe，您可以通过在创建 ClickPipe 时在 `高级设置` 部分切换以下开关来创建带有故障转移启用的复制槽。请注意，您的 Postgres 版本必须为 17 或更高版本才能使用此功能。

<Image img={failover_slot} border size="md"/>

如果源配置正确，槽在故障转移到 Postgres 读取副本后将被保留，确保连续的数据复制。了解更多信息 [这里](https://www.postgresql.org/docs/current/logical-replication-failover.html)。
