---
'description': '系统表包含有关 Kafka 消费者的信息。'
'keywords':
- 'system table'
- 'kafka_consumers'
'slug': '/operations/system-tables/kafka_consumers'
'title': 'system.kafka_consumers'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含有关 Kafka 消费者的信息。
适用于 [Kafka 表引擎](../../engines/table-engines/integrations/kafka)（原生 ClickHouse 集成）

列：

- `database` (字符串) - Kafka 引擎表的数据库。
- `table` (字符串) - Kafka 引擎表的名称。
- `consumer_id` (字符串) - Kafka 消费者标识符。注意，一个表可以有多个消费者。由 `kafka_num_consumers` 参数指定。
- `assignments.topic` (数组(字符串)) - Kafka 主题。
- `assignments.partition_id` (数组(整型)) - Kafka 分区 ID。注意，每个分区只能分配给一个消费者。
- `assignments.current_offset` (数组(64 位整型)) - 当前偏移量。
- `exceptions.time` (数组(日期时间)) - 生成最近 10 个异常的时间戳。
- `exceptions.text` (数组(字符串)) - 最近 10 个异常的文本。
- `last_poll_time` (日期时间) - 最近一次轮询的时间戳。
- `num_messages_read` (无符号 64 位整型) - 消费者读取的消息数量。
- `last_commit_time` (日期时间) - 最近一次提交的时间戳。
- `num_commits` (无符号 64 位整型) - 消费者的总提交次数。
- `last_rebalance_time` (日期时间) - 最近一次 Kafka 重新平衡的时间戳。
- `num_rebalance_revocations` (无符号 64 位整型) - 消费者被撤销分区的次数。
- `num_rebalance_assignments` (无符号 64 位整型) - 消费者被分配到 Kafka 集群的次数。
- `is_currently_used` (无符号 8 位整型) - 消费者是否在使用中。
- `last_used` (无符号 64 位整型) - 此消费者最后一次使用的时间，单位为微秒的 unix 时间。
- `rdkafka_stat` (字符串) - 库的内部统计信息。请参见 https://github.com/ClickHouse/librdkafka/blob/master/STATISTICS.md。将 `statistics_interval_ms` 设置为 0 以禁用，默认值为 3000（每三秒一次）。

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
