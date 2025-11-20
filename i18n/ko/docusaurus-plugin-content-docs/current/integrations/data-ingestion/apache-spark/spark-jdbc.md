---
'sidebar_label': 'Spark JDBC'
'sidebar_position': 3
'slug': '/integrations/apache-spark/spark-jdbc'
'description': 'Apache Spark와 ClickHouse에 대한 소개'
'keywords':
- 'clickhouse'
- 'Apache Spark'
- 'jdbc'
- 'migrating'
- 'data'
'title': 'Spark JDBC'
'doc_type': 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Spark JDBC

<ClickHouseSupportedBadge/>

JDBC는 Spark에서 가장 일반적으로 사용되는 데이터 소스 중 하나입니다.  
이 섹션에서는 Spark와 함께 [ClickHouse 공식 JDBC 커넥터](/integrations/language-clients/java/jdbc)를 사용하는 방법에 대한 세부 정보를 제공합니다.

<TOCInline toc={toc}></TOCInline>

## 데이터 읽기 {#read-data}

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

## 데이터 쓰기 {#write-data}

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

## 병렬 처리 {#parallelism}

Spark JDBC를 사용할 때 Spark는 단일 파티션을 사용하여 데이터를 읽습니다. 더 높은 동시성을 달성하기 위해서는  
`partitionColumn`, `lowerBound`, `upperBound`, `numPartitions`를 지정해야 합니다. 이들은 여러 작업자로부터 병렬로 읽을 때 테이블을 어떻게 파티셔닝할지를 설명합니다.  
자세한 내용은 Apache Spark의 공식 문서를 방문하여 [JDBC 구성](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html#data-source-option)을 참조하십시오.

## JDBC 제한 사항 {#jdbc-limitations}

* 현재로서는 JDBC를 사용하여 기존 테이블에만 데이터를 삽입할 수 있습니다 (현재 DataFrame 삽입 시 테이블을 자동으로 생성하는 방법은 없습니다. 이는 다른 커넥터와 Spark의 경우입니다).
