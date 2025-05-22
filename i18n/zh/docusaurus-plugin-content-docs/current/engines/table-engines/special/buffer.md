
# 缓冲表引擎

在内存中缓冲待写入的数据，定期将其刷新到另一个表中。在读取操作期间，数据同时从缓冲区和其他表中读取。

:::note
推荐的缓冲表引擎的替代方案是启用 [异步插入](/guides/best-practices/asyncinserts.md)。
:::

```sql
Buffer(database, table, num_layers, min_time, max_time, min_rows, max_rows, min_bytes, max_bytes [,flush_time [,flush_rows [,flush_bytes]]])
```

### 引擎参数: {#engine-parameters}

#### database {#database}

`database` – 数据库名称。你可以使用 `currentDatabase()` 或其他返回字符串的常量表达式。

#### table {#table}

`table` – 刷新数据的表。

#### num_layers {#num_layers}

`num_layers` – 并行层。该表将物理表示为 `num_layers` 个独立的缓冲区。

#### min_time, max_time, min_rows, max_rows, min_bytes, 和 max_bytes {#min_time-max_time-min_rows-max_rows-min_bytes-and-max-bytes}

从缓冲区刷新数据的条件。

### 可选引擎参数: {#optional-engine-parameters}

#### flush_time, flush_rows, 和 flush_bytes {#flush_time-flush_rows-and-flush-bytes}

在后台刷新缓冲区数据的条件（省略或为零表示没有 `flush*` 参数）。

如果满足所有的 `min*` 条件或至少一个 `max*` 条件，数据将从缓冲区刷新并写入目标表。

此外，如果满足至少一个 `flush*` 条件，将在后台启动刷新。这与 `max*` 不同，因为 `flush*` 允许你单独配置后台刷新，以避免对 Buffer 表的 `INSERT` 查询造成延迟。

#### min_time, max_time, 和 flush_time {#min_time-max_time-and-flush_time}

从第一次写入缓冲区时起经过的秒数条件。

#### min_rows, max_rows, 和 flush_rows {#min_rows-max_rows-and-flush_rows}

缓冲区中行数的条件。

#### min_bytes, max_bytes, 和 flush_bytes {#min_bytes-max_bytes-and-flush_bytes}

缓冲区中字节数的条件。

在写入操作期间，数据被插入到一个或多个随机缓冲区（用 `num_layers` 进行配置）。或者，如果插入的数据部分足够大（超过 `max_rows` 或 `max_bytes`），则直接写入目标表，跳过缓冲区。

刷新数据的条件是为每个 `num_layers` 缓冲区单独计算的。例如，如果 `num_layers = 16` 和 `max_bytes = 100000000`，最大的内存占用为 1.6 GB。

示例：

```sql
CREATE TABLE merge.hits_buffer AS merge.hits ENGINE = Buffer(merge, hits, 1, 10, 100, 10000, 1000000, 10000000, 100000000)
```

创建一个 `merge.hits_buffer` 表，其结构与 `merge.hits` 相同，并使用缓冲引擎。当写入此表时，数据缓存在内存中，然后写入 'merge.hits' 表。如果：
- 自上次刷新以来已过去 100 秒（`max_time`）或
- 已写入 100 万行（`max_rows`）或
- 已写入 100 MB 数据（`max_bytes`）或
- 已过去 10 秒（`min_time`）且已写入 10,000 行（`min_rows`）和 10 MB（`min_bytes`）数据

例如，如果只写入了一行，在 100 秒后，数据将被刷新，无论如何。但是，如果写入了许多行，则数据会更早被刷新。

当服务器停止时，使用 `DROP TABLE` 或 `DETACH TABLE`，缓冲的数据也会刷新到目标表。

你可以在单引号中设置空字符串作为数据库和表名。这表示没有目标表。在这种情况下，当达到数据刷新条件时，缓冲区将被简单清空。这在保持内存中数据窗口时可能是有用的。

从缓冲表读取数据时，数据将同时从缓冲区和目标表（如果有）中处理。
请注意，缓冲表不支持索引。换句话说，缓冲区中的数据会被完全扫描，这对于较大的缓冲区可能会很慢。（对于从属表中的数据，将使用它支持的索引。）

如果缓冲表的列集合与从属表的列集合不匹配，则插入存在于两个表中的列的子集。

如果缓冲表与从属表中的某一列的类型不匹配，则会在服务器日志中输入错误消息，并清空缓冲区。
如果缓冲刷新时从属表不存在，也会发生同样的情况。

:::note
在 2021 年 10 月 26 日之前的版本中对缓冲表执行 ALTER 操作将导致 `Block structure mismatch` 错误（见 [#15117](https://github.com/ClickHouse/ClickHouse/issues/15117) 和 [#30565](https://github.com/ClickHouse/ClickHouse/pull/30565)），因此删除缓冲表并重新创建是唯一的选择。在尝试对缓冲表执行 ALTER 操作之前，请确保你的版本修复了此错误。
:::

如果服务器异常重启，缓冲区中的数据将丢失。

`FINAL` 和 `SAMPLE` 对缓冲表不起作用。这些条件传递给目标表，但不用于处理缓冲区中的数据。如果需要这些功能，我们建议仅使用缓冲表进行写入，同时从目标表进行读取。

当向缓冲表添加数据时，将锁定其中一个缓冲区。如果同时从表中执行读取操作，则会导致延迟。

插入到缓冲表中的数据可能会按不同的顺序和不同的块进入从属表。因此，缓冲表用于正确写入 CollapsingMergeTree 是比较困难的。为避免问题，可以将 `num_layers` 设置为 1。

如果目标表是复制的，在写入缓冲表时会失去一些复制表的预期特性。行的顺序和数据部分大小的随机变化导致数据去重停止工作，这意味着不能对复制表进行可靠的“精确一次”写入。

由于这些缺点，只有在少数情况下我们才建议使用缓冲表。

当在一个时间单位内从大量服务器接收到过多的 INSERT 时，使用缓冲表，并且数据无法在插入之前缓冲，这意味着 INSERT 无法足够快速地运行。

请注意，即使对于缓冲表，逐行插入数据也是没有意义的。这只会产生每秒几千行的速度，而插入大块数据可以产生超过每秒一百万行的速度。
