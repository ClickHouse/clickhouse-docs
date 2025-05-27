---
'description': '该引擎允许将应用程序日志文件处理为记录流。'
'sidebar_label': 'FileLog'
'sidebar_position': 160
'slug': '/engines/table-engines/special/filelog'
'title': 'FileLog 引擎'
---


# FileLog Engine {#filelog-engine}

该引擎允许将应用程序日志文件处理为记录流。

`FileLog` 允许您：

- 订阅日志文件。
- 在新记录追加到订阅的日志文件时处理这些记录。

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

- `path_to_logs` – 要订阅的日志文件的路径。它可以是包含日志文件的目录的路径，也可以是单个日志文件的路径。请注意，ClickHouse 仅允许 `user_files` 目录中的路径。
- `format_name` - 记录格式。请注意，FileLog 将文件中的每一行作为单独的记录处理，而不是所有数据格式都适合它。

可选参数：

- `poll_timeout_ms` - 从日志文件进行单次轮询的超时时间。默认值：[stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
- `poll_max_batch_size` — 单次轮询中最多获取的记录数量。默认值：[max_block_size](/operations/settings/settings#max_block_size)。
- `max_block_size` — 单次轮询的最大批处理大小（以记录为单位）。默认值：[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `max_threads` - 解析文件的最大线程数，默认值为 0，这意味着线程数为 max(1, physical_cpu_cores / 4)。
- `poll_directory_watch_events_backoff_init` - 监视目录线程的初始休眠值。默认值：`500`。
- `poll_directory_watch_events_backoff_max` - 监视目录线程的最大休眠值。默认值：`32000`。
- `poll_directory_watch_events_backoff_factor` - 退避的速度，默认是指数型。默认值：`2`。
- `handle_error_mode` — 处理 FileLog 引擎错误的方式。可能的值：default（如果无法解析消息，将抛出异常），stream（异常消息和原始消息将保存在虚拟列 `_error` 和 `_raw_message` 中）。

## 描述 {#description}

传递的记录会自动跟踪，因此日志文件中的每一条记录只会被计算一次。

`SELECT` 对于读取记录并不是特别有用（除非用于调试），因为每条记录只能读取一次。利用 [物化视图](../../../sql-reference/statements/create/view.md) 创建实时线程更为实用。为此：

1. 使用引擎创建一个 FileLog 表，并将其视为数据流。
2. 创建一个具有所需结构的表。
3. 创建一个物化视图，将引擎中的数据转换并放入先前创建的表中。

当 `MATERIALIZED VIEW` 连接到引擎时，它会在后台开始收集数据。这允许您不断从日志文件接收记录，并使用 `SELECT` 将其转换为所需格式。
一个 FileLog 表可以有任意数量的物化视图，它们不会直接从表中读取数据，而是接收新记录（以块的形式），通过这种方式，您可以将数据写入多个具有不同细节级别的表（带分组 - 聚合和不带）。

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

如果您想通过 `ALTER` 更改目标表，我们建议禁用物化视图，以避免目标表和视图数据之间的不一致。

## 虚拟列 {#virtual-columns}

- `_filename` - 日志文件的名称。数据类型：`LowCardinality(String)`。
- `_offset` - 日志文件中的偏移量。数据类型：`UInt64`。

当 `handle_error_mode='stream'` 时的附加虚拟列：

- `_raw_record` - 无法成功解析的原始记录。数据类型：`Nullable(String)`。
- `_error` - 解析失败时发生的异常消息。数据类型：`Nullable(String)`。

注意：`_raw_record` 和 `_error` 虚拟列仅在解析期间发生异常时填充，当消息成功解析时，它们始终为 `NULL`。
