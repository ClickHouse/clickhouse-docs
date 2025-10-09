---
'description': '页面描述 ClickHouse 中的事务性 (ACID) 支持'
'slug': '/guides/developer/transactional'
'title': '事务性 (ACID) 支持'
'doc_type': 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 事务（ACID）支持

## 情况 1: 向 MergeTree* 家族的一个表的一个分区中插入 {#case-1-insert-into-one-partition-of-one-table-of-the-mergetree-family}

如果插入的行被打包并作为单个块插入，则这是事务性的（ACID）。请参见备注：
- 原子性：一个 INSERT 要么作为一个整体成功，要么被拒绝：如果确认发送到客户端，则所有行都被插入；如果发送错误到客户端，则没有插入任何行。
- 一致性：如果没有违反表约束，则 INSERT 中的所有行都被插入并且成功；如果违反了约束，则没有插入任何行。
- 隔离性：并发客户端观察到表的一致快照——表的状态要么是在 INSERT 尝试之前，要么是在成功的 INSERT 之后；没有看到部分状态。在另一个事务内的客户端具有 [快照隔离](https://en.wikipedia.org/wiki/Snapshot_isolation)，而在事务外的客户端具有 [读取未提交](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Read_uncommitted) 隔离级别。
- 持久性：成功的 INSERT 在回答客户端之前写入文件系统，可以在单个副本或多个副本上（由 `insert_quorum` 设置控制），且 ClickHouse 可以请求操作系统在存储介质上同步文件系统数据（由 `fsync_after_insert` 设置控制）。
- 如果涉及物化视图，使用一个语句向多个表插入是可能的（来自客户端的 INSERT 是到具有相关物化视图的表）。

## 情况 2: 向 MergeTree* 家族的一个表的多个分区中插入 {#case-2-insert-into-multiple-partitions-of-one-table-of-the-mergetree-family}

与上述情况 1 相同，仅此细节：
- 如果表有多个分区且 INSERT 涉及多个分区，则向每个分区的插入是各自事务性的。

## 情况 3: 向 MergeTree* 家族的一个分布式表中插入 {#case-3-insert-into-one-distributed-table-of-the-mergetree-family}

与上述情况 1 相同，仅此细节：
- 向分布式表的插入不是整体事务性的，而向每个分片的插入是事务性的。

## 情况 4: 使用缓冲表 {#case-4-using-a-buffer-table}

- 向缓冲表的插入既不是原子性的，也不是隔离的、一致的或持久的。

## 情况 5: 使用 async_insert {#case-5-using-async_insert}

与上述情况 1 相同，仅此细节：
- 即使启用了 `async_insert` 并且将 `wait_for_async_insert` 设置为 1（默认值），也确保原子性，但如果将 `wait_for_async_insert` 设置为 0，则不保证原子性。

## 备注 {#notes}
- 从客户端以某种数据格式插入的行在以下情况下被打包成单个块：
  - 插入格式是基于行的（如 CSV、TSV、Values、JSONEachRow 等），且数据包含的行数少于 `max_insert_block_size`（默认约 1,000,000）或字节数少于 `min_chunk_bytes_for_parallel_parsing`（默认10 MB），在使用并行解析的情况下（默认启用）
  - 插入格式是基于列的（如 Native、Parquet、ORC 等），且数据只包含一个数据块。
- 插入块的大小通常可能依赖于多个设置（例如：`max_block_size`、`max_insert_block_size`、`min_insert_block_size_rows`、`min_insert_block_size_bytes`、`preferred_block_size_bytes` 等）。
- 如果客户端未收到服务器的答复，客户端不清楚事务是否成功，并且可以重复事务，使用精确一次插入属性。
- ClickHouse 内部使用 [MVCC](https://en.wikipedia.org/wiki/Multiversion_concurrency_control) 结合 [快照隔离](https://en.wikipedia.org/wiki/Snapshot_isolation) 来处理并发事务。
- 即使在服务器终止/崩溃的情况下，所有 ACID 属性仍然有效。
- 在典型设置中，必须启用 `insert_quorum` 到不同的 AZ 或 `fsync` 以确保持久插入。
- 在 ACID 术语中，“一致性”并不涵盖分布式系统的语义，详见 https://jepsen.io/consistency ，这由不同的设置控制（select_sequential_consistency）。
- 本解释未涵盖允许在多个表、物化视图上进行全面事务的新增事务功能，涉及多个 SELECT 等（参见下一节关于事务、提交和回滚）。

## 事务、提交和回滚 {#transactions-commit-and-rollback}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

除了本文开头描述的功能外，ClickHouse 还对事务、提交和回滚功能提供实验性支持。

### 要求 {#requirements}

- 部署 ClickHouse Keeper 或 ZooKeeper 来跟踪事务。
- 仅适用于原子数据库（默认）。
- 仅适用于非复制的 MergeTree 表引擎。
- 通过在 `config.d/transactions.xml` 中添加以下设置来启用实验性事务支持：
```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

### 备注 {#notes-1}
- 这是一个实验性功能，可能会有变动。
- 如果在事务期间发生异常，您无法提交事务。这包括所有异常，包括由于拼写错误引起的 `UNKNOWN_FUNCTION` 异常。
- 不支持嵌套事务；请完成当前事务并启动一个新事务。

### 配置 {#configuration}

这些示例是在启用 ClickHouse Keeper 的单节点 ClickHouse 服务器上。

#### 启用实验性事务支持 {#enable-experimental-transaction-support}

```xml title=/etc/clickhouse-server/config.d/transactions.xml
<clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

#### 启用 ClickHouse Keeper 的单节点 ClickHouse 服务器的基本配置 {#basic-configuration-for-a-single-clickhouse-server-node-with-clickhouse-keeper-enabled}

:::note
有关部署 ClickHouse 服务器和适当的 ClickHouse Keeper 节点的配额详情，请参阅 [部署](/deployment-guides/terminology.md) 文档。这里显示的配置仅供实验用途。
:::

```xml title=/etc/clickhouse-server/config.d/config.xml
<clickhouse replace="true">
    <logger>
        <level>debug</level>
        <log>/var/log/clickhouse-server/clickhouse-server.log</log>
        <errorlog>/var/log/clickhouse-server/clickhouse-server.err.log</errorlog>
        <size>1000M</size>
        <count>3</count>
    </logger>
    <display_name>node 1</display_name>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <zookeeper>
        <node>
            <host>clickhouse-01</host>
            <port>9181</port>
        </node>
    </zookeeper>
    <keeper_server>
        <tcp_port>9181</tcp_port>
        <server_id>1</server_id>
        <log_storage_path>/var/lib/clickhouse/coordination/log</log_storage_path>
        <snapshot_storage_path>/var/lib/clickhouse/coordination/snapshots</snapshot_storage_path>
        <coordination_settings>
            <operation_timeout_ms>10000</operation_timeout_ms>
            <session_timeout_ms>30000</session_timeout_ms>
            <raft_logs_level>information</raft_logs_level>
        </coordination_settings>
        <raft_configuration>
            <server>
                <id>1</id>
                <hostname>clickhouse-keeper-01</hostname>
                <port>9234</port>
            </server>
        </raft_configuration>
    </keeper_server>
</clickhouse>
```

### 示例 {#example}

#### 验证实验性事务是否已启用 {#verify-that-experimental-transactions-are-enabled}

发出 `BEGIN TRANSACTION` 或 `START TRANSACTION`，然后跟随 `ROLLBACK` 以验证实验性事务是否已启用，以及 ClickHouse Keeper 是否已启用（因为它用于跟踪事务）。

```sql
BEGIN TRANSACTION
```
```response
Ok.
```

:::tip
如果您看到以下错误，请检查配置文件以确保 `allow_experimental_transactions` 设置为 `1`（或任何非 `0` 或 `false` 的值）。

```response
Code: 48. DB::Exception: Received from localhost:9000.
DB::Exception: Transactions are not supported.
(NOT_IMPLEMENTED)
```

您还可以通过发出以下命令检查 ClickHouse Keeper

```bash
echo ruok | nc localhost 9181
```

ClickHouse Keeper 应该以 `imok` 响应。
:::

```sql
ROLLBACK
```

```response
Ok.
```

#### 创建一个用于测试的表 {#create-a-table-for-testing}

:::tip
表的创建不是事务性的。 请在事务外运行此 DDL 查询。
:::

```sql
CREATE TABLE mergetree_table
(
    `n` Int64
)
ENGINE = MergeTree
ORDER BY n
```

```response
Ok.
```

#### 开始事务并插入一行 {#begin-a-transaction-and-insert-a-row}

```sql
BEGIN TRANSACTION
```

```response
Ok.
```

```sql
INSERT INTO mergetree_table FORMAT Values (10)
```

```response
Ok.
```

```sql
SELECT *
FROM mergetree_table
```

```response
┌──n─┐
│ 10 │
└────┘
```

:::note
您可以在事务内查询表，并看到行已插入，尽管它尚未被提交。
:::

#### 回滚事务，并再次查询表 {#rollback-the-transaction-and-query-the-table-again}

验证事务已回滚：

```sql
ROLLBACK
```

```response
Ok.
```

```sql
SELECT *
FROM mergetree_table
```
```response
Ok.

0 rows in set. Elapsed: 0.002 sec.
```

#### 完成事务并再次查询表 {#complete-a-transaction-and-query-the-table-again}

```sql
BEGIN TRANSACTION
```
```response
Ok.
```

```sql
INSERT INTO mergetree_table FORMAT Values (42)
```

```response
Ok.
```

```sql
COMMIT
```

```response
Ok. Elapsed: 0.002 sec.
```

```sql
SELECT *
FROM mergetree_table
```

```response
┌──n─┐
│ 42 │
└────┘
```

### 事务检查 {#transactions-introspection}

您可以通过查询 `system.transactions` 表来检查事务，但请注意，您无法从正在事务中的会话查询该表。打开第二个 `clickhouse client` 会话来查询该表。

```sql
SELECT *
FROM system.transactions
FORMAT Vertical
```

```response
Row 1:
──────
tid:         (33,61,'51e60bce-6b82-4732-9e1d-b40705ae9ab8')
tid_hash:    11240433987908122467
elapsed:     210.017820947
is_readonly: 1
state:       RUNNING
```

## 更多详细信息 {#more-details}

请查看此 [元问题](https://github.com/ClickHouse/ClickHouse/issues/48794)，以找到更广泛的测试并跟进进展。
