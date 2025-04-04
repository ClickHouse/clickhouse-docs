---
sidebar_label: 'Spark JDBC'
sidebar_position: 3
slug: /integrations/apache-spark/spark-jdbc
description: 'Введение в Apache Spark с ClickHouse'
keywords: ['clickhouse', 'Apache Spark', 'jdbc', 'миграция', 'данные']
title: 'Spark JDBC'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';


# Spark JDBC
JDBC является одним из самых часто используемых источников данных в Spark.
В этом разделе мы предоставим информацию о том, как
использовать [официальный JDBC-коннектор ClickHouse](/integrations/language-clients/java/jdbc) с Spark.

<TOCInline toc={toc}></TOCInline>

## Чтение данных {#read-data}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
public static void main(String[] args) {
        // Инициализация сессии Spark
        SparkSession spark = SparkSession.builder().appName("example").master("local").getOrCreate();

        String jdbcURL = "jdbc:ch://localhost:8123/default";
        String query = "select * from example_table where id > 2";


        //---------------------------------------------------------------------------------------------------
        // Загрузка таблицы из ClickHouse с использованием метода jdbc
        //---------------------------------------------------------------------------------------------------
        Properties jdbcProperties = new Properties();
        jdbcProperties.put("user", "default");
        jdbcProperties.put("password", "123456");

        Dataset<Row> df1 = spark.read().jdbc(jdbcURL, String.format("(%s)", query), jdbcProperties);

        df1.show();

        //---------------------------------------------------------------------------------------------------
        // Загрузка таблицы из ClickHouse с использованием метода load
        //---------------------------------------------------------------------------------------------------
        Dataset<Row> df2 = spark.read()
                .format("jdbc")
                .option("url", jdbcURL)
                .option("user", "default")
                .option("password", "123456")
                .option("query", query)
                .load();


        df2.show();


        // Остановка сессии Spark
        spark.stop();
    }
```

</TabItem>
<TabItem value="Scala" label="Scala">

```java
object ReadData extends App {
  // Инициализация сессии Spark
  val spark: SparkSession = SparkSession.builder.appName("example").master("local").getOrCreate

  val jdbcURL = "jdbc:ch://localhost:8123/default"
  val query: String = "select * from example_table where id > 2"


  //---------------------------------------------------------------------------------------------------
  // Загрузка таблицы из ClickHouse с использованием метода jdbc
  //---------------------------------------------------------------------------------------------------
  val connectionProperties = new Properties()
  connectionProperties.put("user", "default")
  connectionProperties.put("password", "123456")

  val df1: Dataset[Row] = spark.read.
    jdbc(jdbcURL, s"($query)", connectionProperties)

  df1.show()
  //---------------------------------------------------------------------------------------------------
  // Загрузка таблицы из ClickHouse с использованием метода load
  //---------------------------------------------------------------------------------------------------
  val df2: Dataset[Row] = spark.read
    .format("jdbc")
    .option("url", jdbcURL)
    .option("user", "default")
    .option("password", "123456")
    .option("query", query)
    .load()

  df2.show()



  // Остановка сессии Spark// Остановка сессии Spark
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


# Инициализация сессии Spark с JAR
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

## Запись данных {#write-data}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
 public static void main(String[] args) {
        // Инициализация сессии Spark
        SparkSession spark = SparkSession.builder().appName("example").master("local").getOrCreate();

        // Подробности соединения JDBC
        String jdbcUrl = "jdbc:ch://localhost:8123/default";
        Properties jdbcProperties = new Properties();
        jdbcProperties.put("user", "default");
        jdbcProperties.put("password", "123456");

        // Создание примера DataFrame
        StructType schema = new StructType(new StructField[]{
                DataTypes.createStructField("id", DataTypes.IntegerType, false),
                DataTypes.createStructField("name", DataTypes.StringType, false)
        });

        List<Row> rows = new ArrayList<Row>();
        rows.add(RowFactory.create(1, "John"));
        rows.add(RowFactory.create(2, "Doe"));


        Dataset<Row> df = spark.createDataFrame(rows, schema);

        //---------------------------------------------------------------------------------------------------
        // Запись df в ClickHouse с использованием метода jdbc
        //---------------------------------------------------------------------------------------------------

        df.write()
                .mode(SaveMode.Append)
                .jdbc(jdbcUrl, "example_table", jdbcProperties);

        //---------------------------------------------------------------------------------------------------
        // Запись df в ClickHouse с использованием метода save
        //---------------------------------------------------------------------------------------------------

        df.write()
                .format("jdbc")
                .mode("append")
                .option("url", jdbcUrl)
                .option("dbtable", "example_table")
                .option("user", "default")
                .option("password", "123456")
                .save();


        // Остановка сессии Spark
        spark.stop();
    }
```

</TabItem>
<TabItem value="Scala" label="Scala">

```java
object WriteData extends App {

  val spark: SparkSession = SparkSession.builder.appName("example").master("local").getOrCreate

  // Подробности соединения JDBC
  val jdbcUrl: String = "jdbc:ch://localhost:8123/default"
  val jdbcProperties: Properties = new Properties
  jdbcProperties.put("user", "default")
  jdbcProperties.put("password", "123456")

  // Создание примера DataFrame


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
  // Запись df в ClickHouse с использованием метода jdbc
  //---------------------------------------------------------------------------------------------------//---------------------------------------------------------------------------------------------------

  df.write
    .mode(SaveMode.Append)
    .jdbc(jdbcUrl, "example_table", jdbcProperties)

  //---------------------------------------------------------------------------------------------------//---------------------------------------------------------------------------------------------------
  // Запись df в ClickHouse с использованием метода save
  //---------------------------------------------------------------------------------------------------//---------------------------------------------------------------------------------------------------

  df.write
    .format("jdbc")
    .mode("append")
    .option("url", jdbcUrl)
    .option("dbtable", "example_table")
    .option("user", "default")
    .option("password", "123456")
    .save()


  // Остановка сессии Spark// Остановка сессии Spark
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


# Инициализация сессии Spark с JAR
spark = SparkSession.builder \
    .appName("example") \
    .master("local") \
    .config("spark.jars", ",".join(jar_files)) \
    .getOrCreate()


# Создание DataFrame
data = [Row(id=11, name="John"), Row(id=12, name="Doe")]
df = spark.createDataFrame(data)

url = "jdbc:ch://localhost:8123/default"
user = "your_user" 
password = "your_password"  
driver = "com.clickhouse.jdbc.ClickHouseDriver"


# Запись DataFrame в ClickHouse
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
   -- resultTable может быть создан с df.createTempView или с использованием Spark SQL
   INSERT INTO TABLE jdbcTable
                SELECT * FROM resultTable;
                
```

</TabItem>
</Tabs>


## Параллелизм {#parallelism}

При использовании Spark JDBC Spark считывает данные, используя одну партицию. Для достижения более высокой параллельности необходимо указать
`partitionColumn`, `lowerBound`, `upperBound` и `numPartitions`, которые описывают, как партиционировать таблицу при
чтении параллельно из нескольких рабочих узлов.
Пожалуйста, посетите официальную документацию Apache Spark для получения дополнительной информации
о [конфигурациях JDBC](https://spark.apache.org/docs/latest/sql-data-sources-jdbc.html#data-source-option).

## Ограничения JDBC {#jdbc-limitations}

* На сегодняшний день вы можете вставлять данные через JDBC только в существующие таблицы (в настоящее время нет способа автоматически создавать
  таблицу при вставке DF, как это делает Spark с другими коннекторами).
