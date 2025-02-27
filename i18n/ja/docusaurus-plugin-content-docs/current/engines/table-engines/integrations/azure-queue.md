---
slug: /engines/table-engines/integrations/azure-queue
sidebar_position: 181
sidebar_label: AzureQueue
title: "AzureQueue テーブルエンジン"
description: "このエンジンは Azure Blob Storage エコシステムとの統合を提供し、ストリーミングデータのインポートを可能にします。"
---

# AzureQueue テーブルエンジン

このエンジンは [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) エコシステムとの統合を提供し、ストリーミングデータのインポートを可能にします。

## テーブルの作成 {#creating-a-table}

``` sql
CREATE TABLE test (name String, value UInt32)
    ENGINE = AzureQueue(...)
    [SETTINGS]
    [mode = '',]
    [after_processing = 'keep',]
    [keeper_path = '',]
    ...
```

**エンジンパラメーター**

`AzureQueue` のパラメーターは `AzureBlobStorage` テーブルエンジンと同じです。パラメーターセクションは [こちら](../../../engines/table-engines/integrations/azureBlobStorage.md) を参照してください。

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) テーブルエンジンと同様に、ユーザーは Azurite エミュレーターを使用してローカルの Azure Storage 開発を行うことができます。詳細は [こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage) を参照してください。

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

サポートされている設定のセットは `S3Queue` テーブルエンジンと同じですが、`s3queue_` プレフィックスはありません。設定の完全なリストは [こちら](../../../engines/table-engines/integrations/s3queue.md#settings) を参照してください。
テーブルに設定されている設定のリストを取得するには、`system.azure_queue_settings` テーブルを使用します。これは `24.10` 以降に利用可能です。

## 説明 {#description}

`SELECT` はストリーミングインポートに特に役立つわけではありません (デバッグを除く)、なぜなら各ファイルは一度しかインポートできないからです。リアルタイムスレッドを作成するためには、[マテリアライズドビュー](../../../sql-reference/statements/create/view.md) を使用するのがより実用的です。そのためには：

1. 指定されたS3パスから消費するためのテーブルをエンジンを使用して作成し、それをデータストリームとみなします。
2. 希望する構造を持つテーブルを作成します。
3. エンジンからデータを変換して、前に作成したテーブルに入れるマテリアライズドビューを作成します。

`MATERIALIZED VIEW` がエンジンに接続すると、バックグラウンドでデータを集め始めます。

例：

``` sql
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

仮想カラムについての詳細は [こちら](../../../engines/table-engines/index.md#table_engines-virtual_columns) を参照してください。

## 内部情報 {#introspection}

テーブル設定 `enable_logging_to_s3queue_log=1` を介してテーブルのロギングを有効にします。

内部情報の機能は [S3Queue テーブルエンジン](/engines/table-engines/integrations/s3queue#introspection) と同じですが、いくつかの異なる点があります：

1. サーバーバージョン >= 25.1 の場合は `system.azure_queue` を使用してキューのインメモリ状態を取得します。古いバージョンでは `system.s3queue` を使用します (これには `azure` テーブルに関する情報も含まれます)。
2. メインの ClickHouse 設定を介して `system.azure_queue_log` を有効にします。例：

  ```xml
  <azure_queue_log>
    <database>system</database>
    <table>azure_queue_log</table>
  </azure_queue_log>
  ```

この永続テーブルは `system.s3queue` と同じ情報を持っていますが、処理されたファイルと失敗したファイルの情報が含まれます。

テーブルは以下の構造を持っています：

```sql

CREATE TABLE system.azure_queue_log
(
    `hostname` LowCardinality(String) COMMENT 'ホスト名',
    `event_date` Date COMMENT 'このログ行の書き込みイベント日',
    `event_time` DateTime COMMENT 'このログ行の書き込みイベント時間',
    `database` String COMMENT '現在の S3Queue テーブルが存在するデータベースの名前。',
    `table` String COMMENT 'S3Queue テーブルの名前。',
    `uuid` String COMMENT 'S3Queue テーブルの UUID',
    `file_name` String COMMENT '処理対象のファイルの名前',
    `rows_processed` UInt64 COMMENT '処理された行数',
    `status` Enum8('Processed' = 0, 'Failed' = 1) COMMENT '処理中のファイルのステータス',
    `processing_start_time` Nullable(DateTime) COMMENT 'ファイルの処理開始時間',
    `processing_end_time` Nullable(DateTime) COMMENT 'ファイルの処理終了時間',
    `exception` String COMMENT '発生した場合の例外メッセージ'
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, event_time)
SETTINGS index_granularity = 8192
COMMENT 'S3Queue エンジンによって処理されたファイルに関するログエントリを含む。'

```

例：

```sql
SELECT *
FROM system.azure_queue_log
LIMIT 1
FORMAT Vertical

行 1:
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

1 行がセットされました。経過時間: 0.002 秒。

```
