---
description: 'Предоставляет табличный интерфейс в режиме только для чтения к таблицам Apache Iceberg, размещённым в Amazon S3, Azure, HDFS или локально.'
sidebar_label: 'iceberg'
sidebar_position: 90
slug: /sql-reference/table-functions/iceberg
title: 'iceberg'
doc_type: 'reference'
---

# Табличная функция iceberg \{#iceberg-table-function\}

Предоставляет табличный интерфейс только для чтения к таблицам Apache [Iceberg](https://iceberg.apache.org/), размещённым в Amazon S3, Azure, HDFS или в локальном хранилище.

## Синтаксис \{#syntax\}

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

## Аргументы \{#arguments\}

Описание аргументов аналогично описанию аргументов в табличных функциях `s3`, `azureBlobStorage`, `HDFS` и `file` соответственно.
`format` обозначает формат файлов с данными в таблице Iceberg.

### Возвращаемое значение \{#returned-value\}

Таблица с указанной структурой для чтения данных из указанной таблицы Iceberg.

### Пример \{#example\}

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
На данный момент ClickHouse поддерживает чтение версий v1 и v2 формата Iceberg с помощью табличных функций `icebergS3`, `icebergAzure`, `icebergHDFS` и `icebergLocal`, а также табличных движков `IcebergS3`, `icebergAzure`, `IcebergHDFS` и `IcebergLocal`.
:::

## Определение именованной коллекции \{#defining-a-named-collection\}

Ниже приведён пример конфигурации именованной коллекции для хранения URL и учётных данных:

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


## Использование каталога данных \{#iceberg-writes-catalogs\}

Таблицы Iceberg также могут использоваться с различными каталогами данных, такими как [REST Catalog](https://iceberg.apache.org/rest-catalog-spec/), [AWS Glue Data Catalog](https://docs.aws.amazon.com/prescriptive-guidance/latest/serverless-etl-aws-glue/aws-glue-data-catalog.html) и [Unity Catalog](https://www.unitycatalog.io/).

:::important
При использовании каталога большинству пользователей рекомендуется использовать движок базы данных `DataLakeCatalog`, который подключает ClickHouse к вашему каталогу для обнаружения ваших таблиц. Вы можете использовать этот движок базы данных вместо ручного создания отдельных таблиц с помощью движка таблицы `IcebergS3`.
:::

Чтобы использовать каталог, создайте таблицу с движком `IcebergS3` и укажите необходимые настройки.

Например, использование REST Catalog с хранилиищем MinIO:

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

Либо при использовании AWS Glue Data Catalog вместе с S3:

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


## Эволюция схемы \{#schema-evolution\}

В настоящее время с помощью CH вы можете читать таблицы Iceberg, схема которых со временем изменялась. Поддерживается чтение таблиц, в которых столбцы добавлялись и удалялись, а также изменялся их порядок. Вы также можете изменить столбец с обязательным значением на столбец, в котором допускается значение NULL. Дополнительно поддерживается допустимое приведение типов для простых типов, а именно:  

* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S), где P' > P.

Пока невозможно изменять вложенные структуры или типы элементов внутри массивов и отображений.

## Отсечение партиций \{#partition-pruning\}

ClickHouse поддерживает отсечение партиций при выполнении запросов SELECT к таблицам Iceberg, что помогает оптимизировать производительность запросов за счёт пропуска не относящихся к делу файлов данных. Чтобы включить отсечение партиций, установите `use_iceberg_partition_pruning = 1`. Для получения дополнительной информации об отсечении партиций в Iceberg см. https://iceberg.apache.org/spec/#partitioning

## Time Travel \{#time-travel\}

ClickHouse поддерживает механизм time travel для таблиц Iceberg, позволяющий выполнять запросы к историческим данным по заданной метке времени или идентификатору снимка.

## Обработка таблиц с удалёнными строками \{#deleted-rows\}

В настоящее время поддерживаются только таблицы Iceberg, использующие [position deletes](https://iceberg.apache.org/spec/#position-delete-files). 

Следующие методы удаления **не поддерживаются**:

- [Equality deletes](https://iceberg.apache.org/spec/#equality-delete-files)
- [Deletion vectors](https://iceberg.apache.org/spec/#deletion-vectors) (появились в версии 3)

### Основы использования \{#basic-usage\}

```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_timestamp_ms = 1714636800000
 ```

```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_snapshot_id = 3547395809148285433
 ```

Примечание: Нельзя указывать параметры `iceberg_timestamp_ms` и `iceberg_snapshot_id` одновременно в одном запросе.

### Важные замечания \{#important-considerations\}

* **Снимки** обычно создаются в следующих случаях:
* В таблицу записываются новые данные
* Выполняется какой-либо вид компактации данных

* **Изменения схемы обычно не создают снимков** — это приводит к важным особенностям поведения при использовании time travel для таблиц, схема которых со временем изменялась.

### Примеры сценариев \{#example-scenarios\}

Во всех сценариях используется Spark, так как ClickHouse пока не поддерживает запись в таблицы Iceberg.

#### Сценарий 1: изменение схемы без создания новых снимков \{#scenario-1\}

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

#### Сценарий 2: отличия исторической и текущей схем \{#scenario-2\}

Запрос с использованием «перемещения во времени», выполненный в текущий момент, может показывать схему, отличающуюся от актуальной схемы таблицы:

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

Это происходит потому, что `ALTER TABLE` не создает новый снимок, а для текущей таблицы Spark берет значение `schema_id` из последнего файла метаданных, а не из снимка.


#### Сценарий 3: различия между исторической и текущей схемами \{#scenario-3\}

Второй случай заключается в том, что при использовании механизма time travel вы не можете получить состояние таблицы до того, как в неё были записаны какие-либо данные:

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

В ClickHouse поведение такое же, как в Spark. Можно мысленно заменить запросы SELECT в Spark на запросы SELECT в ClickHouse — всё будет работать так же.


## Определение файла метаданных \{#metadata-file-resolution\}

При использовании табличной функции `iceberg` в ClickHouse системе необходимо найти соответствующий файл metadata.json, который описывает структуру таблицы Iceberg. Ниже описано, как работает этот процесс определения:

### Поиск кандидатов (в порядке приоритета) \{#candidate-search\}

1. **Явное указание пути**:
*Если вы задаёте `iceberg_metadata_file_path`, система будет использовать именно этот путь, добавляя его к пути каталога таблицы Iceberg.

* При наличии этого параметра все остальные параметры разрешения пути игнорируются.

2. **Сопоставление UUID таблицы**:
*Если указан `iceberg_metadata_table_uuid`, система будет:
    *Смотреть только файлы `.metadata.json` в каталоге `metadata`
    *Отбирать файлы, содержащие поле `table-uuid` со значением, совпадающим с указанным UUID (без учёта регистра)

3. **Поиск по умолчанию**:
*Если ни один из вышеперечисленных параметров не задан, все файлы `.metadata.json` в каталоге `metadata` рассматриваются как кандидаты

### Выбор самого нового файла \{#most-recent-file\}

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

## Кэш метаданных \{#metadata-cache\}

Движок таблиц `Iceberg` и табличная функция поддерживают кэш метаданных, в котором хранится информация о файлах манифестов, списках манифестов и JSON-файлах метаданных. Кэш хранится в памяти. Эта функция управляется настройкой `use_iceberg_metadata_files_cache`, которая по умолчанию включена.

## Псевдонимы \{#aliases\}

Табличная функция `iceberg` теперь является псевдонимом для `icebergS3`.

## Виртуальные столбцы \{#virtual-columns\}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер файла неизвестен, значение — `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение — `NULL`.
- `_etag` — ETag файла. Тип: `LowCardinality(String)`. Если ETag неизвестен, значение — `NULL`.

## Запись в таблицы Iceberg \{#writes-into-iceberg-table\}

Начиная с версии 25.7, ClickHouse поддерживает модификацию пользовательских таблиц Iceberg.

В настоящее время это экспериментальная функция, поэтому сначала её нужно включить:

```sql
SET allow_insert_into_iceberg = 1;
```


### Создание таблицы \{#create-iceberg-table\}

Чтобы создать собственную пустую таблицу Iceberg, используйте те же команды, что и для чтения, но явно укажите схему.
Операция записи поддерживает все форматы данных из спецификации Iceberg, такие как Parquet, Avro, ORC.

### Пример \{#example-iceberg-writes-create\}

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

### INSERT \{#writes-inserts\}

После создания новой таблицы вы можете вставлять данные, используя стандартный синтаксис ClickHouse.

### Пример \{#example-iceberg-writes-insert\}

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

### DELETE \{#iceberg-writes-delete\}

Удаление избыточных строк в формате merge-on-read также поддерживается в ClickHouse.
Этот запрос создаст новый снимок с файлами позиционного удаления (position delete).

ПРИМЕЧАНИЕ: Если вы в дальнейшем хотите читать свои таблицы с помощью других движков Iceberg (таких как Spark), вам нужно отключить настройки `output_format_parquet_use_custom_encoder` и `output_format_parquet_parallel_encoding`.
Это связано с тем, что Spark читает эти файлы по идентификаторам полей parquet (field-ids), в то время как ClickHouse в данный момент не поддерживает запись field-ids при включённых этих флагах.
Мы планируем исправить это поведение в будущем.

### Пример \{#example-iceberg-writes-delete\}

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

### Эволюция схемы \{#iceberg-writes-schema-evolution\}

ClickHouse позволяет добавлять, удалять, изменять или переименовывать столбцы с простыми типами данных (не `tuple`, не `array`, не `map`).

### Пример \{#example-iceberg-writes-evolution\}

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

ALTER TABLE iceberg_writes_example RENAME COLUMN y TO value;
SHOW CREATE TABLE iceberg_writes_example;

   ┌─statement─────────────────────────────────────────────────┐
1. │ CREATE TABLE default.iceberg_writes_example              ↴│
   │↳(                                                        ↴│
   │↳    `x` Nullable(String),                                ↴│
   │↳    `value` Nullable(Int64)                              ↴│
   │↳)                                                        ↴│
   │↳ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/') │
   └───────────────────────────────────────────────────────────┘

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Row 1:
──────
x: Ivanov
value: 993
```


### Компакция \{#iceberg-writes-compaction\}

ClickHouse поддерживает компакцию таблиц Iceberg. В настоящее время он может объединять файлы позиционных удалений (position delete files) с файлами данных с одновременным обновлением метаданных. Идентификаторы и метки времени предыдущих снимков (snapshot IDs and timestamps) остаются неизменными, поэтому функция time-travel по‑прежнему может использоваться с теми же значениями.

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


### Удаление устаревших снимков \{#iceberg-expire-snapshots\}

Таблицы Iceberg накапливают снимки с каждой операцией INSERT, DELETE или UPDATE. Со временем это может привести к большому количеству снимков и связанных с ними файлов данных. Команда `expire_snapshots` удаляет старые снимки и очищает файлы данных, на которые больше не ссылается ни один сохранённый снимок.

**Синтаксис:**

```sql
ALTER TABLE iceberg_table EXECUTE expire_snapshots(
    ['timestamp']
    [, expire_before = 'timestamp']
    [, retention_period = '3d']
    [, retain_last = 100]
    [, snapshot_ids = [1, 2, 3, 4]]
    [, dry_run = 1]
);
```

По умолчанию набор сохраняемых снимков определяется [политикой хранения](#iceberg-snapshot-retention-policy) (свойствами таблицы `min-snapshots-to-keep`, `max-snapshot-age-ms` и переопределениями для отдельных ссылок). Если указан `snapshot_ids`, политика хранения не применяется, и на удаление рассматриваются только перечисленные снимки.

**Аргументы:**

* `'timestamp'` (позиционный) или `expire_before = 'timestamp'` — строка даты и времени (например, `'2024-06-01 00:00:00'`), интерпретируемая в **часовом поясе сервера**. Работает как предохранитель: снимки, у которых `timestamp-ms` равен этому значению или больше него, защищены от удаления, даже если по политике хранения они иначе подлежали бы удалению. Можно использовать вместе с `snapshot_ids`; в этом случае перечисленные снимки с меткой времени, равной указанной или более поздней, не удаляются.
* `retention_period = '<duration>'` — переопределяет `history.expire.max-snapshot-age-ms` на уровне таблицы только для этого вызова. Снимки старше этого периода (отсчитываемого от текущего момента) становятся кандидатами на удаление. Значение представляет собой строку длительности, состоящую из одной или нескольких подряд записанных пар `{number}{unit}`. Поддерживаемые единицы: `y` (365 дней), `w` (7 дней), `d` (24 часа), `h` (60 минут), `m` (60 секунд), `s` (1 секунда), `ms` (1 миллисекунда). Единицы можно комбинировать, например: `'3d'`, `'12h'`, `'1d12h30m'`, `'500ms'`.
* `retain_last = N` — переопределяет `history.expire.min-snapshots-to-keep` на уровне таблицы только для этого вызова. Независимо от возраста всегда сохраняется как минимум `N` снимков.
* `snapshot_ids = [id1, id2, ...]` — удаляет только указанные идентификаторы снимков (кроме снимков, на которые ссылаются текущий снимок, ветки или теги). Этот режим полностью обходит политику хранения и не может использоваться вместе с `retention_period` или `retain_last`.
* `dry_run = 1` — вычисляет, что было бы удалено, и возвращает метрики без записи новых метаданных и удаления файлов.

:::note
`retention_period` и `retain_last` переопределяют только **значения хранения по умолчанию на уровне таблицы**. Переопределения хранения для отдельных ссылок (веток/тегов), настроенные в свойствах таблицы Iceberg (например, `refs.<branch>.min-snapshots-to-keep`), никогда не переопределяются — они всегда применяются так, как указано в метаданных таблицы.
:::

**Пример:**

```sql
SET allow_insert_into_iceberg = 1;

-- Create some snapshots by inserting data
INSERT INTO iceberg_table VALUES (1);
INSERT INTO iceberg_table VALUES (2);
INSERT INTO iceberg_table VALUES (3);

-- Expire using retention policy only
ALTER TABLE iceberg_table EXECUTE expire_snapshots();

-- Expire with a safety fuse: protect snapshots newer than the timestamp (positional syntax)
ALTER TABLE iceberg_table EXECUTE expire_snapshots('2025-01-01 00:00:00');

-- Same using the named argument form
ALTER TABLE iceberg_table EXECUTE expire_snapshots(expire_before = '2025-01-01 00:00:00');

-- Override retention parameters for one execution
ALTER TABLE iceberg_table EXECUTE expire_snapshots(retention_period = '3d', retain_last = 10);

-- Expire explicit snapshots
ALTER TABLE iceberg_table EXECUTE expire_snapshots(snapshot_ids = [101, 102, 103]);

-- Dry-run preview (no metadata updates, no file deletes)
ALTER TABLE iceberg_table EXECUTE expire_snapshots(retention_period = '1d', dry_run = 1);
```

**Вывод:**

Команда возвращает таблицу с двумя столбцами (`metric_name String`, `metric_value Int64`), содержащую по одной строке на каждую метрику. Имена метрик соответствуют [спецификации Iceberg](https://iceberg.apache.org/docs/latest/spark-procedures/#output):


| metric&#95;name                       | Описание                                                           |
| ------------------------------------- | ------------------------------------------------------------------ |
| `deleted_data_files_count`            | Количество удалённых файлов данных                                 |
| `deleted_position_delete_files_count` | Количество удалённых файлов позиционного удаления                  |
| `deleted_equality_delete_files_count` | Количество удалённых файлов удаления по равенству                  |
| `deleted_manifest_files_count`        | Количество удалённых файлов манифестов                             |
| `deleted_manifest_lists_count`        | Количество удалённых файлов списков манифестов                     |
| `deleted_statistics_files_count`      | Количество удалённых файлов статистики (на данный момент всегда 0) |
| `dry_run`                             | `1` для режима пробного запуска, `0` для обычного выполнения       |

Команда выполняет следующие шаги:

1. Оценивает политику хранения (см. ниже), чтобы определить, какие снимки должны быть сохранены
2. Если был передан аргумент временной метки, дополнительно защищает все снимки с этой временной меткой или более новые
3. Удаляет снимки, которые не сохраняются политикой и не защищены предохранителем временной метки
4. Определяет, какие файлы связаны исключительно с удалёнными снимками
5. В обычном режиме: создаёт новые метаданные без удалённых снимков
6. В обычном режиме: физически удаляет недостижимые списки манифестов, файлы манифестов и файлы данных
7. В режиме `dry_run = 1`: пропускает шаги 5 и 6 и возвращает только вычисленные метрики

#### Политика хранения снимков \{#iceberg-snapshot-retention-policy\}

Команда `expire_snapshots` учитывает [политику хранения снимков Iceberg](https://iceberg.apache.org/spec/#snapshot-retention-policy). Параметры хранения задаются через свойства таблицы Iceberg и переопределения для отдельных ссылок:

| Property                               | Scope | Default                                                                    | Description                                                                                         |
| -------------------------------------- | ----- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `history.expire.min-snapshots-to-keep` | Table | `iceberg_expire_default_min_snapshots_to_keep` (default `1`)               | Минимальное количество снимков, которое нужно сохранять в цепочке предков каждой ветки              |
| `history.expire.max-snapshot-age-ms`   | Table | `iceberg_expire_default_max_snapshot_age_ms` (default `432000000`, 5 days) | Максимальный возраст (в мс) снимков, сохраняемых в ветке                                            |
| `history.expire.max-ref-age-ms`        | Table | `iceberg_expire_default_max_ref_age_ms` (default `∞`)                      | Максимальный возраст (в мс) ссылки на снимок (ветки или тега), после которого сама ссылка удаляется |

Каждая ссылка на снимок (`refs` в метаданных Iceberg) может переопределять эти значения через поля для конкретной ссылки: `min-snapshots-to-keep`, `max-snapshot-age-ms` и `max-ref-age-ms`.

**Проверка условий хранения:**

* **Для каждой ветки** (включая `main`): выполняется обход цепочки предков, начиная с вершины ветки. Снимки сохраняются, пока выполняется хотя бы одно из следующих условий:
  * Снимок входит в число первых `min-snapshots-to-keep` в цепочке
  * Возраст снимка не превышает `max-snapshot-age-ms` (то есть `now - timestamp-ms <= max-snapshot-age-ms`)
* **Для тегов**: помеченный снимок сохраняется, если только тег не превысил свой `max-ref-age-ms`; в этом случае ссылка на тег удаляется
* **Ссылки, отличные от `main`**, возраст которых превышает `max-ref-age-ms`, удаляются полностью (ветка `main` никогда не удаляется)
* **Висячие ссылки**, указывающие на несуществующие снимки, удаляются с предупреждением
* **Текущий снимок сохраняется всегда**, независимо от настроек хранения

**Требуемые привилегии:**

Требуется привилегия `ALTER TABLE EXECUTE`, которая является дочерней по отношению к `ALTER TABLE` в иерархии управления доступом ClickHouse. Её можно выдать отдельно или через родительскую привилегию:

```sql
-- Grant only EXECUTE permission
GRANT ALTER TABLE EXECUTE ON my_iceberg_table TO my_user;

-- Or grant all ALTER TABLE permissions (includes ALTER TABLE EXECUTE)
GRANT ALTER TABLE ON my_iceberg_table TO my_user;
```

:::note

* Поддерживаются только таблицы Iceberg формата версии 2 (снимки v1 не гарантируют наличие `manifest-list`, который требуется для безопасного определения файлов для очистки)
* Текущий снимок всегда сохраняется, даже если он старше указанной временной метки
* Требуется включить настройку `allow_insert_into_iceberg`
* Требуется включить настройку `allow_experimental_expire_snapshots`
* Собственный механизм авторизации каталога (авторизация REST catalog, AWS Glue IAM и т. д.) применяется независимо, когда ClickHouse обновляет метаданные
  :::


## См. также \{#see-also\}

* [Движок Iceberg](/engines/table-engines/integrations/iceberg.md)
* [Табличная функция Iceberg для кластеров](/sql-reference/table-functions/icebergCluster.md)