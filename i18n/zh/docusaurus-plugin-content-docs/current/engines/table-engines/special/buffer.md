---
description: '在写入时将数据缓存在内存（RAM）中，并定期将其写入另一张表。在读取操作期间，同时从缓冲区和另一张表中读取数据。'
sidebar_label: 'Buffer'
sidebar_position: 120
slug: /engines/table-engines/special/buffer
title: 'Buffer 表引擎'
doc_type: 'reference'
---



# Buffer 表引擎

将待写入的数据缓冲在 RAM 中,定期刷新到另一个表。在读取操作期间,数据会同时从缓冲区和另一个表中读取。

:::note
推荐使用 Buffer 表引擎的替代方案是启用[异步插入](/guides/best-practices/asyncinserts.md)。
:::

```sql
Buffer(database, table, num_layers, min_time, max_time, min_rows, max_rows, min_bytes, max_bytes [,flush_time [,flush_rows [,flush_bytes]]])
```

### 引擎参数 {#engine-parameters}

#### `database` {#database}

`database` – 数据库名称。可以使用 `currentDatabase()` 或其他返回字符串的常量表达式。

#### `table` {#table}

`table` – 数据刷新的目标表。

#### `num_layers` {#num_layers}

`num_layers` – 并行层数。物理上,该表将表示为 `num_layers` 个独立的缓冲区。

#### `min_time`, `max_time`, `min_rows`, `max_rows`, `min_bytes`, and `max_bytes` {#min_time-max_time-min_rows-max_rows-min_bytes-and-max_bytes}

从缓冲区刷新数据的条件。

### 可选引擎参数 {#optional-engine-parameters}

#### `flush_time`, `flush_rows`, and `flush_bytes` {#flush_time-flush_rows-and-flush_bytes}

在后台从缓冲区刷新数据的条件(省略或为零表示不使用 `flush*` 参数)。

如果满足所有 `min*` 条件或至少一个 `max*` 条件,数据将从缓冲区刷新并写入目标表。

此外,如果满足至少一个 `flush*` 条件,将在后台启动刷新。这与 `max*` 不同,因为 `flush*` 允许您单独配置后台刷新,以避免为 Buffer 表的 `INSERT` 查询增加延迟。

#### `min_time`, `max_time`, and `flush_time` {#min_time-max_time-and-flush_time}

从首次写入缓冲区时刻起的时间条件(以秒为单位)。

#### `min_rows`, `max_rows`, and `flush_rows` {#min_rows-max_rows-and-flush_rows}

缓冲区中行数的条件。

#### `min_bytes`, `max_bytes`, and `flush_bytes` {#min_bytes-max_bytes-and-flush_bytes}

缓冲区中字节数的条件。

在写入操作期间,数据被插入到一个或多个随机缓冲区中(通过 `num_layers` 配置)。或者,如果要插入的数据部分足够大(大于 `max_rows` 或 `max_bytes`),则会直接写入目标表,跳过缓冲区。

刷新数据的条件针对每个 `num_layers` 缓冲区单独计算。例如,如果 `num_layers = 16` 且 `max_bytes = 100000000`,则最大 RAM 消耗为 1.6 GB。

示例:

```sql
CREATE TABLE merge.hits_buffer AS merge.hits ENGINE = Buffer(merge, hits, 1, 10, 100, 10000, 1000000, 10000000, 100000000)
```

创建一个与 `merge.hits` 结构相同的 `merge.hits_buffer` 表,并使用 Buffer 引擎。写入此表时,数据在 RAM 中缓冲,随后写入 'merge.hits' 表。创建单个缓冲区,并在满足以下任一条件时刷新数据:

- 自上次刷新以来已过去 100 秒(`max_time`)或
- 已写入 100 万行(`max_rows`)或
- 已写入 100 MB 数据(`max_bytes`)或
- 已过去 10 秒(`min_time`)且已写入 10,000 行(`min_rows`)和 10 MB(`min_bytes`)数据

例如,如果只写入了一行,那么在 100 秒后,无论如何都会被刷新。但如果写入了许多行,数据将更快地被刷新。

当服务器停止时,使用 `DROP TABLE` 或 `DETACH TABLE`,缓冲的数据也会刷新到目标表。

您可以为数据库和表名称设置单引号中的空字符串。这表示没有目标表。在这种情况下,当达到数据刷新条件时,缓冲区将被简单地清空。这对于在内存中保留数据窗口可能很有用。


从 Buffer 表中读取时，会同时处理缓冲区和目标表（如果存在）中的数据。
注意，Buffer 表不支持索引。换句话说，缓冲区中的数据会被全表扫描，这在缓冲区很大时可能会比较慢。（对于从属表中的数据，会使用该表所支持的索引。）

如果 Buffer 表中的列集合与从属表中的列集合不匹配，则只会插入两个表中都存在的列的子集。

如果 Buffer 表与从属表中某个列的类型不匹配，将在服务器日志中记录一条错误信息，并清空缓冲区。
如果在刷新缓冲区时从属表不存在，也会发生同样的情况。

:::note
在 2021 年 10 月 26 日之前发布的版本中对 Buffer 表执行 ALTER 会导致 `Block structure mismatch` 错误（参见 [#15117](https://github.com/ClickHouse/ClickHouse/issues/15117) 和 [#30565](https://github.com/ClickHouse/ClickHouse/pull/30565)），因此删除并重新创建 Buffer 表是唯一的选项。在尝试对 Buffer 表执行 ALTER 之前，请确认该错误已在你的版本中修复。
:::

如果服务器异常重启，缓冲区中的数据会丢失。

`FINAL` 和 `SAMPLE` 在 Buffer 表上不能正确工作。这些条件会传递到目标表，但不会用于处理缓冲区中的数据。如果必须使用这些功能，建议仅将 Buffer 表用于写入，同时从目标表进行读取。

向 Buffer 表添加数据时，其中一个缓冲区会被锁定。如果同时对该表执行读操作，会导致延迟。

插入 Buffer 表的数据最终可能以不同的顺序和不同的数据块写入从属表。由于这一点，Buffer 表很难被正确用于向 CollapsingMergeTree 写入。为避免问题，可以将 `num_layers` 设置为 1。

如果目标表是复制表，那么在向 Buffer 表写入时，复制表的一些预期特性会丢失。行顺序和数据部分大小的随机变化会导致数据去重失效，也就无法对复制表实现可靠的“精确一次”写入。

由于这些缺点，我们只能在少数情况下推荐使用 Buffer 表。

Buffer 表适用于在单位时间内从大量服务器接收到过多 INSERT，而数据在插入前无法进行缓冲，从而导致 INSERT 无法足够快速运行的场景。

请注意，即使是对 Buffer 表，也没有按行逐条插入数据的意义。这样只能达到每秒几千行的速度，而插入较大的数据块可以达到每秒一百万行以上。
