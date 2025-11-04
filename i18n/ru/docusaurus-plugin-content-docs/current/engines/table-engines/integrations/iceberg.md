---
slug: '/engines/table-engines/integrations/iceberg'
sidebar_label: Iceberg
sidebar_position: 90
description: 'Этот движок предоставляет интеграцию только для чтения с существующими'
title: 'Движок таблиц Iceberg'
doc_type: reference
---
# Движок таблиц Iceberg {#iceberg-table-engine}

:::warning 
Мы рекомендуем использовать [функцию таблицы Iceberg](/sql-reference/table-functions/iceberg.md) для работы с данными Iceberg в ClickHouse. Функция таблицы Iceberg в настоящее время предоставляет достаточную функциональность, предлагая частичный интерфейс только для чтения для таблиц Iceberg.

Движок таблицы Iceberg доступен, но может иметь ограничения. ClickHouse изначально не был спроектирован для поддержки таблиц с изменяющимися схемами, что может повлиять на функциональность движка таблицы Iceberg. В результате некоторые функции, которые работают с обычными таблицами, могут быть недоступны или не работать корректно, особенно при использовании старого анализатора.

Для оптимальной совместимости мы предлагаем использовать функцию таблицы Iceberg, пока мы продолжаем улучшать поддержку движка таблицы Iceberg.
:::

Этот движок предоставляет интеграцию только для чтения с существующими таблицами Apache [Iceberg](https://iceberg.apache.org/) в Amazon S3, Azure, HDFS и локально хранимыми таблицами.

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

Параметры движка могут быть указаны с использованием [именованных коллекций](../../../operations/named-collections.md).

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

Движок таблицы `Iceberg` теперь является псевдонимом для `IcebergS3`.

## Эволюция схемы {#schema-evolution}

На данный момент с помощью CH вы можете читать таблицы iceberg, схема которых изменялась со временем. В настоящее время мы поддерживаем чтение таблиц, в которых были добавлены и удалены колонки, а их порядок изменился. Вы также можете изменить колонку, где значение обязательно, на ту, где NULL допустимо. Дополнительно мы поддерживаем разрешенные преобразования типов для простых типов, а именно:  
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S) где P' > P.

В настоящее время невозможно изменить вложенные структуры или типы элементов внутри массивов и карт.

Чтобы прочитать таблицу, схема которой изменилась после ее создания с динамическим выводом схемы, установите allow_dynamic_metadata_for_data_lakes = true при создании таблицы.

## Оптимизация партиций {#partition-pruning}

ClickHouse поддерживает оптимизацию партиций во время запросов SELECT для таблиц Iceberg, что помогает оптимизировать производительность запросов, пропуская неактуальные файлы данных. Чтобы включить оптимизацию партиций, установите `use_iceberg_partition_pruning = 1`. Для получения дополнительной информации об оптимизации партиций iceberg обратитесь к https://iceberg.apache.org/spec/#partitioning.

## Путешествие во времени {#time-travel}

ClickHouse поддерживает путешествие во времени для таблиц Iceberg, что позволяет вам запрашивать исторические данные с определенной меткой времени или идентификатором снимка.

## Обработка таблиц с удаленными строками {#deleted-rows}

В настоящее время поддерживаются только таблицы Iceberg с [позиционными удалениями](https://iceberg.apache.org/spec/#position-delete-files).

Следующие методы удаления **не поддерживаются**:
- [Удостоверяющие удаления](https://iceberg.apache.org/spec/#equality-delete-files)
- [Векторы удаления](https://iceberg.apache.org/spec/#deletion-vectors) (введены в версии 3)

### Основное использование {#basic-usage}
```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_timestamp_ms = 1714636800000
```

```sql
SELECT * FROM example_table ORDER BY 1 
SETTINGS iceberg_snapshot_id = 3547395809148285433
```

Примечание: Вы не можете указать одновременно параметры `iceberg_timestamp_ms` и `iceberg_snapshot_id` в одном запросе.

### Важные моменты {#important-considerations}

- **Снимки** обычно создаются, когда:
  - Новые данные записываются в таблицу
  - Выполняется какая-либо компоновка данных

- **Изменения схемы обычно не создают снимков** - Это приводит к важным особенностям при использовании путешествия во времени с таблицами, которые претерпели эволюцию схемы.

### Примеры сценариев {#example-scenarios}

Все сценарии написаны в Spark, поскольку CH еще не поддерживает запись в таблицы Iceberg.

#### Сценарий 1: Изменения схемы без новых снимков {#scenario-1}

Рассмотрим эту последовательность операций:

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

- На ts1 и ts2: Появляются только оригинальные две колонки
- На ts3: Появляются все три колонки, при этом для цены первой строки значение NULL

#### Сценарий 2: Исторические и текущие различия в схеме {#scenario-2}

Запрос "путешествие во времени" в текущий момент может показать схему, отличающуюся от текущей таблицы:

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

Это происходит потому, что `ALTER TABLE` не создает новый снимок, но для текущей таблицы Spark берет значение `schema_id` из последнего файла метаданных, а не из снимка.

#### Сценарий 3: Исторические и текущие различия в схеме {#scenario-3}

Второй момент заключается в том, что, выполняя путешествие во времени, вы не можете получить состояние таблицы до того, как в нее были записаны какие-либо данные:

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

В ClickHouse поведение совпадает со Spark. Вы можете мысленно заменить запросы Select Spark на запросы Select ClickHouse, и это будет работать так же.

## Разрешение файлов метаданных {#metadata-file-resolution}

При использовании движка таблицы `Iceberg` в ClickHouse системе необходимо найти правильный файл metadata.json, который описывает структуру таблицы Iceberg. Вот как работает этот процесс разрешения:

### Поиск кандидатов {#candidate-search}

1. **Прямое указание пути**:
* Если вы задаете `iceberg_metadata_file_path`, система будет использовать этот точный путь, комбинируя его с путем к директории таблицы Iceberg.
* Когда это значение задано, все другие параметры разрешения игнорируются.
2. **Совпадение UUID таблицы**:
* Если указан `iceberg_metadata_table_uuid`, система будет:
  * Искать только `.metadata.json` файлы в директории `metadata`
  * Фильтровать файлы, содержащие поле `table-uuid`, совпадающее с вашим указанным UUID (без учета регистра)

3. **Поиск по умолчанию**:
* Если ни одно из вышеуказанных значений не указано, все `.metadata.json` файлы в директории `metadata` становятся кандидатами.

### Выбор самого последнего файла {#most-recent-file}

После определения кандидатных файлов с использованием вышеуказанных правил система определяет, какой из них является самым последним:

* Если включен `iceberg_recent_metadata_file_by_last_updated_ms_field`:
  * Выбирается файл с наибольшим значением `last-updated-ms`.

* В противном случае:
  * Выбирается файл с самым высоким номером версии,
  * (Версия отображается как `V` в именах файлов формата `V.metadata.json` или `V-uuid.metadata.json`).

**Примечание**: Все упомянутые настройки являются настройками уровня движка и должны быть указаны при создании таблицы, как показано ниже:

```sql
CREATE TABLE example_table ENGINE = Iceberg(
    's3://bucket/path/to/iceberg_table'
) SETTINGS iceberg_metadata_table_uuid = '6f6f6407-c6a5-465f-a808-ea8900e35a38';
```

**Примечание**: Хотя каталоги Iceberg обычно обрабатывают разрешение метаданных, движок таблицы `Iceberg` в ClickHouse напрямую интерпретирует файлы, хранящиеся в S3, как таблицы Iceberg, поэтому понимание этих правил разрешения имеет значение.

## Кэш данных {#data-cache}

Движок таблицы `Iceberg` и функция таблицы поддерживают кэширование данных так же, как и хранилища `S3`, `AzureBlobStorage`, `HDFS`. Смотрите [здесь](../../../engines/table-engines/integrations/s3.md#data-cache).

## Кэш метаданных {#metadata-cache}

Движок таблицы `Iceberg` и функция таблицы поддерживают кэш метаданных, хранящий информацию о файлах манифеста, списках манифестов и файлах JSON метаданных. Кэш хранится в памяти. Эта функция контролируется установкой `use_iceberg_metadata_files_cache`, которая включена по умолчанию.

## Смотрите также {#see-also}

- [функция таблицы iceberg](/sql-reference/table-functions/iceberg.md)