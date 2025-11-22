---
description: 'Memory 引擎以未压缩形式将数据存储在 RAM 中。数据以读取时接收到的形式原样存储。换句话说，从该表读取不会产生任何额外开销。'
sidebar_label: 'Memory'
sidebar_position: 110
slug: /engines/table-engines/special/memory
title: 'Memory 表引擎'
doc_type: 'reference'
---



# Memory 表引擎

:::note
在 ClickHouse Cloud 中使用 Memory 表引擎时，数据不会在所有节点间复制（这是设计使然）。为了保证所有查询都被路由到同一节点，并且 Memory 表引擎按预期工作，可以采用以下任一方式：
- 在同一个会话中执行所有操作
- 使用通过 TCP 或原生接口（支持粘性连接）的客户端，例如 [clickhouse-client](/interfaces/cli)
:::

Memory 引擎以未压缩形式将数据存储在 RAM 中。数据的存储形式与读取时接收到的形式完全相同。换句话说，从该表中读取几乎没有额外开销。
并发数据访问是同步的。锁的持有时间很短：读写操作不会互相阻塞。
不支持索引。读取操作会被并行化执行。

在简单查询下，可以达到最高（超过 10 GB/sec）的性能，因为不存在从磁盘读取、解压缩或反序列化数据的开销。（需要注意的是，在很多情况下，MergeTree 引擎的性能也几乎同样高。）
当服务器重启时，表中的数据会丢失，表会变为空。
通常情况下，使用这种表引擎并没有太大必要。不过，它可以用于测试，以及在行数相对较少（大约最多 100,000,000 行）且对速度要求极高的任务。

Memory 引擎被系统用于带有外部查询数据的临时表（参见“处理查询的外部数据”一节），以及实现 `GLOBAL IN`（参见“IN 运算符”一节）。

可以指定上限和下限来限制 Memory 引擎表的大小，从而有效地使其充当循环缓冲区（参见 [引擎参数](#engine-parameters)）。



## 引擎参数 {#engine-parameters}

- `min_bytes_to_keep` — 内存表大小受限时保留的最小字节数。
  - 默认值:`0`
  - 需要配合 `max_bytes_to_keep` 使用
- `max_bytes_to_keep` — 内存表中保留的最大字节数,每次插入时删除最旧的行(即循环缓冲区)。当添加大数据块时,如果要删除的最旧批次行数低于 `min_bytes_to_keep` 限制,最大字节数可能超过设定的限制。
  - 默认值:`0`
- `min_rows_to_keep` — 内存表大小受限时保留的最小行数。
  - 默认值:`0`
  - 需要配合 `max_rows_to_keep` 使用
- `max_rows_to_keep` — 内存表中保留的最大行数,每次插入时删除最旧的行(即循环缓冲区)。当添加大数据块时,如果要删除的最旧批次行数低于 `min_rows_to_keep` 限制,最大行数可能超过设定的限制。
  - 默认值:`0`
- `compress` - 是否在内存中压缩数据。
  - 默认值:`false`


## 用法 {#usage}

**初始化设置**

```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**修改设置**

```sql
ALTER TABLE memory MODIFY SETTING min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**注意：** `bytes` 和 `rows` 限制参数可以同时设置,但系统会遵守 `max` 和 `min` 的下限约束。


## 示例 {#examples}

```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_bytes_to_keep = 4096, max_bytes_to_keep = 16384;

/* 1. 测试由于最小阈值限制,最旧的数据块不会被删除 - 3000 行 */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 8'192 字节

/* 2. 添加不会被删除的数据块 */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 1'024 字节

/* 3. 测试最旧的数据块被删除 - 9216 字节 - 1100 */
INSERT INTO memory SELECT * FROM numbers(9000, 1000); -- 8'192 字节

/* 4. 验证超大数据块会覆盖所有其他数据块 */
INSERT INTO memory SELECT * FROM numbers(9000, 10000); -- 65'536 字节

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' AND database = currentDatabase();
```

```text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```

同样,对于行数限制:

```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 4000, max_rows_to_keep = 10000;

/* 1. 测试由于最小阈值限制,最旧的数据块不会被删除 - 3000 行 */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 1'600 行

/* 2. 添加不会被删除的数据块 */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 100 行

/* 3. 测试最旧的数据块被删除 - 9216 字节 - 1100 */
INSERT INTO memory SELECT * FROM numbers(9000, 1000); -- 1'000 行

/* 4. 验证超大数据块会覆盖所有其他数据块 */
INSERT INTO memory SELECT * FROM numbers(9000, 10000); -- 10'000 行

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' AND database = currentDatabase();
```

```text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```
