---
sidebar_label: 'Spark ネイティブコネクタ'
sidebar_position: 2
slug: /integrations/apache-spark/spark-native-connector
description: 'ClickHouse と Apache Spark の連携概要'
keywords: ['clickhouse', 'Apache Spark', 'migrating', 'data']
title: 'Spark コネクタ'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';


# Spark connector

このコネクタは、ClickHouse 固有の最適化（高度なパーティショニングや述語プッシュダウンなど）を活用して、
クエリパフォーマンスとデータ処理を向上させます。
このコネクタは [ClickHouse の公式 JDBC コネクタ](https://github.com/ClickHouse/clickhouse-java) をベースとしており、
独自のカタログを管理します。

Spark 3.0 より前は、Spark には組み込みのカタログという概念がなかったため、ユーザーは一般的に
Hive Metastore や AWS Glue といった外部カタログシステムに依存していました。
これらの外部ソリューションでは、ユーザーは Spark でテーブルにアクセスする前に、データソースのテーブルを手動で登録する必要がありました。
しかし Spark 3.0 でカタログの概念が導入されて以降、Spark はカタログプラグインを登録することで
テーブルを自動的に検出できるようになりました。

Spark のデフォルトカタログは `spark_catalog` であり、テーブルは `{catalog name}.{database}.{table}` という形式で識別されます。
新しいカタログ機能により、1 つの Spark アプリケーション内で複数のカタログを追加して利用できるようになりました。

<TOCInline toc={toc}></TOCInline>



## 要件 {#requirements}

- Java 8 または 17
- Scala 2.12 または 2.13
- Apache Spark 3.3、3.4、または 3.5


## 互換性マトリックス {#compatibility-matrix}

| バージョン | 対応Sparkバージョン | ClickHouse JDBCバージョン |
| ------- | ------------------------- | ----------------------- |
| main    | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.8.1   | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.8.0   | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.7.3   | Spark 3.3, 3.4            | 0.4.6                   |
| 0.6.0   | Spark 3.3                 | 0.3.2-patch11           |
| 0.5.0   | Spark 3.2, 3.3            | 0.3.2-patch11           |
| 0.4.0   | Spark 3.2, 3.3            | 依存なし           |
| 0.3.0   | Spark 3.2, 3.3            | 依存なし           |
| 0.2.1   | Spark 3.2                 | 依存なし           |
| 0.1.2   | Spark 3.2                 | 依存なし           |


## インストールとセットアップ {#installation--setup}

ClickHouseとSparkを統合する際には、さまざまなプロジェクト構成に対応する複数のインストールオプションがあります。
ClickHouse Sparkコネクタは、プロジェクトのビルドファイル(Mavenの場合は`pom.xml`、SBTの場合は`build.sbt`など)に依存関係として直接追加できます。
または、必要なJARファイルを`$SPARK_HOME/jars/`フォルダに配置するか、`spark-submit`コマンドで`--jars`フラグを使用してSparkオプションとして直接渡すこともできます。
どちらの方法でも、Spark環境でClickHouseコネクタが利用可能になります。

### 依存関係としてインポート {#import-as-a-dependency}

<Tabs>
<TabItem value="Maven" label="Maven" default>

```maven
<dependency>
  <groupId>com.clickhouse.spark</groupId>
  <artifactId>clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}</artifactId>
  <version>{{ stable_version }}</version>
</dependency>
<dependency>
  <groupId>com.clickhouse</groupId>
  <artifactId>clickhouse-jdbc</artifactId>
  <classifier>all</classifier>
  <version>{{ clickhouse_jdbc_version }}</version>
  <exclusions>
    <exclusion>
      <groupId>*</groupId>
      <artifactId>*</artifactId>
    </exclusion>
  </exclusions>
</dependency>
```

SNAPSHOTバージョンを使用する場合は、以下のリポジトリを追加してください。

```maven
<repositories>
  <repository>
    <id>sonatype-oss-snapshots</id>
    <name>Sonatype OSS Snapshots Repository</name>
    <url>https://s01.oss.sonatype.org/content/repositories/snapshots</url>
  </repository>
</repositories>
```

</TabItem>
<TabItem value="Gradle" label="Gradle">

```gradle
dependencies {
  implementation("com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}")
  implementation("com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}:all") { transitive = false }
}
```

SNAPSHOTバージョンを使用する場合は、以下のリポジトリを追加してください:

```gradle
repositries {
  maven { url = "https://s01.oss.sonatype.org/content/repositories/snapshots" }
}
```

</TabItem>
<TabItem value="SBT" label="SBT">

```sbt
libraryDependencies += "com.clickhouse" % "clickhouse-jdbc" % {{ clickhouse_jdbc_version }} classifier "all"
libraryDependencies += "com.clickhouse.spark" %% clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }} % {{ stable_version }}
```

</TabItem>
<TabItem value="Spark SQL/Shell CLI" label="Spark SQL/Shell CLI">

Sparkのシェルオプション(Spark SQL CLI、Spark Shell CLI、Spark Submitコマンド)を使用する場合、必要なjarファイルを渡すことで依存関係を登録できます:

```text
$SPARK_HOME/bin/spark-sql \
  --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
```

JARファイルをSparkクライアントノードにコピーすることを避けたい場合は、代わりに以下を使用できます:

```text
  --repositories https://{maven-central-mirror or private-nexus-repo} \
  --packages com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }},com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}
```

注: SQLのみのユースケースでは、本番環境において[Apache Kyuubi](https://github.com/apache/kyuubi)の使用を推奨します。

</TabItem>
</Tabs>

### ライブラリのダウンロード {#download-the-library}

バイナリJARの命名パターンは以下の通りです:

```bash
clickhouse-spark-runtime-${spark_binary_version}_${scala_binary_version}-${version}.jar
```

リリースされたすべてのJARファイルは[Maven Central Repository](https://repo1.maven.org/maven2/com/clickhouse/spark/)で、
日次ビルドのすべてのSNAPSHOT JARファイルは[Sonatype OSS Snapshots Repository](https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/)で見つけることができます。


:::important
コネクタは [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)
および [clickhouse-client](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client) に依存しており、これらはどちらも
clickhouse-jdbc:all にバンドルされているため、
"classifier" に "all" が指定された [clickhouse-jdbc JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)
を含めることが重要です。
また、フルの JDBC パッケージを使用したくない場合は、
[clickhouse-client JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)
と [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client) を個別に追加することもできます。

いずれの場合も、
[Compatibility Matrix](#compatibility-matrix)
に従ってパッケージのバージョン互換性が取れていることを確認してください。
:::



## カタログの登録（必須） {#register-the-catalog-required}

ClickHouseテーブルにアクセスするには、以下の設定で新しいSparkカタログを構成する必要があります：

| プロパティ                                     | 値                                    | デフォルト値  | 必須 |
| -------------------------------------------- | ---------------------------------------- | -------------- | -------- |
| `spark.sql.catalog.<catalog_name>`           | `com.clickhouse.spark.ClickHouseCatalog` | N/A            | はい      |
| `spark.sql.catalog.<catalog_name>.host`      | `<clickhouse_host>`                      | `localhost`    | いいえ       |
| `spark.sql.catalog.<catalog_name>.protocol`  | `http`                                   | `http`         | いいえ       |
| `spark.sql.catalog.<catalog_name>.http_port` | `<clickhouse_port>`                      | `8123`         | いいえ       |
| `spark.sql.catalog.<catalog_name>.user`      | `<clickhouse_username>`                  | `default`      | いいえ       |
| `spark.sql.catalog.<catalog_name>.password`  | `<clickhouse_password>`                  | （空文字列） | いいえ       |
| `spark.sql.catalog.<catalog_name>.database`  | `<database>`                             | `default`      | いいえ       |
| `spark.<catalog_name>.write.format`          | `json`                                   | `arrow`        | いいえ       |

これらの設定は、以下のいずれかの方法で設定できます：

- `spark-defaults.conf`を編集または作成する
- `spark-submit`コマンド（または`spark-shell`/`spark-sql` CLIコマンド）に設定を渡す
- コンテキストの初期化時に設定を追加する

:::important
ClickHouseクラスタを使用する場合、各インスタンスに一意のカタログ名を設定する必要があります。
例：

```text
spark.sql.catalog.clickhouse1                com.clickhouse.spark.ClickHouseCatalog
spark.sql.catalog.clickhouse1.host           10.0.0.1
spark.sql.catalog.clickhouse1.protocol       https
spark.sql.catalog.clickhouse1.http_port      8443
spark.sql.catalog.clickhouse1.user           default
spark.sql.catalog.clickhouse1.password
spark.sql.catalog.clickhouse1.database       default
spark.sql.catalog.clickhouse1.option.ssl     true

spark.sql.catalog.clickhouse2                com.clickhouse.spark.ClickHouseCatalog
spark.sql.catalog.clickhouse2.host           10.0.0.2
spark.sql.catalog.clickhouse2.protocol       https
spark.sql.catalog.clickhouse2.http_port      8443
spark.sql.catalog.clickhouse2.user           default
spark.sql.catalog.clickhouse2.password
spark.sql.catalog.clickhouse2.database       default
spark.sql.catalog.clickhouse2.option.ssl     true
```

この方法により、Spark SQLからclickhouse1のテーブル`<ck_db>.<ck_table>`に`clickhouse1.<ck_db>.<ck_table>`としてアクセスでき、clickhouse2のテーブル`<ck_db>.<ck_table>`に`clickhouse2.<ck_db>.<ck_table>`としてアクセスできます。

:::


## ClickHouse Cloud 設定 {#clickhouse-cloud-settings}

[ClickHouse Cloud](https://clickhouse.com) に接続する際は、SSL を有効にし、適切な SSL モードを設定してください。例:

```text
spark.sql.catalog.clickhouse.option.ssl        true
spark.sql.catalog.clickhouse.option.ssl_mode   NONE
```


## データの読み取り {#read-data}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
public static void main(String[] args) {
        // Sparkセッションを作成
        SparkSession spark = SparkSession.builder()
                .appName("example")
                .master("local[*]")
                .config("spark.sql.catalog.clickhouse", "com.clickhouse.spark.ClickHouseCatalog")
                .config("spark.sql.catalog.clickhouse.host", "127.0.0.1")
                .config("spark.sql.catalog.clickhouse.protocol", "http")
                .config("spark.sql.catalog.clickhouse.http_port", "8123")
                .config("spark.sql.catalog.clickhouse.user", "default")
                .config("spark.sql.catalog.clickhouse.password", "123456")
                .config("spark.sql.catalog.clickhouse.database", "default")
                .config("spark.clickhouse.write.format", "json")
                .getOrCreate();

        Dataset<Row> df = spark.sql("select * from clickhouse.default.example_table");

        df.show();

        spark.stop();
    }
```

</TabItem>
<TabItem value="Scala" label="Scala">

```java
object NativeSparkRead extends App {
  val spark = SparkSession.builder
    .appName("example")
    .master("local[*]")
    .config("spark.sql.catalog.clickhouse", "com.clickhouse.spark.ClickHouseCatalog")
    .config("spark.sql.catalog.clickhouse.host", "127.0.0.1")
    .config("spark.sql.catalog.clickhouse.protocol", "http")
    .config("spark.sql.catalog.clickhouse.http_port", "8123")
    .config("spark.sql.catalog.clickhouse.user", "default")
    .config("spark.sql.catalog.clickhouse.password", "123456")
    .config("spark.sql.catalog.clickhouse.database", "default")
    .config("spark.clickhouse.write.format", "json")
    .getOrCreate

  val df = spark.sql("select * from clickhouse.default.example_table")

  df.show()

  spark.stop()
}
```

</TabItem>
<TabItem value="Python" label="Python">

```python
from pyspark.sql import SparkSession

packages = [
    "com.clickhouse.spark:clickhouse-spark-runtime-3.4_2.12:0.8.0",
    "com.clickhouse:clickhouse-client:0.7.0",
    "com.clickhouse:clickhouse-http-client:0.7.0",
    "org.apache.httpcomponents.client5:httpclient5:5.2.1"

]

spark = (SparkSession.builder
         .config("spark.jars.packages", ",".join(packages))
         .getOrCreate())

spark.conf.set("spark.sql.catalog.clickhouse", "com.clickhouse.spark.ClickHouseCatalog")
spark.conf.set("spark.sql.catalog.clickhouse.host", "127.0.0.1")
spark.conf.set("spark.sql.catalog.clickhouse.protocol", "http")
spark.conf.set("spark.sql.catalog.clickhouse.http_port", "8123")
spark.conf.set("spark.sql.catalog.clickhouse.user", "default")
spark.conf.set("spark.sql.catalog.clickhouse.password", "123456")
spark.conf.set("spark.sql.catalog.clickhouse.database", "default")
spark.conf.set("spark.clickhouse.write.format", "json")

df = spark.sql("select * from clickhouse.default.example_table")
df.show()

```

</TabItem>
<TabItem value="SparkSQL" label="Spark SQL">

```sql
   CREATE TEMPORARY VIEW jdbcTable
           USING org.apache.spark.sql.jdbc
           OPTIONS (
                   url "jdbc:ch://localhost:8123/default",
                   dbtable "schema.tablename",
                   user "username",
                   password "password",
                   driver "com.clickhouse.jdbc.ClickHouseDriver"
           );

   SELECT * FROM jdbcTable;
```

</TabItem>
</Tabs>


## Write data {#write-data}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
 public static void main(String[] args) throws AnalysisException {

        // Spark セッションを作成する
        SparkSession spark = SparkSession.builder()
                .appName("example")
                .master("local[*]")
                .config("spark.sql.catalog.clickhouse", "com.clickhouse.spark.ClickHouseCatalog")
                .config("spark.sql.catalog.clickhouse.host", "127.0.0.1")
                .config("spark.sql.catalog.clickhouse.protocol", "http")
                .config("spark.sql.catalog.clickhouse.http_port", "8123")
                .config("spark.sql.catalog.clickhouse.user", "default")
                .config("spark.sql.catalog.clickhouse.password", "123456")
                .config("spark.sql.catalog.clickhouse.database", "default")
                .config("spark.clickhouse.write.format", "json")
                .getOrCreate();

        // DataFrame のスキーマを定義する
        StructType schema = new StructType(new StructField[]{
                DataTypes.createStructField("id", DataTypes.IntegerType, false),
                DataTypes.createStructField("name", DataTypes.StringType, false),
        });

        List<Row> data = Arrays.asList(
                RowFactory.create(1, "Alice"),
                RowFactory.create(2, "Bob")
        );

        // DataFrame を作成する
        Dataset<Row> df = spark.createDataFrame(data, schema);

        df.writeTo("clickhouse.default.example_table").append();

        spark.stop();
    }
```

</TabItem>
<TabItem value="Scala" label="Scala">

```java
object NativeSparkWrite extends App {
  // Spark セッションを作成する
  val spark: SparkSession = SparkSession.builder
    .appName("example")
    .master("local[*]")
    .config("spark.sql.catalog.clickhouse", "com.clickhouse.spark.ClickHouseCatalog")
    .config("spark.sql.catalog.clickhouse.host", "127.0.0.1")
    .config("spark.sql.catalog.clickhouse.protocol", "http")
    .config("spark.sql.catalog.clickhouse.http_port", "8123")
    .config("spark.sql.catalog.clickhouse.user", "default")
    .config("spark.sql.catalog.clickhouse.password", "123456")
    .config("spark.sql.catalog.clickhouse.database", "default")
    .config("spark.clickhouse.write.format", "json")
    .getOrCreate

  // DataFrame のスキーマを定義する
  val rows = Seq(Row(1, "John"), Row(2, "Doe"))

  val schema = List(
    StructField("id", DataTypes.IntegerType, nullable = false),
    StructField("name", StringType, nullable = true)
  )
  // DataFrame を作成する
  val df: DataFrame = spark.createDataFrame(
    spark.sparkContext.parallelize(rows),
    StructType(schema)
  )

  df.writeTo("clickhouse.default.example_table").append()

  spark.stop()
}
```

</TabItem>
<TabItem value="Python" label="Python">

```python
from pyspark.sql import SparkSession
from pyspark.sql import Row

```


# 上記の互換性マトリクスを満たす任意のパッケージの組み合わせを自由に使用できます。
packages = [
    "com.clickhouse.spark:clickhouse-spark-runtime-3.4_2.12:0.8.0",
    "com.clickhouse:clickhouse-client:0.7.0",
    "com.clickhouse:clickhouse-http-client:0.7.0",
    "org.apache.httpcomponents.client5:httpclient5:5.2.1"

]

spark = (SparkSession.builder
         .config("spark.jars.packages", ",".join(packages))
         .getOrCreate())

spark.conf.set("spark.sql.catalog.clickhouse", "com.clickhouse.spark.ClickHouseCatalog")
spark.conf.set("spark.sql.catalog.clickhouse.host", "127.0.0.1")
spark.conf.set("spark.sql.catalog.clickhouse.protocol", "http")
spark.conf.set("spark.sql.catalog.clickhouse.http_port", "8123")
spark.conf.set("spark.sql.catalog.clickhouse.user", "default")
spark.conf.set("spark.sql.catalog.clickhouse.password", "123456")
spark.conf.set("spark.sql.catalog.clickhouse.database", "default")
spark.conf.set("spark.clickhouse.write.format", "json")



# DataFrame の作成
data = [Row(id=11, name="John"), Row(id=12, name="Doe")]
df = spark.createDataFrame(data)



# DataFrameをClickHouseに書き込む

df.writeTo("clickhouse.default.example_table").append()

````

</TabItem>
<TabItem value="SparkSQL" label="Spark SQL">

```sql
    -- resultTableは、clickhouse.default.example_tableに挿入するSparkの中間DataFrameです
   INSERT INTO TABLE clickhouse.default.example_table
                SELECT * FROM resultTable;

````

</TabItem>
</Tabs>


## DDL操作 {#ddl-operations}

Spark SQLを使用してClickHouseインスタンス上でDDL操作を実行でき、すべての変更は即座にClickHouseに永続化されます。
Spark SQLでは、ClickHouseで記述するのと全く同じようにクエリを記述できるため、CREATE TABLE、TRUNCATEなどのコマンドを変更なしで直接実行できます。例:

:::note
Spark SQLを使用する場合、一度に実行できるステートメントは1つのみです。
:::

```sql
USE clickhouse;
```

```sql

CREATE TABLE test_db.tbl_sql (
  create_time TIMESTAMP NOT NULL,
  m           INT       NOT NULL COMMENT 'part key',
  id          BIGINT    NOT NULL COMMENT 'sort key',
  value       STRING
) USING ClickHouse
PARTITIONED BY (m)
TBLPROPERTIES (
  engine = 'MergeTree()',
  order_by = 'id',
  settings.index_granularity = 8192
);
```

上記の例はSpark SQLクエリを示しており、Java、Scala、PySpark、またはシェルなど、任意のAPIを使用してアプリケーション内で実行できます。


## 設定 {#configurations}

コネクタで使用可能な設定項目は以下の通りです：

<br />


| キー                                                 | デフォルト                                            | 説明                                                                                                                                                                                                                                                                    | 以降    |
| -------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| spark.clickhouse.ignoreUnsupportedTransform        | false                                            | ClickHouse では、シャーディングキーやパーティション値として複雑な式を使用できます。例：`cityHash64(col_1, col_2)`、現在のところ Spark ではサポートされていません。もしも`true`、サポートされていない式は無視されます。そうでない場合は例外を投げて即座に失敗します。なお、`spark.clickhouse.write.distributed.convertLocal`が有効になっている場合、サポートされていないシャーディングキーを無視するとデータが破損するおそれがあります。 | 0.4.0 |
| spark.clickhouse.read.compression.codec            | lz4                                              | 読み取り時にデータを解凍するために使用されるコーデック。サポートされているコーデック: none, lz4。                                                                                                                                                                                                                | 0.5.0 |
| spark.clickhouse.read.distributed.convertLocal     | true                                             | Distributed テーブルを読み取る際は、そのテーブル自体ではなくローカルテーブルを読み取ります。もし`true`、ignore`spark.clickhouse.read.distributed.useClusterNodes`Distributed テーブルを読み取る際、そのテーブル自身ではなくローカルテーブルを読み取ります。`true` の場合、`spark.clickhouse.read.distributed.useClusterNodes` は無視されます。                      | 0.1.0 |
| spark.clickhouse.read.fixedStringAs                | バイナリ                                             | ClickHouse の FixedString 型を、指定された Spark データ型として読み取ります。サポートされている型: binary, string                                                                                                                                                                                      | 0.8.0 |
| spark.clickhouse.read.format                       | json                                             | 読み取り用のシリアライズ形式。サポートされる形式: json, binary                                                                                                                                                                                                                                | 0.6.0 |
| spark.clickhouse.read.runtimeFilter.enabled        | false                                            | 読み取り用のランタイムフィルターを有効にします。                                                                                                                                                                                                                                              | 0.8.0 |
| spark.clickhouse.read.splitByPartitionId           | true                                             | if`true`、仮想カラム `_partition_id` を使って入力パーティションフィルタを構築します`_partition_id`、パーティション値ではなくです。パーティション値に基づいて SQL 述語を組み立てる場合には、既知の問題があります。この機能を利用するには ClickHouse Server v21.6 以降が必要です                                                                                            | 0.4.0 |
| spark.clickhouse.useNullableQuerySchema            | false                                            | If`true`、`CREATE/REPLACE TABLE ... AS SELECT ...` を実行する際に、クエリスキーマのすべてのフィールドを Nullable としてマークします`CREATE/REPLACE TABLE ... AS SELECT ...`テーブル作成時に指定します。なお、この設定には SPARK-43390（Spark 3.5 で利用可能）が必要であり、このパッチがない場合は常に`true`.                                                | 0.8.0 |
| spark.clickhouse.write.batchSize                   | 10000                                            | ClickHouse への書き込み時の 1 バッチあたりのレコード数。                                                                                                                                                                                                                                   | 0.1.0 |
| spark.clickhouse.write.compression.codec           | lz4                                              | 書き込み時のデータ圧縮に使用されるコーデック。サポートされているコーデック: none、lz4。                                                                                                                                                                                                                      | 0.3.0 |
| spark.clickhouse.write.distributed.convertLocal    | false                                            | Distributed テーブルに書き込む場合は、自身ではなくローカルテーブルに書き込みます。もし`true`、無視`spark.clickhouse.write.distributed.useClusterNodes`Distributed テーブルへの書き込み時に、自身ではなくローカルテーブルへ書き込みます。`true` の場合、`spark.clickhouse.write.distributed.useClusterNodes` は無視されます。                                 | 0.1.0 |
| spark.clickhouse.write.distributed.useClusterNodes | true                                             | Distributed テーブルへの書き込み時に、クラスタ内のすべてのノードに書き込む。                                                                                                                                                                                                                          | 0.1.0 |
| spark.clickhouse.write.format                      | arrow                                            | 書き込み用のシリアライズ形式。サポートされる形式: json, arrow                                                                                                                                                                                                                                 | 0.4.0 |
| spark.clickhouse.write.localSortByKey              | true                                             | If`true`、書き込み前にソートキーでローカルにソートを行います。                                                                                                                                                                                                                                   | 0.3.0 |
| spark.clickhouse.write.localSortByPartition        | spark.clickhouse.write.repartitionByPartition の値 | もし`true`、書き込み前にパーティション単位でローカルソートを行います。設定されていない場合は、`spark.clickhouse.write.repartitionByPartition` と同じ値になります`spark.clickhouse.write.repartitionByPartition`.                                                                                                           | 0.3.0 |
| spark.clickhouse.write.maxRetry                    | 3                                                | 再試行可能なコードで単一のバッチ書き込みが失敗した場合に、その書き込みを再試行する最大回数。                                                                                                                                                                                                                        | 0.1.0 |
| spark.clickhouse.write.repartitionByPartition      | true                                             | 書き込み前に、ClickHouse テーブルの分散に合わせるため、ClickHouse のパーティションキーでデータを再パーティションするかどうか。                                                                                                                                                                                            | 0.3.0 |
| spark.clickhouse.write.repartitionNum              | 0                                                | 書き込み前に ClickHouse テーブルの分散に合わせてデータを再パーティションする必要がある場合に、この設定を使用して再パーティション数を指定します。1 未満の値を指定した場合は、再パーティションは行われません。                                                                                                                                                         | 0.1.0 |
| spark.clickhouse.write.repartitionStrictly         | false                                            | もし`true`、`true` の場合、Spark は書き込み時にデータソーステーブルへレコードを渡す前に、要求される分散を満たすよう、入力レコードをパーティション間で厳密に分配します。`false` の場合、Spark はクエリを高速化するために特定の最適化を適用することがあり、その結果、分散要件が満たされない可能性があります。なお、この設定には SPARK-37523（Spark 3.4 で利用可能）が必要であり、このパッチがない場合は常に`true`.                               | 0.3.0 |
| spark.clickhouse.write.retryInterval               | 10秒                                              | 書き込みの再試行間隔（秒単位）。                                                                                                                                                                                                                                                      | 0.1.0 |
| spark.clickhouse.write.retryableErrorCodes         | 241                                              | 書き込みが失敗した際に ClickHouse サーバーから返される再試行可能なエラーコード。                                                                                                                                                                                                                        | 0.1.0 |





## サポートされるデータ型 {#supported-data-types}

このセクションでは、SparkとClickHouse間のデータ型マッピングについて説明します。以下の表は、ClickHouseからSparkへデータを読み取る際、およびSparkからClickHouseへデータを挿入する際のデータ型変換のクイックリファレンスを提供します。

### ClickHouseからSparkへのデータ読み取り {#reading-data-from-clickhouse-into-spark}

| ClickHouseデータ型                                              | Sparkデータ型                | サポート | プリミティブ型 | 備考                                              |
| ----------------------------------------------------------------- | ------------------------------ | --------- | ------------ | -------------------------------------------------- |
| `Nothing`                                                         | `NullType`                     | ✅        | Yes          |                                                    |
| `Bool`                                                            | `BooleanType`                  | ✅        | Yes          |                                                    |
| `UInt8`, `Int16`                                                  | `ShortType`                    | ✅        | Yes          |                                                    |
| `Int8`                                                            | `ByteType`                     | ✅        | Yes          |                                                    |
| `UInt16`,`Int32`                                                  | `IntegerType`                  | ✅        | Yes          |                                                    |
| `UInt32`,`Int64`, `UInt64`                                        | `LongType`                     | ✅        | Yes          |                                                    |
| `Int128`,`UInt128`, `Int256`, `UInt256`                           | `DecimalType(38, 0)`           | ✅        | Yes          |                                                    |
| `Float32`                                                         | `FloatType`                    | ✅        | Yes          |                                                    |
| `Float64`                                                         | `DoubleType`                   | ✅        | Yes          |                                                    |
| `String`, `JSON`, `UUID`, `Enum8`, `Enum16`, `IPv4`, `IPv6`       | `StringType`                   | ✅        | Yes          |                                                    |
| `FixedString`                                                     | `BinaryType`, `StringType`     | ✅        | Yes          | `READ_FIXED_STRING_AS`設定で制御 |
| `Decimal`                                                         | `DecimalType`                  | ✅        | Yes          | `Decimal128`までの精度とスケールに対応             |
| `Decimal32`                                                       | `DecimalType(9, scale)`        | ✅        | Yes          |                                                    |
| `Decimal64`                                                       | `DecimalType(18, scale)`       | ✅        | Yes          |                                                    |
| `Decimal128`                                                      | `DecimalType(38, scale)`       | ✅        | Yes          |                                                    |
| `Date`, `Date32`                                                  | `DateType`                     | ✅        | Yes          |                                                    |
| `DateTime`, `DateTime32`, `DateTime64`                            | `TimestampType`                | ✅        | Yes          |                                                    |
| `Array`                                                           | `ArrayType`                    | ✅        | No           | 配列要素の型も変換される               |
| `Map`                                                             | `MapType`                      | ✅        | No           | キーは`StringType`に制限される                   |
| `IntervalYear`                                                    | `YearMonthIntervalType(Year)`  | ✅        | Yes          |                                                    |
| `IntervalMonth`                                                   | `YearMonthIntervalType(Month)` | ✅        | Yes          |                                                    |
| `IntervalDay`, `IntervalHour`, `IntervalMinute`, `IntervalSecond` | `DayTimeIntervalType`          | ✅        | No           | 特定のインターバル型が使用される                     |
| `Object`                                                          |                                | ❌        |              |                                                    |
| `Nested`                                                          |                                | ❌        |              |                                                    |
| `Tuple`                                                           |                                | ❌        |              |                                                    |
| `Point`                                                           |                                | ❌        |              |                                                    |
| `Polygon`                                                         |                                | ❌        |              |                                                    |
| `MultiPolygon`                                                    |                                | ❌        |              |                                                    |
| `Ring`                                                            |                                | ❌        |              |                                                    |
| `IntervalQuarter`                                                 |                                | ❌        |              |                                                    |
| `IntervalWeek`                                                    |                                | ❌        |              |                                                    |
| `Decimal256`                                                      |                                | ❌        |              |                                                    |
| `AggregateFunction`                                               |                                | ❌        |              |                                                    |
| `SimpleAggregateFunction`                                         |                                | ❌        |              |                                                    |

### SparkからClickHouseへのデータ挿入 {#inserting-data-from-spark-into-clickhouse}


| Spark Data Type                     | ClickHouse Data Type | Supported | Is Primitive | Notes                                  |
|-------------------------------------|----------------------|-----------|--------------|----------------------------------------|
| `BooleanType`                       | `UInt8`              | ✅         | Yes          |                                        |
| `ByteType`                          | `Int8`               | ✅         | Yes          |                                        |
| `ShortType`                         | `Int16`              | ✅         | Yes          |                                        |
| `IntegerType`                       | `Int32`              | ✅         | Yes          |                                        |
| `LongType`                          | `Int64`              | ✅         | Yes          |                                        |
| `FloatType`                        | `Float32`            | ✅         | Yes          |                                        |
| `DoubleType`                        | `Float64`            | ✅         | Yes          |                                        |
| `StringType`                        | `String`             | ✅         | Yes          |                                        |
| `VarcharType`                       | `String`             | ✅         | Yes          |                                        |
| `CharType`                          | `String`             | ✅         | Yes          |                                        |
| `DecimalType`                       | `Decimal(p, s)`      | ✅         | Yes          | 精度とスケールは `Decimal128` まで対応 |
| `DateType`                          | `Date`               | ✅         | Yes          |                                        |
| `TimestampType`                     | `DateTime`           | ✅         | Yes          |                                        |
| `ArrayType` (list, tuple, or array) | `Array`              | ✅         | No           | 配列要素の型も変換される                |
| `MapType`                           | `Map`                | ✅         | No           | キーは `StringType` に限定される       |
| `Object`                            |                      | ❌         |              |                                        |
| `Nested`                            |                      | ❌         |              |                                        |



## コントリビューションとサポート {#contributing-and-support}

プロジェクトへの貢献や問題の報告を歓迎します。
[GitHubリポジトリ](https://github.com/ClickHouse/spark-clickhouse-connector)にアクセスして、issueの作成、改善提案、またはプルリクエストの送信を行ってください。
貢献を歓迎します!開始前にリポジトリ内のコントリビューションガイドラインをご確認ください。
ClickHouse Sparkコネクタの改善にご協力いただきありがとうございます!
