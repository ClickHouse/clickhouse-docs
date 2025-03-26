---
description: 'Документация по команде Describe Table'
sidebar_label: 'DESCRIBE TABLE'
sidebar_position: 42
slug: /sql-reference/statements/describe-table
title: 'DESCRIBE TABLE'
---

Возвращает информацию о столбцах таблицы.

**Синтаксис**

```sql
DESC|DESCRIBE TABLE [db.]table [INTO OUTFILE filename] [FORMAT format]
```

Команда `DESCRIBE` возвращает строку для каждого столбца таблицы с следующими [String](../../sql-reference/data-types/string.md) значениями:

- `name` — Имя столбца.
- `type` — Тип столбца.
- `default_type` — Клаузула, которая используется в [default expression](/sql-reference/statements/create/table): `DEFAULT`, `MATERIALIZED` или `ALIAS`. Если выражение по умолчанию отсутствует, возвращается пустая строка.
- `default_expression` — Выражение, указанное после клаузулы `DEFAULT`.
- `comment` — [Комментарий к столбцу](/sql-reference/statements/alter/column#comment-column).
- `codec_expression` — [кодек](/sql-reference/statements/create/table#column_compression_codec), который применяется к столбцу.
- `ttl_expression` — Выражение [TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl).
- `is_subcolumn` — Флаг, который равен `1` для внутренних подстолбцов. Он включен в результат только если описание подстолбцов включено настройкой [describe_include_subcolumns](../../operations/settings/settings.md#describe_include_subcolumns).

Все столбцы в [Nested](../../sql-reference/data-types/nested-data-structures/index.md) структурах данных описываются отдельно. Имя каждого столбца префиксируется именем родительского столбца и точкой.

Чтобы показать внутренние подстолбцы других типов данных, используйте настройку [describe_include_subcolumns](../../operations/settings/settings.md#describe_include_subcolumns).

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

Второй запрос дополнительно показывает подстолбцы:

```text
┌─name──────┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┬─is_subcolumn─┐
│ id        │ UInt64                        │              │                    │         │                  │                │            0 │
│ text      │ String                        │ DEFAULT      │ 'unknown'          │         │ ZSTD(1)          │                │            0 │
│ user      │ Tuple(name String, age UInt8) │              │                    │         │                  │                │            0 │
│ user.name │ String                        │              │                    │         │                  │                │            1 │
│ user.age  │ UInt8                         │              │                    │         │                  │                │            1 │
└───────────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┴──────────────┘
```

**См. также**

- Настройка [describe_include_subcolumns](../../operations/settings/settings.md#describe_include_subcolumns).
