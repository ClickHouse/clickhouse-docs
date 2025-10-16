---
'description': 'Системная таблица, содержащая информацию о сообщениях, полученных
  через потоковый движок и разобранных с ошибками.'
'keywords':
- 'system table'
- 'dead_letter_queue'
'slug': '/operations/system-tables/dead_letter_queue'
'title': 'system.dead_letter_queue'
'doc_type': 'reference'
---
Содержит информацию о сообщениях, полученных через потоковый движок и распарсенных с ошибками. В настоящее время реализовано для Kafka и RabbitMQ.

Логирование включается, если указать `dead_letter_queue` для специфичной для движка настройки `handle_error_mode`.

Период сброса данных устанавливается в параметре `flush_interval_milliseconds` секции настроек сервера [dead_letter_queue](../../operations/server-configuration-parameters/settings.md#dead_letter_queue). Чтобы принудительно сбросить данные, используйте запрос [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs).

ClickHouse не удаляет данные из таблицы автоматически. См. [Введение](../../operations/system-tables/overview.md#system-tables-introduction) для получения дополнительной информации.

Колонки:

- `table_engine` ([Enum8](../../sql-reference/data-types/enum.md)) - Тип потока. Возможные значения: `Kafka` и `RabbitMQ`.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) - Дата потребления сообщения.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - Дата и время потребления сообщения.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) - Время потребления сообщения с точностью до микросекунд.
- `database` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) - База данных ClickHouse, к которой принадлежит потоковая таблица.
- `table` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) - Имя таблицы ClickHouse.
- `error` ([String](../../sql-reference/data-types/string.md)) - Текст ошибки.
- `raw_message` ([String](../../sql-reference/data-types/string.md)) - Тело сообщения.
- `kafka_topic_name` ([String](../../sql-reference/data-types/string.md)) - Имя темы Kafka.
- `kafka_partition` ([UInt64](../../sql-reference/data-types/int-uint.md)) - Раздел Kafka темы.
- `kafka_offset` ([UInt64](../../sql-reference/data-types/int-uint.md)) - Смещение Kafka сообщения.
- `kafka_key` ([String](../../sql-reference/data-types/string.md)) - Ключ Kafka сообщения.
- `rabbitmq_exchange_name` ([String](../../sql-reference/data-types/string.md)) - Имя обмена RabbitMQ.
- `rabbitmq_message_id` ([String](../../sql-reference/data-types/string.md)) - Идентификатор сообщения RabbitMQ.
- `rabbitmq_message_timestamp` ([DateTime](../../sql-reference/data-types/datetime.md)) - Временная метка сообщения RabbitMQ.
- `rabbitmq_message_redelivered` ([UInt8](../../sql-reference/data-types/int-uint.md)) - Флаг повторной доставки RabbitMQ.
- `rabbitmq_message_delivery_tag` ([UInt64](../../sql-reference/data-types/int-uint.md)) - Тег доставки RabbitMQ.
- `rabbitmq_channel_id` ([String](../../sql-reference/data-types/string.md)) - Идентификатор канала RabbitMQ.

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
error:                         Cannot parse input: expected '\t' before: 'qwertyuiop': (at row 1)
:
Row 1:
Column 0,   name: key,   type: UInt64, ERROR: text "qwertyuiop" is not like UInt64
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
error:                         Cannot parse input: expected '\t' before: 'asdfghjkl': (at row 1)
:
Row 1:
Column 0,   name: key,   type: UInt64, ERROR: text "asdfghjkl" is not like UInt64
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
error:                         Cannot parse input: expected '\t' before: 'zxcvbnm': (at row 1)
:
Row 1:
Column 0,   name: key,   type: UInt64, ERROR: text "zxcvbnm" is not like UInt64
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

- [Kafka](/engines/table-engines/integrations/kafka.md) - Движок Kafka
- [system.kafka_consumers](/operations/system-tables/kafka_consumers.md) — Описание системной таблицы `kafka_consumers`, которая содержит информацию, такую как статистика и ошибки о потребителях Kafka.