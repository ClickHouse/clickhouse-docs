---
sidebar_label: Spark JDBC
sidebar_position: 3
slug: /en/integrations/apache-spark/spark-jdbc
description: Introduction to Apache Spark with ClickHouse
keywords: [ clickhouse, Apache Spark, jdbc, migrating, data ]
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';

# Spark JDBC
One of the most used data sources supported by Spark is JDBC.
In this section, we will provide details on how to
use the [ClickHouse official JDBC connector](https://clickhouse.com/docs/en/integrations/java/jdbc-driver) with Spark.


<TOCInline toc={toc}></TOCInline>

## Read data

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
public static void main(String[] args) {
        // Initialize Spark session
        SparkSession spark = SparkSession.builder().appName("example").master("local").getOrCreate();

        String jdbcURL = "jdbc:ch://localhost:8123/default";
        String query = "select * from example_table where id > 2";


        //---------------------------------------------------------------------------------------------------
        // Load the table from ClickHouse using jdbc method
        //---------------------------------------------------------------------------------------------------
        Properties jdbcProperties = new Properties();
        jdbcProperties.put("user", "default");
        jdbcProperties.put("password", "123456");

        Dataset<Row> df1 = spark.read().jdbc(jdbcURL, String.format("(%s)", query), jdbcProperties);

        df1.show();

        //---------------------------------------------------------------------------------------------------
        // Load the table from ClickHouse using load method
        //---------------------------------------------------------------------------------------------------
        Dataset<Row> df2 = spark.read()
                .format("jdbc")
                .option("url", jdbcURL)
                .option("user", "default")
                .option("password", "123456")
                .option("query", query)
                .load();


        df2.show();


        // Stop the Spark session
        spark.stop();
    }
```

</TabItem>
<TabItem value="Scala" label="Scala">

```java
object ReadData extends App {
  // Initialize Spark session
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



  // Stop the Spark session// Stop the Spark session
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

# Initialize Spark session with JARs
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

## Write data

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
                .option("SaveMode", "append")
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
  // Write the df to ClickHouse using the jdbc method// Write the df to ClickHouse using the jdbc method
  //---------------------------------------------------------------------------------------------------//---------------------------------------------------------------------------------------------------

  df.write
    .mode(SaveMode.Append)
    .jdbc(jdbcUrl, "example_table", jdbcProperties)

  //---------------------------------------------------------------------------------------------------//---------------------------------------------------------------------------------------------------
  // Write the df to ClickHouse using the save method// Write the df to ClickHouse using the save method
  //---------------------------------------------------------------------------------------------------//---------------------------------------------------------------------------------------------------

  df.write
    .format("jdbc")
    .mode("append")
    .option("url", jdbcUrl)
    .option("dbtable", "example_table")
    .option("user", "default")
    .option("password", "123456")
    .option("SaveMode", "append")
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


## Parallelism

When using Spark JDBC, Spark reads the data using a single partition. To achieve higher concurrency, you must specify
`partitionColumn`, `lowerBound`, `upperBound`, and `numPartitions`, which describe how to partition the table when
reading in parallel from multiple workers.
Please visit Apache Spark's official documentation for more information
on [JDBC configurations](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html#data-source-option).

## JDBC Limitations

* As of today, you can insert data using JDBC only into existing tables (currently there is no way to auto create the
  table on DF insertion, as Spark does with other connectors).
