---
description: '此引擎提供与 Amazon S3 生态系统的集成，并支持流式导入。类似于 Kafka 和 RabbitMQ 引擎，但提供 S3 专有功能。'
sidebar_label: 'S3Queue'
sidebar_position: 181
slug: /engines/table-engines/integrations/s3queue
title: 'S3Queue 表引擎'
doc_type: 'reference'
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# S3Queue 表引擎

该引擎提供与 [Amazon S3](https://aws.amazon.com/s3/) 生态系统的集成能力，并支持流式导入。此引擎类似于 [Kafka](../../../engines/table-engines/integrations/kafka.md)、[RabbitMQ](../../../engines/table-engines/integrations/rabbitmq.md) 等表引擎，但提供了特定于 S3 的功能。

需要注意 [S3Queue 实现的原始 PR](https://github.com/ClickHouse/ClickHouse/pull/49086/files#diff-e1106769c9c8fbe48dd84f18310ef1a250f2c248800fde97586b3104e9cd6af8R183) 中的这条说明：当 `MATERIALIZED VIEW` 与该引擎建立关联后，S3Queue 表引擎会在后台开始收集数据。



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
在 `24.7` 版本之前,除 `mode`、`after_processing` 和 `keeper_path` 外,所有设置都必须使用 `s3queue_` 前缀。
:::

**引擎参数**

`S3Queue` 的参数与 `S3` 表引擎支持的参数相同。请参阅[此处](../../../engines/table-engines/integrations/s3.md#parameters)的参数部分。

**示例**

```sql
CREATE TABLE s3queue_engine_table (name String, value UInt32)
ENGINE=S3Queue('https://clickhouse-public-datasets.s3.amazonaws.com/my-test-bucket-768/*', 'CSV', 'gzip')
SETTINGS
    mode = 'unordered';
```

使用命名集合:

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

要获取表的配置设置列表,请使用 `system.s3_queue_settings` 表。从 `24.10` 版本开始可用。

### 模式 {#mode}

可能的值:

- unordered — 在无序模式下,所有已处理文件的集合通过 ZooKeeper 中的持久节点进行跟踪。
- ordered — 在有序模式下,文件按字典序处理。这意味着如果名为 'BBB' 的文件在某个时刻被处理,之后又向存储桶添加了名为 'AA' 的文件,该文件将被忽略。ZooKeeper 中仅存储成功消费文件的最大名称(按字典序)以及加载失败后将重试的文件名称。

默认值:在 24.6 之前的版本中为 `ordered`。从 24.6 开始没有默认值,该设置需要手动指定。对于在早期版本上创建的表,为保持兼容性,默认值将保持为 `Ordered`。

### `after_processing` {#after_processing}

成功处理后删除或保留文件。
可能的值:

- keep。
- delete。

默认值:`keep`。

### `keeper_path` {#keeper_path}

ZooKeeper 中的路径可以指定为表引擎设置,或者可以从全局配置提供的路径和表 UUID 组成默认路径。
可能的值:

- 字符串。

默认值:`/`。

### `s3queue_loading_retries` {#loading_retries}

重试文件加载最多指定次数。默认情况下不进行重试。
可能的值:

- 正整数。

默认值:`0`。

### `s3queue_processing_threads_num` {#processing_threads_num}

执行处理的线程数。仅适用于 `Unordered` 模式。

默认值:CPU 数量或 16。

### `s3queue_parallel_inserts` {#parallel_inserts}

默认情况下,`processing_threads_num` 将产生一个 `INSERT`,因此它只会在多个线程中下载文件和解析。
但这限制了并行性,因此为了获得更好的吞吐量,请使用 `parallel_inserts=true`,这将允许并行插入数据(但请注意,这将导致 MergeTree 系列生成更多的数据部分)。

:::note
`INSERT` 将根据 `max_process*_before_commit` 设置生成。
:::

默认值:`false`。

### `s3queue_enable_logging_to_s3queue_log` {#enable_logging_to_s3queue_log}

启用记录到 `system.s3queue_log`。

默认值:`0`。

### `s3queue_polling_min_timeout_ms` {#polling_min_timeout_ms}

指定 ClickHouse 在进行下一次轮询尝试之前等待的最短时间(以毫秒为单位)。

可能的值:

- 正整数。

默认值:`1000`。

### `s3queue_polling_max_timeout_ms` {#polling_max_timeout_ms}

定义 ClickHouse 在启动下一次轮询尝试之前等待的最长时间(以毫秒为单位)。

可能的值:

- 正整数。

默认值:`10000`。

### `s3queue_polling_backoff_ms` {#polling_backoff_ms}

确定当未找到新文件时添加到上一次轮询间隔的额外等待时间。下一次轮询在上一次间隔与此退避值之和或最大间隔(以较小者为准)之后发生。

可能的值:

- 正整数。

默认值:`0`。

### `s3queue_tracked_files_limit` {#tracked_files_limit}

如果使用 'unordered' 模式,允许限制 Zookeeper 节点的数量,对 'ordered' 模式不起作用。
如果达到限制,最旧的已处理文件将从 ZooKeeper 节点中删除并再次处理。

可能的值:

- 正整数。

默认值:`1000`。

### `s3queue_tracked_file_ttl_sec` {#tracked_file_ttl_sec}

在 ZooKeeper 节点中存储已处理文件的最大秒数(默认永久存储),适用于 'unordered' 模式,对 'ordered' 模式不起作用。
在指定的秒数后,文件将被重新导入。

可能的值:

- 正整数。

默认值:`0`。

### `s3queue_cleanup_interval_min_ms` {#cleanup_interval_min_ms}

适用于 'Ordered' 模式。定义后台任务重新调度间隔的最小边界,该任务负责维护跟踪文件的 TTL 和最大跟踪文件集。

默认值:`10000`。

### `s3queue_cleanup_interval_max_ms` {#cleanup_interval_max_ms}


用于 'Ordered' 模式。定义后台任务重新调度间隔的最大边界值,该任务负责维护已跟踪文件的 TTL 和最大跟踪文件集合。

默认值:`30000`。

### `s3queue_buckets` {#buckets}

用于 'Ordered' 模式。自 `24.6` 版本起可用。如果存在多个 S3Queue 表副本,且每个副本都使用 keeper 中的同一元数据目录,则 `s3queue_buckets` 的值至少需要等于副本数量。如果同时使用了 `s3queue_processing_threads` 设置,则进一步增加 `s3queue_buckets` 设置的值是合理的,因为它定义了 `S3Queue` 处理的实际并行度。

### `use_persistent_processing_nodes` {#use_persistent_processing_nodes}

默认情况下,S3Queue 表始终使用临时处理节点,这可能导致数据重复,即当 zookeeper 会话在 S3Queue 开始处理之后但在 zookeeper 中提交已处理文件之前过期时。此设置强制服务器在 keeper 会话过期的情况下消除数据重复的可能性。

### `persistent_processing_nodes_ttl_seconds` {#persistent_processing_nodes_ttl_seconds}

在服务器非正常终止的情况下,如果启用了 `use_persistent_processing_nodes`,可能会存在未删除的处理节点。此设置定义了可以安全清理这些处理节点的时间周期。

默认值:`3600`(1 小时)。


## S3 相关设置 {#s3-settings}

引擎支持所有 S3 相关设置。有关 S3 设置的更多信息,请参阅[此处](../../../engines/table-engines/integrations/s3.md)。


## S3 基于角色的访问 {#s3-role-based-access}

<ScalePlanFeatureBadge feature='S3 Role-Based Access' />

s3Queue 表引擎支持基于角色的访问。
有关配置角色以访问存储桶的步骤,请参阅[此处](/cloud/data-sources/secure-s3)的文档。

配置角色后,可以通过 `extra_credentials` 参数传递 `roleARN`,如下所示:

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

`S3Queue` 处理模式允许在 ZooKeeper 中存储更少的元数据,但存在一个限制:后续添加的文件必须具有按字母数字顺序更大的名称。

`S3Queue` 的 `ordered` 模式与 `unordered` 模式一样,支持 `(s3queue_)processing_threads_num` 设置(`s3queue_` 前缀可选),用于控制服务器本地处理 `S3` 文件的线程数量。
此外,`ordered` 模式还引入了另一个名为 `(s3queue_)buckets` 的设置,表示"逻辑线程"。在分布式场景中,当存在多个具有 `S3Queue` 表副本的服务器时,此设置定义处理单元的数量。例如,每个 `S3Queue` 副本上的每个处理线程都会尝试锁定某个 `bucket` 进行处理,每个 `bucket` 通过文件名的哈希值关联到特定文件。因此,在分布式场景中,强烈建议将 `(s3queue_)buckets` 设置为至少等于副本数量或更大。bucket 数量大于副本数量是允许的。最优配置是将 `(s3queue_)buckets` 设置为 `number_of_replicas` 与 `(s3queue_)processing_threads_num` 的乘积。
不建议在 `24.6` 版本之前使用 `(s3queue_)processing_threads_num` 设置。
`(s3queue_)buckets` 设置从 `24.6` 版本开始提供。


## Description {#description}

`SELECT` 对于流式导入并不特别有用(除了调试场景),因为每个文件只能导入一次。更实用的做法是使用[物化视图](../../../sql-reference/statements/create/view.md)创建实时数据流。操作步骤如下:

1.  使用该引擎创建一个表,从 S3 指定路径消费数据,并将其视为数据流。
2.  创建一个具有所需结构的表。
3.  创建一个物化视图,将引擎中的数据转换后写入之前创建的表中。

当 `MATERIALIZED VIEW` 关联到引擎后,它会在后台开始收集数据。

示例:

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

- `_path` — 文件的路径。
- `_file` — 文件的名称。
- `_size` — 文件的大小。
- `_time` — 文件的创建时间。

有关虚拟列的更多信息,请参阅[此处](../../../engines/table-engines/index.md#table_engines-virtual_columns)。


## 路径中的通配符 {#wildcards-in-path}

`path` 参数可以使用类似 bash 的通配符来指定多个文件。待处理的文件必须存在且匹配完整的路径模式。文件列表在执行 `SELECT` 时确定(而非在 `CREATE` 时)。

- `*` — 匹配除 `/` 之外的任意数量字符,包括空字符串。
- `**` — 匹配任意数量字符,包括 `/`,也包括空字符串。
- `?` — 匹配任意单个字符。
- `{some_string,another_string,yet_another_one}` — 匹配字符串 `'some_string'`、`'another_string'`、`'yet_another_one'` 中的任意一个。
- `{N..M}` — 匹配从 N 到 M 范围内的任意数字,包括两端边界。N 和 M 可以包含前导零,例如 `000..078`。

使用 `{}` 的语法与 [remote](../../../sql-reference/table-functions/remote.md) 表函数类似。


## 限制 {#limitations}

1. 重复行可能由以下原因导致:

- 在文件处理过程中解析时发生异常,且通过 `s3queue_loading_retries` 启用了重试;

- `S3Queue` 在多个服务器上配置并指向 ZooKeeper 中的同一路径,且在某个服务器成功提交已处理文件之前 Keeper 会话过期,这可能导致另一个服务器接管该文件的处理,而该文件可能已被第一个服务器部分或完全处理;但是,从 25.8 版本开始,如果设置 `use_persistent_processing_nodes = 1`,则不会出现此情况。

- 服务器异常终止。

2. 如果 `S3Queue` 在多个服务器上配置并指向 ZooKeeper 中的同一路径,且使用 `Ordered` 模式,则 `s3queue_loading_retries` 将不起作用。此问题将很快修复。


## 内省 {#introspection}

用于内省可使用 `system.s3queue` 无状态表和 `system.s3queue_log` 持久化表。

1. `system.s3queue`。此表非持久化,显示 `S3Queue` 的内存状态:当前正在处理的文件、已处理或失败的文件。

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
COMMENT '包含 S3Queue 元数据的内存状态以及每个文件当前处理的行数。' │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

示例:

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

2. `system.s3queue_log`。持久化表。包含与 `system.s3queue` 相同的信息,但仅针对 `processed` 和 `failed` 状态的文件。

该表具有以下结构:

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

要使用 `system.s3queue_log`,需在服务器配置文件中定义其配置:

```xml
    <s3queue_log>
        <database>system</database>
        <table>s3queue_log</table>
    </s3queue_log>
```

示例:

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
