---
slug: /engines/table-engines/integrations/iceberg
sidebar_position: 90
sidebar_label: Iceberg
title: 'Движок таблиц Iceberg'
description: 'Этот движок обеспечивает только для чтения интеграцию с существующими таблицами Apache Iceberg в Amazon S3, Azure, HDFS и локально хранимыми таблицами.'
---


# Движок таблиц Iceberg

:::warning 
Мы рекомендуем использовать [Функцию таблицы Iceberg](/sql-reference/table-functions/iceberg.md) для работы с данными Iceberg в ClickHouse. В данный момент Функция таблицы Iceberg предоставляет достаточную функциональность, предлагая частичный интерфейс только для чтения для таблиц Iceberg.

Движок таблиц Iceberg доступен, но может иметь ограничения. ClickHouse изначально не был разработан для поддержки таблиц с внешне изменяющимися схемами, что может повлиять на функциональность движка таблиц Iceberg. В результате некоторые функции, которые работают с обычными таблицами, могут быть недоступны или функционировать неправильно, особенно при использовании старого анализатора.

Для оптимальной совместимости мы рекомендуем использовать Функцию таблицы Iceberg, пока мы продолжаем улучшать поддержку движка таблиц Iceberg.
:::

Этот движок обеспечивает только для чтения интеграцию с существующими таблицами Apache [Iceberg](https://iceberg.apache.org/) в Amazon S3, Azure, HDFS и локально хранимыми таблицами.

## Создание таблицы {#create-table}

Обратите внимание, что таблица Iceberg должна уже существовать в хранилище, эта команда не принимает параметры DDL для создания новой таблицы.

``` sql
CREATE TABLE iceberg_table_s3
    ENGINE = IcebergS3(url,  [, NOSIGN | access_key_id, secret_access_key, [session_token]], format, [,compression])

CREATE TABLE iceberg_table_azure
    ENGINE = IcebergAzure(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression])

CREATE TABLE iceberg_table_hdfs
    ENGINE = IcebergHDFS(path_to_table, [,format] [,compression_method])

CREATE TABLE iceberg_table_local
    ENGINE = IcebergLocal(path_to_table, [,format] [,compression_method])
```

**Аргументы движка**

Описание аргументов совпадает с описанием аргументов в движках `S3`, `AzureBlobStorage`, `HDFS` и `File` соответственно.
`format` обозначает формат файлов данных в таблице Iceberg.

Параметры движка могут быть указаны с использованием [Именованных коллекций](../../../operations/named-collections.md)

**Пример**

```sql
CREATE TABLE iceberg_table ENGINE=IcebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

Используя именованные коллекции:

``` xml
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

**Псевдонимы**

Движок таблиц `Iceberg` сейчас является псевдонимом для `IcebergS3`.

**Эволюция схемы**
В данный момент с помощью CH вы можете читать таблицы Iceberg, схема которых изменялась со временем. В настоящее время мы поддерживаем чтение таблиц, в которых были добавлены и удалены колонки, и изменён их порядок. Вы также можете изменить колонку, в которой значение обязательно, на колонку, где NULL разрешён. Кроме того, мы поддерживаем допустимые преобразования типов для простых типов, а именно:
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S), где P' > P. 

В данный момент невозможно изменить вложенные структуры или типы элементов внутри массивов и карт.

Чтобы прочитать таблицу, схема которой изменилась после ее создания с динамическим определением схемы, установите allow_dynamic_metadata_for_data_lakes = true при создании таблицы.

**Отсечение партиций**

ClickHouse поддерживает отсечение партиций во время запросов SELECT для таблиц Iceberg, что помогает оптимизировать производительность запросов, пропуская нерелевантные файлы данных. В данный момент это работает только с преобразованиями идентичности и временными преобразованиями (час, день, месяц, год). Чтобы включить отсечение партиций, установите `use_iceberg_partition_pruning = 1`.

### Кэширование данных {#data-cache}

Движок таблиц `Iceberg` и функция таблицы поддерживают кэширование данных так же, как `S3`, `AzureBlobStorage`, `HDFS` хранилища. См. [здесь](../../../engines/table-engines/integrations/s3.md#data-cache).

## См. также {#see-also}

- [функция таблицы iceberg](/sql-reference/table-functions/iceberg.md)
