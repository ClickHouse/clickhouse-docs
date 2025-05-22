---
'description': '页面描述 ClickHouse 中的事务性 (ACID) 支持'
'slug': '/guides/developer/transactional'
'title': '事务性 (ACID) 支持'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 事务（ACID）支持

## 案例 1：向一个 MergeTree* 家族的表中的一个分区插入数据 {#case-1-insert-into-one-partition-of-one-table-of-the-mergetree-family}

如果插入的行被打包并作为单个块插入，则这是事务性的（ACID）（请参见注释）：
- 原子性：插入成功或作为一个整体被拒绝：如果向客户端发送了确认，则表示所有行都已插入；如果向客户端发送了错误，则表示没有行被插入。
- 一致性：如果没有违反表约束，则所有插入的行都已插入，插入成功；如果违反了约束，则没有行被插入。
- 隔离性：并发客户端观察到表的一致快照——表的状态要么是插入尝试之前的状态，要么是成功插入后的状态；看不到部分状态。处于另一个事务内的客户端具有 [快照隔离](https://en.wikipedia.org/wiki/Snapshot_isolation)，而事务外的客户端具有 [未提交读取](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Read_uncommitted) 隔离级别。
- 持久性：成功插入在响应客户端之前写入文件系统，可以在单个副本或多个副本上（由 `insert_quorum` 设置控制），ClickHouse 可以请求操作系统在存储介质上同步文件系统数据（由 `fsync_after_insert` 设置控制）。
- 如果涉及物化视图，可以使用单个语句向多个表插入数据（来自客户端的插入是针对具有相关物化视图的表）。

## 案例 2：向一个 MergeTree* 家族的表中的多个分区插入数据 {#case-2-insert-into-multiple-partitions-of-one-table-of-the-mergetree-family}

与上面的案例 1 相同，增加以下细节：
- 如果表有许多分区，并且插入涉及多个分区，则对每个分区的插入都是独立的事务。

## 案例 3：向一个 MergeTree* 家族的分布式表插入数据 {#case-3-insert-into-one-distributed-table-of-the-mergetree-family}

与上面的案例 1 相同，增加以下细节：
- 向分布式表的插入不是整个事务，而对每个分片的插入是事务性的。

## 案例 4：使用缓冲区表 {#case-4-using-a-buffer-table}

- 向缓冲区表的插入既不是原子性也不是隔离性，也不是一致性或持久性。

## 案例 5：使用 async_insert {#case-5-using-async_insert}

与上面的案例 1 相同，增加以下细节：
- 即使启用了 `async_insert` 并且将 `wait_for_async_insert` 设置为 1（默认值），也可确保原子性，但如果将 `wait_for_async_insert` 设置为 0，则不保证原子性。

## 注释 {#notes}
- 从客户端插入的某些数据格式的行在以下情况下打包为一个块：
  - 插入格式是基于行的（如 CSV、TSV、值、JSONEachRow 等），并且数据包含少于 `max_insert_block_size` 行（默认约为 1,000,000）或在使用并行解析时包含少于 `min_chunk_bytes_for_parallel_parsing` 字节（默认 10 MB）
  - 插入格式是基于列的（如 Native、Parquet、ORC 等），并且数据只包含一个数据块
- 插入块的大小通常可能依赖于许多设置（例如：`max_block_size`、`max_insert_block_size`、`min_insert_block_size_rows`、`min_insert_block_size_bytes`、`preferred_block_size_bytes` 等）
- 如果客户端没有收到来自服务器的响应，客户端不知道事务是否成功，并且可以重复事务，使用精确一次的插入属性
- ClickHouse 在内部使用 [MVCC](https://en.wikipedia.org/wiki/Multiversion_concurrency_control) 和 [快照隔离](https://en.wikipedia.org/wiki/Snapshot_isolation) 来处理并发事务
- 即使在服务器崩溃/死亡的情况下，所有 ACID 属性也有效
- 在典型设置中，应启用 insert_quorum 到不同的 AZ 或 fsync 以确保持久插入
- 在 ACID 术语中，“一致性”并不涵盖分布式系统的语义，参见 https://jepsen.io/consistency ，由不同设置（select_sequential_consistency）控制
- 此说明未涵盖允许进行全功能事务的新的事务功能，支持多个表、物化视图以及多个 SELECT 等（请参见下一个部分关于事务、提交和回滚的内容）

## 事务、提交和回滚 {#transactions-commit-and-rollback}

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

除了本文开头描述的功能外，ClickHouse 还实验性支持事务、提交和回滚功能。

### 要求 {#requirements}

- 部署 ClickHouse Keeper 或 ZooKeeper 来跟踪事务
- 仅限原子数据库（默认）
- 仅限非复制的 MergeTree 表引擎
- 通过在 `config.d/transactions.xml` 中添加以下设置来启用实验性事务支持：
```xml
<clickhouse>
  <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

### 注释 {#notes-1}
- 这是一个实验功能，预计会有变化。
- 如果在事务期间发生异常，则无法提交事务。这包括所有异常，包括因拼写错误引起的 `UNKNOWN_FUNCTION` 异常。
- 不支持嵌套事务；请结束当前事务并开始一个新事务。

### 配置 {#configuration}

这些示例是在启用了 ClickHouse Keeper 的单节点 ClickHouse 服务器上进行的。

#### 启用实验性事务支持 {#enable-experimental-transaction-support}

```xml title=/etc/clickhouse-server/config.d/transactions.xml
<clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

#### 启用了 ClickHouse Keeper 的单个 ClickHouse 服务器节点的基本配置 {#basic-configuration-for-a-single-clickhouse-server-node-with-clickhouse-keeper-enabled}

:::note
有关部署 ClickHouse 服务器和适当的 ClickHouse Keeper 节点法定人数的详细信息，请参见 [部署](/deployment-guides/terminology.md) 文档。这里显示的配置仅用于实验目的。
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

发出 `BEGIN TRANSACTION` 或 `START TRANSACTION`，后跟 `ROLLBACK` 以验证实验性事务是否已启用，并且 ClickHouse Keeper 已启用，因为它用于跟踪事务。

```sql
BEGIN TRANSACTION
```
```response
Ok.
```

:::tip
如果您看到以下错误，请检查您的配置文件以确保 `allow_experimental_transactions` 设置为 `1`（或其他非 `0` 或 `false` 的值）。

```response
Code: 48. DB::Exception: Received from localhost:9000.
DB::Exception: Transactions are not supported.
(NOT_IMPLEMENTED)
```

您还可以通过发出以下内容来检查 ClickHouse Keeper

```bash
echo ruok | nc localhost 9181
```

ClickHouse Keeper 应该回复 `imok`。
:::

```sql
ROLLBACK
```

```response
Ok.
```

#### 创建测试表 {#create-a-table-for-testing}

:::tip
表的创建不是事务性的。请在事务之外运行此 DDL 查询。
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

#### 开始一个事务并插入一行 {#begin-a-transaction-and-insert-a-row}

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
您可以在事务内部查询表，并看到即使尚未提交，也插入了该行。
:::

#### 回滚事务，并再次查询表 {#rollback-the-transaction-and-query-the-table-again}

验证事务是否已回滚：

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

您可以通过查询 `system.transactions` 表来检查事务，但请注意，您无法在处于事务中的会话中查询该表。打开第二个 `clickhouse client` 会话以查询该表。

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

## 更多细节 {#more-details}

请参阅此 [元问题](https://github.com/ClickHouse/ClickHouse/issues/48794)，以获取更广泛的测试，并保持与进展的同步。
