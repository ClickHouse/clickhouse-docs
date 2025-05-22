

# ClickPipes for Postgres FAQ

### How does idling affect my Postgres CDC ClickPipe? {#how-does-idling-affect-my-postgres-cdc-clickpipe}

如果您的 ClickHouse Cloud 服务处于空闲状态，您的 Postgres CDC ClickPipe 将继续同步数据，在下一个同步间隔时唤醒您的服务以处理传入的数据。一旦同步完成并达到空闲期，您的服务将返回到空闲状态。

例如，如果您的同步间隔设置为 30 分钟，您的服务空闲时间设置为 10 分钟，那么您的服务将每 30 分钟醒来并活跃 10 分钟，然后再次进入空闲状态。

### How are TOAST columns handled in ClickPipes for Postgres? {#how-are-toast-columns-handled-in-clickpipes-for-postgres}

请参阅 [处理 TOAST 列](./toast) 页面以获取更多信息。

### How are generated columns handled in ClickPipes for Postgres? {#how-are-generated-columns-handled-in-clickpipes-for-postgres}

请参阅 [Postgres 生成列：注意事项和最佳实践](./generated_columns) 页面以获取更多信息。

### Do tables need to have primary keys to be part of Postgres CDC? {#do-tables-need-to-have-primary-keys-to-be-part-of-postgres-cdc}

是的，对于 CDC，表必须具有主键或 [REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY)。REPLICA IDENTITY 可以设置为 FULL 或配置为使用唯一索引。

### Do you support partitioned tables as part of Postgres CDC? {#do-you-support-partitioned-tables-as-part-of-postgres-cdc}

是的，只要它们定义了主键或REPLICA IDENTITY，分区表即开箱即用支持。主键和REPLICA IDENTITY 必须在父表及其分区上都存在。您可以在 [这里](https://blog.peerdb.io/real-time-change-data-capture-for-postgres-partitioned-tables) 阅读更多信息。

### Can I connect Postgres databases that don't have a public IP or are in private networks? {#can-i-connect-postgres-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

是的！ ClickPipes for Postgres 提供两种连接到私有网络中数据库的方法：

1. **SSH Tunneling**
   - 适用于大多数用例
   - 请参见设置说明 [这里](/integrations/clickpipes/postgres#adding-your-source-postgres-database-connection)
   - 在所有区域都有效

2. **AWS PrivateLink**
   - 在三个 AWS 区域可用：
     - us-east-1
     - us-east-2 
     - eu-central-1
   - 有关详细的设置说明，请参见我们的 [PrivateLink 文档](/knowledgebase/aws-privatelink-setup-for-clickpipes)
   - 对于没有 PrivateLink 的区域，请使用 SSH 隧道

### How do you handle UPDATEs and DELETEs? {#how-do-you-handle-updates-and-deletes}

ClickPipes for Postgres 捕获来自 Postgres 的 INSERT 和 UPDATE 作为新的不同版本的行（使用 `_peerdb_` 版本列）在 ClickHouse 中。ReplacingMergeTree 表引擎定期在后台根据排序键（ORDER BY 列）执行去重，仅保留最新的 `_peerdb_` 版本行。

来自 Postgres 的 DELETE 将作为新行传播，并标记为已删除（使用 `_peerdb_is_deleted` 列）。由于去重过程是异步的，您可能会暂时看到重复。为了解决这个问题，您需要在查询层处理去重。

有关更多详细信息，请参阅：

* [ReplacingMergeTree 表引擎最佳实践](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling#replacingmergetree-table-engine)
* [Postgres 到 ClickHouse CDC 内部博客](https://clickhouse.com/blog/postgres-to-clickhouse-data-modeling-tips)

### Do you support schema changes? {#do-you-support-schema-changes}

请参阅 [ClickPipes for Postgres：架构更改传播支持](./schema-changes) 页面以获取更多信息。

### What are the costs for ClickPipes for Postgres CDC? {#what-are-the-costs-for-clickpipes-for-postgres-cdc}

在预览期间，ClickPipes 是免费的。在 GA 后，定价仍待确定。目标是使定价合理并在与外部 ETL 工具的比较中具有高度竞争力。

### My replication slot size is growing or not decreasing; what might be the issue? {#my-replication-slot-size-is-growing-or-not-decreasing-what-might-be-the-issue}

如果您注意到 Postgres 的复制槽大小不断增加或没有缩小，这通常意味着 **WAL（预写日志）记录没有被您的 CDC 管道或复制过程快速消耗（或“重放”）**。下面是最常见的原因以及您可以如何解决它们。

1. **数据库活动的突然激增**  
   - 大批量更新、大量插入或重大架构更改可能会快速生成大量 WAL 数据。  
   - 复制槽将保存这些 WAL 记录，直到它们被消耗，从而导致暂时的大小激增。

2. **长时间运行的事务**  
   - 处于打开状态的事务强迫 Postgres 保留自事务开始以来生成的所有 WAL 段，这可能会显著增加插槽大小。  
   - 设置 `statement_timeout` 和 `idle_in_transaction_session_timeout` 以合理值，防止事务无限期保持打开状态：
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
     使用该查询来识别不寻常地长时间运行的事务。

3. **维护或实用程序操作（例如 `pg_repack`）**  
   - 像 `pg_repack` 这样的工具可以重写整个表，短时间内生成大量 WAL 数据。  
   - 请在流量较低的时间段安排这些操作，或者在它们运行时紧密监控您的 WAL 使用情况。

4. **VACUUM 和 VACUUM ANALYZE**  
   - 虽然对数据库健康至关重要，但这些操作可能会产生额外的 WAL 流量，特别是如果它们扫描大型表。  
   - 考虑使用 autovacuum 调优参数，或在非高峰时间安排手动的 VACUUM 操作。

5. **复制消费者没有积极读取插槽**  
   - 如果您的 CDC 管道（例如 ClickPipes）或其他复制消费者停止、暂停或崩溃，WAL 数据将积累在插槽中。  
   - 确保您的管道持续运行，并检查日志以获取连接或身份验证错误。

有关此主题的深入分析，请查看我们的博客文章：[克服 Postgres 逻辑解码的陷阱](https://blog.peerdb.io/overcoming-pitfalls-of-postgres-logical-decoding#heading-beware-of-replication-slot-growth-how-to-monitor-it)。

### How are Postgres data types mapped to ClickHouse? {#how-are-postgres-data-types-mapped-to-clickhouse}

ClickPipes for Postgres 旨在尽可能原生地将 Postgres 数据类型映射到 ClickHouse。一份综合列表列出了每种数据类型及其映射： [数据类型矩阵](https://docs.peerdb.io/datatypes/datatype-matrix)。

### Can I define my own data type mapping while replicating data from Postgres to ClickHouse? {#can-i-define-my-own-data-type-mapping-while-replicating-data-from-postgres-to-clickhouse}

目前，我们不支持在管道中定义自定义数据类型映射。然而，请注意 ClickPipes 使用的默认数据类型映射高度原生。大多数 Postgres 中的列类型会尽可能接近其在 ClickHouse 中的原生等价物进行复制。例如，Postgres 中的整数数组类型会在 ClickHouse 中复制为整数数组类型。

### How are JSON and JSONB columns replicated from Postgres? {#how-are-json-and-jsonb-columns-replicated-from-postgres}

JSON 和 JSONB 列在 ClickHouse 中复制为 String 类型。由于 ClickHouse 支持原生的 [JSON 类型](/sql-reference/data-types/newjson)，您可以在 ClickPipes 表上创建物化视图以执行必要的转换。或者，您可以直接在 String 列上使用 [JSON 函数](/sql-reference/functions/json-functions)。我们正在积极开发一种功能，可以将 JSON 和 JSONB 列直接复制到 ClickHouse 的 JSON 类型中。预计该功能将在几个月内可用。

### What happens to inserts when a mirror is paused? {#what-happens-to-inserts-when-a-mirror-is-paused}

当您暂停镜像时，消息将排队在源 Postgres 上的复制槽中，确保它们被缓冲而不会丢失。然而，暂停和恢复镜像将重新建立连接，具体时间取决于源。

在此过程中，同步（从 Postgres 拉取数据并将其流式传输到 ClickHouse 原始表）和规范化（从原始表到目标表）操作将被中止。然而， 它们保留了恢复所需的状态，以持久化恢复。

- 对于同步，如果在中途取消，Postgres 中的 confirmed_flush_lsn 不会提前，因此下次同步将从与中止同步相同的位置开始，以确保数据一致性。
- 对于规范化，ReplacingMergeTree 插入顺序处理去重。

总之，虽然在暂停期间同步和规范化过程被终止，但这样做是安全的，因为它们可以在没有数据丢失或不一致的情况下恢复。

### Can ClickPipe creation be automated or done via API or CLI? {#can-clickpipe-creation-be-automated-or-done-via-api-or-cli}

Postgres ClickPipe 也可以通过 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) 端点创建和管理。该功能处于测试版，API 参考可以在 [这里](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/beta) 找到。我们正在积极开发 Terraform 支持以创建 Postgres ClickPipes。

### How do I speed up my initial load? {#how-do-i-speed-up-my-initial-load}

您无法加速已经进行中的初始加载。然而，您可以通过调整一些设置来优化未来的初始加载。默认情况下，设置配置为 4 个并行线程，每个分区的快照行数设置为 100,000。这些是高级设置，通常对于大多数用例都足够。

对于 Postgres 版本 13 或更低版本，CTID 范围扫描较慢，这些设置变得更为关键。在这种情况下，请考虑以下流程以提高性能：

1. **删除现有管道**：这是应用新设置所必需的。
2. **删除 ClickHouse 上的目标表**：确保删除之前管道创建的表。
3. **使用优化设置创建新管道**：通常将每个分区的快照行数增加到 100 万到 1000 万之间，具体取决于您的特定要求以及您的 Postgres 实例可以处理的负载。

这些调整应该显著提升初始加载的性能，特别是对于旧版本的 Postgres。如果您使用的是 Postgres 14 或更高版本，这些设置的影响较小，因为对 CTID 范围扫描的支持改善了。

### How should I scope my publications when setting up replication? {#how-should-i-scope-my-publications-when-setting-up-replication}

您可以让 ClickPipes 管理您的出版物（需要额外权限）或自己创建它们。通过 ClickPipes 管理的出版物，我们会在您编辑管道时自动处理表的添加和删除。如果选择自管理，请仔细限定您的出版物，仅包括您需要复制的表 - 包括不必要的表将减慢 Postgres WAL 解码。

如果您在出版物中包含任何表，请确保它具有主键或 `REPLICA IDENTITY FULL`。 如果您的表没有主键，为所有表创建出版物将导致这些表的 DELETE 和 UPDATE 操作失败。

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

处理没有主键的表时，您有两个选择：

1. **从 ClickPipes 中排除没有主键的表**：
   仅使用具有主键的表创建出版物：
```sql
CREATE PUBLICATION clickpipes_publication FOR TABLE table_with_primary_key1, table_with_primary_key2, ...;
```

2. **在 ClickPipes 中包含没有主键的表**：
   如果您想包含没有主键的表，您需要将它们的复制身份更改为 `FULL`。这确保 UPDATE 和 DELETE 操作正常工作：
```sql
ALTER TABLE table_without_primary_key1 REPLICA IDENTITY FULL;
ALTER TABLE table_without_primary_key2 REPLICA IDENTITY FULL;
CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>;
```

:::tip
如果您手动创建出版物而不是让 ClickPipes 管理它，我们不建议创建 `FOR ALL TABLES` 的出版物，这会导致来自 Postgres 到 ClickPipes 的更多流量（为管道中未包含的其他表发送更改），并降低整体效率。

对于手动创建的出版物，请在将任何表添加到管道之前将其添加到出版物中。
:::

## Recommended `max_slot_wal_keep_size` Settings {#recommended-max_slot_wal_keep_size-settings}

- **至少：** 将 [`max_slot_wal_keep_size`](https://www.postgresql.org/docs/devel/runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE) 设置为保留至少 **两天** 的 WAL 数据。
- **对于大型数据库（高事务量）：** 保留至少 **2-3 倍** 的每日峰值 WAL 生成量。
- **对于存储受限环境：** 谨慎调整此设置以 **避免磁盘耗尽** ，同时确保复制稳定性。

### How to Calculate the Right Value {#how-to-calculate-the-right-value}

要确定正确的设置，请测量 WAL 生成率：

#### For PostgreSQL 10+: {#for-postgresql-10}

```sql
SELECT pg_wal_lsn_diff(pg_current_wal_insert_lsn(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

#### For PostgreSQL 9.6 and below: {#for-postgresql-96-and-below}

```sql
SELECT pg_xlog_location_diff(pg_current_xlog_insert_location(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

* 在一天中的不同时间，尤其是在高度事务期间运行上述查询。
* 计算每 24 小时生成多少 WAL。
* 将该数字乘以 2 或 3，以提供足够的保留。
* 将 `max_slot_wal_keep_size` 设置为以 MB 或 GB 为单位的结果值。

#### Example: {#example}

如果您的数据库每天生成 100 GB 的 WAL，请设置：

```sql
max_slot_wal_keep_size = 200GB
```

### My replication slot is invalidated. What should I do? {#my-replication-slot-is-invalidated-what-should-i-do}

恢复 ClickPipe 的唯一方法是触发重新同步，您可以在设置页面执行此操作。

复制槽无效的最常见原因是 PostgreSQL 数据库的 `max_slot_wal_keep_size` 设置过低（例如，几 GB）。我们建议增加此值。 [请参阅本节](/integrations/clickpipes/postgres/faq#recommended-max_slot_wal_keep_size-settings) 以调整 `max_slot_wal_keep_size`。理想情况下，这应该设置为至少 200GB，以防止复制槽失效。

在少数情况下，我们已观察到即使在未配置 `max_slot_wal_keep_size` 的情况下也会发生此问题。这可能是由于 PostgreSQL 中复杂而罕见的 bug 導致的，但原因尚不明。

## I am seeing Out Of Memory (OOMs) on ClickHouse while my ClickPipe is ingesting data. Can you help? {#i-am-seeing-out-of-memory-ooms-on-clickhouse-while-my-clickpipe-is-ingesting-data-can-you-help}

ClickHouse 上 OOM 的一个常见原因是您的服务配置不足。这意味着您当前的服务配置没有足够的资源（例如内存或 CPU）来有效处理数据摄取负载。我们强烈建议扩展服务以满足 ClickPipe 数据摄取的需求。

我们观察到的另一个原因是存在下游物化视图，存在潜在的未优化连接：

- JOINs 的一个常见优化技术是如果您有一个右侧表非常大的 `LEFT JOIN`。在这种情况下，将查询重写为使用 `RIGHT JOIN`，并将较大的表移动到左侧。这使查询规划器的内存效率更高。

- 另一个 JOIN 的优化是通过 `子查询` 或 `CTEs` 明确过滤表，然后在这些子查询之间执行 `JOIN`。这为规划器提供了有关如何高效过滤行和执行 `JOIN` 的提示。

## I am seeing an `invalid snapshot identifier` during the initial load. What should I do? {#i-am-seeing-an-invalid-snapshot-identifier-during-the-initial-load-what-should-i-do}

`invalid snapshot identifier` 错误在 ClickPipes 和您的 Postgres 数据库之间发生连接中断时出现。这可能是由于网关超时、数据库重启或其他短暂的故障。

建议您在初始加载过程中不要进行任何破坏性的操作（如升级或重启）在您的 Postgres 数据库，并确保与数据库的网络连接稳定。

要解决此问题，您可以通过 ClickPipes UI 触发重新同步。这将从头重启初始加载过程。

## What happens if I drop a publication in Postgres? {#what-happens-if-i-drop-a-publication-in-postgres}

在 Postgres 中删除出版物将打破您的 ClickPipe 连接，因为 ClickPipe 需要该出版物从源中拉取更改。当这种情况发生时，您通常会收到一个错误警报，指示该出版物不再存在。

在删除出版物后，恢复 ClickPipe 的步骤如下：

1. 在 Postgres 中创建一个具有相同名称和所需表的新出版物
2. 点击 ClickPipe 设置选项卡中的 '重新同步表' 按钮

此重新同步是必要的，因为即使重新创建的出版物名称相同，它在 Postgres 中将具有不同的对象标识符（OID）。重新同步过程将刷新您的目标表并恢复连接。

或者，如果您愿意，也可以创建一个全新的管道。

请注意，如果您使用的是分区表，请确保使用适当的设置创建您的出版物：

```sql
CREATE PUBLICATION clickpipes_publication 
FOR TABLE <...>, <...>  
WITH (publish_via_partition_root = true);
```

## What if I am seeing `Unexpected Datatype` errors or `Cannot parse type XX ...` {#what-if-i-am-seeing-unexpected-datatype-errors}

此错误通常发生在源 Postgres 数据库中存在无法在摄取过程中映射的数据类型时。
有关更具体的问题，请参考以下可能性。

### `Cannot parse type Decimal(XX, YY), expected non-empty binary data with size equal to or less than ...` {#cannot-parse-type-decimal-expected-non-empty-binary-data-with-size-equal-to-or-less-than}

Postgres 的 `NUMERIC` 高精度（小数点前可达 131072 位；小数点后可达 16383 位），而 ClickHouse Decimal 类型最多允许 (76 位，39 的小数位)。
系统假定 _通常_ 大小不会那么大，因此做出乐观的类型转换，因为源表可能拥有大量行，或者行可能在 CDC 阶段期间到达。

当前的解决方法是将 NUMERIC 类型映射为 ClickHouse 中的字符串。要启用此功能，请向支持团队提出请求，并为您的 ClickPipes 启用此功能。
