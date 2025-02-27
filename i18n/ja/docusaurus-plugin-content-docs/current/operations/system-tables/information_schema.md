---
description: "システムデータベースは、データベースオブジェクトのメタデータに対してほぼ標準化されたDBMS非依存のビューを提供します。"
slug: /operations/system-tables/information_schema
title: "INFORMATION_SCHEMA"
keywords: ["システムデータベース", "information_schema"]
---

`INFORMATION_SCHEMA`（または: `information_schema`）は、データベースオブジェクトのメタデータに対して（ある程度）標準化され、[DBMS非依存](https://en.wikipedia.org/wiki/Information_schema)のビューを提供するシステムデータベースです。`INFORMATION_SCHEMA`内のビューは一般的に通常のシステムテーブルよりも劣りますが、ツールはそれらを利用して基本的な情報をクロスDBMSの方法で取得できます。`INFORMATION_SCHEMA`のビューの構造と内容は、後方互換性を持って進化することになっており、すなわち、新しい機能だけが追加され、既存の機能は変更または削除されません。内部実装に関して言えば、`INFORMATION_SCHEMA`内のビューは通常、[system.columns](../../operations/system-tables/columns.md)、[system.databases](../../operations/system-tables/databases.md)、および[system.tables](../../operations/system-tables/tables.md)のような通常のシステムテーブルにマッピングされます。

``` sql
SHOW TABLES FROM INFORMATION_SCHEMA;

-- または：
SHOW TABLES FROM information_schema;
```

``` text
┌─name────────────────────┐
│ COLUMNS                 │
│ KEY_COLUMN_USAGE        │
│ REFERENTIAL_CONSTRAINTS │
│ SCHEMATA                │
│ STATISTICS              │
│ TABLES                  │
│ VIEWS                   │
│ columns                 │
│ key_column_usage        │
│ referential_constraints │
│ schemata                │
│ statistics              │
│ tables                  │
│ views                   │
└─────────────────────────┘
```

`INFORMATION_SCHEMA`は以下のビューを含んでいます：

- [COLUMNS](#columns)
- [KEY_COLUMN_USAGE](#key_column_usage)
- [REFERENTIAL_CONSTRAINTS](#referential_constraints)
- [SCHEMATA](#schemata)
- [STATISTICS](#statistics)
- [TABLES](#tables)
- [VIEWS](#views)

互換性を考慮し、ケースインセンシティブな同等のビュー（例: `INFORMATION_SCHEMA.columns`）が提供されています。同様のことがこれらのビュー内のすべての列にも適用され、小文字（例えば、`table_name`）および大文字（`TABLE_NAME`）の両方のバリエーションが提供されます。

## COLUMNS {#columns}

[system.columns](../../operations/system-tables/columns.md)システムテーブルから読み取られたカラムと、ClickHouseではサポートされていないか、意味を持たないカラム（常に`NULL`）を含みますが、標準に基づいて必要です。

列：

- `table_catalog` ([String](../../sql-reference/data-types/string.md)) — テーブルが存在するデータベースの名前。
- `table_schema` ([String](../../sql-reference/data-types/string.md)) — テーブルが存在するデータベースの名前。
- `table_name` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
- `column_name` ([String](../../sql-reference/data-types/string.md)) — カラム名。
- `ordinal_position` ([UInt64](../../sql-reference/data-types/int-uint.md)) — テーブル内のカラムの順序位置（1から始まる）。
- `column_default` ([String](../../sql-reference/data-types/string.md)) — デフォルト値の式、または定義されていない場合は空文字列。
- `is_nullable` ([UInt8](../../sql-reference/data-types/int-uint.md)) — カラムタイプが`Nullable`かどうかを示すフラグ。
- `data_type` ([String](../../sql-reference/data-types/string.md)) — カラムタイプ。
- `character_maximum_length` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — バイナリデータ、文字データ、またはテキストデータと画像の最大長（バイト単位）。ClickHouseでは`FixedString`データ型にのみ意味があります。それ以外の場合、`NULL`値が返されます。
- `character_octet_length` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — バイナリデータ、文字データ、またはテキストデータと画像の最大長（バイト単位）。ClickHouseでは`FixedString`データ型にのみ意味があります。それ以外の場合、`NULL`値が返されます。
- `numeric_precision` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — おおよその数値データ、正確な数値データ、整数データ、または貨幣データの精度。ClickHouseでは、整数型のビット幅と`Decimal`型の小数精度です。それ以外の場合、`NULL`値が返されます。
- `numeric_precision_radix` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — おおよその数値データ、正確な数値データ、整数データ、または貨幣データの精度の数体系の基数。ClickHouseでは整数型の場合は2、`Decimal`型の場合は10です。それ以外の場合、`NULL`値が返されます。
- `numeric_scale` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — おおよその数値データ、正確な数値データ、整数データ、または貨幣データの比例。ClickHouseでは`Decimal`型のみで意味があります。それ以外の場合、`NULL`値が返されます。
- `datetime_precision` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — `DateTime64`データ型の小数精度。他のデータ型の場合、`NULL`値が返されます。
- `character_set_catalog` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`、サポートされていません。
- `character_set_schema` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`、サポートされていません。
- `character_set_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`、サポートされていません。
- `collation_catalog` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`、サポートされていません。
- `collation_schema` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`、サポートされていません。
- `collation_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`、サポートされていません。
- `domain_catalog` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`、サポートされていません。
- `domain_schema` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`、サポートされていません。
- `domain_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`、サポートされていません。
- `extra` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `MATERIALIZED`型カラムの場合は`STORED GENERATED`、`ALIAS`型カラムの場合は`VIRTUAL GENERATED`、`DEFAULT`型カラムの場合は`DEFAULT_GENERATED`、または`NULL`。

**例**

クエリ：

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

結果：

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

[system.databases](../../operations/system-tables/databases.md)システムテーブルから読み取られたカラムと、ClickHouseではサポートされていないか、意味を持たないカラム（常に`NULL`）を含みますが、標準に基づいて必要です。

列：

- `catalog_name` ([String](../../sql-reference/data-types/string.md)) — データベースの名前。
- `schema_name` ([String](../../sql-reference/data-types/string.md)) — データベースの名前。
- `schema_owner` ([String](../../sql-reference/data-types/string.md)) — スキーマのオーナー名、常に`'default'`です。
- `default_character_set_catalog` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`、サポートされていません。
- `default_character_set_schema` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`、サポートされていません。
- `default_character_set_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`、サポートされていません。
- `sql_path` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — `NULL`、サポートされていません。

**例**

クエリ：

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

結果：

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

[system.tables](../../operations/system-tables/tables.md)システムテーブルから読み取られたカラムを含みます。

列：

- `table_catalog` ([String](../../sql-reference/data-types/string.md)) — テーブルが存在するデータベースの名前。
- `table_schema` ([String](../../sql-reference/data-types/string.md)) — テーブルが存在するデータベースの名前。
- `table_name` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
- `table_type` ([String](../../sql-reference/data-types/string.md)) — テーブルタイプ。可能な値：
    - `BASE TABLE`
    - `VIEW`
    - `FOREIGN TABLE`
    - `LOCAL TEMPORARY`
    - `SYSTEM VIEW`
- `table_rows` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — 総行数。決定できない場合はNULL。
- `data_length` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt64](../../sql-reference/data-types/int-uint.md))) — ディスク上のデータサイズ。決定できない場合はNULL。
- `table_collation` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — テーブルのデフォルト照合順序。常に`utf8mb4_0900_ai_ci`です。
- `table_comment` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — テーブル作成時に使用されるコメント。

**例**

クエリ：

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

結果：

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

[View](../../engines/table-engines/special/view.md)テーブルエンジンを使用している場合、[system.tables](../../operations/system-tables/tables.md)システムテーブルから読み取られたカラムを含みます。

列：

- `table_catalog` ([String](../../sql-reference/data-types/string.md)) — テーブルが存在するデータベースの名前。
- `table_schema` ([String](../../sql-reference/data-types/string.md)) — テーブルが存在するデータベースの名前。
- `table_name` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
- `view_definition` ([String](../../sql-reference/data-types/string.md)) — ビューのための`SELECT`クエリ。
- `check_option` ([String](../../sql-reference/data-types/string.md)) — `NONE`、チェックは行われません。
- `is_updatable` ([Enum8](../../sql-reference/data-types/enum.md)) — `NO`、ビューは更新されません。
- `is_insertable_into` ([Enum8](../../sql-reference/data-types/enum.md)) — 作成されたビューが[マテリアライズド](../../sql-reference/statements/create/view.md/#materialized-view)かどうかを示します。可能な値：
    - `NO` — 作成されたビューはマテリアライズされていません。
    - `YES` — 作成されたビューはマテリアライズされています。
- `is_trigger_updatable` ([Enum8](../../sql-reference/data-types/enum.md)) — `NO`、トリガーは更新されません。
- `is_trigger_deletable` ([Enum8](../../sql-reference/data-types/enum.md)) — `NO`、トリガーは削除されません。
- `is_trigger_insertable_into` ([Enum8](../../sql-reference/data-types/enum.md)) — `NO`、データはトリガーに挿入されません。

**例**

クエリ：

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

結果：

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

制約によって制限される[system.tables](../../operations/system-tables/tables.md)システムテーブルからのカラムを含みます。

列：

- `constraint_catalog` ([String](../../sql-reference/data-types/string.md)) — 現在未使用。常に`def`。
- `constraint_schema` ([String](../../sql-reference/data-types/string.md)) — 制約が属するスキーマ（データベース）の名前。
- `constraint_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 制約の名前。
- `table_catalog` ([String](../../sql-reference/data-types/string.md)) — 現在未使用。常に`def`。
- `table_schema` ([String](../../sql-reference/data-types/string.md)) — テーブルが属するスキーマ（データベース）の名前。
- `table_name` ([String](../../sql-reference/data-types/string.md)) — 制約を持つテーブルの名前。
- `column_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 制約を持つカラムの名前。
- `ordinal_position` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 現在未使用。常に`1`。
- `position_in_unique_constraint` ([Nullable](../../sql-reference/data-types/nullable.md)([UInt32](../../sql-reference/data-types/int-uint.md))) — 現在未使用。常に`NULL`。
- `referenced_table_schema` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 現在未使用。常にNULL。
- `referenced_table_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 現在未使用。常にNULL。
- `referenced_column_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 現在未使用。常にNULL。

**例**

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

結果：

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
position_in_unique_constraint: ᴺᵁᴺᴺ
referenced_table_schema:       ᴺᵁᴸᴸ
referenced_table_name:         ᴺᵁᴸᴸ
referenced_column_name:        ᴺᵁᴸᴸ
```

## REFERENTIAL_CONSTRAINTS {#referential_constraints}

外部キーに関する情報を含みます。現在は空の結果（行がない）を返しますが、これはTableau Onlineなどのサードパーティツールとの互換性を確保するために十分です。

列：

- `constraint_catalog` ([String](../../sql-reference/data-types/string.md)) — 現在未使用。
- `constraint_schema` ([String](../../sql-reference/data-types/string.md)) — 現在未使用。
- `constraint_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 現在未使用。
- `unique_constraint_catalog` ([String](../../sql-reference/data-types/string.md)) — 現在未使用。
- `unique_constraint_schema` ([String](../../sql-reference/data-types/string.md)) — 現在未使用。
- `unique_constraint_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 現在未使用。
- `match_option` ([String](../../sql-reference/data-types/string.md)) — 現在未使用。
- `update_rule` ([String](../../sql-reference/data-types/string.md)) — 現在未使用。
- `delete_rule` ([String](../../sql-reference/data-types/string.md)) — 現在未使用。
- `table_name` ([String](../../sql-reference/data-types/string.md)) — 現在未使用。
- `referenced_table_name` ([String](../../sql-reference/data-types/string.md)) — 現在未使用。

## STATISTICS {#statistics}

テーブルインデックスに関する情報を提供します。現在は空の結果（行がない）を返しますが、これはTableau Onlineなどのサードパーティツールとの互換性を確保するために十分です。

列：

- `table_catalog` ([String](../../sql-reference/data-types/string.md)) — 現在未使用。
- `table_schema` ([String](../../sql-reference/data-types/string.md)) — 現在未使用。
- `table_name` ([String](../../sql-reference/data-types/string.md)) — 現在未使用。
- `non_unique` ([Int32](../../sql-reference/data-types/int-uint.md)) — 現在未使用。
- `index_schema` ([String](../../sql-reference/data-types/string.md)) — 現在未使用。
- `index_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 現在未使用。
- `seq_in_index` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 現在未使用。
- `column_name` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 現在未使用。
- `collation` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 現在未使用。
- `cardinality` ([Nullable](../../sql-reference/data-types/nullable.md)([Int64](../../sql-reference/data-types/int-uint.md))) — 現在未使用。
- `sub_part` ([Nullable](../../sql-reference/data-types/nullable.md)([Int64](../../sql-reference/data-types/int-uint.md))) — 現在未使用。
- `packed` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 現在未使用。
- `nullable` ([String](../../sql-reference/data-types/string.md)) — 現在未使用。
- `index_type` ([String](../../sql-reference/data-types/string.md)) — 現在未使用。
- `comment` ([String](../../sql-reference/data-types/string.md)) — 現在未使用。
- `index_comment` ([String](../../sql-reference/data-types/string.md)) — 現在未使用。
- `is_visible` ([String](../../sql-reference/data-types/string.md)) — 現在未使用。
- `expression` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 現在未使用。

