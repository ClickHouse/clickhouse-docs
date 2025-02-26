---
sidebar_label: Sparkネイティブコネクタ
sidebar_position: 2
slug: /integrations/apache-spark/spark-native-connector
description: ClickHouseとApache Sparkの紹介
keywords: [ clickhouse, Apache Spark, 移行, データ ]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';

# Sparkコネクタ

このコネクタは、クエリパフォーマンスとデータ処理の向上のために、先進的なパーティショニングや述語プッシュダウンなど、ClickHouse専用の最適化を活用しています。コネクタは[ClickHouseの公式JDBCコネクタ](https://github.com/ClickHouse/clickhouse-java)に基づいており、自身のカタログを管理します。

Spark 3.0より前は、Sparkには組み込みのカタログ概念がなかったため、ユーザーは通常、HiveメタストアやAWS Glueなどの外部カタログシステムに依存していました。これらの外部ソリューションでは、ユーザーはSparkでアクセスする前にデータソーステーブルを手動で登録する必要がありました。しかし、Spark 3.0からカタログ概念が導入され、Sparkはカタログプラグインを登録することにより、自動的にテーブルを発見できるようになりました。

Sparkのデフォルトカタログは`spark_catalog`であり、テーブルは`{catalog name}.{database}.{table}`で識別されます。新しいカタログ機能により、単一のSparkアプリケーションで複数のカタログを追加して使用することが可能になりました。

<TOCInline toc={toc}></TOCInline>

## 要件 {#requirements}

- Java 8または17
- Scala 2.12または2.13
- Apache Spark 3.3、3.4、または3.5

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

## インストールと設定 {#installation--setup}

ClickHouseとSparkを統合するために、異なるプロジェクトセットアップに合わせた複数のインストールオプションがあります。ClickHouse Sparkコネクタをプロジェクトのビルドファイルに依存関係として直接追加することができます（例えば、Mavenの`pom.xml`またはSBTの`build.sbt`で）。または、必要なJARファイルを`$SPARK_HOME/jars/`フォルダに置くか、`spark-submit`コマンドの`--jars`フラグを使用して直接渡すこともできます。どちらの方法でも、ClickHouseコネクタがSpark環境で利用できるようになります。

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

SNAPSHOTバージョンを使用したい場合は、次のリポジトリを追加してください。

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

SNAPSHOTバージョンを使用したい場合は、次のリポジトリを追加してください：

```gradle
repositories {
  maven { url = "https://s01.oss.sonatype.org/content/repositories/snapshots" }
}
```

</TabItem>
<TabItem value="SBT" label="SBT">

```sbt
libraryDependencies += "com.clickhouse" % "clickhouse-jdbc" % {{ clickhouse_jdbc_version }} classifier "all"
libraryDependencies += "com.clickhouse.spark" %% "clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}" % {{ stable_version }}
```

</TabItem>
<TabItem value="Spark SQL/Shell CLI" label="Spark SQL/Shell CLI">

Sparkのシェルオプション（Spark SQL CLI、Spark Shell CLI、及びSpark Submitコマンド）を使用する際、必要なJARファイルを渡すことで依存関係を登録できます：

```text
$SPARK_HOME/bin/spark-sql \
  --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
```

JARファイルをSparkクライアントノードにコピーしたくない場合は、以下を使用できます：

```text
  --repositories https://{maven-central-mirror or private-nexus-repo} \
  --packages com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }},com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}:all
```

注: SQL専用の使用ケースには、[Apache Kyuubi](https://github.com/apache/kyuubi)の使用を推奨します。

</TabItem>
</Tabs>

### ライブラリのダウンロード {#download-the-library}

バイナリJARの名前パターンは次の通りです：

```bash
clickhouse-spark-runtime-${spark_binary_version}_${scala_binary_version}-${version}.jar
```

すべてのリリース済みJARファイルは、[Maven Central Repository](https://repo1.maven.org/maven2/com/clickhouse/spark/)で見つけることができ、日次ビルドのSNAPSHOT JARファイルは、[Sonatype OSS Snapshots Repository](https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/)で見つけることができます。

:::important
「すべて」クラシファイア付きの[clickhouse-jdbc JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)を含めることが重要です。コネクタは[clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)および[clickhouse-client](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)に依存しており、両方ともclickhouse-jdbc:allにバンドルされています。フルJDBCパッケージを使用したくない場合は、[clickhouse-client JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)と[clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)を個別に追加することもできます。

いずれにせよ、パッケージバージョンが[互換性マトリックス](#compatibility-matrix)に従って互換性があることを確認してください。
:::

## カタログの登録（必須） {#register-the-catalog-required}

ClickHouseテーブルにアクセスするには、次の設定で新しいSparkカタログを構成する必要があります：

| プロパティ                                     | 値                                    | デフォルト値  | 必須 |
|----------------------------------------------|------------------------------------------|----------------|----------|
| `spark.sql.catalog.<catalog_name>`           | `com.clickhouse.spark.ClickHouseCatalog` | N/A            | はい      |
| `spark.sql.catalog.<catalog_name>.host`      | `<clickhouse_host>`                      | `localhost`    | いいえ       |
| `spark.sql.catalog.<catalog_name>.protocol`  | `http`                                   | `http`         | いいえ       |
| `spark.sql.catalog.<catalog_name>.http_port` | `<clickhouse_port>`                      | `8123`         | いいえ       |
| `spark.sql.catalog.<catalog_name>.user`      | `<clickhouse_username>`                  | `default`      | いいえ       |
| `spark.sql.catalog.<catalog_name>.password`  | `<clickhouse_password>`                  | (空文字列)    | いいえ       |
| `spark.sql.catalog.<catalog_name>.database`  | `<database>`                             | `default`      | いいえ       |
| `spark.<catalog_name>.write.format`          | `json`                                   | `arrow`        | いいえ       |

これらの設定は、次のいずれかを介して設定できます：

* `spark-defaults.conf`を編集または作成します。
* `spark-submit`コマンド（または`spark-shell` / `spark-sql` CLIコマンド）に設定を渡します。
* コンテキストを初期化するときに設定を追加します。

:::important
ClickHouseクラスターで作業する場合は、各インスタンスに対して一意のカタログ名を設定する必要があります。例えば：

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

このようにして、`clickhouse1.<ck_db>.<ck_table>`から`<ck_db>.<ck_table>`のtableにアクセスし、`clickhouse2.<ck_db>.<ck_table>`から`<ck_db>.<ck_table>`のtableにアクセスできるようになります。

:::

## データの読み取り {#read-data}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
public static void main(String[] args) {
        // Sparkセッションの作成
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

        // Sparkセッションの作成
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
  // Sparkセッションの作成
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

# 提供された互換性マトリックスを満たす他のパッケージの組み合わせを自由に使用できます。
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
    -- resultTableは、私たちがclickhouse.default.example_tableに挿入したいSparkの中間dfです
   INSERT INTO TABLE clickhouse.default.example_table
                SELECT * FROM resultTable;
                
```

</TabItem>
</Tabs>

## DDL操作 {#ddl-operations}

ClickHouseインスタンスに対してDDL操作をSpark SQLを使用して実行でき、すべての変更がすぐにClickHouseに保存されます。Spark SQLでは、ClickHouseと同じようにクエリを書くことができるため、CREATE TABLE、TRUNCATEなどのコマンドを直接実行することができます。例えば：

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

上記の例は、アプリケーション内で任意のAPI（Java、Scala、PySpark、またはシェル）を使用して実行できるSpark SQLクエリを示しています。

## 設定 {#configurations}

コネクタで利用可能な調整可能な設定は以下の通りです：

<br/>

| キー                                                | デフォルト                                                | 説明                                                                                                                                                                                                                                                                                                                                                                                                     | 以降 |
|----------------------------------------------------|--------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------|
| spark.clickhouse.ignoreUnsupportedTransform        | false                                                  | ClickHouseは複雑な式をシャーディングキーやパーティション値として使用することをサポートしています（例：`cityHash64(col_1, col_2)`）。これは現在Sparkでサポートされていません。`true`であれば、サポートされていない式を無視し、そうでなければ例外で即座に失敗します。注意：`spark.clickhouse.write.distributed.convertLocal`が有効な場合、サポートされていないシャーディングキーを無視することはデータを破損させる可能性があります。    | 0.4.0 |
| spark.clickhouse.read.compression.codec            | lz4                                                    | 読み取り用にデータを解凍するために使用されるコーデック。サポートされているコーデック：none、lz4。                                                                                                                                                                                                                                                                                                                                     | 0.5.0 |
| spark.clickhouse.read.distributed.convertLocal     | true                                                   | 分散テーブルを読み取る際に、自身のローカルテーブルを読み取ります。`true`の場合、`spark.clickhouse.read.distributed.useClusterNodes`を無視します。                                                                                                                                                                                                                                                                | 0.1.0 |
| spark.clickhouse.read.fixedStringAs                | binary                                                 | ClickHouseのFixedString型を指定されたSparkデータ型として読み取ります。サポートされている型：binary、string                                                                                                                                                                                                                                                                                                              | 0.8.0 |
| spark.clickhouse.read.format                       | json                                                   | 読み取り用のシリアライズ形式。サポートされている形式：json、binary                                                                                                                                                                                                                                                                                                                                                   | 0.6.0 |
| spark.clickhouse.read.runtimeFilter.enabled        | false                                                  | 読み取り用のランタイムフィルタを有効にします。                                                                                                                                                                                                                                                                                                                                                                              | 0.8.0 |
| spark.clickhouse.read.splitByPartitionId           | true                                                   | `true`の場合、仮想カラム`_partition_id`によって入力パーティションフィルタを構築します。パーティション値によるSQL述語の組み立てには既知の問題があります。この機能にはClickHouse Server v21.6+が必要です。                                                                                                                                                                             | 0.4.0 |
| spark.clickhouse.useNullableQuerySchema            | false                                                  | `true`の場合、`CREATE/REPLACE TABLE ... AS SELECT ...`を実行する際にクエリスキーマのフィールドをすべてnullableとしてマークします。この設定はSPARK-43390（Spark 3.5で利用可能）が必要です。このパッチがない場合は、常に`true`として動作します。                                                                                                                                                  | 0.8.0 |
| spark.clickhouse.write.batchSize                   | 10000                                                  | ClickHouseに書き込む際のバッチごとのレコード数。                                                                                                                                                                                                                                                                                                                                                       | 0.1.0 |
| spark.clickhouse.write.compression.codec           | lz4                                                    | 書き込み用のデータを圧縮するために使用されるコーデック。サポートされているコーデック：none、lz4。                                                                                                                                                                                                                                                                                                                                       | 0.3.0 |
| spark.clickhouse.write.distributed.convertLocal    | false                                                  | 分散テーブルに書き込む際に、自身のローカルテーブルに書き込みます。`true`の場合、`spark.clickhouse.write.distributed.useClusterNodes`を無視します。                                                                                                                                                                                                                                                                    | 0.1.0 |
| spark.clickhouse.write.distributed.useClusterNodes | true                                                   | 分散テーブルに書き込む際、クラスターのすべてのノードに書き込みます。                                                                                                                                                                                                                                                                                                                                                   | 0.1.0 |
| spark.clickhouse.write.format                      | arrow                                                  | 書き込み用のシリアライズ形式。サポートされている形式：json、arrow                                                                                                                                                                                                                                                                                                                                                    | 0.4.0 |
| spark.clickhouse.write.localSortByKey              | true                                                   | `true`の場合、書き込む前にソートキーでローカルソートを行います。                                                                                                                                                                                                                                                                                                                                                           | 0.3.0 |
| spark.clickhouse.write.localSortByPartition        | spark.clickhouse.write.repartitionByPartitionの値      | `true`の場合、書き込む前にパーティションでローカルソートを行います。設定されていない場合、これは`spark.clickhouse.write.repartitionByPartition`と等しくなります。                                                                                                                                                                                                                                                                                 | 0.3.0 |
| spark.clickhouse.write.maxRetry                    | 3                                                      | 再試行可能なコードで失敗した単一バッチ書き込みの最大再試行回数。                                                                                                                                                                                                                                                                                                                 | 0.1.0 |
| spark.clickhouse.write.repartitionByPartition      | true                                                   | 書き込み前にClickHouseのパーティションキーによってデータを再パーティションします。                                                                                                                                                                                                                                                                                          | 0.3.0 |
| spark.clickhouse.write.repartitionNum              | 0                                                      | 書き込む前にClickHouseテーブルの分布要件を満たすためにデータを再パーティションする必要があります。この設定を使用して再パーティショニング数を特定します。値が1未満の場合は要件なしを意味します。                                                                                                                                                                                                                             | 0.1.0 |
| spark.clickhouse.write.repartitionStrictly         | false                                                  | `true`の場合、Sparkは、書き込み時にデータソーステーブルに渡す前に、パーティション全体に受信レコードを厳密に分配します。そうでない場合、Sparkはクエリを高速化するために特定の最適化を適用する可能性がありますが、分配要件を破る可能性があります。注意：この設定はSPARK-37523（Spark 3.4で利用可能）を必要とし、このパッチがない場合は常に`true`として動作します。 | 0.3.0 |
| spark.clickhouse.write.retryInterval               | 10s                                                    | 書き込みリトライの間隔（秒単位）。                                                                                                                                                                                                                                                                                                                                                                    | 0.1.0 |
| spark.clickhouse.write.retryableErrorCodes         | 241                                                    | 書き込みが失敗した場合にClickHouseサーバーから返されるリトライ可能なエラーコード。                                                                                                                                                                                                                                                                                                                                     | 0.1.0 |

## サポートされているデータ型 {#supported-data-types}

このセクションでは、SparkとClickHouse間のデータ型のマッピングを示します。以下の表は、ClickHouseからSparkへデータを読み込む際およびSparkからClickHouseにデータを挿入する際のデータ型変換のクイックリファレンスを提供します。

### ClickHouseからSparkへのデータの読み込み {#reading-data-from-clickhouse-into-spark}

| ClickHouseデータ型                                              | Sparkデータ型                | サポート | プリミティブ | メモ                                              |
|-------------------------------------------------------------------|--------------------------------|-----------|--------------|----------------------------------------------------|
| `Nothing`                                                         | `NullType`                     | ✅         | はい          |                                                    |
| `Bool`                                                            | `BooleanType`                  | ✅         | はい          |                                                    |
| `UInt8`, `Int16`                                                  | `ShortType`                    | ✅         | はい          |                                                    |
| `Int8`                                                            | `ByteType`                     | ✅         | はい          |                                                    |
| `UInt16`,`Int32`                                                  | `IntegerType`                  | ✅         | はい          |                                                    |
| `UInt32`,`Int64`, `UInt64`                                        | `LongType`                     | ✅         | はい          |                                                    |
| `Int128`,`UInt128`, `Int256`, `UInt256`                           | `DecimalType(38, 0)`           | ✅         | はい          |                                                    |
| `Float32`                                                         | `FloatType`                    | ✅         | はい          |                                                    |
| `Float64`                                                         | `DoubleType`                   | ✅         | はい          |                                                    |
| `String`, `JSON`, `UUID`, `Enum8`, `Enum16`, `IPv4`, `IPv6`       | `StringType`                   | ✅         | はい          |                                                    |
| `FixedString`                                                     | `BinaryType`, `StringType`     | ✅         | はい          | 設定 `READ_FIXED_STRING_AS` によって制御される   |
| `Decimal`                                                         | `DecimalType`                  | ✅         | はい          | 精度とスケールは `Decimal128` まで            |
| `Decimal32`                                                       | `DecimalType(9, scale)`        | ✅         | はい          |                                                    |
| `Decimal64`                                                       | `DecimalType(18, scale)`       | ✅         | はい          |                                                    |
| `Decimal128`                                                      | `DecimalType(38, scale)`       | ✅         | はい          |                                                    |
| `Date`, `Date32`                                                  | `DateType`                     | ✅         | はい          |                                                    |
| `DateTime`, `DateTime32`, `DateTime64`                            | `TimestampType`                | ✅         | はい          |                                                    |
| `Array`                                                           | `ArrayType`                    | ✅         | いいえ       | 配列要素型も変換される                       |
| `Map`                                                             | `MapType`                      | ✅         | いいえ       | キーは `StringType` に制限される                |
| `IntervalYear`                                                    | `YearMonthIntervalType(Year)`  | ✅         | はい          |                                                    |
| `IntervalMonth`                                                   | `YearMonthIntervalType(Month)` | ✅         | はい          |                                                    |
| `IntervalDay`, `IntervalHour`, `IntervalMinute`, `IntervalSecond` | `DayTimeIntervalType`          | ✅         | いいえ       | 特定のインターバル型が使用される               |
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

### SparkからClickHouseへのデータの挿入 {#inserting-data-from-spark-into-clickhouse}

| Sparkデータ型                     | ClickHouseデータ型 | サポート | プリミティブ | メモ                                  |
|-------------------------------------|----------------------|-----------|--------------|----------------------------------------|
| `BooleanType`                       | `UInt8`              | ✅         | はい          |                                        |
| `ByteType`                          | `Int8`               | ✅         | はい          |                                        |
| `ShortType`                         | `Int16`              | ✅         | はい          |                                        |
| `IntegerType`                       | `Int32`              | ✅         | はい          |                                        |
| `LongType`                          | `Int64`              | ✅         | はい          |                                        |
| `FloatType`                         | `Float32`            | ✅         | はい          |                                        |
| `DoubleType`                        | `Float64`            | ✅         | はい          |                                        |
| `StringType`                        | `String`             | ✅         | はい          |                                        |
| `VarcharType`                       | `String`             | ✅         | はい          |                                        |
| `CharType`                          | `String`             | ✅         | はい          |                                        |
| `DecimalType`                       | `Decimal(p, s)`      | ✅         | はい          | 精度とスケールは `Decimal128` まで         |
| `DateType`                          | `Date`               | ✅         | はい          |                                        |
| `TimestampType`                     | `DateTime`           | ✅         | はい          |                                        |
| `ArrayType` (リスト、タプル、または配列) | `Array`              | ✅         | いいえ       | 配列要素型も変換される                   |
| `MapType`                           | `Map`                | ✅         | いいえ       | キーは `StringType` に制限される         |
| `Object`                            |                      | ❌         |              |                                        |
| `Nested`                            |                      | ❌         |              |                                        |

## 貢献とサポート {#contributing-and-support}

プロジェクトに貢献したり、問題を報告したりしたい場合は、あなたのフィードバックを歓迎します！
[GitHubリポジトリ](https://github.com/ClickHouse/spark-clickhouse-connector)にアクセスして、問題を開いたり、改善を提案したり、プルリクエストを提出したりしてください。
貢献は大歓迎です！開始する前にリポジトリの貢献ガイドラインを確認してください。
ClickHouse Sparkコネクタの改善に協力していただきありがとうございます！
