---
'description': '该引擎允许将 ClickHouse 与 NATS 集成，以发布或订阅消息主题，并在新消息可用时处理它们。'
'sidebar_label': 'NATS'
'sidebar_position': 140
'slug': '/engines/table-engines/integrations/nats'
'title': 'NATS 引擎'
'doc_type': 'guide'
---


# NATS 引擎 {#redisstreams-engine}

该引擎允许将 ClickHouse 与 [NATS](https://nats.io/) 集成。

`NATS` 让您可以：

- 发布或订阅消息主题。
- 处理新消息以便于使用。

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

- `nats_url` – 主机:端口（例如，`localhost:5672`）。
- `nats_subjects` – NATS 表的主题列表，以进行订阅/发布。支持通配符主题，如 `foo.*.bar` 或 `baz.>`。
- `nats_format` – 消息格式。使用与 SQL `FORMAT` 函数相同的表示法，例如 `JSONEachRow`。有关更多信息，请参见 [Formats](../../../interfaces/formats.md) 部分。

可选参数：

- `nats_schema` – 如果格式需要架构定义，则必须使用的参数。例如，[Cap'n Proto](https://capnproto.org/) 需要架构文件的路径和根 `schema.capnp:Message` 对象的名称。
- `nats_stream` – NATS JetStream 的流名称。
- `nats_consumer` – NATS JetStream 的持久消费者名称。
- `nats_num_consumers` – 每个表的消费者数量。默认值：`1`。如果单个消费者的吞吐量不足以仅满足 NATS 核心，则应指定更多消费者。
- `nats_queue_group` – NATS 订阅者的队列组名称。默认值为表名。
- `nats_max_reconnect` – 已弃用且不再有任何效果，重连将在 nats_reconnect_wait 超时下永久执行。
- `nats_reconnect_wait` – 重新连接尝试之间的等待时间（以毫秒为单位）。默认值：`5000`。
- `nats_server_list` - 连接的服务器列表。可指定以连接到 NATS 集群。
- `nats_skip_broken_messages` - 每个区块 NATS 消息解析器对于架构不兼容的消息的容忍度。默认值：`0`。如果 `nats_skip_broken_messages = N`，则引擎将跳过无法解析的 *N* 个 NATS 消息（每条消息等于一行数据）。
- `nats_max_block_size` - 从 NATS 刷新数据时通过轮询收集的行数。默认值：[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `nats_flush_interval_ms` - 刷新从 NATS 读取的数据的超时。默认值：[stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `nats_username` - NATS 用户名。
- `nats_password` - NATS 密码。
- `nats_token` - NATS 身份验证令牌。
- `nats_credential_file` - NATS 凭证文件的路径。
- `nats_startup_connect_tries` - 启动时的连接尝试次数。默认值：`5`。
- `nats_max_rows_per_message` — 一条 NATS 消息中写入的最大行数（适用于基于行的格式），默认值：`1`。
- `nats_handle_error_mode` — 如何处理 NATS 引擎的错误。可能的值：默认（如果解析消息失败，将抛出异常），流（异常消息和原始消息将保存在虚拟列 `_error` 和 `_raw_message` 中）。

SSL 连接：

要建立安全连接，请使用 `nats_secure = 1`。
所使用库的默认行为是不检查建立的 TLS 连接是否足够安全。无论证书是否过期、自签名、缺失或无效，连接都将被允许。未来可能会实现更严格的证书检查。

写入 NATS 表：

如果表仅从一个主题读取，则任何插入都会发布到同一主题。
但是，如果表来自多个主题，则需要指定要发布到哪个主题。
因此，在将数据插入包含多个主题的表时，需要设置 `stream_like_engine_insert_queue`。
您可以选择表读取的一个主题并将数据发布到该主题。例如：

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

同时，可以与与 NATS 相关的设置一起添加格式设置。

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

可以使用 ClickHouse 配置文件添加 NATS 服务器配置。
更具体地说，您可以为 NATS 引擎添加 Redis 密码：

```xml
<nats>
    <user>click</user>
    <password>house</password>
    <token>clickhouse</token>
</nats>
```

## 描述 {#description}

`SELECT` 对于读取消息（除了调试）并不是特别有用，因为每条消息只能读取一次。使用 [物化视图](../../../sql-reference/statements/create/view.md) 创建实时线程更为实用。为此：

1.  使用引擎创建 NATS 消费者，并将其视为数据流。
2.  创建具有所需结构的表。
3.  创建一个将数据从引擎转换并放入先前创建的表中的物化视图。

当 `MATERIALIZED VIEW` 连接到引擎时，它开始在后台收集数据。这使您能够不断从 NATS 接收消息，并使用 `SELECT` 将其转换为所需格式。
一个 NATS 表可以有任意多个物化视图，这些视图不会直接从表中读取数据，而是接收新记录（以块形式），这样您可以将数据写入多个具有不同细节级别的表（无论是分组 - 聚合还是不聚合）。

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

要停止接收流数据或更改转换逻辑，请分离物化视图：

```sql
DETACH TABLE consumer;
ATTACH TABLE consumer;
```

如果您想通过使用 `ALTER` 更改目标表，我们建议禁用物化视图，以避免目标表和来自视图的数据之间的不一致。

## 虚拟列 {#virtual-columns}

- `_subject` - NATS 消息主题。数据类型：`String`。

当 `nats_handle_error_mode='stream'` 时的附加虚拟列：

- `_raw_message` - 无法成功解析的原始消息。数据类型：`Nullable(String)`。
- `_error` - 在解析失败时发生的异常消息。数据类型：`Nullable(String)`。

注意：当消息成功解析时，`_raw_message` 和 `_error` 虚拟列始终为 `NULL`，仅在解析过程中出现异常时填写。

## 数据格式支持 {#data-formats-support}

NATS 引擎支持 ClickHouse 支持的所有 [格式](../../../interfaces/formats.md)。
一条 NATS 消息中的行数取决于格式是基于行还是基于块：

- 对于基于行的格式，一条 NATS 消息中的行数可以通过设置 `nats_max_rows_per_message` 来控制。
- 对于基于块的格式，我们无法将块分割为更小的部分，但可以通过通用设置 [max_block_size](/operations/settings/settings#max_block_size) 控制每个块中的行数。
