---
sidebar_label: 'Spark 原生连接器'
sidebar_position: 2
slug: /integrations/apache-spark/spark-native-connector
description: 'Apache Spark 与 ClickHouse 集成简介'
keywords: ['clickhouse', 'Apache Spark', '迁移', '数据']
title: 'Spark 连接器'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';

# Spark 连接器 {#spark-connector}

此连接器利用 ClickHouse 特有的优化（例如高级分区和谓词下推），以提升查询性能和数据处理效率。
该连接器基于 [ClickHouse 官方 JDBC 连接器](https://github.com/ClickHouse/clickhouse-java)，并管理其自身的 catalog。

在 Spark 3.0 之前，Spark 不具备内置的 catalog 概念，因此用户通常依赖 Hive Metastore 或 AWS Glue 等外部 catalog 系统。
使用这些外部方案时，用户必须在 Spark 中访问数据源表之前，先手动注册这些表。
然而，自从 Spark 3.0 引入 catalog 概念后，Spark 现在可以通过注册 catalog 插件自动发现表。

Spark 的默认 catalog 是 `spark_catalog`，表通过 `{catalog name}.{database}.{table}` 来标识。借助这一新的 catalog 功能，现在可以在单个 Spark 应用中添加并使用多个 catalog。

<TOCInline toc={toc}></TOCInline>

## 先决条件 {#requirements}

- Java 8 或 17（Spark 4.0 需要 Java 17 及以上版本）
- Scala 2.12 或 2.13（Spark 4.0 仅支持 Scala 2.13）
- Apache Spark 3.3、3.4、3.5 或 4.0

## 兼容性矩阵 {#compatibility-matrix}

| 版本    | 兼容的 Spark 版本         | ClickHouse JDBC 版本 |
|---------|---------------------------|----------------------|
| main    | Spark 3.3, 3.4, 3.5, 4.0  | 0.9.4                |
| 0.9.0   | Spark 3.3, 3.4, 3.5, 4.0  | 0.9.4                |
| 0.8.1   | Spark 3.3, 3.4, 3.5       | 0.6.3                |
| 0.7.3   | Spark 3.3, 3.4            | 0.4.6                |
| 0.6.0   | Spark 3.3                 | 0.3.2-patch11        |
| 0.5.0   | Spark 3.2, 3.3            | 0.3.2-patch11        |
| 0.4.0   | Spark 3.2, 3.3            | 无需依赖             |
| 0.3.0   | Spark 3.2, 3.3            | 无需依赖             |
| 0.2.1   | Spark 3.2                 | 无需依赖             |
| 0.1.2   | Spark 3.2                 | 无需依赖             |

## 安装与设置 {#installation--setup}

要将 ClickHouse 与 Spark 集成，有多种安装方式，可适配不同的项目配置。
你可以在项目的构建文件中（例如 Maven 的 `pom.xml` 或 SBT 的 `build.sbt`）直接添加 ClickHouse Spark connector 作为依赖。
或者，你也可以将所需的 JAR 文件放入 `$SPARK_HOME/jars/` 目录，或在运行 `spark-submit` 命令时通过 `--jars` 参数将它们作为 Spark 选项直接传入。
这两种方式都能确保 ClickHouse connector 在你的 Spark 环境中可用。

### 作为依赖导入 {#import-as-a-dependency}

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

如果你需要使用 SNAPSHOT 版本，请添加以下仓库：

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

如果你需要使用 SNAPSHOT 版本，请添加以下仓库：

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

在使用 Spark 的 Shell 选项（Spark SQL CLI、Spark Shell CLI 和 Spark Submit 命令）时，可以通过在命令中传入所需的 JAR 包来注册依赖：

```text
$SPARK_HOME/bin/spark-sql \
  --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
```

如果你希望避免将 JAR 文件复制到 Spark 客户端节点，可以改用以下方式：

```text
  --repositories https://{maven-central-mirror or private-nexus-repo} \
  --packages com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }},com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}
```

注意：对于仅 SQL 的使用场景，生产环境中推荐使用 [Apache Kyuubi](https://github.com/apache/kyuubi)。

</TabItem>
</Tabs>

### 下载库文件 {#download-the-library}

二进制 JAR 的命名模式如下：

```bash
clickhouse-spark-runtime-${spark_binary_version}_${scala_binary_version}-${version}.jar
```

你可以在 [Maven Central Repository](https://repo1.maven.org/maven2/com/clickhouse/spark/) 中找到所有已发布的 JAR 文件，
并在 [Sonatype OSS Snapshots Repository](https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/) 中找到所有每日构建的 SNAPSHOT JAR 文件。

:::important
务必包含带有 &quot;all&quot; 分类器的 [clickhouse-jdbc JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)，
因为该连接器依赖于 [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)
和 [clickhouse-client](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)——这两个依赖都已打包在
clickhouse-jdbc:all 中。
或者，如果你不希望使用完整的 JDBC 包，也可以分别添加 [clickhouse-client JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)
和 [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)。

无论选择哪种方式，请确保这些包的版本彼此兼容，并符合
[兼容性矩阵](#compatibility-matrix) 中的要求。
:::

## 注册 catalog（必需） {#register-the-catalog-required}

要访问 ClickHouse 表，需要使用以下配置创建一个新的 Spark catalog：

| 属性                                           | 值                                        | 默认值            | 是否必需 |
| -------------------------------------------- | ---------------------------------------- | -------------- | ---- |
| `spark.sql.catalog.<catalog_name>`           | `com.clickhouse.spark.ClickHouseCatalog` | N/A            | Yes  |
| `spark.sql.catalog.<catalog_name>.host`      | `<clickhouse_host>`                      | `localhost`    | No   |
| `spark.sql.catalog.<catalog_name>.protocol`  | `http`                                   | `http`         | No   |
| `spark.sql.catalog.<catalog_name>.http_port` | `<clickhouse_port>`                      | `8123`         | No   |
| `spark.sql.catalog.<catalog_name>.user`      | `<clickhouse_username>`                  | `default`      | No   |
| `spark.sql.catalog.<catalog_name>.password`  | `<clickhouse_password>`                  | (empty string) | No   |
| `spark.sql.catalog.<catalog_name>.database`  | `<database>`                             | `default`      | No   |
| `spark.<catalog_name>.write.format`          | `json`                                   | `arrow`        | No   |

可以通过以下任一方式配置这些设置：

* 编辑或创建 `spark-defaults.conf`。
* 在 `spark-submit` 命令中传入配置（或在 `spark-shell` / `spark-sql` CLI 命令中传入）。
* 在初始化上下文时添加配置。

:::important
在使用 ClickHouse 集群时，需要为每个实例设置唯一的 catalog 名称。
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

这样，你就可以在 Spark SQL 中通过 `clickhouse1.<ck_db>.<ck_table>` 访问 clickhouse1 的 `<ck_db>.<ck_table>` 表，并通过 `clickhouse2.<ck_db>.<ck_table>` 访问 clickhouse2 的 `<ck_db>.<ck_table>` 表。

:::

## ClickHouse Cloud 配置 {#clickhouse-cloud-settings}

连接到 [ClickHouse Cloud](https://clickhouse.com) 时，请务必启用 SSL，并设置相应的 SSL 模式。例如：

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

            // 定义 DataFrame 的架构
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

      // 定义 DataFrame 的架构
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

    # 可根据上述兼容性矩阵自由使用任何其他包组合。
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
        -- resultTable 是我们要插入到 clickhouse.default.example_table 中的 Spark 中间数据框
       INSERT INTO TABLE clickhouse.default.example_table
                    SELECT * FROM resultTable;
                    
    ```
  </TabItem>
</Tabs>

## DDL 操作

可以使用 Spark SQL 对 ClickHouse 实例执行 DDL 操作，所有更改都会立即持久化到 ClickHouse 中。
Spark SQL 允许你以与在 ClickHouse 中相同的方式编写查询，
因此可以直接执行诸如 CREATE TABLE、TRUNCATE 等命令——无需修改，例如：

:::note
在使用 Spark SQL 时，每次只能执行一条语句。
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

上述示例展示了 Spark SQL 查询，您可以在应用程序中通过任意 API（Java、Scala、PySpark 或 shell）运行这些查询。

## 配置 {#configurations}

以下是连接器中可配置的参数：

<br/>

| 键                                                  | 默认                                               | 描述                                                                                                                                                                                                 | 自从    |
| -------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| spark.clickhouse.ignoreUnsupportedTransform        | false                                            | ClickHouse 支持将复杂表达式用作分片键或分区值，例如 `cityHash64(col_1, col_2)`，但这些目前在 Spark 中不受支持。若为 `true`，则忽略这些不受支持的表达式，否则将立即失败并抛出异常。注意，当启用 `spark.clickhouse.write.distributed.convertLocal` 时，忽略不受支持的分片键可能会导致数据损坏。 | 0.4.0 |
| spark.clickhouse.read.compression.codec            | lz4                                              | 用于在读取时解压数据的编解码器。支持的编码格式：none、lz4。                                                                                                                                                                  | 0.5.0 |
| spark.clickhouse.read.distributed.convertLocal     | true                                             | 在读取 Distributed 表时，改为读取对应的本地表而不是 Distributed 表本身。若为 `true`，则忽略 `spark.clickhouse.read.distributed.useClusterNodes`。                                                                                | 0.1.0 |
| spark.clickhouse.read.fixedStringAs                | 二进制                                              | 按指定的 Spark 数据类型读取 ClickHouse 的 FixedString 类型。支持的类型：binary、string                                                                                                                                  | 0.8.0 |
| spark.clickhouse.read.format                       | JSON                                             | 读取时使用的序列化格式。支持的格式：JSON、Binary                                                                                                                                                                      | 0.6.0 |
| spark.clickhouse.read.runtimeFilter.enabled        | false                                            | 为读取启用运行时过滤。                                                                                                                                                                                        | 0.8.0 |
| spark.clickhouse.read.splitByPartitionId           | true                                             | 如果为 `true`，则通过虚拟列 `_partition_id` 而不是分区值来构造输入分区过滤条件。通过分区值组装 SQL 谓词已知存在问题。此功能需要 ClickHouse Server v21.6 及以上版本。                                                                                      | 0.4.0 |
| spark.clickhouse.useNullableQuerySchema            | false                                            | 如果设置为 `true`，在创建表时执行 `CREATE/REPLACE TABLE ... AS SELECT ...` 会将查询 schema 中的所有字段都标记为可为空。注意，此配置依赖于 SPARK-43390（在 Spark 3.5 中可用），如果没有该补丁，其行为始终等同于 `true`。                                            | 0.8.0 |
| spark.clickhouse.write.batchSize                   | 10000                                            | 每批写入 ClickHouse 的记录数。                                                                                                                                                                              | 0.1.0 |
| spark.clickhouse.write.compression.codec           | lz4                                              | 用于在写入数据时进行压缩的编解码器。支持的编解码器：none、lz4。                                                                                                                                                                | 0.3.0 |
| spark.clickhouse.write.distributed.convertLocal    | false                                            | 在写入 Distributed 表时，改为写入本地表而不是 Distributed 表本身。若为 `true`，则忽略 `spark.clickhouse.write.distributed.useClusterNodes`。                                                                                  | 0.1.0 |
| spark.clickhouse.write.distributed.useClusterNodes | true                                             | 在写入 Distributed 表时，将数据写入集群中的所有节点。                                                                                                                                                                  | 0.1.0 |
| spark.clickhouse.write.format                      | 箭头                                               | 写入时使用的序列化格式。支持的格式：JSON、Arrow                                                                                                                                                                       | 0.4.0 |
| spark.clickhouse.write.localSortByKey              | true                                             | 如果为 `true`，在写入前按排序键进行本地排序。                                                                                                                                                                         | 0.3.0 |
| spark.clickhouse.write.localSortByPartition        | spark.clickhouse.write.repartitionByPartition 的值 | 如果为 `true`，则在写入前按分区进行本地排序。若未设置，则等同于 `spark.clickhouse.write.repartitionByPartition`。                                                                                                               | 0.3.0 |
| spark.clickhouse.write.maxRetry                    | 3                                                | 对因可重试错误码而失败的单个批量写入操作允许的最大重试次数。                                                                                                                                                                     | 0.1.0 |
| spark.clickhouse.write.repartitionByPartition      | true                                             | 在写入之前，是否根据 ClickHouse 分区键对数据重新分区，以匹配 ClickHouse 表的分区分布。                                                                                                                                            | 0.3.0 |
| spark.clickhouse.write.repartitionNum              | 0                                                | 如果在写入前需要根据 ClickHouse 表的分布对数据进行重新分区，可使用此配置来指定重新分区的分区数；当该值小于 1 时表示对此无要求。                                                                                                                            | 0.1.0 |
| spark.clickhouse.write.repartitionStrictly         | false                                            | 如果为 `true`，Spark 会在写入时将传入记录严格分布到各个分区，以满足所需的分布要求，然后再将记录传递给数据源表。否则，Spark 可能会应用某些优化以加速查询，但可能会破坏分布要求。注意，该配置依赖于补丁 SPARK-37523（在 Spark 3.4 中可用），在没有该补丁时，其行为始终等同于 `true`。                                 | 0.3.0 |
| spark.clickhouse.write.retryInterval               | 10s                                              | 两次写入重试之间的时间间隔（以秒为单位）。                                                                                                                                                                              | 0.1.0 |
| spark.clickhouse.write.retryableErrorCodes         | 241                                              | 在写入失败时由 ClickHouse 服务器返回的可重试的错误码。                                                                                                                                                                  | 0.1.0 |

## 支持的数据类型 {#supported-data-types}

本节概述了 Spark 与 ClickHouse 之间的数据类型映射。下表为从 ClickHouse 读取数据到 Spark，以及将 Spark 中的数据插入 ClickHouse 时的数据类型转换提供快速参考。

### 从 ClickHouse 读取数据到 Spark {#reading-data-from-clickhouse-into-spark}

| ClickHouse 数据类型                                               | Spark 数据类型                 | 是否支持  | 是否为原始类型 | 说明                                               |
|-------------------------------------------------------------------|--------------------------------|-----------|----------------|----------------------------------------------------|
| `Nothing`                                                         | `NullType`                     | ✅         | 是             |                                                    |
| `Bool`                                                            | `BooleanType`                  | ✅         | 是             |                                                    |
| `UInt8`, `Int16`                                                  | `ShortType`                    | ✅         | 是             |                                                    |
| `Int8`                                                            | `ByteType`                     | ✅         | 是             |                                                    |
| `UInt16`,`Int32`                                                  | `IntegerType`                  | ✅         | 是             |                                                    |
| `UInt32`,`Int64`, `UInt64`                                        | `LongType`                     | ✅         | 是             |                                                    |
| `Int128`,`UInt128`, `Int256`, `UInt256`                           | `DecimalType(38, 0)`           | ✅         | 是             |                                                    |
| `Float32`                                                         | `FloatType`                    | ✅         | 是             |                                                    |
| `Float64`                                                         | `DoubleType`                   | ✅         | 是             |                                                    |
| `String`, `JSON`, `UUID`, `Enum8`, `Enum16`, `IPv4`, `IPv6`       | `StringType`                   | ✅         | 是             |                                                    |
| `FixedString`                                                     | `BinaryType`, `StringType`     | ✅         | 是             | 由配置 `READ_FIXED_STRING_AS` 控制                 |
| `Decimal`                                                         | `DecimalType`                  | ✅         | 是             | 精度和小数位数最高支持到 `Decimal128`              |
| `Decimal32`                                                       | `DecimalType(9, scale)`        | ✅         | 是             |                                                    |
| `Decimal64`                                                       | `DecimalType(18, scale)`       | ✅         | 是             |                                                    |
| `Decimal128`                                                      | `DecimalType(38, scale)`       | ✅         | 是             |                                                    |
| `Date`, `Date32`                                                  | `DateType`                     | ✅         | 是             |                                                    |
| `DateTime`, `DateTime32`, `DateTime64`                            | `TimestampType`                | ✅         | 是             |                                                    |
| `Array`                                                           | `ArrayType`                    | ✅         | 否             | 数组元素类型也会被转换                             |
| `Map`                                                             | `MapType`                      | ✅         | 否             | 键类型仅支持 `StringType`                          |
| `IntervalYear`                                                    | `YearMonthIntervalType(Year)`  | ✅         | 是             |                                                    |
| `IntervalMonth`                                                   | `YearMonthIntervalType(Month)` | ✅         | 是             |                                                    |
| `IntervalDay`, `IntervalHour`, `IntervalMinute`, `IntervalSecond` | `DayTimeIntervalType`          | ✅         | 否             | 会映射为对应的具体区间类型                         |
| `Object`                                                          |                                | ❌         |                |                                                    |
| `Nested`                                                          |                                | ❌         |                |                                                    |
| `Tuple`                                                           | `StructType`                   | ✅         | 否             | 同时支持具名和无名 tuple。具名 tuple 按名称映射到 struct 字段，无名 tuple 使用 `_1`、`_2` 等字段名。支持嵌套 struct 和 Nullable 字段 |
| `Point`                                                           |                                | ❌         |                |                                                    |
| `Polygon`                                                         |                                | ❌         |                |                                                    |
| `MultiPolygon`                                                    |                                | ❌         |                |                                                    |
| `Ring`                                                            |                                | ❌         |                |                                                    |
| `IntervalQuarter`                                                 |                                | ❌         |                |                                                    |
| `IntervalWeek`                                                    |                                | ❌         |                |                                                    |
| `Decimal256`                                                      |                                | ❌         |                |                                                    |
| `AggregateFunction`                                               |                                | ❌         |                |                                                    |
| `SimpleAggregateFunction`                                         |                                | ❌         |                |                                                    |

### 从 Spark 向 ClickHouse 插入数据 {#inserting-data-from-spark-into-clickhouse}

| Spark 数据类型                      | ClickHouse 数据类型 | 是否支持 | 是否为基本类型 | 说明                                  |
|-------------------------------------|----------------------|-----------|--------------|----------------------------------------|
| `BooleanType`                       | `Bool`               | ✅         | 是           | 自版本 0.9.0 起映射为 `Bool` 类型（而非 `UInt8`） |
| `ByteType`                          | `Int8`               | ✅         | 是           |                                        |
| `ShortType`                         | `Int16`              | ✅         | 是           |                                        |
| `IntegerType`                       | `Int32`              | ✅         | 是           |                                        |
| `LongType`                         | `Int64`              | ✅         | 是           |                                        |
| `FloatType`                         | `Float32`            | ✅         | 是           |                                        |
| `DoubleType`                        | `Float64`            | ✅         | 是           |                                        |
| `StringType`                        | `String`             | ✅         | 是           |                                        |
| `VarcharType`                       | `String`             | ✅         | 是           |                                        |
| `CharType`                          | `String`             | ✅         | 是           |                                        |
| `DecimalType`                       | `Decimal(p, s)`      | ✅         | 是           | 精度和小数位数最高支持到 `Decimal128` |
| `DateType`                          | `Date`               | ✅         | 是           |                                        |
| `TimestampType`                     | `DateTime`           | ✅         | 是           |                                        |
| `ArrayType` (list, tuple, or array) | `Array`              | ✅         | 否           | 数组元素类型也会被转换                |
| `MapType`                           | `Map`                | ✅         | 否           | 键类型仅支持 `StringType`             |
| `StructType`                        | `Tuple`              | ✅         | 否           | 转换为带字段名的 Tuple                |
| `VariantType`                       | `VariantType`               | ❌         | 否          |  |
| `Object`                            |                      | ❌         |              |                                        |
| `Nested`                            |                      | ❌         |              |                                        |

## 贡献与支持 {#contributing-and-support}

如果您希望为该项目做出贡献或报告任何问题，我们非常欢迎您的反馈！
请访问我们的 [GitHub 仓库](https://github.com/ClickHouse/spark-clickhouse-connector) 来提交 issue、提出改进建议或发起 pull request。
欢迎一切形式的贡献！在开始之前，请先查看仓库中的贡献指南。
感谢您帮助改进我们的 ClickHouse Spark 连接器！