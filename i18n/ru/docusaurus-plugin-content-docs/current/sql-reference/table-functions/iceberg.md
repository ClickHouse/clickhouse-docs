---
description: 'Предоставляет интерфейс, похожий на таблицу, только для чтения для таблиц Apache Iceberg в Amazon S3, Azure, HDFS или установленным локально.'
sidebar_label: 'iceberg'
sidebar_position: 90
slug: /sql-reference/table-functions/iceberg
title: 'iceberg'
---


# iceberg Функция Таблицы {#iceberg-table-function}

Предоставляет интерфейс, похожий на таблицу, только для чтения для таблиц Apache [Iceberg](https://iceberg.apache.org/) в Amazon S3, Azure, HDFS или установленным локально.

## Синтаксис {#syntax}

```sql
icebergS3(url [, NOSIGN | ключ_доступа, секретный_ключ_доступа, [session_token]] [,формат] [,метод_сжатия])
icebergS3(named_collection[, option=value [,..]])

icebergAzure(connection_string|storage_account_url, container_name, blobpath, [,имя_учетной_записи], [,ключ_учетной_записи] [,формат] [,метод_сжатия])
icebergAzure(named_collection[, option=value [,..]])

icebergHDFS(path_to_table, [,формат] [,метод_сжатия])
icebergHDFS(named_collection[, option=value [,..]])

icebergLocal(path_to_table, [,формат] [,метод_сжатия])
icebergLocal(named_collection[, option=value [,..]])
```

## Аргументы {#arguments}

Описание аргументов совпадает с описанием аргументов в функциях таблиц `s3`, `azureBlobStorage`, `HDFS` и `file` соответственно.
`формат` обозначает формат файлов данных в таблице Iceberg.

### Возвращаемое значение {#returned-value}
Таблица со структурой, указанной для чтения данных в указанной таблице Iceberg.

### Пример {#example}

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
ClickHouse в настоящее время поддерживает чтение форматов v1 и v2 Iceberg через функции таблиц `icebergS3`, `icebergAzure`, `icebergHDFS` и `icebergLocal`, а также движки таблиц `IcebergS3`, `icebergAzure`, `IcebergHDFS` и `IcebergLocal`.
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
В данный момент с помощью ClickHouse можно читать таблицы Iceberg, схема которых изменялась со временем. Мы в настоящее время поддерживаем чтение таблиц, в которых столбцы были добавлены и удалены, а их порядок изменен. Вы также можете изменить столбец, в котором значение является обязательным, на столбец, где значение NULL допускается. Кроме того, мы поддерживаем допустимое приведение типов для простых типов, а именно:
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S) где P' > P.

В настоящее время невозможно изменить вложенные структуры или типы элементов внутри массивов и карт.

## Обрезка партиций {#partition-pruning}

ClickHouse поддерживает обрезку партиций во время запросов SELECT для таблиц Iceberg, что помогает оптимизировать производительность запросов, пропуская неактуальные файлы данных. В настоящее время это работает только с идентичными преобразованиями и временными преобразованиями (час, день, месяц, год). Чтобы включить обрезку партиций, установите `use_iceberg_partition_pruning = 1`.


## Перемещение во времени {#time-travel}

ClickHouse поддерживает перемещение во времени для таблиц Iceberg, позволяя вам выполнять запросы к историческим данным с определенной временной меткой или идентификатором снимка.

### Основное использование {#basic-usage}
 ```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_timestamp_ms = 1714636800000
 ```

 ```sql
 SELECT * FROM example_table ORDER BY 1 
 SETTINGS iceberg_snapshot_id = 3547395809148285433
 ```

Примечание: Вы не можете указать как `iceberg_timestamp_ms`, так и `iceberg_snapshot_id` параметры в одном запросе.

### Важные соображения {#important-considerations}

- **Снимки** обычно создаются, когда:
    - Новые данные записываются в таблицу
    - Выполняется какое-то сжатие данных

- **Изменения схемы обычно не создают снимки** - это приводит к важным поведениям при использовании перемещения во времени с таблицами, которые претерпели эволюцию схемы.

### Примерные сценарии {#example-scenarios}

Все сценарии написаны в Spark, потому что ClickHouse пока не поддерживает запись в таблицы Iceberg.

#### Сценарий 1: Изменения схемы без новых снимков {#scenario-1}

Рассмотрим эту последовательность операций:

 ```sql
 -- Создание таблицы с двумя столбцами
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2')

-- Вставка данных в таблицу
  INSERT INTO spark_catalog.db.time_travel_example VALUES 
    (1, 'Mars')

  ts1 = now() // Часть псевдокода

-- Изменение таблицы для добавления нового столбца
  ALTER TABLE spark_catalog.db.time_travel_example ADD COLUMN (price double)
 
  ts2 = now()

-- Вставка данных в таблицу
  INSERT INTO spark_catalog.db.time_travel_example VALUES (2, 'Venus', 100)

   ts3 = now()

-- Запрос к таблице на каждом временном метке
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

Результаты запросов на разных временных метках:

- На ts1 и ts2: Появляются только исходные два столбца
- На ts3: Все три столбца появляются, при этом цена первого ряда равна NULL

#### Сценарий 2: Различия в исторической и текущей схеме {#scenario-2}


Запрос о перемещении во времени в текущий момент может показать другую схему, чем текущая таблица:


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

-- Запрос к таблице в текущий момент, но с использованием синтаксиса временной метки

  SELECT * FROM spark_catalog.db.time_travel_example_2 TIMESTAMP AS OF ts;

    +------------+------------+
    |order_number|product_code|
    +------------+------------+
    |           2|       Venus|
    +------------+------------+

-- Запрос к таблице в текущий момент
  SELECT * FROM spark_catalog.db.time_travel_example_2;


    +------------+------------+-----+
    |order_number|product_code|price|
    +------------+------------+-----+
    |           2|       Venus| NULL|
    +------------+------------+-----+
```

Это происходит потому, что `ALTER TABLE` не создает новый снимок, а для текущей таблицы Spark берет значение `schema_id` из последнего файла метаданных, а не из снимка.

#### Сценарий 3: Различия в исторической и текущей схеме {#scenario-3}

Второй момент заключается в том, что при перемещении во времени вы не можете получить состояние таблицы до того, как в нее были записаны какие-либо данные:

```sql
-- Создание таблицы
  CREATE TABLE IF NOT EXISTS spark_catalog.db.time_travel_example_3 (
  order_number bigint, 
  product_code string
  ) 
  USING iceberg 
  OPTIONS ('format-version'='2');

  ts = now();

-- Запрос к таблице на конкретной временной метке
  SELECT * FROM spark_catalog.db.time_travel_example_3 TIMESTAMP AS OF ts; -- Заканчивается с ошибкой: Не удается найти снимок старше ts.
```

В ClickHouse поведение согласуется с Spark. Вы можете мысленно заменить запросы Select из Spark на запросы Select из ClickHouse, и это будет работать так же.  

## Псевдонимы {#aliases}

Функция таблицы `iceberg` в настоящее время является псевдонимом для `icebergS3`.

## См. также {#see-also}

- [Движок Iceberg](/engines/table-engines/integrations/iceberg.md)
- [Функция таблицы кластеров Iceberg](/sql-reference/table-functions/icebergCluster.md)
