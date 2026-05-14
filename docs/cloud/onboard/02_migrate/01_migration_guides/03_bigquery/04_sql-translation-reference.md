---
title: 'BigQuery SQL translation reference'
slug: /migrations/bigquery/sql-translation-reference
description: 'Construct-by-construct mapping from BigQuery GoogleSQL to ClickHouse SQL'
keywords: ['BigQuery', 'migration', 'SQL', 'translation', 'reference']
sidebar_label: 'SQL translation reference'
doc_type: 'reference'
---

# BigQuery → ClickHouse SQL translation reference

This page maps the BigQuery GoogleSQL constructs you are most likely to
encounter when porting analytical workloads to ClickHouse. Each row shows the
canonical BigQuery form and the equivalent idiomatic ClickHouse form, with a
short note when the engines differ in a way that matters.

Examples use `mydataset.t` (BigQuery) and `mydb.t` (ClickHouse) as
illustrative qualified names; column names are deliberately ordinary (`id`,
`name`, `amount`, `created_at`).

## Conventions {#conventions}

- BigQuery function names are conventionally `UPPER_SNAKE_CASE`. ClickHouse function names are conventionally `camelCase` (a few legacy aliases use lower case). Names are case-insensitive in both engines.
- ClickHouse tables require a table engine and (for the `MergeTree` family) an `ORDER BY`. Examples use `MergeTree` as the default; see [Table engines](/engines/table-engines) for the full catalogue.

## Data types {#data-types}

ClickHouse offers more granular precision than BigQuery for numerics: where
BigQuery has [`INT64`, `NUMERIC`, `BIGNUMERIC`, and `FLOAT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types),
ClickHouse provides multiple integer, decimal, and float widths so storage
and memory can be tuned to the actual range of the data. When several
ClickHouse types map to a single BigQuery type, pick the smallest that fits
and consider [appropriate codecs](/sql-reference/statements/create/table#column_compression_codec)
for further compression.

| BigQuery | ClickHouse |
|----------|------------|
| [`ARRAY`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type) | [`Array(t)`](/sql-reference/data-types/array) |
| [`BIGNUMERIC`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types) | [`Decimal256(S)`](/sql-reference/data-types/decimal) |
| [`BOOL`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type) | [`Bool`](/sql-reference/data-types/boolean) |
| [`BYTES`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#bytes_type) | [`String`](/sql-reference/data-types/string) &nbsp;or&nbsp; [`FixedString(N)`](/sql-reference/data-types/fixedstring) |
| [`DATE`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type) | [`Date`](/sql-reference/data-types/date) (2-byte, 1970-2149) for typical analytical data, or [`Date32`](/sql-reference/data-types/date32) (4-byte, 1900-2299) to match BigQuery's full range |
| [`DATETIME`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type) | [`DateTime`](/sql-reference/data-types/datetime) &nbsp;or&nbsp; [`DateTime64(p)`](/sql-reference/data-types/datetime64) for sub-second precision |
| [`FLOAT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#floating_point_types) | [`Float64`](/sql-reference/data-types/float) |
| [`GEOGRAPHY`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#geography_type) | [Geo data types](/sql-reference/data-types/geo) |
| [`INT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types) | One of [`UInt8` … `UInt256` / `Int8` … `Int256`](/sql-reference/data-types/int-uint) sized to the value range |
| [`INTERVAL`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#interval_type) | No dedicated type &mdash; use the [`INTERVAL` expression](/sql-reference/data-types/special-data-types/interval#usage-remarks) or [date/time arithmetic functions](/sql-reference/functions/date-time-functions#addYears) |
| [`JSON`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#json_type) | [`JSON`](/sql-reference/data-types/newjson) (preferred) &nbsp;or&nbsp; [`String`](/sql-reference/data-types/string) with [`JSONExtract*`](/sql-reference/functions/json-functions) accessors |
| [`NUMERIC`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types) | [`Decimal(P, S)`](/sql-reference/data-types/decimal) (or sized `Decimal32(S)` / `Decimal64(S)` / `Decimal128(S)`) |
| [`RANGE`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#range_type) | No first-class type &mdash; store `(start, end)` columns or a `Tuple(start, end)` |
| [`STRING`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type) | [`String`](/sql-reference/data-types/string), optionally wrapped in [`LowCardinality(String)`](/sql-reference/data-types/lowcardinality) for columns with few distinct values (enums, status codes, country codes). String functions are byte-based; the [String family](/sql-reference/functions/string-functions) has `UTF8` variants where relevant. |
| [`STRUCT`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#constructing_a_struct) | Flattened sibling columns (often most performant in ClickHouse), or [`Tuple`](/sql-reference/data-types/tuple) / [`Nested`](/sql-reference/data-types/nested-data-structures/nested) for named fields when the nested shape is load-bearing |
| [`TIME`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#time_type) | No dedicated type &mdash; carry a [`DateTime64`](/sql-reference/data-types/datetime64) and extract via [`formatDateTime`](/sql-reference/functions/date-time-functions#formatDateTime) |
| [`TIMESTAMP`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#timestamp_type) | [`DateTime64(6, 'UTC')`](/sql-reference/data-types/datetime64) for microsecond-precision UTC parity |

## DDL: schemas and databases {#ddl-schemas}

| BigQuery | ClickHouse | Notes |
|----------|------------|-------|
| `CREATE SCHEMA mydataset` | `CREATE DATABASE mydb` | BigQuery datasets map to ClickHouse [databases](/sql-reference/statements/create/database). |
| `CREATE SCHEMA IF NOT EXISTS mydataset OPTIONS (location = 'US')` | `CREATE DATABASE IF NOT EXISTS mydb` | Location is a service-level decision in ClickHouse Cloud. |
| `ALTER SCHEMA mydataset SET OPTIONS (description = 'sales')` | `ALTER DATABASE mydb MODIFY COMMENT 'sales'` | |
| `DROP SCHEMA mydataset` | `DROP DATABASE mydb` | Add `IF EXISTS` for an idempotent drop in either engine. |
| `DROP SCHEMA mydataset CASCADE` | `DROP DATABASE mydb` | ClickHouse drops tables in the database unconditionally; there is no `CASCADE` keyword. |

## DDL: tables {#ddl-tables}

| BigQuery | ClickHouse | Notes |
|----------|------------|-------|
| `CREATE TABLE mydataset.t (id INT64, name STRING)` | `CREATE TABLE mydb.t (id Int64, name String) ENGINE = MergeTree ORDER BY id` | An engine and an `ORDER BY` are required for `MergeTree`-family tables; pick the column(s) that match the query access pattern. See [Sparse primary indexes](/guides/best-practices/sparse-primary-indexes). |
| `CREATE TABLE IF NOT EXISTS mydataset.t (id INT64)` | `CREATE TABLE IF NOT EXISTS mydb.t (id Int64) ENGINE = MergeTree ORDER BY id` | |
| `CREATE OR REPLACE TABLE mydataset.t (id INT64)` | `CREATE OR REPLACE TABLE mydb.t (id Int64) ENGINE = MergeTree ORDER BY id` | |
| `CREATE TABLE mydataset.t (id INT64) PARTITION BY DATE(created_at)` | `CREATE TABLE mydb.t (id Int64, created_at DateTime) ENGINE = MergeTree PARTITION BY toDate(created_at) ORDER BY id` | BigQuery partitioning expects a single date/timestamp column; ClickHouse accepts an arbitrary expression. ClickHouse partitions are a storage-organisation feature &mdash; not a substitute for `ORDER BY`. |
| `CREATE TABLE mydataset.t (id INT64, name STRING) CLUSTER BY id, name` | `CREATE TABLE mydb.t (id Int64, name String) ENGINE = MergeTree ORDER BY (id, name)` | BigQuery clustering colocates data; in ClickHouse the equivalent is the table's `ORDER BY` key, which controls on-disk ordering and the primary index. |
| `CREATE TABLE mydataset.t LIKE mydataset.source` | `CREATE TABLE mydb.t AS mydb.source` | Both copy the schema only; ClickHouse also copies engine and `ORDER BY`. |
| `CREATE TABLE mydataset.t AS SELECT * FROM mydataset.source` | `CREATE TABLE mydb.t ENGINE = MergeTree ORDER BY id AS SELECT * FROM mydb.source` | Engine and `ORDER BY` are required for the new table. |
| `CREATE TEMP TABLE t AS SELECT 1 AS x` | `CREATE TEMPORARY TABLE t (x Int64) ENGINE = Memory; INSERT INTO t VALUES (1)` | ClickHouse temporary tables are session-scoped and require an explicit engine (commonly [`Memory`](/engines/table-engines/special/memory)). |
| `CREATE EXTERNAL TABLE mydataset.t WITH CONNECTION ... OPTIONS (format = 'PARQUET', uris = ['gs://...'])` | `CREATE TABLE mydb.t (...) ENGINE = S3('https://.../*.parquet', 'Parquet')` | ClickHouse exposes external storage through table engines such as [`S3`](/engines/table-engines/integrations/s3), [`URL`](/engines/table-engines/special/url), and [`HDFS`](/engines/table-engines/integrations/hdfs). |
| `ALTER TABLE mydataset.t ADD COLUMN tag STRING` | `ALTER TABLE mydb.t ADD COLUMN tag String` | |
| `ALTER TABLE mydataset.t DROP COLUMN tag` | `ALTER TABLE mydb.t DROP COLUMN tag` | |
| `ALTER TABLE mydataset.t RENAME COLUMN old TO new` | `ALTER TABLE mydb.t RENAME COLUMN old TO new` | |
| `ALTER TABLE mydataset.t ALTER COLUMN amount SET DATA TYPE FLOAT64` | `ALTER TABLE mydb.t MODIFY COLUMN amount Float64` | |
| `ALTER TABLE mydataset.t SET OPTIONS (description = '...')` | `ALTER TABLE mydb.t MODIFY COMMENT '...'` | |
| `ALTER TABLE mydataset.t RENAME TO t2` | `RENAME TABLE mydb.t TO mydb.t2` | |
| `DROP TABLE mydataset.t` | `DROP TABLE mydb.t` | |
| `TRUNCATE TABLE mydataset.t` | `TRUNCATE TABLE mydb.t` | |

## DDL: views and materialized views {#ddl-views}

| BigQuery | ClickHouse | Notes |
|----------|------------|-------|
| `CREATE VIEW mydataset.v AS SELECT id, name FROM mydataset.t` | `CREATE VIEW mydb.v AS SELECT id, name FROM mydb.t` | Standard logical views; no storage in either engine. |
| `CREATE OR REPLACE VIEW mydataset.v AS SELECT ...` | `CREATE OR REPLACE VIEW mydb.v AS SELECT ...` | |
| `DROP VIEW mydataset.v` | `DROP VIEW mydb.v` | |
| `CREATE MATERIALIZED VIEW mydataset.mv AS SELECT status, count(*) AS c FROM mydataset.t GROUP BY status` | `CREATE MATERIALIZED VIEW mydb.mv ENGINE = AggregatingMergeTree ORDER BY status AS SELECT status, countState() AS c FROM mydb.t GROUP BY status` | ClickHouse [materialized views](/sql-reference/statements/create/view#materialized-view) are incremental insert-time triggers that write into a target table. For an aggregate MV, use [`AggregatingMergeTree`](/engines/table-engines/mergetree-family/aggregatingmergetree) and the `-State` aggregate-function combinator. Query the MV with `countMerge(c)` to finalise. |
| `CREATE MATERIALIZED VIEW mydataset.mv OPTIONS (refresh_interval_minutes = 60)` | `CREATE MATERIALIZED VIEW mydb.mv REFRESH EVERY 1 HOUR ENGINE = MergeTree ORDER BY id AS SELECT ...` | ClickHouse also supports [refreshable materialized views](/sql-reference/statements/create/view#refreshable-materialized-view) for full-refresh semantics. |

## DDL: indexes, functions, and procedures {#ddl-indexes-functions}

| BigQuery | ClickHouse | Notes |
|----------|------------|-------|
| `CREATE SEARCH INDEX idx ON mydataset.t (name)` | `ALTER TABLE mydb.t ADD INDEX idx name TYPE text(tokenizer = 'default') GRANULARITY 1` | ClickHouse [full-text indexes](/engines/table-engines/mergetree-family/textindexes) accelerate `LIKE` / token-search predicates. |
| `CREATE VECTOR INDEX idx ON mydataset.t (embedding) OPTIONS (distance_type='COSINE')` | `ALTER TABLE mydb.t ADD INDEX idx embedding TYPE vector_similarity('hnsw', 'cosineDistance') GRANULARITY 1` | See [Approximate-nearest-neighbour indexes](/engines/table-engines/mergetree-family/annindexes). |
| `CREATE FUNCTION mydataset.add_one(x INT64) AS (x + 1)` | `CREATE FUNCTION add_one AS (x) -> x + 1` | ClickHouse [UDFs](/sql-reference/statements/create/function) are expression-only. For complex logic, use the SQL-defined-function or executable-UDF patterns. |
| `CREATE FUNCTION mydataset.f(x INT64) RETURNS INT64 LANGUAGE js AS 'return x+1;'` | _no equivalent_ | ClickHouse has no JavaScript or Python UDFs in standard SQL; use executable UDFs at the server level. |
| `DROP FUNCTION mydataset.add_one` | `DROP FUNCTION add_one` | |
| `CREATE PROCEDURE mydataset.p(x INT64) BEGIN ... END` | _no equivalent_ | ClickHouse has no stored procedures; orchestrate from a client (Python, Go, etc.) or compose into a SQL function. |

## DML: inserts, updates, deletes, merges {#dml}

| BigQuery | ClickHouse                                                                                    | Notes                                                                                                                                                                                                                                                                                            |
|----------|-----------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `INSERT INTO mydataset.t VALUES (1, 'a'), (2, 'b')` | `INSERT INTO mydb.t VALUES (1, 'a'), (2, 'b')`                                                |                                                                                                                                                                                                                                                                                                  |
| `INSERT INTO mydataset.t (id, name) VALUES (1, 'a')` | `INSERT INTO mydb.t (id, name) VALUES (1, 'a')`                                               |                                                                                                                                                                                                                                                                                                  |
| `INSERT INTO mydataset.t SELECT id, name FROM mydataset.source` | `INSERT INTO mydb.t SELECT id, name FROM mydb.source`                                         |                                                                                                                                                                                                                                                                                                  |
| `UPDATE mydataset.t SET name = 'x' WHERE id = 1` | `ALTER TABLE mydb.t UPDATE name = 'x' WHERE id = 1`                                           | ClickHouse mutates asynchronously by default. For synchronous, in-place updates use [lightweight updates](/sql-reference/statements/update): `UPDATE mydb.t SET name = 'x' WHERE id = 1`.                                                                                                        |
| `DELETE FROM mydataset.t WHERE id = 1` | `DELETE FROM mydb.t WHERE id = 1`                                                             | ClickHouse's [lightweight delete](/sql-reference/statements/delete) marks rows for removal; physical removal happens at the next merge. For bulk historical cleanup prefer use of [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl).                           |
| `MERGE INTO mydataset.t USING mydataset.staging s ON t.id = s.id WHEN MATCHED THEN UPDATE SET ... WHEN NOT MATCHED THEN INSERT ...` | Model with [`ReplacingMergeTree`](/engines/table-engines/mergetree-family/replacingmergetree) | ClickHouse has no equivalent `MERGE` statement. The idiomatic pattern is a `ReplacingMergeTree` keyed on the natural key plus a version column; an `INSERT` of newer rows "wins" at merge time. Use [`FINAL`](/sql-reference/statements/select/from#final-modifier) for read-time deduplication. |
| `TRUNCATE TABLE mydataset.t` | `TRUNCATE TABLE mydb.t`                                                                       |                                                                                                                                                                                                                                                                                                  |

## DCL: grants and roles {#dcl}

| BigQuery | ClickHouse | Notes |
|----------|------------|-------|
| `GRANT SELECT ON TABLE mydataset.t TO 'user:alice@example.com'` | `GRANT SELECT ON mydb.t TO alice` | BigQuery binds to IAM principals (users, groups, service accounts). ClickHouse binds to SQL-level users and roles created with `CREATE USER` / `CREATE ROLE`. |
| `GRANT ROLE foo ON TABLE mydataset.t TO 'user:alice@example.com'` | `GRANT foo TO alice` | |
| `REVOKE SELECT ON TABLE mydataset.t FROM 'user:alice@example.com'` | `REVOKE SELECT ON mydb.t FROM alice` | |
| _IAM-managed via console / `gcloud`_ | `CREATE USER alice IDENTIFIED WITH plaintext_password BY 'pw'` | See [Access control and roles](/operations/access-rights). |
| _IAM-managed via console / `gcloud`_ | `CREATE ROLE analyst` | |
| _IAM-managed via console / `gcloud`_ | `DROP USER alice` | |

## Query syntax {#query-syntax}

| BigQuery | ClickHouse | Notes |
|----------|------------|-------|
| `SELECT id, name FROM mydataset.t` | `SELECT id, name FROM mydb.t` | |
| `SELECT * FROM mydataset.t` | `SELECT * FROM mydb.t` | |
| `SELECT * EXCEPT (password) FROM mydataset.t` | `SELECT * EXCEPT password FROM mydb.t` | ClickHouse [`* EXCEPT`](/sql-reference/statements/select/#except-modifier) accepts a bare list or parenthesised list. |
| `SELECT * REPLACE (lower(name) AS name) FROM mydataset.t` | `SELECT * REPLACE (lower(name) AS name) FROM mydb.t` | |
| `SELECT id FROM mydataset.t WHERE created_at > '2024-01-01'` | `SELECT id FROM mydb.t WHERE created_at > '2024-01-01'` | |
| `SELECT status, count(*) FROM mydataset.t GROUP BY status` | `SELECT status, count() FROM mydb.t GROUP BY status` | |
| `SELECT status, count(*) FROM mydataset.t GROUP BY ROLLUP (status, country)` | `SELECT status, country, count() FROM mydb.t GROUP BY ROLLUP (status, country)` | ClickHouse also supports `GROUP BY CUBE` and `GROUP BY GROUPING SETS`. |
| `SELECT status, count(*) AS c FROM mydataset.t GROUP BY status HAVING c > 10` | `SELECT status, count() AS c FROM mydb.t GROUP BY status HAVING c > 10` | |
| `SELECT id FROM mydataset.t ORDER BY id` | `SELECT id FROM mydb.t ORDER BY id` | |
| `SELECT id FROM mydataset.t ORDER BY id DESC NULLS LAST LIMIT 100` | `SELECT id FROM mydb.t ORDER BY id DESC NULLS LAST LIMIT 100` | |
| `SELECT id FROM mydataset.t LIMIT 100 OFFSET 50` | `SELECT id FROM mydb.t LIMIT 100 OFFSET 50` | |
| `SELECT DISTINCT status FROM mydataset.t` | `SELECT DISTINCT status FROM mydb.t` | |
| `WITH recent AS (SELECT * FROM mydataset.t WHERE created_at > '2024-01-01') SELECT id FROM recent` | `WITH recent AS (SELECT * FROM mydb.t WHERE created_at > '2024-01-01') SELECT id FROM recent` | |
| `SELECT a.id FROM mydataset.t a INNER JOIN mydataset.u b ON a.id = b.id` | `SELECT a.id FROM mydb.t AS a INNER JOIN mydb.u AS b ON a.id = b.id` | ClickHouse generally requires `AS` for table aliases. |
| `SELECT a.id FROM mydataset.t a LEFT JOIN mydataset.u b ON a.id = b.id` | `SELECT a.id FROM mydb.t AS a LEFT JOIN mydb.u AS b ON a.id = b.id` | `FULL`, `RIGHT`, `LEFT ANY`, `LEFT SEMI`, `LEFT ANTI` all match between engines. |
| `SELECT a.id FROM mydataset.t a CROSS JOIN mydataset.u b` | `SELECT a.id FROM mydb.t AS a CROSS JOIN mydb.u AS b` | |
| `SELECT a.id FROM mydataset.t a JOIN mydataset.u b USING (id)` | `SELECT a.id FROM mydb.t AS a JOIN mydb.u AS b USING (id)` | |
| `SELECT a, b FROM mydataset.t UNION ALL SELECT a, b FROM mydataset.u` | `SELECT a, b FROM mydb.t UNION ALL SELECT a, b FROM mydb.u` | ClickHouse rejects bare `UNION`; use `UNION ALL` or `UNION DISTINCT`. |
| `SELECT a FROM mydataset.t INTERSECT DISTINCT SELECT a FROM mydataset.u` | `SELECT a FROM mydb.t INTERSECT SELECT a FROM mydb.u` | |
| `SELECT a FROM mydataset.t EXCEPT DISTINCT SELECT a FROM mydataset.u` | `SELECT a FROM mydb.t EXCEPT SELECT a FROM mydb.u` | |
| `SELECT element FROM UNNEST(['a','b','c']) AS element` | `SELECT arrayJoin(['a','b','c']) AS element` | Use [`ARRAY JOIN`](/sql-reference/statements/select/array-join) or [`arrayJoin`](/sql-reference/functions/array-join). |
| `SELECT id FROM mydataset.t QUALIFY ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) = 1` | `SELECT id FROM (SELECT *, row_number() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn FROM mydb.t) WHERE rn = 1` | ClickHouse has no `QUALIFY`; wrap the windowed query in a subquery. |
| `SELECT * FROM mydataset.t TABLESAMPLE SYSTEM (10 PERCENT)` | `SELECT * FROM mydb.t SAMPLE 0.1` | ClickHouse [`SAMPLE`](/sql-reference/statements/select/sample) requires the table to declare a `SAMPLE BY` clause. |
| `SELECT * FROM mydataset.t FOR SYSTEM_TIME AS OF TIMESTAMP '2024-03-15 00:00:00+00:00'` | _no time-travel_ &mdash; use a versioned engine or snapshot pattern | ClickHouse does not provide row-level time travel. Patterns include [`ReplacingMergeTree`](/engines/table-engines/mergetree-family/replacingmergetree) with a version column or per-day backup tables. |
| `SELECT id, sum(amount) OVER w FROM mydataset.t WINDOW w AS (PARTITION BY user_id ORDER BY created_at)` | `SELECT id, sum(amount) OVER w FROM mydb.t WINDOW w AS (PARTITION BY user_id ORDER BY created_at)` | |
| `SELECT * FROM mydataset.t PIVOT (count(*) FOR status IN ('open' AS open, 'closed' AS closed))` | `SELECT countIf(status = 'open') AS open, countIf(status = 'closed') AS closed FROM mydb.t` | ClickHouse has no `PIVOT`; use [`countIf` / `sumIf`](/sql-reference/aggregate-functions/combinators#-if) per output column. |
| `SELECT col, v FROM (SELECT 1 AS a, 2 AS b) UNPIVOT (v FOR col IN (a, b))` | `SELECT col, v FROM (SELECT [('a', a), ('b', b)] AS pairs FROM mydb.t) ARRAY JOIN pairs.1 AS col, pairs.2 AS v` | ClickHouse has no `UNPIVOT`; emit `(name, value)` tuples and `ARRAY JOIN`. |

## Pipe syntax {#pipe-syntax}

BigQuery's [pipe syntax](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/pipe-syntax)
chains transformations with the `|>` operator. ClickHouse has no equivalent;
each pipe operator desugars to a clause in standard SQL. Subqueries or CTEs
are the readable way to chain stages.

| BigQuery | ClickHouse | Notes |
|----------|------------|-------|
| `FROM mydataset.t \|> SELECT id, name` | `SELECT id, name FROM mydb.t` | |
| `FROM mydataset.t \|> WHERE amount > 100` | `SELECT * FROM mydb.t WHERE amount > 100` | |
| `FROM mydataset.t \|> EXTEND amount * 0.1 AS tax` | `SELECT *, amount * 0.1 AS tax FROM mydb.t` | |
| `FROM mydataset.t \|> SET amount = amount * 2` | `SELECT * REPLACE (amount * 2 AS amount) FROM mydb.t` | |
| `FROM mydataset.t \|> DROP password` | `SELECT * EXCEPT password FROM mydb.t` | |
| `FROM mydataset.t \|> RENAME amount AS price` | `SELECT * REPLACE (amount AS price) FROM mydb.t` | ClickHouse `* REPLACE` substitutes the column expression; rename via an outer `SELECT` if you also need the column name to change. |
| `FROM mydataset.t \|> AGGREGATE sum(amount) AS total GROUP BY status` | `SELECT status, sum(amount) AS total FROM mydb.t GROUP BY status` | |
| `FROM mydataset.t \|> ORDER BY created_at DESC` | `SELECT * FROM mydb.t ORDER BY created_at DESC` | |
| `FROM mydataset.t \|> LIMIT 100` | `SELECT * FROM mydb.t LIMIT 100` | |
| `FROM mydataset.t \|> JOIN mydataset.u USING (id)` | `SELECT * FROM mydb.t JOIN mydb.u USING (id)` | |
| `FROM mydataset.t \|> WHERE amount > 100 \|> AGGREGATE count(*) GROUP BY status` | `SELECT status, count() FROM mydb.t WHERE amount > 100 GROUP BY status` | Pipes compose left-to-right; in ClickHouse, layer clauses or use a CTE for readability. |

## Procedural language {#procedural-language}

ClickHouse SQL is not a procedural language. Variables, loops, statement-level
`IF` / `CASE`, and stored procedures have no first-class equivalents;
orchestrate multi-step logic from a client library (Python, Go, JavaScript,
etc.) or use [parameterized views](/sql-reference/statements/create/view#parameterized-view)
for templated queries.

| BigQuery | ClickHouse | Notes |
|----------|------------|-------|
| `DECLARE x INT64 DEFAULT 0` | _client-side variable, or `SET param_x = 0` for [query parameters](/operations/server-configuration-parameters/settings#query-parameters)_ | |
| `SET x = 5` | _client-side; `SET param_x = 5`_ | |
| `BEGIN ... END` | _multi-statement scripts are run by the client, not the server_ | |
| `IF cond THEN ... ELSE ... END IF` | _expression form `if(cond, a, b)`; for statement-level branching, branch in the client_ | |
| `CASE WHEN cond THEN ... ELSE ... END CASE` | _expression form `CASE WHEN cond THEN a ELSE b END`; no statement form_ | |
| `WHILE cond DO ... END WHILE` | _no equivalent &mdash; use a client-driven loop_ | |
| `LOOP ... END LOOP` | _no equivalent_ | |
| `FOR row IN (SELECT ...) DO ... END FOR` | _iterate over query results client-side_ | |
| `BREAK`, `CONTINUE`, `LEAVE`, `ITERATE` | _no equivalent_ | |
| `CALL mydataset.p(1)` | _no stored procedures_ | |
| `EXECUTE IMMEDIATE 'SELECT 1'` | _client-side prepared statements_ | |
| `RAISE USING MESSAGE = 'bad'` | `SELECT throwIf(1, 'bad')` | |
| `BEGIN TRANSACTION; ...; COMMIT TRANSACTION` | _multi-statement transactions are experimental_ &mdash; see [transactions roadmap](https://github.com/ClickHouse/ClickHouse/issues/58392) | |

## Operators {#operators}

| BigQuery | ClickHouse | Notes |
|----------|------------|-------|
| `a + b`, `a - b`, `a * b`, `a / b` | `a + b`, `a - b`, `a * b`, `a / b` | `/` is real division in both engines. |
| `DIV(a, b)` | `intDiv(a, b)` | Integer division. |
| `MOD(a, b)` | `a % b` &nbsp;or&nbsp; `modulo(a, b)` | |
| `a = b`, `a != b`, `a <> b` | `a = b`, `a != b`, `a <> b` | |
| `a < b`, `a <= b`, `a > b`, `a >= b` | _same_ | |
| `a AND b`, `a OR b`, `NOT a` | _same_ | |
| `a IN (1, 2, 3)` | `a IN (1, 2, 3)` | |
| `a NOT IN (1, 2, 3)` | `a NOT IN (1, 2, 3)` | |
| `a BETWEEN x AND y` | `a BETWEEN x AND y` | Inclusive of both bounds. |
| `a IS NULL` / `a IS NOT NULL` | _same_ | |
| `a LIKE 'pre%'` | `a LIKE 'pre%'` | ClickHouse also offers [`ILIKE`](/sql-reference/functions/string-search-functions#ilike) for case-insensitive matching. |
| `CONCAT(a, b)` &nbsp;or&nbsp; `a \|\| b` | `concat(a, b)` &nbsp;or&nbsp; `a \|\| b` | |

## Conditional expressions {#conditional}

| BigQuery | ClickHouse | Notes |
|----------|------------|-------|
| `CASE WHEN c THEN a ELSE b END` | `CASE WHEN c THEN a ELSE b END` | |
| `CASE x WHEN 1 THEN 'a' ELSE 'b' END` | `CASE x WHEN 1 THEN 'a' ELSE 'b' END` | |
| `IF(cond, a, b)` | `if(cond, a, b)` | |
| `IFNULL(a, b)` | `ifNull(a, b)` &nbsp;or&nbsp; `coalesce(a, b)` | |
| `NULLIF(a, b)` | `nullIf(a, b)` | |
| `COALESCE(a, b, c)` | `coalesce(a, b, c)` | |

## Conversion {#conversion}

| BigQuery | ClickHouse | Notes |
|----------|------------|-------|
| `CAST(x AS STRING)` | `CAST(x AS String)` &nbsp;or&nbsp; `toString(x)` | |
| `CAST(x AS INT64)` | `CAST(x AS Int64)` &nbsp;or&nbsp; `toInt64(x)` | |
| `CAST(x AS FLOAT64)` | `CAST(x AS Float64)` &nbsp;or&nbsp; `toFloat64(x)` | |
| `CAST(x AS DATE)` | `CAST(x AS Date)` &nbsp;or&nbsp; `toDate(x)` | |
| `CAST(x AS TIMESTAMP)` | `CAST(x AS DateTime64(6, 'UTC'))` &nbsp;or&nbsp; `parseDateTime64BestEffort(x, 6, 'UTC')` | BigQuery `TIMESTAMP` is microsecond UTC. |
| `SAFE_CAST(x AS INT64)` | `toInt64OrNull(x)` | Each numeric type has `toTypeOrNull` / `toTypeOrZero` / `toTypeOrDefault` variants. |
| `PARSE_NUMERIC('3.14')` | `toDecimal64('3.14', 2)` | Specify scale explicitly in ClickHouse. |
| `PARSE_BIGNUMERIC('3.14')` | `toDecimal256('3.14', 38)` | |

## String functions {#string-functions}

| BigQuery | ClickHouse | Notes |
|----------|------------|-------|
| `LENGTH(name)` &nbsp;/&nbsp; `CHAR_LENGTH(name)` | `lengthUTF8(name)` | BigQuery `LENGTH` / `CHAR_LENGTH` count Unicode characters for `STRING`. ClickHouse [`length`](/sql-reference/functions/string-functions#length) counts **bytes**; use [`lengthUTF8`](/sql-reference/functions/string-functions#lengthutf8) for code points. |
| `BYTE_LENGTH(name)` &nbsp;/&nbsp; `OCTET_LENGTH(name)` | `length(name)` | |
| `LOWER(name)` | `lower(name)` &nbsp;/&nbsp; `lowerUTF8(name)` | |
| `UPPER(name)` | `upper(name)` &nbsp;/&nbsp; `upperUTF8(name)` | |
| `INITCAP(name)` | `initcap(name)` | |
| `TRIM(name)` | `trim(BOTH ' ' FROM name)` &nbsp;or&nbsp; `trimBoth(name)` | |
| `LTRIM(name)`, `RTRIM(name)` | `trimLeft(name)`, `trimRight(name)` | |
| `SUBSTR(name, pos, len)` | `substring(name, pos, len)` | 1-indexed in both. |
| `LEFT(name, n)`, `RIGHT(name, n)` | `left(name, n)`, `right(name, n)` | |
| `REPLACE(name, from, to)` | `replaceAll(name, from, to)` | Use `replaceOne` to replace only the first match. |
| `REVERSE(name)` | `reverse(name)` &nbsp;/&nbsp; `reverseUTF8(name)` | |
| `CONCAT(a, b, c)` | `concat(a, b, c)` | |
| `STARTS_WITH(name, 'pre')` | `startsWith(name, 'pre')` | |
| `ENDS_WITH(name, 'suf')` | `endsWith(name, 'suf')` | |
| `STRPOS(name, 'x')` &nbsp;/&nbsp; `INSTR(name, 'x')` | `position(name, 'x')` | 1-indexed; returns 0 if not found. `position` is byte-based; use `positionUTF8` for code points. |
| `CONTAINS_SUBSTR(name, 'x')` | `position(name, 'x') > 0` | BigQuery `CONTAINS_SUBSTR` is case-insensitive and Unicode-normalised; for case-insensitive in ClickHouse use [`positionCaseInsensitive`](/sql-reference/functions/string-search-functions#positioncaseinsensitive). |
| `REPEAT(name, n)` | `repeat(name, n)` | |
| `LPAD(name, n, pad)`, `RPAD(name, n, pad)` | `leftPad(name, n, pad)`, `rightPad(name, n, pad)` | |
| `SPLIT(name, ',')` | `splitByChar(',', name)` &nbsp;/&nbsp; `splitByString(',', name)` | |
| `REGEXP_CONTAINS(name, r'^[a-z]')` | `match(name, '^[a-z]')` | Unanchored in both. |
| `REGEXP_EXTRACT(name, r'([0-9]+)')` | `extract(name, '([0-9]+)')` | First match of the first capture group. |
| `REGEXP_EXTRACT_ALL(name, r'[0-9]+')` | `extractAll(name, '[0-9]+')` | Returns an array. |
| `REGEXP_REPLACE(name, r'[0-9]+', 'X')` | `replaceRegexpAll(name, '[0-9]+', 'X')` | |
| `FORMAT('%s=%d', name, id)` | `format('{}={}', name, toString(id))` | Different format strings; see [`format`](/sql-reference/functions/string-functions#format). |
| `TO_HEX(b'...')` | `hex(...)` | ClickHouse emits upper-case by default; wrap with `lower(...)` to match BigQuery. |
| `FROM_HEX('48656c6c6f')` | `unhex('48656c6c6f')` | |
| `TO_BASE64(b'hi')` | `base64Encode('hi')` | |
| `FROM_BASE64('aGk=')` | `base64Decode('aGk=')` | |
| `ASCII('A')` | `reinterpretAsUInt8(substring(s, 1, 1))` | ClickHouse has no `ASCII`; take the byte value of the first character. |
| `CHR(65)` | `char(65)` | |
| `NORMALIZE(name, NFC)` | `normalizeUTF8NFC(name)` | NFD/NFKC/NFKD variants exist on both engines. |
| `EDIT_DISTANCE(a, b)` | `editDistance(a, b)` | |
| `SOUNDEX(name)` | `soundex(name)` | |

## Mathematical functions {#math-functions}

| BigQuery | ClickHouse | Notes |
|----------|------------|-------|
| `ABS(amount)` | `abs(amount)` | |
| `SIGN(amount)` | `sign(amount)` | |
| `CEIL(amount)` &nbsp;/&nbsp; `CEILING(amount)` | `ceil(amount)` | |
| `FLOOR(amount)` | `floor(amount)` | |
| `ROUND(amount)` | `round(amount)` | Both round to nearest even on ties. |
| `ROUND(amount, 2)` | `round(amount, 2)` | |
| `TRUNC(amount)` | `trunc(amount)` &nbsp;/&nbsp; `truncate(amount)` | |
| `MOD(a, b)` | `modulo(a, b)` &nbsp;/&nbsp; `a % b` | |
| `DIV(a, b)` | `intDiv(a, b)` | |
| `SQRT(amount)` | `sqrt(amount)` | |
| `CBRT(amount)` | `cbrt(amount)` | |
| `POW(a, b)` &nbsp;/&nbsp; `POWER(a, b)` | `pow(a, b)` &nbsp;/&nbsp; `power(a, b)` | |
| `EXP(amount)` | `exp(amount)` | |
| `LN(amount)` | `log(amount)` | ClickHouse [`log`](/sql-reference/functions/math-functions#log) is the natural log. |
| `LOG(b, x)` | `log(x) / log(b)` | |
| `LOG10(amount)` | `log10(amount)` | |
| `SIN(x)`, `COS(x)`, `TAN(x)` | `sin(x)`, `cos(x)`, `tan(x)` | Hyperbolic and inverse forms also match by lower-case name. |
| `GREATEST(a, b, c)` | `greatest(a, b, c)` | |
| `LEAST(a, b, c)` | `least(a, b, c)` | |
| `IS_INF(x)` | `isInfinite(x)` | |
| `IS_NAN(x)` | `isNaN(x)` | |
| `SAFE_DIVIDE(a, b)` | `a / nullIf(b, 0)` | ClickHouse `a / 0` yields `inf`; wrap with `nullIf` to mimic `SAFE_DIVIDE`. |
| `SAFE_ADD(a, b)`, `SAFE_SUBTRACT(a, b)`, `SAFE_MULTIPLY(a, b)` | _check overflow client-side, or widen the type_ | ClickHouse arithmetic does not raise on overflow; use a wider integer / decimal type for guaranteed precision. |
| `RAND()` | `randCanonical()` | Both return a `Float64` in `[0, 1)`. |
| `RANGE_BUCKET(x, [10, 20, 30])` | `roundDown(x, [10, 20, 30])` | |

## Date and time functions {#date-functions}

ClickHouse merges BigQuery's separate `DATE`, `TIME`, `DATETIME`, and
`TIMESTAMP` families into [`Date` / `Date32`](/sql-reference/data-types/date32)
and [`DateTime` / `DateTime64`](/sql-reference/data-types/datetime64), with an
optional `IANA` timezone. The same translation usually applies regardless of
which BigQuery family the source function comes from; the rows below show the
most common shapes.

| BigQuery | ClickHouse | Notes |
|----------|------------|-------|
| `CURRENT_DATE()` | `today()` | |
| `CURRENT_TIMESTAMP()` | `now()` &nbsp;/&nbsp; `now64()` | `now()` returns `DateTime` (second precision); `now64()` returns `DateTime64`. |
| `CURRENT_DATETIME()` | `now()` | ClickHouse has no separate "datetime" family. |
| `CURRENT_TIME()` | `substring(toString(now()), 12)` | ClickHouse has no `Time` type; extract from the datetime representation. |
| `DATE '2024-03-15'` | `toDate('2024-03-15')` | |
| `TIMESTAMP '2024-03-15 12:34:56+00:00'` | `toDateTime('2024-03-15 12:34:56', 'UTC')` | |
| `DATE(2024, 3, 15)` | `makeDate(2024, 3, 15)` | |
| `DATETIME(2024, 3, 15, 12, 34, 56)` | `makeDateTime(2024, 3, 15, 12, 34, 56)` | |
| `DATE_ADD(d, INTERVAL 7 DAY)` | `addDays(d, 7)` &nbsp;or&nbsp; `d + INTERVAL 7 DAY` | |
| `DATE_SUB(d, INTERVAL 1 MONTH)` | `subtractMonths(d, 1)` | |
| `TIMESTAMP_ADD(ts, INTERVAL 30 MINUTE)` | `addMinutes(ts, 30)` | |
| `DATE_DIFF(end, start, DAY)` | `dateDiff('day', start, end)` | BigQuery's argument order is `(end, start, unit)`; ClickHouse is `(unit, start, end)`. |
| `TIMESTAMP_DIFF(end, start, SECOND)` | `dateDiff('second', start, end)` | |
| `DATE_TRUNC(d, MONTH)` | `toStartOfMonth(d)` &nbsp;or&nbsp; `date_trunc('month', d)` | |
| `TIMESTAMP_TRUNC(ts, HOUR)` | `toStartOfHour(ts)` | |
| `EXTRACT(YEAR FROM d)` | `toYear(d)` &nbsp;or&nbsp; `EXTRACT(YEAR FROM d)` | |
| `EXTRACT(WEEK FROM d)` | `toWeek(d)` | [`toWeek`](/sql-reference/functions/date-time-functions#toweek) accepts a `mode` argument for ISO vs. US week numbering. |
| `EXTRACT(DAYOFWEEK FROM d)` | `toDayOfWeek(d, 3)` | Mode 3 matches BigQuery's 1=Sunday convention. |
| `LAST_DAY(d)` | `toLastDayOfMonth(d)` | |
| `FORMAT_DATE('%Y-%m-%d', d)` | `formatDateTime(d, '%Y-%m-%d')` | Format codes are POSIX `strftime` in both. |
| `FORMAT_TIMESTAMP('%FT%TZ', ts, 'UTC')` | `formatDateTime(ts, '%FT%TZ', 'UTC')` | |
| `PARSE_DATE('%Y-%m-%d', '2024-03-15')` | `parseDateTime('2024-03-15', '%Y-%m-%d')::Date` | |
| `PARSE_TIMESTAMP('%F %T', s)` | `parseDateTime(s, '%F %T')` | |
| `UNIX_DATE(d)` | `toInt32(d)` | ClickHouse `Date` is stored as days since the epoch. |
| `UNIX_SECONDS(ts)` | `toUnixTimestamp(ts)` | |
| `UNIX_MILLIS(ts)` | `toUnixTimestamp64Milli(ts)` | |
| `UNIX_MICROS(ts)` | `toUnixTimestamp64Micro(ts)` | |
| `TIMESTAMP_SECONDS(1710505896)` | `toDateTime(1710505896, 'UTC')` | |
| `TIMESTAMP_MILLIS(1710505896000)` | `fromUnixTimestamp64Milli(1710505896000, 'UTC')` | |
| `DATE_BUCKET(d, INTERVAL 7 DAY)` | `toStartOfInterval(d, INTERVAL 7 DAY)` | |
| `GENERATE_DATE_ARRAY(d1, d2)` | `arrayMap(x -> d1 + x, range(toUInt32(d2 - d1) + 1))` | |

## Array functions {#array-functions}

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

| BigQuery | ClickHouse | Notes |
|----------|------------|-------|
| `[1, 2, 3]` | `[1, 2, 3]` | Both support array literals. |
| `ARRAY_LENGTH(tags)` | `length(tags)` | |
| `ARRAY_CONCAT(a, b)` | `arrayConcat(a, b)` | |
| `ARRAY_REVERSE(tags)` | `arrayReverse(tags)` | |
| `ARRAY_TO_STRING(tags, ',')` | `arrayStringConcat(tags, ',')` | |
| `GENERATE_ARRAY(1, 5)` | `range(1, 6)` | ClickHouse [`range`](/sql-reference/functions/array-functions#range) excludes the upper bound. |
| `ARRAY_FIRST(tags)` | `tags[1]` | ClickHouse arrays are 1-indexed. |
| `ARRAY_LAST(tags)` | `tags[length(tags)]` &nbsp;or&nbsp; `arrayLast(x -> 1, tags)` | |
| `ARRAY_SLICE(tags, 2, 3)` | `arraySlice(tags, 2, 3)` | |
| `tags[OFFSET(0)]` &nbsp;/&nbsp; `tags[SAFE_OFFSET(0)]` | `tags[1]` &nbsp;/&nbsp; `arrayElement(tags, 1)` | BigQuery `OFFSET` is 0-indexed; ClickHouse subscripts are 1-indexed. |
| `tags[ORDINAL(1)]` | `tags[1]` | |
| `EXISTS(SELECT 1 FROM UNNEST(tags) AS t WHERE t = 'x')` | `has(tags, 'x')` | |
| `ARRAY(SELECT x FROM UNNEST(tags) AS x WHERE x LIKE 'a%')` | `arrayFilter(x -> x LIKE 'a%', tags)` | ClickHouse [higher-order array functions](/sql-reference/functions/array-functions) avoid the unnest-then-collect round trip. |
| `ARRAY(SELECT x * 2 FROM UNNEST(nums) AS x)` | `arrayMap(x -> x * 2, nums)` | |

## Struct functions {#struct-functions}

| BigQuery | ClickHouse | Notes |
|----------|------------|-------|
| `STRUCT(1 AS a, 'x' AS b)` | `tuple(1, 'x')` &nbsp;or&nbsp; `(1, 'x')` | ClickHouse [`Tuple`](/sql-reference/data-types/tuple) is positional. For named access, use [`Nested`](/sql-reference/data-types/nested-data-structures/nested) or a `Tuple(a Int64, b String)` type. |
| `s.a` | `s.1` &nbsp;or&nbsp; `tupleElement(s, 'a')` | Positional access for unnamed tuples; name-based access for `Tuple(a …, b …)`. |
| `STRUCT<a INT64, b STRING>(1, 'x')` | `CAST((1, 'x') AS Tuple(a Int64, b String))` | |

## JSON functions {#json-functions}

| BigQuery | ClickHouse | Notes |
|----------|------------|-------|
| `PARSE_JSON(payload)` | _cast to [`JSON`](/sql-reference/data-types/newjson)_ &nbsp;or&nbsp; `JSONExtractRaw(payload)` | ClickHouse's `JSON` data type provides on-disk semi-structured storage with adaptive typing. |
| `JSON_VALUE(payload, '$.a')` | `JSONExtractString(payload, 'a')` | BigQuery uses JSONPath; ClickHouse takes a sequence of key arguments. |
| `JSON_QUERY(payload, '$.a')` | `JSONExtractRaw(payload, 'a')` | Returns the JSON subdocument as text. |
| `JSON_EXTRACT_SCALAR(payload, '$.a')` | `JSONExtractString(payload, 'a')` | |
| `JSON_EXTRACT_ARRAY(payload, '$.tags')` | `JSONExtractArrayRaw(payload, 'tags')` | |
| `JSON_VALUE_ARRAY(payload, '$.tags')` | `JSONExtract(payload, 'tags', 'Array(String)')` | |
| `JSON_TYPE(payload)` | `JSONType(payload)` | Values differ (`'string'` / `'number'` / … vs `'String'` / `'Int64'` / …). |
| `JSON_OBJECT('a', 1, 'b', 'x')` | `toJSONString(map('a', 1, 'b', 'x'))` | |
| `JSON_ARRAY(1, 2, 3)` | `toJSONString([1, 2, 3])` | |
| `TO_JSON_STRING(s)` | `toJSONString(s)` | |
| `BOOL(payload.flag)` &nbsp;/&nbsp; `INT64(payload.n)` &nbsp;/&nbsp; `FLOAT64(payload.x)` | `JSONExtractBool(payload, 'flag')` &nbsp;/&nbsp; `JSONExtractInt(payload, 'n')` &nbsp;/&nbsp; `JSONExtractFloat(payload, 'x')` | |
| `JSON_KEYS(payload)` | `JSONExtractKeys(payload)` | |

## Aggregate functions {#aggregate-functions}

| BigQuery | ClickHouse | Notes |
|----------|------------|-------|
| `COUNT(*)` | `count()` &nbsp;or&nbsp; `count(*)` | |
| `COUNT(DISTINCT id)` | `countDistinct(id)` &nbsp;or&nbsp; `uniqExact(id)` | `count(DISTINCT id)` is also accepted in ClickHouse. |
| `COUNTIF(amount > 100)` | `countIf(amount > 100)` | ClickHouse's [`-If` combinator](/sql-reference/aggregate-functions/combinators#-if) generalises to every aggregate. |
| `SUM(amount)` | `sum(amount)` | |
| `AVG(amount)` | `avg(amount)` | |
| `MIN(amount)` | `min(amount)` | |
| `MAX(amount)` | `max(amount)` | |
| `ANY_VALUE(name)` | `any(name)` | Non-deterministic. |
| `STRING_AGG(name, ',' ORDER BY name)` | `arrayStringConcat(arraySort(groupArray(name)), ',')` | |
| `ARRAY_AGG(name)` | `groupArray(name)` | |
| `ARRAY_AGG(DISTINCT name)` | `groupUniqArray(name)` | |
| `ARRAY_CONCAT_AGG(tags)` | `arrayFlatten(groupArray(tags))` | |
| `LOGICAL_AND(amount > 0)` | `min(amount > 0)` &nbsp;or&nbsp; `groupBitAnd(toUInt8(amount > 0))` | No direct alias; aggregate a `0/1` expression. |
| `LOGICAL_OR(amount > 0)` | `max(amount > 0)` | |
| `BIT_AND(flags)`, `BIT_OR(flags)`, `BIT_XOR(flags)` | `groupBitAnd(flags)`, `groupBitOr(flags)`, `groupBitXor(flags)` | |
| `MAX_BY(name, amount)` | `argMax(name, amount)` | |
| `MIN_BY(name, amount)` | `argMin(name, amount)` | |

## Approximate and statistical aggregates {#approximate-aggregates}

| BigQuery | ClickHouse | Notes |
|----------|------------|-------|
| `APPROX_COUNT_DISTINCT(user_id)` | `uniq(user_id)` | HyperLogLog-style estimator. For BigQuery `HLL_COUNT.*` parity, use [`uniqHLL12`](/sql-reference/aggregate-functions/reference/uniqhll12). |
| `APPROX_QUANTILES(amount, 4)[OFFSET(2)]` | `quantile(0.5)(amount)` | BigQuery returns N+1 boundaries; index into them. ClickHouse [`quantile(level)`](/sql-reference/aggregate-functions/reference/quantile) takes the level directly. |
| `APPROX_TOP_COUNT(name, 5)` | `topK(5)(name)` | Returns the top-K most-frequent values. |
| `APPROX_TOP_SUM(name, amount, 5)` | `topKWeighted(5)(name, amount)` | |
| `HLL_COUNT.INIT(user_id)` &nbsp;/&nbsp; `HLL_COUNT.MERGE(state)` | `uniqHLL12State(user_id)` &nbsp;/&nbsp; `uniqHLL12Merge(state)` | The `-State` and `-Merge` [combinators](/sql-reference/aggregate-functions/combinators) enable progressive aggregation. |
| `STDDEV_SAMP(amount)` &nbsp;/&nbsp; `STDDEV_POP(amount)` | `stddevSamp(amount)` &nbsp;/&nbsp; `stddevPop(amount)` | |
| `VAR_SAMP(amount)` &nbsp;/&nbsp; `VAR_POP(amount)` | `varSamp(amount)` &nbsp;/&nbsp; `varPop(amount)` | |
| `CORR(x, y)` | `corr(x, y)` | |
| `COVAR_SAMP(x, y)` &nbsp;/&nbsp; `COVAR_POP(x, y)` | `covarSamp(x, y)` &nbsp;/&nbsp; `covarPop(x, y)` | |

## Window, navigation, and numbering functions {#window-functions}

| BigQuery | ClickHouse | Notes |
|----------|------------|-------|
| `ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at)` | `row_number() OVER (PARTITION BY user_id ORDER BY created_at)` | |
| `RANK() OVER (...)` | `rank() OVER (...)` | Ranking with gaps after ties. |
| `DENSE_RANK() OVER (...)` | `dense_rank() OVER (...)` | |
| `NTILE(4) OVER (...)` | `ntile(4) OVER (...)` | |
| `PERCENT_RANK() OVER (...)` | `percent_rank() OVER (...)` | |
| `CUME_DIST() OVER (...)` | `cume_dist() OVER (...)` | |
| `LAG(amount, 1) OVER (...)` | `lagInFrame(amount, 1) OVER (...)` | ClickHouse's [`lagInFrame`](/sql-reference/window-functions/lagInFrame) / [`leadInFrame`](/sql-reference/window-functions/leadInFrame) respect the window frame; plain `lag` / `lead` are emulated in older versions. |
| `LEAD(amount, 1) OVER (...)` | `leadInFrame(amount, 1) OVER (...)` | |
| `FIRST_VALUE(amount) OVER (...)` | `first_value(amount) OVER (...)` | |
| `LAST_VALUE(amount) OVER (ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)` | `last_value(amount) OVER (ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)` | An explicit unbounded frame is required for the expected `LAST_VALUE` semantics. |
| `NTH_VALUE(amount, 3) OVER (...)` | `nth_value(amount, 3) OVER (...)` | |
| `PERCENTILE_CONT(amount, 0.5) OVER (...)` | `quantile(0.5)(amount) OVER (...)` | |
| `PERCENTILE_DISC(amount, 0.5) OVER (...)` | `quantileExact(0.5)(amount) OVER (...)` | |

## Hash and encoding {#hash-functions}

| BigQuery | ClickHouse | Notes |
|----------|------------|-------|
| `MD5(name)` | `MD5(name)` | Both return raw bytes; render with `hex(...)` / `TO_HEX(...)`. |
| `SHA1(name)`, `SHA256(name)`, `SHA512(name)` | `SHA1(name)`, `SHA256(name)`, `SHA512(name)` | |
| `FARM_FINGERPRINT(name)` | `farmFingerprint64(name)` | Both implement Google's FarmHash; outputs match. |
| `TO_HEX(b)`, `FROM_HEX(s)` | `hex(b)`, `unhex(s)` | ClickHouse `hex` is upper-case; wrap with `lower(...)` to match. |
| `TO_BASE64(b)`, `FROM_BASE64(s)` | `base64Encode(b)`, `base64Decode(s)` | |
| `TO_BASE32(b)`, `FROM_BASE32(s)` | `base32Encode(b)`, `base32Decode(s)` | |
| `BIT_COUNT(b)` | `bitCount(b)` | |

## Geography, IP, and other domain-specific categories {#less-common-categories}

For categories where ClickHouse's surface is broader than BigQuery's or the
constructs are domain-specific, follow these links rather than expecting a
one-to-one row mapping:

| BigQuery category | ClickHouse landing page |
|-------------------|--------------------------|
| [Geography (`ST_*`)](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/geography_functions) | [Geo functions](/sql-reference/functions/geo), [Geo data types](/sql-reference/data-types/geo) |
| [Net (`NET.*`)](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/net_functions) | [IP-address functions](/sql-reference/functions/ip-address-functions), [`IPv4`](/sql-reference/data-types/ipv4) / [`IPv6`](/sql-reference/data-types/ipv6) types |
| [HyperLogLog++ (`HLL_COUNT.*`)](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/hll_functions) | [`uniqHLL12`](/sql-reference/aggregate-functions/reference/uniqhll12), [`uniqCombined`](/sql-reference/aggregate-functions/reference/uniqcombined), [`-State` / `-Merge` combinators](/sql-reference/aggregate-functions/combinators) |
| [KLL quantile (`KLL_QUANTILES.*`)](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/kll_quantiles_functions) | [`quantileTDigest`](/sql-reference/aggregate-functions/reference/quantiletdigest), [`quantileExactWeighted`](/sql-reference/aggregate-functions/reference/quantileexactweighted), the [`quantile*` family](/sql-reference/aggregate-functions/reference/quantiles) |
| [Time-series (`GAP_FILL`, `*_BUCKET`)](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/time_series_functions) | [`toStartOfInterval`](/sql-reference/functions/date-time-functions#tostartofinterval), [`asof` joins](/sql-reference/statements/select/join#asof-join-usage) |
| [AEAD encryption (`AEAD.*`, `KEYS.*`)](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/aead_encryption_functions) | [`encrypt`](/sql-reference/functions/encryption-functions#encrypt) / [`decrypt`](/sql-reference/functions/encryption-functions#decrypt) (AES-CTR / AES-GCM by mode) |
| [DLP encryption (`DLP_*`)](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/dlp_encryption_functions) | No direct equivalent &mdash; build deterministic encryption with [`encrypt`](/sql-reference/functions/encryption-functions#encrypt) and a fixed key |
| [Range (`RANGE`, `RANGE_INTERSECT`, …)](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/range_functions) | No first-class `RANGE` type; model with two-column `(start, end)` tuples and [`intervalLengthSum`](/sql-reference/aggregate-functions/reference/intervalLengthSum) |
| [Search (`SEARCH`, `VECTOR_SEARCH`)](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/search_functions) | [Full-text indexes](/engines/table-engines/mergetree-family/textindexes), [Vector-search indexes](/engines/table-engines/mergetree-family/annindexes) |
| [Federated query (`EXTERNAL_QUERY`)](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/federated_query_functions) | [Database engines](/engines/database-engines) and table functions ([`s3`](/sql-reference/table-functions/s3), [`url`](/sql-reference/table-functions/url), [`mysql`](/sql-reference/table-functions/mysql), [`postgresql`](/sql-reference/table-functions/postgresql)) |