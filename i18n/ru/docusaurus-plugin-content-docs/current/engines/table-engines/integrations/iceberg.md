---
description: 'Этот движок обеспечивает интеграцию только для чтения с существующими таблицами Apache Iceberg в Amazon S3, Azure, HDFS и с локально размещёнными таблицами.'
sidebar_label: 'Iceberg'
sidebar_position: 90
slug: /engines/table-engines/integrations/iceberg
title: 'Движок таблиц Iceberg'
doc_type: 'reference'
---



# Движок таблиц Iceberg {#iceberg-table-engine}

:::warning
Рекомендуется использовать [табличную функцию Iceberg](/sql-reference/table-functions/iceberg.md) для работы с данными Iceberg в ClickHouse. Табличная функция Iceberg в настоящее время предоставляет достаточную функциональность, обеспечивая частичный интерфейс только для чтения таблиц Iceberg.

Движок таблиц Iceberg доступен, но может иметь ограничения. ClickHouse изначально не был разработан для поддержки таблиц с внешне изменяющимися схемами, что может влиять на функциональность движка таблиц Iceberg. В результате некоторые функции, которые работают с обычными таблицами, могут быть недоступны или работать некорректно, особенно при использовании старого анализатора.

Для оптимальной совместимости рекомендуется использовать табличную функцию Iceberg, пока мы продолжаем улучшать поддержку движка таблиц Iceberg.
:::

Этот движок обеспечивает интеграцию только для чтения с существующими таблицами Apache [Iceberg](https://iceberg.apache.org/) в Amazon S3, Azure, HDFS и с локально хранящимися таблицами.


## Создание таблицы {#create-table}

Обратите внимание, что таблица Iceberg должна уже существовать в хранилище. Данная команда не принимает DDL-параметры для создания новой таблицы.

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

Описание аргументов совпадает с описанием аргументов движков `S3`, `AzureBlobStorage`, `HDFS` и `File` соответственно.
`format` указывает формат файлов данных в таблице Iceberg.

Параметры движка можно задать с помощью [именованных коллекций](../../../operations/named-collections.md)

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

Движок таблиц `Iceberg` является псевдонимом `IcebergS3`.


## Эволюция схемы {#schema-evolution}

В настоящее время с помощью ClickHouse можно читать таблицы Iceberg, схема которых изменялась с течением времени. Поддерживается чтение таблиц, в которых столбцы были добавлены и удалены, а также изменён их порядок. Также можно изменить столбец с обязательным значением на столбец, допускающий NULL. Кроме того, поддерживается разрешённое приведение типов для простых типов, а именно:

- int -> long
- float -> double
- decimal(P, S) -> decimal(P', S), где P' > P.

В настоящее время невозможно изменять вложенные структуры или типы элементов внутри массивов и словарей (maps).

Чтобы читать таблицу, схема которой изменилась после её создания, с динамическим выводом схемы, установите allow_dynamic_metadata_for_data_lakes = true при создании таблицы.


## Отсечение партиций {#partition-pruning}

ClickHouse поддерживает отсечение партиций при выполнении SELECT-запросов к таблицам Iceberg, что позволяет оптимизировать производительность запросов за счёт пропуска нерелевантных файлов данных. Чтобы включить отсечение партиций, установите `use_iceberg_partition_pruning = 1`. Дополнительную информацию об отсечении партиций Iceberg см. по адресу https://iceberg.apache.org/spec/#partitioning


## Путешествие во времени {#time-travel}

ClickHouse поддерживает путешествие во времени для таблиц Iceberg, что позволяет запрашивать исторические данные по конкретной временной метке или идентификатору снимка.


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

- **Снимки** обычно создаются в следующих случаях:
  - При записи новых данных в таблицу
  - При выполнении компактификации данных

- **Изменения схемы обычно не создают снимки** — это приводит к важным особенностям поведения при использовании путешествия во времени с таблицами, схема которых изменялась.

### Примеры сценариев {#example-scenarios}

Все сценарии написаны на Spark, поскольку ClickHouse пока не поддерживает запись в таблицы Iceberg.

#### Сценарий 1: Изменения схемы без новых снимков {#scenario-1}

Рассмотрим следующую последовательность операций:

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

 ts1 = now() // Фрагмент псевдокода

-- Изменение таблицы для добавления нового столбца
 ALTER TABLE spark_catalog.db.time_travel_example ADD COLUMN (price double)

 ts2 = now()

-- Вставка данных в таблицу
 INSERT INTO spark_catalog.db.time_travel_example VALUES (2, 'Venus', 100)

  ts3 = now()

-- Запрос к таблице на каждую временную метку
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

Результаты запросов на разные временные метки:

- На ts1 и ts2: отображаются только исходные два столбца
- На ts3: отображаются все три столбца, с NULL для цены первой строки

#### Сценарий 2: Различия между исторической и текущей схемой {#scenario-2}

Запрос с путешествием во времени на текущий момент может показать схему, отличную от текущей таблицы:

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

-- Запрос к таблице на текущий момент, но с использованием синтаксиса временной метки

  SELECT * FROM spark_catalog.db.time_travel_example_2 TIMESTAMP AS OF ts;

    +------------+------------+
    |order_number|product_code|
    +------------+------------+
    |           2|       Venus|
    +------------+------------+

-- Запрос к таблице на текущий момент
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
  order_number int,
  product_code string
  )
  USING iceberg
  OPTIONS ('format-version'='2');

  ts = now();

-- Запрос к таблице на определённую временную метку
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- Завершается с ошибкой: Cannot find a snapshot older than ts.
```

В ClickHouse поведение согласуется со Spark. Вы можете мысленно заменить запросы SELECT из Spark на запросы SELECT в ClickHouse — они будут работать одинаково.


## Разрешение файла метаданных {#metadata-file-resolution}

При использовании движка таблиц `Iceberg` в ClickHouse система должна найти корректный файл metadata.json, описывающий структуру таблицы Iceberg. Ниже описан процесс разрешения:

### Поиск кандидатов {#candidate-search}

1. **Прямое указание пути**:

- Если задан параметр `iceberg_metadata_file_path`, система использует этот точный путь, объединяя его с путем к каталогу таблицы Iceberg.
- При указании этого параметра все остальные настройки разрешения игнорируются.

2. **Сопоставление UUID таблицы**:

- Если указан параметр `iceberg_metadata_table_uuid`, система:
  - Просматривает только файлы `.metadata.json` в каталоге `metadata`
  - Фильтрует файлы, содержащие поле `table-uuid`, соответствующее указанному UUID (без учета регистра)

3. **Поиск по умолчанию**:

- Если ни один из вышеуказанных параметров не задан, все файлы `.metadata.json` в каталоге `metadata` становятся кандидатами

### Выбор самого актуального файла {#most-recent-file}

После определения файлов-кандидатов по вышеуказанным правилам система определяет, какой из них является самым актуальным:

- Если включен параметр `iceberg_recent_metadata_file_by_last_updated_ms_field`:
  - Выбирается файл с наибольшим значением `last-updated-ms`

- В противном случае:
  - Выбирается файл с наибольшим номером версии
  - (Версия указывается как `V` в именах файлов формата `V.metadata.json` или `V-uuid.metadata.json`)

**Примечание**: Все упомянутые параметры являются настройками уровня движка и должны быть указаны при создании таблицы, как показано ниже:

```sql
CREATE TABLE example_table ENGINE = Iceberg(
    's3://bucket/path/to/iceberg_table'
) SETTINGS iceberg_metadata_table_uuid = '6f6f6407-c6a5-465f-a808-ea8900e35a38';
```

**Примечание**: Хотя каталоги Iceberg обычно обрабатывают разрешение метаданных, движок таблиц `Iceberg` в ClickHouse напрямую интерпретирует файлы, хранящиеся в S3, как таблицы Iceberg, поэтому понимание этих правил разрешения имеет важное значение.


## Кэш данных {#data-cache}

Движок таблиц `Iceberg` и табличная функция поддерживают кэширование данных аналогично хранилищам `S3`, `AzureBlobStorage`, `HDFS`. Подробнее см. [здесь](../../../engines/table-engines/integrations/s3.md#data-cache).


## Кэш метаданных {#metadata-cache}

Движок таблиц `Iceberg` и табличная функция поддерживают кэширование метаданных, в котором хранится информация о файлах манифестов, списках манифестов и JSON-метаданных. Кэш хранится в оперативной памяти. Эта функциональность управляется настройкой `use_iceberg_metadata_files_cache`, которая включена по умолчанию.


## См. также {#see-also}

- [Табличная функция iceberg](/sql-reference/table-functions/iceberg.md)
