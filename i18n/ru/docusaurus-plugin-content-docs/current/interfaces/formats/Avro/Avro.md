---
alias: []
description: 'Документация о формате Avro'
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


## Описание {#description}

[Apache Avro](https://avro.apache.org/) — это строчно-ориентированный формат сериализации, который использует двоичное кодирование для эффективной обработки данных. Формат `Avro` поддерживает чтение и запись [файлов данных Avro](https://avro.apache.org/docs/++version++/specification/#object-container-files). Этот формат ожидает самоописывающиеся сообщения со встроенной схемой. Если вы используете Avro с реестром схем, см. формат [`AvroConfluent`](./AvroConfluent.md).



## Сопоставление типов данных {#data-type-mapping}

<DataTypeMapping/>



## Настройки формата {#format-settings}

| Параметр                                   | Описание                                                                                           | По умолчанию |
|--------------------------------------------|----------------------------------------------------------------------------------------------------|--------------|
| `input_format_avro_allow_missing_fields`   | Использовать ли значение по умолчанию вместо генерации ошибки при отсутствии поля в схеме.        | `0`          |
| `input_format_avro_null_as_default`        | Использовать ли значение по умолчанию вместо генерации ошибки при вставке значения `null` в столбец, который не допускает `NULL`. | `0` |
| `output_format_avro_codec`                 | Алгоритм сжатия для выходных файлов Avro. Возможные значения: `null`, `deflate`, `snappy`, `zstd`. |              |
| `output_format_avro_sync_interval`         | Частота маркеров синхронизации в файлах Avro (в байтах).                                          | `16384`      |
| `output_format_avro_string_column_pattern` | Регулярное выражение для определения столбцов типа `String` для отображения их в строковый тип Avro. По умолчанию столбцы ClickHouse типа `String` записываются как тип Avro `bytes`. | |
| `output_format_avro_rows_in_file`          | Максимальное количество строк в одном выходном файле Avro. При достижении этого предела создаётся новый файл (если система хранения поддерживает разбиение файлов). | `1` |



## Примеры

### Чтение данных Avro

Чтобы прочитать данные из файла Avro в таблицу ClickHouse:

```bash
$ cat file.avro | clickhouse-client --query="INSERT INTO {some_table} FORMAT Avro"
```

Корневая схема загружаемого Avro‑файла должна иметь тип `record`.

Чтобы найти соответствие между столбцами таблицы и полями схемы Avro, ClickHouse сравнивает их имена.
Сравнение выполняется с учётом регистра, а неиспользуемые поля пропускаются.

Типы данных столбцов таблицы ClickHouse могут отличаться от типов соответствующих полей во вставляемых данных Avro. При вставке данных ClickHouse интерпретирует типы данных в соответствии с таблицей выше, а затем [приводит](/sql-reference/functions/type-conversion-functions#cast) данные к соответствующему типу столбца.

При импорте данных, если поле не найдено в схеме и настройка [`input_format_avro_allow_missing_fields`](/operations/settings/settings-formats.md/#input_format_avro_allow_missing_fields) включена, вместо выдачи ошибки будет использовано значение по умолчанию.

### Запись данных в формате Avro

Чтобы записать данные из таблицы ClickHouse в Avro‑файл:

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Avro" > file.avro
```

Имена столбцов должны:

* Начинаться с `[A-Za-z_]`
* Далее могут содержать только `[A-Za-z0-9_]`

Сжатие выходных данных и интервал синхронизации для файлов Avro можно настроить с помощью параметров [`output_format_avro_codec`](/operations/settings/settings-formats.md/#output_format_avro_codec) и [`output_format_avro_sync_interval`](/operations/settings/settings-formats.md/#output_format_avro_sync_interval) соответственно.

### Определение схемы Avro

Используя функцию ClickHouse [`DESCRIBE`](/sql-reference/statements/describe-table), вы можете быстро просмотреть определённый формат файла Avro, как в следующем примере.
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
