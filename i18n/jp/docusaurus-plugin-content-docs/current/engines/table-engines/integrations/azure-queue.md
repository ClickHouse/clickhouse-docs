---
description: 'This engine provides an integration with the Azure Blob Storage ecosystem,
  allowing streaming data import.'
sidebar_label: 'AzureQueue'
sidebar_position: 181
slug: '/engines/table-engines/integrations/azure-queue'
title: 'AzureQueue テーブルエンジン'
---




# AzureQueue テーブルエンジン

このエンジンは [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) エコシステムとの統合を提供し、ストリーミングデータのインポートを可能にします。

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

**エンジンのパラメータ**

`AzureQueue` のパラメータは `AzureBlobStorage` テーブルエンジンがサポートしているのと同じです。パラメータセクションは [こちら](../../../engines/table-engines/integrations/azureBlobStorage.md) を参照してください。

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) テーブルエンジンと同様に、ユーザーはローカルの Azure Storage 開発のために Azurite エミュレーターを使用できます。詳細は [こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage) を参照してください。

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

サポートされている設定のセットは `S3Queue` テーブルエンジンと同じですが、`s3queue_` プレフィックスはありません。[設定のフルリスト](../../../engines/table-engines/integrations/s3queue.md#settings)を参照してください。
テーブルに対して設定された設定のリストを取得するには、`system.azure_queue_settings` テーブルを使用します。利用可能は `24.10` 以降です。

## 説明 {#description}

ストリーミングインポートに対して `SELECT` は特に便利ではありません（デバッグを除く）、なぜなら各ファイルは一度だけインポートできるからです。実際には、[マテリアライズドビュー](../../../sql-reference/statements/create/view.md)を使用してリアルタイムスレッドを作成するのがより実用的です。これを行うには：

1. エンジンを使用して、S3の指定されたパスからデータを消費するためのテーブルを作成し、それをデータストリームと見なします。
2. 望ましい構造を持つテーブルを作成します。
3. エンジンからデータを変換し、以前に作成したテーブルに挿入するマテリアライズドビューを作成します。

`MATERIALIZED VIEW` がエンジンを結合すると、バックグラウンドでデータの収集を開始します。

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

- `_path` — ファイルへのパス。
- `_file` — ファイルの名前。

仮想カラムに関する詳細は [こちら](../../../engines/table-engines/index.md#table_engines-virtual_columns) を参照してください。

## 内部情報 {#introspection}

テーブル設定 `enable_logging_to_queue_log=1` を介してテーブルのロギングを有効にします。

内部情報の機能は、[S3Queue テーブルエンジン](/engines/table-engines/integrations/s3queue#introspection) と同様ですが、いくつかの明確な違いがあります：

1. サーバーバージョン >= 25.1 では、`system.azure_queue` を使用してキューのメモリ内状態を確認します。古いバージョンでは `system.s3queue` を使用します（それには `azure` テーブルに関する情報も含まれます）。
2. メインの ClickHouse 構成を介して `system.azure_queue_log` を有効にします。例えば：

  ```xml
  <azure_queue_log>
    <database>system</database>
    <table>azure_queue_log</table>
  </azure_queue_log>
  ```

この永続テーブルは `system.s3queue` と同じ情報を持っていますが、処理され、失敗したファイルに関するものです。

テーブルの構造は以下の通りです：

```sql

CREATE TABLE system.azure_queue_log
(
    `hostname` LowCardinality(String) COMMENT 'ホスト名',
    `event_date` Date COMMENT 'このログ行が書き込まれたイベントの日付',
    `event_time` DateTime COMMENT 'このログ行が書き込まれたイベントの時間',
    `database` String COMMENT '現在の S3Queue テーブルが存在するデータベースの名前',
    `table` String COMMENT 'S3Queue テーブルの名前',
    `uuid` String COMMENT 'S3Queue テーブルの UUID',
    `file_name` String COMMENT '処理されているファイルの名前',
    `rows_processed` UInt64 COMMENT '処理された行数',
    `status` Enum8('Processed' = 0, 'Failed' = 1) COMMENT '処理されたファイルのステータス',
    `processing_start_time` Nullable(DateTime) COMMENT 'ファイル処理開始時刻',
    `processing_end_time` Nullable(DateTime) COMMENT 'ファイル処理終了時刻',
    `exception` String COMMENT '発生した場合の例外メッセージ'
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, event_time)
SETTINGS index_granularity = 8192
COMMENT 'S3Queue エンジンによって処理されたファイルに関するログエントリを含みます。'

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
