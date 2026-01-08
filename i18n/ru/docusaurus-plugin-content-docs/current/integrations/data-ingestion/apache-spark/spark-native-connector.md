---
sidebar_label: 'Нативный коннектор Spark'
sidebar_position: 2
slug: /integrations/apache-spark/spark-native-connector
description: 'Введение в использование Apache Spark с ClickHouse'
keywords: ['clickhouse', 'Apache Spark', 'миграция', 'данные']
title: 'Коннектор Spark'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_ingestion'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import TOCInline from '@theme/TOCInline';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Коннектор Spark {#spark-connector}

<ClickHouseSupportedBadge/>

Этот коннектор использует специфические для ClickHouse оптимизации, такие как продвинутое разбиение на партиции и проталкивание предикатов (predicate pushdown), чтобы
улучшить производительность запросов и обработку данных.
Коннектор основан на [официальном JDBC-коннекторе ClickHouse](https://github.com/ClickHouse/clickhouse-java) и
управляет собственным каталогом.

До версии Spark 3.0 в Spark не было встроенной концепции каталога, поэтому пользователи обычно полагались на внешние системы каталогов, такие как
Hive Metastore или AWS Glue.
При использовании таких внешних решений пользователям приходилось вручную регистрировать таблицы источников данных, прежде чем обращаться к ним из Spark.
Однако после того, как в Spark 3.0 была введена концепция каталога, Spark теперь может автоматически обнаруживать таблицы путём регистрации
плагинов каталога.

Каталог по умолчанию в Spark — `spark_catalog`, а таблицы идентифицируются как `{catalog name}.{database}.{table}`. С появлением новой
функциональности каталогов стало возможным добавлять и использовать несколько каталогов в одном Spark-приложении.

## Выбор между Catalog API и TableProvider API {#choosing-between-apis}

Коннектор ClickHouse для Spark поддерживает два способа доступа: **Catalog API** и **TableProvider API** (доступ на основе формата). Понимание различий поможет вам выбрать подходящий подход для вашего сценария.

### Catalog API vs TableProvider API {#catalog-vs-tableprovider-comparison}

| Характеристика | Catalog API | TableProvider API |
|---------|-------------|-------------------|
| **Configuration** | Централизованная через конфигурацию Spark | Для каждой операции через параметры (options) |
| **Table Discovery** | Автоматическое через каталог | Ручное указание таблицы |
| **DDL Operations** | Полная поддержка (CREATE, DROP, ALTER) | Ограниченная (только автоматическое создание таблицы) |
| **Spark SQL Integration** | Интеграция со Spark SQL (`clickhouse.database.table`) | Требует указания формата |
| **Use Case** | Долгосрочные, стабильные подключения с централизованной конфигурацией | Разовый, динамический или временный доступ |

<TOCInline toc={toc}></TOCInline>

## Требования {#requirements}

- Java 8 или 17 (Java 17+ требуется для Spark 4.0)
- Scala 2.12 или 2.13 (Spark 4.0 поддерживает только Scala 2.13)
- Apache Spark 3.3, 3.4, 3.5 или 4.0

## Матрица совместимости {#compatibility-matrix}

| Версия | Совместимые версии Spark | Версия драйвера ClickHouse JDBC |
|--------|---------------------------|---------------------------------|
| main   | Spark 3.3, 3.4, 3.5, 4.0  | 0.9.4                           |
| 0.9.0  | Spark 3.3, 3.4, 3.5, 4.0  | 0.9.4                           |
| 0.8.1  | Spark 3.3, 3.4, 3.5       | 0.6.3                           |
| 0.7.3  | Spark 3.3, 3.4            | 0.4.6                           |
| 0.6.0  | Spark 3.3                 | 0.3.2-patch11                   |
| 0.5.0  | Spark 3.2, 3.3            | 0.3.2-patch11                   |
| 0.4.0  | Spark 3.2, 3.3            | Нет зависимости                 |
| 0.3.0  | Spark 3.2, 3.3            | Нет зависимости                 |
| 0.2.1  | Spark 3.2                 | Нет зависимости                 |
| 0.1.2  | Spark 3.2                 | Нет зависимости                 |

## Установка и настройка {#installation--setup}

Для интеграции ClickHouse со Spark доступно несколько вариантов установки, подходящих для разных конфигураций проектов.
Вы можете добавить Spark-коннектор ClickHouse как зависимость непосредственно в файл сборки проекта (например, в `pom.xml`
для Maven или `build.sbt` для SBT).
Либо вы можете поместить необходимые JAR-файлы в каталог `$SPARK_HOME/jars/` или передать их напрямую как опцию Spark
с помощью флага `--jars` в команде `spark-submit`.
Оба подхода гарантируют, что коннектор ClickHouse будет доступен в среде Spark.

### Импорт в качестве зависимости {#import-as-a-dependency}

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

Добавьте следующий репозиторий, если хотите использовать версию SNAPSHOT.

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

При работе с CLI-инструментами Spark (Spark SQL CLI, Spark Shell CLI и командой Spark Submit) зависимости можно
зарегистрировать, передав необходимые JAR-файлы:

```text
$SPARK_HOME/bin/spark-sql \
  --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
```

Если вы хотите избежать копирования JAR-файлов на клиентский узел Spark, можно использовать следующий вариант:

```text
  --repositories https://{maven-central-mirror or private-nexus-repo} \
  --packages com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }},com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}
```

Примечание: для сценариев, использующих только SQL, в продуктивной среде рекомендуется использовать [Apache Kyuubi](https://github.com/apache/kyuubi).

</TabItem>
</Tabs>


### Скачайте библиотеку {#download-the-library}

Шаблон имени двоичного JAR-файла:

```bash
clickhouse-spark-runtime-${spark_binary_version}_${scala_binary_version}-${version}.jar
```

Вы можете найти все доступные выпущенные JAR-файлы
в [Maven Central Repository](https://repo1.maven.org/maven2/com/clickhouse/spark/)
и все SNAPSHOT JAR-файлы ежедневных сборок в [Sonatype OSS Snapshots Repository](https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/).

:::important
Необходимо включить [clickhouse-jdbc JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)
с классификатором &quot;all&quot;,
так как коннектор зависит от [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)
и [clickhouse-client](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client), оба из которых входят
в clickhouse-jdbc:all.
В качестве альтернативы вы можете добавить [clickhouse-client JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)
и [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client) по отдельности, если
вы предпочитаете не использовать полный пакет JDBC.

В любом случае убедитесь, что версии пакетов совместимы в соответствии с
[матрицей совместимости](#compatibility-matrix).
:::


## Регистрация каталога (обязательно) {#register-the-catalog-required}

Чтобы получить доступ к таблицам ClickHouse, необходимо настроить новый каталог Spark со следующими параметрами конфигурации:

| Property                                     | Value                                    | Default Value       | Required |
|----------------------------------------------|------------------------------------------|---------------------|----------|
| `spark.sql.catalog.<catalog_name>`           | `com.clickhouse.spark.ClickHouseCatalog` | N/A                 | Yes      |
| `spark.sql.catalog.<catalog_name>.host`      | `<clickhouse_host>`                      | `localhost`         | No       |
| `spark.sql.catalog.<catalog_name>.protocol`  | `http`                                   | `http`              | No       |
| `spark.sql.catalog.<catalog_name>.http_port` | `<clickhouse_port>`                      | `8123`              | No       |
| `spark.sql.catalog.<catalog_name>.user`      | `<clickhouse_username>`                  | `default`           | No       |
| `spark.sql.catalog.<catalog_name>.password`  | `<clickhouse_password>`                  | (пустая строка)     | No       |
| `spark.sql.catalog.<catalog_name>.database`  | `<database>`                             | `default`           | No       |
| `spark.<catalog_name>.write.format`          | `json`                                   | `arrow`             | No       |

Эти настройки можно задать одним из следующих способов:

* Отредактировать или создать `spark-defaults.conf`.
* Передать конфигурацию в команду `spark-submit` (или в CLI-команды `spark-shell`/`spark-sql`).
* Добавить конфигурацию при инициализации контекста.

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

Таким образом, вы сможете получить доступ к таблице `<ck_db>.<ck_table>` в clickhouse1 из Spark SQL как
`clickhouse1.<ck_db>.<ck_table>`, а к таблице `<ck_db>.<ck_table>` в clickhouse2 — как `clickhouse2.<ck_db>.<ck_table>`.

:::

## Использование TableProvider API (доступ на основе формата) {#using-the-tableprovider-api}

Помимо подхода, основанного на каталоге, коннектор ClickHouse для Spark поддерживает **модель доступа на основе формата** через TableProvider API.

### Пример чтения с использованием формата {#format-based-read}

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


### Пример записи с использованием формата {#format-based-write}

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


### Возможности TableProvider {#tableprovider-features}

API TableProvider предоставляет ряд мощных возможностей:

#### Автоматическое создание таблиц {#automatic-table-creation}

При записи в несуществующую таблицу коннектор автоматически создаёт таблицу с соответствующей схемой. Коннектор использует разумные значения по умолчанию:

* **Движок**: по умолчанию используется `MergeTree()`, если не указано иное. Вы можете указать другой движок с помощью параметра `engine` (например, `ReplacingMergeTree()`, `SummingMergeTree()` и т. д.)
* **ORDER BY**: **обязательно** — вы должны явно указать параметр `order_by` при создании новой таблицы. Коннектор проверяет, что все указанные столбцы существуют в схеме.
* **Поддержка Nullable-ключей**: автоматически добавляет `settings.allow_nullable_key=1`, если ORDER BY содержит столбцы типа Nullable

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
**ORDER BY обязателен**: Параметр `order_by` **обязателен** при создании новой таблицы через TableProvider API. Необходимо явно указать, какие столбцы использовать в операторе ORDER BY. Коннектор проверяет, что все указанные столбцы существуют в схеме, и выбрасывает ошибку, если каких‑либо столбцов не хватает.

**Выбор движка**: Движок по умолчанию — `MergeTree()`, но вы можете указать любой движок таблиц ClickHouse с помощью параметра `engine` (например, `ReplacingMergeTree()`, `SummingMergeTree()`, `AggregatingMergeTree()` и т. д.).
:::


### Параметры подключения TableProvider {#tableprovider-connection-options}

При использовании API на основе форматов доступны следующие параметры подключения:

#### Параметры подключения {#connection-options}

| Параметр    | Описание                                         | Значение по умолчанию | Обязателен |
|-------------|--------------------------------------------------|------------------------|------------|
| `host`       | Имя хоста сервера ClickHouse                     | `localhost`            | Да         |
| `protocol`   | Протокол подключения (`http` или `https`)        | `http`                 | Нет        |
| `http_port`  | Порт HTTP/HTTPS                                  | `8123`                 | Нет        |
| `database`   | Имя базы данных                                  | `default`              | Да         |
| `table`      | Имя таблицы                                      | N/A                    | Да         |
| `user`       | Имя пользователя для аутентификации              | `default`              | Нет        |
| `password`   | Пароль для аутентификации                        | (пустая строка)        | Нет        |
| `ssl`        | Включить SSL-подключение                         | `false`                | Нет        |
| `ssl_mode`   | Режим SSL (`NONE`, `STRICT` и т.д.)              | `STRICT`               | Нет        |
| `timezone`   | Часовой пояс для операций с датой/временем       | `server`               | Нет        |

#### Параметры создания таблицы {#table-creation-options}

Эти параметры используются, когда таблица не существует и её нужно создать:

| Параметр                    | Описание                                                                    | Значение по умолчанию | Обязательный |
|-----------------------------|-----------------------------------------------------------------------------|------------------------|--------------|
| `order_by`                  | Столбец(ы), используемые для оператора ORDER BY. Для нескольких столбцов перечислите их через запятую | N/A                    | **Да**       |
| `engine`                    | Движок таблицы ClickHouse (например, `MergeTree()`, `ReplacingMergeTree()`, `SummingMergeTree()`, и т.д.) | `MergeTree()`          | Нет          |
| `settings.allow_nullable_key` | Включить ключи с Nullable-значениями в ORDER BY (для ClickHouse Cloud)  | Определяется автоматически\*\* | Нет          |
| `settings.<key>`            | Любой параметр таблицы ClickHouse                                          | N/A                    | Нет          |
| `cluster`                   | Имя кластера для distributed таблиц                                        | N/A                    | Нет          |
| `clickhouse.column.<name>.variant_types` | Список типов ClickHouse для столбцов типа Variant, разделённых запятыми (например, `String, Int64, Bool, JSON`). Имена типов чувствительны к регистру. Пробелы после запятых необязательны. | N/A | Нет |

\* Параметр `order_by` обязателен при создании новой таблицы. Все указанные столбцы должны существовать в схеме.  
\** Автоматически устанавливается в `1`, если ORDER BY содержит столбцы с типом Nullable и параметр не задан явно.

:::tip
**Рекомендация**: Для ClickHouse Cloud явно задавайте `settings.allow_nullable_key=1`, если столбцы в ORDER BY могут быть Nullable, так как ClickHouse Cloud требует этого параметра.
:::

#### Режимы записи {#writing-modes}

Коннектор Spark (как через TableProvider API, так и через Catalog API) поддерживает следующие режимы записи Spark:

* **`append`**: Добавляет данные в существующую таблицу
* **`overwrite`**: Заменяет все данные в таблице (очищает таблицу)

:::important
**Перезапись партиций не поддерживается**: Коннектор в настоящее время не поддерживает операции перезаписи на уровне партиций (например, режим `overwrite` с `partitionBy`). Эта функциональность находится в разработке. Для отслеживания статуса см. [GitHub issue #34](https://github.com/ClickHouse/spark-clickhouse-connector/issues/34).
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


## Настройка параметров ClickHouse {#configuring-clickhouse-options}

И Catalog API, и TableProvider API поддерживают настройку параметров, специфичных для ClickHouse (не параметров коннектора). Эти параметры передаются в ClickHouse при создании таблиц или выполнении запросов.

Параметры ClickHouse позволяют задавать настройки, специфичные для ClickHouse, такие как `allow_nullable_key`, `index_granularity` и другие настройки на уровне таблицы или запроса. Они отличаются от параметров коннектора (таких как `host`, `database`, `table`), которые определяют, как коннектор подключается к ClickHouse.

### Использование TableProvider API {#using-tableprovider-api-options}

При работе с API TableProvider используйте формат параметра `settings.&lt;key&gt;`:

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


### Использование Catalog API {#using-catalog-api-options}

При работе с Catalog API используйте формат `spark.sql.catalog.<catalog_name>.option.<key>` в конфигурации Spark:

```text
spark.sql.catalog.clickhouse.option.allow_nullable_key 1
spark.sql.catalog.clickhouse.option.index_granularity 8192
```

Или задайте их при создании таблиц с помощью Spark SQL:

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


## Параметры ClickHouse Cloud {#clickhouse-cloud-settings}

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


## Запись данных {#write-data}

:::important
**Перезапись партиций не поддерживается**: Catalog API в настоящее время не поддерживает операции перезаписи на уровне партиций (например, режим `overwrite` с `partitionBy`). Эта функция находится в разработке. Для отслеживания статуса см. [GitHub issue #34](https://github.com/ClickHouse/spark-clickhouse-connector/issues/34).
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

## Операции DDL {#ddl-operations}

Вы можете выполнять операции DDL в своем экземпляре ClickHouse с помощью Spark SQL, при этом все изменения немедленно
фиксируются в ClickHouse.
Spark SQL позволяет писать запросы точно так же, как в ClickHouse,
поэтому вы можете напрямую выполнять команды, такие как CREATE TABLE, TRUNCATE и другие, без каких-либо изменений, например:

:::note
При использовании Spark SQL можно выполнять только один оператор за раз.
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

Приведённые выше примеры демонстрируют запросы Spark SQL, которые вы можете выполнять в своём приложении, используя любой из API — Java, Scala, PySpark или shell.


## Работа с VariantType {#working-with-varianttype}

:::note
Поддержка VariantType доступна в Spark 4.0+ и требует ClickHouse 25.3+ с включёнными экспериментальными типами JSON/Variant.
:::

Коннектор поддерживает тип Spark `VariantType` для работы с полуструктурированными данными. VariantType сопоставляется с типами ClickHouse `JSON` и `Variant`, что позволяет эффективно хранить и выполнять запросы к данным со свободной схемой.

:::note
В этом разделе основное внимание уделяется сопоставлению и использованию VariantType. Полный обзор всех поддерживаемых типов данных см. в разделе [Поддерживаемые типы данных](#supported-data-types).
:::

### Сопоставление типов ClickHouse {#clickhouse-type-mapping}

| Тип ClickHouse | Тип Spark | Описание |
|----------------|-----------|----------|
| `JSON` | `VariantType` | Хранит только JSON-объекты (должен начинаться с `{`) |
| `Variant(T1, T2, ...)` | `VariantType` | Хранит несколько типов данных, включая примитивы, массивы и JSON |

### Чтение данных VariantType {#reading-varianttype-data}

При чтении из ClickHouse столбцы `JSON` и `Variant` автоматически сопоставляются типу данных `VariantType` в Spark:

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


### Запись данных VariantType {#writing-varianttype-data}

Вы можете записывать данные типа VariantType в ClickHouse, используя типы столбцов JSON или Variant:

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


### Создание таблиц VariantType с помощью Spark SQL {#creating-varianttype-tables-spark-sql}

Вы можете создавать таблицы VariantType, используя DDL языка Spark SQL:

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


### Настройка типов VariantType {#configuring-variant-types}

При создании таблиц со столбцами типа VariantType вы можете указать, какие типы ClickHouse должны использоваться:

#### Тип JSON (по умолчанию) {#json-type-default}

Если свойство `variant_types` не задано, столбец по умолчанию имеет тип `JSON` в ClickHouse, который принимает только объекты JSON:

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

В результате будет выполнен следующий запрос к ClickHouse:

```sql
CREATE TABLE json_table (id Int32, data JSON) ENGINE = MergeTree() ORDER BY id
```


#### Тип Variant с несколькими типами {#variant-type-multiple-types}

Для поддержки примитивов, массивов и JSON-объектов укажите типы в свойстве `variant_types`:

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

Это формирует следующий запрос к ClickHouse:

```sql
CREATE TABLE flexible_data (
  id Int32, 
  data Variant(String, Int64, Float64, Bool, Array(String), JSON)
) ENGINE = MergeTree() ORDER BY id
```


### Поддерживаемые типы Variant {#supported-variant-types}

В `Variant()` можно использовать следующие типы ClickHouse:

- **Примитивы**: `String`, `Int8`, `Int16`, `Int32`, `Int64`, `UInt8`, `UInt16`, `UInt32`, `UInt64`, `Float32`, `Float64`, `Bool`
- **Массивы**: `Array(T)`, где T — любой поддерживаемый тип, включая вложенные массивы
- **JSON**: `JSON` для хранения объектов JSON

### Конфигурация формата чтения {#read-format-configuration}

По умолчанию столбцы JSON и Variant читаются как `VariantType`. Вы можете переопределить это поведение и читать их как строки:

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


### Поддержка форматов записи {#write-format-support}

Поддержка записи для VariantType зависит от формата:

| Формат | Поддержка    | Примечания                                                                                                                                                                                         |
| ------ | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JSON   | ✅ Полная     | Поддерживаются типы `JSON` и `Variant`. Рекомендуется для данных VariantType                                                                                                                       |
| Arrow  | ⚠️ Частичная | Поддерживается запись в тип ClickHouse `JSON`. Тип ClickHouse `Variant` не поддерживается. Полная поддержка ожидается после решения задачи <https://github.com/ClickHouse/ClickHouse/issues/92752> |

Настройте формат записи:

```scala
spark.conf.set("spark.clickhouse.write.format", "json")  // Recommended for Variant types
```

:::tip
Если вам нужно записывать данные в тип данных `Variant` в ClickHouse, используйте формат JSON. Формат Arrow поддерживает запись только в тип `JSON`.
:::


### Рекомендации по использованию {#varianttype-best-practices}

1. **Используйте тип JSON для данных только в формате JSON**: Если вы храните исключительно JSON-объекты, используйте тип JSON по умолчанию (без свойства `variant_types`).
2. **Указывайте типы явно**: При использовании `Variant()` явно перечисляйте все типы, которые вы планируете хранить.
3. **Включите экспериментальные функции**: Убедитесь, что в ClickHouse включён параметр `allow_experimental_json_type = 1`.
4. **Используйте формат JSON для записи**: Для данных типа VariantType рекомендуется использовать формат JSON для лучшей совместимости.
5. **Учитывайте характер запросов**: Типы JSON/Variant поддерживают JSON path-запросы ClickHouse для эффективной фильтрации.
6. **Подсказки по столбцам для повышения производительности**: При использовании JSON-полей в ClickHouse добавление подсказок по столбцам улучшает производительность запросов. В настоящее время добавление подсказок по столбцам через Spark не поддерживается. Для отслеживания этой возможности см. [GitHub issue #497](https://github.com/ClickHouse/spark-clickhouse-connector/issues/497).

### Пример: полный сценарий работы {#varianttype-example-workflow}

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

## Конфигурации {#configurations}

Ниже перечислены настраиваемые параметры конфигурации, доступные в коннекторе.

:::note
**Использование конфигураций**: Это параметры конфигурации на уровне Spark, которые применяются как к Catalog API, так и к TableProvider API. Их можно задать двумя способами:

1. **Глобальная конфигурация Spark** (применяется ко всем операциям):
   ```python
   spark.conf.set("spark.clickhouse.write.batchSize", "20000")
   spark.conf.set("spark.clickhouse.write.compression.codec", "lz4")
   ```

2. **Переопределение для отдельной операции** (только TableProvider API — позволяет переопределять глобальные настройки):
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

Либо задайте их в `spark-defaults.conf` или при создании сеанса Spark.
:::

<br/>

| Ключ                                               | Значение по умолчанию                                            | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | С версии |
| -------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| spark.clickhouse.ignoreUnsupportedTransform        | false                                                            | ClickHouse поддерживает использование сложных выражений в качестве ключей сегментации или значений партиций, например `cityHash64(col_1, col_2)`, которые на данный момент не поддерживаются Spark. Если значение — `true`, игнорировать неподдерживаемые выражения, в противном случае немедленно завершать выполнение с исключением. Обратите внимание: когда включен `spark.clickhouse.write.distributed.convertLocal`, игнорирование неподдерживаемых ключей сегментации может привести к повреждению данных. | 0.4.0    |
| spark.clickhouse.read.compression.codec            | lz4                                                              | Кодек, используемый при чтении для декомпрессии данных. Поддерживаемые кодеки: none, lz4.                                                                                                                                                                                                                                                                                                                                                                                                                         | 0.5.0    |
| spark.clickhouse.read.distributed.convertLocal     | true                                                             | При чтении distributed таблицы использовать локальную таблицу вместо неё. Если значение `true`, игнорировать `spark.clickhouse.read.distributed.useClusterNodes`.                                                                                                                                                                                                                                                                                                                                                 | 0.1.0    |
| spark.clickhouse.read.fixedStringAs                | binary                                                           | Считывать тип ClickHouse FixedString в виде указанного типа данных Spark. Поддерживаемые типы: binary, string                                                                                                                                                                                                                                                                                                                                                                                                     | 0.8.0    |
| spark.clickhouse.read.format                       | json                                                             | Формат сериализации при чтении. Поддерживаемые форматы: json, binary                                                                                                                                                                                                                                                                                                                                                                                                                                              | 0.6.0    |
| spark.clickhouse.read.runtimeFilter.enabled        | false                                                            | Включить runtime-фильтр при чтении.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 0.8.0    |
| spark.clickhouse.read.splitByPartitionId           | true                                                             | Если `true`, конструирует фильтр входных партиций по виртуальному столбцу `_partition_id` вместо значения партиции. Известны проблемы с формированием SQL-предикатов по значению партиции. Для использования этой возможности требуется ClickHouse Server v21.6+                                                                                                                                                                                                                                                  | 0.4.0    |
| spark.clickhouse.useNullableQuerySchema            | false                                                            | Если `true`, помечает все поля схемы запроса как Nullable при выполнении `CREATE/REPLACE TABLE ... AS SELECT ...` при создании таблицы. Обратите внимание, что для этой конфигурации требуется SPARK-43390 (доступна в Spark 3.5); без этого исправления параметр фактически всегда ведёт себя как `true`.                                                                                                                                                                                                        | 0.8.0    |
| spark.clickhouse.write.batchSize                   | 10000                                                            | Количество записей в пакете при записи в ClickHouse.                                                                                                                                                                                                                                                                                                                                                                                                                                                              | 0.1.0    |
| spark.clickhouse.write.compression.codec           | lz4                                                              | Кодек, используемый при записи данных для их сжатия. Поддерживаемые кодеки: none, lz4.                                                                                                                                                                                                                                                                                                                                                                                                                            | 0.3.0    |
| spark.clickhouse.write.distributed.convertLocal    | false                                                            | При записи в Distributed таблицу выполняется запись в локальную таблицу вместо неё. Если имеет значение `true`, параметр `spark.clickhouse.write.distributed.useClusterNodes` игнорируется.                                                                                                                                                                                                                                                                                                                       | 0.1.0    |
| spark.clickhouse.write.distributed.useClusterNodes | true                                                             | При записи в distributed таблицу производить запись на все узлы кластера.                                                                                                                                                                                                                                                                                                                                                                                                                                         | 0.1.0    |
| spark.clickhouse.write.format                      | arrow                                                            | Формат сериализации данных при записи. Поддерживаемые форматы: json, arrow                                                                                                                                                                                                                                                                                                                                                                                                                                        | 0.4.0    |
| spark.clickhouse.write.localSortByKey              | true                                                             | Если установлено значение `true`, выполнять локальную сортировку по ключам сортировки перед записью.                                                                                                                                                                                                                                                                                                                                                                                                              | 0.3.0    |
| spark.clickhouse.write.localSortByPartition        | значение настройки spark.clickhouse.write.repartitionByPartition | Если `true`, выполнять локальную сортировку по партиции перед записью. Если параметр не задан, используется значение `spark.clickhouse.write.repartitionByPartition`.                                                                                                                                                                                                                                                                                                                                             | 0.3.0    |
| spark.clickhouse.write.maxRetry                    | 3                                                                | Максимальное число повторных попыток записи для одного пакетного задания, завершившегося сбоем с ошибками, допускающими повторную попытку.                                                                                                                                                                                                                                                                                                                                                                        | 0.1.0    |
| spark.clickhouse.write.repartitionByPartition      | true                                                             | Нужно ли перераспределять данные по ключам партиционирования ClickHouse, чтобы они соответствовали распределению таблицы ClickHouse перед записью.                                                                                                                                                                                                                                                                                                                                                                | 0.3.0    |
| spark.clickhouse.write.repartitionNum              | 0                                                                | Если перед записью требуется перераспределить данные в соответствии с распределением таблицы ClickHouse, используйте этот параметр для указания числа партиций при перераспределении. Значение меньше 1 означает отсутствие требования к числу партиций.                                                                                                                                                                                                                                                          | 0.1.0    |
| spark.clickhouse.write.repartitionStrictly         | false                                                            | Если значение `true`, Spark будет строго распределять входящие записи по партициям, чтобы обеспечить требуемое распределение перед передачей записей в таблицу источника данных при записи. В противном случае Spark может применять определённые оптимизации для ускорения запроса, но при этом нарушить требуемое распределение. Обратите внимание, что эта конфигурация требует исправления SPARK-37523 (доступного в Spark 3.4); без этого патча поведение всегда эквивалентно `true`.                        | 0.3.0    |
| spark.clickhouse.write.retryInterval               | 10s                                                              | Интервал в секундах между повторными попытками записи.                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 0.1.0    |
| spark.clickhouse.write.retryableErrorCodes         | 241                                                              | Коды ошибок, при которых допускается повторная попытка, возвращаемые сервером ClickHouse при ошибке записи.                                                                                                                                                                                                                                                                                                                                                                                                       | 0.1.0    |

## Поддерживаемые типы данных {#supported-data-types}

В этом разделе описывается соответствие типов данных между Spark и ClickHouse. Таблицы ниже служат быстрым справочником
по преобразованию типов данных при чтении данных из ClickHouse в Spark и при вставке данных из Spark в ClickHouse.

### Чтение данных из ClickHouse в Spark {#reading-data-from-clickhouse-into-spark}

| Тип данных ClickHouse                                             | Тип данных Spark               | Поддерживается | Примитивный тип | Примечания                                         |
|-------------------------------------------------------------------|--------------------------------|----------------|-----------------|----------------------------------------------------|
| `Nothing`                                                         | `NullType`                     | ✅             | Да              |                                                    |
| `Bool`                                                            | `BooleanType`                  | ✅             | Да              |                                                    |
| `UInt8`, `Int16`                                                  | `ShortType`                    | ✅             | Да              |                                                    |
| `Int8`                                                            | `ByteType`                     | ✅             | Да              |                                                    |
| `UInt16`,`Int32`                                                  | `IntegerType`                  | ✅             | Да              |                                                    |
| `UInt32`,`Int64`, `UInt64`                                        | `LongType`                     | ✅             | Да              |                                                    |
| `Int128`,`UInt128`, `Int256`, `UInt256`                           | `DecimalType(38, 0)`           | ✅             | Да              |                                                    |
| `Float32`                                                         | `FloatType`                    | ✅             | Да              |                                                    |
| `Float64`                                                         | `DoubleType`                   | ✅             | Да              |                                                    |
| `String`, `UUID`, `Enum8`, `Enum16`, `IPv4`, `IPv6`              | `StringType`                   | ✅             | Да              |                                                    |
| `FixedString`                                                     | `BinaryType`, `StringType`     | ✅             | Да              | Управляется конфигурацией `READ_FIXED_STRING_AS`  |
| `Decimal`                                                         | `DecimalType`                  | ✅             | Да              | Точность и масштаб вплоть до `Decimal128`         |
| `Decimal32`                                                       | `DecimalType(9, scale)`        | ✅             | Да              |                                                    |
| `Decimal64`                                                       | `DecimalType(18, scale)`       | ✅             | Да              |                                                    |
| `Decimal128`                                                      | `DecimalType(38, scale)`       | ✅             | Да              |                                                    |
| `Date`, `Date32`                                                  | `DateType`                     | ✅             | Да              |                                                    |
| `DateTime`, `DateTime32`, `DateTime64`                            | `TimestampType`                | ✅             | Да              |                                                    |
| `Array`                                                           | `ArrayType`                    | ✅             | Нет             | Тип элементов массива также преобразуется          |
| `Map`                                                             | `MapType`                      | ✅             | Нет             | Ключи ограничены типом `StringType`               |
| `IntervalYear`                                                    | `YearMonthIntervalType(Year)`  | ✅             | Да              |                                                    |
| `IntervalMonth`                                                   | `YearMonthIntervalType(Month)` | ✅             | Да              |                                                    |
| `IntervalDay`, `IntervalHour`, `IntervalMinute`, `IntervalSecond` | `DayTimeIntervalType`          | ✅             | Нет             | Используется конкретный тип интервала             |
| `JSON`, `Variant`                                                 | `VariantType`                  | ✅             | Нет             | Требуется Spark 4.0+ и ClickHouse 25.3+. Можно читать как `StringType`, задав `spark.clickhouse.read.jsonAs=string` |
| `Object`                                                          |                                | ❌             |                 |                                                    |
| `Nested`                                                          |                                | ❌             |                 |                                                    |
| `Tuple`                                                           | `StructType`                   | ✅             | Нет             | Поддерживаются именованные и неименованные кортежи. Именованные кортежи сопоставляются с полями struct по имени, неименованные используют `_1`, `_2` и т. д. Поддерживаются вложенные struct и Nullable-поля |
| `Point`                                                           |                                | ❌             |                 |                                                    |
| `Polygon`                                                         |                                | ❌             |                 |                                                    |
| `MultiPolygon`                                                    |                                | ❌             |                 |                                                    |
| `Ring`                                                            |                                | ❌             |                 |                                                    |
| `IntervalQuarter`                                                 |                                | ❌             |                 |                                                    |
| `IntervalWeek`                                                    |                                | ❌             |                 |                                                    |
| `Decimal256`                                                      |                                | ❌             |                 |                                                    |
| `AggregateFunction`                                               |                                | ❌             |                 |                                                    |
| `SimpleAggregateFunction`                                         |                                | ❌             |                 |                                                    |

### Вставка данных из Spark в ClickHouse {#inserting-data-from-spark-into-clickhouse}

| Тип данных Spark                    | Тип данных ClickHouse | Поддерживается | Примитивный | Примечания                              |
|-------------------------------------|------------------------|----------------|-------------|-----------------------------------------|
| `BooleanType`                       | `Bool`                 | ✅              | Да          | Отображается в тип `Bool` (а не `UInt8`) начиная с версии 0.9.0 |
| `ByteType`                          | `Int8`                 | ✅              | Да          |                                         |
| `ShortType`                         | `Int16`                | ✅              | Да          |                                         |
| `IntegerType`                       | `Int32`                | ✅              | Да          |                                         |
| `LongType`                          | `Int64`                | ✅              | Да          |                                         |
| `FloatType`                         | `Float32`              | ✅              | Да          |                                         |
| `DoubleType`                        | `Float64`              | ✅              | Да          |                                         |
| `StringType`                        | `String`               | ✅              | Да          |                                         |
| `VarcharType`                       | `String`               | ✅              | Да          |                                         |
| `CharType`                          | `String`               | ✅              | Да          |                                         |
| `DecimalType`                       | `Decimal(p, s)`        | ✅              | Да          | Точность и масштаб — до `Decimal128`    |
| `DateType`                          | `Date`                 | ✅              | Да          |                                         |
| `TimestampType`                     | `DateTime`             | ✅              | Да          |                                         |
| `ArrayType` (list, tuple, or array) | `Array`                | ✅              | Нет         | Тип элементов массива также преобразуется |
| `MapType`                           | `Map`                  | ✅              | Нет         | Ключи ограничены типом `StringType`     |
| `StructType`                        | `Tuple`                | ✅              | Нет         | Преобразуется в именованный Tuple с именами полей. |
| `VariantType`                       | `JSON` или `Variant`   | ✅              | Нет         | Требуются Spark 4.0+ и ClickHouse 25.3+. По умолчанию используется тип `JSON`. Используйте свойство `clickhouse.column.<name>.variant_types` для указания `Variant` с несколькими типами. |
| `Object`                            |                        | ❌              |             |                                         |
| `Nested`                            |                        | ❌              |             |                                         |

## Участие в развитии и поддержка {#contributing-and-support}

Если вы хотите внести вклад в проект или сообщить о проблемах, мы будем рады вашему участию!
Посетите наш [репозиторий на GitHub](https://github.com/ClickHouse/spark-clickhouse-connector), чтобы создать issue, предложить
улучшения или отправить pull request.
Мы приветствуем ваш вклад! Перед началом работы пожалуйста ознакомьтесь с руководством по участию в репозитории.
Спасибо, что помогаете улучшать наш коннектор ClickHouse Spark!