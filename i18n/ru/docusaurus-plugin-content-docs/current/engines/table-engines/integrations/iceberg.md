---
description: 'Этот движок предоставляет интеграцию только для чтения с существующими таблицами Apache Iceberg в Amazon S3, Azure, HDFS и локально хранимыми таблицами.'
sidebar_label: 'Iceberg'
sidebar_position: 90
slug: /engines/table-engines/integrations/iceberg
title: 'Движок таблиц Iceberg'
---


# Движок таблиц Iceberg {#iceberg-table-engine}

:::warning 
Мы рекомендуем использовать [табличную функцию Iceberg](/sql-reference/table-functions/iceberg.md) для работы с данными Iceberg в ClickHouse. Табличная функция Iceberg в настоящее время предоставляет достаточный функционал, предлагая частичный интерфейс только для чтения для таблиц Iceberg.

Движок таблиц Iceberg доступен, но может иметь ограничения. ClickHouse изначально не был спроектирован для поддержки таблиц с внешне изменяющимися схемами, что может повлиять на функциональность движка таблиц Iceberg. В результате некоторые функции, которые работают с обычными таблицами, могут быть недоступны или могут не работать корректно, особенно при использовании старого анализатора.

Для оптимальной совместимости мы рекомендуем использовать табличную функцию Iceberg, пока мы продолжаем улучшать поддержку движка таблиц Iceberg.
:::

Этот движок предоставляет интеграцию только для чтения с существующими таблицами Apache [Iceberg](https://iceberg.apache.org/) в Amazon S3, Azure, HDFS и локально хранимыми таблицами.

## Создание таблицы {#create-table}

Обратите внимание, что таблица Iceberg уже должна существовать в хранилище, эта команда не принимает DDL параметры для создания новой таблицы.

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

Параметры движка могут быть указаны с помощью [Именованных Коллекций](../../../operations/named-collections.md)

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

Движок таблиц `Iceberg` сейчас является псевдонимом для `IcebergS3`.

## Эволюция схемы {#schema-evolution}
На данный момент с помощью CH вы можете читать таблицы Iceberg, схема которых изменялась со временем. В настоящее время мы поддерживаем чтение таблиц, в которых были добавлены и удалены колонки, а их порядок изменился. Вы также можете изменить колонку, в которой значение обязательно, на колонку, в которой допустим NULL. Кроме того, мы поддерживаем разрешённое приведение типов для простых типов, а именно:  
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S), где P' > P.

В настоящее время невозможно изменить вложенные структуры или типы элементов в массивах и картах.

Чтобы прочитать таблицу, в которой схема изменилась после её создания с динамическим выводом схемы, установите allow_dynamic_metadata_for_data_lakes = true при создании таблицы.

## Отсечение партиций {#partition-pruning}

ClickHouse поддерживает отсечение партиций во время операторов SELECT для таблиц Iceberg, что помогает оптимизировать производительность запросов, пропуская несущественные файлы данных. Чтобы включить отсечение партиций, установите `use_iceberg_partition_pruning = 1`. Для получения дополнительной информации об отсечении партиций Iceberg обратитесь по адресу https://iceberg.apache.org/spec/#partitioning

## Путешествия во времени {#time-travel}

ClickHouse поддерживает путешествия во времени для таблиц Iceberg, позволяя вам запрашивать исторические данные с конкретной меткой времени или идентификатором снимка.

### Основное использование {#basic-usage}
 ```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_timestamp_ms = 1714636800000
 ```

 ```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_snapshot_id = 3547395809148285433
 ```

Примечание: Вы не можете указать параметры `iceberg_timestamp_ms` и `iceberg_snapshot_id` в одном и том же запросе.

### Важные соображения {#important-considerations}

- **Снимки** обычно создаются, когда:
    - Новые данные записываются в таблицу
    - Выполняется какая-либо компакция данных

- **Изменения схемы обычно не создают снимки** - Это приводит к важным эффектам при использовании путешествий во времени с таблицами, которые претерпели изменения схемы.

### Примеры сценариев {#example-scenarios}

Все сценарии написаны в Spark, так как CH пока не поддерживает запись в таблицы Iceberg.

#### Сценарий 1: Изменения схемы без новых снимков {#scenario-1}

Рассмотрим следующую последовательность операций:

 ```sql
 -- Создайте таблицу с двумя колонками
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- Вставьте данные в таблицу
  INSERT INTO spark_catalog.db.time_travel_example VALUES 
    (1, 'Mars')

  ts1 = now() // Фрагмент псевдокода

-- Измените таблицу, чтобы добавить новую колонку
  ALTER TABLE spark_catalog.db.time_travel_example ADD COLUMN (price double)
 
  ts2 = now()

-- Вставьте данные в таблицу
  INSERT INTO spark_catalog.db.time_travel_example VALUES (2, 'Venus', 100)

   ts3 = now()

-- Запросите таблицу для каждого временного штампа
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

Результаты запроса в разные временные штампы:

- На ts1 и ts2: Появляются только оригинальные две колонки
- На ts3: Появляются все три колонки, с NULL для цены первой строки

#### Сценарий 2: Различия между исторической и текущей схемой {#scenario-2}


Запрос путешествия во времени в текущий момент может показать другую схему, чем текущая таблица:

```sql
-- Создайте таблицу
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_2 (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- Вставьте первоначальные данные в таблицу
  INSERT INTO spark_catalog.db.time_travel_example_2 VALUES (2, 'Venus');

-- Измените таблицу, чтобы добавить новую колонку
  ALTER TABLE spark_catalog.db.time_travel_example_2 ADD COLUMN (price double);

  ts = now();

-- Запросите таблицу в текущий момент, но используя синтаксис временной метки

  SELECT * FROM spark_catalog.db.time_travel_example_2 TIMESTAMP AS OF ts;

    +------------+------------+
    |order_number|product_code|
    +------------+------------+
    |           2|       Venus|
    +------------+------------+

-- Запросите таблицу в текущий момент
  SELECT * FROM spark_catalog.db.time_travel_example_2;

    +------------+------------+-----+
    |order_number|product_code|price|
    +------------+------------+-----+
    |           2|       Venus| NULL|
    +------------+------------+-----+
```

Это происходит потому, что `ALTER TABLE` не создает новый снимок, но для текущей таблицы Spark берет значение `schema_id` из последнего файла метаданных, а не из снимка.

#### Сценарий 3: Историческое состояние таблицы до записи {#scenario-3}

Во время путешествия во времени вы не можете получить состояние таблицы до того, как в нее были записаны данные:

```sql
-- Создайте таблицу
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number int, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2');

  ts = now();

-- Запросите таблицу в конкретный временной штамп
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- Завершилось с ошибкой: Невозможно найти снимок, который старше ts.
```


В ClickHouse поведение согласуется с Spark. Вы можете мысленно заменить запросы выборки Spark на запросы выборки ClickHouse, и это будет работать так же.

## Разрешение файла метаданных {#metadata-file-resolution}
При использовании движка таблиц `Iceberg` в ClickHouse система должна найти правильный файл metadata.json, который описывает структуру таблицы Iceberg. Вот как работает этот процесс разрешения:

### Поиск кандидатов (в порядке приоритета) {#candidate-search}

1. **Спецификация прямого пути**:
   * Если вы установите `iceberg_metadata_file_path`, система будет использовать этот точный путь, объединив его с путем к директории таблицы Iceberg.
   * Когда эта настройка предоставлена, все другие настройки разрешения игнорируются.

2. **Сопоставление UUID таблицы**:
   * Если указан `iceberg_metadata_table_uuid`, система будет:
     * Смотреть только на файлы `.metadata.json` в директории `metadata`
     * Фильтровать файлы, содержащие поле `table-uuid`, соответствующее вашему указанному UUID (не учитывая регистр)

3. **Поиск по умолчанию**:
   * Если ни одна из вышеуказанных настроек не предоставлена, все файлы `.metadata.json` в директории `metadata` становятся кандидатами

### Выбор самого последнего файла {#most-recent-file}

После идентификации кандидатных файлов с использованием вышеуказанных правил система определяет, какой из них самый последний:

* Если включено `iceberg_recent_metadata_file_by_last_updated_ms_field`:
  * Выбирается файл с наибольшим значением `last-updated-ms`

* В противном случае:
  * Выбирается файл с самым высоким номером версии
  * (Версия отображается как `V` в именах файлов, отформатированных как `V.metadata.json` или `V-uuid.metadata.json`)

**Примечание**: Все упомянутые настройки являются настройками уровня движка и должны быть указаны при создании таблицы, как показано ниже:

```sql 
CREATE TABLE example_table ENGINE = Iceberg(
    's3://bucket/path/to/iceberg_table'
) SETTINGS iceberg_metadata_table_uuid = '6f6f6407-c6a5-465f-a808-ea8900e35a38';
```

**Примечание**: Хотя каталоги Iceberg обычно обрабатывают разрешение метаданных, движок таблиц `Iceberg` в ClickHouse непосредственно интерпретирует файлы, хранящиеся в S3, как таблицы Iceberg, поэтому понимание этих правил разрешения имеет важное значение.

## Кэш данных {#data-cache}

Движок таблиц `Iceberg` и табличная функция поддерживают кэширование данных аналогично хранилищам `S3`, `AzureBlobStorage`, `HDFS`. См. [здесь](../../../engines/table-engines/integrations/s3.md#data-cache).

## Кэш метаданных {#metadata-cache}

Движок таблиц `Iceberg` и табличная функция поддерживают кэш метаданных, хранящий информацию о manifest-файлах, списке манифестов и метаданных JSON. Кэш хранится в памяти. Эта функция управляется установкой `use_iceberg_metadata_files_cache`, которая включена по умолчанию.

## См. также {#see-also}

- [табличная функция iceberg](/sql-reference/table-functions/iceberg.md)
