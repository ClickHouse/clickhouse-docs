---
'description': 'システムテーブルはKafkaの消費者に関する情報を含みます。'
'keywords':
- 'system table'
- 'kafka_consumers'
'slug': '/operations/system-tables/kafka_consumers'
'title': 'system.kafka_consumers'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Kafka 消費者に関する情報を含みます。
[Kafka テーブルエンジン](../../engines/table-engines/integrations/kafka)（ネイティブ ClickHouse 統合）に適用されます。

カラム：

- `database` (String) - Kafka エンジンを持つテーブルのデータベース。
- `table` (String) - Kafka エンジンを持つテーブルの名前。
- `consumer_id` (String) - Kafka 消費者識別子。テーブルには多くの消費者を持つことができることに注意してください。これは `kafka_num_consumers` パラメータで指定されています。
- `assignments.topic` (Array(String)) - Kafka トピック。
- `assignments.partition_id` (Array(Int32)) - Kafka パーティション ID。パーティションには一度に一つの消費者しか割り当てることができないことに注意してください。
- `assignments.current_offset` (Array(Int64)) - 現在のオフセット。
- `exceptions.time` (Array(DateTime)) - 直近 10 件の例外が生成されたタイムスタンプ。
- `exceptions.text` (Array(String)) - 直近 10 件の例外のテキスト。
- `last_poll_time` (DateTime) - 最後のポーリングのタイムスタンプ。
- `num_messages_read` (UInt64) - 消費者が読み取ったメッセージの数。
- `last_commit_time` (DateTime) - 最後のコミットのタイムスタンプ。
- `num_commits` (UInt64) - 消費者の総コミット数。
- `last_rebalance_time` (DateTime) - 最後の Kafka リバランスのタイムスタンプ。
- `num_rebalance_revocations` (UInt64) - 消費者がパーティションを取り消された回数。
- `num_rebalance_assignments` (UInt64) - 消費者が Kafka クラスターに割り当てられた回数。
- `is_currently_used` (UInt8) - 消費者が使用中。
- `last_used` (UInt64) - この消費者が最後に使用された時間、マイクロ秒単位の UNIX 時間。
- `rdkafka_stat` (String) - ライブラリの内部統計。詳細は [こちら](https://github.com/ClickHouse/librdkafka/blob/master/STATISTICS.md) を参照してください。 `statistics_interval_ms` を 0 に設定すると無効になり、デフォルトは 3000（3 秒ごとに 1 回）です。

例：

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
