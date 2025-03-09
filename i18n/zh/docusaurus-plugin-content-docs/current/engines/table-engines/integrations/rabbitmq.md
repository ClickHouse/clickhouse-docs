---
slug: /engines/table-engines/integrations/rabbitmq
sidebar_position: 170
sidebar_label: RabbitMQ
title: 'RabbitMQ 引擎'
description: '此引擎允许将 ClickHouse 与 RabbitMQ 集成。'
---


# RabbitMQ 引擎

此引擎允许将 ClickHouse 与 [RabbitMQ](https://www.rabbitmq.com) 集成。

`RabbitMQ` 让您可以：

- 发布或订阅数据流。
- 在数据流可用时处理流。

## 创建表 {#creating-a-table}

``` sql
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

- `rabbitmq_host_port` – 主机:端口（例如，`localhost:5672`）。
- `rabbitmq_exchange_name` – RabbitMQ 交换名称。
- `rabbitmq_format` – 消息格式。使用与 SQL `FORMAT` 函数相同的表示法，例如 `JSONEachRow`。有关更多信息，请参见 [Formats](../../../interfaces/formats.md) 部分。

可选参数：

- `rabbitmq_exchange_type` – RabbitMQ 交换的类型：`direct`、`fanout`、`topic`、`headers`、`consistent_hash`。默认值：`fanout`。
- `rabbitmq_routing_key_list` – 用逗号分隔的路由键列表。
- `rabbitmq_schema` – 如果格式要求模式定义，则必须使用的参数。例如， [Cap'n Proto](https://capnproto.org/) 需要模式文件的路径和根 `schema.capnp:Message` 对象的名称。
- `rabbitmq_num_consumers` – 每个表的消费者数量。如果一个消费者的吞吐量不足，请指定更多消费者。默认值：`1`
- `rabbitmq_num_queues` – 总队列数。增加此数量可以显著提高性能。默认值：`1`。
- `rabbitmq_queue_base` - 指定队列名称的提示。此设置的用例在下面描述。
- `rabbitmq_deadletter_exchange` - 为 [死信交换](https://www.rabbitmq.com/dlx.html) 指定名称。您可以使用此交换名称创建另一个表，并在消息重新发布到死信交换时收集消息。默认情况下未指定死信交换。
- `rabbitmq_persistent` - 如果设置为 1（真），则插入查询的交付模式将设置为 2（将消息标记为“持久”）。默认值：`0`。
- `rabbitmq_skip_broken_messages` – RabbitMQ 消息解析器对于每个块不兼容消息的容忍度。如果 `rabbitmq_skip_broken_messages = N`，则引擎跳过 *N* 个无法解析的 RabbitMQ 消息（一条消息等于一行数据）。默认值：`0`。
- `rabbitmq_max_block_size` - 在从 RabbitMQ 刷新数据之前收集的行数。默认值：[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `rabbitmq_flush_interval_ms` - 从 RabbitMQ 刷新数据的超时。默认值：[stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `rabbitmq_queue_settings_list` - 在创建队列时设置 RabbitMQ 的设置。可用设置：`x-max-length`、`x-max-length-bytes`、`x-message-ttl`、`x-expires`、`x-priority`、`x-max-priority`、`x-overflow`、`x-dead-letter-exchange`、`x-queue-type`。队列的 `durable` 设置自动启用。
- `rabbitmq_address` - 连接的地址。使用此设置或 `rabbitmq_host_port`。
- `rabbitmq_vhost` - RabbitMQ vhost。默认值：`'\'`。
- `rabbitmq_queue_consume` - 使用用户定义的队列，不进行任何 RabbitMQ 设置：声明交换、队列、绑定。默认值：`false`。
- `rabbitmq_username` - RabbitMQ 用户名。
- `rabbitmq_password` - RabbitMQ 密码。
- `reject_unhandled_messages` - 在出现错误时拒绝消息（发送 RabbitMQ 负面确认）。如果在 `rabbitmq_queue_settings_list` 中定义了 `x-dead-letter-exchange`，则此设置会自动启用。
- `rabbitmq_commit_on_select` - 在进行选择查询时提交消息。默认值：`false`。
- `rabbitmq_max_rows_per_message` — 在一条基于行的 RabbitMQ 消息中写入的最大行数。默认值：`1`。
- `rabbitmq_empty_queue_backoff_start` — 如果 RabbitMQ 队列为空，则重新调度读取的启动回退点。
- `rabbitmq_empty_queue_backoff_end` — 如果 RabbitMQ 队列为空，则重新调度读取的结束回退点。
- `rabbitmq_handle_error_mode` — 处理 RabbitMQ 引擎错误的方式。可能的值：default（如果我们无法解析消息，将抛出异常），stream（异常消息和原始消息将保存在虚拟列 `_error` 和 `_raw_message` 中）。

* [ ] SSL 连接：

使用 `rabbitmq_secure = 1` 或连接地址中的 `amqps`：`rabbitmq_address = 'amqps://guest:guest@localhost/vhost'`。
所使用库的默认行为是不检查创建的 TLS 连接是否足够安全。无论证书是否过期、自签名、缺失或无效：连接都将被允许。未来可能会实现更严格的证书检查。

此外，格式设置可以与 RabbitMQ 相关设置一起添加。

示例：

``` sql
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

RabbitMQ 服务器配置应使用 ClickHouse 配置文件添加。

必需配置：

``` xml
 <rabbitmq>
    <username>root</username>
    <password>clickhouse</password>
 </rabbitmq>
```

附加配置：

``` xml
 <rabbitmq>
    <vhost>clickhouse</vhost>
 </rabbitmq>
```

## 描述 {#description}

`SELECT` 对于读取消息并不特别有用（除非用于调试），因为每条消息只能读取一次。创建实时线程使用 [物化视图](../../../sql-reference/statements/create/view.md) 更为实用。为此：

1. 使用引擎创建 RabbitMQ 消费者，并将其视为数据流。
2. 创建一个具有所需结构的表。
3. 创建一个物化视图，将数据从引擎转换并放入先前创建的表中。

当 `MATERIALIZED VIEW` 加入引擎时，它会在后台开始收集数据。这使您能够持续接收来自 RabbitMQ 的消息，并使用 `SELECT` 将它们转换为所需格式。
一个 RabbitMQ 表可以拥有任意数量的物化视图。

数据可以根据 `rabbitmq_exchange_type` 和指定的 `rabbitmq_routing_key_list` 进行通道。
每个表最多只能有一个交换。一个交换可以在多个表之间共享 - 它支持同时路由到多个表。

交换类型选项：

- `direct` - 路由基于键的精确匹配。例如，表键列表：`key1,key2,key3,key4,key5`，消息键可以等于它们中的任意一个。
- `fanout` - 路由到所有表（交换名称相同），不管键是什么。
- `topic` - 路由基于点分隔键的模式。例如：`*.logs`、`records.*.*.2020`、`*.2018,*.2019,*.2020`。
- `headers` - 路由基于 `key=value` 匹配，带有设置 `x-match=all` 或 `x-match=any`。例如，表键列表：`x-match=all,format=logs,type=report,year=2020`。
- `consistent_hash` - 数据均匀分配到所有绑定表（交换名称相同）。请注意，必须启用此交换类型的 RabbitMQ 插件：`rabbitmq-plugins enable rabbitmq_consistent_hash_exchange`。

设置 `rabbitmq_queue_base` 可以用于以下情况：

- 让不同表共享队列，以便为同一队列注册多个消费者，从而提高性能。如果使用 `rabbitmq_num_consumers` 和/或 `rabbitmq_num_queues` 设置，则在这些参数相同时，可以达到完全匹配的队列。
- 当未成功消费所有消息时，能够从某些持久队列恢复读取。要从特定队列恢复消费 - 在 `rabbitmq_queue_base` 设置中设置其名称，并且不指定 `rabbitmq_num_consumers` 和 `rabbitmq_num_queues`（默认为 1）。要从为特定表声明的所有队列恢复消费 - 只需指定相同的设置：`rabbitmq_queue_base`、`rabbitmq_num_consumers`、`rabbitmq_num_queues`。默认情况下，队列名称将对表唯一。
- 重用队列，因为它们被声明为持久且不会自动删除。（可以通过任何 RabbitMQ CLI 工具删除。）

为了提高性能，接收的消息被分组到大小为 [max_insert_block_size](/operations/settings/settings#max_insert_block_size) 的块中。如果在 [stream_flush_interval_ms](../../../operations/server-configuration-parameters/settings.md) 毫秒内没有形成块，则数据将被刷新到表中，而不考虑块的完整性。

如果同时指定了 `rabbitmq_num_consumers` 和/或 `rabbitmq_num_queues` 设置以及 `rabbitmq_exchange_type`，则：

- 必须启用 `rabbitmq-consistent-hash-exchange` 插件。
- 发布消息必须指定 `message_id` 属性（对于每条消息/批次是唯一的）。

对于插入查询，有消息元数据，这些元数据会添加到每条发布的消息中：`messageID` 和 `republished` 标志（如果发布超过一次，则为真） - 可以通过消息头访问。

请勿将同一表用于插入和物化视图。

示例：

``` sql
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

## 虚拟列 {#virtual-columns}

- `_exchange_name` - RabbitMQ 交换名称。数据类型：`String`。
- `_channel_id` - 消费者声明消息的 ChannelID。数据类型：`String`。
- `_delivery_tag` - 接收到的消息的 DeliveryTag。按通道作用域。数据类型：`UInt64`。
- `_redelivered` - 消息的 `redelivered` 标志。数据类型：`UInt8`。
- `_message_id` - 接收到的消息的 messageID；如果在消息发布时设置，则非空。数据类型：`String`。
- `_timestamp` - 接收到的消息的时间戳；如果在消息发布时设置，则非空。数据类型：`UInt64`。

当 `kafka_handle_error_mode='stream'` 时的附加虚拟列：

- `_raw_message` - 无法成功解析的原始消息。数据类型：`Nullable(String)`。
- `_error` - 解析失败时发生的异常消息。数据类型：`Nullable(String)`。

注意：只有在解析过程中出现异常时，`_raw_message` 和 `_error` 虚拟列才会被填充，如果消息成功解析，则始终为 `NULL`。

## 注意事项 {#caveats}

尽管您可以在表定义中指定 [默认列表达式](/sql-reference/statements/create/table.md/#default_values)（例如 `DEFAULT`、`MATERIALIZED`、`ALIAS`），但这些将被忽略。相反，列将填充其各自类型的默认值。

## 数据格式支持 {#data-formats-support}

RabbitMQ 引擎支持 ClickHouse 中支持的所有 [formats](../../../interfaces/formats.md)。
一条 RabbitMQ 消息中的行数取决于格式是基于行的还是基于块的：

- 对于基于行的格式，可以通过设置 `rabbitmq_max_rows_per_message` 控制一条 RabbitMQ 消息中的行数。
- 对于基于块的格式，我们无法将块分成更小的部分，但可以通过常规设置 [max_block_size](/operations/settings/settings#max_block_size) 控制一个块中的行数。
