---
description: "Kafkaコンシューマーに関する情報を含むシステムテーブル。"
slug: /operations/system-tables/kafka_consumers
title: "kafka_consumers"
keywords: ["システムテーブル", "kafka_consumers"]
---
import SystemTableCloud from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Kafkaコンシューマーに関する情報を含んでいます。  
[Kafkaテーブルエンジン](../../engines/table-engines/integrations/kafka)（ClickHouseのネイティブ統合）に適用可能です。

### カラム:

- `database` (String) - Kafkaエンジンを持つテーブルのデータベース。
- `table` (String) - Kafkaエンジンを持つテーブルの名前。
- `consumer_id` (String) - Kafkaコンシューマー識別子。テーブルには多くのコンシューマーが存在する可能性があります。これは `kafka_num_consumers` パラメーターで指定されます。
- `assignments.topic` (Array(String)) - Kafkaトピック。
- `assignments.partition_id` (Array(Int32)) - KafkaパーティションID。パーティションには一つのコンシューマーのみが割り当てられることに注意してください。
- `assignments.current_offset` (Array(Int64)) - 現在のオフセット。
- `exceptions.time` (Array(DateTime)) - 最近発生した10件の例外が生成されたタイムスタンプ。
- `exceptions.text` (Array(String)) - 最近の10件の例外のテキスト。
- `last_poll_time` (DateTime) - 最近のポーリングのタイムスタンプ。
- `num_messages_read` (UInt64) - コンシューマーによって読み取られたメッセージの数。
- `last_commit_time` (DateTime) - 最近のコミットのタイムスタンプ。
- `num_commits` (UInt64) - コンシューマーのためのコミットの合計数。
- `last_rebalance_time` (DateTime) - 最近のKafkaリバランスのタイムスタンプ。
- `num_rebalance_revocations` (UInt64) - コンシューマーがパーティションを取り消された回数。
- `num_rebalance_assignments` (UInt64) - コンシューマーがKafkaクラスターに割り当てられた回数。
- `is_currently_used` (UInt8) - コンシューマーが使用中であるかどうか。
- `last_used` (UInt64) - このコンシューマーが最後に使用された時刻、マイクロ秒でのUnix時間。
- `rdkafka_stat` (String) - ライブラリ内部の統計情報。詳細については [こちら](https://github.com/ClickHouse/librdkafka/blob/master/STATISTICS.md) を参照してください。`statistics_interval_ms` を 0 に設定すると無効になり、デフォルトは3000ms（3秒ごと）です。

### 例:

``` sql
SELECT *
FROM system.kafka_consumers
FORMAT Vertical
```

``` text
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
