---
slug: /sql-reference/statements/describe-table
sidebar_position: 42
sidebar_label: ОПИСАТЬ ТАБЛИЦУ
title: "ОПИСАТЬ ТАБЛИЦУ"
---

Возвращает информацию о колонках таблицы.

**Синтаксис**

``` sql
DESC|DESCRIBE TABLE [db.]table [INTO OUTFILE filename] [FORMAT format]
```

Команда `DESCRIBE` возвращает строку для каждой колонки таблицы со следующими [строковыми](../../sql-reference/data-types/string.md) значениями:

- `name` — Имя колонки.
- `type` — Тип колонки.
- `default_type` — Параметр, который используется в [выражении по умолчанию](/sql-reference/statements/create/table): `DEFAULT`, `MATERIALIZED` или `ALIAS`. Если выражение по умолчанию отсутствует, возвращается пустая строка.
- `default_expression` — Выражение, указанное после параметра `DEFAULT`.
- `comment` — [Комментарий к колонке](/sql-reference/statements/alter/column#comment-column).
- `codec_expression` — [кодек](/sql-reference/statements/create/table#column_compression_codec), применяемый к колонке.
- `ttl_expression` — Выражение [TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl).
- `is_subcolumn` — Флаг, равный `1` для внутренних подколонок. Включается в результат только в том случае, если описание подколонок включено с помощью настройки [describe_include_subcolumns](../../operations/settings/settings.md#describe_include_subcolumns).

Все колонки в [Nested](../../sql-reference/data-types/nested-data-structures/index.md) структурах данных описываются отдельно. Имя каждой колонки дополнительно префиксируется именем родительской колонки и точкой.

Для отображения внутренних подколонок других типов данных используйте настройку [describe_include_subcolumns](../../operations/settings/settings.md#describe_include_subcolumns).

**Пример**

Запрос:

``` sql
CREATE TABLE describe_example (
    id UInt64, text String DEFAULT 'unknown' CODEC(ZSTD),
    user Tuple (name String, age UInt8)
) ENGINE = MergeTree() ORDER BY id;

DESCRIBE TABLE describe_example;
DESCRIBE TABLE describe_example SETTINGS describe_include_subcolumns=1;
```

Результат:

``` text
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id   │ UInt64                        │              │                    │         │                  │                │
│ text │ String                        │ DEFAULT      │ 'unknown'          │         │ ZSTD(1)          │                │
│ user │ Tuple(name String, age UInt8) │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Во втором запросе дополнительно отображаются подколонки:

``` text
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
