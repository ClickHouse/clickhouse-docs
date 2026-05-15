---
title: 'Snowflake SQL translation reference'
slug: /migrations/snowflake-translation-reference
description: 'Construct-by-construct mapping from Snowflake SQL to ClickHouse SQL'
keywords: ['Snowflake', 'migration', 'SQL', 'translation', 'reference']
sidebar_label: 'SQL translation reference'
show_related_blogs: true
doc_type: 'reference'
---

This document details the similarities and differences in SQL syntax between Snowflake and ClickHouse.

## Data types {#data-types}

ClickHouse offers more granular precision than Snowflake for numerics. Snowflake
exposes a single `NUMBER(P, S)` type for fixed-point values (its integer types
are aliases for `NUMBER` with scale 0). ClickHouse instead provides distinct
integer widths plus decimal and float types so storage and memory can be tuned
to the actual range of the data. `Decimal` in ClickHouse goes to 76 digits
versus Snowflake's 38, and `Float32` is available alongside `Float64` when
precision is less critical than compression.

Strings work differently in the two engines. Snowflake's `VARCHAR(n)` stores
UTF-8 with an optional length limit (storage isn't affected by the limit);
ClickHouse `String` stores raw bytes with no length specification, deferring
encoding to the application. UTF-8-aware variants (`lengthUTF8`,
`upperUTF8`, etc.) exist for the cases where byte semantics aren't what you
want.

For semi-structured data, Snowflake's `VARIANT`/`OBJECT`/`ARRAY` map to
ClickHouse's [`JSON`](/sql-reference/data-types/newjson),
[`Tuple`](/sql-reference/data-types/tuple),
[`Nested`](/sql-reference/data-types/nested-data-structures/nested), and
[`Array`](/sql-reference/data-types/array). The native `JSON` type is the
default starting point — it's storage-efficient and lets you keep
schema flexibility while still applying codecs to extracted hot keys. When the
shape is known, named `Tuple`s and `Nested` let you apply typed codecs and
indexes throughout the hierarchy, which Snowflake's untyped `VARIANT` can't.

:::tip
When several ClickHouse types map to a single Snowflake type, pick the smallest
that fits and consider [appropriate codecs](/sql-reference/statements/create/table#column_compression_codec)
for further compression.
:::

| Snowflake | ClickHouse | Notes |
|-----------|------------|-------|
| [`NUMBER(P, S)`, `DECIMAL`, `NUMERIC`](https://docs.snowflake.com/en/sql-reference/data-types-numeric) | [`Decimal(P, S)`](/sql-reference/data-types/decimal) | Sized variants `Decimal32(S)` / `Decimal64(S)` / `Decimal128(S)` / `Decimal256(S)` are also available; ClickHouse supports up to 76 digits versus Snowflake's 38 |
| [`INT`, `INTEGER`, `BIGINT`, `SMALLINT`, `TINYINT`, `BYTEINT`](https://docs.snowflake.com/en/sql-reference/data-types-numeric) | [`UInt8` … `UInt256` / `Int8` … `Int256`](/sql-reference/data-types/int-uint) | All Snowflake integer types are aliases for `NUMBER(38, 0)`; pick the smallest signed or unsigned variant that fits the value range |
| [`FLOAT`, `FLOAT4`, `FLOAT8`, `DOUBLE`, `REAL`](https://docs.snowflake.com/en/sql-reference/data-types-numeric#data-types-for-floating-point-numbers) | [`Float32`](/sql-reference/data-types/float) &nbsp;or&nbsp; [`Float64`](/sql-reference/data-types/float) | All Snowflake floats are 64-bit; `Float32` is available in ClickHouse when precision is less critical and compression matters |
| [`VARCHAR(n)`, `CHAR`, `STRING`, `TEXT`](https://docs.snowflake.com/en/sql-reference/data-types-text#varchar) | [`String`](/sql-reference/data-types/string) | Optionally wrap in [`LowCardinality(String)`](/sql-reference/data-types/lowcardinality) for columns with few distinct values (enums, status codes, country codes). String functions are byte-based; the [String family](/sql-reference/functions/string-functions) has `UTF8` variants where relevant |
| [`BINARY`, `VARBINARY`](https://docs.snowflake.com/en/sql-reference/data-types-text#binary) | [`String`](/sql-reference/data-types/string) &nbsp;or&nbsp; [`FixedString(N)`](/sql-reference/data-types/fixedstring) | |
| [`BOOLEAN`](https://docs.snowflake.com/en/sql-reference/data-types-logical) | [`Bool`](/sql-reference/data-types/boolean) | |
| [`DATE`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#date) | [`Date`](/sql-reference/data-types/date) &nbsp;or&nbsp; [`Date32`](/sql-reference/data-types/date32) | `Date` (2-byte, 1970-2149) for typical analytical data; `Date32` (4-byte, 1900-2299) for Snowflake's wider range |
| [`TIME(N)`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#time) | No equivalent | Carry a [`DateTime64(N)`](/sql-reference/data-types/datetime64) and extract via [`formatDateTime`](/sql-reference/functions/date-time-functions#formatDateTime) |
| [`TIMESTAMP_NTZ`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp-ltz-timestamp-ntz-timestamp-tz) | [`DateTime`](/sql-reference/data-types/datetime) &nbsp;or&nbsp; [`DateTime64(p)`](/sql-reference/data-types/datetime64) | Use `DateTime64(p)` for sub-second precision |
| [`TIMESTAMP_LTZ`, `TIMESTAMP_TZ`](https://docs.snowflake.com/en/sql-reference/data-types-datetime#timestamp-ltz-timestamp-ntz-timestamp-tz) | [`DateTime64(p, 'UTC')`](/sql-reference/data-types/datetime64) | Normalize to UTC at load time via `CONVERT_TIMEZONE('UTC', col)` |
| [`VARIANT`](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#variant) | [`JSON`](/sql-reference/data-types/newjson) &nbsp;or&nbsp; [`Variant`](/sql-reference/data-types/variant) | `JSON` is preferred; extract hot keys to typed columns when the query pattern warrants |
| [`OBJECT`](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#object) | [`JSON`](/sql-reference/data-types/newjson), [`Tuple`](/sql-reference/data-types/tuple), &nbsp;or&nbsp; [`Map(K, V)`](/sql-reference/data-types/map) | Use `Tuple` when the keys are known and stable, `Map(K, V)` when keys are dynamic but values are uniformly typed, `JSON` for fully dynamic shapes |
| [`ARRAY`](https://docs.snowflake.com/en/sql-reference/data-types-semistructured#array) | [`Array(T)`](/sql-reference/data-types/array) | Snowflake `ARRAY` elements are untyped `VARIANT`; ClickHouse `Array(T)` requires a single element type. Use `Array(JSON)` if elements really are heterogeneous |
| [`GEOGRAPHY`](https://docs.snowflake.com/en/sql-reference/data-types-geospatial#geography-data-type), [`GEOMETRY`](https://docs.snowflake.com/en/sql-reference/data-types-geospatial#geometry-data-type) | [Geo data types](/sql-reference/data-types/geo) | Snowflake imposes the `WGS 84` coordinate system; ClickHouse applies coordinate systems at query time |
| [`VECTOR(FLOAT, n)`](https://docs.snowflake.com/en/sql-reference/data-types-vector) | [`Array(Float32)`](/sql-reference/data-types/array) | Pair with a [vector similarity index](/engines/table-engines/mergetree-family/annindexes) for approximate-nearest-neighbor search |

ClickHouse also offers types that have no Snowflake equivalent and are worth
considering during schema design:

| ClickHouse type | Description |
|-----------------|-------------|
| [`IPv4`, `IPv6`](/sql-reference/data-types/ipv4) | IP-specific types, more storage-efficient than `String` |
| [`FixedString(N)`](/sql-reference/data-types/fixedstring) | Fixed byte width; useful for hashes and fixed-format codes |
| [`LowCardinality(T)`](/sql-reference/data-types/lowcardinality) | Dictionary encoding for low-cardinality columns (< ~100k distinct values) |
| [`Enum8`, `Enum16`](/sql-reference/data-types/enum) | Efficient encoding for a small fixed set of named values |
| [`UUID`](/sql-reference/data-types/uuid) | Native UUID storage |
| [`AggregateFunction(name, T)`](/sql-reference/data-types/aggregatefunction) | Intermediate aggregation state — pairs with `AggregatingMergeTree` for incremental materialised views |

## DDL statements {#ddl-statements}

### Schemas and databases {#ddl-schemas}

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>Snowflake</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
CREATE SCHEMA mydb.myschema
```

</td>
<td>

```sql
CREATE DATABASE mydb
```

</td>
</tr>
<tr>
<td colSpan={2}>

Snowflake databases and schemas are a two-level namespace; ClickHouse exposes a single [database](/sql-reference/statements/create/database) level. Map each Snowflake `DATABASE.SCHEMA` to a ClickHouse database.

</td>
</tr>

<tr>
<td>

```sql
CREATE SCHEMA IF NOT EXISTS mydb.myschema
  WITH MANAGED ACCESS
  COMMENT = 'sales'
```

</td>
<td>

```sql
CREATE DATABASE IF NOT EXISTS mydb
COMMENT 'sales'
```

</td>
</tr>
<tr>
<td colSpan={2}>

`MANAGED ACCESS` and other Snowflake-specific schema options have no direct equivalent; access control in ClickHouse is configured via [`GRANT`](/sql-reference/statements/grant) on databases, tables, and rows.

</td>
</tr>

<tr>
<td>

```sql
ALTER SCHEMA mydb.myschema SET COMMENT = 'sales'
```

</td>
<td>

```sql
ALTER DATABASE mydb MODIFY COMMENT 'sales'
```

</td>
</tr>

<tr>
<td>

```sql
DROP SCHEMA mydb.myschema
```

</td>
<td>

```sql
DROP DATABASE mydb
```

</td>
</tr>
<tr>
<td colSpan={2}>

Add `IF EXISTS` for an idempotent drop in either engine.

</td>
</tr>

<tr>
<td>

```sql
DROP SCHEMA mydb.myschema CASCADE
```

</td>
<td>

```sql
DROP DATABASE mydb
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse drops tables in the database unconditionally; there is no `CASCADE` keyword.

</td>
</tr>

</tbody>
</table>

### Tables {#ddl-tables}

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>Snowflake</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
CREATE TABLE myschema.t (
  id   NUMBER(38, 0),
  name VARCHAR
)
```

</td>
<td>

```sql
CREATE TABLE mydb.t (
  id   Int64,
  name String
)
ENGINE = MergeTree
ORDER BY id
```

</td>
</tr>
<tr>
<td colSpan={2}>

An engine and an `ORDER BY` are required for `MergeTree`-family tables; pick the columns that match the query access pattern. See [Sparse primary indexes](/guides/best-practices/sparse-primary-indexes).

</td>
</tr>

<tr>
<td>

```sql
CREATE TABLE IF NOT EXISTS myschema.t (id NUMBER)
```

</td>
<td>

```sql
CREATE TABLE IF NOT EXISTS mydb.t (id Int64)
ENGINE = MergeTree
ORDER BY id
```

</td>
</tr>

<tr>
<td>

```sql
CREATE OR REPLACE TABLE myschema.t (id NUMBER)
```

</td>
<td>

```sql
CREATE OR REPLACE TABLE mydb.t (id Int64)
ENGINE = MergeTree
ORDER BY id
```

</td>
</tr>

<tr>
<td>

```sql
CREATE TABLE myschema.t (
  id         NUMBER,
  l_shipdate DATE
)
CLUSTER BY (id, l_shipdate)
```

</td>
<td>

```sql
CREATE TABLE mydb.t (
  id         Int64,
  l_shipdate Date
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(l_shipdate)
ORDER BY (id, l_shipdate)
```

</td>
</tr>
<tr>
<td colSpan={2}>

Snowflake `CLUSTER BY` colocates rows for pruning; in ClickHouse the equivalent is the table's `ORDER BY` key, which controls on-disk ordering and the primary index. Add `PARTITION BY` (e.g. `toYYYYMM(date_col)`) when you also want coarse time-window pruning.

</td>
</tr>

<tr>
<td>

```sql
CREATE TABLE myschema.t LIKE myschema.source
```

</td>
<td>

```sql
CREATE TABLE mydb.t AS mydb.source
```

</td>
</tr>
<tr>
<td colSpan={2}>

Both copy the schema only; ClickHouse also copies engine and `ORDER BY`.

</td>
</tr>

<tr>
<td>

```sql
CREATE TABLE myschema.t AS
SELECT * FROM myschema.source
```

</td>
<td>

```sql
CREATE TABLE mydb.t
ENGINE = MergeTree
ORDER BY id
AS SELECT * FROM mydb.source
```

</td>
</tr>
<tr>
<td colSpan={2}>

Engine and `ORDER BY` are required for the new table.

</td>
</tr>

<tr>
<td>

```sql
CREATE TEMPORARY TABLE t AS SELECT 1 AS x
```

</td>
<td>

```sql
CREATE TEMPORARY TABLE t (x Int64);
INSERT INTO t VALUES (1);
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse temporary tables are session-scoped. The engine clause is optional and defaults to [`Memory`](/engines/table-engines/special/memory).

</td>
</tr>

<tr>
<td>

```sql
CREATE TRANSIENT TABLE myschema.t (id NUMBER)
```

</td>
<td>

```sql
CREATE TABLE mydb.t (id Int64)
ENGINE = MergeTree
ORDER BY id
```

</td>
</tr>
<tr>
<td colSpan={2}>

`TRANSIENT` is a Snowflake storage-cost optimisation (no Fail-safe). ClickHouse tables don't carry equivalent retention semantics — create a regular table.

</td>
</tr>

<tr>
<td>

```sql
CREATE EXTERNAL TABLE myschema.t (...)
LOCATION = @my_stage
FILE_FORMAT = (TYPE = PARQUET)
```

</td>
<td>

```sql
CREATE TABLE mydb.t (...)
ENGINE = S3('https://.../*.parquet', 'Parquet')
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse exposes external storage through table engines such as [`S3`](/engines/table-engines/integrations/s3), [`URL`](/engines/table-engines/special/url), and [`HDFS`](/engines/table-engines/integrations/hdfs).

</td>
</tr>

<tr>
<td>

```sql
ALTER TABLE myschema.t ADD COLUMN tag VARCHAR
```

</td>
<td>

```sql
ALTER TABLE mydb.t ADD COLUMN tag String
```

</td>
</tr>

<tr>
<td>

```sql
ALTER TABLE myschema.t DROP COLUMN tag
```

</td>
<td>

```sql
ALTER TABLE mydb.t DROP COLUMN tag
```

</td>
</tr>

<tr>
<td>

```sql
ALTER TABLE myschema.t RENAME COLUMN old TO new
```

</td>
<td>

```sql
ALTER TABLE mydb.t RENAME COLUMN old TO new
```

</td>
</tr>

<tr>
<td>

```sql
ALTER TABLE myschema.t ALTER COLUMN amount SET DATA TYPE FLOAT
```

</td>
<td>

```sql
ALTER TABLE mydb.t MODIFY COLUMN amount Float64
```

</td>
</tr>

<tr>
<td>

```sql
ALTER TABLE myschema.t SET COMMENT = '...'
```

</td>
<td>

```sql
ALTER TABLE mydb.t MODIFY COMMENT '...'
```

</td>
</tr>

<tr>
<td>

```sql
ALTER TABLE myschema.t RENAME TO t2
```

</td>
<td>

```sql
RENAME TABLE mydb.t TO mydb.t2
```

</td>
</tr>

<tr>
<td>

```sql
DROP TABLE myschema.t
```

</td>
<td>

```sql
DROP TABLE mydb.t
```

</td>
</tr>

<tr>
<td>

```sql
TRUNCATE TABLE myschema.t
```

</td>
<td>

```sql
TRUNCATE TABLE mydb.t
```

</td>
</tr>

</tbody>
</table>

### Views, materialized views, and dynamic tables {#ddl-views}

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>Snowflake</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
CREATE VIEW myschema.v AS
SELECT id, name FROM myschema.t
```

</td>
<td>

```sql
CREATE VIEW mydb.v AS
SELECT id, name FROM mydb.t
```

</td>
</tr>
<tr>
<td colSpan={2}>

Standard logical views; no storage in either engine.

</td>
</tr>

<tr>
<td>

```sql
CREATE OR REPLACE VIEW myschema.v AS SELECT ...
```

</td>
<td>

```sql
CREATE OR REPLACE VIEW mydb.v AS SELECT ...
```

</td>
</tr>

<tr>
<td>

```sql
DROP VIEW myschema.v
```

</td>
<td>

```sql
DROP VIEW mydb.v
```

</td>
</tr>

<tr>
<td>

```sql
CREATE MATERIALIZED VIEW myschema.mv AS
SELECT status, count(*) AS c
FROM myschema.t
GROUP BY status
```

</td>
<td>

```sql
CREATE MATERIALIZED VIEW mydb.mv
ENGINE = AggregatingMergeTree
ORDER BY status
AS SELECT status, countState() AS c
FROM mydb.t
GROUP BY status
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse [materialized views](/sql-reference/statements/create/view#materialized-view) are incremental insert-time triggers that write into a target table. For aggregate MVs, use [`AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree) and the `-State` aggregate-function combinator. Query the MV with `countMerge(c)` to finalize. Snowflake materialized views have stricter restrictions (single-table, limited functions); ClickHouse MVs have no such restrictions but require the target-table pattern for non-trivial aggregations.

</td>
</tr>

<tr>
<td>

```sql
CREATE DYNAMIC TABLE myschema.dt
TARGET_LAG = '1 hour'
WAREHOUSE = compute_wh AS
SELECT date_trunc('day', ts) AS d, count(*) AS c
FROM myschema.t
GROUP BY d
```

</td>
<td>

```sql
CREATE MATERIALIZED VIEW mydb.dt
REFRESH EVERY 1 HOUR
ENGINE = MergeTree
ORDER BY d
AS SELECT toStartOfDay(ts) AS d, count() AS c
FROM mydb.t
GROUP BY d
```

</td>
</tr>
<tr>
<td colSpan={2}>

Snowflake [Dynamic Tables](https://docs.snowflake.com/en/user-guide/dynamic-tables-about) refresh periodically based on `TARGET_LAG`. The closest ClickHouse equivalent is a [refreshable materialized view](/sql-reference/statements/create/view#refreshable-materialized-view) with `REFRESH EVERY`. For inserts that should aggregate incrementally (rather than fully refresh), prefer the standard `AggregatingMergeTree` + MV pattern above.

</td>
</tr>

</tbody>
</table>

### Streams, tasks, sequences, and stages {#ddl-streams-tasks}

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>Snowflake</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
CREATE STREAM myschema.s ON TABLE myschema.t
```

</td>
<td>

No equivalent

</td>
</tr>
<tr>
<td colSpan={2}>

Snowflake [Streams](https://docs.snowflake.com/en/user-guide/streams-intro) track CDC changes on a source table. ClickHouse has no built-in CDC primitive; the common replacements are (a) the [`ReplacingMergeTree`](/engines/table-engines/mergetree-family/replacingmergetree) family with a version column to model upserts, (b) an external CDC pipeline (Debezium, ClickPipes) feeding inserts, or (c) ingesting only append-only event streams and using the natural insert order.

</td>
</tr>

<tr>
<td>

```sql
CREATE TASK myschema.tk
SCHEDULE = '1 HOUR'
AS INSERT INTO myschema.t SELECT ...
```

</td>
<td>

No equivalent

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse has no in-database task scheduler; orchestrate periodic SQL from a client (cron, Airflow, dbt, etc.). For periodic materializations, [refreshable materialized views](/sql-reference/statements/create/view#refreshable-materialized-view) cover many task use cases natively.

</td>
</tr>

<tr>
<td>

```sql
CREATE SEQUENCE myschema.seq START = 1 INCREMENT = 1
```

</td>
<td>

No equivalent

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse has no SEQUENCE object. Use [`generateUUIDv4()`](/sql-reference/functions/uuid-functions#generateUUIDv4) for unique identifiers, [`generateSnowflakeID()`](/sql-reference/functions/uuid-functions#generateSnowflakeID) for monotonic 64-bit IDs, or maintain a counter table with `INSERT … VALUES (max+1, …)`.

</td>
</tr>

<tr>
<td>

```sql
CREATE STAGE myschema.stg
URL = 's3://bucket/path/'
FILE_FORMAT = (TYPE = PARQUET)
```

</td>
<td>

```sql
-- Use the S3 table engine or s3() table function directly:
SELECT * FROM s3('https://bucket.s3.amazonaws.com/path/*.parquet', 'Parquet')
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse references external storage directly via the [`S3`](/engines/table-engines/integrations/s3), [`URL`](/engines/table-engines/special/url), and [`HDFS`](/engines/table-engines/integrations/hdfs) engines and table functions. No persistent stage object is created.

</td>
</tr>

</tbody>
</table>

### Indexes, functions, and procedures {#ddl-functions-procedures}

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>Snowflake</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
CREATE SEARCH OPTIMIZATION ON myschema.t
```

</td>
<td>

```sql
ALTER TABLE mydb.t
ADD INDEX idx name
  TYPE text(tokenizer = splitByNonAlpha)
  GRANULARITY 1
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse [full-text indexes](/engines/table-engines/mergetree-family/textindexes) accelerate `LIKE` / token-search predicates on specific columns. Unlike Snowflake's table-level Search Optimization service, ClickHouse text indexes are defined per column and per tokenizer.

</td>
</tr>

<tr>
<td>

```sql
-- Snowflake VECTOR-aware lookups use VECTOR_COSINE_SIMILARITY()
-- without a separate index object.
```

</td>
<td>

```sql
ALTER TABLE mydb.t
ADD INDEX idx embedding
  TYPE vector_similarity('hnsw', 'cosineDistance', 1536)
  GRANULARITY 1
```

</td>
</tr>
<tr>
<td colSpan={2}>

The third argument is the vector dimension and is required; it must match the length of every value stored in the indexed `Array(Float*)` column. See [Approximate-nearest-neighbor indexes](/engines/table-engines/mergetree-family/annindexes).

</td>
</tr>

<tr>
<td>

```sql
CREATE FUNCTION myschema.add_one(x NUMBER)
RETURNS NUMBER AS $$ x + 1 $$
```

</td>
<td>

```sql
CREATE FUNCTION add_one AS (x) -> x + 1
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse [UDFs](/sql-reference/statements/create/function) are expression-only. For complex logic, use the SQL-defined-function or executable-UDF patterns.

</td>
</tr>

<tr>
<td>

```sql
CREATE FUNCTION myschema.f(x NUMBER)
RETURNS NUMBER LANGUAGE javascript AS $$ return x+1 $$
```

</td>
<td>

No equivalent

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse has no JavaScript or Python UDFs in standard SQL; use executable UDFs at the server level.

</td>
</tr>

<tr>
<td>

```sql
DROP FUNCTION myschema.add_one
```

</td>
<td>

```sql
DROP FUNCTION add_one
```

</td>
</tr>

<tr>
<td>

```sql
CREATE PROCEDURE myschema.p(x NUMBER) RETURNS NUMBER
LANGUAGE SQL AS $$ BEGIN ... END $$
```

</td>
<td>

No equivalent

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse has no stored procedures; orchestrate from a client (Python, Go, etc.) or compose into a SQL function.

</td>
</tr>

</tbody>
</table>

## DML {#dml}

### Insert operations {#dml-inserts}

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>Snowflake</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
INSERT INTO myschema.t VALUES (1, 'a'), (2, 'b')
```

</td>
<td>

```sql
INSERT INTO mydb.t VALUES (1, 'a'), (2, 'b')
```

</td>
</tr>

<tr>
<td>

```sql
INSERT INTO myschema.t (id, name) VALUES (1, 'a')
```

</td>
<td>

```sql
INSERT INTO mydb.t (id, name) VALUES (1, 'a')
```

</td>
</tr>

<tr>
<td>

```sql
INSERT INTO myschema.t
SELECT id, name FROM myschema.source
```

</td>
<td>

```sql
INSERT INTO mydb.t
SELECT id, name FROM mydb.source
```

</td>
</tr>

<tr>
<td>

```sql
INSERT ALL
  INTO t1 VALUES (1)
  INTO t2 VALUES (2)
SELECT 1
```

</td>
<td>

No equivalent

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse has no multi-table `INSERT ALL` / `INSERT FIRST`. Issue separate `INSERT … SELECT` statements, or use [materialized views](/sql-reference/statements/create/view#materialized-view) to fan a single insert out into multiple target tables.

</td>
</tr>

</tbody>
</table>

### Update operations {#dml-updates}

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>Snowflake</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
UPDATE myschema.t SET name = 'x' WHERE id = 1
```

</td>
<td>

```sql
ALTER TABLE mydb.t UPDATE name = 'x' WHERE id = 1
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse mutates asynchronously by default. For synchronous, in-place updates use [lightweight updates](/sql-reference/statements/update): `UPDATE mydb.t SET name = 'x' WHERE id = 1`.

</td>
</tr>

</tbody>
</table>

### Delete operations {#dml-deletes}

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>Snowflake</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
DELETE FROM myschema.t WHERE id = 1
```

</td>
<td>

```sql
DELETE FROM mydb.t WHERE id = 1
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse's [lightweight delete](/sql-reference/statements/delete) marks rows for removal; physical removal happens at the next merge. For bulk historical cleanup prefer use of [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl).

</td>
</tr>

<tr>
<td>

```sql
TRUNCATE TABLE myschema.t
```

</td>
<td>

```sql
TRUNCATE TABLE mydb.t
```

</td>
</tr>

</tbody>
</table>

### Merge operations {#dml-merges}

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>Snowflake</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
MERGE INTO myschema.t USING myschema.staging s
  ON t.id = s.id
WHEN MATCHED THEN UPDATE SET ...
WHEN NOT MATCHED THEN INSERT ...
```

</td>
<td>

No equivalent

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse has no equivalent `MERGE` statement. The idiomatic pattern is a [`ReplacingMergeTree`](/engines/table-engines/mergetree-family/replacingmergetree) keyed on the natural key plus a version column; an `INSERT` of newer rows "wins" at merge time. Use [`FINAL`](/sql-reference/statements/select/from#final-modifier) for read-time deduplication.

</td>
</tr>

</tbody>
</table>

## DCL {#dcl}

### Grants {#dcl-grants}

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>Snowflake</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
GRANT SELECT ON TABLE myschema.t TO ROLE analyst
```

</td>
<td>

```sql
GRANT SELECT ON mydb.t TO analyst
```

</td>
</tr>
<tr>
<td colSpan={2}>

Snowflake grants always flow through roles. ClickHouse can grant directly to users or to roles created with `CREATE ROLE`.

</td>
</tr>

<tr>
<td>

```sql
GRANT ROLE analyst TO USER alice
```

</td>
<td>

```sql
GRANT analyst TO alice
```

</td>
</tr>

<tr>
<td>

```sql
REVOKE SELECT ON TABLE myschema.t FROM ROLE analyst
```

</td>
<td>

```sql
REVOKE SELECT ON mydb.t FROM analyst
```

</td>
</tr>

</tbody>
</table>

### Roles {#dcl-roles}

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>Snowflake</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
CREATE USER alice PASSWORD = 'pw'
```

</td>
<td>

```sql
CREATE USER alice
IDENTIFIED WITH plaintext_password BY 'pw'
```

</td>
</tr>
<tr>
<td colSpan={2}>

See [Access control and roles](/operations/access-rights) for the full ClickHouse authentication options (including SSL, LDAP, Kerberos, and double-SHA1 password hashing).

</td>
</tr>

<tr>
<td>

```sql
CREATE ROLE analyst
```

</td>
<td>

```sql
CREATE ROLE analyst
```

</td>
</tr>

<tr>
<td>

```sql
DROP USER alice
```

</td>
<td>

```sql
DROP USER alice
```

</td>
</tr>

</tbody>
</table>

## Syntax {#syntax}

### Query syntax {#query-syntax}

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>Snowflake</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
SELECT id, name FROM myschema.t
```

</td>
<td>

```sql
SELECT id, name FROM mydb.t
```

</td>
</tr>

<tr>
<td>

```sql
SELECT * FROM myschema.t
```

</td>
<td>

```sql
SELECT * FROM mydb.t
```

</td>
</tr>

<tr>
<td>

```sql
SELECT * EXCLUDE (password) FROM myschema.t
```

</td>
<td>

```sql
SELECT * EXCEPT password FROM mydb.t
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse [`* EXCEPT`](/sql-reference/statements/select/#except-modifier) accepts an unparenthesised single column; multiple columns must be parenthesised: `SELECT * EXCEPT (a, b) FROM mydb.t`.

</td>
</tr>

<tr>
<td>

```sql
SELECT * RENAME (name AS full_name) FROM myschema.t
```

</td>
<td>

```sql
SELECT * EXCEPT name, name AS full_name FROM mydb.t
```

</td>
</tr>
<tr>
<td colSpan={2}>

Snowflake `* RENAME` renames a column in the projection. ClickHouse has no inline rename modifier; combine `* EXCEPT` with an aliased reintroduction. ClickHouse `* REPLACE` substitutes the value of an existing column but can't rename it.

</td>
</tr>

<tr>
<td>

```sql
SELECT id FROM myschema.t
WHERE created_at > '2024-01-01'
```

</td>
<td>

```sql
SELECT id FROM mydb.t
WHERE created_at > '2024-01-01'
```

</td>
</tr>

<tr>
<td>

```sql
SELECT status, COUNT(*) FROM myschema.t
GROUP BY status
```

</td>
<td>

```sql
SELECT status, count() FROM mydb.t
GROUP BY status
```

</td>
</tr>

<tr>
<td>

```sql
SELECT status, COUNT(*) FROM myschema.t
GROUP BY ROLLUP (status, country)
```

</td>
<td>

```sql
SELECT status, country, count() FROM mydb.t
GROUP BY ROLLUP (status, country)
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse also supports `GROUP BY CUBE` and `GROUP BY GROUPING SETS`.

</td>
</tr>

<tr>
<td>

```sql
SELECT status, COUNT(*) AS c FROM myschema.t
GROUP BY status
HAVING c > 10
```

</td>
<td>

```sql
SELECT status, count() AS c FROM mydb.t
GROUP BY status
HAVING c > 10
```

</td>
</tr>

<tr>
<td>

```sql
SELECT id FROM myschema.t ORDER BY id DESC NULLS LAST
LIMIT 100
```

</td>
<td>

```sql
SELECT id FROM mydb.t ORDER BY id DESC NULLS LAST
LIMIT 100
```

</td>
</tr>

<tr>
<td>

```sql
SELECT id FROM myschema.t LIMIT 100 OFFSET 50
-- or
SELECT id FROM myschema.t
OFFSET 50 ROWS FETCH NEXT 100 ROWS ONLY
```

</td>
<td>

```sql
SELECT id FROM mydb.t LIMIT 100 OFFSET 50
```

</td>
</tr>

<tr>
<td>

```sql
SELECT DISTINCT status FROM myschema.t
```

</td>
<td>

```sql
SELECT DISTINCT status FROM mydb.t
```

</td>
</tr>

<tr>
<td>

```sql
WITH recent AS (
  SELECT * FROM myschema.t
  WHERE created_at > '2024-01-01'
)
SELECT id FROM recent
```

</td>
<td>

```sql
WITH recent AS (
  SELECT * FROM mydb.t
  WHERE created_at > '2024-01-01'
)
SELECT id FROM recent
```

</td>
</tr>

<tr>
<td>

```sql
WITH RECURSIVE r(n) AS (
  SELECT 1 UNION ALL SELECT n+1 FROM r WHERE n < 5
)
SELECT * FROM r
```

</td>
<td>

```sql
WITH RECURSIVE r AS (
  SELECT 1 AS n UNION ALL SELECT n+1 FROM r WHERE n < 5
)
SELECT * FROM r
```

</td>
</tr>

<tr>
<td>

```sql
SELECT a.id
FROM myschema.t a
INNER JOIN myschema.u b ON a.id = b.id
```

</td>
<td>

```sql
SELECT a.id
FROM mydb.t AS a
INNER JOIN mydb.u AS b ON a.id = b.id
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse generally requires `AS` for table aliases.

</td>
</tr>

<tr>
<td>

```sql
SELECT a.id
FROM myschema.t a
LEFT JOIN myschema.u b ON a.id = b.id
```

</td>
<td>

```sql
SELECT a.id
FROM mydb.t AS a
LEFT JOIN mydb.u AS b ON a.id = b.id
```

</td>
</tr>
<tr>
<td colSpan={2}>

`FULL`, `RIGHT`, `LEFT ANY`, `LEFT SEMI`, `LEFT ANTI` all match between engines.

</td>
</tr>

<tr>
<td>

```sql
SELECT a.id
FROM myschema.t a
FULL OUTER JOIN myschema.u b ON a.id = b.id
```

</td>
<td>

```sql
SELECT a.id
FROM mydb.t AS a
FULL JOIN mydb.u AS b ON a.id = b.id
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse spells it `FULL JOIN` (the `OUTER` keyword is optional and usually omitted).

</td>
</tr>

<tr>
<td>

```sql
SELECT a.id
FROM myschema.t a
CROSS JOIN myschema.u b
```

</td>
<td>

```sql
SELECT a.id
FROM mydb.t AS a
CROSS JOIN mydb.u AS b
```

</td>
</tr>

<tr>
<td>

```sql
SELECT a.id
FROM myschema.t a
JOIN myschema.u b USING (id)
```

</td>
<td>

```sql
SELECT a.id
FROM mydb.t AS a
JOIN mydb.u AS b USING (id)
```

</td>
</tr>

<tr>
<td>

```sql
SELECT trades.symbol, trades.price, quotes.bid
FROM trades ASOF JOIN quotes
  MATCH_CONDITION (trades.ts >= quotes.ts)
  ON trades.symbol = quotes.symbol
```

</td>
<td>

```sql
SELECT trades.symbol, trades.price, quotes.bid
FROM trades ASOF JOIN quotes
  ON trades.symbol = quotes.symbol AND trades.ts >= quotes.ts
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse supports [`ASOF JOIN`](/sql-reference/statements/select/join#asof-join-usage) natively. The inequality (e.g. `trades.ts >= quotes.ts`) goes into the `ON` clause as the last predicate, instead of into a separate `MATCH_CONDITION` clause.

</td>
</tr>

<tr>
<td>

```sql
SELECT * FROM myschema.t, LATERAL flatten(input => t.tags) f
```

</td>
<td>

```sql
SELECT * FROM mydb.t
ARRAY JOIN tags AS f
```

</td>
</tr>
<tr>
<td colSpan={2}>

Use [`ARRAY JOIN`](/sql-reference/statements/select/array-join) for tabular expansion of an array column, or [`arrayJoin`](/sql-reference/functions/array-join) in the `SELECT` list to expand an array expression.

</td>
</tr>

<tr>
<td>

```sql
SELECT * FROM myschema.t
WHERE EXISTS (
  SELECT 1 FROM myschema.u WHERE u.id = t.id
)
```

</td>
<td>

```sql
SELECT * FROM mydb.t
WHERE id IN (SELECT id FROM mydb.u)
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse supports `EXISTS (subquery)` as well; `IN (subquery)` is the more idiomatic form for existence checks and is what you'll see in most ClickHouse query examples.

</td>
</tr>

<tr>
<td>

```sql
SELECT a, b FROM myschema.t
UNION ALL
SELECT a, b FROM myschema.u
```

</td>
<td>

```sql
SELECT a, b FROM mydb.t
UNION ALL
SELECT a, b FROM mydb.u
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse rejects bare `UNION` by default (controlled by the `union_default_mode` setting); always write `UNION ALL` or `UNION DISTINCT` explicitly to avoid surprises.

</td>
</tr>

<tr>
<td>

```sql
SELECT a FROM myschema.t
INTERSECT
SELECT a FROM myschema.u
```

</td>
<td>

```sql
SELECT a FROM mydb.t
INTERSECT DISTINCT
SELECT a FROM mydb.u
```

</td>
</tr>
<tr>
<td colSpan={2}>

Snowflake `INTERSECT` deduplicates (it's `INTERSECT DISTINCT` semantically). ClickHouse bare `INTERSECT` preserves duplicates — use `INTERSECT DISTINCT` to keep Snowflake's behavior.

</td>
</tr>

<tr>
<td>

```sql
SELECT a FROM myschema.t
MINUS
SELECT a FROM myschema.u
```

</td>
<td>

```sql
SELECT a FROM mydb.t
EXCEPT DISTINCT
SELECT a FROM mydb.u
```

</td>
</tr>
<tr>
<td colSpan={2}>

Snowflake `MINUS` (or `EXCEPT`) deduplicates. ClickHouse bare `EXCEPT` preserves duplicates — use `EXCEPT DISTINCT` for parity.

</td>
</tr>

<tr>
<td>

```sql
SELECT id FROM myschema.t
QUALIFY ROW_NUMBER() OVER (
  PARTITION BY user_id
  ORDER BY created_at DESC
) = 1
```

</td>
<td>

```sql
SELECT id FROM (
  SELECT *,
    row_number() OVER (
      PARTITION BY user_id
      ORDER BY created_at DESC
    ) AS rn
  FROM mydb.t
)
WHERE rn = 1
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse has no `QUALIFY`; wrap the windowed query in a subquery.

</td>
</tr>

<tr>
<td>

```sql
SELECT * FROM myschema.t TABLESAMPLE BERNOULLI (10)
```

</td>
<td>

```sql
SELECT * FROM mydb.t SAMPLE 0.1
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse [`SAMPLE`](/sql-reference/statements/select/sample) requires the table to declare a `SAMPLE BY` clause. For ad-hoc sampling, use `WHERE cityHash64(some_col) % 100 < 10` or `LIMIT n BY 1`.

</td>
</tr>

<tr>
<td>

```sql
SELECT * FROM myschema.t
AT (TIMESTAMP => '2024-03-15 00:00:00')
```

</td>
<td>

No equivalent

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse doesn't provide row-level time travel. Patterns include [`ReplacingMergeTree`](/engines/table-engines/mergetree-family/replacingmergetree) with a version column, per-day backup tables, or use of [ClickHouse Cloud backup-and-restore](/cloud/manage/backups/configurable-backups) for coarse-grained snapshots.

</td>
</tr>

<tr>
<td>

```sql
SELECT * FROM myschema.t
CHANGES (INFORMATION => APPEND_ONLY)
AT (TIMESTAMP => '2024-03-15')
```

</td>
<td>

No equivalent

</td>
</tr>
<tr>
<td colSpan={2}>

Snowflake `CHANGES` exposes the underlying Stream data without creating a Stream object. ClickHouse has no equivalent — see the [Streams row](#ddl-streams-tasks) for CDC alternatives.

</td>
</tr>

<tr>
<td>

```sql
SELECT id, sum(amount) OVER w
FROM myschema.t
WINDOW w AS (PARTITION BY user_id ORDER BY created_at)
```

</td>
<td>

```sql
SELECT id, sum(amount) OVER w
FROM mydb.t
WINDOW w AS (PARTITION BY user_id ORDER BY created_at)
```

</td>
</tr>

<tr>
<td>

```sql
SELECT * FROM myschema.t
PIVOT (count(*) FOR status IN ('open' AS open, 'closed' AS closed))
```

</td>
<td>

```sql
SELECT
  countIf(status = 'open')   AS open,
  countIf(status = 'closed') AS closed
FROM mydb.t
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse has no `PIVOT`; use [`countIf` / `sumIf`](/sql-reference/aggregate-functions/combinators#-if) per output column.

</td>
</tr>

<tr>
<td>

```sql
SELECT col, v
FROM (SELECT 1 AS a, 2 AS b)
UNPIVOT (v FOR col IN (a, b))
```

</td>
<td>

```sql
SELECT p.1 AS col, p.2 AS v
FROM (
  SELECT [tuple('a', a), tuple('b', b)] AS pairs FROM mydb.t
)
ARRAY JOIN pairs AS p
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse has no `UNPIVOT`; emit `(name, value)` tuples and `ARRAY JOIN`.

</td>
</tr>

<tr>
<td>

```sql
WITH RECURSIVE org AS (
  SELECT id, manager_id FROM employees WHERE id = 1
  UNION ALL
  SELECT e.id, e.manager_id FROM employees e
  JOIN org ON e.manager_id = org.id
)
SELECT * FROM org
-- (Snowflake also accepts CONNECT BY for hierarchical queries)
```

</td>
<td>

```sql
WITH RECURSIVE org AS (
  SELECT id, manager_id FROM employees WHERE id = 1
  UNION ALL
  SELECT e.id, e.manager_id FROM employees e
  JOIN org ON e.manager_id = org.id
)
SELECT * FROM org
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse has no `CONNECT BY` syntax; use a recursive CTE, which both engines support identically.

</td>
</tr>

<tr>
<td>

```sql
SELECT *
FROM myschema.t
MATCH_RECOGNIZE (
  PARTITION BY user_id
  ORDER BY ts
  PATTERN (A B+)
  DEFINE
    A AS event = 'login',
    B AS event = 'click'
)
```

</td>
<td>

No equivalent

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse has no `MATCH_RECOGNIZE`. Rewrite with window functions plus `sequenceMatch` / `sequenceCount` for event-sequence detection, or with `arrayJoin` over a session-windowed array.

</td>
</tr>

</tbody>
</table>

### Procedural language (Snowflake Scripting) {#procedural-language}

ClickHouse SQL isn't a procedural language. Variables, loops, statement-level
`IF` / `CASE`, cursors, and stored procedures have no first-class equivalents;
orchestrate multi-step logic from a client library (Python, Go, JavaScript,
etc.) or use [parameterized views](/sql-reference/statements/create/view#parameterized-view)
for templated queries.

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>Snowflake</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
DECLARE x NUMBER DEFAULT 0;
LET y := 5;
```

</td>
<td>

_client-side variable, or `SET param_x = 0` for [query parameters](/operations/server-configuration-parameters/settings#query-parameters)_

</td>
</tr>

<tr>
<td>

```sql
x := 5;
```

</td>
<td>

_client-side; `SET param_x = 5`_

</td>
</tr>

<tr>
<td>

```sql
BEGIN ... END
```

</td>
<td>

_multi-statement scripts are run by the client, not the server_

</td>
</tr>

<tr>
<td>

```sql
IF (cond) THEN ... ELSEIF ... ELSE ... END IF
```

</td>
<td>

_expression form `if(cond, a, b)` or `multiIf(c1, v1, c2, v2, default)`; for statement-level branching, branch in the client_

</td>
</tr>

<tr>
<td>

```sql
CASE WHEN cond THEN ... ELSE ... END CASE
```

</td>
<td>

_expression form `CASE WHEN cond THEN a ELSE b END`; no statement form_

</td>
</tr>

<tr>
<td>

```sql
WHILE cond LOOP ... END LOOP
```

</td>
<td>

_no equivalent; use a client-driven loop_

</td>
</tr>

<tr>
<td>

```sql
REPEAT ... UNTIL cond END REPEAT
```

</td>
<td>

_no equivalent_

</td>
</tr>

<tr>
<td>

```sql
FOR r IN cursor DO ... END FOR
```

</td>
<td>

_iterate over query results client-side_

</td>
</tr>

<tr>
<td>

`BREAK`, `CONTINUE`

</td>
<td>

_no equivalent_

</td>
</tr>

<tr>
<td>

```sql
DECLARE c CURSOR FOR SELECT ...
OPEN c; FETCH c INTO ...; CLOSE c;
```

</td>
<td>

_no cursors; iterate result rows in the client_

</td>
</tr>

<tr>
<td>

```sql
RETURN 42
```

</td>
<td>

_expression-only UDFs return their body; no procedural `RETURN`_

</td>
</tr>

<tr>
<td>

```sql
EXCEPTION
  WHEN STATEMENT_ERROR THEN ...
```

</td>
<td>

_no exception handlers; catch errors in the client_

</td>
</tr>

<tr>
<td>

```sql
CALL myschema.p(1)
```

</td>
<td>

_no stored procedures_

</td>
</tr>

<tr>
<td>

```sql
EXECUTE IMMEDIATE 'SELECT 1'
```

</td>
<td>

_client-side prepared statements_

</td>
</tr>

<tr>
<td>

```sql
BEGIN TRANSACTION; ...; COMMIT
```

</td>
<td>

_multi-statement transactions are experimental_; see [transactions roadmap](https://github.com/ClickHouse/ClickHouse/issues/58392)

</td>
</tr>

</tbody>
</table>

### Operators {#operators}

<table className="sql-translation-table has-notes-col">
<colgroup>
<col />
<col />
<col />
</colgroup>
<thead>
<tr>
<th>Snowflake</th>
<th>ClickHouse</th>
<th>Notes</th>
</tr>
</thead>
<tbody>

<tr>
<td>

`a + b`, `a - b`, `a * b`, `a / b`

</td>
<td>

`a + b`, `a - b`, `a * b`, `a / b`

</td>
<td>

`/` is real division in both engines.

</td>
</tr>

<tr>
<td>

```sql
DIV0(a, b)
```

</td>
<td>

```sql
if(b = 0, 0, intDiv(a, b))
```

</td>
<td>

Integer division returning `0` on zero divisor; ClickHouse `intDiv` errors on zero.

</td>
</tr>

<tr>
<td>

```sql
MOD(a, b)
```

</td>
<td>

```sql
a % b -- or modulo(a, b)
```

</td>
<td></td>
</tr>

<tr>
<td>

`a = b`, `a != b`, `a <> b`

</td>
<td>

`a = b`, `a != b`, `a <> b`

</td>
<td></td>
</tr>

<tr>
<td>

`a < b`, `a <= b`, `a > b`, `a >= b`

</td>
<td>

_same_

</td>
<td></td>
</tr>

<tr>
<td>

`a AND b`, `a OR b`, `NOT a`

</td>
<td>

_same_

</td>
<td></td>
</tr>

<tr>
<td>

```sql
a IN (1, 2, 3)
```

</td>
<td>

```sql
a IN (1, 2, 3)
```

</td>
<td></td>
</tr>

<tr>
<td>

```sql
a NOT IN (1, 2, 3)
```

</td>
<td>

```sql
a NOT IN (1, 2, 3)
```

</td>
<td></td>
</tr>

<tr>
<td>

```sql
a BETWEEN x AND y
```

</td>
<td>

```sql
a BETWEEN x AND y
```

</td>
<td>

Inclusive of both bounds.

</td>
</tr>

<tr>
<td>

```sql
a IS NULL -- or a IS NOT NULL
```

</td>
<td>

_same_

</td>
<td></td>
</tr>

<tr>
<td>

```sql
a LIKE 'pre%'
```

</td>
<td>

```sql
a LIKE 'pre%'
```

</td>
<td></td>
</tr>

<tr>
<td>

```sql
a ILIKE 'pre%'
```

</td>
<td>

```sql
a ILIKE 'pre%'
```

</td>
<td>

Case-insensitive `LIKE`.

</td>
</tr>

<tr>
<td>

```sql
a RLIKE '^[a-z]+$'
```

</td>
<td>

```sql
match(a, '^[a-z]+$')
```

</td>
<td>

`RLIKE` is regex match; ClickHouse uses [`match`](/sql-reference/functions/string-search-functions#match).

</td>
</tr>

<tr>
<td>

```sql
CONCAT(a, b) -- or a || b
```

</td>
<td>

```sql
concat(a, b) -- or a || b
```

</td>
<td></td>
</tr>

</tbody>
</table>

### Conditional expressions {#conditional}

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>Snowflake</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
CASE WHEN c THEN a ELSE b END
```

</td>
<td>

```sql
CASE WHEN c THEN a ELSE b END
```

</td>
</tr>

<tr>
<td>

```sql
CASE x WHEN 1 THEN 'a' ELSE 'b' END
```

</td>
<td>

```sql
CASE x WHEN 1 THEN 'a' ELSE 'b' END
```

</td>
</tr>

<tr>
<td>

```sql
IFF(cond, a, b)
```

</td>
<td>

```sql
if(cond, a, b)
```

</td>
</tr>

<tr>
<td>

```sql
IFNULL(a, b)
```

</td>
<td>

```sql
ifNull(a, b) -- or coalesce(a, b)
```

</td>
</tr>

<tr>
<td>

```sql
NVL(a, b)
```

</td>
<td>

```sql
coalesce(a, b)
```

</td>
</tr>

<tr>
<td>

```sql
NVL2(a, b, c)
```

</td>
<td>

```sql
if(a IS NOT NULL, b, c)
```

</td>
</tr>

<tr>
<td>

```sql
NULLIF(a, b)
```

</td>
<td>

```sql
nullIf(a, b)
```

</td>
</tr>

<tr>
<td>

```sql
COALESCE(a, b, c)
```

</td>
<td>

```sql
coalesce(a, b, c)
```

</td>
</tr>

<tr>
<td>

```sql
GREATEST(a, b, c)
LEAST(a, b, c)
```

</td>
<td>

```sql
greatest(a, b, c)
least(a, b, c)
```

</td>
</tr>

<tr>
<td>

```sql
BOOLAND(a, b), BOOLOR(a, b), BOOLXOR(a, b), BOOLNOT(a)
```

</td>
<td>

```sql
a AND b, a OR b, xor(a, b), NOT a
```

</td>
</tr>

</tbody>
</table>

### Conversion {#conversion}

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>Snowflake</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
CAST(x AS VARCHAR) -- or x::VARCHAR
```

</td>
<td>

```sql
CAST(x AS String) -- or toString(x)
```

</td>
</tr>

<tr>
<td>

```sql
CAST(x AS NUMBER) -- or x::NUMBER
```

</td>
<td>

```sql
CAST(x AS Int64) -- or toInt64(x)
```

</td>
</tr>

<tr>
<td>

```sql
CAST(x AS FLOAT)
```

</td>
<td>

```sql
CAST(x AS Float64) -- or toFloat64(x)
```

</td>
</tr>

<tr>
<td>

```sql
CAST(x AS DATE)
```

</td>
<td>

```sql
CAST(x AS Date) -- or toDate(x)
```

</td>
</tr>

<tr>
<td>

```sql
CAST(x AS TIMESTAMP_TZ)
```

</td>
<td>

```sql
CAST(x AS DateTime64(6, 'UTC'))
-- or parseDateTime64BestEffort(x, 6, 'UTC')
```

</td>
</tr>
<tr>
<td colSpan={2}>

Snowflake `TIMESTAMP_TZ` carries an offset per value; normalize to UTC in ClickHouse via `CONVERT_TIMEZONE('UTC', col)` at the source.

</td>
</tr>

<tr>
<td>

```sql
TRY_CAST(x AS NUMBER)
```

</td>
<td>

```sql
toInt64OrNull(x)
```

</td>
</tr>
<tr>
<td colSpan={2}>

Each numeric type has `toTypeOrNull` / `toTypeOrZero` / `toTypeOrDefault` variants. For decimal targets use [`accurateCastOrNull(x, 'Decimal(P, S)')`](/sql-reference/functions/type-conversion-functions#accuratecastornullx-t).

</td>
</tr>

<tr>
<td>

```sql
TO_NUMBER('3.14', 10, 2)
TO_DECIMAL('3.14', 10, 2)
```

</td>
<td>

```sql
toDecimal64('3.14', 2)
```

</td>
</tr>

<tr>
<td>

```sql
TO_VARCHAR(d, 'YYYY-MM-DD')
TO_CHAR(d, 'YYYY-MM-DD')
```

</td>
<td>

```sql
formatDateTime(d, '%F')
```

</td>
</tr>

<tr>
<td>

```sql
TO_VARIANT(x)
PARSE_JSON(s)
```

</td>
<td>

```sql
CAST(x AS JSON) -- or store as the native JSON column type
```

</td>
</tr>

<tr>
<td>

```sql
TO_OBJECT(v)
```

</td>
<td>

```sql
CAST(v AS JSON) -- or tuple(...) for known keys
```

</td>
</tr>

<tr>
<td>

```sql
TO_ARRAY(x)
```

</td>
<td>

```sql
array(x) -- or [x]
```

</td>
</tr>

</tbody>
</table>

## Functions {#functions}

### Array functions {#array-functions}

Compared to Snowflake's roughly two dozen array functions, ClickHouse has more
than 80 [built-in array functions](/sql-reference/functions/array-functions).
The idiomatic pattern is to aggregate row values into an array with
[`groupArray`](/sql-reference/aggregate-functions/reference/grouparray),
transform with higher-order lambda functions
([`arrayMap`](/sql-reference/functions/array-functions#arrayMap),
[`arrayFilter`](/sql-reference/functions/array-functions#arrayFilter),
[`arrayZip`](/sql-reference/functions/array-functions#arrayZip)), and
optionally expand back to rows with
[`arrayJoin`](/sql-reference/functions/array-join). Because of this, many
transformations Snowflake expresses by round-tripping through
[`LATERAL FLATTEN`](https://docs.snowflake.com/en/sql-reference/functions/flatten)
collapse to a single function call in ClickHouse.

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>Snowflake</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
ARRAY_CONSTRUCT(1, 2, 3)
```

</td>
<td>

```sql
array(1, 2, 3) -- or [1, 2, 3]
```

</td>
</tr>

<tr>
<td>

```sql
ARRAY_CAT(a, b)
```

</td>
<td>

```sql
arrayConcat(a, b)
```

</td>
</tr>

<tr>
<td>

```sql
ARRAY_SIZE(tags)
```

</td>
<td>

```sql
length(tags)
```

</td>
</tr>

<tr>
<td>

```sql
ARRAY_APPEND(tags, 'x')
ARRAY_PREPEND(tags, 'x')
```

</td>
<td>

```sql
arrayPushBack(tags, 'x')
arrayPushFront(tags, 'x')
```

</td>
</tr>

<tr>
<td>

```sql
ARRAY_INSERT(tags, 2, 'x')
```

</td>
<td>

```sql
arrayInsert(tags, 2, 'x')
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse arrays are 1-indexed; Snowflake's `ARRAY_INSERT` index is 0-based, so increment positions by one when porting.

</td>
</tr>

<tr>
<td>

```sql
ARRAY_CONTAINS('x'::VARIANT, tags)
```

</td>
<td>

```sql
has(tags, 'x')
```

</td>
</tr>
<tr>
<td colSpan={2}>

Argument order differs: Snowflake takes `(value, array)`, ClickHouse `(array, value)`.

</td>
</tr>

<tr>
<td>

```sql
ARRAY_POSITION('x'::VARIANT, tags)
```

</td>
<td>

```sql
indexOf(tags, 'x')
```

</td>
</tr>
<tr>
<td colSpan={2}>

`indexOf` returns 0 when not found; Snowflake's `ARRAY_POSITION` returns `NULL`. Use `nullIf(indexOf(tags, 'x'), 0)` for parity.

</td>
</tr>

<tr>
<td>

```sql
ARRAY_SLICE(tags, 0, 2)
```

</td>
<td>

```sql
arraySlice(tags, 1, 2)
```

</td>
</tr>

<tr>
<td>

```sql
ARRAY_TO_STRING(tags, ',')
```

</td>
<td>

```sql
arrayStringConcat(tags, ',')
```

</td>
</tr>

<tr>
<td>

```sql
ARRAY_DISTINCT(tags)
```

</td>
<td>

```sql
arrayDistinct(tags)
```

</td>
</tr>

<tr>
<td>

```sql
ARRAY_INTERSECTION(a, b)
```

</td>
<td>

```sql
arrayIntersect(a, b)
```

</td>
</tr>

<tr>
<td>

```sql
ARRAY_COMPACT(tags)
```

</td>
<td>

```sql
arrayFilter(x -> x IS NOT NULL, tags)
```

</td>
</tr>

<tr>
<td>

```sql
ARRAY_GENERATE_RANGE(1, 5)
```

</td>
<td>

```sql
range(1, 5)
```

</td>
</tr>
<tr>
<td colSpan={2}>

Both functions exclude the upper bound — direct port.

</td>
</tr>

<tr>
<td>

```sql
FLATTEN(input => tags)
```

</td>
<td>

```sql
arrayJoin(tags)
```

</td>
</tr>

</tbody>
</table>

### Aggregate functions {#aggregate-functions}

Snowflake exposes a few dozen aggregate functions plus approximate aggregates.
ClickHouse ships [more than 150 aggregate functions](/sql-reference/aggregate-functions/reference)
and adds [combinators](/sql-reference/aggregate-functions/combinators) (suffixes
such as `-If`, `-Array`, `-Map`, `-ForEach`, `-Merge`, and `-State`) that
compose with any aggregate to extend its behavior across data shapes or to use
it inside materialized views.

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>Snowflake</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
COUNT(*) -- or COUNT(col)
```

</td>
<td>

```sql
count() -- or count(col)
```

</td>
</tr>

<tr>
<td>

```sql
SUM(col), AVG(col), MIN(col), MAX(col)
```

</td>
<td>

```sql
sum(col), avg(col), min(col), max(col)
```

</td>
</tr>

<tr>
<td>

```sql
COUNT_IF(cond)
```

</td>
<td>

```sql
countIf(cond)
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse pairs every aggregate with the [`-If` combinator](/sql-reference/aggregate-functions/combinators#-if): `sumIf`, `avgIf`, etc.

</td>
</tr>

<tr>
<td>

```sql
LISTAGG(name, ',') WITHIN GROUP (ORDER BY id)
```

</td>
<td>

```sql
arrayStringConcat(groupArray(name), ',')
-- ordered:
arrayStringConcat(
  arrayMap(x -> x.2,
    arraySort(x -> x.1,
      groupArray((id, name)))),
  ',')
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse has no `WITHIN GROUP` clause. For ordered concatenation, aggregate `(sort_key, value)` tuples and sort the array before joining; alternatively, the [`-OrderBy` combinator](/sql-reference/aggregate-functions/combinators) (`groupArrayOrderBy`) lets you specify the ordering inside the aggregate.

</td>
</tr>

<tr>
<td>

```sql
ARRAY_AGG(name)
```

</td>
<td>

```sql
groupArray(name)
```

</td>
</tr>

<tr>
<td>

```sql
OBJECT_AGG(k, v)
```

</td>
<td>

```sql
mapFromArrays(groupArray(k), groupArray(v))
```

</td>
</tr>

<tr>
<td>

```sql
ANY_VALUE(name)
```

</td>
<td>

```sql
any(name)
```

</td>
</tr>

<tr>
<td>

```sql
MEDIAN(x)
```

</td>
<td>

```sql
median(x) -- or quantileExact(0.5)(x)
```

</td>
</tr>

<tr>
<td>

```sql
MODE(x)
```

</td>
<td>

```sql
topK(1)(x)[1] -- or argMax(x, count())
```

</td>
</tr>

<tr>
<td>

```sql
PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY x)
```

</td>
<td>

```sql
quantile(0.5)(x)
```

</td>
</tr>
<tr>
<td colSpan={2}>

Use `quantileExact(0.5)(x)` for exact percentiles, `quantileTDigest(0.5)(x)` for approximate at scale. See [quantile functions](/sql-reference/aggregate-functions/reference/quantile).

</td>
</tr>

<tr>
<td>

```sql
STDDEV(x), STDDEV_POP(x)
VAR_SAMP(x), VAR_POP(x)
```

</td>
<td>

```sql
stddevSamp(x), stddevPop(x)
varSamp(x), varPop(x)
```

</td>
</tr>

<tr>
<td>

```sql
APPROX_COUNT_DISTINCT(id)
HLL(id)
```

</td>
<td>

```sql
uniq(id) -- or uniqExact(id) for exact, uniqHLL12(id) for HyperLogLog
```

</td>
</tr>

<tr>
<td>

```sql
MIN_BY(x, y), MAX_BY(x, y)
```

</td>
<td>

```sql
argMin(x, y), argMax(x, y)
```

</td>
</tr>

<tr>
<td>

```sql
KURTOSIS(x), SKEW(x)
```

</td>
<td>

```sql
kurtSamp(x), skewSamp(x)
-- or kurtPop / skewPop for population variants
```

</td>
</tr>

</tbody>
</table>

### Window functions {#window-functions}

`OVER` and `PARTITION BY` work the same in both engines (see [Query syntax](#query-syntax) for the windowed-query and `QUALIFY` examples).

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>Snowflake</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY ts)
```

</td>
<td>

```sql
row_number() OVER (PARTITION BY user_id ORDER BY ts)
```

</td>
</tr>

<tr>
<td>

```sql
RANK() OVER (ORDER BY score DESC)
```

</td>
<td>

```sql
rank() OVER (ORDER BY score DESC)
```

</td>
</tr>

<tr>
<td>

```sql
DENSE_RANK() OVER (ORDER BY score DESC)
```

</td>
<td>

```sql
dense_rank() OVER (ORDER BY score DESC)
```

</td>
</tr>

<tr>
<td>

```sql
NTILE(4) OVER (ORDER BY amount)
```

</td>
<td>

```sql
ntile(4) OVER (ORDER BY amount)
```

</td>
</tr>

<tr>
<td>

```sql
LAG(amount, 1) OVER (PARTITION BY id ORDER BY ts)
LEAD(amount, 1) OVER (PARTITION BY id ORDER BY ts)
```

</td>
<td>

```sql
lagInFrame(amount, 1) OVER (PARTITION BY id ORDER BY ts)
leadInFrame(amount, 1) OVER (PARTITION BY id ORDER BY ts)
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse names its `LAG`/`LEAD` equivalents `lagInFrame` / `leadInFrame`; they're available without enabling experimental settings since version 23.10.

</td>
</tr>

<tr>
<td>

```sql
FIRST_VALUE(name) OVER (PARTITION BY id ORDER BY ts)
LAST_VALUE(name) OVER (PARTITION BY id ORDER BY ts)
```

</td>
<td>

```sql
first_value(name) OVER (PARTITION BY id ORDER BY ts)
last_value(name) OVER (PARTITION BY id ORDER BY ts)
```

</td>
</tr>

<tr>
<td>

```sql
NTH_VALUE(name, 3) OVER (ORDER BY ts)
```

</td>
<td>

```sql
nth_value(name, 3) OVER (ORDER BY ts)
```

</td>
</tr>

<tr>
<td>

```sql
CUME_DIST() OVER (ORDER BY score)
PERCENT_RANK() OVER (ORDER BY score)
```

</td>
<td>

```sql
-- No direct equivalents; emulate via rank()/count() arithmetic:
rank() OVER (ORDER BY score) / count() OVER ()
```

</td>
</tr>

</tbody>
</table>

### Date and time functions {#date-functions}

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>Snowflake</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
CURRENT_DATE()
```

</td>
<td>

```sql
today() -- or toDate(now())
```

</td>
</tr>

<tr>
<td>

```sql
CURRENT_TIMESTAMP()
GETDATE()
SYSDATE()
```

</td>
<td>

```sql
now() -- or now64() for sub-second precision
```

</td>
</tr>

<tr>
<td>

```sql
EXTRACT(YEAR FROM d) -- MONTH, DAY, HOUR, etc.
DATE_PART('year', d)
```

</td>
<td>

```sql
toYear(d) -- toMonth(d), toDayOfMonth(d), toHour(d), ...
-- ClickHouse also accepts EXTRACT(YEAR FROM d) directly.
```

</td>
</tr>

<tr>
<td>

```sql
DATEADD('day', 5, d)
TIMESTAMPADD('day', 5, d)
```

</td>
<td>

```sql
addDays(d, 5) -- or d + INTERVAL 5 DAY
```

</td>
</tr>
<tr>
<td colSpan={2}>

Note argument order: Snowflake `DATEADD(unit, n, d)`, ClickHouse `addDays(d, n)`.

</td>
</tr>

<tr>
<td>

```sql
DATEDIFF('day', start, end)
TIMESTAMPDIFF('day', start, end)
```

</td>
<td>

```sql
dateDiff('day', start, end)
```

</td>
</tr>
<tr>
<td colSpan={2}>

Argument order matches between Snowflake and ClickHouse: `(unit, start, end)`.

</td>
</tr>

<tr>
<td>

```sql
DATE_TRUNC('month', d)
```

</td>
<td>

```sql
toStartOfMonth(d) -- toStartOfWeek, toStartOfQuarter, toStartOfYear, ...
```

</td>
</tr>

<tr>
<td>

```sql
DATE_FROM_PARTS(2024, 3, 15)
TIMESTAMP_FROM_PARTS(2024, 3, 15, 12, 0, 0)
```

</td>
<td>

```sql
makeDate(2024, 3, 15)
makeDateTime64(2024, 3, 15, 12, 0, 0)
```

</td>
</tr>

<tr>
<td>

```sql
CONVERT_TIMEZONE('America/New_York', ts)
-- two-argument form: source tz is the column's tz
```

</td>
<td>

```sql
toTimeZone(ts, 'America/New_York')
```

</td>
</tr>

<tr>
<td>

```sql
CONVERT_TIMEZONE('UTC', 'America/New_York', ts)
-- three-argument form
```

</td>
<td>

```sql
-- Store in UTC; convert at display time:
toTimeZone(toTimeZone(ts, 'UTC'), 'America/New_York')
```

</td>
</tr>

<tr>
<td>

```sql
MONTHS_BETWEEN(a, b)
```

</td>
<td>

```sql
dateDiff('month', b, a)
```

</td>
</tr>

<tr>
<td>

```sql
LAST_DAY(d)
```

</td>
<td>

```sql
toLastDayOfMonth(d)
```

</td>
</tr>

<tr>
<td>

```sql
DAYOFWEEK(d), WEEKOFYEAR(d), DAYOFYEAR(d)
```

</td>
<td>

```sql
toDayOfWeek(d), toWeek(d), toDayOfYear(d)
```

</td>
</tr>

<tr>
<td>

```sql
TO_DATE(s, 'YYYY-MM-DD')
TO_TIMESTAMP(s, 'YYYY-MM-DD HH24:MI:SS')
```

</td>
<td>

```sql
parseDateTimeBestEffort(s) -- permissive
-- or toDate(s) for ISO dates, parseDateTime(s, format) for an explicit format
```

</td>
</tr>

</tbody>
</table>

### String functions {#string-functions}

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>Snowflake</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
LENGTH(s) -- or LEN(s)
```

</td>
<td>

```sql
lengthUTF8(s) -- length(s) returns bytes
```

</td>
</tr>

<tr>
<td>

```sql
SUBSTR(s, pos, len) -- or SUBSTRING
```

</td>
<td>

```sql
substring(s, pos, len)
```

</td>
</tr>

<tr>
<td>

```sql
SPLIT(s, ',')
```

</td>
<td>

```sql
splitByString(',', s) -- or splitByChar(',', s) for single-char delimiters
```

</td>
</tr>

<tr>
<td>

```sql
SPLIT_PART(s, ',', 2)
```

</td>
<td>

```sql
splitByString(',', s)[2]
```

</td>
</tr>
<tr>
<td colSpan={2}>

Snowflake `SPLIT_PART` is 1-indexed; so is ClickHouse array access — direct port.

</td>
</tr>

<tr>
<td>

```sql
REPLACE(s, from, to)
```

</td>
<td>

```sql
replaceAll(s, from, to) -- use replaceOne for first match only
```

</td>
</tr>

<tr>
<td>

```sql
UPPER(s), LOWER(s)
```

</td>
<td>

```sql
upper(s), lower(s) -- upperUTF8 / lowerUTF8 for Unicode-aware casing
```

</td>
</tr>

<tr>
<td>

```sql
TRIM(s), LTRIM(s), RTRIM(s)
```

</td>
<td>

```sql
trimBoth(s), trimLeft(s), trimRight(s)
-- alias: trim(s) for trimBoth(s)
```

</td>
</tr>

<tr>
<td>

```sql
INITCAP(s)
```

</td>
<td>

```sql
-- No direct equivalent; combine arrayMap + splitByChar:
arrayStringConcat(
  arrayMap(w -> concat(upperUTF8(substring(w, 1, 1)), lowerUTF8(substring(w, 2))),
           splitByChar(' ', s)),
  ' ')
```

</td>
</tr>

<tr>
<td>

```sql
REGEXP_LIKE(s, '^[a-z]')
```

</td>
<td>

```sql
match(s, '^[a-z]')
```

</td>
</tr>

<tr>
<td>

```sql
REGEXP_SUBSTR(s, '([0-9]+)')
```

</td>
<td>

```sql
extract(s, '([0-9]+)')
```

</td>
</tr>
<tr>
<td colSpan={2}>

Snowflake `REGEXP_SUBSTR` accepts position / occurrence / group arguments; ClickHouse `extract` returns the first match of the first capture group. Use [`extractAll`](/sql-reference/functions/string-search-functions#extractAll) for multiple matches.

</td>
</tr>

<tr>
<td>

```sql
REGEXP_REPLACE(s, '[0-9]+', 'X')
```

</td>
<td>

```sql
replaceRegexpAll(s, '[0-9]+', 'X')
```

</td>
</tr>

<tr>
<td>

```sql
REGEXP_INSTR(s, '[0-9]+')
```

</td>
<td>

```sql
position(s, extract(s, '[0-9]+'))
-- 0 if not found
```

</td>
</tr>

<tr>
<td>

```sql
CONCAT(a, b, c)
CONCAT_WS(',', a, b, c)
```

</td>
<td>

```sql
concat(a, b, c)
concatWithSeparator(',', a, b, c)
```

</td>
</tr>

<tr>
<td>

```sql
LPAD(s, 8, '0'), RPAD(s, 8, '0')
```

</td>
<td>

```sql
leftPad(s, 8, '0'), rightPad(s, 8, '0')
```

</td>
</tr>

<tr>
<td>

```sql
STARTSWITH(s, 'pre'), ENDSWITH(s, 'fix')
```

</td>
<td>

```sql
startsWith(s, 'pre'), endsWith(s, 'fix')
```

</td>
</tr>

<tr>
<td>

```sql
CONTAINS(s, 'sub')
```

</td>
<td>

```sql
position(s, 'sub') > 0
-- or s LIKE '%sub%'
```

</td>
</tr>

<tr>
<td>

```sql
REVERSE(s)
```

</td>
<td>

```sql
reverseUTF8(s) -- reverse(s) reverses bytes
```

</td>
</tr>

<tr>
<td>

```sql
MD5(s), SHA1(s), SHA2(s, 256)
```

</td>
<td>

```sql
hex(MD5(s)), hex(SHA1(s)), hex(SHA256(s))
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse hash functions return raw bytes; wrap in `hex()` to match Snowflake's hex-string output.

</td>
</tr>

<tr>
<td>

```sql
BASE64_ENCODE(s), BASE64_DECODE_STRING(s)
```

</td>
<td>

```sql
base64Encode(s), base64Decode(s)
```

</td>
</tr>

</tbody>
</table>

### JSON and VARIANT functions {#json-functions}

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>Snowflake</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
v:field
v:field::VARCHAR
```

</td>
<td>

```sql
JSONExtractString(v, 'field')
-- or v.field if v is the native JSON type
```

</td>
</tr>
<tr>
<td colSpan={2}>

Snowflake's colon syntax (`v:field`) navigates `VARIANT` paths; `::TYPE` casts the extracted value. In ClickHouse, use typed JSON extractors against `String`-stored JSON, or the [native `JSON` type](/sql-reference/data-types/newjson) with dot-path access (`v.field`).

</td>
</tr>

<tr>
<td>

```sql
GET(v, 'field')
GET_PATH(v, 'a.b.c')
```

</td>
<td>

```sql
JSONExtract(v, 'field', 'String')
JSONExtractString(v, 'a', 'b', 'c')
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse offers typed extractors per result type: `JSONExtractString`, `JSONExtractInt`, `JSONExtractFloat`, `JSONExtractBool`, `JSONExtractArrayRaw`, etc. See [JSON functions](/sql-reference/functions/json-functions).

</td>
</tr>

<tr>
<td>

```sql
PARSE_JSON(s)
```

</td>
<td>

```sql
CAST(s AS JSON)
-- or store the column as the native JSON type
```

</td>
</tr>

<tr>
<td>

```sql
TO_JSON(v)
```

</td>
<td>

```sql
toJSONString(v)
```

</td>
</tr>

<tr>
<td>

```sql
OBJECT_CONSTRUCT('a', a, 'b', b)
```

</td>
<td>

```sql
toJSONString(map('a', a, 'b', b))
-- or tuple(a, b) for a positional structure
```

</td>
</tr>

<tr>
<td>

```sql
OBJECT_KEYS(o)
```

</td>
<td>

```sql
JSONExtractKeys(toJSONString(o))
-- or mapKeys(o) if o is a Map
```

</td>
</tr>

<tr>
<td>

```sql
OBJECT_PICK(o, 'a', 'b')
OBJECT_DELETE(o, 'a')
OBJECT_INSERT(o, 'k', v)
```

</td>
<td>

```sql
-- No direct equivalents; reconstruct with map() / tuple() or
-- JSONExtract* into a new JSON value.
```

</td>
</tr>

<tr>
<td>

```sql
IS_NULL_VALUE(v)
IS_ARRAY(v), IS_OBJECT(v)
IS_VARCHAR(v), IS_NUMERIC(v)
```

</td>
<td>

```sql
-- For native JSON columns:
JSONType(v, 'field')   -- returns 'String', 'Array', 'Object', etc.
JSONHas(v, 'field')
```

</td>
</tr>

<tr>
<td>

```sql
CHECK_JSON(s)
```

</td>
<td>

```sql
isValidJSON(s)
```

</td>
</tr>

<tr>
<td>

```sql
SELECT f.value
FROM myschema.t,
     LATERAL FLATTEN(input => t.tags) f
```

</td>
<td>

```sql
SELECT tag
FROM mydb.t
ARRAY JOIN tags AS tag
```

</td>
</tr>

</tbody>
</table>

### Numeric and math functions {#numeric-functions}

Most numeric functions match by name (case-insensitive in Snowflake, lowercase
by convention in ClickHouse) and are direct ports:

| Snowflake | ClickHouse |
|-----------|------------|
| `ABS(x)`, `SIGN(x)` | `abs(x)`, `sign(x)` |
| `ROUND(x, n)`, `CEIL(x)`, `FLOOR(x)`, `TRUNCATE(x, n)` | `round(x, n)`, `ceil(x)`, `floor(x)`, `truncate(x, n)` |
| `POWER(x, y)`, `EXP(x)`, `LN(x)`, `LOG(b, x)`, `LOG10(x)`, `SQRT(x)` | `pow(x, y)`, `exp(x)`, `log(x)`, `log(x) / log(b)`, `log10(x)`, `sqrt(x)` |
| `SIN(x)`, `COS(x)`, `TAN(x)`, `ASIN(x)`, `ACOS(x)`, `ATAN(x)`, `ATAN2(y, x)` | `sin(x)`, `cos(x)`, `tan(x)`, `asin(x)`, `acos(x)`, `atan(x)`, `atan2(y, x)` |
| `PI()` | `pi()` |
| `RANDOM()` | `rand()` (returns `UInt32`); divide by `4294967295` for `[0, 1)` |
| `UNIFORM(lo, hi, RANDOM())` | `lo + rand() % (hi - lo + 1)` for integers, or `randUniform(lo, hi)` for floats |
| `BITAND(a, b)`, `BITOR(a, b)`, `BITXOR(a, b)`, `BITNOT(a)`, `BITSHIFTLEFT(a, n)`, `BITSHIFTRIGHT(a, n)` | `bitAnd(a, b)`, `bitOr(a, b)`, `bitXor(a, b)`, `bitNot(a)`, `bitShiftLeft(a, n)`, `bitShiftRight(a, n)` |
