---
description: 'このエンジンは Azure Blob Storage エコシステムとの統合を提供し、ストリーミングデータのインポートを可能にします。'
sidebar_label: 'AzureQueue'
sidebar_position: 181
slug: /engines/table-engines/integrations/azure-queue
title: 'AzureQueue テーブルエンジン'
doc_type: 'reference'
---

# AzureQueue テーブルエンジン {#azurequeue-table-engine}

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

**エンジンパラメータ**

`AzureQueue` のパラメータは、`AzureBlobStorage` テーブルエンジンでサポートされるものと同一です。パラメータについては[こちら](../../../engines/table-engines/integrations/azureBlobStorage.md)を参照してください。

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) テーブルエンジンと同様に、ローカル環境での Azure Storage 開発には Azurite エミュレーターを利用できます。詳細は[こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)を参照してください。

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

## Settings {#settings}

サポートされている設定項目は、ほとんどが `S3Queue` テーブルエンジンと同じですが、`s3queue_` プレフィックスは付きません。[設定の全リスト](../../../engines/table-engines/integrations/s3queue.md#settings)を参照してください。
テーブルに対して構成されている設定の一覧を取得するには、`system.azure_queue_settings` テーブルを使用します。`24.10` 以降で利用可能です。

以下は、AzureQueue にのみ対応し、S3Queue には適用されない設定です。

### `after_processing_move_connection_string` {#after&#95;processing&#95;move&#95;connection&#95;string}

宛先が別の Azure コンテナーである場合に、正常に処理されたファイルを移動するための Azure Blob Storage 接続文字列。

指定可能な値:

* 文字列。

デフォルト値: 空文字列。

### `after_processing_move_container` {#after&#95;processing&#95;move&#95;container}

移動先が別の Azure コンテナである場合に、正常に処理されたファイルを移動する移動先コンテナ名。

指定可能な値:

* 文字列。

デフォルト値: 空文字列。

例:

```sql
CREATE TABLE azure_queue_engine_table
(
    `key` UInt64,
    `data` String
)
ENGINE = AzureQueue('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', '*', 'CSV')
SETTINGS
    mode = 'unordered',
    after_processing = 'move',
    after_processing_move_connection_string = 'DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    after_processing_move_container = 'dst-container';
```

## 説明 {#description}

`SELECT` は、各ファイルを 1 回しかインポートできないため（デバッグ用途を除き）ストリーミングインポートにはあまり有用ではありません。代わりに、[マテリアライズドビュー](../../../sql-reference/statements/create/view.md) を使用してリアルタイム処理フローを作成する方が実用的です。これを行うには、次のようにします。

1. エンジンを使用して、S3 内の指定パスからデータを取り込むテーブルを作成し、それをデータストリームとみなします。
2. 目的の構造を持つテーブルを作成します。
3. エンジンからのデータを変換し、事前に作成したテーブルに格納するマテリアライズドビューを作成します。

`MATERIALIZED VIEW` をエンジンと関連付けると、バックグラウンドでデータの取り込みを開始します。

例:

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

* `_path` — ファイルパス。
* `_file` — ファイル名。

仮想カラムの詳細については[こちら](../../../engines/table-engines/index.md#table_engines-virtual_columns)を参照してください。

## イントロスペクション {#introspection}

テーブル設定 `enable_logging_to_queue_log=1` を有効にして、テーブルに対するログ記録を有効化します。

イントロスペクション機能は [S3Queue テーブルエンジン](/engines/table-engines/integrations/s3queue#introspection) と同じですが、いくつか明確な違いがあります：

1. サーバーバージョンが &gt;= 25.1 の場合、キューのインメモリ状態には `system.azure_queue` を使用します。古いバージョンでは `system.s3queue` を使用します（こちらにも `azure` テーブルに関する情報が含まれます）。
2. メインの ClickHouse 設定で `system.azure_queue_log` を有効化します。例：

```xml
  <azure_queue_log>
    <database>system</database>
    <table>azure_queue_log</table>
  </azure_queue_log>
```

この永続テーブルは、`system.s3queue` と同様の情報を保持しますが、対象は処理済みおよび失敗したファイルです。

このテーブルの構造は次のとおりです。

```sql

CREATE TABLE system.azure_queue_log
(
    `hostname` LowCardinality(String) COMMENT 'ホスト名',
    `event_date` Date COMMENT 'このログ行の書き込みイベント日付',
    `event_time` DateTime COMMENT 'このログ行の書き込みイベント時刻',
    `database` String COMMENT '現在のS3Queueテーブルが存在するデータベース名。',
    `table` String COMMENT 'S3Queueテーブル名。',
    `uuid` String COMMENT 'S3QueueテーブルのUUID',
    `file_name` String COMMENT '処理対象ファイルのファイル名',
    `rows_processed` UInt64 COMMENT '処理された行数',
    `status` Enum8('Processed' = 0, 'Failed' = 1) COMMENT 'ファイル処理のステータス',
    `processing_start_time` Nullable(DateTime) COMMENT 'ファイル処理の開始時刻',
    `processing_end_time` Nullable(DateTime) COMMENT 'ファイル処理の終了時刻',
    `exception` String COMMENT '例外が発生した場合の例外メッセージ'
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, event_time)
SETTINGS index_granularity = 8192
COMMENT 'S3Queueエンジンによって処理されるファイルの情報を含むログエントリを格納する。'

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

1行が結果セットに含まれています。経過時間: 0.002秒。

```
