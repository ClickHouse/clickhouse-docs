---
title: 'BigQuery SQL translation reference'
slug: /migrations/bigquery/sql-translation-reference
description: 'Construct-by-construct mapping from BigQuery GoogleSQL to ClickHouse SQL'
keywords: ['BigQuery', 'migration', 'SQL', 'translation', 'reference']
sidebar_label: 'SQL translation reference'
doc_type: 'reference'
---

This document details the similarities and differences in SQL syntax between BigQuery and ClickHouse.

## Data types {#data-types}

ClickHouse offers more granular precision than BigQuery for numerics.
Where BigQuery has [`INT64`, `NUMERIC`, `BIGNUMERIC`, and `FLOAT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types),
ClickHouse provides multiple integer, decimal, and float widths so storage
and memory can be tuned to the actual range of the data.

:::tip
When several
ClickHouse types map to a single BigQuery type, pick the smallest that fits
and consider [appropriate codecs](/sql-reference/statements/create/table#column_compression_codec)
for further compression.
:::

| BigQuery | ClickHouse | Notes |
|----------|------------|-------|
| [`ARRAY`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type) | [`Array(t)`](/sql-reference/data-types/array) | |
| [`BIGNUMERIC`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types) | [`Decimal256(S)`](/sql-reference/data-types/decimal) | Precision up to 76, scale up to 38 |
| [`BOOL`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type) | [`Bool`](/sql-reference/data-types/boolean) | |
| [`BYTES`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#bytes_type) | [`String`](/sql-reference/data-types/string) &nbsp;or&nbsp; [`FixedString(N)`](/sql-reference/data-types/fixedstring) | |
| [`DATE`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type) | [`Date`](/sql-reference/data-types/date) &nbsp;or&nbsp; [`Date32`](/sql-reference/data-types/date32) | `Date` (2-byte, 1970-2149) for typical analytical data; `Date32` (4-byte, 1900-2299) to match BigQuery's full range |
| [`DATETIME`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type) | [`DateTime`](/sql-reference/data-types/datetime) &nbsp;or&nbsp; [`DateTime64(p)`](/sql-reference/data-types/datetime64) | BigQuery `DATETIME` is microsecond-precision civil time with no time zone; plain `DateTime` is second-precision and always carries a time zone, so use `DateTime64(6)` for precision parity |
| [`FLOAT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#floating_point_types) | [`Float64`](/sql-reference/data-types/float) | |
| [`GEOGRAPHY`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#geography_type) | [`Geometry`](/sql-reference/data-types/geo#geometry) &nbsp;or&nbsp; [`String`](/sql-reference/data-types/string) | BigQuery `GEOGRAPHY` holds any shape in a single geodesic column. ClickHouse [`Geometry`](/sql-reference/data-types/geo#geometry) is the closest match &mdash; a `Variant` over `Point`, `LineString`, `Polygon`, etc. that holds any shape in one column (load WKT with `readWKT*`). Alternatively keep the raw WKT/GeoJSON as `String`. ClickHouse geo functions are mostly planar (Cartesian); use the spherical variants where geodesic parity matters |
| [`INT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types) | [`UInt8` … `UInt256` / `Int8` … `Int256`](/sql-reference/data-types/int-uint) | Pick the smallest signed or unsigned variant that fits the value range |
| [`INTERVAL`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#interval_type) | No equivalent | Use the [`INTERVAL` expression](/sql-reference/data-types/special-data-types/interval#usage-remarks) or [date/time arithmetic functions](/sql-reference/functions/date-time-functions#addYears) |
| [`JSON`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#json_type) | [`JSON`](/sql-reference/data-types/newjson) &nbsp;or&nbsp; [`String`](/sql-reference/data-types/string) | `JSON` is preferred; `String` with [`JSONExtract*`](/sql-reference/functions/json-functions) accessors works as a fallback |
| [`NUMERIC`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types) | [`Decimal(P, S)`](/sql-reference/data-types/decimal) | BigQuery `NUMERIC` is precision 38 / scale 9 &mdash; [`Decimal128(9)`](/sql-reference/data-types/decimal) is the exact-parity choice; smaller `Decimal32(S)` / `Decimal64(S)` variants are also available |
| [`RANGE`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#range_type) | No equivalent | Store `(start, end)` columns or a `Tuple(start, end)` |
| [`STRING`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type) | [`String`](/sql-reference/data-types/string) | As a performance optimization, wrap in [`LowCardinality(String)`](/sql-reference/data-types/lowcardinality) for columns with few distinct values (enums, status codes, country codes). String functions are byte-based; the [String family](/sql-reference/functions/string-functions) has `UTF8` variants where relevant |
| [`STRUCT`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#constructing_a_struct) / `RECORD` | [`Tuple`](/sql-reference/data-types/tuple) &nbsp;or&nbsp; [`Nested`](/sql-reference/data-types/nested-data-structures/nested) | `RECORD` is BigQuery's legacy name for `STRUCT`. A repeated record (`ARRAY<STRUCT<…>>`) maps to [`Nested`](/sql-reference/data-types/nested-data-structures/nested) or `Array(Tuple(…))`. Flattened sibling columns are often more performant in ClickHouse; use `Tuple` / `Nested` for named fields when the nested shape is load-bearing |
| [`TIME`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#time_type) | No equivalent | Carry a [`DateTime64`](/sql-reference/data-types/datetime64) and extract via [`formatDateTime`](/sql-reference/functions/date-time-functions#formatDateTime), or store as a [`String`](/sql-reference/data-types/string) |
| [`TIMESTAMP`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#timestamp_type) | [`DateTime64(6, 'UTC')`](/sql-reference/data-types/datetime64) | Use for microsecond-precision UTC parity |

BigQuery's legacy SQL type names map through to the same ClickHouse types: `INTEGER` &rarr; `INT64`, `FLOAT` &rarr; `FLOAT64`, `BOOLEAN` &rarr; `BOOL`, and `RECORD` &rarr; `STRUCT`.

BigQuery column modes have direct analogues too: a `REPEATED` field is an [`Array(T)`](/sql-reference/data-types/array), and a `NULLABLE` field is a [`Nullable(T)`](/sql-reference/data-types/nullable) &mdash; though ClickHouse columns are non-nullable by default, and a non-nullable column with a sensible default is usually preferable for performance.

## DDL statements {#ddl-statements}

### Schemas and databases {#ddl-schemas}

:::note Three-part vs two-part names
BigQuery references objects with a three-part name (`project.dataset.table`). ClickHouse uses a two-part `database.table` name &mdash; there is no project layer, so drop the project qualifier when translating identifiers.
:::

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>BigQuery</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
CREATE SCHEMA mydataset
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

BigQuery datasets map to ClickHouse [databases](/sql-reference/statements/create/database).

</td>
</tr>

<tr>
<td>

```sql
CREATE SCHEMA IF NOT EXISTS mydataset
OPTIONS (location = 'US')
```

</td>
<td>

```sql
CREATE DATABASE IF NOT EXISTS mydb
```

</td>
</tr>
<tr>
<td colSpan={2}>

Location is a service-level configuration in ClickHouse Cloud.

</td>
</tr>

<tr>
<td>

```sql
ALTER SCHEMA mydataset SET OPTIONS (description = 'sales')
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
DROP SCHEMA mydataset
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
DROP SCHEMA mydataset CASCADE
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
<th>BigQuery</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
CREATE TABLE mydataset.t (
  id   INT64,
  name STRING
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

[`MergeTree`](/engines/table-engines/mergetree-family/mergetree)-family tables require both an engine and an `ORDER BY`. The `ORDER BY` key determines how rows are sorted and indexed on disk &mdash; it acts as a [sparse primary index](/guides/best-practices/sparse-primary-indexes) and is the primary lever for query performance, so pick columns that match your most common query access patterns.

</td>
</tr>

<tr>
<td>

```sql
CREATE TABLE IF NOT EXISTS mydataset.t (id INT64)
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
CREATE OR REPLACE TABLE mydataset.t (id INT64)
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
CREATE TABLE mydataset.t (id INT64)
PARTITION BY DATE(created_at)
```

</td>
<td>

```sql
CREATE TABLE mydb.t (
  id         Int64,
  created_at DateTime
)
ENGINE = MergeTree
PARTITION BY toDate(created_at)
ORDER BY id
```

</td>
</tr>
<tr>
<td colSpan={2}>

BigQuery partitioning expects a single date/timestamp column; ClickHouse accepts an arbitrary expression. ClickHouse partitions are a storage-organization feature &mdash; not a substitute for `ORDER BY`.

</td>
</tr>

<tr>
<td>

```sql
CREATE TABLE mydataset.t (
  id   INT64,
  name STRING
)
CLUSTER BY id, name
```

</td>
<td>

```sql
CREATE TABLE mydb.t (
  id   Int64,
  name String
)
ENGINE = MergeTree
ORDER BY (id, name)
```

</td>
</tr>
<tr>
<td colSpan={2}>

BigQuery clustering colocates data; in ClickHouse the equivalent is the table's `ORDER BY` key, which controls on-disk ordering and the primary index.

</td>
</tr>

<tr>
<td>

```sql
CREATE TABLE mydataset.t LIKE mydataset.source
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
CREATE TABLE mydataset.t AS
SELECT * FROM mydataset.source
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
CREATE TEMP TABLE t AS SELECT 1 AS x
```

</td>
<td>

```sql
CREATE TEMPORARY TABLE t (x Int64) ENGINE = Memory;
INSERT INTO t VALUES (1);
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse temporary tables are session-scoped. The engine clause is optional and defaults to [`Memory`](/engines/table-engines/special/memory); specify a different one only if you need non-Memory storage.

</td>
</tr>

<tr>
<td>

```sql
CREATE EXTERNAL TABLE mydataset.t
WITH CONNECTION ...
OPTIONS (
  format = 'PARQUET',
  uris   = ['gs://...']
)
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
ALTER TABLE mydataset.t ADD COLUMN tag STRING
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
ALTER TABLE mydataset.t DROP COLUMN tag
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
ALTER TABLE mydataset.t RENAME COLUMN old TO new
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
ALTER TABLE mydataset.t
ALTER COLUMN amount SET DATA TYPE FLOAT64
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
ALTER TABLE mydataset.t SET OPTIONS (description = '...')
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
ALTER TABLE mydataset.t RENAME TO t2
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
DROP TABLE mydataset.t
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
TRUNCATE TABLE mydataset.t
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

### Views and materialized views {#ddl-views}

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>BigQuery</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
CREATE VIEW mydataset.v AS
SELECT id, name FROM mydataset.t
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
CREATE OR REPLACE VIEW mydataset.v AS SELECT ...
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
DROP VIEW mydataset.v
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
CREATE MATERIALIZED VIEW mydataset.mv AS
SELECT status, count(*) AS c
FROM mydataset.t
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

ClickHouse [materialized views](/sql-reference/statements/create/view#materialized-view) are incremental insert-time triggers that write into a target table. For an aggregate MV, use [`AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree) and the `-State` aggregate-function combinator. Query the MV with `countMerge(c)` to finalize.

</td>
</tr>

<tr>
<td>

```sql
CREATE MATERIALIZED VIEW mydataset.mv
OPTIONS (refresh_interval_minutes = 60)
```

</td>
<td>

```sql
CREATE MATERIALIZED VIEW mydb.mv
REFRESH EVERY 1 HOUR
ENGINE = MergeTree
ORDER BY id
AS SELECT ...
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse also supports [refreshable materialized views](/sql-reference/statements/create/view#refreshable-materialized-view) for full-refresh semantics.

</td>
</tr>

</tbody>
</table>

### Indexes, functions, and procedures {#ddl-indexes-functions}

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>BigQuery</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
CREATE SEARCH INDEX idx ON mydataset.t (name)
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

ClickHouse [full-text indexes](/engines/table-engines/mergetree-family/textindexes) accelerate `LIKE` / token-search predicates.

</td>
</tr>

<tr>
<td>

```sql
CREATE VECTOR INDEX idx ON mydataset.t (embedding)
OPTIONS (distance_type = 'COSINE')
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
CREATE FUNCTION mydataset.add_one(x INT64) AS (x + 1)
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
CREATE FUNCTION mydataset.f(x INT64)
RETURNS INT64
LANGUAGE js AS 'return x+1;'
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
DROP FUNCTION mydataset.add_one
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
CREATE PROCEDURE mydataset.p(x INT64) BEGIN ... END
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
<th>BigQuery</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
INSERT INTO mydataset.t VALUES (1, 'a'), (2, 'b')
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
INSERT INTO mydataset.t (id, name) VALUES (1, 'a')
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
INSERT INTO mydataset.t
SELECT id, name FROM mydataset.source
```

</td>
<td>

```sql
INSERT INTO mydb.t
SELECT id, name FROM mydb.source
```

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
<th>BigQuery</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
UPDATE mydataset.t SET name = 'x' WHERE id = 1
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
<th>BigQuery</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
DELETE FROM mydataset.t WHERE id = 1
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
TRUNCATE TABLE mydataset.t
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
<th>BigQuery</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
MERGE INTO mydataset.t USING mydataset.staging s
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
<th>BigQuery</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
GRANT SELECT ON TABLE mydataset.t
TO 'user:alice@example.com'
```

</td>
<td>

```sql
GRANT SELECT ON mydb.t TO alice
```

</td>
</tr>
<tr>
<td colSpan={2}>

BigQuery binds to IAM principals (users, groups, service accounts). ClickHouse binds to SQL-level users and roles created with `CREATE USER` / `CREATE ROLE`.

</td>
</tr>

<tr>
<td>

```sql
GRANT ROLE foo ON TABLE mydataset.t
TO 'user:alice@example.com'
```

</td>
<td>

```sql
GRANT foo TO alice
```

</td>
</tr>

<tr>
<td>

```sql
REVOKE SELECT ON TABLE mydataset.t
FROM 'user:alice@example.com'
```

</td>
<td>

```sql
REVOKE SELECT ON mydb.t FROM alice
```

</td>
</tr>

</tbody>
</table>

### Roles {#dcl-roles}

BigQuery has no SQL-level roles &mdash; access is managed entirely through IAM. ClickHouse manages users and roles in SQL with [`CREATE USER`](/sql-reference/statements/create/user) and [`CREATE ROLE`](/sql-reference/statements/create/role); see [Access control and roles](/operations/access-rights).


## Syntax {#syntax}

### Query syntax {#query-syntax}

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>BigQuery</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
SELECT id, name FROM mydataset.t
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
SELECT * FROM mydataset.t
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
SELECT * EXCEPT (password) FROM mydataset.t
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

ClickHouse [`* EXCEPT`](/sql-reference/statements/select/#except-modifier) accepts an unparenthesised single column; multiple columns must be parenthesised.

</td>
</tr>

<tr>
<td>

```sql
SELECT * REPLACE (lower(name) AS name) FROM mydataset.t
```

</td>
<td>

```sql
SELECT * REPLACE (lower(name) AS name) FROM mydb.t
```

</td>
</tr>

<tr>
<td>

```sql
SELECT id FROM mydataset.t
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
SELECT status, count(*) FROM mydataset.t
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
SELECT status, count(*) FROM mydataset.t
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
SELECT status, count(*) AS c FROM mydataset.t
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
SELECT id FROM mydataset.t ORDER BY id
```

</td>
<td>

```sql
SELECT id FROM mydb.t ORDER BY id
```

</td>
</tr>

<tr>
<td>

```sql
SELECT id FROM mydataset.t
ORDER BY id DESC NULLS LAST
LIMIT 100
```

</td>
<td>

```sql
SELECT id FROM mydb.t
ORDER BY id DESC NULLS LAST
LIMIT 100
```

</td>
</tr>

<tr>
<td>

```sql
SELECT id FROM mydataset.t LIMIT 100 OFFSET 50
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
SELECT DISTINCT status FROM mydataset.t
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
  SELECT * FROM mydataset.t
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
SELECT a.id
FROM mydataset.t a
INNER JOIN mydataset.u b ON a.id = b.id
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
FROM mydataset.t a
LEFT JOIN mydataset.u b ON a.id = b.id
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
FROM mydataset.t a
RIGHT JOIN mydataset.u b ON a.id = b.id
```

</td>
<td>

```sql
SELECT a.id
FROM mydb.t AS a
RIGHT JOIN mydb.u AS b ON a.id = b.id
```

</td>
</tr>

<tr>
<td>

```sql
SELECT a.id
FROM mydataset.t a
FULL OUTER JOIN mydataset.u b ON a.id = b.id
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
FROM mydataset.t a
CROSS JOIN mydataset.u b
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
FROM mydataset.t a
JOIN mydataset.u b USING (id)
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
SELECT * FROM mydataset.t
WHERE EXISTS (
  SELECT 1 FROM mydataset.u WHERE u.id = t.id
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
SELECT * FROM mydataset.t
WHERE NOT EXISTS (
  SELECT 1 FROM mydataset.u WHERE u.id = t.id
)
```

</td>
<td>

```sql
SELECT * FROM mydb.t
WHERE id NOT IN (SELECT id FROM mydb.u)
```

</td>
</tr>

<tr>
<td>

```sql
SELECT a, b FROM mydataset.t
UNION ALL
SELECT a, b FROM mydataset.u
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
SELECT a FROM mydataset.t
INTERSECT DISTINCT
SELECT a FROM mydataset.u
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
<td>

```sql
SELECT a FROM mydataset.t
EXCEPT DISTINCT
SELECT a FROM mydataset.u
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
<td>

```sql
SELECT element
FROM UNNEST(['a','b','c']) AS element
```

</td>
<td>

```sql
SELECT arrayJoin(['a','b','c']) AS element
```

</td>
</tr>
<tr>
<td colSpan={2}>

Use [`ARRAY JOIN`](/sql-reference/statements/select/array-join) or [`arrayJoin`](/sql-reference/functions/array-join).

</td>
</tr>

<tr>
<td>

```sql
SELECT id FROM mydataset.t
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
SELECT * FROM mydataset.t TABLESAMPLE SYSTEM (10 PERCENT)
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

ClickHouse [`SAMPLE`](/sql-reference/statements/select/sample) requires the table to declare a `SAMPLE BY` clause.

</td>
</tr>

<tr>
<td>

```sql
SELECT * FROM mydataset.t
FOR SYSTEM_TIME AS OF TIMESTAMP '2024-03-15 00:00:00+00:00'
```

</td>
<td>

No equivalent

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse doesn't provide row-level time travel. Patterns include [`ReplacingMergeTree`](/engines/table-engines/mergetree-family/replacingmergetree) with a version column or per-day backup tables.

</td>
</tr>

<tr>
<td>

```sql
SELECT id, sum(amount) OVER w
FROM mydataset.t
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
SELECT * FROM mydataset.t
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

</tbody>
</table>

### Pipe syntax {#pipe-syntax}

BigQuery's [pipe syntax](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/pipe-syntax) chains transformations with the `|>` operator. ClickHouse doesn't support pipe syntax; write standard SQL, using subqueries or CTEs to chain stages.


### Procedural language {#procedural-language}

ClickHouse SQL isn't a procedural language. Variables, loops, statement-level
`IF` / `CASE`, and stored procedures have no first-class equivalents;
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
<th>BigQuery</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
DECLARE x INT64 DEFAULT 0
```

</td>
<td>

_client-side variable, or `SET param_x = 0` for [query parameters](/operations/server-configuration-parameters/settings#query-parameters)_

</td>
</tr>

<tr>
<td>

```sql
SET x = 5
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
IF cond THEN ... ELSE ... END IF
```

</td>
<td>

_expression form `if(cond, a, b)`; for statement-level branching, branch in the client_

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
WHILE cond DO ... END WHILE
```

</td>
<td>

_no equivalent; use a client-driven loop_

</td>
</tr>

<tr>
<td>

```sql
LOOP ... END LOOP
```

</td>
<td>

_no equivalent_

</td>
</tr>

<tr>
<td>

```sql
FOR row IN (SELECT ...) DO ... END FOR
```

</td>
<td>

_iterate over query results client-side_

</td>
</tr>

<tr>
<td>

`BREAK`, `CONTINUE`, `LEAVE`, `ITERATE`

</td>
<td>

_no equivalent_

</td>
</tr>

<tr>
<td>

```sql
CALL mydataset.p(1)
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
RAISE USING MESSAGE = 'bad'
```

</td>
<td>

```sql
SELECT throwIf(1, 'bad')
```

</td>
</tr>

<tr>
<td>

```sql
BEGIN TRANSACTION; ...; COMMIT TRANSACTION
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
<th>BigQuery</th>
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
DIV(a, b)
```

</td>
<td>

```sql
intDiv(a, b)
```

</td>
<td>

Integer division.

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
<td>

ClickHouse also offers [`ILIKE`](/sql-reference/functions/string-search-functions#ilike) for case-insensitive matching.

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
<th>BigQuery</th>
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
IF(cond, a, b)
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
<th>BigQuery</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
CAST(x AS STRING)
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
CAST(x AS INT64)
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
CAST(x AS FLOAT64)
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
CAST(x AS TIMESTAMP)
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

BigQuery `TIMESTAMP` is microsecond UTC.

</td>
</tr>

<tr>
<td>

```sql
SAFE_CAST(x AS INT64)
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

Each numeric type has `toTypeOrNull` / `toTypeOrZero` / `toTypeOrDefault` variants.

</td>
</tr>

<tr>
<td>

```sql
PARSE_NUMERIC('3.14')
```

</td>
<td>

```sql
toDecimal64('3.14', 9)
```

</td>
</tr>
<tr>
<td colSpan={2}>

BigQuery `NUMERIC` is fixed `(38, 9)`; specify the scale you need in ClickHouse.

</td>
</tr>

<tr>
<td>

```sql
PARSE_BIGNUMERIC('3.14')
```

</td>
<td>

```sql
toDecimal256('3.14', 38)
```

</td>
</tr>

</tbody>
</table>

## Functions {#functions}

### Array functions {#array-functions}

Compared to BigQuery's roughly eight array functions, ClickHouse has more
than 80 [built-in array functions](/sql-reference/functions/array-functions).
The idiomatic pattern is to aggregate row values into an array with
[`groupArray`](/sql-reference/aggregate-functions/reference/grouparray),
transform with higher-order lambda functions
([`arrayMap`](/sql-reference/functions/array-functions#arrayMap),
[`arrayFilter`](/sql-reference/functions/array-functions#arrayFilter),
[`arrayZip`](/sql-reference/functions/array-functions#arrayZip)), and
optionally expand back to rows with
[`arrayJoin`](/sql-reference/functions/array-join). Because of this, many
transformations BigQuery expresses by round-tripping through
[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator)
collapse to a single function call in ClickHouse.

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>BigQuery</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
ARRAY_CONCAT(a, b)
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
ARRAY_LENGTH(tags)
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
ARRAY_REVERSE(tags)
```

</td>
<td>

```sql
arrayReverse(tags)
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
GENERATE_ARRAY(1, 5)
```

</td>
<td>

```sql
range(1, 6)
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse [`range`](/sql-reference/functions/array-functions#range) excludes the upper bound.

</td>
</tr>

</tbody>
</table>

### Aggregate functions {#aggregate-functions}

BigQuery exposes roughly 18 aggregate functions plus a handful of approximate aggregates. ClickHouse ships [more than 150 aggregate functions](/sql-reference/aggregate-functions/reference) and adds [combinators](/sql-reference/aggregate-functions/combinators) — suffixes such as `-If`, `-Array`, `-Map`, `-ForEach`, `-Merge`, and `-State` — that compose with any aggregate to extend its behavior across data shapes or to use it inside materialized views.

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>BigQuery</th>
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
COUNTIF(cond)
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
STRING_AGG(name, ',')
```

</td>
<td>

```sql
arrayStringConcat(groupArray(name), ',')
```

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
APPROX_COUNT_DISTINCT(id)
```

</td>
<td>

```sql
uniq(id) -- or uniqExact(id) for exact, uniqHLL12(id) for HyperLogLog
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
<th>BigQuery</th>
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
```

</td>
<td>

```sql
lagInFrame(amount, 1) OVER (PARTITION BY id ORDER BY ts)
```

</td>
</tr>

<tr>
<td>

```sql
LEAD(amount, 1) OVER (PARTITION BY id ORDER BY ts)
```

</td>
<td>

```sql
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
```

</td>
<td>

```sql
first_value(name) OVER (PARTITION BY id ORDER BY ts)
```

</td>
</tr>

<tr>
<td>

```sql
LAST_VALUE(name) OVER (PARTITION BY id ORDER BY ts)
```

</td>
<td>

```sql
last_value(name) OVER (PARTITION BY id ORDER BY ts)
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
<th>BigQuery</th>
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
```

</td>
<td>

```sql
toYear(d) -- toMonth(d), toDayOfMonth(d), toHour(d), ...
```

</td>
</tr>
<tr>
<td colSpan={2}>

ClickHouse also accepts `EXTRACT(YEAR FROM d)` directly, so EXTRACT-heavy SQL can port as-is; the `toYear(d)` family is just terser.

</td>
</tr>

<tr>
<td>

```sql
DATE_ADD(d, INTERVAL 5 DAY)
```

</td>
<td>

```sql
d + INTERVAL 5 DAY -- or addDays(d, 5)
```

</td>
</tr>

<tr>
<td>

```sql
DATE_SUB(d, INTERVAL 5 DAY)
```

</td>
<td>

```sql
d - INTERVAL 5 DAY -- or subtractDays(d, 5)
```

</td>
</tr>

<tr>
<td>

```sql
DATE_DIFF(end, start, DAY)
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

Note the argument order: ClickHouse takes `(unit, start, end)`; BigQuery takes `(end, start, unit)`.

</td>
</tr>

<tr>
<td>

```sql
DATE_TRUNC(d, MONTH)
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
FORMAT_DATE('%Y-%m-%d', d)
```

</td>
<td>

```sql
formatDateTime(d, '%F') -- '%F' is ISO date; see formatDateTime docs
```

</td>
</tr>

<tr>
<td>

```sql
PARSE_DATE('%Y-%m-%d', s)
```

</td>
<td>

```sql
toDate(s) -- or parseDateTimeBestEffort(s) for permissive parsing
```

</td>
</tr>

<tr>
<td>

```sql
TIMESTAMP_SECONDS(n)
```

</td>
<td>

```sql
toDateTime(n)
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
<th>BigQuery</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
LENGTH(s)
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
SUBSTR(s, pos, len)
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
splitByChar(',', s) -- or splitByString(',', s) for multi-char delimiters
```

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
TRIM(s)
```

</td>
<td>

```sql
trimBoth(s) -- alias: trim(s); pass a second arg to trim specific characters
```

</td>
</tr>

<tr>
<td>

```sql
REGEXP_CONTAINS(s, r'^[a-z]')
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
REGEXP_EXTRACT(s, r'([0-9]+)')
```

</td>
<td>

```sql
extract(s, '([0-9]+)')
```

</td>
</tr>

<tr>
<td>

```sql
REGEXP_REPLACE(s, r'[0-9]+', 'X')
```

</td>
<td>

```sql
replaceRegexpAll(s, '[0-9]+', 'X')
```

</td>
</tr>

</tbody>
</table>

### JSON functions {#json-functions}

<table className="sql-translation-table">
<colgroup>
<col />
<col />
</colgroup>
<thead>
<tr>
<th>BigQuery</th>
<th>ClickHouse</th>
</tr>
</thead>
<tbody>

<tr>
<td>

```sql
JSON_EXTRACT(j, '$.field')
```

</td>
<td>

```sql
JSONExtract(j, 'field', 'String') -- typed extraction; pass the result type
```

</td>
</tr>

<tr>
<td>

```sql
JSON_EXTRACT_SCALAR(j, '$.field')
```

</td>
<td>

```sql
JSONExtractString(j, 'field')
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
CAST(s AS JSON) -- or store as the native JSON column type
```

</td>
</tr>

</tbody>
</table>
