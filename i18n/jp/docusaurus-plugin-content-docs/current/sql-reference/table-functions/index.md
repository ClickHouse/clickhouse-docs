---
'description': 'Documentation for Table Functions'
'sidebar_label': 'Table Functions'
'sidebar_position': 1
'slug': '/sql-reference/table-functions/'
'title': 'Table Functions'
---




# テーブル関数

テーブル関数はテーブルを構築するためのメソッドです。

## 使用法 {#usage}

テーブル関数は `SELECT` クエリの [`FROM`](../../sql-reference/statements/select/from.md) 
句で使用できます。例えば、`file` テーブル関数を使用してローカルマシン上のファイルからデータを `SELECT` できます。

```bash
echo "1, 2, 3" > example.csv
```
```text
./clickhouse client
:) SELECT * FROM file('example.csv')
┌─c1─┬─c2─┬─c3─┐
│  1 │  2 │  3 │
└────┴────┴────┘
```

また、現在のクエリでのみ使用可能な一時テーブルを作成するためにテーブル関数を使用することもできます。例えば：

```sql title="Query"
SELECT * FROM generateSeries(1,5);
```
```response title="Response"
┌─generate_series─┐
│               1 │
│               2 │
│               3 │
│               4 │
│               5 │
└─────────────────┘
```

クエリが終了すると、テーブルは削除されます。

テーブル関数は次の構文を使用してテーブルを作成する方法として使用できます：

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

例えば：

```sql title="Query"
CREATE TABLE series AS generateSeries(1, 5);
SELECT * FROM series;
```

```response
┌─generate_series─┐
│               1 │
│               2 │
│               3 │
│               4 │
│               5 │
└─────────────────┘
```

最後に、テーブル関数を使用してテーブルにデータを `INSERT` することもできます。例えば、前の例で作成したテーブルの内容を `file` テーブル関数を使用してディスク上のファイルに書き出すことができます：

```sql
INSERT INTO FUNCTION file('numbers.csv', 'CSV') SELECT * FROM series;
```

```bash
cat numbers.csv
1
2
3
4
5
```

:::note
[allow_ddl](/operations/settings/settings#allow_ddl) 設定が無効になっている場合、テーブル関数を使用できません。
:::
| ページ | 説明 |
|-----|-----|
| [fileCluster](/sql-reference/table-functions/fileCluster) | クラスター内の複数のノードで指定されたパスに一致するファイルを同時に処理することを可能にします。イニシエーターはワーカーノードに接続し、ファイルパスのグロブを展開し、ファイル読み取りタスクをワーカーノードに委任します。各ワーカーノードはイニシエーターに次に処理するファイルを照会し、すべてのタスクが完了するまで繰り返します（すべてのファイルが読み込まれるまで）。 |
| [input](/sql-reference/table-functions/input) | 特定の構造を持つサーバーに送信されるデータを別の構造を持つテーブルに変換して挿入することを可能にするテーブル関数です。 |
| [iceberg](/sql-reference/table-functions/iceberg) | Amazon S3, Azure, HDFS またはローカルに保存された Apache Iceberg テーブルへの読み取り専用のテーブルのようなインターフェースを提供します。 |
| [executable](/engines/table-functions/executable) | `executable` テーブル関数は、行を **stdout** に出力するスクリプトで定義したユーザー定義関数 (UDF) の出力に基づいてテーブルを作成します。 |
| [timeSeriesMetrics](/sql-reference/table-functions/timeSeriesMetrics) | timeSeriesMetrics は、テーブルエンジンが TimeSeries エンジンである `db_name.time_series_table` テーブルによって使用されるメトリクステーブルを返します。 |
| [loop](/sql-reference/table-functions/loop) | ClickHouse のループテーブル関数は、無限ループでクエリの結果を返すために使用されます。 |
| [url](/sql-reference/table-functions/url) | 指定された `format` と `structure` を持つ `URL` からテーブルを作成します。 |
| [hudi](/sql-reference/table-functions/hudi) | Amazon S3 の Apache Hudi テーブルへの読み取り専用のテーブルのようなインターフェースを提供します。 |
| [fuzzQuery](/sql-reference/table-functions/fuzzQuery) | 与えられたクエリ文字列にランダムな変動を加えます。 |
| [clusterAllReplicas](/sql-reference/table-functions/cluster) | 分散テーブルを作成せずに、クラスター内のすべてのシャード（`remote_servers` セクションで構成された）にアクセスできるようにします。 |
| [urlCluster](/sql-reference/table-functions/urlCluster) | 指定されたクラスターの多くのノードからURLのファイルを並行して処理できます。 |
| [redis](/sql-reference/table-functions/redis) | このテーブル関数は、ClickHouse を Redis と統合することを可能にします。 |
| [icebergCluster](/sql-reference/table-functions/icebergCluster) | 指定されたクラスターの多くのノードで Apache Iceberg からファイルを並行して処理できるようにする iceberg テーブル関数の拡張です。 |
| [view](/sql-reference/table-functions/view) | サブクエリをテーブルに変換します。この関数は、ビューを実装します。 |
| [file](/sql-reference/table-functions/file) | ファイルからの SELECT および INSERT に類似したテーブルのようなインターフェースを提供するテーブルエンジンです。ローカルファイルで作業する場合は `file()` を使用し、S3、GCS、または MinIO のようなオブジェクトストレージ内のバケットで作業する場合は `s3()` を使用します。 |
| [timeSeriesTags](/sql-reference/table-functions/timeSeriesTags) | timeSeriesTags テーブル関数は、テーブルエンジンが TimeSeries エンジンである `db_name.time_series_table` に使用されるタグテーブルを返します。 |
| [mysql](/sql-reference/table-functions/mysql) | リモート MySQL サーバーに保存されているデータに対して `SELECT` および `INSERT` クエリを実行できます。 |
| [mergeTreeProjection](/sql-reference/table-functions/mergeTreeProjection) | MergeTree テーブル内のいくつかのプロジェクションの内容を表します。 introspection に使用できます。 |
| [s3 Table Function](/sql-reference/table-functions/s3) | Amazon S3 および Google Cloud Storage でファイルを選択/挿入するためのテーブルのようなインターフェースを提供します。このテーブル関数は hdfs 関数に類似していますが、S3 専用の機能を提供します。 |
| [dictionary](/sql-reference/table-functions/dictionary) | 辞書のデータを ClickHouse テーブルとして表示します。辞書エンジンと同様に動作します。 |
| [hdfs](/sql-reference/table-functions/hdfs) | HDFS のファイルからテーブルを作成します。このテーブル関数は url および file テーブル関数に類似しています。 |
| [fuzzJSON](/sql-reference/table-functions/fuzzJSON) | ランダムな変動で JSON 文字列を変化させます。 |
| [hdfsCluster](/sql-reference/table-functions/hdfsCluster) | 指定されたクラスターの多くのノードで HDFS からファイルを並行処理できるようにします。 |
| [zeros](/sql-reference/table-functions/zeros) | 多くの行を生成するための最も高速な方法として、テスト目的に使用されます。 `system.zeros` および `system.zeros_mt` システムテーブルに類似しています。 |
| [values](/sql-reference/table-functions/values) | 値でカラムを埋める一時ストレージを作成します。 |
| [generateRandom](/sql-reference/table-functions/generate) | 指定されたスキーマでランダムデータを生成します。テストテーブルにそのデータを入れることを可能にします。すべての型はサポートされていません。 |
| [deltaLake](/sql-reference/table-functions/deltalake) | Amazon S3 の Delta Lake テーブルへの読み取り専用のテーブルのようなインターフェースを提供します。 |
| [gcs](/sql-reference/table-functions/gcs) | Google Cloud Storage からデータを `SELECT` および `INSERT` するためのテーブルのようなインターフェースを提供します。 `Storage Object User` IAM ロールが必要です。 |
| [mergeTreeIndex](/sql-reference/table-functions/mergeTreeIndex) | MergeTree テーブルのインデックスおよびマークファイルの内容を表します。 introspection に使用できます。 |
| [postgresql](/sql-reference/table-functions/postgresql) | リモート PostgreSQL サーバーに保存されているデータに対して `SELECT` および `INSERT` クエリを実行できます。 |
| [timeSeriesData](/sql-reference/table-functions/timeSeriesData) | timeSeriesData は、テーブルエンジンが TimeSeries の `db_name.time_series_table` で使用されるデータテーブルを返します。 |
| [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage) | Azure Blob Storage でファイルを選択/挿入するためのテーブルのようなインターフェースを提供します。s3 関数に類似しています。 |
| [odbc](/sql-reference/table-functions/odbc) | ODBC 経由で接続されているテーブルを返します。 |
| [merge](/sql-reference/table-functions/merge) | 一時的な Merge テーブルを作成します。構造は、基礎となるテーブルのカラムの和集合と共通の型から導き出されます。 |
| [hudiCluster Table Function](/sql-reference/table-functions/hudiCluster) | hudi テーブル関数の拡張です。指定されたクラスターの多くのノードで Amazon S3 の Apache Hudi テーブルからファイルを並行処理できるようにします。 |
| [generate_series (generateSeries)](/sql-reference/table-functions/generate_series) | 開始から停止まで（両端含む）の整数を含む単一の `generate_series` カラム (UInt64) のテーブルを返します。 |
| [azureBlobStorageCluster](/sql-reference/table-functions/azureBlobStorageCluster) | 指定されたクラスターの多くのノードで Azure Blob Storage からファイルを並行処理できるようにします。 |
| [jdbc](/sql-reference/table-functions/jdbc) | JDBC ドライバー経由で接続されているテーブルを返します。 |
| [format](/sql-reference/table-functions/format) | 指定された入力フォーマットに従って引数からデータを解析します。構造引数が指定されていない場合、データから抽出されます。 |
| [s3Cluster](/sql-reference/table-functions/s3Cluster) | h3 テーブル関数の拡張で、指定されたクラスターの多くのノードで Amazon S3 および Google Cloud Storage からファイルを並行処理できるようにします。 |
| [TODO: Add title](/sql-reference/table-functions/generateSeries) | TODO: 説明を追加 |
| [sqlite](/sql-reference/table-functions/sqlite) | SQLite データベースに保存されているデータに対してクエリを実行できるようにします。 |
| [deltaLakeCluster](/sql-reference/table-functions/deltalakeCluster) | deltaLake テーブル関数の拡張です。 |
| [numbers](/sql-reference/table-functions/numbers) | 指定可能な整数を含む単一の `number` カラムを持つテーブルを返します。 |
| [null](/sql-reference/table-functions/null) | Null テーブルエンジンを持つ指定された構造の一時テーブルを作成します。この関数はテストの執筆やデモの便利さのために使用されます。 |
| [remote, remoteSecure](/sql-reference/table-functions/remote) | テーブル関数 `remote` は、分散テーブルを作成せずに、オンザフライでリモートサーバーにアクセスすることを可能にします。テーブル関数 `remoteSecure` は、`remote` と同じですが、安全な接続を介しています。 |
| [mongodb](/sql-reference/table-functions/mongodb) | リモート MongoDB サーバーに保存されているデータに対して `SELECT` クエリを実行できるようにします。 |
