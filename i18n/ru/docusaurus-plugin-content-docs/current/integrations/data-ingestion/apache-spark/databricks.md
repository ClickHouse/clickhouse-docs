---
sidebar_label: 'Databricks'
sidebar_position: 3
slug: /integrations/data-ingestion/apache-spark/databricks
description: 'Интеграция ClickHouse и Databricks'
keywords: ['clickhouse', 'databricks', 'spark', 'unity catalog', 'data']
title: 'Интеграция ClickHouse и Databricks'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Интеграция ClickHouse с Databricks {#integrating-clickhouse-with-databricks}

<ClickHouseSupportedBadge/>

Коннектор ClickHouse для Spark полностью совместим с Databricks. В этом руководстве описываются настройка платформы, установка и сценарии использования в Databricks.

## Выбор API для Databricks {#api-selection}

По умолчанию Databricks использует Unity Catalog, который блокирует регистрацию каталога Spark. В этом случае вы **должны** использовать **TableProvider API** (доступ на основе формата).

Однако, если вы отключите Unity Catalog, создав кластер с режимом доступа **No isolation shared**, вы можете вместо этого использовать **Catalog API**. Catalog API обеспечивает централизованную конфигурацию и нативную интеграцию со Spark SQL.

| Статус Unity Catalog | Рекомендуемый API | Примечания |
|---------------------|------------------|-------|
| **Включен** (по умолчанию) | TableProvider API (format-based) | Unity Catalog блокирует регистрацию каталога Spark |
| **Отключен** (No isolation shared) | Catalog API | Требуется кластер с режимом доступа «No isolation shared» |

## Установка в Databricks {#installation}

### Вариант 1: загрузка JAR через интерфейс Databricks {#installation-ui}

1. Соберите или [скачайте](https://repo1.maven.org/maven2/com/clickhouse/spark/) runtime JAR:
   ```bash
   clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar
   ```

2. Загрузите JAR в рабочее пространство Databricks:
   - Перейдите в **Workspace** → откройте нужную папку
   - Нажмите **Upload** → выберите JAR-файл
   - JAR будет сохранён в вашем рабочем пространстве

3. Установите библиотеку на кластер:
   - Перейдите в **Compute** → выберите ваш кластер
   - Откройте вкладку **Libraries**
   - Нажмите **Install New**
   - Выберите **DBFS** или **Workspace** → укажите загруженный JAR-файл
   - Нажмите **Install**

<Image img={require('@site/static/images/integrations/data-ingestion/apache-spark/databricks/databricks-libraries-tab.png')} alt="Вкладка Libraries в Databricks" />

<Image img={require('@site/static/images/integrations/data-ingestion/apache-spark/databricks/databricks-install-from-volume.png')} alt="Установка библиотеки из тома рабочей области (workspace volume)" />

4. Перезапустите кластер, чтобы подгрузить библиотеку

### Вариант 2: установка с помощью Databricks CLI {#installation-cli}

```bash
# Upload JAR to DBFS
databricks fs cp clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar \
  dbfs:/FileStore/jars/

# Install on cluster
databricks libraries install \
  --cluster-id <your-cluster-id> \
  --jar dbfs:/FileStore/jars/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar
```


### Вариант 3: координаты Maven (рекомендуется) {#installation-maven}

1. Перейдите в свое рабочее пространство Databricks:
   * Откройте раздел **Compute** и выберите кластер
   * Перейдите на вкладку **Libraries**
   * Нажмите **Install New**
   * Выберите вкладку **Maven**

2. Добавьте координаты Maven:

```text
com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}
```

&lt;Image img=&#123;require(&#39;@site/static/images/integrations/data-ingestion/apache-spark/databricks/databricks-maven-tab.png&#39;)&#125; alt=&quot;Настройка библиотек Maven в Databricks&quot; /&gt;

3. Нажмите **Install** и перезапустите кластер, чтобы библиотека загрузилась


## Использование TableProvider API {#tableprovider-api}

Когда включён Unity Catalog (по умолчанию), вы **должны** использовать TableProvider API (доступ по формату), потому что Unity Catalog блокирует регистрацию каталога Spark. Если вы отключили Unity Catalog, используя кластер с режимом доступа «No isolation shared», вы можете вместо этого использовать [Catalog API](/docs/integrations/data-ingestion/apache-spark/spark-native-connector#register-the-catalog-required).

### Чтение данных {#reading-data-table-provider}

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


### Запись данных {#writing-data-unity}

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
В этом примере предполагается, что в Databricks предварительно настроены области секретов (secret scopes). Инструкции по настройке см. в документации Databricks по [управлению секретами (Secret management)](https://docs.databricks.com/aws/en/security/secrets/).
:::


## Специфика Databricks {#considerations}

### Управление секретами {#secret-management}

Используйте области секретов Databricks для безопасного хранения учётных данных ClickHouse:

```python
# Access secrets
password = dbutils.secrets.get(scope="clickhouse", key="password")
```

См. инструкции по настройке в [документации Databricks по управлению секретами](https://docs.databricks.com/aws/en/security/secrets/).

<!-- TODO: Add screenshot of Databricks secret scopes configuration -->


### Подключение к ClickHouse Cloud {#clickhouse-cloud}

При подключении к ClickHouse Cloud из Databricks:

1. Используйте **протокол HTTPS** (`protocol: https`, `http_port: 8443`)
2. Включите **SSL** (`ssl: true`)

## Примеры {#examples}

### Полный пример рабочего процесса {#workflow-example}

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


## Сопутствующая документация {#related}

- [Руководство по нативному коннектору Spark](/docs/integrations/data-ingestion/apache-spark/spark-native-connector) — полная документация по коннектору
- [Документация по TableProvider API](/docs/integrations/data-ingestion/apache-spark/spark-native-connector#using-the-tableprovider-api-format-based-access) — особенности доступа, основанного на формате
- [Документация по Catalog API](/docs/integrations/data-ingestion/apache-spark/spark-native-connector#register-the-catalog-required) — особенности доступа, основанного на каталоге