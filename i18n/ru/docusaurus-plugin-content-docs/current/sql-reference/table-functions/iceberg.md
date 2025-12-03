---
description: 'Предоставляет табличный интерфейс только для чтения к таблицам Apache Iceberg, размещённым в Amazon S3, Azure, HDFS или хранящимся локально.'
sidebar_label: 'iceberg'
sidebar_position: 90
slug: /sql-reference/table-functions/iceberg
title: 'iceberg'
doc_type: 'reference'
---

# Табличная функция iceberg {#iceberg-table-function}

Предоставляет табличный интерфейс только для чтения к таблицам Apache [Iceberg](https://iceberg.apache.org/) в Amazon S3, Azure, HDFS или локальном хранилище.

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

Описание аргументов аналогично описанию аргументов в табличных функциях `s3`, `azureBlobStorage`, `HDFS` и `file` соответственно.
`format` обозначает формат файлов с данными в таблице Iceberg.

### Возвращаемое значение {#returned-value}

Таблица с указанной структурой для чтения данных из указанной таблицы Iceberg.

### Пример {#example}

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
ClickHouse в настоящее время поддерживает чтение формата Iceberg версий v1 и v2 с помощью табличных функций `icebergS3`, `icebergAzure`, `icebergHDFS` и `icebergLocal`, а также табличных движков `IcebergS3`, `icebergAzure`, `IcebergHDFS` и `IcebergLocal`.
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

## Эволюция схемы {#schema-evolution}

На данный момент с помощью ClickHouse вы можете читать таблицы Iceberg, схема которых изменялась со временем. Мы поддерживаем чтение таблиц, в которых столбцы добавлялись и удалялись, а их порядок изменялся. Вы также можете изменить столбец с обязательным значением на столбец, в котором допускается значение NULL. Дополнительно мы поддерживаем допустимое приведение типов для простых типов, а именно:  

* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S), где P' > P.

В настоящее время невозможно изменять вложенные структуры или типы элементов внутри массивов и структур map.

## Отсечение партиций {#partition-pruning}

ClickHouse поддерживает отсечение партиций при выполнении запросов SELECT к таблицам Iceberg, что помогает оптимизировать производительность запросов за счёт пропуска нерелевантных файлов данных. Чтобы включить отсечение партиций, установите `use_iceberg_partition_pruning = 1`. Для получения дополнительной информации об отсечении партиций в Iceberg см. https://iceberg.apache.org/spec/#partitioning

## Time Travel {#time-travel}

ClickHouse поддерживает механизм Time Travel для таблиц Iceberg, позволяющий выполнять запросы к историческим данным на указанную метку времени или по идентификатору снимка (snapshot).

## Обработка таблиц с удалёнными строками {#deleted-rows}

В настоящее время поддерживаются только таблицы Iceberg, использующие [position deletes](https://iceberg.apache.org/spec/#position-delete-files).

Следующие методы удаления **не поддерживаются**:

* [Equality deletes](https://iceberg.apache.org/spec/#equality-delete-files)
* [Deletion vectors](https://iceberg.apache.org/spec/#deletion-vectors) (добавлены в v3)

### Базовое использование {#basic-usage}

```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_timestamp_ms = 1714636800000
```

```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_snapshot_id = 3547395809148285433
```

Note: Нельзя указывать параметры `iceberg_timestamp_ms` и `iceberg_snapshot_id` в одном и том же запросе.

### Важные замечания {#important-considerations}

* **Снимки (snapshots)** обычно создаются, когда:

* В таблицу записываются новые данные

* Выполняется операция по уплотнению данных (compaction)

* **Изменения схемы обычно не создают новых снимков** — это приводит к важным особенностям поведения при использовании time travel для таблиц, в которых происходила эволюция схемы.

### Примеры сценариев {#example-scenarios}

Все сценарии приведены в Spark, так как ClickHouse пока не поддерживает запись в таблицы Iceberg.

#### Сценарий 1: изменения схемы без новых снимков {#scenario-1}

Рассмотрим следующую последовательность операций:

```sql
-- Создание таблицы с двумя столбцами
 CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example (
 order_number bigint, 
 product_code string
 ) 
 USING iceberg 
 OPTIONS ('format-version'='2')

- - Вставка данных в таблицу
 INSERT INTO spark_catalog.db.time_travel_example VALUES 
   (1, 'Mars')

 ts1 = now() // Фрагмент псевдокода

- - Изменение таблицы для добавления нового столбца
 ALTER TABLE spark_catalog.db.time_travel_example ADD COLUMN (price double)

 ts2 = now()

- - Вставка данных в таблицу
 INSERT INTO spark_catalog.db.time_travel_example VALUES (2, 'Venus', 100)

  ts3 = now()

- - Запрос таблицы для каждой временной метки
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

Результаты запроса на разных временных метках:

* В моменты ts1 и ts2: отображаются только исходные два столбца
* В момент ts3: отображаются все три столбца, при этом для цены в первой строке указано значение NULL

#### Сценарий 2: различия между исторической и текущей схемой {#scenario-2}

Запрос time travel, выполненный в текущий момент, может показать схему, отличающуюся от схемы текущей таблицы:

```sql
-- Создать таблицу
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_2 (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- Вставить начальные данные в таблицу
  INSERT INTO spark_catalog.db.time_travel_example_2 VALUES (2, 'Venus');

-- Изменить таблицу, добавив новый столбец
  ALTER TABLE spark_catalog.db.time_travel_example_2 ADD COLUMN (price double);

  ts = now();

-- Запросить таблицу в текущий момент времени, используя синтаксис временной метки

  SELECT * FROM spark_catalog.db.time_travel_example_2 TIMESTAMP AS OF ts;

    +------------+------------+
    |order_number|product_code|
    +------------+------------+
    |           2|       Venus|
    +------------+------------+

-- Запросить таблицу в текущий момент времени
  SELECT * FROM spark_catalog.db.time_travel_example_2;
    +------------+------------+-----+
    |order_number|product_code|price|
    +------------+------------+-----+
    |           2|       Venus| NULL|
    +------------+------------+-----+
```

Это происходит потому, что `ALTER TABLE` не создаёт новый снимок, но для текущей таблицы Spark использует значение `schema_id` из последнего файла метаданных, а не из снимка.

#### Сценарий 3: различия между исторической и текущей схемами {#scenario-3}

Второй момент заключается в том, что при использовании механизма time travel вы не можете получить состояние таблицы на момент до записи в неё каких-либо данных:

```sql
-- Создание таблицы
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2');

  ts = now();

-- Запрос таблицы на определённую временную метку
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- Завершается ошибкой: Cannot find a snapshot older than ts.
```

В ClickHouse поведение аналогично Spark. Вы можете мысленно заменить запросы SELECT в Spark на запросы SELECT в ClickHouse — и всё будет работать так же.

## Определение файла метаданных {#metadata-file-resolution}

При использовании табличной функции `iceberg` в ClickHouse система должна найти корректный файл metadata.json, который описывает структуру таблицы Iceberg. Ниже описано, как работает этот процесс определения:

### Поиск кандидатов (в порядке приоритета) {#candidate-search}

1. **Явное указание пути**:
   *Если вы задаёте `iceberg_metadata_file_path`, система будет использовать этот точный путь, объединяя его с путём к директории таблицы Iceberg.*

* При наличии этого параметра все остальные параметры выбора игнорируются.

2. **Соответствие UUID таблицы**:
   *Если указан `iceberg_metadata_table_uuid`, система будет:*
   *Просматривать только файлы `.metadata.json` в директории `metadata`*
   *Фильтровать файлы, содержащие поле `table-uuid`, совпадающее с указанным вами UUID (без учёта регистра)*

3. **Поиск по умолчанию**:
   *Если ни один из вышеперечисленных параметров не задан, все файлы `.metadata.json` в директории `metadata` становятся кандидатами.*

### Выбор самого нового файла {#most-recent-file}

После определения файлов-кандидатов по приведённым выше правилам система выбирает самый новый:

* Если включён `iceberg_recent_metadata_file_by_last_updated_ms_field`:

* Выбирается файл с максимальным значением `last-updated-ms`

* В противном случае:

* Выбирается файл с наибольшим номером версии

* (Версия представлена как `V` в именах файлов формата `V.metadata.json` или `V-uuid.metadata.json`)

**Примечание**: Все упомянутые параметры являются параметрами табличной функции (а не глобальными или параметрами уровня запроса) и должны указываться так, как показано ниже:

```sql
SELECT * FROM iceberg('s3://bucket/path/to/iceberg_table', 
    SETTINGS iceberg_metadata_table_uuid = 'a90eed4c-f74b-4e5b-b630-096fb9d09021');
```

**Примечание**: Хотя Iceberg Catalogs обычно отвечают за разрешение метаданных, табличная функция `iceberg` в ClickHouse напрямую интерпретирует файлы, хранящиеся в S3, как таблицы Iceberg, поэтому важно понимать эти правила разрешения метаданных.

## Кэш метаданных {#metadata-cache}

Движок таблицы и табличная функция `Iceberg` поддерживают кэш метаданных, в котором хранится информация о файлах манифеста, списке манифестов и JSON-файле метаданных. Кэш хранится в памяти. Эта возможность управляется настройкой `use_iceberg_metadata_files_cache`, которая по умолчанию включена.

## Псевдонимы {#aliases}

Табличная функция `iceberg` теперь является алиасом функции `icebergS3`.

## Виртуальные столбцы {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер файла неизвестен, значение равно `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение равно `NULL`.
- `_etag` — ETag файла. Тип: `LowCardinality(String)`. Если ETag неизвестен, значение равно `NULL`.

## Запись в таблицы Iceberg {#writes-into-iceberg-table}

Начиная с версии 25.7, ClickHouse поддерживает изменение пользовательских таблиц Iceberg.

В настоящее время это экспериментальная функциональность, поэтому её сначала необходимо включить:

```sql
SET allow_experimental_insert_into_iceberg = 1;
```

### Создание таблицы {#create-iceberg-table}

Чтобы создать собственную пустую таблицу Iceberg, используйте те же команды, что и для чтения, но явно задайте схему.
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
Если вы хотите сжать файл metadata.json, укажите имя кодека в настройке `iceberg_metadata_compression_method`.

### INSERT {#writes-inserts}

После создания новой таблицы вы можете вставлять данные, используя обычный синтаксис ClickHouse.

### Пример {#example-iceberg-writes-insert}

```sql
INSERT INTO iceberg_writes_example VALUES ('Pavel', 777), ('Ivanov', 993);

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Строка 1:
──────
x: Pavel
y: 777

Строка 2:
──────
x: Ivanov
y: 993
```

### УДАЛЕНИЕ {#iceberg-writes-delete}

В ClickHouse также поддерживается удаление строк в формате merge-on-read.
Этот запрос создаст новый снимок с файлами позиционного удаления.

ПРИМЕЧАНИЕ: если в будущем вы захотите читать свои таблицы с помощью других движков Iceberg (таких как Spark), вам нужно отключить настройки `output_format_parquet_use_custom_encoder` и `output_format_parquet_parallel_encoding`.
Это связано с тем, что Spark читает эти файлы по идентификаторам полей Parquet (field-ids), в то время как ClickHouse в настоящее время не поддерживает запись идентификаторов полей при включённых этих флагах.
Мы планируем исправить это поведение в будущем.

### Пример {#example-iceberg-writes-delete}

```sql
ALTER TABLE iceberg_writes_example DELETE WHERE x != 'Ivanov';

SELECT *
FROM iceberg_writes_example
FORMAT VERTICAL;

Строка 1:
─────────
x: Ivanov
y: 993
```

### Эволюция схемы {#iceberg-writes-schema-evolution}

ClickHouse позволяет добавлять, удалять или изменять столбцы с простыми типами (не tuple, не array, не map).

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

Строка 1:
──────
x: Иванов
y: 993
z: ᴺᵁᴸᴸ
```

ALTER TABLE iceberg&#95;writes&#95;example DROP COLUMN z;
SHOW CREATE TABLE iceberg&#95;writes&#95;example;
┌─statement─────────────────────────────────────────────────┐

1. │ CREATE TABLE default.iceberg&#95;writes&#95;example              ↴│
   │↳(                                                        ↴│
   │↳    `x` Nullable(String),                                ↴│
   │↳    `y` Nullable(Int64)                                  ↴│
   │↳)                                                        ↴│
   │↳ENGINE = IcebergLocal(&#39;/home/scanhex12/iceberg&#95;example/&#39;) │
   └───────────────────────────────────────────────────────────┘

SELECT *
FROM iceberg&#95;writes&#95;example
FORMAT VERTICAL;

Строка 1:
──────
x: Ivanov
y: 993

````

### Уплотнение {#iceberg-writes-compaction}

ClickHouse поддерживает уплотнение таблиц Iceberg. В настоящее время можно объединять файлы позиционного удаления с файлами данных при обновлении метаданных. Идентификаторы и временные метки предыдущих снимков остаются неизменными, поэтому функция путешествия во времени продолжает работать с теми же значениями.

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
````

## Таблица с каталогами {#iceberg-writes-catalogs}

Все описанные выше возможности записи также доступны с REST- и Glue‑каталогами.
Чтобы использовать их, создайте таблицу с табличным движком `IcebergS3` и укажите необходимые настройки:

```sql
CREATE TABLE `database_name.table_name`  ENGINE = IcebergS3('http://minio:9000/warehouse-rest/table_name/', 'minio_access_key', 'minio_secret_key')
SETTINGS storage_catalog_type="rest", storage_warehouse="demo", object_storage_endpoint="http://minio:9000/warehouse-rest", storage_region="us-east-1", storage_catalog_url="http://rest:8181/v1",
```

## См. также {#see-also}

* [Движок таблиц Iceberg](/engines/table-engines/integrations/iceberg.md)
* [Табличная функция `icebergCluster`](/sql-reference/table-functions/icebergCluster.md)
