---
sidebar_label: '常见问题'
description: '关于 ClickPipes for Postgres 的常见问题。'
slug: /integrations/clickpipes/postgres/faq
sidebar_position: 2
title: 'ClickPipes for Postgres 常见问题解答'
keywords: ['postgres faq', 'clickpipes', 'toast columns', 'replication slot', 'publications']
doc_type: 'reference'
---

import failover_slot from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/failover_slot.png'
import Image from '@theme/IdealImage';


# ClickPipes for Postgres 常见问题

### 空闲状态如何影响我的 Postgres CDC ClickPipe? {#how-does-idling-affect-my-postgres-cdc-clickpipe}

如果您的 ClickHouse Cloud 服务处于空闲状态,您的 Postgres CDC ClickPipe 将继续同步数据,服务会在下一个同步间隔时自动唤醒以处理传入的数据。同步完成并达到空闲时间后,服务将重新进入空闲状态。

例如,如果您的同步间隔设置为 30 分钟,服务空闲时间设置为 10 分钟,则您的服务将每 30 分钟唤醒一次并保持活动状态 10 分钟,然后重新进入空闲状态。

### ClickPipes for Postgres 如何处理 TOAST 列? {#how-are-toast-columns-handled-in-clickpipes-for-postgres}

请参阅[处理 TOAST 列](./toast)页面了解更多信息。

### ClickPipes for Postgres 如何处理生成列? {#how-are-generated-columns-handled-in-clickpipes-for-postgres}

请参阅 [Postgres 生成列:注意事项和最佳实践](./generated_columns)页面了解更多信息。

### 表是否需要主键才能参与 Postgres CDC? {#do-tables-need-to-have-primary-keys-to-be-part-of-postgres-cdc}

要使用 ClickPipes for Postgres 复制表,该表必须定义主键或 [REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY)。

- **主键**:最直接的方法是在表上定义主键。这为每一行提供了唯一标识符,对于跟踪更新和删除至关重要。在这种情况下,您可以将 REPLICA IDENTITY 设置为 `DEFAULT`(默认行为)。
- **副本标识**:如果表没有主键,您可以设置副本标识。副本标识可以设置为 `FULL`,这意味着将使用整行来识别更改。或者,如果表上存在唯一索引,您可以将其设置为使用该索引,然后将 REPLICA IDENTITY 设置为 `USING INDEX index_name`。
  要将副本标识设置为 FULL,您可以使用以下 SQL 命令:

```sql
ALTER TABLE your_table_name REPLICA IDENTITY FULL;
```

REPLICA IDENTITY FULL 还支持复制未更改的 TOAST 列。更多信息请参阅[此处](./toast)。

请注意,使用 `REPLICA IDENTITY FULL` 可能会影响性能并导致 WAL 增长更快,特别是对于没有主键且频繁更新或删除的表,因为它需要为每次更改记录更多数据。如果您对为表设置主键或副本标识有任何疑问或需要帮助,请联系我们的支持团队寻求指导。

需要注意的是,如果既未定义主键也未定义副本标识,ClickPipes 将无法复制该表的更改,您可能会在复制过程中遇到错误。因此,建议在设置 ClickPipe 之前检查您的表结构并确保它们满足这些要求。

### 是否支持将分区表作为 Postgres CDC 的一部分? {#do-you-support-partitioned-tables-as-part-of-postgres-cdc}

是的,分区表开箱即用,只要它们定义了 PRIMARY KEY 或 REPLICA IDENTITY。PRIMARY KEY 和 REPLICA IDENTITY 必须同时存在于父表及其分区上。您可以在[此处](https://blog.peerdb.io/real-time-change-data-capture-for-postgres-partitioned-tables)阅读更多相关信息。

### 我可以连接没有公网 IP 或位于私有网络中的 Postgres 数据库吗? {#can-i-connect-postgres-databases-that-dont-have-a-public-ip-or-are-in-private-networks}

可以!ClickPipes for Postgres 提供两种方式连接私有网络中的数据库:

1. **SSH 隧道**
   - 适用于大多数使用场景
   - 请参阅[此处](/integrations/clickpipes/postgres#adding-your-source-postgres-database-connection)的设置说明
   - 适用于所有区域

2. **AWS PrivateLink**
   - 在三个 AWS 区域可用:
     - us-east-1
     - us-east-2
     - eu-central-1
   - 有关详细的设置说明,请参阅我们的 [PrivateLink 文档](/knowledgebase/aws-privatelink-setup-for-clickpipes)
   - 对于 PrivateLink 不可用的区域,请使用 SSH 隧道


### 如何处理 UPDATE 和 DELETE 操作? {#how-do-you-handle-updates-and-deletes}

ClickPipes for Postgres 会将来自 Postgres 的 INSERT 和 UPDATE 操作捕获为 ClickHouse 中具有不同版本的新行(使用 `_peerdb_` 版本列)。ReplacingMergeTree 表引擎会根据排序键(ORDER BY 列)在后台定期执行去重操作,仅保留具有最新 `_peerdb_` 版本的行。

来自 Postgres 的 DELETE 操作会作为标记为已删除的新行进行传播(使用 `_peerdb_is_deleted` 列)。由于去重过程是异步的,您可能会暂时看到重复数据。为解决此问题,您需要在查询层处理去重。

另请注意,默认情况下,Postgres 在执行 DELETE 操作时不会发送非主键或副本标识列的列值。如果您希望在 DELETE 操作期间捕获完整的行数据,可以将 [REPLICA IDENTITY](https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-REPLICA-IDENTITY) 设置为 FULL。

有关更多详细信息,请参阅:

- [ReplacingMergeTree 表引擎最佳实践](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling#replacingmergetree-table-engine)
- [Postgres 到 ClickHouse CDC 内部机制博客](https://clickhouse.com/blog/postgres-to-clickhouse-data-modeling-tips)

### 我可以在 PostgreSQL 中更新主键列吗? {#can-i-update-primary-key-columns-in-postgresql}

:::warning
默认情况下,PostgreSQL 中的主键更新无法在 ClickHouse 中正确重放。

此限制的存在是因为 `ReplacingMergeTree` 去重基于 `ORDER BY` 列(通常对应于主键)进行工作。当在 PostgreSQL 中更新主键时,它在 ClickHouse 中会显示为具有不同键的新行,而不是对现有行的更新。这可能导致旧主键值和新主键值同时存在于您的 ClickHouse 表中。
:::

请注意,在 PostgreSQL 数据库设计中更新主键列并不是常见做法,因为主键旨在作为不可变的标识符。大多数应用程序在设计上会避免主键更新,因此这一限制在典型用例中很少遇到。

有一个实验性设置可以启用主键更新处理,但它会带来显著的性能影响,不建议在未经仔细考虑的情况下用于生产环境。

如果您的用例需要在 PostgreSQL 中更新主键列并将这些更改正确反映到 ClickHouse 中,请通过 [db-integrations-support@clickhouse.com](mailto:db-integrations-support@clickhouse.com) 联系我们的支持团队,讨论您的具体需求和潜在解决方案。

### 是否支持模式变更? {#do-you-support-schema-changes}

有关更多信息,请参阅 [ClickPipes for Postgres: 模式变更传播支持](./schema-changes) 页面。

### ClickPipes for Postgres CDC 的费用是多少? {#what-are-the-costs-for-clickpipes-for-postgres-cdc}

有关详细的定价信息,请参阅[我们主要计费概览页面上的 ClickPipes for Postgres CDC 定价部分](/cloud/reference/billing/clickpipes)。

### 我的复制槽大小在增长或没有减少;可能是什么问题? {#my-replication-slot-size-is-growing-or-not-decreasing-what-might-be-the-issue}

如果您注意到 Postgres 复制槽的大小持续增长或没有降下来,这通常意味着 **WAL(预写日志)记录没有被您的 CDC 管道或复制进程足够快地消费(或"重放")**。以下是最常见的原因以及如何解决它们。

1. **数据库活动突然激增**
   - 大批量更新、批量插入或重大模式变更可能会快速生成大量 WAL 数据。
   - 复制槽将保留这些 WAL 记录直到它们被消费,导致大小暂时激增。

2. **长时间运行的事务**
   - 一个打开的事务会强制 Postgres 保留自事务开始以来生成的所有 WAL 段,这可能会显著增加槽大小。
   - 将 `statement_timeout` 和 `idle_in_transaction_session_timeout` 设置为合理的值,以防止事务无限期保持打开状态:
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


3. **维护或实用工具操作(例如 `pg_repack`)**
   - 像 `pg_repack` 这样的工具可以重写整个表,在短时间内生成大量 WAL 数据。
   - 在流量较低的时段安排这些操作,或在运行时密切监控 WAL 使用情况。

4. **VACUUM 和 VACUUM ANALYZE**
   - 尽管这些操作对数据库健康是必需的,但它们会产生额外的 WAL 流量——特别是在扫描大型表时。
   - 考虑使用 autovacuum 调优参数,或在非峰值时段安排手动 VACUUM 操作。

5. **复制消费者未主动读取槽位**
   - 如果您的 CDC 管道(例如 ClickPipes)或其他复制消费者停止、暂停或崩溃,WAL 数据将在槽位中累积。
   - 确保您的管道持续运行,并检查日志中的连接或身份验证错误。

有关此主题的深入探讨,请查看我们的博客文章:[克服 Postgres 逻辑解码的陷阱](https://blog.peerdb.io/overcoming-pitfalls-of-postgres-logical-decoding#heading-beware-of-replication-slot-growth-how-to-monitor-it)。

### Postgres 数据类型如何映射到 ClickHouse? {#how-are-postgres-data-types-mapped-to-clickhouse}

ClickPipes for Postgres 旨在尽可能原生地将 Postgres 数据类型映射到 ClickHouse 端。本文档提供了每种数据类型及其映射的完整列表:[数据类型矩阵](https://docs.peerdb.io/datatypes/datatype-matrix)。

### 在从 Postgres 复制数据到 ClickHouse 时,我可以自定义数据类型映射吗? {#can-i-define-my-own-data-type-mapping-while-replicating-data-from-postgres-to-clickhouse}

目前,我们不支持在管道中定义自定义数据类型映射。但是,请注意 ClickPipes 使用的默认数据类型映射是高度原生的。Postgres 中的大多数列类型都会尽可能接近地复制为 ClickHouse 上的原生等效类型。例如,Postgres 中的整数数组类型会被复制为 ClickHouse 上的整数数组类型。

### JSON 和 JSONB 列如何从 Postgres 复制? {#how-are-json-and-jsonb-columns-replicated-from-postgres}

JSON 和 JSONB 列在 ClickHouse 中被复制为 String 类型。由于 ClickHouse 支持原生 [JSON 类型](/sql-reference/data-types/newjson),如果需要,您可以在 ClickPipes 表上创建物化视图来执行转换。或者,您可以直接在 String 列上使用 [JSON 函数](/sql-reference/functions/json-functions)。我们正在积极开发一项功能,可以将 JSON 和 JSONB 列直接复制到 ClickHouse 中的 JSON 类型。该功能预计将在几个月内推出。

### 当镜像暂停时,插入操作会发生什么? {#what-happens-to-inserts-when-a-mirror-is-paused}

当您暂停镜像时,消息会在源 Postgres 的复制槽位中排队,确保它们被缓冲且不会丢失。但是,暂停和恢复镜像将重新建立连接,这可能需要一些时间,具体取决于源。

在此过程中,同步(从 Postgres 拉取数据并将其流式传输到 ClickHouse 原始表)和规范化(从原始表到目标表)操作都会中止。但是,它们会保留持久恢复所需的状态。

- 对于同步,如果中途取消,Postgres 中的 confirmed_flush_lsn 不会前进,因此下一次同步将从中止的位置开始,确保数据一致性。
- 对于规范化,ReplacingMergeTree 插入顺序会处理去重。

总之,虽然同步和规范化过程在暂停期间会终止,但这样做是安全的,因为它们可以在不丢失数据或不一致的情况下恢复。

### ClickPipe 的创建可以自动化或通过 API 或 CLI 完成吗? {#can-clickpipe-creation-be-automated-or-done-via-api-or-cli}

Postgres ClickPipe 也可以通过 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi) 端点创建和管理。此功能处于测试阶段,API 参考可以在[此处](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/beta)找到。我们也在积极开发 Terraform 支持以创建 Postgres ClickPipes。

### 如何加快初始加载速度? {#how-do-i-speed-up-my-initial-load}


您无法加速正在运行的初始加载。但是,您可以通过调整某些设置来优化后续的初始加载。默认情况下,设置配置为 4 个并行线程,每个分区的快照行数设置为 100,000。这些是高级设置,通常足以满足大多数使用场景。

对于 Postgres 13 或更低版本,CTID 范围扫描速度较慢,这些设置变得更加关键。在这种情况下,请考虑以下流程来提高性能:

1. **删除现有管道**:这是应用新设置所必需的。
2. **删除 ClickHouse 上的目标表**:确保删除由先前管道创建的表。
3. **使用优化设置创建新管道**:通常,将每个分区的快照行数增加到 100 万到 1000 万之间,具体取决于您的特定需求以及您的 Postgres 实例可以处理的负载。

这些调整应该能够显著提高初始加载的性能,特别是对于较旧的 Postgres 版本。如果您使用的是 Postgres 14 或更高版本,由于对 CTID 范围扫描的改进支持,这些设置的影响较小。

### 设置复制时应如何确定发布的范围? {#how-should-i-scope-my-publications-when-setting-up-replication}

您可以让 ClickPipes 管理您的发布(需要额外权限)或自行创建。使用 ClickPipes 管理的发布时,我们会在您编辑管道时自动处理表的添加和删除。如果自行管理,请仔细确定发布范围,仅包含需要复制的表 - 包含不必要的表会降低 Postgres WAL 解码速度。

如果您在发布中包含任何表,请确保该表具有主键或 `REPLICA IDENTITY FULL`。如果您有没有主键的表,为所有表创建发布将导致这些表上的 DELETE 和 UPDATE 操作失败。

要识别数据库中没有主键的表,您可以使用以下查询:

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

处理没有主键的表时,您有两个选项:

1. **从 ClickPipes 中排除没有主键的表**:
   仅使用具有主键的表创建发布:

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR TABLE table_with_primary_key1, table_with_primary_key2, ...;
   ```

2. **在 ClickPipes 中包含没有主键的表**:
   如果您想包含没有主键的表,需要将其副本标识更改为 `FULL`。这可以确保 UPDATE 和 DELETE 操作正常工作:
   ```sql
   ALTER TABLE table_without_primary_key1 REPLICA IDENTITY FULL;
   ALTER TABLE table_without_primary_key2 REPLICA IDENTITY FULL;
   CREATE PUBLICATION clickpipes_publication FOR TABLE <...>, <...>;
   ```

:::tip
如果您手动创建发布而不是让 ClickPipes 管理它,我们不建议创建 `FOR ALL TABLES` 的发布,这会导致从 Postgres 到 ClickPipes 的流量增加(发送管道中不存在的其他表的更改),并降低整体效率。

对于手动创建的发布,请在将表添加到管道之前将所需的任何表添加到发布中。
:::

:::warning
如果您从 Postgres 只读副本/热备用服务器进行复制,则需要在主实例上创建自己的发布,该发布将自动传播到备用服务器。在这种情况下,ClickPipe 将无法管理发布,因为您无法在备用服务器上创建发布。
:::

### 推荐的 `max_slot_wal_keep_size` 设置 {#recommended-max_slot_wal_keep_size-settings}

- **最低要求:** 将 [`max_slot_wal_keep_size`](https://www.postgresql.org/docs/devel/runtime-config-replication.html#GUC-MAX-SLOT-WAL-KEEP-SIZE) 设置为至少保留**两天**的 WAL 数据。
- **对于大型数据库(高事务量):** 至少保留每天峰值 WAL 生成量的 **2-3 倍**。
- **对于存储受限环境:** 保守地调整此设置以**避免磁盘耗尽**,同时确保复制稳定性。

#### 如何计算正确的值 {#how-to-calculate-the-right-value}

要确定正确的设置,请测量 WAL 生成速率:

##### 对于 PostgreSQL 10+ {#for-postgresql-10}


```sql
SELECT pg_wal_lsn_diff(pg_current_wal_insert_lsn(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

##### 对于 PostgreSQL 9.6 及更低版本: {#for-postgresql-96-and-below}

```sql
SELECT pg_xlog_location_diff(pg_current_xlog_insert_location(), '0/0') / 1024 / 1024 AS wal_generated_mb;
```

- 在一天中的不同时间运行上述查询,尤其是在高事务处理时段。
- 计算每 24 小时周期生成的 WAL 量。
- 将该数字乘以 2 或 3 以提供足够的保留空间。
- 将 `max_slot_wal_keep_size` 设置为计算得出的 MB 或 GB 值。

##### 示例 {#example}

如果您的数据库每天生成 100 GB 的 WAL,请设置:

```sql
max_slot_wal_keep_size = 200GB
```

### 我在日志中看到 ReceiveMessage EOF 错误。这是什么意思? {#im-seeing-a-receivemessage-eof-error-in-the-logs-what-does-it-mean}

`ReceiveMessage` 是 Postgres 逻辑解码协议中的一个函数,用于从复制流中读取消息。EOF(文件结束)错误表示在尝试从复制流读取数据时,与 Postgres 服务器的连接意外关闭。

这是一个可恢复的、完全非致命的错误。ClickPipes 将自动尝试重新连接并恢复复制过程。

这可能由以下几个原因引起:

- **wal_sender_timeout 过低:** 确保 `wal_sender_timeout` 设置为 5 分钟或更长。此设置控制服务器在关闭连接之前等待客户端响应的时长。如果超时时间过短,可能导致过早断开连接。
- **网络问题:** 临时的网络中断可能导致连接断开。
- **Postgres 服务器重启:** 如果 Postgres 服务器重启或崩溃,连接将会丢失。

### 我的复制槽已失效。我该怎么办? {#my-replication-slot-is-invalidated-what-should-i-do}

恢复 ClickPipe 的唯一方法是触发重新同步,您可以在设置页面中执行此操作。

复制槽失效的最常见原因是 PostgreSQL 数据库上的 `max_slot_wal_keep_size` 设置过低(例如,仅几个 GB)。我们建议增加此值。[请参阅此部分](/integrations/clickpipes/postgres/faq#recommended-max_slot_wal_keep_size-settings)了解如何调优 `max_slot_wal_keep_size`。理想情况下,应将其设置为至少 200GB 以防止复制槽失效。

在极少数情况下,即使未配置 `max_slot_wal_keep_size`,我们也观察到过此问题发生。这可能是由于 PostgreSQL 中一个复杂且罕见的 bug,尽管具体原因尚不清楚。

### 我在 ClickPipe 摄取数据时看到 ClickHouse 出现内存不足(OOM)错误。您能帮忙吗? {#i-am-seeing-out-of-memory-ooms-on-clickhouse-while-my-clickpipe-is-ingesting-data-can-you-help}

ClickHouse 出现 OOM 的一个常见原因是您的服务规模不足。这意味着您当前的服务配置没有足够的资源(例如内存或 CPU)来有效处理摄取负载。我们强烈建议扩展服务规模以满足 ClickPipe 数据摄取的需求。

我们观察到的另一个原因是存在具有潜在未优化连接的下游物化视图:

- 一种常见的 JOIN 优化技术是,如果您有一个 `LEFT JOIN`,其中右侧表非常大,可以将查询重写为使用 `RIGHT JOIN` 并将较大的表移到左侧。这使查询规划器能够更高效地使用内存。

- 另一种 JOIN 优化方法是通过 `子查询` 或 `CTE` 显式过滤表,然后在这些子查询之间执行 `JOIN`。这为规划器提供了如何高效过滤行和执行 `JOIN` 的提示。

### 我在初始加载期间看到 `invalid snapshot identifier` 错误。我该怎么办? {#i-am-seeing-an-invalid-snapshot-identifier-during-the-initial-load-what-should-i-do}

当 ClickPipes 与您的 Postgres 数据库之间发生连接断开时,会出现 `invalid snapshot identifier` 错误。这可能由于网关超时、数据库重启或其他瞬态问题而发生。

建议您在初始加载进行期间不要对 Postgres 数据库执行任何破坏性操作(如升级或重启),并确保与数据库的网络连接稳定。


要解决此问题,您可以从 ClickPipes UI 触发重新同步。这将从头开始重新启动初始加载过程。

### 如果我在 Postgres 中删除发布会发生什么? {#what-happens-if-i-drop-a-publication-in-postgres}

在 Postgres 中删除发布将中断您的 ClickPipe 连接,因为 ClickPipe 需要通过发布从源拉取变更。当这种情况发生时,您通常会收到一个错误警报,提示该发布已不存在。

删除发布后恢复 ClickPipe 的步骤:

1. 在 Postgres 中创建一个具有相同名称和所需表的新发布
2. 在 ClickPipe 的设置选项卡中点击"重新同步表"按钮

此重新同步是必要的,因为重新创建的发布在 Postgres 中将具有不同的对象标识符 (OID),即使它具有相同的名称。重新同步过程会刷新您的目标表并恢复连接。

或者,如果您愿意,也可以创建一个全新的管道。

请注意,如果您使用分区表,请确保使用适当的设置创建发布:

```sql
CREATE PUBLICATION clickpipes_publication
FOR TABLE <...>, <...>
WITH (publish_via_partition_root = true);
```

### 如果我看到 `Unexpected Datatype` 错误或 `Cannot parse type XX ...` 怎么办? {#what-if-i-am-seeing-unexpected-datatype-errors}

此错误通常发生在源 Postgres 数据库具有在摄取期间无法映射的数据类型时。
有关更具体的问题,请参考以下可能性。

### 我在复制/槽创建期间看到类似 `invalid memory alloc request size <XXX>` 的错误 {#postgres-invalid-memalloc-bug}

Postgres 补丁版本 17.5/16.9/15.13/14.18/13.21 中引入了一个错误,某些工作负载可能导致内存使用量呈指数级增长,从而导致内存分配请求超过 1GB,Postgres 认为这是无效的。此错误[已修复](https://github.com/postgres/postgres/commit/d87d07b7ad3b782cb74566cd771ecdb2823adf6a),并将包含在下一个 Postgres 补丁系列 (17.6...) 中。请向您的 Postgres 提供商咨询此补丁版本何时可用于升级。如果无法立即升级,则在遇到错误时需要重新同步管道。

### 即使从源 Postgres 数据库中删除数据,我也需要在 ClickHouse 中维护完整的历史记录。我可以在 ClickPipes 中完全忽略来自 Postgres 的 DELETE 和 TRUNCATE 操作吗? {#ignore-delete-truncate}

可以!在创建 Postgres ClickPipe 之前,创建一个不包含 DELETE 操作的发布。例如:

```sql
CREATE PUBLICATION <pub_name> FOR TABLES IN SCHEMA <schema_name> WITH (publish = 'insert,update');
```

然后在[设置](https://clickhouse.com/docs/integrations/clickpipes/postgres#configuring-the-replication-settings) Postgres ClickPipe 时,确保选择此发布名称。

请注意,TRUNCATE 操作会被 ClickPipes 忽略,不会复制到 ClickHouse。

### 为什么我无法复制名称中包含点的表? {#replicate-table-dot}

PeerDB 目前存在一个限制,即源表标识符(即模式名称或表名称)中的点不支持复制,因为在这种情况下 PeerDB 无法区分哪个是模式、哪个是表,因为它按点分割。
目前正在努力支持分别输入模式和表以解决此限制。

### 初始加载已完成,但 ClickHouse 上没有数据或数据缺失。可能是什么问题? {#initial-load-issue}

如果您的初始加载已完成且没有错误,但目标 ClickHouse 表缺少数据,可能是您在源 Postgres 表上启用了 RLS(行级安全)策略。
还值得检查:

- 用户是否具有读取源表的足够权限。
- ClickHouse 端是否存在可能过滤掉行的行策略。

### 我可以让 ClickPipe 创建启用故障转移的复制槽吗? {#failover-slot}

可以,对于复制模式为 CDC 或 Snapshot + CDC 的 Postgres ClickPipe,您可以在创建 ClickPipe 时通过切换 `高级设置` 部分中的以下开关来让 ClickPipes 创建启用故障转移的复制槽。请注意,您的 Postgres 版本必须为 17 或更高版本才能使用此功能。

<Image img={failover_slot} border size='md' />


如果源配置正确,在故障转移到 Postgres 只读副本后,槽位将被保留,从而确保数据持续复制。了解更多信息请访问[此处](https://www.postgresql.org/docs/current/logical-replication-failover.html)。

### 我遇到了类似 `Internal error encountered during logical decoding of aborted sub-transaction` 的错误 {#transient-logical-decoding-errors}

此错误表明在对已中止的子事务进行逻辑解码时出现了临时性问题,这是 Aurora Postgres 自定义实现特有的情况。由于该错误来自 `ReorderBufferPreserveLastSpilledSnapshot` 例程,这表明逻辑解码无法读取溢出到磁盘的快照。建议尝试将 [`logical_decoding_work_mem`](https://www.postgresql.org/docs/current/runtime-config-resource.html#GUC-LOGICAL-DECODING-WORK-MEM) 增加到更高的值。

### 我在 CDC 复制期间遇到了类似 `error converting new tuple to map` 或 `error parsing logical message` 的错误 {#logical-message-processing-errors}

Postgres 以具有固定协议的消息形式发送变更信息。当 ClickPipe 接收到无法解析的消息时会出现这些错误,原因可能是传输过程中的数据损坏或发送了无效消息。虽然具体问题因情况而异,但我们已经发现多个来自 Neon Postgres 数据源的案例。如果您在使用 Neon 时也遇到此问题,请向他们提交支持工单。对于其他情况,请联系我们的支持团队寻求指导。
