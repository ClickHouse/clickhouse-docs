---
'description': '内存引擎将数据存储在RAM中，未压缩的形式。数据以接收到的完全相同的形式存储。当读取时，换句话说，从这个表中读取是完全免费的。'
'sidebar_label': 'Memory'
'sidebar_position': 110
'slug': '/engines/table-engines/special/memory'
'title': '内存表引擎'
'doc_type': 'reference'
---


# 内存表引擎

:::note
在 ClickHouse Cloud 上使用内存表引擎时，数据不会在所有节点之间复制（设计如此）。为了确保所有查询都路由到同一节点，并且内存表引擎按预期工作，您可以执行以下操作之一：
- 在同一会话中执行所有操作
- 使用 TCP 或本机接口（支持粘性连接）的客户端，例如 [clickhouse-client](/interfaces/cli)
:::

内存引擎将数据以未压缩的形式存储在 RAM 中。数据以接收时的确切形式存储。换句话说，从该表读取数据是完全免费的。
并发数据访问是同步的。锁是短的：读写操作不会互相阻塞。
不支持索引。读取是并行化的。

在简单查询上，最大生产率（超过 10 GB/sec）是可以实现的，因为没有从磁盘读取、解压缩或反序列化数据。（我们应该注意，在许多情况下，MergeTree 引擎的生产率几乎与此相当。）
在重启服务器时，数据会从表中消失，表变为空。
通常情况下，使用此表引擎是没有理由的。然而，它可以用于测试，以及需要在相对较少的行（最多大约 100,000,000 行）上实现最大速度的任务。

系统使用内存引擎处理带有外部查询数据的临时表（请参阅“处理查询的外部数据”节），以及实现 `GLOBAL IN`（请参阅“IN 运算符”节）。

可以指定上下限来限制内存引擎表的大小，从而有效地允许它作为循环缓冲区（请参阅 [引擎参数](#engine-parameters)）。

## 引擎参数 {#engine-parameters}

- `min_bytes_to_keep` — 当内存表大小达到上限时保留的最小字节数。
  - 默认值： `0`
  - 需要 `max_bytes_to_keep`
- `max_bytes_to_keep` — 在内存表中保留的最大字节数，其中最旧的行在每次插入时被删除（即循环缓冲区）。如果在添加一个大块时要删除的最旧行批次低于 `min_bytes_to_keep` 限制，则最大字节数可以超过规定的限制。
  - 默认值： `0`
- `min_rows_to_keep` — 当内存表大小达到上限时保留的最小行数。
  - 默认值： `0`
  - 需要 `max_rows_to_keep`
- `max_rows_to_keep` — 在内存表中保留的最大行数，其中最旧的行在每次插入时被删除（即循环缓冲区）。如果在添加一个大块时要删除的最旧行批次低于 `min_rows_to_keep` 限制，则最大行数可以超过规定的限制。
  - 默认值： `0`
- `compress` - 是否压缩内存中的数据。
  - 默认值： `false`

## 用法 {#usage}

**初始化设置**
```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**修改设置**
```sql
ALTER TABLE memory MODIFY SETTING min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**注意：** `bytes` 和 `rows` 限制参数可以同时设置，但是将遵守 `max` 和 `min` 的下限。

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

同时，对于行：

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
