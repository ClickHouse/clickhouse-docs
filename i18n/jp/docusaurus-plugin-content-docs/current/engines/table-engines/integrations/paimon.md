---
description: 'このエンジンは、Amazon S3、Azure、HDFS、およびローカルに保存された既存の Apache Paimon テーブルに対する読み取り専用の統合を提供します。'
sidebar_label: 'Paimon'
sidebar_position: 95
slug: /engines/table-engines/integrations/paimon
title: 'Paimon テーブルエンジン'
doc_type: 'reference'
---

# Paimon テーブルエンジン \{#paimon-table-engine\}

このエンジンは、Amazon S3、Azure、HDFS、およびローカルに保存された既存の Apache [Paimon](https://paimon.apache.org/) テーブルに対する読み取り専用の統合を提供します。
スナップショット読み取り、増分読み取り、およびエンジンが提供する基本的なパーティション剪枝をサポートしています。

## テーブルを作成 \{#create-table\}

Paimon テーブルは、ストレージ内にあらかじめ存在している必要がある点に注意してください。このコマンドでは、新しいテーブルを作成するための DDL パラメータは指定できません。
`Paimon*` テーブルの作成は `allow_experimental_paimon_storage_engine` で制御されており (デフォルトでは無効) 、`CREATE TABLE` を実行する前にこれを有効にしてください。

```sql
SET allow_experimental_paimon_storage_engine = 1;

CREATE TABLE paimon_table_s3
    ENGINE = PaimonS3(url,  [, access_key_id, secret_access_key] [,format] [,structure] [,compression])

CREATE TABLE paimon_table_azure
    ENGINE = PaimonAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

CREATE TABLE paimon_table_hdfs
    ENGINE = PaimonHDFS(path_to_table, [,format] [,compression_method])

CREATE TABLE paimon_table_local
    ENGINE = PaimonLocal(path_to_table, [,format] [,compression_method])
```

## エンジン引数 \{#engine-arguments\}

各引数の説明は、それぞれ `S3`、`AzureBlobStorage`、`HDFS`、`File` エンジンの引数の説明と同じです。
`format` は、Paimon テーブル内のデータファイルのフォーマットを表します。

エンジンのパラメータは、[名前付きコレクション](../../../operations/named-collections.md) を使用して指定できます

### 例 \{#example\}

```sql
CREATE TABLE paimon_table ENGINE=PaimonS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

名前付きコレクションの使用:

```xml
<clickhouse>
    <named_collections>
        <paimon_conf>
            <url>http://test.s3.amazonaws.com/clickhouse-bucket/</url>
            <access_key_id>test</access_key_id>
            <secret_access_key>test</secret_access_key>
        </paimon_conf>
    </named_collections>
</clickhouse>
```

```sql
CREATE TABLE paimon_table ENGINE=PaimonS3(paimon_conf, filename = 'test_table')
```

## 機能 \{#capabilities\}

* 最新のテーブルスナップショットから読み取るスナップショット読み取り。
* 有効な場合、コミット済みのスナップショット ID に基づく増分読み取り。
* `use_paimon_partition_pruning` が有効な場合のパーティション剪枝。
* 設定されている場合、メタデータのバックグラウンドリフレッシュを任意で実行可能。
* Atomic/Replicated データベース使用時はテーブル UUID が安定するため、Keeper パスで `{uuid}` マクロを利用できます。

## 設定 \{#settings\}

このエンジンは、対応するオブジェクトストレージエンジンと同じ設定を使用し、さらに Paimon 固有の設定が追加されています。

* `allow_experimental_paimon_storage_engine` — `Paimon`、`PaimonS3`、`PaimonAzure`、`PaimonHDFS`、`PaimonLocal` テーブルエンジンの作成を有効にします。デフォルト: `0` (無効) 。
* `paimon_incremental_read` — 増分読み取りモードを有効にします。
* `paimon_metadata_refresh_interval_sec` — バックグラウンドのメタデータ更新インターバル (秒) 。0 より大きい値に設定すると、バックグラウンドタスクが定期的にオブジェクトストレージから最新のスナップショットとschemaを取得します。デフォルト: 30。
* `paimon_keeper_path` — 増分読み取り状態の Keeper パス。設定は必須で、テーブルごとに一意である必要があります。`{database}`、`{table}`、`{uuid}` などの マクロ をサポートします。
* `paimon_replica_name` — 増分読み取り状態のレプリカ名。設定は必須で、レプリカごとに一意である必要があります。`{replica}` などの マクロ をサポートします。

## 増分読み取りの例 \{#incremental-read-examples\}

Keeper の状態を用いた増分読み取り:

```sql
CREATE TABLE paimon_inc
ENGINE = PaimonS3(paimon_conf, filename = 'paimon_all_types')
SETTINGS
    paimon_incremental_read = 1,
    paimon_keeper_path = '/clickhouse/{database}/{uuid}',
    paimon_replica_name = '{replica}';
```

特定スナップショットの差分読み取り (クエリレベル) :

```sql
SELECT count()
FROM paimon_inc
SETTINGS paimon_target_snapshot_id = 1;
```

## リフレッシャブルmaterialized view を使用した Paimon から MergeTree への取り込み \{#paimon-to-mergetree-via-refresh-mv\}

`APPEND` モードのリフレッシャブルmaterialized view を使用すると、Paimon テーブルから MergeTree テーブルへデータを継続的に同期するエンドツーエンドのパイプラインを構築できます。各リフレッシュサイクルでは、Paimon から新しい増分データのみを読み取り、宛先テーブルに追記します。

**ステップ 1 — 増分読み取りとメタデータのリフレッシュを有効にした Paimon ソーステーブルを作成します。**

以下の例では `PaimonLocal` を使用します。ストレージバックエンドに応じて、エンジンを `PaimonS3`、`PaimonAzure`、`PaimonHDFS`、または `Paimon` エイリアスに置き換えてください。

```sql
SET allow_experimental_paimon_storage_engine = 1;

-- Local storage
CREATE TABLE paimon_mv_source
ENGINE = PaimonLocal('/path/to/paimon/table')
SETTINGS
    paimon_incremental_read = 1,
    paimon_keeper_path = '/clickhouse/tables/{uuid}',
    paimon_replica_name = '{replica}',
    paimon_metadata_refresh_interval_sec = 1;

-- S3 storage (Paimon is an alias for PaimonS3)
CREATE TABLE paimon_mv_source
ENGINE = Paimon('http://minio:9000/bucket/path/to/table', 'access_key', 'secret_key')
SETTINGS
    paimon_incremental_read = 1,
    paimon_keeper_path = '/clickhouse/tables/{uuid}',
    paimon_replica_name = '{replica}',
    paimon_metadata_refresh_interval_sec = 1;
```

`paimon_metadata_refresh_interval_sec` は、バックグラウンドでのメタデータの更新インターバルを秒単位で設定します。0 より大きい場合、バックグラウンドタスクがオブジェクトストレージから最新のスナップショットと schema を定期的に取得するため、MV のリフレッシュサイクルは、メタデータ更新がクエリによってトリガーされるのを待たずに、新たにコミットされたデータを参照できます。デフォルト値は 30 です。オブジェクトストレージおよび Keeper の I/O が過剰にならないよう、多数のテーブルで使用する場合は注意してください。

**ステップ 2 — MergeTree 宛先テーブルを作成します (schema は Paimon テーブルから複製) :**

```sql
CREATE TABLE paimon_mv_dest AS paimon_mv_source
ENGINE = MergeTree()
ORDER BY tuple();
```

**ステップ 3 — リフレッシャブルmaterialized viewを作成する:**

```sql
CREATE MATERIALIZED VIEW paimon_mv
REFRESH EVERY 10 SECOND
APPEND
TO paimon_mv_dest
AS SELECT * FROM paimon_mv_source;
```

10 秒ごとに、MV は `SELECT * FROM paimon_mv_source` を実行し、最後にコミットされたスナップショット以降に追加された行のみを返して、それらを `paimon_mv_dest` に追記します。

**クリーンアップ:**

```sql
SYSTEM STOP VIEW paimon_mv;
DROP VIEW IF EXISTS paimon_mv SYNC;
DROP TABLE IF EXISTS paimon_mv_dest SYNC;
DROP TABLE IF EXISTS paimon_mv_source SYNC;
```

:::note
バックグラウンドでの refresh によって DDL 操作がブロックされるのを防ぐため、削除する前に MV を停止してください。
:::

## 制限事項 \{#limitations\}

* 増分読み取りを行うには、Keeper (ZooKeeper) が設定されている必要があります。
* 増分読み取りを行うには、`paimon_keeper_path` を設定し、テーブルごとに一意の値にする必要があります。
* `paimon_replica_name` は、同じ Keeper パス内でレプリカごとに一意である必要があります。
* このテーブルエンジンは読み取り専用で、データの変更はサポートされていません。
* 増分読み取りでは、Paimon ソース内の過去データの削除は処理されません。上流の Paimon データが削除または更新されても、ClickHouse の MergeTree 宛先テーブルにすでに書き込まれている対応する行は自動では削除されません。古いデータをクリーンアップするには、MergeTree テーブルに対して `ALTER TABLE ... DELETE` を手動で実行する必要があります。

## 別名 \{#aliases\}

テーブルエンジン `Paimon` は現在、`PaimonS3` の別名です。

## 仮想カラム \{#virtual-columns\}

* `_path` — ファイルのパス。型: `LowCardinality(String)`.
* `_file` — ファイル名。型: `LowCardinality(String)`.
* `_size` — ファイルのサイズ (バイト単位) 。型: `Nullable(UInt64)`. ファイルサイズが不明な場合、値は `NULL` です。
* `_time` — ファイルの最終更新時刻。型: `Nullable(DateTime)`. 時刻が不明な場合、値は `NULL` です。
* `_etag` — ファイルの etag。型: `LowCardinality(String)`. etag が不明な場合、値は `NULL` です。

## サポート対象のデータ型 \{#data-types-supported\}

| Paimon データ型                       | ClickHouse データ型           |
| --------------------------------- | ------------------------- |
| BOOLEAN                           | Int8                      |
| TINYINT                           | Int8                      |
| SMALLINT                          | Int16                     |
| INTEGER                           | Int32                     |
| BIGINT                            | Int64                     |
| FLOAT                             | Float32                   |
| DOUBLE                            | Float64                   |
| STRING,VARCHAR,BYTES,VARBINARY    | String                    |
| DATE                              | Date                      |
| TIME(p),TIME                      | Time(&#39;UTC&#39;)       |
| TIMESTAMP(p) WITH LOCAL TIME ZONE | DateTime64                |
| TIMESTAMP(p)                      | DateTime64(&#39;UTC&#39;) |
| CHAR                              | FixedString(1)            |
| BINARY(n)                         | FixedString(n)            |
| DECIMAL(P,S)                      | Decimal(P,S)              |
| ARRAY                             | Array                     |
| MAP                               | Map                       |

## サポートされるパーティションキー \{#partition-supported\}

Paimon のパーティションキーでサポートされるデータ型:

* `CHAR`
* `VARCHAR`
* `BOOLEAN`
* `DECIMAL`
* `TINYINT`
* `SMALLINT`
* `INTEGER`
* `DATE`
* `TIME`
* `TIMESTAMP`
* `TIMESTAMP WITH LOCAL TIME ZONE`
* `BIGINT`
* `FLOAT`
* `DOUBLE`