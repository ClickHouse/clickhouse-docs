---
slug: /engines/table-engines/integrations/s3queue
sidebar_position: 181
sidebar_label: S3Queue
title: 'S3Queue 表引擎'
description: '此引擎提供与 Amazon S3 生态系统的集成，允许流式导入。类似于 Kafka 和 RabbitMQ 引擎，但提供 S3 特定功能。'
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# S3Queue 表引擎

此引擎提供与 [Amazon S3](https://aws.amazon.com/s3/) 生态系统的集成，允许流式导入。此引擎与 [Kafka](../../../engines/table-engines/integrations/kafka.md)、[RabbitMQ](../../../engines/table-engines/integrations/rabbitmq.md) 引擎类似，但提供 S3 特定功能。

## 创建表 {#creating-a-table}

``` sql
CREATE TABLE s3_queue_engine_table (name String, value UInt32)
    ENGINE = S3Queue(path, [NOSIGN, | aws_access_key_id, aws_secret_access_key,] format, [compression], [headers])
    [SETTINGS]
    [mode = '',]
    [after_processing = 'keep',]
    [keeper_path = '',]
    [loading_retries = 0,]
    [processing_threads_num = 1,]
    [enable_logging_to_s3queue_log = 0,]
    [polling_min_timeout_ms = 1000,]
    [polling_max_timeout_ms = 10000,]
    [polling_backoff_ms = 0,]
    [tracked_file_ttl_sec = 0,]
    [tracked_files_limit = 1000,]
    [cleanup_interval_min_ms = 10000,]
    [cleanup_interval_max_ms = 30000,]
```

:::warning
在 `24.7` 之前，所有设置必须使用 `s3queue_` 前缀，除了 `mode`、`after_processing` 和 `keeper_path`。
:::

**引擎参数**

`S3Queue` 参数与 `S3` 表引擎支持的参数相同。详细参数见 [此处](../../../engines/table-engines/integrations/s3.md#parameters)。

**示例**

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
ENGINE=S3Queue('https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*', 'CSV', 'gzip')
SETTINGS
    mode = 'unordered';
```

使用命名集合：

``` xml
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

要获取为该表配置的设置列表，可以使用 `system.s3_queue_settings` 表。从 `24.10` 版本可用。

### mode {#mode}

可能的值：

- unordered — 在无序模式下，所有已处理文件的集合保存在 ZooKeeper 的持久节点中。
- ordered — 在有序模式下，文件按字典顺序处理。这意味着，如果某个文件名为 'BBB' 的文件在某个时间点被处理，而后来又添加了名为 'AA' 的文件到存储桶，它将被忽略。仅存储成功消费文件的最大名称（按字典顺序）及在未成功加载尝试后需重试的文件名。

默认值：在 24.6 之前为 `ordered`。从 24.6 开始没有默认值，必须手动指定该设置。对于在早期版本中创建的表，默认值将保持为 `Ordered` 以兼容。

### after_processing {#after_processing}

成功处理后删除或保留文件。
可能的值：

- keep.
- delete.

默认值：`keep`。

### keeper_path {#keeper_path}

可以将 ZooKeeper 中的路径指定为表引擎设置，或者可以根据全局配置提供的路径和表 UUID 形成默认路径。
可能的值：

- String.

默认值：`/`。

### s3queue_loading_retries {#loading_retries}

重试文件加载，直到指定的次数。默认情况下，不进行重试。
可能的值：

- 正整数。

默认值：`0`。

### s3queue_processing_threads_num {#processing_threads_num}

执行处理的线程数。仅适用于 `Unordered` 模式。

默认值：`1`。

### s3queue_enable_logging_to_s3queue_log {#enable_logging_to_s3queue_log}

启用记录到 `system.s3queue_log`。

默认值：`0`。

### s3queue_polling_min_timeout_ms {#polling_min_timeout_ms}

指定 ClickHouse 在进行下一个轮询尝试之前等待的最短时间（以毫秒为单位）。

可能的值：

- 正整数。

默认值：`1000`。

### s3queue_polling_max_timeout_ms {#polling_max_timeout_ms}

定义 ClickHouse 在启动下一个轮询尝试之前等待的最长时间（以毫秒为单位）。

可能的值：

- 正整数。

默认值：`10000`。

### s3queue_polling_backoff_ms {#polling_backoff_ms}

当未找到新文件时，决定在前一个轮询间隔中添加的额外等待时间。下一个轮询在前一个间隔和此后退值之和或最大间隔（取较小者）之后进行。

可能的值：

- 正整数。

默认值：`0`。

### s3queue_tracked_files_limit {#tracked_files_limit}

如果使用 'unordered' 模式，可限制 ZooKeeper 节点的数量，对于 'ordered' 模式则无效。
如果达到限制，将从 ZooKeeper 节点中删除已处理的最旧文件并重新处理。

可能的值：

- 正整数。

默认值：`1000`。

### s3queue_tracked_file_ttl_sec {#tracked_file_ttl_sec}

在 ZooKeeper 节点中存储已处理文件的最大秒数（默认情况下永久存储），适用于 'unordered' 模式，对于 'ordered' 模式无效。
在指定的秒数之后，文件将被重新导入。

可能的值：

- 正整数。

默认值：`0`。

### s3queue_cleanup_interval_min_ms {#cleanup_interval_min_ms}

适用于 'Ordered' 模式。定义负责维护跟踪文件 TTL 和最大跟踪文件集的后台任务重新调度间隔的最小边界。

默认值：`10000`。

### s3queue_cleanup_interval_max_ms {#cleanup_interval_max_ms}

适用于 'Ordered' 模式。定义负责维护跟踪文件 TTL 和最大跟踪文件集的后台任务重新调度间隔的最大边界。

默认值：`30000`。

### s3queue_buckets {#buckets}

适用于 'Ordered' 模式。从 `24.6` 版本开始可用。如果有多个 S3Queue 表的副本，每个副本都在 keeper 中使用相同的元数据目录，则 `s3queue_buckets` 的值需要至少等于副本的数量。如果还使用 `s3queue_processing_threads` 设置，则进一步增加 `s3queue_buckets` 设置的值是有意义的，因为它定义了 `S3Queue` 处理的实际并行度。

## S3 相关设置 {#s3-settings}

引擎支持所有与 S3 相关的设置。有关 S3 设置的更多信息，请参见 [此处](../../../engines/table-engines/integrations/s3.md)。

## S3 基于角色的访问 {#s3-role-based-access}

<ScalePlanFeatureBadge feature="S3 Role-Based Access" />

s3Queue 表引擎支持基于角色的访问。
有关配置角色以访问您的存储桶的步骤，请参见文档 [此处](/cloud/security/secure-s3)。

一旦配置了角色，可以通过 `extra_credentials` 参数传递 `roleARN`，如下所示：
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

`S3Queue` 处理模式允许在 ZooKeeper 中存储更少的元数据，但有一个限制，即稍后添加的文件必须具有字母数字更大的名称。

`S3Queue` 的 `ordered` 模式，与 `unordered` 一样，支持 `(s3queue_)processing_threads_num` 设置（`s3queue_` 前缀是可选的），该设置允许控制在服务器本地处理 `S3` 文件的线程数。
此外，有序模式还引入了另一个设置 `(s3queue_)buckets`，表示“逻辑线程”。这意味着在分布式场景中，当有多个服务器具有 `S3Queue` 表副本时，此设置定义处理单元的数量。例如，每个 `S3Queue` 副本上的每个处理线程将尝试锁定某个 `bucket` 进行处理，每个 `bucket` 由文件名的哈希归属来特定文件。因此，在分布式场景中，建议将 `(s3queue_)buckets` 设置至少设置为副本数量或更大。桶的数量超过副本数量是可以的。最优场景是将 `(s3queue_)buckets` 设置设置为 `number_of_replicas` 和 `(s3queue_)processing_threads_num` 的乘积。
不建议在 `24.6` 之前使用 `(s3queue_)processing_threads_num` 设置。
从 `24.6` 开始提供 `(s3queue_)buckets` 设置。

## 描述 {#description}

`SELECT` 对于流式导入并不是特别有用（除非用于调试），因为每个文件只能导入一次。创建实时线程使用 [物化视图](../../../sql-reference/statements/create/view.md) 是更实际的。为此：

1. 使用引擎创建一个表以从 S3 中指定的路径进行消费，并将其视为一个数据流。
2. 创建一个所需结构的表。
3. 创建一个物化视图，将数据从引擎转换并放入之前创建的表中。

当 `MATERIALIZED VIEW` 加入引擎时，它会在后台开始收集数据。

示例：

``` sql
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

`path` 参数可以使用类似 bash 的通配符指定多个文件。要处理的文件应存在并与整个路径模式匹配。文件列表在 `SELECT` 时确定（而不是在 `CREATE` 时）。

- `*` — 替代除 `/` 外的任意数量的任意字符，包括空字符串。
- `**` — 替代包括 `/` 在内的任意数量的任意字符，包括空字符串。
- `?` — 替代任意单个字符。
- `{some_string,another_string,yet_another_one}` — 替代任意字符串 `'some_string', 'another_string', 'yet_another_one'`。
- `{N..M}` — 替代范围从 N 到 M 包括两端的任意数字。N 和 M 可以有前导零，例如 `000..078`。

带 `{}` 的结构类似于 [remote](../../../sql-reference/table-functions/remote.md) 表函数。

## 限制 {#limitations}

1. 由于以下原因可能会出现重复行：

- 在文件处理过程中发生解析异常，并且通过 `s3queue_loading_retries` 启用了重试；
  
- `S3Queue` 在多个服务器上配置，指向 ZooKeeper 中的同一路径，并且在一个服务器成功提交处理的文件之前，keeper 会话过期，这可能会导致另外一个服务器开始处理该文件，该文件可能已被第一个服务器部分或完全处理；

- 非正常服务器终止。

2. 如果 `S3Queue` 在多个服务器上配置，指向 ZooKeeper 中的同一路径，并且使用了 `Ordered` 模式，则 `s3queue_loading_retries` 将无效。这个问题将很快解决。

## 自省 {#introspection}

要自省，可以使用 `system.s3queue` 无状态表和 `system.s3queue_log` 持久表。

1. `system.s3queue`。该表不是持久的，显示 `S3Queue` 的内存状态：当前正在处理的文件、已处理或失败的文件。

``` sql
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
COMMENT '包含 S3Queue 元数据的内存状态以及每个文件当前处理的行。' │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

示例：

``` sql

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

2. `system.s3queue_log`。持久表。具有与 `system.s3queue` 相同的信息，但适用于 `processed` 和 `failed` 文件。

该表具有以下结构：

``` sql
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

要使用 `system.s3queue_log`，请在服务器配置文件中定义其配置：

``` xml
    <s3queue_log>
        <database>system</database>
        <table>s3queue_log</table>
    </s3queue_log>
```

示例：

``` sql
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
