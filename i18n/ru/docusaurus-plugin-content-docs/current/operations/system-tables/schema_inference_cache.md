---
slug: '/operations/system-tables/schema_inference_cache'
description: 'Системная таблица, содержащая информацию о всех кэшированных схемах'
title: system.schema_inference_cache
keywords: ['системная таблица', 'schema_inference_cache']
doc_type: reference
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.schema_inference_cache

<SystemTableCloud/>

Содержит информацию обо всех закэшированных схемах файлов.

Столбцы:
- `storage` ([String](/sql-reference/data-types/string.md)) — Имя хранилища: File, URL, S3 или HDFS.
- `source` ([String](/sql-reference/data-types/string.md)) — Источник файла.
- `format` ([String](/sql-reference/data-types/string.md)) — Имя формата.
- `additional_format_info` ([String](/sql-reference/data-types/string.md)) - Дополнительная информация, необходимая для идентификации схемы. Например, специфические для формата настройки.
- `registration_time` ([DateTime](/sql-reference/data-types/datetime.md)) — Временная метка, когда схема была добавлена в кэш.
- `schema` ([String](/sql-reference/data-types/string.md)) - Закэштированная схема.

**Пример**

Предположим, у нас есть файл `data.jsonl` с таким содержимым:
```json
{"id" :  1, "age" :  25, "name" :  "Josh", "hobbies" :  ["football", "cooking", "music"]}
{"id" :  2, "age" :  19, "name" :  "Alan", "hobbies" :  ["tennis", "art"]}
{"id" :  3, "age" :  32, "name" :  "Lana", "hobbies" :  ["fitness", "reading", "shopping"]}
{"id" :  4, "age" :  47, "name" :  "Brayan", "hobbies" :  ["movies", "skydiving"]}
```

:::tip
Поместите `data.jsonl` в каталог `user_files_path`. Вы можете найти его, проверив
ваши файлы конфигурации ClickHouse. По умолчанию это:
```sql
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
:::

Откройте `clickhouse-client` и выполните запрос `DESCRIBE`:

```sql
DESCRIBE file('data.jsonl') SETTINGS input_format_try_infer_integers=0;
```

```response
┌─name────┬─type────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ Nullable(Float64)       │              │                    │         │                  │                │
│ age     │ Nullable(Float64)       │              │                    │         │                  │                │
│ name    │ Nullable(String)        │              │                    │         │                  │                │
│ hobbies │ Array(Nullable(String)) │              │                    │         │                  │                │
└─────────┴─────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Давайте посмотрим на содержимое таблицы `system.schema_inference_cache`:

```sql
SELECT *
FROM system.schema_inference_cache
FORMAT Vertical
```
```response
Row 1:
──────
storage:                File
source:                 /home/droscigno/user_files/data.jsonl
format:                 JSONEachRow
additional_format_info: schema_inference_hints=, max_rows_to_read_for_schema_inference=25000, schema_inference_make_columns_nullable=true, try_infer_integers=false, try_infer_dates=true, try_infer_datetimes=true, try_infer_numbers_from_strings=true, read_bools_as_numbers=true, try_infer_objects=false
registration_time:      2022-12-29 17:49:52
schema:                 id Nullable(Float64), age Nullable(Float64), name Nullable(String), hobbies Array(Nullable(String))
```

**Смотрите также**
- [Автоматическое определение схемы из входных данных](/interfaces/schema-inference.md)