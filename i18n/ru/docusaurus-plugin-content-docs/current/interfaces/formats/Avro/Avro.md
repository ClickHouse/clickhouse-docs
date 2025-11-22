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

| Ввод | Вывод | Псевдоним |
| ---- | ----- | --------- |
| ✔    | ✔     |           |


## Description {#description}

[Apache Avro](https://avro.apache.org/) — это строчно-ориентированный формат сериализации, использующий бинарное кодирование для эффективной обработки данных. Формат `Avro` поддерживает чтение и запись [файлов данных Avro](https://avro.apache.org/docs/++version++/specification/#object-container-files). Данный формат ожидает самоописываемые сообщения со встроенной схемой. Если вы используете Avro с реестром схем, обратитесь к формату [`AvroConfluent`](./AvroConfluent.md).


## Сопоставление типов данных {#data-type-mapping}

<DataTypeMapping />


## Настройки формата {#format-settings}

| Настройка                                  | Описание                                                                                                                                             | По умолчанию |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `input_format_avro_allow_missing_fields`   | Использовать значение по умолчанию вместо генерации ошибки, если поле отсутствует в схеме.                                                          | `0`          |
| `input_format_avro_null_as_default`        | Использовать значение по умолчанию вместо генерации ошибки при вставке значения `null` в столбец, не допускающий NULL.                              | `0`          |
| `output_format_avro_codec`                 | Алгоритм сжатия для выходных файлов Avro. Возможные значения: `null`, `deflate`, `snappy`, `zstd`.                                                  |              |
| `output_format_avro_sync_interval`         | Частота маркеров синхронизации в файлах Avro (в байтах).                                                                                            | `16384`      |
| `output_format_avro_string_column_pattern` | Регулярное выражение для определения столбцов `String` при сопоставлении со строковым типом Avro. По умолчанию столбцы `String` ClickHouse записываются как тип `bytes` Avro. |              |
| `output_format_avro_rows_in_file`          | Максимальное количество строк в одном выходном файле Avro. При достижении этого ограничения создается новый файл (если система хранения поддерживает разделение файлов). | `1`          |


## Примеры {#examples}

### Чтение данных Avro {#reading-avro-data}

Чтобы прочитать данные из файла Avro в таблицу ClickHouse:

```bash
$ cat file.avro | clickhouse-client --query="INSERT INTO {some_table} FORMAT Avro"
```

Корневая схема загружаемого файла Avro должна иметь тип `record`.

Для установления соответствия между столбцами таблицы и полями схемы Avro ClickHouse сравнивает их имена.
Сравнение чувствительно к регистру, неиспользуемые поля пропускаются.

Типы данных столбцов таблицы ClickHouse могут отличаться от соответствующих полей вставляемых данных Avro. При вставке данных ClickHouse интерпретирует типы данных согласно приведенной выше таблице, а затем [приводит](/sql-reference/functions/type-conversion-functions#cast) данные к соответствующему типу столбца.

При импорте данных, если поле не найдено в схеме и включена настройка [`input_format_avro_allow_missing_fields`](/operations/settings/settings-formats.md/#input_format_avro_allow_missing_fields), будет использовано значение по умолчанию вместо генерации ошибки.

### Запись данных Avro {#writing-avro-data}

Чтобы записать данные из таблицы ClickHouse в файл Avro:

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Avro" > file.avro
```

Имена столбцов должны:

- Начинаться с `[A-Za-z_]`
- Содержать только символы `[A-Za-z0-9_]`

Сжатие вывода и интервал синхронизации для файлов Avro можно настроить с помощью параметров [`output_format_avro_codec`](/operations/settings/settings-formats.md/#output_format_avro_codec) и [`output_format_avro_sync_interval`](/operations/settings/settings-formats.md/#output_format_avro_sync_interval) соответственно.

### Определение схемы Avro {#inferring-the-avro-schema}

С помощью функции ClickHouse [`DESCRIBE`](/sql-reference/statements/describe-table) можно быстро просмотреть определенный формат файла Avro, как показано в следующем примере.
Пример включает URL публично доступного файла Avro в общедоступном S3-бакете ClickHouse:

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
