---
sidebar_label: 'Нативный коннектор Spark'
sidebar_position: 2
slug: /integrations/apache-spark/spark-native-connector
description: 'Введение в Apache Spark с ClickHouse'
keywords: ['clickhouse', 'Apache Spark', 'миграция', 'данные']
title: 'Коннектор Spark'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';


# Коннектор Spark

Этот коннектор использует оптимизации, специфичные для ClickHouse, такие как продвинутое секционирование и проталкивание предикатов (predicate pushdown), чтобы
повысить производительность запросов и эффективность обработки данных.
Коннектор основан на [официальном JDBC-коннекторе ClickHouse](https://github.com/ClickHouse/clickhouse-java) и
управляет собственным каталогом.

До Spark 3.0 в Spark отсутствовало встроенное понятие каталога, поэтому пользователи обычно полагались на внешние системы каталогов, такие как
Hive Metastore или AWS Glue.
С этими внешними решениями пользователям приходилось вручную регистрировать таблицы источника данных перед доступом к ним в Spark.
Однако, поскольку в Spark 3.0 была введена концепция каталога, Spark теперь может автоматически обнаруживать таблицы посредством регистрации
плагинов каталогов.

Каталог по умолчанию в Spark — `spark_catalog`, а таблицы идентифицируются как `{catalog name}.{database}.{table}`. С новой
функциональностью каталогов теперь можно добавлять и использовать несколько каталогов в рамках одного приложения Spark.

<TOCInline toc={toc}></TOCInline>



## Требования {#requirements}

- Java 8 или 17
- Scala 2.12 или 2.13
- Apache Spark 3.3, 3.4 или 3.5



## Матрица совместимости {#compatibility-matrix}

| Версия | Совместимые версии Spark | Версия ClickHouse JDBC         |
|--------|---------------------------|--------------------------------|
| main   | Spark 3.3, 3.4, 3.5       | 0.6.3                          |
| 0.8.1  | Spark 3.3, 3.4, 3.5       | 0.6.3                          |
| 0.8.0  | Spark 3.3, 3.4, 3.5       | 0.6.3                          |
| 0.7.3  | Spark 3.3, 3.4            | 0.4.6                          |
| 0.6.0  | Spark 3.3                 | 0.3.2-patch11                  |
| 0.5.0  | Spark 3.2, 3.3            | 0.3.2-patch11                  |
| 0.4.0  | Spark 3.2, 3.3            | Не зависит от версии JDBC-драйвера |
| 0.3.0  | Spark 3.2, 3.3            | Не зависит от версии JDBC-драйвера |
| 0.2.1  | Spark 3.2                 | Не зависит от версии JDBC-драйвера |
| 0.1.2  | Spark 3.2                 | Не зависит от версии JDBC-драйвера |



## Установка и настройка

Для интеграции ClickHouse со Spark доступно несколько вариантов установки для различных конфигураций проектов.
Вы можете добавить коннектор ClickHouse Spark как зависимость непосредственно в файл сборки вашего проекта (например, в `pom.xml`
для Maven или `build.sbt` для SBT).
Также вы можете поместить необходимые JAR-файлы в каталог `$SPARK_HOME/jars/` или передать их напрямую как параметр Spark
с помощью флага `--jars` в команде `spark-submit`.
Оба подхода обеспечивают доступность коннектора ClickHouse в вашей среде Spark.

### Импорт как зависимости

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

    Добавьте следующий репозиторий, если вы хотите использовать SNAPSHOT-версию.

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

    Добавьте следующий репозиторий, если вы хотите использовать SNAPSHOT-версию:

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
    При работе с параметрами оболочки Spark (Spark SQL CLI, Spark Shell CLI и команда Spark Submit) зависимости могут быть
    зарегистрированы путём передачи необходимых JAR-файлов:

    ```text
    $SPARK_HOME/bin/spark-sql \
      --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
    ```

    Если вы хотите избежать копирования JAR-файлов на клиентский узел Spark, вы можете использовать следующий вариант:

    ```text
      --repositories https://{maven-central-mirror or private-nexus-repo} \
      --packages com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }},com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}
    ```

    Примечание: для сценариев, использующих только SQL, для production-среды рекомендуется [Apache Kyuubi](https://github.com/apache/kyuubi).
  </TabItem>
</Tabs>

### Загрузка библиотеки

Шаблон имени бинарного JAR-файла:

```bash
clickhouse-spark-runtime-${spark_binary_version}_${scala_binary_version}-${version}.jar
```

Все доступные релизные JAR-файлы можно найти
в [Maven Central Repository](https://repo1.maven.org/maven2/com/clickhouse/spark/),
а все JAR-файлы ежедневных сборок SNAPSHOT — в [Sonatype OSS Snapshots Repository](https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/).


:::important
Крайне важно включить [clickhouse-jdbc JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)
с классификатором «all»,
так как коннектор полагается на [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)
и [clickhouse-client](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client), оба из которых входят
в состав clickhouse-jdbc:all.
В качестве альтернативы вы можете добавить [clickhouse-client JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)
и [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client) по отдельности, если
предпочитаете не использовать полный пакет JDBC.

В любом случае убедитесь, что версии пакетов совместимы в соответствии с
[матрицей совместимости](#compatibility-matrix).
:::



## Зарегистрируйте каталог (обязательно)

Чтобы получить доступ к таблицам ClickHouse, необходимо настроить новый каталог Spark со следующими параметрами:

| Property                                     | Value                                    | Default Value  | Required |
| -------------------------------------------- | ---------------------------------------- | -------------- | -------- |
| `spark.sql.catalog.<catalog_name>`           | `com.clickhouse.spark.ClickHouseCatalog` | N/A            | Yes      |
| `spark.sql.catalog.<catalog_name>.host`      | `<clickhouse_host>`                      | `localhost`    | No       |
| `spark.sql.catalog.<catalog_name>.protocol`  | `http`                                   | `http`         | No       |
| `spark.sql.catalog.<catalog_name>.http_port` | `<clickhouse_port>`                      | `8123`         | No       |
| `spark.sql.catalog.<catalog_name>.user`      | `<clickhouse_username>`                  | `default`      | No       |
| `spark.sql.catalog.<catalog_name>.password`  | `<clickhouse_password>`                  | (empty string) | No       |
| `spark.sql.catalog.<catalog_name>.database`  | `<database>`                             | `default`      | No       |
| `spark.<catalog_name>.write.format`          | `json`                                   | `arrow`        | No       |

Эти параметры можно задать одним из следующих способов:

* Отредактируйте/создайте `spark-defaults.conf`.
* Передайте конфигурацию в команду `spark-submit` (или в команды CLI `spark-shell`/`spark-sql`).
* Добавьте конфигурацию при инициализации контекста.

:::important
При работе с кластером ClickHouse необходимо задать уникальное имя каталога для каждого экземпляра.
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

Таким образом, вы сможете обращаться к таблице `<ck_db>.<ck_table>` в clickhouse1 из Spark SQL под именем `clickhouse1.<ck_db>.<ck_table>`, а к таблице `<ck_db>.<ck_table>` в clickhouse2 — под именем `clickhouse2.<ck_db>.<ck_table>`.

:::


## Настройки ClickHouse Cloud

При подключении к [ClickHouse Cloud](https://clickhouse.com) убедитесь, что включён SSL и задан соответствующий режим SSL. Например:

```text
spark.sql.catalog.clickhouse.option.ssl        true
spark.sql.catalog.clickhouse.option.ssl_mode   NONE
```


## Чтение данных {#read-data}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
public static void main(String[] args) {
        // Создание сеанса Spark
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

        // Создать сессию Spark
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

        // Определить схему для DataFrame
        StructType schema = new StructType(new StructField[]{
                DataTypes.createStructField("id", DataTypes.IntegerType, false),
                DataTypes.createStructField("name", DataTypes.StringType, false),
        });

        List<Row> data = Arrays.asList(
                RowFactory.create(1, "Alice"),
                RowFactory.create(2, "Bob")
        );

        // Создать DataFrame
        Dataset<Row> df = spark.createDataFrame(data, schema);

        df.writeTo("clickhouse.default.example_table").append();

        spark.stop();
    }
```

</TabItem>
<TabItem value="Scala" label="Scala">

```java
object NativeSparkWrite extends App {
  // Создать сессию Spark
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

  // Определить схему для DataFrame
  val rows = Seq(Row(1, "John"), Row(2, "Doe"))

  val schema = List(
    StructField("id", DataTypes.IntegerType, nullable = false),
    StructField("name", StringType, nullable = true)
  )
  // Создать DataFrame
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


# При необходимости вы можете использовать любую другую комбинацию пакетов при условии, что она удовлетворяет матрице совместимости, приведённой выше.
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

````

</TabItem>
<TabItem value="SparkSQL" label="Spark SQL">

```sql
    -- resultTable — промежуточный DataFrame Spark, который необходимо вставить в clickhouse.default.example_table
   INSERT INTO TABLE clickhouse.default.example_table
                SELECT * FROM resultTable;

````

</TabItem>
</Tabs>


## Операции DDL

Вы можете выполнять операции DDL с экземпляром ClickHouse с помощью Spark SQL, при этом все изменения сразу
сохраняются в ClickHouse.
Spark SQL позволяет писать запросы так же, как в ClickHouse,
поэтому вы можете напрямую выполнять команды, такие как CREATE TABLE, TRUNCATE и другие, без каких-либо изменений, например:

:::note
При использовании Spark SQL за один раз может быть выполнена только одна инструкция.
:::

```sql
USE clickhouse; 
```

```sql

CREATE TABLE test_db.tbl_sql (
  create_time TIMESTAMP NOT NULL,
  m           INT       NOT NULL COMMENT 'ключ раздела',
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

Приведённые выше примеры показывают запросы Spark SQL, которые вы можете выполнять в приложении, используя любой из API-интерфейсов — Java, Scala, PySpark или shell.


## Конфигурации {#configurations}

Ниже перечислены параметры, которые можно настроить в коннекторе:

<br/>



| Ключ                                               | По умолчанию                                                     | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Начиная с |
| -------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| spark.clickhouse.ignoreUnsupportedTransform        | false                                                            | ClickHouse поддерживает использование сложных выражений в качестве ключей шардирования или значений партиционирования, например `cityHash64(col_1, col_2)`, которые в настоящее время не поддерживаются Spark. Если `true`, неподдерживаемые выражения игнорируются, в противном случае выполнение немедленно завершается с исключением. Обратите внимание, что при включённой настройке `spark.clickhouse.write.distributed.convertLocal` игнорирование неподдерживаемых ключей шардирования может привести к повреждению данных. | 0.4.0     |
| spark.clickhouse.read.compression.codec            | lz4                                                              | Кодек, используемый для распаковки данных при чтении. Поддерживаемые кодеки: none, lz4.                                                                                                                                                                                                                                                                                                                                                                                                                                            | 0.5.0     |
| spark.clickhouse.read.distributed.convertLocal     | true                                                             | При чтении таблицы Distributed использовать локальную таблицу вместо самой распределённой. Если `true`, игнорировать `spark.clickhouse.read.distributed.useClusterNodes`.                                                                                                                                                                                                                                                                                                                                                          | 0.1.0     |
| spark.clickhouse.read.fixedStringAs                | двоичный                                                         | Считывать тип ClickHouse FixedString как заданный тип данных Spark. Поддерживаемые типы: binary, string                                                                                                                                                                                                                                                                                                                                                                                                                            | 0.8.0     |
| spark.clickhouse.read.format                       | json                                                             | Формат сериализации для чтения. Поддерживаемые форматы: JSON, Binary                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 0.6.0     |
| spark.clickhouse.read.runtimeFilter.enabled        | false                                                            | Включить динамический фильтр при чтении.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 0.8.0     |
| spark.clickhouse.read.splitByPartitionId           | true                                                             | Если установлено значение `true`, формировать входной фильтр партиций по виртуальному столбцу `_partition_id`, а не по значению партиции. Известны проблемы при построении SQL-предикатов по значению партиции. Для использования этой возможности требуется ClickHouse Server v21.6+.                                                                                                                                                                                                                                             | 0.4.0     |
| spark.clickhouse.useNullableQuerySchema            | false                                                            | Если `true`, помечать все поля схемы запроса как допускающие значение `NULL` при выполнении `CREATE/REPLACE TABLE ... AS SELECT ...` при создании таблицы. Обратите внимание, что эта настройка требует SPARK-43390 (доступно в Spark 3.5); без этого патча данная опция фактически всегда равна `true`.                                                                                                                                                                                                                           | 0.8.0     |
| spark.clickhouse.write.batchSize                   | 10000                                                            | Количество записей в одном пакете при записи в ClickHouse.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 0.1.0     |
| spark.clickhouse.write.compression.codec           | lz4                                                              | Кодек, используемый для сжатия данных при их записи. Поддерживаемые кодеки: none, lz4.                                                                                                                                                                                                                                                                                                                                                                                                                                             | 0.3.0     |
| spark.clickhouse.write.distributed.convertLocal    | false                                                            | При записи в таблицу Distributed данные записываются в локальную таблицу, а не в саму распределённую таблицу. Если установлено значение `true`, параметр `spark.clickhouse.write.distributed.useClusterNodes` игнорируется.                                                                                                                                                                                                                                                                                                        | 0.1.0     |
| spark.clickhouse.write.distributed.useClusterNodes | true                                                             | При записи в распределённую таблицу записывать данные на все узлы кластера.                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 0.1.0     |
| spark.clickhouse.write.format                      | стрелка                                                          | Формат сериализации при записи. Поддерживаемые форматы: JSON, Arrow                                                                                                                                                                                                                                                                                                                                                                                                                                                                | 0.4.0     |
| spark.clickhouse.write.localSortByKey              | true                                                             | Если установлено значение `true`, выполнять локальную сортировку по ключам сортировки перед записью.                                                                                                                                                                                                                                                                                                                                                                                                                               | 0.3.0     |
| spark.clickhouse.write.localSortByPartition        | значение параметра spark.clickhouse.write.repartitionByPartition | Если имеет значение `true`, выполняется локальная сортировка по разделу перед записью. Если не задано, используется значение `spark.clickhouse.write.repartitionByPartition`.                                                                                                                                                                                                                                                                                                                                                      | 0.3.0     |
| spark.clickhouse.write.maxRetry                    | 3                                                                | Максимальное количество повторных попыток записи для одной пакетной операции, завершившейся сбоем с кодами ошибок, допускающими повторную попытку.                                                                                                                                                                                                                                                                                                                                                                                 | 0.1.0     |
| spark.clickhouse.write.repartitionByPartition      | true                                                             | Определяет, нужно ли переразбивать данные по ключам партиционирования ClickHouse, чтобы они соответствовали распределению данных в таблице ClickHouse перед записью.                                                                                                                                                                                                                                                                                                                                                               | 0.3.0     |
| spark.clickhouse.write.repartitionNum              | 0                                                                | Перед записью требуется перераспределить данные в соответствии с распределением таблицы ClickHouse. Используйте этот параметр конфигурации для указания количества переразбиений; значение меньше 1 означает, что перераспределение не требуется.                                                                                                                                                                                                                                                                                  | 0.1.0     |
| spark.clickhouse.write.repartitionStrictly         | false                                                            | Если `true`, Spark будет строго распределять входящие записи по разделам, чтобы обеспечить требуемое распределение перед записью данных в таблицу источника. В противном случае Spark может применять определённые оптимизации для ускорения запроса, но при этом нарушить требуемое распределение. Обратите внимание, что для этой конфигурации необходим патч SPARK-37523 (доступен в Spark 3.4); без этого патча она всегда ведёт себя как `true`.                                                                              | 0.3.0     |
| spark.clickhouse.write.retryInterval               | 10s                                                              | Интервал в секундах между повторными попытками записи.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 0.1.0     |
| spark.clickhouse.write.retryableErrorCodes         | 241                                                              | Коды ошибок, допускающих повторную попытку, возвращаемые сервером ClickHouse при сбое записи.                                                                                                                                                                                                                                                                                                                                                                                                                                      | 0.1.0     |





## Поддерживаемые типы данных {#supported-data-types}

В этом разделе описано сопоставление типов данных между Spark и ClickHouse. Таблицы ниже служат быстрой справкой
по преобразованию типов данных при чтении из ClickHouse в Spark и при вставке данных из Spark в ClickHouse.

### Чтение данных из ClickHouse в Spark {#reading-data-from-clickhouse-into-spark}

| Тип данных ClickHouse                                             | Тип данных Spark               | Поддерживается | Примитивный | Примечания                                          |
|-------------------------------------------------------------------|--------------------------------|----------------|-------------|-----------------------------------------------------|
| `Nothing`                                                         | `NullType`                     | ✅              | Да          |                                                     |
| `Bool`                                                            | `BooleanType`                  | ✅              | Да          |                                                     |
| `UInt8`, `Int16`                                                  | `ShortType`                    | ✅              | Да          |                                                     |
| `Int8`                                                            | `ByteType`                     | ✅              | Да          |                                                     |
| `UInt16`,`Int32`                                                  | `IntegerType`                  | ✅              | Да          |                                                     |
| `UInt32`,`Int64`, `UInt64`                                        | `LongType`                     | ✅              | Да          |                                                     |
| `Int128`,`UInt128`, `Int256`, `UInt256`                           | `DecimalType(38, 0)`           | ✅              | Да          |                                                     |
| `Float32`                                                         | `FloatType`                    | ✅              | Да          |                                                     |
| `Float64`                                                         | `DoubleType`                   | ✅              | Да          |                                                     |
| `String`, `JSON`, `UUID`, `Enum8`, `Enum16`, `IPv4`, `IPv6`       | `StringType`                   | ✅              | Да          |                                                     |
| `FixedString`                                                     | `BinaryType`, `StringType`     | ✅              | Да          | Управляется конфигурацией `READ_FIXED_STRING_AS`   |
| `Decimal`                                                         | `DecimalType`                  | ✅              | Да          | Точность и масштаб вплоть до `Decimal128`          |
| `Decimal32`                                                       | `DecimalType(9, scale)`        | ✅              | Да          |                                                     |
| `Decimal64`                                                       | `DecimalType(18, scale)`       | ✅              | Да          |                                                     |
| `Decimal128`                                                      | `DecimalType(38, scale)`       | ✅              | Да          |                                                     |
| `Date`, `Date32`                                                  | `DateType`                     | ✅              | Да          |                                                     |
| `DateTime`, `DateTime32`, `DateTime64`                            | `TimestampType`                | ✅              | Да          |                                                     |
| `Array`                                                           | `ArrayType`                    | ✅              | Нет         | Тип элементов массива также преобразуется          |
| `Map`                                                             | `MapType`                      | ✅              | Нет         | Ключи ограничены типом `StringType`                |
| `IntervalYear`                                                    | `YearMonthIntervalType(Year)`  | ✅              | Да          |                                                     |
| `IntervalMonth`                                                   | `YearMonthIntervalType(Month)` | ✅              | Да          |                                                     |
| `IntervalDay`, `IntervalHour`, `IntervalMinute`, `IntervalSecond` | `DayTimeIntervalType`          | ✅              | Нет         | Используется соответствующий тип интервала         |
| `Object`                                                          |                                | ❌              |             |                                                     |
| `Nested`                                                          |                                | ❌              |             |                                                     |
| `Tuple`                                                           |                                | ❌              |             |                                                     |
| `Point`                                                           |                                | ❌              |             |                                                     |
| `Polygon`                                                         |                                | ❌              |             |                                                     |
| `MultiPolygon`                                                    |                                | ❌              |             |                                                     |
| `Ring`                                                            |                                | ❌              |             |                                                     |
| `IntervalQuarter`                                                 |                                | ❌              |             |                                                     |
| `IntervalWeek`                                                    |                                | ❌              |             |                                                     |
| `Decimal256`                                                      |                                | ❌              |             |                                                     |
| `AggregateFunction`                                               |                                | ❌              |             |                                                     |
| `SimpleAggregateFunction`                                         |                                | ❌              |             |                                                     |

### Вставка данных из Spark в ClickHouse {#inserting-data-from-spark-into-clickhouse}



| Тип данных Spark                    | Тип данных ClickHouse | Поддерживается | Примитивный тип | Примечания                                 |
|-------------------------------------|------------------------|----------------|-----------------|--------------------------------------------|
| `BooleanType`                       | `UInt8`                | ✅              | Да              |                                            |
| `ByteType`                          | `Int8`                 | ✅              | Да              |                                            |
| `ShortType`                         | `Int16`                | ✅              | Да              |                                            |
| `IntegerType`                       | `Int32`                | ✅              | Да              |                                            |
| `LongType`                          | `Int64`                | ✅              | Да              |                                            |
| `FloatType`                         | `Float32`              | ✅              | Да              |                                            |
| `DoubleType`                        | `Float64`              | ✅              | Да              |                                            |
| `StringType`                        | `String`               | ✅              | Да              |                                            |
| `VarcharType`                       | `String`               | ✅              | Да              |                                            |
| `CharType`                          | `String`               | ✅              | Да              |                                            |
| `DecimalType`                       | `Decimal(p, s)`        | ✅              | Да              | Точность и масштаб вплоть до `Decimal128` |
| `DateType`                          | `Date`                 | ✅              | Да              |                                            |
| `TimestampType`                     | `DateTime`             | ✅              | Да              |                                            |
| `ArrayType` (list, tuple, or array) | `Array`                | ✅              | Нет             | Тип элементов массива также преобразуется  |
| `MapType`                           | `Map`                  | ✅              | Нет             | Ключи ограничены типом `StringType`       |
| `Object`                            |                        | ❌              |                 |                                            |
| `Nested`                            |                        | ❌              |                 |                                            |



## Участие и поддержка {#contributing-and-support}

Если вы хотите поучаствовать в развитии проекта или сообщить о проблеме, мы будем рады вашей помощи!
Перейдите в наш [репозиторий на GitHub](https://github.com/ClickHouse/spark-clickhouse-connector), чтобы создать issue, предложить
улучшения или отправить pull request.
Мы приветствуем любые вклады в проект! Перед началом, пожалуйста, ознакомьтесь с руководством по участию (contributing) в репозитории.
Спасибо, что помогаете улучшать наш коннектор ClickHouse Spark!
