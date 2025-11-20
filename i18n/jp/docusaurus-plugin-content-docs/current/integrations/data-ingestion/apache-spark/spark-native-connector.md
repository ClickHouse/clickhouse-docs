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


# Spark コネクタ

このコネクタは、高度なパーティション分割や述語下推など、ClickHouse 固有の最適化を活用して
クエリ性能およびデータ処理を向上させます。
このコネクタは [ClickHouse の公式 JDBC コネクタ](https://github.com/ClickHouse/clickhouse-java) をベースとしており、
独自のカタログを管理します。

Spark 3.0 以前の Spark には組み込みのカタログという概念がなかったため、ユーザーは通常、
Hive Metastore や AWS Glue などの外部カタログシステムに依存していました。
これらの外部ソリューションでは、Spark でテーブルにアクセスする前に、ユーザーがデータソーステーブルを
手動で登録する必要がありました。
しかし、Spark 3.0 でカタログの概念が導入されて以降は、Spark はカタログプラグインを登録することで
テーブルを自動的に検出できるようになりました。

Spark のデフォルトカタログは `spark_catalog` であり、テーブルは `{catalog name}.{database}.{table}` という形式で
識別されます。新しいカタログ機能により、単一の Spark アプリケーション内で複数のカタログを追加して
利用することが可能になりました。

<TOCInline toc={toc}></TOCInline>



## 要件 {#requirements}

- Java 8または17
- Scala 2.12または2.13
- Apache Spark 3.3、3.4、または3.5


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

注意: SQLのみのユースケースでは、本番環境において[Apache Kyuubi](https://github.com/apache/kyuubi)の使用を推奨します。

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
および [clickhouse-client](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client) に依存しており、
これらはいずれも clickhouse-jdbc:all にバンドルされているため、
"classifier" に "all" が指定された [clickhouse-jdbc JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)
を必ず含めてください。
フルの JDBC パッケージを使用したくない場合は代わりに、
[clickhouse-client JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)
と [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client) を個別に追加することもできます。

いずれの場合も、[Compatibility Matrix](#compatibility-matrix) に従って
パッケージ同士のバージョン互換性を確認してください。
:::



## カタログの登録（必須） {#register-the-catalog-required}

ClickHouseテーブルにアクセスするには、以下の設定で新しいSparkカタログを構成する必要があります:

| プロパティ                                     | 値                                    | デフォルト値  | 必須 |
| -------------------------------------------- | ---------------------------------------- | -------------- | -------- |
| `spark.sql.catalog.<catalog_name>`           | `com.clickhouse.spark.ClickHouseCatalog` | N/A            | はい      |
| `spark.sql.catalog.<catalog_name>.host`      | `<clickhouse_host>`                      | `localhost`    | いいえ       |
| `spark.sql.catalog.<catalog_name>.protocol`  | `http`                                   | `http`         | いいえ       |
| `spark.sql.catalog.<catalog_name>.http_port` | `<clickhouse_port>`                      | `8123`         | いいえ       |
| `spark.sql.catalog.<catalog_name>.user`      | `<clickhouse_username>`                  | `default`      | いいえ       |
| `spark.sql.catalog.<catalog_name>.password`  | `<clickhouse_password>`                  | (空文字列) | いいえ       |
| `spark.sql.catalog.<catalog_name>.database`  | `<database>`                             | `default`      | いいえ       |
| `spark.<catalog_name>.write.format`          | `json`                                   | `arrow`        | いいえ       |

これらの設定は、以下のいずれかの方法で設定できます:

- `spark-defaults.conf`を編集または作成する。
- `spark-submit`コマンド（または`spark-shell`/`spark-sql` CLIコマンド）に設定を渡す。
- コンテキストの初期化時に設定を追加する。

:::important
ClickHouseクラスタを使用する場合、各インスタンスに一意のカタログ名を設定する必要があります。
例:

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

[ClickHouse Cloud](https://clickhouse.com) に接続する際は、SSL を有効にし、適切な SSL モードを設定してください。例：

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


## データを書き込む {#write-data}

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
  // df を作成する
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


# 上記の互換性マトリクスを満たしていれば、ここに示したもの以外のパッケージの組み合わせを使用してもかまいません。
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



# DataFrame を作成する
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
Spark SQLでは、ClickHouseで記述するのと全く同じようにクエリを記述できるため、CREATE TABLE、TRUNCATEなどのコマンドを変更なしで直接実行できます。例えば：

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

コネクタで利用可能な設定項目は以下の通りです:

<br />


| キー                                                 | デフォルト                                            | 概要                                                                                                                                                                                                                                                                                  | 以降    |
| -------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| spark.clickhouse.ignoreUnsupportedTransform        | false                                            | ClickHouse は、シャーディングキーやパーティション値として複雑な式を使用することをサポートしています。例えば、`cityHash64(col_1, col_2)`、これは現在 Spark ではサポートされていません。もし`true`、サポートされていない式を無視します。`false` の場合は例外をスローして即座に失敗します。なお、`spark.clickhouse.write.distributed.convertLocal`が有効になっている場合、サポートされていないシャーディングキーを無視するとデータが破損する可能性があります。 | 0.4.0 |
| spark.clickhouse.read.compression.codec            | lz4                                              | 読み取り時にデータを解凍するために使用されるコーデック。サポートされているコーデック: none、lz4。                                                                                                                                                                                                                               | 0.5.0 |
| spark.clickhouse.read.distributed.convertLocal     | true                                             | Distributed テーブルを読み込む場合、自身ではなくローカルテーブルを読み込みます。もし`true`、無視`spark.clickhouse.read.distributed.useClusterNodes`ローカルテーブルではなく Distributed テーブルから読み取ります。`true` の場合、`spark.clickhouse.read.distributed.useClusterNodes` は無視されます。                                                           | 0.1.0 |
| spark.clickhouse.read.fixedStringAs                | バイナリ                                             | ClickHouse の FixedString 型を、指定された Spark のデータ型として読み取ります。サポートされている型: binary、string                                                                                                                                                                                                    | 0.8.0 |
| spark.clickhouse.read.format                       | json                                             | 読み取り時のシリアル化フォーマット。サポートされるフォーマット: json, binary                                                                                                                                                                                                                                       | 0.6.0 |
| spark.clickhouse.read.runtimeFilter.enabled        | false                                            | 読み取り時にランタイムフィルターを有効にします。                                                                                                                                                                                                                                                            | 0.8.0 |
| spark.clickhouse.read.splitByPartitionId           | true                                             | もし`true`、仮想カラムに基づいて入力パーティションフィルターを構築する`_partition_id`ではなく、パーティション値で行います。パーティション値に基づいて SQL 述語を組み立てる場合には、既知の問題があります。この機能を利用するには、ClickHouse Server v21.6 以降が必要です                                                                                                                       | 0.4.0 |
| spark.clickhouse.useNullableQuerySchema            | false                                            | If`true`、実行時にクエリスキーマ内のすべてのフィールドを Nullable としてマークします`CREATE/REPLACE TABLE ... AS SELECT ...`テーブル作成時に適用されます。なお、この設定には SPARK-43390（Spark 3.5 で利用可能）が必要であり、このパッチがない場合は常に`true`.                                                                                                         | 0.8.0 |
| spark.clickhouse.write.batchSize                   | 10000                                            | ClickHouse への書き込み時の 1 バッチあたりのレコード数。                                                                                                                                                                                                                                                 | 0.1.0 |
| spark.clickhouse.write.compression.codec           | lz4                                              | 書き込み時にデータを圧縮するために使用されるコーデック。利用可能なコーデック: none、lz4。                                                                                                                                                                                                                                   | 0.3.0 |
| spark.clickhouse.write.distributed.convertLocal    | false                                            | Distributedテーブルに対して書き込みを行う場合は、そのテーブル自身ではなく、ローカルテーブルに書き込みます。もし`true`、無視`spark.clickhouse.write.distributed.useClusterNodes`ローカルテーブルに書き込みます。`true` の場合は `spark.clickhouse.write.distributed.useClusterNodes` は無視されます。                                                                 | 0.1.0 |
| spark.clickhouse.write.distributed.useClusterNodes | true                                             | Distributed テーブルへの書き込み時に、クラスタ内のすべてのノードに書き込みます。                                                                                                                                                                                                                                      | 0.1.0 |
| spark.clickhouse.write.format                      | arrow                                            | 書き込み用のシリアライズ形式。サポートされている形式: json, arrow                                                                                                                                                                                                                                             | 0.4.0 |
| spark.clickhouse.write.localSortByKey              | true                                             | If`true`、書き込み前にソートキーでローカルにソートします。                                                                                                                                                                                                                                                   | 0.3.0 |
| spark.clickhouse.write.localSortByPartition        | spark.clickhouse.write.repartitionByPartition の値 | もし`true`、書き込み前にパーティション単位でローカルソートを行います。未設定の場合は `spark.clickhouse.write.repartitionByPartition` と同じ値になります`spark.clickhouse.write.repartitionByPartition`.                                                                                                                             | 0.3.0 |
| spark.clickhouse.write.maxRetry                    | 3                                                | 再試行可能なコードにより失敗した 1 回のバッチ書き込みに対して行う、書き込み再試行の最大回数。                                                                                                                                                                                                                                    | 0.1.0 |
| spark.clickhouse.write.repartitionByPartition      | true                                             | 書き込み前に、ClickHouse テーブルの分散に合わせるために、ClickHouse のパーティションキーでデータを再パーティションするかどうかを指定します。                                                                                                                                                                                                   | 0.3.0 |
| spark.clickhouse.write.repartitionNum              | 0                                                | 書き込み前に ClickHouse テーブルの分散条件を満たすようにデータを再パーティションする必要がある場合、この設定で再パーティション数を指定します。1 未満の値は要件なしを意味します。                                                                                                                                                                                     | 0.1.0 |
| spark.clickhouse.write.repartitionStrictly         | false                                            | もし`true`、`true` の場合、Spark は書き込み時にデータソーステーブルへレコードを渡す前に、指定された分散要件を満たすよう、入力レコードをパーティション間で厳密に分散します。`false` の場合、Spark はクエリを高速化するために特定の最適化を適用することがありますが、その結果、分散要件が満たされない可能性があります。なお、この設定には SPARK-37523（Spark 3.4 で利用可能）が必要であり、このパッチがない場合は常に`true`.                                        | 0.3.0 |
| spark.clickhouse.write.retryInterval               | 10秒                                              | 書き込みの再試行間隔（秒単位）。                                                                                                                                                                                                                                                                    | 0.1.0 |
| spark.clickhouse.write.retryableErrorCodes         | 241                                              | 書き込みが失敗した際に ClickHouse サーバーから返される、再試行可能なエラーコード。                                                                                                                                                                                                                                     | 0.1.0 |





## サポートされているデータ型 {#supported-data-types}

このセクションでは、SparkとClickHouse間のデータ型マッピングについて説明します。以下の表は、ClickHouseからSparkへデータを読み込む際、およびSparkからClickHouseへデータを挿入する際のデータ型変換のクイックリファレンスを提供します。

### ClickHouseからSparkへのデータ読み込み {#reading-data-from-clickhouse-into-spark}

| ClickHouseデータ型                                              | Sparkデータ型                | サポート | プリミティブ型 | 備考                                              |
| ----------------------------------------------------------------- | ------------------------------ | --------- | ------------ | -------------------------------------------------- |
| `Nothing`                                                         | `NullType`                     | ✅        | はい          |                                                    |
| `Bool`                                                            | `BooleanType`                  | ✅        | はい          |                                                    |
| `UInt8`, `Int16`                                                  | `ShortType`                    | ✅        | はい          |                                                    |
| `Int8`                                                            | `ByteType`                     | ✅        | はい          |                                                    |
| `UInt16`,`Int32`                                                  | `IntegerType`                  | ✅        | はい          |                                                    |
| `UInt32`,`Int64`, `UInt64`                                        | `LongType`                     | ✅        | はい          |                                                    |
| `Int128`,`UInt128`, `Int256`, `UInt256`                           | `DecimalType(38, 0)`           | ✅        | はい          |                                                    |
| `Float32`                                                         | `FloatType`                    | ✅        | はい          |                                                    |
| `Float64`                                                         | `DoubleType`                   | ✅        | はい          |                                                    |
| `String`, `JSON`, `UUID`, `Enum8`, `Enum16`, `IPv4`, `IPv6`       | `StringType`                   | ✅        | はい          |                                                    |
| `FixedString`                                                     | `BinaryType`, `StringType`     | ✅        | はい          | 設定`READ_FIXED_STRING_AS`で制御 |
| `Decimal`                                                         | `DecimalType`                  | ✅        | はい          | `Decimal128`までの精度とスケール             |
| `Decimal32`                                                       | `DecimalType(9, scale)`        | ✅        | はい          |                                                    |
| `Decimal64`                                                       | `DecimalType(18, scale)`       | ✅        | はい          |                                                    |
| `Decimal128`                                                      | `DecimalType(38, scale)`       | ✅        | はい          |                                                    |
| `Date`, `Date32`                                                  | `DateType`                     | ✅        | はい          |                                                    |
| `DateTime`, `DateTime32`, `DateTime64`                            | `TimestampType`                | ✅        | はい          |                                                    |
| `Array`                                                           | `ArrayType`                    | ✅        | いいえ           | 配列要素の型も変換されます               |
| `Map`                                                             | `MapType`                      | ✅        | いいえ           | キーは`StringType`に制限されます                   |
| `IntervalYear`                                                    | `YearMonthIntervalType(Year)`  | ✅        | はい          |                                                    |
| `IntervalMonth`                                                   | `YearMonthIntervalType(Month)` | ✅        | はい          |                                                    |
| `IntervalDay`, `IntervalHour`, `IntervalMinute`, `IntervalSecond` | `DayTimeIntervalType`          | ✅        | いいえ           | 特定のインターバル型が使用されます                     |
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


| Spark Data Type                     | ClickHouse Data Type | Supported | Is Primitive | Notes                                           |
|-------------------------------------|----------------------|-----------|--------------|-------------------------------------------------|
| `BooleanType`                       | `UInt8`              | ✅         | Yes          |                                                 |
| `ByteType`                          | `Int8`               | ✅         | Yes          |                                                 |
| `ShortType`                         | `Int16`              | ✅         | Yes          |                                                 |
| `IntegerType`                       | `Int32`              | ✅         | Yes          |                                                 |
| `LongType`                         | `Int64`              | ✅         | Yes          |                                                 |
| `FloatType`                         | `Float32`            | ✅         | Yes          |                                                 |
| `DoubleType`                        | `Float64`            | ✅         | Yes          |                                                 |
| `StringType`                        | `String`             | ✅         | Yes          |                                                 |
| `VarcharType`                       | `String`             | ✅         | Yes          |                                                 |
| `CharType`                          | `String`             | ✅         | Yes          |                                                 |
| `DecimalType`                       | `Decimal(p, s)`      | ✅         | Yes          | 精度とスケールは `Decimal128` までサポート      |
| `DateType`                          | `Date`               | ✅         | Yes          |                                                 |
| `TimestampType`                     | `DateTime`           | ✅         | Yes          |                                                 |
| `ArrayType` (list, tuple, or array) | `Array`              | ✅         | No           | 配列要素の型も変換される                        |
| `MapType`                           | `Map`                | ✅         | No           | キーは `StringType` のみに制限される            |
| `Object`                            |                      | ❌         |              |                                                 |
| `Nested`                            |                      | ❌         |              |                                                 |



## コントリビューションとサポート {#contributing-and-support}

プロジェクトへの貢献や問題の報告を歓迎します。

[GitHubリポジトリ](https://github.com/ClickHouse/spark-clickhouse-connector)にアクセスして、issueの作成、改善提案、またはプルリクエストの送信を行ってください。

貢献を歓迎します。開始前にリポジトリ内の貢献ガイドラインをご確認ください。

ClickHouse Sparkコネクタの改善にご協力いただきありがとうございます。
