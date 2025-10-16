---
'description': 'Kafka 表引擎可以用于与 Apache Kafka 进行发布工作，并让你发布或订阅数据流，组织容错存储，并在流可用时处理它们。'
'sidebar_label': 'Kafka'
'sidebar_position': 110
'slug': '/engines/table-engines/integrations/kafka'
'title': 'Kafka 表引擎'
'keywords':
- 'Kafka'
- 'table engine'
'doc_type': 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Kafka 表引擎

:::note
如果您正在使用 ClickHouse Cloud，我们建议使用 [ClickPipes](/integrations/clickpipes)。ClickPipes 原生支持私有网络连接，独立扩展摄取和集群资源，并对流式 Kafka 数据流入 ClickHouse 进行全面监控。
:::

- 发布或订阅数据流。
- 组织容错存储。
- 持续处理可用的数据流。

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

必填参数：

- `kafka_broker_list` — 逗号分隔的代理列表（例如，`localhost:9092`）。
- `kafka_topic_list` — Kafka 主题列表。
- `kafka_group_name` — Kafka 消费者组。每个组的读取边界分别跟踪。如果您不希望消息在集群中重复，需在各处使用相同的组名。
- `kafka_format` — 消息格式。使用与 SQL `FORMAT` 函数相同的符号，例如 `JSONEachRow`。有关更多信息，请参见 [Formats](../../../interfaces/formats.md) 部分。

可选参数：

- `kafka_security_protocol` - 与代理通信所用的协议。可选值：`plaintext`、`ssl`、`sasl_plaintext`、`sasl_ssl`。
- `kafka_sasl_mechanism` - 用于身份验证的 SASL 机制。可选值：`GSSAPI`、`PLAIN`、`SCRAM-SHA-256`、`SCRAM-SHA-512`、`OAUTHBEARER`。
- `kafka_sasl_username` - 用于 `PLAIN` 和 `SASL-SCRAM-..` 机制的 SASL 用户名。
- `kafka_sasl_password` - 用于 `PLAIN` 和 `SASL-SCRAM-..` 机制的 SASL 密码。
- `kafka_schema` — 如果格式需要架构定义，此参数必须使用。例如， [Cap'n Proto](https://capnproto.org/) 需要架构文件的路径和根 `schema.capnp:Message` 对象的名称。
- `kafka_num_consumers` — 每个表的消费者数量。如果一个消费者的吞吐量不足，请指定更多消费者。消费者的总数不得超过主题中的分区数，因为每个分区只能分配一个消费者，并且不得超过部署 ClickHouse 的服务器上的物理核心数。默认：`1`。
- `kafka_max_block_size` — 轮询的最大批量大小（以消息为单位）。默认值：[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `kafka_skip_broken_messages` — Kafka 消息解析器对每个块中架构不兼容消息的容忍度。如果 `kafka_skip_broken_messages = N`，则引擎会跳过 *N* 个无法解析的 Kafka 消息（消息等于一行数据）。默认值：`0`。
- `kafka_commit_every_batch` — 在写入整个块后，而不是每次提交时提交每个已消费和处理的批次。默认值：`0`。
- `kafka_client_id` — 客户端标识符。默认为空。
- `kafka_poll_timeout_ms` — 从 Kafka 进行单次轮询的超时时间。默认值：[stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
- `kafka_poll_max_batch_size` — 单次 Kafka 轮询中可以轮询的最大消息数。默认值：[max_block_size](/operations/settings/settings#max_block_size)。
- `kafka_flush_interval_ms` — 从 Kafka 刷新数据的超时时间。默认值：[stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `kafka_thread_per_consumer` — 为每个消费者提供独立的线程。当启用时，每个消费者独立并行刷新数据（否则——来自多个消费者的行合并为一个块）。默认：`0`。
- `kafka_handle_error_mode` — 处理 Kafka 引擎错误的方式。可能的值：default（如果解析消息失败，则抛出异常）、stream（异常消息和原始消息将保存在虚拟列 `_error` 和 `_raw_message` 中）、dead_letter_queue（与错误相关的数据将保存在 system.dead_letter_queue 中）。
- `kafka_commit_on_select` — 在进行选择查询时提交消息。默认值：`false`。
- `kafka_max_rows_per_message` — 以基于行的格式写入一条 kafka 消息的最大行数。默认：`1`。

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
请勿在新项目中使用此方法。如果可能，请将旧项目切换到上述方法。
:::

```sql
Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
      [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
```

</details>

:::info
Kafka 表引擎不支持具有 [default value](/sql-reference/statements/create/table#default_values) 的列。如果您需要具有默认值的列，可以在物化视图级别添加它们（见下文）。
:::

## 描述 {#description}

已交付的消息会自动被跟踪，因此组中的每条消息仅计数一次。如果想要获取数据两次，则需使用另一个组名创建表的副本。

组是灵活的，并且在集群中同步。例如，如果您有 10 个主题和 5 个表副本，则每个副本会获取 2 个主题。如果副本数量发生变化，主题会自动在副本之间重新分配。在此查阅更多信息 http://kafka.apache.org/intro。

建议每个 Kafka 主题都有其专用的消费者组，确保主题与组之间的独占配对，尤其是在主题可能动态创建和删除的环境（例如，测试或暂存环境）。

`SELECT` 在读取消息时并不是特别有用（除了调试），因为每条消息只能读取一次。使用物化视图创建实时线程更加实用。要做到这一点：

1. 将引擎用于创建 Kafka 消费者，并将其视为数据流。
2. 创建具有所需结构的表。
3. 创建物化视图，将引擎中的数据转换并放入先前创建的表中。

当 `MATERIALIZED VIEW` 连接引擎时，它会在后台开始收集数据。这使您能够不断接收来自 Kafka 的消息，并使用 `SELECT` 将其转换为所需格式。
一个 Kafka 表可以有任意数量的物化视图，它们并不直接从 Kafka 表中读取数据，而是接收新的记录（以块的形式），这样您可以将数据写入多个表，并具有不同的详细级别（有聚合和无聚合）。

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
为了提高性能，接收到的消息被分组为 [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size) 大小的块。如果在 [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms) 毫秒内未形成块，则数据将被刷新到表中，而不管块的完整性。

要停止接收主题数据或更改转换逻辑，请分离物化视图：

```sql
DETACH TABLE consumer;
ATTACH TABLE consumer;
```

如果要使用 `ALTER` 更改目标表，建议先禁用物化视图，以避免目标表与视图数据之间的不一致。

## 配置 {#configuration}

与 GraphiteMergeTree 类似，Kafka 引擎支持使用 ClickHouse 配置文件进行扩展配置。您可以使用两个配置键：全局（在 `<kafka>` 之下）和主题级（在 `<kafka><kafka_topic>` 之下）。全局配置首先应用，然后应用主题级配置（如果存在）。

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

有关可能的配置选项列表，请参见 [librdkafka 配置参考](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)。在 ClickHouse 配置中使用下划线（`_`）代替点。例如，`check.crcs=true` 将变为 `<check_crcs>true</check_crcs>`。

### Kerberos 支持 {#kafka-kerberos-support}

要处理支持 Kerberos 的 Kafka，请添加 `security_protocol` 子元素，其值为 `sasl_plaintext`。只需通过操作系统功能获得并缓存 Kerberos Ticket Granting Ticket 即可。
ClickHouse 能够使用 keytab 文件维护 Kerberos 凭据。请考虑 `sasl_kerberos_service_name`、`sasl_kerberos_keytab` 和 `sasl_kerberos_principal` 子元素。

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
- `_timestamp_ms` — 消息的毫秒级时间戳。数据类型：`Nullable(DateTime64(3))`。
- `_partition` — Kafka 主题的分区。数据类型：`UInt64`。
- `_headers.name` — 消息的头部键的数组。数据类型：`Array(String)`。
- `_headers.value` — 消息的头部值的数组。数据类型：`Array(String)`。

当 `kafka_handle_error_mode='stream'` 时的附加虚拟列：

- `_raw_message` - 无法成功解析的原始消息。数据类型：`String`。
- `_error` - 解析失败时发生的异常消息。数据类型：`String`。

注意：只有在解析期间发生异常时，`_raw_message` 和 `_error` 虚拟列才会被填充，当消息成功解析时它们始终为空。

## 数据格式支持 {#data-formats-support}

Kafka 引擎支持 ClickHouse 中支持的所有 [格式](../../../interfaces/formats.md)。
一条 Kafka 消息中的行数取决于格式是基于行还是基于块：

- 对于基于行的格式，可以通过设置 `kafka_max_rows_per_message` 来控制一条 Kafka 消息中的行数。
- 对于基于块的格式，我们无法将块划分为更小的部分，但可以通过通用设置 [max_block_size](/operations/settings/settings#max_block_size) 来控制一个块中的行数。

## 存储已提交偏移量到 ClickHouse Keeper 的引擎 {#engine-to-store-committed-offsets-in-clickhouse-keeper}

<ExperimentalBadge/>

如果启用了 `allow_experimental_kafka_offsets_storage_in_keeper`，则可以向 Kafka 表引擎指定两个设置：
- `kafka_keeper_path` 指定 ClickHouse Keeper 中表的路径
- `kafka_replica_name` 指定 ClickHouse Keeper 中的副本名称

这两个设置必须同时指定或都不指定。当同时指定时，将使用新的实验性 Kafka 引擎。该新引擎不依赖于在 Kafka 中存储已提交的偏移量，而是将其存储在 ClickHouse Keeper 中。它仍然会尝试将偏移量提交到 Kafka，但在创建表时仅依赖这些偏移量。在其他情况下（如表重启或恢复后发生错误），将使用存储在 ClickHouse Keeper 中的偏移量作为继续消费消息的偏移量。除了已提交的偏移量外，它还存储最后一批中消耗的消息数量，因此如果插入失败，仍将消耗相同数量的消息，从而在必要时实现去重。

示例：

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### 已知限制 {#known-limitations}

由于新引擎是实验性的，因此尚未准备好投入生产。实现有几项已知限制：
- 最大的限制是引擎不支持直接读取。使用物化视图从引擎读取和向引擎写入可以正常工作，但直接读取不支持。因此，所有直接的 `SELECT` 查询都会失败。
- 快速删除和重新创建表，或将相同的 ClickHouse Keeper 路径指定给不同的引擎，可能导致问题。作为最佳实践，您可以在 `kafka_keeper_path` 中使用 `{uuid}` 来避免路径冲突。
- 为了实现可重复读取，消息不能在单个线程上从多个分区中消费。另一方面，Kafka 消费者必须定期轮询以保持活动。因此，我们决定仅在启用 `kafka_thread_per_consumer` 时允许创建多个消费者，否则避免定期轮询消费者的问题就会太复杂。
- 新存储引擎创建的消费者不会出现在 [`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md) 表中。

**另见**

- [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
- [system.kafka_consumers](../../../operations/system-tables/kafka_consumers.md)
