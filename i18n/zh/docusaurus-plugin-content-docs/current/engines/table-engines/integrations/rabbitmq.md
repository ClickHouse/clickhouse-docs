---
description: '该引擎允许将 ClickHouse 与 RabbitMQ 集成。'
sidebar_label: 'RabbitMQ'
sidebar_position: 170
slug: /engines/table-engines/integrations/rabbitmq
title: 'RabbitMQ 表引擎'
doc_type: 'guide'
---



# RabbitMQ 表引擎

该引擎用于将 ClickHouse 与 [RabbitMQ](https://www.rabbitmq.com) 集成。

`RabbitMQ` 使您可以：

- 发布或订阅数据流。
- 在数据流可用时对其进行处理。



## 创建表 {#creating-a-table}

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

- `rabbitmq_host_port` – 主机:端口（例如 `localhost:5672`）。
- `rabbitmq_exchange_name` – RabbitMQ 交换器名称。
- `rabbitmq_format` – 消息格式。使用与 SQL `FORMAT` 函数相同的表示法，如 `JSONEachRow`。更多信息请参阅[格式](../../../interfaces/formats.md)部分。

可选参数：


- `rabbitmq_exchange_type` – RabbitMQ exchange 的类型：`direct`、`fanout`、`topic`、`headers`、`consistent_hash`。默认：`fanout`。
- `rabbitmq_routing_key_list` – 以逗号分隔的路由键（routing key）列表。
- `rabbitmq_schema` – 当格式需要 schema 定义时必须使用的参数。例如，[Cap'n Proto](https://capnproto.org/) 需要提供 schema 文件的路径以及根 `schema.capnp:Message` 对象的名称。
- `rabbitmq_num_consumers` – 每张表的消费者（consumer）数量。当单个 consumer 的吞吐量不足时，可以增加此值。默认：`1`。
- `rabbitmq_num_queues` – 队列总数量。增加该值可以显著提升性能。默认：`1`。
- `rabbitmq_queue_base` - 为队列名称指定一个提示。此设置的使用场景见下文。
- `rabbitmq_deadletter_exchange` - 为 [dead letter exchange](https://www.rabbitmq.com/dlx.html) 指定名称。可以使用该 exchange 名称创建另一张表，在消息被重新发布到 dead letter exchange 时收集这些消息。默认情况下未指定 dead letter exchange。
- `rabbitmq_persistent` - 如果设置为 1（true），在 INSERT 查询中投递模式将被设置为 2（将消息标记为“persistent”）。默认：`0`。
- `rabbitmq_skip_broken_messages` – RabbitMQ 消息解析器在每个数据块中对与 schema 不兼容消息的容忍度。如果 `rabbitmq_skip_broken_messages = N`，引擎会跳过 *N* 条无法被解析的 RabbitMQ 消息（一条消息对应一行数据）。默认：`0`。
- `rabbitmq_max_block_size` - 在从 RabbitMQ 刷新数据前收集的行数。默认值：[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `rabbitmq_flush_interval_ms` - 从 RabbitMQ 刷新数据的超时时间。默认值：[stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `rabbitmq_queue_settings_list` - 允许在创建队列时设置 RabbitMQ 参数。可用设置：`x-max-length`、`x-max-length-bytes`、`x-message-ttl`、`x-expires`、`x-priority`、`x-max-priority`、`x-overflow`、`x-dead-letter-exchange`、`x-queue-type`。队列的 `durable` 设置会被自动启用。
- `rabbitmq_address` - 连接地址。使用此设置或 `rabbitmq_host_port` 二选一。
- `rabbitmq_vhost` - RabbitMQ vhost。默认：`'\'`。
- `rabbitmq_queue_consume` - 使用用户自定义队列，并且不执行任何 RabbitMQ 设置：声明 exchanges、queues、bindings。默认：`false`。
- `rabbitmq_username` - RabbitMQ 用户名。
- `rabbitmq_password` - RabbitMQ 密码。
- `reject_unhandled_messages` - 在发生错误时拒绝消息（向 RabbitMQ 发送负确认 negative acknowledgement）。如果在 `rabbitmq_queue_settings_list` 中定义了 `x-dead-letter-exchange`，该设置会被自动启用。
- `rabbitmq_commit_on_select` - 在执行 SELECT 查询时提交消息。默认：`false`。
- `rabbitmq_max_rows_per_message` — 对于基于行的格式，每条 RabbitMQ 消息中写入的最大行数。默认：`1`。
- `rabbitmq_empty_queue_backoff_start` — 当 RabbitMQ 队列为空时，重新调度读取时退避的起始点。
- `rabbitmq_empty_queue_backoff_end` — 当 RabbitMQ 队列为空时，重新调度读取时退避的结束点。
- `rabbitmq_handle_error_mode` — 处理 RabbitMQ 引擎错误的方式。可选值：`default`（如果解析消息失败则抛出异常）、`stream`（异常信息和原始消息会保存在虚拟列 `_error` 和 `_raw_message` 中）、`dead_letter_queue`（与错误相关的数据会保存在 system.dead_letter_queue 中）。

  * [ ] SSL 连接：

使用 `rabbitmq_secure = 1` 或在连接地址中使用 `amqps`：`rabbitmq_address = 'amqps://guest:guest@localhost/vhost'`。
所用库的默认行为是不检查所创建的 TLS 连接是否足够安全。无论证书是否过期、自签名、缺失或无效，连接都会被允许。将来可能会实现对证书更严格的检查。

此外，还可以在 rabbitmq 相关设置的同时添加格式相关设置。

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

应在 ClickHouse 配置文件中添加 RabbitMQ 服务器配置。

必需的配置：

```xml
 <rabbitmq>
    <username>root</username>
    <password>clickhouse</password>
 </rabbitmq>
```

附加配置：

```xml
 <rabbitmq>
    <vhost>clickhouse</vhost>
 </rabbitmq>
```


## 描述 {#description}

`SELECT` 对于读取消息并不是特别有用(除了用于调试),因为每条消息只能被读取一次。更实用的做法是使用[物化视图](../../../sql-reference/statements/create/view.md)创建实时数据流。具体步骤如下:

1.  使用该引擎创建一个 RabbitMQ 消费者,并将其视为数据流。
2.  创建一个具有所需结构的表。
3.  创建一个物化视图,将来自引擎的数据进行转换并放入先前创建的表中。

当 `MATERIALIZED VIEW` 关联到引擎时,它会在后台开始收集数据。这使您能够持续从 RabbitMQ 接收消息,并使用 `SELECT` 将其转换为所需的格式。
一个 RabbitMQ 表可以拥有任意数量的物化视图。

数据可以根据 `rabbitmq_exchange_type` 和指定的 `rabbitmq_routing_key_list` 进行路由。
每个表最多只能有一个交换器。一个交换器可以在多个表之间共享 - 这使得可以同时将数据路由到多个表。

交换器类型选项:

- `direct` - 基于键的精确匹配进行路由。示例表键列表:`key1,key2,key3,key4,key5`,消息键可以等于其中任何一个。
- `fanout` - 路由到所有表(交换器名称相同的表),不考虑键。
- `topic` - 基于点分隔键的模式进行路由。示例:`*.logs`、`records.*.*.2020`、`*.2018,*.2019,*.2020`。
- `headers` - 基于 `key=value` 匹配进行路由,设置为 `x-match=all` 或 `x-match=any`。示例表键列表:`x-match=all,format=logs,type=report,year=2020`。
- `consistent_hash` - 数据在所有绑定的表(交换器名称相同的表)之间均匀分布。注意,此交换器类型必须通过 RabbitMQ 插件启用:`rabbitmq-plugins enable rabbitmq_consistent_hash_exchange`。

设置 `rabbitmq_queue_base` 可用于以下情况:

- 让不同的表共享队列,以便可以为相同的队列注册多个消费者,从而获得更好的性能。如果使用 `rabbitmq_num_consumers` 和/或 `rabbitmq_num_queues` 设置,当这些参数相同时可以实现队列的精确匹配。
- 当并非所有消息都被成功消费时,能够从某些持久化队列恢复读取。要从一个特定队列恢复消费 - 在 `rabbitmq_queue_base` 设置中设置其名称,并且不要指定 `rabbitmq_num_consumers` 和 `rabbitmq_num_queues`(默认为 1)。要从为特定表声明的所有队列恢复消费 - 只需指定相同的设置:`rabbitmq_queue_base`、`rabbitmq_num_consumers`、`rabbitmq_num_queues`。默认情况下,队列名称对于每个表是唯一的。
- 重用队列,因为它们被声明为持久化且不会自动删除。(可以通过任何 RabbitMQ CLI 工具删除。)

为了提高性能,接收到的消息会被分组为大小为 [max_insert_block_size](/operations/settings/settings#max_insert_block_size) 的数据块。如果数据块未在 [stream_flush_interval_ms](../../../operations/server-configuration-parameters/settings.md) 毫秒内形成,则无论数据块是否完整,数据都将被刷新到表中。

如果 `rabbitmq_num_consumers` 和/或 `rabbitmq_num_queues` 设置与 `rabbitmq_exchange_type` 一起指定,则:

- 必须启用 `rabbitmq-consistent-hash-exchange` 插件。
- 必须指定已发布消息的 `message_id` 属性(每条消息/批次唯一)。

对于插入查询,每条已发布的消息都会添加消息元数据:`messageID` 和 `republished` 标志(如果发布超过一次则为 true) - 可以通过消息头访问。

不要将同一个表同时用于插入和物化视图。

示例:

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


## 虚拟列 {#virtual-columns}

- `_exchange_name` - RabbitMQ 交换机名称。数据类型：`String`。
- `_channel_id` - 接收消息的消费者所声明的通道 ID。数据类型：`String`。
- `_delivery_tag` - 接收消息的投递标签。作用域为单个通道。数据类型：`UInt64`。
- `_redelivered` - 消息的 `redelivered` 标志。数据类型：`UInt8`。
- `_message_id` - 接收消息的消息 ID；若在消息发布时已设置，则为非空值。数据类型：`String`。
- `_timestamp` - 接收消息的时间戳；若在消息发布时已设置，则为非空值。数据类型：`UInt64`。

当 `rabbitmq_handle_error_mode='stream'` 时的附加虚拟列：

- `_raw_message` - 无法成功解析的原始消息。数据类型：`Nullable(String)`。
- `_error` - 解析失败时产生的异常消息。数据类型：`Nullable(String)`。

注意：`_raw_message` 和 `_error` 虚拟列仅在解析过程中发生异常时才会填充，当消息成功解析时它们始终为 `NULL`。


## 注意事项 {#caveats}

即使您在表定义中指定了[默认列表达式](/sql-reference/statements/create/table.md/#default_values)(如 `DEFAULT`、`MATERIALIZED`、`ALIAS`),这些表达式也将被忽略。列将使用其数据类型对应的默认值进行填充。


## 数据格式支持 {#data-formats-support}

RabbitMQ 引擎支持 ClickHouse 中支持的所有[格式](../../../interfaces/formats.md)。
单条 RabbitMQ 消息中的行数取决于格式是基于行还是基于块：

- 对于基于行的格式，单条 RabbitMQ 消息中的行数可以通过设置 `rabbitmq_max_rows_per_message` 来控制。
- 对于基于块的格式，无法将块分割成更小的部分，但单个块中的行数可以通过通用设置 [max_block_size](/operations/settings/settings#max_block_size) 来控制。
