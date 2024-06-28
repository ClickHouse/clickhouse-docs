---
sidebar_label: Apache Spark 
sidebar_position: 1
slug: /en/integrations/apache-spark/
description: Introduction to Apache Spark with ClickHouse
keywords: [clickhouse, apache, spark, migrating, data]
---

# Integrating Apache Spark with ClickHouse

[Apache Spark](https://spark.apache.org/) Apache Spark™ is a multi-language engine for executing data engineering, data science, and machine learning on single-node machines or clusters.

## Requirements

- Java 8 or 17
- Scala 2.12 or 2.13
- Apache Spark 3.3 or 3.4 or 3.5

## Compatible Matrix

| Version | Compatible Spark Versions | ClickHouse JDBC version |
|---------|---------------------------|-------------------------|
| main    | Spark 3.3, 3.4, 3.5       | 0.6.0                   |
| 0.7.3   | Spark 3.3, 3.4            | 0.4.6                   |
| 0.6.0   | Spark 3.3                 | 0.3.2-patch11           |
| 0.5.0   | Spark 3.2, 3.3            | 0.3.2-patch11           |
| 0.4.0   | Spark 3.2, 3.3            | Not depend on           |
| 0.3.0   | Spark 3.2, 3.3            | Not depend on           |
| 0.2.1   | Spark 3.2                 | Not depend on           |
| 0.1.2   | Spark 3.2                 | Not depend on           |

# Get the Library

## Download the Library

The name pattern of binary jar is
```
clickhouse-spark-runtime-${spark_binary_version}_${scala_binary_version}-${version}.jar
```
you can find all available released jars under [Maven Central Repository](https://repo1.maven.org/maven2/com/github/housepower)
and all daily build SNAPSHOT jars under [Sonatype OSS Snapshots Repository](https://oss.sonatype.org/content/repositories/snapshots/com/github/housepower/).

## Import as Dependency

### Gradle

```
dependencies {
  implementation("com.github.housepower:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}")
  implementation("com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}:all") { transitive = false }
}
```

Add the following repository if you want to use SNAPSHOT version.

```
repositries {
  maven { url = "https://oss.sonatype.org/content/repositories/snapshots" }
}
```

### Maven

```
<dependency>
  <groupId>com.github.housepower</groupId>
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

Add the following repository if you want to use SNAPSHOT version.

```
<repositories>
  <repository>
    <id>sonatype-oss-snapshots</id>
    <name>Sonatype OSS Snapshots Repository</name>
    <url>https://oss.sonatype.org/content/repositories/snapshots</url>
  </repository>
</repositories>
```

# Play with Spark SQL

Note: For SQL-only use cases, [Apache Kyuubi](https://github.com/apache/kyuubi) is recommended
for Production.

## Launch Spark SQL CLI

```shell
$SPARK_HOME/bin/spark-sql \
  --conf spark.sql.catalog.clickhouse=xenon.clickhouse.ClickHouseCatalog \
  --conf spark.sql.catalog.clickhouse.host=${CLICKHOUSE_HOST:-127.0.0.1} \
  --conf spark.sql.catalog.clickhouse.protocol=http \
  --conf spark.sql.catalog.clickhouse.http_port=${CLICKHOUSE_HTTP_PORT:-8123} \
  --conf spark.sql.catalog.clickhouse.user=${CLICKHOUSE_USER:-default} \
  --conf spark.sql.catalog.clickhouse.password=${CLICKHOUSE_PASSWORD:-} \
  --conf spark.sql.catalog.clickhouse.database=default \
  --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
```

The following argument
```
  --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
```
can be replaced by
```
  --repositories https://{maven-cental-mirror or private-nexus-repo} \
  --packages com.github.housepower:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }},com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}:all
```
to avoid copying jar to your Spark client node.

## Operations

Basic operations, e.g. create database, create table, write table, read table, etc.
```
spark-sql> use clickhouse;
Time taken: 0.016 seconds

spark-sql> create database if not exists test_db;
Time taken: 0.022 seconds

spark-sql> show databases;
default
system
test_db
Time taken: 0.289 seconds, Fetched 3 row(s)

spark-sql> CREATE TABLE test_db.tbl_sql (
         >   create_time TIMESTAMP NOT NULL,
         >   m           INT       NOT NULL COMMENT 'part key',
         >   id          BIGINT    NOT NULL COMMENT 'sort key',
         >   value       STRING
         > ) USING ClickHouse
         > PARTITIONED BY (m)
         > TBLPROPERTIES (
         >   engine = 'MergeTree()',
         >   order_by = 'id',
         >   settings.index_granularity = 8192
         > );
Time taken: 0.242 seconds

spark-sql> insert into test_db.tbl_sql values
         > (timestamp'2021-01-01 10:10:10', 1, 1L, '1'),
         > (timestamp'2022-02-02 10:10:10', 2, 2L, '2')
         > as tabl(create_time, m, id, value);
Time taken: 0.276 seconds

spark-sql> select * from test_db.tbl_sql;
2021-01-01 10:10:10	1	1	1
2022-02-02 10:10:10	2	2	2
Time taken: 0.116 seconds, Fetched 2 row(s)

spark-sql> insert into test_db.tbl_sql select * from test_db.tbl_sql;
Time taken: 1.028 seconds

spark-sql> insert into test_db.tbl_sql select * from test_db.tbl_sql;
Time taken: 0.462 seconds

spark-sql> select count(*) from test_db.tbl_sql;
6
Time taken: 1.421 seconds, Fetched 1 row(s)

spark-sql> select * from test_db.tbl_sql;
2021-01-01 10:10:10	1	1	1
2021-01-01 10:10:10	1	1	1
2021-01-01 10:10:10	1	1	1
2022-02-02 10:10:10	2	2	2
2022-02-02 10:10:10	2	2	2
2022-02-02 10:10:10	2	2	2
Time taken: 0.123 seconds, Fetched 6 row(s)

spark-sql> delete from test_db.tbl_sql where id = 1;
Time taken: 0.129 seconds

spark-sql> select * from test_db.tbl_sql;
2022-02-02 10:10:10	2	2	2
2022-02-02 10:10:10	2	2	2
2022-02-02 10:10:10	2	2	2
Time taken: 0.101 seconds, Fetched 3 row(s)
```

# Play with Spark Shell

## Launch Spark Shell

```shell
$SPARK_HOME/bin/spark-shell \
  --conf spark.sql.catalog.clickhouse=xenon.clickhouse.ClickHouseCatalog \
  --conf spark.sql.catalog.clickhouse.host=${CLICKHOUSE_HOST:-127.0.0.1} \
  --conf spark.sql.catalog.clickhouse.protocol=http \
  --conf spark.sql.catalog.clickhouse.http_port=${CLICKHOUSE_HTTP_PORT:-8123} \
  --conf spark.sql.catalog.clickhouse.user=${CLICKHOUSE_USER:-default} \
  --conf spark.sql.catalog.clickhouse.password=${CLICKHOUSE_PASSWORD:-} \
  --conf spark.sql.catalog.clickhouse.database=default \
  --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
```

The following argument
```
  --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
```
can be replaced by
```
  --repositories https://{maven-cental-mirror or private-nexus-repo} \
  --packages com.github.housepower:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }},com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}:all
```
to avoid copying jar to your Spark client node.

## Operations

Basic operations, e.g. create database, create table, write table, read table, etc.
```
scala> spark.sql("use clickhouse")
res0: org.apache.spark.sql.DataFrame = []

scala> spark.sql("create database test_db")
res1: org.apache.spark.sql.DataFrame = []

scala> spark.sql("show databases").show
+---------+
|namespace|
+---------+
|  default|
|   system|
|  test_db|
+---------+

scala> spark.sql("""
     | CREATE TABLE test_db.tbl (
     |   create_time TIMESTAMP NOT NULL,
     |   m           INT       NOT NULL COMMENT 'part key',
     |   id          BIGINT    NOT NULL COMMENT 'sort key',
     |   value       STRING
     | ) USING ClickHouse
     | PARTITIONED BY (m)
     | TBLPROPERTIES (
     |   engine = 'MergeTree()',
     |   order_by = 'id',
     |   settings.index_granularity = 8192
     | )
     | """)
res2: org.apache.spark.sql.DataFrame = []

scala> :paste
// Entering paste mode (ctrl-D to finish)

spark.createDataFrame(Seq(
    ("2021-01-01 10:10:10", 1L, "1"),
    ("2022-02-02 10:10:10", 2L, "2")
)).toDF("create_time", "id", "value")
    .withColumn("create_time", to_timestamp($"create_time"))
    .withColumn("m", month($"create_time"))
    .select($"create_time", $"m", $"id", $"value")
    .writeTo("test_db.tbl")
    .append

// Exiting paste mode, now interpreting.

scala> spark.table("test_db.tbl").show
+-------------------+---+---+-----+
|        create_time|  m| id|value|
+-------------------+---+---+-----+
|2021-01-01 10:10:10|  1|  1|    1|
|2022-02-02 10:10:10|  2|  2|    2|
+-------------------+---+---+-----+

scala> spark.sql("DELETE FROM test_db.tbl WHERE id=1")
res3: org.apache.spark.sql.DataFrame = []

scala> spark.table("test_db.tbl").show
+-------------------+---+---+-----+
|        create_time|  m| id|value|
+-------------------+---+---+-----+
|2022-02-02 10:10:10|  2|  2|    2|
+-------------------+---+---+-----+
```

Execute ClickHouse native SQL.
```
scala> val options = Map(
     |     "host" -> "clickhouse",
     |     "protocol" -> "http",
     |     "http_port" -> "8123",
     |     "user" -> "default",
     |     "password" -> ""
     | )

scala> val sql = """
     | |CREATE TABLE test_db.person (
     | |  id    Int64,
     | |  name  String,
     | |  age Nullable(Int32)
     | |)
     | |ENGINE = MergeTree()
     | |ORDER BY id
     | """.stripMargin

scala> spark.executeCommand("xenon.clickhouse.ClickHouseCommandRunner", sql, options) 

scala> spark.sql("show tables in clickhouse_s1r1.test_db").show
+---------+---------+-----------+
|namespace|tableName|isTemporary|
+---------+---------+-----------+
|  test_db|   person|      false|
+---------+---------+-----------+

scala> spark.table("clickhouse_s1r1.test_db.person").printSchema
root
 |-- id: long (nullable = false)
 |-- name: string (nullable = false)
 |-- age: integer (nullable = true)
```