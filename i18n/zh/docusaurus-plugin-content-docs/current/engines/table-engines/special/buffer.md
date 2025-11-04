---
'description': '将数据缓冲到 RAM 中，定期刷新到另一个表。在读取操作期间，数据同时从缓冲区和另一个表中读取。'
'sidebar_label': 'Buffer'
'sidebar_position': 120
'slug': '/engines/table-engines/special/buffer'
'title': 'Buffer 表引擎'
'doc_type': 'reference'
---


# Buffer 表引擎

将要写入的数据缓冲到 RAM，定期刷新到另一个表。在读取操作期间，数据同时从缓冲区和其他表中读取。

:::note
推荐使用的 Buffer 表引擎替代方案是启用 [异步插入](/guides/best-practices/asyncinserts.md)。
:::

```sql
Buffer(database, table, num_layers, min_time, max_time, min_rows, max_rows, min_bytes, max_bytes [,flush_time [,flush_rows [,flush_bytes]]])
```

### 引擎参数 {#engine-parameters}

#### `database` {#database}

`database` – 数据库名称。你可以使用 `currentDatabase()` 或者其他返回字符串的常量表达式。

#### `table` {#table}

`table` – 刷新数据的表。

#### `num_layers` {#num_layers}

`num_layers` – 并行层。物理上，表将被表示为 `num_layers` 个独立的缓冲区。

#### `min_time`, `max_time`, `min_rows`, `max_rows`, `min_bytes`, 和 `max_bytes` {#min_time-max_time-min_rows-max_rows-min_bytes-and-max_bytes}

刷新数据的条件。

### 可选引擎参数 {#optional-engine-parameters}

#### `flush_time`, `flush_rows`, 和 `flush_bytes` {#flush_time-flush_rows-and-flush_bytes}

在后台刷新数据的条件（省略或零表示没有 `flush*` 参数）。

当满足所有 `min*` 条件或至少一个 `max*` 条件时，数据将从缓冲区刷新并写入目标表。

此外，如果满足至少一个 `flush*` 条件，将在后台发起刷新。这与 `max*` 的区别在于，`flush*` 允许你单独配置后台刷新，以避免为 Buffer 表的 `INSERT` 查询增加延迟。

#### `min_time`, `max_time`, 和 `flush_time` {#min_time-max_time-and-flush_time}

自第一次写入缓冲区以来的时间条件（以秒为单位）。

#### `min_rows`, `max_rows`, 和 `flush_rows` {#min_rows-max_rows-and-flush_rows}

缓冲区内行数的条件。

#### `min_bytes`, `max_bytes`, 和 `flush_bytes` {#min_bytes-max_bytes-and-flush_bytes}

缓冲区内字节数的条件。

在写入操作期间，数据将插入到一个或多个随机缓冲区（使用 `num_layers` 配置）。或者，如果要插入的数据部分足够大（大于 `max_rows` 或 `max_bytes`），它将直接写入目标表，跳过缓冲区。

刷新数据的条件会为每个 `num_layers` 缓冲区单独计算。例如，如果 `num_layers = 16` 且 `max_bytes = 100000000`，则最大 RAM 消耗为 1.6 GB。

示例：

```sql
CREATE TABLE merge.hits_buffer AS merge.hits ENGINE = Buffer(merge, hits, 1, 10, 100, 10000, 1000000, 10000000, 100000000)
```

创建一个与 `merge.hits` 结构相同的 `merge.hits_buffer` 表，并使用 Buffer 引擎。当写入此表时，数据被缓冲到 RAM 中，随后写入 'merge.hits' 表中。当满足以下任一条件时，将创建一个单独的缓冲区并进行刷新：
- 自上次刷新以来已经过 100 秒（`max_time`），或
- 已写入 100 万行（`max_rows`），或
- 已写入 100 MB 数据（`max_bytes`），或
- 已经过 10 秒（`min_time`），并且已写入 10,000 行（`min_rows`）和 10 MB（`min_bytes`）的数据。

例如，如果仅写入了一行，经过 100 秒后将刷新，无论如何。但如果写入了许多行，数据将更早被刷新。

当服务器停止时，使用 `DROP TABLE` 或 `DETACH TABLE` 命令，缓冲的数据也将刷新到目标表中。

你可以用单引号表示的空字符串设置数据库和表名。这表示没有目标表。在这种情况下，当达到数据刷新条件时，缓冲区将简单清空。这可能对于在内存中保持数据窗口很有用。

从 Buffer 表读取时，数据是同时从缓冲区和目标表（如果存在的话）处理的。
请注意，Buffer 表不支持索引。换句话说，缓冲区中的数据将被完全扫描，对于大型缓冲区可能会变得很慢。（对于从属表中的数据，将使用它支持的索引。）

如果 Buffer 表中的列集合与从属表的列集合不匹配，则只插入两个表中都存在的列的子集。

如果 Buffer 表与从属表中某列的类型不匹配，服务器日志中将记录错误消息，并且将清空缓冲区。
如果缓冲区刷新时从属表不存在，也会发生相同的情况。

:::note
在 2021 年 10 月 26 日之前发布的版本上对 Buffer 表运行 ALTER 会导致 `Block structure mismatch` 错误（见 [#15117](https://github.com/ClickHouse/ClickHouse/issues/15117) 和 [#30565](https://github.com/ClickHouse/ClickHouse/pull/30565)），因此删除 Buffer 表然后重新创建是唯一的选项。在尝试对 Buffer 表运行 ALTER 之前，请检查该错误在你的版本中是否已修复。
:::

如果服务器异常重启，缓冲区中的数据将会丢失。

对于 Buffer 表，`FINAL` 和 `SAMPLE` 的工作并不正确。这些条件会传递到目标表，但不会用于缓冲区中数据的处理。如果需要这些特性，建议仅将 Buffer 表用于写入，同时从目标表中读取。

在向 Buffer 表添加数据时，其中一个缓冲区会被锁定。这会导致如果同时从表中执行读取操作时出现延迟。

插入到 Buffer 表的数据可能会以不同的顺序和不同的块进入从属表。因此，Buffer 表在向 CollapsingMergeTree 正确写入时使用起来比较困难。为避免问题，可以将 `num_layers` 设置为 1。

如果目标表是复制的，在向 Buffer 表写入时会失去某些复制表的预期特性。行的随机顺序变化和数据部分的大小变化导致数据去重停止工作，这意味着在复制表中无法进行可靠的“恰好一次”写入。

由于这些缺点，我们只建议在少数情况下使用 Buffer 表。

当在单位时间内从大量服务器接收过多的 INSERT 时，Buffer 表会被使用，此时数据无法在插入之前进行缓冲，导致 INSERT 速度无法足够快。

请注意，即使对于 Buffer 表，一次插入一行数据也是没有意义的。这将只能产生每秒几千行的速度，而插入更大的数据块可以产生超过每秒一百万行的速度。
