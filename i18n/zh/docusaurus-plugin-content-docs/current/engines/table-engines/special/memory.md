---
'description': 'Memory 引擎将数据存储在 RAM 中，以未压缩形式存储。数据以读取时接收的完全相同的形式存储。换句话说，从此表读取是完全免费的。'
'sidebar_label': 'Memory'
'sidebar_position': 110
'slug': '/engines/table-engines/special/memory'
'title': '内存表引擎'
---


# Memory Table Engine

:::note
在 ClickHouse Cloud 上使用 Memory 表引擎时，数据并不会跨所有节点复制（这是设计使然）。为了保证所有查询都路由到同一节点，并且 Memory 表引擎正常工作，您可以执行以下任一操作：
- 在同一会话中执行所有操作
- 使用支持 TCP 或原生接口的客户端（这启用粘性连接支持），例如 [clickhouse-client](/interfaces/cli)
:::

Memory 引擎将数据存储在 RAM 中，以未压缩的形式。数据以接收时的完全相同格式存储。换句话说，从这个表读取是完全免费的。
并发数据访问是同步的。锁很短：读写操作不会相互阻塞。
不支持索引。读取是并行化的。

在简单查询中，最大生产力（超过 10 GB/sec）是通过避免从磁盘读取、解压缩或反序列化数据而实现的。（我们应该注意到，在许多情况下，MergeTree 引擎的生产力几乎也有这么高。）
重启服务器时，数据会从表中消失，表变为空。
通常情况下，使用这种表引擎是没有必要的。然而，它可以用于测试，以及在相对较少的行（最多约 100,000,000 行）上需要最大速度的任务。

系统使用 Memory 引擎进行带有外部查询数据的临时表（参见“处理查询的外部数据”一节），并用于实现 `GLOBAL IN`（参见“IN 操作符”一节）。

可以指定上下限以限制 Memory 引擎表的大小，有效地使其作为循环缓冲区（参见 [Engine Parameters](#engine-parameters)）。

## Engine Parameters {#engine-parameters}

- `min_bytes_to_keep` — 当内存表大小受限时，最小保留字节数。
  - 默认值： `0`
  - 需要 `max_bytes_to_keep`
- `max_bytes_to_keep` — 在内存表中保留的最大字节数，旧行在每次插入时被删除（即循环缓冲区）。如果要删除的旧批次行在添加大量数据块时低于 `min_bytes_to_keep` 限制，则最大字节可以超过所述限制。
  - 默认值： `0`
- `min_rows_to_keep` — 当内存表大小受限时，最小保留行数。
  - 默认值： `0`
  - 需要 `max_rows_to_keep`
- `max_rows_to_keep` — 在内存表中保留的最大行数，旧行在每次插入时被删除（即循环缓冲区）。如果要删除的旧批次行在添加大量数据块时低于 `min_rows_to_keep` 限制，则最大行数可以超过所述限制。
  - 默认值： `0`
- `compress` - 是否压缩内存中的数据。
  - 默认值： `false`

## Usage {#usage}

**初始化设置**
```sql
CREATE TABLE memory (i UInt32) ENGINE = Memory SETTINGS min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**修改设置**
```sql
ALTER TABLE memory MODIFY SETTING min_rows_to_keep = 100, max_rows_to_keep = 1000;
```

**注意：** `bytes` 和 `rows` 的限制参数可以同时设置，但将遵循 `max` 和 `min` 的下限。

## Examples {#examples}
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

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' and database = currentDatabase();
```

```text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```

还有，对于行：

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

SELECT total_bytes, total_rows FROM system.tables WHERE name = 'memory' and database = currentDatabase();
```

```text
┌─total_bytes─┬─total_rows─┐
│       65536 │      10000 │
└─────────────┴────────────┘
```
