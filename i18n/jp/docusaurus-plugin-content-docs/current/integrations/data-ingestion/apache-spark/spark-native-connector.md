---
'sidebar_label': 'Spark ネイティブコネクタ'
'sidebar_position': 2
'slug': '/integrations/apache-spark/spark-native-connector'
'description': 'ClickHouseを使用したApache Sparkの紹介'
'keywords':
- 'clickhouse'
- 'Apache Spark'
- 'migrating'
- 'data'
'title': 'Spark コネクタ'
'doc_type': 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';



# Sparkコネクタ

このコネクタは、クエリのパフォーマンスとデータ処理を改善するために、高度なパーティショニングや述語プッシュダウンなどのClickHouse特有の最適化を利用しています。コネクタは[ClickHouseの公式JDBCコネクタ](https://github.com/ClickHouse/clickhouse-java)に基づいており、自身のカタログを管理します。

Spark 3.0より前は、Sparkにはビルトインのカタログ概念が欠けていたため、ユーザーは通常、Hive MetastoreやAWS Glueなどの外部カタログシステムに依存していました。これらの外部ソリューションでは、ユーザーはSparkでアクセスする前にデータソーステーブルを手動で登録する必要がありました。しかし、Spark 3.0でカタログの概念が導入されてから、Sparkはカタログプラグインを登録することでテーブルを自動的に検出できるようになりました。

Sparkのデフォルトカタログは`spark_catalog`で、テーブルは`{catalog name}.{database}.{table}`で特定されます。この新しいカタログ機能により、単一のSparkアプリケーション内で複数のカタログを追加して操作することが可能になりました。

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
| 0.4.0   | Spark 3.2, 3.3            | 依存しない               |
| 0.3.0   | Spark 3.2, 3.3            | 依存しない               |
| 0.2.1   | Spark 3.2                 | 依存しない               |
| 0.1.2   | Spark 3.2                 | 依存しない               |
## インストールとセットアップ {#installation--setup}

ClickHouseとSparkを統合するためには、異なるプロジェクトセットアップに応じた複数のインストールオプションがあります。ClickHouse Sparkコネクタをプロジェクトのビルドファイル（例えば、Mavenの場合は`pom.xml`やSBTの場合は`build.sbt`）に直接依存関係として追加することができます。あるいは、必要なJARファイルを`$SPARK_HOME/jars/`フォルダに置くか、`spark-submit`コマンドで`--jars`フラグを使用して直接渡すことができます。どちらのアプローチでも、ClickHouseコネクタがSpark環境で利用可能になります。
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

SNAPSHOTバージョンを使用したい場合は、以下のリポジトリを追加してください：

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

Sparkのシェルオプション（Spark SQL CLI、Spark Shell CLI、及びSpark Submitコマンド）で作業する場合、必要なJARを渡すことで依存関係を登録できます：

```text
$SPARK_HOME/bin/spark-sql \
  --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
```

JARファイルをSparkクライアントノードにコピーしないようにしたい場合は、代わりに以下を使用できます：

```text
--repositories https://{maven-central-mirror or private-nexus-repo} \
--packages com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }},com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}
```

注意: SQL専用の使用ケースについては、[Apache Kyuubi](https://github.com/apache/kyuubi)が本番環境での使用を推奨されています。

</TabItem>
</Tabs>
### ライブラリのダウンロード {#download-the-library}

バイナリJARの名前パターンは次の通りです：

```bash
clickhouse-spark-runtime-${spark_binary_version}_${scala_binary_version}-${version}.jar
```

利用可能なリリース済みJARファイルは、[Maven Central Repository](https://repo1.maven.org/maven2/com/clickhouse/spark/)で見つけることができ、すべてのデイリービルドのSNAPSHOT JARファイルは、[Sonatype OSS Snapshots Repository](https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/)で見つけることができます。

:::important
[clickhouse-jdbc JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)を「all」クラスファイア付きで含めることが重要です。このコネクタは、[clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)および[clickhouse-client](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client) に依存しており、これらはすべてclickhouse-jdbc:allにバンドルされています。フルJDBCパッケージを使用したくない場合は、[clickhouse-client JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)および[clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)を個別に追加することもできます。

いずれにせよ、パッケージのバージョンが[互換性マトリックス](#compatibility-matrix)に従って互換性があることを確認してください。
:::
## カタログの登録（必要） {#register-the-catalog-required}

ClickHouseテーブルにアクセスするには、次の設定で新しいSparkカタログを構成する必要があります。

| プロパティ                                   | 値                                      | デフォルト値      | 必須   |
|----------------------------------------------|----------------------------------------|------------------|--------|
| `spark.sql.catalog.<catalog_name>`           | `com.clickhouse.spark.ClickHouseCatalog` | N/A              | はい   |
| `spark.sql.catalog.<catalog_name>.host`      | `<clickhouse_host>`                    | `localhost`      | いいえ |
| `spark.sql.catalog.<catalog_name>.protocol`  | `http`                                 | `http`           | いいえ |
| `spark.sql.catalog.<catalog_name>.http_port` | `<clickhouse_port>`                    | `8123`           | いいえ |
| `spark.sql.catalog.<catalog_name>.user`      | `<clickhouse_username>`                | `default`        | いいえ |
| `spark.sql.catalog.<catalog_name>.password`  | `<clickhouse_password>`                | (空の文字列)     | いいえ |
| `spark.sql.catalog.<catalog_name>.database`  | `<database>`                           | `default`        | いいえ |
| `spark.<catalog_name>.write.format`          | `json`                                 | `arrow`          | いいえ |

これらの設定は、以下のいずれかを通じて設定できます：

* `spark-defaults.conf`を編集/作成する。
* `spark-submit`コマンド（または`spark-shell`/`spark-sql` CLIコマンド）に設定を渡す。
* コンテキストを開始する際に設定を追加する。

:::important
ClickHouseクラスターで作業する場合は、それぞれのインスタンスに対してユニークなカタログ名を設定する必要があります。例えば：

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

そのことで、Spark SQLを使ってclickhouse1テーブル`<ck_db>.<ck_table>`には`clickhouse1.<ck_db>.<ck_table>`でアクセスでき、clickhouse2テーブル`<ck_db>.<ck_table>`には`clickhouse2.<ck_db>.<ck_table>`でアクセスできるようになります。

:::
## ClickHouse Cloud設定 {#clickhouse-cloud-settings}

[ClickHouse Cloud](https://clickhouse.com)に接続する場合は、SSLを有効にし、適切なSSLモードを設定してください。例えば：

```text
spark.sql.catalog.clickhouse.option.ssl        true
spark.sql.catalog.clickhouse.option.ssl_mode   NONE
```
## データの読み取り {#read-data}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
public static void main(String[] args) {
        // Create a Spark session
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

       // Create a Spark session
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

       // Define the schema for the DataFrame
       StructType schema = new StructType(new StructField[]{
               DataTypes.createStructField("id", DataTypes.IntegerType, false),
               DataTypes.createStructField("name", DataTypes.StringType, false),
       });

       List<Row> data = Arrays.asList(
               RowFactory.create(1, "Alice"),
               RowFactory.create(2, "Bob")
       );

       // Create a DataFrame
       Dataset<Row> df = spark.createDataFrame(data, schema);

       df.writeTo("clickhouse.default.example_table").append();

       spark.stop();
   }
```

</TabItem>
<TabItem value="Scala" label="Scala">

```java
object NativeSparkWrite extends App {
  // Create a Spark session
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

  // Define the schema for the DataFrame
  val rows = Seq(Row(1, "John"), Row(2, "Doe"))

  val schema = List(
    StructField("id", DataTypes.IntegerType, nullable = false),
    StructField("name", StringType, nullable = true)
  )
  // Create the df
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


# Feel free to use any other packages combination satesfying the compatibility matrix provided above.
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


# Create DataFrame
data = [Row(id=11, name="John"), Row(id=12, name="Doe")]
df = spark.createDataFrame(data)


# Write DataFrame to ClickHouse
df.writeTo("clickhouse.default.example_table").append()

```

</TabItem>
<TabItem value="SparkSQL" label="Spark SQL">

```sql
 -- resultTable is the Spark intermediate df we want to insert into clickhouse.default.example_table
INSERT INTO TABLE clickhouse.default.example_table
             SELECT * FROM resultTable;

```

</TabItem>
</Tabs>
## DDL操作 {#ddl-operations}

Spark SQLを使用してClickHouseインスタンスでDDL操作を実行でき、すべての変更はClickHouseに即座に永続化されます。Spark SQLは、ClickHouseで行うのと同じようにクエリを書くことを可能にし、CREATE TABLE、TRUNCATEなどのコマンドを修正なしで直接実行できます。例えば：

:::note
Spark SQLを使用する場合、一度に実行できるステートメントは1つだけです。
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

上記の例は、アプリケーション内で任意のAPI—Java、Scala、PySpark、またはシェルを使用して実行できるSpark SQLクエリを示しています。
## 設定 {#configurations}

コネクタ内で調整可能な設定は以下の通りです：

<br/>

| キー                                              | デフォルト                                        | 説明                                                                                                                                                                                                                                                                           | 以降 |
|----------------------------------------------------|---------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------|
| spark.clickhouse.ignoreUnsupportedTransform        | false                                             | ClickHouseは、`cityHash64(col_1, col_2)`のような複雑な式をシャーディングキーやパーティション値として使用することをサポートしていますが、これは現在Sparkでサポートされていません。`true`の場合、サポートされていない式を無視し、そうでない場合は例外で失敗します。`spark.clickhouse.write.distributed.convertLocal`が有効な場合、サポートされていないシャーディングキーを無視することはデータを破損させる可能性があります。                            | 0.4.0 |
| spark.clickhouse.read.compression.codec            | lz4                                               | 読み取り用のデータを解凍するために使用されるコーデック。サポートされているコーデック：none、lz4。                                                                                                                                                                                 | 0.5.0 |
| spark.clickhouse.read.distributed.convertLocal     | true                                              | 分散テーブルを読み取る際に、自身ではなくローカルテーブルを読み取り結果に用います。`true`の場合は`spark.clickhouse.read.distributed.useClusterNodes`を無視します。                                                                                                                                             | 0.1.0 |
| spark.clickhouse.read.fixedStringAs                | binary                                            | ClickHouse FixedString型を指定されたSparkデータ型として読み取ります。サポートされているタイプ：binary、string                                                                                                                                                                            | 0.8.0 |
| spark.clickhouse.read.format                       | json                                              | 読み取り用のシリアライズ形式。サポートされている形式：json、binary                                                                                                                                                                                                            | 0.6.0 |
| spark.clickhouse.read.runtimeFilter.enabled        | false                                             | 読み取り用のランタイムフィルタを有効化します。                                                                                                                                                                                                                                     | 0.8.0 |
| spark.clickhouse.read.splitByPartitionId           | true                                              | `true`の場合、仮想カラム`_partition_id`によって入力パーティションフィルタを構築します。パーティションの値でSQL述語を組み立てるにあたって既知の問題があります。この機能はClickHouse Server v21.6以上を必要とします。                                                                 | 0.4.0 |
| spark.clickhouse.useNullableQuerySchema            | false                                             | `true`の場合、テーブルを作成する際に`CREATE/REPLACE TABLE ... AS SELECT ...`を実行する際にクエリスキーマのすべてのフィールドをnullableとしてマークします。この設定はSPARK-43390（Spark 3.5で利用可能）が必要であり、このパッチなしでは常に`true`として動作します。                                               | 0.8.0 |
| spark.clickhouse.write.batchSize                   | 10000                                             | ClickHouseに書き込みの際のバッチごとのレコード数。                                                                                                                                                                                                                                | 0.1.0 |
| spark.clickhouse.write.compression.codec           | lz4                                               | 書き込み用のデータを圧縮するために使用されるコーデック。サポートされているコーデック：none、lz4。                                                                                                                                                                                | 0.3.0 |
| spark.clickhouse.write.distributed.convertLocal    | false                                             | 分散テーブルを書き込む際に、自身ではなくローカルテーブルを使用します。`true`の場合、`spark.clickhouse.write.distributed.useClusterNodes`を無視します。                                                                                                                                       | 0.1.0 |
| spark.clickhouse.write.distributed.useClusterNodes | true                                              | 分散テーブルを書き込む際はクラスタのすべてのノードに書き込みます。                                                                                                                                                                                                                     | 0.1.0 |
| spark.clickhouse.write.format                      | arrow                                             | 書き込み用のシリアライズ形式。サポートされている形式：json、arrow                                                                                                                                                                                                               | 0.4.0 |
| spark.clickhouse.write.localSortByKey              | true                                              | `true`の場合、書き込み前にソートキーによるローカルソートを行います。                                                                                                                                                                                                                 | 0.3.0 |
| spark.clickhouse.write.localSortByPartition        | spark.clickhouse.write.repartitionByPartitionの値 | `true`の場合、書き込み前にパーティションによるローカルソートを行います。設定されていない場合、`spark.clickhouse.write.repartitionByPartition`に等しくなります。                                                                                                                                 | 0.3.0 |
| spark.clickhouse.write.maxRetry                    | 3                                                 | 再試行可能なコードで失敗した単一バッチ書き込みの最大再試行回数。                                                                                                                                                                                                                         | 0.1.0 |
| spark.clickhouse.write.repartitionByPartition      | true                                              | 書き込み前にClickHouseのパーティションキーによってデータを再パーティション化するかどうかを判断します。                                                                                                                                                                                | 0.3.0 |
| spark.clickhouse.write.repartitionNum              | 0                                                 | 書き込み前にClickHouseテーブルの分布に合うようにデータを再パーティション化する必要がある場合、この設定で再パーティション番号を指定します。値が1未満の場合は必要ありません。                                                                                                                                  | 0.1.0 |
| spark.clickhouse.write.repartitionStrictly         | false                                             | `true`の場合、Sparkは入ったレコードをパーティションに厳密に分配して、書き込み時にデータソーステーブルに渡します。そうでない場合、Sparkはクエリのスピードを上げるための特定の最適化を適用しますが、分配要件を破る可能性があります。この設定はSPARK-37523（Spark 3.4で利用可能）が必要であり、このパッチなしでは常に`true`として動作します。 | 0.3.0 |
| spark.clickhouse.write.retryInterval               | 10s                                               | 書き込み再試行の間隔（秒）。                                                                                                                                                                                                                                                        | 0.1.0 |
| spark.clickhouse.write.retryableErrorCodes         | 241                                              | 書き込みが失敗したときにClickHouseサーバーから返される再試行可能エラーコード。                                                                                                                                                                                                              | 0.1.0 |
## サポートされるデータタイプ {#supported-data-types}

このセクションでは、SparkとClickHouseとの間のデータ型のマッピングを概説します。以下の表は、ClickHouseからSparkに読み取るとき、またはSparkからClickHouseにデータを挿入する際のデータ型の変換のクイックリファレンスを提供します。
### ClickHouseからSparkへのデータの読み取り {#reading-data-from-clickhouse-into-spark}

| ClickHouseデータタイプ                                           | Sparkデータタイプ                | サポート | プリミティブ | ノート                                    |
|-------------------------------------------------------------------|--------------------------------|---------|--------------|------------------------------------------|
| `Nothing`                                                         | `NullType`                     | ✅       | はい          |                                          |
| `Bool`                                                            | `BooleanType`                  | ✅       | はい          |                                          |
| `UInt8`, `Int16`                                                  | `ShortType`                    | ✅       | はい          |                                          |
| `Int8`                                                            | `ByteType`                     | ✅       | はい          |                                          |
| `UInt16`,`Int32`                                                  | `IntegerType`                  | ✅       | はい          |                                          |
| `UInt32`,`Int64`, `UInt64`                                        | `LongType`                     | ✅       | はい          |                                          |
| `Int128`,`UInt128`, `Int256`, `UInt256`                           | `DecimalType(38, 0)`           | ✅       | はい          |                                          |
| `Float32`                                                         | `FloatType`                    | ✅       | はい          |                                          |
| `Float64`                                                         | `DoubleType`                   | ✅       | はい          |                                          |
| `String`, `JSON`, `UUID`, `Enum8`, `Enum16`, `IPv4`, `IPv6`       | `StringType`                   | ✅       | はい          |                                          |
| `FixedString`                                                     | `BinaryType`, `StringType`     | ✅       | はい          | 設定`READ_FIXED_STRING_AS`により制御されます |
| `Decimal`                                                         | `DecimalType`                  | ✅       | はい          | 精度とスケールは`Decimal128`まで          |
| `Decimal32`                                                       | `DecimalType(9, scale)`        | ✅       | はい          |                                          |
| `Decimal64`                                                       | `DecimalType(18, scale)`       | ✅       | はい          |                                          |
| `Decimal128`                                                      | `DecimalType(38, scale)`       | ✅       | はい          |                                          |
| `Date`, `Date32`                                                  | `DateType`                     | ✅       | はい          |                                          |
| `DateTime`, `DateTime32`, `DateTime64`                            | `TimestampType`                | ✅       | はい          |                                          |
| `Array`                                                           | `ArrayType`                    | ✅       | いいえ       | 配列要素の型も変換されます                |
| `Map`                                                             | `MapType`                      | ✅       | いいえ       | キーは`StringType`に制限されます          |
| `IntervalYear`                                                    | `YearMonthIntervalType(Year)`  | ✅       | はい          |                                          |
| `IntervalMonth`                                                   | `YearMonthIntervalType(Month)` | ✅       | はい          |                                          |
| `IntervalDay`, `IntervalHour`, `IntervalMinute`, `IntervalSecond` | `DayTimeIntervalType`          | ✅       | いいえ       | 特定の間隔型が使用されます                |
| `Object`                                                          |                                | ❌       |              |                                          |
| `Nested`                                                          |                                | ❌       |              |                                          |
| `Tuple`                                                           |                                | ❌       |              |                                          |
| `Point`                                                           |                                | ❌       |              |                                          |
| `Polygon`                                                         |                                | ❌       |              |                                          |
| `MultiPolygon`                                                    |                                | ❌       |              |                                          |
| `Ring`                                                            |                                | ❌       |              |                                          |
| `IntervalQuarter`                                                 |                                | ❌       |              |                                          |
| `IntervalWeek`                                                    |                                | ❌       |              |                                          |
| `Decimal256`                                                      |                                | ❌       |              |                                          |
| `AggregateFunction`                                               |                                | ❌       |              |                                          |
| `SimpleAggregateFunction`                                         |                                | ❌       |              |                                          |
### SparkからClickHouseへのデータの挿入 {#inserting-data-from-spark-into-clickhouse}

| Sparkデータタイプ                     | ClickHouseデータタイプ | サポート | プリミティブ | ノート                                |
|-------------------------------------|----------------------|-----------|--------------|--------------------------------------|
| `BooleanType`                       | `UInt8`              | ✅       | はい          |                                      |
| `ByteType`                          | `Int8`               | ✅       | はい          |                                      |
| `ShortType`                         | `Int16`              | ✅       | はい          |                                      |
| `IntegerType`                       | `Int32`              | ✅       | はい          |                                      |
| `LongType`                          | `Int64`              | ✅       | はい          |                                      |
| `FloatType`                         | `Float32`            | ✅       | はい          |                                      |
| `DoubleType`                        | `Float64`            | ✅       | はい          |                                      |
| `StringType`                        | `String`             | ✅       | はい          |                                      |
| `VarcharType`                       | `String`             | ✅       | はい          |                                      |
| `CharType`                          | `String`             | ✅       | はい          |                                      |
| `DecimalType`                       | `Decimal(p, s)`      | ✅       | はい          | 精度とスケールは`Decimal128`まで    |
| `DateType`                          | `Date`               | ✅       | はい          |                                      |
| `TimestampType`                     | `DateTime`           | ✅       | はい          |                                      |
| `ArrayType` (リスト、タプル、または配列) | `Array`              | ✅       | いいえ       | 配列要素の型も変換されます            |
| `MapType`                           | `Map`                | ✅       | いいえ       | キーは`StringType`に制限されます      |
| `Object`                            |                      | ❌       |              |                                      |
| `Nested`                            |                      | ❌       |              |                                      |

## Contributing and support {#contributing-and-support}

プロジェクトに貢献したり、問題を報告したりしたい場合は、あなたの意見を歓迎します！
問題を報告したり、改善を提案したり、プルリクエストを送信するには、私たちの [GitHub リポジトリ](https://github.com/ClickHouse/spark-clickhouse-connector) を訪れてください。
貢献をお待ちしています！始める前に、リポジトリ内の貢献ガイドラインを確認してください。
私たちの ClickHouse Spark コネクタの改善にご協力いただきありがとうございます！
