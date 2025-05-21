---
description: 'このエンジンは、Azure Blob Storageエコシステムとの統合を提供し、ストリーミングデータのインポートを可能にします。'
sidebar_label: 'AzureQueue'
sidebar_position: 181
slug: /engines/table-engines/integrations/azure-queue
title: 'AzureQueue テーブルエンジン'
---


# AzureQueue テーブルエンジン

このエンジンは、[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)エコシステムとの統合を提供し、ストリーミングデータのインポートを可能にします。

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

`AzureQueue`のパラメータは、`AzureBlobStorage`テーブルエンジンがサポートするものと同じです。パラメータのセクションは[こちら](../../../engines/table-engines/integrations/azureBlobStorage.md)をご覧ください。

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage)テーブルエンジンと同様に、ユーザーはローカルAzure Storage開発のためにAzuriteエミュレーターを使用できます。さらなる詳細は[こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)をご覧ください。

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

サポートされている設定のセットは`S3Queue`テーブルエンジンと同じですが、`s3queue_`プレフィックスはありません。設定の[完全リスト](../../../engines/table-engines/integrations/s3queue.md#settings)をご覧ください。
テーブルに設定された設定のリストを取得するには、`system.azure_queue_settings`テーブルを使用します。利用可能は`24.10`からです。

## 説明 {#description}

`SELECT`はストリーミングインポートに特に役立つものではありません（デバッグを除く）、なぜなら各ファイルは1回だけインポートできるからです。実際には、[マテリアライズドビュー](../../../sql-reference/statements/create/view.md)を使用してリアルタイムスレッドを作成した方が実用的です。これを行うには：

1. エンジンを使用して、指定されたS3パスからデータを消費するためのテーブルを作成し、それをデータストリームと見なします。
2. 希望の構造を持つテーブルを作成します。
3. エンジンからデータを変換し、以前に作成したテーブルに格納するマテリアライズドビューを作成します。

`MATERIALIZED VIEW`がエンジンに結合されると、バックグラウンドでデータを収集し始めます。

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
- `_file` — ファイル名。

仮想カラムに関する詳細は[こちら](../../../engines/table-engines/index.md#table_engines-virtual_columns)をご覧ください。

## 内部解析 {#introspection}

テーブル設定 `enable_logging_to_queue_log=1` を通じてテーブルのロギングを有効にします。

内部解析機能は、[S3Queueテーブルエンジン](/engines/table-engines/integrations/s3queue#introspection)と同じですが、いくつかの異なる点があります：

1. サーバーのバージョンが>= 25.1の場合、キューのメモリ内状態には `system.azure_queue` を使用します。古いバージョンでは、`system.s3queue` を使用します（これには`azure`テーブルの情報も含まれます）。
2. メインのClickHouse設定を介して `system.azure_queue_log` を有効にします。例えば：

  ```xml
  <azure_queue_log>
    <database>system</database>
    <table>azure_queue_log</table>
  </azure_queue_log>
  ```

この永続テーブルは、処理されたファイルと失敗したファイルの情報を持つ `system.s3queue` と同じ情報を含みます。

テーブルの構造は以下の通りです：

```sql

CREATE TABLE system.azure_queue_log
(
    `hostname` LowCardinality(String) COMMENT 'ホスト名',
    `event_date` Date COMMENT 'このログ行を書き込んだ日付',
    `event_time` DateTime COMMENT 'このログ行を書き込んだ時間',
    `database` String COMMENT '現在のS3Queueテーブルが存在するデータベースの名前。',
    `table` String COMMENT 'S3Queueテーブルの名前。',
    `uuid` String COMMENT 'S3QueueテーブルのUUID',
    `file_name` String COMMENT '処理中のファイル名',
    `rows_processed` UInt64 COMMENT '処理された行の数',
    `status` Enum8('Processed' = 0, 'Failed' = 1) COMMENT '処理されたファイルのステータス',
    `processing_start_time` Nullable(DateTime) COMMENT 'ファイルの処理開始時間',
    `processing_end_time` Nullable(DateTime) COMMENT 'ファイルの処理終了時間',
    `exception` String COMMENT '発生した場合の例外メッセージ'
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, event_time)
SETTINGS index_granularity = 8192
COMMENT 'S3Queueエンジンによって処理されたファイルの情報を含むログエントリ。'

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

1行の結果が表示されました。経過時間: 0.002秒。

```
