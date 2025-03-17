---
description: 'Системная база данных, предоставляющая почти стандартизированный, независимый от СУБД обзор метаданных объектов базы данных.'
slug: /operations/system-tables/information_schema
title: 'INFORMATION_SCHEMA'
keywords: ['системная база данных', 'information_schema']
---

`INFORMATION_SCHEMA` (или: `information_schema`) является системной базой данных, которая предоставляет (в некоторой степени) стандартизированный, [независимый от СУБД обзор](https://en.wikipedia.org/wiki/Information_schema) метаданных объектов базы данных. Представления в `INFORMATION_SCHEMA` обычно уступают обычным системным таблицам, но инструменты могут использовать их для получения базовой информации в кросс-СУБД манере. Структура и содержание представлений в `INFORMATION_SCHEMA` предполагается, что будут развиваться обратно совместимым образом, т.е. добавляется только новая функциональность, но существующая функциональность не изменяется и не удаляется. С точки зрения внутренней реализации представления в `INFORMATION_SCHEMA` обычно соответствуют обычным системным таблицам, таким как [system.columns](../../operations/system-tables/columns.md), [system.databases](../../operations/system-tables/databases.md) и [system.tables](../../operations/system-tables/tables.md).

``` sql
SHOW TABLES FROM INFORMATION_SCHEMA;

-- или:
SHOW TABLES FROM information_schema;
```

``` text
┌─name────────────────────┐
│ COLUMNS                 │
│ KEY_COLUMN_USAGE        │
│ REFERENTIAL_CONSTRAINTS │
│ SCHEMATA                │
| STATISTICS              |
│ TABLES                  │
│ VIEWS                   │
│ columns                 │
│ key_column_usage        │
│ referential_constraints │
│ schemata                │
| statistics              |
│ tables                  │
│ views                   │
└─────────────────────────┘
```

`INFORMATION_SCHEMA` содержит следующие представления:

- [COLUMNS](#columns)
- [KEY_COLUMN_USAGE](#key_column_usage)
- [REFERENTIAL_CONSTRAINTS](#referential_constraints)
- [SCHEMATA](#schemata)
- [STATISTICS](#statistics)
- [TABLES](#tables)
- [VIEWS](#views)

Представлены нечувствительные к регистру эквиваленты представлений, например, `INFORMATION_SCHEMA.columns`, по причинам совместимости с другими базами данных. То же самое касается всех колонок в этих представлениях - предоставляются как строчные (например, `table_name`), так и заглавные (`TABLE_NAME`) варианты.

## COLUMNS {#columns}

Содержит колонки, прочитанные из системной таблицы [system.columns](../../operations/system-tables/columns.md), и колонки, которые не поддерживаются в ClickHouse или не имеют смысла (всегда `NULL`), но должны присутствовать по стандарту.

Колонки:

- `table_catalog` ([String](../../sql-reference/data-types/string.md)) — Название базы данных, в которой находится таблица.
- `table_schema` ([String](../../sql-reference/data-types/string.md)) — Название базы данных, в которой находится таблица.
- `table_name` ([String](../../sql-reference/data-types/string.md)) — Название таблицы.
- `column_name` ([String](../../sql-reference/data-types/string.md)) — Название колонки.
- `ordinal_position` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Порядковый номер колонки в таблице, начиная с 1.
- `column_default` ([String](../../sql-reference/data-types/string.md)) — Выражение для значения по умолчанию или пустая строка, если оно не определено.
- `is_nullable` ([UInt8](../../sql-reference/data-types/int-uint.md)) — Флаг, указывающий, является ли тип колонки `Nullable`.
- `data_type` ([String](../../sql-reference/data-types/string.md)) — Тип колонки.
- `character_maximum_length` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальная длина в байтах для двоичных данных, символьных данных или текстовых данных и изображений. В ClickHouse имеет смысл только для типа данных `FixedString`. В противном случае возвращается значение `NULL`.
- `character_octet_length` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Максимальная длина в байтах для двоичных данных, символьных данных или текстовых данных и изображений. В ClickHouse имеет смысл только для типа данных `FixedString`. В противном случае возвращается значение `NULL`.
- `numeric_precision` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Точность приблизительных числовых данных, точных числовых данных, целочисленных данных или денежных данных. В ClickHouse это битовая ширина для целочисленных типов и десятичная точность для типов `Decimal`. В противном случае возвращается значение `NULL`.
- `numeric_precision_radix` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Основание числовой системы - точность приблизительных числовых данных, точных числовых данных, целочисленных данных или денежных данных. В ClickHouse это 2 для целочисленных типов и 10 для типов `Decimal`. В противном случае возвращается значение `NULL`.
- `numeric_scale` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Масштаб приблизительных числовых данных, точных числовых данных, целочисленных данных или денежных данных. В ClickHouse имеет смысл только для типов `Decimal`. В противном случае возвращается значение `NULL`.
- `datetime_precision` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Десятичная точность типа данных `DateTime64`. Для других типов данных возвращается значение `NULL`.
- `character_set_catalog` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`, не поддерживается.
- `character_set_schema` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`, не поддерживается.
- `character_set_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`, не поддерживается.
- `collation_catalog` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`, не поддерживается.
- `collation_schema` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`, не поддерживается.
- `collation_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`, не поддерживается.
- `domain_catalog` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`, не поддерживается.
- `domain_schema` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`, не поддерживается.
- `domain_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`, не поддерживается.
- `extra` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `STORED GENERATED` для колонок типа `MATERIALIZED`, `VIRTUAL GENERATED` для колонок типа `ALIAS`, `DEFAULT_GENERATED` для колонок типа `DEFAULT` или `NULL`.

**Пример**

Запрос:

``` sql
SELECT table_catalog,
       table_schema,
       table_name,
       column_name,
       ordinal_position,
       column_default,
       is_nullable,
       data_type,
       character_maximum_length,
       character_octet_length,
       numeric_precision,
       numeric_precision_radix,
       numeric_scale,
       datetime_precision,
       character_set_catalog,
       character_set_schema,
       character_set_name,
       collation_catalog,
       collation_schema,
       collation_name,
       domain_catalog,
       domain_schema,
       domain_name,
       column_comment,
       column_type
FROM INFORMATION_SCHEMA.COLUMNS
WHERE (table_schema = currentDatabase() OR table_schema = '')
  AND table_name NOT LIKE '%inner%' 
LIMIT 1 
FORMAT Vertical;
```

Результат:

``` text
Row 1:
──────
table_catalog:            default
table_schema:             default
table_name:               describe_example
column_name:              id
ordinal_position:         1
column_default:
is_nullable:              0
data_type:                UInt64
character_maximum_length: ᴺᵁᴸᴸ
character_octet_length:   ᴺᵁᴸᴸ
numeric_precision:        64
numeric_precision_radix:  2
numeric_scale:            0
datetime_precision:       ᴺᵁᴸᴸ
character_set_catalog:    ᴺᵁᴸᴸ
character_set_schema:     ᴺᵁᴸᴸ
character_set_name:       ᴺᵁᴸᴸ
collation_catalog:        ᴺᵁᴸᴸ
collation_schema:         ᴺᵁᴸᴸ
collation_name:           ᴺᵁᴸᴸ
domain_catalog:           ᴺᵁᴸᴸ
domain_schema:            ᴺᵁᴸᴸ
domain_name:              ᴺᵁᴸᴸ
```

## SCHEMATA {#schemata}

Содержит колонки, прочитанные из системной таблицы [system.databases](../../operations/system-tables/databases.md), и колонки, которые не поддерживаются в ClickHouse или не имеют смысла (всегда `NULL`), но должны присутствовать по стандарту.

Колонки:

- `catalog_name` ([String](../../sql-reference/data-types/string.md)) — Название базы данных.
- `schema_name` ([String](../../sql-reference/data-types/string.md)) — Название базы данных.
- `schema_owner` ([String](../../sql-reference/data-types/string.md)) — Имя владельца схемы, всегда `'default'`.
- `default_character_set_catalog` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`, не поддерживается.
- `default_character_set_schema` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`, не поддерживается.
- `default_character_set_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`, не поддерживается.
- `sql_path` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`, не поддерживается.

**Пример**

Запрос:

``` sql
SELECT catalog_name,
       schema_name,
       schema_owner,
       default_character_set_catalog,
       default_character_set_schema,
       default_character_set_name,
       sql_path
FROM information_schema.schemata
WHERE schema_name ilike 'information_schema' 
LIMIT 1 
FORMAT Vertical;
```

Результат:

``` text
Row 1:
──────
catalog_name:                  INFORMATION_SCHEMA
schema_name:                   INFORMATION_SCHEMA
schema_owner:                  default
default_character_set_catalog: ᴺᵁᴸᴸ
default_character_set_schema:  ᴺᵁᴸᴸ
default_character_set_name:    ᴺᵁᴸᴸ
sql_path:                      ᴺᵁᴸᴸ
```

## TABLES {#tables}

Содержит колонки, прочитанные из системной таблицы [system.tables](../../operations/system-tables/tables.md).

Колонки:

- `table_catalog` ([String](../../sql-reference/data-types/string.md)) — Название базы данных, в которой находится таблица.
- `table_schema` ([String](../../sql-reference/data-types/string.md)) — Название базы данных, в которой находится таблица.
- `table_name` ([String](../../sql-reference/data-types/string.md)) — Название таблицы.
- `table_type` ([String](../../sql-reference/data-types/string.md)) — Тип таблицы. Возможные значения:
    - `BASE TABLE`
    - `VIEW`
    - `FOREIGN TABLE`
    - `LOCAL TEMPORARY`
    - `SYSTEM VIEW`
- `table_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Общее количество строк. NULL, если это невозможно определить.
- `data_length` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — Размер данных на диске. NULL, если это невозможно определить.
- `table_collation` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Стандартная сортировка таблицы. Всегда `utf8mb4_0900_ai_ci`.
- `table_comment` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Комментарий, используемый при создании таблицы.

**Пример**

Запрос:

``` sql
SELECT table_catalog, 
       table_schema, 
       table_name, 
       table_type, 
       table_collation, 
       table_comment
FROM INFORMATION_SCHEMA.TABLES
WHERE (table_schema = currentDatabase() OR table_schema = '')
  AND table_name NOT LIKE '%inner%'
LIMIT 1 
FORMAT Vertical;
```

Результат:

``` text
Row 1:
──────
table_catalog:   default
table_schema:    default
table_name:      describe_example
table_type:      BASE TABLE
table_collation: utf8mb4_0900_ai_ci
table_comment:   
```

## VIEWS {#views}

Содержит колонки, прочитанные из системной таблицы [system.tables](../../operations/system-tables/tables.md), когда используется движок таблицы [View](../../engines/table-engines/special/view.md).

Колонки:

- `table_catalog` ([String](../../sql-reference/data-types/string.md)) — Название базы данных, в которой находится таблица.
- `table_schema` ([String](../../sql-reference/data-types/string.md)) — Название базы данных, в которой находится таблица.
- `table_name` ([String](../../sql-reference/data-types/string.md)) — Название таблицы.
- `view_definition` ([String](../../sql-reference/data-types/string.md)) — Запрос `SELECT` для представления.
- `check_option` ([String](../../sql-reference/data-types/string.md)) — `NONE`, без проверки.
- `is_updatable` ([Enum8](../../sql-reference/data-types/enum.md)) — `NO`, представление не обновляется.
- `is_insertable_into` ([Enum8](../../sql-reference/data-types/enum.md)) — Показывает, является ли созданное представление [материализованным](/sql-reference/statements/create/view#materialized-view). Возможные значения:
    - `NO` — Созданное представление не является материализованным.
    - `YES` — Созданное представление является материализованным.
- `is_trigger_updatable` ([Enum8](../../sql-reference/data-types/enum.md)) — `NO`, триггер не обновляется.
- `is_trigger_deletable` ([Enum8](../../sql-reference/data-types/enum.md)) — `NO`, триггер не удаляется.
- `is_trigger_insertable_into` ([Enum8](../../sql-reference/data-types/enum.md)) — `NO`, в триггер не вставляются данные.

**Пример**

Запрос:

``` sql
CREATE VIEW v (n Nullable(Int32), f Float64) AS SELECT n, f FROM t;
CREATE MATERIALIZED VIEW mv ENGINE = Null AS SELECT * FROM system.one;
SELECT table_catalog,
       table_schema,
       table_name,
       view_definition,
       check_option,
       is_updatable,
       is_insertable_into,
       is_trigger_updatable,
       is_trigger_deletable,
       is_trigger_insertable_into
FROM information_schema.views
WHERE table_schema = currentDatabase() 
LIMIT 1
FORMAT Vertical;
```

Результат:

``` text
Row 1:
──────
table_catalog:              default
table_schema:               default
table_name:                 mv
view_definition:            SELECT * FROM system.one
check_option:               NONE
is_updatable:               NO
is_insertable_into:         YES
is_trigger_updatable:       NO
is_trigger_deletable:       NO
is_trigger_insertable_into: NO
```

## KEY_COLUMN_USAGE {#key_column_usage}

Содержит колонки из системной таблицы [system.tables](../../operations/system-tables/tables.md), которые ограничены ограничениями.

Колонки:

- `constraint_catalog` ([String](../../sql-reference/data-types/string.md)) — В данный момент не используется. Всегда `def`.
- `constraint_schema` ([String](../../sql-reference/data-types/string.md)) — Имя схемы (базы данных), к которой принадлежит ограничение.
- `constraint_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя ограничения.
- `table_catalog` ([String](../../sql-reference/data-types/string.md)) — В данный момент не используется. Всегда `def`.
- `table_schema` ([String](../../sql-reference/data-types/string.md)) — Имя схемы (базы данных), к которой принадлежит таблица.
- `table_name` ([String](../../sql-reference/data-types/string.md)) — Имя таблицы, имеющей ограничение.
- `column_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — Имя колонки, имеющей ограничение.
- `ordinal_position` ([UInt32](../../sql-reference/data-types/int-uint.md)) — В данный момент не используется. Всегда `1`.
- `position_in_unique_constraint` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt32](../../sql-reference/data-types/int-uint.md))) — В данный момент не используется. Всегда `NULL`.
- `referenced_table_schema` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — В данный момент не используется. Всегда `NULL`.
- `referenced_table_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — В данный момент не используется. Всегда `NULL`.
- `referenced_column_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — В данный момент не используется. Всегда `NULL`.

**Пример**

```sql
CREATE TABLE test (i UInt32, s String) ENGINE MergeTree ORDER BY i;
SELECT constraint_catalog,
       constraint_schema,
       constraint_name,
       table_catalog,
       table_schema,
       table_name,
       column_name,
       ordinal_position,
       position_in_unique_constraint,
       referenced_table_schema,
       referenced_table_name,
       referenced_column_name
FROM information_schema.key_column_usage 
WHERE table_name = 'test' 
FORMAT Vertical;
```

Результат:

```response
Row 1:
──────
constraint_catalog:            def
constraint_schema:             default
constraint_name:               PRIMARY
table_catalog:                 def
table_schema:                  default
table_name:                    test
column_name:                   i
ordinal_position:              1
position_in_unique_constraint: ᴺᵁᴸᴸ
referenced_table_schema:       ᴺᵁᴸᴸ
referenced_table_name:         ᴺᵁᴸᴸ
referenced_column_name:        ᴺᵁᴸᴸ
```

## REFERENTIAL_CONSTRAINTS {#referential_constraints}

Содержит информацию о внешних ключах. В данный момент возвращает пустой результат (нет строк), что достаточно для обеспечения совместимости с сторонними инструментами, такими как Tableau Online.

Колонки:

- `constraint_catalog` ([String](../../sql-reference/data-types/string.md)) — В данный момент не используется.
- `constraint_schema` ([String](../../sql-reference/data-types/string.md)) — В данный момент не используется.
- `constraint_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — В данный момент не используется.
- `unique_constraint_catalog` ([String](../../sql-reference/data-types/string.md)) — В данный момент не используется.
- `unique_constraint_schema` ([String](../../sql-reference/data-types/string.md)) — В данный момент не используется.
- `unique_constraint_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — В данный момент не используется.
- `match_option` ([String](../../sql-reference/data-types/string.md)) — В данный момент не используется.
- `update_rule` ([String](../../sql-reference/data-types/string.md)) — В данный момент не используется.
- `delete_rule` ([String](../../sql-reference/data-types/string.md)) — В данный момент не используется.
- `table_name` ([String](../../sql-reference/data-types/string.md)) — В данный момент не используется.
- `referenced_table_name` ([String](../../sql-reference/data-types/string.md)) — В данный момент не используется.

## STATISTICS {#statistics}

Предоставляет информацию о индексах таблиц. В данный момент возвращает пустой результат (нет строк), что достаточно для обеспечения совместимости с сторонними инструментами, такими как Tableau Online.

Колонки:

- `table_catalog` ([String](../../sql-reference/data-types/string.md)) — В данный момент не используется.
- `table_schema` ([String](../../sql-reference/data-types/string.md)) — В данный момент не используется.
- `table_name` ([String](../../sql-reference/data-types/string.md)) — В данный момент не используется.
- `non_unique` ([Int32](../../sql-reference/data-types/int-uint.md)) — В данный момент не используется.
- `index_schema` ([String](../../sql-reference/data-types/string.md)) — В данный момент не используется.
- `index_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — В данный момент не используется.
- `seq_in_index` ([UInt32](../../sql-reference/data-types/int-uint.md)) — В данный момент не используется.
- `column_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — В данный момент не используется.
- `collation` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — В данный момент не используется.
- `cardinality` ([Nullable](../../sql-reference/data-types/nullable.md)([Int64](../../sql-reference/data-types/int-uint.md))) — В данный момент не используется.
- `sub_part` ([Nullable](../../sql-reference/data-types/nullable.md)([Int64](../../sql-reference/data-types/int-uint.md))) — В данный момент не используется.
- `packed` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — В данный момент не используется.
- `nullable` ([String](../../sql-reference/data-types/string.md)) — В данный момент не используется.
- `index_type` ([String](../../sql-reference/data-types/string.md)) — В данный момент не используется.
- `comment` ([String](../../sql-reference/data-types/string.md)) — В данный момент не используется.
- `index_comment` ([String](../../sql-reference/data-types/string.md)) — В данный момент не используется.
- `is_visible` ([String](../../sql-reference/data-types/string.md)) — В данный момент не используется.
- `expression` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — В данный момент не используется.
