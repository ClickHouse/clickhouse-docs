---
slug: '/sql-reference/table-functions/hudi'
sidebar_label: hudi
sidebar_position: 85
description: 'Предоставляет интерфейс, подобный таблицам, только для чтения, к таблицам'
title: hudi
doc_type: reference
---
# Функция Таблицы Hudi

Предоставляет интерфейс, подобный таблице только для чтения, к таблицам Apache [Hudi](https://hudi.apache.org/) в Amazon S3.

## Синтаксис {#syntax}

```sql
hudi(url [,aws_access_key_id, aws_secret_access_key] [,format] [,structure] [,compression])
```

## Аргументы {#arguments}

| Аргумент                                     | Описание                                                                                                                                                                                                                                                                                                                                                                           |
|----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                                        | URL корзины с путем к существующей таблице Hudi в S3.                                                                                                                                                                                                                                                                                                                             |
| `aws_access_key_id`, `aws_secret_access_key` | Долгосрочные учетные данные для пользователя учетной записи [AWS](https://aws.amazon.com/). Вы можете использовать их для аутентификации ваших запросов. Эти параметры являются необязательными. Если учетные данные не указаны, они берутся из конфигурации ClickHouse. Для получения дополнительной информации см. [Использование S3 для хранения данных](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3). |
| `format`                                     | [формат](/interfaces/formats) файла.                                                                                                                                                                                                                                                                                                                                        |
| `structure`                                  | Структура таблицы. Формат `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                                                                                                                                                                                                         |
| `compression`                                | Параметр является необязательным. Поддерживаемые значения: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. По умолчанию сжатие будет определяться автоматически по расширению файла.                                                                                                                                                                                                                   |

## Возвращаемое значение {#returned_value}

Таблица с заданной структурой для чтения данных из указанной таблицы Hudi в S3.

## Виртуальные столбцы {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер файла неизвестен, значение будет `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение будет `NULL`.
- `_etag` — Etag файла. Тип: `LowCardinality(String)`. Если etag неизвестен, значение будет `NULL`.

## Связанные {#related}

- [Движок Hudi](/engines/table-engines/integrations/hudi.md)
- [Функция таблицы кластера Hudi](/sql-reference/table-functions/hudiCluster.md)