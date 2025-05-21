---
sidebar_label: 'Sparkネイティブコネクタ'
sidebar_position: 2
slug: /integrations/apache-spark/spark-native-connector
description: 'ClickHouseとのApache Sparkの導入'
keywords: ['clickhouse', 'Apache Spark', 'migrating', 'data']
title: 'Sparkコネクタ'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';

# Sparkコネクタ

このコネクタは、ClickHouse特有の最適化、例えば高度なパーティショニングや述語プッシュダウンを活用して、クエリパフォーマンスやデータ処理を向上させます。
コネクタは[ClickHouseの公式JDBCコネクタ](https://github.com/ClickHouse/clickhouse-java)に基づいており、自身のカタログを管理します。

Spark 3.0以前は、Sparkには組み込みのカタログ概念が欠如していたため、ユーザーは通常、Hive MetastoreやAWS Glueなどの外部カタログシステムに依存していました。
これらの外部ソリューションを使用する場合、ユーザーはSparkでデータソーステーブルにアクセスする前に手動でそれらを登録する必要がありました。
しかし、Spark 3.0でカタログ概念が導入されて以来、Sparkはカタログプラグインを登録することでテーブルを自動的に発見できるようになりました。

Sparkのデフォルトカタログは`spark_catalog`であり、テーブルは`{catalog name}.{database}.{table}`によって識別されます。新しいカタログ機能により、単一のSparkアプリケーションで複数のカタログを追加して操作することが可能です。

<TOCInline toc={toc}></TOCInline>
## 要件 {#requirements}

- Java 8 または 17
- Scala 2.12 または 2.13
- Apache Spark 3.3 または 3.4 または 3.5
## 互換性マトリックス {#compatibility-matrix}

| バージョン | 互換性のあるSparkバージョン | ClickHouse JDBCバージョン |
|---------|---------------------------|-------------------------|
| main    | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.8.1   | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.8.0   | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.7.3   | Spark 3.3, 3.4            | 0.4.6                   |
| 0.6.0   | Spark 3.3                 | 0.3.2-patch11           |
| 0.5.0   | Spark 3.2, 3.3            | 0.3.2-patch11           |
| 0.4.0   | Spark 3.2, 3.3            | 依存しない              |
| 0.3.0   | Spark 3.2, 3.3            | 依存しない              |
| 0.2.1   | Spark 3.2                 | 依存しない              |
| 0.1.2   | Spark 3.2                 | 依存しない              |
## インストールとセットアップ {#installation--setup}

ClickHouseをSparkと統合するためには、さまざまなプロジェクトセットアップに適した複数のインストールオプションがあります。
ClickHouse Sparkコネクタをプロジェクトのビルドファイル（Mavenの場合は`pom.xml`、SBTの場合は`build.sbt`など）に依存関係として直接追加できます。
または、必要なJARファイルを`$SPARK_HOME/jars/`フォルダに置くか、`spark-submit`コマンドの`--jars`フラグを使用して直接渡すことができます。
どちらの方法でも、Spark環境でClickHouseコネクタを利用可能にすることができます。
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

SNAPSHOTバージョンを使用したい場合は、以下のリポジトリを追加してください。

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

SNAPSHOTバージョンを使用したい場合は、以下のリポジトリを追加してください:

```gradle
repositories {
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

Sparkのシェルオプション（Spark SQL CLI、Spark Shell CLI、Spark Submitコマンド）を使って作業する際、必要なJARを渡すことで依存関係を登録できます:

```text
$SPARK_HOME/bin/spark-sql \
  --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
```

JARファイルをSparkクライアントノードにコピーしたくない場合は、以下の代わりに使用できます:

```text
  --repositories https://{maven-central-mirror or private-nexus-repo} \
  --packages com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }},com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}:all
```

注: SQL専用の使用例では、[Apache Kyuubi](https://github.com/apache/kyuubi)が推奨されています 
生産向け。

</TabItem>
</Tabs>
### ライブラリのダウンロード {#download-the-library}

バイナリJARの名前パターンは以下の通りです:

```bash
clickhouse-spark-runtime-${spark_binary_version}_${scala_binary_version}-${version}.jar
```

利用可能なすべてのリリースされたJARファイルは、[Maven Central Repository](https://repo1.maven.org/maven2/com/clickhouse/spark/)で見つけることができ、
すべての日次ビルドSNAPSHOT JARファイルは、[Sonatype OSS Snapshots Repository](https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/)で見つけることができます。

:::important
「all」クラス分類の[clickhouse-jdbc JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)を含めることが不可欠です。
コネクタは、[clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)と[clickhouse-client](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)の両方を必要とするため、これらはclickhouse-jdbc:allにバンドルされています。
あるいは、フルJDBCパッケージを使用したくない場合は、[clickhouse-client JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)と[clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)を個別に追加できます。

いずれにしても、パッケージのバージョンは、[互換性マトリックス](#compatibility-matrix)に従って互換性があることを確認してください。
:::
## カタログの登録（必須） {#register-the-catalog-required}

ClickHouseテーブルにアクセスするには、以下の設定を持つ新しいSparkカタログを構成する必要があります:

| プロパティ                                   | 値                                       | デフォルト値      | 必須     |
|----------------------------------------------|-----------------------------------------|------------------|----------|
| `spark.sql.catalog.<catalog_name>`           | `com.clickhouse.spark.ClickHouseCatalog` | N/A              | はい     |
| `spark.sql.catalog.<catalog_name>.host`      | `<clickhouse_host>`                     | `localhost`      | いいえ   |
| `spark.sql.catalog.<catalog_name>.protocol`  | `http`                                  | `http`           | いいえ   |
| `spark.sql.catalog.<catalog_name>.http_port` | `<clickhouse_port>`                     | `8123`           | いいえ   |
| `spark.sql.catalog.<catalog_name>.user`      | `<clickhouse_username>`                 | `default`        | いいえ   |
| `spark.sql.catalog.<catalog_name>.password`  | `<clickhouse_password>`                 | (空文字列)      | いいえ   |
| `spark.sql.catalog.<catalog_name>.database`  | `<database>`                            | `default`        | いいえ   |
| `spark.<catalog_name>.write.format`          | `json`                                  | `arrow`          | いいえ   |

これらの設定は次のいずれかで設定できます:

* `spark-defaults.conf`を編集/作成する
* `spark-submit`コマンド（または`spark-shell`/`spark-sql` CLIコマンド）に設定を渡す
* コンテキストを初期化する際に設定を追加する

:::important
ClickHouseクラスタで作業する場合、各インスタンスに対してユニークなカタログ名を設定する必要があります。
例えば:

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

このようにすることで、Spark SQLからclickhouse1テーブル`<ck_db>.<ck_table>`に`clickhouse1.<ck_db>.<ck_table>`でアクセスでき、
clickhouse2テーブル`<ck_db>.<ck_table>`には`clickhouse2.<ck_db>.<ck_table>`でアクセスできるようになります。

:::
## ClickHouse Cloud設定 {#clickhouse-cloud-settings}

[ClickHouse Cloud](https://clickhouse.com)に接続する際は、SSLを有効にし、適切なSSLモードを設定してください。例えば:

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
  // DataFrameを作成
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


# 互換性マトリックスに従う他のパッケージの組み合わせを自由に使用できます。
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
    -- resultTalbeはSparkの中間dfで、clickhouse.default.example_tableに挿入したいものです。
   INSERT INTO TABLE clickhouse.default.example_table
                SELECT * FROM resultTable;
                
```

</TabItem>
</Tabs>
## DDL操作 {#ddl-operations}

Spark SQLを使用してClickHouseインスタンスでDDL操作を実行でき、すべての変更は即座にClickHouseに永続化されます。
Spark SQLでは、ClickHouseでどのように書かれるかと同じようにクエリを書くことができますので、CREATE TABLEやTRUNCATEなどのコマンドを直接実行できます。例えば:

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

上記の例はSpark SQLクエリを示しており、あなたのアプリケーションでJava、Scala、PySpark、またはシェルのいずれかのAPIを使用して実行できます。

## Configurations {#configurations}

以下はコネクタで利用可能な調整可能な構成です：

<br/>

| Key                                                | Default                                                | Description                                                                                                                                                                                                                                                                                                                                                                                                     | Since |
|----------------------------------------------------|--------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------|
| spark.clickhouse.ignoreUnsupportedTransform        | false                                                  | ClickHouseは、例えば `cityHash64(col_1, col_2)` のように、シャーディングキーやパーティション値として複雑な式を使用することをサポートしますが、これは現在Sparkによってサポートされていません。`true`の場合、サポートされていない式は無視され、そうでなければ例外と共に早期に失敗します。注意、`spark.clickhouse.write.distributed.convertLocal` が有効な場合、サポートされていないシャーディングキーの無視はデータを破損させる可能性があります。 | 0.4.0 |
| spark.clickhouse.read.compression.codec            | lz4                                                    | 読み取りのためにデータを圧縮解除する際に使用されるコーデック。サポートされているコーデック：none, lz4。                                                                                                                                                                                                                                                                                                     | 0.5.0 |
| spark.clickhouse.read.distributed.convertLocal     | true                                                   | 分散テーブルを読み取る際、自己の代わりにローカルテーブルを読み取ります。`true`の場合、`spark.clickhouse.read.distributed.useClusterNodes`は無視されます。                                                                                                                                                                                                                                                                                | 0.1.0 |
| spark.clickhouse.read.fixedStringAs                | binary                                                 | ClickHouseのFixedString型を指定されたSparkデータ型として読み取ります。サポートされている型：binary, string                                                                                                                                                                                                                                                                                                   | 0.8.0 |
| spark.clickhouse.read.format                       | json                                                   | 読み取りのためのシリアライズフォーマット。サポートされているフォーマット：json, binary                                                                                                                                                                                                                                                                                                                  | 0.6.0 |
| spark.clickhouse.read.runtimeFilter.enabled        | false                                                  | 読み取りのためのランタイムフィルターを有効にします。                                                                                                                                                                                                                                                                                                                                                          | 0.8.0 |
| spark.clickhouse.read.splitByPartitionId           | true                                                   | `true`の場合、仮想カラム `_partition_id` によって入力パーティションフィルターを構築します。パーティション値によってSQL述語を組み立てる際に既知の問題があります。この機能はClickHouse Server v21.6+が必要です。                                                                                                                                                                   | 0.4.0 |
| spark.clickhouse.useNullableQuerySchema            | false                                                  | `true`の場合、テーブルの作成時に `CREATE/REPLACE TABLE ... AS SELECT ...` を実行する際、クエリスキーマのすべてのフィールドをnullableとしてマークします。この設定はSPARK-43390（Spark 3.5で利用可能）が必要であり、このパッチがない場合は常に`true`として動作します。                                                                                                                      | 0.8.0 |
| spark.clickhouse.write.batchSize                   | 10000                                                  | ClickHouseへの書き込み時のバッチごとのレコード数です。                                                                                                                                                                                                                                                                                                                                                     | 0.1.0 |
| spark.clickhouse.write.compression.codec           | lz4                                                    | 書き込みのためにデータを圧縮する際に使用されるコーデック。サポートされているコーデック：none, lz4。                                                                                                                                                                                                                                                                                                     | 0.3.0 |
| spark.clickhouse.write.distributed.convertLocal    | false                                                  | 分散テーブルを書き込む際、自己の代わりにローカルテーブルを書き込みます。`true`の場合、`spark.clickhouse.write.distributed.useClusterNodes`は無視されます。                                                                                                                                                                                                                                          | 0.1.0 |
| spark.clickhouse.write.distributed.useClusterNodes | true                                                   | 分散テーブルを作成する際、クラスターのすべてのノードに書き込みます。                                                                                                                                                                                                                                                                                                                                             | 0.1.0 |
| spark.clickhouse.write.format                      | arrow                                                  | 書き込みのためのシリアライズフォーマット。サポートされているフォーマット：json, arrow                                                                                                                                                                                                                                                                                                                | 0.4.0 |
| spark.clickhouse.write.localSortByKey              | true                                                   | `true`の場合、書き込む前にソートキーでローカルソートを行います。                                                                                                                                                                                                                                                                                                                                             | 0.3.0 |
| spark.clickhouse.write.localSortByPartition        | value of spark.clickhouse.write.repartitionByPartition | `true`の場合、書き込む前にパーティションでローカルソートを行います。未設定の場合、これは`spark.clickhouse.write.repartitionByPartition`と等しくなります。                                                                                                                                                                                                                                                  | 0.3.0 |
| spark.clickhouse.write.maxRetry                    | 3                                                      | リトライ可能なコードで失敗した単一バッチ書き込みの最大リトライ回数です。                                                                                                                                                                                                                                                                                                                                         | 0.1.0 |
| spark.clickhouse.write.repartitionByPartition      | true                                                   | 書き込む前にClickHouseのパーティションキーによってデータを再パーティションするかどうかを示します。                                                                                                                                                                                                                                                                                                          | 0.3.0 |
| spark.clickhouse.write.repartitionNum              | 0                                                      | 書き込む前にClickHouseのテーブルの分布を満たすためにデータを再パーティションする必要があります。この設定で再パーティション数を指定します。1未満の値は必要がないことを意味します。                                                                                                                                                                                                                              | 0.1.0 |
| spark.clickhouse.write.repartitionStrictly         | false                                                  | `true`の場合、Sparkはデータソーステーブルへの書き込み時にレコードを必要な分布を満たすようにパーティションに厳密に分配します。そうでなければ、Sparkはクエリを速度アップするために特定の最適化を適用することがありますが、分布要件を破る可能性があります。この設定はSPARK-37523（Spark 3.4で利用可能）が必要であり、このパッチがない場合は常に`true`として動作します。                               | 0.3.0 |
| spark.clickhouse.write.retryInterval               | 10s                                                    | 書き込みのリトライ間隔（秒単位）です。                                                                                                                                                                                                                                                                                                                                                                        | 0.1.0 |
| spark.clickhouse.write.retryableErrorCodes         | 241                                                    | 書き込みが失敗した際にClickHouseサーバーから返されるリトライ可能なエラーコードです。                                                                                                                                                                                                                                                                                                                      | 0.1.0 |

## Supported Data Types {#supported-data-types}

このセクションでは、SparkとClickHouseのデータ型のマッピングを概説します。以下の表は、ClickHouseからSparkにデータを読み取る際およびSparkからClickHouseへデータを挿入する際のデータ型変換のためのクイックリファレンスを提供します。

### Reading data from ClickHouse into Spark {#reading-data-from-clickhouse-into-spark}

| ClickHouse Data Type                                              | Spark Data Type                | Supported | Is Primitive | Notes                                              |
|-------------------------------------------------------------------|--------------------------------|-----------|--------------|----------------------------------------------------|
| `Nothing`                                                         | `NullType`                     | ✅         | Yes          |                                                    |
| `Bool`                                                            | `BooleanType`                  | ✅         | Yes          |                                                    |
| `UInt8`, `Int16`                                                  | `ShortType`                    | ✅         | Yes          |                                                    |
| `Int8`                                                            | `ByteType`                     | ✅         | Yes          |                                                    |
| `UInt16`,`Int32`                                                  | `IntegerType`                  | ✅         | Yes          |                                                    |
| `UInt32`,`Int64`, `UInt64`                                        | `LongType`                     | ✅         | Yes          |                                                    |
| `Int128`,`UInt128`, `Int256`, `UInt256`                           | `DecimalType(38, 0)`           | ✅         | Yes          |                                                    |
| `Float32`                                                         | `FloatType`                    | ✅         | Yes          |                                                    |
| `Float64`                                                         | `DoubleType`                   | ✅         | Yes          |                                                    |
| `String`, `JSON`, `UUID`, `Enum8`, `Enum16`, `IPv4`, `IPv6`       | `StringType`                   | ✅         | Yes          |                                                    |
| `FixedString`                                                     | `BinaryType`, `StringType`     | ✅         | Yes          | `READ_FIXED_STRING_AS` によって制御される               |
| `Decimal`                                                         | `DecimalType`                  | ✅         | Yes          | 精度およびスケールは `Decimal128` まで                |
| `Decimal32`                                                       | `DecimalType(9, scale)`        | ✅         | Yes          |                                                    |
| `Decimal64`                                                       | `DecimalType(18, scale)`       | ✅         | Yes          |                                                    |
| `Decimal128`                                                      | `DecimalType(38, scale)`       | ✅         | Yes          |                                                    |
| `Date`, `Date32`                                                  | `DateType`                     | ✅         | Yes          |                                                    |
| `DateTime`, `DateTime32`, `DateTime64`                            | `TimestampType`                | ✅         | Yes          |                                                    |
| `Array`                                                           | `ArrayType`                    | ✅         | No           | 配列要素型も変換される                               |
| `Map`                                                             | `MapType`                      | ✅         | No           | キーは `StringType` に制限される                      |
| `IntervalYear`                                                    | `YearMonthIntervalType(Year)`  | ✅         | Yes          |                                                    |
| `IntervalMonth`                                                   | `YearMonthIntervalType(Month)` | ✅         | Yes          |                                                    |
| `IntervalDay`, `IntervalHour`, `IntervalMinute`, `IntervalSecond` | `DayTimeIntervalType`          | ✅         | No           | 特定の間隔タイプが使用される                          |
| `Object`                                                          |                                | ❌         |              |                                                    |
| `Nested`                                                          |                                | ❌         |              |                                                    |
| `Tuple`                                                           |                                | ❌         |              |                                                    |
| `Point`                                                           |                                | ❌         |              |                                                    |
| `Polygon`                                                         |                                | ❌         |              |                                                    |
| `MultiPolygon`                                                    |                                | ❌         |              |                                                    |
| `Ring`                                                            |                                | ❌         |              |                                                    |
| `IntervalQuarter`                                                 |                                | ❌         |              |                                                    |
| `IntervalWeek`                                                    |                                | ❌         |              |                                                    |
| `Decimal256`                                                      |                                | ❌         |              |                                                    |
| `AggregateFunction`                                               |                                | ❌         |              |                                                    |
| `SimpleAggregateFunction`                                         |                                | ❌         |              |                                                    |

### Inserting data from Spark into ClickHouse {#inserting-data-from-spark-into-clickhouse}

| Spark Data Type                     | ClickHouse Data Type | Supported | Is Primitive | Notes                                  |
|-------------------------------------|----------------------|-----------|--------------|----------------------------------------|
| `BooleanType`                       | `UInt8`              | ✅         | Yes          |                                        |
| `ByteType`                          | `Int8`               | ✅         | Yes          |                                        |
| `ShortType`                         | `Int16`              | ✅         | Yes          |                                        |
| `IntegerType`                       | `Int32`              | ✅         | Yes          |                                        |
| `LongType`                          | `Int64`              | ✅         | Yes          |                                        |
| `FloatType`                         | `Float32`            | ✅         | Yes          |                                        |
| `DoubleType`                        | `Float64`            | ✅         | Yes          |                                        |
| `StringType`                        | `String`             | ✅         | Yes          |                                        |
| `VarcharType`                       | `String`             | ✅         | Yes          |                                        |
| `CharType`                          | `String`             | ✅         | Yes          |                                        |
| `DecimalType`                       | `Decimal(p, s)`      | ✅         | Yes          | 精度およびスケールは `Decimal128` まで |
| `DateType`                          | `Date`               | ✅         | Yes          |                                        |
| `TimestampType`                     | `DateTime`           | ✅         | Yes          |                                        |
| `ArrayType` (list, tuple, or array) | `Array`              | ✅         | No           | 配列要素型も変換される                   |
| `MapType`                           | `Map`                | ✅         | No           | キーは `StringType` に制限される        |
| `Object`                            |                      | ❌         |              |                                        |
| `Nested`                            |                      | ❌         |              |                                        |

## Contributing and Support {#contributing-and-support}

プロジェクトに貢献したり、問題を報告したりしたい場合は、あなたの意見を歓迎します！
私たちの [GitHubリポジトリ](https://github.com/ClickHouse/spark-clickhouse-connector) を訪れて、問題を開く、改善を提案する、またはプルリクエストを提出してください。
貢献をお待ちしております！始める前にリポジトリの貢献ガイドラインを確認してください。
私たちのClickHouse Sparkコネクタを改善する手助けをしていただきありがとうございます！
