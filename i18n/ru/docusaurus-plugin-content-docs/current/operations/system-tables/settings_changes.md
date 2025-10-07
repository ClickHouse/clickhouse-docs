---
slug: '/operations/system-tables/settings_changes'
description: 'Системная таблица, содержащая информацию о изменениях настроек в предыдущих'
title: system.settings_changes
keywords: ['системная таблица', 'изменения_настроек']
doc_type: reference
---
# system.settings_changes

Содержит информацию о изменениях настроек в предыдущих версиях ClickHouse.

Столбцы:

- `type` ([Enum](../../sql-reference/data-types/enum.md)) - Тип настроек: `Core` (общие / настройки запросов), `MergeTree`.
- `version` ([String](../../sql-reference/data-types/string.md)) — Версия ClickHouse, в которой были изменены настройки
- `changes` ([Array](../../sql-reference/data-types/array.md) of [Tuple](../../sql-reference/data-types/tuple.md)) — Описание изменений настроек: (имя настройки, предыдущее значение, новое значение, причина изменения)

**Пример**

```sql
SELECT *
FROM system.settings_changes
WHERE version = '23.5'
FORMAT Vertical
```

```text
Row 1:
──────
type:    Core
version: 23.5
changes: [('input_format_parquet_preserve_order','1','0','Allow Parquet reader to reorder rows for better parallelism.'),('parallelize_output_from_storages','0','1','Allow parallelism when executing queries that read from file/url/s3/etc. This may reorder rows.'),('use_with_fill_by_sorting_prefix','0','1','Columns preceding WITH FILL columns in ORDER BY clause form sorting prefix. Rows with different values in sorting prefix are filled independently'),('output_format_parquet_compliant_nested_types','0','1','Change an internal field name in output Parquet file schema.')]
```

**Смотрите также**

- [Настройки](/operations/system-tables/overview#system-tables-introduction)
- [system.settings](settings.md)