---
description: 'Предоставляет интерфейс таблицы только для чтения для таблиц Delta Lake в Amazon S3.'
sidebar_label: 'deltaLake'
sidebar_position: 45
slug: /sql-reference/table-functions/deltalake
title: 'deltaLake'
---


# Функция Таблицы deltaLake

Предоставляет интерфейс таблицы только для чтения для [Delta Lake](https://github.com/delta-io/delta) таблиц в Amazon S3 или Azure Blob Storage.

## Синтаксис {#syntax}

`deltaLake` является псевдонимом `deltaLakeS3`, поддерживается для совместимости.

```sql
deltaLake(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

deltaLakeS3(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])

deltaLakeAzure(connection_string|storage_account_url, container_name, blobpath, [,account_name], [,account_key] [,format] [,compression_method])
```

## Аргументы {#arguments}

Описание аргументов совпадает с описанием аргументов в функциях таблиц `s3`, `azureBlobStorage`, `HDFS` и `file` соответственно. 
`format` обозначает формат файлов данных в таблице Delta Lake.

**Возвращаемое значение**

Таблица с указанной структурой для чтения данных в указанной таблице Delta Lake.

**Примеры**

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

**См. также**

- [Движок DeltaLake](engines/table-engines/integrations/deltalake.md)
- [Функция Таблицы кластера DeltaLake](sql-reference/table-functions/deltalakeCluster.md)
