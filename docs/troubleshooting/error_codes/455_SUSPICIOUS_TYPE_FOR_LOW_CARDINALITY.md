---
slug: /troubleshooting/error-codes/455_SUSPICIOUS_TYPE_FOR_LOW_CARDINALITY
sidebar_label: '455 SUSPICIOUS_TYPE_FOR_LOW_CARDINALITY'
doc_type: 'reference'
keywords: ['error codes', 'SUSPICIOUS_TYPE_FOR_LOW_CARDINALITY', '455']
title: '455 SUSPICIOUS_TYPE_FOR_LOW_CARDINALITY'
description: 'ClickHouse error code - 455 SUSPICIOUS_TYPE_FOR_LOW_CARDINALITY'
---

# Error 455: SUSPICIOUS_TYPE_FOR_LOW_CARDINALITY

:::tip
This error occurs when you're trying to create or use a `LowCardinality` column with a data type that typically performs worse with `LowCardinality` wrapper than without it.
This is a protective error that prevents performance degradation due to inappropriate use of `LowCardinality` optimization.
:::

## What this error means {#what-this-error-means}

ClickHouse's `LowCardinality` optimization is designed for columns with relatively few distinct values (typically under 10,000).
When you wrap certain data types like `Date`, `DateTime`, `UUID`, `Int128`, `UInt128`, `Int256`, or `UInt256` with `LowCardinality`, it often creates additional overhead without providing compression benefits, leading to worse performance.

## Potential causes {#potential-causes}

1. **Using LowCardinality with unsuitable data types** - Wrapping types like `Date`, `DateTime`, or large integers with `LowCardinality` when these types already have efficient storage
2. **Hive partition columns auto-detection** - When reading Hive-partitioned data (e.g., paths like `hp=2025-09-24/file.parquet`), ClickHouse automatically infers partition columns as `LowCardinality(Date)`
3. **Automatic schema inference** - Schema inference from external formats may incorrectly suggest `LowCardinality` for date or numeric columns
4. **High cardinality data** - Using `LowCardinality` on columns with many distinct values (>10,000 unique values)

## When you'll see it {#when-youll-see-it}

- **Table creation**: `CREATE TABLE` statements defining columns like `LowCardinality(Date)` or `LowCardinality(UUID)`
- **ALTER TABLE**: Modifying statistics or structure involving suspicious `LowCardinality` types
- **Reading external data**: Loading Parquet/ORC files with Hive partitioning where dates are inferred as partition columns
- **INSERT operations**: Inserting data that triggers automatic type inference with `LowCardinality` wrapper

### Example scenarios {#example-scenarios}

```sql
-- Direct creation (will fail)
CREATE TABLE test (date_col LowCardinality(Date)) ENGINE = MergeTree ORDER BY date_col;
-- Error: Creating columns of type LowCardinality(Date) is prohibited

-- Hive partitioned data (will fail on default settings)
SELECT * FROM url('s3://bucket/hp=2025-09-24/data.parquet', Parquet);
-- Error: LowCardinality(Date) prohibited due to 'hp' partition column
```

## Quick fixes {#quick-fixes}

### 1. Enable the setting (if you really need it) {#enable-setting-if-needed}

```sql
SET allow_suspicious_low_cardinality_types = 1;
```

<details>
<summary>When would I really need this setting?</summary>

Based on actual customer cases and internal discussions, here are the **legitimate scenarios**:

### 1. Low-cardinality UUIDs (Most common legitimate use) {#low-cardinality-uuids}

When you have UUID columns that represent categorical data with limited distinct values:

- **Tenant IDs**: ~1,500 repeating UUIDs across millions of rows (real case from support escalation #3470)
- **Organization IDs**: UUIDs that appear frequently but have \<10,000 distinct values
- **Service IDs**: Fixed set of service identifiers in UUID format
- **API Keys**: Limited set of API keys that appear repeatedly

**Example:** A multi-tenant system where you have 1,500 tenants (UUID identifiers) but millions of events per tenant. Using `LowCardinality(UUID)` can provide significant compression benefits here.

### 2. Limited date ranges (Debatable but sometimes valid) {#limited-date-ranges}

When you have date columns with very few distinct values:

- **Billing periods**: Only 12 distinct dates (monthly billing cycles)
- **Release dates**: Small set of product release dates
- **Reporting periods**: Quarterly or annual reporting with limited distinct dates

### 3. Hive-partitioned data (Workaround scenario) {#hive-partitioned-data}

When reading external data with Hive partitioning where ClickHouse auto-infers partition columns as `LowCardinality(Date)`:

```sql
-- Hive partitioned S3 data like: s3://bucket/hp=2025-09-24/data.parquet
SELECT * FROM url('s3://bucket/hp=2025-09-24/*.parquet', Parquet)
SETTINGS allow_suspicious_low_cardinality_types = 1;
```

This is more of a **workaround** than a best practice.

### 4. Integration testing (Development scenario) {#integration-testing}

For automated testing where existing schemas use suspicious types and you need compatibility:

- Testing data migration from other systems
- Validating schema compatibility
- CI/CD pipelines with fixed test schemas

</details>

### 2. Remove LowCardinality wrapper {#remove-lowcardinality-wrapper}

```sql
-- Instead of:
CREATE TABLE test (date_col LowCardinality(Date)) ENGINE = MergeTree ORDER BY date_col;

-- Use:
CREATE TABLE test (date_col Date) ENGINE = MergeTree ORDER BY date_col;
```

### 3. Disable Hive partitioning (for external data) {#disable-hive-partitioning}

```sql
-- If you don't need Hive partition columns
SELECT * FROM url('s3://bucket/hp=2025-09-24/data.parquet', Parquet)
SETTINGS use_hive_partitioning = 0;
```

### 4. Use appropriate types {#use-appropriate-types}
- For dates: use `Date` or `DateTime` directly
- For UUIDs: use `UUID` directly
- For high-cardinality strings: use `String` or `FixedString`
- Only use `LowCardinality(String)` for columns with less than 10,000 distinct values

## Understanding the root cause {#understanding-root-cause}

`LowCardinality` works by creating a dictionary of unique values and storing references to this dictionary. This is efficient when:
- You have relatively few distinct values (\<10,000)
- The values are strings or other variable-length types

It's **inefficient** when:
- Types like `Date` (already 2-4 bytes) or `UUID` (16 bytes) don't benefit from dictionary encoding
- High cardinality data creates a dictionary as large as the original data
- The overhead of dictionary lookups outweighs storage savings
