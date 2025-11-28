---
description: 'Delta Lake テーブルから読み取られたメタデータファイルに関する情報を含むシステムテーブル。各エントリは 1 つのルートメタデータ JSON ファイルに対応します。'
keywords: ['システムテーブル', 'delta_lake_metadata_log']
slug: /operations/system-tables/delta_lake_metadata_log
title: 'system.delta_lake_metadata_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.delta_lake_metadata_log

`system.delta_lake_metadata_log` テーブルは、ClickHouse によって読み取られた Delta Lake テーブルのメタデータへのアクセスおよび解析イベントを記録します。各メタデータファイルに関する詳細な情報を提供し、デバッグや監査、Delta テーブル構造の変化を理解する際に有用です。



## 目的 {#purpose}

このテーブルは、Delta Lake テーブルから読み取られたすべてのメタデータファイルを記録します。これにより、ClickHouse が Delta テーブルのメタデータをどのように解釈しているかを追跡でき、スキーマの進化、スナップショットの解決、クエリプランニングに関連する問題の診断に役立ちます。

:::note
このテーブルは主にデバッグ用途を想定しています。
:::



## 列 {#columns}
| Name           | Type      | Description                                                                                   |
|----------------|-----------|----------------------------------------------------------------------------------------------|
| `event_date`   | [Date](../../sql-reference/data-types/date.md)      | ログファイルの日付。                                                                       |
| `event_time`   | [DateTime](../../sql-reference/data-types/datetime.md)  | イベントのタイムスタンプ。                                                                      |
| `query_id`     | [String](../../sql-reference/data-types/string.md)    | メタデータ読み取りを開始したクエリ ID。                                                   |
| `table_path`   | [String](../../sql-reference/data-types/string.md)    | Delta Lake テーブルへのパス。                                                                |
| `file_path`    | [String](../../sql-reference/data-types/string.md)    | ルートメタデータ JSON ファイルへのパス。             |
| `content`      | [String](../../sql-reference/data-types/string.md)    | JSON 形式の内容（.json ファイル由来の生のメタデータ）。       |

<SystemTableCloud/>



## ログの詳細度の制御

[`delta_lake_log_metadata`](../../operations/settings/settings.md#delta_lake_log_metadata) 設定を使用して、どのメタデータイベントをログに記録するかを制御できます。

現在のクエリで使用されるすべてのメタデータをログに記録するには：

```sql
SELECT * FROM my_delta_table SETTINGS delta_lake_log_metadata = 1;

SYSTEM FLUSH LOGS delta_lake_metadata_log;

SELECT *
FROM system.delta_lake_metadata_log
WHERE query_id = '{previous_query_id}';
```
