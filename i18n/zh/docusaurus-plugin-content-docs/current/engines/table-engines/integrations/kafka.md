---
'description': 'Kafka 引擎与 Apache Kafka 一起工作，允许您发布或订阅数据流，组织容错存储，并处理数据流。'
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
建议 ClickHouse Cloud 用户使用 [ClickPipes](/integrations/clickpipes) 将 Kafka 数据流入 ClickHouse。它原生支持高性能插入，同时确保关注点分离，可以独立扩展数据摄取和集群资源。
:::

该引擎与 [Apache Kafka](http://kafka.apache.org/) 一起工作。

Kafka 让您能够：

- 发布或订阅数据流。
- 组织容错存储。
- 持续处理可用的流。

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

必需的参数：

- `kafka_broker_list` — 以逗号分隔的代理列表（例如，`localhost:9092`）。
- `kafka_topic_list` — Kafka 主题列表。
- `kafka_group_name` — Kafka 消费者组。每个组单独跟踪读取边界。如果您不希望消息在集群中重复，必须在所有地方使用相同的组名。
- `kafka_format` — 消息格式。采用与 SQL `FORMAT` 函数相同的标记法，例如 `JSONEachRow`。有关更多信息，请参见 [Formats](../../../interfaces/formats.md) 部分。

可选参数：

- `kafka_security_protocol` - 与代理通信所使用的协议。可能的值：`plaintext`、`ssl`、`sasl_plaintext`、`sasl_ssl`。
- `kafka_sasl_mechanism` - 用于身份验证的 SASL 机制。可能的值：`GSSAPI`、`PLAIN`、`SCRAM-SHA-256`、`SCRAM-SHA-512`、`OAUTHBEARER`。
- `kafka_sasl_username` - 用于 `PLAIN` 和 `SASL-SCRAM-..` 机制的 SASL 用户名。
- `kafka_sasl_password` - 用于 `PLAIN` 和 `SASL-SCRAM-..` 机制的 SASL 密码。
- `kafka_schema` — 如果格式要求模式定义，必须使用的参数。例如，[Cap'n Proto](https://capnproto.org/) 要求提供模式文件的路径和根 `schema.capnp:Message` 对象的名称。
- `kafka_num_consumers` — 每个表的消费者数量。如果单个消费者的吞吐量不足，请指定更多消费者。消费者的总数量不得超过主题中的分区数量，因为每个分区只能分配一个消费者，并且不得大于部署 ClickHouse 服务器上的物理核心数量。默认值：`1`。
- `kafka_max_block_size` — 获取的最大批量大小（以消息为单位）。默认值：[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `kafka_skip_broken_messages` — 对每个块的与模式不兼容的消息的 Kafka 消息解析器容忍度。如果 `kafka_skip_broken_messages = N`，则引擎跳过 *N* 条无法解析的 Kafka 消息（一条消息等于一行数据）。默认值：`0`。
- `kafka_commit_every_batch` — 每处理完一批数据后提交，而不是在写入整个块后进行单次提交。默认值：`0`。
- `kafka_client_id` — 客户端标识符。默认为空。
- `kafka_poll_timeout_ms` — 从 Kafka 进行单次轮询的超时。默认值：[stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
- `kafka_poll_max_batch_size` — 在单次 Kafka 轮询中要轮询的最大消息数。默认值：[max_block_size](/operations/settings/settings#max_block_size)。
- `kafka_flush_interval_ms` — 从 Kafka 刷新数据的超时。默认值：[stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `kafka_thread_per_consumer` — 为每个消费者提供独立线程。当启用时，每个消费者独立并行地刷新数据（否则 - 来自多个消费者的行被压缩成一个块）。默认值：`0`。
- `kafka_handle_error_mode` — 如何处理 Kafka 引擎的错误。可能的值：默认（如果解析消息失败将抛出异常），流（异常消息和原始消息将在虚拟列 `_error` 和 `_raw_message` 中保存）。
- `kafka_commit_on_select` — 当进行选择查询时提交消息。默认值：`false`。
- `kafka_max_rows_per_message` — 每个基于行的格式中写入的一条 kafka 消息的最大行数。默认值：`1`。

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
在新项目中不要使用此方法。如果可能，请将旧项目切换到上面描述的方法。
:::

```sql
Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
      [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
```

</details>

:::info
Kafka 表引擎不支持具有 [默认值](/sql-reference/statements/create/table#default_values) 的列。如果您需要具有默认值的列，可以在物化视图级别添加它们（见下文）。
:::

## 描述 {#description}

交付的消息会自动跟踪，因此每个组中的每条消息只计数一次。如果您想获取数据两次，则需要使用另一个组名创建表的副本。

组是灵活的并在集群中同步。例如，如果您有 10 个主题和 5 个表副本在集群中，则每个副本获得 2 个主题。如果副本数量发生变化，主题会自动在副本之间重新分配。请在 http://kafka.apache.org/intro 上阅读更多内容。

`SELECT` 对于读取消息并不是特别有用（除非用于调试），因为每条消息只能被读取一次。创建实时线程使用物化视图更为实用。要做到这一点：

1.  使用引擎创建 Kafka 消费者，并将其视为数据流。
2.  创建具有所需结构的表。
3.  创建一个物化视图，将来自引擎的数据转换并放入之前创建的表中。

当 `MATERIALIZED VIEW` 连接引擎时，它开始在后台收集数据。这使您能够不断接收来自 Kafka 的消息并使用 `SELECT` 将其转换为所需的格式。
一个 kafka 表可以有任意数量的物化视图，它们不会直接从 kafka 表读取数据，而是以块的形式接收新记录，这样您可以写入多个具有不同详细级别的表（使用分组 - 聚合和不使用）。

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
为了提高性能，接收的消息被分组为 [max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size) 大小的块。如果在 [stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms) 毫秒内没有形成块，则数据将被刷新到表中，而不考虑块的完整性。

要停止接收主题数据或更改转换逻辑，请分离物化视图：

```sql
DETACH TABLE consumer;
ATTACH TABLE consumer;
```

如果您希望通过 `ALTER` 更改目标表，建议禁用物化视图，以避免目标表和视图数据之间的不一致。

## 配置 {#configuration}

类似于 GraphiteMergeTree，Kafka 引擎支持使用 ClickHouse 配置文件的扩展配置。您可以使用两个配置键：全局（在 `<kafka>` 下面）和主题级（在 `<kafka><kafka_topic>` 下面）。全局配置首先应用，然后应用主题级配置（如果存在）。

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

有关可能的配置选项列表，请参见 [librdkafka 配置参考](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)。在 ClickHouse 配置中，使用下划线 (`_`) 替代点。例如，`check.crcs=true` 将变为 `<check_crcs>true</check_crcs>`。

### Kerberos支持 {#kafka-kerberos-support}

要处理支持 Kerberos 的 Kafka，请添加 `security_protocol` 子元素，值为 `sasl_plaintext`。只要 Kerberos 票证授权票据由操作系统设施获取并缓存即可。
ClickHouse 可以使用密钥表文件维护 Kerberos 凭证。考虑 `sasl_kerberos_service_name`、`sasl_kerberos_keytab` 和 `sasl_kerberos_principal` 子元素。

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

- `_topic` — Kafka 主题。数据类型： `LowCardinality(String)`。
- `_key` — 消息的键。数据类型： `String`。
- `_offset` — 消息的偏移量。数据类型： `UInt64`。
- `_timestamp` — 消息的时间戳。数据类型： `Nullable(DateTime)`。
- `_timestamp_ms` — 消息的时间戳（以毫秒为单位）。数据类型： `Nullable(DateTime64(3))`。
- `_partition` — Kafka 主题的分区。数据类型： `UInt64`。
- `_headers.name` — 消息头的键数组。数据类型： `Array(String)`。
- `_headers.value` — 消息头的值数组。数据类型： `Array(String)`。

当 `kafka_handle_error_mode='stream'` 时的附加虚拟列：

- `_raw_message` - 无法成功解析的原始消息。数据类型： `String`。
- `_error` - 解析失败期间发生的异常消息。数据类型： `String`。

注意：当解析成功时，虚拟列 `_raw_message` 和 `_error` 始终为空，仅在解析期间发生异常时填充。

## 数据格式支持 {#data-formats-support}

Kafka 引擎支持 ClickHouse 支持的所有 [格式](../../../interfaces/formats.md)。
一条 Kafka 消息中的行数取决于格式是行式还是块式：

- 对于行式格式，可以通过设置 `kafka_max_rows_per_message` 控制一条 Kafka 消息中的行数。
- 对于块式格式，我们无法将块拆分为更小的部分，但可以通过通用设置 [max_block_size](/operations/settings/settings#max_block_size) 控制一个块中的行数。

## 存储已提交偏移量的引擎在 ClickHouse Keeper 中 {#engine-to-store-committed-offsets-in-clickhouse-keeper}

<ExperimentalBadge/>

如果启用 `allow_experimental_kafka_offsets_storage_in_keeper`，则可以为 Kafka 表引擎指定另外两个设置：
 - `kafka_keeper_path` 指定 ClickHouse Keeper 中表的路径
 - `kafka_replica_name` 指定 ClickHouse Keeper 中的副本名

必须指定这两个设置中的全部或全无。当两个设置同时指定时，将使用一种新的实验性 Kafka 引擎。该新引擎不依赖于 Kafka 中存储已提交的偏移量，而是将其存储在 ClickHouse Keeper 中。它仍会尝试将偏移量提交到 Kafka，但仅在创建表时依赖这些偏移量。在其他情况下（表被重启或在某种错误后恢复时），将使用存储在 ClickHouse Keeper 中的偏移量作为继续消费消息的偏移量。除了已提交的偏移量外，它还存储了最后一批消费的消息数，因此如果插入失败，将消费相同数量的消息，从而在必要时启用去重。

示例：

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/experimental_kafka',
  kafka_replica_name = 'r1'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

或者利用 `uuid` 和 `replica` 宏，类似于 ReplicatedMergeTree：

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### 已知限制 {#known-limitations}

由于新引擎是实验性的，因此尚未准备好投入生产。该实现存在一些已知限制：
 - 最大的限制是引擎不支持直接读取。使用物化视图从引擎读取和写入到引擎工作正常，但直接读取不行。因此，所有直接的 `SELECT` 查询将失败。
 - 快速删除和重新创建表或将相同的 ClickHouse Keeper 路径指定给不同引擎可能导致问题。最佳实践是在 `kafka_keeper_path` 中使用 `{uuid}` 以避免路径冲突。
 - 为了确保可重复的读取，在单个线程中不能从多个分区消费消息。另一方面，需要定期轮询 Kafka 消费者以保持其活动。因此基于这两个目标，我们决定仅在启用 `kafka_thread_per_consumer` 的情况下允许创建多个消费者，否则对于定期轮询消费者难以避免问题。
 - 由新存储引擎创建的消费者不会出现在 [`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md) 表中。

**另请参阅**

- [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
- [system.kafka_consumers](../../../operations/system-tables/kafka_consumers.md)
