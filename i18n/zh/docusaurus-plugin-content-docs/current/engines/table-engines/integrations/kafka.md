---
slug: /engines/table-engines/integrations/kafka
sidebar_position: 110
sidebar_label: Kafka
title: 'Kafka'
description: 'Kafka引擎与Apache Kafka协作，允许您发布或订阅数据流，组织故障容错存储，并处理可用的流。'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Kafka

<CloudNotSupportedBadge/>

:::note
建议ClickHouse Cloud用户使用[ClickPipes](/integrations/clickpipes)从Kafka流式传输数据到ClickHouse。这原生支持高性能插入，同时确保关注点分离，具备独立扩展数据摄取和集群资源的能力。
:::

此引擎与[Apache Kafka](http://kafka.apache.org/)协作。

Kafka允许您：

- 发布或订阅数据流。
- 组织故障容错存储。
- 处理可用的流。

## 创建表 {#creating-a-table}

``` sql
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

- `kafka_broker_list` — 以逗号分隔的代理列表（例如，`localhost:9092`）。
- `kafka_topic_list` — 一组Kafka主题。
- `kafka_group_name` — 一组Kafka消费者。每组分别跟踪读取边界。如果您不希望消息在集群中重复，建议在各处使用相同的组名称。
- `kafka_format` — 消息格式。采用与SQL `FORMAT` 函数相同的表示法，例如 `JSONEachRow`。更多信息请参见[Formats](../../../interfaces/formats.md)部分。

可选参数：

- `kafka_schema` — 如果格式要求模式定义，则必须使用此参数。例如，[Cap'n Proto](https://capnproto.org/)要求提供模式文件的路径和根`s schema.capnp:Message`对象的名称。
- `kafka_num_consumers` — 每个表的消费者数量。如果一个消费者的吞吐量不足，建议指定更多消费者。消费者总数不得超过主题中的分区数量，因为每个分区只能分配一个消费者，且不得超过ClickHouse部署所在服务器的物理内核数量。默认值：`1`。
- `kafka_max_block_size` — 对于轮询的最大批大小（以消息为单位）。默认值：[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `kafka_skip_broken_messages` — Kafka消息解析器对每个块的不兼容模式消息的容忍度。如果 `kafka_skip_broken_messages = N` ，则引擎将跳过*N*个无法解析的Kafka消息（消息等于一行数据）。默认值：`0`。
- `kafka_commit_every_batch` — 每处理一次消费批次就提交，而不是写入整个块后进行单次提交。默认值：`0`。
- `kafka_client_id` — 客户端标识符。默认值为空。
- `kafka_poll_timeout_ms` — 从Kafka进行单次轮询的超时时间。默认值：[stream_poll_timeout_ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
- `kafka_poll_max_batch_size` — 在单次Kafka轮询中可以轮询的最大消息数量。默认值：[max_block_size](/operations/settings/settings#max_block_size)。
- `kafka_flush_interval_ms` — 从Kafka冲洗数据的超时时间。默认值：[stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `kafka_thread_per_consumer` — 为每个消费者提供独立线程。当启用时，每个消费者独立并行冲洗数据（否则 — 来自多个消费者的行将被压缩成一个块）。默认值：`0`。
- `kafka_handle_error_mode` — 处理Kafka引擎错误的方式。可能的值：default（如果解析消息失败，将抛出异常），stream（异常消息和原始消息将保存在虚拟列`_error`和`_raw_message`中）。
- `kafka_commit_on_select` — 在执行查询时提交消息。默认值：`false`。
- `kafka_max_rows_per_message` — 对于基于行的格式，每条kafka消息中写入的最大行数。默认值：`1`。

示例：

``` sql
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

<summary>创建表的废弃方法</summary>

:::note
在新项目中请勿使用此方法。如可能，请将旧项目切换到上述描述的方法。
:::

``` sql
Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
      [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
```

</details>

:::info
Kafka表引擎不支持具有[默认值](/sql-reference/statements/create/table#default_values)的列。如果您需要具有默认值的列，可以在物化视图级别添加它们（见下文）。
:::

## 描述 {#description}

所交付的消息将被自动跟踪，因此每个组中的每条消息只计数一次。如果您想获取数据两次，则请创建一个复制的表，并使用不同的组名称。

组是灵活的，并在集群上同步。例如，如果您有10个主题和5个表副本在一个集群中，则每个副本获取2个主题。如果副本的数量发生变化，主题会自动在副本之间重新分配。关于此，您可以阅读http://kafka.apache.org/intro。

`SELECT`在读取消息时并不是特别有用（除了调试），因为每条消息只能读取一次。使用物化视图创建实时线程会更加实用。为此：

1. 使用该引擎创建Kafka消费者，并将其视为数据流。
2. 创建具有所需结构的表。
3. 创建物化视图，将引擎中的数据转换并放入之前创建的表中。

当`MATERIALIZED VIEW`连接到引擎时，它开始在后台收集数据。这使您能够不断接收来自Kafka的消息，并使用`SELECT`将它们转换为所需的格式。
一个kafka表可以有任意数量的物化视图，它们不会直接从kafka表读取数据，而是接收新的记录（以块的形式），这样您可以将数据写入多个具有不同详细级别的表（带分组 - 聚合和不带分组）。

示例：

``` sql
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
为了提高性能，接收到的消息被分组到大小为[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)的块中。如果在[stream_flush_interval_ms](/operations/settings/settings.md#stream_flush_interval_ms)毫秒内没有形成块，则数据将被冲洗到表中，而不管块的完整性。

要停止接收主题数据或更改转换逻辑，请分离物化视图：

``` sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

如果您想通过`ALTER`更改目标表，建议在更改目标表之前禁用物化视图，以避免目标表与视图中的数据之间的差异。

## 配置 {#configuration}

类似于GraphiteMergeTree，Kafka引擎支持使用ClickHouse配置文件进行扩展配置。您可以使用两个配置键：全局（在`<kafka>`下）和主题级别（在`<kafka><kafka_topic>`下）。全局配置首先应用，然后应用主题级别配置（如果存在）。

``` xml
  <kafka>
    <!-- Kafka引擎类型所有表的全局配置选项 -->
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

有关可能的配置选项列表，请参见[librdkafka配置参考](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)。在ClickHouse配置中使用下划线（`_`）代替点。例如，`check.crcs=true`将变为`<check_crcs>true</check_crcs>`。

### Kerberos支持 {#kafka-kerberos-support}

要处理支持Kerberos的Kafka，请添加带有`sasl_plaintext`值的`security_protocol`子元素。只需确保Kerberos票证授予票证由操作系统设施获取和缓存即可。
ClickHouse能够使用keytab文件维护Kerberos凭据。请考虑`sasl_kerberos_service_name`、`sasl_kerberos_keytab`和`sasl_kerberos_principal`子元素。

示例：

``` xml
  <!-- 支持Kerberos的Kafka -->
  <kafka>
    <security_protocol>SASL_PLAINTEXT</security_protocol>
	<sasl_kerberos_keytab>/home/kafkauser/kafkauser.keytab</sasl_kerberos_keytab>
	<sasl_kerberos_principal>kafkauser/kafkahost@EXAMPLE.COM</sasl_kerberos_principal>
  </kafka>
```

## 虚拟列 {#virtual-columns}

- `_topic` — Kafka主题。数据类型：`LowCardinality(String)`。
- `_key` — 消息的键。数据类型：`String`。
- `_offset` — 消息的偏移量。数据类型：`UInt64`。
- `_timestamp` — 消息的时间戳。数据类型：`Nullable(DateTime)`。
- `_timestamp_ms` — 消息的毫秒时间戳。数据类型：`Nullable(DateTime64(3))`。
- `_partition` — Kafka主题的分区。数据类型：`UInt64`。
- `_headers.name` — 消息头的键数组。数据类型：`Array(String)`。
- `_headers.value` — 消息头的值数组。数据类型：`Array(String)`。

当`kafka_handle_error_mode='stream'`时的附加虚拟列：

- `_raw_message` - 无法成功解析的原始消息。数据类型：`String`。
- `_error` - 解析失败期间发生的异常消息。数据类型：`String`。

注意：`_raw_message`和`_error`虚拟列仅在解析过程中出现异常时填充，当消息成功解析时，它们始终为空。

## 数据格式支持 {#data-formats-support}

Kafka引擎支持ClickHouse中支持的所有[格式](../../../interfaces/formats.md)。
一条Kafka消息中的行数取决于格式是基于行还是基于块：

- 对于基于行的格式，可以通过设置`kafka_max_rows_per_message`来控制一条Kafka消息中的行数。
- 对于基于块的格式，我们不能将块划分为更小的部分，但可以通过通用设置[max_block_size](/operations/settings/settings#max_block_size)来控制一个块中的行数。

## 在ClickHouse Keeper中存储已提交的偏移量的引擎 {#engine-to-store-committed-offsets-in-clickhouse-keeper}

<ExperimentalBadge/>

如果启用 `allow_experimental_kafka_offsets_storage_in_keeper`，则可以为Kafka表引擎指定两个额外的设置：
 - `kafka_keeper_path` 指定ClickHouse Keeper中表的路径
 - `kafka_replica_name` 指定ClickHouse Keeper中的副本名称

必须同时指定两个设置或都不指定。当同时指定两个时，将使用新的实验性Kafka引擎。这个新引擎不依赖于在Kafka中存储已提交的偏移量，而是将其存储在ClickHouse Keeper中。它仍然尝试将偏移量提交到Kafka，但仅在创建表时依赖于这些偏移量。在其他情况下（表重启，或在某个错误后恢复），将使用存储在ClickHouse Keeper中的偏移量作为继续消费消息的偏移量。除了已提交的偏移量外，它还存储在上一个批处理中的已消费消息数量。因此，如果插入失败，将消费相同数量的消息，从而在必要时实现去重。

示例：

``` sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/experimental_kafka',
  kafka_replica_name = 'r1'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

或使用`uuid`和`replica`宏，类似于ReplicatedMergeTree：

``` sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### 已知的限制 {#known-limitations}

由于新引擎是实验性的，目前尚未准备好生产使用。已知的实现限制有：
 - 最大的限制是该引擎不支持直接读取。使用物化视图读取该引擎并向该引擎写入是可行的，但直接读取不可行。因此，所有直接的`SELECT` 查询都将失败。
 - 快速删除和重新创建表或将相同的ClickHouse Keeper路径指定给不同的引擎，可能会导致问题。作为最佳实践，可以在`kafka_keeper_path`中使用`{uuid}`以避免路径冲突。
 - 若要进行可重复读取，消息不能从单个线程的多个分区中消费。另一方面，必须定期轮询Kafka消费者以保持其活跃。由于这两个目标，我们决定仅在启用`kafka_thread_per_consumer`时允许创建多个消费者，否则避免频繁轮询消费者方面的复杂性会太高。
 - 新存储引擎创建的消费者不会出现在[`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md)表中。

**另见**

- [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [background_message_broker_schedule_pool_size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
- [system.kafka_consumers](../../../operations/system-tables/kafka_consumers.md)
