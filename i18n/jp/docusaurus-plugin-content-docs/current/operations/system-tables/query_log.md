---
description: '実行されたクエリに関する情報を含むシステムテーブルです。たとえば、開始時刻、処理時間、エラーメッセージなどが含まれます。'
keywords: ['システムテーブル', 'query_log']
slug: /operations/system-tables/query_log
title: 'system.query_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.query_log {#systemquery_log}

<SystemTableCloud/>

実行されたクエリのメタデータおよび統計情報（開始時刻、実行時間、エラーメッセージ、リソース使用量、その他の実行詳細など）を保存します。クエリ結果自体は保存しません。 

クエリのログ記録に関する設定は、サーバー設定の [query_log](../../operations/server-configuration-parameters/settings.md#query_log) セクションで変更できます。

[log_queries = 0](/operations/settings/settings#log_queries) を設定することで、クエリのログ記録を無効にできます。ただし、このテーブルに含まれる情報は問題の解決に重要であるため、ログを無効にすることは推奨しません。

データのフラッシュ間隔は、サーバー設定の [query_log](../../operations/server-configuration-parameters/settings.md#query_log) セクションにある `flush_interval_milliseconds` パラメータで設定します。フラッシュを即時に実行するには、[SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) クエリを使用します。

ClickHouse はこのテーブルからデータを自動的に削除しません。詳細については [Introduction](/operations/system-tables/overview#system-tables-introduction) を参照してください。

`system.query_log` テーブルには、次の 2 種類のクエリが記録されます。

1. クライアントによって直接実行された初期クエリ。
2. （分散クエリ実行のために）他のクエリによって開始された子クエリ。この種類のクエリについては、親クエリに関する情報が `initial_*` 列に表示されます。

各クエリは、そのステータス（`type` 列を参照）に応じて、`query_log` テーブルに 1 行または 2 行が作成されます。

1. クエリが正常に実行された場合、`QueryStart` と `QueryFinish` タイプの 2 行が作成されます。
2. クエリ処理中にエラーが発生した場合、`QueryStart` と `ExceptionWhileProcessing` タイプの 2 つのイベントが作成されます。
3. クエリを開始する前にエラーが発生した場合、`ExceptionBeforeStart` タイプの単一のイベントが作成されます。

[log_queries_probability](/operations/settings/settings#log_queries_probability) 設定を使用して、`query_log` テーブルに記録されるクエリ数を減らすことができます。

[log_formatted_queries](/operations/settings/settings#log_formatted_queries) 設定を使用して、フォーマット済みクエリを `formatted_query` 列に記録できます。



## カラム {#columns}



* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
* `type` ([Enum8](../../sql-reference/data-types/enum.md)) — クエリの実行時に発生したイベントの種別。値：
  * `'QueryStart' = 1` — クエリ実行が正常に開始されたことを示します。
  * `'QueryFinish' = 2` — クエリ実行が正常に終了したことを示します。
  * `'ExceptionBeforeStart' = 3` — クエリ実行の開始前に例外が発生したことを示します。
  * `'ExceptionWhileProcessing' = 4` — クエリ実行中に例外が発生したことを示します。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — クエリの開始日。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — クエリの開始時刻。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度のクエリの開始時刻。
* `query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — クエリ実行の開始時刻。
* `query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度でのクエリ実行開始時刻。
* `query_duration_ms` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — クエリの実行時間（ミリ秒単位）。
* `read_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — クエリに参加したすべてのテーブルおよびテーブル関数から読み取られた行の総数です。通常のサブクエリに加え、`IN` や `JOIN` 用のサブクエリも含まれます。分散クエリの場合、`read_rows` にはすべてのレプリカで読み取られた行の総数が含まれます。各レプリカは自身の `read_rows` の値を送信し、クエリのイニシエータであるサーバーが、受信した値とローカルの値を合計します。キャッシュ量はこの値に影響しません。
* `read_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — クエリに関与したすべてのテーブルおよびテーブル関数から読み取られたバイト数の合計です。通常のサブクエリに加え、`IN` および `JOIN` のサブクエリも含まれます。分散クエリの場合、`read_bytes` にはすべてのレプリカで読み取られたバイト数の合計が含まれます。各レプリカはそれぞれの `read_bytes` の値を送信し、クエリのイニシエータであるサーバーが、受信した値とローカルの値を合算します。キャッシュの使用量はこの値に影響しません。
* `written_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `INSERT` クエリでは書き込まれた行数です。それ以外のクエリでは、この列の値は 0 です。
* `written_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `INSERT` クエリでは書き込まれたバイト数（非圧縮）を表します。それ以外のクエリでは、この列の値は 0 です。
* `result_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `SELECT` クエリ結果の行数、または `INSERT` クエリで挿入される行数。
* `result_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — クエリ結果の保存に使用される RAM の容量（バイト単位）。
* `memory_usage` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — クエリによって消費されたメモリ量。
* `current_database` ([String](../../sql-reference/data-types/string.md)) — 現在のデータベースの名前。
* `query` ([String](../../sql-reference/data-types/string.md)) — クエリ文字列。
* `formatted_query` ([String](../../sql-reference/data-types/string.md)) — 整形済みのクエリ文字列。
* `normalized_query_hash` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — リテラルの値だけが異なるクエリであれば同一になるように計算された数値ハッシュ。
* `query_kind` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — クエリの種別。
* `databases` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — クエリ内で参照されているデータベース名。
* `tables` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — クエリ内に含まれるテーブルの名前。
* `columns` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — クエリ内に含まれる列名。
* `partitions` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — クエリに含まれるパーティション名。
* `projections` ([String](../../sql-reference/data-types/string.md)) — クエリ実行時に使用されるプロジェクション名。
* `views` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — クエリに含まれる（マテリアライズドビューまたはライブビュー）の名前。
* `exception_code` ([Int32](../../sql-reference/data-types/int-uint.md)) — 例外コード。
* `exception` ([String](../../sql-reference/data-types/string.md)) — 例外メッセージ。
* `stack_trace` ([String](../../sql-reference/data-types/string.md)) — [スタックトレース](https://en.wikipedia.org/wiki/Stack_trace)。クエリが正常に完了した場合は空文字列となります。
* `is_initial_query` ([UInt8](../../sql-reference/data-types/int-uint.md)) — クエリ種別。取りうる値:
  * 1 — クエリがクライアントによって開始された。
  * 0 — クエリが、分散クエリ実行の一部として別のクエリから開始された。
* `user` ([String](../../sql-reference/data-types/string.md)) — 現在のクエリを実行したユーザー名。
* `query_id` ([String](../../sql-reference/data-types/string.md)) — クエリ ID。
* `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — クエリの実行に使用されたIPアドレス。
* `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — クエリの送信に使用されたクライアントポート。
* `initial_user` ([String](../../sql-reference/data-types/string.md)) — 初期クエリを実行したユーザー名（分散クエリ実行時）。
* `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 分散クエリ実行における初期クエリの ID。
* `initial_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 親クエリが実行された送信元 IP アドレス。
* `initial_port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 親クエリの発行に使用されたクライアントポート。
* `initial_query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 分散クエリ実行における初期クエリの開始時刻。
* `initial_query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 分散クエリ実行時の初期クエリ開始時刻（マイクロ秒精度）。
* `interface` ([UInt8](../../sql-reference/data-types/int-uint.md)) — クエリが発行されたインターフェイス。取りうる値:
  * 1 — TCP。
  * 2 — HTTP。
* `os_user` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) を実行している OS のユーザー名。
* `client_hostname` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) またはその他の TCP クライアントが実行されているクライアントマシン上のホスト名。
* `client_name` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) または別の TCP クライアントの名前。
* `client_revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) またはその他の TCP クライアントのリビジョン番号。
* `client_version_major` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) または別の TCP クライアントのメジャーバージョン番号。
* `client_version_minor` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) または別の TCP クライアントのマイナーバージョン。
* `client_version_patch` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) またはその他の TCP クライアントのバージョン番号のパッチ部分。
* `script_query_number` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 用の、複数のクエリを含むスクリプト内におけるクエリ番号。
* `script_line_number` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 複数のクエリを含むスクリプト内で、[clickhouse-client](../../interfaces/cli.md) 用クエリの開始行番号。
* `http_method` (UInt8) — クエリを実行した HTTP メソッド。取りうる値:
  * 0 — クエリはTCPインターフェイスから実行されました。
  * 1 — `GET`メソッドが使用されました。
  * 2 — `POST`メソッドが使用されました。
* `http_user_agent` ([String](../../sql-reference/data-types/string.md)) — HTTP クエリで送信された HTTP ヘッダー `UserAgent`。
* `http_referer` ([String](../../sql-reference/data-types/string.md)) — HTTP クエリで送信される HTTP ヘッダー `Referer`（クエリを発行したページの絶対 URL または一部の URL を含む）。
* `forwarded_for` ([String](../../sql-reference/data-types/string.md)) — HTTP クエリで送信される HTTP ヘッダー `X-Forwarded-For`。
* `quota_key` ([String](../../sql-reference/data-types/string.md)) — [quotas](../../operations/quotas.md) 設定で指定される `quota key`（`keyed` を参照）。
* `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouse のリビジョン番号。
* `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/map.md)) — さまざまな指標を計測する ProfileEvents。これらの説明はテーブル [system.events](/operations/system-tables/events) に記載されています。
* `Settings` ([Map(String, String)](../../sql-reference/data-types/map.md)) — クライアントがクエリを実行したときに変更された設定。設定変更のログ記録を有効にするには、`log_query_settings` パラメータを 1 に設定します。
* `log_comment` ([String](../../sql-reference/data-types/string.md)) — ログコメント。任意の文字列を設定できますが、その長さは [max&#95;query&#95;size](../../operations/settings/settings.md#max_query_size) を超えてはなりません。定義されていない場合は空文字列です。
* `thread_ids` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — クエリ実行に関与したスレッド ID。これらのスレッドが同時に実行されていたとは限りません。
* `peak_threads_usage` ([UInt64)](../../sql-reference/data-types/int-uint.md)) — クエリの実行に使用された同時スレッド数の最大値。
* `used_aggregate_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `aggregate functions` の正準名。
* `used_aggregate_function_combinators` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `aggregate function combinators` の正規名。
* `used_database_engines` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用されたデータベースエンジンのカノニカル名。
* `used_data_type_families` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `data type families` の正準名。
* `used_dictionaries` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `dictionaries` の正規名。XML ファイルで設定されたディクショナリの場合はそのディクショナリ名であり、SQL ステートメントで作成されたディクショナリの場合は、正規名は完全修飾オブジェクト名になります。
* `used_formats` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `formats` の正規名。
* `used_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行時に使用された `functions` の正規名。
* `used_storages` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `storages` の正規名。
* `used_table_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリの実行中に使用された `table functions` の正規名。
* `used_executable_user_defined_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `executable user defined functions` の正規名。
* `used_sql_user_defined_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリの実行中に使用された `sql user defined functions` の正規名。
* `used_privileges` ([Array(String)](../../sql-reference/data-types/array.md)) - クエリ実行中にアクセスチェックに成功した権限。
* `missing_privileges` ([Array(String)](../../sql-reference/data-types/array.md)) - クエリ実行時に不足している権限。
* `query_cache_usage` ([Enum8](../../sql-reference/data-types/enum.md)) — クエリ実行中における [query cache](../query-cache.md) の使用状況。値：
  * `'Unknown'` = ステータスは不明。
  * `'None'` = クエリ結果はクエリキャッシュへの書き込みも読み取りも行われなかった。
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

**クラウドでの例**

ClickHouse Cloud では、`system.query_log` は各ノードにローカルであるため、すべてのエントリを確認するには [`clusterAllReplicas`](/sql-reference/table-functions/cluster) 経由でクエリする必要があります。

たとえば、「default」クラスタ内のすべてのレプリカから `query_log` の行を集約するには、次のように書けます。

```sql
SELECT * 
FROM clusterAllReplicas('default', system.query_log)
WHERE event_time >= now() - toIntervalHour(1)
LIMIT 10
SETTINGS skip_unavailable_shards = 1;
```

**関連項目**

* [system.query&#95;thread&#95;log](/operations/system-tables/query_thread_log) — このテーブルには、各クエリ実行スレッドに関する情報が含まれています。
