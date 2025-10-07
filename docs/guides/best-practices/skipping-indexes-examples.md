---
slug: /optimize/skipping-indexes/examples
sidebar_label: 'Data Skipping Indexes - Examples'
sidebar_position: 2
description: 'Consolidated Skip Index Examples'
title: 'Data Skipping Index Examples'
doc_type: 'guide'
---

# Data skipping index examples {#data-skipping-index-examples}

This page consolidates ClickHouse data skipping index examples, showing how to declare each type, when to use them, and how to verify they're applied. All features work with [MergeTree-family tables](/engines/table-engines/mergetree-family/mergetree).

**Index syntax:** 

```sql
INDEX name expr TYPE type(...) [GRANULARITY N]`

ClickHouse supports five skip index types:

| Index Type | Description |
|------------|-------------|
| **minmax** | Tracks minimum and maximum values in each granule |
| **set(N)** | Stores up to N distinct values per granule |
| **bloom_filter([false_positive_rate])** | Probabilistic filter for existence checks |
| **ngrambf_v1** | N-gram bloom filter for substring searches |
| **tokenbf_v1** | Token-based bloom filter for full-text searches |

Each section provides examples with sample data and demonstrates how to verify index usage in query execution.

## MinMax index {#minmax-index}

The`minmax` index is best for range predicates on loosely sorted data or columns correlated with `ORDER BY`.

```sql
-- Define in CREATE TABLE
CREATE TABLE events
(
  ts DateTime,
  user_id UInt64,
  value UInt32,
  INDEX ts_minmax ts TYPE minmax GRANULARITY 1
)
ENGINE=MergeTree
ORDER BY ts;

-- Or add later and materialize
ALTER TABLE events ADD INDEX ts_minmax ts TYPE minmax GRANULARITY 1;
ALTER TABLE events MATERIALIZE INDEX ts_minmax;

-- Query that benefits from the index
SELECT count() FROM events WHERE ts >= now() - 3600;

-- Verify usage
EXPLAIN indexes = 1
SELECT count() FROM events WHERE ts >= now() - 3600;
```

See a [worked example](/best-practices/use-data-skipping-indices-where-appropriate#example) with `EXPLAIN` and pruning.

## Set index {#set-index}

Use the `set` index when local (per-block) cardinality is low; not helpful if each block has many distinct values.

```sql
ALTER TABLE events ADD INDEX user_set user_id TYPE set(100) GRANULARITY 1;
ALTER TABLE events MATERIALIZE INDEX user_set;

SELECT * FROM events WHERE user_id IN (101, 202);

EXPLAIN indexes = 1
SELECT * FROM events WHERE user_id IN (101, 202);
```

A creation/materialization workflow and the before/after effect are shown in the [basic operation guide](/optimize/skipping-indexes#basic-operation).

## Generic Bloom filter (scalar) {#generic-bloom-filter-scalar}

The `bloom_filter` index is good for "needle in a haystack" equality/IN membership. It accepts an optional parameter which is the false-positive rate (default 0.025). 

```sql
ALTER TABLE events ADD INDEX value_bf value TYPE bloom_filter(0.01) GRANULARITY 3;
ALTER TABLE events MATERIALIZE INDEX value_bf;

SELECT * FROM events WHERE value IN (7, 42, 99);

EXPLAIN indexes = 1
SELECT * FROM events WHERE value IN (7, 42, 99);
```

## N-gram Bloom filter (ngrambf\_v1) for substring search {#n-gram-bloom-filter-ngrambf-v1-for-substring-search}

The `ngrambf_v1` index splits strings into n-grams. It works well for `LIKE '%...%'` queries. It supports String/FixedString/Map (via mapKeys/mapValues), as well as tunable size, hash count, and seed. See the documentation for [N-gram bloom filter](/engines/table-engines/mergetree-family/mergetree#n-gram-bloom-filter) for further details.

```sql
-- Create index for substring search
ALTER TABLE logs ADD INDEX msg_ngram msg TYPE ngrambf_v1(3, 10000, 3, 7) GRANULARITY 1;
ALTER TABLE logs MATERIALIZE INDEX msg_ngram;

-- Substring search
SELECT count() FROM logs WHERE msg LIKE '%timeout%';

EXPLAIN indexes = 1
SELECT count() FROM logs WHERE msg LIKE '%timeout%';
```

[This guide](/use-cases/observability/schema-design#bloom-filters-for-text-search) shows practical examples and when to use token vs ngram.

**Parameter optimization helpers:**

The four ngrambf\_v1 parameters (n-gram size, bitmap size, hash functions, seed) significantly impact performance and memory usage. Use these functions to calculate optimal bitmap size and hash function count based on your expected n-gram volume and desired false positive rate:

```sql
CREATE FUNCTION bfEstimateFunctions AS
(total_grams, bits) -> round((bits / total_grams) * log(2));

CREATE FUNCTION bfEstimateBmSize AS
(total_grams, p_false) -> ceil((total_grams * log(p_false)) / log(1 / pow(2, log(2))));

-- Example sizing for 4300 ngrams, p_false = 0.0001
SELECT bfEstimateBmSize(4300, 0.0001) / 8 AS size_bytes;  -- ~10304
SELECT bfEstimateFunctions(4300, bfEstimateBmSize(4300, 0.0001)) AS k; -- ~13
```

See [parameter docs](/engines/table-engines/mergetree-family/mergetree#n-gram-bloom-filter) for complete tuning guidance.  

## Token Bloom filter (tokenbf\_v1) for word-based search {#token-bloom-filter-tokenbf-v1-for-word-based-search}

`tokenbf_v1` indexes tokens separated by non-alphanumeric characters. You should use it with [`hasToken`](/sql-reference/functions/string-search-functions#hastoken), `LIKE` word patterns or equals/IN. It supports `String`/`FixedString`/`Map` types.

See [Token bloom filter](/engines/table-engines/mergetree-family/mergetree#token-bloom-filter) and [Bloom filter types](/optimize/skipping-indexes#skip-index-types) pages for more details.

```sql
ALTER TABLE logs ADD INDEX msg_token lower(msg) TYPE tokenbf_v1(10000, 7, 7) GRANULARITY 1;
ALTER TABLE logs MATERIALIZE INDEX msg_token;

-- Word search (case-insensitive via lower)
SELECT count() FROM logs WHERE hasToken(lower(msg), 'exception');

EXPLAIN indexes = 1
SELECT count() FROM logs WHERE hasToken(lower(msg), 'exception');
```

See observability examples and guidance on token vs ngram [here](/use-cases/observability/schema-design#bloom-filters-for-text-search).

## Add indexes during CREATE TABLE (multiple examples) {#add-indexes-during-create-table-multiple-examples}

Skipping indexes also support composite expressions and `Map`/`Tuple`/`Nested` types. This is demonstrated in the example below:

```sql
CREATE TABLE t
(
  u64 UInt64,
  s String,
  m Map(String, String),

  INDEX idx_bf u64 TYPE bloom_filter(0.01) GRANULARITY 3,
  INDEX idx_minmax u64 TYPE minmax GRANULARITY 1,
  INDEX idx_set u64 * length(s) TYPE set(1000) GRANULARITY 4,
  INDEX idx_ngram s TYPE ngrambf_v1(3, 10000, 3, 7) GRANULARITY 1,
  INDEX idx_token mapKeys(m) TYPE tokenbf_v1(10000, 7, 7) GRANULARITY 1
)
ENGINE = MergeTree
ORDER BY u64;
```

## Materializing on existing data and verifying {#materializing-on-existing-data-and-verifying}

You can add an index to existing data parts using `MATERIALIZE`, and inspect pruning with `EXPLAIN` or trace logs, as shown below:

```sql
ALTER TABLE t MATERIALIZE INDEX idx_bf;

EXPLAIN indexes = 1
SELECT count() FROM t WHERE u64 IN (123, 456);

-- Optional: detailed pruning info
SET send_logs_level = 'trace';
```

This [worked minmax example](/best-practices/use-data-skipping-indices-where-appropriate#example) demonstrates EXPLAIN output structure and pruning counts.

## When to use and when to avoid skipping indexes {#when-use-and-when-to-avoid}

**Use skip indexes when:**

* Filter values are sparse within data blocks  
* Strong correlation exists with `ORDER BY` columns or data ingestion patterns group similar values together  
* Performing text searches on large log datasets (`ngrambf_v1`/`tokenbf_v1` types)

**Avoid skip indexes when:**

* Most blocks likely contain at least one matching value (blocks will be read regardless)  
* Filtering on high-cardinality columns with no correlation to data ordering

:::note Important considerations
If a value appears even once in a data block, ClickHouse must read the entire block. Test indexes with realistic datasets and adjust granularity and type-specific parameters based on actual performance measurements.
:::

## Temporarily ignore or force indexes {#temporarily-ignore-or-force-indexes}

Disable specific indexes by name for individual queries during testing and troubleshooting. Settings also exist to force index usage when needed. See [`ignore_data_skipping_indices`](/operations/settings/settings#ignore_data_skipping_indices).

```sql
-- Ignore an index by name
SELECT * FROM logs
WHERE hasToken(lower(msg), 'exception')
SETTINGS ignore_data_skipping_indices = 'msg_token';
```

## Notes and caveats {#notes-and-caveats}

* Skipping indexes are only supported on [MergeTree-family tables](/engines/table-engines/mergetree-family/mergetree); pruning happens at the granule/block level.  
* Bloom-filter-based indexes are probabilistic (false positives cause extra reads but won't skip valid data).  
* Bloom filters and other skip indexes should be validated with `EXPLAIN` and tracing; adjust granularity to balance pruning vs. index size.

## Related docs {#related-docs}
- [Data skipping index guide](/optimize/skipping-indexes)
- [Best practices guide](/best-practices/use-data-skipping-indices-where-appropriate)
- [Manipulating data skipping indices](/sql-reference/statements/alter/skipping-index)
- [System table information](/operations/system-tables/data_skipping_indices)
