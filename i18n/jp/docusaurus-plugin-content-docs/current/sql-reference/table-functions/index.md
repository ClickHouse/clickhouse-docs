---
slug: /sql-reference/table-functions/
sidebar_label: テーブル関数
sidebar_position: 1
---


# テーブル関数

テーブル関数はテーブルを構築するためのメソッドです。

テーブル関数は以下で使用できます：

- [FROM](../../sql-reference/statements/select/from.md) 句の `SELECT` クエリ。

   現在のクエリでのみ使用できる一時テーブルを作成する方法です。クエリが終了すると、テーブルは削除されます。

- [CREATE TABLE AS table_function()](../../sql-reference/statements/create/table.md) クエリ。

   テーブルを作成する方法の一つです。

- [INSERT INTO TABLE FUNCTION](../../sql-reference/statements/insert-into.md#inserting-into-table-function) クエリ。

:::note
[allow_ddl](../../operations/settings/permissions-for-queries.md#settings_allow_ddl) 設定が無効になっている場合、テーブル関数は使用できません。
:::
| ページ | 説明 |
|-----|-----|
| [fileCluster](/docs/sql-reference/table-functions/fileCluster) | 指定されたパスに一致するファイルを、クラスタ内の複数のノードで同時に処理できるようにします。イニシエーターはワーカーノードに接続を確立し、ファイルパスのグロブを展開し、ファイル読み取りタスクをワーカーノードに委任します。各ワーカーノードは、次に処理するファイルをイニシエーターにクエリし、全タスクが完了するまで繰り返します（すべてのファイルが読み取られるまで）。 |
| [input](/docs/sql-reference/table-functions/input) | サーバーに送信されたデータを、指定された構造から別の構造のテーブルに効果的に変換して挿入するテーブル関数です。 |
| [iceberg](/docs/sql-reference/table-functions/iceberg) | Amazon S3、Azure、HDFS、またはローカルに保存されたApache Icebergテーブルへの読み取り専用のテーブルのようなインターフェースを提供します。 |
| [executable](/docs/engines/table-functions/executable) | `executable` テーブル関数は、ユーザー定義関数 (UDF) の出力に基づいてテーブルを作成します。UDFは、**stdout**に行を出力するスクリプトで定義します。 |
| [timeSeriesMetrics](/docs/sql-reference/table-functions/timeSeriesMetrics) | timeSeriesMetricsは、テーブルエンジンがTimeSeriesエンジンであるテーブル `db_name.time_series_table` が使用するメトリクステーブルを返します。 |
| [loop](/docs/sql-reference/table-functions/loop) | ClickHouseのループテーブル関数は、無限ループでクエリ結果を返すために使用されます。 |
| [url](/docs/sql-reference/table-functions/url) | 指定された `format` と `structure` を使用して `URL` からテーブルを作成します。 |
| [hudi](/docs/sql-reference/table-functions/hudi) | Amazon S3 の Apache Hudi テーブルへの読み取り専用テーブルのようなインターフェースを提供します。 |
| [fuzzQuery](/docs/sql-reference/table-functions/fuzzQuery) | 与えられたクエリ文字列にランダムな変動を与えます。 |
| [clusterAllReplicas](/docs/sql-reference/table-functions/cluster) | 分散テーブルを作成せずに、クラスター内のすべてのシャード（`remote_servers` セクションで構成された）にアクセスします。 |
| [urlCluster](/docs/sql-reference/table-functions/urlCluster) | 指定されたクラスタの多くのノードからURLのファイルを並行して処理します。 |
| [redis](/docs/sql-reference/table-functions/redis) | このテーブル関数は、ClickHouseとRedisの統合を可能にします。 |
| [icebergCluster](/docs/sql-reference/table-functions/icebergCluster) | Apache Icebergからのファイルを、指定されたクラスタの多くのノードで並行して処理するためのicebergテーブル関数の拡張です。 |
| [view](/docs/sql-reference/table-functions/view) | サブクエリをテーブルに変換します。この関数はビューを実装しています。 |
| [file](/docs/sql-reference/table-functions/file) | ファイルからSELECTおよびINSERTを行う列指向のインターフェースを提供するテーブルエンジンで、s3テーブル関数に似ています。ローカルファイルで作業する場合は `file()` を使用し、S3、GCS、またはMinIOなどのオブジェクトストレージのバケットで作業する場合は `s3()` を使用します。 |
| [timeSeriesTags](/docs/sql-reference/table-functions/timeSeriesTags) | timeSeriesTagsテーブル関数は、テーブルエンジンがTimeSeriesエンジンであるテーブル `db_name.time_series_table` が使用するタグテーブルを返します。 |
| [mysql](/docs/sql-reference/table-functions/mysql) | リモートMySQLサーバーに保存されているデータに対して `SELECT` および `INSERT` クエリを実行できるようになります。 |
| [](/docs/sql-reference/table-functions/s3) | Amazon S3およびGoogle Cloud Storageのファイルを選択/挿入するためのテーブルのようなインターフェースを提供します。このテーブル関数はhdfs関数に似ていますが、S3固有の機能を提供します。 |
| [dictionary](/docs/sql-reference/table-functions/dictionary) | ClickHouseテーブルとして辞書データを表示します。Dictionaryエンジンと同じように動作します。 |
| [hdfs](/docs/sql-reference/table-functions/hdfs) | HDFS内のファイルからテーブルを作成します。このテーブル関数はurlおよびfileテーブル関数に似ています。 |
| [fuzzJSON](/docs/sql-reference/table-functions/fuzzJSON) | ランダムな変動を与えてJSON文字列を変化させます。 |
| [hdfsCluster](/docs/sql-reference/table-functions/hdfsCluster) | 指定されたクラスタの多くのノードからHDFSのファイルを並行して処理します。 |
| [zeros](/docs/sql-reference/table-functions/zeros) | テスト目的で多数の行を生成する最も早い方法として使用します。`system.zeros`および`system.zeros_mt`システムテーブルに似ています。 |
| [generateRandom](/docs/sql-reference/table-functions/generate) | 指定されたスキーマを持つランダムデータを生成します。そのデータでテストテーブルを埋めることができます。すべての型がサポートされているわけではありません。 |
| [deltaLake](/docs/sql-reference/table-functions/deltalake) | Amazon S3のDelta Lakeテーブルへの読み取り専用のテーブルのようなインターフェースを提供します。 |
| [gcs](/docs/sql-reference/table-functions/gcs) | Google Cloud Storageからデータを `SELECT` および `INSERT` するためのテーブルのようなインターフェースを提供します。`Storage Object User` IAMロールが必要です。 |
| [mergeTreeIndex](/docs/sql-reference/table-functions/mergeTreeIndex) | MergeTreeテーブルのインデックスとマークファイルの内容を表現します。内部観察に使用できます。 |
| [postgresql](/docs/sql-reference/table-functions/postgresql) | リモートPostgreSQLサーバーに保存されているデータに対して `SELECT` および `INSERT` クエリを実行できるようになります。 |
| [timeSeriesData](/docs/sql-reference/table-functions/timeSeriesData) | timeSeriesDataは、テーブルエンジンがTimeSeriesエンジンであるテーブル `db_name.time_series_table` が使用するデータテーブルを返します。 |
| [azureBlobStorage](/docs/sql-reference/table-functions/azureBlobStorage) | Azure Blob Storageのファイルを選択/挿入するためのテーブルのようなインターフェースを提供します。s3関数に似ています。 |
| [odbc](/docs/sql-reference/table-functions/odbc) | ODBCを介して接続されたテーブルを返します。 |
| [merge](/docs/sql-reference/table-functions/merge) | 一時的なMergeテーブルを作成します。テーブルの構造は、正規表現に一致する最初のテーブルから取得されます。 |
| [hudiCluster テーブル関数](/docs/sql-reference/table-functions/hudiCluster) | hudiテーブル関数の拡張です。Amazon S3のApache Hudiテーブルからファイルを多くのノードで並行して処理することを可能にします。 |
| [generate_series (generateSeries)](/docs/sql-reference/table-functions/generate_series) | 開始から停止までの整数を含む単一の 'generate_series' カラム（UInt64）を持つテーブルを返します。 |
| [azureBlobStorageCluster](/docs/sql-reference/table-functions/azureBlobStorageCluster) | Azure Blob Storageのファイルを指定されたクラスタの多くのノードで並行して処理できるようにします。 |
| [jdbc](/docs/sql-reference/table-functions/jdbc) | JDBCドライバーを介して接続されたテーブルを返します。 |
| [format](/docs/sql-reference/table-functions/format) | 指定された入力フォーマットに従って引数からデータを解析します。構造引数が指定されていない場合、データから抽出されます。 |
| [s3Cluster](/docs/sql-reference/table-functions/s3Cluster) | Amazon S3とGoogle Cloud Storageからのファイルを、指定されたクラスタの多くのノードで並行して処理するためのs3テーブル関数の拡張です。 |
| [](/docs/sql-reference/table-functions/generateSeries) |  |
| [sqlite](/docs/sql-reference/table-functions/sqlite) | SQLiteデータベースに保存されているデータに対してクエリを実行することを可能にします。 |
| [deltaLakeCluster](/docs/sql-reference/table-functions/deltalakeCluster) | deltaLakeテーブル関数への拡張です。 |
| [numbers](/docs/sql-reference/table-functions/numbers) | 指定可能な整数を含む単一の 'number' カラムを持つテーブルを返します。 |
| [null](/docs/sql-reference/table-functions/null) | Nullテーブルエンジンを使用して、指定された構造の一時テーブルを作成します。この関数は、テストの記述やデモの便宜上使用されます。 |
| [remote, remoteSecure](/docs/sql-reference/table-functions/remote) | テーブル関数 `remote` は、分散テーブルを作成することなく、リモートサーバーにリアルタイムでアクセスできるようにします。テーブル関数 `remoteSecure` は、セキュアな接続を介して同じ機能を提供します。 |
| [mongodb](/docs/sql-reference/table-functions/mongodb) | リモートMongoDBサーバーに保存されているデータに対して `SELECT` クエリを実行することを可能にします。 |
