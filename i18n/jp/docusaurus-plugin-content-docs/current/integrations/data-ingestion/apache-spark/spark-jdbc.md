---
sidebar_label: 'Spark JDBC'
sidebar_position: 3
slug: /integrations/apache-spark/spark-jdbc
description: 'ClickHouse と組み合わせた Apache Spark 入門'
keywords: ['clickhouse', 'Apache Spark', 'jdbc', 'データ移行', 'データ']
title: 'Spark JDBC'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Spark JDBC

<ClickHouseSupportedBadge/>

JDBC は、Spark で最もよく利用されるデータソースの 1 つです。
このセクションでは、Spark で [ClickHouse 公式 JDBC コネクタ](/integrations/language-clients/java/jdbc) を使用する方法について詳しく説明します。

<TOCInline toc={toc}></TOCInline>



## データの読み取り {#read-data}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
public static void main(String[] args) {
        // Sparkセッションを初期化
        SparkSession spark = SparkSession.builder().appName("example").master("local").getOrCreate();

        String jdbcURL = "jdbc:ch://localhost:8123/default";
        String query = "select * from example_table where id > 2";

        //---------------------------------------------------------------------------------------------------
        // jdbcメソッドを使用してClickHouseからテーブルを読み込み
        //---------------------------------------------------------------------------------------------------
        Properties jdbcProperties = new Properties();
        jdbcProperties.put("user", "default");
        jdbcProperties.put("password", "123456");

        Dataset<Row> df1 = spark.read().jdbc(jdbcURL, String.format("(%s)", query), jdbcProperties);

        df1.show();

        //---------------------------------------------------------------------------------------------------
        // loadメソッドを使用してClickHouseからテーブルを読み込み
        //---------------------------------------------------------------------------------------------------
        Dataset<Row> df2 = spark.read()
                .format("jdbc")
                .option("url", jdbcURL)
                .option("user", "default")
                .option("password", "123456")
                .option("query", query)
                .load();

        df2.show();

        // Sparkセッションを停止
        spark.stop();
    }
```

</TabItem>
<TabItem value="Scala" label="Scala">

```java
object ReadData extends App {
  // Sparkセッションを初期化
  val spark: SparkSession = SparkSession.builder.appName("example").master("local").getOrCreate

  val jdbcURL = "jdbc:ch://localhost:8123/default"
  val query: String = "select * from example_table where id > 2"

  //---------------------------------------------------------------------------------------------------
  // Load the table from ClickHouse using jdbc method
  //---------------------------------------------------------------------------------------------------
  val connectionProperties = new Properties()
  connectionProperties.put("user", "default")
  connectionProperties.put("password", "123456")

  val df1: Dataset[Row] = spark.read.
    jdbc(jdbcURL, s"($query)", connectionProperties)

  df1.show()
  //---------------------------------------------------------------------------------------------------
  // Load the table from ClickHouse using load method
  //---------------------------------------------------------------------------------------------------
  val df2: Dataset[Row] = spark.read
    .format("jdbc")
    .option("url", jdbcURL)
    .option("user", "default")
    .option("password", "123456")
    .option("query", query)
    .load()

  df2.show()

  // Sparkセッションを停止// Sparkセッションを停止
  spark.stop()

}
```

</TabItem>
<TabItem value="Python" label="Python">

```python
from pyspark.sql import SparkSession

jar_files = [
    "jars/clickhouse-jdbc-X.X.X-SNAPSHOT-all.jar"
]

```


# JARファイルを使用したSparkセッションの初期化

spark = SparkSession.builder \
 .appName("example") \
 .master("local") \
 .config("spark.jars", ",".join(jar_files)) \
 .getOrCreate()

url = "jdbc:ch://localhost:8123/default"
user = "your_user"
password = "your_password"  
query = "select \* from example_table where id > 2"
driver = "com.clickhouse.jdbc.ClickHouseDriver"

df = (spark.read
.format('jdbc')
.option('driver', driver)
.option('url', url)
.option('user', user)
.option('password', password).option(
'query', query).load())

df.show()

````

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
````

</TabItem>
</Tabs>


## データの書き込み {#write-data}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
 public static void main(String[] args) {
        // Sparkセッションを初期化
        SparkSession spark = SparkSession.builder().appName("example").master("local").getOrCreate();

        // JDBC接続の詳細情報
        String jdbcUrl = "jdbc:ch://localhost:8123/default";
        Properties jdbcProperties = new Properties();
        jdbcProperties.put("user", "default");
        jdbcProperties.put("password", "123456");

        // サンプルDataFrameを作成
        StructType schema = new StructType(new StructField[]{
                DataTypes.createStructField("id", DataTypes.IntegerType, false),
                DataTypes.createStructField("name", DataTypes.StringType, false)
        });

        List<Row> rows = new ArrayList<Row>();
        rows.add(RowFactory.create(1, "John"));
        rows.add(RowFactory.create(2, "Doe"));

        Dataset<Row> df = spark.createDataFrame(rows, schema);

        //---------------------------------------------------------------------------------------------------
        // jdbcメソッドを使用してDataFrameをClickHouseに書き込む
        //---------------------------------------------------------------------------------------------------

        df.write()
                .mode(SaveMode.Append)
                .jdbc(jdbcUrl, "example_table", jdbcProperties);

        //---------------------------------------------------------------------------------------------------
        // saveメソッドを使用してDataFrameをClickHouseに書き込む
        //---------------------------------------------------------------------------------------------------

        df.write()
                .format("jdbc")
                .mode("append")
                .option("url", jdbcUrl)
                .option("dbtable", "example_table")
                .option("user", "default")
                .option("password", "123456")
                .save();

        // Sparkセッションを停止
        spark.stop();
    }
```

</TabItem>
<TabItem value="Scala" label="Scala">

```java
object WriteData extends App {

  val spark: SparkSession = SparkSession.builder.appName("example").master("local").getOrCreate

  // JDBC接続の詳細情報
  val jdbcUrl: String = "jdbc:ch://localhost:8123/default"
  val jdbcProperties: Properties = new Properties
  jdbcProperties.put("user", "default")
  jdbcProperties.put("password", "123456")

  // サンプルDataFrameを作成

  val rows = Seq(Row(1, "John"), Row(2, "Doe"))

  val schema = List(
    StructField("id", DataTypes.IntegerType, nullable = false),
    StructField("name", StringType, nullable = true)
  )

  val df: DataFrame = spark.createDataFrame(
    spark.sparkContext.parallelize(rows),
    StructType(schema)
  )

  //---------------------------------------------------------------------------------------------------
  // jdbcメソッドを使用してDataFrameをClickHouseに書き込む
  //---------------------------------------------------------------------------------------------------

  df.write
    .mode(SaveMode.Append)
    .jdbc(jdbcUrl, "example_table", jdbcProperties)

  //---------------------------------------------------------------------------------------------------
  // saveメソッドを使用してDataFrameをClickHouseに書き込む
  //---------------------------------------------------------------------------------------------------

  df.write
    .format("jdbc")
    .mode("append")
    .option("url", jdbcUrl)
    .option("dbtable", "example_table")
    .option("user", "default")
    .option("password", "123456")
    .save()

  // Sparkセッションを停止
  spark.stop()

}
```

</TabItem>
<TabItem value="Python" label="Python">

```python
from pyspark.sql import SparkSession
from pyspark.sql import Row

jar_files = [
    "jars/clickhouse-jdbc-X.X.X-SNAPSHOT-all.jar"
]

```


# JAR ファイルを指定して Spark セッションを初期化する
spark = SparkSession.builder \
    .appName("example") \
    .master("local") \
    .config("spark.jars", ",".join(jar_files)) \
    .getOrCreate()



# DataFrame を作成
data = [Row(id=11, name="John"), Row(id=12, name="Doe")]
df = spark.createDataFrame(data)

url = "jdbc:ch://localhost:8123/default"
user = "your_user" 
password = "your_password"  
driver = "com.clickhouse.jdbc.ClickHouseDriver"



# DataFrameをClickHouseに書き込む

df.write \
 .format("jdbc") \
 .option("driver", driver) \
 .option("url", url) \
 .option("user", user) \
 .option("password", password) \
 .option("dbtable", "example_table") \
 .mode("append") \
 .save()

````

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
   -- resultTableは、df.createTempViewまたはSpark SQLで作成できます
   INSERT INTO TABLE jdbcTable
                SELECT * FROM resultTable;

````

</TabItem>
</Tabs>


## 並列処理 {#parallelism}

Spark JDBCを使用する場合、Sparkは単一のパーティションでデータを読み取ります。より高い並行性を実現するには、`partitionColumn`、`lowerBound`、`upperBound`、および`numPartitions`を指定する必要があります。これらのパラメータは、複数のワーカーから並列に読み取る際のテーブルのパーティション分割方法を定義します。
[JDBC設定](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html#data-source-option)の詳細については、Apache Sparkの公式ドキュメントを参照してください。


## JDBCの制限事項 {#jdbc-limitations}

- 現時点では、JDBCを使用したデータ挿入は既存のテーブルに対してのみ可能です（Sparkが他のコネクタで行うような、DataFrame挿入時のテーブル自動作成機能は現在サポートされていません）。
