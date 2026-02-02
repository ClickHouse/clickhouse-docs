---
sidebar_label: 'Databricks'
sidebar_position: 3
slug: /integrations/data-ingestion/apache-spark/databricks
description: 'Интеграция ClickHouse с Databricks'
keywords: ['clickhouse', 'databricks', 'spark', 'unity catalog', 'данные']
title: 'Интеграция ClickHouse с Databricks'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Интеграция ClickHouse с Databricks \{#integrating-clickhouse-with-databricks\}

<ClickHouseSupportedBadge/>

Коннектор ClickHouse Spark полностью совместим с Databricks. В этом руководстве рассматриваются настройка, установка и сценарии использования коннектора в Databricks с учетом особенностей платформы.

## Выбор API для Databricks \{#api-selection\}

По умолчанию Databricks использует Unity Catalog, который блокирует регистрацию каталога Spark. В этом случае вы **должны** использовать **TableProvider API** (доступ на основе формата).

Однако, если вы отключите Unity Catalog, создав кластер с режимом доступа **No isolation shared**, вы можете вместо этого использовать **Catalog API**. Catalog API обеспечивает централизованную конфигурацию и нативную интеграцию со Spark SQL.

| Статус Unity Catalog | Рекомендуемый API | Примечания |
|---------------------|------------------|-----------|
| **Enabled** (по умолчанию) | TableProvider API (на основе формата) | Unity Catalog блокирует регистрацию каталога Spark |
| **Disabled** (No isolation shared) | Catalog API | Требуется кластер с режимом доступа «No isolation shared» |

## Установка в Databricks \{#installation\}

### Вариант 1: загрузка JAR через интерфейс Databricks \{#installation-ui\}

1. Соберите или [скачайте](https://repo1.maven.org/maven2/com/clickhouse/spark/) JAR-файл среды выполнения:
   ```bash
   clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar
   ```

2. Загрузите JAR в рабочее пространство Databricks:
   - Перейдите в **Workspace** → откройте нужную папку
   - Нажмите **Upload** → выберите JAR-файл
   - JAR-файл будет сохранён в вашем рабочем пространстве

3. Установите библиотеку в кластер:
   - Перейдите в **Compute** → выберите кластер
   - Откройте вкладку **Libraries**
   - Нажмите **Install New**
   - Выберите **DBFS** или **Workspace** → укажите загруженный JAR-файл
   - Нажмите **Install**

<Image img={require('@site/static/images/integrations/data-ingestion/apache-spark/databricks/databricks-libraries-tab.png')} alt="Вкладка Databricks Libraries" />

<Image img={require('@site/static/images/integrations/data-ingestion/apache-spark/databricks/databricks-install-from-volume.png')} alt="Установка библиотеки из тома рабочего пространства" />

4. Перезапустите кластер, чтобы загрузить библиотеку

### Вариант 2: Установка через Databricks CLI \{#installation-cli\}

```bash
# Upload JAR to DBFS
databricks fs cp clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar \
  dbfs:/FileStore/jars/

# Install on cluster
databricks libraries install \
  --cluster-id <your-cluster-id> \
  --jar dbfs:/FileStore/jars/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}-{{ stable_version }}.jar
```


### Вариант 3: Координаты Maven (рекомендуется) \{#installation-maven\}

1. Перейдите в рабочее пространство Databricks:
   * Откройте раздел **Compute** → выберите кластер
   * Перейдите на вкладку **Libraries**
   * Нажмите **Install New**
   * Выберите вкладку **Maven**

2. Добавьте координаты Maven:

```text
com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}
```

<Image img={require('@site/static/images/integrations/data-ingestion/apache-spark/databricks/databricks-maven-tab.png')} alt="Настройка библиотек Maven в Databricks" />

3. Нажмите **Install** и перезапустите кластер, чтобы загрузить библиотеку


## Использование TableProvider API \{#tableprovider-api\}

Когда Unity Catalog включён (по умолчанию), вы **должны** использовать TableProvider API (доступ, основанный на формате), так как Unity Catalog блокирует регистрацию каталога Spark. Если вы отключили Unity Catalog, используя кластер с режимом доступа «No isolation shared», вы можете вместо этого использовать [Catalog API](/integrations/apache-spark/spark-native-connector#register-the-catalog-required).

### Чтение данных \{#reading-data-table-provider\}

<Tabs groupId="databricks_usage">
<TabItem value="Python" label="Python" default>

```python
# Чтение из ClickHouse с использованием API TableProvider
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

# Схема определяется автоматически
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

### Запись данных \{#writing-data-unity\}

<Tabs groupId="databricks_usage">
<TabItem value="Python" label="Python" default>

```python
# Запись в ClickHouse — таблица будет автоматически создана, если она ещё не существует
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
    .option("order_by", "id") \  # Обязательно: укажите ORDER BY при создании новой таблицы
    .option("settings.allow_nullable_key", "1") \  # Обязательно для ClickHouse Cloud, если в ORDER BY есть столбцы типа Nullable
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
  .option("order_by", "id")  // Обязательно: укажите ORDER BY при создании новой таблицы
  .option("settings.allow_nullable_key", "1")  // Обязательно для ClickHouse Cloud, если в ORDER BY есть столбцы типа Nullable
  .mode("append")
  .save()
```

</TabItem>
</Tabs>

:::note
В этом примере предполагается предварительная настройка областей секретов (secret scopes) в Databricks. Инструкции по настройке см. в [документации по управлению секретами Databricks](https://docs.databricks.com/aws/en/security/secrets/).
:::

## Особенности Databricks \{#considerations\}

### Управление секретами \{#secret-management\}

Используйте области секретов Databricks для безопасного хранения учетных данных ClickHouse:

```python
# Access secrets
password = dbutils.secrets.get(scope="clickhouse", key="password")
```

Инструкции по настройке см. в [документации Databricks по управлению секретами](https://docs.databricks.com/aws/en/security/secrets/).

{/* TODO: Добавить скриншот настройки областей секретов Databricks */ }


### Подключение к ClickHouse Cloud \{#clickhouse-cloud\}

При подключении к ClickHouse Cloud из Databricks:

1. Используйте **HTTPS-протокол** (`protocol: https`, `http_port: 8443`)
2. Включите **SSL** (`ssl: true`)

## Примеры \{#examples\}

### Пример полного рабочего процесса \{#workflow-example\}

<Tabs groupId="databricks_usage">
<TabItem value="Python" label="Python" default>

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col

# Инициализация Spark с коннектором для ClickHouse
spark = SparkSession.builder \
    .config("spark.jars.packages", "com.clickhouse.spark:clickhouse-spark-runtime-3.4_2.12:0.9.0") \
    .getOrCreate()

# Чтение из ClickHouse
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

# Преобразование данных
transformed_df = df.filter(col("status") == "active")

# Запись в ClickHouse
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

// Инициализация Spark с коннектором для ClickHouse
val spark = SparkSession.builder
  .config("spark.jars.packages", "com.clickhouse.spark:clickhouse-spark-runtime-3.4_2.12:0.9.0")
  .getOrCreate()

// Чтение из ClickHouse
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

// Преобразование данных
val transformedDF = df.filter(col("status") === "active")

// Запись в ClickHouse
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

## Дополнительная документация \{#related\}

- [Spark Native Connector Guide](/integrations/apache-spark/spark-native-connector) - Полная документация по коннектору
- [TableProvider API Documentation](/integrations/apache-spark/spark-native-connector#using-the-tableprovider-api) - Подробная информация о доступе через формат
- [Catalog API Documentation](/integrations/apache-spark/spark-native-connector#register-the-catalog-required) - Подробная информация о доступе через каталог