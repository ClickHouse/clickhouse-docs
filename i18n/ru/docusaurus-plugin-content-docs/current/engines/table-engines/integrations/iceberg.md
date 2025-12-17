---
description: 'Этот движок обеспечивает доступ только для чтения к существующим таблицам Apache Iceberg в Amazon S3, Azure, HDFS и локальном хранилище.'
sidebar_label: 'Iceberg'
sidebar_position: 90
slug: /engines/table-engines/integrations/iceberg
title: 'Движок таблиц Iceberg'
doc_type: 'reference'
---

# Движок таблицы Iceberg {#iceberg-table-engine}

:::warning 
Мы рекомендуем использовать [табличную функцию Iceberg](/sql-reference/table-functions/iceberg.md) для работы с данными Iceberg в ClickHouse. В настоящее время табличная функция Iceberg предоставляет достаточную функциональность, реализуя частичный интерфейс только для чтения к таблицам Iceberg.

Движок таблицы Iceberg доступен, но может иметь ограничения. Изначально ClickHouse не был спроектирован для поддержки таблиц со схемами, которые изменяются извне, что может влиять на работу движка таблицы Iceberg. В результате некоторые возможности, доступные для обычных таблиц, могут быть недоступны или работать некорректно, особенно при использовании старого анализатора запросов.

Для оптимальной совместимости мы рекомендуем использовать табличную функцию Iceberg, пока мы продолжаем улучшать поддержку движка таблицы Iceberg.
:::

Этот движок обеспечивает доступ только для чтения к существующим таблицам Apache [Iceberg](https://iceberg.apache.org/) в Amazon S3, Azure, HDFS, а также к локально хранимым таблицам.

## Создание таблицы {#create-table}

Обратите внимание, что таблица Iceberg должна уже существовать в хранилище: эта команда не принимает параметры DDL для создания новой таблицы.

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

## Параметры движка {#engine-arguments}

Описание аргументов соответствует описанию аргументов в движках `S3`, `AzureBlobStorage`, `HDFS` и `File` соответственно.
`format` обозначает формат файлов с данными в таблице Iceberg.

Параметры движка могут быть заданы с использованием [Named Collections](../../../operations/named-collections.md).

### Пример {#example}

```sql
CREATE TABLE iceberg_table ENGINE=IcebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

Использование именованных коллекций:

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

Движок таблицы `Iceberg` теперь является псевдонимом движка `IcebergS3`.

## Эволюция схемы {#schema-evolution}
В данный момент с помощью CH вы можете читать таблицы Iceberg, схема которых со временем изменялась. В настоящее время поддерживается чтение таблиц, в которых столбцы добавлялись и удалялись, а их порядок менялся. Вы также можете изменить столбец с обязательным значением на столбец, в котором допускается значение NULL. Дополнительно поддерживаются разрешённые преобразования типов для простых типов, а именно:  
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S), где P' > P. 

Сейчас невозможно изменять вложенные структуры или типы элементов внутри массивов и отображений.

Чтобы прочитать таблицу, схема которой изменилась после её создания, с использованием динамического вывода схемы, установите allow_dynamic_metadata_for_data_lakes = true при создании таблицы.

## Отсечение партиций {#partition-pruning}

ClickHouse поддерживает отсечение партиций в запросах SELECT к таблицам Iceberg, что помогает оптимизировать производительность запросов за счёт пропуска нерелевантных файлов данных. Чтобы включить отсечение партиций, установите `use_iceberg_partition_pruning = 1`. Дополнительную информацию об отсечении партиций в Iceberg см. в спецификации: https://iceberg.apache.org/spec/#partitioning

## Time travel {#time-travel}

В ClickHouse поддерживается механизм time travel для таблиц Iceberg, который позволяет выполнять запросы к историческим данным по заданной временной метке или идентификатору снимка (snapshot).

## Обработка таблиц с удалёнными строками {#deleted-rows}

В настоящее время поддерживаются только таблицы Iceberg с [позиционными удалениями (position deletes)](https://iceberg.apache.org/spec/#position-delete-files).

Следующие методы удаления **не поддерживаются**:

* [удаления по равенству (equality deletes)](https://iceberg.apache.org/spec/#equality-delete-files)
* [векторы удаления (deletion vectors)](https://iceberg.apache.org/spec/#deletion-vectors) (введены в версии 3)

### Базовое использование {#basic-usage}

```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_timestamp_ms = 1714636800000
 ```

```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_snapshot_id = 3547395809148285433
 ```

Примечание: Нельзя указывать параметры `iceberg_timestamp_ms` и `iceberg_snapshot_id` в одном запросе одновременно.

### Важные замечания {#important-considerations}

* **Снапшоты** обычно создаются, когда:
  * В таблицу записываются новые данные
  * Выполняется операция компакции данных

* **Изменения схемы, как правило, не создают снапшоты** — это приводит к важным особенностям поведения при использовании механизма time travel для таблиц, которые претерпели эволюцию схемы.

### Примеры сценариев {#example-scenarios}

Все сценарии приведены на Spark, потому что ClickHouse (CH) пока не поддерживает запись в таблицы Iceberg.

#### Сценарий 1: Изменения схемы без новых снапшотов {#scenario-1}

Рассмотрим следующую последовательность операций:

```sql
 -- Create a table with two columns
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- Insert data into the table
  INSERT INTO spark_catalog.db.time_travel_example VALUES 
    (1, 'Mars')

  ts1 = now() // A piece of pseudo code

-- Alter table to add a new column
  ALTER TABLE spark_catalog.db.time_travel_example ADD COLUMN (price double)
 
  ts2 = now()

-- Insert data into the table
  INSERT INTO spark_catalog.db.time_travel_example VALUES (2, 'Venus', 100)

   ts3 = now()

-- Query the table at each timestamp
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

Результаты запроса в разные моменты времени:

* В моменты ts1 и ts2: отображаются только исходные два столбца
* В момент ts3: отображаются все три столбца, при этом для первой строки значение price равно NULL

#### Сценарий 2: Отличия между исторической и текущей схемами {#scenario-2}

Запрос time travel, выполненный в текущий момент времени, может показать схему, отличающуюся от текущей схемы таблицы:

```sql
-- Create a table
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_2 (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- Insert initial data into the table
  INSERT INTO spark_catalog.db.time_travel_example_2 VALUES (2, 'Venus');

-- Alter table to add a new column
  ALTER TABLE spark_catalog.db.time_travel_example_2 ADD COLUMN (price double);

  ts = now();

-- Query the table at a current moment but using timestamp syntax

  SELECT * FROM spark_catalog.db.time_travel_example_2 TIMESTAMP AS OF ts;

    +------------+------------+
    |order_number|product_code|
    +------------+------------+
    |           2|       Venus|
    +------------+------------+

-- Query the table at a current moment
  SELECT * FROM spark_catalog.db.time_travel_example_2;
    +------------+------------+-----+
    |order_number|product_code|price|
    +------------+------------+-----+
    |           2|       Venus| NULL|
    +------------+------------+-----+
```

Это происходит потому, что `ALTER TABLE` не создает новый снимок, а для текущей таблицы Spark берет значение `schema_id` из последнего файла метаданных, а не из снимка.

#### Сценарий 3: Отличия между исторической и текущей схемами {#scenario-3}

Второй момент заключается в том, что при выполнении операции time travel вы не можете получить состояние таблицы до того, как в неё были записаны какие-либо данные:

```sql
-- Create a table
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2');

  ts = now();

-- Query the table at a specific timestamp
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- Finises with error: Cannot find a snapshot older than ts.
```

В ClickHouse поведение аналогично Spark. Вы можете мысленно заменить запросы Select в Spark на запросы Select в ClickHouse — и всё будет работать так же.

## Определение файла метаданных {#metadata-file-resolution}

При использовании движка таблиц `Iceberg` в ClickHouse системе необходимо найти корректный файл metadata.json, который описывает структуру таблицы Iceberg. Ниже описано, как работает этот процесс определения:

### Поиск кандидатов {#candidate-search}

1. **Явное указание пути**:

* Если вы задаёте `iceberg_metadata_file_path`, система будет использовать именно этот путь, комбинируя его с путём к директории таблицы Iceberg.
* При наличии этого параметра все остальные параметры определения игнорируются.

2. **Сопоставление UUID таблицы**:

* Если указан `iceberg_metadata_table_uuid`, система будет:
  * Рассматривать только файлы `.metadata.json` в директории `metadata`
  * Отфильтровывать файлы, содержащие поле `table-uuid`, совпадающее с указанным UUID (без учёта регистра)

3. **Поиск по умолчанию**:

* Если ни один из вышеперечисленных параметров не задан, все файлы `.metadata.json` в директории `metadata` рассматриваются как кандидаты

### Выбор самого нового файла {#most-recent-file}

После определения файлов-кандидатов по указанным правилам система решает, какой из них является самым новым:

* Если включён `iceberg_recent_metadata_file_by_last_updated_ms_field`:
  * Выбирается файл с максимальным значением поля `last-updated-ms`

* В противном случае:
  * Выбирается файл с наибольшим номером версии
  * (Версия представлена как `V` в именах файлов формата `V.metadata.json` или `V-uuid.metadata.json`)

**Примечание**: Все упомянутые параметры являются настройками на уровне движка и должны указываться при создании таблицы, как показано ниже:

```sql 
CREATE TABLE example_table ENGINE = Iceberg(
    's3://bucket/path/to/iceberg_table'
) SETTINGS iceberg_metadata_table_uuid = '6f6f6407-c6a5-465f-a808-ea8900e35a38';
```

**Примечание**: Хотя каталоги Iceberg обычно отвечают за разрешение метаданных, табличный движок `Iceberg` в ClickHouse напрямую интерпретирует файлы, хранящиеся в S3, как таблицы Iceberg, поэтому важно понимать правила их разрешения.

## Кэш данных {#data-cache}

Табличный движок `Iceberg` и одноимённая табличная функция поддерживают кэширование данных так же, как и хранилища `S3`, `AzureBlobStorage`, `HDFS`. См. [здесь](../../../engines/table-engines/integrations/s3.md#data-cache).

## Кэш метаданных {#metadata-cache}

Движок таблиц и табличная функция `Iceberg` поддерживают кэш метаданных, в котором хранится информация о manifest-файлах, списке manifest и JSON-файле метаданных. Кэш хранится в памяти. Эта функция управляется настройкой `use_iceberg_metadata_files_cache`, которая по умолчанию включена.

## См. также {#see-also}

- [табличная функция iceberg](/sql-reference/table-functions/iceberg.md)
