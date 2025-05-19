---
description: 'Обеспечивает интерфейс, похожий на таблицу, только для чтения, для таблиц Apache Iceberg в Amazon S3, Azure, HDFS или локально.'
sidebar_label: 'iceberg'
sidebar_position: 90
slug: /sql-reference/table-functions/iceberg
title: 'iceberg'
---


# Функция таблицы iceberg {#iceberg-table-function}

Обеспечивает интерфейс, похожий на таблицу, только для чтения, для таблиц Apache [Iceberg](https://iceberg.apache.org/) в Amazon S3, Azure, HDFS или локально.

## Синтаксис {#syntax}

```sql
icebergS3(url [, NOSIGN | ключ_access_id, секретный_ключ_access, [токен_сессии]] [,format] [,compression_method])
icebergS3(named_collection[, option=value [,..]])

icebergAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
icebergAzure(named_collection[, option=value [,..]])

icebergHDFS(path_to_table, [,format] [,compression_method])
icebergHDFS(named_collection[, option=value [,..]])

icebergLocal(path_to_table, [,format] [,compression_method])
icebergLocal(named_collection[, option=value [,..]])
```

## Аргументы {#arguments}

Описание аргументов совпадает с описанием аргументов в функциях таблиц `s3`, `azureBlobStorage`, `HDFS` и `file` соответственно. `format` обозначает формат файлов данных в таблице Iceberg.

### Возвращаемое значение {#returned-value}
Таблица с указанной структурой для чтения данных в указанной таблице Iceberg.

### Пример {#example}

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
На данный момент ClickHouse поддерживает чтение версий 1 и 2 формата Iceberg через функции таблиц `icebergS3`, `icebergAzure`, `icebergHDFS` и `icebergLocal`, а также движки таблиц `IcebergS3`, `icebergAzure`, `IcebergHDFS` и `IcebergLocal`.
:::

## Определение именованной коллекции {#defining-a-named-collection}

Вот пример настройки именованной коллекции для хранения URL и учетных данных:

```xml
<clickhouse>
    <named_collections>
        <iceberg_conf>
            <url>http://test.s3.amazonaws.com/clickhouse-bucket/</url>
            <ключ_access_id>test</ключ_access_id>
            <секретный_ключ_access>test</секретный_ключ_access>
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
В данный момент с помощью CH вы можете читать таблицы iceberg, схема которых изменилась со временем. Мы поддерживаем чтение таблиц, в которых были добавлены и удалены колонки, а также изменен их порядок. Вы также можете изменить колонку, в которой требуется значение, на такую, в которой допускается NULL. Кроме того, мы поддерживаем разрешенные приведения типов для простых типов, а именно:  
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S) где P' > P. 

В данный момент нельзя изменять вложенные структуры или типы элементов в массивах и картах.

## Устранение партиций {#partition-pruning}

ClickHouse поддерживает устранение партиций во время запросов SELECT для таблиц Iceberg, что помогает оптимизировать производительность запросов за счет пропуска неуместных файлов данных. Чтобы включить устранение партиций, установите `use_iceberg_partition_pruning = 1`. Для получения дополнительной информации о устранении партиций Iceberg обратитесь к https://iceberg.apache.org/spec/#partitioning.

## Путешествие во времени {#time-travel}

ClickHouse поддерживает путешествие во времени для таблиц Iceberg, позволяя вам запрашивать исторические данные с определенной меткой времени или идентификатором снимка.

### Основное использование {#basic-usage}
 ```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_timestamp_ms = 1714636800000
 ```

 ```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_snapshot_id = 3547395809148285433
 ```

Примечание: Вы не можете указать оба параметра `iceberg_timestamp_ms` и `iceberg_snapshot_id` в одном и том же запросе.

### Важные соображения {#important-considerations}

- **Снимки** обычно создаются, когда:
    - Новые данные записываются в таблицу
    - Выполняется какая-то форма компактации данных

- **Изменения схемы обычно не создают снимки** - Это приводит к важным аспектам использования путешествия во времени с таблицами, которые претерпели эволюцию схемы.

### Примерные сценарии {#example-scenarios}

Все сценарии написаны в Spark, потому что CH пока не поддерживает запись в таблицы Iceberg.

#### Сценарий 1: Изменения схемы без новых снимков {#scenario-1}

Рассмотрим эту последовательность операций:

 ```sql
 -- Создать таблицу с двумя колонками
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- Вставить данные в таблицу
  INSERT INTO spark_catalog.db.time_travel_example VALUES 
    (1, 'Mars')

  ts1 = now() // Часть псевдокода

-- Изменить таблицу, чтобы добавить новую колонку
  ALTER TABLE spark_catalog.db.time_travel_example ADD COLUMN (price double)
 
  ts2 = now()

-- Вставить данные в таблицу
  INSERT INTO spark_catalog.db.time_travel_example VALUES (2, 'Venus', 100)

   ts3 = now()

-- Запросить таблицу на каждой метке времени
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

Результаты запросов в разные метки времени:

- На ts1 и ts2: Появляются только оригинальные две колонки
- На ts3: Появляются все три колонки, с NULL для цены первого ряда

#### Сценарий 2:  Исторические и текущие различия в схеме {#scenario-2}

Запрос путешествия во времени в текущий момент может показать другую схему, чем текущая таблица:

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

-- Изменить таблицу, чтобы добавить новую колонку
  ALTER TABLE spark_catalog.db.time_travel_example_2 ADD COLUMN (price double);

  ts = now();

-- Запросить таблицу в текущий момент, но с использованием синтаксиса метки времени

  SELECT * FROM spark_catalog.db.time_travel_example_2 TIMESTAMP AS OF ts;

    +------------+------------+
    |order_number|product_code|
    +------------+------------+
    |           2|       Venus|
    +------------+------------+

-- Запросить таблицу в текущий момент
  SELECT * FROM spark_catalog.db.time_travel_example_2;


    +------------+------------+-----+
    |order_number|product_code|price|
    +------------+------------+-----+
    |           2|       Venus| NULL|
    +------------+------------+-----+
```

Это происходит потому, что `ALTER TABLE` не создает нового снимка, но для текущей таблицы Spark берет значение `schema_id` из последнего файла метаданных, а не снимка.

#### Сценарий 3:  Исторические и текущие различия в схеме {#scenario-3}

Второе, что в процессе путешествия во времени вы не можете получить состояние таблицы до того, как в нее были записаны данные:

```sql
-- Создать таблицу
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2');

  ts = now();

-- Запросить таблицу на конкретной метке времени
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- Завершается с ошибкой: Невозможно найти снимок старше ts.
```

В ClickHouse поведение согласуется с Spark. Вы можете мысленно заменить запросы Select Spark на запросы Select ClickHouse, и это будет работать так же.

## Разрешение файла метаданных {#metadata-file-resolution}

При использовании функции таблицы `iceberg` в ClickHouse системе необходимо найти правильный файл metadata.json, который описывает структуру таблицы Iceberg. Вот как работает этот процесс разрешения:

### Поиск кандидатов (в порядке приоритета) {#candidate-search}

1. **Прямое указание пути**:
   * Если вы установили `iceberg_metadata_file_path`, система использует этот точный путь, комбинируя его с путем к директории таблицы Iceberg.
   * Когда этот параметр указан, все другие параметры разрешения игнорируются.

2. **Совпадение UUID таблицы**:
   * Если указан `iceberg_metadata_table_uuid`, система:
     * Будет искать только `.metadata.json` файлы в директории `metadata`
     * Отфильтрует файлы, содержащие поле `table-uuid`, совпадающее с указанным UUID (не чувствительно к регистру)

3. **Поиск по умолчанию**:
   * Если ни один из вышеуказанных параметров не установлен, все `.metadata.json` файлы в директории `metadata` становятся кандидатами

### Выбор самого последнего файла {#most-recent-file}

После идентификации кандидатов по вышеуказанным правилам система определяет, какой из них самый последний:

* Если включен `iceberg_recent_metadata_file_by_last_updated_ms_field`:
  * Выбирается файл с наибольшим значением `last-updated-ms`

* В противном случае:
  * Выбирается файл с самым высоким номером версии
  * (Версия появляется как `V` в именах файлов, отформатированных как `V.metadata.json` или `V-uuid.metadata.json`)

**Примечание**: Все упомянутые настройки являются настройками функции таблицы (а не глобальными или на уровне запроса) и должны указываться, как показано ниже:

```sql 
SELECT * FROM iceberg('s3://bucket/path/to/iceberg_table', 
    SETTINGS iceberg_metadata_table_uuid = 'a90eed4c-f74b-4e5b-b630-096fb9d09021');
```

**Примечание**: Хотя Каталоги Iceberg обычно обрабатывают разрешение метаданных, функция таблицы `iceberg` в ClickHouse непосредственно интерпретирует файлы, хранящиеся в S3, как таблицы Iceberg, поэтому понимание этих правил разрешения важно.

## Кэш метаданных {#metadata-cache}

Движок таблицы `Iceberg` и функция таблицы поддерживают кэш метаданных, хранящий информацию о манифест-файлах, списке манифестов и json метаданных. Кэш хранится в памяти. Эта функция контролируется параметром `use_iceberg_metadata_files_cache`, который включен по умолчанию.

## Псевдонимы {#aliases}

Функция таблицы `iceberg` сейчас является псевдонимом для `icebergS3`.

## См. Также {#see-also}

- [Движок Iceberg](/engines/table-engines/integrations/iceberg.md)
- [Функция таблицы iceberg cluster](/sql-reference/table-functions/icebergCluster.md)
