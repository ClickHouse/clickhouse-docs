---
description: 'Предоставляет интерфейс в виде таблицы только для чтения к таблицам Apache Iceberg в Amazon S3, Azure, HDFS или локально хранимым.'
sidebar_label: 'iceberg'
sidebar_position: 90
slug: /sql-reference/table-functions/iceberg
title: 'iceberg'
---


# Функция таблицы iceberg {#iceberg-table-function}

Предоставляет интерфейс в виде таблицы только для чтения к таблицам Apache [Iceberg](https://iceberg.apache.org/) в Amazon S3, Azure, HDFS или локально хранимым.

## Синтаксис {#syntax}

```sql
icebergS3(url [, NOSIGN | access_key_id, secret_access_key, [session_token]] [,format] [,compression_method])
icebergS3(named_collection[, option=value [,..]])

icebergAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzure(named_collection[, option=value [,..]])

icebergHDFS(path_to_table, [,format] [,compression_method])
icebergHDFS(named_collection[, option=value [,..]])

icebergLocal(path_to_table, [,format] [,compression_method])
icebergLocal(named_collection[, option=value [,..]])
```

## Аргументы {#arguments}

Описание аргументов совпадает с описанием аргументов в функциях таблиц `s3`, `azureBlobStorage`, `HDFS` и `file` соответственно. 
`format` обозначает формат файлов данных в таблице Iceberg.

### Возвращаемое значение {#returned-value}
Таблица с указанной структурой для чтения данных в указанной таблице Iceberg.

### Пример {#example}

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
На данный момент ClickHouse поддерживает чтение форматов v1 и v2 Iceberg через функции таблиц `icebergS3`, `icebergAzure`, `icebergHDFS` и `icebergLocal`, а также движки таблиц `IcebergS3`, `icebergAzure`, `IcebergHDFS` и `IcebergLocal`.
:::

## Определение именованной коллекции {#defining-a-named-collection}

Вот пример настройки именованной коллекции для хранения URL и учетных данных:

```xml
<clickhouse>
    <named_collections>
        <iceberg_conf>
            <url>http://test.s3.amazonaws.com/clickhouse-bucket/</url>
            <access_key_id>test<access_key_id>
            <secret_access_key>test</secret_access_key>
            <format>auto</format>
            <structure>auto</structure>
        </iceberg_conf>
    </named_collections>
</clickhouse>
```

```sql
SELECT * FROM icebergS3(iceberg_conf, filename = 'test_table')
DESCRIBE icebergS3(iceberg_conf, filename = 'test_table')
```

## Эволюция схемы {#schema-evolution}
На данный момент с помощью CH вы можете читать таблицы Iceberg, схема которых изменялась со временем. Мы поддерживаем чтение таблиц, в которых добавляли и удаляли столбцы, а также изменяли их порядок. Вы также можете изменить столбец, где значение обязательно, на столбец, где разрешено NULL. Кроме того, мы поддерживаем допустимое приведение типов для простых типов, а именно:
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S), где P' > P. 

В настоящее время невозможно изменить вложенные структуры или типы элементов в массивах и картах.

## Обрезка партиций {#partition-pruning}

ClickHouse поддерживает обрезку партиций во время запросов SELECT для таблиц Iceberg, что помогает оптимизировать производительность запросов, пропуская нерелевантные файлы данных. В данный момент это работает только с преобразованиями идентичности и временными преобразованиями (час, день, месяц, год). Чтобы включить обрезку партиций, установите `use_iceberg_partition_pruning = 1`.

## Временное перемещение {#time-travel}

ClickHouse поддерживает временное перемещение для таблиц Iceberg, что позволяет вам запрашивать исторические данные с определенной меткой времени или идентификатором снимка.

### Основное использование {#basic-usage}
 ```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_timestamp_ms = 1714636800000
 ```

 ```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_snapshot_id = 3547395809148285433
 ```

Примечание: Вы не можете указывать параметры `iceberg_timestamp_ms` и `iceberg_snapshot_id` в одном запросе.

### Важные соображения {#important-considerations}

- **Снимки** обычно создаются, когда:
    - Новые данные записываются в таблицу
    - Выполняется какая-либо компакция данных

- **Изменения схемы обычно не создают снимки** - Это приводит к важным последствиям при использовании временного перемещения с таблицами, которые прошли эволюцию схемы.

### Примеры сценариев {#example-scenarios}

Все сценарии написаны в Spark, потому что CH пока не поддерживает запись в таблицы Iceberg.

#### Сценарий 1: Изменения схемы без новых снимков {#scenario-1}

Рассмотрим эту последовательность операций:

 ```sql
 -- Создание таблицы с двумя столбцами
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- Вставка данных в таблицу
  INSERT INTO spark_catalog.db.time_travel_example VALUES 
    (1, 'Mars')

  ts1 = now() // Часть псевдокода

-- Изменение таблицы для добавления нового столбца
  ALTER TABLE spark_catalog.db.time_travel_example ADD COLUMN (price double)
 
  ts2 = now()

-- Вставка данных в таблицу
  INSERT INTO spark_catalog.db.time_travel_example VALUES (2, 'Venus', 100)

   ts3 = now()

-- Запрос таблицы на каждом временном штампе
  SELECT * FROM spark_catalog.db.time_travel_example TIMESTAMP AS OF ts1;

+------------+------------+
|order_number|product_code|
+------------+------------+
|           1|        Mars|
+------------+------------+


  SELECT * FROM spark_catalog.db.time_travel_example TIMESTAMP AS OF ts2;

+------------+------------+
|order_number|product_code|
+------------+------------+
|           1|        Mars|
+------------+------------+

  SELECT * FROM spark_catalog.db.time_travel_example TIMESTAMP AS OF ts3;

+------------+------------+-----+
|order_number|product_code|price|
+------------+------------+-----+
|           1|        Mars| NULL|
|           2|       Venus|100.0|
+------------+------------+-----+
```

Результаты запроса в различные временные штампы:

- На ts1 и ts2: Появляются только два оригинальных столбца
- На ts3: Появляются все три столбца, с NULL для цены первой строки

#### Сценарий 2: Исторические и текущие различия в схеме {#scenario-2}


Запрос временного перемещения в текущий момент может показать другую схему, чем текущая таблица:


```sql
-- Создание таблицы
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_2 (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- Вставка начальных данных в таблицу
  INSERT INTO spark_catalog.db.time_travel_example_2 VALUES (2, 'Venus');

-- Изменение таблицы для добавления нового столбца
  ALTER TABLE spark_catalog.db.time_travel_example_2 ADD COLUMN (price double);

  ts = now();

-- Запрос таблицы в текущий момент, но с использованием синтаксиса временной метки

  SELECT * FROM spark_catalog.db.time_travel_example_2 TIMESTAMP AS OF ts;

    +------------+------------+
    |order_number|product_code|
    +------------+------------+
    |           2|       Venus|
    +------------+------------+

-- Запрос таблицы в текущий момент
  SELECT * FROM spark_catalog.db.time_travel_example_2;


    +------------+------------+-----+
    |order_number|product_code|price|
    +------------+------------+-----+
    |           2|       Venus| NULL|
    +------------+------------+-----+
```

Это происходит потому, что `ALTER TABLE` не создает новый снимок, но для текущей таблицы Spark берет значение `schema_id` из последнего файла метаданных, а не из снимка.

#### Сценарий 3: Исторические и текущие различия в схеме {#scenario-3}

Второй момент заключается в том, что при выполнении временного перемещения вы не можете получить состояние таблицы до того, как в ней были записаны данные:

```sql
-- Создание таблицы
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2');

  ts = now();

-- Запрос таблицы на определенном временном штампе
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- Заканчив в ошибке: Не удается найти снимок старше ts.
```

В ClickHouse поведение соответствует Spark. Вы можете мысленно заменить запросы Select Spark на запросы Select Clickhouse, и все будет работать так же.

## Псевдонимы {#aliases}

Функция таблицы `iceberg` в настоящее время является псевдонимом для `icebergS3`.

## См. также {#see-also}

- [Движок Iceberg](/engines/table-engines/integrations/iceberg.md)
- [Функция таблицы кластерного iceberg](/sql-reference/table-functions/icebergCluster.md)
