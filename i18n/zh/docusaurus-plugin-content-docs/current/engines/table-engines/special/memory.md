---
description: 'Memory 引擎以未压缩形式将数据存储在内存（RAM）中。数据的存储形式与写入时接收到的形式完全相同。换句话说，从该表中读取数据没有任何额外开销。'
sidebar_label: 'Memory'
sidebar_position: 110
slug: /engines/table-engines/special/memory
title: 'Memory 表引擎'
doc_type: 'reference'
---

# Memory 表引擎 {#memory-table-engine}

:::note
在 ClickHouse Cloud 上使用 Memory 表引擎时，数据出于设计原因不会在所有节点之间复制。若要保证所有查询都被路由到同一节点，并使 Memory 表引擎按预期工作，可以采用以下任一方式：
- 在同一个会话中执行所有操作
- 使用通过 TCP 或原生接口（支持粘性连接）的客户端，例如 [clickhouse-client](/interfaces/cli)
:::

Memory 引擎以未压缩形式将数据存储在 RAM 中。数据以与读取时接收到的完全相同的形式存储。换句话说，从该表中读取几乎没有任何开销。
并发数据访问是同步的。锁的持有时间非常短：读写操作不会互相阻塞。
不支持索引。读取会被并行化。

在简单查询上可以达到最高性能（超过 10 GB/sec），因为没有磁盘读取、解压缩或数据反序列化的开销。（需要指出的是，在很多情况下，MergeTree 引擎的性能几乎同样高。）
当服务器重启时，表中的数据会消失，表将变为空表。
通常情况下，没有使用该表引擎的充分理由。不过，它可以用于测试，以及在行数相对较少（大约不超过 100,000,000 行）且对极致性能有要求的任务中。

Memory 引擎被系统用于带有外部查询数据的临时表（参见“External data for processing a query”一节），以及实现 `GLOBAL IN`（参见“IN operators”一节）。

可以指定上限和下限来限制 Memory 引擎表的大小，从而有效地使其充当一个环形缓冲区（参见 [Engine Parameters](#engine-parameters)）。

## 引擎参数 {#engine-parameters}

- `min_bytes_to_keep` — 当内存表设置了大小上限时需要保留的最小字节数。
  - 默认值：`0`
  - 需同时设置 `max_bytes_to_keep`
- `max_bytes_to_keep` — 内存表中允许保留的最大字节数，最旧的行会在每次插入时被删除（即环形缓冲区）。当添加一个较大的数据块时，如果要删除的最旧一批行的总大小低于 `min_bytes_to_keep` 限制，则最大字节数可以暂时超过该限制。
  - 默认值：`0`
- `min_rows_to_keep` — 当内存表设置了大小上限时需要保留的最小行数。
  - 默认值：`0`
  - 需同时设置 `max_rows_to_keep`
- `max_rows_to_keep` — 内存表中允许保留的最大行数，最旧的行会在每次插入时被删除（即环形缓冲区）。当添加一个较大的数据块时，如果要删除的最旧一批行的行数低于 `min_rows_to_keep` 限制，则最大行数可以暂时超过该限制。
  - 默认值：`0`
- `compress` - 是否在内存中对数据进行压缩。
  - 默认值：`false`

## 使用说明 {#usage}

**初始化配置**

```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**修改设置**

```sql
ALTER TABLE memory MODIFY SETTING min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**注意：** `bytes` 和 `rows` 的封顶参数可以同时设置，但会始终遵守由 `max` 和 `min` 所定义的最低限制。

## 示例 {#examples}

```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_bytes_to_keep = 4096, max_bytes_to_keep = 16384;

/* 1. testing oldest block doesn't get deleted due to min-threshold - 3000 rows */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 8'192 bytes

/* 2. adding block that doesn't get deleted */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 1'024 bytes

/* 3. testing oldest block gets deleted - 9216 bytes - 1100 */
INSERT INTO memory SELECT * FROM numbers(9000, 1000); -- 8'192 bytes

/* 4. checking a very large block overrides all */
INSERT INTO memory SELECT * FROM numbers(9000, 10000); -- 65'536 bytes

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' AND database = currentDatabase();
```

```text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```

另外，对于行：

```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 4000, max_rows_to_keep = 10000;

/* 1. testing oldest block doesn't get deleted due to min-threshold - 3000 rows */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 1'600 rows

/* 2. adding block that doesn't get deleted */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 100 rows

/* 3. testing oldest block gets deleted - 9216 bytes - 1100 */
INSERT INTO memory SELECT * FROM numbers(9000, 1000); -- 1'000 rows

/* 4. checking a very large block overrides all */
INSERT INTO memory SELECT * FROM numbers(9000, 10000); -- 10'000 rows

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' AND database = currentDatabase();
```

```text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```
