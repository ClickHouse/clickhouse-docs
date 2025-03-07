---
description: 'Системная таблица, содержащая информацию о изменениях настроек в предыдущих версиях ClickHouse.'
slug: /operations/system-tables/settings_changes
title: 'system.settings_changes'
keywords: ['system table', 'settings_changes']
---

Содержит информацию о изменениях настроек в предыдущих версиях ClickHouse.

Колонки:

- `type` ([Enum](../../sql-reference/data-types/enum.md)) - Тип настроек: `Core` (общие / настройки запроса), `MergeTree`.
- `version` ([String](../../sql-reference/data-types/string.md)) — Версия ClickHouse, в которой были изменены настройки
- `changes` ([Array](../../sql-reference/data-types/array.md) of [Tuple](../../sql-reference/data-types/tuple.md)) — Описание изменений настроек: (имя настройки, предыдущее значение, новое значение, причина изменения)

**Пример**

``` sql
SELECT *
FROM system.settings_changes
WHERE version = '23.5'
FORMAT Vertical
```

``` text
Row 1:
──────
type:    Core
version: 23.5
changes: [('input_format_parquet_preserve_order','1','0','Разрешить Parquet reader переставлять строки для лучшего параллелизма.'),('parallelize_output_from_storages','0','1','Разрешить параллелизм при выполнении запросов, которые читают из файла/url/s3/etc. Это может переставить строки.'),('use_with_fill_by_sorting_prefix','0','1','Колонки, предшествующие колонкам WITH FILL в операторе ORDER BY, формируют префикс сортировки. Строки с различными значениями в префиксе сортировки заполняются независимо'),('output_format_parquet_compliant_nested_types','0','1','Изменить внутреннее имя поля в схеме выходного файла Parquet.')]
```

**Смотрите также**

- [Настройки](/operations/system-tables/overview#system-tables-introduction)
- [system.settings](settings.md)
