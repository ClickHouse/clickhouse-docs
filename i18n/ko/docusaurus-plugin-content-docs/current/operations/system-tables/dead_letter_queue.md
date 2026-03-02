---
description: '스트리밍 엔진을 통해 수신된 메시지 중 파싱 오류가 발생한 메시지에 대한 정보를 포함하는 시스템 테이블입니다.'
keywords: ['system table', 'dead_letter_queue']
slug: /operations/system-tables/dead_letter_queue
title: 'system.dead_letter_queue'
doc_type: 'reference'
---

스트리밍 엔진을 통해 수신된 메시지 중 파싱 오류가 발생한 메시지에 대한 정보를 포함합니다. 현재 Kafka와 RabbitMQ에 대해 구현되어 있습니다.

엔진별 `handle_error_mode` 설정에 `dead_letter_queue`를 지정하면 로깅이 활성화됩니다.

데이터 플러시 주기는 서버 설정 섹션 [dead&#95;letter&#95;queue](../../operations/server-configuration-parameters/settings.md#dead_letter_queue)의 `flush_interval_milliseconds` 매개변수에서 설정합니다. 강제로 플러시하려면 [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) 쿼리를 사용합니다.

ClickHouse는 테이블에서 데이터를 자동으로 삭제하지 않습니다. 자세한 내용은 [소개](../../operations/system-tables/overview.md#system-tables-introduction)를 참조하십시오.

컬럼:

* `table_engine` ([Enum8](../../sql-reference/data-types/enum.md)) - 스트림 유형입니다. 가능한 값은 `Kafka`와 `RabbitMQ`입니다.
* `event_date` ([Date](../../sql-reference/data-types/date.md)) - 메시지를 소비한 날짜입니다.
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - 메시지를 소비한 날짜와 시간입니다.
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) - 마이크로초 단위 정밀도의 메시지 소비 시각입니다.
* `database` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) - 스트리밍 테이블이 속한 ClickHouse 데이터베이스입니다.
* `table` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) - ClickHouse 테이블 이름입니다.
* `error` ([String](../../sql-reference/data-types/string.md)) - 오류 텍스트입니다.
* `raw_message` ([String](../../sql-reference/data-types/string.md)) - 메시지 본문입니다.
* `kafka_topic_name` ([String](../../sql-reference/data-types/string.md)) - Kafka 토픽 이름입니다.
* `kafka_partition` ([UInt64](../../sql-reference/data-types/int-uint.md)) - 토픽의 Kafka 파티션입니다.
* `kafka_offset` ([UInt64](../../sql-reference/data-types/int-uint.md)) - 메시지의 Kafka 오프셋입니다.
* `kafka_key` ([String](../../sql-reference/data-types/string.md)) - 메시지의 Kafka 키입니다.
* `rabbitmq_exchange_name` ([String](../../sql-reference/data-types/string.md)) - RabbitMQ 익스체인지 이름입니다.
* `rabbitmq_message_id` ([String](../../sql-reference/data-types/string.md)) - RabbitMQ 메시지 ID입니다.
* `rabbitmq_message_timestamp` ([DateTime](../../sql-reference/data-types/datetime.md)) - RabbitMQ 메시지 타임스탬프입니다.
* `rabbitmq_message_redelivered` ([UInt8](../../sql-reference/data-types/int-uint.md)) - RabbitMQ 재전달 플래그입니다.
* `rabbitmq_message_delivery_tag` ([UInt64](../../sql-reference/data-types/int-uint.md)) - RabbitMQ 딜리버리 태그입니다.
* `rabbitmq_channel_id` ([String](../../sql-reference/data-types/string.md)) - RabbitMQ 채널 ID입니다.

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

**추가 참고**

* [Kafka](/engines/table-engines/integrations/kafka.md) - Kafka 엔진
* [system.kafka&#95;consumers](/operations/system-tables/kafka_consumers.md) — Kafka consumer의 통계와 오류 등의 정보를 포함하는 `kafka_consumers` 시스템 테이블에 대한 설명입니다.
