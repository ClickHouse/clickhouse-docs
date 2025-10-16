---
'description': 'このエンジンは、Azure Blob Storage エコシステムとの統合を提供し、ストリーミングデータのインポートを可能にします。'
'sidebar_label': 'AzureQueue'
'sidebar_position': 181
'slug': '/engines/table-engines/integrations/azure-queue'
'title': 'AzureQueue テーブルエンジン'
'doc_type': 'reference'
---


# AzureQueue テーブルエンジン

このエンジンは、[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) エコシステムとの統合を提供し、ストリーミングデータインポートを可能にします。

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE test (name String, value UInt32)
    ENGINE = AzureQueue(...)
    [SETTINGS]
    [mode = '',]
    [after_processing = 'keep',]
    [keeper_path = '',]
    ...
```

**エンジンパラメータ**

`AzureQueue` のパラメータは、`AzureBlobStorage` テーブルエンジンがサポートするものと同じです。パラメータセクションは [こちら](../../../engines/table-engines/integrations/azureBlobStorage.md)をご覧ください。

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) テーブルエンジンと同様に、ユーザーはローカル Azure Storage 開発のために Azurite エミュレーターを使用できます。詳細は [こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)をご覧ください。

**例**

```sql
CREATE TABLE azure_queue_engine_table
(
    `key` UInt64,
    `data` String
)
ENGINE = AzureQueue('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', '*', 'CSV')
SETTINGS mode = 'unordered'
```

## 設定 {#settings}

サポートされている設定の集合は `S3Queue` テーブルエンジンと同じですが、`s3queue_` プレフィックスはありません。設定の [完全なリスト](../../../engines/table-engines/integrations/s3queue.md#settings)をご覧ください。
テーブルに設定された設定のリストを取得するには、`system.azure_queue_settings` テーブルを使用してください。利用可能は `24.10` からです。

## 説明 {#description}

`SELECT` はストリーミングインポートにとって特に有用ではありません（デバッグを除いて）、各ファイルは一度だけインポートできるためです。リアルタイムスレッドを作成するためには、[マテリアライズドビュー](../../../sql-reference/statements/create/view.md)を使用する方が実用的です。これを行うには：

1. エンジンを使用して、S3の指定されたパスからデータを消費するためのテーブルを作成し、それをデータストリームと見なします。
2. 希望の構造を持つテーブルを作成します。
3. エンジンからのデータを変換し、以前に作成したテーブルに入れるマテリアライズドビューを作成します。

`MATERIALIZED VIEW` がエンジンに結合すると、バックグラウンドでデータの収集を開始します。

例：

```sql
CREATE TABLE azure_queue_engine_table (key UInt64, data String)
  ENGINE=AzureQueue('<endpoint>', 'CSV', 'gzip')
  SETTINGS
      mode = 'unordered';

CREATE TABLE stats (key UInt64, data String)
  ENGINE = MergeTree() ORDER BY key;

CREATE MATERIALIZED VIEW consumer TO stats
  AS SELECT key, data FROM azure_queue_engine_table;

SELECT * FROM stats ORDER BY key;
```

## 仮想カラム {#virtual-columns}

- `_path` — ファイルのパス。
- `_file` — ファイルの名前。

仮想カラムの詳細については [こちら](../../../engines/table-engines/index.md#table_engines-virtual_columns)をご覧ください。

## インストロスペクション {#introspection}

テーブルの設定 `enable_logging_to_queue_log=1` を介して、テーブルのロギングを有効にします。

インストロスペクション機能は、いくつかの異なる違いを除いて、[S3Queue テーブルエンジン](/engines/table-engines/integrations/s3queue#introspection)と同じです：

1. サーバーのバージョンが >= 25.1 の場合、キューのメモリ内状態には `system.azure_queue` を使用します。古いバージョンでは `system.s3queue` を使用してください（これには `azure` テーブルの情報も含まれます）。
2. 次のように、主な ClickHouse 設定を介して `system.azure_queue_log` を有効にします。

```xml
<azure_queue_log>
  <database>system</database>
  <table>azure_queue_log</table>
</azure_queue_log>
```

この永続テーブルは、処理済みおよび失敗したファイルの情報を含む `system.s3queue` と同じ情報を持っています。

テーブルは以下の構造を持っています：

```sql

CREATE TABLE system.azure_queue_log
(
    `hostname` LowCardinality(String) COMMENT 'Hostname',
    `event_date` Date COMMENT 'Event date of writing this log row',
    `event_time` DateTime COMMENT 'Event time of writing this log row',
    `database` String COMMENT 'The name of a database where current S3Queue table lives.',
    `table` String COMMENT 'The name of S3Queue table.',
    `uuid` String COMMENT 'The UUID of S3Queue table',
    `file_name` String COMMENT 'File name of the processing file',
    `rows_processed` UInt64 COMMENT 'Number of processed rows',
    `status` Enum8('Processed' = 0, 'Failed' = 1) COMMENT 'Status of the processing file',
    `processing_start_time` Nullable(DateTime) COMMENT 'Time of the start of processing the file',
    `processing_end_time` Nullable(DateTime) COMMENT 'Time of the end of processing the file',
    `exception` String COMMENT 'Exception message if happened'
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, event_time)
SETTINGS index_granularity = 8192
COMMENT 'Contains logging entries with the information files processes by S3Queue engine.'

```

例：

```sql
SELECT *
FROM system.azure_queue_log
LIMIT 1
FORMAT Vertical

Row 1:
──────
hostname:              clickhouse
event_date:            2024-12-16
event_time:            2024-12-16 13:42:47
database:              default
table:                 azure_queue_engine_table
uuid:                  1bc52858-00c0-420d-8d03-ac3f189f27c8
file_name:             test_1.csv
rows_processed:        3
status:                Processed
processing_start_time: 2024-12-16 13:42:47
processing_end_time:   2024-12-16 13:42:47
exception:

1 row in set. Elapsed: 0.002 sec.

```
