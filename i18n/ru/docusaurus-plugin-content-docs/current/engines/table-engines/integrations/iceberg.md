---
description: 'Этот движок обеспечивает интеграцию только для чтения с существующими таблицами Apache Iceberg в Amazon S3, Azure, HDFS и локально хранимыми таблицами.'
sidebar_label: 'Iceberg'
sidebar_position: 90
slug: /engines/table-engines/integrations/iceberg
title: 'Движок таблиц Iceberg'
---


# Движок таблиц Iceberg {#iceberg-table-engine}

:::warning 
Рекомендуем использовать [табличную функцию Iceberg](/sql-reference/table-functions/iceberg.md) для работы с данными Iceberg в ClickHouse. Табличная функция Iceberg в настоящее время предоставляет достаточно функциональности, предлагая частичный интерфейс только для чтения для таблиц Iceberg.

Движок таблиц Iceberg доступен, но может иметь ограничения. ClickHouse изначально не был разработан для поддержки таблиц с внешне изменяющимися схемами, что может повлиять на функциональность движка таблиц Iceberg. В результате некоторые функции, которые работают с обычными таблицами, могут быть недоступны или могут не функционировать должным образом, особенно при использовании старого анализатора.

Для оптимальной совместимости мы рекомендуем использовать табличную функцию Iceberg, пока мы продолжаем улучшать поддержку движка таблиц Iceberg.
:::

Этот движок обеспечивает интеграцию только для чтения с существующими таблицами Apache [Iceberg](https://iceberg.apache.org/) в Amazon S3, Azure, HDFS и локально хранимыми таблицами.

## Создать таблицу {#create-table}

Обратите внимание, что таблица Iceberg должна уже существовать в хранилище, эта команда не принимает DDL параметры для создания новой таблицы.

```sql
CREATE TABLE iceberg_table_s3
    ENGINE = IcebergS3(url,  [, NOSIGN | access_key_id, secret_access_key, [session_token]], format, [,compression])

CREATE TABLE iceberg_table_azure
    ENGINE = IcebergAzure(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression])

CREATE TABLE iceberg_table_hdfs
    ENGINE = IcebergHDFS(path_to_table, [,format] [,compression_method])

CREATE TABLE iceberg_table_local
    ENGINE = IcebergLocal(path_to_table, [,format] [,compression_method])
```

## Аргументы движка {#engine-arguments}

Описание аргументов совпадает с описанием аргументов в движках `S3`, `AzureBlobStorage`, `HDFS` и `File` соответственно.
`format` обозначает формат файлов данных в таблице Iceberg.

Параметры движка могут быть указаны с использованием [именованных коллекций](../../../operations/named-collections.md).

### Пример {#example}

```sql
CREATE TABLE iceberg_table ENGINE=IcebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

Используя именованные коллекции:

```xml
<clickhouse>
    <named_collections>
        <iceberg_conf>
            <url>http://test.s3.amazonaws.com/clickhouse-bucket/</url>
            <access_key_id>test</access_key_id>
            <secret_access_key>test</secret_access_key>
        </iceberg_conf>
    </named_collections>
</clickhouse>
```

```sql
CREATE TABLE iceberg_table ENGINE=IcebergS3(iceberg_conf, filename = 'test_table')
```

## Псевдонимы {#aliases}

Движок таблиц `Iceberg` является псевдонимом для `IcebergS3` в настоящее время.

## Эволюция схемы {#schema-evolution}
На данный момент с помощью CH вы можете читать таблицы Iceberg, схема которых изменилась с течением времени. В настоящее время мы поддерживаем чтение таблиц, в которых были добавлены и удалены столбцы, и порядок которых изменился. Вы также можете изменить столбец, где значение требуется, на тот, где допускается NULL. Кроме того, мы поддерживаем разрешенное преобразование типов для простых типов, а именно:  
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S) где P' > P. 

В настоящее время невозможно изменить вложенные структуры или типы элементов внутри массивов и карт.

Чтобы прочитать таблицу, схема которой изменилась после ее создания с динамическим выводом схемы, установите allow_dynamic_metadata_for_data_lakes = true при создании таблицы.

## Обрезка партиций {#partition-pruning}

ClickHouse поддерживает обрезку партиций во время запросов SELECT для таблиц Iceberg, что помогает оптимизировать производительность запросов, пропуская нерелевантные файлы данных. В настоящее время это работает только с преобразованиями идентичности и временными преобразованиями (час, день, месяц, год). Чтобы включить обрезку партиций, установите `use_iceberg_partition_pruning = 1`.

## Путешествие во времени {#time-travel}

ClickHouse поддерживает путешествие во времени для таблиц Iceberg, позволяя вам запрашивать исторические данные с помощью конкретной временной метки или идентификатора снимка.

### Основное использование {#basic-usage}
 ```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_timestamp_ms = 1714636800000
 ```

 ```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_snapshot_id = 3547395809148285433
 ```

Примечание: Вы не можете указать как `iceberg_timestamp_ms`, так и `iceberg_snapshot_id` параметры в одном запросе.

### Важные соображения {#important-considerations}

- **Снимки** обычно создаются, когда:
    - Новые данные записываются в таблицу
    - Выполняется какая-либо агрегация данных

- **Изменения схемы обычно не создают снимков** - Это приводит к важным последствиям при использовании путешествия во времени с таблицами, которые подверглись эволюции схемы.

### Примеры сценариев {#example-scenarios}

Все сценарии написаны в Spark, потому что CH еще не поддерживает запись в таблицы Iceberg.

#### Сценарий 1: Изменения схемы без новых снимков {#scenario-1}

Рассмотрим эту последовательность операций:

 ```sql
 -- Создать таблицу с двумя столбцами
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- Вставить данные в таблицу
  INSERT INTO spark_catalog.db.time_travel_example VALUES 
    (1, 'Mars')

  ts1 = now() // Часть псевдокода

-- Изменить таблицу, чтобы добавить новый столбец
  ALTER TABLE spark_catalog.db.time_travel_example ADD COLUMN (price double)
 
  ts2 = now()

-- Вставить данные в таблицу
  INSERT INTO spark_catalog.db.time_travel_example VALUES (2, 'Venus', 100)

   ts3 = now()

-- Запрос таблицы на каждой временной метке
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

Результаты запроса в разные временные метки:

- На ts1 и ts2: Появляются только оригинальные два столбца
- На ts3: Появляются все три столбца, с NULL для цены первой строки

#### Сценарий 2:  Различия между исторической и текущей схемой {#scenario-2}


Запрос путешествия во времени в текущий момент может показать другую схему, чем текущая таблица:


```sql
-- Создать таблицу
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_2 (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- Вставить начальные данные в таблицу
  INSERT INTO spark_catalog.db.time_travel_example_2 VALUES (2, 'Venus');

-- Изменить таблицу, чтобы добавить новый столбец
  ALTER TABLE spark_catalog.db.time_travel_example_2 ADD COLUMN (price double);

  ts = now();

-- Запросить таблицу в текущий момент, но используя синтаксис временной метки

  SELECT * FROM spark_catalog.db.time_travel_example_2 TIMESTAMP AS OF ts;

    +------------+------------+
    |order_number|product_code|
    +------------+------------+
    |           2|       Venus|
    +------------+------------+

-- Запросить таблицу в текущий момент
  SELECT * FROM spark_catalog.db.time_travel_example_2;


    +------------+------------+-----+
    |order_number|product_code|price|
    +------------+------------+-----+
    |           2|       Venus| NULL|
    +------------+------------+-----+
```

Это происходит потому, что `ALTER TABLE` не создает новый снимок, но для текущей таблицы Spark берет значение `schema_id` из последнего файла метаданных, а не из снимка.

#### Сценарий 3:  Различия между исторической и текущей схемой {#scenario-3}

Второе заключается в том, что при выполнении путешествия во времени вы не можете получить состояние таблицы до того, как в нее были записаны данные:

```sql
-- Создать таблицу
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2');

  ts = now();

-- Запрос таблицы на конкретную временную метку
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- Завершается с ошибкой: Невозможно найти снимок старше ts.
```


В Clickhouse поведение соответствует Spark. Вы можете мысленно заменить запросы Select в Spark на запросы Select в Clickhouse, и это будет работать так же.


## Кэш данных {#data-cache}

Движок таблиц `Iceberg` и табличная функция поддерживают кэширование данных так же, как хранилища `S3`, `AzureBlobStorage`, `HDFS`. См. [здесь](../../../engines/table-engines/integrations/s3.md#data-cache).

## Смотрите также {#see-also}

- [табличная функция iceberg](/sql-reference/table-functions/iceberg.md)
