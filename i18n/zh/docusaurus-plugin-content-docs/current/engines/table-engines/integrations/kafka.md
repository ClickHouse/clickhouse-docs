---
description: 'Kafka 表引擎可与 Apache Kafka 协同工作，使您可以发布或订阅数据流、构建容错存储，并在数据流可用时对其进行处理。'
sidebar_label: 'Kafka'
sidebar_position: 110
slug: /engines/table-engines/integrations/kafka
title: 'Kafka 表引擎'
keywords: ['Kafka', 'table engine']
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# Kafka 表引擎 \{#kafka-table-engine\}

:::tip
如果您在使用 ClickHouse Cloud，我们推荐改用 [ClickPipes](/integrations/clickpipes)。ClickPipes 原生支持私有网络连接，可分别扩展摄取层和集群资源，并为将 Kafka 流式数据摄取到 ClickHouse 提供完善的监控能力。
:::

- 发布或订阅数据流。
- 构建具备容错能力的存储。
- 在数据流到达时进行处理。

## 创建表 \{#creating-a-table\}

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
    [kafka_autodetect_client_rack = '',]
    [kafka_schema = '',]
    [kafka_num_consumers = N,]
    [kafka_max_block_size = 0,]
    [kafka_skip_broken_messages = N,]
    [kafka_commit_every_batch = 0,]
    [kafka_client_id = '',]
    [kafka_poll_timeout_ms = 0,]
    [kafka_poll_max_batch_size = 0,]
    [kafka_flush_interval_ms = 0,]
    [kafka_consumer_reschedule_ms = 0,]
    [kafka_thread_per_consumer = 0,]
    [kafka_handle_error_mode = 'default',]
    [kafka_commit_on_select = false,]
    [kafka_consumer_acquire_timeout_ms = 30000,]
    [kafka_max_rows_per_message = 1,]
    [kafka_compression_codec = '',]
    [kafka_compression_level = -1];
```

必需参数：

* `kafka_broker_list` — 以逗号分隔的 broker 列表 (例如，`localhost:9092`) 。
* `kafka_topic_list` — Kafka topic 列表。
* `kafka_group_name` — Kafka 消费者组。针对每个组分别跟踪读取偏移量。如果不希望在集群中出现消息重复消费的情况，请在所有位置使用相同的组名。
* `kafka_format` — 消息格式。使用与 SQL `FORMAT` 函数相同的格式表示法，例如 `JSONEachRow`。更多信息，参见 [Formats](../../../interfaces/formats.md) 部分。

可选参数：

* `kafka_security_protocol` - 用于与 broker 通信的协议。可选值：`plaintext`、`ssl`、`sasl_plaintext`、`sasl_ssl`。
* `kafka_sasl_mechanism` - 用于认证的 SASL 机制。可选值：`GSSAPI`、`PLAIN`、`SCRAM-SHA-256`、`SCRAM-SHA-512`、`OAUTHBEARER`。
* `kafka_sasl_username` - 用于 `PLAIN` 和 `SASL-SCRAM-..` 机制的 SASL 用户名。
* `kafka_sasl_password` - 用于 `PLAIN` 和 `SASL-SCRAM-..` 机制的 SASL 密码。
* `kafka_schema` — 当格式需要 schema 定义时必须使用的参数。例如，[Cap&#39;n Proto](https://capnproto.org/) 需要提供到 schema 文件的路径以及根对象 `schema.capnp:Message` 的名称。
* `kafka_schema_registry_skip_bytes` — 在使用带封装头部 (envelope header) 的 schema registry 时 (例如包含 19 字节 envelope 的 AWS Glue Schema Registry) ，从每条消息的开头需要跳过的字节数。范围：`[0, 255]`。默认值：`0`。
* `kafka_num_consumers` — 每个表的 consumer 数量。如果单个 consumer 的吞吐量不足，请配置更多的 consumer。consumer 的总数不应超过 topic 中的分区数，因为每个分区只能分配给一个 consumer，并且不得大于部署 ClickHouse 的服务器上的物理核心数。默认值：`1`。
* `kafka_max_block_size` — 单次 poll 的最大批大小 (按消息数计) 。默认值：[max&#95;insert&#95;block&#95;size](../../../operations/settings/settings.md#max_insert_block_size)。
* `kafka_skip_broken_messages` — Kafka 消息解析器对每个块中与 schema 不兼容消息的容忍度。如果 `kafka_skip_broken_messages = N`，则引擎会跳过 *N* 条无法解析的 Kafka 消息 (一条消息等于一行数据) 。默认值：`0`。
* `kafka_commit_every_batch` — 对每个已消费并处理的 batch 进行提交，而不是在写入整个块后仅提交一次。默认值：`0`。
* `kafka_client_id` — 客户端标识符。默认为空。
* `kafka_poll_timeout_ms` — 从 Kafka 进行单次 poll 的超时时间。默认值：[stream&#95;poll&#95;timeout&#95;ms](../../../operations/settings/settings.md#stream_poll_timeout_ms).
* `kafka_poll_max_batch_size` — 单次 Kafka poll 中可被拉取的最大消息数。默认值：[max&#95;block&#95;size](/operations/settings/settings#max_block_size)。
* `kafka_flush_interval_ms` — 从 Kafka flush (刷新) 数据的超时时间。默认值：[stream&#95;flush&#95;interval&#95;ms](/operations/settings/settings#stream_flush_interval_ms)。
* `kafka_consumer_reschedule_ms` — 当 Kafka 流处理停滞时 (例如，没有可供消费的消息) 重新调度的时间间隔。此设置控制 consumer 在重新尝试 poll 之前的延迟。不得超过 `kafka_consumers_pool_ttl_ms`。默认值：`500` 毫秒。
* `kafka_thread_per_consumer` — 为每个 consumer 提供独立线程。启用时，每个 consumer 会独立并行 flush 数据 (否则，来自多个 consumer 的行会被合并成一个数据块) 。默认值：`0`。
* `kafka_handle_error_mode` — Kafka 引擎的错误处理模式。可选值：default (如果解析消息失败，将抛出异常) 、stream (异常信息和原始消息将保存在虚拟列 `_error` 和 `_raw_message` 中) 、dead&#95;letter&#95;queue (与错误相关的数据将保存在 system.dead&#95;letter&#95;queue 中) 。
* `kafka_commit_on_select` — 在执行 SELECT 查询时提交消息。默认值：`false`。
* `kafka_consumer_acquire_timeout_ms` — 在 `Kafka2` 表 (使用基于 Keeper 的 offset 存储) 上执行直接 `SELECT` 查询时，获取 Kafka 消费者的超时时间 (以毫秒为单位) 。当同一张表上同时运行多个并发直接 `SELECT` 查询时，每个查询都必须等待有可用的消费者。该超时时间可防止因不同查询持有不同消费者子集而发生死锁。默认值：`30000`。
* `kafka_max_rows_per_message` — 针对基于行的格式，在一条 Kafka 消息中写入的最大行数。默认值：`1`。
* `kafka_autodetect_client_rack` — 自动为 `librdkafka` 设置 `client.rack` 参数，以优先选择最近的 Kafka 副本。
  支持的来源：
  `AWS_ZONE_ID` 表示 AWS IMDSv2 可用区 ID，例如 `euc1-az1`；
  `AWS_ZONE_NAME` 表示 AWS IMDSv2 可用区名称，例如 `eu-central-1a`；
  `GCP_ZONE` 表示 GCP 元数据服务的区域，例如 `europe-central2-a`；
  `CLICKHOUSE` 表示使用 ClickHouse 内部检测，可能依赖云元数据或配置；
  `AWS_ZONE_NAME_THEN_GCP_ZONE` 表示先尝试 `AWS_ZONE_NAME`，再尝试 `GCP_ZONE`。
  默认值：空字符串，即禁用。
  提示：不同环境使用的可用区格式不同。Amazon MSK 通常使用可用区 ID，因此优先选择 `AWS_ZONE_ID`。Confluent Cloud 通常使用可用区名称，因此优先选择 `AWS_ZONE_NAME`。如果不确定，请使用 `AWS_ZONE_NAME_THEN_GCP_ZONE`，或检查集群上的 `broker.rack` 值。
  注意：Kafka broker 必须配置 `broker.rack` 和 `replica.selector.class=org.apache.kafka.common.replica.RackAwareReplicaSelector`。
* `kafka_compression_codec` — 生产消息时使用的压缩 codec。支持：空字符串、`none`、`gzip`、`snappy`、`lz4`、`zstd`。如果为空字符串，则表不会设置压缩 codec，此时将使用配置文件中的值或 `librdkafka` 的默认值。默认值：空字符串。
* `kafka_compression_level` — 由 kafka&#95;compression&#95;codec 选择的算法对应的压缩级别参数。值越高，压缩效果越好，但 CPU 使用量也会更高。可用范围取决于算法：`gzip` 为 `[0-9]`；`lz4` 为 `[0-12]`；`snappy` 仅支持 `0`；`zstd` 为 `[0-12]`；`-1` 表示由 codec 决定的默认压缩级别。默认值：`-1`。
* `kafka_map_virtual_columns_on_write` — 如果启用，表 schema 中名称为 `_key`、`_timestamp`、`_headers.name` 和 `_headers.value` 的特殊列会在 `INSERT` 时映射到相应的 Kafka 消息元数据，且不会包含在消息负载中。请参见[将列映射到 Kafka 消息元数据](#mapping-columns-to-kafka-message-metadata)。默认值：`false`。

示例：

```sql
  CREATE TABLE queue (
    timestamp UInt64,
    level String,
    message String
  ) ENGINE = Kafka('localhost:9092', 'topic', 'group1', 'JSONEachRow');

  SELECT * FROM queue LIMIT 5;

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
```

<details markdown="1">
  <summary>创建表的已弃用方法</summary>

  :::note
  请勿在新项目中使用此方法。如有可能，请将旧项目迁移为使用上文描述的方法。
  :::

  ```sql
  Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
        [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_consumer_reschedule_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
  ```
</details>

:::info
Kafka 表引擎不支持带有[默认值](/sql-reference/statements/create/table#default_values)的列。如果需要带默认值的列，可以在 materialized view 层添加 (见下文) 。
:::

## 描述 \{#description\}

已投递的消息会被自动跟踪，因此每个组中的每条消息只会被计数一次。如果你希望获取同一批数据两次，请创建一个使用不同 group 名称的表副本。

Group 十分灵活，并且会在集群中同步。例如，如果你在一个集群中有 10 个 topic 和 5 个表副本，那么每个副本会分配到 2 个 topic。如果副本数量发生变化，这些 topic 会在各个副本之间自动重新分配。更多信息请参阅 [http://kafka.apache.org/intro](http://kafka.apache.org/intro)。

建议为每个 Kafka topic 配置其专用的 consumer group，确保该 topic 与该 group 之间是一一对应的关系，特别是在会动态创建和删除 topic 的环境中（例如测试或预发布环境）。

`SELECT` 并不特别适合用于读取消息（除非用于调试），因为每条消息只能被读取一次。更实用的方式是通过物化视图创建实时处理链。为此，请执行以下步骤：

1. 使用引擎创建一个 Kafka consumer，并将其视为数据流。
2. 创建一个具有所需结构的表。
3. 创建一个物化视图，将引擎中的数据转换后写入之前创建的表中。

当 `MATERIALIZED VIEW` 连接到该引擎时，它会在后台开始收集数据。这样你就可以持续地从 Kafka 接收消息，并使用 `SELECT` 将其转换为所需的格式。
一个 Kafka 表可以拥有任意数量的物化视图，它们并不会直接从该 Kafka 表中读取数据，而是以数据块（blocks）的形式接收新增记录。通过这种方式，你可以将数据写入多张具有不同明细级别（带分组聚合和不带分组聚合）的表中。

示例：

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

为了提高性能，接收到的消息会被分组成大小为 [max&#95;insert&#95;block&#95;size](../../../operations/settings/settings.md#max_insert_block_size) 的数据块。如果在 [stream&#95;flush&#95;interval&#95;ms](/operations/settings/settings#stream_flush_interval_ms) 毫秒内尚未形成该数据块，当前数据将会被刷新写入表中，而不考虑该数据块是否已填满。

要停止接收某个 topic 的数据或更改转换逻辑，请分离该物化视图：

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

如果你想通过 `ALTER` 语句更改目标表，建议先禁用该物化视图，以避免目标表与视图产出的数据之间出现不一致。

## 配置 \{#configuration\}

与 GraphiteMergeTree 类似，Kafka 引擎支持通过 ClickHouse 配置文件进行扩展配置。可以使用两个配置键：全局配置（位于 `<kafka>` 下）和主题级配置（位于 `<kafka><kafka_topic>` 下）。会先应用全局配置，然后再应用主题级配置（如果存在）。

```xml
  <kafka>
    <!-- Global configuration options for all tables of Kafka engine type -->
    <debug>cgrp</debug>
    <statistics_interval_ms>3000</statistics_interval_ms>

    <kafka_topic>
        <name>logs</name>
        <statistics_interval_ms>4000</statistics_interval_ms>
    </kafka_topic>

    <!-- Settings for consumer -->
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

    <!-- Settings for producer -->
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

有关可用配置选项的列表，请参阅 [librdkafka 配置参考](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)。在 ClickHouse 配置中，应使用下划线（`_`）而不是点号。例如，`check.crcs=true` 将写作 `<check_crcs>true</check_crcs>`。

### Kerberos 支持 \{#kafka-kerberos-support\}

要与支持 Kerberos 的 Kafka 配合使用，请添加值为 `sasl_plaintext` 的 `security_protocol` 子元素。如果操作系统已经获取并缓存了 Kerberos 票据授予票（TGT，ticket-granting ticket），这就足够了。
ClickHouse 可以使用 keytab 文件维护 Kerberos 凭证。请考虑配置 `sasl_kerberos_service_name`、`sasl_kerberos_keytab` 和 `sasl_kerberos_principal` 子元素。

示例：

```xml
<!-- Kerberos-aware Kafka -->
<kafka>
  <security_protocol>SASL_PLAINTEXT</security_protocol>
  <sasl_kerberos_keytab>/home/kafkauser/kafkauser.keytab</sasl_kerberos_keytab>
  <sasl_kerberos_principal>kafkauser/kafkahost@EXAMPLE.COM</sasl_kerberos_principal>
</kafka>
```

## 虚拟列 \{#virtual-columns\}

- `_topic` — Kafka 主题。数据类型：`LowCardinality(String)`。
- `_key` — 消息的 key。数据类型：`String`。
- `_offset` — 消息的 offset。数据类型：`UInt64`。
- `_timestamp` — 消息的时间戳。数据类型：`Nullable(DateTime)`。
- `_timestamp_ms` — 消息的毫秒级时间戳。数据类型：`Nullable(DateTime64(3))`。
- `_partition` — Kafka 主题的分区。数据类型：`UInt64`。
- `_headers.name` — 消息头键的数组。数据类型：`Array(String)`。
- `_headers.value` — 消息头值的数组。数据类型：`Array(String)`。

当 `kafka_handle_error_mode='stream'` 时的附加虚拟列：

- `_raw_message` — 无法成功解析的原始消息。数据类型：`String`。
- `_error` — 解析失败时抛出的异常信息。数据类型：`String`。

注意：只有在解析过程中发生异常时，`_raw_message` 和 `_error` 虚拟列才会被填充；当消息成功解析时，这两个列始终为空。

## 将列映射到 Kafka 消息元数据 \{#mapping-columns-to-kafka-message-metadata\}

使用 `INSERT INTO` 写入消息时，如果表中存在名为 `_key` (类型为 `String`) 的列，Kafka 引擎始终会将其用作 Kafka 消息键；如果存在名为 `_timestamp` (类型为 `DateTime`) 的列，则始终会将其用作 Kafka 消息时间戳。默认情况下，这些列也会与其他列一起出现在写出的消息负载中。

设置 `kafka_map_virtual_columns_on_write = 1` 后，行为会发生变化：

* `_key` (类型为 `String`) — 映射为 Kafka 消息键。
* `_timestamp` (类型为 `DateTime`) — 映射为 Kafka 消息时间戳。
* `_headers.name` (类型为 `Array(String)`) 和 `_headers.value` (类型为 `Array(String)`) — 映射为 Kafka 消息头。每一对 `(_headers.name[i], _headers.value[i])` 都会成为一个 Kafka 消息头。由于 `_headers.name` 和 `_headers.value` 共享 `_headers` 这一 Nested 前缀，ClickHouse 要求每一行中的这两个数组长度相同。

只有当具有这些名称的列的类型与上面列出的类型一致时，这些列才会**从消息负载中排除**；否则，它们仍会保留在负载中，因此恰好将这些名称用于无关数据的 schema 仍可正常工作。

示例：

```sql
CREATE TABLE kafka_out
(
    event_json String,
    `_key` String,
    `_timestamp` DateTime,
    `_headers.name` Array(String),
    `_headers.value` Array(String)
)
ENGINE = Kafka
SETTINGS
    kafka_broker_list = 'broker:9092',
    kafka_topic_list = 'events',
    kafka_group_name = 'events-producer',
    kafka_format = 'JSONEachRow',
    kafka_map_virtual_columns_on_write = 1;

INSERT INTO kafka_out VALUES
    ('{"a":1}', 'session-42', now(), ['source', 'trace_id'], ['api', 'abc-123']);
```

生成的 Kafka 消息包含负载 `{"event_json":"{\"a\":1}"}`、键 `session-42`、当前时间戳，以及两个头部信息 `source=api` 和 `trace_id=abc-123`。

## 数据格式支持 \{#data-formats-support\}

Kafka 引擎支持 ClickHouse 所支持的所有[格式](../../../interfaces/formats.md)。
单个 Kafka 消息中的行数取决于所用格式是行级格式还是块级格式：

- 对于行级格式，可以通过设置 `kafka_max_rows_per_message` 来控制单个 Kafka 消息中的行数。
- 对于块级格式，我们无法将一个块再拆分为更小的部分，但可以通过通用设置 [max_block_size](/operations/settings/settings#max_block_size) 来控制单个块中的行数。

## 在 ClickHouse Keeper 中存储已提交 offset 的引擎 \{#engine-to-store-committed-offsets-in-clickhouse-keeper\}

<ExperimentalBadge />

如果启用了 `allow_experimental_kafka_offsets_storage_in_keeper`，则可以为 Kafka 表引擎额外指定两个设置：

* `kafka_keeper_path`：指定该表在 ClickHouse Keeper 中的路径
* `kafka_replica_name`：指定该表在 ClickHouse Keeper 中的副本名称

这两个设置要么同时指定，要么都不指定。当二者都被指定时，将会使用一个新的实验性 Kafka 引擎。这个新引擎不再依赖将已提交的 offset 存储在 Kafka 中，而是将其存储在 ClickHouse Keeper 中。它仍然会尝试将 offset 提交到 Kafka，但只在创建表时依赖这些 offset。在其他情况下（例如表被重启，或在发生错误后进行恢复）时，将使用存储在 ClickHouse Keeper 中的 offset 作为继续消费消息的起始位置。除了已提交的 offset，它还会存储上一个批次中已消费的消息数量，因此如果插入失败，将会再次消费相同数量的消息，从而在需要时实现去重。

示例：

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### 已知限制 \{#known-limitations\}

由于新引擎仍处于实验阶段，目前尚未准备好用于生产环境。当前实现存在以下一些已知限制：

* 频繁删除并重新创建表，或者为不同引擎指定相同的 ClickHouse Keeper 路径，可能会导致问题。作为最佳实践，建议在 `kafka_keeper_path` 中使用 `{uuid}` 来避免路径冲突。
* 为了实现可重复读取，消息不能在单个线程上从多个分区进行消费。另一方面，必须定期轮询 Kafka 消费者 以保持其存活。鉴于这两个目标，我们决定仅在启用 `kafka_thread_per_consumer` 时才允许创建多个 消费者；否则，要避免与定期轮询 消费者 相关的问题将过于复杂。

**另请参阅**

* [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns)
* [background&#95;message&#95;broker&#95;schedule&#95;pool&#95;size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
* [system.kafka&#95;consumers](../../../operations/system-tables/kafka_consumers.md)