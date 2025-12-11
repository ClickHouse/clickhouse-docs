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

このコネクタは、高度なパーティショニングや述語プッシュダウンなど、ClickHouse 固有の最適化機能を活用して、
クエリのパフォーマンスとデータ処理を向上させます。
このコネクタは [ClickHouse の公式 JDBC コネクタ](https://github.com/ClickHouse/clickhouse-java) をベースとしており、
独自のカタログを管理します。

Spark 3.0 以前、Spark には組み込みのカタログという概念がなかったため、ユーザーは通常、
Hive Metastore や AWS Glue などの外部カタログシステムに依存していました。
これらの外部ソリューションでは、Spark でアクセスする前に、ユーザーはデータソーステーブルを手動で登録する必要がありました。
しかし、Spark 3.0 でカタログの概念が導入されて以来、Spark はカタログプラグインを登録することでテーブルを自動的に検出できるようになりました。

Spark のデフォルトのカタログは `spark_catalog` であり、テーブルは `{catalog name}.{database}.{table}` という形式で識別されます。
新しいカタログ機能により、1 つの Spark アプリケーション内で複数のカタログを追加して利用できるようになりました。

<TOCInline toc={toc}></TOCInline>

## 要件 {#requirements}

- Java 8 または 17（Spark 4.0 では Java 17 以上が必須）
- Scala 2.12 または 2.13（Spark 4.0 は Scala 2.13 のみをサポート）
- Apache Spark 3.3、3.4、3.5、または 4.0

## 互換性マトリックス {#compatibility-matrix}

| バージョン | 対応 Spark バージョン | ClickHouse JDBC バージョン |
|---------|-----------------------|---------------------------|
| main    | Spark 3.3, 3.4, 3.5, 4.0  | 0.9.4                   |
| 0.9.0   | Spark 3.3, 3.4, 3.5, 4.0  | 0.9.4                   |
| 0.8.1   | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.7.3   | Spark 3.3, 3.4            | 0.4.6                   |
| 0.6.0   | Spark 3.3                 | 0.3.2-patch11           |
| 0.5.0   | Spark 3.2, 3.3            | 0.3.2-patch11           |
| 0.4.0   | Spark 3.2, 3.3            | 依存なし                 |
| 0.3.0   | Spark 3.2, 3.3            | 依存なし                 |
| 0.2.1   | Spark 3.2                 | 依存なし                 |
| 0.1.2   | Spark 3.2                 | 依存なし                 |

## インストールとセットアップ {#installation--setup}

Spark と ClickHouse を統合するには、さまざまなプロジェクト構成に対応した複数のインストール方法が用意されています。
ClickHouse Spark コネクタを、プロジェクトのビルドファイル（Maven の `pom.xml` や SBT の `build.sbt` など）に
依存関係として直接追加できます。
あるいは、必要な JAR ファイルを `$SPARK_HOME/jars/` フォルダーに配置するか、`spark-submit` コマンドで
`--jars` フラグを使って Spark のオプションとして直接指定することもできます。
いずれの方法を用いても、Spark 環境で ClickHouse コネクタを利用できるようになります。

### 依存関係としてインポートする {#import-as-a-dependency}

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

SNAPSHOT バージョンを使用したい場合は、次のリポジトリを追加します。

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

SNAPSHOT バージョンを使用したい場合は、次のリポジトリを追加します。

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

Spark のシェルオプション（Spark SQL CLI、Spark Shell CLI、Spark Submit コマンド）を使用する場合、依存関係は
必要な JAR を引数として渡すことで解決できます。

```text
$SPARK_HOME/bin/spark-sql \
  --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
```

JAR ファイルを Spark クライアントノードにコピーしたくない場合は、代わりに次のように指定できます。

```text
  --repositories https://{maven-central-mirror or private-nexus-repo} \
  --packages com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }},com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}
```

注: SQL のみのユースケースの場合、本番環境では [Apache Kyuubi](https://github.com/apache/kyuubi) の使用を推奨します。

</TabItem>
</Tabs>

### ライブラリをダウンロードする {#download-the-library}

バイナリ JAR のファイル名パターンは次のとおりです。

```bash
clickhouse-spark-runtime-${spark_binary_version}_${scala_binary_version}-${version}.jar
```

利用可能なすべてのリリース済み JAR ファイルは
[Maven Central Repository](https://repo1.maven.org/maven2/com/clickhouse/spark/) から、
すべてのデイリービルド SNAPSHOT JAR ファイルは [Sonatype OSS Snapshots Repository](https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/) から入手できます。

:::important
コネクタは [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)
および [clickhouse-client](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client) に依存しており、
どちらも clickhouse-jdbc:all にバンドルされているため、
[classifier が &quot;all&quot; の clickhouse-jdbc JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc) を
必ず含める必要があります。
代わりに、完全な JDBC パッケージ一式を使用したくない場合は、
[clickhouse-client JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)
および [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client) を
個別に追加することもできます。

いずれの場合も、
[Compatibility Matrix](#compatibility-matrix) に従ってパッケージのバージョン互換性が取れていることを確認してください。
:::

## カタログを登録する（必須） {#register-the-catalog-required}

ClickHouse のテーブルへアクセスするには、以下の設定で新しい Spark カタログを構成する必要があります。

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

* `spark-defaults.conf` を編集または作成する。
* `spark-submit` コマンド（または `spark-shell` / `spark-sql` の CLI コマンド）に設定を渡す。
* コンテキストを初期化する際に設定を追加する。

:::important
ClickHouse クラスターで作業する場合は、各インスタンスごとに一意のカタログ名を設定する必要があります。
例えば、次のようにします。

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

このように設定すると、Spark SQL から `clickhouse1.<ck_db>.<ck_table>` を使用して clickhouse1 のテーブル `<ck_db>.<ck_table>` にアクセスでき、`clickhouse2.<ck_db>.<ck_table>` を使用して clickhouse2 のテーブル `<ck_db>.<ck_table>` にアクセスできるようになります。

:::

## ClickHouse Cloud の設定 {#clickhouse-cloud-settings}

[ClickHouse Cloud](https://clickhouse.com) に接続する際は、SSL を有効にし、適切な SSL モードを設定してください。例えば、次のように指定します。

```text
spark.sql.catalog.clickhouse.option.ssl        true
spark.sql.catalog.clickhouse.option.ssl_mode   NONE
```

## データの読み込み {#read-data}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
public static void main(String[] args) {
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

            // Sparkセッションを作成する
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

            // DataFrameのスキーマを定義する
            StructType schema = new StructType(new StructField[]{
                    DataTypes.createStructField("id", DataTypes.IntegerType, false),
                    DataTypes.createStructField("name", DataTypes.StringType, false),
            });

            List<Row> data = Arrays.asList(
                    RowFactory.create(1, "Alice"),
                    RowFactory.create(2, "Bob")
            );

            // DataFrameを作成する
            Dataset<Row> df = spark.createDataFrame(data, schema);

            df.writeTo("clickhouse.default.example_table").append();

            spark.stop();
        }
    ```
  </TabItem>

  <TabItem value="Scala" label="Scala">
    ```java
    object NativeSparkWrite extends App {
      // Sparkセッションを作成する
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

      // DataFrameのスキーマを定義する
      val rows = Seq(Row(1, "John"), Row(2, "Doe"))

      val schema = List(
        StructField("id", DataTypes.IntegerType, nullable = false),
        StructField("name", StringType, nullable = true)
      )
      // dfを作成する
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

    # 上記の互換性マトリックスを満たす任意のパッケージの組み合わせを使用できます。
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
        -- resultTable は clickhouse.default.example_table に挿入したい Spark の中間データフレームです
       INSERT INTO TABLE clickhouse.default.example_table
                    SELECT * FROM resultTable;
                    
    ```
  </TabItem>
</Tabs>

## DDL 操作 {#ddl-operations}

Spark SQL を使用して ClickHouse インスタンスに対して DDL 操作を実行でき、そこで行ったすべての変更は即座に
ClickHouse に永続化されます。
Spark SQL では ClickHouse とまったく同じようにクエリを記述できるため、
たとえば CREATE TABLE や TRUNCATE などのコマンドを変更することなく、そのまま直接実行できます。

:::note
Spark SQL を使用する場合、一度に実行できるステートメントは 1 つだけです。
:::

```sql
USE clickhouse; 
```

```sql

CREATE TABLE test_db.tbl_sql (
  create_time TIMESTAMP NOT NULL,
  m           INT       NOT NULL COMMENT 'パーティションキー',
  id          BIGINT    NOT NULL COMMENT 'ソートキー',
  value       STRING
) USING ClickHouse
PARTITIONED BY (m)
TBLPROPERTIES (
  engine = 'MergeTree()',
  order_by = 'id',
  settings.index_granularity = 8192
);
```

上記の例は Spark SQL クエリを示しており、Java や Scala、PySpark、シェルなどの任意の API からアプリケーション内で実行できます。

## 設定 {#configurations}

コネクタで変更可能な設定項目は次のとおりです。

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

## サポートされているデータ型 {#supported-data-types}

このセクションでは、Spark と ClickHouse 間のデータ型マッピングについて説明します。以下の表は、ClickHouse から Spark へデータを読み込む場合、および Spark から ClickHouse へデータを挿入する場合のデータ型変換に関するクイックリファレンスです。

### ClickHouse から Spark へのデータの読み取り {#reading-data-from-clickhouse-into-spark}

| ClickHouse データ型                                              | Spark データ型                 | サポート状況 | プリミティブ型 | 備考                                               |
|-------------------------------------------------------------------|--------------------------------|-----------|--------------|----------------------------------------------------|
| `Nothing`                                                         | `NullType`                     | ✅         | はい          |                                                    |
| `Bool`                                                            | `BooleanType`                  | ✅         | はい          |                           |
| `UInt8`, `Int16`                                                  | `ShortType`                    | ✅         | はい          |                                                    |
| `Int8`                                                            | `ByteType`                     | ✅         | はい          |                                                    |
| `UInt16`,`Int32`                                                  | `IntegerType`                  | ✅         | はい          |                                                    |
| `UInt32`,`Int64`, `UInt64`                                        | `LongType`                     | ✅         | はい          |                                                    |
| `Int128`,`UInt128`, `Int256`, `UInt256`                           | `DecimalType(38, 0)`           | ✅         | はい          |                                                    |
| `Float32`                                                         | `FloatType`                    | ✅         | はい          |                                                    |
| `Float64`                                                         | `DoubleType`                   | ✅         | はい          |                                                    |
| `String`, `JSON`, `UUID`, `Enum8`, `Enum16`, `IPv4`, `IPv6`       | `StringType`                   | ✅         | はい          |                                                    |
| `FixedString`                                                     | `BinaryType`, `StringType`     | ✅         | はい          | 設定 `READ_FIXED_STRING_AS` によって制御されます |
| `Decimal`                                                         | `DecimalType`                  | ✅         | はい          | `Decimal128` までの精度とスケール                 |
| `Decimal32`                                                       | `DecimalType(9, scale)`        | ✅         | はい          |                                                    |
| `Decimal64`                                                       | `DecimalType(18, scale)`       | ✅         | はい          |                                                    |
| `Decimal128`                                                      | `DecimalType(38, scale)`       | ✅         | はい          |                                                    |
| `Date`, `Date32`                                                  | `DateType`                     | ✅         | はい          |                                                    |
| `DateTime`, `DateTime32`, `DateTime64`                            | `TimestampType`                | ✅         | はい          |                                                    |
| `Array`                                                           | `ArrayType`                    | ✅         | いいえ        | 配列要素の型も変換されます                        |
| `Map`                                                             | `MapType`                      | ✅         | いいえ        | キーは `StringType` に制限されます                |
| `IntervalYear`                                                    | `YearMonthIntervalType(Year)`  | ✅         | はい          |                                                    |
| `IntervalMonth`                                                   | `YearMonthIntervalType(Month)` | ✅         | はい          |                                                    |
| `IntervalDay`, `IntervalHour`, `IntervalMinute`, `IntervalSecond` | `DayTimeIntervalType`          | ✅         | いいえ        | 対応する Interval 型が使用されます                |
| `Object`                                                          |                                | ❌         |              |                                                    |
| `Nested`                                                          |                                | ❌         |              |                                                    |
| `Tuple`                                                           | `StructType`                   | ✅         | いいえ        | 名前付きおよび名前なしのタプルをサポートします。名前付きタプルは構造体フィールドに名前で対応付けられ、名前なしタプルは `_1`、`_2` などを使用します。入れ子の構造体および Nullable フィールドをサポートします |
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

| Spark Data Type                     | ClickHouse Data Type | サポート有無 | プリミティブ型か | 備考                                   |
|-------------------------------------|----------------------|-------------|------------------|----------------------------------------|
| `BooleanType`                       | `Bool`               | ✅          | はい             | バージョン 0.9.0 以降、`Bool` 型（`UInt8` ではない）にマッピングされます |
| `ByteType`                          | `Int8`               | ✅          | はい             |                                        |
| `ShortType`                         | `Int16`              | ✅          | はい             |                                        |
| `IntegerType`                       | `Int32`              | ✅          | はい             |                                        |
| `LongType`                          | `Int64`              | ✅          | はい             |                                        |
| `FloatType`                         | `Float32`            | ✅          | はい             |                                        |
| `DoubleType`                        | `Float64`            | ✅          | はい             |                                        |
| `StringType`                        | `String`             | ✅          | はい             |                                        |
| `VarcharType`                       | `String`             | ✅          | はい             |                                        |
| `CharType`                          | `String`             | ✅          | はい             |                                        |
| `DecimalType`                       | `Decimal(p, s)`      | ✅          | はい             | 精度とスケールは `Decimal128` まで対応 |
| `DateType`                          | `Date`               | ✅          | はい             |                                        |
| `TimestampType`                     | `DateTime`           | ✅          | はい             |                                        |
| `ArrayType` (list, tuple, or array) | `Array`              | ✅          | いいえ           | 配列要素の型も変換されます             |
| `MapType`                           | `Map`                | ✅          | いいえ           | キーは `StringType` に制限されます     |
| `StructType`                        | `Tuple`              | ✅          | いいえ           | フィールド名付きの Tuple に変換されます |
| `VariantType`                       | `VariantType`        | ❌          | いいえ           |                                        |
| `Object`                            |                      | ❌          |                  |                                        |
| `Nested`                            |                      | ❌          |                  |                                        |

## 貢献とサポート {#contributing-and-support}

プロジェクトへの貢献や問題の報告をご希望の場合は、ぜひご協力ください。
[GitHub リポジトリ](https://github.com/ClickHouse/spark-clickhouse-connector)にアクセスして、issue の作成、改善提案、
または Pull Request の送信を行ってください。
コントリビューションは大歓迎です。作業を始める前に、リポジトリ内のコントリビューションガイドラインを確認してください。
ClickHouse Spark コネクタの改善にご協力いただき、ありがとうございます。