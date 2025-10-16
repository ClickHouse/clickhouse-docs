---
slug: '/sql-reference/table-functions/iceberg'
sidebar_label: iceberg
sidebar_position: 90
description: 'Представляет интерфейс типа TABLE только для чтения к таблицам Apache'
title: iceberg
doc_type: reference
---
# icebergs Табличная Функция {#iceberg-table-function}

Предоставляет интерфейс, похожий на таблицу, только для чтения таблиц Apache [Iceberg](https://iceberg.apache.org/) в Amazon S3, Azure, HDFS или локально.

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

Описание аргументов совпадает с описанием аргументов в табличных функциях `s3`, `azureBlobStorage`, `HDFS` и `file` соответственно. 
`format` обозначает формат файлов данных в таблице Iceberg.

### Возвращаемое значение {#returned-value}

Таблица с заданной структурой для чтения данных в указанной таблице Iceberg.

### Пример {#example}

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
На текущий момент ClickHouse поддерживает чтение версий v1 и v2 формата Iceberg через табличные функции `icebergS3`, `icebergAzure`, `icebergHDFS` и `icebergLocal`, а также через движки таблиц `IcebergS3`, `icebergAzure`, `IcebergHDFS` и `IcebergLocal`.
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

На данный момент с помощью CH вы можете читать таблицы iceberg, схема которых изменялась со временем. В данный момент поддерживается чтение таблиц, в которых добавлены и удалены колонки, а также изменён их порядок. Вы также можете изменить колонку, где требуется значение, на ту, где допускается NULL. Кроме того, поддерживаются допустимые приведения типов для простых типов, а именно:

* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S), где P' > P.

В настоящее время невозможно изменять вложенные структуры или типы элементов внутри массивов и карт.

## Обрезка партиций {#partition-pruning}

ClickHouse поддерживает обрезку партиций во время SELECT-запросов для таблиц Iceberg, что помогает оптимизировать производительность запросов, пропуская нерелевантные файлы данных. Чтобы включить обрезку партиций, установите `use_iceberg_partition_pruning = 1`. Для получения дополнительной информации о обрезке партиций можно обратиться к https://iceberg.apache.org/spec/#partitioning

## Временной переход {#time-travel}

ClickHouse поддерживает временной переход для таблиц Iceberg, позволяя вам запрашивать исторические данные с конкретной меткой времени или идентификатором снимка.

## Обработка таблиц с удалёнными строками {#deleted-rows}

В настоящее время поддерживаются только таблицы Iceberg с [позиционным удалением](https://iceberg.apache.org/spec/#position-delete-files).

Следующие методы удаления **не поддерживаются**:
- [Удаления по равенству](https://iceberg.apache.org/spec/#equality-delete-files)
- [Векторы удаления](https://iceberg.apache.org/spec/#deletion-vectors) (введены в v3)

### Основное использование {#basic-usage}

```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_timestamp_ms = 1714636800000
```

```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_snapshot_id = 3547395809148285433
```

Примечание: Вы не можете указать как параметры `iceberg_timestamp_ms`, так и `iceberg_snapshot_id` в одном и том же запросе.

### Важные соображения {#important-considerations}

* **Снимки** обычно создаются, когда:
* В таблицу записываются новые данные
* Производится какая-либо компактация данных

* **Изменения схемы, как правило, не создают снимков** - Это приводит к важным особенностям при использовании временного перехода с таблицами, которые подверглись эволюции схемы.

### Примерные сценарии {#example-scenarios}

Все сценарии написаны в Spark, потому что CH пока не поддерживает запись в таблицы Iceberg.

#### Сценарий 1: Изменения схемы без новых снимков {#scenario-1}

Рассмотрим эту последовательность операций:

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

Результаты запросов в разные моменты времени:

* На ts1 и ts2: Появляются только оригинальные две колонки
* На ts3: Появляются все три колонки с NULL для цены первой строки

#### Сценарий 2: Различия между исторической и текущей схемой {#scenario-2}

Запрос на временной переход в текущий момент может показать другую схему, чем текущая таблица:

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

Это происходит потому, что `ALTER TABLE` не создает новый снимок, но для текущей таблицы Spark берет значение `schema_id` из последнего файла метаданных, а не снимка.

#### Сценарий 3: Различия между исторической и текущей схемой {#scenario-3}

Второе заключается в том, что при выполнении временного перехода вы не можете получить состояние таблицы до того, как в нее были записаны какие-либо данные:

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

В ClickHouse поведение согласуется со Spark. Вы можете мысленно заменить запросы Select Spark запросами Select ClickHouse, и это будет работать так же.

## Разрешение файла метаданных {#metadata-file-resolution}

При использовании табличной функции `iceberg` в ClickHouse системе необходимо найти правильный файл metadata.json, который описывает структуру таблицы Iceberg. Вот как работает этот процесс разрешения:

### Поиск кандидатов (по приоритету) {#candidate-search}

1. **Прямое указание пути**:
*Если вы установите `iceberg_metadata_file_path`, система будет использовать этот точный путь, комбинируя его с путем к директории таблицы Iceberg.
* Когда эта настройка предоставляется, все другие настройки разрешения игнорируются.

2. **Сопоставление UUID таблицы**:
*Если указан `iceberg_metadata_table_uuid`, система:
    *Смотрит только на файлы `.metadata.json` в директории `metadata`
    *Фильтрует файлы, содержащие поле `table-uuid`, соответствующее указанному вами UUID (без учета регистра)

3. **Поиск по умолчанию**:
*Если ни одна из вышеуказанных настроек не предоставлена, все файлы `.metadata.json` в директории `metadata` становятся кандидатами

### Выбор самого последнего файла {#most-recent-file}

После идентификации кандидатных файлов с помощью вышеуказанных правил система определяет, какой из них является самым последним:

* Если включена настройка `iceberg_recent_metadata_file_by_last_updated_ms_field`:
* Выбирается файл с наибольшим значением `last-updated-ms`

* В противном случае:
* Выбирается файл с самым высоким номером версии
* (Версия появляется как `V` в именах файлов формата `V.metadata.json` или `V-uuid.metadata.json`)

**Примечание**: Все упомянутые настройки являются настройками табличной функции (не глобальными или уровня запроса) и должны быть указаны, как показано ниже:

```sql
SELECT * FROM iceberg('s3://bucket/path/to/iceberg_table', 
    SETTINGS iceberg_metadata_table_uuid = 'a90eed4c-f74b-4e5b-b630-096fb9d09021');
```

**Примечание**: Хотя Каталоги Iceberg обычно обрабатывают разрешение метаданных, табличная функция `iceberg` в ClickHouse прямо интерпретирует файлы, хранящиеся в S3, как таблицы Iceberg, поэтому понимание этих правил разрешения является важным.

## Кеш метаданных {#metadata-cache}

Движок таблиц `Iceberg` и табличная функция поддерживают кеш метаданных, хранящий информацию о манифест-файлах, списке манифестов и json-метаданных. Кеш хранится в памяти. Эта функция контролируется установкой `use_iceberg_metadata_files_cache`, которая включена по умолчанию.

## Псевдонимы {#aliases}

Табличная функция `iceberg` сейчас является псевдонимом для `icebergS3`.

## Виртуальные колонки {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер файла неизвестен, значение равно `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение равно `NULL`.
- `_etag` — Etag файла. Тип: `LowCardinality(String)`. Если etag неизвестен, значение равно `NULL`.

## Записи в таблицу iceberg {#writes-into-iceberg-table}

Начиная с версии 25.7, ClickHouse поддерживает модификации таблиц Iceberg пользователя.

В настоящее время это экспериментальная функция, поэтому вам необходимо сначала ее включить:

```sql
SET allow_experimental_insert_into_iceberg = 1;
```

### Создание таблицы {#create-iceberg-table}

Чтобы создать собственную пустую таблицу Iceberg, используйте те же команды, что и для чтения, но явно указывайте схему. 
Записи поддерживают все форматы данных из спецификации iceberg, такие как Parquet, Avro, ORC.

### Пример {#example-iceberg-writes-create}

```sql
CREATE TABLE iceberg_writes_example
(
    x Nullable(String),
    y Nullable(Int32)
)
ENGINE = IcebergLocal('/home/scanhex12/iceberg_example/')
```

Примечание: Для создания файла подсказки версии включите настройку `iceberg_use_version_hint`.
Если вы хотите сжать файл metadata.json, укажите имя кодека в настройке `iceberg_metadata_compression_method`.

### ВСТАВКА {#writes-inserts}

После создания новой таблицы вы можете вставлять данные, используя привычный синтаксис ClickHouse.

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

### УДАЛЕНИЕ {#iceberg-writes-delete}

Удаление лишних строк в формате merge-on-read также поддерживается в ClickHouse.
Этот запрос создаст новый снимок с файлами позиционного удаления.

ПРИМЕЧАНИЕ: Если вы хотите в будущем читать ваши таблицы с другими движками Iceberg (такими как Spark), вам нужно отключить настройки `output_format_parquet_use_custom_encoder` и `output_format_parquet_parallel_encoding`.
Это связано с тем, что Spark читает эти файлы по идентификаторам полей parquet, в то время как ClickHouse в настоящее время не поддерживает запись идентификаторов полей, когда эти флаги включены.
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

ClickHouse позволяет добавлять, удалять или изменять колонки с простыми типами (не кортежами, не массивами, не картами).

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

### Компактация {#iceberg-writes-compaction}

ClickHouse поддерживает компактацию таблиц iceberg. В настоящее время она может объединять файлы позиционного удаления в файлы данных во время обновления метаданных. Предыдущие идентификаторы снимков и временные метки остаются неизменными, так что функция временного перехода все еще может использоваться с теми же значениями.

Как это использовать:

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

## Таблица с каталогами {#iceberg-writes-catalogs}

Все описанные выше функции записи также доступны с REST и Glue каталогами.
Чтобы использовать их, создайте таблицу с движком `IcebergS3` и предоставьте необходимые настройки:

```sql
CREATE TABLE `database_name.table_name`  ENGINE = IcebergS3('http://minio:9000/warehouse-rest/table_name/', 'minio_access_key', 'minio_secret_key')
SETTINGS storage_catalog_type="rest", storage_warehouse="demo", object_storage_endpoint="http://minio:9000/warehouse-rest", storage_region="us-east-1", storage_catalog_url="http://rest:8181/v1",
```

## Также см. {#see-also}

* [Движок Iceberg](/engines/table-engines/integrations/iceberg.md)
* [Табличная функция Iceberg cluster](/sql-reference/table-functions/icebergCluster.md)