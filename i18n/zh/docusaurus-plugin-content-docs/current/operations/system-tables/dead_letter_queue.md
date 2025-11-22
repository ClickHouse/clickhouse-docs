---
description: '包含通过流式引擎接收且在解析时出错的消息信息的系统表。'
keywords: ['系统表', 'dead_letter_queue']
slug: /operations/system-tables/dead_letter_queue
title: 'system.dead_letter_queue'
doc_type: 'reference'
---

包含通过流式引擎接收且在解析时出错的消息信息。目前已为 Kafka 和 RabbitMQ 提供实现。

通过在特定引擎的 `handle_error_mode` 设置中指定 `dead_letter_queue` 来启用日志记录。

数据的刷新周期由服务器配置中 [dead&#95;letter&#95;queue](../../operations/server-configuration-parameters/settings.md#dead_letter_queue) 设置部分的 `flush_interval_milliseconds` 参数设定。要强制刷新，请使用 [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) 查询。

ClickHouse 不会自动从该表中删除数据。更多细节参见 [简介](../../operations/system-tables/overview.md#system-tables-introduction)。

列：

* `table_engine` ([Enum8](../../sql-reference/data-types/enum.md)) - 流类型。可能的值：`Kafka` 和 `RabbitMQ`。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) - 消息消费日期。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - 消息消费日期和时间。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) - 具有微秒精度的消息消费时间。
* `database` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) - 该流式表所属的 ClickHouse 数据库。
* `table` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) - ClickHouse 表名。
* `error` ([String](../../sql-reference/data-types/string.md)) - 错误信息。
* `raw_message` ([String](../../sql-reference/data-types/string.md)) - 消息内容。
* `kafka_topic_name` ([String](../../sql-reference/data-types/string.md)) - Kafka 主题名。
* `kafka_partition` ([UInt64](../../sql-reference/data-types/int-uint.md)) - 该主题的 Kafka 分区。
* `kafka_offset` ([UInt64](../../sql-reference/data-types/int-uint.md)) - 消息的 Kafka 偏移量。
* `kafka_key` ([String](../../sql-reference/data-types/string.md)) - 消息的 Kafka key。
* `rabbitmq_exchange_name` ([String](../../sql-reference/data-types/string.md)) - RabbitMQ exchange 名称。
* `rabbitmq_message_id` ([String](../../sql-reference/data-types/string.md)) - RabbitMQ 消息 ID。
* `rabbitmq_message_timestamp` ([DateTime](../../sql-reference/data-types/datetime.md)) - RabbitMQ 消息时间戳。
* `rabbitmq_message_redelivered` ([UInt8](../../sql-reference/data-types/int-uint.md)) - RabbitMQ 消息是否为重新投递的标志。
* `rabbitmq_message_delivery_tag` ([UInt64](../../sql-reference/data-types/int-uint.md)) - RabbitMQ 投递标签。
* `rabbitmq_channel_id` ([String](../../sql-reference/data-types/string.md)) - RabbitMQ 通道 ID。

**示例**

查询：

```sql
SELECT * FROM system.dead_letter_queue LIMIT 1 \G;
```

结果：


```text
Row 1:
──────
table_engine:                  Kafka
event_date:                    2025-05-01
event_time:                    2025-05-01 10:34:53
event_time_microseconds:       2025-05-01 10:34:53.910773
database:                      default
table:                         kafka
error:                         无法解析输入:在以下内容之前应有 '\t': 'qwertyuiop': (at row 1)
:
Row 1:
Column 0,   name: key,   type: UInt64, ERROR: 文本 "qwertyuiop" 与 UInt64 类型不匹配
raw_message:                   qwertyuiop
kafka_topic_name:              TSV_dead_letter_queue_err_1746095689
kafka_partition:               0
kafka_offset:                  0
kafka_key:
rabbitmq_exchange_name:
rabbitmq_message_id:
rabbitmq_message_timestamp:    1970-01-01 00:00:00
rabbitmq_message_redelivered:  0
rabbitmq_message_delivery_tag: 0
rabbitmq_channel_id:

Row 2:
──────
table_engine:                  Kafka
event_date:                    2025-05-01
event_time:                    2025-05-01 10:34:53
event_time_microseconds:       2025-05-01 10:34:53.910944
database:                      default
table:                         kafka
error:                         无法解析输入:在以下内容之前应有 '\t': 'asdfghjkl': (at row 1)
:
Row 1:
Column 0,   name: key,   type: UInt64, ERROR: 文本 "asdfghjkl" 与 UInt64 类型不匹配
raw_message:                   asdfghjkl
kafka_topic_name:              TSV_dead_letter_queue_err_1746095689
kafka_partition:               0
kafka_offset:                  0
kafka_key:
rabbitmq_exchange_name:
rabbitmq_message_id:
rabbitmq_message_timestamp:    1970-01-01 00:00:00
rabbitmq_message_redelivered:  0
rabbitmq_message_delivery_tag: 0
rabbitmq_channel_id:

Row 3:
──────
table_engine:                  Kafka
event_date:                    2025-05-01
event_time:                    2025-05-01 10:34:53
event_time_microseconds:       2025-05-01 10:34:53.911092
database:                      default
table:                         kafka
error:                         无法解析输入:在以下内容之前应有 '\t': 'zxcvbnm': (at row 1)
:
Row 1:
Column 0,   name: key,   type: UInt64, ERROR: 文本 "zxcvbnm" 与 UInt64 类型不匹配
raw_message:                   zxcvbnm
kafka_topic_name:              TSV_dead_letter_queue_err_1746095689
kafka_partition:               0
kafka_offset:                  0
kafka_key:
rabbitmq_exchange_name:
rabbitmq_message_id:
rabbitmq_message_timestamp:    1970-01-01 00:00:00
rabbitmq_message_redelivered:  0
rabbitmq_message_delivery_tag: 0
rabbitmq_channel_id:
 (test.py:78, dead_letter_queue_test)

```

**另请参阅**

* [Kafka](/engines/table-engines/integrations/kafka.md) — Kafka 引擎
* [system.kafka&#95;consumers](/operations/system-tables/kafka_consumers.md) — `kafka_consumers` 系统表的说明，其中包含关于 Kafka 消费者的统计信息和错误等内容。
