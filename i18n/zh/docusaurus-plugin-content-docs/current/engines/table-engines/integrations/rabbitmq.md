---
description: '该引擎支持将 ClickHouse 与 RabbitMQ 集成。'
sidebar_label: 'RabbitMQ'
sidebar_position: 170
slug: /engines/table-engines/integrations/rabbitmq
title: 'RabbitMQ 表引擎'
doc_type: 'guide'
---

# RabbitMQ 表引擎 \{#rabbitmq-table-engine\}

该引擎用于将 ClickHouse 与 [RabbitMQ](https://www.rabbitmq.com) 集成。

`RabbitMQ` 可用于：

- 发布或订阅数据流。
- 在数据流可用时对其进行处理。

## 创建表 \{#creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1],
    name2 [type2],
    ...
) ENGINE = RabbitMQ SETTINGS
    rabbitmq_host_port = 'host:port' [or rabbitmq_address = 'amqp(s)://guest:guest@localhost/vhost'],
    rabbitmq_exchange_name = 'exchange_name',
    rabbitmq_format = 'data_format'[,]
    [rabbitmq_exchange_type = 'exchange_type',]
    [rabbitmq_routing_key_list = 'key1,key2,...',]
    [rabbitmq_secure = 0,]
    [rabbitmq_schema = '',]
    [rabbitmq_num_consumers = N,]
    [rabbitmq_num_queues = N,]
    [rabbitmq_queue_base = 'queue',]
    [rabbitmq_deadletter_exchange = 'dl-exchange',]
    [rabbitmq_persistent = 0,]
    [rabbitmq_skip_broken_messages = N,]
    [rabbitmq_max_block_size = N,]
    [rabbitmq_flush_interval_ms = N,]
    [rabbitmq_queue_settings_list = 'x-dead-letter-exchange=my-dlx,x-max-length=10,x-overflow=reject-publish',]
    [rabbitmq_queue_consume = false,]
    [rabbitmq_address = '',]
    [rabbitmq_vhost = '/',]
    [rabbitmq_username = '',]
    [rabbitmq_password = '',]
    [rabbitmq_commit_on_select = false,]
    [rabbitmq_max_rows_per_message = 1,]
    [rabbitmq_handle_error_mode = 'default']
```

必需参数：

* `rabbitmq_host_port` – 主机和端口，格式为 host:port（例如 `localhost:5672`）。
* `rabbitmq_exchange_name` – RabbitMQ exchange 名称。
* `rabbitmq_format` – 消息格式。使用与 SQL `FORMAT` 函数相同的格式说明，例如 `JSONEachRow`。更多信息，请参阅 [Formats](../../../interfaces/formats.md) 章节。

可选参数：


- `rabbitmq_exchange_type` – RabbitMQ exchange 的类型：`direct`、`fanout`、`topic`、`headers`、`consistent_hash`。默认值：`fanout`。
- `rabbitmq_routing_key_list` – 以逗号分隔的路由键（routing key）列表。
- `rabbitmq_schema` – 当格式需要 schema 定义时必须使用的参数。例如， [Cap'n Proto](https://capnproto.org/) 需要提供 schema 文件的路径以及根 `schema.capnp:Message` 对象的名称。
- `rabbitmq_num_consumers` – 每个表的 consumer 数量。如果单个 consumer 的吞吐量不足，请设置更多的 consumer。默认值：`1`。
- `rabbitmq_num_queues` – 队列总数。增大该值可以显著提升性能。默认值：`1`。
- `rabbitmq_queue_base` - 为队列名称提供一个提示（前缀/基名）。此设置的使用场景会在下文中说明。
- `rabbitmq_persistent` - 如果设置为 1（true），在 insert 查询中，投递模式（delivery mode）会被设置为 2（将消息标记为“persistent”）。默认值：`0`。
- `rabbitmq_skip_broken_messages` – 每个数据块中 RabbitMQ 消息解析器对与 schema 不兼容消息的容忍数量。如果 `rabbitmq_skip_broken_messages = N`，则引擎会跳过 *N* 条无法解析的 RabbitMQ 消息（每条消息对应一行数据）。默认值：`0`。
- `rabbitmq_max_block_size` - 在从 RabbitMQ 刷新（flush）数据前累积的行数。默认值：[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `rabbitmq_flush_interval_ms` - 从 RabbitMQ 刷新（flush）数据的超时时间（毫秒）。默认值：[stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `rabbitmq_queue_settings_list` - 允许在创建队列时设置 RabbitMQ 参数。可用设置包括：`x-max-length`、`x-max-length-bytes`、`x-message-ttl`、`x-expires`、`x-priority`、`x-max-priority`、`x-overflow`、`x-dead-letter-exchange`、`x-queue-type`。队列的 `durable` 设置会自动启用。
- `rabbitmq_address` - 连接地址。此设置与 `rabbitmq_host_port` 二选一。
- `rabbitmq_vhost` - RabbitMQ vhost。默认值：`'\'`。
- `rabbitmq_queue_consume` - 使用用户自定义队列，并且不执行任何 RabbitMQ 初始化操作：声明 exchange、队列或绑定。默认值：`false`。
- `rabbitmq_username` - RabbitMQ 用户名。
- `rabbitmq_password` - RabbitMQ 密码。
- `reject_unhandled_messages` - 在出现错误时拒绝消息（向 RabbitMQ 发送负确认）。如果在 `rabbitmq_queue_settings_list` 中定义了 `x-dead-letter-exchange`，则此设置会自动启用。
- `rabbitmq_commit_on_select` - 在执行 select 查询时提交消息。默认值：`false`。
- `rabbitmq_max_rows_per_message` — 对于基于行的格式，在一条 RabbitMQ 消息中写入的最大行数。默认值：`1`。
- `rabbitmq_empty_queue_backoff_start_ms` — 当 RabbitMQ 队列为空时，重新调度读取操作的退避起点（毫秒）。
- `rabbitmq_empty_queue_backoff_end_ms` — 当 RabbitMQ 队列为空时，重新调度读取操作的退避终点（毫秒）。
- `rabbitmq_empty_queue_backoff_step_ms` — 当 RabbitMQ 队列为空时，重新调度读取操作时使用的退避步长（毫秒）。
- `rabbitmq_handle_error_mode` — RabbitMQ 引擎的错误处理方式。可选值：`default`（如果解析消息失败，将抛出异常）、`stream`（异常信息和原始消息将保存在虚拟列 `_error` 和 `_raw_message` 中）、`dead_letter_queue`（与错误相关的数据将保存在 `system.dead_letter_queue` 中）。

### SSL 连接 \{#ssl-connection\}

使用 `rabbitmq_secure = 1` 或在连接地址中使用 `amqps`：`rabbitmq_address = 'amqps://guest:guest@localhost/vhost'`。
所使用的库的默认行为是不会检查所建立的 TLS 连接是否足够安全。无论证书是否过期、自签名、缺失或无效，连接照样会被允许。将来可能会实现对证书更严格的检查。

同时还可以在 rabbitmq 相关设置中添加格式相关的设置。

示例：

```sql
  CREATE TABLE queue (
    key UInt64,
    value UInt64,
    date DateTime
  ) ENGINE = RabbitMQ SETTINGS rabbitmq_host_port = 'localhost:5672',
                            rabbitmq_exchange_name = 'exchange1',
                            rabbitmq_format = 'JSONEachRow',
                            rabbitmq_num_consumers = 5,
                            date_time_input_format = 'best_effort';
```

应通过 ClickHouse 配置文件添加 RabbitMQ 服务器的配置。

必需配置如下：

```xml
 <rabbitmq>
    <username>root</username>
    <password>clickhouse</password>
 </rabbitmq>
```

其他配置：

```xml
 <rabbitmq>
    <vhost>clickhouse</vhost>
 </rabbitmq>
```


## 描述 \{#description\}

`SELECT` 对于读取消息并不是特别有用（除非用于调试），因为每条消息只能被读取一次。更实用的方式是使用[物化视图](../../../sql-reference/statements/create/view.md)创建实时处理流程。为此：

1. 使用该引擎创建一个 RabbitMQ 消费者，并将其视为数据流。
2. 创建一个具有所需结构的表。
3. 创建一个物化视图，将来自引擎的数据转换后写入前面创建的表中。

当 `MATERIALIZED VIEW` 连接到引擎时，它会在后台开始收集数据。这样就可以持续地从 RabbitMQ 接收消息，并使用 `SELECT` 将其转换为所需格式。
一个 RabbitMQ 表可以拥有任意数量的物化视图。

可以基于 `rabbitmq_exchange_type` 和指定的 `rabbitmq_routing_key_list` 对数据进行路由。
每个表最多只能有一个 exchange。一个 exchange 可以在多个表之间共享——这使得可以同时路由到多个表中。

Exchange 类型说明：

* `direct` - 基于键的精确匹配进行路由。示例表键列表：`key1,key2,key3,key4,key5`，消息键可以等于其中任意一个。
* `fanout` - 路由到所有表（exchange 名称相同的表），与键无关。
* `topic` - 基于使用点分隔键的模式进行路由。示例：`*.logs`、`records.*.*.2020`、`*.2018,*.2019,*.2020`。
* `headers` - 基于 `key=value` 匹配，并结合 `x-match=all` 或 `x-match=any` 设置进行路由。示例表键列表：`x-match=all,format=logs,type=report,year=2020`。
* `consistent_hash` - 数据在所有绑定的表（exchange 名称相同的表）之间均匀分布。注意，此 exchange 类型必须通过 RabbitMQ 插件启用：`rabbitmq-plugins enable rabbitmq_consistent_hash_exchange`。

`rabbitmq_queue_base` 设置可用于以下场景：

* 允许不同的表共享队列，从而可以为同一队列注册多个消费者，以提升性能。如果使用了 `rabbitmq_num_consumers` 和/或 `rabbitmq_num_queues` 设置，并且这些参数相同，则可以实现队列的精确匹配。
* 能够在并非所有消息都成功消费的情况下，从某些持久队列恢复读取。要从某个特定队列恢复消费——在 `rabbitmq_queue_base` 设置中将其名称设为该队列名，并且不要指定 `rabbitmq_num_consumers` 和 `rabbitmq_num_queues`（默认为 1）。要从为某个特定表声明的所有队列恢复消费——只需指定相同的设置：`rabbitmq_queue_base`、`rabbitmq_num_consumers`、`rabbitmq_num_queues`。默认情况下，队列名称对每个表都是唯一的。
* 复用队列，因为这些队列被声明为持久的且不会自动删除。（可以通过任意 RabbitMQ CLI 工具删除。）

为提高性能，接收到的消息会被分组为大小为 [max&#95;insert&#95;block&#95;size](/operations/settings/settings#max_insert_block_size) 的数据块。如果在 [stream&#95;flush&#95;interval&#95;ms](../../../operations/server-configuration-parameters/settings.md) 毫秒内未能形成完整的数据块，则无论块是否完整，都会将数据刷新到表中。

如果在指定 `rabbitmq_exchange_type` 的同时也设置了 `rabbitmq_num_consumers` 和/或 `rabbitmq_num_queues`，则需要满足以下条件：

* 必须启用 `rabbitmq-consistent-hash-exchange` 插件。
* 已发布消息的 `message_id` 属性必须被指定（对每条消息/批次唯一）。

对于插入查询，每条已发布消息都会附加消息元数据：`messageID` 和 `republished` 标志（如果消息被发布多于一次则为 true）——可以通过消息头访问。

不要将同一张表同时用作插入目标和物化视图的目标表。

示例：

```sql
  CREATE TABLE queue (
    key UInt64,
    value UInt64
  ) ENGINE = RabbitMQ SETTINGS rabbitmq_host_port = 'localhost:5672',
                            rabbitmq_exchange_name = 'exchange1',
                            rabbitmq_exchange_type = 'headers',
                            rabbitmq_routing_key_list = 'format=logs,type=report,year=2020',
                            rabbitmq_format = 'JSONEachRow',
                            rabbitmq_num_consumers = 5;

  CREATE TABLE daily (key UInt64, value UInt64)
    ENGINE = MergeTree() ORDER BY key;

  CREATE MATERIALIZED VIEW consumer TO daily
    AS SELECT key, value FROM queue;

  SELECT key, value FROM daily ORDER BY key;
```


## 虚拟列 \\{#virtual-columns\\}

- `_exchange_name` - RabbitMQ 交换器（exchange）名称。数据类型：`String`。
- `_channel_id` - 接收该消息的 consumer 所声明的 ChannelID。数据类型：`String`。
- `_delivery_tag` - 所接收消息的 DeliveryTag，在每个 channel 内单独计数。数据类型：`UInt64`。
- `_redelivered` - 消息的 `redelivered` 标志位。数据类型：`UInt8`。
- `_message_id` - 所接收消息的 messageID；如果在发布消息时设置了该字段则为非空。数据类型：`String`。
- `_timestamp` - 所接收消息的 timestamp；如果在发布消息时设置了该字段则为非空。数据类型：`UInt64`。

当 `rabbitmq_handle_error_mode='stream'` 时的附加虚拟列：

- `_raw_message` - 无法成功解析的原始消息。数据类型：`Nullable(String)`。
- `_error` - 解析失败期间产生的异常信息。数据类型：`Nullable(String)`。

注意：仅在解析期间发生异常时，`_raw_message` 和 `_error` 虚拟列才会被填充；当消息被成功解析时，它们始终为 `NULL`。

## 注意事项 \\{#caveats\\}

即使在表定义中指定了[默认列表达式](/sql-reference/statements/create/table.md/#default_values)（例如 `DEFAULT`、`MATERIALIZED`、`ALIAS`），这些也会被忽略。列将使用其各自数据类型的默认值进行填充。

## 数据格式支持 \\{#data-formats-support\\}

RabbitMQ 引擎支持 ClickHouse 所支持的所有[格式](../../../interfaces/formats.md)。
单个 RabbitMQ 消息中的行数取决于使用的是按行还是按块的格式：

- 对于按行的格式，可以通过设置 `rabbitmq_max_rows_per_message` 来控制单个 RabbitMQ 消息中的行数。
- 对于按块的格式，我们无法将数据块拆分为更小的部分，但可以通过全局设置 [max_block_size](/operations/settings/settings#max_block_size) 来控制单个数据块中的行数。