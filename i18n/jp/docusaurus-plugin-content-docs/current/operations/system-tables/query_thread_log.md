---
description: 'クエリを実行するスレッドに関する情報を含むシステムテーブルで、たとえばスレッド名、スレッドの開始時刻、クエリ処理の持続時間などが含まれます。'
keywords: ['system table', 'query_thread_log']
slug: /operations/system-tables/query_thread_log
title: 'system.query_thread_log'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.query_thread_log

<SystemTableCloud/>

クエリを実行するスレッドに関する情報を含みます。たとえば、スレッド名、スレッドの開始時刻、クエリ処理の持続時間などです。

ログを開始するには：

1.  [query_thread_log](/operations/server-configuration-parameters/settings#query_thread_log) セクションでパラメータを設定します。
2.  [log_query_threads](/operations/settings/settings#log_query_threads) を 1 に設定します。

データのフラッシュ間隔は、[query_thread_log](/operations/server-configuration-parameters/settings#query_thread_log) サーバー設定セクションの `flush_interval_milliseconds` パラメータで設定されます。フラッシュを強制するには、[SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) クエリを使用します。

ClickHouse はテーブルから自動的にデータを削除しません。詳細については、[Introduction](/operations/system-tables/overview#system-tables-introduction) を参照してください。

[log_queries_probability](/operations/settings/settings#log_queries_probability) 設定を使用して、`query_thread_log` テーブルに登録されるクエリ数を減らすことができます。

カラム：

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — スレッドがクエリの実行を完了した日付。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — スレッドがクエリの実行を完了した日付と時間。
- `event_time_microseconds` ([DateTime](../../sql-reference/data-types/datetime.md)) — スレッドがクエリの実行を完了した日付と時間（マイクロ秒精度）。
- `query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — クエリ実行の開始時刻。
- `query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — クエリ実行の開始時刻（マイクロ秒精度）。
- `query_duration_ms` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — クエリ実行の持続時間。
- `read_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 読み取った行の数。
- `read_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 読み取ったバイト数。
- `written_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `INSERT` クエリの場合、書き込まれた行の数。他のクエリの場合、カラム値は 0。
- `written_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `INSERT` クエリの場合、書き込まれたバイト数。他のクエリの場合、カラム値は 0。
- `memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — このスレッドの文脈における割り当てられたメモリと解放されたメモリの差。
- `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — このスレッドの文脈における割り当てられたメモリと解放されたメモリの最大差。
- `thread_name` ([String](../../sql-reference/data-types/string.md)) — スレッドの名前。
- `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — OS スレッド ID。
- `master_thread_id` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 初期スレッドの OS 初期 ID。
- `query` ([String](../../sql-reference/data-types/string.md)) — クエリ文字列。
- `is_initial_query` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — クエリタイプ。可能な値：
    - 1 — クエリはクライアントによって開始されました。
    - 0 — クエリは分散クエリ実行のために別のクエリによって開始されました。
- `user` ([String](../../sql-reference/data-types/string.md)) — 現在のクエリを開始したユーザーの名前。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — クエリの ID。
- `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — クエリを実行するために使用された IP アドレス。
- `port` ([UInt16](/sql-reference/data-types/int-uint#integer-ranges)) — クエリを実行するために使用されたクライアントポート。
- `initial_user` ([String](../../sql-reference/data-types/string.md)) — 初期クエリを実行したユーザーの名前（分散クエリ実行用）。
- `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 初期クエリの ID（分散クエリ実行用）。
- `initial_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 親クエリが開始された IP アドレス。
- `initial_port` ([UInt16](/sql-reference/data-types/int-uint#integer-ranges)) — 親クエリを実行するために使用されたクライアントポート。
- `interface` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — クエリが開始されたインターフェース。可能な値：
    - 1 — TCP。
    - 2 — HTTP。
- `os_user` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) を実行している OS のユーザー名。
- `client_hostname` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) または他の TCP クライアントが実行されているクライアントマシンのホスト名。
- `client_name` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) または他の TCP クライアントの名前。
- `client_revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) または他の TCP クライアントのリビジョン。
- `client_version_major` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) または他の TCP クライアントのメジャーバージョン。
- `client_version_minor` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) または他の TCP クライアントのマイナーバージョン。
- `client_version_patch` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) または他の TCP クライアントバージョンのパッチコンポーネント。
- `http_method` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — クエリを開始した HTTP メソッド。可能な値：
    - 0 — クエリは TCP インターフェースから実行されました。
    - 1 — `GET` メソッドが使用されました。
    - 2 — `POST` メソッドが使用されました。
- `http_user_agent` ([String](../../sql-reference/data-types/string.md)) — HTTP リクエストに渡された `UserAgent` ヘッダー。
- `quota_key` ([String](../../sql-reference/data-types/string.md)) — [quotas](../../operations/quotas.md) 設定で指定された「クォータキー」（`keyed`を参照）。
- `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouse リビジョン。
- `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/array.md)) — このスレッドのさまざまなメトリクスを測定する ProfileEvents。それらの説明は [system.events](/operations/system-tables/events) テーブルで確認できます。

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

- [system.query_log](/operations/system-tables/query_log) — クエリ実行に関する一般的な情報を含む `query_log` システムテーブルの説明。
- [system.query_views_log](/operations/system-tables/query_views_log) — このテーブルは、クエリ実行中に実行された各ビューに関する情報を含みます。
