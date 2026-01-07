---
description: 'Предоставляет табличный интерфейс в режиме только для чтения к таблицам Apache Iceberg, размещённым в Amazon S3, Azure, HDFS или локально.'
sidebar_label: 'iceberg'
sidebar_position: 90
slug: /sql-reference/table-functions/iceberg
title: 'iceberg'
doc_type: 'reference'
---

# Табличная функция iceberg {#iceberg-table-function}

Предоставляет табличный интерфейс только для чтения к таблицам Apache [Iceberg](https://iceberg.apache.org/), размещённым в Amazon S3, Azure, HDFS или в локальном хранилище.

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

Описание аргументов совпадает с описанием аргументов табличных функций `s3`, `azureBlobStorage`, `HDFS` и `file` соответственно.
`format` обозначает формат файлов с данными в таблице Iceberg.

### Возвращаемое значение {#returned-value}

Таблица с указанной структурой для чтения данных из указанной таблицы Iceberg.

### Пример {#example}

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
На данный момент ClickHouse поддерживает чтение версий v1 и v2 формата Iceberg с помощью табличных функций `icebergS3`, `icebergAzure`, `icebergHDFS` и `icebergLocal`, а также табличных движков `IcebergS3`, `icebergAzure`, `IcebergHDFS` и `IcebergLocal`.
:::

## Определение именованной коллекции {#defining-a-named-collection}

Ниже приведён пример настройки именованной коллекции для хранения URL-адреса и учётных данных:

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

## Использование каталога данных {#iceberg-writes-catalogs}

Таблицы Iceberg также можно использовать с различными каталогами данных, такими как [REST Catalog](https://iceberg.apache.org/rest-catalog-spec/), [AWS Glue Data Catalog](https://docs.aws.amazon.com/prescriptive-guidance/latest/serverless-etl-aws-glue/aws-glue-data-catalog.html) и [Unity Catalog](https://www.unitycatalog.io/).

:::important
При использовании каталога большинству пользователей следует использовать движок базы данных `DataLakeCatalog`, который подключает ClickHouse к вашему каталогу для обнаружения ваших таблиц. Вы можете использовать этот движок базы данных вместо ручного создания отдельных таблиц с движком таблиц `IcebergS3`.
:::

Чтобы использовать такие каталоги, создайте таблицу с движком `IcebergS3` и укажите необходимые настройки.

Например, использование REST Catalog с хранилищем MinIO:

```sql
CREATE TABLE `database_name.table_name`
ENGINE = IcebergS3(
  'http://minio:9000/warehouse-rest/table_name/',
  'minio_access_key',
  'minio_secret_key'
)
SETTINGS 
  storage_catalog_type="rest",
  storage_warehouse="demo",
  object_storage_endpoint="http://minio:9000/warehouse-rest",
  storage_region="us-east-1",
  storage_catalog_url="http://rest:8181/v1"
```

Либо с использованием AWS Glue Data Catalog и S3:

```sql
CREATE TABLE `my_database.my_table`  
ENGINE = IcebergS3(
  's3://my-data-bucket/warehouse/my_database/my_table/',
  'aws_access_key',
  'aws_secret_key'
)
SETTINGS 
  storage_catalog_type = 'glue',
  storage_warehouse = 'my_database',
  object_storage_endpoint = 's3://my-data-bucket/',
  storage_region = 'us-east-1',
  storage_catalog_url = 'https://glue.us-east-1.amazonaws.com/iceberg/v1'
```

## Эволюция схемы {#schema-evolution}

На данный момент в ClickHouse можно читать таблицы Iceberg, схема которых со временем изменялась. Поддерживается чтение таблиц, в которых были добавлены и удалены столбцы, а также изменён их порядок. Можно также изменить столбец с обязательным значением на столбец, где допускается значение NULL. Кроме того, поддерживается допустимое приведение простых типов, а именно:  

* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S), где P' > P.

Пока невозможно изменять вложенные структуры или типы элементов внутри массивов и map.

## Отсечение партиций {#partition-pruning}

ClickHouse поддерживает отсечение партиций при выполнении запросов SELECT к таблицам Iceberg, что помогает оптимизировать производительность запросов за счёт пропуска не относящихся к делу файлов данных. Чтобы включить отсечение партиций, установите `use_iceberg_partition_pruning = 1`. Для получения дополнительной информации об отсечении партиций в Iceberg см. https://iceberg.apache.org/spec/#partitioning

## Time Travel {#time-travel}

ClickHouse поддерживает механизм time travel для таблиц Iceberg, позволяющий выполнять запросы к историческим данным по заданной метке времени или идентификатору снимка.

## Обработка таблиц с удалёнными строками {#deleted-rows}

В настоящее время поддерживаются только таблицы Iceberg, использующие [position deletes](https://iceberg.apache.org/spec/#position-delete-files). 

Следующие методы удаления **не поддерживаются**:

- [Equality deletes](https://iceberg.apache.org/spec/#equality-delete-files)
- [Deletion vectors](https://iceberg.apache.org/spec/#deletion-vectors) (появились в версии 3)

### Основы использования {#basic-usage}

```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_timestamp_ms = 1714636800000
 ```

```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_snapshot_id = 3547395809148285433
 ```

Примечание: Нельзя указывать параметры `iceberg_timestamp_ms` и `iceberg_snapshot_id` одновременно в одном запросе.

### Важные замечания {#important-considerations}

* **Снимки (snapshots)** обычно создаются, когда:
* В таблицу записываются новые данные
* Выполняется операция компактации (compaction) данных

* **Изменения схемы обычно не создают снимки** — это приводит к важным особенностям поведения при использовании time travel для таблиц, схему которых со временем изменяли.

### Примеры сценариев {#example-scenarios}

Во всех сценариях используется Spark, так как ClickHouse пока не поддерживает запись в таблицы Iceberg.

#### Сценарий 1: изменение схемы без создания новых снимков {#scenario-1}

Рассмотрим следующую последовательность операций:

```sql
 -- Create a table with two columns
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

- - Insert data into the table
  INSERT INTO spark_catalog.db.time_travel_example VALUES 
    (1, 'Mars')

  ts1 = now() // A piece of pseudo code

- - Alter table to add a new column
  ALTER TABLE spark_catalog.db.time_travel_example ADD COLUMN (price double)
 
  ts2 = now()

- - Insert data into the table
  INSERT INTO spark_catalog.db.time_travel_example VALUES (2, 'Venus', 100)

   ts3 = now()

- - Query the table at each timestamp
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

* На ts1 и ts2: отображаются только исходные два столбца
* На ts3: отображаются все три столбца; для цены первой строки указано значение NULL

#### Сценарий 2: различия между исторической и текущей схемой {#scenario-2}

Запрос time travel, выполненный в текущий момент времени, может показать схему, отличающуюся от текущей схемы таблицы:

```sql
-- Create a table
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_2 (
  order_number bigint, 
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

Это происходит потому, что `ALTER TABLE` не создаёт новый snapshot, а при работе с текущей таблицей Spark берёт значение `schema_id` из последнего файла метаданных, а не из snapshot.

#### Сценарий 3: различия между исторической и текущей схемой {#scenario-3}

Второе ограничение состоит в том, что при использовании механизма time travel нельзя получить состояние таблицы до того, как в неё были записаны какие‑либо данные:

```sql
-- Create a table
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2');

  ts = now();

-- Query the table at a specific timestamp
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- Finises with error: Cannot find a snapshot older than ts.
```

В ClickHouse поведение такое же, как в Spark. Вы можете мысленно заменить запросы SELECT в Spark на запросы SELECT в ClickHouse — и всё будет работать так же.

## Определение файла метаданных {#metadata-file-resolution}

При использовании табличной функции `iceberg` в ClickHouse системе необходимо найти нужный файл metadata.json, который описывает структуру таблицы Iceberg. Ниже описано, как работает процесс его определения:

### Поиск кандидатов (в порядке приоритета) {#candidate-search}

1. **Явное указание пути**:
*Если вы задаёте `iceberg_metadata_file_path`, система будет использовать именно этот путь, добавляя его к пути каталога таблицы Iceberg.

* При наличии этого параметра все остальные параметры разрешения пути игнорируются.

2. **Сопоставление UUID таблицы**:
*Если указан `iceberg_metadata_table_uuid`, система будет:
    *Смотреть только файлы `.metadata.json` в каталоге `metadata`
    *Отбирать файлы, содержащие поле `table-uuid` со значением, совпадающим с указанным UUID (без учёта регистра)

3. **Поиск по умолчанию**:
*Если ни один из вышеперечисленных параметров не задан, все файлы `.metadata.json` в каталоге `metadata` рассматриваются как кандидаты

### Выбор самого нового файла {#most-recent-file}

После определения кандидатов на основе приведённых выше правил система выбирает, какой файл является самым новым:

* Если `iceberg_recent_metadata_file_by_last_updated_ms_field` включён:

* Выбирается файл с наибольшим значением `last-updated-ms`

* В противном случае:

* Выбирается файл с наибольшим номером версии

* (Версия обозначается как `V` в именах файлов формата `V.metadata.json` или `V-uuid.metadata.json`)

**Примечание**: Все упомянутые настройки являются настройками табличной функции (а не глобальными или на уровне запроса) и должны указываться как показано ниже:

```sql
SELECT * FROM iceberg('s3://bucket/path/to/iceberg_table', 
    SETTINGS iceberg_metadata_table_uuid = 'a90eed4c-f74b-4e5b-b630-096fb9d09021');
```

**Примечание**: Хотя каталоги Iceberg обычно отвечают за разрешение метаданных, табличная функция `iceberg` в ClickHouse напрямую интерпретирует файлы, хранящиеся в S3, как таблицы Iceberg, поэтому важно понимать эти правила разрешения метаданных.

## Metadata cache {#metadata-cache}

Движок таблиц `Iceberg` и табличная функция `Iceberg` поддерживают кэш метаданных, в котором хранится информация о файлах manifest, списках manifest и JSON-файлах с метаданными. Кэш хранится в памяти. Этот функционал управляется настройкой `use_iceberg_metadata_files_cache`, которая по умолчанию включена.

## Псевдонимы {#aliases}

Табличная функция `iceberg` теперь является псевдонимом для `icebergS3`.

## Виртуальные столбцы {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер файла неизвестен, значение — `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение — `NULL`.
- `_etag` — ETag файла. Тип: `LowCardinality(String)`. Если ETag неизвестен, значение — `NULL`.

## Запись в таблицы Iceberg {#writes-into-iceberg-table}

Начиная с версии 25.7, ClickHouse поддерживает модификацию пользовательских таблиц Iceberg.

В настоящее время это экспериментальная функция, поэтому сначала её нужно включить:

```sql
SET allow_experimental_insert_into_iceberg = 1;
```

### Создание таблицы {#create-iceberg-table}

Чтобы создать собственную пустую таблицу Iceberg, используйте те же команды, что и для чтения, но явно укажите схему.
Операции записи поддерживают все форматы данных из спецификации Iceberg, такие как Parquet, Avro и ORC.

### Пример {#example-iceberg-writes-create}

```sql
CREATE TABLE iceberg_writes_example
(
    x Nullable(String),
    y Nullable(Int32)
)
ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/')
```

Примечание: чтобы создать файл подсказки версии, включите настройку `iceberg_use_version_hint`.
Если нужно сжать файл metadata.json, укажите имя кодека в настройке `iceberg_metadata_compression_method`.

### INSERT {#writes-inserts}

После создания новой таблицы вы можете добавить данные, используя стандартный синтаксис ClickHouse.

### Пример {#example-iceberg-writes-insert}

```sql
INSERT INTO iceberg_writes_example VALUES ('Pavel', 777), ('Ivanov', 993);

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Pavel
y: 777

Row 2:
──────
x: Ivanov
y: 993
```

### DELETE {#iceberg-writes-delete}

Удаление избыточных строк в формате merge-on-read также поддерживается в ClickHouse.
Этот запрос создаст новый снимок (snapshot) с файлами position delete.

ПРИМЕЧАНИЕ: Если вы хотите в дальнейшем читать свои таблицы с использованием других движков Iceberg (таких как Spark), необходимо отключить настройки `output_format_parquet_use_custom_encoder` и `output_format_parquet_parallel_encoding`.
Это связано с тем, что Spark читает эти файлы по идентификаторам полей Parquet (field-id), в то время как ClickHouse в настоящее время не поддерживает запись этих идентификаторов при включённых флагах.
Мы планируем исправить это поведение в будущем.

### Пример {#example-iceberg-writes-delete}

```sql
ALTER TABLE iceberg_writes_example DELETE WHERE x != 'Ivanov';

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Ivanov
y: 993
```

### Эволюция схемы {#iceberg-writes-schema-evolution}

ClickHouse позволяет добавлять, удалять или изменять столбцы с простыми типами данных (не типа `Tuple`, `Array` или `Map`).

### Пример {#example-iceberg-writes-evolution}

```sql
ALTER TABLE iceberg_writes_example MODIFY COLUMN y Nullable(Int64);
SHOW CREATE TABLE iceberg_writes_example;

   ┌─statement─────────────────────────────────────────────────┐
1. │ CREATE TABLE default.iceberg_writes_example              ↴│
   │↳(                                                        ↴│
   │↳    `x` Nullable(String),                                ↴│
   │↳    `y` Nullable(Int64)                                  ↴│
   │↳)                                                        ↴│
   │↳ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/') │
   └───────────────────────────────────────────────────────────┘

ALTER TABLE iceberg_writes_example ADD COLUMN z Nullable(Int32);
SHOW CREATE TABLE iceberg_writes_example;

   ┌─statement─────────────────────────────────────────────────┐
1. │ CREATE TABLE default.iceberg_writes_example              ↴│
   │↳(                                                        ↴│
   │↳    `x` Nullable(String),                                ↴│
   │↳    `y` Nullable(Int64),                                 ↴│
   │↳    `z` Nullable(Int32)                                  ↴│
   │↳)                                                        ↴│
   │↳ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/') │
   └───────────────────────────────────────────────────────────┘

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Ivanov
y: 993
z: ᴺᵁᴸᴸ

ALTER TABLE iceberg_writes_example DROP COLUMN z;
SHOW CREATE TABLE iceberg_writes_example;
   ┌─statement─────────────────────────────────────────────────┐
1. │ CREATE TABLE default.iceberg_writes_example              ↴│
   │↳(                                                        ↴│
   │↳    `x` Nullable(String),                                ↴│
   │↳    `y` Nullable(Int64)                                  ↴│
   │↳)                                                        ↴│
   │↳ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/') │
   └───────────────────────────────────────────────────────────┘

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Ivanov
y: 993
```

### Компакция {#iceberg-writes-compaction}

ClickHouse поддерживает компактацию таблиц Iceberg. В данный момент он может объединять файлы position delete с файлами данных с одновременным обновлением метаданных. Идентификаторы и метки времени предыдущих snapshot остаются без изменений, поэтому возможность time-travel по-прежнему доступна с теми же значениями.

Как использовать:

```sql
SET allow_experimental_iceberg_compaction = 1

OPTIMIZE TABLE iceberg_writes_example;

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Ivanov
y: 993
```

## См. также {#see-also}

* [Движок Iceberg](/engines/table-engines/integrations/iceberg.md)
* [Табличная функция icebergCluster](/sql-reference/table-functions/icebergCluster.md)