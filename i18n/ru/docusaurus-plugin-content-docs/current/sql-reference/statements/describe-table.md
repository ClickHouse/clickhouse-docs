---
description: 'Описание инструкции DESCRIBE TABLE'
sidebar_label: 'DESCRIBE TABLE'
sidebar_position: 42
slug: /sql-reference/statements/describe-table
title: 'DESCRIBE TABLE'
doc_type: 'reference'
---

Возвращает информацию о столбцах таблицы.

**Синтаксис**

```sql
DESC|DESCRIBE TABLE [db.]table [INTO OUTFILE filename] [FORMAT format]
```

Оператор `DESCRIBE` возвращает строку для каждого столбца таблицы со следующими значениями типа [String](../../sql-reference/data-types/string.md):

* `name` — имя столбца.
* `type` — тип столбца.
* `default_type` — клауза, используемая в [выражении по умолчанию](/sql-reference/statements/create/table) столбца: `DEFAULT`, `MATERIALIZED` или `ALIAS`. Если выражение по умолчанию отсутствует, возвращается пустая строка.
* `default_expression` — выражение, указанное после клаузы `DEFAULT`.
* `comment` — [комментарий столбца](/sql-reference/statements/alter/column#comment-column).
* `codec_expression` — [кодек](/sql-reference/statements/create/table#column_compression_codec), применяемый к столбцу.
* `ttl_expression` — выражение [TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl).
* `is_subcolumn` — флаг, равный `1` для внутренних подстолбцов. Включается в результат только в том случае, если описание подстолбцов включено настройкой [describe&#95;include&#95;subcolumns](../../operations/settings/settings.md#describe_include_subcolumns).

Все столбцы в структурах данных [Nested](../../sql-reference/data-types/nested-data-structures/index.md) описываются отдельно. Имя каждого столбца предваряется именем родительского столбца и точкой.

Чтобы показать внутренние подстолбцы других типов данных, используйте настройку [describe&#95;include&#95;subcolumns](../../operations/settings/settings.md#describe_include_subcolumns).

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

Оператор DESCRIBE можно также использовать с подзапросами и скалярными выражениями:

```SQL
DESCRIBE SELECT 1 FORMAT TSV;
```

или

```SQL
DESCRIBE (SELECT 1) FORMAT TSV;
```

Результат:

```text
1       UInt8
```

При таком использовании возвращаются метаданные о результирующих столбцах указанного запроса или подзапроса. Это полезно для понимания структуры сложных запросов до их выполнения.

**См. также**

* Параметр [describe&#95;include&#95;subcolumns](../../operations/settings/settings.md#describe_include_subcolumns).
