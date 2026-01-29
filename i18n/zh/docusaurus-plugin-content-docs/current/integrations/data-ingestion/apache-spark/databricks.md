---
sidebar_label: 'Databricks'
sidebar_position: 3
slug: /integrations/data-ingestion/apache-spark/databricks
description: 'ClickHouse 与 Databricks 集成'
keywords: ['clickhouse', 'databricks', 'spark', 'unity catalog', 'data']
title: 'ClickHouse 与 Databricks 集成'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 将 ClickHouse 与 Databricks 集成 \{#integrating-clickhouse-with-databricks\}

<ClickHouseSupportedBadge/>

ClickHouse Spark 连接器可以与 Databricks 无缝配合使用。本文档介绍在 Databricks 上的特定平台配置、安装方式以及使用模式。

## 适用于 Databricks 的 API 选择 \{#api-selection\}

默认情况下，Databricks 使用 Unity Catalog，这会阻止 Spark catalog 注册。在这种情况下，必须使用 **TableProvider API**（基于格式的访问方式）。

但是，如果通过创建一个访问模式为 **No isolation shared** 的集群来禁用 Unity Catalog，则可以改用 **Catalog API**。Catalog API 提供集中式配置以及原生的 Spark SQL 集成。

| Unity Catalog 状态 | 推荐 API | 说明 |
|---------------------|------------------|-------|
| **启用**（默认） | TableProvider API（基于格式） | Unity Catalog 会阻止 Spark catalog 注册 |
| **禁用**（No isolation shared） | Catalog API | 需要访问模式为 "No isolation shared" 的集群 |

## 在 Databricks 中安装 \{#installation\}

### 选项 1：通过 Databricks UI 上传 JAR \{#installation-ui\}

1. 构建或[下载](https://repo1.maven.org/maven2/com/clickhouse/spark/)运行时 JAR：
   ```bash
   clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar
   ```

2. 将 JAR 上传到 Databricks 工作区：
   - 转到 **Workspace** → 导航到目标文件夹
   - 单击 **Upload** → 选择该 JAR 文件
   - JAR 将存储在工作区中

3. 在集群上安装该库：
   - 转到 **Compute** → 选择集群
   - 单击 **Libraries** 选项卡
   - 单击 **Install New**
   - 选择 **DBFS** 或 **Workspace** → 导航到已上传的 JAR 文件
   - 单击 **Install**

<Image img={require('@site/static/images/integrations/data-ingestion/apache-spark/databricks/databricks-libraries-tab.png')} alt="Databricks Libraries 选项卡" />

<Image img={require('@site/static/images/integrations/data-ingestion/apache-spark/databricks/databricks-install-from-volume.png')} alt="从 Workspace 卷安装库" />

4. 重启集群以加载该库

### 方案 2：通过 Databricks CLI 安装 \{#installation-cli\}

```bash
# Upload JAR to DBFS
databricks fs cp clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar \
  dbfs:/FileStore/jars/

# Install on cluster
databricks libraries install \
  --cluster-id <your-cluster-id> \
  --jar dbfs:/FileStore/jars/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar
```


### 选项 3：Maven 坐标（推荐） \{#installation-maven\}

1. 进入您的 Databricks 工作区：
   * 前往 **Compute** → 选择目标集群
   * 单击 **Libraries** 选项卡
   * 单击 **Install New**
   * 选择 **Maven** 选项卡

2. 添加 Maven 坐标：

```text
com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}
```

<Image img={require('@site/static/images/integrations/data-ingestion/apache-spark/databricks/databricks-maven-tab.png')} alt="Databricks Maven 库配置" />

3. 单击 **Install**，然后重启集群以加载该库


## 使用 TableProvider API \{#tableprovider-api\}

在启用 Unity Catalog（默认）时，**必须**使用 TableProvider API（基于格式的访问方式），因为 Unity Catalog 会阻止通过 Spark catalog 进行注册。如果您通过使用访问模式为 "No isolation shared" 的集群禁用了 Unity Catalog，则可以改用 [Catalog API](/integrations/apache-spark/spark-native-connector#register-the-catalog-required)。

### 读取数据 \{#reading-data-table-provider\}

<Tabs groupId="databricks_usage">
<TabItem value="Python" label="Python" default>

```python
# 使用 TableProvider API 从 ClickHouse 读取数据
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

# 表结构会被自动推断
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

### 写入数据 \{#writing-data-unity\}

<Tabs groupId="databricks_usage">
<TabItem value="Python" label="Python" default>

```python
# 写入 ClickHouse——如果表不存在，将自动创建
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
    .option("order_by", "id") \  # 必需：创建新表时需要指定 ORDER BY
    .option("settings.allow_nullable_key", "1") \  # 如果 ORDER BY 包含 Nullable 列，在 ClickHouse Cloud 中是必需的
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
  .option("order_by", "id")  // 必需：创建新表时需要指定 ORDER BY
  .option("settings.allow_nullable_key", "1")  // 如果 ORDER BY 包含 Nullable 列，在 ClickHouse Cloud 中是必需的
  .mode("append")
  .save()
```

</TabItem>
</Tabs>

:::note
此示例假定已在 Databricks 中预先配置好 secret scope（机密作用域）。有关配置步骤，请参阅 Databricks 的 [Secret 管理文档](https://docs.databricks.com/aws/en/security/secrets/)。
:::

## Databricks 特有注意事项 \{#considerations\}

### 机密管理 \{#secret-management\}

使用 Databricks 的 secret scopes 安全存储 ClickHouse 凭证：

```python
# Access secrets
password = dbutils.secrets.get(scope="clickhouse", key="password")
```

有关配置的说明，请参阅 Databricks 的 [Secret 管理文档](https://docs.databricks.com/aws/en/security/secrets/)。

{/* TODO: 添加 Databricks secret scopes 配置的截图 */ }


### ClickHouse Cloud 连接 \{#clickhouse-cloud\}

从 Databricks 连接到 ClickHouse Cloud 时：

1. 使用 **HTTPS 协议**（`protocol: https`, `http_port: 8443`）
2. 启用 **SSL**（`ssl: true`）

## 示例 \{#examples\}

### 完整工作流示例 \{#workflow-example\}

<Tabs groupId="databricks_usage">
<TabItem value="Python" label="Python" default>

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col

# 使用 ClickHouse 连接器初始化 Spark
spark = SparkSession.builder \
    .config("spark.jars.packages", "com.clickhouse.spark:clickhouse-spark-runtime-3.4_2.12:0.9.0") \
    .getOrCreate()

# 从 ClickHouse 读取数据
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

# 转换数据
transformed_df = df.filter(col("status") == "active")

# 将数据写入 ClickHouse
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

// 使用 ClickHouse 连接器初始化 Spark
val spark = SparkSession.builder
  .config("spark.jars.packages", "com.clickhouse.spark:clickhouse-spark-runtime-3.4_2.12:0.9.0")
  .getOrCreate()

// 从 ClickHouse 读取数据
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

// 转换数据
val transformedDF = df.filter(col("status") === "active")

// 将数据写入 ClickHouse
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

## 相关文档 \{#related\}

- [Spark 原生连接器指南](/integrations/apache-spark/spark-native-connector) - 完整连接器文档
- [TableProvider API 文档](/integrations/apache-spark/spark-native-connector#using-the-tableprovider-api) - 基于格式的访问详细说明
- [Catalog API 文档](/integrations/apache-spark/spark-native-connector#register-the-catalog-required) - 基于目录的访问详细说明