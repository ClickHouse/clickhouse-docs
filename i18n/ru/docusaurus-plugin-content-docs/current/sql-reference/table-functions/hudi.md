---
description: 'Предоставляет табличный интерфейс только для чтения к таблицам Apache Hudi в Amazon S3.'
sidebar_label: 'hudi'
sidebar_position: 85
slug: /sql-reference/table-functions/hudi
title: 'hudi'
doc_type: 'reference'
---



# Табличная функция hudi

Предоставляет табличный интерфейс только для чтения к таблицам Apache [Hudi](https://hudi.apache.org/) в Amazon S3.



## Синтаксис {#syntax}

```sql
hudi(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```


## Аргументы {#arguments}

| Аргумент                                     | Описание                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `url`                                        | URL корзины с путём к существующей таблице Hudi в S3.                                                                                                                                                                                                                                                                                                                            |
| `aws_access_key_id`, `aws_secret_access_key` | Долгосрочные учётные данные пользователя аккаунта [AWS](https://aws.amazon.com/). Используются для аутентификации запросов. Эти параметры необязательны. Если учётные данные не указаны, используются значения из конфигурации ClickHouse. Подробнее см. [Использование S3 для хранения данных](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3). |
| `format`                                     | [Формат](/interfaces/formats) файла.                                                                                                                                                                                                                                                                                                                                       |
| `structure`                                  | Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                                                                                                                                                                                                        |
| `compression`                                | Необязательный параметр. Поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию тип сжатия определяется автоматически по расширению файла.                                                                                                                                                                                                                  |


## Возвращаемое значение {#returned_value}

Таблица с указанной структурой для чтения данных из указанной таблицы Hudi в S3.


## Виртуальные столбцы {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер файла неизвестен, значение — `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение — `NULL`.
- `_etag` — ETag файла. Тип: `LowCardinality(String)`. Если ETag неизвестен, значение — `NULL`.


## Связанные материалы {#related}

- [Движок Hudi](/engines/table-engines/integrations/hudi.md)
- [Табличная функция hudiCluster](/sql-reference/table-functions/hudiCluster.md)
