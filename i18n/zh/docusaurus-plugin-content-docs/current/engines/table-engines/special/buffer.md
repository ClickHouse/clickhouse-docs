---
description: '在写入时将数据缓存在 RAM（内存）中，并定期刷新到另一张表。在读操作时，会同时从缓冲表和另一张表中读取数据。'
sidebar_label: 'Buffer'
sidebar_position: 120
slug: /engines/table-engines/special/buffer
title: 'Buffer 表引擎'
doc_type: 'reference'
---

# Buffer 表引擎 \\{#buffer-table-engine\\}

在写入时先将要写入的数据缓存在 RAM 中，并定期刷新到另一张表。读取时会同时从缓冲区和另一张表中读取数据。

:::note
相较于使用 Buffer 表引擎，更推荐的替代方案是启用[异步插入](/guides/best-practices/asyncinserts.md)。
:::

```sql
Buffer(database, table, num_layers, min_time, max_time, min_rows, max_rows, min_bytes, max_bytes [,flush_time [,flush_rows [,flush_bytes]]])
```

### 引擎参数 \\{#engine-parameters\\}

#### `database` \\{#database\\}

`database` – 数据库名称。可以使用 `currentDatabase()` 或其他返回字符串的常量表达式。

#### `table` \\{#table\\}

`table` – 要将数据刷新到的目标表。

#### `num_layers` \\{#num&#95;layers\\}

`num_layers` – 并行层数。从物理上看，该表将表示为 `num_layers` 个彼此独立的缓冲区。

#### `min_time`, `max_time`, `min_rows`, `max_rows`, `min_bytes`, 和 `max_bytes` \\{#min&#95;time-max&#95;time-min&#95;rows-max&#95;rows-min&#95;bytes-and-max&#95;bytes\\}

用于从缓冲区刷新数据的触发条件。

### 可选引擎参数 \\{#optional-engine-parameters\\}

#### `flush_time`, `flush_rows`, 和 `flush_bytes` \\{#flush&#95;time-flush&#95;rows-and-flush&#95;bytes\\}

在后台从缓冲区刷新数据的触发条件（省略或设为零表示没有 `flush*` 参数）。

当全部 `min*` 条件满足或至少一个 `max*` 条件满足时，数据会从缓冲区刷新并写入目标表。

另外，如果至少一个 `flush*` 条件满足，就会在后台发起一次刷新操作。这与 `max*` 不同，因为 `flush*` 允许单独配置后台刷新，以避免对写入 Buffer 表的 `INSERT` 查询增加延迟。

#### `min_time`, `max_time`, 和 `flush_time` \\{#min&#95;time-max&#95;time-and-flush&#95;time\\}

从第一次写入缓冲区开始计算的时间（秒）条件。

#### `min_rows`, `max_rows`, 和 `flush_rows` \\{#min&#95;rows-max&#95;rows-and-flush&#95;rows\\}

缓冲区中行数的条件。

#### `min_bytes`, `max_bytes`, 和 `flush_bytes` \\{#min&#95;bytes-max&#95;bytes-and-flush&#95;bytes\\}

缓冲区中字节数的条件。

在写入操作期间，数据会被插入到一个或多个随机选择的缓冲区（由 `num_layers` 配置）。或者，如果要插入的数据块足够大（大于 `max_rows` 或 `max_bytes`），则会直接写入目标表，跳过缓冲区。

刷新数据的条件会对每个 `num_layers` 缓冲区分别计算。比如，如果 `num_layers = 16` 且 `max_bytes = 100000000`，则最大内存占用为 1.6 GB。

示例：

```sql
CREATE TABLE merge.hits_buffer AS merge.hits ENGINE = Buffer(merge, hits, 1, 10, 100, 10000, 1000000, 10000000, 100000000)
```

创建一个与 `merge.hits` 结构相同并使用 Buffer 引擎的 `merge.hits_buffer` 表。向该表写入数据时，数据会先缓存在 RAM 中，随后再写入 `merge.hits` 表。系统会创建一个单个缓冲区，并在满足以下任一条件时刷新数据：

* 自上次刷新以来已过去 100 秒（`max_time`），或
* 已写入 100 万行（`max_rows`），或
* 已写入 100 MB 的数据（`max_bytes`），或
* 已经过 10 秒（`min_time`），且已写入 10,000 行（`min_rows`）和 10 MB（`min_bytes`）数据

例如，如果只写入了一行数据，那么在 100 秒后，无论如何它都会被刷新。但如果写入了大量行，数据会更早被刷新。

当服务器停止，或执行 `DROP TABLE` / `DETACH TABLE` 时，缓冲的数据也会被刷新到目标表。

可以为数据库名和表名设置用单引号括起来的空字符串。这表示不存在目标表。在这种情况下，当达到数据刷新条件时，缓冲区会直接被清空。这对于在内存中保留一个数据时间窗口可能很有用。

从 Buffer 表中读取时，数据会同时从缓冲区和目标表（如果存在）中进行处理。
注意，Buffer 表不支持索引。换句话说，缓冲区中的数据会被全量扫描，这在缓冲区很大时可能会比较慢。（对于从属表中的数据，将使用该表所支持的索引。）

如果 Buffer 表中的列集合与从属表中的列集合不匹配，则只会插入两个表中共同存在的那部分列。

如果 Buffer 表与从属表中某一列的数据类型不匹配，则会在服务器日志中记录错误信息，并清空缓冲区。
在刷新缓冲区时，如果从属表不存在，也会发生同样的情况。

:::note
在 2021 年 10 月 26 日之前的版本中，对 Buffer 表执行 ALTER 会导致 `Block structure mismatch` 错误（参见 [#15117](https://github.com/ClickHouse/ClickHouse/issues/15117) 和 [#30565](https://github.com/ClickHouse/ClickHouse/pull/30565)），因此只能先删除 Buffer 表然后重新创建。在尝试对 Buffer 表执行 ALTER 之前，请确认你使用的版本中该错误已被修复。
:::

如果服务器异常重启，缓冲区中的数据会丢失。

`FINAL` 和 `SAMPLE` 在 Buffer 表上不能正确工作。这些条件会被传递到目标表，但不会用于处理缓冲区中的数据。如果必须使用这些功能，建议只对 Buffer 表执行写入操作，而从目标表进行读取。

向 Buffer 表添加数据时，其中一个缓冲区会被加锁。如果此时同时对该表执行读操作，就会产生延迟。

插入到 Buffer 表中的数据，可能以不同的顺序、不同的数据块写入从属表。因此，Buffer 表很难被正确用于向 CollapsingMergeTree 写入。为避免问题，你可以将 `num_layers` 设置为 1。

如果目标表是复制表（replicated table），在向 Buffer 表写入时，复制表的一些预期特性会丢失。行顺序和数据分片大小的随机变化会导致数据去重失效，这意味着无法对复制表实现可靠的 “exactly once” 写入。

由于这些缺点，我们只建议在少数场景中使用 Buffer 表。

Buffer 表适用于这样的场景：在单位时间内，从大量服务器接收到的 INSERT 请求过多，并且在插入前无法对数据进行缓冲，从而导致 INSERT 无法以足够快的速度执行。

注意，即使对于 Buffer 表，一次只插入一行数据也是没有意义的。这样每秒只能插入几千行，而插入更大的数据块则可以达到每秒超过一百万行。
