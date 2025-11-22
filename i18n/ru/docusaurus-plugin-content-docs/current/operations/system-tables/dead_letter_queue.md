---
description: 'Системная таблица, содержащая информацию о сообщениях,
  полученных через стриминговый движок и разобранных с ошибками.'
keywords: ['системная таблица', 'dead_letter_queue']
slug: /operations/system-tables/dead_letter_queue
title: 'system.dead_letter_queue'
doc_type: 'reference'
---

Содержит информацию о сообщениях, полученных через стриминговый движок и разобранных с ошибками. В настоящее время реализовано для Kafka и RabbitMQ.

Логирование включается путём указания значения `dead_letter_queue` в параметре движка `handle_error_mode`.

Период сброса данных задаётся параметром `flush_interval_milliseconds` в разделе настроек сервера [dead&#95;letter&#95;queue](../../operations/server-configuration-parameters/settings.md#dead_letter_queue). Для принудительного сброса используйте запрос [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs).

ClickHouse не удаляет данные из этой таблицы автоматически. См. раздел [Введение](../../operations/system-tables/overview.md#system-tables-introduction) для получения дополнительных сведений.

Столбцы:

* `table_engine` ([Enum8](../../sql-reference/data-types/enum.md)) - Тип потока. Возможные значения: `Kafka` и `RabbitMQ`.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) - Дата потребления сообщения.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - Дата и время потребления сообщения.
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) - Время потребления сообщения с точностью до микросекунд.
* `database` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) - База данных ClickHouse, к которой относится стриминговая таблица.
* `table` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) - Имя таблицы ClickHouse.
* `error` ([String](../../sql-reference/data-types/string.md)) - Текст ошибки.
* `raw_message` ([String](../../sql-reference/data-types/string.md)) - Тело сообщения.
* `kafka_topic_name` ([String](../../sql-reference/data-types/string.md)) - Имя топика Kafka.
* `kafka_partition` ([UInt64](../../sql-reference/data-types/int-uint.md)) - Раздел топика Kafka.
* `kafka_offset` ([UInt64](../../sql-reference/data-types/int-uint.md)) - Смещение сообщения в Kafka.
* `kafka_key` ([String](../../sql-reference/data-types/string.md)) - Ключ сообщения в Kafka.
* `rabbitmq_exchange_name` ([String](../../sql-reference/data-types/string.md)) - Имя обменника RabbitMQ.
* `rabbitmq_message_id` ([String](../../sql-reference/data-types/string.md)) - Идентификатор сообщения RabbitMQ.
* `rabbitmq_message_timestamp` ([DateTime](../../sql-reference/data-types/datetime.md)) - Метка времени сообщения RabbitMQ.
* `rabbitmq_message_redelivered` ([UInt8](../../sql-reference/data-types/int-uint.md)) - Флаг повторной доставки в RabbitMQ.
* `rabbitmq_message_delivery_tag` ([UInt64](../../sql-reference/data-types/int-uint.md)) - Тег доставки RabbitMQ.
* `rabbitmq_channel_id` ([String](../../sql-reference/data-types/string.md)) - Идентификатор канала RabbitMQ.

**Пример**

Запрос:

```sql
SELECT * FROM system.dead_letter_queue LIMIT 1 \G;
```

Результат:


```text
Row 1:
──────
table_engine:                  Kafka
event_date:                    2025-05-01
event_time:                    2025-05-01 10:34:53
event_time_microseconds:       2025-05-01 10:34:53.910773
database:                      default
table:                         kafka
error:                         Не удалось разобрать входные данные: ожидался символ '\t' перед: 'qwertyuiop': (at row 1)
:
Row 1:
Column 0,   name: key,   type: UInt64, ERROR: текст "qwertyuiop" не соответствует типу UInt64
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
error:                         Не удалось разобрать входные данные: ожидался символ '\t' перед: 'asdfghjkl': (at row 1)
:
Row 1:
Column 0,   name: key,   type: UInt64, ERROR: текст "asdfghjkl" не соответствует типу UInt64
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
error:                         Не удалось разобрать входные данные: ожидался символ '\t' перед: 'zxcvbnm': (at row 1)
:
Row 1:
Column 0,   name: key,   type: UInt64, ERROR: текст "zxcvbnm" не соответствует типу UInt64
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

**См. также**

* [Kafka](/engines/table-engines/integrations/kafka.md) — движок Kafka
* [system.kafka&#95;consumers](/operations/system-tables/kafka_consumers.md) — описание системной таблицы `kafka_consumers`, содержащей статистику, сведения об ошибках и другую информацию о потребителях Kafka.
