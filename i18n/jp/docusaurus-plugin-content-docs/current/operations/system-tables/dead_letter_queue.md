---
'description': 'システムテーブルには、ストリーミングエンジンを介して受信したメッセージとエラーで解析された情報が含まれています。'
'keywords':
- 'system table'
- 'dead_letter_queue'
'slug': '/operations/system-tables/dead_letter_queue'
'title': 'system.dead_letter_queue'
'doc_type': 'reference'
---

Contains information about messages received via a streaming engine and parsed with errors. Currently implemented for Kafka and RabbitMQ.

Logging is enabled by specifying `dead_letter_queue` for the engine specific `handle_error_mode` setting.

The flushing period of data is set in `flush_interval_milliseconds` parameter of the [dead_letter_queue](../../operations/server-configuration-parameters/settings.md#dead_letter_queue) server settings section. To force flushing, use the [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) query.

ClickHouse does not delete data from the table automatically. See [Introduction](../../operations/system-tables/overview.md#system-tables-introduction) for more details.

Columns:

- `table_engine` ([Enum8](../../sql-reference/data-types/enum.md)) - ストリームタイプ。可能な値: `Kafka` と `RabbitMQ`。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) - メッセージ消費日。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - メッセージ消費日時。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) - マイクロ秒精度のメッセージ消費時間。
- `database` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) - ストリーミングテーブルが所属する ClickHouse データベース。
- `table` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) - ClickHouse テーブル名。
- `error` ([String](../../sql-reference/data-types/string.md)) - エラーテキスト。
- `raw_message` ([String](../../sql-reference/data-types/string.md)) - メッセージ本体。
- `kafka_topic_name` ([String](../../sql-reference/data-types/string.md)) - Kafka トピック名。
- `kafka_partition` ([UInt64](../../sql-reference/data-types/int-uint.md)) - トピックの Kafka パーティション。
- `kafka_offset` ([UInt64](../../sql-reference/data-types/int-uint.md)) - メッセージの Kafka オフセット。
- `kafka_key` ([String](../../sql-reference/data-types/string.md)) - メッセージの Kafka キー。
- `rabbitmq_exchange_name` ([String](../../sql-reference/data-types/string.md)) - RabbitMQ エクスチェンジ名。
- `rabbitmq_message_id` ([String](../../sql-reference/data-types/string.md)) - RabbitMQ メッセージ ID。
- `rabbitmq_message_timestamp` ([DateTime](../../sql-reference/data-types/datetime.md)) - RabbitMQ メッセージのタイムスタンプ。
- `rabbitmq_message_redelivered` ([UInt8](../../sql-reference/data-types/int-uint.md)) - RabbitMQ 再配達フラグ。
- `rabbitmq_message_delivery_tag` ([UInt64](../../sql-reference/data-types/int-uint.md)) - RabbitMQ デリバリタグ。
- `rabbitmq_channel_id` ([String](../../sql-reference/data-types/string.md)) - RabbitMQ チャンネル ID。

**Example**

Query:

```sql
SELECT * FROM system.dead_letter_queue LIMIT 1 \G;
```

Result:

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

**See Also**

- [Kafka](/engines/table-engines/integrations/kafka.md) - Kafka エンジン
- [system.kafka_consumers](/operations/system-tables/kafka_consumers.md) — Kafka コンシューマに関する統計やエラーの情報が含まれる `kafka_consumers` システムテーブルの説明。
