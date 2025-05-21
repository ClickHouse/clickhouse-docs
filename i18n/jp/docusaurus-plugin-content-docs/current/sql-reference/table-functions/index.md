description: 'テーブル関数に関するドキュメント'
sidebar_label: 'テーブル関数'
sidebar_position: 1
slug: /sql-reference/table-functions/
title: 'テーブル関数'
```


# テーブル関数

テーブル関数は、テーブルを構築するためのメソッドです。

テーブル関数は以下の場所で使用できます：

- [FROM](../../sql-reference/statements/select/from.md) クエリの `SELECT` 句。

   現在のクエリでのみ利用可能な一時テーブルを作成する方法です。クエリが終了すると、テーブルは削除されます。

- [CREATE TABLE AS table_function()](../../sql-reference/statements/create/table.md) クエリ。

   テーブルを作成する方法の一つです。

- [INSERT INTO TABLE FUNCTION](/sql-reference/statements/insert-into#inserting-using-a-table-function) クエリ。

:::note
[allow_ddl](/operations/settings/settings#allow_ddl) 設定が無効になっている場合、テーブル関数は使用できません。
:::
| ページ | 説明 |
|-----|-----|
| [fileCluster](/sql-reference/table-functions/fileCluster) | クラスター内の複数のノードにまたがって、指定されたパスに一致するファイルを同時に処理することを可能にします。実行者はワーカーノードに接続を確立し、ファイルパス内のグロブを展開し、ファイル読み取りタスクをワーカーノードに委任します。各ワーカーノードは、次に処理するファイルのために実行者にクエリを送信し、すべてのタスクが完了するまで繰り返します（すべてのファイルが読み込まれるまで）。 |
| [input](/sql-reference/table-functions/input) | 指定された構造でサーバーに送信されたデータを、異なる構造のテーブルに効果的に変換して挿入することを可能にするテーブル関数です。 |
| [iceberg](/sql-reference/table-functions/iceberg) | Amazon S3、Azure、HDFS、またはローカルに保存されたApache Icebergテーブルへの読み取り専用のテーブルのようなインターフェースを提供します。 |
| [executable](/engines/table-functions/executable) | `executable` テーブル関数は、行を **stdout** に出力するスクリプトで定義されたユーザー定義関数（UDF）の出力に基づいてテーブルを作成します。 |
| [timeSeriesMetrics](/sql-reference/table-functions/timeSeriesMetrics) | timeSeriesMetricsは、テーブルエンジンがTimeSeriesエンジンである `db_name.time_series_table` に使用されるメトリクステーブルを返します。 |
| [loop](/sql-reference/table-functions/loop) | ClickHouseのループテーブル関数は、無限ループ内でクエリの結果を返すために使用されます。 |
| [url](/sql-reference/table-functions/url) | 指定された `format` と `structure` を持つ `URL` からテーブルを作成します。 |
| [hudi](/sql-reference/table-functions/hudi) | Amazon S3内のApache Hudiテーブルへの読み取り専用のテーブルのようなインターフェースを提供します。 |
| [fuzzQuery](/sql-reference/table-functions/fuzzQuery) | 指定されたクエリ文字列をランダムな変動で摂動します。 |
| [clusterAllReplicas](/sql-reference/table-functions/cluster) | 分散テーブルを作成することなく、クラスターのすべてのシャード（`remote_servers` セクションで構成された）にアクセスできるようにします。 |
| [urlCluster](/sql-reference/table-functions/urlCluster) | 指定されたクラスターの多数のノードからURLのファイルを並行処理することを可能にします。 |
| [redis](/sql-reference/table-functions/redis) | このテーブル関数は、ClickHouseとRedisを統合することを可能にします。 |
| [icebergCluster](/sql-reference/table-functions/icebergCluster) | Apache Icebergからのファイルを指定されたクラスターの多数のノードから並行処理することを可能にする、icebergテーブル関数の拡張です。 |
| [view](/sql-reference/table-functions/view) | サブクエリをテーブルに変換します。この関数はビューを実装します。 |
| [file](/sql-reference/table-functions/file) | ファイルから選択および挿入するためのテーブルのようなインターフェースを提供するテーブルエンジンであり、s3テーブル関数に似ています。ローカルファイルで作業する場合は `file()` を使用し、S3、GCS、またはMinIOなどのオブジェクトストレージのバケットで作業する場合は `s3()` を使用します。 |
| [timeSeriesTags](/sql-reference/table-functions/timeSeriesTags) | timeSeriesTags テーブル関数は、テーブルエンジンがTimeSeriesエンジンである `db_name.time_series_table` に使用されるタグテーブルを返します。 |
| [mysql](/sql-reference/table-functions/mysql) | リモートMySQLサーバーに保存されたデータに対して`SELECT` と `INSERT` クエリを実行することを可能にします。 |
| [mergeTreeProjection](/sql-reference/table-functions/mergeTreeProjection) | MergeTreeテーブルにおけるいくつかのプロジェクションの内容を表します。これはイントロスペクションに使用できます。 |
| [s3 Table Function](/sql-reference/table-functions/s3) | Amazon S3およびGoogle Cloud Storage内のファイルを選択/挿入するためのテーブルのようなインターフェースを提供します。このテーブル関数はhdfs関数に似ていますが、S3特有の機能を提供します。 |
| [dictionary](/sql-reference/table-functions/dictionary) | ClickHouseテーブルとして辞書データを表示します。Dictionaryエンジンと同じ方法で動作します。 |
| [hdfs](/sql-reference/table-functions/hdfs) | HDFS内のファイルからテーブルを作成します。このテーブル関数は、urlおよびfileテーブル関数に似ています。 |
| [fuzzJSON](/sql-reference/table-functions/fuzzJSON) | JSON文字列をランダムな変動で摂動します。 |
| [hdfsCluster](/sql-reference/table-functions/hdfsCluster) | 指定されたクラスターの多数のノードからHDFS内のファイルを並行処理することを可能にします。 |
| [zeros](/sql-reference/table-functions/zeros) | 多くの行を生成するための最速の方法として、テスト目的で使用されます。 `system.zeros` および `system.zeros_mt` システムテーブルに似ています。 |
| [values](/sql-reference/table-functions/values) | 値でカラムを埋める一時ストレージを作成します。 |
| [generateRandom](/sql-reference/table-functions/generate) | 指定されたスキーマを使用してランダムデータを生成します。テストテーブルにそのデータを埋め込むことを可能にします。すべてのタイプがサポートされているわけではありません。 |
| [deltaLake](/sql-reference/table-functions/deltalake) | Amazon S3内のDelta Lakeテーブルへの読み取り専用のテーブルのようなインターフェースを提供します。 |
| [gcs](/sql-reference/table-functions/gcs) | Google Cloud Storageからデータを`SELECT`および`INSERT`するためのテーブルのようなインターフェースを提供します。`Storage Object User` IAMロールが必要です。 |
| [mergeTreeIndex](/sql-reference/table-functions/mergeTreeIndex) | MergeTreeテーブルのインデックスとマークファイルの内容を表します。イントロスペクションに使用できます。 |
| [postgresql](/sql-reference/table-functions/postgresql) | リモートPostgreSQLサーバーに保存されたデータに対して `SELECT` および `INSERT` クエリを実行することを可能にします。 |
| [timeSeriesData](/sql-reference/table-functions/timeSeriesData) | timeSeriesData は、テーブルエンジンがTimeSeriesの `db_name.time_series_table` に使用されるデータテーブルを返します。 |
| [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage) | Azure Blob Storage内のファイルを選択/挿入するためのテーブルのようなインターフェースを提供します。s3関数に似ています。 |
| [odbc](/sql-reference/table-functions/odbc) | ODBCを介して接続されたテーブルを返します。 |
| [merge](/sql-reference/table-functions/merge) | 一時的なMergeテーブルを作成します。構造は、基底テーブルのカラムのユニオンを使用して導出され、共通のタイプを導出します。 |
| [hudiCluster Table Function](/sql-reference/table-functions/hudiCluster) | hudiテーブル関数の拡張。Amazon S3のApache Hudiテーブルからのファイルを、指定されたクラスターの多数のノードから並行処理することを可能にします。 |
| [generate_series (generateSeries)](/sql-reference/table-functions/generate_series) | 開始から停止まで（含む）整数を含む単一の`generate_series`カラム（UInt64）を持つテーブルを返します。 |
| [azureBlobStorageCluster](/sql-reference/table-functions/azureBlobStorageCluster) | 指定されたクラスターの多数のノードからAzure Blob Storageのファイルを並行処理することを可能にします。 |
| [jdbc](/sql-reference/table-functions/jdbc) | JDBCドライバーを介して接続されたテーブルを返します。 |
| [format](/sql-reference/table-functions/format) | 指定された入力形式に従って引数からデータをパースします。構造引数が指定されない場合、データから抽出されます。 |
| [s3Cluster](/sql-reference/table-functions/s3Cluster) | Amazon S3およびGoogle Cloud Storageからのファイルを、指定されたクラスターの多数のノードで並行処理できるようにするs3テーブル関数の拡張です。 |
| [TODO: Add title](/sql-reference/table-functions/generateSeries) | TODO: 説明を追加 |
| [sqlite](/sql-reference/table-functions/sqlite) | SQLiteデータベースに保存されているデータに対してクエリを実行することを可能にします。 |
| [deltaLakeCluster](/sql-reference/table-functions/deltalakeCluster) | これはdeltaLakeテーブル関数の拡張です。 |
| [numbers](/sql-reference/table-functions/numbers) | 指定可能な整数を含む単一の `number` カラムを持つテーブルを返します。 |
| [null](/sql-reference/table-functions/null) | Nullテーブルエンジンを持つ指定された構造の一時テーブルを作成します。この関数は、テストの記述とデモンストレーションの便宜のために使用されます。 |
| [remote, remoteSecure](/sql-reference/table-functions/remote) | テーブル関数 `remote` は、分散テーブルを作成することなく、リモートサーバーにオンザフライでアクセスすることを可能にします。テーブル関数 `remoteSecure` は、`remote` と同じですが、安全な接続を介して行います。 |
| [mongodb](/sql-reference/table-functions/mongodb) | リモートMongoDBサーバーに保存されたデータに対して `SELECT` クエリを実行することを可能にします。 |
