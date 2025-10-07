---
slug: '/interfaces/formats/Avro'
description: 'Документация для формата Avro'
title: Avro
keywords: ['Avro']
doc_type: reference
input_format: true
output_format: true
---
import DataTypeMapping from './_snippets/data-types-matching.md'

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## Описание {#description}

[Apache Avro](https://avro.apache.org/) — это ориентированный на строки формат сериализации, который использует бинарное кодирование для эффективной обработки данных. Формат `Avro` поддерживает чтение и запись [файлов данных Avro](https://avro.apache.org/docs/++version++/specification/#object-container-files). Этот формат ожидает самоописывающие сообщения с встроенной схемой. Если вы используете Avro с реестром схем, обратитесь к формату [`AvroConfluent`](./AvroConfluent.md).

## Сопоставление типов данных {#data-type-mapping}

<DataTypeMapping/>

## Настройки формата {#format-settings}

| Настройка                                   | Описание                                                                                           | По умолчанию |
|---------------------------------------------|----------------------------------------------------------------------------------------------------|--------------|
| `input_format_avro_allow_missing_fields`    | Использовать ли значение по умолчанию вместо генерации ошибки, если поле не найдено в схеме.      | `0`          |
| `input_format_avro_null_as_default`         | Использовать ли значение по умолчанию вместо генерации ошибки при вставке значения `null` в ненулевую колонку. | `0`          |
| `output_format_avro_codec`                  | Алгоритм сжатия для выходных файлов Avro. Возможные значения: `null`, `deflate`, `snappy`, `zstd`. |              |
| `output_format_avro_sync_interval`          | Частота синхронизации маркеров в файлах Avro (в байтах).                                         | `16384`      |
| `output_format_avro_string_column_pattern`  | Регулярное выражение для идентификации колонок `String` для сопоставления типа строки Avro. По умолчанию колонки `String` ClickHouse записываются как тип `bytes` Avro. |              |
| `output_format_avro_rows_in_file`           | Максимальное количество строк на один выходной файл Avro. Когда этот лимит достигается, создается новый файл (если файловая система поддерживает разбиение файла). | `1`          |

## Примеры {#examples}

### Чтение данных Avro {#reading-avro-data}

Чтобы прочитать данные из файла Avro в таблицу ClickHouse:

```bash
$ cat file.avro | clickhouse-client --query="INSERT INTO {some_table} FORMAT Avro"
```

Корневая схема импортируемого файла Avro должна быть типа `record`.

Чтобы найти соответствие между колонками таблицы и полями схемы Avro, ClickHouse сравнивает их имена. 
Это сравнение чувствительно к регистру, и неиспользуемые поля пропускаются.

Типы данных колонок таблицы ClickHouse могут отличаться от соответствующих полей вставленных данных Avro. При вставке данных ClickHouse интерпретирует типы данных согласно таблице выше, а затем [приводит к типу](/sql-reference/functions/type-conversion-functions#cast) данных к соответствующему типу колонки.

При импорте данных, когда поле не найдено в схеме, и включена настройка [`input_format_avro_allow_missing_fields`](/operations/settings/settings-formats.md/#input_format_avro_allow_missing_fields), будет использовано значение по умолчанию вместо генерации ошибки.

### Запись данных Avro {#writing-avro-data}

Чтобы записать данные из таблицы ClickHouse в файл Avro:

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Avro" > file.avro
```

Имена колонок должны:

- Начинаться с `[A-Za-z_]`
- Далее могут содержать только `[A-Za-z0-9_]`

Сжатие выхода и интервал синхронизации для файлов Avro могут быть настроены с помощью настройки [`output_format_avro_codec`](/operations/settings/settings-formats.md/#output_format_avro_codec) и настройки [`output_format_avro_sync_interval`](/operations/settings/settings-formats.md/#output_format_avro_sync_interval) соответственно.

### Вывод схемы Avro {#inferring-the-avro-schema}

С помощью функции ClickHouse [`DESCRIBE`](/sql-reference/statements/describe-table) вы можете быстро просмотреть выведенный формат файла Avro, как в следующем примере. 
Этот пример включает URL общедоступного файла Avro в публичной корзине ClickHouse S3:

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