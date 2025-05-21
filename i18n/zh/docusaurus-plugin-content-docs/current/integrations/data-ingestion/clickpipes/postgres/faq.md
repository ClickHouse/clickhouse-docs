---
'sidebar_label': 'FAQ'
'description': 'Frequently asked questions about ClickPipes for Postgres.'
'slug': '/integrations/clickpipes/postgres/faq'
'sidebar_position': 2
'title': 'ClickPipes for Postgres FAQ'
---




# ClickPipes for Postgres FAQ

### 问：空闲状态如何影响我的 Postgres CDC ClickPipe？ {#how-does-idling-affect-my-postgres-cdc-clickpipe}

如果您的 ClickHouse Cloud 服务处于空闲状态，您的 Postgres CDC ClickPipe 将继续同步数据，您的服务将在下一个同步间隔醒来以处理传入的数据。一旦同步完成并进入空闲期，您的服务将返回到空闲状态。

例如，如果您的同步间隔设置为 30 分钟，而服务空闲时间设置为 10 分钟，您的服务每 30 分钟唤醒一次，活跃 10 分钟，然后返回空闲状态。

### 问：在 ClickPipes for Postgres 中如何处理 TOAST 列？ {#how-are-toast-columns-handled-in-clickpipes-for-postgres}

有关更多信息，请参阅 [处理 TOAST 列](./toast) 页面。

### 问：在 ClickPipes for Postgres 中如何处理生成列？ {#how-are-generated-columns-handled-in-clickpipes-for-postgres}

有关更多信息，请参阅 [Postgres 生成列：注意事项与最佳实践](./generated_columns) 页面。

### 问：表必须具有主键才能成为 Postgres CDC 的一部分吗？ {#do-tables-need-to-have-primary-keys-to-be-part-of-postgres-cdc}

是的，对于 CDC，表必须有主键或 [REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY)。REPLICA IDENTITY 可以设置为 FULL 或配置为使用唯一索引。

### 问：你们支持分区表作为 Postgres CDC 的一部分吗？ {#do-you-support-partitioned-tables-as-part-of-postgres-cdc}

是的，只要有定义的 PRIMARY KEY 或 REPLICA IDENTITY，就支持分区表。PRIMARY KEY 和 REPLICA IDENTITY 必须在父表及其分区上同时存在。您可以在 [这里](https://blog.peerdb.io/real-time-change-data-capture-for-postgres-partitioned-tables) 阅读更多信息。

### 问：我可以连接没有公共 IP 或在私有网络中的 Postgres 数据库吗？ {#can-i-connect-postgres-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

当然可以！ClickPipes for Postgres 提供了两种连接私有网络中数据库的方法：

1. **SSH 隧道**
   - 适用于大多数用例
   - 请查看设置说明 [这里](/integrations/clickpipes/postgres#adding-your-source-postgres-database-connection)
   - 在所有区域均有效

2. **AWS PrivateLink**
   - 在三个 AWS 区域可用：
     - us-east-1
     - us-east-2 
     - eu-central-1
   - 有关详细的设置说明，请参阅我们的 [PrivateLink 文档](/knowledgebase/aws-privatelink-setup-for-clickpipes)
   - 对于 PrivateLink 不可用的区域，请使用 SSH 隧道

### 问：你们如何处理 UPDATE 和 DELETE 操作？ {#how-do-you-handle-updates-and-deletes}

ClickPipes for Postgres 捕获 Postgres 中的 INSERT 和 UPDATE，作为新行在 ClickHouse 中具有不同版本（使用 `_peerdb_` 版本列）。ReplacingMergeTree 表引擎周期性地在后台执行去重，基于排序键（ORDER BY 列），只保留具有最新 `_peerdb_` 版本的行。

从 Postgres 中的 DELETE 被传播为标记为已删除的新行（使用 `_peerdb_is_deleted` 列）。由于去重过程是异步的，因此您可能会暂时看到重复。为了解决这个问题，您需要在查询层面处理去重。

有关更多详细信息，请参阅：

* [ReplacingMergeTree 表引擎最佳实践](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling#replacingmergetree-table-engine)
* [Postgres 到 ClickHouse CDC 内部博客](https://clickhouse.com/blog/postgres-to-clickhouse-data-modeling-tips)

### 问：你们支持模式更改吗？ {#do-you-support-schema-changes}

有关更多信息，请参阅 [ClickPipes for Postgres：模式更改传播支持](./schema-changes) 页面。

### 问：Postgres CDC 的 ClickPipes 费用是多少？ {#what-are-the-costs-for-clickpipes-for-postgres-cdc}

在预览期间，ClickPipes 是免费的。GA 后，定价尚待确定。我们的目标是使定价合理，并与外部 ETL 工具具有高度竞争力。

### 问：我的复制槽大小在增长或未减少；可能是什么问题？ {#my-replication-slot-size-is-growing-or-not-decreasing-what-might-be-the-issue}

如果您注意到 Postgres 复制槽的大小不断增加或没有回落，通常意味着 **WAL（写前日志）记录未被您的 CDC 管道或复制过程快速消耗（或“重放”）**。以下是最常见原因以及如何解决它们。

1. **数据库活动的突然峰值**  
   - 大批量更新、批量插入或显著的模式更改可能会迅速生成大量的 WAL 数据。  
   - 复制槽将保存这些 WAL 记录，直到它们被消耗，从而导致临时的大小峰值。

2. **长时间运行的事务**  
   - 打开的事务迫使 Postgres 保留自事务开始以来生成的所有 WAL 段，这可能会显著增加槽的大小。  
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

3. **维护或实用程序操作（例如 `pg_repack`）**  
   - 像 `pg_repack` 这样的工具可以重写整个表，在短时间内生成大量 WAL 数据。  
   - 在流量较低的时期安排这些操作或在它们运行时密切监控您的 WAL 使用情况。

4. **VACUUM 和 VACUUM ANALYZE**  
   - 尽管这些操作对数据库健康很重要，但在扫描大型表时，它们可能会产生额外的 WAL 流量。  
   - 考虑使用 autovacuum 调优参数，或在非高峰时段安排手动 VACUUM 操作。

5. **复制消费者未主动读取槽**  
   - 如果您的 CDC 管道（例如 ClickPipes）或其他复制消费者停止、暂停或崩溃，WAL 数据将会累积在槽中。  
   - 确保您的管道持续运行，并检查日志以寻找连接或身份验证错误。

有关此主题的深入讨论，请查看我们的博客文章：[克服 Postgres 逻辑解码的陷阱](https://blog.peerdb.io/overcoming-pitfalls-of-postgres-logical-decoding#heading-beware-of-replication-slot-growth-how-to-monitor-it)。

### 问：Postgres 数据类型如何映射到 ClickHouse？ {#how-are-postgres-data-types-mapped-to-clickhouse}

ClickPipes for Postgres 旨在尽可能地在 ClickHouse 端本地映射 Postgres 数据类型。本文档提供了每种数据类型及其映射的完整列表：[数据类型矩阵](https://docs.peerdb.io/datatypes/datatype-matrix)。

### 问：在将数据从 Postgres 复制到 ClickHouse 时，我可以定义自己的数据类型映射吗？ {#can-i-define-my-own-data-type-mapping-while-replicating-data-from-postgres-to-clickhouse}

目前，我们不支持在管道中定义自定义数据类型映射。然而，请注意，ClickPipes 使用的默认数据类型映射是高度本地的。大多数 Postgres 列类型尽可能接近地映射到 ClickHouse 的本地等效物。例如，Postgres 的整数数组类型在 ClickHouse 中被复制为整数数组类型。

### 问：JSON 和 JSONB 列如何从 Postgres 复制？ {#how-are-json-and-jsonb-columns-replicated-from-postgres}

JSON 和 JSONB 列在 ClickHouse 中被复制为字符串类型。由于 ClickHouse 支持本地 [JSON 类型](/sql-reference/data-types/newjson)，您可以在 ClickPipes 表上创建物化视图以执行必要的转换。或者，您可以直接在字符串列上使用 [JSON 函数](/sql-reference/functions/json-functions)。我们正在积极开发一项功能，可将 JSON 和 JSONB 列直接复制到 ClickHouse 的 JSON 类型中。预计该功能将在几个月内提供。

### 问：当镜像暂停时，插入数据会发生什么？ {#what-happens-to-inserts-when-a-mirror-is-paused}

当您暂停镜像时，消息会在源 Postgres 的复制槽中排队，确保它们被缓冲而不丢失。然而，暂停和恢复镜像将重新建立连接，这可能需要一些时间，具体取决于源。

在此过程中，读取（从 Postgres 拉取数据并将其流式传输到 ClickHouse 原始表）和归一化（从原始表到目标表）操作将被中止。然而，它们保留了恢复的必要状态。

- 对于读取，如果它在中途被取消，Postgres 中的 confirmed_flush_lsn 不会提前，因此下一个同步将从与中止的同步相同的位置开始，从而确保数据一致性。
- 对于归一化，ReplacingMergeTree 插入顺序处理去重。

总之，虽然在暂停期间同步和归一化过程被终止，但这样做是安全的，因为它们可以在不丢失数据或不一致的情况下恢复。

### 问：ClickPipe 创建可以自动化或者通过 API 或 CLI 完成吗？ {#can-clickpipe-creation-be-automated-or-done-via-api-or-cli}

Postgres ClickPipe 也可以通过 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) 端点创建和管理。此功能目前处于测试阶段，API 参考可以在 [这里](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/beta) 找到。我们也在积极开发 Terraform 支持，以创建 Postgres ClickPipes。

### 问：我如何加速初始加载？ {#how-do-i-speed-up-my-initial-load}

您无法加速已经正在进行的初始加载。不过，您可以通过调整某些设置来优化未来的初始加载。默认情况下，设置配置为 4 个并行线程，每个分区的快照行数设置为 100,000。这是高级设置，通常对于大多数用例而言已经足够。

对于 Postgres 版本 13 或更低，CTID 范围扫描速度较慢，这些设置变得更为重要。在这种情况下，请考虑以下过程以改善性能：

1. **删除现有的管道**：这需要应用新设置。
2. **删除 ClickHouse 上的目标表**：确保删除之前管道创建的表。
3. **使用优化设置创建新管道**：通常，将每个分区的快照行数增加到 100 万到 1000 万之间，具体取决于您的特定需求以及您的 Postgres 实例能够处理的负载。

这些调整通常会显著提升初始加载的性能，尤其是对于较旧的 Postgres 版本。如果您使用的是 Postgres 14 或更高版本，这些设置的影响较小，因为对 CTID 范围扫描的支持已得到改善。

### 问：在设置复制时，我应如何限制我的发布范围？ {#how-should-i-scope-my-publications-when-setting-up-replication}

您可以让 ClickPipes 管理您的发布（需要额外权限），或者您自己创建。使用 ClickPipes 管理的发布，我们会在您编辑管道时自动处理表的添加和删除。如果自行管理，请仔细限制您的发布，仅包括您需要复制的表 - 包括不必要的表将减慢 Postgres WAL 解码。

如果您在发布中包含任何表，请确保它具有主键或 `REPLICA IDENTITY FULL`。如果您有没有主键的表，则为所有表创建发布将导致这些表上的 DELETE 和 UPDATE 操作失败。

要识别数据库中没有主键的表，您可以使用此查询：
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
   CREATE PUBLICATION clickpipes_publication FOR TABLE table_with_primary_key1, table_with_primary_key2, ...;
```

2. **将没有主键的表包含在 ClickPipes 中**：
   如果您希望包含没有主键的表，则需要将其副本身份更改为 `FULL`。这确保了 UPDATE 和 DELETE 操作正常工作：
```sql
   ALTER TABLE table_without_primary_key1 REPLICA IDENTITY FULL;
   ALTER TABLE table_without_primary_key2 REPLICA IDENTITY FULL;
   CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>;
```

:::tip
如果您手动创建出版物而不是让 ClickPipes 管理它，我们不建议创建 `FOR ALL TABLES` 的出版物，这会导致更多来自 Postgres 到 ClickPipes 的流量（为了发送其他不在管道中的表的更改），从而降低整体效率。

对于手动创建的出版物，请在将任何表添加到管道之前先将其添加到出版物中。
:::

## 推荐的 `max_slot_wal_keep_size` 设置 {#recommended-max_slot_wal_keep_size-settings}

- **至少:** 设置 [`max_slot_wal_keep_size`](https://www.postgresql.org/docs/devel/runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE) 至少保留 **两天** 的 WAL 数据。
- **对于大型数据库（高交易量）：** 至少保留 **2-3 倍** 的峰值 WAL 生成量。
- **对于存储受限的环境：** 保守地调整此项以 **避免磁盘耗尽**，同时确保复制稳定。

### 如何计算合适的值 {#how-to-calculate-the-right-value}

要确定合适的设置，测量 WAL 生成速率：

#### 对于 PostgreSQL 10+： {#for-postgresql-10}

```sql
SELECT pg_wal_lsn_diff(pg_current_wal_insert_lsn(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

#### 对于 PostgreSQL 9.6 及以下： {#for-postgresql-96-and-below}

```sql
SELECT pg_xlog_location_diff(pg_current_xlog_insert_location(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

* 在不同时间（尤其是在交易量较高的期间）运行上述查询。
* 计算每 24 小时生成的 WAL 量。
* 将该数字乘以 2 或 3 以提供足够的保留。
* 将 `max_slot_wal_keep_size` 设置为结果值（以 MB 或 GB 为单位）。

#### 示例： {#example}

如果您的数据库每天生成 100 GB 的 WAL，则设置：

```sql
max_slot_wal_keep_size = 200GB
```

### 问：我的复制槽失效了。我该怎么办？ {#my-replication-slot-is-invalidated-what-should-i-do}

恢复 ClickPipe 的唯一方法是触发重新同步，您可以在设置页面中执行此操作。

复制槽失效的最常见原因是 PostgreSQL 数据库的 `max_slot_wal_keep_size` 设置过低（例如，几个千兆字节）。我们建议增加此值。[请参见此部分](/integrations/clickpipes/postgres/faq#recommended-max_slot_wal_keep_size-settings) 漏斗 `max_slot_wal_keep_size`。理想情况下，这个值应该设置为至少 200GB，以防止复制槽失效。

在少数情况下，即使没有配置 `max_slot_wal_keep_size`，我们也见过此问题。这可能是 PostgreSQL 中一个复杂且罕见的错误，尽管原因仍不明确。

## 问：在 ClickHouse 中看到内存溢出（OOM）时，我的 ClickPipe 正在吸收数据。你能帮忙吗？ {#i-am-seeing-out-of-memory-ooms-on-clickhouse-while-my-clickpipe-is-ingesting-data-can-you-help}

ClickHouse 中 OOM 的一个常见原因是您的服务资源不足。这意味着，当前的服务配置没有足够的资源（例如，内存或 CPU）来有效处理吸收负载。我们强烈建议您扩大服务以满足 ClickPipe 数据吸收的需求。

我们还观察到的另一个原因是存在下游物化视图，可能包含未优化的连接：

- JOIN 的常见优化技术是，当您有一个`LEFT JOIN`，右侧表非常大时。在这种情况下，重写查询以使用 `RIGHT JOIN`，并将较大的表移动到左侧。这允许查询计划器更有效地使用内存。

- 另一种 JOIN 的优化是通过 `子查询` 或 `CTE` 显式过滤表，然后在这些子查询之间执行 `JOIN`。这为计划器提供了提示，以便有效过滤行和执行 `JOIN`。

## 问：在初始加载过程中看到 "无效快照标识符"，我该怎么办？ {#i-am-seeing-an-invalid-snapshot-identifier-during-the-initial-load-what-should-i-do}

“无效快照标识符”错误发生在 ClickPipes 与您的 Postgres 数据库之间的连接中断时。这可能由于网关超时、数据库重启或者其他暂时性问题导致。

建议您在初始加载进行时不要进行任何破坏性操作，如升级或重启您的 Postgres 数据库，并确保与数据库的网络连接稳定。

要解决此问题，您可以从 ClickPipes UI 触发重新同步。这将从头重新启动初始加载过程。

## 问：如果我在 Postgres 中删除发布会发生什么？ {#what-happens-if-i-drop-a-publication-in-postgres}

在 Postgres 中删除发布将断开 ClickPipe 连接，因为该发布用于让 ClickPipe 从源拉取更改。当发生这种情况时，您通常会收到一个错误警报，指示该发布不再存在。

要恢复删除发布后的 ClickPipe：

1. 在 Postgres 中创建一个具有相同名称和所需表的新发布
2. 在 ClickPipe 的设置选项卡中单击“重新同步表”按钮

此重新同步是必要的，因为重新创建的发布在 Postgres 中将具有不同的对象标识符（OID），即使它有相同的名称。重新同步过程刷新您的目标表并恢复连接。

或者，如果您愿意，可以创建一个全新的管道。

请注意，如果您正在使用分区表，请确保使用适当的设置创建发布：

```sql
CREATE PUBLICATION clickpipes_publication 
FOR TABLE <...>, <...>  
WITH (publish_via_partition_root = true);
```

## 问：如果我看到 "意外数据类型" 错误或 "无法解析类型 XX ..." {#what-if-i-am-seeing-unexpected-datatype-errors}

此错误通常发生在源 Postgres 数据库中存在在吸收过程中无法映射的数据类型时。
有关更具体的问题，请参考以下可能性。

### `无法解析类型 Decimal(XX, YY)，期望非空二进制数据，其大小小于或等于 ...` {#cannot-parse-type-decimal-expected-non-empty-binary-data-with-size-equal-to-or-less-than}

Postgres `NUMERIC` 具有非常高的精度（小数点前最多 131072 位；小数点后最多 16383 位），而 ClickHouse Decimal 类型允许的最大值为（76 位，39 为小数位）。
系统假设 _通常_ 大小不会那么大，并对相同进行了乐观转换，因为源表可能包含大量行，或该行可能在 CDC 阶段到达。

当前的解决方法是将 NUMERIC 类型映射到 ClickHouse 中的字符串。要启用此功能，请向支持团队提交请求，启用您 ClickPipes 的此功能。
