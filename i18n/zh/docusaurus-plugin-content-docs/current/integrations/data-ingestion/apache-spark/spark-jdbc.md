---
sidebar_label: 'Spark JDBC'
sidebar_position: 3
slug: /integrations/apache-spark/spark-jdbc
description: '将 Apache Spark 与 ClickHouse 集成的简介'
keywords: ['clickhouse', 'Apache Spark', 'jdbc', 'migrating', 'data']
title: 'Spark JDBC'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Spark JDBC

<ClickHouseSupportedBadge/>

JDBC 是 Spark 中最常用的数据源之一。
在本节中，我们将介绍如何在 Spark 中
使用 [ClickHouse 官方 JDBC 连接器](/integrations/language-clients/java/jdbc)。

<TOCInline toc={toc}></TOCInline>



## 读取数据 {#read-data}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
public static void main(String[] args) {
        // 初始化 Spark 会话
        SparkSession spark = SparkSession.builder().appName("example").master("local").getOrCreate();

        String jdbcURL = "jdbc:ch://localhost:8123/default";
        String query = "select * from example_table where id > 2";

        //---------------------------------------------------------------------------------------------------
        // 通过 JDBC 从 ClickHouse 读取表数据
        //---------------------------------------------------------------------------------------------------
        Properties jdbcProperties = new Properties();
        jdbcProperties.put("user", "default");
        jdbcProperties.put("password", "123456");

        Dataset<Row> df1 = spark.read().jdbc(jdbcURL, String.format("(%s)", query), jdbcProperties);

        df1.show();

        //---------------------------------------------------------------------------------------------------
        // 通过 load 方法从 ClickHouse 读取表数据
        //---------------------------------------------------------------------------------------------------
        Dataset<Row> df2 = spark.read()
                .format("jdbc")
                .option("url", jdbcURL)
                .option("user", "default")
                .option("password", "123456")
                .option("query", query)
                .load();

        df2.show();

        // 停止 Spark 会话
        spark.stop();
    }
```

</TabItem>
<TabItem value="Scala" label="Scala">

```java
object ReadData extends App {
  // 初始化 Spark 会话
  val spark: SparkSession = SparkSession.builder.appName("example").master("local").getOrCreate

  val jdbcURL = "jdbc:ch://localhost:8123/default"
  val query: String = "select * from example_table where id > 2"

  //---------------------------------------------------------------------------------------------------
  // 通过 JDBC 从 ClickHouse 读取表数据
  //---------------------------------------------------------------------------------------------------
  val connectionProperties = new Properties()
  connectionProperties.put("user", "default")
  connectionProperties.put("password", "123456")

  val df1: Dataset[Row] = spark.read.
    jdbc(jdbcURL, s"($query)", connectionProperties)

  df1.show()
  //---------------------------------------------------------------------------------------------------
  // 通过 load 方法从 ClickHouse 读取表数据
  //---------------------------------------------------------------------------------------------------
  val df2: Dataset[Row] = spark.read
    .format("jdbc")
    .option("url", jdbcURL)
    .option("user", "default")
    .option("password", "123456")
    .option("query", query)
    .load()

  df2.show()

  // 停止 Spark 会话 // 停止 Spark 会话
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


# 使用 JAR 文件初始化 Spark 会话

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


## 写入数据 {#write-data}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
 public static void main(String[] args) {
        // 初始化 Spark 会话
        SparkSession spark = SparkSession.builder().appName("example").master("local").getOrCreate();

        // JDBC 连接详细信息
        String jdbcUrl = "jdbc:ch://localhost:8123/default";
        Properties jdbcProperties = new Properties();
        jdbcProperties.put("user", "default");
        jdbcProperties.put("password", "123456");

        // 创建示例 DataFrame
        StructType schema = new StructType(new StructField[]{
                DataTypes.createStructField("id", DataTypes.IntegerType, false),
                DataTypes.createStructField("name", DataTypes.StringType, false)
        });

        List<Row> rows = new ArrayList<Row>();
        rows.add(RowFactory.create(1, "John"));
        rows.add(RowFactory.create(2, "Doe"));

        Dataset<Row> df = spark.createDataFrame(rows, schema);

        //---------------------------------------------------------------------------------------------------
        // 使用 jdbc 方法将 DataFrame 写入 ClickHouse
        //---------------------------------------------------------------------------------------------------

        df.write()
                .mode(SaveMode.Append)
                .jdbc(jdbcUrl, "example_table", jdbcProperties);

        //---------------------------------------------------------------------------------------------------
        // 使用 save 方法将 DataFrame 写入 ClickHouse
        //---------------------------------------------------------------------------------------------------

        df.write()
                .format("jdbc")
                .mode("append")
                .option("url", jdbcUrl)
                .option("dbtable", "example_table")
                .option("user", "default")
                .option("password", "123456")
                .save();

        // 停止 Spark 会话
        spark.stop();
    }
```

</TabItem>
<TabItem value="Scala" label="Scala">

```java
object WriteData extends App {

  val spark: SparkSession = SparkSession.builder.appName("example").master("local").getOrCreate

  // JDBC 连接详细信息
  val jdbcUrl: String = "jdbc:ch://localhost:8123/default"
  val jdbcProperties: Properties = new Properties
  jdbcProperties.put("user", "default")
  jdbcProperties.put("password", "123456")

  // 创建示例 DataFrame

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
  // 使用 jdbc 方法将 DataFrame 写入 ClickHouse
  //---------------------------------------------------------------------------------------------------

  df.write
    .mode(SaveMode.Append)
    .jdbc(jdbcUrl, "example_table", jdbcProperties)

  //---------------------------------------------------------------------------------------------------
  // 使用 save 方法将 DataFrame 写入 ClickHouse
  //---------------------------------------------------------------------------------------------------

  df.write
    .format("jdbc")
    .mode("append")
    .option("url", jdbcUrl)
    .option("dbtable", "example_table")
    .option("user", "default")
    .option("password", "123456")
    .save()

  // 停止 Spark 会话
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


# 使用 JAR 初始化 Spark Session
spark = SparkSession.builder \
    .appName("example") \
    .master("local") \
    .config("spark.jars", ",".join(jar_files)) \
    .getOrCreate()



# 创建 DataFrame
data = [Row(id=11, name="John"), Row(id=12, name="Doe")]
df = spark.createDataFrame(data)

url = "jdbc:ch://localhost:8123/default"
user = "your_user" 
password = "your_password"  
driver = "com.clickhouse.jdbc.ClickHouseDriver"



# 将 DataFrame 写入 ClickHouse

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
   -- resultTable 可以通过 df.createTempView 或 Spark SQL 创建
   INSERT INTO TABLE jdbcTable
                SELECT * FROM resultTable;

````

</TabItem>
</Tabs>


## 并行性 {#parallelism}

使用 Spark JDBC 时,Spark 默认使用单个分区读取数据。要实现更高的并发性,必须指定 `partitionColumn`、`lowerBound`、`upperBound` 和 `numPartitions` 参数,这些参数用于描述从多个工作节点并行读取数据时如何对表进行分区。
有关 [JDBC 配置](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html#data-source-option)的更多信息,请参阅 Apache Spark 官方文档。


## JDBC 限制 {#jdbc-limitations}

- 目前,您只能使用 JDBC 将数据插入到已存在的表中(当前无法在 DataFrame 插入时自动创建表,这与 Spark 使用其他连接器时的行为不同)。
