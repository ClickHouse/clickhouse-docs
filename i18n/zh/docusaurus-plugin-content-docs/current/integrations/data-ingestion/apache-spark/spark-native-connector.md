---
sidebar_label: 'Spark 原生连接器'
sidebar_position: 2
slug: /integrations/apache-spark/spark-native-connector
description: 'Apache Spark 与 ClickHouse 集成简介'
keywords: ['clickhouse', 'Apache Spark', 'migrating', 'data']
title: 'Spark 连接器'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';


# Spark 连接器

该连接器利用 ClickHouse 特有的优化能力，例如高级分区和谓词下推，以提升查询性能和数据处理效率。
该连接器基于 [ClickHouse 官方 JDBC 连接器](https://github.com/ClickHouse/clickhouse-java)，并管理其自身的 catalog。

在 Spark 3.0 之前，Spark 缺少内置的 catalog 概念，因此用户通常依赖 Hive Metastore 或 AWS Glue 等外部 catalog 系统。
使用这些外部方案时，用户必须在 Spark 中访问数据之前手动注册其数据源表。
但是，自 Spark 3.0 引入 catalog 概念后，Spark 现在可以通过注册 catalog 插件自动发现表。

Spark 的默认 catalog 为 `spark_catalog`，表通过 `{catalog name}.{database}.{table}` 来标识。借助新的 catalog 功能，现在可以在单个 Spark 应用中添加并使用多个 catalog。

<TOCInline toc={toc}></TOCInline>



## 要求 {#requirements}

- Java 8 或 17
- Scala 2.12 或 2.13
- Apache Spark 3.3 或 3.4 或 3.5


## 兼容性矩阵 {#compatibility-matrix}

| 版本    | 兼容的 Spark 版本         | ClickHouse JDBC 版本    |
| ------- | ------------------------- | ----------------------- |
| main    | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.8.1   | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.8.0   | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.7.3   | Spark 3.3, 3.4            | 0.4.6                   |
| 0.6.0   | Spark 3.3                 | 0.3.2-patch11           |
| 0.5.0   | Spark 3.2, 3.3            | 0.3.2-patch11           |
| 0.4.0   | Spark 3.2, 3.3            | 无依赖           |
| 0.3.0   | Spark 3.2, 3.3            | 无依赖           |
| 0.2.1   | Spark 3.2                 | 无依赖           |
| 0.1.2   | Spark 3.2                 | 无依赖           |


## 安装与配置 {#installation--setup}

要将 ClickHouse 与 Spark 集成,有多种安装方式可适配不同的项目配置。
您可以直接在项目的构建文件中将 ClickHouse Spark 连接器添加为依赖项(例如 Maven 的 `pom.xml` 或 SBT 的 `build.sbt`)。
或者,您可以将所需的 JAR 文件放入 `$SPARK_HOME/jars/` 目录,或在 `spark-submit` 命令中使用 `--jars` 标志直接传递。
这两种方式都能确保 ClickHouse 连接器在您的 Spark 环境中可用。

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

如需使用 SNAPSHOT 版本,请添加以下仓库。

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

如需使用 SNAPSHOT 版本,请添加以下仓库:

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

使用 Spark 的 shell 工具(Spark SQL CLI、Spark Shell CLI 和 Spark Submit 命令)时,可以通过传递所需的 jar 文件来注册依赖项:

```text
$SPARK_HOME/bin/spark-sql \
  --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
```

如需避免将 JAR 文件复制到 Spark 客户端节点,可以使用以下方式:

```text
  --repositories https://{maven-central-mirror or private-nexus-repo} \
  --packages com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }},com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}
```

注意:对于纯 SQL 使用场景,建议在生产环境中使用 [Apache Kyuubi](https://github.com/apache/kyuubi)。

</TabItem>
</Tabs>

### 下载库文件 {#download-the-library}

二进制 JAR 文件的命名模式为:

```bash
clickhouse-spark-runtime-${spark_binary_version}_${scala_binary_version}-${version}.jar
```

您可以在 [Maven 中央仓库](https://repo1.maven.org/maven2/com/clickhouse/spark/)中找到所有已发布的 JAR 文件,
在 [Sonatype OSS Snapshots 仓库](https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/)中找到所有每日构建的 SNAPSHOT JAR 文件。


:::important
务必包含带有 `all` 分类器的 [clickhouse-jdbc JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)，
因为该连接器依赖于 [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)
和 [clickhouse-client](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)——这两者都已打包在
clickhouse-jdbc:all 中。
或者，如果你不想使用完整的 JDBC 包，也可以分别添加 [clickhouse-client JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)
和 [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)。

无论采用哪种方式，请确保各个包的版本与
[兼容性矩阵](#compatibility-matrix) 中的要求兼容。
:::



## 注册目录(必需) {#register-the-catalog-required}

要访问 ClickHouse 表,您必须使用以下配置项配置一个新的 Spark 目录:

| 属性                                     | 值                                    | 默认值  | 必需 |
| -------------------------------------------- | ---------------------------------------- | -------------- | -------- |
| `spark.sql.catalog.<catalog_name>`           | `com.clickhouse.spark.ClickHouseCatalog` | N/A            | 是      |
| `spark.sql.catalog.<catalog_name>.host`      | `<clickhouse_host>`                      | `localhost`    | 否       |
| `spark.sql.catalog.<catalog_name>.protocol`  | `http`                                   | `http`         | 否       |
| `spark.sql.catalog.<catalog_name>.http_port` | `<clickhouse_port>`                      | `8123`         | 否       |
| `spark.sql.catalog.<catalog_name>.user`      | `<clickhouse_username>`                  | `default`      | 否       |
| `spark.sql.catalog.<catalog_name>.password`  | `<clickhouse_password>`                  | (空字符串) | 否       |
| `spark.sql.catalog.<catalog_name>.database`  | `<database>`                             | `default`      | 否       |
| `spark.<catalog_name>.write.format`          | `json`                                   | `arrow`        | 否       |

这些配置可以通过以下方式之一进行设置:

- 编辑/创建 `spark-defaults.conf`。
- 将配置传递给 `spark-submit` 命令(或 `spark-shell`/`spark-sql` CLI 命令)。
- 在初始化上下文时添加配置。

:::important
使用 ClickHouse 集群时,需要为每个实例设置唯一的目录名称。
例如:

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

这样,您就可以在 Spark SQL 中通过 `clickhouse1.<ck_db>.<ck_table>` 访问 clickhouse1 的表 `<ck_db>.<ck_table>`,通过 `clickhouse2.<ck_db>.<ck_table>` 访问 clickhouse2 的表 `<ck_db>.<ck_table>`。

:::


## ClickHouse Cloud 设置 {#clickhouse-cloud-settings}

连接到 [ClickHouse Cloud](https://clickhouse.com) 时,请确保启用 SSL 并设置相应的 SSL 模式。例如:

```text
spark.sql.catalog.clickhouse.option.ssl        true
spark.sql.catalog.clickhouse.option.ssl_mode   NONE
```


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

        // 定义 DataFrame 的 schema
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

  // 定义 DataFrame 的 schema
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

```


# 你也可以自由使用符合上述兼容性矩阵要求的任意其他包组合。
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

````

</TabItem>
<TabItem value="SparkSQL" label="Spark SQL">

```sql
    -- resultTable 是我们要插入到 clickhouse.default.example_table 的 Spark 中间 DataFrame
   INSERT INTO TABLE clickhouse.default.example_table
                SELECT * FROM resultTable;

````

</TabItem>
</Tabs>


## DDL 操作 {#ddl-operations}

您可以使用 Spark SQL 在 ClickHouse 实例上执行 DDL 操作,所有更改都会立即持久化到 ClickHouse 中。
Spark SQL 允许您像在 ClickHouse 中一样编写查询,因此您可以直接执行 CREATE TABLE、TRUNCATE 等命令而无需修改,例如:

:::note
使用 Spark SQL 时,每次只能执行一条语句。
:::

```sql
USE clickhouse;
```

```sql

CREATE TABLE test_db.tbl_sql (
  create_time TIMESTAMP NOT NULL,
  m           INT       NOT NULL COMMENT '分区键',
  id          BIGINT    NOT NULL COMMENT '排序键',
  value       STRING
) USING ClickHouse
PARTITIONED BY (m)
TBLPROPERTIES (
  engine = 'MergeTree()',
  order_by = 'id',
  settings.index_granularity = 8192
);
```

以上示例演示了 Spark SQL 查询,您可以在应用程序中使用任何 API(Java、Scala、PySpark 或 shell)来运行这些查询。


## 配置项 {#configurations}

连接器中可调整的配置项如下：

<br />


| 键                                                  | 默认                                               | 说明                                                                                                                                                                                                                               | 自     |
| -------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| spark.clickhouse.ignoreUnsupportedTransform        | false                                            | ClickHouse 支持使用复杂表达式作为分片键或分区值，例如：`cityHash64(col_1, col_2)`，当前 Spark 尚不支持。如果`true`，忽略这些不受支持的表达式；否则，将抛出异常并快速失败。请注意，当`spark.clickhouse.write.distributed.convertLocal`在启用时，忽略不受支持的分片键可能会破坏数据。                                      | 0.4.0 |
| spark.clickhouse.read.compression.codec            | lz4                                              | 用于在读取时解压数据的编解码器（codec）。支持的编解码器：`none`、`lz4`。                                                                                                                                                                                     | 0.5.0 |
| spark.clickhouse.read.distributed.convertLocal     | true                                             | 在读取 Distributed 表时，改为读取本地表而不是它自身。如果`true`, 忽略`spark.clickhouse.read.distributed.useClusterNodes`读取 Distributed 表时，改为读取其本地表而非 Distributed 表本身。若为 `true`，则忽略 `spark.clickhouse.read.distributed.useClusterNodes`。                  | 0.1.0 |
| spark.clickhouse.read.fixedStringAs                | 二进制                                              | 将 ClickHouse 的 FixedString 类型按指定的 Spark 数据类型进行读取。支持的类型：binary、string                                                                                                                                                             | 0.8.0 |
| spark.clickhouse.read.format                       | json                                             | 读取时使用的序列化格式。支持的格式：JSON、Binary                                                                                                                                                                                                    | 0.6.0 |
| spark.clickhouse.read.runtimeFilter.enabled        | false                                            | 为读取启用运行时过滤。                                                                                                                                                                                                                      | 0.8.0 |
| spark.clickhouse.read.splitByPartitionId           | true                                             | 如果`true`，通过虚拟列构建输入分区过滤器`_partition_id`，而不是按分区值。已知在按分区值构造 SQL 谓词时存在问题。此功能需要 ClickHouse Server v21.6+。                                                                                                                             | 0.4.0 |
| spark.clickhouse.useNullableQuerySchema            | false                                            | 如果`true`，在执行时将查询模式中的所有字段标记为可为空`CREATE/REPLACE TABLE ... AS SELECT ...`在创建表时。请注意，此配置依赖于 SPARK-43390（在 Spark 3.5 中提供），如果没有该补丁，它始终表现为`true`.                                                                                        | 0.8.0 |
| spark.clickhouse.write.batchSize                   | 10000                                            | 写入 ClickHouse 时每个批次的记录数。                                                                                                                                                                                                         | 0.1.0 |
| spark.clickhouse.write.compression.codec           | lz4                                              | 用于在写入时压缩数据的 `codec`。支持的 `codec` 有：`none`、`lz4`。                                                                                                                                                                                  | 0.3.0 |
| spark.clickhouse.write.distributed.convertLocal    | false                                            | 在向 `Distributed` 表写入数据时，改为向其对应的本地表写入。若`true`，若为 `true` 则忽略`spark.clickhouse.write.distributed.useClusterNodes`写入 Distributed 表时，写入其对应的本地表而不是 Distributed 表本身。若为 `true`，则忽略 `spark.clickhouse.write.distributed.useClusterNodes`。 | 0.1.0 |
| spark.clickhouse.write.distributed.useClusterNodes | true                                             | 在向 Distributed 表写入时，将数据写入集群中的所有节点。                                                                                                                                                                                               | 0.1.0 |
| spark.clickhouse.write.format                      | arrow                                            | 用于写入的序列化格式。支持的格式：JSON、Arrow                                                                                                                                                                                                      | 0.4.0 |
| spark.clickhouse.write.localSortByKey              | true                                             | 如果`true`，则在写入前按排序键在本地进行排序。                                                                                                                                                                                                       | 0.3.0 |
| spark.clickhouse.write.localSortByPartition        | spark.clickhouse.write.repartitionByPartition 的值 | 如果`true`，则在写入前按分区进行本地排序。如果未设置，则等同于`spark.clickhouse.write.repartitionByPartition`如果为 `true`，则在写入前按分区在本地进行排序。若未设置，则其值等同于 `spark.clickhouse.write.repartitionByPartition`。                                                         | 0.3.0 |
| spark.clickhouse.write.maxRetry                    | 3                                                | 针对因可重试错误码而失败的单次批量写入操作，所进行重试的最大次数。                                                                                                                                                                                                | 0.1.0 |
| spark.clickhouse.write.repartitionByPartition      | true                                             | 在写入前，是否需要按照 ClickHouse 分区键重新分区数据，以匹配 ClickHouse 表的分布方式。                                                                                                                                                                          | 0.3.0 |
| spark.clickhouse.write.repartitionNum              | 0                                                | 在写入前需要根据 ClickHouse 表的分布要求对数据进行重新分区，使用此配置指定重新分区的数量，值小于 1 表示无此要求。                                                                                                                                                                 | 0.1.0 |
| spark.clickhouse.write.repartitionStrictly         | false                                            | 如果`true`，Spark 会在写入前严格地将传入记录分布到各个分区，以满足所需的分布要求，然后再将记录传递给数据源表。否则，Spark 可能会应用某些优化来加速查询，但会破坏该分布要求。注意，此配置依赖于 SPARK-37523（在 Spark 3.4 中可用），如果没有这个补丁，它的行为始终等同于`true`.                                                                  | 0.3.0 |
| spark.clickhouse.write.retryInterval               | 10秒                                              | 写入重试之间的时间间隔（秒）。                                                                                                                                                                                                                  | 0.1.0 |
| spark.clickhouse.write.retryableErrorCodes         | 241                                              | 写入失败时由 ClickHouse 服务器返回的可重试错误代码。                                                                                                                                                                                                 | 0.1.0 |





## 支持的数据类型 {#supported-data-types}

本节概述 Spark 与 ClickHouse 之间的数据类型映射。下表可作为在从 ClickHouse 读取数据到 Spark 以及将 Spark 中的数据写入 ClickHouse 时进行数据类型转换的快速参考。

### 从 ClickHouse 读取数据到 Spark {#reading-data-from-clickhouse-into-spark}

| ClickHouse 数据类型                                               | Spark 数据类型                 | 是否支持  | 是否为原始类型 | 说明                                               |
| ----------------------------------------------------------------- | ------------------------------ | --------- | ------------ | -------------------------------------------------- |
| `Nothing`                                                         | `NullType`                     | ✅        | 是           |                                                    |
| `Bool`                                                            | `BooleanType`                  | ✅        | 是           |                                                    |
| `UInt8`, `Int16`                                                  | `ShortType`                    | ✅        | 是           |                                                    |
| `Int8`                                                            | `ByteType`                     | ✅        | 是           |                                                    |
| `UInt16`,`Int32`                                                  | `IntegerType`                  | ✅        | 是           |                                                    |
| `UInt32`,`Int64`, `UInt64`                                        | `LongType`                     | ✅        | 是           |                                                    |
| `Int128`,`UInt128`, `Int256`, `UInt256`                           | `DecimalType(38, 0)`           | ✅        | 是           |                                                    |
| `Float32`                                                         | `FloatType`                    | ✅        | 是           |                                                    |
| `Float64`                                                         | `DoubleType`                   | ✅        | 是           |                                                    |
| `String`, `JSON`, `UUID`, `Enum8`, `Enum16`, `IPv4`, `IPv6`       | `StringType`                   | ✅        | 是           |                                                    |
| `FixedString`                                                     | `BinaryType`, `StringType`     | ✅        | 是           | 由配置项 `READ_FIXED_STRING_AS` 控制               |
| `Decimal`                                                         | `DecimalType`                  | ✅        | 是           | 精度和小数位数最高支持到 `Decimal128`             |
| `Decimal32`                                                       | `DecimalType(9, scale)`        | ✅        | 是           |                                                    |
| `Decimal64`                                                       | `DecimalType(18, scale)`       | ✅        | 是           |                                                    |
| `Decimal128`                                                      | `DecimalType(38, scale)`       | ✅        | 是           |                                                    |
| `Date`, `Date32`                                                  | `DateType`                     | ✅        | 是           |                                                    |
| `DateTime`, `DateTime32`, `DateTime64`                            | `TimestampType`                | ✅        | 是           |                                                    |
| `Array`                                                           | `ArrayType`                    | ✅        | 否           | 数组元素类型也会被转换                             |
| `Map`                                                             | `MapType`                      | ✅        | 否           | 键类型仅限为 `StringType`                          |
| `IntervalYear`                                                    | `YearMonthIntervalType(Year)`  | ✅        | 是           |                                                    |
| `IntervalMonth`                                                   | `YearMonthIntervalType(Month)` | ✅        | 是           |                                                    |
| `IntervalDay`, `IntervalHour`, `IntervalMinute`, `IntervalSecond` | `DayTimeIntervalType`          | ✅        | 否           | 会使用具体的时间区间类型                           |
| `Object`                                                          |                                | ❌        |              |                                                    |
| `Nested`                                                          |                                | ❌        |              |                                                    |
| `Tuple`                                                           |                                | ❌        |              |                                                    |
| `Point`                                                           |                                | ❌        |              |                                                    |
| `Polygon`                                                         |                                | ❌        |              |                                                    |
| `MultiPolygon`                                                    |                                | ❌        |              |                                                    |
| `Ring`                                                            |                                | ❌        |              |                                                    |
| `IntervalQuarter`                                                 |                                | ❌        |              |                                                    |
| `IntervalWeek`                                                    |                                | ❌        |              |                                                    |
| `Decimal256`                                                      |                                | ❌        |              |                                                    |
| `AggregateFunction`                                               |                                | ❌        |              |                                                    |
| `SimpleAggregateFunction`                                         |                                | ❌        |              |                                                    |

### 将 Spark 中的数据写入 ClickHouse {#inserting-data-from-spark-into-clickhouse}


| Spark 数据类型                      | ClickHouse 数据类型  | 是否支持   | 是否为原始类型 | 说明                                       |
|-------------------------------------|----------------------|-----------|--------------|--------------------------------------------|
| `BooleanType`                       | `UInt8`              | ✅         | 是           |                                            |
| `ByteType`                          | `Int8`               | ✅         | 是           |                                            |
| `ShortType`                         | `Int16`              | ✅         | 是           |                                            |
| `IntegerType`                       | `Int32`              | ✅         | 是           |                                            |
| `LongType`                          | `Int64`              | ✅         | 是           |                                            |
| `FloatType`                         | `Float32`            | ✅         | 是           |                                            |
| `DoubleType`                        | `Float64`            | ✅         | 是           |                                            |
| `StringType`                        | `String`             | ✅         | 是           |                                            |
| `VarcharType`                       | `String`             | ✅         | 是           |                                            |
| `CharType`                          | `String`             | ✅         | 是           |                                            |
| `DecimalType`                       | `Decimal(p, s)`      | ✅         | 是           | 精度和小数位数最高支持到 `Decimal128`      |
| `DateType`                          | `Date`               | ✅         | 是           |                                            |
| `TimestampType`                     | `DateTime`           | ✅         | 是           |                                            |
| `ArrayType`（list、tuple 或 array） | `Array`              | ✅         | 否           | 数组元素类型也会被转换                     |
| `MapType`                           | `Map`                | ✅         | 否           | 键类型仅限于 `StringType`                 |
| `Object`                            |                      | ❌         |              |                                            |
| `Nested`                            |                      | ❌         |              |                                            |



## 贡献与支持 {#contributing-and-support}

如果您希望为项目做出贡献或报告问题,我们欢迎您的参与!
访问我们的 [GitHub 仓库](https://github.com/ClickHouse/spark-clickhouse-connector)以提交问题(issue)、提出改进建议或提交拉取请求(pull request)。
我们欢迎各种形式的贡献!在开始之前,请先查看仓库中的贡献指南。
感谢您帮助改进 ClickHouse Spark 连接器!
