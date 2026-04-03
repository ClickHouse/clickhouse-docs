---
title: 'サポートマトリクス'
sidebar_label: 'サポートマトリクス'
slug: /use-cases/data-lake/support-matrix
sidebar_position: 3
pagination_prev: null
pagination_next: null
description: 'ClickHouse のオープンなテーブル形式統合およびデータカタログ接続に関する包括的なサポートマトリクス。'
keywords: ['データレイク', 'レイクハウス', 'サポート', 'iceberg', 'delta lake', 'hudi', 'paimon', 'カタログ', 'features']
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

このページでは、ClickHouse のデータレイク統合に関する包括的なサポートマトリクスを提供します。各オープンなテーブル形式で利用可能な機能、ClickHouse が接続できるカタログ、および各カタログでサポートされる機能について説明します。

## オープンなテーブル形式のサポート \{#format-support\}

ClickHouse は次の 4 種類のオープンなテーブル形式と統合されています: [Apache Iceberg](/engines/table-engines/integrations/iceberg)、[Delta Lake](/engines/table-engines/integrations/deltalake)、[Apache Hudi](/engines/table-engines/integrations/hudi)、および [Apache Paimon](/sql-reference/table-functions/paimon) です。サポートマトリクスを表示するには、以下から形式を選択してください。

**凡例:** ✅ サポートあり | ⚠️ 部分的 / 実験的 | ❌ サポートなし

<Tabs groupId="format-matrix">
  <TabItem value="iceberg" label="Apache Iceberg" default>
    | 機能                        | ステータス | 備考                                                                                                                                                                                                                                         |
    | ------------------------- | :---: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
    | **ストレージバックエンド**           |       |                                                                                                                                                                                                                                            |
    | AWS S3                    |   ✅   | [`icebergS3()`](/sql-reference/table-functions/iceberg) または `iceberg()` エイリアスを使用                                                                                                                                                           |
    | GCS                       |   ✅   | [`icebergS3()`](/sql-reference/table-functions/iceberg) または `iceberg()` エイリアスを介して                                                                                                                                                          |
    | Azure Blob Storage        |   ✅   | [`icebergAzure()`](/sql-reference/table-functions/iceberg) 経由                                                                                                                                                                              |
    | HDFS                      |   ⚠️  | [`icebergHDFS()`](/sql-reference/table-functions/iceberg) を使用 (非推奨) 。                                                                                                                                                                      |
    | ローカルファイルシステム              |   ✅   | [`icebergLocal()`](/sql-reference/table-functions/iceberg) を介して                                                                                                                                                                            |
    | **アクセス方法**                |       |                                                                                                                                                                                                                                            |
    | テーブル関数                    |   ✅   | [`icebergS3()`](/sql-reference/table-functions/iceberg)  (バックエンドごとのバリエーションあり)                                                                                                                                                              |
    | テーブルエンジン                  |   ✅   | [`IcebergS3`](/engines/table-engines/integrations/iceberg) (バックエンドごとのバリエーションあり)                                                                                                                                                            |
    | クラスタ分散読み取り                |   ✅   | [`icebergS3Cluster`](/sql-reference/table-functions/icebergCluster), [`icebergAzureCluster`](/sql-reference/table-functions/icebergCluster), [`icebergHDFSCluster`](/sql-reference/table-functions/icebergCluster)                         |
    | 名前付きコレクション                |   ✅   | [名前付きコレクションの定義](/sql-reference/table-functions/iceberg#defining-a-named-collection)                                                                                                                                                        |
    |                           |       |                                                                                                                                                                                                                                            |
    | **読み取り機能**                |       |                                                                                                                                                                                                                                            |
    | 読み取りのサポート                 |   ✅   | すべての ClickHouse SQL 関数に対する完全な SELECT サポート                                                                                                                                                                                                  |
    | パーティションプルーニング             |   ✅   | 詳細は [Partition pruning](/engines/table-engines/integrations/iceberg#partition-pruning) を参照してください。                                                                                                                                          |
    | 隠れたパーティション分割              |   ✅   | Iceberg の transform ベースのパーティション分割をサポート                                                                                                                                                                                                     |
    | パーティションの進化                |   ✅   | 時間とともにパーティション仕様が変化するテーブルからの読み取りをサポート                                                                                                                                                                                                       |
    | スキーマの進化                   |   ✅   | カラムの追加、削除、および並べ替えに対応。詳細は[Schema evolution](/engines/table-engines/integrations/iceberg#schema-evolution)を参照してください。                                                                                                                         |
    | 型の昇格 / 拡張                 |   ✅   | `int` → `long`、`float` → `double`、`decimal(P,S)` → `decimal(P',S)` (ここで P&#39; &gt; P) 。[スキーマ進化](/engines/table-engines/integrations/iceberg#schema-evolution)を参照してください。                                                                   |
    | タイムトラベル / スナップショット        |   ✅   | `iceberg_timestamp_ms` または `iceberg_snapshot_id` の設定を使用。詳細は [Time travel](/engines/table-engines/integrations/iceberg#time-travel) を参照してください。                                                                                              |
    | 位置ベース削除                   |   ✅   | [削除された行の処理](/engines/table-engines/integrations/iceberg#deleted-rows)を参照。                                                                                                                                                                  |
    | 等価条件付き削除                  |   ✅   | Table エンジンのみ (v25.8以降) 。詳しくは[削除済み行の処理](/engines/table-engines/integrations/iceberg#deleted-rows)を参照してください。                                                                                                                                 |
    | マージオンリード方式                |   ⚠️  | 実験的機能。[削除操作](/sql-reference/table-functions/iceberg#iceberg-writes-delete)に対応。                                                                                                                                                             |
    | フォーマットバージョン               |   ⚠️  | v1 と v2 をサポートし、v3 はサポートされていません。                                                                                                                                                                                                            |
    | カラム統計                     |   ✅   |                                                                                                                                                                                                                                            |
    | Bloom フィルター / Puffin ファイル |   ❌   | Puffin ファイル内の Bloom フィルター索引はサポートされていません。                                                                                                                                                                                                   |
    | 仮想カラム                     |   ✅   | `_path`, `_file`, `_size`, `_time`, `_etag`。[Virtual columns](/sql-reference/table-functions/iceberg#virtual-columns) を参照してください。                                                                                                           |
    |                           |       |                                                                                                                                                                                                                                            |
    | **書き込み機能**                |       |                                                                                                                                                                                                                                            |
    | テーブル作成                    |   ✅   | 実験的機能です。`allow_insert_into_iceberg = 1` が必要です。v25.7 以降。詳細は [テーブルの作成](/sql-reference/table-functions/iceberg#create-iceberg-table) を参照してください。                                                                                               |
    | INSERT                    |   ✅   | バージョン 26.2 からベータ。`allow_insert_into_iceberg = 1` が必要です。[データの挿入](/sql-reference/table-functions/iceberg#writes-inserts) を参照してください。                                                                                                          |
    | DELETE                    |   ✅   | 実験的。`allow_insert_into_iceberg = 1` が必要です。`ALTER TABLE ... DELETE WHERE` で実行します。詳しくは [Deleting data](/sql-reference/table-functions/iceberg#iceberg-writes-delete) を参照してください。                                                              |
    | ALTER TABLE (スキーマ変更)      |   ✅   | 実験的機能です。`allow_insert_into_iceberg = 1` が必要です。カラムの追加、削除、変更、名称変更が可能です。[スキーマの進化](/sql-reference/table-functions/iceberg#iceberg-writes-schema-evolution)を参照してください。                                                                           |
    | コンパクション                   |   ⚠️  | 実験的機能です。`allow_experimental_iceberg_compaction = 1` が必要です。position delete ファイルをデータファイルにマージします。[Compaction](/sql-reference/table-functions/iceberg#iceberg-writes-compaction) を参照してください。その他の Iceberg のコンパクション操作はサポートされていません。                |
    | UPDATE / MERGE            |   ❌   | サポートされていません。コンパクションを参照してください。                                                                                                                                                                                                              |
    | コピーオンライト方式                |   ❌   | サポートされていません。                                                                                                                                                                                                                               |
    | スナップショットの期限切れ処理           |   ❌   | サポートされていません。                                                                                                                                                                                                                               |
    | 孤立ファイルの削除                 |   ❌   | サポートされていません。                                                                                                                                                                                                                               |
    | パーティションへの書き込み             |   ✅   | サポートされています。                                                                                                                                                                                                                                |
    | パーティションの変更                |   ❌   | ClickHouse から Iceberg のパーティション方式を変更することはサポートされていません。ただし、ClickHouse から、パーティション方式が進化した既存の Iceberg テーブルに書き込むことは可能です。                                                                                                                          |
    |                           |       |                                                                                                                                                                                                                                            |
    | **メタデータ**                 |       |                                                                                                                                                                                                                                            |
    | ブランチとタグ付け                 |   ❌   | Iceberg のブランチ／タグ参照はサポートされていません。                                                                                                                                                                                                            |
    | メタデータファイルの解決              |   ✅   | カタログ、単純なディレクトリリスティング、&#39;version-hint&#39; および特定パスを通じたメタデータ解決をサポートします。`iceberg_metadata_file_path` と `iceberg_metadata_table_uuid` で設定可能です。[メタデータファイルの解決](/engines/table-engines/integrations/iceberg#metadata-file-resolution)を参照してください。 |
    | データキャッシュ                  |   ✅   | S3/Azure/HDFS ストレージエンジンと同じメカニズムです。[Data cache](/engines/table-engines/integrations/iceberg#data-cache) を参照してください。                                                                                                                          |
    | メタデータキャッシュ                |   ✅   | マニフェストおよびメタデータファイルはメモリ上にキャッシュされます。`use_iceberg_metadata_files_cache` によりデフォルトで有効になっています。詳細は [Metadata cache](/engines/table-engines/integrations/iceberg#metadata-cache) を参照してください。                                                        |
  </TabItem>

  <TabItem value="delta" label="Delta Lake">
    バージョン 25.6 以降、ClickHouse は Delta Lake Rust カーネルを使用して Delta Lake テーブルを読み取り、より広範な機能をサポートします。ただし、Azure Blob Storage 上のデータにアクセスする際に既知の問題が発生することが確認されています。このため、Azure Blob Storage 上のデータを読み取る場合、カーネルは無効化されています。以下で、どの機能がこのカーネルを必要とするかを示します。

    | 機能                      | ステータス | 備考                                                                                                                                                |
    | ----------------------- | :---: | ------------------------------------------------------------------------------------------------------------------------------------------------- |
    | **ストレージバックエンド**         |       |                                                                                                                                                   |
    | AWS S3                  |   ✅   | [`deltaLake()`](/sql-reference/table-functions/deltalake) または `deltaLakeS3()` 経由                                                                  |
    | GCS                     |   ✅   | [`deltaLake()`](/sql-reference/table-functions/deltalake) または `deltaLakeS3()` 経由                                                                  |
    | Azure Blob Storage      |   ✅   | [`deltaLakeAzure()`](/sql-reference/table-functions/deltalake) 経由                                                                                 |
    | HDFS                    |   ❌   | サポートされていません                                                                                                                                       |
    | ローカルファイルシステム            |   ✅   | [`deltaLakeLocal()`](/sql-reference/table-functions/deltalake) 経由                                                                                 |
    | **アクセス方法**              |       |                                                                                                                                                   |
    | テーブル関数                  |   ✅   | バックエンドごとのバリアントを持つ [`deltaLake()`](/sql-reference/table-functions/deltalake)                                                                       |
    | テーブルエンジン                |   ✅   | [`DeltaLake`](/engines/table-engines/integrations/deltalake)                                                                                      |
    | クラスター分散読み取り             |   ✅   | [`deltaLakeCluster`](/sql-reference/table-functions/deltalakeCluster), [`deltaLakeAzureCluster`](/sql-reference/table-functions/deltalakeCluster) |
    | Named collection        |   ✅   | [Named collection](/sql-reference/table-functions/deltalake#arguments)                                                                            |
    | **読み取り機能**              |       |                                                                                                                                                   |
    | 読み取りサポート                |   ✅   | すべての ClickHouse SQL 関数を用いた SELECT の完全サポート                                                                                                         |
    | パーティションプルーニング           |   ✅   | Delta カーネルが必要です。                                                                                                                                  |
    | スキーマエボリューション            |   ✅   | Delta カーネルが必要です。                                                                                                                                  |
    | タイムトラベル                 |   ✅   | Delta カーネルが必要です。                                                                                                                                  |
    | Deletion vectors        |   ✅   |                                                                                                                                                   |
    | Column mapping          |   ✅   |                                                                                                                                                   |
    | Change data feed        |   ✅   | Delta カーネルが必要です。                                                                                                                                  |
    | 仮想カラム                   |   ✅   | `_path`, `_file`, `_size`, `_time`, `_etag`。[Virtual columns](/sql-reference/table-functions/deltalake#virtual-columns) を参照してください。                |
    | **書き込み機能**              |       |                                                                                                                                                   |
    | INSERT                  |   ✅   | 実験的機能。`allow_experimental_delta_lake_writes = 1` が必要です。[DeltaLake エンジン](/engines/table-engines/integrations/deltalake) を参照してください。Delta カーネルが必要です。 |
    | DELETE / UPDATE / MERGE |   ❌   | サポートされていません                                                                                                                                       |
    | 空テーブルの CREATE           |   ❌   | 新しい空の Delta Lake テーブルの作成はサポートされていません。`CREATE TABLE` 操作は、オブジェクトストレージ上に既存の Delta Lake テーブルが存在することを前提とします。                                           |
    | **キャッシング**              |       |                                                                                                                                                   |
    | データキャッシュ                |   ✅   | S3/Azure/HDFS ストレージエンジンと同じメカニズム。[Data cache](/engines/table-engines/integrations/deltalake#data-cache) を参照してください。                                 |
  </TabItem>

  <TabItem value="hudi" label="Apache Hudi">
    | 機能                       | ステータス | 備考                                                                                                            |
    | ------------------------ | :---: | ------------------------------------------------------------------------------------------------------------- |
    | **ストレージバックエンド**          |       |                                                                                                               |
    | AWS S3                   |   ✅   | [`hudi()`](/sql-reference/table-functions/hudi) 経由                                                            |
    | GCS                      |   ✅   | [`hudi()`](/sql-reference/table-functions/hudi) 経由                                                            |
    | Azure Blob Storage       |   ❌   | 未対応                                                                                                           |
    | HDFS                     |   ❌   | 未対応                                                                                                           |
    | ローカルファイルシステム             |   ❌   | 未対応                                                                                                           |
    | **アクセス方法**               |       |                                                                                                               |
    | テーブル関数                   |   ✅   | [`hudi()`](/sql-reference/table-functions/hudi)                                                               |
    | テーブルエンジン                 |   ✅   | [`Hudi`](/engines/table-engines/integrations/hudi)                                                            |
    | クラスター分散読み取り              |   ✅   | [`hudiCluster`](/sql-reference/table-functions/hudiCluster) (S3 のみ)                                           |
    | 名前付きコレクション               |   ✅   | [Hudi の引数](/sql-reference/table-functions/hudi#arguments)                                                     |
    | **読み取り機能**               |       |                                                                                                               |
    | 読み取りサポート                 |   ✅   | すべての ClickHouse SQL 関数を用いた完全な SELECT をサポート                                                                    |
    | スキーマ進化                   |   ❌   | 未対応                                                                                                           |
    | タイムトラベル                  |   ❌   | 未対応                                                                                                           |
    | 仮想カラム                    |   ✅   | `_path`, `_file`, `_size`, `_time`, `_etag`。[仮想カラム](/sql-reference/table-functions/hudi#virtual-columns) を参照。 |
    | **書き込み機能**               |       |                                                                                                               |
    | INSERT / DELETE / UPDATE |   ❌   | 読み取り専用の統合                                                                                                     |
    | **キャッシュ**                |       |                                                                                                               |
    | データキャッシュ                 |   ❌   | 未対応                                                                                                           |
  </TabItem>

  <TabItem value="paimon" label="Apache Paimon">
    | 機能                        |  状態 | 備考                                                                                                                                                                                                                 |
    | ------------------------- | :-: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
    | **ストレージバックエンド**           |     |                                                                                                                                                                                                                    |
    | S3                        |  ✅  | 実験的機能です。[`paimon()`](/sql-reference/table-functions/paimon) または `paimonS3()` を介して利用可能                                                                                                                              |
    | GCS                       |  ✅  | 実験的機能です。[`paimon()`](/sql-reference/table-functions/paimon) または `paimonS3()` を介して利用可能                                                                                                                              |
    | Azure Blob Storage        |  ✅  | 実験的機能です。[`paimonAzure()`](/sql-reference/table-functions/paimon) を介して利用可能                                                                                                                                          |
    | HDFS                      |  ⚠️ | 実験的機能です。[`paimonHDFS()`](/sql-reference/table-functions/paimon) を介して利用可能。非推奨です。                                                                                                                                    |
    | Local filesystem          |  ✅  | 実験的機能です。[`paimonLocal()`](/sql-reference/table-functions/paimon) を介して利用可能                                                                                                                                          |
    | **アクセス方法**                |     |                                                                                                                                                                                                                    |
    | Table function            |  ✅  | 実験的機能です。バックエンドごとのバリアントを持つ [`paimon()`](/sql-reference/table-functions/paimon)                                                                                                                                      |
    | Table engine              |  ❌  | 専用のテーブルエンジンはありません                                                                                                                                                                                                  |
    | Cluster-distributed reads |  ✅  | 実験的機能です。[`paimonS3Cluster`](/sql-reference/table-functions/paimonCluster)、[`paimonAzureCluster`](/sql-reference/table-functions/paimonCluster)、[`paimonHDFSCluster`](/sql-reference/table-functions/paimonCluster) |
    | Named collections         |  ✅  | 実験的機能です。[named collection の定義](/sql-reference/table-functions/paimon#defining-a-named-collection)                                                                                                                  |
    | **読み取り機能**                |     |                                                                                                                                                                                                                    |
    | Read support              |  ✅  | 実験的機能です。すべての ClickHouse SQL 関数に対する完全な SELECT サポート                                                                                                                                                                  |
    | Schema evolution          |  ❌  | サポートされていません                                                                                                                                                                                                        |
    | Time travel               |  ❌  | サポートされていません                                                                                                                                                                                                        |
    | Virtual columns           |  ✅  | 実験的機能です。`_path`、`_file`、`_size`、`_time`、`_etag` をサポートします。詳細は [Virtual columns](/sql-reference/table-functions/paimon#virtual-columns) を参照してください。                                                                   |
    | **書き込み機能**                |     |                                                                                                                                                                                                                    |
    | INSERT / DELETE / UPDATE  |  ❌  | 読み取り専用の統合                                                                                                                                                                                                          |
    | **キャッシュ機能**               |     |                                                                                                                                                                                                                    |
    | Data caching              |  ❌  | サポートされていません                                                                                                                                                                                                        |
  </TabItem>
</Tabs>

## カタログ対応 \{#catalog-support\}

ClickHouse は、[`DataLakeCatalog`](/engines/database-engines/datalakecatalog) データベースエンジンを使用して外部データカタログに接続でき、カタログを ClickHouse のデータベースとして扱うことができます。カタログに登録されたテーブルは自動的に利用可能になり、標準的な SQL でクエリできます。

現在、次のカタログがサポートされています。セットアップ手順の詳細については、各カタログのリファレンスガイドを参照してください。

| Catalog                                                        | Formats        |      Read      | Create table | INSERT | Reference guide                                               |
| -------------------------------------------------------------- | -------------- | :------------: | :----------: | :----: | ------------------------------------------------------------- |
| [AWS Glue Catalog](/use-cases/data-lake/glue-catalog)          | Iceberg        |     ✅ Beta     |       ❌      |    ❌   | [Glue カタログガイド](/use-cases/data-lake/glue-catalog)             |
| [BigLake Metastore](/use-cases/data-lake/biglake-catalog)      | Iceberg        |     ✅ Beta     |       ❌      |    ❌   | [BigLake Metastore ガイド](/use-cases/data-lake/biglake-catalog) |
| [Databricks Unity Catalog](/use-cases/data-lake/unity-catalog) | Delta, Iceberg | ✅ Experimental |       ❌      |    ❌   | [Unity Catalog ガイド](/use-cases/data-lake/unity-catalog)       |
| [Iceberg REST](/use-cases/data-lake/rest-catalog)              | Iceberg        |     ✅ Beta     |       ❌      |    ❌   | [REST カタログガイド](/use-cases/data-lake/rest-catalog)             |
| [Lakekeeper](/use-cases/data-lake/lakekeeper-catalog)          | Iceberg        | ✅ Experimental |       ❌      |    ❌   | [Lakekeeper カタログガイド](/use-cases/data-lake/lakekeeper-catalog) |
| [Project Nessie](/use-cases/data-lake/nessie-catalog)          | Iceberg        | ✅ Experimental |       ❌      |    ❌   | [Nessie カタログガイド](/use-cases/data-lake/nessie-catalog)         |
| [Microsoft OneLake](/use-cases/data-lake/onelake-catalog)      | Iceberg        |     ✅ Beta     |       ❌      |    ❌   | [OneLake カタログガイド](/use-cases/data-lake/onelake-catalog)       |

現在、すべてのカタログ連携では実験的またはベータ版の設定を有効にする必要があり、**読み取り専用**アクセスのみが提供されます。つまり、カタログ接続経由でテーブルに対してクエリを実行することはできますが、テーブルを作成したり書き込んだりすることはできません。カタログから ClickHouse にデータをロードして分析を高速化するには、[分析の高速化ガイド](/use-cases/data-lake/getting-started/accelerating-analytics)で説明しているように `INSERT INTO SELECT` を使用します。オープンなテーブル形式へデータを書き戻すには、[データ書き込みガイド](/use-cases/data-lake/getting-started/writing-data)で説明しているように、スタンドアロンの Iceberg テーブルを作成します。