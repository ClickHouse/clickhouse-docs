import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含关于 Kafka 消费者的信息。
适用于 [Kafka 表引擎](../../engines/table-engines/integrations/kafka)（原生 ClickHouse 集成）

列：

- `database` (String) - 具有 Kafka 引擎的表所在的数据库。
- `table` (String) - 具有 Kafka 引擎的表的名称。
- `consumer_id` (String) - Kafka 消费者标识符。注意，一个表可以有多个消费者。由 `kafka_num_consumers` 参数指定。
- `assignments.topic` (Array(String)) - Kafka 主题。
- `assignments.partition_id` (Array(Int32)) - Kafka 分区 ID。注意，一个分区只能指定一个消费者。
- `assignments.current_offset` (Array(Int64)) - 当前偏移量。
- `exceptions.time` (Array(DateTime)) - 最近 10 个异常生成的时间戳。
- `exceptions.text` (Array(String)) - 最近 10 个异常的文本。
- `last_poll_time` (DateTime) - 最近一次轮询的时间戳。
- `num_messages_read` (UInt64) - 消费者读取的消息数量。
- `last_commit_time` (DateTime) - 最近一次提交的时间戳。
- `num_commits` (UInt64) - 消费者的提交总数。
- `last_rebalance_time` (DateTime) - 最近一次 Kafka 再平衡的时间戳。
- `num_rebalance_revocations` (UInt64) - 消费者被撤销其分区的次数。
- `num_rebalance_assignments` (UInt64) - 消费者被分配到 Kafka 集群的次数。
- `is_currently_used` (UInt8) - 消费者是否正在使用中。
- `last_used` (UInt64) - 此消费者最后一次使用的时间，单位是微秒的 unix 时间。
- `rdkafka_stat` (String) - 库内部统计信息。请参见 https://github.com/ClickHouse/librdkafka/blob/master/STATISTICS.md 。将 `statistics_interval_ms` 设置为 0 以禁用，默认值为 3000（每三秒一次）。

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
