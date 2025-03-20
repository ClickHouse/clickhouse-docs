---
sidebar_label: Spark 原生连接器
sidebar_position: 2
slug: /integrations/apache-spark/spark-native-connector
description: 与 ClickHouse 的 Apache Spark 介绍
keywords: [ clickhouse, Apache Spark, migrating, data ]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';

# Spark 连接器

此连接器利用 ClickHouse 特定的优化，例如高级分区和谓词下推，以提高查询性能和数据处理能力。该连接器基于 [ClickHouse 的官方 JDBC 连接器](https://github.com/ClickHouse/clickhouse-java)，并管理其自己的目录。

在 Spark 3.0 之前，Spark 缺乏内建的目录概念，因此用户通常依赖于外部目录系统，例如 Hive Metastore 或 AWS Glue。使用这些外部解决方案时，用户必须在访问 Spark 中的数据源表之前手动注册它们。
然而，自 Spark 3.0 引入目录概念后，Spark 现在可以通过注册目录插件自动发现表。

Spark 的默认目录是 `spark_catalog`，表通过 `{catalog name}.{database}.{table}` 进行标识。借助新的目录功能，现在可以在单个 Spark 应用程序中添加和使用多个目录。

<TOCInline toc={toc}></TOCInline>
## 要求 {#requirements}

- Java 8 或 17
- Scala 2.12 或 2.13
- Apache Spark 3.3 或 3.4 或 3.5
## 兼容性矩阵 {#compatibility-matrix}

| 版本 | 兼容的 Spark 版本 | ClickHouse JDBC 版本 |
|---------|---------------------------|-------------------------|
| main    | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.8.1   | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.8.0   | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.7.3   | Spark 3.3, 3.4            | 0.4.6                   |
| 0.6.0   | Spark 3.3                 | 0.3.2-patch11           |
| 0.5.0   | Spark 3.2, 3.3            | 0.3.2-patch11           |
| 0.4.0   | Spark 3.2, 3.3            | 不依赖于               |
| 0.3.0   | Spark 3.2, 3.3            | 不依赖于               |
| 0.2.1   | Spark 3.2                 | 不依赖于               |
| 0.1.2   | Spark 3.2                 | 不依赖于               |
## 安装与设置 {#installation--setup}

要将 ClickHouse 与 Spark 集成，有多种安装选项以适应不同的项目设置。您可以直接在项目的构建文件中将 ClickHouse Spark 连接器作为依赖项添加（例如，Maven 中的 `pom.xml` 或 SBT 中的 `build.sbt`）。或者，您可以将所需的 JAR 文件放入 `$SPARK_HOME/jars/` 文件夹中，或者在 `spark-submit` 命令中直接使用 `--jars` 标志传递它们。这两种方法都确保 ClickHouse 连接器在您的 Spark 环境中可用。
### 作为依赖项导入 {#import-as-a-dependency}

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

如果您想使用 SNAPSHOT 版本，请添加以下存储库。

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

如果您想使用 SNAPSHOT 版本，请添加以下存储库：

```gradle
repositories {
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

当使用 Spark 的 shell 选项（Spark SQL CLI、Spark Shell CLI 和 Spark Submit 命令）时，可以通过传递所需的 jars 注册依赖项：

```text
$SPARK_HOME/bin/spark-sql \
  --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
```

如果您想避免将 JAR 文件复制到 Spark 客户端节点，可以使用以下命令：

```text
  --repositories https://{maven-central-mirror or private-nexus-repo} \
  --packages com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }},com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}:all
```

注意：对于仅使用 SQL 的用例，建议使用 [Apache Kyuubi](https://github.com/apache/kyuubi) 进行生产。

</TabItem>
</Tabs>
### 下载库 {#download-the-library}

二进制 JAR 的命名模式是：

```bash
clickhouse-spark-runtime-${spark_binary_version}_${scala_binary_version}-${version}.jar
```

您可以在 [Maven Central Repository](https://repo1.maven.org/maven2/com/clickhouse/spark/) 找到所有可用的已发布 JAR 文件，以及在 [Sonatype OSS Snapshots Repository](https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/) 找到所有每日构建的 SNAPSHOT JAR 文件。

:::important
务必包含具有 "all" 分类器的 [clickhouse-jdbc JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)，因为连接器依赖于 [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client) 和 [clickhouse-client](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client) — 这两者都捆绑在 clickhouse-jdbc:all 中。或者，如果您不想使用完整的 JDBC 包，您可以单独添加 [clickhouse-client JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client) 和 [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)。

无论如何，请确保根据 [兼容性矩阵](#compatibility-matrix) 确保包版本兼容。
:::
## 注册目录（必需） {#register-the-catalog-required}

为了访问 ClickHouse 表，您必须使用以下配置配置新的 Spark 目录：

| 属性                                         | 值                                       | 默认值         | 必需   |
|----------------------------------------------|------------------------------------------|----------------|--------|
| `spark.sql.catalog.<catalog_name>`           | `com.clickhouse.spark.ClickHouseCatalog` | N/A            | 是     |
| `spark.sql.catalog.<catalog_name>.host`      | `<clickhouse_host>`                      | `localhost`    | 否     |
| `spark.sql.catalog.<catalog_name>.protocol`  | `http`                                   | `http`         | 否     |
| `spark.sql.catalog.<catalog_name>.http_port` | `<clickhouse_port>`                      | `8123`         | 否     |
| `spark.sql.catalog.<catalog_name>.user`      | `<clickhouse_username>`                  | `default`      | 否     |
| `spark.sql.catalog.<catalog_name>.password`  | `<clickhouse_password>`                  | (空字符串)     | 否     |
| `spark.sql.catalog.<catalog_name>.database`  | `<database>`                             | `default`      | 否     |
| `spark.<catalog_name>.write.format`          | `json`                                   | `arrow`        | 否     |

这些设置可以通过以下方式进行设置：

* 编辑/创建 `spark-defaults.conf`。
* 将配置传递给您的 `spark-submit` 命令（或传递给您的 `spark-shell`/`spark-sql` CLI 命令）。
* 在初始化上下文时添加配置。

:::important
在使用 ClickHouse 集群时，您需要为每个实例设置一个唯一的目录名称。
例如：

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

通过这种方式，您将能够通过 `clickhouse1.<ck_db>.<ck_table>` 从 Spark SQL 访问 clickhouse1 表 `<ck_db>.<ck_table>`，并通过 `clickhouse2.<ck_db>.<ck_table>` 访问 clickhouse2 表 `<ck_db>.<ck_table>`。

:::
## 读取数据 {#read-data}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
public static void main(String[] args) {
        // 创建 Spark 会话
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
## 写入数据 {#write-data}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
 public static void main(String[] args) throws AnalysisException {

        // 创建 Spark 会话
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

        // 定义 DataFrame 的模式
        StructType schema = new StructType(new StructField[]{
                DataTypes.createStructField("id", DataTypes.IntegerType, false),
                DataTypes.createStructField("name", DataTypes.StringType, false),
        });


        List<Row> data = Arrays.asList(
                RowFactory.create(1, "Alice"),
                RowFactory.create(2, "Bob")
        );

        // 创建 DataFrame
        Dataset<Row> df = spark.createDataFrame(data, schema);

        df.writeTo("clickhouse.default.example_table").append();

        spark.stop();
    }
```

</TabItem>
<TabItem value="Scala" label="Scala">

```java
object NativeSparkWrite extends App {
  // 创建 Spark 会话
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

  // 定义 DataFrame 的模式
  val rows = Seq(Row(1, "John"), Row(2, "Doe"))

  val schema = List(
    StructField("id", DataTypes.IntegerType, nullable = false),
    StructField("name", StringType, nullable = true)
  )
  // 创建 DataFrame
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


# 随便使用任何其他满足上面提供的兼容性矩阵的包组合。
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


# 创建 DataFrame
data = [Row(id=11, name="John"), Row(id=12, name="Doe")]
df = spark.createDataFrame(data)


# 将 DataFrame 写入 ClickHouse
df.writeTo("clickhouse.default.example_table").append()

```

</TabItem>
<TabItem value="SparkSQL" label="Spark SQL">

```sql
    -- resultTalbe 是我们希望插入到 clickhouse.default.example_table 的 Spark 中间 df
   INSERT INTO TABLE clickhouse.default.example_table
                SELECT * FROM resultTable;
                
```

</TabItem>
</Tabs>
## DDL 操作 {#ddl-operations}

您可以使用 Spark SQL 对 ClickHouse 实例执行 DDL 操作，所有更改立即持久化到 ClickHouse。
Spark SQL 允许您像在 ClickHouse 中一样编写查询，因此您可以直接执行 SQL 命令，例如 CREATE TABLE、TRUNCATE 等，无需修改。例如：

```sql

use clickhouse; 

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

上述示例演示了 Spark SQL 查询，您可以在应用程序的任何 API 中运行这些查询——Java、Scala、PySpark 或 shell。
## 配置 {#configurations}

以下是在连接器中可调节的配置：

<br/>

| 键                                                | 默认                                                | 描述                                                                                                                                                                                                                                                                                                                                                                                                       | 自版本 |
|----------------------------------------------------|--------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------|
| spark.clickhouse.ignoreUnsupportedTransform        | false                                                  | ClickHouse支持使用复杂表达式作为分片键或分区值，例如`cityHash64(col_1, col_2)`，而这在Spark中当前不支持。如果为`true`，则忽略不支持的表达式；否则快速失败并抛出异常。请注意，当`spark.clickhouse.write.distributed.convertLocal`启用时，忽略不支持的分片键可能会损坏数据。                            | 0.4.0 |
| spark.clickhouse.read.compression.codec            | lz4                                                    | 用于读取数据时解压缩的编解码器。支持的编解码器：none, lz4。                                                                                                                                                                                                                                                                                                                                               | 0.5.0 |
| spark.clickhouse.read.distributed.convertLocal     | true                                                   | 在读取分布式表时，读取本地表，而不是自身。如果为`true`，则忽略`spark.clickhouse.read.distributed.useClusterNodes`。                                                                                                                                                                                                                                                                                    | 0.1.0 |
| spark.clickhouse.read.fixedStringAs                | binary                                                 | 将ClickHouse FixedString类型读取为指定的Spark数据类型。支持的类型：binary, string                                                                                                                                                                                                                                                                                                                  | 0.8.0 |
| spark.clickhouse.read.format                       | json                                                   | 读取时的序列化格式。支持的格式：json, binary                                                                                                                                                                                                                                                                                                                                                         | 0.6.0 |
| spark.clickhouse.read.runtimeFilter.enabled        | false                                                  | 启用读取时的运行时过滤器。                                                                                                                                                                                                                                                                                                                                                                               | 0.8.0 |
| spark.clickhouse.read.splitByPartitionId           | true                                                   | 如果为`true`，通过虚拟列`_partition_id`构造输入分区过滤器，而不是分区值。已知存在通过分区值组装SQL谓词的问题。此功能要求ClickHouse Server v21.6+                                                                                                                                                                             | 0.4.0 |
| spark.clickhouse.useNullableQuerySchema            | false                                                  | 如果为`true`，在执行`CREATE/REPLACE TABLE ... AS SELECT ...`时，将查询模式的所有字段标记为nullable以创建表。请注意，此配置要求SPARK-43390（在Spark 3.5中可用），如果没有此补丁，则始终作为`true`执行。                                                                                                                                             | 0.8.0 |
| spark.clickhouse.write.batchSize                   | 10000                                                  | 向ClickHouse写入时每批次的记录数。                                                                                                                                                                                                                                                                                                                                                                       | 0.1.0 |
| spark.clickhouse.write.compression.codec           | lz4                                                    | 用于写入数据时压缩的编解码器。支持的编解码器：none, lz4。                                                                                                                                                                                                                                                                                                                                               | 0.3.0 |
| spark.clickhouse.write.distributed.convertLocal    | false                                                  | 在写入分布式表时，写入本地表，而不是自身。如果为`true`，则忽略`spark.clickhouse.write.distributed.useClusterNodes`。                                                                                                                                                                                                                                                                                    | 0.1.0 |
| spark.clickhouse.write.distributed.useClusterNodes | true                                                   | 写入分布式表时，写入集群中的所有节点。                                                                                                                                                                                                                                                                                                                                                                | 0.1.0 |
| spark.clickhouse.write.format                      | arrow                                                  | 写入时的序列化格式。支持的格式：json, arrow                                                                                                                                                                                                                                                                                                                                                           | 0.4.0 |
| spark.clickhouse.write.localSortByKey              | true                                                   | 如果为`true`，在写入前按排序键进行本地排序。                                                                                                                                                                                                                                                                                                                                                             | 0.3.0 |
| spark.clickhouse.write.localSortByPartition        | spark.clickhouse.write.repartitionByPartition的值     | 如果为`true`，在写入前按分区进行本地排序。如果未设置，则等于`spark.clickhouse.write.repartitionByPartition`。                                                                                                                                                                                                                                                                                       | 0.3.0 |
| spark.clickhouse.write.maxRetry                    | 3                                                      | 对于单个批次写入失败的最大重试次数，使用可重试的代码。                                                                                                                                                                                                                                                                                                                                                      | 0.1.0 |
| spark.clickhouse.write.repartitionByPartition      | true                                                   | 是否按ClickHouse分区键重新分区数据，以满足写入前ClickHouse表的分布。                                                                                                                                                                                                                                                                                         | 0.3.0 |
| spark.clickhouse.write.repartitionNum              | 0                                                      | 在写入前必须重新分区数据以满足ClickHouse表的分布，使用此配置指定重新分区的数量，值小于1表示无要求。                                                                                                                                                                                                                                                | 0.1.0 |
| spark.clickhouse.write.repartitionStrictly         | false                                                  | 如果为`true`，Spark将严格在分区之间分配传入记录，以满足所需的分布，然后再将记录传递给数据源表进行写入。否则，Spark可能会应用某些优化来加速查询，但破坏分布要求。请注意，此配置要求SPARK-37523（在Spark 3.4中可用），没有此补丁时始终作为`true`执行。                                          | 0.3.0 |
| spark.clickhouse.write.retryInterval               | 10s                                                    | 写入重试之间的间隔，单位为秒。                                                                                                                                                                                                                                                                                                                                                                          | 0.1.0 |
| spark.clickhouse.write.retryableErrorCodes         | 241                                                    | 写入失败时ClickHouse服务器返回的可重试错误代码。                                                                                                                                                                                                                                                                                                                                                         | 0.1.0 |

## 支持的数据类型 {#supported-data-types}

本节概述了Spark和ClickHouse之间的数据类型映射。以下表格提供了从ClickHouse读取到Spark以及从Spark插入到ClickHouse时转换数据类型的快速参考。

### 从ClickHouse读取数据到Spark {#reading-data-from-clickhouse-into-spark}

| ClickHouse数据类型                                              | Spark数据类型                | 支持      | 是否为原始类型 | 备注                                              |
|-------------------------------------------------------------------|--------------------------------|-----------|--------------|----------------------------------------------------|
| `Nothing`                                                         | `NullType`                     | ✅         | 是          |                                                    |
| `Bool`                                                            | `BooleanType`                  | ✅         | 是          |                                                    |
| `UInt8`, `Int16`                                                  | `ShortType`                    | ✅         | 是          |                                                    |
| `Int8`                                                            | `ByteType`                     | ✅         | 是          |                                                    |
| `UInt16`,`Int32`                                                  | `IntegerType`                  | ✅         | 是          |                                                    |
| `UInt32`,`Int64`, `UInt64`                                        | `LongType`                     | ✅         | 是          |                                                    |
| `Int128`,`UInt128`, `Int256`, `UInt256`                           | `DecimalType(38, 0)`           | ✅         | 是          |                                                    |
| `Float32`                                                         | `FloatType`                    | ✅         | 是          |                                                    |
| `Float64`                                                         | `DoubleType`                   | ✅         | 是          |                                                    |
| `String`, `JSON`, `UUID`, `Enum8`, `Enum16`, `IPv4`, `IPv6`       | `StringType`                   | ✅         | 是          |                                                    |
| `FixedString`                                                     | `BinaryType`, `StringType`     | ✅         | 是          | 由配置`READ_FIXED_STRING_AS`控制                    |
| `Decimal`                                                         | `DecimalType`                  | ✅         | 是          | 精度和刻度最高可达`Decimal128`                      |
| `Decimal32`                                                       | `DecimalType(9, scale)`        | ✅         | 是          |                                                    |
| `Decimal64`                                                       | `DecimalType(18, scale)`       | ✅         | 是          |                                                    |
| `Decimal128`                                                      | `DecimalType(38, scale)`       | ✅         | 是          |                                                    |
| `Date`, `Date32`                                                  | `DateType`                     | ✅         | 是          |                                                    |
| `DateTime`, `DateTime32`, `DateTime64`                            | `TimestampType`                | ✅         | 是          |                                                    |
| `Array`                                                           | `ArrayType`                    | ✅         | 否          | 数组元素类型也被转换                               |
| `Map`                                                             | `MapType`                      | ✅         | 否          | 键限于`StringType`                                 |
| `IntervalYear`                                                    | `YearMonthIntervalType(Year)`  | ✅         | 是          |                                                    |
| `IntervalMonth`                                                   | `YearMonthIntervalType(Month)` | ✅         | 是          |                                                    |
| `IntervalDay`, `IntervalHour`, `IntervalMinute`, `IntervalSecond` | `DayTimeIntervalType`          | ✅         | 否          | 使用特定的时间间隔类型                             |
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

### 从Spark插入数据到ClickHouse {#inserting-data-from-spark-into-clickhouse}

| Spark数据类型                     | ClickHouse数据类型 | 支持      | 是否为原始类型 | 备注                                             |
|-------------------------------------|----------------------|-----------|--------------|---------------------------------------------------|
| `BooleanType`                       | `UInt8`              | ✅         | 是          |                                                   |
| `ByteType`                          | `Int8`               | ✅         | 是          |                                                   |
| `ShortType`                         | `Int16`              | ✅         | 是          |                                                   |
| `IntegerType`                       | `Int32`              | ✅         | 是          |                                                   |
| `LongType`                          | `Int64`              | ✅         | 是          |                                                   |
| `FloatType`                         | `Float32`            | ✅         | 是          |                                                   |
| `DoubleType`                        | `Float64`            | ✅         | 是          |                                                   |
| `StringType`                        | `String`             | ✅         | 是          |                                                   |
| `VarcharType`                       | `String`             | ✅         | 是          |                                                   |
| `CharType`                          | `String`             | ✅         | 是          |                                                   |
| `DecimalType`                       | `Decimal(p, s)`      | ✅         | 是          | 精度和刻度最高可达`Decimal128`                     |
| `DateType`                          | `Date`               | ✅         | 是          |                                                   |
| `TimestampType`                     | `DateTime`           | ✅         | 是          |                                                   |
| `ArrayType` (list, tuple, or array) | `Array`              | ✅         | 否          | 数组元素类型也被转换                             |
| `MapType`                           | `Map`                | ✅         | 否          | 键限于`StringType`                                 |
| `Object`                            |                      | ❌         |              |                                                   |
| `Nested`                            |                      | ❌         |              |                                                   |

## 贡献与支持 {#contributing-and-support}

如果您希望为项目贡献或报告任何问题，欢迎您的反馈！
请访问我们的 [GitHub 仓库](https://github.com/ClickHouse/spark-clickhouse-connector) 来打开问题，建议改进或提交补丁请求。
欢迎贡献！请在开始之前查看仓库中的贡献指南。
感谢您为改善我们的ClickHouse Spark连接器所做的贡献！
