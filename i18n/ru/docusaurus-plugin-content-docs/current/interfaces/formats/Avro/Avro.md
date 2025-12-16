---
alias: []
description: 'Документация по формату Avro'
input_format: true
keywords: ['Avro']
output_format: true
slug: /interfaces/formats/Avro
title: 'Avro'
doc_type: 'reference'
---

import DataTypeMapping from './_snippets/data-types-matching.md'

| Вход | Выход | Псевдоним |
| ---- | ----- | --------- |
| ✔    | ✔     |           |

## Описание {#description}

[Apache Avro](https://avro.apache.org/) — это строчно-ориентированный формат сериализации данных, который использует двоичное кодирование для эффективной обработки. Формат `Avro` поддерживает чтение и запись [файлов данных Avro](https://avro.apache.org/docs/++version++/specification/#object-container-files). Этот формат рассчитан на самоописательные сообщения со встроенной схемой. Если вы используете Avro с реестром схем, обратитесь к формату [`AvroConfluent`](./AvroConfluent.md).

## Сопоставление типов данных {#data-type-mapping}

<DataTypeMapping/>

## Настройки формата {#format-settings}

| Параметр                                   | Описание                                                                                           | Значение по умолчанию |
|--------------------------------------------|----------------------------------------------------------------------------------------------------|------------------------|
| `input_format_avro_allow_missing_fields`   | Использовать ли значение по умолчанию вместо генерации ошибки, если поле не найдено в схеме.      | `0`                    |
| `input_format_avro_null_as_default`        | Использовать ли значение по умолчанию вместо генерации ошибки при вставке значения `null` в столбец, не допускающий `null`. | `0`    |
| `output_format_avro_codec`                 | Алгоритм сжатия для выходных файлов Avro. Возможные значения: `null`, `deflate`, `snappy`, `zstd`. |                        |
| `output_format_avro_sync_interval`         | Интервал записи маркеров синхронизации в файлах Avro (в байтах).                                  | `16384`                |
| `output_format_avro_string_column_pattern` | Регулярное выражение для определения столбцов типа `String` для отображения в строковый тип Avro. По умолчанию столбцы ClickHouse типа `String` записываются как тип Avro `bytes`. |        |
| `output_format_avro_rows_in_file`          | Максимальное количество строк в одном выходном файле Avro. При достижении этого предела создаётся новый файл (если система хранения поддерживает разбиение файлов). | `1`    |

## Примеры {#examples}

### Чтение данных в формате Avro {#reading-avro-data}

Чтобы прочитать данные из файла в формате Avro в таблицу ClickHouse:

```bash
$ cat file.avro | clickhouse-client --query="INSERT INTO {some_table} FORMAT Avro"
```

Корневая схема загружаемого файла Avro должна иметь тип `record`.

Чтобы сопоставить столбцы таблицы с полями схемы Avro, ClickHouse сравнивает их имена.
Сравнение чувствительно к регистру, а неиспользуемые поля пропускаются.

Типы данных столбцов таблицы ClickHouse могут отличаться от соответствующих полей вставляемых данных Avro. При вставке данных ClickHouse интерпретирует типы данных в соответствии с таблицей выше, а затем [приводит](/sql-reference/functions/type-conversion-functions#cast) данные к соответствующему типу столбца.

При импорте данных, если поле не найдено в схеме и включена настройка [`input_format_avro_allow_missing_fields`](/operations/settings/settings-formats.md/#input_format_avro_allow_missing_fields), вместо генерации ошибки будет использовано значение по умолчанию.

### Запись данных в формате Avro {#writing-avro-data}

Чтобы записать данные из таблицы ClickHouse в файл формата Avro:

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Avro" > file.avro
```

Имена столбцов должны:

* Начинаться с `[A-Za-z_]`
* Далее могут включать только `[A-Za-z0-9_]`

Сжатие выходных данных и интервал синхронизации для файлов Avro можно настроить с помощью параметров [`output_format_avro_codec`](/operations/settings/settings-formats.md/#output_format_avro_codec) и [`output_format_avro_sync_interval`](/operations/settings/settings-formats.md/#output_format_avro_sync_interval) соответственно.

### Определение схемы Avro {#inferring-the-avro-schema}

С помощью функции ClickHouse [`DESCRIBE`](/sql-reference/statements/describe-table) вы можете быстро просмотреть выводимую (выведенную) схему файла Avro, как показано в следующем примере.
В этом примере используется URL общедоступного файла Avro в публичном бакете S3 ClickHouse:

```sql
DESCRIBE url('https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/hits.avro','Avro);

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
