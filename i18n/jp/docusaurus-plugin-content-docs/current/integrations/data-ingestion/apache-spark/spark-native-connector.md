---
sidebar_label: 'Spark ネイティブコネクタ'
sidebar_position: 2
slug: /integrations/apache-spark/spark-native-connector
description: 'ClickHouse と連携する Apache Spark の概要'
keywords: ['clickhouse', 'Apache Spark', '移行', 'データ']
title: 'Spark コネクタ'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';


# Spark コネクタ {#spark-connector}

このコネクタは、高度なパーティション分割や述語プッシュダウンなど、ClickHouse 固有の最適化を活用して、
クエリパフォーマンスとデータ処理を向上させます。
このコネクタは [ClickHouse の公式 JDBC コネクタ](https://github.com/ClickHouse/clickhouse-java) をベースとしており、
独自のカタログを管理します。

Spark 3.0 以前は、Spark に組み込みのカタログという概念がなかったため、ユーザーは通常、
Hive Metastore や AWS Glue などの外部カタログシステムに依存していました。
これらの外部ソリューションでは、Spark でテーブルにアクセスする前に、ユーザーがデータソーステーブルを手動で登録する必要がありました。
しかし Spark 3.0 以降、カタログの概念が導入されたことで、Spark はカタログプラグインを登録することでテーブルを自動的に検出できるようになりました。

Spark のデフォルトのカタログは `spark_catalog` であり、テーブルは `{catalog name}.{database}.{table}` という形式で識別されます。
新しいカタログ機能により、1 つの Spark アプリケーション内で複数のカタログを追加して利用できるようになりました。

<TOCInline toc={toc}></TOCInline>



## 要件 {#requirements}

- Java 8 または 17
- Scala 2.12 または 2.13
- Apache Spark 3.3、3.4、または 3.5



## 互換性マトリクス {#compatibility-matrix}

| バージョン | 対応する Spark バージョン | ClickHouse JDBC バージョン |
|-----------|---------------------------|----------------------------|
| main      | Spark 3.3, 3.4, 3.5       | 0.6.3                      |
| 0.8.1     | Spark 3.3, 3.4, 3.5       | 0.6.3                      |
| 0.8.0     | Spark 3.3, 3.4, 3.5       | 0.6.3                      |
| 0.7.3     | Spark 3.3, 3.4            | 0.4.6                      |
| 0.6.0     | Spark 3.3                 | 0.3.2-patch11              |
| 0.5.0     | Spark 3.2, 3.3            | 0.3.2-patch11              |
| 0.4.0     | Spark 3.2, 3.3            | 依存なし                   |
| 0.3.0     | Spark 3.2, 3.3            | 依存なし                   |
| 0.2.1     | Spark 3.2                 | 依存なし                   |
| 0.1.2     | Spark 3.2                 | 依存なし                   |



## インストール &amp; セットアップ {#installation--setup}

Spark と ClickHouse を連携するためのインストール方法には、プロジェクト構成に応じていくつかの選択肢があります。
`pom.xml`（Maven の場合）や `build.sbt`（SBT の場合）など、プロジェクトのビルドファイルに ClickHouse Spark connector を依存関係として直接追加できます。
または、必要な JAR ファイルを `$SPARK_HOME/jars/` フォルダに配置するか、`spark-submit` コマンドで `--jars` フラグを使用して Spark のオプションとして直接指定することもできます。
いずれの方法でも、Spark 環境で ClickHouse connector を利用可能にできます。

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

    SNAPSHOT バージョンを使用する場合は、次のリポジトリを追加してください。

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

    SNAPSHOT バージョンを使用する場合は、次のリポジトリを追加してください:

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
    Spark のシェルオプション（Spark SQL CLI、Spark Shell CLI、Spark Submit コマンド）を使用する場合、必要な JAR を指定して依存関係を登録できます。

    ```text
    $SPARK_HOME/bin/spark-sql \
      --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
    ```

    Spark クライアントノードに JAR ファイルをコピーしたくない場合は、代わりに次のように指定できます。

    ```text
      --repositories https://{maven-central-mirror or private-nexus-repo} \
      --packages com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }},com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}
    ```

    注意: SQL のみのユースケースでは、本番環境向けには [Apache Kyuubi](https://github.com/apache/kyuubi) の利用を推奨します。
  </TabItem>
</Tabs>

### ライブラリのダウンロード {#download-the-library}

バイナリ JAR の名前のパターンは次のとおりです。

```bash
clickhouse-spark-runtime-${spark_binary_version}_${scala_binary_version}-${version}.jar
```

利用可能なリリース済みのすべての JAR ファイルは
[Maven Central Repository](https://repo1.maven.org/maven2/com/clickhouse/spark/) から入手でき、
日次ビルドのすべての SNAPSHOT JAR ファイルは [Sonatype OSS Snapshots Repository](https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/) から入手できます。


:::important
コネクタは [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)
および [clickhouse-client](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client) に依存しており、
これらはどちらも clickhouse-jdbc:all にバンドルされているため、
classifier が "all" の [clickhouse-jdbc JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)
を必ず含めてください。
代わりに、フルの JDBC パッケージを使用したくない場合は、
[clickhouse-client JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)
と [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client) を
個別に追加することもできます。

いずれの場合でも、[Compatibility Matrix](#compatibility-matrix) に従って
パッケージのバージョンに互換性があることを確認してください。
:::



## カタログを登録する（必須） {#register-the-catalog-required}

ClickHouse のテーブルにアクセスするには、次の設定を使用して新しい Spark カタログを設定する必要があります。

| Property                                     | Value                                    | Default Value  | Required |
| -------------------------------------------- | ---------------------------------------- | -------------- | -------- |
| `spark.sql.catalog.<catalog_name>`           | `com.clickhouse.spark.ClickHouseCatalog` | N/A            | Yes      |
| `spark.sql.catalog.<catalog_name>.host`      | `<clickhouse_host>`                      | `localhost`    | No       |
| `spark.sql.catalog.<catalog_name>.protocol`  | `http`                                   | `http`         | No       |
| `spark.sql.catalog.<catalog_name>.http_port` | `<clickhouse_port>`                      | `8123`         | No       |
| `spark.sql.catalog.<catalog_name>.user`      | `<clickhouse_username>`                  | `default`      | No       |
| `spark.sql.catalog.<catalog_name>.password`  | `<clickhouse_password>`                  | (empty string) | No       |
| `spark.sql.catalog.<catalog_name>.database`  | `<database>`                             | `default`      | No       |
| `spark.<catalog_name>.write.format`          | `json`                                   | `arrow`        | No       |

これらの設定は、次のいずれかの方法で指定できます。

* `spark-defaults.conf` を編集または新規作成する。
* 設定を `spark-submit` コマンド（または `spark-shell` / `spark-sql` の CLI コマンド）に渡す。
* コンテキストを初期化する際に設定を追加する。

:::important
ClickHouse クラスターを使用する場合は、各インスタンスごとに一意のカタログ名を設定する必要があります。
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

このようにすると、Spark SQL からは clickhouse1 のテーブル `<ck_db>.<ck_table>` には `clickhouse1.<ck_db>.<ck_table>` としてアクセスでき、clickhouse2 のテーブル `<ck_db>.<ck_table>` には `clickhouse2.<ck_db>.<ck_table>` としてアクセスできるようになります。

:::


## ClickHouse Cloud の設定 {#clickhouse-cloud-settings}

[ClickHouse Cloud](https://clickhouse.com) に接続する際は、SSL を有効にし、適切な SSL モードを設定してください。例えば、次のとおりです。

```text
spark.sql.catalog.clickhouse.option.ssl        true
spark.sql.catalog.clickhouse.option.ssl_mode   NONE
```


## データの読み込み {#read-data}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
public static void main(String[] args) {
        // Spark セッションを作成
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

```


# 上記の互換性マトリクスを満たす任意のパッケージ組み合わせを使用してかまいません。 {#feel-free-to-use-any-other-packages-combination-satesfying-the-compatibility-matrix-provided-above}
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



# DataFrame を作成 {#create-dataframe}
data = [Row(id=11, name="John"), Row(id=12, name="Doe")]
df = spark.createDataFrame(data)



# DataFrameをClickHouseに書き込む {#write-dataframe-to-clickhouse}

df.writeTo("clickhouse.default.example_table").append()

````

</TabItem>
<TabItem value="SparkSQL" label="Spark SQL">

```sql
    -- resultTableは、clickhouse.default.example_tableに挿入するSparkの中間dfです
   INSERT INTO TABLE clickhouse.default.example_table
                SELECT * FROM resultTable;

````

</TabItem>
</Tabs>


## DDL 操作 {#ddl-operations}

Spark SQL を使用して ClickHouse インスタンスに対して DDL 操作を実行でき、すべての変更は即座に
ClickHouse に永続化されます。
Spark SQL では、ClickHouse で実行するのとまったく同じようにクエリを記述できるため、
CREATE TABLE や TRUNCATE などのコマンドを、変更せずにそのまま直接実行できます。例えば次のとおりです。

:::note
Spark SQL を使用する場合、一度に実行できるステートメントは 1 つだけです。
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

上記の例は Spark SQL クエリを示しており、Java、Scala、PySpark、またはシェルなどのいずれの API を使用しても、アプリケーション内で実行できます。


## 設定 {#configurations}

以下は、このコネクタで調整可能な設定項目です。

<br/>



| キー                                                 | デフォルト                                            | 概要                                                                                                                                                                                                                                                                     | 以降    |
| -------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| spark.clickhouse.ignoreUnsupportedTransform        | false                                            | ClickHouse は、シャーディングキーやパーティション値として複雑な式（例: `cityHash64(col_1, col_2)`）を使用できますが、これらは現在 Spark ではサポートされていません。`true` の場合はサポートされていない式を無視し、それ以外の場合は例外をスローして即座にエラー終了します。なお、`spark.clickhouse.write.distributed.convertLocal` が有効な場合、サポートされていないシャーディングキーを無視するとデータが破損するおそれがあります。 | 0.4.0 |
| spark.clickhouse.read.compression.codec            | lz4                                              | 読み取り時にデータを解凍するために使用するコーデック。サポートされるコーデック: none, lz4。                                                                                                                                                                                                                    | 0.5.0 |
| spark.clickhouse.read.distributed.convertLocal     | true                                             | Distributed テーブルを読み込む際は、自身ではなくローカルテーブルを読み込みます。`true` の場合、`spark.clickhouse.read.distributed.useClusterNodes` は無視されます。                                                                                                                                                  | 0.1.0 |
| spark.clickhouse.read.fixedStringAs                | バイナリ                                             | ClickHouse の FixedString 型を指定した Spark データ型として読み取ります。サポートされる型：binary、string                                                                                                                                                                                             | 0.8.0 |
| spark.clickhouse.read.format                       | json                                             | 読み取り用のシリアライズ形式。サポートされる形式: JSON, Binary                                                                                                                                                                                                                                 | 0.6.0 |
| spark.clickhouse.read.runtimeFilter.enabled        | false                                            | 読み取り用のランタイムフィルターを有効化します。                                                                                                                                                                                                                                               | 0.8.0 |
| spark.clickhouse.read.splitByPartitionId           | true                                             | `true` の場合、パーティション値ではなく仮想カラム `_partition_id` を使って入力パーティションフィルタを構成します。パーティション値によって SQL の述語を組み立てる場合には、既知の問題があります。この機能には ClickHouse Server v21.6 以降が必要です。                                                                                                                 | 0.4.0 |
| spark.clickhouse.useNullableQuerySchema            | false                                            | `true` の場合、テーブル作成時に `CREATE/REPLACE TABLE ... AS SELECT ...` を実行すると、クエリスキーマ内のすべてのフィールドを nullable としてマークします。なお、この設定には SPARK-43390（Spark 3.5 で利用可能）が必要であり、このパッチがない場合は設定値に関係なく常に `true` として動作します。                                                                         | 0.8.0 |
| spark.clickhouse.write.batchSize                   | 10000                                            | ClickHouse への書き込み時に、1 バッチあたりに含めるレコード数。                                                                                                                                                                                                                                 | 0.1.0 |
| spark.clickhouse.write.compression.codec           | lz4                                              | 書き込み時にデータを圧縮するためのコーデック。サポートされているコーデックは none と lz4 です。                                                                                                                                                                                                                  | 0.3.0 |
| spark.clickhouse.write.distributed.convertLocal    | false                                            | Distributed テーブルに書き込む際は、自身ではなくローカルテーブルに書き込みます。`true` の場合、`spark.clickhouse.write.distributed.useClusterNodes` を無視します。                                                                                                                                                  | 0.1.0 |
| spark.clickhouse.write.distributed.useClusterNodes | true                                             | Distributed テーブルへの書き込み時に、クラスタ内のすべてのノードに書き込む。                                                                                                                                                                                                                           | 0.1.0 |
| spark.clickhouse.write.format                      | 矢印                                               | 書き込み時のシリアル化形式。サポートされる形式: JSON、Arrow                                                                                                                                                                                                                                    | 0.4.0 |
| spark.clickhouse.write.localSortByKey              | true                                             | `true` の場合、書き込み前にソートキーに基づいてローカルでソートを行います。                                                                                                                                                                                                                              | 0.3.0 |
| spark.clickhouse.write.localSortByPartition        | spark.clickhouse.write.repartitionByPartition の値 | `true` の場合、書き込み前にローカルでパーティションごとにソートを行います。設定されていない場合は、`spark.clickhouse.write.repartitionByPartition` と同じ値になります。                                                                                                                                                        | 0.3.0 |
| spark.clickhouse.write.maxRetry                    | 3                                                | 再試行可能なエラーコードによって単一バッチ書き込みが失敗した場合に、その書き込みを再試行する最大回数。                                                                                                                                                                                                                    | 0.1.0 |
| spark.clickhouse.write.repartitionByPartition      | true                                             | 書き込み前に、ClickHouse テーブルのパーティション分布に合わせて ClickHouse のパーティションキーでデータを再パーティションするかどうか。                                                                                                                                                                                        | 0.3.0 |
| spark.clickhouse.write.repartitionNum              | 0                                                | 書き込み前に ClickHouse テーブルのディストリビューションに合うようデータを再パーティションする必要がある場合に、この設定で再パーティション数を指定します。値が 1 未満の場合は、再パーティションを要求しないことを意味します。                                                                                                                                                 | 0.1.0 |
| spark.clickhouse.write.repartitionStrictly         | false                                            | `true` の場合、Spark は書き込み時にデータソーステーブルへレコードを渡す前に、要求されるデータ分散を満たすよう、入力レコードを厳密にパーティション間へ分配します。`true` でない場合、Spark はクエリを高速化するために特定の最適化を適用することがありますが、その結果、分散要件が満たされないことがあります。なお、この設定は SPARK-37523（Spark 3.4 で利用可能）の適用が前提であり、このパッチがない場合は常に `true` として動作します。                       | 0.3.0 |
| spark.clickhouse.write.retryInterval               | 10秒                                              | 書き込み再試行間隔（秒）                                                                                                                                                                                                                                                           | 0.1.0 |
| spark.clickhouse.write.retryableErrorCodes         | 241                                              | 書き込み処理が失敗した際に ClickHouse サーバーから返される再試行可能なエラーコード。                                                                                                                                                                                                                       | 0.1.0 |





## サポートされるデータ型 {#supported-data-types}

このセクションでは、Spark と ClickHouse の間のデータ型のマッピングについて説明します。以下の表は、ClickHouse から Spark への読み込み時および Spark から ClickHouse への挿入時にデータ型を変換するためのクイックリファレンスを提供します。

### ClickHouse から Spark へのデータ読み込み {#reading-data-from-clickhouse-into-spark}

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
| `FixedString`                                                     | `BinaryType`, `StringType`     | ✅         | Yes          | 設定 `READ_FIXED_STRING_AS` によって制御されます |
| `Decimal`                                                         | `DecimalType`                  | ✅         | Yes          | `Decimal128` までの精度およびスケール             |
| `Decimal32`                                                       | `DecimalType(9, scale)`        | ✅         | Yes          |                                                    |
| `Decimal64`                                                       | `DecimalType(18, scale)`       | ✅         | Yes          |                                                    |
| `Decimal128`                                                      | `DecimalType(38, scale)`       | ✅         | Yes          |                                                    |
| `Date`, `Date32`                                                  | `DateType`                     | ✅         | Yes          |                                                    |
| `DateTime`, `DateTime32`, `DateTime64`                            | `TimestampType`                | ✅         | Yes          |                                                    |
| `Array`                                                           | `ArrayType`                    | ✅         | No           | 配列要素の型も変換されます                         |
| `Map`                                                             | `MapType`                      | ✅         | No           | キーは `StringType` に限定されます                |
| `IntervalYear`                                                    | `YearMonthIntervalType(Year)`  | ✅         | Yes          |                                                    |
| `IntervalMonth`                                                   | `YearMonthIntervalType(Month)` | ✅         | Yes          |                                                    |
| `IntervalDay`, `IntervalHour`, `IntervalMinute`, `IntervalSecond` | `DayTimeIntervalType`          | ✅         | No           | 対応する個別のインターバル型が使用されます       |
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

### Spark から ClickHouse へのデータ挿入 {#inserting-data-from-spark-into-clickhouse}



| Spark Data Type                     | ClickHouse Data Type | サポート有無 | プリミティブ型 | 備考                                      |
|-------------------------------------|----------------------|-------------|----------------|-------------------------------------------|
| `BooleanType`                       | `UInt8`              | ✅           | はい           |                                           |
| `ByteType`                          | `Int8`               | ✅           | はい           |                                           |
| `ShortType`                         | `Int16`              | ✅           | はい           |                                           |
| `IntegerType`                       | `Int32`              | ✅           | はい           |                                           |
| `LongType`                         | `Int64`              | ✅           | はい           |                                           |
| `FloatType`                         | `Float32`            | ✅           | はい           |                                           |
| `DoubleType`                        | `Float64`            | ✅           | はい           |                                           |
| `StringType`                        | `String`             | ✅           | はい           |                                           |
| `VarcharType`                       | `String`             | ✅           | はい           |                                           |
| `CharType`                          | `String`             | ✅           | はい           |                                           |
| `DecimalType`                       | `Decimal(p, s)`      | ✅           | はい           | 精度とスケールは `Decimal128` までサポート |
| `DateType`                          | `Date`               | ✅           | はい           |                                           |
| `TimestampType`                     | `DateTime`           | ✅           | はい           |                                           |
| `ArrayType` (list, tuple, or array) | `Array`              | ✅           | いいえ         | 配列要素の型も変換される                  |
| `MapType`                           | `Map`                | ✅           | いいえ         | キーは `StringType` のみ                  |
| `Object`                            |                      | ❌           |                |                                           |
| `Nested`                            |                      | ❌           |                |                                           |



## 貢献とサポート {#contributing-and-support}

プロジェクトへの貢献や問題の報告を希望される場合は、ぜひご協力ください。
[GitHub リポジトリ](https://github.com/ClickHouse/spark-clickhouse-connector) にアクセスし、Issue の作成、改善提案、
または Pull Request の送信を行ってください。
貢献はいつでも歓迎しています。作業を始める前に、リポジトリ内の貢献ガイドラインをご確認ください。
ClickHouse Spark コネクタの改善にご協力いただきありがとうございます。
