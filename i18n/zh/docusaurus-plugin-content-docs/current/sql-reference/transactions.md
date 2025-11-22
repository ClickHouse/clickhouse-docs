---
description: '介绍 ClickHouse 中 ACID 事务支持的页面'
slug: /guides/developer/transactional
title: 'ACID 事务支持'
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 事务（ACID）支持



## 案例 1:向 MergeTree\* 系列表的单个分区执行 INSERT {#case-1-insert-into-one-partition-of-one-table-of-the-mergetree-family}

如果插入的行被打包并作为单个数据块插入(参见注释),则此操作具有事务性(ACID):

- 原子性:INSERT 操作要么整体成功,要么整体被拒绝:如果向客户端发送了确认消息,则所有行均已插入;如果向客户端发送了错误消息,则没有任何行被插入。
- 一致性:如果没有违反表约束,则 INSERT 中的所有行都会被插入且 INSERT 成功;如果违反了约束,则不会插入任何行。
- 隔离性:并发客户端观察到的是表的一致性快照——表的状态要么是 INSERT 尝试之前的状态,要么是 INSERT 成功之后的状态;不会看到部分状态。位于事务内的客户端具有[快照隔离](https://en.wikipedia.org/wiki/Snapshot_isolation),而事务外的客户端具有[读未提交](<https://en.wikipedia.org/wiki/Isolation_(database_systems)#Read_uncommitted>)隔离级别。
- 持久性:成功的 INSERT 在响应客户端之前会写入文件系统,可以写入单个副本或多个副本(由 `insert_quorum` 设置控制),并且 ClickHouse 可以要求操作系统将文件系统数据同步到存储介质(由 `fsync_after_insert` 设置控制)。
- 如果涉及物化视图,则可以使用一条语句向多个表执行 INSERT(客户端的 INSERT 操作针对具有关联物化视图的表)。


## 情况 2:向 MergeTree\* 系列表的多个分区执行 INSERT {#case-2-insert-into-multiple-partitions-of-one-table-of-the-mergetree-family}

与上述情况 1 相同,但需注意以下细节:

- 如果表包含多个分区且 INSERT 操作涉及多个分区,则每个分区的插入操作各自独立保证事务性


## 案例 3：向 MergeTree\* 系列的分布式表执行 INSERT {#case-3-insert-into-one-distributed-table-of-the-mergetree-family}

与上述案例 1 相同,但需注意以下细节:

- 向分布式表执行 INSERT 操作整体上不具备事务性,但向每个分片的插入操作具备事务性


## 案例 4：使用 Buffer 表 {#case-4-using-a-buffer-table}

- 向 Buffer 表插入数据不具备原子性、隔离性、一致性和持久性


## 案例 5：使用 async_insert {#case-5-using-async_insert}

与上述案例 1 相同，具体说明如下：

- 即使启用了 `async_insert` 并且 `wait_for_async_insert` 设置为 1（默认值），原子性仍然可以得到保证；但如果 `wait_for_async_insert` 设置为 0，则无法保证原子性。


## 注意事项 {#notes}

- 当满足以下条件时,从客户端插入的数据行会被打包到单个数据块中:
  - 插入格式为基于行的格式(如 CSV、TSV、Values、JSONEachRow 等),且数据包含的行数少于 `max_insert_block_size`(默认约 1,000,000 行),或在使用并行解析时(默认启用)数据大小少于 `min_chunk_bytes_for_parallel_parsing` 字节(默认 10 MB)
  - 插入格式为基于列的格式(如 Native、Parquet、ORC 等),且数据仅包含一个数据块
- 插入数据块的大小通常取决于多个配置参数(例如:`max_block_size`、`max_insert_block_size`、`min_insert_block_size_rows`、`min_insert_block_size_bytes`、`preferred_block_size_bytes` 等)
- 如果客户端未收到服务器的响应,客户端无法确定事务是否成功,此时可以利用恰好一次插入特性重复执行该事务
- ClickHouse 内部使用 [MVCC](https://en.wikipedia.org/wiki/Multiversion_concurrency_control) 结合[快照隔离](https://en.wikipedia.org/wiki/Snapshot_isolation)来处理并发事务
- 即使在服务器被强制终止或崩溃的情况下,所有 ACID 特性仍然有效
- 在典型部署中,应启用跨不同可用区的 insert_quorum 或 fsync 以确保插入的持久性
- ACID 中的"一致性"概念不涵盖分布式系统的语义,相关内容请参阅 https://jepsen.io/consistency,分布式系统的一致性由不同的配置参数控制(如 select_sequential_consistency)
- 本说明不涵盖新的事务功能,该功能支持跨多个表、物化视图执行完整的事务操作,以及多个 SELECT 查询等(详见下一节关于事务、提交和回滚的内容)


## 事务、提交和回滚 {#transactions-commit-and-rollback}

<ExperimentalBadge />
<CloudNotSupportedBadge />

除了本文档开头描述的功能外,ClickHouse 还提供了对事务、提交和回滚功能的实验性支持。

### 要求 {#requirements}

- 部署 ClickHouse Keeper 或 ZooKeeper 来跟踪事务
- 仅支持 Atomic 数据库(默认)
- 仅支持非复制的 MergeTree 表引擎
- 通过在 `config.d/transactions.xml` 中添加以下设置来启用实验性事务支持:
  ```xml
  <clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
  </clickhouse>
  ```

### 注意事项 {#notes-1}

- 这是一个实验性功能,可能会发生变更。
- 如果事务执行期间发生异常,则无法提交该事务。这包括所有异常,包括由拼写错误引起的 `UNKNOWN_FUNCTION` 异常。
- 不支持嵌套事务;请先完成当前事务,然后再启动新事务

### 配置 {#configuration}

以下示例使用启用了 ClickHouse Keeper 的单节点 ClickHouse 服务器。

#### 启用实验性事务支持 {#enable-experimental-transaction-support}

```xml title=/etc/clickhouse-server/config.d/transactions.xml
<clickhouse>
    <allow_experimental_transactions>1</allow_experimental_transactions>
</clickhouse>
```

#### 启用 ClickHouse Keeper 的单节点 ClickHouse 服务器基本配置 {#basic-configuration-for-a-single-clickhouse-server-node-with-clickhouse-keeper-enabled}

:::note
有关部署 ClickHouse 服务器和适当仲裁数量的 ClickHouse Keeper 节点的详细信息,请参阅[部署](/deployment-guides/terminology.md)文档。此处显示的配置仅用于实验目的。
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

执行 `BEGIN TRANSACTION` 或 `START TRANSACTION`,然后执行 `ROLLBACK` 来验证实验性事务是否已启用,以及 ClickHouse Keeper 是否已启用(它用于跟踪事务)。

```sql
BEGIN TRANSACTION
```

```response
Ok.
```

:::tip
如果看到以下错误,请检查配置文件以确保 `allow_experimental_transactions` 设置为 `1`(或除 `0` 或 `false` 之外的任何值)。

```response
Code: 48. DB::Exception: Received from localhost:9000.
DB::Exception: Transactions are not supported.
(NOT_IMPLEMENTED)
```

您还可以通过执行以下命令来检查 ClickHouse Keeper

```bash
echo ruok | nc localhost 9181
```

ClickHouse Keeper 应该响应 `imok`。
:::

```sql
ROLLBACK
```

```response
Ok.
```

#### 创建测试表 {#create-a-table-for-testing}

:::tip
表的创建不是事务性的。请在事务外执行此 DDL 查询。
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
您可以在事务内查询表并看到已插入的行,即使该行尚未提交。
:::

#### 回滚事务并再次查询表 {#rollback-the-transaction-and-query-the-table-again}

验证事务已回滚:

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

您可以通过查询 `system.transactions` 表来检查事务,但请注意,您不能从处于事务中的会话查询该表。请打开第二个 `clickhouse client` 会话来查询该表。

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


## 更多详情 {#more-details}

请参阅此 [meta issue](https://github.com/ClickHouse/ClickHouse/issues/48794) 以查找更全面的测试并跟踪最新进展。
