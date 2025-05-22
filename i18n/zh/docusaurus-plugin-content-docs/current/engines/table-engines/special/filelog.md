
# FileLog 引擎 {#filelog-engine}

该引擎允许将应用日志文件处理为记录流。

`FileLog` 让您能够：

- 订阅日志文件。
- 处理新记录，当它们被追加到订阅的日志文件时。

## 创建表 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = FileLog('path_to_logs', 'format_name') SETTINGS
    [poll_timeout_ms = 0,]
    [poll_max_batch_size = 0,]
    [max_block_size = 0,]
    [max_threads = 0,]
    [poll_directory_watch_events_backoff_init = 500,]
    [poll_directory_watch_events_backoff_max = 32000,]
    [poll_directory_watch_events_backoff_factor = 2,]
    [handle_error_mode = 'default']
```

引擎参数：

- `path_to_logs` – 要订阅的日志文件路径。它可以是包含日志文件的目录路径或单个日志文件的路径。请注意，ClickHouse 仅允许在 `user_files` 目录内的路径。
- `format_name` - 记录格式。请注意，FileLog 将文件中的每一行作为单独的记录处理，并非所有数据格式都适合它。

可选参数：

- `poll_timeout_ms` - 从日志文件进行单次轮询的超时。默认值：[stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
- `poll_max_batch_size` — 在单次轮询中要轮询的最大记录数。默认值：[max_block_size](/operations/settings/settings#max_block_size)。
- `max_block_size` — 轮询的最大批处理大小（以记录计）。默认值：[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `max_threads` - 解析文件的最大线程数，默认值为 0，这意味着线程数将为 max(1, physical_cpu_cores / 4)。
- `poll_directory_watch_events_backoff_init` - 监视目录线程的初始睡眠值。默认值：`500`。
- `poll_directory_watch_events_backoff_max` - 监视目录线程的最大睡眠值。默认值：`32000`。
- `poll_directory_watch_events_backoff_factor` - 降级的速度，默认是指数型。默认值：`2`。
- `handle_error_mode` — 如何处理 FileLog 引擎的错误。可能的值：default（如果解析消息失败，则会抛出异常），stream（异常消息和原始消息将分别保存到虚拟列 `_error` 和 `_raw_message` 中）。

## 描述 {#description}

传递的记录会自动跟踪，因此日志文件中的每个记录仅计数一次。

`SELECT` 对于读取记录并不是特别有用（除非用于调试），因为每条记录只能读取一次。更实际的做法是使用 [物化视图](../../../sql-reference/statements/create/view.md) 创建实时线程。要做到这一点：

1. 使用引擎创建一个 FileLog 表，将其视为数据流。
2. 创建一个具有所需结构的表。
3. 创建一个物化视图，将数据从引擎转换并放入先前创建的表中。

当 `MATERIALIZED VIEW` 连接引擎时，它开始在后台收集数据。这使您能够不断接收日志文件中的记录并使用 `SELECT` 将其转换为所需格式。
一个 FileLog 表可以有任意数量的物化视图，它们并不直接从表中读取数据，而是接收新记录（以块的形式），这样您可以将记录写入多个表中，以不同的详细级别（带有分组 - 聚合和不带分组）。

示例：

```sql
CREATE TABLE logs (
  timestamp UInt64,
  level String,
  message String
) ENGINE = FileLog('user_files/my_app/app.log', 'JSONEachRow');

CREATE TABLE daily (
  day Date,
  level String,
  total UInt64
) ENGINE = SummingMergeTree(day, (day, level), 8192);

CREATE MATERIALIZED VIEW consumer TO daily
  AS SELECT toDate(toDateTime(timestamp)) AS day, level, count() as total
  FROM queue GROUP BY day, level;

SELECT level, sum(total) FROM daily GROUP BY level;
```

要停止接收流数据或更改转换逻辑，请分离物化视图：

```sql
DETACH TABLE consumer;
ATTACH TABLE consumer;
```

如果您想通过使用 `ALTER` 更改目标表，我们建议禁用物化视图，以避免目标表和视图数据之间的不一致。

## 虚拟列 {#virtual-columns}

- `_filename` - 日志文件的名称。数据类型：`LowCardinality(String)`。
- `_offset` - 日志文件中的偏移量。数据类型：`UInt64`。

当 `handle_error_mode='stream'` 时的额外虚拟列：

- `_raw_record` - 无法成功解析的原始记录。数据类型：`Nullable(String)`。
- `_error` - 解析失败时发生的异常消息。数据类型：`Nullable(String)`。

注意：只有在解析期间发生异常时，`_raw_record` 和 `_error` 虚拟列才会填充，如果消息成功解析，它们始终为 `NULL`。
