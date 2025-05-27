---
'description': '这个引擎提供与 Amazon S3 生态系统的集成，并允许流式导入。类似于 Kafka 和 RabbitMQ 引擎，但提供了 S3
  特有的功能。'
'sidebar_label': 'S3Queue'
'sidebar_position': 181
'slug': '/engines/table-engines/integrations/s3queue'
'title': 'S3Queue 表引擎'
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# S3Queue 表引擎

该引擎提供与 [Amazon S3](https://aws.amazon.com/s3/) 生态系统的集成，并允许流式导入。该引擎类似于 [Kafka](../../../engines/table-engines/integrations/kafka.md)、[RabbitMQ](../../../engines/table-engines/integrations/rabbitmq.md) 引擎，但提供 S3 特定的功能。

## 创建表 {#creating-a-table}

```sql
CREATE TABLE s3_queue_engine_table (name String, value UInt32)
    ENGINE = S3Queue(path, [NOSIGN, | aws_access_key_id, aws_secret_access_key,] format, [compression], [headers])
    [SETTINGS]
    [mode = '',]
    [after_processing = 'keep',]
    [keeper_path = '',]
    [loading_retries = 0,]
    [processing_threads_num = 16,]
    [parallel_inserts = false,]
    [enable_logging_to_queue_log = true,]
    [last_processed_path = "",]
    [tracked_files_limit = 1000,]
    [tracked_file_ttl_sec = 0,]
    [polling_min_timeout_ms = 1000,]
    [polling_max_timeout_ms = 10000,]
    [polling_backoff_ms = 0,]
    [cleanup_interval_min_ms = 10000,]
    [cleanup_interval_max_ms = 30000,]
    [buckets = 0,]
    [list_objects_batch_size = 1000,]
    [enable_hash_ring_filtering = 0,]
    [max_processed_files_before_commit = 100,]
    [max_processed_rows_before_commit = 0,]
    [max_processed_bytes_before_commit = 0,]
    [max_processing_time_sec_before_commit = 0,]
```

:::warning
在 `24.7` 之前，除了 `mode`、`after_processing` 和 `keeper_path` 外，所有设置都需要使用 `s3queue_` 前缀。
:::

**引擎参数**

`S3Queue` 的参数与 `S3` 表引擎支持的参数相同。有关参数部分，请参见 [此处](../../../engines/table-engines/integrations/s3.md#parameters)。

**示例**

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
ENGINE=S3Queue('https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*', 'CSV', 'gzip')
SETTINGS
    mode = 'unordered';
```

使用命名集合：

```xml
<clickhouse>
    <named_collections>
        <s3queue_conf>
            <url>'https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*</url>
            <access_key_id>test<access_key_id>
            <secret_access_key>test</secret_access_key>
        </s3queue_conf>
    </named_collections>
</clickhouse>
```

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
ENGINE=S3Queue(s3queue_conf, format = 'CSV', compression_method = 'gzip')
SETTINGS
    mode = 'ordered';
```

## 设置 {#settings}

要获取已为表配置的设置列表，请使用 `system.s3_queue_settings` 表。从 `24.10` 起可用。

### mode {#mode}

可能的值：

- unordered — 在无序模式下，已处理文件的集合通过 ZooKeeper 中的持久节点进行跟踪。
- ordered — 在有序模式下，文件按照字典顺序处理。这意味着，如果某个名为 'BBB' 的文件在某个时刻被处理，而稍后添加了一个名为 'AA' 的文件到存储桶，则该文件将被忽略。仅在 ZooKeeper 中存储成功消费的文件的最大名称（在字典序中的意义）和在不成功加载尝试后将重试的文件名称。

默认值：在版本 24.6 之前为 `ordered`。从 24.6 开始没有默认值，该设置需要手动指定。对于在早期版本中创建的表，默认值将保持为 `Ordered` 以保持兼容性。

### after_processing {#after_processing}

成功处理后删除或保留文件。
可能的值：

- keep.
- delete.

默认值：`keep`。

### keeper_path {#keeper_path}

可以将 ZooKeeper 中的路径指定为表引擎设置，或者默认路径可以由全局配置提供的路径和表 UUID 形成。
可能的值：

- 字符串。

默认值：`/`。

### s3queue_loading_retries {#loading_retries}

重试文件加载的次数，最多指定次数。默认情况下，没有重试。
可能的值：

- 正整数。

默认值：`0`。

### s3queue_processing_threads_num {#processing_threads_num}

执行处理的线程数。仅适用于 `Unordered` 模式。

默认值：CPU 数量或 16。

### s3queue_parallel_inserts {#parallel_inserts}

默认情况下，`processing_threads_num` 将产生一个 `INSERT`，因此它只会下载文件并在多个线程中解析。
但是这限制了并行性，因此为获得更好的吞吐量使用 `parallel_inserts=true`，这将允许并行插入数据（但请注意，这会导致为 MergeTree 系列生成更多的数据分区片段）。

:::note
`INSERT` 将根据 `max_process*_before_commit` 设置生成。
:::

默认值：`false`。

### s3queue_enable_logging_to_s3queue_log {#enable_logging_to_s3queue_log}

启用记录到 `system.s3queue_log`。

默认值：`0`。

### s3queue_polling_min_timeout_ms {#polling_min_timeout_ms}

指定 ClickHouse 在进行下一个轮询尝试前等待的最小时间（以毫秒为单位）。

可能的值：

- 正整数。

默认值：`1000`。

### s3queue_polling_max_timeout_ms {#polling_max_timeout_ms}

定义 ClickHouse 在发起下一个轮询尝试前等待的最大时间（以毫秒为单位）。

可能的值：

- 正整数。

默认值：`10000`。

### s3queue_polling_backoff_ms {#polling_backoff_ms}

确定在未找到新文件时添加到上一个轮询间隔的额外等待时间。下一个轮询将在前一个间隔和此退避值的总和、或最大间隔中较小者之后发生。

可能的值：

- 正整数。

默认值：`0`。

### s3queue_tracked_files_limit {#tracked_files_limit}

允许在使用 'unordered' 模式时限制 ZooKeeper 节点的数量，在 'ordered' 模式下无效。
如果达到限制，ZooKeeper 节点中最旧的已处理文件将被删除并重新处理。

可能的值：

- 正整数。

默认值：`1000`。

### s3queue_tracked_file_ttl_sec {#tracked_file_ttl_sec}

在 ZooKeeper 节点中存储已处理文件的最大秒数（默认为永久存储），在 'unordered' 模式下有效，在 'ordered' 模式下无效。
在指定的秒数后，文件将被重新导入。

可能的值：

- 正整数。

默认值：`0`。

### s3queue_cleanup_interval_min_ms {#cleanup_interval_min_ms}

针对 'Ordered' 模式。定义一个最小边界，用于重新调度后台任务的间隔，该任务负责维护已追踪文件的 TTL 和最大追踪文件集。

默认值：`10000`。

### s3queue_cleanup_interval_max_ms {#cleanup_interval_max_ms}

针对 'Ordered' 模式。定义一个最大边界，用于重新调度后台任务的间隔，该任务负责维护已追踪文件的 TTL 和最大追踪文件集。

默认值：`30000`。

### s3queue_buckets {#buckets}

针对 'Ordered' 模式。从 `24.6` 开始可用。如果有多个 S3Queue 表的副本，每个副本使用相同的元数据目录在 keeper 中工作，则 `s3queue_buckets` 的值至少需要等于副本的数量。如果还使用 `s3queue_processing_threads` 设置，则进一步增加 `s3queue_buckets` 的值是有意义的，因为它定义了 `S3Queue` 处理的实际并行性。

## 与 S3 相关的设置 {#s3-settings}

引擎支持所有与 S3 相关的设置。有关 S3 设置的更多信息，请参见 [此处](../../../engines/table-engines/integrations/s3.md)。

## S3 基于角色的访问 {#s3-role-based-access}

<ScalePlanFeatureBadge feature="S3 Role-Based Access" />

s3Queue 表引擎支持基于角色的访问。
有关为访问存储桶配置角色的步骤，请参阅文档 [此处](/cloud/security/secure-s3)。

角色配置完成后，可以通过 `extra_credentials` 参数传递 `roleARN`，如下所示：
```sql
CREATE TABLE s3_table
(
    ts DateTime,
    value UInt64
)
ENGINE = S3Queue(
                'https://<your_bucket>/*.csv', 
                extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/<your_role>')
                ,'CSV')
SETTINGS 
    ...
```

## S3Queue 有序模式 {#ordered-mode}

`S3Queue` 处理模式允许在 ZooKeeper 中存储更少的元数据，但有一个限制：稍后按时间添加的文件需要具有字母数字更大的名称。

`S3Queue` `ordered` 模式和 `unordered` 一样，支持 `(s3queue_)processing_threads_num` 设置（`s3queue_` 前缀是可选的），它允许控制将在服务器本地处理 `S3` 文件的线程数。此外，`ordered` 模式还引入了另一个名为 `(s3queue_)buckets` 的设置，表示“逻辑线程”。这意味着在分布式场景中，当有多个服务器与 `S3Queue` 表副本时，该设置定义处理单元的数量。例如，每个 `S3Queue` 副本上的每个处理线程将尝试锁定某个用于处理的 `bucket`，每个 `bucket` 通过文件名的哈希关联到特定文件。因此，在分布式场景中，强烈建议将 `(s3queue_)buckets` 设置至少等于或大于副本的数量。设置的桶数量可以大于副本的数量，最优的情况是 `(s3queue_)buckets` 设置等于 `number_of_replicas` 和 `(s3queue_)processing_threads_num` 的乘积。
不推荐在 `24.6` 版本之前使用 `(s3queue_)processing_threads_num` 设置。
`(s3queue_)buckets` 设置从 `24.6` 版本开始可用。

## 描述 {#description}

`SELECT` 对于流式导入并不是特别有用（除了调试），因为每个文件只能导入一次。实际更为的方式是使用 [物化视图](../../../sql-reference/statements/create/view.md) 创建实时线程。为此：

1. 使用引擎创建一个用于从 S3 中指定路径消费的表，并将其视为数据流。
2. 创建一个具有所需结构的表。
3. 创建一个物化视图，以将引擎中的数据转换并放入之前创建的表中。

当 `MATERIALIZED VIEW` 连接引擎时，它会在后台开始收集数据。

示例：

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
  ENGINE=S3Queue('https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*', 'CSV', 'gzip')
  SETTINGS
      mode = 'unordered';

CREATE TABLE stats (name String, value UInt32)
  ENGINE = MergeTree() ORDER BY name;

CREATE MATERIALIZED VIEW consumer TO stats
  AS SELECT name, value FROM s3queue_engine_table;

SELECT * FROM stats ORDER BY name;
```

## 虚拟列 {#virtual-columns}

- `_path` — 文件路径。
- `_file` — 文件名称。

有关虚拟列的更多信息，请参见 [此处](../../../engines/table-engines/index.md#table_engines-virtual_columns)。

## 路径中的通配符 {#wildcards-in-path}

`path` 参数可以使用类 bash 通配符指定多个文件。要被处理，文件必须存在并匹配整个路径模式。文件列出在 `SELECT` 时确定（而不是在 `CREATE` 时）。

- `*` — 替代任意数量的任何字符，但不包括 `/`，包括空字符串。
- `**` — 替代任意数量的任何字符，包括 `/`，包括空字符串。
- `?` — 替代任意单个字符。
- `{some_string,another_string,yet_another_one}` — 替代字符串 `'some_string'`, `'another_string'`, `'yet_another_one'` 中的任何一个。
- `{N..M}` — 替代表 N 到 M 范围内的任何数字，包括两个边界。N 和 M 可以有前导零，例如 `000..078`。

带有 `{}` 的结构类似于 [remote](../../../sql-reference/table-functions/remote.md) 表函数。

## 限制 {#limitations}

1. 重复行可能是由于：

- 在文件处理的中间发生异常解析，并通过 `s3queue_loading_retries` 启用重试；

- 在多个服务器上配置 `S3Queue` 指向相同的路径，且 ZooKeeper 中的 keeper 会话在一个服务器完成已处理文件提交之前到期，这可能导致另一个服务器开始处理该文件，而前一个服务器可能已经部分或全部处理了该文件；

- 异常服务器终止。

2. 如果在多个服务器上配置 `S3Queue` 指向相同的路径并使用 `Ordered` 模式，则 `s3queue_loading_retries` 将无法工作。这个问题很快会被修复。

## 反向检查 {#introspection}

要进行反向检查，请使用 `system.s3queue` 无状态表和 `system.s3queue_log` 持久表。

1. `system.s3queue`。该表不是持久的，展示 `S3Queue` 的内存状态：当前正在处理的文件、已处理的文件和失败的文件。

```sql
┌─statement──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE system.s3queue
(
    `database` String,
    `table` String,
    `file_name` String,
    `rows_processed` UInt64,
    `status` String,
    `processing_start_time` Nullable(DateTime),
    `processing_end_time` Nullable(DateTime),
    `ProfileEvents` Map(String, UInt64)
    `exception` String
)
ENGINE = SystemS3Queue
COMMENT 'Contains in-memory state of S3Queue metadata and currently processed rows per file.' │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

示例：

```sql

SELECT *
FROM system.s3queue

Row 1:
──────
zookeeper_path:        /clickhouse/s3queue/25ea5621-ae8c-40c7-96d0-cec959c5ab88/3b3f66a1-9866-4c2e-ba78-b6bfa154207e
file_name:             wikistat/original/pageviews-20150501-030000.gz
rows_processed:        5068534
status:                Processed
processing_start_time: 2023-10-13 13:09:48
processing_end_time:   2023-10-13 13:10:31
ProfileEvents:         {'ZooKeeperTransactions':3,'ZooKeeperGet':2,'ZooKeeperMulti':1,'SelectedRows':5068534,'SelectedBytes':198132283,'ContextLock':1,'S3QueueSetFileProcessingMicroseconds':2480,'S3QueueSetFileProcessedMicroseconds':9985,'S3QueuePullMicroseconds':273776,'LogTest':17}
exception:
```

2. `system.s3queue_log`。持久表。具有与 `system.s3queue` 相同的信息，但针对 `processed` 和 `failed` 文件。

该表具有以下结构：

```sql
SHOW CREATE TABLE system.s3queue_log

Query id: 0ad619c3-0f2a-4ee4-8b40-c73d86e04314

┌─statement──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE TABLE system.s3queue_log
(
    `event_date` Date,
    `event_time` DateTime,
    `table_uuid` String,
    `file_name` String,
    `rows_processed` UInt64,
    `status` Enum8('Processed' = 0, 'Failed' = 1),
    `processing_start_time` Nullable(DateTime),
    `processing_end_time` Nullable(DateTime),
    `ProfileEvents` Map(String, UInt64),
    `exception` String
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, event_time)
SETTINGS index_granularity = 8192 │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

为了使用 `system.s3queue_log`，在服务器配置文件中定义其配置：

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
</s3queue_log>
```

示例：

```sql
SELECT *
FROM system.s3queue_log

Row 1:
──────
event_date:            2023-10-13
event_time:            2023-10-13 13:10:12
table_uuid:
file_name:             wikistat/original/pageviews-20150501-020000.gz
rows_processed:        5112621
status:                Processed
processing_start_time: 2023-10-13 13:09:48
processing_end_time:   2023-10-13 13:10:12
ProfileEvents:         {'ZooKeeperTransactions':3,'ZooKeeperGet':2,'ZooKeeperMulti':1,'SelectedRows':5112621,'SelectedBytes':198577687,'ContextLock':1,'S3QueueSetFileProcessingMicroseconds':1934,'S3QueueSetFileProcessedMicroseconds':17063,'S3QueuePullMicroseconds':5841972,'LogTest':17}
exception:
```
