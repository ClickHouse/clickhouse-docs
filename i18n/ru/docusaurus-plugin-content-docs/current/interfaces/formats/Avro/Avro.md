---
alias: []
description: 'Документация для формата Avro'
input_format: true
keywords: ['Avro']
output_format: true
slug: /interfaces/formats/Avro
title: 'Avro'
---

import DataTypesMatching from './_snippets/data-types-matching.md'

| Входные данные | Выходные данные | Псевдоним |
|----------------|----------------|-----------|
| ✔              | ✔              |           |

## Описание {#description}

[Apache Avro](https://avro.apache.org/) — это фреймворк сериализации данных, ориентированный на строки, разработанный в рамках проекта Hadoop от Apache. Формат `Avro` в ClickHouse поддерживает чтение и запись [файлов данных Avro](https://avro.apache.org/docs/current/spec.html#Object+Container+Files).

## Соответствие типов данных {#data-types-matching}

<DataTypesMatching/>

## Пример использования {#example-usage}

### Вставка данных {#inserting-data}

Чтобы вставить данные из файла Avro в таблицу ClickHouse:

```bash
$ cat file.avro | clickhouse-client --query="INSERT INTO {some_table} FORMAT Avro"
```

Корневая схема импортируемого файла Avro должна быть типа `record`.

Чтобы найти соответствие между колонками таблицы и полями схемы Avro, ClickHouse сравнивает их имена. Это сравнение чувствительно к регистру, и неиспользуемые поля пропускаются.

Типы данных колонок таблицы ClickHouse могут отличаться от соответствующих полей вставляемых данных Avro. При вставке данных ClickHouse интерпретирует типы данных в соответствии с таблицей выше, а затем [приводит](/sql-reference/functions/type-conversion-functions#cast) данные к соответствующему типу колонки.

При импорте данных, когда поле не найдено в схеме и установлен параметр [`input_format_avro_allow_missing_fields`](/operations/settings/settings-formats.md/#input_format_avro_allow_missing_fields), будет использовано значение по умолчанию вместо генерации ошибки.

### Выбор данных {#selecting-data}

Чтобы выбрать данные из таблицы ClickHouse в файл Avro:

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Avro" > file.avro
```

Имена колонок должны:

- Начинаться с `[A-Za-z_]`
- Быть продолжены только `[A-Za-z0-9_]`

Сжатие выходного файла Avro и интервал синхронизации можно настроить с помощью параметров [`output_format_avro_codec`](/operations/settings/settings-formats.md/#output_format_avro_codec) и [`output_format_avro_sync_interval`](/operations/settings/settings-formats.md/#output_format_avro_sync_interval) соответственно.

### Пример данных {#example-data}

Используя функцию ClickHouse [`DESCRIBE`](/sql-reference/statements/describe-table), вы можете быстро просмотреть выводимый формат файла Avro, как в следующем примере. Этот пример включает URL общедоступного файла Avro в публичном бакете ClickHouse S3:

```sql title="Запрос"
DESCRIBE url('https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/hits.avro','Avro);
```
```response title="Ответ"
┌─name───────────────────────┬─type────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ WatchID                    │ Int64           │              │                    │         │                  │                │
│ JavaEnable                 │ Int32           │              │                    │         │                  │                │
│ Title                      │ String          │              │                    │         │                  │                │
│ GoodEvent                  │ Int32           │              │                    │         │                  │                │
│ EventTime                  │ Int32           │              │                    │         │                  │                │
│ EventDate                  │ Date32          │              │                    │         │                  │                │
│ CounterID                  │ Int32           │              │                    │         │                  │                │
│ ClientIP                   │ Int32           │              │                    │         │                  │                │
│ ClientIP6                  │ FixedString(16) │              │                    │         │                  │                │
│ RegionID                   │ Int32           │              │                    │         │                  │                │
...
│ IslandID                   │ FixedString(16) │              │                    │         │                  │                │
│ RequestNum                 │ Int32           │              │                    │         │                  │                │
│ RequestTry                 │ Int32           │              │                    │         │                  │                │
└────────────────────────────┴─────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

## Настройки формата {#format-settings}

| Настройка                                      | Описание                                                                                           | Значение по умолчанию |
|------------------------------------------------|----------------------------------------------------------------------------------------------------|-----------------------|
| `input_format_avro_allow_missing_fields`       | Для формата Avro/AvroConfluent: если поле не найдено в схеме, использовать значение по умолчанию вместо ошибки | `0`                   |
| `input_format_avro_null_as_default`            | Для формата Avro/AvroConfluent: вставить значение по умолчанию в случае null и ненулевой колонки   | `0`                   |
| `format_avro_schema_registry_url`              | Для формата AvroConfluent: URL реестра схем Confluent.                                           |                       |
| `output_format_avro_codec`                     | Кодек сжатия, используемый для вывода. Возможные значения: 'null', 'deflate', 'snappy', 'zstd'. |                       |
| `output_format_avro_sync_interval`             | Интервал синхронизации в байтах.                                                                   | `16384`               |
| `output_format_avro_string_column_pattern`     | Для формата Avro: регулярное выражение для строковых колонок, которые следует выбрать как AVRO строку. |                       |
| `output_format_avro_rows_in_file`              | Максимум строк в файле (если допускается хранилищем)                                                | `1`                   |
