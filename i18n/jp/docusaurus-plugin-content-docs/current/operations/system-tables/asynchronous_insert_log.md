---
'description': '非同期挿入に関する情報を含むシステムテーブル。各エントリは非同期挿入クエリが非同期挿入クエリにバッファリングされたことを表します。'
'keywords':
- 'system table'
- 'asynchronous_insert_log'
'slug': '/operations/system-tables/asynchronous_insert_log'
'title': 'system.asynchronous_insert_log'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.asynchronous_insert_log

<SystemTableCloud/>

非同期挿入に関する情報を含みます。各エントリは、非同期挿入クエリにバッファリングされた挿入クエリを表します。

ログ記録を開始するには、[asynchronous_insert_log](../../operations/server-configuration-parameters/settings.md#asynchronous_insert_log) セクションでパラメータを設定してください。

データのフラッシュ期間は、[asynchronous_insert_log](../../operations/server-configuration-parameters/settings.md#asynchronous_insert_log) サーバー設定セクションの `flush_interval_milliseconds` パラメータで設定されます。フラッシュを強制するには、[SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) クエリを使用してください。

ClickHouseはテーブルからデータを自動的に削除しません。詳細については、[Introduction](/operations/system-tables/overview#system-tables-introduction)をご覧ください。

カラム:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 非同期挿入が発生した日付。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 非同期挿入が実行を終了した日付と時間。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度で非同期挿入が実行を終了した日付と時間。
- `query` ([String](../../sql-reference/data-types/string.md)) — クエリ文字列。
- `database` ([String](../../sql-reference/data-types/string.md)) — テーブルが存在するデータベースの名前。
- `table` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
- `format` ([String](/sql-reference/data-types/string.md)) — フォーマット名。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — 初期クエリのID。
- `bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 挿入されたバイト数。
- `exception` ([String](../../sql-reference/data-types/string.md)) — 例外メッセージ。
- `status` ([Enum8](../../sql-reference/data-types/enum.md)) — ビューのステータス。値は次の通りです:
    - `'Ok' = 1` — 挿入が成功しました。
    - `'ParsingError' = 2` — データを解析中に例外が発生しました。
    - `'FlushError' = 3` — データをフラッシュ中に例外が発生しました。
- `flush_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — フラッシュが発生した日付と時間。
- `flush_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度でフラッシュが発生した日付と時間。
- `flush_query_id` ([String](../../sql-reference/data-types/string.md)) — フラッシュクエリのID。

**例**

クエリ:

```sql
SELECT * FROM system.asynchronous_insert_log LIMIT 1 \G;
```

結果:

```text
hostname:                clickhouse.eu-central1.internal
event_date:              2023-06-08
event_time:              2023-06-08 10:08:53
event_time_microseconds: 2023-06-08 10:08:53.199516
query:                   INSERT INTO public.data_guess (user_id, datasource_id, timestamp, path, type, num, str) FORMAT CSV
database:                public
table:                   data_guess
format:                  CSV
query_id:                b46cd4c4-0269-4d0b-99f5-d27668c6102e
bytes:                   133223
exception:
status:                  Ok
flush_time:              2023-06-08 10:08:55
flush_time_microseconds: 2023-06-08 10:08:55.139676
flush_query_id:          cd2c1e43-83f5-49dc-92e4-2fbc7f8d3716
```

**関連情報**

- [system.query_log](../../operations/system-tables/query_log) — クエリ実行に関する一般的な情報を含む `query_log` システムテーブルの説明。
- [system.asynchronous_inserts](/operations/system-tables/asynchronous_inserts) — このテーブルには、キューに保留中の非同期挿入に関する情報が含まれています。
