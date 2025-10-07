---
'description': 'システム TABLE が Delta Lake TABLE から読み取ったメタデータファイルに関する情報を含んでいます。各エントリはルートメタデータ
  JSON ファイルを表します。'
'keywords':
- 'system table'
- 'delta_lake_metadata_log'
'slug': '/operations/system-tables/delta_lake_metadata_log'
'title': 'system.delta_lake_metadata_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.delta_lake_metadata_log

`system.delta_lake_metadata_log` テーブルは、ClickHouse によって読み取られる Delta Lake テーブルのメタデータアクセスと解析イベントを記録します。このテーブルは、各メタデータファイルに関する詳細情報を提供し、デバッグ、監査、および Delta テーブルの構造進化を理解するために役立ちます。

## Purpose {#purpose}

このテーブルは、Delta Lake テーブルから読み取られたすべてのメタデータファイルをログします。これにより、ユーザーは ClickHouse が Delta テーブルメタデータをどのように解釈するかを追跡し、スキーマの進化、スナップショット解決、またはクエリ計画に関連する問題を診断するのに役立ちます。

:::note
このテーブルは主にデバッグ目的で使用されます。
:::note

## Columns {#columns}
| Name           | Type      | Description                                                                                   |
|----------------|-----------|----------------------------------------------------------------------------------------------|
| `event_date`   | [Date](../../sql-reference/data-types/date.md)      | ログファイルの日付。                                                                          |
| `event_time`   | [DateTime](../../sql-reference/data-types/datetime.md)  | イベントのタイムスタンプ。                                                                      |
| `query_id`     | [String](../../sql-reference/data-types/string.md)    | メタデータの読み込みを引き起こしたクエリ ID。                                                  |
| `table_path`   | [String](../../sql-reference/data-types/string.md)    | Delta Lake テーブルへのパス。                                                                    |
| `file_path`    | [String](../../sql-reference/data-types/string.md)    | ルートメタデータ JSON ファイルへのパス。                                                        |
| `content`      | [String](../../sql-reference/data-types/string.md)    | JSON 形式のコンテンツ（.json からの生のメタデータ）。                                           |

<SystemTableCloud/>

## Controlling log verbosity {#controlling-log-verbosity}

現在のクエリで使用されるメタデータイベントのログを制御するには、[`delta_lake_log_metadata`](../../operations/settings/settings.md#delta_lake_log_metadata) 設定を使用します。

現在のクエリで使用されるすべてのメタデータをログに記録するには：

```sql
SELECT * FROM my_delta_table SETTINGS delta_lake_log_metadata = 1;

SYSTEM FLUSH LOGS delta_lake_metadata_log;

SELECT *
FROM system.delta_lake_metadata_log
WHERE query_id = '{previous_query_id}';
```
