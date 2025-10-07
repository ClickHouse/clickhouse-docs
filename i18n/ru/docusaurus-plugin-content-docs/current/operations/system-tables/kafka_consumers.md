---
slug: '/operations/system-tables/kafka_consumers'
description: 'Системная таблица, содержащая информацию о Kafka consumers.'
title: system.kafka_consumers
keywords: ['системная таблица', 'kafka_consumers']
doc_type: reference
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Содержит информацию о потребителях Kafka. Применимо для [Kafka table engine](../../engines/table-engines/integrations/kafka) (нативная интеграция ClickHouse)

Столбцы:

- `database` (String) - база данных таблицы с Kafka Engine.
- `table` (String) - имя таблицы с Kafka Engine.
- `consumer_id` (String) - идентификатор потребителя Kafka. Обратите внимание, что у таблицы может быть много потребителей. Указывается параметром `kafka_num_consumers`.
- `assignments.topic` (Array(String)) - топик Kafka.
- `assignments.partition_id` (Array(Int32)) - идентификатор партиции Kafka. Обратите внимание, что только один потребитель может быть назначен на партицию.
- `assignments.current_offset` (Array(Int64)) - текущий смещения.
- `exceptions.time` (Array(DateTime)) - временная метка, когда были сгенерированы 10 самых последних исключений.
- `exceptions.text` (Array(String)) - текст 10 самых последних исключений.
- `last_poll_time` (DateTime) - временная метка самого последнего опроса.
- `num_messages_read` (UInt64) - количество сообщений, прочитанных потребителем.
- `last_commit_time` (DateTime) - временная метка самого последнего коммита.
- `num_commits` (UInt64) - общее количество коммитов для потребителя.
- `last_rebalance_time` (DateTime) - временная метка самого последнего ребалансировки Kafka
- `num_rebalance_revocations` (UInt64) - количество раз, когда у потребителя были отозваны его партиции
- `num_rebalance_assignments` (UInt64) - количество раз, когда потребитель был назначен в кластер Kafka
- `is_currently_used` (UInt8) - потребитель в использовании
- `last_used` (UInt64) - последнее время, когда этот потребитель был использован, unix время в микросекундах
- `rdkafka_stat` (String) - внутренняя статистика библиотеки. Смотрите https://github.com/ClickHouse/librdkafka/blob/master/STATISTICS.md . Установите `statistics_interval_ms` в 0, чтобы отключить, по умолчанию 3000 (один раз в три секунды).

Пример:

```sql
SELECT *
FROM system.kafka_consumers
FORMAT Vertical
```

```text
Row 1:
──────
database:                   test
table:                      kafka
consumer_id:                ClickHouse-instance-test-kafka-1caddc7f-f917-4bb1-ac55-e28bd103a4a0
assignments.topic:          ['system_kafka_cons']
assignments.partition_id:   [0]
assignments.current_offset: [18446744073709550615]
exceptions.time:            []
exceptions.text:            []
last_poll_time:             2006-11-09 18:47:47
num_messages_read:          4
last_commit_time:           2006-11-10 04:39:40
num_commits:                1
last_rebalance_time:        1970-01-01 00:00:00
num_rebalance_revocations:  0
num_rebalance_assignments:  1
is_currently_used:          1
rdkafka_stat:               {...}

```