---
description: 'Kafka 表引擎可用于与 Apache Kafka 协同工作，使您能够发布或订阅数据流、构建容错存储，并在数据流可用时对其进行处理。'
sidebar_label: 'Kafka'
sidebar_position: 110
slug: /engines/table-engines/integrations/kafka
title: 'Kafka 表引擎'
keywords: ['Kafka', 'table engine']
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# Kafka 表引擎

:::tip
如果您在使用 ClickHouse Cloud，我们建议改用 [ClickPipes](/integrations/clickpipes)。ClickPipes 原生支持私有网络连接、数据摄取与集群资源的独立伸缩，以及针对将 Kafka 流数据导入 ClickHouse 的全面监控。
:::

- 发布或订阅数据流。
- 实现容错存储。
- 在数据流到达时对其进行处理。



## 创建表 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [ALIAS expr1],
    name2 [type2] [ALIAS expr2],
    ...
) ENGINE = Kafka()
SETTINGS
    kafka_broker_list = 'host:port',
    kafka_topic_list = 'topic1,topic2,...',
    kafka_group_name = 'group_name',
    kafka_format = 'data_format'[,]
    [kafka_security_protocol = '',]
    [kafka_sasl_mechanism = '',]
    [kafka_sasl_username = '',]
    [kafka_sasl_password = '',]
    [kafka_schema = '',]
    [kafka_num_consumers = N,]
    [kafka_max_block_size = 0,]
    [kafka_skip_broken_messages = N,]
    [kafka_commit_every_batch = 0,]
    [kafka_client_id = '',]
    [kafka_poll_timeout_ms = 0,]
    [kafka_poll_max_batch_size = 0,]
    [kafka_flush_interval_ms = 0,]
    [kafka_thread_per_consumer = 0,]
    [kafka_handle_error_mode = 'default',]
    [kafka_commit_on_select = false,]
    [kafka_max_rows_per_message = 1,]
    [kafka_compression_codec = '',]
    [kafka_compression_level = -1];
```

必需参数:

- `kafka_broker_list` — 以逗号分隔的 broker 列表(例如 `localhost:9092`)。
- `kafka_topic_list` — Kafka 主题列表。
- `kafka_group_name` — Kafka 消费者组。每个组的读取偏移量会单独跟踪。如果不希望消息在集群中重复,请在所有位置使用相同的组名。
- `kafka_format` — 消息格式。使用与 SQL `FORMAT` 函数相同的表示法,例如 `JSONEachRow`。更多信息请参阅 [格式](../../../interfaces/formats.md) 部分。

可选参数:


* `kafka_security_protocol` - 用于与 broker 通信的协议。可选值：`plaintext`、`ssl`、`sasl_plaintext`、`sasl_ssl`。
* `kafka_sasl_mechanism` - 用于身份验证的 SASL 机制。可选值：`GSSAPI`、`PLAIN`、`SCRAM-SHA-256`、`SCRAM-SHA-512`、`OAUTHBEARER`。
* `kafka_sasl_username` - 与 `PLAIN` 和 `SASL-SCRAM-..` 机制一起使用的 SASL 用户名。
* `kafka_sasl_password` - 与 `PLAIN` 和 `SASL-SCRAM-..` 机制一起使用的 SASL 密码。
* `kafka_schema` — 当格式需要 schema 定义时必须使用的参数。例如，[Cap&#39;n Proto](https://capnproto.org/) 需要提供 schema 文件路径以及根 `schema.capnp:Message` 对象的名称。
* `kafka_schema_registry_skip_bytes` — 使用带信封头的 schema registry 时（例如包含 19 字节信封的 AWS Glue Schema Registry），从每条消息开头需要跳过的字节数。范围：`[0, 255]`。默认值：`0`。
* `kafka_num_consumers` — 每个表的 consumer 数量。如果单个 consumer 的吞吐量不足，可以指定更多的 consumer。consumer 的总数不应超过 topic 的分区数，因为每个分区只能分配一个 consumer，并且不得大于部署 ClickHouse 的服务器上的物理核心数。默认值：`1`。
* `kafka_max_block_size` — 一次 poll 操作的最大批大小（按消息数计）。默认值：[max&#95;insert&#95;block&#95;size](../../../operations/settings/settings.md#max_insert_block_size)。
* `kafka_skip_broken_messages` — Kafka 消息解析器在每个块中对 schema 不兼容消息的容忍度。如果 `kafka_skip_broken_messages = N`，则引擎会跳过 *N* 条无法解析的 Kafka 消息（一条消息对应一行数据）。默认值：`0`。
* `kafka_commit_every_batch` — 对每个已消费并处理完成的批次进行提交，而不是在写完整个块后只提交一次。默认值：`0`。
* `kafka_client_id` — 客户端标识符。默认为空。
* `kafka_poll_timeout_ms` — 从 Kafka 进行一次 poll 操作的超时时间。默认值：[stream&#95;poll&#95;timeout&#95;ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
* `kafka_poll_max_batch_size` — 一次 Kafka poll 操作中可获取的最大消息数。默认值：[max&#95;block&#95;size](/operations/settings/settings#max_block_size)。
* `kafka_flush_interval_ms` — 从 Kafka 刷写（flush）数据的超时时间。默认值：[stream&#95;flush&#95;interval&#95;ms](/operations/settings/settings#stream_flush_interval_ms)。
* `kafka_thread_per_consumer` — 为每个 consumer 提供独立线程。启用后，每个 consumer 会独立并行地刷写数据（否则来自多个 consumer 的行会被合并为一个块）。默认值：`0`。
* `kafka_handle_error_mode` — Kafka 引擎的错误处理方式。可选值：`default`（解析消息失败时抛出异常）、`stream`（异常信息和原始消息会保存在虚拟列 `_error` 和 `_raw_message` 中）、`dead_letter_queue`（与错误相关的数据会保存在 `system.dead_letter_queue` 中）。
* `kafka_commit_on_select` — 在执行 `SELECT` 查询时提交消息。默认值：`false`。
* `kafka_max_rows_per_message` — 对行式格式，一条 Kafka 消息中可写入的最大行数。默认值：`1`。
* `kafka_compression_codec` — 生产消息时使用的压缩编解码器。支持：空字符串、`none`、`gzip`、`snappy`、`lz4`、`zstd`。如果为空字符串，则表不会设置压缩编解码器，此时将使用配置文件中的值或 `librdkafka` 的默认值。默认值：空字符串。
* `kafka_compression_level` — 由 `kafka_compression_codec` 选择的算法的压缩级别参数。更高的值会带来更好的压缩率，但会消耗更多 CPU。可用范围依赖于算法：`gzip` 为 `[0-9]`；`lz4` 为 `[0-12]`；`snappy` 仅支持 `0`；`zstd` 为 `[0-12]`；`-1` 表示由编解码器决定的默认压缩级别。默认值：`-1`。

Examples:

```sql
  CREATE TABLE queue (
    timestamp UInt64,
    level String,
    message String
  ) ENGINE = Kafka('localhost:9092', 'topic', 'group1', 'JSONEachRow');

  SELECT * FROM queue LIMIT 5;
```


CREATE TABLE queue2 (
timestamp UInt64,
level String,
message String
) ENGINE = Kafka SETTINGS kafka_broker_list = 'localhost:9092',
kafka_topic_list = 'topic',
kafka_group_name = 'group1',
kafka_format = 'JSONEachRow',
kafka_num_consumers = 4;

CREATE TABLE queue3 (
timestamp UInt64,
level String,
message String
) ENGINE = Kafka('localhost:9092', 'topic', 'group1')
SETTINGS kafka_format = 'JSONEachRow',
kafka_num_consumers = 4;

````

<details markdown="1">

<summary>已弃用的创建表方法</summary>

:::note
请勿在新项目中使用此方法。如有可能,请将旧项目迁移至上述方法。
:::

```sql
Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
      [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
````

</details>

:::info
Kafka 表引擎不支持带有[默认值](/sql-reference/statements/create/table#default_values)的列。如需使用带有默认值的列,可以在物化视图层添加(见下文)。
:::


## Description {#description}

已投递的消息会被自动跟踪,因此组中的每条消息只会被计数一次。如果需要重复获取数据,则需要使用不同的组名创建表的副本。

组在集群上是灵活且同步的。例如,如果集群中有 10 个主题和 5 个表副本,则每个副本将分配到 2 个主题。如果副本数量发生变化,主题会自动在副本之间重新分配。更多信息请参阅 http://kafka.apache.org/intro。

建议为每个 Kafka 主题配置专用的消费者组,确保主题与组之间的独占配对关系,特别是在可能动态创建和删除主题的环境中(例如测试或预发布环境)。

`SELECT` 对于读取消息并不是特别有用(调试除外),因为每条消息只能被读取一次。更实用的做法是使用物化视图创建实时数据流。具体步骤如下:

1.  使用该引擎创建 Kafka 消费者并将其视为数据流。
2.  创建具有所需结构的表。
3.  创建物化视图,将引擎中的数据转换后写入先前创建的表中。

当 `MATERIALIZED VIEW` 关联到引擎时,它会在后台开始收集数据。这使您能够持续从 Kafka 接收消息,并使用 `SELECT` 将其转换为所需格式。
一个 kafka 表可以关联任意数量的物化视图,这些视图不会直接从 kafka 表读取数据,而是接收新记录(以块为单位),这样您可以将数据以不同的详细级别写入多个表(可以带分组聚合,也可以不带)。

示例:

```sql
  CREATE TABLE queue (
    timestamp UInt64,
    level String,
    message String
  ) ENGINE = Kafka('localhost:9092', 'topic', 'group1', 'JSONEachRow');

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

为了提高性能,接收到的消息会被分组为大小为 [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size) 的块。如果块未在 [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms) 毫秒内形成,则无论块是否完整,数据都将被刷新到表中。

要停止接收主题数据或更改转换逻辑,请分离物化视图:

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

如果需要使用 `ALTER` 更改目标表,建议先禁用物化视图,以避免目标表与视图数据之间出现不一致。


## 配置 {#configuration}

与 GraphiteMergeTree 类似,Kafka 引擎支持使用 ClickHouse 配置文件进行扩展配置。您可以使用两种配置键:全局配置(位于 `<kafka>` 下)和主题级配置(位于 `<kafka><kafka_topic>` 下)。首先应用全局配置,然后应用主题级配置(如果存在)。

```xml
  <kafka>
    <!-- Kafka 引擎类型所有表的全局配置选项 -->
    <debug>cgrp</debug>
    <statistics_interval_ms>3000</statistics_interval_ms>

    <kafka_topic>
        <name>logs</name>
        <statistics_interval_ms>4000</statistics_interval_ms>
    </kafka_topic>

    <!-- 消费者设置 -->
    <consumer>
        <auto_offset_reset>smallest</auto_offset_reset>
        <kafka_topic>
            <name>logs</name>
            <fetch_min_bytes>100000</fetch_min_bytes>
        </kafka_topic>

        <kafka_topic>
            <name>stats</name>
            <fetch_min_bytes>50000</fetch_min_bytes>
        </kafka_topic>
    </consumer>

    <!-- 生产者设置 -->
    <producer>
        <kafka_topic>
            <name>logs</name>
            <retry_backoff_ms>250</retry_backoff_ms>
        </kafka_topic>

        <kafka_topic>
            <name>stats</name>
            <retry_backoff_ms>400</retry_backoff_ms>
        </kafka_topic>
    </producer>
  </kafka>
```

有关可能的配置选项列表,请参阅 [librdkafka 配置参考](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)。在 ClickHouse 配置中使用下划线(`_`)代替点号。例如,`check.crcs=true` 将写为 `<check_crcs>true</check_crcs>`。

### Kerberos 支持 {#kafka-kerberos-support}

要处理支持 Kerberos 的 Kafka,请添加值为 `sasl_plaintext` 的 `security_protocol` 子元素。如果 Kerberos 票据授予票据已由操作系统功能获取并缓存,这就足够了。
ClickHouse 能够使用 keytab 文件维护 Kerberos 凭据。可以使用 `sasl_kerberos_service_name`、`sasl_kerberos_keytab` 和 `sasl_kerberos_principal` 子元素。

示例:

```xml
<!-- 支持 Kerberos 的 Kafka -->
<kafka>
  <security_protocol>SASL_PLAINTEXT</security_protocol>
  <sasl_kerberos_keytab>/home/kafkauser/kafkauser.keytab</sasl_kerberos_keytab>
  <sasl_kerberos_principal>kafkauser/kafkahost@EXAMPLE.COM</sasl_kerberos_principal>
</kafka>
```


## 虚拟列 {#virtual-columns}

- `_topic` — Kafka 主题。数据类型：`LowCardinality(String)`。
- `_key` — 消息的键。数据类型：`String`。
- `_offset` — 消息的偏移量。数据类型：`UInt64`。
- `_timestamp` — 消息的时间戳。数据类型：`Nullable(DateTime)`。
- `_timestamp_ms` — 消息的毫秒时间戳。数据类型：`Nullable(DateTime64(3))`。
- `_partition` — Kafka 主题的分区。数据类型：`UInt64`。
- `_headers.name` — 消息头键的数组。数据类型：`Array(String)`。
- `_headers.value` — 消息头值的数组。数据类型：`Array(String)`。

当 `kafka_handle_error_mode='stream'` 时的附加虚拟列：

- `_raw_message` - 无法成功解析的原始消息。数据类型：`String`。
- `_error` - 解析失败时产生的异常消息。数据类型：`String`。

注意：`_raw_message` 和 `_error` 虚拟列仅在解析过程中发生异常时填充，消息成功解析时它们始终为空。


## 数据格式支持 {#data-formats-support}

Kafka 引擎支持 ClickHouse 中支持的所有[格式](../../../interfaces/formats.md)。
单条 Kafka 消息中的行数取决于格式是基于行还是基于块:

- 对于基于行的格式,单条 Kafka 消息中的行数可通过设置 `kafka_max_rows_per_message` 来控制。
- 对于基于块的格式,无法将块分割成更小的部分,但单个块中的行数可通过通用设置 [max_block_size](/operations/settings/settings#max_block_size) 来控制。


## 在 ClickHouse Keeper 中存储已提交偏移量的引擎 {#engine-to-store-committed-offsets-in-clickhouse-keeper}

<ExperimentalBadge />

如果启用了 `allow_experimental_kafka_offsets_storage_in_keeper`,则可以为 Kafka 表引擎指定另外两个设置:

- `kafka_keeper_path` 指定表在 ClickHouse Keeper 中的路径
- `kafka_replica_name` 指定 ClickHouse Keeper 中的副本名称

必须同时指定这两个设置,或者都不指定。当同时指定这两个设置时,将使用新的实验性 Kafka 引擎。新引擎不依赖于在 Kafka 中存储已提交的偏移量,而是将它们存储在 ClickHouse Keeper 中。它仍然会尝试将偏移量提交到 Kafka,但仅在创建表时依赖这些偏移量。在任何其他情况下(表重启或从某些错误中恢复后),存储在 ClickHouse Keeper 中的偏移量将用作继续消费消息的起始偏移量。除了已提交的偏移量外,它还会存储上一批次中消费的消息数量,因此如果插入失败,将消费相同数量的消息,从而在必要时实现去重。

示例:

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### 已知限制 {#known-limitations}

由于新引擎是实验性的,尚未准备好用于生产环境。该实现存在一些已知限制:

- 最大的限制是该引擎不支持直接读取。使用物化视图从引擎读取以及向引擎写入都可以正常工作,但直接读取不行。因此,所有直接的 `SELECT` 查询都会失败。
- 快速删除并重新创建表,或为不同的引擎指定相同的 ClickHouse Keeper 路径可能会导致问题。作为最佳实践,您可以在 `kafka_keeper_path` 中使用 `{uuid}` 来避免路径冲突。
- 为了实现可重复读取,不能在单个线程上从多个分区消费消息。另一方面,必须定期轮询 Kafka 消费者以保持其活跃状态。基于这两个目标,我们决定仅在启用 `kafka_thread_per_consumer` 时才允许创建多个消费者,否则避免定期轮询消费者的问题会变得过于复杂。
- 由新存储引擎创建的消费者不会显示在 [`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md) 表中。

**另请参阅**

- [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
- [system.kafka_consumers](../../../operations/system-tables/kafka_consumers.md)
