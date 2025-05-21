---
'description': 'The Kafka engine works with Apache Kafka and lets you publish or subscribe
  to data flows, organize fault-tolerant storage, and process streams as they become
  available.'
'sidebar_label': 'Kafka'
'sidebar_position': 110
'slug': '/engines/table-engines/integrations/kafka'
'title': 'Kafka'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Kafka

<CloudNotSupportedBadge/>

:::note
ClickHouse Cloud 用户建议使用 [ClickPipes](/integrations/clickpipes) 将 Kafka 数据流式传输到 ClickHouse。这原生支持高性能插入，同时确保关注点的分离，能够独立扩展摄取和集群资源。
:::

此引擎与 [Apache Kafka](http://kafka.apache.org/) 一起工作。

Kafka 让您可以：

- 发布或订阅数据流。
- 组织容错存储。
- 在流可用时处理流。

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
    [kafka_max_rows_per_message = 1];
```

必需参数：

- `kafka_broker_list` — 用逗号分隔的一组代理列表（例如，`localhost:9092`）。
- `kafka_topic_list` — 一组 Kafka 主题。
- `kafka_group_name` — 一组 Kafka 消费者。阅读边际单独为每个组跟踪。如果不希望在集群中重复消息，请始终使用相同的组名。
- `kafka_format` — 消息格式。使用与 SQL `FORMAT` 函数相同的表示法，例如 `JSONEachRow`。有关更多信息，请参见 [Formats](../../../interfaces/formats.md) 部分。

可选参数：

- `kafka_security_protocol` - 用于与代理通信的协议。可能的值：`plaintext`、`ssl`、`sasl_plaintext`、`sasl_ssl`。
- `kafka_sasl_mechanism` - 用于身份验证的 SASL 机制。可能的值：`GSSAPI`、`PLAIN`、`SCRAM-SHA-256`、`SCRAM-SHA-512`、`OAUTHBEARER`。
- `kafka_sasl_username` - 用于 `PLAIN` 和 `SASL-SCRAM-..` 机制的 SASL 用户名。
- `kafka_sasl_password` - 用于 `PLAIN` 和 `SASL-SCRAM-..` 机制的 SASL 密码。
- `kafka_schema` — 如果格式需要模式定义，必须使用的参数。例如，[Cap'n Proto](https://capnproto.org/) 需要模式文件的路径和根对象 `schema.capnp:Message` 的名称。
- `kafka_num_consumers` — 每个表的消费者数量。如果单个消费者的吞吐量不足，请指定更多消费者。消费者的总数不得超过主题中的分区数量，因为每个分区只能分配一个消费者，并且不得大于 ClickHouse 部署所在服务器的物理核心数量。默认值：`1`。
- `kafka_max_block_size` — 必须轮询的最大批次大小（以消息为单位）。默认值：[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `kafka_skip_broken_messages` — Kafka 消息解析器对每个块中不兼容模式的消息的容忍度。如果 `kafka_skip_broken_messages = N` 则引擎跳过无法解析的 *N* 条 Kafka 消息（请求为一行数据）。默认值：`0`。
- `kafka_commit_every_batch` — 在写入整个块后，而不是一次提交所有已消费和处理的批次。默认值：`0`。
- `kafka_client_id` — 客户端标识符。默认空。
- `kafka_poll_timeout_ms` — 从 Kafka 轮询的超时。默认值：[stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
- `kafka_poll_max_batch_size` — 在单次 Kafka 轮询中最多能轮询的消息数。默认值：[max_block_size](/operations/settings/settings#max_block_size)。
- `kafka_flush_interval_ms` — 从 Kafka 刷新数据的超时。默认值：[stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `kafka_thread_per_consumer` — 为每个消费者提供独立线程。当启用时，每个消费者独立、并行地刷新数据（否则——来自多个消费者的行汇总形成一个块）。默认值：`0`。
- `kafka_handle_error_mode` — 处理 Kafka 引擎错误的方式。可能的值：默认（如果解析消息失败将抛出异常）、流（异常消息和原始消息将保存在虚拟列 `_error` 和 `_raw_message`中）。
- `kafka_commit_on_select` — 在执行查询时提交消息。默认值：`false`。
- `kafka_max_rows_per_message` — 以行格式为单位在一条 kafka 消息中写入的最大行数。默认值：`1`。

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

<summary>创建表的弃用方法</summary>

:::note
请勿在新项目中使用此方法。如果可能，请将旧项目切换到上述描述的方法。
:::

```sql
Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
      [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
```

</details>

:::info
Kafka 表引擎不支持带有 [default value](/sql-reference/statements/create/table#default_values) 的列。如果需要具有默认值的列，可以在物化视图层面添加它们（见下文）。
:::

## 描述 {#description}

已传递的消息会自动跟踪，因此组中的每条消息仅计算一次。如果您想获取数据两次，则创建一个具有另一个组名的表的副本。

组是灵活的，并在集群中保持同步。例如，如果您在集群中有 10 个主题和 5 个表的副本，则每个副本获取 2 个主题。如果副本数量发生变化，主题会自动在副本之间重新分配。有关更多信息，请访问 http://kafka.apache.org/intro。

`SELECT` 对于读取消息（除了调试）并没有特别的用处，因为每条消息只能读取一次。创建实时线程使用物化视图更为实际。为此：

1. 使用引擎创建 Kafka 消费者并将其视为数据流。
2. 创建具有所需结构的表。
3. 创建一个物化视图，将引擎中的数据转换并放入先前创建的表中。

当 `MATERIALIZED VIEW` 加入引擎时，它开始在后台收集数据。这使您可以不断从 Kafka 接收消息，并使用 `SELECT` 将它们转换为所需格式。
一个 kafka 表可以有任意数量的物化视图，它们不会直接从 kafka 表读取数据，而是接收新记录（以块的形式），这样您可以将数据写入多个不同详细级别的表（分组 - 聚合和不聚合）。

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
    AS SELECT toDate(toDateTime(timestamp)) AS day, level, count() as total
    FROM queue GROUP BY day, level;

  SELECT level, sum(total) FROM daily GROUP BY level;
```
为了提高性能，接收到的消息被分组为大小为 [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size) 的块。如果在 [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms) 毫秒内没有形成块，则数据将被刷新到表中，而不考虑块的完整性。

要停止接收主题数据或更改转换逻辑，请分离物化视图：

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

如果您想通过 `ALTER` 更改目标表，我们建议禁用物化视图以避免目标表与视图数据之间的不一致。

## 配置 {#configuration}

类似于 GraphiteMergeTree，Kafka 引擎支持使用 ClickHouse 配置文件的扩展配置。您可以使用两个配置键：全局（在 `<kafka>` 下）和主题级（在 `<kafka><kafka_topic>` 下）。全局配置首先应用，然后应用主题级配置（如果存在）。

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

有关可能的配置选项列表，请参见 [librdkafka 配置参考](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)。在 ClickHouse 配置中使用下划线（`_`）代替点。例如，`check.crcs=true` 将变成 `<check_crcs>true</check_crcs>`。

### Kerberos 支持 {#kafka-kerberos-support}

要处理支持 Kerberos 的 Kafka，请添加 `security_protocol` 子元素，并将值设置为 `sasl_plaintext`。只需确保 Kerberos 票据授权票证被 OS 功能获取并缓存即可。
ClickHouse 可以使用 keytab 文件维护 Kerberos 凭证。考虑 `sasl_kerberos_service_name`、`sasl_kerberos_keytab` 和 `sasl_kerberos_principal` 子元素。

示例：

```xml
<!-- Kerberos-aware Kafka -->
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
- `_timestamp_ms` — 消息的时间戳（以毫秒为单位）。数据类型：`Nullable(DateTime64(3))`。
- `_partition` — Kafka 主题的分区。数据类型：`UInt64`。
- `_headers.name` — 消息头键的数组。数据类型：`Array(String)`。
- `_headers.value` — 消息头值的数组。数据类型：`Array(String)`。

当 `kafka_handle_error_mode='stream'` 时的额外虚拟列：

- `_raw_message` - 无法成功解析的原始消息。数据类型：`String`。
- `_error` - 解析失败时发生的异常消息。数据类型：`String`。

注意：在解析期间发生异常时，虚拟列 `_raw_message` 和 `_error` 仅在此情况下填充，当消息成功解析时它们总是为空。

## 数据格式支持 {#data-formats-support}

Kafka 引擎支持 ClickHouse 支持的所有 [格式](../../../interfaces/formats.md)。
一条 Kafka 消息中的行数取决于格式是行式的还是块式的：

- 对于行式格式，Kafka 消息中的行数可以通过设置 `kafka_max_rows_per_message` 来控制。
- 对于块式格式，无法将块划分为更小的部分，但可以通过通用设置 [max_block_size](/operations/settings/settings#max_block_size) 来控制一块中的行数。

## 存储已提交偏移量的引擎在 ClickHouse Keeper 中 {#engine-to-store-committed-offsets-in-clickhouse-keeper}

<ExperimentalBadge/>

如果启用 `allow_experimental_kafka_offsets_storage_in_keeper`，则可以为 Kafka 表引擎指定两个设置：
 - `kafka_keeper_path` 指定 ClickHouse Keeper 中表的路径
 - `kafka_replica_name` 指定 ClickHouse Keeper 中副本的名称

必须指定这两个设置或都不指定。当同时指定这两个设置时，将使用一个新的实验性 Kafka 引擎。新引擎不依赖于在 Kafka 中存储已提交的偏移量，而是将其存储在 ClickHouse Keeper 中。它仍然尝试将偏移量提交到 Kafka，但它只在创建表时依赖这些偏移量。在任何其他情况下（表被重启或在某些错误后恢复），将使用存储在 ClickHouse Keeper 中的偏移量作为继续消费消息的偏移量。除了已提交的偏移量外，它还存储在最后一批中消耗了多少消息，因此如果插入失败，将消耗相同数量的消息，从而在必要时实现去重。

示例：

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/experimental_kafka',
  kafka_replica_name = 'r1'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

或者类似于 ReplicatedMergeTree 使用 `uuid` 和 `replica` 宏：

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### 已知限制 {#known-limitations}

由于新引擎是实验性的，尚未准备好投入生产。有一些已知的实现限制：
 - 最大的限制是引擎不支持直接读取。通过物化视图从引擎读取以及写入引擎的操作正常，但直接读取不起作用。因此，所有直接 `SELECT` 查询都会失败。
 - 快速删除和重新创建表或将相同的 ClickHouse Keeper 路径指定给不同引擎可能会导致问题。最佳做法是在 `kafka_keeper_path` 中使用 `{uuid}` 以避免路径冲突。
 - 为了进行可重复的读取，消息不能在单个线程上同时从多个分区中消费。另一方面，必须定期轮询 Kafka 消费者以保持其活跃。因此，由于这两个目标，我们决定仅当启用 `kafka_thread_per_consumer` 时才允许创建多个消费者，否则避免定期轮询消费者相关的问题变得过于复杂。
 - 新存储引擎创建的消费者不会出现在 [`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md) 表中。

**另请参见**

- [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
- [system.kafka_consumers](../../../operations/system-tables/kafka_consumers.md)
