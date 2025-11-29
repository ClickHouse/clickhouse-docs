---
description: 'ストリーミングエンジン経由で受信され、パース時にエラーが発生したメッセージに関する情報を保持するシステムテーブル。'
keywords: ['system table', 'dead_letter_queue']
slug: /operations/system-tables/dead_letter_queue
title: 'system.dead_letter_queue'
doc_type: 'reference'
---

ストリーミングエンジン経由で受信され、パース時にエラーが発生したメッセージに関する情報を保持します。現在は Kafka と RabbitMQ 向けに実装されています。

エンジン固有の `handle_error_mode` 設定に `dead_letter_queue` を指定することで、ロギングが有効になります。

データのフラッシュ間隔は、サーバー設定セクション [dead&#95;letter&#95;queue](../../operations/server-configuration-parameters/settings.md#dead_letter_queue) の `flush_interval_milliseconds` パラメータで設定します。フラッシュを強制するには、[SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) クエリを使用します。

ClickHouse はテーブルからデータを自動的には削除しません。詳細は [Introduction](../../operations/system-tables/overview.md#system-tables-introduction) を参照してください。

列:

* `table_engine` ([Enum8](../../sql-reference/data-types/enum.md)) - ストリームの種類。取りうる値: `Kafka` と `RabbitMQ`。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) - メッセージを消費した日付。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) - メッセージを消費した日時。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) - マイクロ秒精度のメッセージ消費時刻。
* `database` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) - ストリーミングテーブルが属する ClickHouse データベース。
* `table` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) - ClickHouse テーブル名。
* `error` ([String](../../sql-reference/data-types/string.md)) - エラーの内容。
* `raw_message` ([String](../../sql-reference/data-types/string.md)) - メッセージ本文。
* `kafka_topic_name` ([String](../../sql-reference/data-types/string.md)) - Kafka トピック名。
* `kafka_partition` ([UInt64](../../sql-reference/data-types/int-uint.md)) - トピックの Kafka パーティション。
* `kafka_offset` ([UInt64](../../sql-reference/data-types/int-uint.md)) - メッセージの Kafka オフセット。
* `kafka_key` ([String](../../sql-reference/data-types/string.md)) - メッセージの Kafka キー。
* `rabbitmq_exchange_name` ([String](../../sql-reference/data-types/string.md)) - RabbitMQ Exchange 名。
* `rabbitmq_message_id` ([String](../../sql-reference/data-types/string.md)) - RabbitMQ メッセージ ID。
* `rabbitmq_message_timestamp` ([DateTime](../../sql-reference/data-types/datetime.md)) - RabbitMQ メッセージのタイムスタンプ。
* `rabbitmq_message_redelivered` ([UInt8](../../sql-reference/data-types/int-uint.md)) - RabbitMQ の再配信フラグ。
* `rabbitmq_message_delivery_tag` ([UInt64](../../sql-reference/data-types/int-uint.md)) - RabbitMQ の delivery tag。
* `rabbitmq_channel_id` ([String](../../sql-reference/data-types/string.md)) - RabbitMQ チャネル ID。

**例**

クエリ:

```sql
SELECT * FROM system.dead_letter_queue LIMIT 1 \G;
```

結果：


```text
Row 1:
──────
table_engine:                  Kafka
event_date:                    2025-05-01
event_time:                    2025-05-01 10:34:53
event_time_microseconds:       2025-05-01 10:34:53.910773
database:                      default
table:                         kafka
error:                         入力を解析できません: 次の文字の前に '\t' が必要です: 'qwertyuiop': (at row 1)
:
Row 1:
Column 0,   name: key,   type: UInt64, ERROR: テキスト "qwertyuiop" はUInt64形式ではありません
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
error:                         入力を解析できません: 次の文字の前に '\t' が必要です: 'asdfghjkl': (at row 1)
:
Row 1:
Column 0,   name: key,   type: UInt64, ERROR: テキスト "asdfghjkl" はUInt64形式ではありません
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
error:                         入力を解析できません: 次の文字の前に '\t' が必要です: 'zxcvbnm': (at row 1)
:
Row 1:
Column 0,   name: key,   type: UInt64, ERROR: テキスト "zxcvbnm" はUInt64形式ではありません
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

**関連項目**

* [Kafka](/engines/table-engines/integrations/kafka.md) - Kafka エンジン
* [system.kafka&#95;consumers](/operations/system-tables/kafka_consumers.md) — Kafka コンシューマに関する統計情報やエラーなどの情報を含む `kafka_consumers` システムテーブルの説明です。
