---
description: 'このエンジンは Azure Blob Storage エコシステムとの統合を提供し、ストリーミングデータの取り込みを可能にします。'
sidebar_label: 'AzureQueue'
sidebar_position: 181
slug: /engines/table-engines/integrations/azure-queue
title: 'AzureQueue テーブルエンジン'
doc_type: 'reference'
---



# AzureQueue テーブルエンジン

このエンジンは [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) エコシステムとの統合を提供し、ストリーミングデータの取り込みを可能にします。



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

`AzureQueue`のパラメータは`AzureBlobStorage`テーブルエンジンと同じです。パラメータの詳細については[こちら](../../../engines/table-engines/integrations/azureBlobStorage.md)を参照してください。

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage)テーブルエンジンと同様に、ローカルでのAzure Storage開発にはAzuriteエミュレータを使用できます。詳細については[こちら](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)を参照してください。

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

サポートされている設定は`S3Queue`テーブルエンジンと同じですが、`s3queue_`プレフィックスは付きません。[設定の完全なリスト](../../../engines/table-engines/integrations/s3queue.md#settings)を参照してください。
テーブルに設定されている設定のリストを取得するには、`system.azure_queue_settings`テーブルを使用します。`24.10`から利用可能です。


## Description {#description}

`SELECT`はストリーミングインポートにはあまり有用ではありません(デバッグを除く)。各ファイルは一度しかインポートできないためです。[マテリアライズドビュー](../../../sql-reference/statements/create/view.md)を使用してリアルタイム処理を作成する方が実用的です。これを行うには:

1.  エンジンを使用してS3の指定されたパスから読み取るテーブルを作成し、それをデータストリームとして扱います。
2.  必要な構造を持つテーブルを作成します。
3.  エンジンからデータを変換し、事前に作成したテーブルに格納するマテリアライズドビューを作成します。

`MATERIALIZED VIEW`がエンジンに接続されると、バックグラウンドでデータの収集が開始されます。

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

- `_path` — ファイルへのパス
- `_file` — ファイル名

仮想カラムの詳細については、[こちら](../../../engines/table-engines/index.md#table_engines-virtual_columns)を参照してください。


## イントロスペクション {#introspection}

テーブル設定 `enable_logging_to_queue_log=1` でテーブルのログ記録を有効にします。

イントロスペクション機能は [S3Queueテーブルエンジン](/engines/table-engines/integrations/s3queue#introspection) と同じですが、いくつかの相違点があります:

1. サーババージョン >= 25.1 では、キューのインメモリ状態に `system.azure_queue` を使用します。それ以前のバージョンでは `system.s3queue` を使用します(`azure` テーブルの情報も含まれます)。
2. メインのClickHouse設定で `system.azure_queue_log` を有効にします。例:

```xml
<azure_queue_log>
  <database>system</database>
  <table>azure_queue_log</table>
</azure_queue_log>
```

この永続テーブルは `system.s3queue` と同じ情報を持ちますが、処理済みおよび失敗したファイルに関するものです。

テーブルは以下の構造を持ちます:

```sql

CREATE TABLE system.azure_queue_log
(
    `hostname` LowCardinality(String) COMMENT 'ホスト名',
    `event_date` Date COMMENT 'このログ行を書き込んだイベント日付',
    `event_time` DateTime COMMENT 'このログ行を書き込んだイベント時刻',
    `database` String COMMENT '現在のS3Queueテーブルが存在するデータベースの名前',
    `table` String COMMENT 'S3Queueテーブルの名前',
    `uuid` String COMMENT 'S3QueueテーブルのUUID',
    `file_name` String COMMENT '処理ファイルのファイル名',
    `rows_processed` UInt64 COMMENT '処理された行数',
    `status` Enum8('Processed' = 0, 'Failed' = 1) COMMENT '処理ファイルのステータス',
    `processing_start_time` Nullable(DateTime) COMMENT 'ファイル処理の開始時刻',
    `processing_end_time` Nullable(DateTime) COMMENT 'ファイル処理の終了時刻',
    `exception` String COMMENT '発生した例外メッセージ'
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_date)
ORDER BY (event_date, event_time)
SETTINGS index_granularity = 8192
COMMENT 'S3Queueエンジンによって処理されたファイルの情報を含むログエントリを格納します。'

```

例:

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
