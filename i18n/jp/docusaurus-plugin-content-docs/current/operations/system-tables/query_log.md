---
description: '実行されたクエリに関する情報を含むシステムテーブル。例えば、開始時刻、処理に要した時間、エラーメッセージなど。'
keywords: ['system table', 'query_log']
slug: /operations/system-tables/query_log
title: 'system.query_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.query_log

<SystemTableCloud/>

開始時刻、実行時間、エラーメッセージ、リソース使用量、その他の実行に関する詳細など、実行されたクエリのメタデータと統計情報を保存します。クエリの結果は保存しません。

クエリログの設定は、サーバー設定の [query_log](../../operations/server-configuration-parameters/settings.md#query_log) セクションで変更できます。

[log_queries = 0](/operations/settings/settings#log_queries) を設定することで、クエリログを無効にできます。ただし、このテーブルの情報は問題解決に重要であるため、ログの無効化は推奨しません。

データのフラッシュ間隔は、サーバー設定の [query_log](../../operations/server-configuration-parameters/settings.md#query_log) セクションにある `flush_interval_milliseconds` パラメータで設定します。フラッシュを強制するには、[SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) クエリを使用します。

ClickHouse はこのテーブルからデータを自動削除しません。詳細は [Introduction](/operations/system-tables/overview#system-tables-introduction) を参照してください。

`system.query_log` テーブルは、次の 2 種類のクエリを記録します:

1.  クライアントによって直接実行された初期クエリ。
2.  （分散クエリ実行のために）他のクエリによって実行される子クエリ。この種のクエリについては、親クエリに関する情報が `initial_*` 列に表示されます。

各クエリは、そのステータス（`type` 列を参照）に応じて、`query_log` テーブルに 1 行または 2 行を作成します:

1.  クエリ実行が成功した場合、`QueryStart` と `QueryFinish` タイプの 2 行が作成されます。
2.  クエリ処理中にエラーが発生した場合、`QueryStart` と `ExceptionWhileProcessing` タイプの 2 つのイベントが作成されます。
3.  クエリの実行開始前にエラーが発生した場合、`ExceptionBeforeStart` タイプの 1 つのイベントが作成されます。

`query_log` テーブルに記録されるクエリ数を減らすには、[log_queries_probability](/operations/settings/settings#log_queries_probability) 設定を使用できます。

整形済みクエリを `formatted_query` 列に記録するには、[log_formatted_queries](/operations/settings/settings#log_formatted_queries) 設定を使用できます。



## カラム {#columns}


* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
* `type` ([Enum8](../../sql-reference/data-types/enum.md)) — クエリ実行時に発生したイベントの種別。値：`
  * `'QueryStart' = 1` — クエリ実行を正常に開始したことを示します。
  * `'QueryFinish' = 2` — クエリ実行が正常に終了したことを示します。
  * `'ExceptionBeforeStart' = 3` — クエリ実行の開始前に例外が発生したことを示します。
  * `'ExceptionWhileProcessing' = 4` — クエリ実行中に例外が発生したことを示します。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — クエリ開始日。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — クエリの開始時刻。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒単位の精度で表されるクエリの開始時刻。
* `query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — クエリ実行開始時刻。
* `query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒単位の精度で示されるクエリ実行開始時刻。
* `query_duration_ms` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — クエリの実行時間（ミリ秒単位）。
* `read_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — クエリに関与したすべてのテーブルおよびテーブル関数から読み取られた行の合計数です。通常のサブクエリに加え、`IN` および `JOIN` 用のサブクエリも含まれます。分散クエリの場合、`read_rows` にはすべてのレプリカで読み取られた行数の合計が含まれます。各レプリカは自身の `read_rows` の値を送信し、クエリを開始したサーバーが、受信した値とローカルの値を集計します。キャッシュの利用状況やキャッシュ量はこの値に影響しません。
* `read_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — クエリの実行に参加したすべてのテーブルおよびテーブル関数から読み取られたバイト数の合計。通常のサブクエリに加え、`IN` および `JOIN` 用のサブクエリも含まれます。分散クエリでは、`read_bytes` にはすべてのレプリカで読み取られたバイト数の合計が含まれます。各レプリカはそれぞれの `read_bytes` の値を送信し、クエリを開始したサーバーが、受信した値とローカルの値をすべて合算します。キャッシュされたデータ量はこの値に影響しません。
* `written_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `INSERT` クエリの場合は、書き込まれた行数を表します。その他のクエリでは、この列の値は 0 です。
* `written_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `INSERT` クエリの場合、書き込まれたバイト数（非圧縮時）。その他のクエリの場合、この列の値は 0 です。
* `result_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `SELECT` クエリ結果の行数、または `INSERT` クエリで扱われる行数。
* `result_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — クエリ結果の保存に使用された RAM 容量（バイト単位）。
* `memory_usage` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — クエリによるメモリ使用量。
* `current_database` ([String](../../sql-reference/data-types/string.md)) — 現在のデータベースの名前。
* `query` ([String](../../sql-reference/data-types/string.md)) — クエリ文字列。
* `formatted_query` ([String](../../sql-reference/data-types/string.md)) — フォーマットされたクエリ文字列。
* `normalized_query_hash` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — リテラルの値だけが異なるクエリでは同一になる数値ハッシュ値。
* `query_kind` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — クエリの種別。
* `databases` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — クエリで使用されているデータベース名。
* `tables` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — クエリに含まれるテーブル名。
* `columns` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — クエリ内に含まれる列名。
* `partitions` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — クエリに含まれるパーティションの名前。
* `projections` ([String](../../sql-reference/data-types/string.md)) — クエリ実行時に使用されたプロジェクション名。
* `views` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — クエリに含まれる（マテリアライズドまたはライブ）ビューの名前。
* `exception_code` ([Int32](../../sql-reference/data-types/int-uint.md)) — 例外コード。
* `exception` ([String](../../sql-reference/data-types/string.md)) — 例外メッセージ。
* `stack_trace` ([String](../../sql-reference/data-types/string.md)) — [スタックトレース](https://en.wikipedia.org/wiki/Stack_trace)。クエリが正常に完了した場合は空文字列になります。
* `is_initial_query` ([UInt8](../../sql-reference/data-types/int-uint.md)) — クエリ種別。可能な値は次のとおりです：
  * 1 — クエリがクライアントによって開始された。
  * 0 — クエリが分散クエリ実行の一部として、別のクエリによって開始された。
* `user` ([String](../../sql-reference/data-types/string.md)) — 現在のクエリを実行したユーザー名。
* `query_id` ([String](../../sql-reference/data-types/string.md)) — クエリ ID。
* `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — クエリの発行に使用された IP アドレス。
* `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — クエリの発行に使用されたクライアントポート。
* `initial_user` ([String](../../sql-reference/data-types/string.md)) — 分散クエリ実行時に、最初に実行されたクエリのユーザー名。
* `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 分散クエリ実行時の最初のクエリの ID。
* `initial_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 親クエリが発行された送信元 IP アドレス。
* `initial_port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 親クエリの発行に使用されたクライアントポート。
* `initial_query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 分散クエリ実行における初回クエリの開始時刻。
* `initial_query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 初期クエリの開始時刻（分散クエリ実行時のマイクロ秒精度）。
* `interface` ([UInt8](../../sql-reference/data-types/int-uint.md)) — クエリが開始されたインターフェース。取り得る値:
  * 1 — TCP。
  * 2 — HTTP。
* `os_user` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) を実行するオペレーティングシステムのユーザー名。
* `client_hostname` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) またはその他の TCP クライアントが実行されているクライアントマシンのホスト名。
* `client_name` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) または別の TCP クライアントの名前。
* `client_revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) または他のTCPクライアントのリビジョン番号。
* `client_version_major` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) またはその他の TCP クライアントのメジャーバージョン。
* `client_version_minor` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) または別の TCP クライアントのマイナーバージョン。
* `client_version_patch` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) または他の TCP クライアントのバージョン番号におけるパッチコンポーネント。
* `script_query_number` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 複数クエリを含むスクリプト内での [clickhouse-client](../../interfaces/cli.md) 用のクエリ番号。
* `script_line_number` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 複数のクエリを含む、[clickhouse-client](../../interfaces/cli.md) 用スクリプト内でのクエリ開始行番号。
* `http_method` (UInt8) — クエリを発行した HTTP メソッド。取りうる値:
  * 0 — クエリは TCP インターフェイス経由で実行されました。
  * 1 — `GET` メソッドが使用されました。
  * 2 — `POST` メソッドが使用されました。
* `http_user_agent` ([String](../../sql-reference/data-types/string.md)) — HTTP クエリで送信される HTTP ヘッダー `UserAgent` の値。
* `http_referer` ([String](../../sql-reference/data-types/string.md)) — HTTP リクエストで送信された HTTP ヘッダー `Referer`（リクエストを送信したページの絶対または部分的なアドレスを含む）。
* `forwarded_for` ([String](../../sql-reference/data-types/string.md)) — HTTP クエリに含まれる HTTP ヘッダー `X-Forwarded-For`。
* `quota_key` ([String](../../sql-reference/data-types/string.md)) — [quotas](../../operations/quotas.md) 設定（`keyed` を参照）で指定された `quota key`。
* `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouse のリビジョン番号。
* `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/map.md)) — ProfileEvents によって計測されるさまざまなメトリクス。これらの詳細な説明は [system.events](/operations/system-tables/events) テーブルに記載されています。
* `Settings` ([Map(String, String)](../../sql-reference/data-types/map.md)) — クライアントがクエリを実行したときに変更された設定。設定変更のログ取得を有効にするには、`log_query_settings` パラメータを 1 に設定します。
* `log_comment` ([String](../../sql-reference/data-types/string.md)) — ログコメント。[max&#95;query&#95;size](../../operations/settings/settings.md#max_query_size) 以下の任意の文字列を設定できます。未定義の場合は空文字列になります。
* `thread_ids` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — クエリ実行に参加しているスレッドID。これらのスレッドが同時に実行されているとは限りません。
* `peak_threads_usage` ([UInt64)](../../sql-reference/data-types/int-uint.md)) — クエリ実行に使用された同時スレッド数の最大値。
* `used_aggregate_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `aggregate functions`（集約関数）の正規名。
* `used_aggregate_function_combinators` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `aggregate function combinators` の正規名。
* `used_database_engines` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `database engines` の正準名。
* `used_data_type_families` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `data type families` のカノニカル名。
* `used_dictionaries` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `dictionaries` の正規名。XML ファイルで構成された辞書の場合はその辞書名であり、SQL ステートメントで作成された辞書の場合は、正規名は完全修飾オブジェクト名となります。
* `used_formats` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリの実行中に使用された `formats` の正規名。
* `used_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `functions` の正準名。
* `used_storages` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `storages` の正準名。
* `used_table_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用されたテーブル関数 (`table functions`) の正規名。
* `used_executable_user_defined_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `executable user defined functions` のカノニカル名。
* `used_sql_user_defined_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行時に使用された SQL ユーザー定義関数の正規名。
* `used_privileges` ([Array(String)](../../sql-reference/data-types/array.md)) - クエリ実行中に正常に検証された権限。
* `missing_privileges` ([Array(String)](../../sql-reference/data-types/array.md)) - クエリの実行時に不足している権限。
* `query_cache_usage` ([Enum8](../../sql-reference/data-types/enum.md)) — クエリ実行時における[クエリキャッシュ](../query-cache.md)の使用状況。値：
  * `'Unknown'` = ステータスは不明。
  * `'None'` = クエリ結果はクエリキャッシュに書き込まれず、また読み取られなかった。
  * `'Write'` = クエリ結果がクエリキャッシュに書き込まれた。
  * `'Read'` = クエリ結果がクエリキャッシュから読み取られた。





## 例 {#examples}

**基本的な例**

```sql
SELECT * FROM system.query_log WHERE type = 'QueryFinish' ORDER BY query_start_time DESC LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
hostname:                              clickhouse.eu-central1.internal
type:                                  QueryFinish
event_date:                            2021-11-03
event_time:                            2021-11-03 16:13:54
event_time_microseconds:               2021-11-03 16:13:54.953024
query_start_time:                      2021-11-03 16:13:54
query_start_time_microseconds:         2021-11-03 16:13:54.952325
query_duration_ms:                     0
read_rows:                             69
read_bytes:                            6187
written_rows:                          0
written_bytes:                         0
result_rows:                           69
result_bytes:                          48256
memory_usage:                          0
current_database:                      default
query:                                 DESCRIBE TABLE system.query_log
formatted_query:
normalized_query_hash:                 8274064835331539124
query_kind:
databases:                             []
tables:                                []
columns:                               []
projections:                           []
views:                                 []
exception_code:                        0
exception:
stack_trace:
is_initial_query:                      1
user:                                  default
query_id:                              7c28bbbb-753b-4eba-98b1-efcbe2b9bdf6
address:                               ::ffff:127.0.0.1
port:                                  40452
initial_user:                          default
initial_query_id:                      7c28bbbb-753b-4eba-98b1-efcbe2b9bdf6
initial_address:                       ::ffff:127.0.0.1
initial_port:                          40452
initial_query_start_time:              2021-11-03 16:13:54
initial_query_start_time_microseconds: 2021-11-03 16:13:54.952325
interface:                             1
os_user:                               sevirov
client_hostname:                       clickhouse.eu-central1.internal
client_name:                           ClickHouse
client_revision:                       54449
client_version_major:                  21
client_version_minor:                  10
client_version_patch:                  1
http_method:                           0
http_user_agent:
http_referer:
forwarded_for:
quota_key:
revision:                              54456
log_comment:
thread_ids:                            [30776,31174]
ProfileEvents:                         {'Query':1,'NetworkSendElapsedMicroseconds':59,'NetworkSendBytes':2643,'SelectedRows':69,'SelectedBytes':6187,'ContextLock':9,'RWLockAcquiredReadLocks':1,'RealTimeMicroseconds':817,'UserTimeMicroseconds':427,'SystemTimeMicroseconds':212,'OSCPUVirtualTimeMicroseconds':639,'OSReadChars':894,'OSWriteChars':319}
Settings:                              {'load_balancing':'random','max_memory_usage':'10000000000'}
used_aggregate_functions:              []
used_aggregate_function_combinators:   []
used_database_engines:                 []
used_data_type_families:               []
used_dictionaries:                     []
used_formats:                          []
used_functions:                        []
used_storages:                         []
used_table_functions:                  []
used_executable_user_defined_functions:[]
used_sql_user_defined_functions:       []
used_privileges:                       []
missing_privileges:                    []
query_cache_usage:                     None
```

**Cloudの例**

ClickHouse Cloudでは、`system.query_log`は各ノードにローカルです。すべてのエントリを表示するには、[`clusterAllReplicas`](/sql-reference/table-functions/cluster)を使用してクエリを実行する必要があります。

例えば、"default"クラスター内のすべてのレプリカからquery_logの行を集約するには、次のように記述します。

```sql
SELECT *
FROM clusterAllReplicas('default', system.query_log)
WHERE event_time >= now() - toIntervalHour(1)
LIMIT 10
SETTINGS skip_unavailable_shards = 1;
```

**関連項目**

- [system.query_thread_log](/operations/system-tables/query_thread_log) — このテーブルには、各クエリ実行スレッドに関する情報が含まれています。
