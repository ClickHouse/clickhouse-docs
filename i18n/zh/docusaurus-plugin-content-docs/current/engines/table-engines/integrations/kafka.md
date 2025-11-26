---
description: 'Kafka 表引擎可用于与 Apache Kafka 集成，允许发布或订阅数据流、构建容错存储，并在数据流可用时对其进行处理。'
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
如果您使用 ClickHouse Cloud，我们建议改用 [ClickPipes](/integrations/clickpipes)。ClickPipes 原生支持私有网络连接，可分别扩展摄取与集群资源，并为将 Kafka 流式数据摄取到 ClickHouse 提供完善的监控能力。
:::

- 发布或订阅数据流。
- 构建容错存储。
- 在数据流到达时进行处理。



## 创建数据表

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

Required parameters:
必选参数：

* `kafka_broker_list` — 以逗号分隔的 broker 列表（例如 `localhost:9092`）。
* `kafka_topic_list` — Kafka 主题列表。
* `kafka_group_name` — Kafka 消费者组。每个消费者组的读取偏移量会被单独跟踪。如果你不希望消息在集群中被重复处理，请在所有消费者中使用相同的组名。
* `kafka_format` — 消息格式。使用与 SQL `FORMAT` 函数相同的表示方式，例如 `JSONEachRow`。更多信息参见 [Formats](../../../interfaces/formats.md) 部分。

Optional parameters:
可选参数：


* `kafka_security_protocol` - 与 broker 通信所使用的协议。可选值：`plaintext`、`ssl`、`sasl_plaintext`、`sasl_ssl`。
* `kafka_sasl_mechanism` - 用于认证的 SASL 机制。可选值：`GSSAPI`、`PLAIN`、`SCRAM-SHA-256`、`SCRAM-SHA-512`、`OAUTHBEARER`。
* `kafka_sasl_username` - 使用 `PLAIN` 和 `SASL-SCRAM-..` 机制时的 SASL 用户名。
* `kafka_sasl_password` - 使用 `PLAIN` 和 `SASL-SCRAM-..` 机制时的 SASL 密码。
* `kafka_schema` — 当格式需要 schema 定义时必须使用的参数。例如，[Cap&#39;n Proto](https://capnproto.org/) 需要提供到 schema 文件的路径以及根 `schema.capnp:Message` 对象的名称。
* `kafka_schema_registry_skip_bytes` — 使用带有 envelope header 的 schema registry（例如包含 19 字节 envelope 的 AWS Glue Schema Registry）时，从每条消息开头跳过的字节数。范围：`[0, 255]`。默认值：`0`。
* `kafka_num_consumers` — 每个表的 consumer 数量。如果单个 consumer 的吞吐量不足，请配置更多的 consumer。consumer 总数不应超过 topic 中的分区数量，因为每个分区只能分配给一个 consumer，并且不得大于部署 ClickHouse 的服务器上的物理 CPU 核心数。默认值：`1`。
* `kafka_max_block_size` — 单次 poll 的最大片大小（按消息数计）。默认值：[max&#95;insert&#95;block&#95;size](../../../operations/settings/settings.md#max_insert_block_size)。
* `kafka_skip_broken_messages` — Kafka 消息解析器对每个 block 中与 schema 不兼容消息的容忍度。如果 `kafka_skip_broken_messages = N`，则引擎会跳过 *N* 条无法解析的 Kafka 消息（一条消息等于一行数据）。默认值：`0`。
* `kafka_commit_every_batch` — 对每个已消费并处理的 batch 单独提交，而不是在写入整个 block 后只进行一次提交。默认值：`0`。
* `kafka_client_id` — 客户端标识符。默认为空。
* `kafka_poll_timeout_ms` — 从 Kafka 进行单次 poll 的超时时间。默认值：[stream&#95;poll&#95;timeout&#95;ms](../../../operations/settings/settings.md#stream_poll_timeout_ms)。
* `kafka_poll_max_batch_size` — 单次 Kafka poll 可获取的最大消息数量。默认值：[max&#95;block&#95;size](/operations/settings/settings#max_block_size)。
* `kafka_flush_interval_ms` — 从 Kafka 刷新（flush）数据的超时时间。默认值：[stream&#95;flush&#95;interval&#95;ms](/operations/settings/settings#stream_flush_interval_ms)。
* `kafka_thread_per_consumer` — 为每个 consumer 提供独立线程。启用时，每个 consumer 会独立并行刷新数据（否则来自多个 consumer 的行会被压缩合并成一个 block）。默认值：`0`。
* `kafka_handle_error_mode` — Kafka 引擎的错误处理方式。可选值：`default`（如果解析消息失败，将抛出异常）、`stream`（异常信息和原始消息将保存在虚拟列 `_error` 和 `_raw_message` 中）、`dead&#95;letter&#95;queue`（与错误相关的数据将保存在 `system.dead&#95;letter&#95;queue` 中）。
* `kafka_commit_on_select` — 在执行 select 查询时提交消息。默认值：`false`。
* `kafka_max_rows_per_message` — 对于基于行的格式，在一条 kafka 消息中写入的最大行数。默认值：`1`。
* `kafka_compression_codec` — 用于生成消息的压缩编解码器。支持：空字符串、`none`、`gzip`、`snappy`、`lz4`、`zstd`。当为空字符串时，表不会设置压缩编解码器，因此会使用配置文件中的值或 `librdkafka` 的默认值。默认值：空字符串。
* `kafka_compression_level` — 由 `kafka_compression_codec` 选择的算法所使用的压缩级别参数。数值越高压缩效果越好，但会消耗更多 CPU。可用范围取决于算法：`gzip` 为 `[0-9]`；`lz4` 为 `[0-12]`；`snappy` 只能为 `0`；`zstd` 为 `[0-12]`；`-1` 表示使用该编解码器的默认压缩级别。默认值：`-1`。

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

<summary>已弃用的建表方法</summary>

:::note
请勿在新项目中使用此方法。如有可能,请将旧项目切换至上述方法。
:::

```sql
Kafka(kafka_broker_list, kafka_topic_list, kafka_group_name, kafka_format
      [, kafka_row_delimiter, kafka_schema, kafka_num_consumers, kafka_max_block_size,  kafka_skip_broken_messages, kafka_commit_every_batch, kafka_client_id, kafka_poll_timeout_ms, kafka_poll_max_batch_size, kafka_flush_interval_ms, kafka_thread_per_consumer, kafka_handle_error_mode, kafka_commit_on_select, kafka_max_rows_per_message]);
````

</details>

:::info
Kafka 表引擎不支持带有[默认值](/sql-reference/statements/create/table#default_values)的列。如需使用带有默认值的列,可在物化视图层级添加(见下文)。
:::


## 描述

已投递的消息会被自动跟踪，因此同一 group 中的每条消息只会被计数一次。若希望获取两遍数据，可以创建一个具有不同 group 名称的表副本。

Group 具有较高的灵活性，并且会在集群中同步。例如，如果在一个集群中有 10 个 topic 和 5 个表副本，则每个副本会分配到 2 个 topic。如果副本数量发生变化，topic 会在这些副本之间自动重新分配。更多信息参见 [http://kafka.apache.org/intro](http://kafka.apache.org/intro)。

推荐为每个 Kafka topic 分配一个独立的 consumer group，使 topic 与 group 之间形成一对一的专属关系，尤其是在 topic 可能被动态创建和删除的环境中（例如测试或预发布环境）。

`SELECT` 并不特别适合用来读取消息（除调试场景外），因为每条消息只能被读取一次。在实践中，更合理的方式是使用物化视图创建实时处理流程。具体步骤如下：

1. 使用该引擎创建一个 Kafka consumer，并将其视为一个数据流。
2. 创建一个具有所需结构的表。
3. 创建一个物化视图，将来自该引擎的数据转换后写入前面创建的表中。

当 `MATERIALIZED VIEW` 与该引擎关联时，它会在后台开始收集数据。这样就可以持续地从 Kafka 接收消息，并使用 `SELECT` 将其转换为所需的格式。
一个 Kafka 表可以拥有任意数量的物化视图，它们并不会直接从 Kafka 表中读取数据，而是接收新的记录（按块接收），通过这种方式，可以将数据写入多个具有不同明细层级的表（带分组聚合的和不带分组聚合的）。

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

为了提高性能，接收到的消息会被分组为大小为 [max&#95;insert&#95;block&#95;size](../../../operations/settings/settings.md#max_insert_block_size) 的数据块。如果在 [stream&#95;flush&#95;interval&#95;ms](/operations/settings/settings#stream_flush_interval_ms) 毫秒内未能形成一个数据块，则无论该数据块是否完整，数据都会被刷写到表中。

若要停止接收某个 topic 的数据或更改转换逻辑，请分离该物化视图：

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

如果要使用 `ALTER` 修改目标表，建议先禁用该物化视图，以避免目标表与视图产生的数据之间出现不一致。


## 配置

与 GraphiteMergeTree 类似，Kafka 引擎支持通过 ClickHouse 配置文件进行扩展配置。你可以使用两个配置键：全局级（位于 `<kafka>` 下）和主题级（位于 `<kafka><kafka_topic>` 下）。系统会先应用全局配置，然后再应用主题级配置（如果存在）。

```xml
  <kafka>
    <!-- Kafka 引擎类型所有表的全局配置选项 -->
    <debug>cgrp</debug>
    <statistics_interval_ms>3000</statistics_interval_ms>

    <kafka_topic>
        <name>logs</name>
        <statistics_interval_ms>4000</statistics_interval_ms>
    </kafka_topic>

    <!-- 消费者配置 -->
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

    <!-- 生产者配置 -->
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

有关可用配置选项的列表，请参阅 [librdkafka 配置参考文档](https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md)。在 ClickHouse 配置中请使用下划线（`_`）而不是点（`.`）。例如，`check.crcs=true` 将对应 `<check_crcs>true</check_crcs>`。

### Kerberos 支持

要与支持 Kerberos 的 Kafka 通信，请添加取值为 `sasl_plaintext` 的 `security_protocol` 子元素。只要通过操作系统机制获取并缓存了 Kerberos 票据授予票据（ticket‑granting ticket，TGT），即可满足要求。
ClickHouse 能够使用 keytab 文件维护 Kerberos 凭据。请考虑使用 `sasl_kerberos_service_name`、`sasl_kerberos_keytab` 和 `sasl_kerberos_principal` 子元素。

示例：

```xml
<!-- 启用 Kerberos 的 Kafka -->
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
- `_headers.name` — 消息头键名数组。数据类型：`Array(String)`。
- `_headers.value` — 消息头键值数组。数据类型：`Array(String)`。

当 `kafka_handle_error_mode='stream'` 时的附加虚拟列：

- `_raw_message` — 无法成功解析的原始消息。数据类型：`String`。
- `_error` — 解析失败期间产生的异常信息。数据类型：`String`。

注意：仅在解析过程中发生异常时，`_raw_message` 和 `_error` 虚拟列才会被填充；当消息成功解析时，这两列始终为空。



## 数据格式支持 {#data-formats-support}

Kafka 引擎支持 ClickHouse 所支持的所有[格式](../../../interfaces/formats.md)。
单个 Kafka 消息中的行数取决于所用格式是行格式还是块格式：

- 对于行格式，可以通过设置 `kafka_max_rows_per_message` 来控制一条 Kafka 消息中的行数。
- 对于块格式，我们无法将块拆分成更小的部分，但可以通过通用设置 [max_block_size](/operations/settings/settings#max_block_size) 来控制单个块中的行数。



## 用于在 ClickHouse Keeper 中存储已提交 offset 的引擎

<ExperimentalBadge />

如果启用了 `allow_experimental_kafka_offsets_storage_in_keeper`，则可以为 Kafka 表引擎额外指定两个参数：

* `kafka_keeper_path` 指定在 ClickHouse Keeper 中的表路径
* `kafka_replica_name` 指定在 ClickHouse Keeper 中的副本名称

这两个参数要么同时指定，要么都不指定。当二者都被指定时，将使用新的实验性 Kafka 引擎。这个新引擎不再依赖将已提交的 offset 存储在 Kafka 中，而是将其存储在 ClickHouse Keeper 中。它仍然会尝试将 offset 提交到 Kafka，但只在创建表时依赖这些 offset。在其他情况下（例如表重启，或从某些错误中恢复时），会使用存储在 ClickHouse Keeper 中的 offset 作为继续消费消息的起始 offset。除了已提交的 offset 之外，它还会记录上一批中消费的消息数量，因此如果插入失败，将会再次消费相同数量的消息，从而在需要时实现去重。

示例：

```sql
CREATE TABLE experimental_kafka (key UInt64, value UInt64)
ENGINE = Kafka('localhost:19092', 'my-topic', 'my-consumer', 'JSONEachRow')
SETTINGS
  kafka_keeper_path = '/clickhouse/{database}/{uuid}',
  kafka_replica_name = '{replica}'
SETTINGS allow_experimental_kafka_offsets_storage_in_keeper=1;
```

### 已知限制

由于新引擎仍处于实验阶段，目前尚未准备好用于生产环境。当前实现存在一些已知限制：

* 最大的限制是该引擎不支持直接读取。通过物化视图从引擎中读取以及向引擎写入是可行的，但不支持直接读取。因此，所有直接的 `SELECT` 查询都会失败。
* 频繁地删除并重新创建表，或者为不同的引擎指定相同的 ClickHouse Keeper 路径，可能会导致问题。作为最佳实践，可以在 `kafka_keeper_path` 中使用 `{uuid}` 来避免路径冲突。
* 为了实现可重复读，消息不能在单个线程上从多个分区消费。另一方面，必须定期轮询 Kafka 消费者以保持其存活。基于这两个目标，我们决定仅在启用 `kafka_thread_per_consumer` 时才允许创建多个消费者，否则在避免与定期轮询消费者相关的问题时会过于复杂。
* 由新存储引擎创建的消费者不会出现在 [`system.kafka_consumers`](../../../operations/system-tables/kafka_consumers.md) 表中。

**另请参阅**

* [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns)
* [background&#95;message&#95;broker&#95;schedule&#95;pool&#95;size](/operations/server-configuration-parameters/settings#background_message_broker_schedule_pool_size)
* [system.kafka&#95;consumers](../../../operations/system-tables/kafka_consumers.md)
