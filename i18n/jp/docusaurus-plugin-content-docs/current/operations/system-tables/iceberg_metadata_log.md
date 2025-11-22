---
description: 'Iceberg テーブルから読み取ったメタデータファイルに関する情報を含むシステムテーブルです。各エントリは、ルートメタデータファイル、Avro ファイルから抽出されたメタデータ、または Avro ファイル内のエントリのいずれかを表します。'
keywords: ['system table', 'iceberg_metadata_log']
slug: /operations/system-tables/iceberg_metadata_log
title: 'system.iceberg_metadata_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.iceberg_metadata_log

`system.iceberg_metadata_log` テーブルは、ClickHouse が読み取る Iceberg テーブルに対するメタデータへのアクセスおよび解析イベントを記録します。処理された各メタデータファイルまたはエントリに関する詳細な情報を提供し、デバッグや監査、および Iceberg テーブル構造の変遷の把握に役立ちます。



## 目的 {#purpose}

このテーブルは、ルートメタデータファイル、マニフェストリスト、マニフェストエントリを含む、Icebergテーブルから読み取られたすべてのメタデータファイルとエントリを記録します。ユーザーはこれを使用して、ClickHouseがIcebergテーブルのメタデータをどのように解釈するかを追跡し、スキーマの進化、ファイル解決、クエリプランニングに関連する問題を診断することができます。

:::note
このテーブルは主にデバッグ目的で使用されます。
:::


## Columns {#columns}

| 名前           | 型                                                                                                         | 説明                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `event_date`   | [Date](../../sql-reference/data-types/date.md)                                                               | ログエントリの日付。                                                                                        |
| `event_time`   | [DateTime](../../sql-reference/data-types/datetime.md)                                                       | イベントのタイムスタンプ。                                                                                       |
| `query_id`     | [String](../../sql-reference/data-types/string.md)                                                           | メタデータ読み取りをトリガーしたクエリID。                                                                    |
| `content_type` | [Enum8](../../sql-reference/data-types/enum.md)                                                              | メタデータコンテンツのタイプ(下記参照)。                                                                         |
| `table_path`   | [String](../../sql-reference/data-types/string.md)                                                           | Icebergテーブルへのパス。                                                                                    |
| `file_path`    | [String](../../sql-reference/data-types/string.md)                                                           | ルートメタデータJSONファイル、Avroマニフェストリスト、またはマニフェストファイルへのパス。                                    |
| `content`      | [String](../../sql-reference/data-types/string.md)                                                           | JSON形式のコンテンツ(.jsonファイルからの生メタデータ、Avroメタデータ、またはAvroエントリ)。                               |
| `row_in_file`  | [Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md)) | 該当する場合、ファイル内の行番号。`ManifestListEntry`および`ManifestFileEntry`コンテンツタイプに存在します。 |


## `content_type` の値 {#content-type-values}

- `None`: コンテンツなし。
- `Metadata`: ルートメタデータファイル。
- `ManifestListMetadata`: マニフェストリストのメタデータ。
- `ManifestListEntry`: マニフェストリスト内のエントリ。
- `ManifestFileMetadata`: マニフェストファイルのメタデータ。
- `ManifestFileEntry`: マニフェストファイル内のエントリ。

<SystemTableCloud />


## ログの詳細度の制御 {#controlling-log-verbosity}

[`iceberg_metadata_log_level`](../../operations/settings/settings.md#iceberg_metadata_log_level)設定を使用して、ログに記録するメタデータイベントを制御できます。

現在のクエリで使用されるすべてのメタデータをログに記録する場合:

```sql
SELECT * FROM my_iceberg_table SETTINGS iceberg_metadata_log_level = 'manifest_file_entry';

SYSTEM FLUSH LOGS iceberg_metadata_log;

SELECT content_type, file_path, row_in_file
FROM system.iceberg_metadata_log
WHERE query_id = '{previous_query_id}';
```

現在のクエリで使用されるルートメタデータJSONファイルのみをログに記録する場合:

```sql
SELECT * FROM my_iceberg_table SETTINGS iceberg_metadata_log_level = 'metadata';

SYSTEM FLUSH LOGS iceberg_metadata_log;

SELECT content_type, file_path, row_in_file
FROM system.iceberg_metadata_log
WHERE query_id = '{previous_query_id}';
```

詳細については、[`iceberg_metadata_log_level`](../../operations/settings/settings.md#iceberg_metadata_log_level)設定の説明を参照してください。

### 留意事項 {#good-to-know}

- `iceberg_metadata_log_level`は、Icebergテーブルを詳細に調査する必要がある場合にのみ、クエリレベルで使用してください。それ以外の場合、ログテーブルに過剰なメタデータが蓄積され、パフォーマンスが低下する可能性があります。
- このテーブルは主にデバッグを目的としており、エンティティごとの一意性を保証しないため、重複エントリが含まれる場合があります。
- `ManifestListMetadata`よりも詳細な`content_type`を使用すると、マニフェストリストのIcebergメタデータキャッシュが無効になります。
- 同様に、`ManifestFileMetadata`よりも詳細な`content_type`を使用すると、マニフェストファイルのIcebergメタデータキャッシュが無効になります。


## 関連項目 {#see-also}

- [Icebergテーブルエンジン](../../engines/table-engines/integrations/iceberg.md)
- [Icebergテーブル関数](../../sql-reference/table-functions/iceberg.md)
- [system.iceberg_history](./iceberg_history.md)
