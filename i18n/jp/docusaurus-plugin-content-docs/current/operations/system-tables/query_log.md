---
description: "実行されたクエリに関する情報を含むシステムテーブル、例えば、開始時間、処理の持続時間、エラーメッセージ。"
slug: /operations/system-tables/query_log
title: "system.query_log"
keywords: ["system table", "query_log"]
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

実行されたクエリに関する情報を含みます。例えば、開始時間、処理の持続時間、エラーメッセージ。

:::note
このテーブルには、`INSERT` クエリの取り込まれたデータは含まれません。
:::

クエリのログ記録設定は、サーバー設定の [query_log](../../operations/server-configuration-parameters/settings.md#query-log) セクションで変更できます。

クエリのログ記録を無効にするには、[log_queries = 0](/operations/settings/settings#log_queries) を設定します。情報が重要なため、ログ記録をオフにすることはお勧めできません。

データのフラッシュ間隔は、[query_log](../../operations/server-configuration-parameters/settings.md#query-log) サーバー設定セクションの `flush_interval_milliseconds` パラメータで設定されます。フラッシュを強制的に行うには、[SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) クエリを使用してください。

ClickHouseは自動的にテーブルからデータを削除しません。詳細については、[イントロダクション](/operations/system-tables/overview#system-tables-introduction) を参照してください。

`system.query_log` テーブルでは、2種類のクエリを登録します。

1.  クライアントによって直接実行された初期クエリ。
2.  他のクエリによって開始された子クエリ（分散クエリ実行のため）。これらのクエリタイプでは、親クエリに関する情報が `initial_*` カラムに表示されます。

各クエリは、クエリのステータスに応じて、`query_log` テーブルに1または2の行を作成します（`type` カラムを参照）。

1.  クエリの実行が成功した場合、`QueryStart` と `QueryFinish` のタイプの2つの行が作成されます。
2.  クエリ処理の際にエラーが発生した場合、`QueryStart` と `ExceptionWhileProcessing` のタイプの2つのイベントが作成されます。
3.  クエリの開始前にエラーが発生した場合、`ExceptionBeforeStart` タイプの単一のイベントが作成されます。

`query_log` テーブルに登録されるクエリの数を減らすには、[log_queries_probability](/operations/settings/settings#log_queries_probability) 設定を使用できます。

フォーマットされたクエリを `formatted_query` カラムにログ記録するには、[log_formatted_queries](/operations/settings/settings#log_formatted_queries) 設定を使用できます。

カラム:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `type` ([Enum8](../../sql-reference/data-types/enum.md)) — クエリ実行中に発生したイベントのタイプ。値:
    - `'QueryStart' = 1` — クエリ実行の成功開始。
    - `'QueryFinish' = 2` — クエリ実行の成功終了。
    - `'ExceptionBeforeStart' = 3` — クエリ実行前の例外。
    - `'ExceptionWhileProcessing' = 4` — クエリ実行中の例外。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — クエリの開始日。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — クエリの開始時間。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度のクエリ開始時間。
- `query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — クエリ実行開始時刻。
- `query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度のクエリ実行開始時刻。
- `query_duration_ms` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — クエリ実行の持続時間（ミリ秒）。
- `read_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — クエリに参加したすべてのテーブルおよびテーブル関数から読み取った行の合計数。通常のサブクエリ、`IN` および `JOIN` 用のサブクエリが含まれます。分散クエリの場合、`read_rows` はすべてのレプリカで読み取られた行の総数を含みます。各レプリカは `read_rows` の値を送信し、クエリのサーバー起動者がすべて受信した値とローカル値を要約します。キャッシュのボリュームはこの値に影響を与えません。
- `read_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — クエリに参加したすべてのテーブルおよびテーブル関数から読み取ったバイトの合計数。通常のサブクエリ、`IN` および `JOIN` 用のサブクエリが含まれます。分散クエリの場合、`read_bytes` はすべてのレプリカで読み取られた総バイト数を含みます。各レプリカは `read_bytes` の値を送信し、クエリのサーバー起動者がすべて受信した値とローカル値を要約します。キャッシュのボリュームはこの値に影響を与えません。
- `written_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `INSERT` クエリの場合、書き込まれた行の数。その他のクエリの場合、カラムの値は0。
- `written_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `INSERT` クエリの場合、書き込まれたバイト数（非圧縮）。その他のクエリの場合、カラムの値は0。
- `result_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `SELECT` クエリの結果の行数、または `INSERT` クエリの行数。
- `result_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — クエリ結果を格納するために使用されたRAMのバイト量。
- `memory_usage` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — クエリによるメモリ消費。
- `current_database` ([String](../../sql-reference/data-types/string.md)) — 現在のデータベースの名前。
- `query` ([String](../../sql-reference/data-types/string.md)) — クエリ文字列。
- `formatted_query` ([String](../../sql-reference/data-types/string.md)) — フォーマット済みのクエリ文字列。
- `normalized_query_hash` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — リテラルの値が異なるだけのクエリに対して同一である数値のハッシュ値。
- `query_kind` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — クエリのタイプ。
- `databases` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — クエリに関連するデータベースの名前。
- `tables` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — クエリに関連するテーブルの名前。
- `columns` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — クエリに関連するカラムの名前。
- `partitions` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — クエリに関連するパーティションの名前。
- `projections` ([String](../../sql-reference/data-types/string.md)) — クエリ実行中に使用されたプロジェクションの名前。
- `views` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — クエリに関連する（マテリアライズドまたはライブ）ビューの名前。
- `exception_code` ([Int32](../../sql-reference/data-types/int-uint.md)) — 例外のコード。
- `exception` ([String](../../sql-reference/data-types/string.md)) — 例外メッセージ。
- `stack_trace` ([String](../../sql-reference/data-types/string.md)) — [スタックトレース](https://en.wikipedia.org/wiki/Stack_trace)。クエリが成功裏に完了した場合は空の文字列。
- `is_initial_query` ([UInt8](../../sql-reference/data-types/int-uint.md)) — クエリタイプ。可能な値:
    - 1 — クエリがクライアントによって開始されました。
    - 0 — クエリが分散クエリ実行の一部として別のクエリによって開始されました。
- `user` ([String](../../sql-reference/data-types/string.md)) — 現在のクエリを開始したユーザーの名前。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — クエリのID。
- `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — クエリを実行するために使用されたIPアドレス。
- `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — クエリを実行するために使用されたクライアントポート。
- `initial_user` ([String](../../sql-reference/data-types/string.md)) — 初期クエリを実行したユーザーの名前（分散クエリ実行のため）。
- `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 初期クエリのID（分散クエリ実行のため）。
- `initial_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 親クエリが開始されたIPアドレス。
- `initial_port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 親クエリを実行するために使用されたクライアントポート。
- `initial_query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 初期クエリの開始時間（分散クエリ実行のため）。
- `initial_query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度の初期クエリの開始時間（分散クエリ実行のため）。
- `interface` ([UInt8](../../sql-reference/data-types/int-uint.md)) — クエリが開始されたインターフェース。可能な値:
    - 1 — TCP。
    - 2 — HTTP。
- `os_user` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) を実行するオペレーティングシステムのユーザー名。
- `client_hostname` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) または他のTCPクライアントが実行されているクライアントマシンのホスト名。
- `client_name` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) または他のTCPクライアントの名前。
- `client_revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) または他のTCPクライアントのリビジョン。
- `client_version_major` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) または他のTCPクライアントのメジャーバージョン。
- `client_version_minor` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) または他のTCPクライアントのマイナーバージョン。
- `client_version_patch` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) または他のTCPクライアントのパッチコンポーネント。
- `script_query_number` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) の複数のクエリを含むスクリプトの中のクエリ番号。
- `script_line_number` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) の複数のクエリを含むスクリプト内のクエリ開始の行番号。
- `http_method` (UInt8) — クエリを発動させたHTTPメソッド。可能な値:
    - 0 — TCPインターフェースからクエリが起動されました。
    - 1 — `GET` メソッドが使用されました。
    - 2 — `POST` メソッドが使用されました。
- `http_user_agent` ([String](../../sql-reference/data-types/string.md)) — HTTPクエリで渡されたHTTPヘッダー `UserAgent`。
- `http_referer` ([String](../../sql-reference/data-types/string.md)) — HTTPクエリで渡されたHTTPヘッダー `Referer`（クエリを発行したページの絶対または部分的なアドレスを含みます）。
- `forwarded_for` ([String](../../sql-reference/data-types/string.md)) — HTTPクエリで渡されたHTTPヘッダー `X-Forwarded-For`。
- `quota_key` ([String](../../sql-reference/data-types/string.md)) — [クォータ](../../operations/quotas.md) 設定で指定された `quota key`（`keyed` を参照）。 
- `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouseのリビジョン。
- `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/map.md)) — 異なるメトリクスを測るProfileEvents。これらの説明は [system.events](/operations/system-tables/events) テーブルで見つけることができます。
- `Settings` ([Map(String, String)](../../sql-reference/data-types/map.md)) — クライアントがクエリを実行したときに変更された設定。設定変更のログ記録を有効にするには、`log_query_settings` パラメータを1に設定します。
- `log_comment` ([String](../../sql-reference/data-types/string.md)) — ログコメント。これは[最大クエリサイズ](../../operations/settings/settings.md#max_query_size)より長くならない任意の文字列に設定できます。定義されていない場合は空の文字列です。
- `thread_ids` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — クエリ実行に参加しているスレッドID。これらのスレッドは同時に実行されていない場合があります。
- `peak_threads_usage` ([UInt64](../../sql-reference/data-types/int-uint.md)) — クエリを実行している最大同時スレッド数。
- `used_aggregate_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `aggregate functions` の標準名。
- `used_aggregate_function_combinators` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `aggregate functions combinators` の標準名。
- `used_database_engines` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `database engines` の標準名。
- `used_data_type_families` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `data type families` の標準名。
- `used_dictionaries` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `dictionaries` の標準名。XMLファイルを使用して設定された辞書の場合、辞書の名前であり、SQLステートメントによって作成された辞書の場合、標準名は完全修飾オブジェクト名です。
- `used_formats` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `formats` の標準名。
- `used_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `functions` の標準名。
- `used_storages` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `storages` の標準名。
- `used_table_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — クエリ実行中に使用された `table functions` の標準名。
- `used_privileges` ([Array(String)](../../sql-reference/data-types/array.md)) - クエリ実行中に正常にチェックされた権限。
- `missing_privileges` ([Array(String)](../../sql-reference/data-types/array.md)) - クエリ実行中に不足していた権限。
- `query_cache_usage` ([Enum8](../../sql-reference/data-types/enum.md)) — クエリ実行中の[クエリキャッシュ](../query-cache.md)の使用状況。値:
    - `'Unknown'` = ステータス不明。
    - `'None'` = クエリ結果はクエリキャッシュに書き込まれず、または読み取られませんでした。
    - `'Write'` = クエリ結果がクエリキャッシュに書き込まれました。
    - `'Read'` = クエリ結果がクエリキャッシュから読み取られました。

**例**

``` sql
SELECT * FROM system.query_log WHERE type = 'QueryFinish' ORDER BY query_start_time DESC LIMIT 1 FORMAT Vertical;
```

``` text
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
used_privileges:                       []
missing_privileges:                    []
query_cache_usage:                     None
```

**関連情報**

- [system.query_thread_log](/operations/system-tables/query_thread_log) — このテーブルには、各クエリ実行スレッドに関する情報が含まれています。
