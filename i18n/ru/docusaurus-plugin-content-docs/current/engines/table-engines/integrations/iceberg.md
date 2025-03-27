---
description: 'Этот движок обеспечивает интеграцию только для чтения с существующими таблицами Apache Iceberg в Amazon S3, Azure, HDFS и локально хранимыми таблицами.'
sidebar_label: 'Iceberg'
sidebar_position: 90
slug: /engines/table-engines/integrations/iceberg
title: 'Движок таблиц Iceberg'
---


# Движок таблиц Iceberg {#iceberg-table-engine}

:::warning 
Мы рекомендуем использовать [Табличную функцию Iceberg](/sql-reference/table-functions/iceberg.md) для работы с данными Iceberg в ClickHouse. Табличная функция Iceberg в настоящее время предоставляет достаточную функциональность, предлагая частичный интерфейс только для чтения для таблиц Iceberg.

Движок таблиц Iceberg доступен, но может иметь ограничения. ClickHouse изначально не был разработан для поддержки таблиц с внешне изменяющимися схемами, что может повлиять на функциональность движка таблиц Iceberg. В результате некоторые функции, работающие с обычными таблицами, могут быть недоступны или могут работать некорректно, особенно при использовании старого анализатора.

Для оптимальной совместимости мы рекомендуем использовать табличную функцию Iceberg, пока мы продолжаем улучшать поддержку движка таблиц Iceberg.
:::

Этот движок обеспечивает интеграцию только для чтения с существующими таблицами Apache [Iceberg](https://iceberg.apache.org/) в Amazon S3, Azure, HDFS и локально хранимыми таблицами.

## Создание таблицы {#create-table}

Обратите внимание, что таблица Iceberg должна уже существовать в хранилище, эта команда не принимает параметры DDL для создания новой таблицы.

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

Параметры движка можно указывать с помощью [Именованных коллекций](../../../operations/named-collections.md)

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
В данный момент с помощью ClickHouse вы можете читать таблицы Iceberg, схема которых изменялась со временем. В настоящее время мы поддерживаем чтение таблиц, в которых были добавлены и удалены столбцы, а их порядок изменился. Вы также можете изменить столбец, для которого значение обязательно, на столбец, для которого разрешен NULL. Кроме того, мы поддерживаем допустимое приведение типов для простых типов, а именно:  
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S), где P' > P. 

В настоящее время невозможно изменить вложенные структуры или типы элементов внутри массивов и карт.

Чтобы прочитать таблицу, схема которой изменилась после ее создания с динамическим выводом схемы, установите allow_dynamic_metadata_for_data_lakes = true при создании таблицы.

## Обрезка разделов {#partition-pruning}

ClickHouse поддерживает обрезку разделов во время SELECT-запросов к таблицам Iceberg, что помогает оптимизировать производительность запросов путем пропуска неактуальных файлов данных. В настоящее время она работает только с трансформациями идентичности и временными трансформациями (час, день, месяц, год). Чтобы включить обрезку разделов, установите `use_iceberg_partition_pruning = 1`.


## Путешествие во времени {#time-travel}

ClickHouse поддерживает путешествие во времени для таблиц Iceberg, позволяя вам запрашивать исторические данные с конкретной меткой времени или ID снимка.

### Основное использование {#basic-usage}
 ```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_timestamp_ms = 1714636800000
 ```

 ```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_snapshot_id = 3547395809148285433
 ```

Примечание: Вы не можете указать оба параметра `iceberg_timestamp_ms` и `iceberg_snapshot_id` в одном запросе.

### Важные замечания {#important-considerations}

- **Снимки** обычно создаются, когда:
    - Новые данные записываются в таблицу
    - Выполняется какая-либо компактизация данных

- **Изменения схемы обычно не создают снимков** - Это приводит к важным особенностям при использовании путешествия во времени с таблицами, которые претерпели эволюцию схемы.

### Примеры сценариев {#example-scenarios}

Все сценарии написаны на Spark, потому что ClickHouse пока не поддерживает запись в таблицы Iceberg.

#### Сценарий 1: Изменения схемы без новых снимков {#scenario-1}

Рассмотрим эту последовательность операций:

 ```sql
 -- Создание таблицы с двумя столбцами
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example (
  order_number int, 
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

Результаты запросов в разные временные моменты:

- На ts1 и ts2: Появляются только оригинальные два столбца
- На ts3: Появляются все три столбца, при этом для первого ряда цена равна NULL

#### Сценарий 2: Различия в исторической и текущей схеме {#scenario-2}

Запрос на путешествие во времени в текущий момент может показать другую схему, чем текущая таблица:

```sql
-- Создание таблицы
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_2 (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- Вставка начальных данных в таблицу
  INSERT INTO spark_catalog.db.time_travel_example_2 VALUES (2, 'Venus');

-- Изменение таблицы для добавления нового столбца
  ALTER TABLE spark_catalog.db.time_travel_example_2 ADD COLUMN (price double);

  ts = now();

-- Запрос таблицы в текущий момент, но используя синтаксис временной метки

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

#### Сценарий 3: Историческое состояние таблицы {#scenario-3}

В третьем случае при путешествии во времени нельзя получить состояние таблицы до того, как в нее были записаны какие-либо данные:

```sql
-- Создание таблицы
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2');

  ts = now();

-- Запрос таблицы на конкретный момент времени
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- Заканчивается с ошибкой: Невозможно найти снимок старше ts.
```

В ClickHouse поведение аналогично Spark. Вы можете легко заменить запросы Select Spark запросами Select ClickHouse, и это будет работать так же.


## Кэш данных {#data-cache}

Движок таблиц `Iceberg` и табличная функция поддерживают кэширование данных, аналогично хранилищам `S3`, `AzureBlobStorage`, `HDFS`. См. [здесь](../../../engines/table-engines/integrations/s3.md#data-cache).

## См. также {#see-also}

- [табличная функция iceberg](/sql-reference/table-functions/iceberg.md)
