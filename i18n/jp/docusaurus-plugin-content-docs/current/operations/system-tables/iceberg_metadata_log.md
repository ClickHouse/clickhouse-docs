---
'description': 'システムテーブルで、Iceberg テーブルから読み込まれたメタデータファイルに関する情報が含まれています。各エントリは、ルートメタデータファイル、Avroファイルから抽出されたメタデータ、またはいくつかのAvroファイルのエントリを表します。'
'keywords':
- 'system table'
- 'iceberg_metadata_log'
'slug': '/operations/system-tables/iceberg_metadata_log'
'title': 'system.iceberg_metadata_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.iceberg_metadata_log

`system.iceberg_metadata_log` テーブルは、ClickHouse によって読み取られた Iceberg テーブルのメタデータアクセスおよびパースイベントを記録します。これは、処理された各メタデータファイルまたはエントリに関する詳細情報を提供し、デバッグ、監査、および Iceberg テーブル構造の進化を理解するのに役立ちます。

## Purpose {#purpose}

このテーブルは、Iceberg テーブルから読み取られたすべてのメタデータファイルおよびエントリをログに記録します。これには、ルートメタデータファイル、マニフェストリスト、およびマニフェストエントリが含まれます。これにより、ユーザーは ClickHouse が Iceberg テーブルのメタデータをどのように解釈しているかを追跡し、スキーマの進化、ファイルの解決、またはクエリプランニングに関連する問題を診断できます。

:::note
このテーブルは主にデバッグ目的で使用されます。
:::note

## Columns {#columns}
| Name           | Type      | Description                                                                                   |
|----------------|-----------|----------------------------------------------------------------------------------------------|
| `event_date`   | [Date](../../sql-reference/data-types/date.md)      | ログエントリの日付。                                                                       |
| `event_time`   | [DateTime](../../sql-reference/data-types/datetime.md)  | イベントのタイムスタンプ。                                                                  |
| `query_id`     | [String](../../sql-reference/data-types/string.md)    | メタデータ読み取りをトリガーしたクエリ ID。                                               |
| `content_type` | [Enum8](../../sql-reference/data-types/enum.md)     | メタデータコンテンツの種類（下記参照）。                                                  |
| `table_path`   | [String](../../sql-reference/data-types/string.md)    | Iceberg テーブルへのパス。                                                                   |
| `file_path`    | [String](../../sql-reference/data-types/string.md)    | ルートメタデータ JSON ファイル、Avro マニフェストリスト、またはマニフェストファイルへのパス。  |
| `content`      | [String](../../sql-reference/data-types/string.md)    | JSON 形式のコンテンツ（.json からの生メタデータ、Avro メタデータ、または Avro エントリ）。   |
| `row_in_file`  | [Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md)) | ファイル内の行番号（該当する場合）。`ManifestListEntry` および `ManifestFileEntry` コンテンツタイプで表示されます。 |

## `content_type` values {#content-type-values}

- `None`: コンテンツなし。
- `Metadata`: ルートメタデータファイル。
- `ManifestListMetadata`: マニフェストリストメタデータ。
- `ManifestListEntry`: マニフェストリスト内のエントリ。
- `ManifestFileMetadata`: マニフェストファイルメタデータ。
- `ManifestFileEntry`: マニフェストファイル内のエントリ。

<SystemTableCloud/>

## Controlling log verbosity {#controlling-log-verbosity}

`iceberg_metadata_log_level` 設定を使用して、どのメタデータイベントがログに記録されるかを制御できます。

現在のクエリで使用されるすべてのメタデータをログに記録するには:

```sql
SELECT * FROM my_iceberg_table SETTINGS iceberg_metadata_log_level = 'manifest_file_entry';

SYSTEM FLUSH LOGS iceberg_metadata_log;

SELECT content_type, file_path, row_in_file
FROM system.iceberg_metadata_log
WHERE query_id = '{previous_query_id}';
```

現在のクエリで使用されるルートメタデータ JSON ファイルのみをログに記録するには:

```sql
SELECT * FROM my_iceberg_table SETTINGS iceberg_metadata_log_level = 'metadata';

SYSTEM FLUSH LOGS iceberg_metadata_log;

SELECT content_type, file_path, row_in_file
FROM system.iceberg_metadata_log
WHERE query_id = '{previous_query_id}';
```

`iceberg_metadata_log_level` 設定の説明で詳細情報を参照してください。

### Good To Know {#good-to-know}

- `iceberg_metadata_log_level` は、Iceberg テーブルを詳細に調査する必要がある場合のみ、クエリレベルで使用してください。それ以外の場合、ログテーブルに過剰なメタデータが記録され、性能が低下する可能性があります。
- このテーブルには重複エントリが含まれる場合があります。これは主にデバッグ用に設計されており、エンティティごとの一意性を保証しません。
- `ManifestListMetadata` よりも詳細な `content_type` を使用する場合、マニフェストリストのための Iceberg メタデータキャッシュは無効になります。
- 同様に、`ManifestFileMetadata` よりも詳細な `content_type` を使用する場合、マニフェストファイルのための Iceberg メタデータキャッシュは無効になります。

## See also {#see-also}
- [Iceberg Table Engine](../../engines/table-engines/integrations/iceberg.md)
- [Iceberg Table Function](../../sql-reference/table-functions/iceberg.md)
- [system.iceberg_history](./iceberg_history.md)
