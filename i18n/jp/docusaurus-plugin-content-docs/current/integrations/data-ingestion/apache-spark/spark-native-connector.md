---
sidebar_label: 'Sparkネイティブコネクタ'
sidebar_position: 2
slug: '/integrations/apache-spark/spark-native-connector'
description: 'ClickHouseとのApache Sparkへの導入'
keywords:
- 'clickhouse'
- 'Apache Spark'
- 'migrating'
- 'data'
title: 'Spark Connector'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';


# Spark Connector

このコネクタは、クエリのパフォーマンスとデータ処理を改善するために、高度なパーティショニングや述語プッシュダウンなど、ClickHouse固有の最適化を活用します。このコネクタは、[ClickHouseの公式JDBCコネクタ](https://github.com/ClickHouse/clickhouse-java)に基づいており、自身のカタログを管理します。

Spark 3.0以前は、Sparkにはビルトインのカタログ概念が欠けていたため、ユーザーは通常、Hive MetastoreやAWS Glueなどの外部カタログシステムに依存していました。これらの外部ソリューションでは、ユーザーはSparkでアクセスする前にデータソーステーブルを手動で登録する必要がありました。しかし、Spark 3.0でカタログ概念が導入されたことで、Sparkはカタログプラグインを登録することによって自動的にテーブルを検出できるようになりました。

Sparkのデフォルトカタログは`spark_catalog`であり、テーブルは`{catalog name}.{database}.{table}`で識別されます。新しいカタログ機能により、単一のSparkアプリケーション内で複数のカタログを追加して作業することが可能になりました。

<TOCInline toc={toc}></TOCInline>
## 要件 {#requirements}

- Java 8または17
- Scala 2.12または2.13
- Apache Spark 3.3または3.4または3.5
## 互換性マトリックス {#compatibility-matrix}

| バージョン | 互換性のあるSparkバージョン       | ClickHouse JDBCバージョン |
|------------|----------------------------------|---------------------------|
| main       | Spark 3.3, 3.4, 3.5              | 0.6.3                     |
| 0.8.1      | Spark 3.3, 3.4, 3.5              | 0.6.3                     |
| 0.8.0      | Spark 3.3, 3.4, 3.5              | 0.6.3                     |
| 0.7.3      | Spark 3.3, 3.4                   | 0.4.6                     |
| 0.6.0      | Spark 3.3                         | 0.3.2-patch11             |
| 0.5.0      | Spark 3.2, 3.3                   | 0.3.2-patch11             |
| 0.4.0      | Spark 3.2, 3.3                   | 依存しない                |
| 0.3.0      | Spark 3.2, 3.3                   | 依存しない                |
| 0.2.1      | Spark 3.2                         | 依存しない                |
| 0.1.2      | Spark 3.2                         | 依存しない                |
## インストールとセットアップ {#installation--setup}

ClickHouseをSparkと統合するためには、さまざまなプロジェクトセットアップに適した複数のインストールオプションがあります。ClickHouse Sparkコネクタをプロジェクトのビルドファイル（Mavenの場合は`pom.xml`、SBTの場合は`build.sbt`など）に依存関係として直接追加できます。あるいは、必要なJARファイルを`$SPARK_HOME/jars/`フォルダーに置くか、`spark-submit`コマンドの`--jars`フラグを使用して直接渡すこともできます。どちらのアプローチも、ClickHouseコネクタがSpark環境で利用可能になることを保証します。
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

SNAPSHOTバージョンを使用する場合は、以下のリポジトリを追加します。

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

SNAPSHOTバージョンを使用する場合は、以下のリポジトリを追加します：

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

Sparkのシェルオプション（Spark SQL CLI、Spark Shell CLI、Spark Submitコマンド）を使用する場合、必要なJARを渡すことで依存関係を登録できます：

```text
$SPARK_HOME/bin/spark-sql \
  --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
```

JARファイルをSparkクライアントノードにコピーするのを避ける場合は、次のように使用できます：

```text
  --repositories https://{maven-central-mirror or private-nexus-repo} \
  --packages com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }},com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}:all
```

注：SQLのみのユースケースの場合、[Apache Kyuubi](https://github.com/apache/kyuubi)が本番環境に推奨されます。

</TabItem>
</Tabs>
### ライブラリのダウンロード {#download-the-library}

バイナリJARの名前パターンは以下の通りです：

```bash
clickhouse-spark-runtime-${spark_binary_version}_${scala_binary_version}-${version}.jar
```

利用可能なすべてのリリースJARファイルは、[Maven Central Repository](https://repo1.maven.org/maven2/com/clickhouse/spark/)で見つけることができ、すべてのデイリービルドSNAPSHOT JARファイルは、[Sonatype OSS Snapshots Repository](https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/)で見つけることができます。

:::important
"all"クラシファイアを持つ[clickhouse-jdbc JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)を含めることが必須です。コネクタは[clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)および[clickhouse-client](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)に依存しており、これらは全てclickhouse-jdbc:allにバンドルされています。フルJDBCパッケージを使用したくない場合は、[clickhouse-client JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)と[clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)を個別に追加することもできます。

いずれにしても、パッケージバージョンが、[互換性マトリックス](#compatibility-matrix)に従って互換性があることを確認してください。
:::
## カタログの登録（必須） {#register-the-catalog-required}

ClickHouseのテーブルにアクセスするためには、以下の設定を使用して新しいSparkカタログを構成する必要があります。

| プロパティ                                         | 値                                          | デフォルト値        | 必須   |
|--------------------------------------------------|--------------------------------------------|-------------------|--------|
| `spark.sql.catalog.<catalog_name>`                | `com.clickhouse.spark.ClickHouseCatalog`   | N/A               | はい   |
| `spark.sql.catalog.<catalog_name>.host`           | `<clickhouse_host>`                        | `localhost`       | いいえ |
| `spark.sql.catalog.<catalog_name>.protocol`       | `http`                                     | `http`            | いいえ |
| `spark.sql.catalog.<catalog_name>.http_port`      | `<clickhouse_port>`                        | `8123`            | いいえ |
| `spark.sql.catalog.<catalog_name>.user`           | `<clickhouse_username>`                    | `default`         | いいえ |
| `spark.sql.catalog.<catalog_name>.password`       | `<clickhouse_password>`                    | （空文字列）     | いいえ |
| `spark.sql.catalog.<catalog_name>.database`       | `<database>`                               | `default`         | いいえ |
| `spark.<catalog_name>.write.format`               | `json`                                     | `arrow`           | いいえ |

これらの設定は次のいずれかによって設定できます：

* `spark-defaults.conf`を編集または作成する。
* `spark-submit`コマンド（または`spark-shell`や`spark-sql` CLIコマンド）に設定を渡す。
* コンテキストを初期化する際に設定を追加する。

:::important
ClickHouseクラスタで作業する場合、各インスタンスに対して一意のカタログ名を設定する必要があります。例えば：

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

そのようにすることで、Spark SQLからclickhouse1テーブル`<ck_db>.<ck_table>`にアクセスするために`clickhouse1.<ck_db>.<ck_table>`を使用でき、clickhouse2テーブル`<ck_db>.<ck_table>`にアクセスするために`clickhouse2.<ck_db>.<ck_table>`を使用できるようになります。

:::
## ClickHouse Cloud設定 {#clickhouse-cloud-settings}

[ClickHouse Cloud](https://clickhouse.com)に接続する際は、SSLを有効にし、適切なSSLモードを設定してください。例えば：

```text
spark.sql.catalog.clickhouse.option.ssl        true
spark.sql.catalog.clickhouse.option.ssl_mode   NONE
```
## データの読み込み {#read-data}

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
## データの書き込み {#write-data}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
 public static void main(String[] args) throws AnalysisException {

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

        // DataFrameのスキーマを定義
        StructType schema = new StructType(new StructField[]{
                DataTypes.createStructField("id", DataTypes.IntegerType, false),
                DataTypes.createStructField("name", DataTypes.StringType, false),
        });


        List<Row> data = Arrays.asList(
                RowFactory.create(1, "Alice"),
                RowFactory.create(2, "Bob")
        );

        // DataFrameを作成
        Dataset<Row> df = spark.createDataFrame(data, schema);

        df.writeTo("clickhouse.default.example_table").append();

        spark.stop();
    }
```

</TabItem>
<TabItem value="Scala" label="Scala">

```java
object NativeSparkWrite extends App {
  // Sparkセッションを作成
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

  // DataFrameのスキーマを定義
  val rows = Seq(Row(1, "John"), Row(2, "Doe"))

  val schema = List(
    StructField("id", DataTypes.IntegerType, nullable = false),
    StructField("name", StringType, nullable = true)
  )
  // dfを作成
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


# 互換性マトリックスに準拠する他のパッケージの組み合わせを自由に使用できます。
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


# DataFrameを作成
data = [Row(id=11, name="John"), Row(id=12, name="Doe")]
df = spark.createDataFrame(data)


# DataFrameをClickHouseに書き込む
df.writeTo("clickhouse.default.example_table").append()

```

</TabItem>
<TabItem value="SparkSQL" label="Spark SQL">

```sql
    -- resultTalbeは、clickhouse.default.example_tableに挿入したいSparkの中間dfです
   INSERT INTO TABLE clickhouse.default.example_table
                SELECT * FROM resultTable;
                
```

</TabItem>
</Tabs>
## DDL操作 {#ddl-operations}

ClickHouseインスタンス上でDDL操作を実行することができ、すべての変更がClickHouseに即座に永続化されます。Spark SQLを使用すると、ClickHouseと同じようにクエリを書くことができるため、CREATE TABLEやTRUNCATEなどのコマンドを修正なしで直接実行できます。例えば：

```sql

use clickhouse; 

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

上記の例は、Spark SQLクエリを示しており、Java、Scala、PySpark、またはシェルのいずれかのAPIを使用してアプリケーション内で実行できます。
## Configurations {#configurations}

以下はコネクタで調整可能な設定です。

<br/>

| キー                                                 | デフォルト                                                 | 説明                                                                                                                                                                                                                                                                                                                                                                                                         | 以来  |
|-----------------------------------------------------|-----------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------|
| spark.clickhouse.ignoreUnsupportedTransform         | false                                                     | ClickHouseは、シャーディングキーやパーティション値として複雑な式を使用することをサポートしています。例えば、`cityHash64(col_1, col_2)`のように、現在Sparkではサポートされていません。`true`の場合、サポートされていない式を無視します。そうでない場合、例外で早期に失敗します。注意：`spark.clickhouse.write.distributed.convertLocal`が有効な場合、サポートされていないシャーディングキーを無視するとデータが破損する可能性があります。 | 0.4.0 |
| spark.clickhouse.read.compression.codec             | lz4                                                       | 読み取り用のデータを展開するために使用されるコーデック。サポートされているコーデック：none、lz4。                                                                                                                                                                                                                                                                                                           | 0.5.0 |
| spark.clickhouse.read.distributed.convertLocal      | true                                                      | 分散テーブルを読み取るとき、テーブル自身の代わりにローカルテーブルを読み取ります。`true`の場合、`spark.clickhouse.read.distributed.useClusterNodes`を無視します。                                                                                                                                                                                                                                         | 0.1.0 |
| spark.clickhouse.read.fixedStringAs                 | binary                                                    | ClickHouseのFixedString型を指定されたSparkデータ型として読み取ります。サポートされている型：binary、string                                                                                                                                                                                                                                                                                                         | 0.8.0 |
| spark.clickhouse.read.format                        | json                                                      | 読み取り用のシリアライズ形式。サポートされている形式：json、binary                                                                                                                                                                                                                                                                                                                                         | 0.6.0 |
| spark.clickhouse.read.runtimeFilter.enabled         | false                                                     | 読み取り用のランタイムフィルターを有効にします。                                                                                                                                                                                                                                                                                                                                                                  | 0.8.0 |
| spark.clickhouse.read.splitByPartitionId            | true                                                      | `true`の場合、仮想カラム`_partition_id`によって入力パーティションフィルターを構築します。パーティション値によるSQL述語の組み立てには既知の問題があります。この機能にはClickHouse Server v21.6+が必要です。                                                                                                                                                                               | 0.4.0 |
| spark.clickhouse.useNullableQuerySchema             | false                                                     | `true`の場合、テーブルを作成する際に`CREATE/REPLACE TABLE ... AS SELECT ...`を実行する際に、クエリスキーマのすべてのフィールドをNullableとしてマークします。この設定にはSPARK-43390（Spark 3.5に利用可能）が必要で、これがないと常に`true`として動作します。                                                                                                                                  | 0.8.0 |
| spark.clickhouse.write.batchSize                    | 10000                                                     | ClickHouseに書き込む際のバッチごとのレコード数。                                                                                                                                                                                                                                                                                                                                                                    | 0.1.0 |
| spark.clickhouse.write.compression.codec            | lz4                                                       | 書き込み用のデータを圧縮するために使用されるコーデック。サポートされているコーデック：none、lz4。                                                                                                                                                                                                                                                                                                             | 0.3.0 |
| spark.clickhouse.write.distributed.convertLocal     | false                                                     | 分散テーブルを書き込むとき、テーブル自身の代わりにローカルテーブルに書き込みます。`true`の場合、`spark.clickhouse.write.distributed.useClusterNodes`を無視します。                                                                                                                                                                                                                               | 0.1.0 |
| spark.clickhouse.write.distributed.useClusterNodes  | true                                                      | 分散テーブルを書き込む際、クラスタのすべてのノードに書き込みます。                                                                                                                                                                                                                                                                                                                                                | 0.1.0 |
| spark.clickhouse.write.format                       | arrow                                                     | 書き込み用のシリアライズ形式。サポートされている形式：json、arrow                                                                                                                                                                                                                                                                                                                                             | 0.4.0 |
| spark.clickhouse.write.localSortByKey               | true                                                      | `true`の場合、書き込む前にソートキーでローカルソートを行います。                                                                                                                                                                                                                                                                                                                                                 | 0.3.0 |
| spark.clickhouse.write.localSortByPartition         | spark.clickhouse.write.repartitionByPartitionの値        | `true`の場合、書き込む前にパーティションによるローカルソートを行います。設定されていない場合、`spark.clickhouse.write.repartitionByPartition`と同じになります。                                                                                                                                                                                                                                   | 0.3.0 |
| spark.clickhouse.write.maxRetry                     | 3                                                         | 再試行可能なコードで失敗した単一バッチ書き込みに対して再試行する最大回数。                                                                                                                                                                                                                                                                                                                                                | 0.1.0 |
| spark.clickhouse.write.repartitionByPartition       | true                                                      | ClickHouseテーブルの分布を満たすために書き込む前に、ClickHouseのパーティションキーによってデータを再パーティションします。                                                                                                                                                                                                                                                                                            | 0.3.0 |
| spark.clickhouse.write.repartitionNum               | 0                                                         | ClickHouseテーブルの分布を満たすために、書き込む前にデータを再パーティションする必要があり、この設定で再パーティションの数を指定します。値が1未満の場合、要件がないことを示します。                                                                                                                                                                                                                          | 0.1.0 |
| spark.clickhouse.write.repartitionStrictly          | false                                                     | `true`の場合、Sparkは、データソーステーブルにレコードを渡す前に、必要な分布を満たすために受信レコードをパーティションに厳密に分散させます。そうでない場合、Sparkはクエリを高速化するために特定の最適化を適用し、分布要件を壊す可能性があります。この設定にはSPARK-37523（Spark 3.4に利用可能）が必要で、これがないと常に`true`として動作します。                          | 0.3.0 |
| spark.clickhouse.write.retryInterval                | 10s                                                       | 書き込み再試行の間隔（秒）。                                                                                                                                                                                                                                                                                                                                                                                    | 0.1.0 |
| spark.clickhouse.write.retryableErrorCodes          | 241                                                       | 書き込みが失敗したときにClickHouseサーバーから返される再試行可能なエラーコード。                                                                                                                                                                                                                                                                                                                               | 0.1.0 |
## Supported Data Types {#supported-data-types}

このセクションでは、SparkとClickHouse間のデータ型のマッピングを示します。以下の表は、ClickHouseからSparkへ読み取る際、およびSparkからClickHouseにデータを挿入する際のデータ型変換のためのクイックリファレンスを提供します。
### ClickHouseからSparkへデータを読み取る {#reading-data-from-clickhouse-into-spark}

| ClickHouseデータ型                                               | Sparkデータ型                 | サポート | プリミティブ | ノート                                               |
|------------------------------------------------------------|------------------------|--------|--------|-----------------------------------------------------|
| `Nothing`                                                  | `NullType`            | ✅      | はい     |                                                     |
| `Bool`                                                     | `BooleanType`         | ✅      | はい     |                                                     |
| `UInt8`, `Int16`                                           | `ShortType`           | ✅      | はい     |                                                     |
| `Int8`                                                     | `ByteType`            | ✅      | はい     |                                                     |
| `UInt16`,`Int32`                                           | `IntegerType`         | ✅      | はい     |                                                     |
| `UInt32`,`Int64`, `UInt64`                                 | `LongType`            | ✅      | はい     |                                                     |
| `Int128`,`UInt128`, `Int256`, `UInt256`                    | `DecimalType(38, 0)`   | ✅      | はい     |                                                     |
| `Float32`                                                  | `FloatType`           | ✅      | はい     |                                                     |
| `Float64`                                                  | `DoubleType`          | ✅      | はい     |                                                     |
| `String`, `JSON`, `UUID`, `Enum8`, `Enum16`, `IPv4`, `IPv6` | `StringType`          | ✅      | はい     |                                                     |
| `FixedString`                                              | `BinaryType`, `StringType` | ✅      | はい     | 設定`READ_FIXED_STRING_AS`によって制御されます       |
| `Decimal`                                                  | `DecimalType`         | ✅      | はい     | 精度とスケールは`Decimal128`までサポート              |
| `Decimal32`                                                | `DecimalType(9, scale)` | ✅      | はい     |                                                     |
| `Decimal64`                                                | `DecimalType(18, scale)`| ✅      | はい     |                                                     |
| `Decimal128`                                               | `DecimalType(38, scale)`| ✅      | はい     |                                                     |
| `Date`, `Date32`                                           | `DateType`            | ✅      | はい     |                                                     |
| `DateTime`, `DateTime32`, `DateTime64`                     | `TimestampType`       | ✅      | はい     |                                                     |
| `Array`                                                    | `ArrayType`           | ✅      | いいえ   | 配列要素型も変換されます                           |
| `Map`                                                      | `MapType`             | ✅      | いいえ   | キーは`StringType`に制限されています               |
| `IntervalYear`                                             | `YearMonthIntervalType(Year)` | ✅      | はい     |                                                     |
| `IntervalMonth`                                            | `YearMonthIntervalType(Month)` | ✅      | はい     |                                                     |
| `IntervalDay`, `IntervalHour`, `IntervalMinute`, `IntervalSecond` | `DayTimeIntervalType` | ✅      | いいえ   | 特定の間隔タイプが使用されます                      |
| `Object`                                                   |                        | ❌      |        |                                                     |
| `Nested`                                                   |                        | ❌      |        |                                                     |
| `Tuple`                                                    |                        | ❌      |        |                                                     |
| `Point`                                                    |                        | ❌      |        |                                                     |
| `Polygon`                                                  |                        | ❌      |        |                                                     |
| `MultiPolygon`                                             |                        | ❌      |        |                                                     |
| `Ring`                                                     |                        | ❌      |        |                                                     |
| `IntervalQuarter`                                          |                        | ❌      |        |                                                     |
| `IntervalWeek`                                             |                        | ❌      |        |                                                     |
| `Decimal256`                                               |                        | ❌      |        |                                                     |
| `AggregateFunction`                                        |                        | ❌      |        |                                                     |
| `SimpleAggregateFunction`                                  |                        | ❌      |        |                                                     |
### SparkからClickHouseへデータを挿入する {#inserting-data-from-spark-into-clickhouse}

| Sparkデータ型                          | ClickHouseデータ型 | サポート | プリミティブ | ノート                                 |
|-------------------------------------|----------------------|-----------|--------------|---------------------------------------|
| `BooleanType`                       | `UInt8`              | ✅         | はい          |                                       |
| `ByteType`                          | `Int8`               | ✅         | はい          |                                       |
| `ShortType`                         | `Int16`              | ✅         | はい          |                                       |
| `IntegerType`                       | `Int32`              | ✅         | はい          |                                       |
| `LongType`                          | `Int64`              | ✅         | はい          |                                       |
| `FloatType`                         | `Float32`            | ✅         | はい          |                                       |
| `DoubleType`                        | `Float64`            | ✅         | はい          |                                       |
| `StringType`                        | `String`             | ✅         | はい          |                                       |
| `VarcharType`                       | `String`             | ✅         | はい          |                                       |
| `CharType`                          | `String`             | ✅         | はい          |                                       |
| `DecimalType`                       | `Decimal(p, s)`      | ✅         | はい          | 精度とスケールは`Decimal128`までサポート |
| `DateType`                          | `Date`               | ✅         | はい          |                                       |
| `TimestampType`                     | `DateTime`           | ✅         | はい          |                                       |
| `ArrayType` (リスト、タプル、または配列) | `Array`              | ✅         | いいえ        | 配列要素型も変換されます              |
| `MapType`                           | `Map`                | ✅         | いいえ        | キーは`StringType`に制限されています  |
| `Object`                            |                      | ❌         |              |                                       |
| `Nested`                            |                      | ❌         |              |                                       |
## Contributing and Support {#contributing-and-support}

プロジェクトへの貢献や問題の報告をご希望の場合は、皆様のご意見をお待ちしております！  
[GitHubリポジトリ](https://github.com/ClickHouse/spark-clickhouse-connector)を訪れて、問題を開いたり、改善を提案したり、プルリクエストを提出したりしてください。  
貢献をお待ちしております！始める前にリポジトリの貢献ガイドラインを確認してください。  
ClickHouse Sparkコネクタの改善にご協力いただきありがとうございます！
