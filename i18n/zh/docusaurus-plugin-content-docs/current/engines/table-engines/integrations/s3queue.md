---
description: '此引擎提供与 Amazon S3 生态系统的集成，并支持流式导入。类似于 Kafka 和 RabbitMQ 引擎，但提供 S3 专属特性。'
sidebar_label: 'S3Queue'
sidebar_position: 181
slug: /engines/table-engines/integrations/s3queue
title: 'S3Queue 表引擎'
doc_type: 'reference'
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'

# S3Queue 表引擎 {#s3queue-table-engine}

该引擎提供与 [Amazon S3](https://aws.amazon.com/s3/) 生态系统的集成，并支持流式导入。该引擎类似于 [Kafka](../../../engines/table-engines/integrations/kafka.md)、[RabbitMQ](../../../engines/table-engines/integrations/rabbitmq.md) 引擎，但提供了 S3 特有的功能。

需要特别注意 [S3Queue 实现的原始 PR](https://github.com/ClickHouse/ClickHouse/pull/49086/files#diff-e1106769c9c8fbe48dd84f18310ef1a250f2c248800fde97586b3104e9cd6af8R183) 中的这一说明：当有 `MATERIALIZED VIEW` 关联到该引擎时，S3Queue 表引擎会在后台开始收集数据。

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
在 `24.7` 版本之前，除 `mode`、`after_processing` 和 `keeper_path` 之外的所有配置项都必须使用 `s3queue_` 前缀。
:::

**引擎参数**

`S3Queue` 的参数与 `S3` 表引擎支持的参数相同。请参见[此处](../../../engines/table-engines/integrations/s3.md#parameters)的参数部分。

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

要获取为该表配置的设置列表，请查询 `system.s3_queue_settings` 系统表。自 `24.10` 版本起可用。

:::note 设置名称（24.7+）
从 24.7 版本开始，S3Queue 的设置项既可以带有 `s3queue_` 前缀，也可以不带：

- **现代语法**（24.7+）：`processing_threads_num`、`tracked_file_ttl_sec` 等。
- **旧版语法**（所有版本）：`s3queue_processing_threads_num`、`s3queue_tracked_file_ttl_sec` 等。

在 24.7+ 中两种形式都受支持。本页中的示例均使用不带前缀的现代语法。
:::

### Mode {#mode}

可能的取值：

* unordered — 在 `unordered` 模式下，所有已处理文件的集合会通过 ZooKeeper 中的持久节点进行跟踪和持久化。
* ordered — 在 `ordered` 模式下，文件按照字典序进行处理。这意味着如果名为 `BBB` 的文件在某个时间点被处理了，之后又向 bucket 中添加了名为 `AA` 的文件，那么该文件将被忽略。ZooKeeper 中只会存储已成功消费文件中的最大文件名（按字典序），以及那些在加载失败后需要重试的文件名。

默认值：在 24.6 之前的版本中默认为 `ordered`。从 24.6 开始不再提供默认值，该设置必须手动指定。对于在更早版本中创建的表，为了兼容性其默认值仍为 `Ordered`。

### `after_processing` {#after_processing}

如何在文件成功处理后进行后续操作。

可能的取值：

* keep。
* delete。
* move。
* tag。

默认值：`keep`。

`move` 需要额外配置。若在同一 bucket 内移动，必须通过 `after_processing_move_prefix` 提供新的路径前缀。

移动到另一个 S3 bucket 时，需要通过 `after_processing_move_uri` 提供目标 bucket 的 URI，并通过 `after_processing_move_access_key_id` 和 `after_processing_move_secret_access_key` 提供 S3 凭证。

示例：

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
ENGINE=S3Queue('https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*', 'CSV', 'gzip')
SETTINGS
    mode = 'unordered',
    after_processing = 'move',
    after_processing_retries = 20,
    after_processing_move_prefix = 'dst_prefix',
    after_processing_move_uri = 'https://clickhouse-public-datasets.s3.amazonaws.com/dst-bucket',
    after_processing_move_access_key_id = 'test',
    after_processing_move_secret_access_key = 'test';
```

从一个 Azure 容器移动到另一个 Azure 容器时，需要提供 Blob Storage 连接字符串作为 `after_processing_move_connection_string`，以及容器名称作为 `after_processing_move_container`。参见 [AzureQueue 设置](../../../engines/table-engines/integrations/azure-queue.md#settings)。

标记操作需要提供标签键和值，分别通过 `after_processing_tag_key` 和 `after_processing_tag_value` 配置。


### `after_processing_retries` {#after_processing_retries}

在放弃之前，对所请求的后处理操作进行重试的次数。

可能的取值：

* 非负整数。

默认值：`10`。

### `after_processing_move_access_key_id` {#after_processing_move_access_key_id}

如果目标是另一个 S3 bucket，则该选项指定用于将成功处理的文件移动到目标 S3 bucket 的 Access Key ID。

可能的取值：

* 字符串。

默认值：空字符串。

### `after_processing_move_prefix` {#after&#95;processing&#95;move&#95;prefix}

成功处理后用于存放文件的路径前缀。适用于两种情况：在同一 bucket 内移动文件，或移动到另一个 bucket。

可能的值：

* 字符串。

默认值：空字符串。

### `after_processing_move_secret_access_key` {#after_processing_move_secret_access_key}

当目标是另一个 S3 bucket 时，用于将成功处理的文件移动到该目标 bucket 的 Secret Access Key。

可能的取值：

* 字符串。

默认值：空字符串。

### `after_processing_move_uri` {#after_processing_move_uri}

当目标是另一个 S3 bucket 时，用于存放已成功处理文件的 S3 bucket 的 URI。

可能的取值：

* 字符串。

默认值：空字符串。

### `after_processing_tag_key` {#after_processing_tag_key}

当 `after_processing='tag'` 时，用于给成功处理的文件打标签的标签键。

可能的取值：

* 字符串。

默认值：空字符串。

### `after_processing_tag_value` {#after_processing_tag_value}

当 `after_processing='tag'` 时，为成功处理的文件设置标签时使用的标签值。

可能的取值：

* 字符串。

默认值：空字符串。

### `keeper_path` {#keeper_path}

ZooKeeper 中的路径可以通过表引擎设置单独指定；如果未指定，则默认路径由全局配置中提供的路径和表的 UUID 组成。
可能的取值：

* 字符串。

默认值：`/`。

### `loading_retries` {#loading_retries}

对文件加载操作最多重试指定的次数。默认情况下，不进行重试。
可能的取值：

- 正整数。

默认值：`0`。

### `processing_threads_num` {#processing_threads_num}

用于处理的线程数。仅适用于 `Unordered` 模式。

默认值：CPU 数量或 16。

### `parallel_inserts` {#parallel_inserts}

默认情况下，`processing_threads_num` 只会产生一个 `INSERT`，因此只是以多线程方式下载文件并进行解析。
但这会限制并行度，因此为获得更高吞吐量，应使用 `parallel_inserts=true`，这将允许并行插入数据（但请注意，这会导致为 MergeTree 系列表引擎生成更多分区片段）。

:::note
`INSERT` 的触发会受 `max_process*_before_commit` 相关设置约束。
:::

默认值：`false`。

### `enable_logging_to_s3queue_log` {#enable_logging_to_s3queue_log}

启用将日志记录写入 `system.s3queue_log`。

默认值：`0`。

### `polling_min_timeout_ms` {#polling_min_timeout_ms}

指定 ClickHouse 在进行下一次轮询尝试之前等待的最短时间（以毫秒为单位）。

可能的取值：

- 正整数。

默认值：`1000`。

### `polling_max_timeout_ms` {#polling_max_timeout_ms}

定义 ClickHouse 在发起下一次轮询尝试之前的最大等待时间（以毫秒为单位）。

可能的取值：

* 正整数。

默认值：`10000`。

### `polling_backoff_ms` {#polling_backoff_ms}

确定在未发现新文件时，需要加到上一次轮询间隔上的额外等待时间。下一次轮询会在上一次间隔与该退避时间之和或最大间隔（取二者中较小值）之后触发。

可能的取值：

- 正整数。

默认值：`0`。

### `tracked_files_limit` {#tracked_files_limit}

在使用 `unordered` 模式时，用于限制 ZooKeeper 节点的数量，对 `ordered` 模式不起作用。
一旦达到该限制，最早已处理的文件会从 ZooKeeper 节点中删除，并再次被处理。

可能的取值：

* 正整数。

默认值：`1000`。

### `tracked_file_ttl_sec` {#tracked_file_ttl_sec}

在“unordered”模式下，在 ZooKeeper 节点中保留已处理文件的最长时间（以秒为单位，默认永久保存）。对“ordered”模式无效。
在经过指定秒数后，该文件会被重新导入。

可能的取值：

- 正整数。

默认值：`0`。

### `cleanup_interval_min_ms` {#cleanup_interval_min_ms}

用于 `Ordered` 模式。定义负责维护已跟踪文件生存时间 (TTL) 和最大已跟踪文件集合的后台任务的重新调度间隔下限。

默认值：`10000`。

### `cleanup_interval_max_ms` {#cleanup_interval_max_ms}

用于 “Ordered” 模式。定义后台任务重新调度时间间隔的上限，该后台任务负责维护已跟踪文件的生存时间 (TTL)，以及已跟踪文件集合的最大大小。

默认值：`30000`。

### `buckets` {#buckets}

用于 Ordered 模式。自 `24.6` 版本起可用。如果存在多个 S3Queue 表副本，并且它们都使用 Keeper 中相同的元数据目录，那么 `buckets` 的值至少应等于副本数量。如果同时使用了 `processing_threads` 设置，那么将 `buckets` 的值进一步增大是有意义的，因为它决定了 `S3Queue` 处理的实际并行度。

### `use_persistent_processing_nodes` {#use_persistent_processing_nodes}

默认情况下，S3Queue 表一直使用临时处理节点。如果在 S3Queue 将已处理文件提交到 ZooKeeper 之前、但在其开始处理之后，ZooKeeper 会话过期，就可能导致数据重复。此设置会强制服务器在 Keeper 会话过期时避免出现重复数据。

### `persistent_processing_nodes_ttl_seconds` {#persistent_processing_nodes_ttl_seconds}

在服务器异常终止的情况下，如果启用了 `use_persistent_processing_nodes`，就有可能出现尚未被移除的处理节点（processing nodes）。此设置用于定义一个时间段，在该时间段内，这些处理节点可以被安全清理。

默认值：`3600`（1 小时）。

## 与 S3 相关的设置 {#s3-settings}

该引擎支持所有与 S3 相关的设置。有关 S3 设置的更多信息，请参阅[此处](../../../engines/table-engines/integrations/s3.md)。

## 基于角色的 S3 访问 {#s3-role-based-access}

<ScalePlanFeatureBadge feature="S3 Role-Based Access" />

`s3Queue` 表引擎支持基于角色的访问控制。
请参阅[此处](/cloud/data-sources/secure-s3)的文档，了解如何配置用于访问您的 bucket 的角色。

角色配置完成后，可以通过 `extra_credentials` 参数传递一个 `roleARN`，如下所示：

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

`S3Queue` 处理模式可以在 ZooKeeper 中存储更少的元数据，但有一个限制：按时间更晚添加的文件，其名称在字母数字顺序上必须更大。

`S3Queue` 的 `ordered` 模式与 `unordered` 模式一样，支持 `(s3queue_)processing_threads_num` 设置（`s3queue_` 前缀是可选的），用于控制在服务器本地处理 `S3` 文件的线程数量。
此外，`ordered` 模式还引入了另一个名为 `(s3queue_)buckets` 的设置，表示“逻辑线程”。在分布式场景中，当存在多个带有 `S3Queue` 表副本的服务器时，该设置定义了处理单元的数量。比如，每个 `S3Queue` 副本上的每个处理线程都会尝试锁定某个用于处理的 `bucket`，每个 `bucket` 通过文件名的哈希与特定文件关联。因此，在分布式场景下，强烈建议将 `(s3queue_)buckets` 设置为至少等于副本数量或更大。`buckets` 数量大于副本数量是可以的。最优的情况是将 `(s3queue_)buckets` 设置为 `number_of_replicas` 与 `(s3queue_)processing_threads_num` 的乘积。

不建议在 `24.6` 版本之前使用 `(s3queue_)processing_threads_num` 设置。
`(s3queue_)buckets` 设置从 `24.6` 版本开始可用。

## 从 S3Queue 表引擎中执行 SELECT 查询 {#select}

默认情况下，S3Queue 表禁止执行 SELECT 查询。这符合常见的队列模式：数据只被读取一次，随后从队列中移除。禁止 SELECT 是为了防止意外数据丢失。
但在某些情况下，执行 SELECT 查询可能是有用的。要实现这一点，需要将设置 `stream_like_engine_allow_direct_select` 设为 `True`。
S3Queue 引擎为 SELECT 查询提供了一个特殊设置：`commit_on_select`。将其设为 `False` 可以在读取后保留队列中的数据，将其设为 `True` 则会在读取后移除数据。

## 描述 {#description}

`SELECT` 对于流式导入并不是特别有用（除调试外），因为每个文件只能被导入一次。更实用的做法是使用[物化视图](../../../sql-reference/statements/create/view.md)来创建实时数据流。为此：

1. 使用该引擎创建一张表，从 S3 中指定的路径消费数据，并将其视为数据流。
2. 创建一张具有所需结构的表。
3. 创建一个物化视图，将来自该引擎的数据转换后写入事先创建好的表中。

当 `MATERIALIZED VIEW` 与该引擎关联后，它会在后台开始收集数据。

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

* `_path` — 文件路径。
* `_file` — 文件名。
* `_size` — 文件大小。
* `_time` — 文件创建时间。

有关虚拟列的更多信息，请参阅[此处](../../../engines/table-engines/index.md#table_engines-virtual_columns)。

## 路径中的通配符 {#wildcards-in-path}

`path` 参数可以使用类似 bash 的通配符来指定多个文件。要参与处理，文件必须存在并且与整个路径模式完全匹配。文件列表在执行 `SELECT` 时确定（而不是在 `CREATE` 时）。

* `*` — 匹配除 `/` 之外的任意数量任意字符，包括空字符串。
* `**` — 匹配包括 `/` 在内的任意数量任意字符，包括空字符串。
* `?` — 匹配任意单个字符。
* `{some_string,another_string,yet_another_one}` — 匹配字符串 `'some_string'、'another_string'、'yet_another_one'` 中的任意一个。
* `{N..M}` — 匹配从 N 到 M（包含两端）范围内的任意数字。N 和 M 可以有前导零，例如 `000..078`。

带有 `{}` 的结构类似于 [remote](../../../sql-reference/table-functions/remote.md) 表函数。

## 限制 {#limitations}

1. 出现重复行可能是由于以下原因导致：

* 在文件处理中途解析时发生异常，并且通过 `s3queue_loading_retries` 启用了重试；

* 在多个服务器上配置了 `S3Queue`，它们在 zookeeper 中指向同一路径，并且在某个服务器成功提交已处理文件之前 Keeper 会话过期，这可能导致另一台服务器接手处理该文件，而该文件可能已被第一台服务器部分或全部处理；然而，自 25.8 版本起，如果 `use_persistent_processing_nodes = 1`，则不会出现此问题。

* 服务器异常终止。

2. 在多个服务器上配置了 `S3Queue` 且它们在 zookeeper 中指向同一路径，并使用 `Ordered` 模式时，`s3queue_loading_retries` 将不会生效。该问题将在后续版本中修复。

## 自省 {#introspection}

要进行自省，请使用无状态表 `system.s3queue` 和持久化表 `system.s3queue_log`。

1. `system.s3queue`。此表为非持久化表，用于显示 `S3Queue` 的内存中状态：当前正在处理哪些文件、哪些文件已处理完成或处理失败。

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

2. `system.s3queue_log`。持久化表。包含与 `system.s3queue` 相同的信息，但仅针对 `processed` 和 `failed` 状态的文件。

该表的结构如下：

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

要使用 `system.s3queue_log`，需要在服务器配置文件中定义其配置：

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
