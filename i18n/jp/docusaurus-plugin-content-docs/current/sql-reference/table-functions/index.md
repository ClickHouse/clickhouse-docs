---
slug: '/sql-reference/table-functions/'
sidebar_label: 'テーブル関数'
sidebar_position: 1
---


# テーブル関数

テーブル関数は、テーブルを構築するためのメソッドです。

テーブル関数は、以下の場所で使用できます：

- [FROM](../../sql-reference/statements/select/from.md)句の `SELECT` クエリ。

   現在のクエリのみで利用可能な一時テーブルを作成する方法です。クエリが終了すると、テーブルは削除されます。

- [CREATE TABLE AS table_function()](../../sql-reference/statements/create/table.md) クエリ。

   テーブルを作成するためのメソッドの一つです。

- [INSERT INTO TABLE FUNCTION](/sql-reference/statements/insert-into#inserting-using-a-table-function) クエリ。

:::note
[allow_ddl](/operations/settings/settings#allow_ddl) 設定が無効になっていると、テーブル関数を使用できません。
:::
| ページ | 説明 |
|-----|-----|
| [fileCluster](/sql-reference/table-functions/fileCluster) | 指定されたパスに一致するファイルをクラスタ内の複数ノードで同時に処理できるようにします。イニシエーターはワーカーノードに接続し、ファイルパス内のグロブを展開し、ファイル読み取りタスクをワーカーノードに委任します。各ワーカーノードは処理する次のファイルをイニシエーターに照会し、すべてのタスクが完了するまで繰り返します（すべてのファイルが読み取られるまで）。 |
| [input](/sql-reference/table-functions/input) | 指定された構造でサーバーに送信されたデータを他の構造のテーブルに効果的に変換し挿入できるテーブル関数です。 |
| [iceberg](/sql-reference/table-functions/iceberg) | Amazon S3、Azure、HDFS、またはローカルに保存されたApache Icebergテーブルに対する読み取り専用のテーブルのようなインターフェースを提供します。 |
| [executable](/engines/table-functions/executable) | `executable` テーブル関数は、スクリプト内でユーザー定義関数（UDF）の出力に基づいてテーブルを作成します。このスクリプトは、**stdout** に行を出力します。 |
| [timeSeriesMetrics](/sql-reference/table-functions/timeSeriesMetrics) | timeSeriesMetricsは、テーブルエンジンがTimeSeriesエンジンである `db_name.time_series_table` に使用されるメトリクステーブルを返します。 |
| [loop](/sql-reference/table-functions/loop) | ClickHouseのループテーブル関数は、無限ループでクエリ結果を返すために使用されます。 |
| [url](/sql-reference/table-functions/url) | 与えられた `format` と `structure` で `URL` からテーブルを作成します。 |
| [hudi](/sql-reference/table-functions/hudi) | Amazon S3のApache Hudiテーブルに対する読み取り専用のテーブルのようなインターフェースを提供します。 |
| [fuzzQuery](/sql-reference/table-functions/fuzzQuery) | 与えられたクエリ文字列をランダムな変化で変動させます。 |
| [clusterAllReplicas](/sql-reference/table-functions/cluster) | すべてのシャード（`remote_servers` セクションで設定されている）にアクセスすることを可能にし、分散テーブルを作成する必要がありません。 |
| [urlCluster](/sql-reference/table-functions/urlCluster) | 指定されたクラスタの多くのノードからURLのファイルを並行して処理することを許可します。 |
| [redis](/sql-reference/table-functions/redis) | このテーブル関数は、ClickHouseとRedisを統合することを可能にします。 |
| [icebergCluster](/sql-reference/table-functions/icebergCluster) | 指定されたクラスタの多くのノードからApache Icebergのファイルを並行して処理することを可能にするicebergテーブル関数の拡張です。 |
| [view](/sql-reference/table-functions/view) | サブクエリをテーブルに変換します。この関数はビューを実装しています。 |
| [file](/sql-reference/table-functions/file) | ファイルからSELECT及びINSERTするためのテーブルのようなインターフェースを提供するテーブルエンジンです。これはs3テーブル関数と似ています。ローカルファイルで作業する場合は `file()` 、S3、GCS、またはMinIOなどのオブジェクトストレージのバケットで作業する場合は `s3()` を使用します。 |
| [timeSeriesTags](/sql-reference/table-functions/timeSeriesTags) | timeSeriesTags テーブル関数は、テーブルエンジンがTimeSeriesエンジンである `db_name.time_series_table` に使用されるタグテーブルを返します。 |
| [mysql](/sql-reference/table-functions/mysql) | リモートMySQLサーバーに保存されているデータに対して `SELECT` と `INSERT` クエリを実行できます。 |
| [](/sql-reference/table-functions/s3) | Amazon S3およびGoogle Cloud Storageでファイルを選択/挿入するためのテーブルのようなインターフェースを提供します。このテーブル関数はhdfs関数に似ていますが、S3固有の機能を提供します。 |
| [dictionary](/sql-reference/table-functions/dictionary) | ClickHouseテーブルとして辞書データを表示します。Dictionaryエンジンと同じように動作します。 |
| [hdfs](/sql-reference/table-functions/hdfs) | HDFS内のファイルからテーブルを作成します。このテーブル関数はurlおよびfileテーブル関数に似ています。 |
| [fuzzJSON](/sql-reference/table-functions/fuzzJSON) | JSON文字列をランダムな変動で変動させます。 |
| [hdfsCluster](/sql-reference/table-functions/hdfsCluster) | 指定されたクラスタの多くのノードからHDFSのファイルを並行して処理することを許可します。 |
| [zeros](/sql-reference/table-functions/zeros) | 多くの行を生成するための最速の方法としてテスト目的で使用します。 `system.zeros`および `system.zeros_mt` システムテーブルに似ています。 |
| [values](/sql-reference/table-functions/values) | 値をカラムに充填する一時ストレージを作成します。 |
| [generateRandom](/sql-reference/table-functions/generate) | 与えられたスキーマのランダムデータを生成します。このデータでテストテーブルにデータをポピュレートできます。すべてのタイプがサポートされているわけではありません。 |
| [deltaLake](/sql-reference/table-functions/deltalake) | Amazon S3のDelta Lakeテーブルへの読み取り専用のテーブルのようなインターフェースを提供します。 |
| [gcs](/sql-reference/table-functions/gcs) | Google Cloud Storageからデータを `SELECT` および `INSERT` するためのテーブルのようなインターフェースを提供します。 `Storage Object User` IAMロールが必要です。 |
| [mergeTreeIndex](/sql-reference/table-functions/mergeTreeIndex) | MergeTreeテーブルのインデックスおよびマークファイルの内容を表します。これはイントロスペクションに使用できます。 |
| [postgresql](/sql-reference/table-functions/postgresql) | リモートPostgreSQLサーバーに保存されているデータに対して `SELECT` と `INSERT` クエリを実行できます。 |
| [timeSeriesData](/sql-reference/table-functions/timeSeriesData) | timeSeriesDataは、テーブルエンジンがTimeSeriesである `db_name.time_series_table` に使用されるデータテーブルを返します。 |
| [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage) | Azure Blob Storageでファイルを選択/挿入するためのテーブルのようなインターフェースを提供します。s3関数に似ています。 |
| [odbc](/sql-reference/table-functions/odbc) | ODBC経由で接続されたテーブルを返します。 |
| [merge](/sql-reference/table-functions/merge) | 一時的なMergeテーブルを作成します。テーブル構造は、正規表現に一致する最初のテーブルから取得されます。 |
| [hudiCluster Table Function](/sql-reference/table-functions/hudiCluster) | hudiテーブル関数の拡張です。指定されたクラスタの多くのノードからAmazon S3のApache Hudiテーブルのファイルを並行して処理することができます。 |
| [generate_series (generateSeries)](/sql-reference/table-functions/generate_series) | 開始から停止まで（両端含む）の整数を含む単一の 'generate_series' カラム (UInt64) を持つテーブルを返します。 |
| [azureBlobStorageCluster](/sql-reference/table-functions/azureBlobStorageCluster) | 指定されたクラスタの多くのノードからAzure Blobストレージのファイルを並行して処理することを許可します。 |
| [jdbc](/sql-reference/table-functions/jdbc) | JDBCドライバを介して接続されたテーブルを返します。 |
| [format](/sql-reference/table-functions/format) | 指定された入力形式に従って、引数からデータを解析します。構造引数が指定されていない場合は、データから抽出されます。 |
| [s3Cluster](/sql-reference/table-functions/s3Cluster) | Amazon S3およびGoogle Cloud Storageからファイルを並行して処理するためのs3テーブル関数の拡張です。 |
| [](/sql-reference/table-functions/generateSeries) |  |
| [sqlite](/sql-reference/table-functions/sqlite) | SQLiteデータベースに保存されているデータに対してクエリを実行することを可能にします。 |
| [deltaLakeCluster](/sql-reference/table-functions/deltalakeCluster) | これはdeltaLakeテーブル関数への拡張です。 |
| [numbers](/sql-reference/table-functions/numbers) | 指定可能な整数を含む単一の 'number' カラムのテーブルを返します。 |
| [null](/sql-reference/table-functions/null) | Nullテーブルエンジンを使用して、指定された構造の一時テーブルを作成します。この関数は、テスト執筆やデモの便利さのために使用されます。 |
| [remote, remoteSecure](/sql-reference/table-functions/remote) | テーブル関数 `remote` は、分散テーブルを作成することなくリモートサーバーにオンザフライでアクセスすることを可能にします。テーブル関数 `remoteSecure` は、同じくリモートに確保された接続上で実行されます。 |
| [mongodb](/sql-reference/table-functions/mongodb) | リモートMongoDBサーバーに保存されているデータに対して `SELECT` クエリを実行します。 |
