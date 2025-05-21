---
'description': 'System table containing information about Kafka consumers.'
'keywords':
- 'system table'
- 'kafka_consumers'
'slug': '/operations/system-tables/kafka_consumers'
'title': 'system.kafka_consumers'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含有关 Kafka 消费者的信息。
适用于 [Kafka 表引擎](../../engines/table-engines/integrations/kafka) （原生 ClickHouse 集成）

列：

- `database` (String) - 使用 Kafka 引擎的表的数据库。
- `table` (String) - 使用 Kafka 引擎的表的名称。
- `consumer_id` (String) - Kafka 消费者标识符。注意，一个表可以有多个消费者。由 `kafka_num_consumers` 参数指定。
- `assignments.topic` (Array(String)) - Kafka 主题。
- `assignments.partition_id` (Array(Int32)) - Kafka 分区 id。注意，只有一个消费者可以被分配到一个分区。
- `assignments.current_offset` (Array(Int64)) - 当前 offset。
- `exceptions.time` (Array(DateTime)) - 最近 10 个异常生成的时间戳。
- `exceptions.text` (Array(String)) - 最近 10 个异常的文本。
- `last_poll_time` (DateTime) - 最近一次轮询的时间戳。
- `num_messages_read` (UInt64) - 消费者读取的消息数量。
- `last_commit_time` (DateTime) - 最近一次提交的时间戳。
- `num_commits` (UInt64) - 消费者的总提交次数。
- `last_rebalance_time` (DateTime) - 最近一次 Kafka 重新平衡的时间戳。
- `num_rebalance_revocations` (UInt64) - 消费者被撤销分区的次数。
- `num_rebalance_assignments` (UInt64) - 消费者被分配到 Kafka 集群的次数。
- `is_currently_used` (UInt8) - 消费者是否正在使用中。
- `last_used` (UInt64) - 该消费者最后一次使用的时间，unix 时间，单位为微秒。
- `rdkafka_stat` (String) - 库的内部统计信息。参见 https://github.com/ClickHouse/librdkafka/blob/master/STATISTICS.md 。设置 `statistics_interval_ms` 为 0 可以禁用，默认值为 3000（每三秒一次）。

示例：

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
