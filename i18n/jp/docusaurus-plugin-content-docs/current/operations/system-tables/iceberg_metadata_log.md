---
description: 'Iceberg テーブルから読み取られたメタデータファイルに関する情報を保持するシステムテーブル。各エントリは、ルートメタデータファイル、Avro ファイルから抽出されたメタデータ、または Avro ファイル内のエントリのいずれかを表します。'
keywords: ['システムテーブル', 'iceberg_metadata_log']
slug: /operations/system-tables/iceberg_metadata_log
title: 'system.iceberg_metadata_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.iceberg_metadata_log {#systemiceberg_metadata_log}

`system.iceberg_metadata_log` テーブルは、ClickHouse が読み取り対象とする Iceberg テーブルに対するメタデータのアクセスおよび解析イベントを記録します。処理された各メタデータファイルやエントリに関する詳細情報を提供し、デバッグや監査、Iceberg テーブル構造の変遷を把握する際に有用です。

## 目的 {#purpose}

このテーブルは、Iceberg テーブルから読み取ったすべてのメタデータファイルおよびエントリ（ルートメタデータファイル、マニフェストリスト、マニフェストエントリを含む）を記録します。これにより、ClickHouse が Iceberg テーブルのメタデータをどのように解釈しているかを追跡し、スキーマの進化、ファイルの解決、クエリプランニングに関連する問題の診断に役立ちます。

:::note
このテーブルは主にデバッグ目的で使用されます。
:::

## 列 {#columns}

| Name           | Type      | Description                                                                                   |
|----------------|-----------|----------------------------------------------------------------------------------------------|
| `event_date`   | [Date](../../sql-reference/data-types/date.md)      | ログエントリの日付。                                                                       |
| `event_time`   | [DateTime](../../sql-reference/data-types/datetime.md)  | イベントのタイムスタンプ。                                                                 |
| `query_id`     | [String](../../sql-reference/data-types/string.md)    | メタデータの読み取りをトリガーしたクエリ ID。                                               |
| `content_type` | [Enum8](../../sql-reference/data-types/enum.md)     | メタデータコンテンツの種類（下記参照）。                                                    |
| `table_path`   | [String](../../sql-reference/data-types/string.md)    | Iceberg テーブルへのパス。                                                                  |
| `file_path`    | [String](../../sql-reference/data-types/string.md)    | ルートメタデータ JSON ファイル、Avro マニフェストリスト、またはマニフェストファイルへのパス。 |
| `content`      | [String](../../sql-reference/data-types/string.md)    | JSON 形式のコンテンツ（.json からの生メタデータ、Avro メタデータ、または Avro エントリ）。   |
| `row_in_file`  | [Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md)) | ファイル内の行番号（該当する場合）。`ManifestListEntry` および `ManifestFileEntry` のコンテンツタイプに対してのみ設定されます。 |

## `content_type` の値 {#content-type-values}

- `None`: コンテンツなし。
- `Metadata`: ルートメタデータファイル。
- `ManifestListMetadata`: マニフェストリストのメタデータ。
- `ManifestListEntry`: マニフェストリスト内のエントリ。
- `ManifestFileMetadata`: マニフェストファイルのメタデータ。
- `ManifestFileEntry`: マニフェストファイル内のエントリ。

<SystemTableCloud/>

## ログの詳細度の制御 {#controlling-log-verbosity}

[`iceberg_metadata_log_level`](../../operations/settings/settings.md#iceberg_metadata_log_level) 設定を使用して、どのメタデータイベントをログに出力するかを制御できます。

現在のクエリで使用されるすべてのメタデータをログに出力するには：

```sql
SELECT * FROM my_iceberg_table SETTINGS iceberg_metadata_log_level = 'manifest_file_entry';

SYSTEM FLUSH LOGS iceberg_metadata_log;

SELECT content_type, file_path, row_in_file
FROM system.iceberg_metadata_log
WHERE query_id = '{previous_query_id}';
```

現在のクエリで使用されるルートメタデータ JSON ファイルだけをログに記録するには：

```sql
SELECT * FROM my_iceberg_table SETTINGS iceberg_metadata_log_level = 'metadata';

SYSTEM FLUSH LOGS iceberg_metadata_log;

SELECT content_type, file_path, row_in_file
FROM system.iceberg_metadata_log
WHERE query_id = '{previous_query_id}';
```

[`iceberg_metadata_log_level`](../../operations/settings/settings.md#iceberg_metadata_log_level) 設定の説明に、より詳しい情報があります。

### 補足事項 {#good-to-know}

* Iceberg テーブルを詳細に調査する必要がある場合にのみ、クエリ単位で `iceberg_metadata_log_level` を使用してください。そうしないと、ログテーブルに不要なメタデータが大量に蓄積され、パフォーマンス低下を招く可能性があります。
* このテーブルは主にデバッグ目的であり、エンティティごとの一意性は保証されないため、重複したエントリが含まれている場合があります。
* `ManifestListMetadata` より冗長な `content_type` を使用すると、マニフェストリストに対する Iceberg メタデータキャッシュは無効化されます。
* 同様に、`ManifestFileMetadata` より冗長な `content_type` を使用すると、マニフェストファイルに対する Iceberg メタデータキャッシュは無効化されます。

## 関連項目 {#see-also}
- [Iceberg テーブルエンジン](../../engines/table-engines/integrations/iceberg.md)
- [Iceberg テーブル関数](../../sql-reference/table-functions/iceberg.md)
- [system.iceberg_history](./iceberg_history.md)
