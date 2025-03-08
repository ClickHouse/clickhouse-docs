---
slug: /engines/table-engines/special/memory
sidebar_position: 110
sidebar_label: '内存'
title: '内存表引擎'
description: '内存引擎将数据存储在RAM中，未压缩形式。数据以接收时的相同形式存储。换句话说，从该表读取是完全免费的。'
---


# 内存表引擎

:::note
在ClickHouse Cloud上使用内存表引擎时，数据不会跨所有节点进行复制（这是设计使然）。为了确保所有查询路由到同一节点并且内存表引擎按预期工作，您可以执行以下操作之一：
- 在同一会话中执行所有操作
- 使用支持TCP或本地接口的客户端（这使得支持粘性连接），例如 [clickhouse-client](/interfaces/cli)
:::

内存引擎将数据存储在RAM中，未压缩形式。数据以接收时的相同形式存储。换句话说，从该表读取是完全免费的。
并发数据访问是同步的。锁很短：读写操作不会相互阻塞。
不支持索引。读取是并行的。

在简单查询上可达到最大生产力（超过10 GB/秒），因为不会从磁盘读取、解压缩或反序列化数据。（我们应该注意，在许多情况下，MergeTree引擎的生产力几乎一样高。）
重启服务器时，表中的数据会消失，表变为空。
通常情况下，使用此表引擎是没有意义的。然而，它可以用于测试，以及在相对较少的行（最多约100,000,000行）上需要最大速度的任务。

系统使用内存引擎进行具有外部查询数据的临时表（请参阅“处理查询的外部数据”部分），并用于实现 `GLOBAL IN`（请参阅“IN运算符”部分）。

可以指定上限和下限以限制内存引擎表的大小，从而有效地使其充当循环缓冲区（请参阅 [Engine Parameters](#engine-parameters)）。

## 引擎参数 {#engine-parameters}

- `min_bytes_to_keep` — 当内存表超出大小限制时，最小保留字节。
  - 默认值： `0`
  - 需要 `max_bytes_to_keep`
- `max_bytes_to_keep` — 当内存表达到大小限制时，最多保留的字节数，最旧的行在每次插入时被删除（即循环缓冲区）。如果在添加大块数据时，移除的最旧行的批次低于 `min_bytes_to_keep` 限制，则最大字节数可以超过声明的限制。
  - 默认值： `0`
- `min_rows_to_keep` — 当内存表超出大小限制时，最小保留行数。
  - 默认值： `0`
  - 需要 `max_rows_to_keep`
- `max_rows_to_keep` — 当内存表达到大小限制时，最多保留的行数，最旧的行在每次插入时被删除（即循环缓冲区）。如果在添加大块数据时，移除的最旧行的批次低于 `min_rows_to_keep` 限制，则最大行数可以超过声明的限制。
  - 默认值： `0`
- `compress` - 是否对内存中的数据进行压缩。
  - 默认值： `false`

## 用法 {#usage}

**初始化设置**
``` sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**修改设置**
```sql
ALTER TABLE memory MODIFY SETTING min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**注意：** `bytes` 和 `rows` 限制参数可以同时设置，但将遵循 `max` 和 `min` 的下限。

## 示例 {#examples}
``` sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_bytes_to_keep = 4096, max_bytes_to_keep = 16384;

/* 1. 测试由于最小阈值未删除的最旧块 - 3000行 */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 8'192 字节

/* 2. 添加不会被删除的块 */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 1'024 字节

/* 3. 测试最旧块被删除 - 9216 字节 - 1100 */
INSERT INTO memory SELECT * FROM numbers(9000, 1000); -- 8'192 字节

/* 4. 检查一个非常大的块覆盖所有 */
INSERT INTO memory SELECT * FROM numbers(9000, 10000); -- 65'536 字节

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' and database = currentDatabase();
```

``` text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```

同样，对于行：

``` sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 4000, max_rows_to_keep = 10000;

/* 1. 测试由于最小阈值未删除的最旧块 - 3000行 */
INSERT INTO memory SELECT * FROM numbers(0, 1600); -- 1'600 行

/* 2. 添加不会被删除的块 */
INSERT INTO memory SELECT * FROM numbers(1000, 100); -- 100 行

/* 3. 测试最旧块被删除 - 9216 字节 - 1100 */
INSERT INTO memory SELECT * FROM numbers(9000, 1000); -- 1'000 行

/* 4. 检查一个非常大的块覆盖所有 */
INSERT INTO memory SELECT * FROM numbers(9000, 10000); -- 10'000 行

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' and database = currentDatabase();
```

``` text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```
