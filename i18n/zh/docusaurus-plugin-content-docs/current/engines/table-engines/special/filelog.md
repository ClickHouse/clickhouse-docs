---
description: '此引擎允许将应用日志文件以记录流的形式进行处理。'
sidebar_label: 'FileLog'
sidebar_position: 160
slug: /engines/table-engines/special/filelog
title: 'FileLog 表引擎'
doc_type: 'reference'
---

# FileLog 表引擎 \\{#filelog-engine\\}

该引擎允许将应用程序日志文件作为一条记录流进行处理。

`FileLog` 可以：

- 订阅日志文件。
- 在新记录追加到已订阅的日志文件时对其进行处理。

## 创建表 \\{#creating-a-table\\}

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

* `path_to_logs` – 要订阅的日志文件路径。可以是包含日志文件的目录路径，也可以是单个日志文件的路径。注意 ClickHouse 只允许使用 `user_files` 目录内的路径。
* `format_name` - 记录格式。注意 FileLog 会将文件中的每一行作为一条独立记录进行处理，并非所有数据格式都适用于这种方式。

可选参数：

* `poll_timeout_ms` - 从日志文件进行单次轮询的超时时间。默认值：[stream&#95;poll&#95;timeout&#95;ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
* `poll_max_batch_size` — 单次轮询中可拉取的最大记录数。默认值：[max&#95;block&#95;size](/operations/settings/settings#max_block_size)。
* `max_block_size` — 单次轮询的最大批大小（以记录数计）。默认值：[max&#95;insert&#95;block&#95;size](../../../operations/settings/settings.md#max_insert_block_size)。
* `max_threads` - 用于解析文件的最大线程数，默认值为 0，表示线程数为 max(1, physical&#95;cpu&#95;cores / 4)。
* `poll_directory_watch_events_backoff_init` - 目录监听线程的初始休眠时间。默认值：`500`。
* `poll_directory_watch_events_backoff_max` - 目录监听线程的最大休眠时间。默认值：`32000`。
* `poll_directory_watch_events_backoff_factor` - 回退速度，默认为指数回退。默认值：`2`。
* `handle_error_mode` — FileLog 引擎的错误处理方式。可选值：`default`（如果解析消息失败则抛出异常）、`stream`（异常信息和原始消息将保存在虚拟列 `_error` 和 `_raw_message` 中）。

## 描述 \\{#description\\}

已送达的记录会被自动跟踪，因此日志文件中的每条记录只会被计数一次。

`SELECT` 对于读取记录并不是特别有用（除调试外），因为每条记录只能被读取一次。更实用的方式是使用[物化视图](../../../sql-reference/statements/create/view.md)来创建实时处理流水线。要做到这一点：

1. 使用该引擎创建一个 FileLog 表，并将其视为数据流。
2. 创建一个具有所需结构的表。
3. 创建一个物化视图，将来自引擎的数据转换后写入先前创建的表中。

当 `MATERIALIZED VIEW` 附加到该引擎时，它会开始在后台收集数据。这使您能够持续地从日志文件中接收记录，并使用 `SELECT` 将其转换为所需的格式。
一个 FileLog 表可以拥有任意数量的物化视图，它们并不直接从该表读取数据，而是接收新的记录（以数据块的形式接收），这样可以向多个具有不同明细级别（带分组聚合和不带分组聚合）的表中写入数据。

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
    AS SELECT toDate(toDateTime(timestamp)) AS day, level, count() AS total
    FROM queue GROUP BY day, level;

  SELECT level, sum(total) FROM daily GROUP BY level;
```

要停止接收流式数据或修改转换逻辑，请分离该物化视图：

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

如果你想使用 `ALTER` 更改目标表，建议先禁用该物化视图，以避免目标表与视图数据之间出现不一致。

## 虚拟列 \\{#virtual-columns\\}

- `_filename` - 日志文件名。数据类型：`LowCardinality(String)`。
- `_offset` - 在日志文件中的偏移量。数据类型：`UInt64`。

当 `handle_error_mode='stream'` 时的额外虚拟列：

- `_raw_record` - 无法成功解析的原始记录。数据类型：`Nullable(String)`。
- `_error` - 解析失败时产生的异常消息。数据类型：`Nullable(String)`。

注意：只有在解析过程中发生异常时，虚拟列 `_raw_record` 和 `_error` 才会被填充；当消息成功解析时，它们的值始终为 `NULL`。
