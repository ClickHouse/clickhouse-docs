---
'description': '在 RAM 中缓冲要写入的数据，定期将其刷新到另一个表中。在读操作期间，同时从缓冲区和另一个表读取数据。'
'sidebar_label': '缓冲'
'sidebar_position': 120
'slug': '/engines/table-engines/special/buffer'
'title': '缓冲表引擎'
---




# 缓冲表引擎

将要写入的数据缓冲在内存中，定期刷新到另一张表。在读取操作期间，从缓冲区和其他表同时读取数据。

:::note
缓冲表引擎的推荐替代方案是启用 [异步插入](/guides/best-practices/asyncinserts.md)。
:::

```sql
Buffer(database, table, num_layers, min_time, max_time, min_rows, max_rows, min_bytes, max_bytes [,flush_time [,flush_rows [,flush_bytes]]])
```

### 引擎参数: {#engine-parameters}

#### database {#database}

`database` – 数据库名称。可以使用 `currentDatabase()` 或其他返回字符串的常量表达式。

#### table {#table}

`table` – 要刷新数据的表。

#### num_layers {#num_layers}

`num_layers` – 并行层。物理上，表将表示为 `num_layers` 的独立缓冲区。

#### min_time, max_time, min_rows, max_rows, min_bytes, 和 max_bytes {#min_time-max_time-min_rows-max_rows-min_bytes-and-max_bytes}

从缓冲区刷新数据的条件。

### 可选引擎参数: {#optional-engine-parameters}

#### flush_time, flush_rows, 和 flush_bytes {#flush_time-flush_rows-and-flush_bytes}

在后台刷新缓冲区数据的条件（省略或为零表示没有 `flush*` 参数）。

如果满足所有的 `min*` 条件或至少一个 `max*` 条件，则数据将从缓冲区刷新并写入目标表。

此外，如果至少满足一个 `flush*` 条件，则在后台启动刷新。这与 `max*` 不同，因为 `flush*` 允许您单独配置后台刷新，从而避免对 Buffer 表中的 `INSERT` 查询引入延迟。

#### min_time, max_time, 和 flush_time {#min_time-max_time-and-flush_time}

从第一次写入缓冲区时起的时间条件（以秒为单位）。

#### min_rows, max_rows, 和 flush_rows {#min_rows-max_rows-and-flush_rows}

缓冲区中行数的条件。

#### min_bytes, max_bytes, 和 flush_bytes {#min_bytes-max_bytes-and-flush_bytes}

缓冲区中字节数的条件。

在写入操作期间，将数据插入一个或多个随机缓冲区（使用 `num_layers` 配置）。或者，如果要插入的数据部分足够大（超过 `max_rows` 或 `max_bytes`），则直接写入目标表，省略缓冲区。

刷新数据的条件是为每个 `num_layers` 缓冲区单独计算的。例如，如果 `num_layers = 16` 并且 `max_bytes = 100000000`，则最大 RAM 消耗为 1.6 GB。

示例：

```sql
CREATE TABLE merge.hits_buffer AS merge.hits ENGINE = Buffer(merge, hits, 1, 10, 100, 10000, 1000000, 10000000, 100000000)
```

创建一个 `merge.hits_buffer` 表，其结构与 `merge.hits` 相同，并使用缓冲引擎。当写入此表时，数据会缓冲在 RAM 中，并随后写入 'merge.hits' 表。创建一个单一的缓冲区，如果以下任一条件满足，则刷新数据：
- 自上次刷新以来已过去 100 秒（`max_time`）或
- 已写入 100 万行（`max_rows`）或
- 已写入 100 MB 数据（`max_bytes`）或
- 已过去 10 秒（`min_time`）并且已写入 10,000 行（`min_rows`）和 10 MB（`min_bytes`）数据

例如，如果只写入了一行，在 100 秒后将刷新，不管是什么情况。但如果已写入多行，数据将更早被刷新。

当服务器停止时，使用 `DROP TABLE` 或 `DETACH TABLE`，缓冲的数据也会刷新到目标表。

您可以为数据库和表名设置空字符串，并用单引号括起来。这表示没有目标表。在这种情况下，当达到数据刷新条件时，缓冲区将被简单清空。这在保留内存中数据窗口时可能很有用。

从缓冲表读取时，同时处理来自缓冲区和目标表（如果存在）的数据。
请注意，缓冲表不支持索引。换句话说，缓冲区中的数据会被完全扫描，这对于大缓冲区可能会很慢。（对于从属表中的数据，将使用其支持的索引。）

如果缓冲表中的列集合与从属表中的列集合不匹配，则只会插入两个表中都存在的列的子集。

如果缓冲表中的一列与从属表中的列类型不匹配，则服务器日志中会记录错误信息，并清空缓冲区。
如果在刷新缓冲区时从属表不存在，也会发生相同的情况。

:::note
在2021年10月26日之前发布的版本上对缓冲表运行 ALTER 将导致 `Block structure mismatch` 错误（参见 [#15117](https://github.com/ClickHouse/ClickHouse/issues/15117) 和 [#30565](https://github.com/ClickHouse/ClickHouse/pull/30565)），因此删除缓冲表然后重新创建是唯一的选择。在尝试对缓冲表运行 ALTER 之前，请确保您的版本修复了此错误。
:::

如果服务器异常重启，缓冲区中的数据将会丢失。

`FINAL` 和 `SAMPLE` 在缓冲表上无法正常工作。这些条件被传递给目标表，但不用于处理缓冲区中的数据。如果需要这些功能，我们建议仅在写入时使用缓冲表，同时从目标表中读取。

在向缓冲表添加数据时，其中一个缓冲区是锁定的。这会导致在同时从表中执行读取操作时出现延迟。

插入缓冲表的数据可能会以不同的顺序和不同的块进入从属表。因此，缓冲表用作正确写入 CollapsingMergeTree 较为困难。为避免问题，可以将 `num_layers` 设置为 1。

如果目标表是复制的，在写入缓冲表时会丢失某些预期的复制表特性。行的顺序和数据部分大小的随机变化会导致数据去重停止工作，这意味着不能对复制表进行可靠的“精确一次”写入。

由于这些缺点，我们只能在少数情况下推荐使用缓冲表。

当在单位时间内接收来自大量服务器的过多 INSERT 时，将使用缓冲表，而数据在插入前无法缓冲，这意味着 INSERT 运行速度不够快。

请注意，逐行插入数据，即使是对缓冲表也是没有意义的。这只能产生每秒几千行的速度，而插入更大数据块可以产生超过一百万行每秒的速度。
