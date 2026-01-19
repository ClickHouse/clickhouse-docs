---
description: 'Предоставляет табличный интерфейс для работы в режиме только чтения с таблицами Apache Hudi в Amazon S3.'
sidebar_label: 'hudi'
sidebar_position: 85
slug: /sql-reference/table-functions/hudi
title: 'hudi'
doc_type: 'reference'
---

# Табличная функция hudi \{#hudi-table-function\}

Предоставляет интерфейс только для чтения, аналогичный таблице, для работы с таблицами Apache [Hudi](https://hudi.apache.org/) в Amazon S3.

## Синтаксис \{#syntax\}

```sql
hudi(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## Аргументы \{#arguments\}

| Аргумент                                     | Описание                                                                                                                                                                                                                                                                                                                                                                              |
|----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                                        | URL бакета с путем к существующей таблице Hudi в S3.                                                                                                                                                                                                                                                                                                                                  |
| `aws_access_key_id`, `aws_secret_access_key` | Долгосрочные учетные данные пользователя учетной записи [AWS](https://aws.amazon.com/). Их можно использовать для аутентификации запросов. Эти параметры являются необязательными. Если учетные данные не указаны, используются значения из конфигурации ClickHouse. Дополнительные сведения см. в разделе [Использование S3 для хранения данных](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3). |
| `format`                                     | [Формат](/interfaces/formats) файла.                                                                                                                                                                                                                                                                                                                                                 |
| `structure`                                  | Структура таблицы. Формат: `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                                                                                                                                                                                                            |
| `compression`                                | Параметр является необязательным. Поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию тип сжатия автоматически определяется по расширению файла.                                                                                                                                                                                             |

## Возвращаемое значение \{#returned_value\}

Таблица с заданной структурой для чтения данных из указанной таблицы Hudi в S3.

## Виртуальные столбцы \{#virtual-columns\}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер файла неизвестен, значение — `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение — `NULL`.
- `_etag` — ETag файла. Тип: `LowCardinality(String)`. Если ETag неизвестен, значение — `NULL`.

## Связанные материалы \{#related\}

- [Движок Hudi](/engines/table-engines/integrations/hudi.md)
- [Кластерная табличная функция Hudi](/sql-reference/table-functions/hudiCluster.md)
