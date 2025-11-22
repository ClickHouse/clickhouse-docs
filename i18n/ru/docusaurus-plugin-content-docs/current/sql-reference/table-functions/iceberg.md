---
description: 'Предоставляет табличный интерфейс только для чтения к таблицам Apache Iceberg, хранящимся в Amazon S3, Azure, HDFS или локально.'
sidebar_label: 'iceberg'
sidebar_position: 90
slug: /sql-reference/table-functions/iceberg
title: 'iceberg'
doc_type: 'reference'
---



# Табличная функция iceberg {#iceberg-table-function}

Предоставляет табличный интерфейс только для чтения к таблицам Apache [Iceberg](https://iceberg.apache.org/), размещённым в Amazon S3, Azure, HDFS или локально.


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


## Arguments {#arguments}

Описание аргументов совпадает с описанием аргументов табличных функций `s3`, `azureBlobStorage`, `HDFS` и `file` соответственно.
`format` указывает формат файлов данных в таблице Iceberg.

### Returned value {#returned-value}

Таблица с указанной структурой для чтения данных из указанной таблицы Iceberg.

### Example {#example}

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
ClickHouse в настоящее время поддерживает чтение версий v1 и v2 формата Iceberg через табличные функции `icebergS3`, `icebergAzure`, `icebergHDFS` и `icebergLocal`, а также табличные движки `IcebergS3`, `icebergAzure`, `IcebergHDFS` и `IcebergLocal`.
:::


## Определение именованной коллекции {#defining-a-named-collection}

Ниже приведён пример настройки именованной коллекции для хранения URL и учётных данных:

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

В настоящее время с помощью ClickHouse можно читать таблицы Iceberg, схема которых изменялась с течением времени. Поддерживается чтение таблиц, в которых добавлялись и удалялись столбцы, а также изменялся их порядок. Также можно изменить столбец с обязательным значением на столбец, допускающий NULL. Кроме того, поддерживается разрешённое приведение типов для простых типов, а именно:

- int -> long
- float -> double
- decimal(P, S) -> decimal(P', S), где P' > P.

В настоящее время невозможно изменять вложенные структуры или типы элементов внутри массивов и словарей.


## Отсечение партиций {#partition-pruning}

ClickHouse поддерживает отсечение партиций при выполнении SELECT-запросов к таблицам Iceberg, что позволяет оптимизировать производительность запросов за счёт пропуска нерелевантных файлов данных. Чтобы включить отсечение партиций, установите `use_iceberg_partition_pruning = 1`. Дополнительную информацию об отсечении партиций Iceberg см. по адресу https://iceberg.apache.org/spec/#partitioning


## Путешествие во времени {#time-travel}

ClickHouse поддерживает функцию путешествия во времени для таблиц Iceberg, что позволяет запрашивать исторические данные по конкретной временной метке или идентификатору снимка.


## Обработка таблиц с удалёнными строками {#deleted-rows}

В настоящее время поддерживаются только таблицы Iceberg с [позиционными удалениями](https://iceberg.apache.org/spec/#position-delete-files).

Следующие методы удаления **не поддерживаются**:

- [Удаления по равенству](https://iceberg.apache.org/spec/#equality-delete-files)
- [Векторы удаления](https://iceberg.apache.org/spec/#deletion-vectors) (введены в v3)

### Базовое использование {#basic-usage}

```sql
SELECT * FROM example_table ORDER BY 1
SETTINGS iceberg_timestamp_ms = 1714636800000
```

```sql
SELECT * FROM example_table ORDER BY 1
SETTINGS iceberg_snapshot_id = 3547395809148285433
```

Примечание: нельзя одновременно указывать параметры `iceberg_timestamp_ms` и `iceberg_snapshot_id` в одном запросе.

### Важные замечания {#important-considerations}

- **Снимки** обычно создаются, когда:
- В таблицу записываются новые данные
- Выполняется компактификация данных

- **Изменения схемы обычно не создают снимки** — это приводит к важным особенностям поведения при использовании путешествия во времени с таблицами, схема которых изменялась.

### Примеры сценариев {#example-scenarios}

Все сценарии написаны в Spark, поскольку ClickHouse пока не поддерживает запись в таблицы Iceberg.

#### Сценарий 1: Изменения схемы без новых снимков {#scenario-1}

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

- - Запрос таблицы на каждую временную метку
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

Результаты запроса на разные временные метки:

- На ts1 и ts2: отображаются только исходные два столбца
- На ts3: отображаются все три столбца, с NULL для цены первой строки

#### Сценарий 2: Различия между исторической и текущей схемой {#scenario-2}

Запрос путешествия во времени на текущий момент может показать схему, отличную от текущей таблицы:

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

-- Запрос таблицы на текущий момент, но с использованием синтаксиса временной метки

  SELECT * FROM spark_catalog.db.time_travel_example_2 TIMESTAMP AS OF ts;

    +------------+------------+
    |order_number|product_code|
    +------------+------------+
    |           2|       Venus|
    +------------+------------+

-- Запрос таблицы на текущий момент
  SELECT * FROM spark_catalog.db.time_travel_example_2;
    +------------+------------+-----+
    |order_number|product_code|price|
    +------------+------------+-----+
    |           2|       Venus| NULL|
    +------------+------------+-----+
```

Это происходит потому, что `ALTER TABLE` не создаёт новый снимок, но для текущей таблицы Spark берёт значение `schema_id` из последнего файла метаданных, а не из снимка.


#### Сценарий 3: Различия между исторической и текущей схемой {#scenario-3}

Второе ограничение заключается в том, что при использовании time travel невозможно получить состояние таблицы до записи в неё каких-либо данных:

```sql
-- Создание таблицы
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number bigint,
  product_code string
  )
  USING iceberg
  OPTIONS ('format-version'='2');

  ts = now();

-- Запрос к таблице на определённую временную метку
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- Завершается с ошибкой: Cannot find a snapshot older than ts.
```

В ClickHouse поведение согласуется с Spark. Вы можете мысленно заменить запросы SELECT из Spark на запросы SELECT в ClickHouse — они будут работать одинаково.


## Разрешение файла метаданных {#metadata-file-resolution}

При использовании табличной функции `iceberg` в ClickHouse системе необходимо найти корректный файл metadata.json, описывающий структуру таблицы Iceberg. Ниже описан процесс разрешения:

### Поиск кандидатов (в порядке приоритета) {#candidate-search}

1. **Прямое указание пути**:
   * Если задан параметр `iceberg_metadata_file_path`, система использует этот точный путь, объединяя его с путём к каталогу таблицы Iceberg.

- При указании этого параметра все остальные параметры разрешения игнорируются.

2. **Сопоставление UUID таблицы**:
   * Если указан параметр `iceberg_metadata_table_uuid`, система:
   * Просматривает только файлы `.metadata.json` в каталоге `metadata`
   * Фильтрует файлы, содержащие поле `table-uuid`, соответствующее указанному UUID (без учёта регистра)

3. **Поиск по умолчанию**:
   * Если ни один из вышеуказанных параметров не задан, все файлы `.metadata.json` в каталоге `metadata` становятся кандидатами

### Выбор самого актуального файла {#most-recent-file}

После определения файлов-кандидатов по вышеуказанным правилам система определяет, какой из них является самым актуальным:

- Если включён параметр `iceberg_recent_metadata_file_by_last_updated_ms_field`:
- Выбирается файл с наибольшим значением `last-updated-ms`

- В противном случае:
- Выбирается файл с наибольшим номером версии
- (Версия указывается как `V` в именах файлов формата `V.metadata.json` или `V-uuid.metadata.json`)

**Примечание**: Все упомянутые параметры являются параметрами табличной функции (а не глобальными параметрами или параметрами уровня запроса) и должны быть указаны, как показано ниже:

```sql
SELECT * FROM iceberg('s3://bucket/path/to/iceberg_table',
    SETTINGS iceberg_metadata_table_uuid = 'a90eed4c-f74b-4e5b-b630-096fb9d09021');
```

**Примечание**: Хотя каталоги Iceberg обычно обрабатывают разрешение метаданных, табличная функция `iceberg` в ClickHouse напрямую интерпретирует файлы, хранящиеся в S3, как таблицы Iceberg, поэтому понимание этих правил разрешения является важным.


## Кэш метаданных {#metadata-cache}

Движок таблиц `Iceberg` и табличная функция поддерживают кэширование метаданных, в котором хранится информация о файлах манифеста, списке манифестов и JSON-метаданных. Кэш хранится в оперативной памяти. Эта функциональность управляется настройкой `use_iceberg_metadata_files_cache`, которая включена по умолчанию.


## Псевдонимы {#aliases}

Табличная функция `iceberg` является псевдонимом `icebergS3`.


## Виртуальные столбцы {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер файла неизвестен, значение — `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение — `NULL`.
- `_etag` — ETag файла. Тип: `LowCardinality(String)`. Если ETag неизвестен, значение — `NULL`.


## Запись в таблицы Iceberg {#writes-into-iceberg-table}

Начиная с версии 25.7, ClickHouse поддерживает изменение пользовательских таблиц Iceberg.

В настоящее время это экспериментальная функция, поэтому сначала необходимо её включить:

```sql
SET allow_experimental_insert_into_iceberg = 1;
```

### Создание таблицы {#create-iceberg-table}

Чтобы создать собственную пустую таблицу Iceberg, используйте те же команды, что и для чтения, но явно укажите схему.
Запись поддерживает все форматы данных из спецификации Iceberg, такие как Parquet, Avro, ORC.

### Пример {#example-iceberg-writes-create}

```sql
CREATE TABLE iceberg_writes_example
(
    x Nullable(String),
    y Nullable(Int32)
)
ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/')
```

Примечание: Чтобы создать файл подсказки версии, включите настройку `iceberg_use_version_hint`.
Если вы хотите сжать файл metadata.json, укажите имя кодека в настройке `iceberg_metadata_compression_method`.

### INSERT {#writes-inserts}

После создания новой таблицы вы можете вставлять данные, используя обычный синтаксис ClickHouse.

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

Удаление строк в формате merge-on-read также поддерживается в ClickHouse.
Этот запрос создаст новый снимок с файлами позиционного удаления.

ПРИМЕЧАНИЕ: Если вы хотите читать свои таблицы в будущем с помощью других движков Iceberg (таких как Spark), необходимо отключить настройки `output_format_parquet_use_custom_encoder` и `output_format_parquet_parallel_encoding`.
Это связано с тем, что Spark читает эти файлы по идентификаторам полей Parquet (field-ids), в то время как ClickHouse в настоящее время не поддерживает запись идентификаторов полей при включённых этих флагах.
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

ClickHouse позволяет добавлять, удалять или изменять столбцы с простыми типами (не Tuple, не Array, не Map).

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

```


ALTER TABLE iceberg&#95;writes&#95;example DROP COLUMN z;
SHOW CREATE TABLE iceberg&#95;writes&#95;example;
┌─запрос─────────────────────────────────────────────────────┐

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

Все описанные выше функции записи также доступны при использовании каталогов REST и Glue.
Для их использования создайте таблицу с движком `IcebergS3` и укажите необходимые параметры:

```sql
CREATE TABLE `database_name.table_name`  ENGINE = IcebergS3('http://minio:9000/warehouse-rest/table_name/', 'minio_access_key', 'minio_secret_key')
SETTINGS storage_catalog_type="rest", storage_warehouse="demo", object_storage_endpoint="http://minio:9000/warehouse-rest", storage_region="us-east-1", storage_catalog_url="http://rest:8181/v1",
```


## См. также {#see-also}

- [Движок Iceberg](/engines/table-engines/integrations/iceberg.md)
- [Табличная функция icebergCluster](/sql-reference/table-functions/icebergCluster.md)
