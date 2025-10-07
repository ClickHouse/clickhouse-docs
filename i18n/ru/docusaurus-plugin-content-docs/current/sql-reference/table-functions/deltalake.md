---
slug: '/sql-reference/table-functions/deltalake'
sidebar_label: deltaLake
sidebar_position: 45
description: 'Предоставляет интерфейс, похожий на таблицу для только чтения, к таблицам'
title: deltaLake
doc_type: reference
---
# deltaLake Табличная Функция

Предоставляет интерфейс, похожий на таблицу, для чтения таблиц [Delta Lake](https://github.com/delta-io/delta) в Amazon S3, Azure Blob Storage или локально смонтированной файловой системе.

## Синтаксис {#syntax}

`deltaLake` является алиасом `deltaLakeS3`, он поддерживается для совместимости.

```sql
deltaLake(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

deltaLakeS3(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

deltaLakeAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])

deltaLakeLocal(path, [,format])
```

## Аргументы {#arguments}

Описание аргументов совпадает с описанием аргументов в табличных функциях `s3`, `azureBlobStorage`, `HDFS` и `file` соответственно.
`format` обозначает формат файлов данных в таблице Delta Lake.

## Возвращаемое значение {#returned_value}

Таблица с указанной структурой для чтения данных в указанной таблице Delta Lake.

## Примеры {#examples}

Выбор строк из таблицы в S3 `https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/`:

```sql
SELECT
    URL,
    UserAgent
FROM deltaLake('https://clickhouse-public-datasets.s3.amazonaws.com/delta_lake/hits/')
WHERE URL IS NOT NULL
LIMIT 2
```

```response
┌─URL───────────────────────────────────────────────────────────────────┬─UserAgent─┐
│ http://auto.ria.ua/search/index.kz/jobinmoscow/detail/55089/hasimages │         1 │
│ http://auto.ria.ua/search/index.kz/jobinmoscow.ru/gosushi             │         1 │
└───────────────────────────────────────────────────────────────────────┴───────────┘
```

## Виртуальные Колонки {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер файла неизвестен, значение равно `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение равно `NULL`.
- `_etag` — Этикетка файла. Тип: `LowCardinality(String)`. Если этетка неизвестна, значение равно `NULL`.

## Связанные {#related}

- [DeltaLake движок](engines/table-engines/integrations/deltalake.md)
- [Табличная функция кластера DeltaLake](sql-reference/table-functions/deltalakeCluster.md)