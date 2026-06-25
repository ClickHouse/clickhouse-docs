---
sidebar_label: 'Spark JDBC'
sidebar_position: 3
slug: /integrations/apache-spark/spark-jdbc
description: 'ClickHouse で Apache Spark を使うための入門'
keywords: ['clickhouse', 'Apache Spark', 'jdbc', '移行', 'データ']
title: 'Spark JDBC'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

<ClickHouseSupportedBadge />

JDBC は、Spark で最も広く使われているデータソースの 1 つです。
このセクションでは、Spark で [ClickHouse official JDBC コネクタ](/integrations/language-clients/java/jdbc) を使用する方法について詳しく説明します。

<TOCInline toc={toc} />

## データの読み込み \{#read-data\}

<Tabs groupId="spark_apis">
  <TabItem value="Java" label="Java" default>
    ```java
    public static void main(String[] args) {
            // Spark セッションを初期化
            SparkSession spark = SparkSession.builder().appName("example").master("local").getOrCreate();

            String jdbcURL = "jdbc:ch://localhost:8123/default";
            String query = "select * from example_table where id > 2";

            //---------------------------------------------------------------------------------------------------
            // jdbc メソッドを使用して ClickHouse からテーブルを読み込む
            //---------------------------------------------------------------------------------------------------
            Properties jdbcProperties = new Properties();
            jdbcProperties.put("user", "default");
            jdbcProperties.put("password", "123456");

            Dataset<Row> df1 = spark.read().jdbc(jdbcURL, String.format("(%s)", query), jdbcProperties);

            df1.show();

            //---------------------------------------------------------------------------------------------------
            // load メソッドを使用して ClickHouse からテーブルを読み込む
            //---------------------------------------------------------------------------------------------------
            Dataset<Row> df2 = spark.read()
                    .format("jdbc")
                    .option("url", jdbcURL)
                    .option("user", "default")
                    .option("password", "123456")
                    .option("query", query)
                    .load();

            df2.show();

            // Spark セッションを停止
            spark.stop();
        }
    ```
  </TabItem>

  <TabItem value="Scala" label="Scala">
    ```java
    object ReadData extends App {
      // Spark セッションを初期化
      val spark: SparkSession = SparkSession.builder.appName("example").master("local").getOrCreate

      val jdbcURL = "jdbc:ch://localhost:8123/default"
      val query: String = "select * from example_table where id > 2"

      //---------------------------------------------------------------------------------------------------
      // jdbc メソッドを使用して ClickHouse からテーブルを読み込む
      //---------------------------------------------------------------------------------------------------
      val connectionProperties = new Properties()
      connectionProperties.put("user", "default")
      connectionProperties.put("password", "123456")

      val df1: Dataset[Row] = spark.read.
        jdbc(jdbcURL, s"($query)", connectionProperties)

      df1.show()
      //---------------------------------------------------------------------------------------------------
      // load メソッドを使用して ClickHouse からテーブルを読み込む
      //---------------------------------------------------------------------------------------------------
      val df2: Dataset[Row] = spark.read
        .format("jdbc")
        .option("url", jdbcURL)
        .option("user", "default")
        .option("password", "123456")
        .option("query", query)
        .load()

      df2.show()

      // Spark セッションを停止// Spark セッションを停止
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

    # JAR を指定して Spark セッションを初期化
    spark = SparkSession.builder \
        .appName("example") \
        .master("local") \
        .config("spark.jars", ",".join(jar_files)) \
        .getOrCreate()

    url = "jdbc:ch://localhost:8123/default"
    user = "your_user" 
    password = "your_password"  
    query = "select * from example_table where id > 2"
    driver = "com.clickhouse.jdbc.ClickHouseDriver"

    df = (spark.read
          .format('jdbc')
          .option('driver', driver)
          .option('url', url)
          .option('user', user)
          .option('password', password).option(
        'query', query).load())

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

## データの書き込み \{#write-data\}

<Tabs groupId="spark_apis">
  <TabItem value="Java" label="Java" default>
    ```java
     public static void main(String[] args) {
            // Initialize Spark session
            SparkSession spark = SparkSession.builder().appName("example").master("local").getOrCreate();

            // JDBC connection details
            String jdbcUrl = "jdbc:ch://localhost:8123/default";
            Properties jdbcProperties = new Properties();
            jdbcProperties.put("user", "default");
            jdbcProperties.put("password", "123456");

            // Create a sample DataFrame
            StructType schema = new StructType(new StructField[]{
                    DataTypes.createStructField("id", DataTypes.IntegerType, false),
                    DataTypes.createStructField("name", DataTypes.StringType, false)
            });

            List<Row> rows = new ArrayList<Row>();
            rows.add(RowFactory.create(1, "John"));
            rows.add(RowFactory.create(2, "Doe"));

            Dataset<Row> df = spark.createDataFrame(rows, schema);

            //---------------------------------------------------------------------------------------------------
            // Write the df to ClickHouse using the jdbc method
            //---------------------------------------------------------------------------------------------------

            df.write()
                    .mode(SaveMode.Append)
                    .jdbc(jdbcUrl, "example_table", jdbcProperties);

            //---------------------------------------------------------------------------------------------------
            // Write the df to ClickHouse using the save method
            //---------------------------------------------------------------------------------------------------

            df.write()
                    .format("jdbc")
                    .mode("append")
                    .option("url", jdbcUrl)
                    .option("dbtable", "example_table")
                    .option("user", "default")
                    .option("password", "123456")
                    .save();

            // Stop the Spark session
            spark.stop();
        }
    ```
  </TabItem>

  <TabItem value="Scala" label="Scala">
    ```java
    object WriteData extends App {

      val spark: SparkSession = SparkSession.builder.appName("example").master("local").getOrCreate

      // JDBC connection details
      val jdbcUrl: String = "jdbc:ch://localhost:8123/default"
      val jdbcProperties: Properties = new Properties
      jdbcProperties.put("user", "default")
      jdbcProperties.put("password", "123456")

      // Create a sample DataFrame

      val rows = Seq(Row(1, "John"), Row(2, "Doe"))

      val schema = List(
        StructField("id", DataTypes.IntegerType, nullable = false),
        StructField("name", StringType, nullable = true)
      )

      val df: DataFrame = spark.createDataFrame(
        spark.sparkContext.parallelize(rows),
        StructType(schema)
      )
      
      //---------------------------------------------------------------------------------------------------//---------------------------------------------------------------------------------------------------
      // Write the df to ClickHouse using the jdbc method
      //---------------------------------------------------------------------------------------------------//---------------------------------------------------------------------------------------------------

      df.write
        .mode(SaveMode.Append)
        .jdbc(jdbcUrl, "example_table", jdbcProperties)

      //---------------------------------------------------------------------------------------------------//---------------------------------------------------------------------------------------------------
      // Write the df to ClickHouse using the save method
      //---------------------------------------------------------------------------------------------------//---------------------------------------------------------------------------------------------------

      df.write
        .format("jdbc")
        .mode("append")
        .option("url", jdbcUrl)
        .option("dbtable", "example_table")
        .option("user", "default")
        .option("password", "123456")
        .save()

      // Stop the Spark session// Stop the Spark session
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

    # Initialize Spark session with JARs
    spark = SparkSession.builder \
        .appName("example") \
        .master("local") \
        .config("spark.jars", ",".join(jar_files)) \
        .getOrCreate()

    # Create DataFrame
    data = [Row(id=11, name="John"), Row(id=12, name="Doe")]
    df = spark.createDataFrame(data)

    url = "jdbc:ch://localhost:8123/default"
    user = "your_user" 
    password = "your_password"  
    driver = "com.clickhouse.jdbc.ClickHouseDriver"

    # Write DataFrame to ClickHouse
    df.write \
        .format("jdbc") \
        .option("driver", driver) \
        .option("url", url) \
        .option("user", user) \
        .option("password", password) \
        .option("dbtable", "example_table") \
        .mode("append") \
        .save()

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
       -- resultTable could be created with df.createTempView or with Spark SQL
       INSERT INTO TABLE jdbcTable
                    SELECT * FROM resultTable;
                    
    ```
  </TabItem>
</Tabs>

## 並列性 \{#parallelism\}

Spark JDBC を使用する場合、Spark は単一のパーティションでデータを読み取ります。より高い並列性を実現するには、
`partitionColumn`、`lowerBound`、`upperBound`、`numPartitions` を指定する必要があります。これらの設定は、複数のワーカーで
並列に読み取る際に、テーブルをどのようにパーティション分割するかを定義します。
詳しくは、Apache Spark の公式ドキュメントの
[JDBC 構成](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html#data-source-option)
を参照してください。

## JDBC の制限事項 \{#jdbc-limitations\}

* Spark JDBC は、ClickHouse dialect がないため、複合型 (MAP、ARRAY、STRUCT) をサポートしていません。複合型を完全にサポートするには、ネイティブの Spark-ClickHouse コネクタを使用してください。
* 現時点では、JDBC でデータを挿入できるのは既存のテーブルのみです (現在のところ、Spark が他のコネクタで行うように、DF 挿入時に
  テーブルを自動作成することはできません) 。