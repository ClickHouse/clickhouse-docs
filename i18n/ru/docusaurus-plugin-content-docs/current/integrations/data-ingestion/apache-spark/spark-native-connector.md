---
sidebar_label: 'Spark Native Connector'
sidebar_position: 2
slug: /integrations/apache-spark/spark-native-connector
description: 'Введение в Apache Spark с ClickHouse'
keywords: ['clickhouse', 'Apache Spark', 'миграция', 'данные']
title: 'Коннектор Spark'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';

# Коннектор Spark

Этот коннектор использует специфические для ClickHouse оптимизации, такие как продвинутое партиционирование и сокращение предикатов, для улучшения производительности запросов и обработки данных. Коннектор основан на [официальном JDBC коннекторе ClickHouse](https://github.com/ClickHouse/clickhouse-java) и управляет своим собственным каталогом.

До версии Spark 3.0 в Spark не существовало концепции встроенного каталога, поэтому пользователи обычно полагались на внешние системы каталогов, такие как Hive Metastore или AWS Glue. С этими внешними решениями пользователи должны были вручную регистрировать свои источники данных перед доступом к ним в Spark. Однако с введением концепции каталога в Spark 3.0 теперь Spark может автоматически обнаруживать таблицы, регистрируя плагины каталогов.

Каталог по умолчанию для Spark — `spark_catalog`, а таблицы идентифицируются по формату `{catalog name}.{database}.{table}`. С новой функцией каталога теперь возможно добавлять и работать с несколькими каталогами в одном приложении Spark.

<TOCInline toc={toc}></TOCInline>

## Требования {#requirements}

- Java 8 или 17
- Scala 2.12 или 2.13
- Apache Spark 3.3, 3.4 или 3.5
## Матрица совместимости {#compatibility-matrix}

| Версия | Совместимые версии Spark | Версия ClickHouse JDBC |
|--------|--------------------------|-------------------------|
| main   | Spark 3.3, 3.4, 3.5     | 0.6.3                   |
| 0.8.1  | Spark 3.3, 3.4, 3.5     | 0.6.3                   |
| 0.8.0  | Spark 3.3, 3.4, 3.5     | 0.6.3                   |
| 0.7.3  | Spark 3.3, 3.4          | 0.4.6                   |
| 0.6.0  | Spark 3.3                | 0.3.2-patch11           |
| 0.5.0  | Spark 3.2, 3.3          | 0.3.2-patch11           |
| 0.4.0  | Spark 3.2, 3.3          | Не зависит от           |
| 0.3.0  | Spark 3.2, 3.3          | Не зависит от           |
| 0.2.1  | Spark 3.2                | Не зависит от           |
| 0.1.2  | Spark 3.2                | Не зависит от           |
## Установка и настройка {#installation--setup}

Для интеграции ClickHouse с Spark существует несколько вариантов установки, подходящих для различных проектных настроек. Вы можете добавить коннектор ClickHouse Spark в качестве зависимости непосредственно в файле сборки вашего проекта (например, в `pom.xml` для Maven или `build.sbt` для SBT). Кроме того, вы можете поместить необходимые JAR-файлы в папку `$SPARK_HOME/jars/` или передать их непосредственно в качестве опции Spark, используя флаг `--jars` в команде `spark-submit`. Оба подхода обеспечивают доступность коннектора ClickHouse в вашей среде Spark.
### Импорт как зависимость {#import-as-a-dependency}

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

Добавьте следующий репозиторий, если вы хотите использовать версию SNAPSHOT.

```maven
<repositories>
  <repository>
    <id>sonatype-oss-snapshots</id>
    <name>Репозиторий Sonatype OSS Snapshots</name>
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

Добавьте следующий репозиторий, если хотите использовать версию SNAPSHOT:

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

При работе с параметрами оболочки Spark (Spark SQL CLI, Spark Shell CLI и команда Spark Submit) зависимости могут быть зарегистрированы, передавая необходимые JAR-файлы:

```text
$SPARK_HOME/bin/spark-sql \
  --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
```

Если вы хотите избежать копирования JAR-файлов на узел клиента Spark, вы можете использовать следующее:

```text
  --repositories https://{maven-central-mirror or private-nexus-repo} \
  --packages com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }},com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}:all
```

Примечание: Для использования только SQL рекомендуется [Apache Kyuubi](https://github.com/apache/kyuubi) в производственной среде.

</TabItem>
</Tabs>
### Скачивание библиотеки {#download-the-library}

Шаблон имени двоичного JAR:

```bash
clickhouse-spark-runtime-${spark_binary_version}_${scala_binary_version}-${version}.jar
```

Вы можете найти все доступные выпущенные JAR-файлы в [Maven Central Repository](https://repo1.maven.org/maven2/com/clickhouse/spark/) и все дневные сборки SNAPSHOT JAR-файлы в [Sonatype OSS Snapshots Repository](https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/).

:::important
Важно включать [clickhouse-jdbc JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc) с классификатором "all", так как коннектор зависит от [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client) и [clickhouse-client](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client) — оба из которых объединены в clickhouse-jdbc:all. В качестве альтернативы вы можете добавлять [clickhouse-client JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client) и [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client) по отдельности, если не хотите использовать полный пакет JDBC.

В любом случае убедитесь, что версии пакетов совместимы согласно [Матрице совместимости](#compatibility-matrix).
:::
## Регистрация каталога (обязательно) {#register-the-catalog-required}

Чтобы получить доступ к вашим таблицам ClickHouse, вы должны настроить новый каталог Spark с следующими параметрами:

| Свойство                                     | Значение                                   | Значение по умолчанию | Обязательно |
|----------------------------------------------|-------------------------------------------|-----------------------|------------|
| `spark.sql.catalog.<catalog_name>`           | `com.clickhouse.spark.ClickHouseCatalog`  | N/A                   | Да         |
| `spark.sql.catalog.<catalog_name>.host`      | `<clickhouse_host>`                       | `localhost`           | Нет        |
| `spark.sql.catalog.<catalog_name>.protocol`  | `http`                                    | `http`                | Нет        |
| `spark.sql.catalog.<catalog_name>.http_port` | `<clickhouse_port>`                       | `8123`                | Нет        |
| `spark.sql.catalog.<catalog_name>.user`      | `<clickhouse_username>`                   | `default`             | Нет        |
| `spark.sql.catalog.<catalog_name>.password`  | `<clickhouse_password>`                   | (пустая строка)      | Нет        |
| `spark.sql.catalog.<catalog_name>.database`  | `<database>`                              | `default`             | Нет        |
| `spark.<catalog_name>.write.format`          | `json`                                    | `arrow`               | Нет        |

Эти настройки могут быть заданы одним из следующих способов:

* Редактировать/создать `spark-defaults.conf`.
* Передать конфигурацию вашей команде `spark-submit` (или вашим командам `spark-shell`/`spark-sql` CLI).
* Добавить конфигурацию при инициализации вашего контекста.

:::important
При работе с кластером ClickHouse вы должны задать уникальное имя каталога для каждого экземпляра. Например:

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

Таким образом, вы сможете получить доступ к таблице clickhouse1 `<ck_db>.<ck_table>` из Spark SQL с помощью `clickhouse1.<ck_db>.<ck_table>`, а к таблице clickhouse2 `<ck_db>.<ck_table>` с помощью `clickhouse2.<ck_db>.<ck_table>`.

:::
## Чтение данных {#read-data}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
public static void main(String[] args) {
        // Создание сессии Spark
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

```scala
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
## Запись данных {#write-data}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
 public static void main(String[] args) throws AnalysisException {

        // Создание сессии Spark
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

        // Определение схемы для DataFrame
        StructType schema = new StructType(new StructField[]{
                DataTypes.createStructField("id", DataTypes.IntegerType, false),
                DataTypes.createStructField("name", DataTypes.StringType, false),
        });


        List<Row> data = Arrays.asList(
                RowFactory.create(1, "Alice"),
                RowFactory.create(2, "Bob")
        );

        // Создание DataFrame
        Dataset<Row> df = spark.createDataFrame(data, schema);

        df.writeTo("clickhouse.default.example_table").append();

        spark.stop();
    }
```

</TabItem>
<TabItem value="Scala" label="Scala">

```scala
object NativeSparkWrite extends App {
  // Создание сессии Spark
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

  // Определение схемы для DataFrame
  val rows = Seq(Row(1, "John"), Row(2, "Doe"))

  val schema = List(
    StructField("id", DataTypes.IntegerType, nullable = false),
    StructField("name", StringType, nullable = true)
  )
  // Создание df
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


# Используйте любую другую комбинацию пакетов, соответствующую предоставленной матрице совместимости.
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


# Создание DataFrame
data = [Row(id=11, name="John"), Row(id=12, name="Doe")]
df = spark.createDataFrame(data)


# Запись DataFrame в ClickHouse
df.writeTo("clickhouse.default.example_table").append()
```

</TabItem>
<TabItem value="SparkSQL" label="Spark SQL">

```sql
    -- resultTable это промежуточный df Spark, который мы хотим вставить в clickhouse.default.example_table
   INSERT INTO TABLE clickhouse.default.example_table
                SELECT * FROM resultTable;
                
```

</TabItem>
</Tabs>
## Операции DDL {#ddl-operations}

Вы можете выполнять операции DDL на вашем экземпляре ClickHouse, используя Spark SQL, при этом все изменения немедленно сохраняются в ClickHouse. Spark SQL позволяет вам писать запросы точно так же, как вы делали бы это в ClickHouse, поэтому вы можете напрямую выполнять команды, такие как CREATE TABLE, TRUNCATE и другие - без изменений, например:

```sql

use clickhouse; 

CREATE TABLE test_db.tbl_sql (
  create_time TIMESTAMP NOT NULL,
  m           INT       NOT NULL COMMENT 'Ключ партиции',
  id          BIGINT    NOT NULL COMMENT 'Ключ сортировки',
  value       STRING
) USING ClickHouse
PARTITIONED BY (m)
TBLPROPERTIES (
  engine = 'MergeTree()',
  order_by = 'id',
  settings.index_granularity = 8192
);
```

Приведенные примеры демонстрируют запросы Spark SQL, которые вы можете выполнять в своем приложении, используя любой API — Java, Scala, PySpark или оболочку.
## Конфигурации {#configurations}

Следующие Adjustable конфигурации доступны в коннекторе:

<br/>

| Ключ                                               | Значение по умолчанию                              | Описание                                                                                                                                                                                                                                                                                                                                                                                                                 | С версии |
|-----------------------------------------------------|---------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------|
| spark.clickhouse.ignoreUnsupportedTransform         | false                                             | ClickHouse поддерживает использование сложных выражений в качестве ключей шардирования или значений партиций, например `cityHash64(col_1, col_2)`, которые в настоящее время не поддерживаются Spark. Если установлено `true`, игнорировать неподдерживаемые выражения, в противном случае быстро завершить с исключением. Обратите внимание, что при включении `spark.clickhouse.write.distributed.convertLocal`, игнорирование неподдерживаемых ключей шардирования может испортить данные. | 0.4.0 |
| spark.clickhouse.read.compression.codec             | lz4                                               | Кодек, используемый для распаковки данных для чтения. Поддерживаемые кодеки: none, lz4.                                                                                                                                                                                                                                                                                                                                  | 0.5.0 |
| spark.clickhouse.read.distributed.convertLocal      | true                                              | При чтении распределенной таблицы, читать локальную таблицу вместо самой себя. Если установлено `true`, игнорировать `spark.clickhouse.read.distributed.useClusterNodes`.                                                                                                                                                                                                                                           | 0.1.0 |
| spark.clickhouse.read.fixedStringAs                 | binary                                            | Чтение ClickHouse типа FixedString как указанный тип данных Spark. Поддерживаемые типы: binary, string                                                                                                                                                                                                                                                                                                                 | 0.8.0 |
| spark.clickhouse.read.format                        | json                                              | Формат сериализации для чтения. Поддерживаемые форматы: json, binary                                                                                                                                                                                                                                                                                                                                                     | 0.6.0 |
| spark.clickhouse.read.runtimeFilter.enabled         | false                                             | Включение фильтра в реальном времени для чтения.                                                                                                                                                                                                                                                                                                                                                                        | 0.8.0 |
| spark.clickhouse.read.splitByPartitionId            | true                                              | Если установлено `true`, создать фильтр входной партиции по виртуальной колонке `_partition_id`, а не по значению партиции. Известны проблемы с составлением SQL предикатов по значению партиции. Эта функция требует ClickHouse Server v21.6+                                                                                                                                                                           | 0.4.0 |
| spark.clickhouse.useNullableQuerySchema             | false                                             | Если установлено `true`, пометить все поля схемы запроса как допустимые при выполнении `CREATE/REPLACE TABLE ... AS SELECT ...` для создания таблицы. Обратите внимание, что эта конфигурация требует SPARK-43390 (доступно в Spark 3.5), без этой правки всегда будет действовать как `true`.                                                                                                                                    | 0.8.0 |
| spark.clickhouse.write.batchSize                    | 10000                                             | Количество записей на партию при записи в ClickHouse.                                                                                                                                                                                                                                                                                                                                                                   | 0.1.0 |
| spark.clickhouse.write.compression.codec            | lz4                                              | Кодек, используемый для сжатия данных при записи. Поддерживаемые кодеки: none, lz4.                                                                                                                                                                                                                                                                                                                                        | 0.3.0 |
| spark.clickhouse.write.distributed.convertLocal     | false                                             | При записи в распределенную таблицу, писать локальную таблицу вместо самой себя. Если установлено `true`, игнорировать `spark.clickhouse.write.distributed.useClusterNodes`.                                                                                                                                                                                                                                       | 0.1.0 |
| spark.clickhouse.write.distributed.useClusterNodes  | true                                              | Запись на все узлы кластера при записи в распределенную таблицу.                                                                                                                                                                                                                                                                                                                                                        | 0.1.0 |
| spark.clickhouse.write.format                       | arrow                                             | Формат сериализации для записи. Поддерживаемые форматы: json, arrow                                                                                                                                                                                                                                                                                                                                                     | 0.4.0 |
| spark.clickhouse.write.localSortByKey               | true                                              | Если установлено `true`, выполнить локальную сортировку по ключам сортировки перед записью.                                                                                                                                                                                                                                                                                                                            | 0.3.0 |
| spark.clickhouse.write.localSortByPartition         | значение spark.clickhouse.write.repartitionByPartition | Если установлено `true`, выполнить локальную сортировку по партиции перед записью. Если не установлено, будет эквивалентно `spark.clickhouse.write.repartitionByPartition`.                                                                                                                                                                                                                                         | 0.3.0 |
| spark.clickhouse.write.maxRetry                     | 3                                                 | Максимальное количество попыток записи, которые мы будем делать для одной записи, завершившейся неудачей с кодами, подлежащими повторной попытке.                                                                                                                                                                                                                                                                        | 0.1.0 |
| spark.clickhouse.write.repartitionByPartition       | true                                              | Следует ли перераспределять данные по ключам партиции ClickHouse, чтобы соответствовать распределению таблицы ClickHouse перед записью.                                                                                                                                                                                                                                                                                    | 0.3.0 |
| spark.clickhouse.write.repartitionNum               | 0                                                 | Перераспределение данных, чтобы соответствовать распределению таблицы ClickHouse, требуется перед записью; используйте эту конфигурацию, чтобы указать номер перераспределения; значение меньше 1 означает отсутствие требований.                                                                                                                                                                                  | 0.1.0 |
| spark.clickhouse.write.repartitionStrictly          | false                                             | Если установлено `true`, Spark будет строго распределять входящие записи по партициям, чтобы удовлетворить требуемое распределение перед передачей записей в таблицу источника данных на запись. В противном случае Spark может применять определенные оптимизации для ускорения запроса, но нарушить требование распределения. Обратите внимание, что эта конфигурация требует SPARK-37523 (доступно в Spark 3.4), без этой правки всегда будет действовать как `true`. | 0.3.0 |
| spark.clickhouse.write.retryInterval                | 10s                                               | Интервал в секундах между попытками записи.                                                                                                                                                                                                                                                                                                                                                                             | 0.1.0 |
| spark.clickhouse.write.retryableErrorCodes          | 241                                              | Коды ошибок, подлежащие повторной попытке, возвращаемые сервером ClickHouse при неудаче записи.                                                                                                                                                                                                                                                                                                                       | 0.1.0 |

## Поддерживаемые типы данных {#supported-data-types}

В этом разделе описывается сопоставление типов данных между Spark и ClickHouse. Таблицы ниже предоставляют быстрое руководство по преобразованию типов данных при чтении из ClickHouse в Spark и при вставке данных из Spark в ClickHouse.

### Чтение данных из ClickHouse в Spark {#reading-data-from-clickhouse-into-spark}

| Тип данных ClickHouse                                       | Тип данных Spark            | Поддерживается | Является примитивным | Примечания                                      |
|------------------------------------------------------------|------------------------------|----------------|---------------------|------------------------------------------------|
| `Nothing`                                                  | `NullType`                   | ✅              | Да                  |                                                |
| `Bool`                                                     | `BooleanType`                | ✅              | Да                  |                                                |
| `UInt8`, `Int16`                                         | `ShortType`                  | ✅              | Да                  |                                                |
| `Int8`                                                    | `ByteType`                   | ✅              | Да                  |                                                |
| `UInt16`,`Int32`                                         | `IntegerType`                | ✅              | Да                  |                                                |
| `UInt32`,`Int64`, `UInt64`                               | `LongType`                   | ✅              | Да                  |                                                |
| `Int128`,`UInt128`, `Int256`, `UInt256`                 | `DecimalType(38, 0)`         | ✅              | Да                  |                                                |
| `Float32`                                                | `FloatType`                  | ✅              | Да                  |                                                |
| `Float64`                                                | `DoubleType`                 | ✅              | Да                  |                                                |
| `String`, `JSON`, `UUID`, `Enum8`, `Enum16`, `IPv4`, `IPv6` | `StringType`                 | ✅              | Да                  |                                                |
| `FixedString`                                            | `BinaryType`, `StringType`   | ✅              | Да                  | Контролируется конфигурацией `READ_FIXED_STRING_AS` |
| `Decimal`                                                | `DecimalType`                | ✅              | Да                  | Точность и масштаб до `Decimal128`              |
| `Decimal32`                                              | `DecimalType(9, scale)`      | ✅              | Да                  |                                                |
| `Decimal64`                                              | `DecimalType(18, scale)`     | ✅              | Да                  |                                                |
| `Decimal128`                                             | `DecimalType(38, scale)`     | ✅              | Да                  |                                                |
| `Date`, `Date32`                                        | `DateType`                   | ✅              | Да                  |                                                |
| `DateTime`, `DateTime32`, `DateTime64`                   | `TimestampType`              | ✅              | Да                  |                                                |
| `Array`                                                  | `ArrayType`                  | ✅              | Нет                 | Тип элемента массива также преобразуется       |
| `Map`                                                    | `MapType`                    | ✅              | Нет                 | Ключи ограничены `StringType`                 |
| `IntervalYear`                                           | `YearMonthIntervalType(Year)` | ✅              | Да                  |                                                |
| `IntervalMonth`                                          | `YearMonthIntervalType(Month)`| ✅              | Да                  |                                                |
| `IntervalDay`, `IntervalHour`, `IntervalMinute`, `IntervalSecond` | `DayTimeIntervalType`      | ✅              | Нет                 | Используется конкретный тип интервала         |
| `Object`                                                 |                               | ❌              |                     |                                                |
| `Nested`                                                 |                               | ❌              |                     |                                                |
| `Tuple`                                                  |                               | ❌              |                     |                                                |
| `Point`                                                  |                               | ❌              |                     |                                                |
| `Polygon`                                                |                               | ❌              |                     |                                                |
| `MultiPolygon`                                           |                               | ❌              |                     |                                                |
| `Ring`                                                   |                               | ❌              |                     |                                                |
| `IntervalQuarter`                                        |                               | ❌              |                     |                                                |
| `IntervalWeek`                                           |                               | ❌              |                     |                                                |
| `Decimal256`                                             |                               | ❌              |                     |                                                |
| `AggregateFunction`                                      |                               | ❌              |                     |                                                |
| `SimpleAggregateFunction`                                |                               | ❌              |                     |                                                |

### Вставка данных из Spark в ClickHouse {#inserting-data-from-spark-into-clickhouse}

| Тип данных Spark                     | Тип данных ClickHouse | Поддерживается | Является примитивным | Примечания                                     |
|--------------------------------------|----------------------|----------------|---------------------|------------------------------------------------|
| `BooleanType`                        | `UInt8`              | ✅              | Да                  |                                                |
| `ByteType`                           | `Int8`               | ✅              | Да                  |                                                |
| `ShortType`                          | `Int16`              | ✅              | Да                  |                                                |
| `IntegerType`                        | `Int32`              | ✅              | Да                  |                                                |
| `LongType`                           | `Int64`              | ✅              | Да                  |                                                |
| `FloatType`                          | `Float32`            | ✅              | Да                  |                                                |
| `DoubleType`                         | `Float64`            | ✅              | Да                  |                                                |
| `StringType`                         | `String`             | ✅              | Да                  |                                                |
| `VarcharType`                        | `String`             | ✅              | Да                  |                                                |
| `CharType`                           | `String`             | ✅              | Да                  |                                                |
| `DecimalType`                        | `Decimal(p, s)`      | ✅              | Да                  | Точность и масштаб до `Decimal128`             |
| `DateType`                           | `Date`               | ✅              | Да                  |                                                |
| `TimestampType`                      | `DateTime`           | ✅              | Да                  |                                                |
| `ArrayType` (список, кортеж или массив) | `Array`              | ✅              | Нет                 | Тип элемента массива также преобразуется       |
| `MapType`                            | `Map`                | ✅              | Нет                 | Ключи ограничены `StringType`                  |
| `Object`                             |                      | ❌              |                     |                                                |
| `Nested`                             |                      | ❌              |                     |                                                |

## Участие и поддержка {#contributing-and-support}

Если вы хотите внести свой вклад в проект или сообщить о любых проблемах, мы приветствуем ваше мнение!
Посетите наш [репозиторий на GitHub](https://github.com/ClickHouse/spark-clickhouse-connector), чтобы открыть проблему, предложить
улучшения или отправить запрос на изменение.
Ваш вклад приветствуется! Пожалуйста, ознакомьтесь с руководством по участию в репозитории перед началом.
Спасибо за помощь в улучшении нашего коннектора ClickHouse Spark!
