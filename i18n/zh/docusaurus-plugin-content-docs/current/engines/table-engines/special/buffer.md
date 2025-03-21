---
slug: /engines/table-engines/special/buffer
sidebar_position: 120
sidebar_label: '缓冲'
title: '缓冲表引擎'
description: '将数据缓冲到 RAM 中，定期刷新到另一个表。在读取操作期间，数据同时从缓冲区和另一个表中读取。'
---


# 缓冲表引擎

将数据缓冲到 RAM 中，定期刷新到另一个表。在读取操作期间，数据同时从缓冲区和另一个表中读取。

:::note
缓冲表引擎的推荐替代方案是启用 [异步插入](/guides/best-practices/asyncinserts.md)。
:::

``` sql
Buffer(database, table, num_layers, min_time, max_time, min_rows, max_rows, min_bytes, max_bytes [,flush_time [,flush_rows [,flush_bytes]]])
```

### 引擎参数: {#engine-parameters}

#### database {#database}

`database` – 数据库名称。可以使用 `currentDatabase()` 或其他返回字符串的常量表达式。

#### table {#table}

`table` – 刷新数据的表。

#### num_layers {#num_layers}

`num_layers` – 并行层。物理上，表将表示为 `num_layers` 个独立的缓冲区。

#### min_time, max_time, min_rows, max_rows, min_bytes, 和 max_bytes {#min_time-max_time-min_rows-max_rows-min_bytes-and-max_bytes}

从缓冲区刷新数据的条件。

### 可选引擎参数: {#optional-engine-parameters}

#### flush_time, flush_rows, 和 flush_bytes {#flush_time-flush_rows-and-flush_bytes}

在后台刷新数据的条件（省略或为零表示没有 `flush*` 参数）。

当满足所有的 `min*` 条件或至少一个 `max*` 条件时，数据将从缓冲区刷新并写入目标表。

此外，如果满足至少一个 `flush*` 条件，则在后台启动刷新。这与 `max*` 不同，因为 `flush*` 允许您单独配置后台刷新，以避免向 Buffer 表中的 `INSERT` 查询添加延迟。

#### min_time, max_time, 和 flush_time {#min_time-max_time-and-flush_time}

从首次写入缓冲区的时刻起，以秒为单位的时间条件。

#### min_rows, max_rows, 和 flush_rows {#min_rows-max_rows-and-flush_rows}

缓冲区中行数的条件。

#### min_bytes, max_bytes, 和 flush_bytes {#min_bytes-max_bytes-and-flush_bytes}

缓冲区中字节数的条件。

在写入操作期间，数据随机插入到一个或多个缓冲区中（使用 `num_layers` 配置）。或者，如果要插入的数据部分足够大（大于 `max_rows` 或 `max_bytes`），则直接写入目标表，省略缓冲区。

刷新数据的条件是针对每个 `num_layers` 缓冲区单独计算的。例如，如果 `num_layers = 16` 和 `max_bytes = 100000000`，那么最大 RAM 消耗为 1.6 GB。

示例：

``` sql
CREATE TABLE merge.hits_buffer AS merge.hits ENGINE = Buffer(merge, hits, 1, 10, 100, 10000, 1000000, 10000000, 100000000)
```

创建一个与 `merge.hits` 具有相同结构并使用缓冲引擎的 `merge.hits_buffer` 表。当写入此表时，数据被缓冲在 RAM 中，随后写入到 'merge.hits' 表中。创建单个缓冲区并在以下任一条件满足时刷新数据：
- 自上次刷新以来已过去 100 秒（`max_time`）或
- 已写入 100 万行（`max_rows`）或
- 已写入 100 MB 数据（`max_bytes`）或
- 已过去 10 秒（`min_time`）且已写入 10,000 行（`min_rows`）和 10 MB（`min_bytes`）数据

例如，如果只写入了一行，在 100 秒后，它将被刷新，不论其他情况如何。但如果写入了多行，数据将更早被刷新。

当服务器停止时，使用 `DROP TABLE` 或 `DETACH TABLE`，缓冲的数据也会刷新到目标表。

您可以在数据库和表名中设置空字符串，在单引号中表示。这表示没有目标表。在这种情况下，当达到数据刷新条件时，缓冲区将被简单清空。这对于在内存中保留数据窗口可能是有用的。

从 Buffer 表读取时，数据同时从缓冲区和目标表（如果存在）中处理。
请注意，Buffer 表不支持索引。换句话说，缓冲区中的数据会被完全扫描，这对于大型缓冲区来说可能会很慢。（对于从属表中的数据，则会使用其支持的索引。）

如果 Buffer 表中的列集与从属表中的列集不匹配，则只有同时存在于两个表中的列的子集会被插入。

如果 Buffer 表和从属表中某列的类型不匹配，服务器日志中将记录错误消息，缓冲区也会被清空。
当缓冲刷新时，如果从属表不存在，也会发生同样的情况。

:::note
在 2021 年 10 月 26 之前的版本中对 Buffer 表运行 ALTER 操作会导致 `Block structure mismatch` 错误（见 [#15117](https://github.com/ClickHouse/ClickHouse/issues/15117) 和 [#30565](https://github.com/ClickHouse/ClickHouse/pull/30565)），因此唯一的选择是删除 Buffer 表然后重新创建。在尝试对 Buffer 表运行 ALTER 操作之前，请检查您的版本是否修复了此错误。
:::

如果服务器异常重启，缓冲区中的数据将丢失。

`FINAL` 和 `SAMPLE` 对于 Buffer 表无法正确工作。这些条件会传递到目标表中，但不会用于处理缓冲区中的数据。如果需要这些功能，我们建议仅在从目标表读取时使用 Buffer 表进行写入。

当向 Buffer 表添加数据时，其中一个缓冲区会被锁定。如果同时从表中执行读取操作，将会导致延迟。

插入 Buffer 表中的数据可能会在从属表中以不同的顺序和不同的块出现。因此，对于正确写入 CollapsingMergeTree，使用 Buffer 表会很困难。为避免问题，可以将 `num_layers` 设为 1。

如果目标表是复制的，在向 Buffer 表写入数据时，会丧失一些复制表的预期特性。行和数据部分大小的随机变化导致数据去重停止工作，这意味着不可能对复制表进行可靠的“准确一次”写入。

由于这些缺点，我们只能建议在少数情况下使用 Buffer 表。

当短时间内从大量服务器接收到过多的 INSERT 时，会使用 Buffer 表，此时数据无法在插入之前被缓冲，这意味着 INSERT 无法快速运行。

请注意，即使是对于 Buffer 表，一次插入一行数据也是没有意义的。这只会产生每秒几千行的插入速度，而插入更大数据块可以产生每秒超过一百万行的速度。
