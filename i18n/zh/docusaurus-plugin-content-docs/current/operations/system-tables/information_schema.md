---
'description': 'System database providing an almost standardized DBMS-agnostic view
  on metadata of database objects.'
'keywords':
- 'system database'
- 'information_schema'
'slug': '/operations/system-tables/information_schema'
'title': 'INFORMATION_SCHEMA'
---



`INFORMATION_SCHEMA`（或：`information_schema`）是一个系统数据库，它提供了一个（某种程度上）标准化的、[与数据库管理系统无关的视图](https://en.wikipedia.org/wiki/Information_schema)，用于获取数据库对象的元数据。 `INFORMATION_SCHEMA`中的视图通常不如普通系统表强大，但工具可以使用它们以跨数据库管理系统的方式获取基本信息。 `INFORMATION_SCHEMA`中视图的结构和内容应该以向后兼容的方式演变，也就是说，仅添加新功能而不更改或删除现有功能。在内部实现方面，`INFORMATION_SCHEMA`中的视图通常映射到普通的系统表，例如 [system.columns](../../operations/system-tables/columns.md)、[system.databases](../../operations/system-tables/databases.md) 和 [system.tables](../../operations/system-tables/tables.md)。

```sql
SHOW TABLES FROM INFORMATION_SCHEMA;

-- or:
SHOW TABLES FROM information_schema;
```

```text
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

`INFORMATION_SCHEMA`包含以下视图：

- [COLUMNS](#columns)
- [KEY_COLUMN_USAGE](#key_column_usage)
- [REFERENTIAL_CONSTRAINTS](#referential_constraints)
- [SCHEMATA](#schemata)
- [STATISTICS](#statistics)
- [TABLES](#tables)
- [VIEWS](#views)

提供不区分大小写的等效视图，例如 `INFORMATION_SCHEMA.columns`，是出于与其他数据库的兼容性原因。此原则同样适用于这些视图中的所有列 - 提供小写（例如，`table_name`）和大写（`TABLE_NAME`）的变体。

## COLUMNS {#columns}

包含从 [system.columns](../../operations/system-tables/columns.md) 系统表中读取的列以及在 ClickHouse 中不受支持或没有意义（始终为 `NULL`）但根据标准必须包含的列。

列：

- `table_catalog` ([String](../../sql-reference/data-types/string.md)) — 表所在数据库的名称。
- `table_schema` ([String](../../sql-reference/data-types/string.md)) — 表所在数据库的名称。
- `table_name` ([String](../../sql-reference/data-types/string.md)) — 表名。
- `column_name` ([String](../../sql-reference/data-types/string.md)) — 列名。
- `ordinal_position` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 列在表中的顺序位置，从 1 开始。
- `column_default` ([String](../../sql-reference/data-types/string.md)) — 默认值的表达式，如果未定义则为空字符串。
- `is_nullable` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 表示列类型是否为 `Nullable` 的标志。
- `data_type` ([String](../../sql-reference/data-types/string.md)) — 列类型。
- `character_maximum_length` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 二进制数据、字符数据、文本数据和图像的最大字节长度。在 ClickHouse 中，仅对 `FixedString` 数据类型有意义。否则，将返回 `NULL` 值。
- `character_octet_length` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 二进制数据、字符数据、文本数据和图像的最大字节长度。在 ClickHouse 中，仅对 `FixedString` 数据类型有意义。否则，将返回 `NULL` 值。
- `numeric_precision` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 近似数字数据、精确数字数据、整数数据或货币数据的精度。在 ClickHouse 中，它是整数类型的位宽和 `Decimal` 类型的小数精度。否则，将返回 `NULL` 值。
- `numeric_precision_radix` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 数字系统的基数，是近似数字数据、精确数字数据、整数数据或货币数据的精度。在 ClickHouse 中，整数类型为 2，`Decimal` 类型为 10。否则，将返回 `NULL` 值。
- `numeric_scale` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 近似数字数据、精确数字数据、整数数据或货币数据的比例。在 ClickHouse 中，仅对 `Decimal` 类型有意义。否则，将返回 `NULL` 值。
- `datetime_precision` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — `DateTime64` 数据类型的小数精度。对于其他数据类型，将返回 `NULL` 值。
- `character_set_catalog` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`，不支持。
- `character_set_schema` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`，不支持。
- `character_set_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`，不支持。
- `collation_catalog` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`，不支持。
- `collation_schema` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`，不支持。
- `collation_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`，不支持。
- `domain_catalog` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`，不支持。
- `domain_schema` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`，不支持。
- `domain_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`，不支持。
- `extra` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `MATERIALIZED` 类型列的 `STORED GENERATED`，`ALIAS` 类型列的 `VIRTUAL GENERATED`，`DEFAULT` 类型列的 `DEFAULT_GENERATED`，或 `NULL`。

**示例**

查询：

```sql
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

结果：

```text
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

包含从 [system.databases](../../operations/system-tables/databases.md) 系统表中读取的列以及在 ClickHouse 中不受支持或没有意义（始终为 `NULL`）但根据标准必须包含的列。

列：

- `catalog_name` ([String](../../sql-reference/data-types/string.md)) — 数据库的名称。
- `schema_name` ([String](../../sql-reference/data-types/string.md)) — 数据库的名称。
- `schema_owner` ([String](../../sql-reference/data-types/string.md)) — 模式所有者名称，总是 `'default'`。
- `default_character_set_catalog` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`，不支持。
- `default_character_set_schema` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`，不支持。
- `default_character_set_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`，不支持。
- `sql_path` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`，不支持。

**示例**

查询：

```sql
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

结果：

```text
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

包含从 [system.tables](../../operations/system-tables/tables.md) 系统表中读取的列。

列：

- `table_catalog` ([String](../../sql-reference/data-types/string.md)) — 表所在数据库的名称。
- `table_schema` ([String](../../sql-reference/data-types/string.md)) — 表所在数据库的名称。
- `table_name` ([String](../../sql-reference/data-types/string.md)) — 表名。
- `table_type` ([String](../../sql-reference/data-types/string.md)) — 表类型。可能的值：
    - `BASE TABLE`
    - `VIEW`
    - `FOREIGN TABLE`
    - `LOCAL TEMPORARY`
    - `SYSTEM VIEW`
- `table_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 行总数。如果无法确定，则为 NULL。
- `data_length` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 磁盘上的数据大小。如果无法确定，则为 NULL。
- `index_length` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 主键、次级索引和所有标记的总大小。
- `table_collation` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 表的默认排序规则。始终为 `utf8mb4_0900_ai_ci`。
- `table_comment` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 创建表时使用的注释。

**示例**

查询：

```sql
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

结果：

```text
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

包含从 [system.tables](../../operations/system-tables/tables.md) 系统表中读取的列，当表引擎使用 [View](../../engines/table-engines/special/view.md) 时。

列：

- `table_catalog` ([String](../../sql-reference/data-types/string.md)) — 表所在数据库的名称。
- `table_schema` ([String](../../sql-reference/data-types/string.md)) — 表所在数据库的名称。
- `table_name` ([String](../../sql-reference/data-types/string.md)) — 表名。
- `view_definition` ([String](../../sql-reference/data-types/string.md)) — 视图的 `SELECT` 查询。
- `check_option` ([String](../../sql-reference/data-types/string.md)) — `NONE`，不检查。
- `is_updatable` ([Enum8](../../sql-reference/data-types/enum.md)) — `NO`，视图不可更新。
- `is_insertable_into` ([Enum8](../../sql-reference/data-types/enum.md)) — 显示创建的视图是否是 [物化视图](/sql-reference/statements/create/view#materialized-view)。可能的值：
    - `NO` — 创建的视图不是物化的。
    - `YES` — 创建的视图是物化的。
- `is_trigger_updatable` ([Enum8](../../sql-reference/data-types/enum.md)) — `NO`，触发器不可更新。
- `is_trigger_deletable` ([Enum8](../../sql-reference/data-types/enum.md)) — `NO`，触发器不可删除。
- `is_trigger_insertable_into` ([Enum8](../../sql-reference/data-types/enum.md)) — `NO`，不向触发器插入数据。

**示例**

查询：

```sql
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

结果：

```text
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

包含来自 [system.tables](../../operations/system-tables/tables.md) 系统表的列，这些列受到约束的限制。

列：

- `constraint_catalog` ([String](../../sql-reference/data-types/string.md)) — 当前未使用。始终为 `def`。
- `constraint_schema` ([String](../../sql-reference/data-types/string.md)) — 约束所属的模式（数据库）的名称。
- `constraint_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 约束的名称。
- `table_catalog` ([String](../../sql-reference/data-types/string.md)) — 当前未使用。始终为 `def`。
- `table_schema` ([String](../../sql-reference/data-types/string.md)) — 表所属的模式（数据库）的名称。
- `table_name` ([String](../../sql-reference/data-types/string.md)) — 拥有约束的表的名称。
- `column_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 拥有约束的列的名称。
- `ordinal_position` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 当前未使用。始终为 `1`。
- `position_in_unique_constraint` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt32](../../sql-reference/data-types/int-uint.md))) — 当前未使用。始终为 `NULL`。
- `referenced_table_schema` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 当前未使用。始终为 NULL。
- `referenced_table_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 当前未使用。始终为 NULL。
- `referenced_column_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 当前未使用。始终为 NULL。

**示例**

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

结果：

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

包含有关外键的信息。目前返回空结果（没有行），这只是为了与诸如 Tableau Online 之类的第三方工具保持兼容。

列：

- `constraint_catalog` ([String](../../sql-reference/data-types/string.md)) — 当前未使用。
- `constraint_schema` ([String](../../sql-reference/data-types/string.md)) — 当前未使用。
- `constraint_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 当前未使用。
- `unique_constraint_catalog` ([String](../../sql-reference/data-types/string.md)) — 当前未使用。
- `unique_constraint_schema` ([String](../../sql-reference/data-types/string.md)) — 当前未使用。
- `unique_constraint_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 当前未使用。
- `match_option` ([String](../../sql-reference/data-types/string.md)) — 当前未使用。
- `update_rule` ([String](../../sql-reference/data-types/string.md)) — 当前未使用。
- `delete_rule` ([String](../../sql-reference/data-types/string.md)) — 当前未使用。
- `table_name` ([String](../../sql-reference/data-types/string.md)) — 当前未使用。
- `referenced_table_name` ([String](../../sql-reference/data-types/string.md)) — 当前未使用。

## STATISTICS {#statistics}

提供有关表索引的信息。目前返回空结果（没有行），这只是为了与诸如 Tableau Online 之类的第三方工具保持兼容。

列：

- `table_catalog` ([String](../../sql-reference/data-types/string.md)) — 当前未使用。
- `table_schema` ([String](../../sql-reference/data-types/string.md)) — 当前未使用。
- `table_name` ([String](../../sql-reference/data-types/string.md)) — 当前未使用。
- `non_unique` ([Int32](../../sql-reference/data-types/int-uint.md)) — 当前未使用。
- `index_schema` ([String](../../sql-reference/data-types/string.md)) — 当前未使用。
- `index_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 当前未使用。
- `seq_in_index` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 当前未使用。
- `column_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 当前未使用。
- `collation` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 当前未使用。
- `cardinality` ([Nullable](../../sql-reference/data-types/nullable.md)([Int64](../../sql-reference/data-types/int-uint.md))) — 当前未使用。
- `sub_part` ([Nullable](../../sql-reference/data-types/nullable.md)([Int64](../../sql-reference/data-types/int-uint.md))) — 当前未使用。
- `packed` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 当前未使用。
- `nullable` ([String](../../sql-reference/data-types/string.md)) — 当前未使用。
- `index_type` ([String](../../sql-reference/data-types/string.md)) — 当前未使用。
- `comment` ([String](../../sql-reference/data-types/string.md)) — 当前未使用。
- `index_comment` ([String](../../sql-reference/data-types/string.md)) — 当前未使用。
- `is_visible` ([String](../../sql-reference/data-types/string.md)) — 当前未使用。
- `expression` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 当前未使用。
