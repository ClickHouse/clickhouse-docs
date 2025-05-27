---
'description': '将数据缓冲到RAM中，定期刷新到另一个表。在读取操作期间，数据同时从缓冲区和另一个表中读取。'
'sidebar_label': 'Buffer'
'sidebar_position': 120
'slug': '/engines/table-engines/special/buffer'
'title': '缓冲表引擎'
---


# Buffer Table Engine

将数据缓冲到 RAM 中，并定期将其刷新到另一张表。在读取操作期间，数据从缓冲区和其他表同时读取。

:::note
建议使用 Buffer Table Engine 的替代方案是启用 [asynchronous inserts](/guides/best-practices/asyncinserts.md)。
:::

```sql
Buffer(database, table, num_layers, min_time, max_time, min_rows, max_rows, min_bytes, max_bytes [,flush_time [,flush_rows [,flush_bytes]]])
```

### Engine parameters: {#engine-parameters}

#### database {#database}

`database` – 数据库名称。您可以使用 `currentDatabase()` 或其他返回字符串的常量表达式。

#### table {#table}

`table` – 要刷新数据的表。

#### num_layers {#num_layers}

`num_layers` – 并行层。table 将物理上表示为 `num_layers` 个独立的缓冲区。

#### min_time, max_time, min_rows, max_rows, min_bytes, and max_bytes {#min_time-max_time-min_rows-max_rows-min_bytes-and-max_bytes}

从缓冲区刷新数据的条件。

### Optional engine parameters: {#optional-engine-parameters}

#### flush_time, flush_rows, and flush_bytes {#flush_time-flush_rows-and-flush_bytes}

在后台刷新数据的条件（省略或为零表示没有 `flush*` 参数）。

如果满足所有的 `min*` 条件或至少一个 `max*` 条件，则从缓冲区刷新数据并写入目标表。

此外，如果满足至少一个 `flush*` 条件，则在后台启动刷新。这与 `max*` 不同，因为 `flush*` 允许您单独配置后台刷新，以避免对 Buffer 表的 `INSERT` 查询增加延迟。

#### min_time, max_time, and flush_time {#min_time-max_time-and-flush_time}

从首次写入缓冲区时起的秒数的条件。

#### min_rows, max_rows, and flush_rows {#min_rows-max_rows-and-flush_rows}

缓冲区中行数的条件。

#### min_bytes, max_bytes, and flush_bytes {#min_bytes-max_bytes-and-flush_bytes}

缓冲区中字节数的条件。

在写入操作期间，数据会插入到一个或多个随机的缓冲区（用 `num_layers` 配置）。或者，如果要插入的数据部分足够大（大于 `max_rows` 或 `max_bytes`），则会直接写入目标表，跳过缓冲区。

刷新数据的条件是单独为每个 `num_layers` 缓冲区计算的。例如，如果 `num_layers = 16` 且 `max_bytes = 100000000`，则最大内存占用为 1.6 GB。

示例：

```sql
CREATE TABLE merge.hits_buffer AS merge.hits ENGINE = Buffer(merge, hits, 1, 10, 100, 10000, 1000000, 10000000, 100000000)
```

创建一个 `merge.hits_buffer` 表，具有与 `merge.hits` 相同的结构并使用 Buffer 引擎。当写入此表时，数据在 RAM 中缓冲，随后写入 'merge.hits' 表。当满足以下任一条件时，单个缓冲区被创建并刷新数据：
- 自上次刷新以来已过去 100 秒（`max_time`）或
- 已写入 100 万行（`max_rows`）或
- 已写入 100 MB 的数据（`max_bytes`）或
- 自上次刷新以来已过去 10 秒（`min_time`）并且已写入 10,000 行（`min_rows`）和 10 MB（`min_bytes`）的数据

例如，如果只写入了一行数据，经过 100 秒后，将会刷新，不论如何。但如果写入了许多行数据，则数据将更早刷新。

当服务器停止或执行 `DROP TABLE` 或 `DETACH TABLE` 时，缓冲的数据也会刷新到目标表。

您可以在单引号中设置为空字符串作为数据库和表名。这表示没有目标表。在这种情况下，当达到数据刷新条件时，缓冲区将被简单清空。这在保持内存中数据的窗口时可能会很有用。

从 Buffer 表读取数据时，数据同时来自缓冲区和目标表（如果存在）。
请注意，Buffer 表不支持索引。换句话说，缓冲区中的数据会被完全扫描，这对于大型缓冲区可能会很慢。（对于从属表中的数据，将使用其支持的索引。）

如果 Buffer 表中的列集与从属表中的列集不匹配，则会插入存在于两个表中的列的子集。

如果 Buffer 表中的某列与从属表中的类型不匹配，服务器日志中将记录一条错误消息，且缓冲区将被清空。
如果在刷新缓冲区时从属表不存在，也会发生相同的情况。

:::note
在 2021 年 10 月 26 日之前发布的版本上对 Buffer 表运行 ALTER 将导致 `Block structure mismatch` 错误（请参见 [#15117](https://github.com/ClickHouse/ClickHouse/issues/15117) 和 [#30565](https://github.com/ClickHouse/ClickHouse/pull/30565)），因此删除 Buffer 表并重新创建是唯一的选择。在尝试对 Buffer 表运行 ALTER 之前，请检查您的版本是否修复了此错误。
:::

如果服务器异常重启，缓冲区中的数据将丢失。

`FINAL` 和 `SAMPLE` 对于 Buffer 表无法正常工作。这些条件会传递给目标表，但未用于处理缓冲区中的数据。如果需要这些功能，建议仅将 Buffer 表用于写入，同时从目标表读取。

在向 Buffer 表添加数据时，锁定其中一个缓冲区。如果同时执行从表读取操作，将导致延迟。

插入到 Buffer 表中的数据可能会在从属表中以不同的顺序和不同的块出现。因此，正确使用 Buffer 表写入 CollapsingMergeTree 会变得困难。为避免问题，可以将 `num_layers` 设置为 1。

如果目标表是副本，则在写入 Buffer 表时会失去一些副本表的预期特性。行的随机顺序变化和数据部分大小导致数据去重停止工作，这意味着在副本表中无法实现可靠的“精确一次”写入。

由于这些缺点，我们仅建议在少数情况下使用 Buffer 表。

当从大量服务器在单位时间内接收到过多的 INSERT 时，会使用 Buffer 表，而且数据在插入之前不能缓冲，这意味着 INSERT 速度无法足够快。

请注意，逐行插入数据没有意义，即便是对于 Buffer 表。这只会产生每秒几千行的速度，而插入较大数据块则可以产生超过一百万行每秒的速度。
