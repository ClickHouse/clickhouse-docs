---
description: '此引擎用于将 ClickHouse 与 NATS 集成，可发布或订阅消息主题（subject），并在有新消息时进行处理。'
sidebar_label: 'NATS'
sidebar_position: 140
slug: /engines/table-engines/integrations/nats
title: 'NATS 表引擎'
doc_type: 'guide'
---

# NATS 表引擎 {#redisstreams-engine}

此引擎用于将 ClickHouse 与 [NATS](https://nats.io/) 集成。

`NATS` 可以让您：

- 发布或订阅消息主题。
- 在有新消息时进行处理。

## 创建表 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = NATS SETTINGS
    nats_url = 'host:port',
    nats_subjects = 'subject1,subject2,...',
    nats_format = 'data_format'[,]
    [nats_schema = '',]
    [nats_num_consumers = N,]
    [nats_queue_group = 'group_name',]
    [nats_secure = false,]
    [nats_max_reconnect = N,]
    [nats_reconnect_wait = N,]
    [nats_server_list = 'host1:port1,host2:port2,...',]
    [nats_skip_broken_messages = N,]
    [nats_max_block_size = N,]
    [nats_flush_interval_ms = N,]
    [nats_username = 'user',]
    [nats_password = 'password',]
    [nats_token = 'clickhouse',]
    [nats_credential_file = '/var/nats_credentials',]
    [nats_startup_connect_tries = '5']
    [nats_max_rows_per_message = 1,]
    [nats_handle_error_mode = 'default']
```

必需参数：

* `nats_url` – 主机:端口（例如，`localhost:5672`）。
* `nats_subjects` – NATS 表要订阅/发布的 subject 列表。支持通配符 subject，例如 `foo.*.bar` 或 `baz.>`。
* `nats_format` – 消息格式。使用与 SQL `FORMAT` 函数相同的表示法，例如 `JSONEachRow`。有关更多信息，请参阅 [Formats](../../../interfaces/formats.md) 部分。

可选参数：

* `nats_schema` – 当格式需要 schema 定义时必须使用的参数。例如，[Cap&#39;n Proto](https://capnproto.org/) 需要提供 schema 文件路径以及根 `schema.capnp:Message` 对象的名称。
* `nats_stream` – NATS JetStream 中已存在的 stream 名称。
* `nats_consumer` – NATS JetStream 中已存在的持久拉取 consumer 名称。
* `nats_num_consumers` – 每个表的 consumer 数量。默认值：`1`。如果单个 consumer 的吞吐量不足，可为 NATS core 指定更多的 consumers。
* `nats_queue_group` – NATS 订阅者队列组名称。默认是表名。
* `nats_max_reconnect` – 已弃用且无效果，重连会始终按照 `nats_reconnect_wait` 超时时间执行。
* `nats_reconnect_wait` – 每次重连尝试之间休眠的时间（毫秒）。默认值：`5000`。
* `nats_server_list` - 用于连接的服务器列表。可用于连接到 NATS 集群。
* `nats_skip_broken_messages` - NATS 消息解析器对每个数据块中与 schema 不兼容消息的容忍数量。默认值：`0`。如果 `nats_skip_broken_messages = N`，则引擎会跳过 *N* 条无法解析的 NATS 消息（每条消息等于一行数据）。
* `nats_max_block_size` - 为从 NATS 刷写数据而通过轮询收集的行数。默认值：[max&#95;insert&#95;block&#95;size](../../../operations/settings/settings.md#max_insert_block_size)。
* `nats_flush_interval_ms` - 刷写从 NATS 读取数据的超时时间。默认值：[stream&#95;flush&#95;interval&#95;ms](/operations/settings/settings#stream_flush_interval_ms)。
* `nats_username` - NATS 用户名。
* `nats_password` - NATS 密码。
* `nats_token` - NATS 认证 token。
* `nats_credential_file` - NATS 凭证文件路径。
* `nats_startup_connect_tries` - 启动时的连接尝试次数。默认值：`5`。
* `nats_max_rows_per_message` — 基于行的格式时，单条 NATS 消息中写入的最大行数（默认值：`1`）。
* `nats_handle_error_mode` — NATS 引擎的错误处理方式。可选值：default（解析消息失败则抛出异常），stream（会将异常消息和原始消息保存在虚拟列 `_error` 和 `_raw_message` 中）。

SSL 连接：

要使用安全连接，请设置 `nats_secure = 1`。
所用库的默认行为是不检查所创建的 TLS 连接是否足够安全。无论证书是否过期、自签名、缺失或无效，连接都会照样被允许。将来可能会实现对证书更严格的检查。

向 NATS 表写入数据：

如果表只从一个 subject 读取数据，则任何插入都会发布到同一个 subject。
但是，如果表从多个 subject 读取数据，我们就需要指定要发布到哪个 subject。
因此，当向具有多个 subject 的表中插入数据时，需要设置 `stream_like_engine_insert_queue`。
你可以选择该表读取的某一个 subject，并将数据发布到那里。例如：

```sql
  CREATE TABLE queue (
    key UInt64,
    value UInt64
  ) ENGINE = NATS
    SETTINGS nats_url = 'localhost:4444',
             nats_subjects = 'subject1,subject2',
             nats_format = 'JSONEachRow';

  INSERT INTO queue
  SETTINGS stream_like_engine_insert_queue = 'subject2'
  VALUES (1, 1);
```

此外，可以与 NATS 相关设置一起添加格式设置。

示例：

```sql
  CREATE TABLE queue (
    key UInt64,
    value UInt64,
    date DateTime
  ) ENGINE = NATS
    SETTINGS nats_url = 'localhost:4444',
             nats_subjects = 'subject1',
             nats_format = 'JSONEachRow',
             date_time_input_format = 'best_effort';
```

可以在 ClickHouse 配置文件中添加 NATS 服务器配置。
更具体地说，可以为 NATS 引擎添加 Redis 密码：

```xml
<nats>
    <user>click</user>
    <password>house</password>
    <token>clickhouse</token>
</nats>
```

## 描述 {#description}

`SELECT` 对于读取消息（除调试用途外）并不是特别有用，因为每条消息只能被读取一次。更实用的方式是使用[物化视图](../../../sql-reference/statements/create/view.md)来创建实时处理流水线。为此，您需要：

1. 使用该引擎创建一个 NATS consumer，并将其视为数据流。
2. 创建一个具有所需结构的表。
3. 创建一个物化视图，将来自引擎的数据转换后写入前面创建的表中。

当 `MATERIALIZED VIEW` 连接到该引擎后，它会在后台开始收集数据。这样您就可以持续地从 NATS 接收消息，并使用 `SELECT` 将其转换为所需格式。
一个 NATS 表可以拥有任意数量的物化视图，它们不会直接从表中读取数据，而是接收新的记录（按块接收）。通过这种方式，您可以同时向多个具有不同明细级别的表写入数据（带分组聚合或不带分组聚合）。

示例：

```sql
  CREATE TABLE queue (
    key UInt64,
    value UInt64
  ) ENGINE = NATS
    SETTINGS nats_url = 'localhost:4444',
             nats_subjects = 'subject1',
             nats_format = 'JSONEachRow',
             date_time_input_format = 'best_effort';

  CREATE TABLE daily (key UInt64, value UInt64)
    ENGINE = MergeTree() ORDER BY key;

  CREATE MATERIALIZED VIEW consumer TO daily
    AS SELECT key, value FROM queue;

  SELECT key, value FROM daily ORDER BY key;
```

要停止接收流式数据或更改转换逻辑，请分离该物化视图：

```sql
  DETACH TABLE consumer;
  ATTACH TABLE consumer;
```

如果你想通过 `ALTER` 更改目标表，建议先禁用该物化视图，以避免目标表与视图数据之间出现不一致。

## 虚拟列 {#virtual-columns}

- `_subject` - NATS 消息的主题。数据类型：`String`。

当 `nats_handle_error_mode='stream'` 时的附加虚拟列：

- `_raw_message` - 无法成功解析的原始消息。数据类型：`Nullable(String)`。
- `_error` - 解析失败时产生的异常信息。数据类型：`Nullable(String)`。

注意：仅在解析过程中发生异常时，`_raw_message` 和 `_error` 虚拟列才会被写入；当消息成功解析时，它们始终为 `NULL`。

## 数据格式支持 {#data-formats-support}

NATS 引擎支持 ClickHouse 所支持的所有[格式](../../../interfaces/formats.md)。
一条 NATS 消息中的行数取决于所使用的格式是基于行还是基于块：

- 对于基于行的格式，可以通过设置 `nats_max_rows_per_message` 来控制一条 NATS 消息中的行数。
- 对于基于块的格式，我们无法将一个块拆分为更小的部分，但可以通过全局设置 [max_block_size](/operations/settings/settings#max_block_size) 来控制一个块中的行数。

## 使用 JetStream {#using-jetstream}

在将 NATS 引擎与 NATS JetStream 配合使用之前，必须先创建一个 NATS 流（stream）和一个持久拉取型消费者（durable pull consumer）。为此，可以使用 [NATS CLI](https://github.com/nats-io/natscli) 包中的 `nats` 工具，例如：

<details>
  <summary>创建流（stream）</summary>

  ```bash
  $ nats stream add
  ? Stream Name stream_name
  ? Subjects stream_subject
  ? Storage file
  ? Replication 1
  ? Retention Policy Limits
  ? Discard Policy Old
  ? Stream Messages Limit -1
  ? Per Subject Messages Limit -1
  ? Total Stream Size -1
  ? Message TTL -1
  ? Max Message Size -1
  ? Duplicate tracking time window 2m0s
  ? Allow message Roll-ups No
  ? Allow message deletion Yes
  ? Allow purging subjects or the entire stream Yes
  Stream stream_name was created

  Information for Stream stream_name created 2025-10-03 14:12:51

                  Subjects: stream_subject
                  Replicas: 1
                   Storage: File

  Options:

                 Retention: Limits
           Acknowledgments: true
            Discard Policy: Old
          Duplicate Window: 2m0s
                Direct Get: true
         Allows Msg Delete: true
              Allows Purge: true
    Allows Per-Message TTL: false
            Allows Rollups: false

  Limits:

          Maximum Messages: unlimited
       Maximum Per Subject: unlimited
             Maximum Bytes: unlimited
               Maximum Age: unlimited
      Maximum Message Size: unlimited
         Maximum Consumers: unlimited

  State:

                  Messages: 0
                     Bytes: 0 B
            First Sequence: 0
             Last Sequence: 0
          Active Consumers: 0
  ```
</details>

<details>
  <summary>创建持久拉取型消费者（durable pull consumer）</summary>

  ```bash
  $ nats consumer add
  ? Select a Stream stream_name
  ? Consumer name consumer_name
  ? Delivery target (empty for Pull Consumers) 
  ? Start policy (all, new, last, subject, 1h, msg sequence) all
  ? Acknowledgment policy explicit
  ? Replay policy instant
  ? Filter Stream by subjects (blank for all) 
  ? Maximum Allowed Deliveries -1
  ? Maximum Acknowledgments Pending 0
  ? Deliver headers only without bodies No
  ? Add a Retry Backoff Policy No
  Information for Consumer stream_name > consumer_name created 2025-10-03T14:13:51+03:00

  Configuration:

                      Name: consumer_name
                 Pull Mode: true
            Deliver Policy: All
                Ack Policy: Explicit
                  Ack Wait: 30.00s
             Replay Policy: Instant
           Max Ack Pending: 1,000
         Max Waiting Pulls: 512

  State:

    Last Delivered Message: Consumer sequence: 0 Stream sequence: 0
      Acknowledgment Floor: Consumer sequence: 0 Stream sequence: 0
          Outstanding Acks: 0 out of maximum 1,000
      Redelivered Messages: 0
      Unprocessed Messages: 0
             Waiting Pulls: 0 of maximum 512
  ```
</details>

创建完流和持久拉取型消费者之后，就可以创建一个使用 NATS 引擎的表。为此，需要初始化：`nats_stream`、`nats_consumer_name` 和 `nats_subjects`：

```SQL
CREATE TABLE nats_jet_stream (
    key UInt64,
    value UInt64
  ) ENGINE NATS 
    SETTINGS  nats_url = 'localhost:4222',
              nats_stream = 'stream_name',
              nats_consumer_name = 'consumer_name',
              nats_subjects = 'stream_subject',
              nats_format = 'JSONEachRow';
```
