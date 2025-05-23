---
'description': '这个引擎允许将 ClickHouse 与 RabbitMQ 集成。'
'sidebar_label': 'RabbitMQ'
'sidebar_position': 170
'slug': '/engines/table-engines/integrations/rabbitmq'
'title': 'RabbitMQ 引擎'
---


# RabbitMQ 引擎

该引擎允许将 ClickHouse 与 [RabbitMQ](https://www.rabbitmq.com) 进行集成。

`RabbitMQ` 让您可以：

- 发布或订阅数据流。
- 在数据变得可用时处理流。

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

- `rabbitmq_host_port` – 主机:端口（例如，`localhost:5672`）。
- `rabbitmq_exchange_name` – RabbitMQ 交换名称。
- `rabbitmq_format` – 消息格式。使用与 SQL `FORMAT` 函数相同的表示法，例如 `JSONEachRow`。有关更多信息，请参见 [Formats](../../../interfaces/formats.md) 部分。

可选参数：

- `rabbitmq_exchange_type` – RabbitMQ 交换类型：`direct`、`fanout`、`topic`、`headers`、`consistent_hash`。默认值：`fanout`。
- `rabbitmq_routing_key_list` – 路由关键字的逗号分隔列表。
- `rabbitmq_schema` – 如果格式需要 schema 定义，则必须使用的参数。例如，[Cap'n Proto](https://capnproto.org/) 需要 schema 文件的路径和根对象 `schema.capnp:Message` 的名称。
- `rabbitmq_num_consumers` – 每个表的消费者数量。如果一个消费者的吞吐量不足，请指定更多消费者。默认：`1`
- `rabbitmq_num_queues` – 队列的总数。增加此数字可以显著提高性能。默认：`1`。
- `rabbitmq_queue_base` - 为队列名称指定提示。该设置的用例在下面描述。
- `rabbitmq_deadletter_exchange` - 指定 [死信交换](https://www.rabbitmq.com/dlx.html) 的名称。您可以使用此交换名称创建另一个表，在消息重新发布到死信交换时收集消息。默认情况下未指定死信交换。
- `rabbitmq_persistent` - 如果设置为 1 (true)，则在插入查询交付模式将设为 2（将消息标记为“持久”）。默认：`0`。
- `rabbitmq_skip_broken_messages` – RabbitMQ 消息解析器对每个块中与 schema 不兼容的消息的宽容度。如果 `rabbitmq_skip_broken_messages = N`，则引擎跳过 *N* 条无法解析的 RabbitMQ 消息（消息等于数据的一行）。默认：`0`。
- `rabbitmq_max_block_size` - 收集的行数，直到从 RabbitMQ 刷新数据。默认值：[max_insert_block_size](../../../operations/settings/settings.md#max_insert_block_size)。
- `rabbitmq_flush_interval_ms` - 从 RabbitMQ 刷新数据的超时。默认值：[stream_flush_interval_ms](/operations/settings/settings#stream_flush_interval_ms)。
- `rabbitmq_queue_settings_list` - 在创建队列时设置 RabbitMQ 设置。可用的设置有：`x-max-length`、`x-max-length-bytes`、`x-message-ttl`、`x-expires`、`x-priority`、`x-max-priority`、`x-overflow`、`x-dead-letter-exchange`、`x-queue-type`。`durable` 设置会自动为队列启用。
- `rabbitmq_address` - 连接的地址。使用此设置或 `rabbitmq_host_port`。
- `rabbitmq_vhost` - RabbitMQ vhost。默认：`'\'`。
- `rabbitmq_queue_consume` - 使用用户定义的队列并不进行任何 RabbitMQ 设置：声明交换、队列、绑定。默认：`false`。
- `rabbitmq_username` - RabbitMQ 用户名。
- `rabbitmq_password` - RabbitMQ 密码。
- `reject_unhandled_messages` - 在发生错误时拒绝消息（发送 RabbitMQ 否定确认）。如果在 `rabbitmq_queue_settings_list` 中定义了 `x-dead-letter-exchange`，则此设置会自动启用。
- `rabbitmq_commit_on_select` - 当执行选择查询时提交消息。默认：`false`。
- `rabbitmq_max_rows_per_message` — 每个 RabbitMQ 消息中写入的最大行数（适用于行格式）。默认：`1`。
- `rabbitmq_empty_queue_backoff_start` — 如果 RabbitMQ 队列为空，则重新调度读取的开始退避点。
- `rabbitmq_empty_queue_backoff_end` — 如果 RabbitMQ 队列为空，则重新调度读取的结束退避点。
- `rabbitmq_handle_error_mode` — 如何处理 RabbitMQ 引擎的错误。可能的值：default（如果解析消息失败，将抛出异常），stream（异常消息和原始消息将保存在虚拟列 `_error` 和 `_raw_message` 中）。

* [ ] SSL 连接：

使用 `rabbitmq_secure = 1` 或在连接地址中使用 `amqps`：`rabbitmq_address = 'amqps://guest:guest@localhost/vhost'`。所使用库的默认行为是不检查创建的 TLS 连接是否安全。无论证书是否过期、自签名、缺失或无效：都将允许连接。可能会在未来实现对于证书的更严格检查。

还可以将格式设置与与 RabbitMQ 相关的设置一起添加。

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

RabbitMQ 服务器配置应使用 ClickHouse 配置文件进行添加。

必需配置：

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

`SELECT` 在读取消息时不是特别有用（除了调试），因为每条消息只能读取一次。使用 [物化视图](../../../sql-reference/statements/create/view.md) 创建实时线程更为实用。为此：

1. 使用该引擎创建一个 RabbitMQ 消费者，并将其视为数据流。
2. 创建一个具有所需结构的表。
3. 创建一个将数据从引擎转换并放入之前创建的表的物化视图。

当 `MATERIALIZED VIEW` 加入引擎时，它会在后台开始收集数据。这使您能够不断从 RabbitMQ 接收消息并使用 `SELECT` 将其转换为所需格式。
一个 RabbitMQ 表可以有尽可能多的物化视图。

可以根据 `rabbitmq_exchange_type` 和指定的 `rabbitmq_routing_key_list` 进行数据通道。
每个表最多只能有一个交换。一个交换可以在多个表之间共享 - 这使得能够同时路由到多个表。

交换类型选项：

- `direct` - 路由基于关键字的精确匹配。例如表关键字列表：`key1,key2,key3,key4,key5`，消息关键字可以等于其中任何一个。
- `fanout` - 路由到所有表（交换名称相同），不管关键字是什么。
- `topic` - 路由基于以点分隔的关键字的模式。示例：`*.logs`、`records.*.*.2020`、`*.2018,*.2019,*.2020`。
- `headers` - 路由基于 `key=value` 匹配，并设有设置 `x-match=all` 或 `x-match=any`。示例表关键字列表：`x-match=all,format=logs,type=report,year=2020`。
- `consistent_hash` - 数据均匀分配到所有绑定表之间（交换名称相同）。请注意，此交换类型必须通过 RabbitMQ 插件启用：`rabbitmq-plugins enable rabbitmq_consistent_hash_exchange`。

设置 `rabbitmq_queue_base` 可用于以下情况：

- 让不同的表共享队列，以便为相同队列注册多个消费者，从而提高性能。如果同时使用 `rabbitmq_num_consumers` 和/或 `rabbitmq_num_queues` 设置，则可以在这些参数相同的情况下实现队列的完全匹配。
- 能够从某些持久队列恢复读取，前提是并非所有消息均已成功消费。要从一个特定队列恢复消费 - 在 `rabbitmq_queue_base` 设置中设置其名称，而无需指定 `rabbitmq_num_consumers` 和 `rabbitmq_num_queues`（默认值为 1）。要从特定表声明的所有队列恢复消费 - 只需指定相同的设置：`rabbitmq_queue_base`、`rabbitmq_num_consumers`、`rabbitmq_num_queues`。默认情况下，队列名称将对表唯一。
- 重新使用队列，因为它们声明为持久并且不会自动删除。（可以通过任何 RabbitMQ CLI 工具删除。）

为了提高性能，接收到的消息会被分组到 [max_insert_block_size](/operations/settings/settings#max_insert_block_size) 大小的块中。如果在 [stream_flush_interval_ms](../../../operations/server-configuration-parameters/settings.md) 毫秒内未形成块，则无论块是否完整，数据都将被刷新到表中。

如果同时指定 `rabbitmq_num_consumers` 和/或 `rabbitmq_num_queues` 设置以及 `rabbitmq_exchange_type`，则：

- 必须启用 `rabbitmq-consistent-hash-exchange` 插件。
- 发布消息的 `message_id` 属性必须被指定（对每条消息/批次唯一）。

对于插入查询，有消息元数据，它会为每条发布的消息添加：`messageID` 和 `republished` 标志（如果发布超过一次，则为 true） - 可以通过消息头访问。

不要使用同一表进行插入和物化视图。

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

## 虚拟列 {#virtual-columns}

- `_exchange_name` - RabbitMQ 交换名称。数据类型：`String`。
- `_channel_id` - 声明了接收此消息的消费者的 ChannelID。数据类型：`String`。
- `_delivery_tag` - 接收到的消息的 DeliveryTag。按照通道作用域。数据类型：`UInt64`。
- `_redelivered` - 消息的 `redelivered` 标志。数据类型：`UInt8`。
- `_message_id` - 接收到的消息的 messageID；如果发布消息时已设置，则非空。数据类型：`String`。
- `_timestamp` - 接收到的消息的时间戳；如果发布消息时已设置，则非空。数据类型：`UInt64`。

当 `kafka_handle_error_mode='stream'` 时的附加虚拟列：

- `_raw_message` - 无法成功解析的原始消息。数据类型：`Nullable(String)`。
- `_error` - 解析失败时发生的异常消息。数据类型：`Nullable(String)`。

注意：只有在解析期间发生异常时，`_raw_message` 和 `_error` 虚拟列才会被填充，成功解析消息时它们始终为 `NULL`。

## 注意事项 {#caveats}

即使您可以在表定义中指定 [默认列表达式](/sql-reference/statements/create/table.md/#default_values)（如 `DEFAULT`、`MATERIALIZED`、`ALIAS`），这些也将被忽略。相反，列将填充其各自类型的默认值。

## 数据格式支持 {#data-formats-support}

RabbitMQ 引擎支持 ClickHouse 中支持的所有 [formats](../../../interfaces/formats.md)。
一条 RabbitMQ 消息中的行数取决于格式是基于行的还是基于块的：

- 对于基于行的格式，可以通过设置 `rabbitmq_max_rows_per_message` 控制一条 RabbitMQ 消息中的行数。
- 对于基于块的格式，我们无法将块拆分为更小的部分，但可以通过一般设置 [max_block_size](/operations/settings/settings#max_block_size) 控制每个块中的行数。
