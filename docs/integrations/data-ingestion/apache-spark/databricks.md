---
sidebar_label: 'Databricks'
sidebar_position: 3
slug: /integrations/data-ingestion/apache-spark/databricks
description: 'Integrate ClickHouse with Databricks'
keywords: ['clickhouse', 'databricks', 'spark', 'unity catalog', 'data']
title: 'Integrating ClickHouse with Databricks'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Integrating ClickHouse with Databricks

<ClickHouseSupportedBadge/>

The ClickHouse Spark connector works seamlessly with Databricks. This guide covers platform-specific setup, installation, and usage patterns for Databricks.

## API Selection for Databricks {#api-selection}

In Databricks, you **must** use the **TableProvider API** (format-based access). Unity Catalog blocks any attempt to register Spark catalogs, so the Catalog API is not available in Databricks environments.

## Installation on Databricks {#installation}

### Option 1: Upload JAR via Databricks UI {#installation-ui}

1. Build or [download](https://repo1.maven.org/maven2/com/clickhouse/spark/) the runtime JAR:
   ```bash
   clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar
   ```

2. Navigate to your Databricks workspace:
   - Go to **Compute** → Select your cluster
   - Click the **Libraries** tab
   - Click **Install New**
   - Select **Upload** → **JAR**
   - Upload the runtime JAR file
   - Click **Install**

3. Restart the cluster to load the library

<!-- TODO: Add screenshot of Databricks Libraries UI -->

### Option 2: Install via Databricks CLI {#installation-cli}

```bash
# Upload JAR to DBFS
databricks fs cp clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar \
  dbfs:/FileStore/jars/

# Install on cluster
databricks libraries install \
  --cluster-id <your-cluster-id> \
  --jar dbfs:/FileStore/jars/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar
```

### Option 3: Maven Coordinates (Recommended) {#installation-maven}

In your cluster configuration, add the Maven coordinates:

```text
com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}
```

<!-- TODO: Add screenshot of Databricks cluster Maven libraries configuration -->

## Using TableProvider API {#tableprovider-api}

In Databricks, you **must** use the TableProvider API (format-based access). Unity Catalog blocks any attempt to register Spark catalogs.

### Reading Data {#reading-data-unity}

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

### Writing Data {#writing-data-unity}

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
This example assumes preconfigured secret scopes in Databricks. For setup instructions, see the Databricks [Secret management documentation](https://docs.databricks.com/aws/en/security/secrets/).
:::

## Databricks-Specific Considerations {#considerations}

### Secret Management {#secret-management}

Use Databricks secret scopes to securely store ClickHouse credentials:

```python
# Access secrets
password = dbutils.secrets.get(scope="clickhouse", key="password")
```

For setup instructions, see the Databricks [Secret management documentation](https://docs.databricks.com/aws/en/security/secrets/).

<!-- TODO: Add screenshot of Databricks secret scopes configuration -->

### ClickHouse Cloud Connection {#clickhouse-cloud}

When connecting to ClickHouse Cloud from Databricks:

1. Use **HTTPS protocol** (`protocol: https`, `http_port: 8443`)
2. Enable **SSL** (`ssl: true`)

### Performance Optimization {#performance}

- Set appropriate **batch sizes** via `spark.clickhouse.write.batchSize`
- Consider using **JSON format** for VariantType data
- Enable **predicate pushdown** (enabled by default)

### Runtime Compatibility {#runtime-compatibility}

- **Spark 3.3, 3.4, 3.5, 4.0**: Fully supported
- **Scala 2.12, 2.13**: Supported (Spark 4.0 requires Scala 2.13)
- **Python 3**: Supported
- **Java 8, 17**: Supported (Java 17+ required for Spark 4.0)

## Examples {#examples}

### Complete Workflow Example {#workflow-example}

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

## Related Documentation {#related}

- [Spark Native Connector Guide](/docs/integrations/data-ingestion/apache-spark/spark-native-connector) - Complete connector documentation
- [TableProvider API Documentation](/docs/integrations/data-ingestion/apache-spark/spark-native-connector#using-the-tableprovider-api-format-based-access) - Format-based access details
- [Catalog API Documentation](/docs/integrations/data-ingestion/apache-spark/spark-native-connector#register-the-catalog-required) - Catalog-based access details
