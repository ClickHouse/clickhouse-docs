---
alias: []
description: 'Документация формата Avro'
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

[Apache Avro](https://avro.apache.org/) является фреймворком сериализации данных, ориентированным на строки, разработанным в рамках проекта Hadoop Apache. 
Формат `Avro` ClickHouse поддерживает чтение и запись [файлов данных Avro](https://avro.apache.org/docs/current/spec.html#Object+Container+Files).

## Соответствие типов данных {#data-types-matching}

<DataTypesMatching/>

## Пример использования {#example-usage}

### Вставка данных {#inserting-data}

Чтобы вставить данные из файла Avro в таблицу ClickHouse:

```bash
$ cat file.avro | clickhouse-client --query="INSERT INTO {some_table} FORMAT Avro"
```

Корневая схема загружаемого файла Avro должна быть типа `record`.

Чтобы найти соответствие между столбцами таблицы и полями схемы Avro, ClickHouse сравнивает их имена. 
Это сравнение учитывает регистр, а неиспользуемые поля пропускаются.

Типы данных столбцов таблицы ClickHouse могут отличаться от соответствующих полей вставляемых данных Avro. При вставке данных ClickHouse интерпретирует типы данных в соответствии с таблицей выше, а затем [приводит](/sql-reference/functions/type-conversion-functions#cast) данные к соответствующему типу колонки.

При импорте данных, если поле не найдено в схеме и включена настройка [`input_format_avro_allow_missing_fields`](/operations/settings/settings-formats.md/#input_format_avro_allow_missing_fields), будет использоваться значение по умолчанию вместо возврата ошибки.

### Выбор данных {#selecting-data}

Чтобы выбрать данные из таблицы ClickHouse в файл Avro:

```bash
$ clickhouse-client --query="SELECT * FROM {some_table} FORMAT Avro" > file.avro
```

Имена колонок должны:

- Начинаться с `[A-Za-z_]`
- Далее содержать только `[A-Za-z0-9_]`

Сжатие выходного файла Avro и интервал синхронизации могут быть настроены с помощью настроек [`output_format_avro_codec`](/operations/settings/settings-formats.md/#output_format_avro_codec) и [`output_format_avro_sync_interval`](/operations/settings/settings-formats.md/#output_format_avro_sync_interval) соответственно.

### Пример данных {#example-data}

Используя функцию ClickHouse [`DESCRIBE`](/sql-reference/statements/describe-table), вы можете быстро просмотреть выведенный формат файла Avro, например, как показано в следующем примере. 
Этот пример включает URL общедоступного файла Avro в публичном хранилище ClickHouse S3:

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

| Настройка                                   | Описание                                                                                              | По умолчанию |
|---------------------------------------------|-------------------------------------------------------------------------------------------------------|--------------|
| `input_format_avro_allow_missing_fields`    | Для формата Avro/AvroConfluent: когда поле не найдено в схеме, используйте значение по умолчанию вместо ошибки | `0`          |
| `input_format_avro_null_as_default`         | Для формата Avro/AvroConfluent: вставить значение по умолчанию в случае null и не Nullable колонны         | `0`          |
| `format_avro_schema_registry_url`           | Для формата AvroConfluent: URL реестра схем Confluent.                                               |              |
| `output_format_avro_codec`                  | Кодек сжатия, используемый для вывода. Возможные значения: 'null', 'deflate', 'snappy', 'zstd'.       |              |
| `output_format_avro_sync_interval`          | Интервал синхронизации в байтах.                                                                      | `16384`      |
| `output_format_avro_string_column_pattern`  | Для формата Avro: регулярное выражение для выбора колонок String как AVRO строки.                      |              |
| `output_format_avro_rows_in_file`           | Максимальное количество строк в файле (если это разрешено хранилищем)                                   | `1`          |
