---
sidebar_label: 'Spark JDBC'
sidebar_position: 3
slug: /integrations/apache-spark/spark-jdbc
description: 'Apache Spark与ClickHouse的介绍'
keywords: ['clickhouse', 'Apache Spark', 'jdbc', 'migrating', 'data']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';


# Spark JDBC
JDBC是Spark中最常用的数据源之一。
在本节中，我们将提供有关如何
使用 [ClickHouse官方JDBC连接器](/integrations/language-clients/java/jdbc) 与Spark的详细信息。

<TOCInline toc={toc}></TOCInline>

## Read data {#read-data}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
public static void main(String[] args) {
        // 初始化Spark会话
        SparkSession spark = SparkSession.builder().appName("example").master("local").getOrCreate();

        String jdbcURL = "jdbc:ch://localhost:8123/default";
        String query = "select * from example_table where id > 2";


        //---------------------------------------------------------------------------------------------------
        // 使用jdbc方法从ClickHouse加载表
        //---------------------------------------------------------------------------------------------------
        Properties jdbcProperties = new Properties();
        jdbcProperties.put("user", "default");
        jdbcProperties.put("password", "123456");

        Dataset<Row> df1 = spark.read().jdbc(jdbcURL, String.format("(%s)", query), jdbcProperties);

        df1.show();

        //---------------------------------------------------------------------------------------------------
        // 使用load方法从ClickHouse加载表
        //---------------------------------------------------------------------------------------------------
        Dataset<Row> df2 = spark.read()
                .format("jdbc")
                .option("url", jdbcURL)
                .option("user", "default")
                .option("password", "123456")
                .option("query", query)
                .load();


        df2.show();


        // 停止Spark会话
        spark.stop();
    }
```

</TabItem>
<TabItem value="Scala" label="Scala">

```java
object ReadData extends App {
  // 初始化Spark会话
  val spark: SparkSession = SparkSession.builder.appName("example").master("local").getOrCreate

  val jdbcURL = "jdbc:ch://localhost:8123/default"
  val query: String = "select * from example_table where id > 2"


  //---------------------------------------------------------------------------------------------------
  // 使用jdbc方法从ClickHouse加载表
  //---------------------------------------------------------------------------------------------------
  val connectionProperties = new Properties()
  connectionProperties.put("user", "default")
  connectionProperties.put("password", "123456")

  val df1: Dataset[Row] = spark.read.
    jdbc(jdbcURL, s"($query)", connectionProperties)

  df1.show()
  //---------------------------------------------------------------------------------------------------
  // 使用load方法从ClickHouse加载表
  //---------------------------------------------------------------------------------------------------
  val df2: Dataset[Row] = spark.read
    .format("jdbc")
    .option("url", jdbcURL)
    .option("user", "default")
    .option("password", "123456")
    .option("query", query)
    .load()

  df2.show()



  // 停止Spark会话
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


# 使用JAR初始化Spark会话
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

## Write data {#write-data}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
 public static void main(String[] args) {
        // 初始化Spark会话
        SparkSession spark = SparkSession.builder().appName("example").master("local").getOrCreate();

        // JDBC连接详细信息
        String jdbcUrl = "jdbc:ch://localhost:8123/default";
        Properties jdbcProperties = new Properties();
        jdbcProperties.put("user", "default");
        jdbcProperties.put("password", "123456");

        // 创建一个示例DataFrame
        StructType schema = new StructType(new StructField[]{
                DataTypes.createStructField("id", DataTypes.IntegerType, false),
                DataTypes.createStructField("name", DataTypes.StringType, false)
        });

        List<Row> rows = new ArrayList<Row>();
        rows.add(RowFactory.create(1, "John"));
        rows.add(RowFactory.create(2, "Doe"));


        Dataset<Row> df = spark.createDataFrame(rows, schema);

        //---------------------------------------------------------------------------------------------------
        // 使用jdbc方法将df写入ClickHouse
        //---------------------------------------------------------------------------------------------------

        df.write()
                .mode(SaveMode.Append)
                .jdbc(jdbcUrl, "example_table", jdbcProperties);

        //---------------------------------------------------------------------------------------------------
        // 使用save方法将df写入ClickHouse
        //---------------------------------------------------------------------------------------------------

        df.write()
                .format("jdbc")
                .mode("append")
                .option("url", jdbcUrl)
                .option("dbtable", "example_table")
                .option("user", "default")
                .option("password", "123456")
                .save();


        // 停止Spark会话
        spark.stop();
    }
```

</TabItem>
<TabItem value="Scala" label="Scala">

```java
object WriteData extends App {

  val spark: SparkSession = SparkSession.builder.appName("example").master("local").getOrCreate

  // JDBC连接详细信息
  val jdbcUrl: String = "jdbc:ch://localhost:8123/default"
  val jdbcProperties: Properties = new Properties
  jdbcProperties.put("user", "default")
  jdbcProperties.put("password", "123456")

  // 创建一个示例DataFrame

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
  // 使用jdbc方法将df写入ClickHouse
  //---------------------------------------------------------------------------------------------------//---------------------------------------------------------------------------------------------------

  df.write
    .mode(SaveMode.Append)
    .jdbc(jdbcUrl, "example_table", jdbcProperties)

  //---------------------------------------------------------------------------------------------------//---------------------------------------------------------------------------------------------------
  // 使用save方法将df写入ClickHouse
  //---------------------------------------------------------------------------------------------------//---------------------------------------------------------------------------------------------------

  df.write
    .format("jdbc")
    .mode("append")
    .option("url", jdbcUrl)
    .option("dbtable", "example_table")
    .option("user", "default")
    .option("password", "123456")
    .save()


  // 停止Spark会话
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


# 使用JAR初始化Spark会话
spark = SparkSession.builder \
    .appName("example") \
    .master("local") \
    .config("spark.jars", ",".join(jar_files)) \
    .getOrCreate()


# 创建DataFrame
data = [Row(id=11, name="John"), Row(id=12, name="Doe")]
df = spark.createDataFrame(data)

url = "jdbc:ch://localhost:8123/default"
user = "your_user" 
password = "your_password"  
driver = "com.clickhouse.jdbc.ClickHouseDriver"


# 将DataFrame写入ClickHouse
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
   -- resultTable可以通过df.createTempView或Spark SQL创建
   INSERT INTO TABLE jdbcTable
                SELECT * FROM resultTable;
                
```

</TabItem>
</Tabs>


## Parallelism {#parallelism}

在使用Spark JDBC时，Spark使用单个分区读取数据。为了实现更高的并发性，您必须指定
`partitionColumn`、`lowerBound`、`upperBound`和`numPartitions`，这些描述了在从多个工作节点并行读取时如何对表进行分区。
请访问Apache Spark的官方文档以获取有关 [JDBC配置](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html#data-source-option) 的更多信息。

## JDBC Limitations {#jdbc-limitations}

* 截至今天，您只能通过JDBC向现有表插入数据（目前没有办法在DF插入时自动创建表，正如Spark与其他连接器所做的那样）。
