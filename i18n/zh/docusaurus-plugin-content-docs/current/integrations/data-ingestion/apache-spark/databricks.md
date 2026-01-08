---
sidebar_label: 'Databricks'
sidebar_position: 3
slug: /integrations/data-ingestion/apache-spark/databricks
description: '集成 ClickHouse 与 Databricks'
keywords: ['clickhouse', 'databricks', 'spark', 'unity catalog', 'data']
title: '集成 ClickHouse 与 Databricks'
doc_type: '指南'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# 将 ClickHouse 与 Databricks 集成 {#integrating-clickhouse-with-databricks}

<ClickHouseSupportedBadge/>

ClickHouse Spark 连接器可以与 Databricks 无缝配合使用。本文指南介绍在 Databricks 中的特定平台配置、安装步骤以及使用模式。

## 为 Databricks 选择 API {#api-selection}

默认情况下，Databricks 会启用 Unity Catalog，它会阻止注册 Spark catalog。此时，你**必须**使用 **TableProvider API**（基于 `format` 的访问）。

但是，如果你通过创建访问模式为 **No isolation shared** 的集群来禁用 Unity Catalog，则可以改用 **Catalog API**。Catalog API 提供集中式配置和原生 Spark SQL 集成。

| Unity Catalog 状态 | 推荐 API | 说明 |
|---------------------|------------------|-------|
| **Enabled**（默认） | TableProvider API（基于 format） | Unity Catalog 阻止 Spark catalog 注册 |
| **Disabled**（No isolation shared） | Catalog API | 需要访问模式为 "No isolation shared" 的集群 |

## 在 Databricks 中安装 {#installation}

### 选项 1：通过 Databricks UI 上传 JAR {#installation-ui}

1. 构建或[下载](https://repo1.maven.org/maven2/com/clickhouse/spark/)运行时 JAR：
   ```bash
   clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar
   ```

2. 将 JAR 上传到 Databricks 工作区：
   - 进入 **Workspace** → 导航到目标文件夹
   - 点击 **Upload** → 选择该 JAR 文件
   - 该 JAR 将存储在你的工作区中

3. 在集群上安装该库：
   - 进入 **Compute** → 选择你的集群
   - 点击 **Libraries** 选项卡
   - 点击 **Install New**
   - 选择 **DBFS** 或 **Workspace** → 导航到已上传的 JAR 文件
   - 点击 **Install**

<Image img={require('@site/static/images/integrations/data-ingestion/apache-spark/databricks/databricks-libraries-tab.png')} alt="Databricks Libraries 选项卡" />

<Image img={require('@site/static/images/integrations/data-ingestion/apache-spark/databricks/databricks-install-from-volume.png')} alt="从工作区卷安装库" />

4. 重启集群以加载该库

### 选项 2：使用 Databricks CLI 进行安装 {#installation-cli}

```bash
# Upload JAR to DBFS
databricks fs cp clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar \
  dbfs:/FileStore/jars/

# Install on cluster
databricks libraries install \
  --cluster-id <your-cluster-id> \
  --jar dbfs:/FileStore/jars/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar
```


### 选项 3：Maven 坐标（推荐） {#installation-maven}

1. 进入 Databricks 工作区：
   * 打开 **Compute** → 选择集群
   * 点击 **Libraries** 选项卡
   * 点击 **Install New**
   * 选择 **Maven** 选项卡

2. 添加 Maven 坐标：

```text
com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}
```

&lt;Image img=&#123;require(&#39;@site/static/images/integrations/data-ingestion/apache-spark/databricks/databricks-maven-tab.png&#39;)&#125; alt=&quot;Databricks Maven 库配置&quot; /&gt;

3. 点击 **Install**，然后重启集群以加载该库


## 使用 TableProvider API {#tableprovider-api}

当启用了 Unity Catalog（默认）时，**必须** 使用 TableProvider API（基于格式的访问），因为 Unity Catalog 会阻止在 Spark catalog 中进行注册。如果你使用访问模式为 "No isolation shared" 的集群来禁用 Unity Catalog，则可以改用 [Catalog API](/docs/integrations/data-ingestion/apache-spark/spark-native-connector#register-the-catalog-required)。

### 读取数据 {#reading-data-table-provider}

<Tabs groupId="databricks_usage">
<TabItem value="Python" label="Python" default>

```python
# Read from ClickHouse using TableProvider API
df = spark.read \
    .format("clickhouse") \
    .option("host", "your-clickhouse-cloud-host.clickhouse.cloud") \
    .option("protocol", "https") \
    .option("http_port", "8443") \
    .option("database", "default") \
    .option("table", "events") \
    .option("user", "default") \
    .option("password", dbutils.secrets.get(scope="clickhouse", key="password")) \
    .option("ssl", "true") \
    .load()

# Schema is automatically inferred
df.display()
```

</TabItem>
<TabItem value="Scala" label="Scala">

```scala
val df = spark.read
  .format("clickhouse")
  .option("host", "your-clickhouse-cloud-host.clickhouse.cloud")
  .option("protocol", "https")
  .option("http_port", "8443")
  .option("database", "default")
  .option("table", "events")
  .option("user", "default")
  .option("password", dbutils.secrets.get(scope="clickhouse", key="password"))
  .option("ssl", "true")
  .load()

df.show()
```

</TabItem>
</Tabs>


### 写入数据 {#writing-data-unity}

<Tabs groupId="databricks_usage">
<TabItem value="Python" label="Python" default>

```python
# Write to ClickHouse - table will be created automatically if it doesn't exist
df.write \
    .format("clickhouse") \
    .option("host", "your-clickhouse-cloud-host.clickhouse.cloud") \
    .option("protocol", "https") \
    .option("http_port", "8443") \
    .option("database", "default") \
    .option("table", "events_copy") \
    .option("user", "default") \
    .option("password", dbutils.secrets.get(scope="clickhouse", key="password")) \
    .option("ssl", "true") \
    .option("order_by", "id") \  # Required: specify ORDER BY when creating a new table
    .option("settings.allow_nullable_key", "1") \  # Required for ClickHouse Cloud if ORDER BY has nullable columns
    .mode("append") \
    .save()
```

</TabItem>
<TabItem value="Scala" label="Scala">

```scala
df.write
  .format("clickhouse")
  .option("host", "your-clickhouse-cloud-host.clickhouse.cloud")
  .option("protocol", "https")
  .option("http_port", "8443")
  .option("database", "default")
  .option("table", "events_copy")
  .option("user", "default")
  .option("password", dbutils.secrets.get(scope="clickhouse", key="password"))
  .option("ssl", "true")
  .option("order_by", "id")  // Required: specify ORDER BY when creating a new table
  .option("settings.allow_nullable_key", "1")  // Required for ClickHouse Cloud if ORDER BY has nullable columns
  .mode("append")
  .save()
```

</TabItem>
</Tabs>

:::note
此示例假定已在 Databricks 中预先配置好 secret scope。有关设置方法，请参阅 Databricks 的 [Secret 管理文档](https://docs.databricks.com/aws/en/security/secrets/)。
:::


## Databricks 特有注意事项 {#considerations}

### 机密管理 {#secret-management}

使用 Databricks 机密作用域（secret scope）安全存储 ClickHouse 凭证：

```python
# Access secrets
password = dbutils.secrets.get(scope="clickhouse", key="password")
```

有关配置步骤，请参阅 Databricks 的[机密管理文档](https://docs.databricks.com/aws/en/security/secrets/)。

<!-- TODO: 添加 Databricks 机密作用域配置的截图 -->


### ClickHouse Cloud 连接 {#clickhouse-cloud}

在 Databricks 中连接到 ClickHouse Cloud 时：

1. 使用 **HTTPS 协议**（`protocol: https`，`http_port: 8443`）
2. 启用 **SSL**（`ssl: true`）

## 示例 {#examples}

### 完整工作流程示例 {#workflow-example}

<Tabs groupId="databricks_usage">
<TabItem value="Python" label="Python" default>

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col

# Initialize Spark with ClickHouse connector
spark = SparkSession.builder \
    .config("spark.jars.packages", "com.clickhouse.spark:clickhouse-spark-runtime-3.4_2.12:0.9.0") \
    .getOrCreate()

# Read from ClickHouse
df = spark.read \
    .format("clickhouse") \
    .option("host", "your-host.clickhouse.cloud") \
    .option("protocol", "https") \
    .option("http_port", "8443") \
    .option("database", "default") \
    .option("table", "source_table") \
    .option("user", "default") \
    .option("password", dbutils.secrets.get(scope="clickhouse", key="password")) \
    .option("ssl", "true") \
    .load()

# Transform data
transformed_df = df.filter(col("status") == "active")

# Write to ClickHouse
transformed_df.write \
    .format("clickhouse") \
    .option("host", "your-host.clickhouse.cloud") \
    .option("protocol", "https") \
    .option("http_port", "8443") \
    .option("database", "default") \
    .option("table", "target_table") \
    .option("user", "default") \
    .option("password", dbutils.secrets.get(scope="clickhouse", key="password")) \
    .option("ssl", "true") \
    .option("order_by", "id") \
    .mode("append") \
    .save()
```

</TabItem>
<TabItem value="Scala" label="Scala">

```scala
import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions.col

// Initialize Spark with ClickHouse connector
val spark = SparkSession.builder
  .config("spark.jars.packages", "com.clickhouse.spark:clickhouse-spark-runtime-3.4_2.12:0.9.0")
  .getOrCreate()

// Read from ClickHouse
val df = spark.read
  .format("clickhouse")
  .option("host", "your-host.clickhouse.cloud")
  .option("protocol", "https")
  .option("http_port", "8443")
  .option("database", "default")
  .option("table", "source_table")
  .option("user", "default")
  .option("password", dbutils.secrets.get(scope="clickhouse", key="password"))
  .option("ssl", "true")
  .load()

// Transform data
val transformedDF = df.filter(col("status") === "active")

// Write to ClickHouse
transformedDF.write
  .format("clickhouse")
  .option("host", "your-host.clickhouse.cloud")
  .option("protocol", "https")
  .option("http_port", "8443")
  .option("database", "default")
  .option("table", "target_table")
  .option("user", "default")
  .option("password", dbutils.secrets.get(scope="clickhouse", key="password"))
  .option("ssl", "true")
  .option("order_by", "id")
  .mode("append")
  .save()
```

</TabItem>
</Tabs>


## 相关文档 {#related}

- [Spark 原生连接器指南](/docs/integrations/data-ingestion/apache-spark/spark-native-connector) - 完整的连接器文档
- [TableProvider API 文档](/docs/integrations/data-ingestion/apache-spark/spark-native-connector#using-the-tableprovider-api-format-based-access) - 基于格式的访问方式详解
- [Catalog API 文档](/docs/integrations/data-ingestion/apache-spark/spark-native-connector#register-the-catalog-required) - 基于目录的访问方式详解