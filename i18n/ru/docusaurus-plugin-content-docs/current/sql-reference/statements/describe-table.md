---
slug: '/sql-reference/statements/describe-table'
sidebar_label: 'DESCRIBE TABLE'
sidebar_position: 42
description: 'Документация для Describe Table'
title: 'DESCRIBE TABLE'
doc_type: reference
---
Возвращает информацию о колонках таблицы.

**Синтаксис**

```sql
DESC|DESCRIBE TABLE [db.]table [INTO OUTFILE filename] [FORMAT format]
```

Оператор `DESCRIBE` возвращает строку для каждой колонки таблицы со следующими [String](../../sql-reference/data-types/string.md) значениями:

- `name` — Имя колонки.
- `type` — Тип колонки.
- `default_type` — Оператор, который используется в [значении по умолчанию](/sql-reference/statements/create/table) колонки: `DEFAULT`, `MATERIALIZED` или `ALIAS`. Если значение по умолчанию отсутствует, возвращается пустая строка.
- `default_expression` — Выражение, указанное после оператора `DEFAULT`.
- `comment` — [Комментарий к колонке](/sql-reference/statements/alter/column#comment-column).
- `codec_expression` — [кодек](/sql-reference/statements/create/table#column_compression_codec), применяемый к колонке.
- `ttl_expression` — Выражение [TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl).
- `is_subcolumn` — Флаг, равный `1` для внутренних подколонок. Он включается в результат только если описание подколонок разрешено настройкой [describe_include_subcolumns](../../operations/settings/settings.md#describe_include_subcolumns).

Все колонки в [Nested](../../sql-reference/data-types/nested-data-structures/index.md) структурах данных описываются отдельно. Имя каждой колонки предшествуется именем родительской колонки и точкой.

Чтобы показать внутренние подколонки других типов данных, используйте настройку [describe_include_subcolumns](../../operations/settings/settings.md#describe_include_subcolumns).

**Пример**

Запрос:

```sql
CREATE TABLE describe_example (
    id UInt64, text String DEFAULT 'unknown' CODEC(ZSTD),
    user Tuple (name String, age UInt8)
) ENGINE = MergeTree() ORDER BY id;

DESCRIBE TABLE describe_example;
DESCRIBE TABLE describe_example SETTINGS describe_include_subcolumns=1;
```

Результат:

```text
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id   │ UInt64                        │              │                    │         │                  │                │
│ text │ String                        │ DEFAULT      │ 'unknown'          │         │ ZSTD(1)          │                │
│ user │ Tuple(name String, age UInt8) │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Второй запрос дополнительно показывает подколонки:

```text
┌─name──────┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┬─is_subcolumn─┐
│ id        │ UInt64                        │              │                    │         │                  │                │            0 │
│ text      │ String                        │ DEFAULT      │ 'unknown'          │         │ ZSTD(1)          │                │            0 │
│ user      │ Tuple(name String, age UInt8) │              │                    │         │                  │                │            0 │
│ user.name │ String                        │              │                    │         │                  │                │            1 │
│ user.age  │ UInt8                         │              │                    │         │                  │                │            1 │
└───────────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┴──────────────┘
```

**Смотрите также**

- Настройка [describe_include_subcolumns](../../operations/settings/settings.md#describe_include_subcolumns).