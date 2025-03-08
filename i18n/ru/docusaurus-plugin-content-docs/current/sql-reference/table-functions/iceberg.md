---
slug: /sql-reference/table-functions/iceberg
sidebar_position: 90
sidebar_label: iceberg
title: 'iceberg'
description: 'Предоставляет интерфейс таблицы только для чтения к таблицам Apache Iceberg в Amazon S3, Azure, HDFS или локально сохраненным.'
---


# Функция таблицы iceberg

Предоставляет интерфейс таблицы только для чтения к таблицам Apache [Iceberg](https://iceberg.apache.org/) в Amazon S3, Azure, HDFS или локально сохраненным.

## Синтаксис {#syntax}

``` sql
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

Описание аргументов совпадает с описанием аргументов в функциях таблиц `s3`, `azureBlobStorage`, `HDFS` и `file` соответственно. 
`format` обозначает формат файлов данных в таблице Iceberg.

**Возвращаемое значение**
Таблица с указанной структурой для чтения данных в указанной таблице Iceberg.

**Пример**

```sql
SELECT * FROM icebergS3('http://test.s3.amazonaws.com/clickhouse-bucket/test_table', 'test', 'test')
```

:::important
ClickHouse в настоящее время поддерживает чтение версий v1 и v2 формата Iceberg через функции таблиц `icebergS3`, `icebergAzure`, `icebergHDFS` и `icebergLocal`, а также через таблицы `IcebergS3`, `icebergAzure`, `IcebergHDFS` и `IcebergLocal`.
:::

## Определение именованной коллекции {#defining-a-named-collection}

Вот пример конфигурации именованной коллекции для хранения URL и учетных данных:

```xml
<clickhouse>
    <named_collections>
        <iceberg_conf>
            <url>http://test.s3.amazonaws.com/clickhouse-bucket/</url>
            <access_key_id>test</access_key_id>
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

**Эволюция схемы**
На данный момент с помощью ClickHouse вы можете читать таблицы iceberg, схема которых изменялась со временем. Мы в настоящее время поддерживаем чтение таблиц, в которых добавлялись и удалялись колонки, и их порядок изменялся. Вы также можете изменить колонку, где значение обязательно, на ту, где допускается NULL. Кроме того, мы поддерживаем разрешенное приведение типа для простых типов, а именно:  
* int -> long
* float -> double
* decimal(P, S) -> decimal(P', S), где P' > P. 

В настоящее время невозможно изменить вложенные структуры или типы элементов в массивах и картах.

**Устранение партиций**

ClickHouse поддерживает устранение партиций во время SELECT-запросов для таблиц Iceberg, что помогает оптимизировать производительность запросов, пропуская несущественные файлы данных. На данный момент это работает только с идентичными преобразованиями и временными преобразованиями (час, день, месяц, год). Чтобы включить устранение партиций, установите `use_iceberg_partition_pruning = 1`.

**Псевдонимы**

Функция таблицы `iceberg` сейчас является псевдонимом для `icebergS3`.

**См. также**

- [Движок Iceberg](/engines/table-engines/integrations/iceberg.md)
- [Функция таблицы кластера Iceberg](/sql-reference/table-functions/icebergCluster.md)
