---
sidebar_label: 'Spark 原生连接器'
sidebar_position: 2
slug: /integrations/apache-spark/spark-native-connector
description: 'Apache Spark 与 ClickHouse 集成简介'
keywords: ['clickhouse', 'Apache Spark', '迁移', '数据']
title: 'Spark 连接器'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Spark 连接器 {#spark-connector}

<ClickHouseSupportedBadge/>

此连接器利用 ClickHouse 特有的优化（例如高级分区和谓词下推），以提升查询性能和数据处理效率。
该连接器基于 [ClickHouse 官方 JDBC 连接器](https://github.com/ClickHouse/clickhouse-java)，并管理其自身的 catalog。

在 Spark 3.0 之前，Spark 不具备内置的 catalog 概念，因此用户通常依赖 Hive Metastore 或 AWS Glue 等外部 catalog 系统。
使用这些外部方案时，用户必须在 Spark 中访问数据源表之前，先手动注册这些表。
然而，自从 Spark 3.0 引入 catalog 概念后，Spark 现在可以通过注册 catalog 插件自动发现表。

Spark 的默认 catalog 是 `spark_catalog`，表通过 `{catalog name}.{database}.{table}` 来标识。借助这一新的 catalog 功能，现在可以在单个 Spark 应用中添加并使用多个 catalog。

## 选择使用 Catalog API 还是 TableProvider API {#choosing-between-apis}

ClickHouse Spark 连接器支持两种访问方式：**Catalog API** 和 **TableProvider API**（基于格式的访问）。了解它们之间的差异有助于您为自己的用例选择合适的方案。

### Catalog API 与 TableProvider API 对比 {#catalog-vs-tableprovider-comparison}

| 功能 | Catalog API | TableProvider API |
|---------|-------------|-------------------|
| **配置** | 通过 Spark 配置集中管理 | 通过选项为每次操作单独配置 |
| **表发现** | 通过 catalog 自动发现 | 手动指定表 |
| **DDL 操作** | 完整支持（CREATE、DROP、ALTER） | 受限（仅支持自动创建表） |
| **Spark SQL 集成** | 原生（`clickhouse.database.table`） | 需要指定 format |
| **使用场景** | 适用于长期、稳定连接并统一配置管理 | 适用于临时、动态或一次性访问 |

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

## 使用 TableProvider API（基于格式的访问） {#using-the-tableprovider-api}

除了基于 catalog 的方式之外，ClickHouse Spark 连接器还通过 TableProvider API 支持**基于格式的访问模式**。

### 基于格式的读取示例 {#format-based-read}

<Tabs groupId="spark_apis">
<TabItem value="Python" label="Python" default>

```python
from pyspark.sql import SparkSession

spark = SparkSession.builder.getOrCreate()

# Read from ClickHouse using format API
df = spark.read \
    .format("clickhouse") \
    .option("host", "your-clickhouse-host") \
    .option("protocol", "https") \
    .option("http_port", "8443") \
    .option("database", "default") \
    .option("table", "your_table") \
    .option("user", "default") \
    .option("password", "your_password") \
    .option("ssl", "true") \
    .load()

df.show()
```

</TabItem>
<TabItem value="Scala" label="Scala">

```scala
val df = spark.read
  .format("clickhouse")
  .option("host", "your-clickhouse-host")
  .option("protocol", "https")
  .option("http_port", "8443")
  .option("database", "default")
  .option("table", "your_table")
  .option("user", "default")
  .option("password", "your_password")
  .option("ssl", "true")
  .load()

df.show()
```

</TabItem>
<TabItem value="Java" label="Java">

```java
Dataset<Row> df = spark.read()
    .format("clickhouse")
    .option("host", "your-clickhouse-host")
    .option("protocol", "https")
    .option("http_port", "8443")
    .option("database", "default")
    .option("table", "your_table")
    .option("user", "default")
    .option("password", "your_password")
    .option("ssl", "true")
    .load();

df.show();
```

</TabItem>
</Tabs>


### 基于格式的写入示例 {#format-based-write}

<Tabs groupId="spark_apis">
<TabItem value="Python" label="Python" default>

```python
# Write to ClickHouse using format API
df.write \
    .format("clickhouse") \
    .option("host", "your-clickhouse-host") \
    .option("protocol", "https") \
    .option("http_port", "8443") \
    .option("database", "default") \
    .option("table", "your_table") \
    .option("user", "default") \
    .option("password", "your_password") \
    .option("ssl", "true") \
    .mode("append") \
    .save()
```

</TabItem>
<TabItem value="Scala" label="Scala">

```scala
df.write
  .format("clickhouse")
  .option("host", "your-clickhouse-host")
  .option("protocol", "https")
  .option("http_port", "8443")
  .option("database", "default")
  .option("table", "your_table")
  .option("user", "default")
  .option("password", "your_password")
  .option("ssl", "true")
  .mode("append")
  .save()
```

</TabItem>
<TabItem value="Java" label="Java">

```java
df.write()
    .format("clickhouse")
    .option("host", "your-clickhouse-host")
    .option("protocol", "https")
    .option("http_port", "8443")
    .option("database", "default")
    .option("table", "your_table")
    .option("user", "default")
    .option("password", "your_password")
    .option("ssl", "true")
    .mode("append")
    .save();
```

</TabItem>
</Tabs>


### TableProvider 特性 {#tableprovider-features}

TableProvider API 提供了多项强大功能：

#### 自动建表 {#automatic-table-creation}

当向一个不存在的表写入数据时，连接器会根据合适的 schema 自动创建该表。连接器提供了智能默认值：

* **引擎**：如果未指定，则默认为 `MergeTree()`。可以通过 `engine` 选项指定其他引擎（例如 `ReplacingMergeTree()`、`SummingMergeTree()` 等）
* **ORDER BY**：**必需**——创建新表时必须显式指定 `order_by` 选项。连接器会验证所有指定的列是否都存在于 schema 中。
* **Nullable 键支持**：如果 ORDER BY 中包含 Nullable 列，则会自动添加 `settings.allow_nullable_key=1`

<Tabs groupId="spark_apis">
<TabItem value="Python" label="Python" default>

```python
# Table will be created automatically with explicit ORDER BY (required)
df.write \
    .format("clickhouse") \
    .option("host", "your-host") \
    .option("database", "default") \
    .option("table", "new_table") \
    .option("order_by", "id") \
    .mode("append") \
    .save()

# Specify table creation options with custom engine
df.write \
    .format("clickhouse") \
    .option("host", "your-host") \
    .option("database", "default") \
    .option("table", "new_table") \
    .option("order_by", "id, timestamp") \
    .option("engine", "ReplacingMergeTree()") \
    .option("settings.allow_nullable_key", "1") \
    .mode("append") \
    .save()
```

</TabItem>
<TabItem value="Scala" label="Scala">

```scala
// Table will be created automatically with explicit ORDER BY (required)
df.write
  .format("clickhouse")
  .option("host", "your-host")
  .option("database", "default")
  .option("table", "new_table")
  .option("order_by", "id")
  .mode("append")
  .save()

// With explicit table creation options and custom engine
df.write
  .format("clickhouse")
  .option("host", "your-host")
  .option("database", "default")
  .option("table", "new_table")
  .option("order_by", "id, timestamp")
  .option("engine", "ReplacingMergeTree()")
  .option("settings.allow_nullable_key", "1")
  .mode("append")
  .save()
```

</TabItem>
<TabItem value="Java" label="Java">

```java
// Table will be created automatically with explicit ORDER BY (required)
df.write()
    .format("clickhouse")
    .option("host", "your-host")
    .option("database", "default")
    .option("table", "new_table")
    .option("order_by", "id")
    .mode("append")
    .save();

// With explicit table creation options and custom engine
df.write()
    .format("clickhouse")
    .option("host", "your-host")
    .option("database", "default")
    .option("table", "new_table")
    .option("order_by", "id, timestamp")
    .option("engine", "ReplacingMergeTree()")
    .option("settings.allow_nullable_key", "1")
    .mode("append")
    .save();
```

</TabItem>
</Tabs>

:::important
**ORDER BY 要求**：通过 TableProvider API 创建新表时，`order_by` 选项是**必填**的，必须显式指定用于 ORDER BY 子句的列。连接器会校验所有指定列在 schema 中是否存在，如果有任何列缺失，将抛出错误。

**引擎选择**：默认引擎为 `MergeTree()`，但你可以使用 `engine` 选项指定任意 ClickHouse 表引擎（例如 `ReplacingMergeTree()`、`SummingMergeTree()`、`AggregatingMergeTree()` 等）。
:::


### TableProvider 连接选项 {#tableprovider-connection-options}

在使用格式 API 时，可以使用以下连接选项：

#### 连接选项 {#connection-options}

| 选项         | 描述                                             | 默认值         | 必填     |
|--------------|--------------------------------------------------|----------------|----------|
| `host`       | ClickHouse 服务器主机名                          | `localhost`    | 是       |
| `protocol`   | 连接协议（`http` 或 `https`）                    | `http`         | 否       |
| `http_port`  | HTTP/HTTPS 端口                                  | `8123`         | 否       |
| `database`   | 数据库名称                                       | `default`      | 是       |
| `table`      | 表名                                             | N/A            | 是       |
| `user`       | 用于认证的用户名                                 | `default`      | 否       |
| `password`   | 用于认证的密码                                   | (空字符串)     | 否       |
| `ssl`        | 是否启用 SSL 连接                                | `false`        | 否       |
| `ssl_mode`   | SSL 模式（`NONE`、`STRICT` 等）                  | `STRICT`       | 否       |
| `timezone`   | 日期/时间操作所使用的时区                        | `server`       | 否       |

#### 表创建选项 {#table-creation-options}

当表不存在且需要创建时，可以使用以下选项：

| 选项                        | 描述                                                                       | 默认值            | 是否必需 |
|-----------------------------|----------------------------------------------------------------------------|-------------------|----------|
| `order_by`                  | 用于 ORDER BY 子句的列。多个列用逗号分隔                                   | N/A               | **Yes**  |
| `engine`                    | ClickHouse 表引擎（例如 `MergeTree()`, `ReplacingMergeTree()`, `SummingMergeTree()` 等） | `MergeTree()`     | No       |
| `settings.allow_nullable_key` | 在 ORDER BY 中启用 Nullable 键（适用于 ClickHouse Cloud）               | 自动检测**        | No       |
| `settings.<key>`            | 任意 ClickHouse 表级 SETTING                                              | N/A               | No       |
| `cluster`                   | 用于分布式表的集群名称                                                    | N/A               | No       |
| `clickhouse.column.<name>.variant_types` | 用于 Variant 列的 ClickHouse 类型逗号分隔列表（例如 `String, Int64, Bool, JSON`）。类型名称区分大小写。逗号后的空格可选。 | N/A | No |

\* 在创建新表时，必须提供 `order_by` 选项。所有指定列必须已在 schema 中定义。  
\** 如果 ORDER BY 中包含 Nullable 列且未显式设置该选项，则会自动设置为 `1`。

:::tip
**最佳实践**：在 ClickHouse Cloud 中，如果你的 ORDER BY 列可能为 Nullable，请显式设置 `settings.allow_nullable_key=1`，因为 ClickHouse Cloud 要求启用此设置。
:::

#### 写入模式 {#writing-modes}

Spark 连接器（包括 TableProvider API 和 Catalog API）支持以下 Spark 写入模式：

* **`append`**：向已存在的表追加数据
* **`overwrite`**：替换表中的全部数据（截断整张表）

:::important
**不支持分区覆盖写入**：该连接器当前不支持分区级别的覆盖写入操作（例如在使用 `overwrite` 模式时配合 `partitionBy`）。该特性正在开发中。有关该特性的进展，请参见 [GitHub issue #34](https://github.com/ClickHouse/spark-clickhouse-connector/issues/34)。
:::

<Tabs groupId="spark_apis">
<TabItem value="Python" label="Python" default>

```python
# Overwrite mode (truncates table first)
df.write \
    .format("clickhouse") \
    .option("host", "your-host") \
    .option("database", "default") \
    .option("table", "my_table") \
    .mode("overwrite") \
    .save()
```

</TabItem>
<TabItem value="Scala" label="Scala">

```scala
// Overwrite mode (truncates table first)
df.write
  .format("clickhouse")
  .option("host", "your-host")
  .option("database", "default")
  .option("table", "my_table")
  .mode("overwrite")
  .save()
```

</TabItem>
<TabItem value="Java" label="Java">

```java
// Overwrite mode (truncates table first)
df.write()
    .format("clickhouse")
    .option("host", "your-host")
    .option("database", "default")
    .option("table", "my_table")
    .mode("overwrite")
    .save();
```

</TabItem>
</Tabs>


## 配置 ClickHouse 选项 {#configuring-clickhouse-options}

Catalog API 和 TableProvider API 都支持配置 ClickHouse 特有的选项（而非连接器选项）。这些选项在创建表或执行查询时会被传递给 ClickHouse。

ClickHouse 选项用于配置 ClickHouse 的特定设置，例如 `allow_nullable_key`、`index_granularity`，以及其他表级或查询级的设置。它们不同于连接器选项（如 `host`、`database`、`table`），后者用于控制连接器如何连接到 ClickHouse。

### 使用 TableProvider API {#using-tableprovider-api-options}

使用 TableProvider API 时，请使用 `settings.&lt;key&gt;` 选项格式：

<Tabs groupId="spark_apis">
<TabItem value="Python" label="Python" default>

```python
df.write \
    .format("clickhouse") \
    .option("host", "your-host") \
    .option("database", "default") \
    .option("table", "my_table") \
    .option("order_by", "id") \
    .option("settings.allow_nullable_key", "1") \
    .option("settings.index_granularity", "8192") \
    .mode("append") \
    .save()
```

</TabItem>
<TabItem value="Scala" label="Scala">

```scala
df.write
  .format("clickhouse")
  .option("host", "your-host")
  .option("database", "default")
  .option("table", "my_table")
  .option("order_by", "id")
  .option("settings.allow_nullable_key", "1")
  .option("settings.index_granularity", "8192")
  .mode("append")
  .save()
```

</TabItem>
<TabItem value="Java" label="Java">

```java
df.write()
    .format("clickhouse")
    .option("host", "your-host")
    .option("database", "default")
    .option("table", "my_table")
    .option("order_by", "id")
    .option("settings.allow_nullable_key", "1")
    .option("settings.index_granularity", "8192")
    .mode("append")
    .save();
```

</TabItem>
</Tabs>


### 使用 Catalog API {#using-catalog-api-options}

使用 Catalog API 时，在 Spark 配置中使用 `spark.sql.catalog.<catalog_name>.option.<key>` 格式：

```text
spark.sql.catalog.clickhouse.option.allow_nullable_key 1
spark.sql.catalog.clickhouse.option.index_granularity 8192
```

或在使用 Spark SQL 创建表时设置它们：

```sql
CREATE TABLE clickhouse.default.my_table (
  id INT,
  name STRING
) USING ClickHouse
TBLPROPERTIES (
  engine = 'MergeTree()',
  order_by = 'id',
  'settings.allow_nullable_key' = '1',
  'settings.index_granularity' = '8192'
)
```


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
        // Create a Spark session
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

:::important
**不支持分区覆盖写入**：Catalog API 目前不支持分区级别的覆盖写入操作（例如，将 `overwrite` 模式与 `partitionBy` 一起使用）。该功能正在开发中。有关此功能的进展，请参阅 [GitHub issue #34](https://github.com/ClickHouse/spark-clickhouse-connector/issues/34)。
:::

<Tabs groupId="spark_apis">
  <TabItem value="Java" label="Java" default>
    ```java
 public static void main(String[] args) throws AnalysisException {

        // Create a Spark session
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

        // Define the schema for the DataFrame
        StructType schema = new StructType(new StructField[]{
                DataTypes.createStructField("id", DataTypes.IntegerType, false),
                DataTypes.createStructField("name", DataTypes.StringType, false),
        });

        List<Row> data = Arrays.asList(
                RowFactory.create(1, "Alice"),
                RowFactory.create(2, "Bob")
        );

        // Create a DataFrame
        Dataset<Row> df = spark.createDataFrame(data, schema);

        df.writeTo("clickhouse.default.example_table").append();

        spark.stop();
    }
```
  </TabItem>

  <TabItem value="Scala" label="Scala">
    ```java
object NativeSparkWrite extends App {
  // Create a Spark session
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

  // Define the schema for the DataFrame
  val rows = Seq(Row(1, "John"), Row(2, "Doe"))

  val schema = List(
    StructField("id", DataTypes.IntegerType, nullable = false),
    StructField("name", StringType, nullable = true)
  )
  // Create the df
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

# Feel free to use any other packages combination satesfying the compatibility matrix provided above.
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

# Create DataFrame
data = [Row(id=11, name="John"), Row(id=12, name="Doe")]
df = spark.createDataFrame(data)

# Write DataFrame to ClickHouse
df.writeTo("clickhouse.default.example_table").append()

```
  </TabItem>

  <TabItem value="SparkSQL" label="Spark SQL">
    ```sql
    -- resultTable is the Spark intermediate df we want to insert into clickhouse.default.example_table
   INSERT INTO TABLE clickhouse.default.example_table
                SELECT * FROM resultTable;
                
```
  </TabItem>
</Tabs>

## DDL 操作 {#ddl-operations}

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

上述示例展示了 Spark SQL 查询，您可以在应用程序中通过任意 API（Java、Scala、PySpark 或 shell）运行这些查询。

## 使用 VariantType {#working-with-varianttype}

:::note
对 VariantType 的支持在 Spark 4.0+ 中可用，并且需要启用了实验性 JSON/Variant 类型的 ClickHouse 25.3+。
:::

该连接器支持 Spark 的 `VariantType` 来处理半结构化数据。VariantType 会映射到 ClickHouse 的 `JSON` 和 `Variant` 类型，从而能够高效地存储和查询模式灵活的数据。

:::note
本节专门介绍 VariantType 的映射和用法。关于所有受支持数据类型的完整概览，请参见[受支持的数据类型](#supported-data-types)一节。
:::

### ClickHouse 类型映射 {#clickhouse-type-mapping}

| ClickHouse 类型 | Spark 类型 | 描述 |
|----------------|------------|-------------|
| `JSON` | `VariantType` | 仅存储 JSON 对象（必须以 `{` 开头） |
| `Variant(T1, T2, ...)` | `VariantType` | 可存储多种类型，包括基本类型、数组和 JSON |

### 读取 VariantType 数据 {#reading-varianttype-data}

从 ClickHouse 读取数据时，`JSON` 和 `Variant` 列会自动映射为 Spark 的 `VariantType` 类型：

<Tabs groupId="spark_apis">
<TabItem value="Scala" label="Scala" default>

```scala
// Read JSON column as VariantType
val df = spark.sql("SELECT id, data FROM clickhouse.default.json_table")

// Access variant data
df.show()

// Convert variant to JSON string for inspection
import org.apache.spark.sql.functions._
df.select(
  col("id"),
  to_json(col("data")).as("data_json")
).show()
```

</TabItem>
<TabItem value="Python" label="Python">

```python
# Read JSON column as VariantType
df = spark.sql("SELECT id, data FROM clickhouse.default.json_table")

# Access variant data
df.show()

# Convert variant to JSON string for inspection
from pyspark.sql.functions import to_json
df.select(
    "id",
    to_json("data").alias("data_json")
).show()
```

</TabItem>
<TabItem value="Java" label="Java">

```java
// Read JSON column as VariantType
Dataset<Row> df = spark.sql("SELECT id, data FROM clickhouse.default.json_table");

// Access variant data
df.show();

// Convert variant to JSON string for inspection
import static org.apache.spark.sql.functions.*;
df.select(
    col("id"),
    to_json(col("data")).as("data_json")
).show();
```

</TabItem>
</Tabs>


### 写入 VariantType 数据 {#writing-varianttype-data}

可以使用 JSON 或 Variant 列类型向 ClickHouse 写入 VariantType 数据：

<Tabs groupId="spark_apis">
<TabItem value="Scala" label="Scala" default>

```scala
import org.apache.spark.sql.functions._

// Create DataFrame with JSON data
val jsonData = Seq(
  (1, """{"name": "Alice", "age": 30}"""),
  (2, """{"name": "Bob", "age": 25}"""),
  (3, """{"name": "Charlie", "city": "NYC"}""")
).toDF("id", "json_string")

// Parse JSON strings to VariantType
val variantDF = jsonData.select(
  col("id"),
  parse_json(col("json_string")).as("data")
)

// Write to ClickHouse with JSON type (JSON objects only)
variantDF.writeTo("clickhouse.default.user_data").create()

// Or specify Variant with multiple types
spark.sql("""
  CREATE TABLE clickhouse.default.mixed_data (
    id INT,
    data VARIANT
  ) USING clickhouse
  TBLPROPERTIES (
    'clickhouse.column.data.variant_types' = 'String, Int64, Bool, JSON',
    'engine' = 'MergeTree()',
    'order_by' = 'id'
  )
""")
```

</TabItem>
<TabItem value="Python" label="Python">

```python
from pyspark.sql.functions import parse_json

# Create DataFrame with JSON data
json_data = [
    (1, '{"name": "Alice", "age": 30}'),
    (2, '{"name": "Bob", "age": 25}'),
    (3, '{"name": "Charlie", "city": "NYC"}')
]
df = spark.createDataFrame(json_data, ["id", "json_string"])

# Parse JSON strings to VariantType
variant_df = df.select(
    "id",
    parse_json("json_string").alias("data")
)

# Write to ClickHouse with JSON type
variant_df.writeTo("clickhouse.default.user_data").create()

# Or specify Variant with multiple types
spark.sql("""
  CREATE TABLE clickhouse.default.mixed_data (
    id INT,
    data VARIANT
  ) USING clickhouse
  TBLPROPERTIES (
    'clickhouse.column.data.variant_types' = 'String, Int64, Bool, JSON',
    'engine' = 'MergeTree()',
    'order_by' = 'id'
  )
""")
```

</TabItem>
<TabItem value="Java" label="Java">

```java
import static org.apache.spark.sql.functions.*;

// Create DataFrame with JSON data
List<Row> jsonData = Arrays.asList(
    RowFactory.create(1, "{\"name\": \"Alice\", \"age\": 30}"),
    RowFactory.create(2, "{\"name\": \"Bob\", \"age\": 25}"),
    RowFactory.create(3, "{\"name\": \"Charlie\", \"city\": \"NYC\"}")
);
StructType schema = new StructType(new StructField[]{
    DataTypes.createStructField("id", DataTypes.IntegerType, false),
    DataTypes.createStructField("json_string", DataTypes.StringType, false)
});
Dataset<Row> jsonDF = spark.createDataFrame(jsonData, schema);

// Parse JSON strings to VariantType
Dataset<Row> variantDF = jsonDF.select(
    col("id"),
    parse_json(col("json_string")).as("data")
);

// Write to ClickHouse with JSON type (JSON objects only)
variantDF.writeTo("clickhouse.default.user_data").create();

// Or specify Variant with multiple types
spark.sql("CREATE TABLE clickhouse.default.mixed_data (" +
    "id INT, " +
    "data VARIANT" +
    ") USING clickhouse " +
    "TBLPROPERTIES (" +
    "'clickhouse.column.data.variant_types' = 'String, Int64, Bool, JSON', " +
    "'engine' = 'MergeTree()', " +
    "'order_by' = 'id'" +
    ")");
```

</TabItem>
</Tabs>


### 使用 Spark SQL 创建 VariantType 表 {#creating-varianttype-tables-spark-sql}

可以使用 Spark SQL 的 DDL 创建 VariantType 表：

```sql
-- Create table with JSON type (default)
CREATE TABLE clickhouse.default.json_table (
  id INT,
  data VARIANT
) USING clickhouse
TBLPROPERTIES (
  'engine' = 'MergeTree()',
  'order_by' = 'id'
)
```

```sql
-- Create table with Variant type supporting multiple types
CREATE TABLE clickhouse.default.flexible_data (
  id INT,
  data VARIANT
) USING clickhouse
TBLPROPERTIES (
  'clickhouse.column.data.variant_types' = 'String, Int64, Float64, Bool, Array(String), JSON',
  'engine' = 'MergeTree()',
  'order_by' = 'id'
)
```


### 配置 Variant 类型 {#configuring-variant-types}

在创建包含 VariantType 列的表时，可以指定要使用的 ClickHouse 类型：

#### JSON 类型（默认） {#json-type-default}

如果未指定 `variant_types` 属性，则该列默认使用 ClickHouse 的 `JSON` 类型，该类型只接受 JSON 对象：

```sql
CREATE TABLE clickhouse.default.json_table (
  id INT,
  data VARIANT
) USING clickhouse
TBLPROPERTIES (
  'engine' = 'MergeTree()',
  'order_by' = 'id'
)
```

这会生成如下 ClickHouse 查询：

```sql
CREATE TABLE json_table (id Int32, data JSON) ENGINE = MergeTree() ORDER BY id
```


#### 包含多种类型的 Variant 类型 {#variant-type-multiple-types}

为了支持基本类型、数组和 JSON 对象，请在 `variant_types` 属性中指定这些类型：

```sql
CREATE TABLE clickhouse.default.flexible_data (
  id INT,
  data VARIANT
) USING clickhouse
TBLPROPERTIES (
  'clickhouse.column.data.variant_types' = 'String, Int64, Float64, Bool, Array(String), JSON',
  'engine' = 'MergeTree()',
  'order_by' = 'id'
)
```

这将生成以下 ClickHouse 查询：

```sql
CREATE TABLE flexible_data (
  id Int32, 
  data Variant(String, Int64, Float64, Bool, Array(String), JSON)
) ENGINE = MergeTree() ORDER BY id
```


### 支持的 Variant 类型 {#supported-variant-types}

在 `Variant()` 中可以使用以下 ClickHouse 类型：

- **原始类型**：`String`、`Int8`、`Int16`、`Int32`、`Int64`、`UInt8`、`UInt16`、`UInt32`、`UInt64`、`Float32`、`Float64`、`Bool`
- **数组**：`Array(T)`，其中 T 可以是任意受支持的类型，包括嵌套数组
- **JSON**：`JSON`，用于存储 JSON 对象

### 读取格式配置 {#read-format-configuration}

默认情况下，JSON 和 Variant 列会被读取为 `VariantType`。你可以覆盖此行为，将它们读取为字符串：

<Tabs groupId="spark_apis">
<TabItem value="Scala" label="Scala" default>

```scala
// Read JSON/Variant as strings instead of VariantType
spark.conf.set("spark.clickhouse.read.jsonAs", "string")

val df = spark.sql("SELECT id, data FROM clickhouse.default.json_table")
// data column will be StringType containing JSON strings
```

</TabItem>
<TabItem value="Python" label="Python">

```python
# Read JSON/Variant as strings instead of VariantType
spark.conf.set("spark.clickhouse.read.jsonAs", "string")

df = spark.sql("SELECT id, data FROM clickhouse.default.json_table")
# data column will be StringType containing JSON strings
```

</TabItem>
<TabItem value="Java" label="Java">

```java
// Read JSON/Variant as strings instead of VariantType
spark.conf().set("spark.clickhouse.read.jsonAs", "string");

Dataset<Row> df = spark.sql("SELECT id, data FROM clickhouse.default.json_table");
// data column will be StringType containing JSON strings
```

</TabItem>
</Tabs>


### 写入格式支持 {#write-format-support}

VariantType 的写入支持会因格式而异：

| 格式    | 支持情况    | 说明                                                                                                                               |
| ----- | ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| JSON  | ✅ 完全支持  | 支持 `JSON` 和 `Variant` 两种类型。推荐用于 VariantType 数据                                                                                   |
| Arrow | ⚠️ 部分支持 | 支持写入 ClickHouse 的 `JSON` 类型。不支持 ClickHouse 的 `Variant` 类型。完整支持有待 <https://github.com/ClickHouse/ClickHouse/issues/92752> 问题解决后提供 |

配置写入格式：

```scala
spark.conf.set("spark.clickhouse.write.format", "json")  // Recommended for Variant types
```

:::tip
若需向 ClickHouse 的 `Variant` 类型写入数据，请使用 JSON 格式。Arrow 格式仅支持写入 `JSON` 类型。
:::


### 最佳实践 {#varianttype-best-practices}

1. **对仅包含 JSON 的数据使用 JSON 类型**：如果只存储 JSON 对象，请使用默认的 JSON 类型（不要设置 `variant_types` 属性）
2. **显式指定类型**：在使用 `Variant()` 时，请显式列出计划存储的所有类型
3. **启用实验特性**：确保 ClickHouse 已启用 `allow_experimental_json_type = 1`
4. **写入时使用 JSON 格式**：为获得更好的兼容性，推荐以 JSON 格式写入 VariantType 数据
5. **根据查询模式进行设计**：JSON/Variant 类型支持 ClickHouse 的 JSON 路径查询，可用于高效过滤
6. **通过列提示提升性能**：在 ClickHouse 中使用 JSON 字段时，添加列提示可以提升查询性能。目前，尚不支持通过 Spark 添加列提示。请参阅用于跟踪此特性的 [GitHub issue #497](https://github.com/ClickHouse/spark-clickhouse-connector/issues/497)。

### 示例：完整工作流程 {#varianttype-example-workflow}

<Tabs groupId="spark_apis">
<TabItem value="Scala" label="Scala" default>

```scala
import org.apache.spark.sql.functions._

// Enable experimental JSON type in ClickHouse
spark.sql("SET allow_experimental_json_type = 1")

// Create table with Variant column
spark.sql("""
  CREATE TABLE clickhouse.default.events (
    event_id BIGINT,
    event_time TIMESTAMP,
    event_data VARIANT
  ) USING clickhouse
  TBLPROPERTIES (
    'clickhouse.column.event_data.variant_types' = 'String, Int64, Bool, JSON',
    'engine' = 'MergeTree()',
    'order_by' = 'event_time'
  )
""")

// Prepare data with mixed types
val events = Seq(
  (1L, "2024-01-01 10:00:00", """{"action": "login", "user_id": 123}"""),
  (2L, "2024-01-01 10:05:00", """{"action": "purchase", "amount": 99.99}"""),
  (3L, "2024-01-01 10:10:00", """{"action": "logout", "duration": 600}""")
).toDF("event_id", "event_time", "json_data")

// Convert to VariantType and write
val variantEvents = events.select(
  col("event_id"),
  to_timestamp(col("event_time")).as("event_time"),
  parse_json(col("json_data")).as("event_data")
)

variantEvents.writeTo("clickhouse.default.events").append()

// Read and query
val result = spark.sql("""
  SELECT event_id, event_time, event_data
  FROM clickhouse.default.events
  WHERE event_time >= '2024-01-01'
  ORDER BY event_time
""")

result.show(false)
```

</TabItem>
<TabItem value="Python" label="Python">

```python
from pyspark.sql.functions import parse_json, to_timestamp

# Enable experimental JSON type in ClickHouse
spark.sql("SET allow_experimental_json_type = 1")

# Create table with Variant column
spark.sql("""
  CREATE TABLE clickhouse.default.events (
    event_id BIGINT,
    event_time TIMESTAMP,
    event_data VARIANT
  ) USING clickhouse
  TBLPROPERTIES (
    'clickhouse.column.event_data.variant_types' = 'String, Int64, Bool, JSON',
    'engine' = 'MergeTree()',
    'order_by' = 'event_time'
  )
""")

# Prepare data with mixed types
events = [
    (1, "2024-01-01 10:00:00", '{"action": "login", "user_id": 123}'),
    (2, "2024-01-01 10:05:00", '{"action": "purchase", "amount": 99.99}'),
    (3, "2024-01-01 10:10:00", '{"action": "logout", "duration": 600}')
]
df = spark.createDataFrame(events, ["event_id", "event_time", "json_data"])

# Convert to VariantType and write
variant_events = df.select(
    "event_id",
    to_timestamp("event_time").alias("event_time"),
    parse_json("json_data").alias("event_data")
)

variant_events.writeTo("clickhouse.default.events").append()

# Read and query
result = spark.sql("""
  SELECT event_id, event_time, event_data
  FROM clickhouse.default.events
  WHERE event_time >= '2024-01-01'
  ORDER BY event_time
""")

result.show(truncate=False)
```

</TabItem>
<TabItem value="Java" label="Java">

```java
import static org.apache.spark.sql.functions.*;

// Enable experimental JSON type in ClickHouse
spark.sql("SET allow_experimental_json_type = 1");

// Create table with Variant column
spark.sql("CREATE TABLE clickhouse.default.events (" +
    "event_id BIGINT, " +
    "event_time TIMESTAMP, " +
    "event_data VARIANT" +
    ") USING clickhouse " +
    "TBLPROPERTIES (" +
    "'clickhouse.column.event_data.variant_types' = 'String, Int64, Bool, JSON', " +
    "'engine' = 'MergeTree()', " +
    "'order_by' = 'event_time'" +
    ")");

// Prepare data with mixed types
List<Row> events = Arrays.asList(
    RowFactory.create(1L, "2024-01-01 10:00:00", "{\"action\": \"login\", \"user_id\": 123}"),
    RowFactory.create(2L, "2024-01-01 10:05:00", "{\"action\": \"purchase\", \"amount\": 99.99}"),
    RowFactory.create(3L, "2024-01-01 10:10:00", "{\"action\": \"logout\", \"duration\": 600}")
);
StructType eventSchema = new StructType(new StructField[]{
    DataTypes.createStructField("event_id", DataTypes.LongType, false),
    DataTypes.createStructField("event_time", DataTypes.StringType, false),
    DataTypes.createStructField("json_data", DataTypes.StringType, false)
});
Dataset<Row> eventsDF = spark.createDataFrame(events, eventSchema);

// Convert to VariantType and write
Dataset<Row> variantEvents = eventsDF.select(
    col("event_id"),
    to_timestamp(col("event_time")).as("event_time"),
    parse_json(col("json_data")).as("event_data")
);

variantEvents.writeTo("clickhouse.default.events").append();

// Read and query
Dataset<Row> result = spark.sql("SELECT event_id, event_time, event_data " +
    "FROM clickhouse.default.events " +
    "WHERE event_time >= '2024-01-01' " +
    "ORDER BY event_time");

result.show(false);
```

</TabItem>
</Tabs>

## 配置 {#configurations}

以下是该 connector 中可调整的配置项。

:::note
**配置使用方式**：这些是 Spark 级别的配置选项，适用于 Catalog API 和 TableProvider API。可以通过两种方式进行设置：

1. **全局 Spark 配置**（适用于所有操作）：
   ```python
   spark.conf.set("spark.clickhouse.write.batchSize", "20000")
   spark.conf.set("spark.clickhouse.write.compression.codec", "lz4")
   ```

2. **按操作级别覆盖配置**（仅适用于 TableProvider API —— 可覆盖全局设置）：
   ```python
   df.write \
       .format("clickhouse") \
       .option("host", "your-host") \
       .option("database", "default") \
       .option("table", "my_table") \
       .option("spark.clickhouse.write.batchSize", "20000") \
       .option("spark.clickhouse.write.compression.codec", "lz4") \
       .mode("append") \
       .save()
   ```

或者，可以在 `spark-defaults.conf` 中设置这些配置，或在创建 Spark 会话时进行设置。
:::

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
| `String`, `UUID`, `Enum8`, `Enum16`, `IPv4`, `IPv6`              | `StringType`                   | ✅         | 是             |                                                    |
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
| `JSON`, `Variant`                                                 | `VariantType`                  | ✅         | 否             | 需要 Spark 4.0+ 和 ClickHouse 25.3+。可以通过 `spark.clickhouse.read.jsonAs=string` 读取为 `StringType` |
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
| `LongType`                          | `Int64`              | ✅         | 是           |                                        |
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
| `VariantType`                       | `JSON` or `Variant`  | ✅         | 否           | 需要 Spark 4.0+ 和 ClickHouse 25.3+。默认使用 `JSON` 类型。使用 `clickhouse.column.<name>.variant_types` 属性来指定包含多种类型的 `Variant`。 |
| `Object`                            |                      | ❌         |              |                                        |
| `Nested`                            |                      | ❌         |              |                                        |

## 贡献与支持 {#contributing-and-support}

如果您希望为该项目做出贡献或报告任何问题，我们非常欢迎您的反馈！
请访问我们的 [GitHub 仓库](https://github.com/ClickHouse/spark-clickhouse-connector) 来提交 issue、提出改进建议或发起 pull request。
欢迎一切形式的贡献！在开始之前，请先查看仓库中的贡献指南。
感谢您帮助改进我们的 ClickHouse Spark 连接器！