---
description: 'クエリを実行するスレッドに関する情報（スレッド名、スレッドの開始時刻、クエリ処理時間など）を含むシステムテーブル。'
keywords: ['system table', 'query_thread_log']
slug: /operations/system-tables/query_thread_log
title: 'system.query_thread_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.query&#95;thread&#95;log {#systemquery&#95;thread&#95;log}

<SystemTableCloud />

クエリを実行するスレッドに関する情報を含みます。たとえば、スレッド名、スレッドの開始時刻、クエリ処理時間などです。

ログの記録を開始するには:

1. [query&#95;thread&#95;log](/operations/server-configuration-parameters/settings#query_thread_log) セクションでパラメータを設定します。
2. [log&#95;query&#95;threads](/operations/settings/settings#log_query_threads) を 1 に設定します。

データのフラッシュ間隔は、[query&#95;thread&#95;log](/operations/server-configuration-parameters/settings#query_thread_log) のサーバー設定セクション内にある `flush_interval_milliseconds` パラメータで設定します。フラッシュを強制的に実行するには、[SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) クエリを使用します。

ClickHouse はテーブルからデータを自動的には削除しません。詳細は [Introduction](/operations/system-tables/overview#system-tables-introduction) を参照してください。

`query_thread_log` テーブルに登録されるクエリ数を減らすには、[log&#95;queries&#95;probability](/operations/settings/settings#log_queries_probability) 設定を使用できます。

Columns:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行するサーバーのホスト名。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — スレッドがクエリの実行を完了した日付。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — スレッドがクエリの実行を完了した日時。
* `event_time_microseconds` ([DateTime](../../sql-reference/data-types/datetime.md)) — スレッドがクエリの実行を完了した日時（マイクロ秒精度まで）。
* `query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — クエリ実行開始時刻。
* `query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — クエリ実行の開始時刻（マイクロ秒単位の精度）。
* `query_duration_ms` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — クエリの実行時間。
* `read_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 読み込まれた行数。
* `read_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 読み込まれたバイト数。
* `written_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `INSERT` クエリでは書き込まれた行数を示します。それ以外のクエリでは、この列の値は 0 です。
* `written_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `INSERT` クエリの場合は書き込まれたバイト数。それ以外のクエリの場合、この列の値は 0 になります。
* `memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — このスレッドのコンテキストにおいて、割り当てられたメモリ量と解放されたメモリ量の差を表します。
* `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — このスレッドのコンテキストにおいて、割り当てられたメモリ量と解放されたメモリ量の差が最大となったときの値。
* `thread_name` ([String](../../sql-reference/data-types/string.md)) — スレッドの名前。
* `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — OS のスレッド ID。
* `master_thread_id` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — OS によって割り当てられた最初のスレッドの ID。
* `query` ([String](../../sql-reference/data-types/string.md)) — クエリを表す文字列。
* `is_initial_query` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — クエリの種類。取りうる値：
  * 1 — クエリがクライアントによって開始された場合。
  * 0 — 分散クエリ実行のために、別のクエリから開始された場合。
* `user` ([String](../../sql-reference/data-types/string.md)) — 現在のクエリを実行したユーザー名。
* `query_id` ([String](../../sql-reference/data-types/string.md)) — クエリ ID。
* `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — クエリの実行に使用されたIPアドレス。
* `port` ([UInt16](/sql-reference/data-types/int-uint#integer-ranges)) — クエリの送信に使用されたクライアントのポート番号。
* `initial_user` ([String](../../sql-reference/data-types/string.md)) — 初回のクエリを実行したユーザー名（分散クエリ実行時）。
* `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 分散クエリ実行における初期クエリの ID。
* `initial_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 親クエリが実行された元の IP アドレス。
* `initial_port` ([UInt16](/sql-reference/data-types/int-uint#integer-ranges)) — 親クエリの実行に使用されたクライアントポート。
* `interface` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — クエリがどのインターフェイスから実行されたかを表します。取り得る値:
  * 1 — TCP
  * 2 — HTTP
* `os_user` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) を実行する OS のユーザー名。
* `client_hostname` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) または他の TCP クライアントが実行されているクライアントマシンのホスト名です。
* `client_name` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) または別の TCP クライアントの名前。
* `client_revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) またはその他の TCP クライアントのリビジョン番号。
* `client_version_major` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) またはその他の TCP クライアントのメジャーバージョン。
* `client_version_minor` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) またはその他の TCP クライアントのマイナーバージョン。
* `client_version_patch` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) または他の TCP クライアントのバージョンのパッチ番号。
* `http_method` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — クエリを発行した HTTP メソッド。取りうる値:
  * 0 — クエリは TCPインターフェイスから実行されました。
  * 1 — `GET` メソッドが使用されました。
  * 2 — `POST` メソッドが使用されました。
* `http_user_agent` ([String](../../sql-reference/data-types/string.md)) — HTTP リクエストで渡された `UserAgent` ヘッダー。
* `quota_key` ([String](../../sql-reference/data-types/string.md)) — [quotas](../../operations/quotas.md) 設定で指定される「quota key」（`keyed` を参照）です。
* `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouse のリビジョン番号。
* `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/array.md)) — このスレッドに関するさまざまなメトリクスを測定する `ProfileEvents`。各イベントの説明は、[system.events](/operations/system-tables/events) テーブルで確認できます。

**例**

```sql
 SELECT * FROM system.query_thread_log LIMIT 1 \G
```

```text
Row 1:
──────
hostname:                      clickhouse.eu-central1.internal
event_date:                    2020-09-11
event_time:                    2020-09-11 10:08:17
event_time_microseconds:       2020-09-11 10:08:17.134042
query_start_time:              2020-09-11 10:08:17
query_start_time_microseconds: 2020-09-11 10:08:17.063150
query_duration_ms:             70
read_rows:                     0
read_bytes:                    0
written_rows:                  1
written_bytes:                 12
memory_usage:                  4300844
peak_memory_usage:             4300844
thread_name:                   TCPHandler
thread_id:                     638133
master_thread_id:              638133
query:                         INSERT INTO test1 VALUES
is_initial_query:              1
user:                          default
query_id:                      50a320fd-85a8-49b8-8761-98a86bcbacef
address:                       ::ffff:127.0.0.1
port:                          33452
initial_user:                  default
initial_query_id:              50a320fd-85a8-49b8-8761-98a86bcbacef
initial_address:               ::ffff:127.0.0.1
initial_port:                  33452
interface:                     1
os_user:                       bharatnc
client_hostname:               tower
client_name:                   ClickHouse
client_revision:               54437
client_version_major:          20
client_version_minor:          7
client_version_patch:          2
http_method:                   0
http_user_agent:
quota_key:
revision:                      54440
ProfileEvents:        {'Query':1,'SelectQuery':1,'ReadCompressedBytes':36,'CompressedReadBufferBlocks':1,'CompressedReadBufferBytes':10,'IOBufferAllocs':1,'IOBufferAllocBytes':89,'ContextLock':15,'RWLockAcquiredReadLocks':1}
```

**関連項目**

* [system.query&#95;log](/operations/system-tables/query_log) — クエリの実行に関する共通情報を含む `query_log` システムテーブルの説明。
* [system.query&#95;views&#95;log](/operations/system-tables/query_views_log) — クエリ中に実行された各ビューに関する情報を含むシステムテーブル。
