---
description: '介绍 ClickHouse 对事务（ACID）支持的页面'
slug: /guides/developer/transactional
title: '事务（ACID）支持'
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# 事务（ACID）支持 \\{#transactional-acid-support\\}

## 案例 1：对 MergeTree* 系列中某张表的一个分区执行 INSERT \\{#case-1-insert-into-one-partition-of-one-table-of-the-mergetree-family\\}

当插入的行被打包并作为单个数据块插入时（参见备注），该操作具备事务（ACID）特性：
- 原子性（Atomic）：一次 INSERT 要么整体成功，要么整体被拒绝：如果向客户端发送了确认，则说明所有行都已插入；如果向客户端发送了错误，则说明没有任何行被插入。
- 一致性（Consistent）：如果没有违反表约束，则 INSERT 中的所有行都会被插入，并且该 INSERT 成功；如果违反了约束，则不会插入任何行。
- 隔离性（Isolated）：并发客户端会看到表的一个一致快照 —— 要么是执行 INSERT 尝试之前的表状态，要么是成功 INSERT 之后的表状态；不会看到部分中间状态。处于其他事务中的客户端具有[快照隔离](https://en.wikipedia.org/wiki/Snapshot_isolation)，而在事务外部的客户端具有[读未提交](https://en.wikipedia.org/wiki/Isolation_(database_systems)#Read_uncommitted)隔离级别。
- 持久性（Durable）：成功的 INSERT 在响应客户端之前会被写入文件系统，可以只写入单个副本，也可以写入多个副本（由 `insert_quorum` 设置控制），并且 ClickHouse 可以请求操作系统将文件系统数据同步到存储介质（由 `fsync_after_insert` 设置控制）。
- 如果涉及物化视图，则可以通过一个语句向多个表执行 INSERT（即客户端的 INSERT 目标是一张带有关联物化视图的表）。

## 情况 2：对 MergeTree* 系列中的一个表执行跨多个分区的 INSERT \\{#case-2-insert-into-multiple-partitions-of-one-table-of-the-mergetree-family\\}

与上述情况 1 相同，补充细节如下：
- 如果表包含多个分区且 INSERT 涵盖多个分区，那么对每个分区的插入在各自分区内单独具备事务性

## 情况 3：向 MergeTree* 系列的一个分布式表执行 INSERT \\{#case-3-insert-into-one-distributed-table-of-the-mergetree-family\\}

与上述情况 1 相同，但有以下区别：
- 向 Distributed 表执行 INSERT 时，整体操作不具备事务性，而对每个分片的插入则是事务性的

## 案例 4：使用 Buffer 表 \\{#case-4-using-a-buffer-table\\}

- 对 Buffer 表的插入操作不具备原子性、隔离性、一致性或持久性

## 案例 5：使用 async_insert \\{#case-5-using-async_insert\\}

与上面的案例 1 相同，但有以下差异：
- 即使启用了 `async_insert` 且 `wait_for_async_insert` 设置为 1（默认值），也可以保证原子性；但如果将 `wait_for_async_insert` 设置为 0，则不再保证原子性。

## 说明 \\{#notes\\}
- 在以下情况下，客户端以某种数据格式插入的多行会被打包到同一个数据块中：
  - 插入格式是行式的（例如 CSV、TSV、Values、JSONEachRow 等），并且数据包含的行数少于 `max_insert_block_size`（默认约 1 000 000 行）；如果启用了并行解析（默认启用），当数据大小少于 `min_chunk_bytes_for_parallel_parsing` 字节（默认 10 MB）时也会被打包为单个数据块
  - 插入格式是列式的（例如 Native、Parquet、ORC 等），并且数据只包含一个数据块
- 一般而言，插入数据块的大小可能取决于许多设置（例如：`max_block_size`、`max_insert_block_size`、`min_insert_block_size_rows`、`min_insert_block_size_bytes`、`preferred_block_size_bytes` 等）
- 如果客户端没有收到来自服务器的响应，客户端无法知道事务是否成功，可以依靠“精确一次”插入特性重复执行该事务
- ClickHouse 在内部对并发事务使用带有 [snapshot isolation](https://en.wikipedia.org/wiki/Snapshot_isolation) 的 [MVCC](https://en.wikipedia.org/wiki/Multiversion_concurrency_control)
- 即使在服务器被强制终止或崩溃的情况下，所有 ACID 属性仍然有效
- 在典型部署中，应启用写入到不同 AZ 的 insert_quorum 或启用 fsync，以确保插入具有持久性
- ACID 语境下的“consistency”并不涵盖分布式系统的语义，参见 https://jepsen.io/consistency；这类语义由不同的设置（select_sequential_consistency）控制
- 本说明未涵盖新的事务特性，该特性允许在多张表、物化视图上以及针对多个 SELECT 等执行完整功能的事务（参见下一节 “Transactions, Commit, and Rollback”）

## 事务、提交和回滚 \\{#transactions-commit-and-rollback\\}

<ExperimentalBadge />

<CloudNotSupportedBadge />

除了本文件前文描述的功能之外，ClickHouse 还对事务、提交和回滚提供实验性支持。

### 要求 \\{#requirements\\}

* 部署 ClickHouse Keeper 或 ZooKeeper 用于跟踪事务
* 仅支持 Atomic 数据库（默认）
* 仅支持非 Replicated 的 MergeTree 表引擎
* 通过在 `config.d/transactions.xml` 中添加以下设置来启用实验性事务支持：
  ```xml
  <clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
  </clickhouse>
  ```

### 注意事项 \\{#notes-1\\}

* 这是一个实验性特性，未来可能会发生变化。
* 如果在事务期间发生异常，则无法提交该事务。这包括所有异常，包括由于拼写错误导致的 `UNKNOWN_FUNCTION` 异常。
* 不支持嵌套事务；请先完成当前事务，然后再启动一个新事务。

### 配置 \\{#configuration\\}

以下示例基于启用了 ClickHouse Keeper 的单节点 ClickHouse 服务器。

#### 启用实验性事务支持 \\{#enable-experimental-transaction-support\\}

```xml title=/etc/clickhouse-server/config.d/transactions.xml
<clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

#### 启用 ClickHouse Keeper 的单个 ClickHouse 服务器节点的基本配置 \\{#basic-configuration-for-a-single-clickhouse-server-node-with-clickhouse-keeper-enabled\\}

:::note
有关部署 ClickHouse 服务器以及配置合适数量的 ClickHouse Keeper 节点以形成法定节点数的详细信息，请参阅 [deployment](/deployment-guides/terminology.md) 文档。此处展示的配置仅供实验使用。
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

### 示例 \\{#example\\}

#### 验证实验性事务是否已启用 \\{#verify-that-experimental-transactions-are-enabled\\}

执行一次 `BEGIN TRANSACTION` 或 `START TRANSACTION`，随后执行 `ROLLBACK`，以验证实验性事务是否已启用，并确认 ClickHouse Keeper 已启用，因为它用于跟踪事务。

```sql
开始事务
```

```response
确认。
```

:::tip
如果遇到以下错误，请检查配置文件，确保将 `allow_experimental_transactions` 设置为 `1`（或任何不等于 `0` 或 `false` 的值）。

```response
代码:48. DB::Exception:从 localhost:9000 接收。
DB::Exception:不支持事务。
(NOT_IMPLEMENTED)
```

你还可以通过执行以下命令检查 ClickHouse Keeper：

```bash
echo ruok | nc localhost 9181
```

ClickHouse Keeper 应返回 `imok`。

```sql
ROLLBACK
```

```response
确认。
```

#### 创建用于测试的表 \\{#create-a-table-for-testing\\}

:::tip
建表操作不具备事务性。请在事务之外执行此 DDL 语句。
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
确认。
```

#### 开始一个事务并插入一行数据 \\{#begin-a-transaction-and-insert-a-row\\}

```sql
BEGIN TRANSACTION
```

```response
确认。
```

```sql
INSERT INTO mergetree_table FORMAT Values (10)
```

```response
确认。
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
你可以在事务内部查询该表，会发现该行已经被插入，即使该事务尚未提交。
:::

#### 回滚事务，然后再次查询该表 \\{#rollback-the-transaction-and-query-the-table-again\\}

确认事务已被回滚：

```sql
ROLLBACK
```

```response
确认。
```

```sql
SELECT *
FROM mergetree_table
```

```response
Ok.

结果集包含 0 行。耗时：0.002 秒。
```

#### 完成事务并再次查询该表 \\{#complete-a-transaction-and-query-the-table-again\\}

```sql
BEGIN TRANSACTION
```

```response
确认。
```

```sql
INSERT INTO mergetree_table FORMAT Values (42)
```

```response
确认。
```

```sql
COMMIT
```

```response
Ok. 耗时：0.002 秒。
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

### 事务查看 \\{#transactions-introspection\\}

你可以通过查询 `system.transactions` 表来检查事务，但请注意，处于事务中的会话无法查询该表。请另开一个 `clickhouse client` 会话来查询该表。

```sql
SELECT *
FROM system.transactions
FORMAT Vertical
```

```response
第 1 行:
──────
tid:         (33,61,'51e60bce-6b82-4732-9e1d-b40705ae9ab8')
tid_hash:    11240433987908122467
elapsed:     210.017820947
is_readonly: 1
state:       RUNNING
```

## 更多详情 \\{#more-details\\}

请参阅此 [meta issue](https://github.com/ClickHouse/ClickHouse/issues/48794)，以了解更全面的测试内容，并及时跟进最新进展。
