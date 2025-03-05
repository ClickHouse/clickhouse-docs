---
description: "非同期挿入に関する情報を含むシステムテーブル。各エントリは非同期挿入クエリにバッファリングされた挿入クエリを表します。"
slug: /operations/system-tables/asynchronous_insert_log
title: "system.asynchronous_insert_log"
keywords: ["system table", "asynchronous_insert_log"]
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

非同期挿入に関する情報を含みます。各エントリは非同期挿入クエリにバッファリングされた挿入クエリを表します。

ロギングを開始するには、[asynchronous_insert_log](../../operations/server-configuration-parameters/settings.md#asynchronous_insert_log) セクションでパラメータを設定してください。

データのフラッシュ周期は、[asynchronous_insert_log](../../operations/server-configuration-parameters/settings.md#asynchronous_insert_log) サーバー設定セクションの `flush_interval_milliseconds` パラメータに設定されています。フラッシュを強制するには、[SYSTEM FLUSH LOGS](../../sql-reference/statements/system.md#query_language-system-flush_logs) クエリを使用してください。

ClickHouseは、テーブルからデータを自動的に削除することはありません。詳細については、[Introduction](/operations/system-tables/overview#system-tables-introduction) を参照してください。

カラム:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 非同期挿入が発生した日付。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 非同期挿入が完了した日時。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒単位の精度で非同期挿入が完了した日時。
- `query` ([String](../../sql-reference/data-types/string.md)) — クエリ文字列。
- `database` ([String](../../sql-reference/data-types/string.md)) — テーブルが存在するデータベースの名前。
- `table` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
- `format` ([String](/sql-reference/data-types/string.md)) — フォーマット名。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — 初期クエリのID。
- `bytes` ([UInt64](../../sql-reference/data-types/int-uint.md#uint-ranges)) — 挿入されたバイト数。
- `exception` ([String](../../sql-reference/data-types/string.md)) — 例外メッセージ。
- `status` ([Enum8](../../sql-reference/data-types/enum.md)) — ビューのステータス。値:
    - `'Ok' = 1` — 挿入成功。
    - `'ParsingError' = 2` — データ解析時の例外。
    - `'FlushError' = 3` — データフラッシュ時の例外。
- `flush_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — フラッシュが発生した日時。
- `flush_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒単位の精度でフラッシュが発生した日時。
- `flush_query_id` ([String](../../sql-reference/data-types/string.md)) — フラッシュクエリのID。

**例**

クエリ:

``` sql
SELECT * FROM system.asynchronous_insert_log LIMIT 1 \G;
```

結果:

``` text
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

**関連項目**

- [system.query_log](../../operations/system-tables/query_log) — クエリの実行に関する一般的な情報を含む `query_log` システムテーブルの説明。
- [system.asynchronous_inserts](../../operations/system-tables/asynchronous_inserts.md#system_tables-asynchronous_inserts) — このテーブルには、キュー内の保留中の非同期挿入に関する情報が含まれています。
