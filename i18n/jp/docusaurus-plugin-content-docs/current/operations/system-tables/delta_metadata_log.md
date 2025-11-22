---
description: 'Delta Lake テーブルから読み取られたメタデータファイルに関する情報を格納するシステムテーブル。各エントリはルートメタデータ JSON ファイルを表します。'
keywords: ['system table', 'delta_lake_metadata_log']
slug: /operations/system-tables/delta_lake_metadata_log
title: 'system.delta_lake_metadata_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.delta_lake_metadata_log

`system.delta_lake_metadata_log` テーブルは、ClickHouse によって読み取られた Delta Lake テーブルのメタデータへのアクセスおよび解析イベントを記録します。各メタデータファイルに関する詳細な情報を提供し、デバッグや監査、Delta テーブル構造の変遷を理解するのに役立ちます。



## 目的 {#purpose}

このテーブルは、Delta Lakeテーブルから読み取られたすべてのメタデータファイルを記録します。ClickHouseがDeltaテーブルのメタデータをどのように解釈するかを追跡し、スキーマの進化、スナップショットの解決、またはクエリプランニングに関連する問題を診断するのに役立ちます。

:::note
このテーブルは主にデバッグ目的で使用されます。
:::


## カラム {#columns}

| 名前         | 型                                                   | 説明                                       |
| ------------ | ------------------------------------------------------ | ------------------------------------------------- |
| `event_date` | [Date](../../sql-reference/data-types/date.md)         | ログファイルの日付。                             |
| `event_time` | [DateTime](../../sql-reference/data-types/datetime.md) | イベントのタイムスタンプ。                           |
| `query_id`   | [String](../../sql-reference/data-types/string.md)     | メタデータ読み取りをトリガーしたクエリID。        |
| `table_path` | [String](../../sql-reference/data-types/string.md)     | Delta Lakeテーブルへのパス。                     |
| `file_path`  | [String](../../sql-reference/data-types/string.md)     | ルートメタデータJSONファイルへのパス。              |
| `content`    | [String](../../sql-reference/data-types/string.md)     | JSON形式のコンテンツ（.jsonファイルからの生メタデータ）。 |

<SystemTableCloud />


## ログの詳細度の制御 {#controlling-log-verbosity}

[`delta_lake_log_metadata`](../../operations/settings/settings.md#delta_lake_log_metadata)設定を使用して、ログに記録するメタデータイベントを制御できます。

現在のクエリで使用されるすべてのメタデータをログに記録するには:

```sql
SELECT * FROM my_delta_table SETTINGS delta_lake_log_metadata = 1;

SYSTEM FLUSH LOGS delta_lake_metadata_log;

SELECT *
FROM system.delta_lake_metadata_log
WHERE query_id = '{previous_query_id}';
```
