---
'description': '스트리밍 엔진을 통해 수신된 메시지에 대한 정보를 포함하고 오류로 파싱된 시스템 테이블.'
'keywords':
- 'system table'
- 'dead_letter_queue'
'slug': '/operations/system-tables/dead_letter_queue'
'title': 'system.dead_letter_queue'
'doc_type': 'reference'
---

메시지 스트리밍 엔진을 통해 수신된 메시지와 오류로 파싱된 메시지에 대한 정보를 포함합니다. 현재 Kafka와 RabbitMQ에 대해 구현되어 있습니다.

로깅은 엔진 특정 `handle_error_mode` 설정에 대해 `dead_letter_queue`를 지정하여 활성화됩니다.

데이터의 플러시 주기는 [dead_letter_queue](../../operations/server-configuration-parameters/settings.md#dead_letter_queue) 서버 설정 섹션의 `flush_interval_milliseconds` 매개변수에 설정됩니다. 플러시를 강제로 수행하려면 [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) 쿼리를 사용하세요.

ClickHouse는 테이블에서 데이터를 자동으로 삭제하지 않습니다. 자세한 내용은 [Introduction](../../operations/system-tables/overview.md#system-tables-introduction)를 참조하세요.

컬럼:

- `table_engine` ([Enum8](../../sql-reference/data-types/enum.md)) - 스트림 유형. 가능한 값: `Kafka` 및 `RabbitMQ`.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) - 메시지 소비 날짜.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - 메시지 소비 날짜 및 시간.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) - 마이크로초 정밀도의 메시지 소비 시간.
- `database` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) - 스트리밍 테이블이 속한 ClickHouse 데이터베이스.
- `table` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) - ClickHouse 테이블 이름.
- `error` ([String](../../sql-reference/data-types/string.md)) - 오류 텍스트.
- `raw_message` ([String](../../sql-reference/data-types/string.md)) - 메시지 본문.
- `kafka_topic_name` ([String](../../sql-reference/data-types/string.md)) - Kafka 주제 이름.
- `kafka_partition` ([UInt64](../../sql-reference/data-types/int-uint.md)) - 주제의 Kafka 파티션.
- `kafka_offset` ([UInt64](../../sql-reference/data-types/int-uint.md)) - 메시지의 Kafka 오프셋.
- `kafka_key` ([String](../../sql-reference/data-types/string.md)) - 메시지의 Kafka 키.
- `rabbitmq_exchange_name` ([String](../../sql-reference/data-types/string.md)) - RabbitMQ 교환 이름.
- `rabbitmq_message_id` ([String](../../sql-reference/data-types/string.md)) - RabbitMQ 메시지 ID.
- `rabbitmq_message_timestamp` ([DateTime](../../sql-reference/data-types/datetime.md)) - RabbitMQ 메시지 타임스탬프.
- `rabbitmq_message_redelivered` ([UInt8](../../sql-reference/data-types/int-uint.md)) - RabbitMQ 재전송 플래그.
- `rabbitmq_message_delivery_tag` ([UInt64](../../sql-reference/data-types/int-uint.md)) - RabbitMQ 배달 태그.
- `rabbitmq_channel_id` ([String](../../sql-reference/data-types/string.md)) - RabbitMQ 채널 ID.

**예시**

쿼리:

```sql
SELECT * FROM system.dead_letter_queue LIMIT 1 \G;
```

결과:

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

**참고**

- [Kafka](/engines/table-engines/integrations/kafka.md) - Kafka 엔진
- [system.kafka_consumers](/operations/system-tables/kafka_consumers.md) — Kafka 소비자에 대한 통계 및 오류와 같은 정보를 포함하는 `kafka_consumers` 시스템 테이블 설명.
