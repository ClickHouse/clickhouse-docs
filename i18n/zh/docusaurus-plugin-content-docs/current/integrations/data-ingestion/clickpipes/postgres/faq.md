---
'sidebar_label': '常见问题'
'description': '有关 ClickPipes for Postgres 的常见问题。'
'slug': '/integrations/clickpipes/postgres/faq'
'sidebar_position': 2
'title': 'ClickPipes for Postgres 常见问题解答'
---


# ClickPipes for Postgres 常见问题解答

### 空闲状态如何影响我的 Postgres CDC ClickPipe? {#how-does-idling-affect-my-postgres-cdc-clickpipe}

如果你的 ClickHouse Cloud 服务处于空闲状态，你的 Postgres CDC ClickPipe 将继续同步数据，你的服务将在下一个同步间隔唤醒以处理传入数据。一旦同步完成并达到空闲时间段，你的服务将再次进入空闲状态。

例如，如果你的同步间隔设置为 30 分钟，而你的服务空闲时间设置为 10 分钟，则你的服务每 30 分钟会唤醒并激活 10 分钟，然后再次进入空闲状态。

### ClickPipes 如何处理 Postgres 中的 TOAST 列? {#how-are-toast-columns-handled-in-clickpipes-for-postgres}

有关更多信息，请参阅 [处理 TOAST 列](./toast) 页面。

### ClickPipes 如何处理 Postgres 中的生成列? {#how-are-generated-columns-handled-in-clickpipes-for-postgres}

有关更多信息，请参阅 [Postgres 生成列：陷阱和最佳实践](./generated_columns) 页面。

### 表是否需要具有主键才能成为 Postgres CDC 的一部分? {#do-tables-need-to-have-primary-keys-to-be-part-of-postgres-cdc}

是的，对于 CDC，因此表必须具有主键或 [REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY)。REPLICA IDENTITY 可以设置为 FULL 或配置为使用唯一索引。

### 你们支持作为 Postgres CDC 一部分的分区表吗? {#do-you-support-partitioned-tables-as-part-of-postgres-cdc}

是的，分区表开箱即用，只要它们定义了 PRIMARY KEY 或 REPLICA IDENTITY。PRIMARY KEY 和 REPLICA IDENTITY 必须在父表及其分区上都存在。您可以在 [此处](https://blog.peerdb.io/real-time-change-data-capture-for-postgres-partitioned-tables) 阅读更多信息。

### 我可以连接没有公共 IP 或位于私有网络中的 Postgres 数据库吗? {#can-i-connect-postgres-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

是的！ ClickPipes for Postgres 提供两种连接私有网络中的数据库的方法：

1. **SSH 隧道**
   - 对于大多数用例效果良好
   - 请查看设置说明 [这里](/integrations/clickpipes/postgres#adding-your-source-postgres-database-connection)
   - 适用于所有区域

2. **AWS PrivateLink**
   - 在三个 AWS 区域提供：
     - us-east-1
     - us-east-2 
     - eu-central-1
   - 有关详细的设置说明，请参阅我们的 [PrivateLink 文档](/knowledgebase/aws-privatelink-setup-for-clickpipes)
   - 在PrivateLink不可用的区域，请使用SSH隧道

### 你们如何处理 UPDATE 和 DELETE？ {#how-do-you-handle-updates-and-deletes}

ClickPipes for Postgres 捕获来自 Postgres 的 INSERTs 和 UPDATEs 作为 ClickHouse 中具有不同版本（使用 `_peerdb_` 版本列）的新行。ReplacingMergeTree 表引擎定期基于排序键（ORDER BY 列）在后台执行去重，仅保留具有最新 `_peerdb_` 版本的行。

来自 Postgres 的 DELETE 被传播为标记为已删除的新行（使用 `_peerdb_is_deleted` 列）。由于去重过程是异步的，你可能会暂时看到重复。为了解决这个问题，你需要在查询层处理去重。

有关更多详细信息，请参考：

* [ReplacingMergeTree 表引擎最佳实践](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling#replacingmergetree-table-engine)
* [Postgres 到 ClickHouse CDC 内部博客](https://clickhouse.com/blog/postgres-to-clickhouse-data-modeling-tips)

### 你们支持模式变更吗？ {#do-you-support-schema-changes}

有关更多信息，请参阅 [ClickPipes for Postgres：模式更改传播支持](./schema-changes) 页面。

### ClickPipes for Postgres CDC 的费用是什么？ {#what-are-the-costs-for-clickpipes-for-postgres-cdc}

在预览期间，ClickPipes 免费。GA 之后，定价尚未确定。目标是使定价合理，并与外部 ETL 工具相比具有很强的竞争力。

### 我的复制槽大小在增加或没有减少；可能是什么问题？ {#my-replication-slot-size-is-growing-or-not-decreasing-what-might-be-the-issue}

如果你发现你的 Postgres 复制槽的大小不断增加或没有回落，通常意味着 **WAL（预写日志）记录没有被你的 CDC 管道或复制过程足够快速地消费（或“重放”）**。以下是最常见的原因及其解决方法。

1. **数据库活动的突然激增**  
   - 大批量更新、大规模插入或重大模式变更可迅速生成大量 WAL 数据。  
   - 复制槽将持有这些 WAL 记录，直到它们被消费，从而导致大小暂时激增。

2. **长时间运行的事务**  
   - 打开的事务强迫 Postgres 保留自事务开始以来生成的所有 WAL 段，这可能会显著增加槽大小。  
   - 将 `statement_timeout` 和 `idle_in_transaction_session_timeout` 设置为合理值，以防止事务无限期保持打开状态：
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

3. **维护或工具操作（例如，`pg_repack`）**  
   - `pg_repack` 等工具可以重写整个表，短时间内生成大量 WAL 数据。  
   - 在流量较低的时间段安排这些操作，或在它们运行时密切监控你的 WAL 使用。

4. **VACUUM 和 VACUUM ANALYZE**  
   - 尽管对于数据库健康至关重要，这些操作可能会产生额外的 WAL 流量——尤其是在扫描大表时。  
   - 考虑使用自动真空调优参数，或在非高峰期安排手动 VACUUM 操作。

5. **复制消费者未积极读取该槽**  
   - 如果你的 CDC 管道（例如 ClickPipes）或其他复制消费者停止、暂停或崩溃，WAL 数据将积累在槽中。  
   - 确保你的管道持续运行，并检查日志以获取连接或身份验证错误。

有关此主题的深入探讨，请查看我们的博客文章：[克服 Postgres 逻辑解码的陷阱](https://blog.peerdb.io/overcoming-pitfalls-of-postgres-logical-decoding#heading-beware-of-replication-slot-growth-how-to-monitor-it)。

### Postgres 数据类型如何映射到 ClickHouse？ {#how-are-postgres-data-types-mapped-to-clickhouse}

ClickPipes for Postgres 的目标是在 ClickHouse 端尽可能地原生映射 Postgres 数据类型。本文档提供了每种数据类型及其映射的完整列表：[数据类型矩阵](https://docs.peerdb.io/datatypes/datatype-matrix)。

### 在从 Postgres 复制数据到 ClickHouse 时，我可以定义自己数据类型的映射吗？ {#can-i-define-my-own-data-type-mapping-while-replicating-data-from-postgres-to-clickhouse}

目前，我们不支持在管道中定义自定义数据类型映射。不过，请注意 ClickPipes 使用的默认数据类型映射是高度原生的。Postgres 中的大多数列类型都尽可能接近映射为 ClickHouse 中的本地等价类型。例如，Postgres 中的整数数组类型在 ClickHouse 中被映射为整数数组类型。

### JSON 和 JSONB 列如何从 Postgres 复制？ {#how-are-json-and-jsonb-columns-replicated-from-postgres}

JSON 和 JSONB 列在 ClickHouse 中被复制为字符串类型。由于 ClickHouse 支持原生的 [JSON 类型](/sql-reference/data-types/newjson)，你可以在 ClickPipes 表上创建物化视图来执行转换（如有必要）。或者，你可以直接在字符串列上使用 [JSON 函数](/sql-reference/functions/json-functions)。我们正在积极开发一个功能，该功能将 JSON 和 JSONB 列直接复制到 ClickHouse 的 JSON 类型中。该功能预计将在几个月内可用。

### 当镜像暂停时，插入会发生什么？ {#what-happens-to-inserts-when-a-mirror-is-paused}

当你暂停镜像时，消息会在源 Postgres 的复制槽中排队，确保它们被缓冲并不会丢失。然而，暂停和恢复镜像将重新建立连接，具体时间取决于源。

在此过程中，同步（从 Postgres 提取数据并将其流式传输到 ClickHouse 原始表）和规范化（从原始表到目标表）操作都会中止。然而，它们保留了恢复所需的状态。

- 对于 sync，如果在中途被取消，Postgres 中的 confirmed_flush_lsn 不会推进，因此下一次同步将从与中止任务相同的位置开始，以确保数据一致性。
- 对于 normalize，ReplacingMergeTree 插入顺序处理去重。

总之，虽然在暂停期间同步和规范化过程会终止，但这样做是安全的，因为它们可以在没有数据丢失或不一致的情况下恢复。

### ClickPipe 的创建可以自动化或通过 API 或 CLI 完成吗？ {#can-clickpipe-creation-be-automated-or-done-via-api-or-cli}

Postgres ClickPipe 也可以通过 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) 端点创建和管理。该功能处于测试阶段，API 参考可以在 [这里](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/beta) 找到。我们还在积极开发 Terraform 支持以创建 Postgres ClickPipes。

### 我如何加速我的初始加载？ {#how-do-i-speed-up-my-initial-load}

你不能加速已经运行的初始加载。然而，你可以通过调整某些设置来优化未来的初始加载。默认情况下，设置配置为 4 个并行线程，分区的快照行数设置为 100,000。这些是高级设置，通常对于大多数用例来说是足够的。

对于 Postgres 版本 13 或更低，CTID 范围扫描较慢，这些设置变得更加关键。在这种情况下，请考虑以下流程来提高性能：

1. **删除现有的管道**：这是应用新设置所必需的。
2. **删除 ClickHouse 上的目标表**：确保删除之前管道创建的表。
3. **使用优化设置创建新的管道**：通常，将每个分区的快照行数增加到 100 万到 1000 万之间，具体取决于你的特定需求和 Postgres 实例可以处理的负载。

这些调整应该显著提高初始加载的性能，特别是对于较旧的 Postgres 版本。如果你使用的是 Postgres 14 或更高版本，这些设置由于对 CTID 范围扫描的改进而影响较小。

### 我在设置复制时应该如何范围我的发布？ {#how-should-i-scope-my-publications-when-setting-up-replication}

你可以让 ClickPipes 管理你的发布（需要额外权限），或自己创建它们。使用 ClickPipes 管理的发布时，当你编辑管道时，我们会自动处理表的添加和删除。如果是自管理，请细心限制你的发布，仅包括你需要复制的表——包括不必要的表将减慢 Postgres WAL 解码。

如果你在发布中包含任何表，请确保它具有主键或 `REPLICA IDENTITY FULL`。如果你有没有主键的表，为所有表创建发布会导致这些表上的 DELETE 和 UPDATE 操作失败。

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

处理没有主键的表时，有两个选项：

1. **从 ClickPipes 中排除没有主键的表**：
   创建仅包含具有主键的表的发布：
```sql
CREATE PUBLICATION clickpipes_publication FOR TABLE table_with_primary_key1, table_with_primary_key2, ...;
```

2. **在 ClickPipes 中包括没有主键的表**：
   如果你想包括没有主键的表，你需要将它们的副本身份更改为 `FULL`。这确保 UPDATE 和 DELETE 操作正常工作：
```sql
ALTER TABLE table_without_primary_key1 REPLICA IDENTITY FULL;
ALTER TABLE table_without_primary_key2 REPLICA IDENTITY FULL;
CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>;
```

:::tip
如果你手动创建发布，而不是让 ClickPipes 管理它，我们不建议创建 `FOR ALL TABLES` 的发布，这将导致 Postgres 到 ClickPipes 的流量增加（为管道中未包含的其他表发送更改），并降低整体效率。

对于手动创建的发布，请在将任何表添加到管道之前，将其添加到发布中。
:::

## 推荐的 `max_slot_wal_keep_size` 设置 {#recommended-max_slot_wal_keep_size-settings}

- **最低限度：** 设置 [`max_slot_wal_keep_size`](https://www.postgresql.org/docs/devel/runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE) 保留至少 **两天** 的 WAL 数据。
- **对于大型数据库（高交易量）：** 保留至少 **2-3 倍** 的每日峰值 WAL 生成量。
- **对于存储受限的环境：** 保守调整，以 **避免磁盘耗尽**，同时确保复制稳定。

### 如何计算正确的值 {#how-to-calculate-the-right-value}

要确定合适的设置，请测量 WAL 生成速率：

#### 对于 PostgreSQL 10 及以上版本： {#for-postgresql-10}

```sql
SELECT pg_wal_lsn_diff(pg_current_wal_insert_lsn(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

#### 对于 PostgreSQL 9.6 及以下版本： {#for-postgresql-96-and-below}

```sql
SELECT pg_xlog_location_diff(pg_current_xlog_insert_location(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

* 在一天中的不同时间运行上述查询，特别是在高交易期。
* 计算每 24 小时生成多少 WAL。
* 将该数字乘以 2 或 3 以提供足够的保留。
* 将 `max_slot_wal_keep_size` 设置为结果值（以 MB 或 GB 为单位）。

#### 示例： {#example}

如果你的数据库每天生成 100 GB 的 WAL，请设置：

```sql
max_slot_wal_keep_size = 200GB
```

### 我的复制槽无效。我该怎么办？ {#my-replication-slot-is-invalidated-what-should-i-do}

恢复 ClickPipe 的唯一方法是触发重新同步，你可以在设置页面进行操作。

复制槽无效的最常见原因是你的 PostgreSQL 数据库上低的 `max_slot_wal_keep_size` 设置（例如，几 GB）。我们建议增加这个值。[请参考这一部分](/integrations/clickpipes/postgres/faq#recommended-max_slot_wal_keep_size-settings) 来调优 `max_slot_wal_keep_size`。理想情况下，它应该至少设置为 200GB，以防止复制槽无效。

在少数情况下，即使未配置 `max_slot_wal_keep_size` 也可能发生此问题。这可能是由于 PostgreSQL 中的一种复杂且罕见的错误，尽管原因仍不明确。

## 我在 ClickHouse 上看到内存不足（OOM）现象，而我的 ClickPipe 正在摄取数据。你能帮忙吗？ {#i-am-seeing-out-of-memory-ooms-on-clickhouse-while-my-clickpipe-is-ingesting-data-can-you-help}

ClickHouse 上 OOM 的一个常见原因是你的服务配置过小。这意味着你当前的服务配置没有足够的资源（例如内存或 CPU）来有效处理摄取加载。我们强烈建议扩大服务以满足 ClickPipe 数据摄取的需求。

我们观察到的另一个原因是下游物化视图中存在可能未优化的连接：

- 对于 JOIN 的一个常见优化技巧是如果你有一个 `LEFT JOIN`，而右侧表非常大。在这种情况下，重写查询以使用 `RIGHT JOIN` 并将更大的表移到左侧。这使得查询规划器能够更有效地利用内存。

- 另一个 JOIN 的优化技巧是通过 `子查询` 或 `CTE` 明确过滤表，然后在这些子查询之间执行 `JOIN`。这为规划器提供了关于如何有效过滤行和执行 `JOIN` 的提示。

## 我在初始加载期间看到 `invalid snapshot identifier`。我该怎么办？ {#i-am-seeing-an-invalid-snapshot-identifier-during-the-initial-load-what-should-i-do}

`invalid snapshot identifier` 错误发生在 ClickPipes 与你的 Postgres 数据库之间发生连接中断时。这可能是由于网关超时、数据库重启或其他瞬态问题导致的。

建议在初始加载进行时不要进行任何破坏性操作如升级或重启你的 Postgres 数据库，并确保到数据库的网络连接稳定。

要解决此问题，你可以从 ClickPipes 界面触发重新同步。这将从头开始重新启动初始加载过程。

## 如果我在 Postgres 中删除一个发布会发生什么？ {#what-happens-if-i-drop-a-publication-in-postgres}

在 Postgres 中删除一个发布将中断你的 ClickPipe 连接，因为发布是 ClickPipe 从源处拉取更改所必需的。当这种情况发生时，你通常会收到一个错误警告，指示该发布不再存在。

在删除发布后恢复你的 ClickPipe 的步骤：

1. 在 Postgres 中创建一个同名的包含所需表的新发布
2. 点击 ClickPipe 设置选项卡中的 '重新同步表' 按钮

此重新同步是必要的，因为重新创建的发布在 Postgres 中将具有不同的对象标识符（OID），即使它的名称相同。重新同步过程刷新你的目标表并恢复连接。

或者，如果你愿意，可以创建一个全新的管道。

请注意，如果你正在处理分区表，请确保以适当的设置创建你的发布：

```sql
CREATE PUBLICATION clickpipes_publication 
FOR TABLE <...>, <...>  
WITH (publish_via_partition_root = true);
```

## 如果我看到 `Unexpected Datatype` 错误或 `Cannot parse type XX ...` 怎样办？ {#what-if-i-am-seeing-unexpected-datatype-errors}

此错误通常发生当源 Postgres 数据库具有一个在摄取过程中无法映射的数据类型时。
有关更具体的问题，请参阅以下可能性。

### `Cannot parse type Decimal(XX, YY), expected non-empty binary data with size equal to or less than ...` {#cannot-parse-type-decimal-expected-non-empty-binary-data-with-size-equal-to-or-less-than}

Postgres 的 `NUMERIC` 具有非常高的精度（小数点前最多 131072 位；小数点后最多 16383 位），而 ClickHouse Decimal 类型允许最多（76 位、39 的小数位）。
系统假设 _通常_ 大小不会达到如此之高，因此对于同样的情况进行乐观转换，因为源表可能包含大量行或者某一行可能在 CDC 阶段到达。

当前的解决方法是将 NUMERIC 类型映射为 ClickHouse 上的字符串。要启用此功能，请向支持团队提交工单并为你的 ClickPipes 启用此设置。
