---
description: 'Предоставляет табличный интерфейс только для чтения к таблицам Apache Paimon в Amazon S3, Azure, HDFS или локальном хранилище.'
sidebar_label: 'paimon'
sidebar_position: 90
slug: /sql-reference/table-functions/paimon
title: 'paimon'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# Табличная функция paimon {#paimon-table-function}

<ExperimentalBadge />

Предоставляет табличный интерфейс только для чтения к таблицам Apache [Paimon](https://paimon.apache.org/), размещённым в Amazon S3, Azure, HDFS или локально.


## Синтаксис {#syntax}

```sql
paimon(url [,access_key_id, secret_access_key] [,format] [,structure] [,compression])

paimonS3(url [,access_key_id, secret_access_key] [,format] [,structure] [,compression])

paimonAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

paimonHDFS(path_to_table, [,format] [,compression_method])

paimonLocal(path_to_table, [,format] [,compression_method])
```


## Аргументы {#arguments}

Описание аргументов соответствует описанию аргументов табличных функций `s3`, `azureBlobStorage`, `HDFS` и `file`.
Аргумент `format` определяет формат файлов данных в таблице Paimon.

### Возвращаемое значение {#returned-value}

Таблица с указанной структурой для чтения данных из заданной таблицы Paimon.


## Определение именованной коллекции {#defining-a-named-collection}

Ниже приведён пример настройки именованной коллекции для хранения URL и учётных данных:

```xml
<clickhouse>
    <named_collections>
        <paimon_conf>
            <url>http://test.s3.amazonaws.com/clickhouse-bucket/</url>
            <access_key_id>test<access_key_id>
            <secret_access_key>test</secret_access_key>
            <format>auto</format>
            <structure>auto</structure>
        </paimon_conf>
    </named_collections>
</clickhouse>
```

```sql
SELECT * FROM paimonS3(paimon_conf, filename = 'test_table')
DESCRIBE paimonS3(paimon_conf, filename = 'test_table')
```


## Псевдонимы {#aliases}

Табличная функция `paimon` является псевдонимом `paimonS3`.


## Виртуальные столбцы {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер файла неизвестен, значение — `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение — `NULL`.
- `_etag` — ETag файла. Тип: `LowCardinality(String)`. Если ETag неизвестен, значение — `NULL`.


## Поддерживаемые типы данных {#data-types-supported}

| Тип данных Paimon                 | Тип данных ClickHouse |
| --------------------------------- | -------------------- |
| BOOLEAN                           | Int8                 |
| TINYINT                           | Int8                 |
| SMALLINT                          | Int16                |
| INTEGER                           | Int32                |
| BIGINT                            | Int64                |
| FLOAT                             | Float32              |
| DOUBLE                            | Float64              |
| STRING,VARCHAR,BYTES,VARBINARY    | String               |
| DATE                              | Date                 |
| TIME(p),TIME                      | Time('UTC')          |
| TIMESTAMP(p) WITH LOCAL TIME ZONE | DateTime64           |
| TIMESTAMP(p)                      | DateTime64('UTC')    |
| CHAR                              | FixedString(1)       |
| BINARY(n)                         | FixedString(n)       |
| DECIMAL(P,S)                      | Decimal(P,S)         |
| ARRAY                             | Array                |
| MAP                               | Map                  |


## Поддерживаемые партиции {#partition-supported}

Типы данных, поддерживаемые в ключах партиционирования Paimon:

- `CHAR`
- `VARCHAR`
- `BOOLEAN`
- `DECIMAL`
- `TINYINT`
- `SMALLINT`
- `INTEGER`
- `DATE`
- `TIME`
- `TIMESTAMP`
- `TIMESTAMP WITH LOCAL TIME ZONE`
- `BIGINT`
- `FLOAT`
- `DOUBLE`


## См. также {#see-also}

- [Табличная функция paimonCluster](/sql-reference/table-functions/paimonCluster.md)
