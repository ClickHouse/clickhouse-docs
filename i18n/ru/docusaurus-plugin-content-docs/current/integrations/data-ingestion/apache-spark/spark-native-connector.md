---
sidebar_label: 'Спарк нативный соединитель'
sidebar_position: 2
slug: /integrations/apache-spark/spark-native-connector
description: 'Введение в Apache Spark с ClickHouse'
keywords: [ 'clickhouse', 'Apache Spark', 'миграция', 'данные' ]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';

# Соединитель Spark

Этот соединитель использует оптимизации, специфичные для ClickHouse, такие как продвинутое разбиение и подавление предикатов, чтобы
улучшить производительность запросов и обработку данных.
Соединитель основан на [официальном JDBC соединителе ClickHouse](https://github.com/ClickHouse/clickhouse-java) и
управляет собственным каталогом.

До Spark 3.0 в Spark не было концепции встроенного каталога, поэтому пользователи обычно полагались на внешние системы каталогов, такие как
Hive Metastore или AWS Glue.
С этими внешними решениями пользователям приходилось вручную регистрировать таблицы источников данных перед тем, как получить к ним доступ в Spark.
Тем не менее, с введением концепции каталога в Spark 3.0, Spark теперь может автоматически обнаруживать таблицы, регистрируя
плагины каталогов.

Стандартный каталог Spark — это `spark_catalog`, а таблицы идентифицируются по формату `{catalog name}.{database}.{table}`. С новой
функцией каталога теперь возможно добавлять и работать с несколькими каталогами в одном приложении Spark.

<TOCInline toc={toc}></TOCInline>
## Требования {#requirements}

- Java 8 или 17
- Scala 2.12 или 2.13
- Apache Spark 3.3 или 3.4 или 3.5
## Матрица совместимости {#compatibility-matrix}

| Версия | Совместимые версии Spark | Версия ClickHouse JDBC |
|---------|---------------------------|-------------------------|
| main    | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.8.1   | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.8.0   | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.7.3   | Spark 3.3, 3.4            | 0.4.6                   |
| 0.6.0   | Spark 3.3                 | 0.3.2-patch11           |
| 0.5.0   | Spark 3.2, 3.3            | 0.3.2-patch11           |
| 0.4.0   | Spark 3.2, 3.3            | Не зависит от           |
| 0.3.0   | Spark 3.2, 3.3            | Не зависит от           |
| 0.2.1   | Spark 3.2                 | Не зависит от           |
| 0.1.2   | Spark 3.2                 | Не зависит от           |
## Установка и настройка {#installation--setup}

Для интеграции ClickHouse с Spark существует несколько вариантов установки, подходящих для различных настроек проектов.
Вы можете добавить соединитель ClickHouse Spark как зависимость напрямую в файл сборки вашего проекта (например, в `pom.xml`
для Maven или `build.sbt` для SBT).
В качестве альтернативы, вы можете поместить необходимые JAR-файлы в папку `$SPARK_HOME/jars/` или передать их напрямую в качестве параметра Spark, используя флаг `--jars` в команде `spark-submit`.
Оба подхода обеспечивают доступность соединителя ClickHouse в вашей среде Spark.
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

Добавьте следующий репозиторий, если вы хотите использовать версию SNAPSHOT:

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

При работе с опциями оболочки Spark (Spark SQL CLI, Spark Shell CLI и командой Spark Submit) зависимости могут быть
зарегистрированы, передавая необходимые JAR:

```text
$SPARK_HOME/bin/spark-sql \
  --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
```

Если вы хотите избежать копирования файлов JAR на узел клиента Spark, вы можете использовать следующее:

```text
  --repositories https://{maven-central-mirror or private-nexus-repo} \
  --packages com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }},com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}:all
```

Примечание: Для случаев использования только SQL рекомендуется [Apache Kyuubi](https://github.com/apache/kyuubi)
для продакшна.

</TabItem>
</Tabs>
### Скачивание библиотеки {#download-the-library}

Шаблон имени бинарного JAR:

```bash
clickhouse-spark-runtime-${spark_binary_version}_${scala_binary_version}-${version}.jar
```

Вы можете найти все доступные выпущенные файлы JAR
в [Maven Central Repository](https://repo1.maven.org/maven2/com/clickhouse/spark/)
и все ежедневные сборки JAR файлов SNAPSHOT в [Sonatype OSS Snapshots Repository](https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/).

:::important
Важно включить [clickhouse-jdbc JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)
с классификатором "all",
так как соединитель зависит от [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)
и [clickhouse-client](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client) — оба из которых упакованы
в clickhouse-jdbc:all.
В качестве альтернативы, вы можете добавить [clickhouse-client JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)
и [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client) по отдельности, если вы
предпочитаете не использовать полный JDBC пакет.

В любом случае, убедитесь, что версии пакетов совместимы в соответствии с
[Матрицей совместимости](#compatibility-matrix).
:::
## Регистрация каталога (обязательно) {#register-the-catalog-required}

Чтобы получить доступ к вашим таблицам ClickHouse, вам необходимо настроить новый каталог Spark со следующими параметрами:

| Свойство                                     | Значение                                    | Значение по умолчанию | Обязательно |
|----------------------------------------------|--------------------------------------------|-----------------------|------------|
| `spark.sql.catalog.<catalog_name>`           | `com.clickhouse.spark.ClickHouseCatalog`   | N/A                   | Да         |
| `spark.sql.catalog.<catalog_name>.host`      | `<clickhouse_host>`                        | `localhost`           | Нет        |
| `spark.sql.catalog.<catalog_name>.protocol`  | `http`                                     | `http`                | Нет        |
| `spark.sql.catalog.<catalog_name>.http_port` | `<clickhouse_port>`                        | `8123`                | Нет        |
| `spark.sql.catalog.<catalog_name>.user`      | `<clickhouse_username>`                    | `default`             | Нет        |
| `spark.sql.catalog.<catalog_name>.password`  | `<clickhouse_password>`                    | (пустая строка)       | Нет        |
| `spark.sql.catalog.<catalog_name>.database`  | `<database>`                               | `default`             | Нет        |
| `spark.<catalog_name>.write.format`          | `json`                                     | `arrow`               | Нет        |

Эти настройки могут быть установлены через один из следующих методов:

* Редактировать или создать `spark-defaults.conf`.
* Передать конфигурацию в вашу команду `spark-submit` (или в ваши команды `spark-shell`/`spark-sql` CLI).
* Добавить конфигурацию при инициализации вашего контекста.

:::important
При работе с кластером ClickHouse необходимо установить уникальное имя каталога для каждого экземпляра.
Например:

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

Таким образом, вы сможете получить доступ к таблице clickhouse1 `<ck_db>.<ck_table>` из Spark SQL по
`clickhouse1.<ck_db>.<ck_table>`, а к таблице clickhouse2 `<ck_db>.<ck_table>` по `clickhouse2.<ck_db>.<ck_table>`.

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

```java
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


# Вы можете использовать любые другие комбинации пакетов, удовлетворяющие предоставленной матрице совместимости.
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
    -- resultTalbe это промежуточный df Spark, который мы хотим вставить в clickhouse.default.example_table
   INSERT INTO TABLE clickhouse.default.example_table
                SELECT * FROM resultTable;
                
```

</TabItem>
</Tabs>
## Операции DDL {#ddl-operations}

Вы можете выполнять операции DDL на вашем экземпляре ClickHouse с помощью Spark SQL, все изменения будут немедленно сохранены в
ClickHouse.
Spark SQL позволяет вам писать запросы точно так, как вы делали бы это в ClickHouse,
поэтому вы можете напрямую выполнять команды, такие как CREATE TABLE, TRUNCATE и другие - без модификаций, например:

```sql

use clickhouse; 

CREATE TABLE test_db.tbl_sql (
  create_time TIMESTAMP NOT NULL,
  m           INT       NOT NULL COMMENT 'ключ партиции',
  id          BIGINT    NOT NULL COMMENT 'ключ сортировки',
  value       STRING
) USING ClickHouse
PARTITIONED BY (m)
TBLPROPERTIES (
  engine = 'MergeTree()',
  order_by = 'id',
  settings.index_granularity = 8192
);
```

Приведенные выше примеры демонстрируют запросы Spark SQL, которые вы можете запускать в вашем приложении,
используя любой API — Java, Scala, PySpark или оболочку.

## Конфигурации {#configurations}

Следующие настройки доступны в коннекторе:

<br/>

| Ключ                                                   | Значение по умолчанию                                 | Описание                                                                                                                                                                                                                                                                                                                                                                                                       | С версии |
|--------------------------------------------------------|------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| spark.clickhouse.ignoreUnsupportedTransform            | false                                                | ClickHouse поддерживает использование сложных выражений в качестве ключей шардирования или значений партиции, например `cityHash64(col_1, col_2)`, которые в настоящее время не поддерживаются Spark. Если `true`, игнорировать неподдерживаемые выражения, иначе быстро завершить с исключением. Обратите внимание, что при включенном `spark.clickhouse.write.distributed.convertLocal` игнорирование неподдерживаемых ключей шардирования может повредить данные.                            | 0.4.0  |
| spark.clickhouse.read.compression.codec                | lz4                                                  | Кодек, используемый для декомпрессии данных при чтении. Поддерживаемые кодеки: none, lz4.                                                                                                                                                                                                                                                                                                                   | 0.5.0  |
| spark.clickhouse.read.distributed.convertLocal         | true                                                 | При чтении распределенной таблицы, читайте локальную таблицу вместо нее самой. Если `true`, игнорируйте `spark.clickhouse.read.distributed.useClusterNodes`.                                                                                                                                                                                                                                          | 0.1.0  |
| spark.clickhouse.read.fixedStringAs                    | binary                                               | Читайте тип FixedString ClickHouse как указанный тип данных Spark. Поддерживаемые типы: binary, string                                                                                                                                                                                                                                                                                                   | 0.8.0  |
| spark.clickhouse.read.format                           | json                                                | Формат сериализации для чтения. Поддерживаемые форматы: json, binary                                                                                                                                                                                                                                                                                                                                   | 0.6.0  |
| spark.clickhouse.read.runtimeFilter.enabled            | false                                                | Включить фильтр времени выполнения для чтения.                                                                                                                                                                                                                                                                                                                                                             | 0.8.0  |
| spark.clickhouse.read.splitByPartitionId               | true                                                 | Если `true`, создайте фильтр входной партиции по виртуальной колонке `_partition_id`, вместо значения партиции. Известны проблемы с составлением SQL-предикатов по значению партиции. Эта функция требует ClickHouse Server v21.6+                                                                                                                                                                    | 0.4.0  |
| spark.clickhouse.useNullableQuerySchema                | false                                                | Если `true`, отметьте все поля схемы запроса как nullable при выполнении `CREATE/REPLACE TABLE ... AS SELECT ...` при создании таблицы. Обратите внимание, что эта конфигурация требует SPARK-43390 (доступно в Spark 3.5), без этого патча, она всегда будет действовать как `true`.                                                                                       | 0.8.0  |
| spark.clickhouse.write.batchSize                       | 10000                                                | Количество записей на пакет при записи в ClickHouse.                                                                                                                                                                                                                                                                                                                                                       | 0.1.0  |
| spark.clickhouse.write.compression.codec               | lz4                                                  | Кодек, используемый для сжатия данных при записи. Поддерживаемые кодеки: none, lz4.                                                                                                                                                                                                                                                                                                                       | 0.3.0  |
| spark.clickhouse.write.distributed.convertLocal        | false                                                | При записи в распределенную таблицу, записывайте локальную таблицу вместо нее самой. Если `true`, игнорируйте `spark.clickhouse.write.distributed.useClusterNodes`.                                                                                                                                                                                                                                    | 0.1.0  |
| spark.clickhouse.write.distributed.useClusterNodes     | true                                                 | Записывать на все узлы кластера при записи в распределенную таблицу.                                                                                                                                                                                                                                                                                                                                     | 0.1.0  |
| spark.clickhouse.write.format                          | arrow                                                | Формат сериализации для записи. Поддерживаемые форматы: json, arrow                                                                                                                                                                                                                                                                                                                                        | 0.4.0  |
| spark.clickhouse.write.localSortByKey                  | true                                                 | Если `true`, выполните локальную сортировку по ключам сортировки перед записью.                                                                                                                                                                                                                                                                                                                           | 0.3.0  |
| spark.clickhouse.write.localSortByPartition            | значение spark.clickhouse.write.repartitionByPartition | Если `true`, выполните локальную сортировку по партиции перед записью. Если не задано, это равно `spark.clickhouse.write.repartitionByPartition`.                                                                                                                                                                                                                                                          | 0.3.0  |
| spark.clickhouse.write.maxRetry                        | 3                                                    | Максимальное количество повторных попыток записи для одной пакетной записи, завершившейся с ошибками.                                                                                                                                                                                                                                                                                                      | 0.1.0  |
| spark.clickhouse.write.repartitionByPartition          | true                                                 | Нужно ли перераспределять данные по ключам партиции ClickHouse для соблюдения распределений таблицы ClickHouse перед записью.                                                                                                                                                                                                                                                                               | 0.3.0  |
| spark.clickhouse.write.repartitionNum                  | 0                                                    | Перераспределение данных для соответствия распределениям таблицы ClickHouse требуется перед записью. Используйте эту конфигурацию для указания количества перераспределения, значение меньше 1 означает отсутствие требования.                                                                                                                                                                            | 0.1.0  |
| spark.clickhouse.write.repartitionStrictly             | false                                                | Если `true`, Spark будет строго распределять входящие записи по партициям для соблюдения требуемого распределения перед передачей записей в таблицу источника данных при записи. В противном случае Spark может применить определенные оптимизации для ускорения запроса, но нарушить требования распределения. Обратите внимание, что эта конфигурация требует SPARK-37523(доступно в Spark 3.4), без этого патча она всегда будет действовать как `true`. | 0.3.0  |
| spark.clickhouse.write.retryInterval                   | 10s                                                  | Интервал в секундах между повторной попыткой записи.                                                                                                                                                                                                                                                                                                                                                        | 0.1.0  |
| spark.clickhouse.write.retryableErrorCodes             | 241                                                  | Код ошибки, которые можно повторно попытаться, возвращаемые сервером ClickHouse при неудаче записи.                                                                                                                                                                                                                                                                                                       | 0.1.0  |
## Поддерживаемые типы данных {#supported-data-types}

Этот раздел описывает соответствие типов данных между Spark и ClickHouse. Таблицы ниже предоставляют быстрые ссылки для преобразования типов данных при чтении из ClickHouse в Spark и при вставке данных из Spark в ClickHouse.
### Чтение данных из ClickHouse в Spark {#reading-data-from-clickhouse-into-spark}

| Тип данных ClickHouse                                         | Тип данных Spark             | Поддерживается | Является примитивным | Заметки                                    |
|--------------------------------------------------------------|-------------------------------|----------------|---------------------|--------------------------------------------|
| `Nothing`                                                    | `NullType`                    | ✅              | Да                  |                                            |
| `Bool`                                                       | `BooleanType`                 | ✅              | Да                  |                                            |
| `UInt8`, `Int16`                                           | `ShortType`                   | ✅              | Да                  |                                            |
| `Int8`                                                       | `ByteType`                    | ✅              | Да                  |                                            |
| `UInt16`, `Int32`                                          | `IntegerType`                 | ✅              | Да                  |                                            |
| `UInt32`, `Int64`, `UInt64`                                | `LongType`                    | ✅              | Да                  |                                            |
| `Int128`, `UInt128`, `Int256`, `UInt256`                   | `DecimalType(38, 0)`          | ✅              | Да                  |                                            |
| `Float32`                                                   | `FloatType`                   | ✅              | Да                  |                                            |
| `Float64`                                                   | `DoubleType`                  | ✅              | Да                  |                                            |
| `String`, `JSON`, `UUID`, `Enum8`, `Enum16`, `IPv4`, `IPv6` | `StringType`                  | ✅              | Да                  |                                            |
| `FixedString`                                               | `BinaryType`, `StringType`    | ✅              | Да                  | Контролируется конфигурацией `READ_FIXED_STRING_AS` |
| `Decimal`                                                   | `DecimalType`                 | ✅              | Да                  | Точность и масштаб до `Decimal128`         |
| `Decimal32`                                                 | `DecimalType(9, scale)`       | ✅              | Да                  |                                            |
| `Decimal64`                                                 | `DecimalType(18, scale)`      | ✅              | Да                  |                                            |
| `Decimal128`                                                | `DecimalType(38, scale)`      | ✅              | Да                  |                                            |
| `Date`, `Date32`                                           | `DateType`                    | ✅              | Да                  |                                            |
| `DateTime`, `DateTime32`, `DateTime64`                      | `TimestampType`               | ✅              | Да                  |                                            |
| `Array`                                                     | `ArrayType`                   | ✅              | Нет                 | Тип элемента массива также преобразуется    |
| `Map`                                                       | `MapType`                     | ✅              | Нет                 | Ключи ограничены типом `StringType`         |
| `IntervalYear`                                              | `YearMonthIntervalType(Year)` | ✅              | Да                  |                                            |
| `IntervalMonth`                                             | `YearMonthIntervalType(Month)`| ✅              | Да                  |                                            |
| `IntervalDay`, `IntervalHour`, `IntervalMinute`, `IntervalSecond` | `DayTimeIntervalType`         | ✅              | Нет                 | Используется конкретный тип интервала       |
| `Object`                                                    |                               | ❌              |                     |                                            |
| `Nested`                                                    |                               | ❌              |                     |                                            |
| `Tuple`                                                     |                               | ❌              |                     |                                            |
| `Point`                                                     |                               | ❌              |                     |                                            |
| `Polygon`                                                   |                               | ❌              |                     |                                            |
| `MultiPolygon`                                              |                               | ❌              |                     |                                            |
| `Ring`                                                      |                               | ❌              |                     |                                            |
| `IntervalQuarter`                                           |                               | ❌              |                     |                                            |
| `IntervalWeek`                                              |                               | ❌              |                     |                                            |
| `Decimal256`                                                |                               | ❌              |                     |                                            |
| `AggregateFunction`                                         |                               | ❌              |                     |                                            |
| `SimpleAggregateFunction`                                   |                               | ❌              |                     |                                            |
### Вставка данных из Spark в ClickHouse {#inserting-data-from-spark-into-clickhouse}

| Тип данных Spark                     | Тип данных ClickHouse  | Поддерживается | Является примитивным | Заметки                                |
|--------------------------------------|-----------------------|----------------|---------------------|----------------------------------------|
| `BooleanType`                        | `UInt8`               | ✅              | Да                  |                                        |
| `ByteType`                           | `Int8`                | ✅              | Да                  |                                        |
| `ShortType`                          | `Int16`               | ✅              | Да                  |                                        |
| `IntegerType`                        | `Int32`               | ✅              | Да                  |                                        |
| `LongType`                           | `Int64`               | ✅              | Да                  |                                        |
| `FloatType`                          | `Float32`             | ✅              | Да                  |                                        |
| `DoubleType`                         | `Float64`             | ✅              | Да                  |                                        |
| `StringType`                         | `String`              | ✅              | Да                  |                                        |
| `VarcharType`                        | `String`              | ✅              | Да                  |                                        |
| `CharType`                           | `String`              | ✅              | Да                  |                                        |
| `DecimalType`                        | `Decimal(p, s)`       | ✅              | Да                  | Точность и масштаб до `Decimal128`     |
| `DateType`                           | `Date`                | ✅              | Да                  |                                        |
| `TimestampType`                      | `DateTime`            | ✅              | Да                  |                                        |
| `ArrayType` (список, кортеж или массив) | `Array`               | ✅              | Нет                 | Тип элемента массива также преобразуется |
| `MapType`                            | `Map`                 | ✅              | Нет                 | Ключи ограничены типом `StringType`     |
| `Object`                             |                       | ❌              |                     |                                        |
| `Nested`                             |                       | ❌              |                     |                                        |
## Участие и поддержка {#contributing-and-support}

Если вы хотите внести свой вклад в проект или сообщить о любых проблемах, мы приветствуем ваши идеи!
Посетите наш [репозиторий GitHub](https://github.com/ClickHouse/spark-clickhouse-connector), чтобы открыть проблему, предложить
улучшения или отправить пул-запрос.
Ваши вклады приветствуются! Пожалуйста, ознакомьтесь с рекомендациями по внесению изменений в репозитории перед началом.
Спасибо за помощь в улучшении нашего ClickHouse Spark коннектора!
```
