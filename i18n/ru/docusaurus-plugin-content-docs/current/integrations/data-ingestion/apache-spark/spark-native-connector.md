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
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Коннектор Spark \{#spark-connector\}

<ClickHouseSupportedBadge/>

Этот коннектор использует оптимизации, специфичные для ClickHouse, такие как расширенное разбиение на партиции и проталкивание предикатов, чтобы
повысить производительность запросов и эффективность обработки данных.
Коннектор основан на [официальном JDBC‑коннекторе ClickHouse](https://github.com/ClickHouse/clickhouse-java) и
управляет собственным каталогом.

До Spark 3.0 в Spark отсутствовала встроенная концепция каталога, поэтому пользователи обычно полагались на внешние системы каталогов, такие как
Hive Metastore или AWS Glue.
При использовании этих внешних решений пользователям приходилось вручную регистрировать таблицы источников данных, прежде чем обращаться к ним из Spark.
Однако после того как в Spark 3.0 была введена концепция каталога, Spark теперь может автоматически обнаруживать таблицы путём регистрации
плагинов каталогов.

Каталог по умолчанию в Spark — `spark_catalog`, а таблицы идентифицируются как `{catalog name}.{database}.{table}`. С новой
функциональностью каталогов теперь можно добавлять и использовать несколько каталогов в одном приложении Spark.

## Выбор между Catalog API и TableProvider API \{#choosing-between-apis\}

Коннектор ClickHouse для Spark поддерживает два варианта доступа: **Catalog API** и **TableProvider API** (форматно-ориентированный доступ). Понимание различий помогает выбрать правильный подход для вашего сценария использования.

### Catalog API vs TableProvider API \{#catalog-vs-tableprovider-comparison\}

| Возможность | Catalog API | TableProvider API |
|---------|-------------|-------------------|
| **Configuration** | Централизованная через конфигурацию Spark | Для каждой операции через параметры (options) |
| **Table Discovery** | Автоматическое обнаружение через каталог | Ручное указание таблицы |
| **DDL Operations** | Полная поддержка (CREATE, DROP, ALTER) | Ограниченная (только автоматическое создание таблицы) |
| **Spark SQL Integration** | Нативная интеграция (`clickhouse.database.table`) | Требуется указание формата |
| **Use Case** | Долгосрочный, стабильный доступ с централизованной конфигурацией | Разовый, динамический или временный доступ |

<TOCInline toc={toc}></TOCInline>

## Требования \{#requirements\}

- Java 8 или 17 (для Spark 4.0 требуется Java 17 и выше)
- Scala 2.12 или 2.13 (Spark 4.0 поддерживает только Scala 2.13)
- Apache Spark 3.3, 3.4, 3.5 или 4.0

## Матрица совместимости \{#compatibility-matrix\}

| Версия | Совместимые версии Spark | Версия ClickHouse JDBC |
|---------|---------------------------|-------------------------|
| main    | Spark 3.3, 3.4, 3.5, 4.0  | 0.9.4                   |
| 0.10.0  | Spark 3.3, 3.4, 3.5, 4.0  | 0.9.5                   |
| 0.9.0   | Spark 3.3, 3.4, 3.5, 4.0  | 0.9.4                   |
| 0.8.1   | Spark 3.3, 3.4, 3.5       | 0.6.3                   |
| 0.7.3   | Spark 3.3, 3.4            | 0.4.6                   |
| 0.6.0   | Spark 3.3                 | 0.3.2-patch11           |
| 0.5.0   | Spark 3.2, 3.3            | 0.3.2-patch11           |
| 0.4.0   | Spark 3.2, 3.3            | Не зависит              |
| 0.3.0   | Spark 3.2, 3.3            | Не зависит              |
| 0.2.1   | Spark 3.2                 | Не зависит              |
| 0.1.2   | Spark 3.2                 | Не зависит              |

## Установка и настройка \{#installation--setup\}

Для интеграции ClickHouse со Spark существует несколько вариантов установки, подходящих для разных типов проектов.
Вы можете добавить коннектор ClickHouse для Spark как зависимость непосредственно в файл сборки вашего проекта (например, в `pom.xml`
для Maven или `build.sbt` для SBT).
Либо вы можете поместить необходимые JAR-файлы в каталог `$SPARK_HOME/jars/` или передать их напрямую как параметр Spark
с помощью флага `--jars` в команде `spark-submit`.
Оба подхода гарантируют, что коннектор ClickHouse будет доступен в вашей среде Spark.

### Импорт в качестве зависимости \{#import-as-a-dependency\}

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

При работе с параметрами оболочки Spark (Spark SQL CLI, Spark Shell CLI и команда Spark Submit) зависимости можно
подключить, передав необходимые JAR-файлы:

```text
$SPARK_HOME/bin/spark-sql \
  --jars /path/clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }}.jar,/path/clickhouse-jdbc-{{ clickhouse_jdbc_version }}-all.jar
```

Если вы хотите избежать копирования JAR-файлов на клиентский узел Spark, вместо этого вы можете использовать следующее:

```text
  --repositories https://{maven-central-mirror or private-nexus-repo} \
  --packages com.clickhouse.spark:clickhouse-spark-runtime-{{ spark_binary_version }}_{{ scala_binary_version }}:{{ stable_version }},com.clickhouse:clickhouse-jdbc:{{ clickhouse_jdbc_version }}
```

Примечание: для сценариев, где используется только SQL, в продакшене рекомендуется использовать [Apache Kyuubi](https://github.com/apache/kyuubi).

</TabItem>
</Tabs>

### Скачайте библиотеку \{#download-the-library\}

Формат имени бинарного JAR-файла:

```bash
clickhouse-spark-runtime-${spark_binary_version}_${scala_binary_version}-${version}.jar
```

Вы можете найти все доступные релизные JAR-файлы
в [репозитории Maven Central](https://repo1.maven.org/maven2/com/clickhouse/spark/)
и все SNAPSHOT JAR-файлы ежедневных сборок — в [репозитории Sonatype OSS Snapshots](https://s01.oss.sonatype.org/content/repositories/snapshots/com/clickhouse/).

:::important
Крайне важно добавить [clickhouse-jdbc JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-jdbc)
с классификатором &quot;all&quot;,
так как коннектор зависит от [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client)
и [clickhouse-client](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client), которые оба уже входят
в clickhouse-jdbc:all.
В качестве альтернативы вы можете добавить [clickhouse-client JAR](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-client)
и [clickhouse-http](https://mvnrepository.com/artifact/com.clickhouse/clickhouse-http-client) по отдельности, если
предпочитаете не использовать полный JDBC-пакет.

В любом случае убедитесь, что версии пакетов совместимы в соответствии
с [матрицей совместимости](#compatibility-matrix).
:::


## Регистрация каталога (обязательный шаг) \{#register-the-catalog-required\}

Чтобы получить доступ к вашим таблицам ClickHouse, необходимо настроить новый каталог Spark со следующими параметрами:

| Свойство                                     | Значение                                 | Значение по умолчанию | Обязательно |
| -------------------------------------------- | ---------------------------------------- | --------------------- | ----------- |
| `spark.sql.catalog.<catalog_name>`           | `com.clickhouse.spark.ClickHouseCatalog` | N/A                   | Yes         |
| `spark.sql.catalog.<catalog_name>.host`      | `<clickhouse_host>`                      | `localhost`           | No          |
| `spark.sql.catalog.<catalog_name>.protocol`  | `http`                                   | `http`                | No          |
| `spark.sql.catalog.<catalog_name>.http_port` | `<clickhouse_port>`                      | `8123`                | No          |
| `spark.sql.catalog.<catalog_name>.user`      | `<clickhouse_username>`                  | `default`             | No          |
| `spark.sql.catalog.<catalog_name>.password`  | `<clickhouse_password>`                  | (пустая строка)       | No          |
| `spark.sql.catalog.<catalog_name>.database`  | `<database>`                             | `default`             | No          |
| `spark.<catalog_name>.write.format`          | `json`                                   | `arrow`               | No          |

Эти параметры можно задать одним из следующих способов:

* Отредактируйте/создайте `spark-defaults.conf`.
* Передайте конфигурацию в команду `spark-submit` (или в CLI-команды `spark-shell`/`spark-sql`).
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

Таким образом, вы сможете обращаться к таблице clickhouse1 `<ck_db>.<ck_table>` в Spark SQL как `clickhouse1.<ck_db>.<ck_table>`, а к таблице clickhouse2 `<ck_db>.<ck_table>` как `clickhouse2.<ck_db>.<ck_table>`.

:::


## Использование API TableProvider (доступ на основе формата) \{#using-the-tableprovider-api\}

В дополнение к подходу на основе каталога коннектор ClickHouse для Spark поддерживает **модель доступа на основе формата** через API TableProvider.

### Пример чтения с использованием формата \{#format-based-read\}

<Tabs groupId="spark_apis">
<TabItem value="Python" label="Python" default>

```python
from pyspark.sql import SparkSession

spark = SparkSession.builder.getOrCreate()

# Чтение из ClickHouse с использованием API формата
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

### Пример записи с использованием формата \{#format-based-write\}

<Tabs groupId="spark_apis">
<TabItem value="Python" label="Python" default>

```python
# Запись в ClickHouse с использованием форматного API
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

### Возможности TableProvider \{#tableprovider-features\}

API TableProvider предоставляет ряд мощных функций:

#### Автоматическое создание таблиц \{#automatic-table-creation\}

При записи в несуществующую таблицу коннектор автоматически создаёт таблицу с соответствующей схемой. Коннектор предоставляет разумные значения по умолчанию:

- **Движок (Engine)**: По умолчанию используется `MergeTree()`, если явно не указан. Вы можете указать другой движок с помощью опции `engine` (например, `ReplacingMergeTree()`, `SummingMergeTree()` и т. д.)
- **ORDER BY**: **Обязательно** — при создании новой таблицы вы должны явно указать опцию `order_by`. Коннектор проверяет, что все указанные столбцы существуют в схеме.
- **Поддержка ключей с типом Nullable**: Автоматически добавляет `settings.allow_nullable_key=1`, если ORDER BY содержит столбцы типа Nullable

<Tabs groupId="spark_apis">
<TabItem value="Python" label="Python" default>

```python
# Таблица будет создана автоматически с явным ORDER BY (обязательно)
df.write \
    .format("clickhouse") \
    .option("host", "your-host") \
    .option("database", "default") \
    .option("table", "new_table") \
    .option("order_by", "id") \
    .mode("append") \
    .save()

# Задание параметров создания таблицы с пользовательским движком
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
// Таблица будет создана автоматически с явным ORDER BY (обязательно)
df.write
  .format("clickhouse")
  .option("host", "your-host")
  .option("database", "default")
  .option("table", "new_table")
  .option("order_by", "id")
  .mode("append")
  .save()

// С явными параметрами создания таблицы и пользовательским движком
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
// Таблица будет создана автоматически с явным ORDER BY (обязательно)
df.write()
    .format("clickhouse")
    .option("host", "your-host")
    .option("database", "default")
    .option("table", "new_table")
    .option("order_by", "id")
    .mode("append")
    .save();

// С явными параметрами создания таблицы и пользовательским движком
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
**ORDER BY обязательно**: Опция `order_by` **обязательна** при создании новой таблицы через TableProvider API. Вы должны явно указать, какие столбцы использовать в предложении ORDER BY. Коннектор проверяет, что все указанные столбцы существуют в схеме, и выдаст ошибку, если какой-либо столбец отсутствует.

**Выбор движка (Engine)**: Движок по умолчанию — `MergeTree()`, но вы можете указать любой движок таблиц ClickHouse с помощью опции `engine` (например, `ReplacingMergeTree()`, `SummingMergeTree()`, `AggregatingMergeTree()` и т. д.).
:::

### Параметры подключения TableProvider \{#tableprovider-connection-options\}

При использовании основанного на форматах API доступны следующие параметры подключения:

#### Параметры подключения \{#connection-options\}

| Параметр     | Описание                                         | Значение по умолчанию | Обязательный |
|--------------|--------------------------------------------------|------------------------|--------------|
| `host`       | Имя хоста сервера ClickHouse                     | `localhost`            | Да           |
| `protocol`   | Протокол подключения (`http` или `https`)        | `http`                 | Нет          |
| `http_port`  | Порт HTTP/HTTPS                                  | `8123`                 | Нет          |
| `database`   | Имя базы данных                                  | `default`              | Да           |
| `table`      | Имя таблицы                                      | N/A                    | Да           |
| `user`       | Имя пользователя для аутентификации              | `default`              | Нет          |
| `password`   | Пароль для аутентификации                        | (пустая строка)        | Нет          |
| `ssl`        | Включить SSL-подключение                         | `false`                | Нет          |
| `ssl_mode`   | Режим SSL (`NONE`, `STRICT` и т. д.)             | `STRICT`               | Нет          |
| `timezone`   | Часовой пояс для операций с датой и временем     | `server`               | Нет          |

#### Параметры создания таблицы \{#table-creation-options\}

Эти параметры используются, когда таблица ещё не существует и её нужно создать:

| Параметр                    | Описание                                                                    | Значение по умолчанию | Обязательный |
|-----------------------------|-----------------------------------------------------------------------------|------------------------|--------------|
| `order_by`                  | Столбец или столбцы, используемые в выражении ORDER BY. Несколько столбцов указываются через запятую | Н/Д                    | **Да**       |
| `engine`                    | Движок таблицы ClickHouse (например, `MergeTree()`, `ReplacingMergeTree()`, `SummingMergeTree()`, и т. д.) | `MergeTree()`          | Нет          |
| `settings.allow_nullable_key` | Включить Nullable-ключи в ORDER BY (для ClickHouse Cloud)               | Определяется автоматически** | Нет   |
| `settings.<key>`            | Любой параметр таблицы ClickHouse                                           | Н/Д                    | Нет          |
| `cluster`                   | Имя кластера для distributed таблиц                                        | Н/Д                    | Нет          |
| `clickhouse.column.<name>.variant_types` | Список типов ClickHouse для столбцов типа Variant, разделённый запятыми (например, `String, Int64, Bool, JSON`). Имена типов чувствительны к регистру. Пробелы после запятых необязательны. | Н/Д | Нет |

\* Параметр `order_by` обязателен при создании новой таблицы. Все указанные столбцы должны существовать в схеме.  
\** Автоматически устанавливается в `1`, если ORDER BY содержит столбцы типа Nullable и параметр не задан явно.

:::tip
**Рекомендация**: Для ClickHouse Cloud явно задайте `settings.allow_nullable_key=1`, если ваши столбцы в ORDER BY могут быть Nullable, так как ClickHouse Cloud требует этот параметр.
:::

#### Режимы записи \{#writing-modes\}

Spark-коннектор (как через TableProvider API, так и через Catalog API) поддерживает следующие режимы записи в Spark:

- **`append`**: Добавляет данные в существующую таблицу
- **`overwrite`**: Заменяет все данные в таблице (очищает таблицу)

:::important
**Перезапись партиций не поддерживается**: Коннектор в настоящее время не поддерживает операции перезаписи на уровне партиций (например, режим `overwrite` с `partitionBy`). Работа над этой возможностью ведётся. См. [GitHub issue #34](https://github.com/ClickHouse/spark-clickhouse-connector/issues/34) для отслеживания прогресса по этой функции.
:::

<Tabs groupId="spark_apis">
<TabItem value="Python" label="Python" default>

```python
# Режим overwrite (сначала очищает таблицу)
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
// Режим overwrite (сначала очищает таблицу)
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
// Режим overwrite (сначала очищает таблицу)
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

## Настройка параметров ClickHouse \{#configuring-clickhouse-options\}

И Catalog API, и TableProvider API поддерживают настройку параметров, специфичных для ClickHouse (не параметров коннектора). Эти параметры передаются в ClickHouse при создании таблиц или выполнении запросов.

Параметры ClickHouse позволяют задавать настройки, такие как `allow_nullable_key`, `index_granularity` и другие параметры на уровне таблицы или запроса. Они отличаются от параметров коннектора (таких как `host`, `database`, `table`), которые определяют, как коннектор подключается к ClickHouse.

### Использование TableProvider API \{#using-tableprovider-api-options\}

При использовании API TableProvider применяйте формат параметров `settings.&lt;key&gt;`:

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

### Использование Catalog API \{#using-catalog-api-options\}

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


## Настройки ClickHouse Cloud \{#clickhouse-cloud-settings\}

При подключении к [ClickHouse Cloud](https://clickhouse.com) убедитесь, что вы включили SSL и задали соответствующий режим SSL. Например:

```text
spark.sql.catalog.clickhouse.option.ssl        true
spark.sql.catalog.clickhouse.option.ssl_mode   NONE
```


## Чтение данных \{#read-data\}

<Tabs groupId="spark_apis">
<TabItem value="Java" label="Java" default>

```java
public static void main(String[] args) {
        // Создайте сеанс Spark
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

## Запись данных \{#write-data\}

:::important
**Перезапись партиций не поддерживается**: Catalog API в настоящий момент не поддерживает операции перезаписи партиций (например, режим `overwrite` с `partitionBy`). Поддержка этой возможности находится в разработке. Для отслеживания прогресса смотрите [GitHub issue #34](https://github.com/ClickHouse/spark-clickhouse-connector/issues/34).
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

## Операции DDL \{#ddl-operations\}

Вы можете выполнять операции DDL в экземпляре ClickHouse с помощью Spark SQL, при этом все изменения немедленно
сохраняются в ClickHouse.
Spark SQL позволяет писать запросы точно так же, как в ClickHouse,
поэтому вы можете напрямую выполнять команды, такие как CREATE TABLE, TRUNCATE и другие, без каких-либо изменений, например:

:::note
При использовании Spark SQL одновременно может быть выполнена только одна инструкция.
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


## Работа с VariantType \{#working-with-varianttype\}

:::note
Поддержка VariantType доступна в Spark 4.0+ и требует ClickHouse 25.3+ с включёнными экспериментальными типами JSON/Variant.
:::

Коннектор поддерживает `VariantType` в Spark для работы с полуструктурированными данными. VariantType сопоставляется с типами `JSON` и `Variant` в ClickHouse, что позволяет эффективно хранить и выполнять запросы к данным с гибкой схемой.

:::note
Этот раздел посвящён именно сопоставлению и использованию VariantType. Подробный обзор всех поддерживаемых типов данных приведён в разделе [Поддерживаемые типы данных](#supported-data-types).
:::

### Сопоставление типов ClickHouse \{#clickhouse-type-mapping\}

| Тип ClickHouse | Тип Spark | Описание |
|----------------|-----------|----------|
| `JSON` | `VariantType` | Хранит только объекты JSON (должны начинаться с `{`) |
| `Variant(T1, T2, ...)` | `VariantType` | Хранит различные типы, включая примитивы, массивы и JSON |

### Чтение данных VariantType \{#reading-varianttype-data\}

При чтении из ClickHouse столбцы `JSON` и `Variant` автоматически отображаются в тип `VariantType` Spark:

<Tabs groupId="spark_apis">
<TabItem value="Scala" label="Scala" default>

```scala
// Чтение столбца JSON как VariantType
val df = spark.sql("SELECT id, data FROM clickhouse.default.json_table")

// Доступ к данным VariantType
df.show()

// Преобразование значения VariantType в строку JSON для анализа
import org.apache.spark.sql.functions._
df.select(
  col("id"),
  to_json(col("data")).as("data_json")
).show()
```

</TabItem>
<TabItem value="Python" label="Python">

```python
# Чтение столбца JSON как VariantType
df = spark.sql("SELECT id, data FROM clickhouse.default.json_table")

# Доступ к данным VariantType
df.show()

# Преобразование значения VariantType в строку JSON для анализа
from pyspark.sql.functions import to_json
df.select(
    "id",
    to_json("data").alias("data_json")
).show()
```

</TabItem>
<TabItem value="Java" label="Java">

```java
// Чтение столбца JSON как VariantType
Dataset<Row> df = spark.sql("SELECT id, data FROM clickhouse.default.json_table");

// Доступ к данным VariantType
df.show();

// Преобразование значения VariantType в строку JSON для анализа
import static org.apache.spark.sql.functions.*;
df.select(
    col("id"),
    to_json(col("data")).as("data_json")
).show();
```

</TabItem>
</Tabs>

### Запись данных VariantType \{#writing-varianttype-data\}

Вы можете записывать данные VariantType в ClickHouse, используя столбцы типов JSON или Variant:

<Tabs groupId="spark_apis">
<TabItem value="Scala" label="Scala" default>

```scala
import org.apache.spark.sql.functions._

// Создаём DataFrame с данными в формате JSON
val jsonData = Seq(
  (1, """{"name": "Alice", "age": 30}"""),
  (2, """{"name": "Bob", "age": 25}"""),
  (3, """{"name": "Charlie", "city": "NYC"}""")
).toDF("id", "json_string")

// Разбираем JSON-строки в VariantType
val variantDF = jsonData.select(
  col("id"),
  parse_json(col("json_string")).as("data")
)

// Записываем в ClickHouse с типом JSON (только JSON-объекты)
variantDF.writeTo("clickhouse.default.user_data").create()

// Или указываем Variant с несколькими типами
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

# Создаём DataFrame с данными в формате JSON
json_data = [
    (1, '{"name": "Alice", "age": 30}'),
    (2, '{"name": "Bob", "age": 25}'),
    (3, '{"name": "Charlie", "city": "NYC"}')
]
df = spark.createDataFrame(json_data, ["id", "json_string"])

# Разбираем JSON-строки в VariantType
variant_df = df.select(
    "id",
    parse_json("json_string").alias("data")
)

# Записываем в ClickHouse с типом JSON
variant_df.writeTo("clickhouse.default.user_data").create()

# Или указываем Variant с несколькими типами
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

// Создаём DataFrame с данными в формате JSON
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

// Разбираем JSON-строки в VariantType
Dataset<Row> variantDF = jsonDF.select(
    col("id"),
    parse_json(col("json_string")).as("data")
);

// Записываем в ClickHouse с типом JSON (только JSON-объекты)
variantDF.writeTo("clickhouse.default.user_data").create();

// Или указываем Variant с несколькими типами
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

### Создание таблиц с типом VariantType с помощью Spark SQL \{#creating-varianttype-tables-spark-sql\}

Вы можете создавать таблицы с типом VariantType с помощью Spark SQL DDL:

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


### Настройка типов Variant \{#configuring-variant-types\}

При создании таблиц со столбцами типа VariantType вы можете указать, какие типы ClickHouse должны использоваться:

#### Тип JSON (по умолчанию) \{#json-type-default\}

Если свойство `variant_types` не указано, столбец по умолчанию имеет тип данных `JSON` ClickHouse, который принимает только объекты JSON:

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

В результате формируется следующий запрос к ClickHouse:

```sql
CREATE TABLE json_table (id Int32, data JSON) ENGINE = MergeTree() ORDER BY id
```


#### Тип VariantType с несколькими типами \{#variant-type-multiple-types\}

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

Это формирует следующий запрос в ClickHouse:

```sql
CREATE TABLE flexible_data (
  id Int32, 
  data Variant(String, Int64, Float64, Bool, Array(String), JSON)
) ENGINE = MergeTree() ORDER BY id
```


### Поддерживаемые типы Variant \{#supported-variant-types\}

В `Variant()` можно использовать следующие типы ClickHouse:

- **Примитивы**: `String`, `Int8`, `Int16`, `Int32`, `Int64`, `UInt8`, `UInt16`, `UInt32`, `UInt64`, `Float32`, `Float64`, `Bool`
- **Массивы**: `Array(T)`, где T — любой поддерживаемый тип, включая вложенные массивы
- **JSON**: `JSON` для хранения объектов JSON

### Настройка формата чтения \{#read-format-configuration\}

По умолчанию столбцы JSON и Variant читаются как `VariantType`. Вы можете изменить это поведение и читать их как строки:

<Tabs groupId="spark_apis">
<TabItem value="Scala" label="Scala" default>

```scala
// Читать JSON/Variant как строки, а не как VariantType
spark.conf.set("spark.clickhouse.read.jsonAs", "string")

val df = spark.sql("SELECT id, data FROM clickhouse.default.json_table")
// столбец data будет иметь тип StringType и содержать строки JSON
```

</TabItem>
<TabItem value="Python" label="Python">

```python
# Читать JSON/Variant как строки, а не как VariantType
spark.conf.set("spark.clickhouse.read.jsonAs", "string")

df = spark.sql("SELECT id, data FROM clickhouse.default.json_table")
# столбец data будет иметь тип StringType и содержать строки JSON
```

</TabItem>
<TabItem value="Java" label="Java">

```java
// Читать JSON/Variant как строки, а не как VariantType
spark.conf().set("spark.clickhouse.read.jsonAs", "string");

Dataset<Row> df = spark.sql("SELECT id, data FROM clickhouse.default.json_table");
// столбец data будет иметь тип StringType и содержать строки JSON
```

</TabItem>
</Tabs>

### Поддержка форматов записи \{#write-format-support\}

Поддержка записи типа VariantType зависит от формата:

| Формат | Поддержка    | Примечания                                                                                                                                                                                  |
| ------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JSON   | ✅ Полная     | Поддерживает типы `JSON` и `Variant`. Рекомендуется для данных типа VariantType                                                                                                             |
| Arrow  | ⚠️ Частичная | Поддерживает запись в тип ClickHouse `JSON`. Не поддерживает тип ClickHouse `Variant`. Полная поддержка появится после решения задачи https://github.com/ClickHouse/ClickHouse/issues/92752 |

Настройте формат записи:

```scala
spark.conf.set("spark.clickhouse.write.format", "json")  // Recommended for Variant types
```

:::tip
Если вам нужно записывать данные в тип данных `Variant` в ClickHouse, используйте формат JSON. Формат Arrow поддерживает запись только в тип данных `JSON`.
:::


### Рекомендации по использованию \{#varianttype-best-practices\}

1. **Используйте тип JSON для данных только в формате JSON**: Если вы храните только JSON-объекты, используйте стандартный тип JSON (без свойства `variant_types`).
2. **Явно указывайте типы**: При использовании `Variant()` явно перечисляйте все типы, которые вы планируете хранить.
3. **Включите экспериментальные функции**: Убедитесь, что в ClickHouse включен параметр `allow_experimental_json_type = 1`.
4. **Используйте формат JSON для записи**: Для данных типа VariantType рекомендуется использовать формат JSON для лучшей совместимости.
5. **Учитывайте шаблоны запросов**: Типы JSON/Variant поддерживают JSON Path-запросы ClickHouse для эффективной фильтрации.
6. **Подсказки по столбцам для производительности**: При использовании полей JSON в ClickHouse добавление подсказок по столбцам улучшает производительность запросов. В настоящее время добавление таких подсказок через Spark не поддерживается. См. [GitHub issue #497](https://github.com/ClickHouse/spark-clickhouse-connector/issues/497) для отслеживания этой возможности.

### Пример: полный сценарий работы \{#varianttype-example-workflow\}

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

## Конфигурации \{#configurations\}

Ниже перечислены настраиваемые параметры, доступные в коннекторе.

:::note
**Использование конфигураций**: Это параметры на уровне Spark, которые применяются как к Catalog API, так и к TableProvider API. Их можно задать двумя способами:

1. **Глобальная конфигурация Spark** (применяется ко всем операциям):
   ```python
   spark.conf.set("spark.clickhouse.write.batchSize", "20000")
   spark.conf.set("spark.clickhouse.write.compression.codec", "lz4")
   ```

2. **Переопределение для отдельной операции** (только для TableProvider API — может переопределять глобальные настройки):
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

Кроме того, их можно задать в `spark-defaults.conf` или при создании сеанса Spark.
:::

<br/>

| Параметр                                                                 | По умолчанию                                                     | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | С версии |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| spark.clickhouse.ignoreUnsupportedTransform                              | true                                                             | ClickHouse поддерживает использование сложных выражений в качестве ключей сегментирования или значений партиций, например `cityHash64(col_1, col_2)`, которые в данный момент не поддерживаются Spark. Если `true`, игнорировать неподдерживаемые выражения и записывать предупреждение в журнал, иначе немедленно завершать работу с исключением. **Предупреждение**: когда `spark.clickhouse.write.distributed.convertLocal=true`, игнорирование неподдерживаемых ключей сегментирования может привести к порче данных. Коннектор проверяет это и по умолчанию выбрасывает ошибку. Чтобы разрешить такое поведение, явно установите `spark.clickhouse.write.distributed.convertLocal.allowUnsupportedSharding=true`. | 0.4.0    |
| spark.clickhouse.read.compression.codec                                  | lz4                                                              | Кодек, используемый для декомпрессии данных при чтении. Поддерживаемые кодеки: none и lz4.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 0.5.0    |
| spark.clickhouse.read.distributed.convertLocal                           | true                                                             | При чтении distributed таблицы использовать локальную таблицу вместо неё самой. Если `true`, параметр `spark.clickhouse.read.distributed.useClusterNodes` игнорируется.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | 0.1.0    |
| spark.clickhouse.read.fixedStringAs                                      | binary                                                           | Считывать тип ClickHouse FixedString как указанный тип данных Spark. Поддерживаемые типы: binary, string                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 0.8.0    |
| spark.clickhouse.read.format                                             | json                                                             | Формат сериализации при чтении. Поддерживаемые форматы: json, binary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 0.6.0    |
| spark.clickhouse.read.runtimeFilter.enabled                              | false                                                            | Включить фильтрацию во время выполнения при чтении.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 0.8.0    |
| spark.clickhouse.read.splitByPartitionId                                 | true                                                             | Если `true`, формировать фильтр по входной партиции по виртуальному столбцу `_partition_id`, а не по значению партиции. Известны проблемы со сборкой SQL-предикатов по значению партиции. Эта функция требует ClickHouse Server версии v21.6+.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 0.4.0    |
| spark.clickhouse.useNullableQuerySchema                                  | false                                                            | Если значение `true`, помечает все поля схемы запроса как Nullable при выполнении `CREATE/REPLACE TABLE ... AS SELECT ...` при создании таблицы. Обратите внимание: эта конфигурация требует SPARK-43390 (доступно в Spark 3.5); без этого патча она всегда действует как `true`.                                                                                                                                                                                                                                                                                                                                                                                                                                      | 0.8.0    |
| spark.clickhouse.write.batchSize                                         | 10000                                                            | Количество записей в одном пакете при записи данных в ClickHouse.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 0.1.0    |
| spark.clickhouse.write.compression.codec                                 | lz4                                                              | Кодек, используемый для сжатия данных при записи. Поддерживаемые кодеки: none, lz4.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 0.3.0    |
| spark.clickhouse.write.distributed.convertLocal                          | false                                                            | При записи в distributed таблицу данные направляются в локальную таблицу, а не в неё саму. Если `true`, параметр `spark.clickhouse.write.distributed.useClusterNodes` игнорируется. Это обходит встроенную маршрутизацию ClickHouse, из-за чего Spark должен вычислять ключ сегментирования (sharding key). При использовании неподдерживаемых выражений сегментирования установите `spark.clickhouse.ignoreUnsupportedTransform` в `false`, чтобы избежать скрытых ошибок распределения данных.                                                                                                                                                                                                                       | 0.1.0    |
| spark.clickhouse.write.distributed.convertLocal.allowUnsupportedSharding | false                                                            | Разрешает запись в distributed таблицы с `convertLocal=true` и `ignoreUnsupportedTransform=true`, когда ключ сегментирования не поддерживается. Это опасно и может привести к порче данных из‑за некорректного сегментирования. Если параметр установлен в `true`, вы должны убедиться, что ваши данные корректно отсортированы/разнесены по сегментам перед записью, так как Spark не может вычислить неподдерживаемое выражение сегментирования. Устанавливайте в `true` только в том случае, если вы понимаете риски и проверили распределение данных. По умолчанию эта комбинация приведёт к ошибке, чтобы предотвратить незаметную порчу данных.                                                                  | 0.10.0   |
| spark.clickhouse.write.distributed.useClusterNodes                       | true                                                             | Писать на все узлы кластера при записи в distributed таблицу.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 0.1.0    |
| spark.clickhouse.write.format                                            | arrow                                                            | Формат сериализации при записи. Поддерживаемые форматы: json, arrow                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 0.4.0    |
| spark.clickhouse.write.localSortByKey                                    | true                                                             | Если `true`, перед записью выполняется локальная сортировка по ключам сортировки.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 0.3.0    |
| spark.clickhouse.write.localSortByPartition                              | значение параметра spark.clickhouse.write.repartitionByPartition | Если имеет значение `true`, выполняется локальная сортировка по партиции перед записью. Если параметр не задан, используется значение `spark.clickhouse.write.repartitionByPartition`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 0.3.0    |
| spark.clickhouse.write.maxRetry                                          | 3                                                                | Максимальное число повторных попыток выполнения одной пакетной записи, завершившейся ошибками с кодами, допускающими повторную попытку.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | 0.1.0    |
| spark.clickhouse.write.repartitionByPartition                            | true                                                             | Определяет, нужно ли выполнять переразбиение данных по ключам партиций ClickHouse, чтобы соответствовать распределению данных в таблице ClickHouse перед записью.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 0.3.0    |
| spark.clickhouse.write.repartitionNum                                    | 0                                                                | Перед записью данные должны быть переразбиты в соответствии с распределением таблицы ClickHouse; используйте этот параметр конфигурации для задания числа партиций, значение меньше 1 означает отсутствие такого требования.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 0.1.0    |
| spark.clickhouse.write.repartitionStrictly                               | false                                                            | Если `true`, Spark будет строго распределять входящие записи по партициям, чтобы обеспечить требуемое распределение перед передачей записей в таблицу источника данных при записи. В противном случае Spark может применять некоторые оптимизации для ускорения запроса, но при этом нарушить требуемое распределение. Обратите внимание, что этот параметр требует SPARK-37523 (доступно в Spark 3.4); без этого патча он всегда работает как `true`.                                                                                                                                                                                                                                                                 | 0.3.0    |
| spark.clickhouse.write.retryInterval                                     | 10s                                                              | Интервал в секундах между повторными попытками записи.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 0.1.0    |
| spark.clickhouse.write.retryableErrorCodes                               | 241                                                              | Коды ошибок, при которых повторяется попытка записи, возвращаемые сервером ClickHouse при сбое записи.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 0.1.0    |

## Поддерживаемые типы данных \{#supported-data-types\}

В этом разделе описано соответствие типов данных между Spark и ClickHouse. Таблицы ниже служат быстрым справочным материалом
для преобразования типов данных при чтении данных из ClickHouse в Spark и при записи данных из Spark в ClickHouse.

### Чтение данных из ClickHouse в Spark \{#reading-data-from-clickhouse-into-spark\}

| Тип данных ClickHouse                                            | Тип данных Spark               | Поддерживается | Примитивный | Примечания                                          |
|------------------------------------------------------------------|--------------------------------|----------------|-------------|-----------------------------------------------------|
| `Nothing`                                                         | `NullType`                     | ✅             | Да          |                                                     |
| `Bool`                                                            | `BooleanType`                  | ✅             | Да          |                                                     |
| `UInt8`, `Int16`                                                  | `ShortType`                    | ✅             | Да          |                                                     |
| `Int8`                                                            | `ByteType`                     | ✅             | Да          |                                                     |
| `UInt16`,`Int32`                                                  | `IntegerType`                  | ✅             | Да          |                                                     |
| `UInt32`,`Int64`, `UInt64`                                        | `LongType`                     | ✅             | Да          |                                                     |
| `Int128`,`UInt128`, `Int256`, `UInt256`                           | `DecimalType(38, 0)`           | ✅             | Да          |                                                     |
| `Float32`                                                         | `FloatType`                    | ✅             | Да          |                                                     |
| `Float64`                                                         | `DoubleType`                   | ✅             | Да          |                                                     |
| `String`, `UUID`, `Enum8`, `Enum16`, `IPv4`, `IPv6`              | `StringType`                   | ✅             | Да          |                                                     |
| `FixedString`                                                     | `BinaryType`, `StringType`     | ✅             | Да          | Настраивается параметром конфигурации `READ_FIXED_STRING_AS`   |
| `Decimal`                                                         | `DecimalType`                  | ✅             | Да          | Точность и масштаб до `Decimal128`                 |
| `Decimal32`                                                       | `DecimalType(9, scale)`        | ✅             | Да          |                                                     |
| `Decimal64`                                                       | `DecimalType(18, scale)`       | ✅             | Да          |                                                     |
| `Decimal128`                                                      | `DecimalType(38, scale)`       | ✅             | Да          |                                                     |
| `Date`, `Date32`                                                  | `DateType`                     | ✅             | Да          |                                                     |
| `DateTime`, `DateTime32`, `DateTime64`                            | `TimestampType`                | ✅             | Да          |                                                     |
| `Array`                                                           | `ArrayType`                    | ✅             | Нет         | Тип элементов массива также преобразуется          |
| `Map`                                                             | `MapType`                      | ✅             | Нет         | Ключи ограничены типом `StringType`                |
| `IntervalYear`                                                    | `YearMonthIntervalType(Year)`  | ✅             | Да          |                                                     |
| `IntervalMonth`                                                   | `YearMonthIntervalType(Month)` | ✅             | Да          |                                                     |
| `IntervalDay`, `IntervalHour`, `IntervalMinute`, `IntervalSecond` | `DayTimeIntervalType`          | ✅             | Нет         | Используется конкретный тип интервала              |
| `JSON`, `Variant`                                                 | `VariantType`                  | ✅             | Нет         | Требуется Spark 4.0+ и ClickHouse 25.3+. Можно читать как `StringType` с `spark.clickhouse.read.jsonAs=string` |
| `Object`                                                          |                                | ❌             |             |                                                     |
| `Nested`                                                          |                                | ❌             |             |                                                     |
| `Tuple`                                                           | `StructType`                   | ✅             | Нет         | Поддерживаются как именованные, так и неименованные кортежи. Именованные кортежи отображаются на поля структуры (struct) по имени, неименованные используют `_1`, `_2` и т. д. Поддерживаются вложенные структуры и Nullable-поля |
| `Point`                                                           |                                | ❌             |             |                                                     |
| `Polygon`                                                         |                                | ❌             |             |                                                     |
| `MultiPolygon`                                                    |                                | ❌             |             |                                                     |
| `Ring`                                                            |                                | ❌             |             |                                                     |
| `IntervalQuarter`                                                 |                                | ❌             |             |                                                     |
| `IntervalWeek`                                                    |                                | ❌             |             |                                                     |
| `Decimal256`                                                      |                                | ❌             |             |                                                     |
| `AggregateFunction`                                               |                                | ❌             |             |                                                     |
| `SimpleAggregateFunction`                                         |                                | ❌             |             |                                                     |

### Вставка данных из Spark в ClickHouse \{#inserting-data-from-spark-into-clickhouse\}

| Тип данных Spark                    | Тип данных ClickHouse | Поддерживается | Примитивный тип | Примечания                             |
|-------------------------------------|------------------------|----------------|------------------|----------------------------------------|
| `BooleanType`                       | `Bool`                 | ✅              | Да               | Отображается в тип `Bool` (а не `UInt8`) начиная с версии 0.9.0 |
| `ByteType`                          | `Int8`                 | ✅              | Да               |                                        |
| `ShortType`                         | `Int16`                | ✅              | Да               |                                        |
| `IntegerType`                       | `Int32`                | ✅              | Да               |                                        |
| `LongType`                          | `Int64`                | ✅              | Да               |                                        |
| `FloatType`                         | `Float32`              | ✅              | Да               |                                        |
| `DoubleType`                        | `Float64`              | ✅              | Да               |                                        |
| `StringType`                        | `String`               | ✅              | Да               |                                        |
| `VarcharType`                       | `String`               | ✅              | Да               |                                        |
| `CharType`                          | `String`               | ✅              | Да               |                                        |
| `DecimalType`                       | `Decimal(p, s)`        | ✅              | Да               | Точность и масштаб вплоть до `Decimal128` |
| `DateType`                          | `Date`                 | ✅              | Да               |                                        |
| `TimestampType`                     | `DateTime`             | ✅              | Да               |                                        |
| `ArrayType` (list, tuple, or array) | `Array`                | ✅              | Нет              | Тип элемента массива также преобразуется |
| `MapType`                           | `Map`                  | ✅              | Нет              | Ключи ограничены типом `StringType`    |
| `StructType`                        | `Tuple`                | ✅              | Нет              | Преобразуется в именованный Tuple с именами полей. |
| `VariantType`                       | `JSON` or `Variant`    | ✅              | Нет              | Требуются Spark 4.0+ и ClickHouse 25.3+. По умолчанию используется тип `JSON`. Используйте свойство `clickhouse.column.<name>.variant_types`, чтобы задать `Variant` с несколькими типами. |
| `Object`                            |                        | ❌              |                  |                                        |
| `Nested`                            |                        | ❌              |                  |                                        |

## Участие и поддержка \{#contributing-and-support\}

Если вы хотите внести вклад в развитие проекта или сообщить о проблеме, мы будем рады вашей помощи!
Перейдите в наш [GitHub-репозиторий](https://github.com/ClickHouse/spark-clickhouse-connector), чтобы создать issue, предложить
улучшения или отправить pull request.
Мы приветствуем ваш вклад! Прежде чем начать, пожалуйста, ознакомьтесь с руководством по участию в репозитории.
Спасибо, что помогаете улучшать наш коннектор ClickHouse для Spark!