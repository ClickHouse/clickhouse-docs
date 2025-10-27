---
slug: /troubleshooting/error-codes/121_UNSUPPORTED_JOIN_KEYS  
sidebar_label: '121 UNSUPPORTED_JOIN_KEYS'
doc_type: 'reference'
keywords: ['error codes', 'UNSUPPORTED_JOIN_KEYS', '121', 'Join engine', 'StorageJoin', 'composite keys']
title: '121 UNSUPPORTED_JOIN_KEYS'
description: 'ClickHouse error code - 121 UNSUPPORTED_JOIN_KEYS'
---

# Error 121: UNSUPPORTED_JOIN_KEYS

:::tip
This error occurs when using the Join table engine (StorageJoin) with unsupported join key types or configurations.
The Join engine has specific limitations on which key types it supports, especially with complex or composite keys.
:::

## Most common causes {#most-common-causes}

1. **Composite keys (multiple join columns)**
   - Using multiple columns as join keys in StorageJoin
   - Complex key types like `keys128`, `keys256` not supported in certain contexts
   - Broke in ClickHouse 23.9-23.12, worked in 23.8 and earlier
   - Fixed with new analyzer enabled by default in 24.3+

2. **Specific data type combinations**
   - UUID columns in Join tables (keys128 type)
   - String + Date32 composite keys
   - Large composite keys (3+ columns creating keys256 type)
   - Mixed type keys that create unsupported hash types

3. **Version-specific issues**
   - Regression introduced in ClickHouse 23.9
   - Affects versions 23.10-23.12 with old query interpreter
   - Works with new analyzer (`allow_experimental_analyzer = 1`)
   - Fully fixed in ClickHouse 24.3+ where analyzer is default

4. **SELECT from StorageJoin with complex keys**
   - `SELECT * FROM join_table` fails with composite keys
   - StorageJoin doesn't store keys themselves, only hashed values
   - Can't retrieve original key values when they're hashed together
   - `joinGet()` function works even when SELECT doesn't

5. **Parallel replicas with StorageJoin**
   - Using parallel replicas with Join engine tables
   - Combination of certain key types and parallel execution
   - Affects ClickHouse 25.1+

## What to do when you encounter this error {#what-to-do}

**1. Check the error message for key type**

The error indicates which key type is unsupported:

```text
Unsupported JOIN keys in StorageJoin. Type: 8
Unsupported JOIN keys of type keys128 in StorageJoin
Unsupported JOIN keys of type keys256 in StorageJoin
Unsupported JOIN keys of type hashed in StorageJoin
```

**2. Check your ClickHouse version**

```sql
SELECT version();

-- If on 23.9-23.12, consider upgrading to 24.3+
-- Or enable new analyzer if available
```

**3. Check your Join table definition**

```sql
SHOW CREATE TABLE your_join_table;

-- Look at ENGINE = Join(...) clause
-- Count how many key columns are specified
```

**4. Test with the new analyzer (if on 23.9-24.2)**

```sql
SET allow_experimental_analyzer = 1;

-- Then retry your query
```

## Quick fixes {#quick-fixes}

**1. Upgrade to ClickHouse 24.3 or later**

The new analyzer is enabled by default in 24.3+ and resolves most StorageJoin issues with composite keys.

**2. Enable new analyzer (versions 23.9-24.2)**

```sql
-- Enable for session
SET allow_experimental_analyzer = 1;

-- Then run your queries
SELECT *
FROM main_table
LEFT JOIN join_table USING (key1, key2);
```

**3. Reduce to single join key**

```sql
-- Instead of multiple columns:
CREATE TABLE join_table (
    key1 Int32,
    key2 Int32,
    value String
) ENGINE = Join(ALL, LEFT, key1, key2);  -- Multiple keys may fail

-- Use single composite key:
CREATE TABLE join_table (
    composite_key String,  -- Combine keys: toString(key1) || '_' || toString(key2)
    value String
) ENGINE = Join(ALL, LEFT, composite_key);  -- Single key works

-- Then join with:
SELECT *
FROM main_table
LEFT JOIN join_table ON concat(toString(main_table.key1), '_', toString(main_table.key2)) = join_table.composite_key;
```

**4. Use Dictionary instead of Join engine**

```sql
-- Instead of Join table:
-- CREATE TABLE lookup_join (...) ENGINE = Join(...);

-- Use Dictionary:
CREATE DICTIONARY lookup_dict
(
    key1 Int32,
    key2 Date32,
    value String
)
PRIMARY KEY key1, key2
SOURCE(CLICKHOUSE(
    HOST 'localhost'
    PORT 9000
    TABLE 'source_table'
    DB 'default'
))
LIFETIME(MIN 300 MAX 360)
LAYOUT(COMPLEX_KEY_HASHED());

-- Then use dictGet instead of JOIN:
SELECT
    *,
    dictGet('lookup_dict', 'value', (key1, key2)) AS value
FROM main_table;
```

**5. Use regular MergeTree table**

```sql
-- Instead of Join engine, use regular table:
CREATE TABLE join_data (
    key1 Int32,
    key2 Int32,
    value String
) ENGINE = MergeTree
ORDER BY (key1, key2);

-- Then use normal JOIN (not StorageJoin):
SELECT *
FROM main_table
LEFT JOIN join_data ON 
    main_table.key1 = join_data.key1 AND 
    main_table.key2 = join_data.key2;
```

## Common specific scenarios {#common-scenarios}

**Scenario 1: Multiple join columns broke in 23.10-23.12**

```text
Code: 121. DB::Exception: Unsupported JOIN keys in StorageJoin. Type: 8
```

**Cause:** Regression in ClickHouse 23.9-23.12 where multiple join columns stopped working with StorageJoin when using the old query interpreter.

**Solution:**
```sql
-- Option 1: Upgrade to 24.3+ (recommended)
-- New analyzer is default and fixes this

-- Option 2: Enable new analyzer (23.9-24.2)
SET allow_experimental_analyzer = 1;

SELECT
    segmented_ctr_cache.product_id,
    segmented_ctr_cache.segment_id,
    count_in_cart
FROM segmented_ctr_cache
LEFT JOIN cart_join ON
    cart_join.product_id = segmented_ctr_cache.product_id
    AND cart_join.segment_id = segmented_ctr_cache.segment_id;

-- Option 3: Downgrade join to single key temporarily
-- Use only one join column until you can upgrade
```

**Scenario 2: UUID keys (keys128) with StorageJoin**

```text
Code: 121. DB::Exception: Unsupported JOIN keys of type keys128 in StorageJoin
```

**Cause:** UUID data type creates a keys128 hash type which isn't supported in certain StorageJoin contexts, particularly with parallel replicas or specific ClickHouse versions (25.1+).

**Solution:**
```sql
-- Convert UUID to String for join key:
CREATE TABLE joint
(
    id String,  -- Instead of UUID
    value LowCardinality(String)
) ENGINE = Join(ANY, LEFT, id);

-- Insert with conversion:
INSERT INTO joint 
SELECT toString(id) AS id, value 
FROM source_table;

-- Join with conversion:
SELECT *
FROM main_table
LEFT JOIN joint ON toString(main_table.id) = joint.id;
```

**Scenario 3: Three or more join keys (keys256)**

```text
Code: 121. DB::Exception: Unsupported JOIN keys of type keys256 in StorageJoin
```

**Cause:** Three or more join columns create a keys256 hash type which isn't supported by StorageJoin in some configurations.

**Solution:**
```sql
-- Instead of:
CREATE TABLE tj (
    key1 UInt64, 
    key2 UInt64, 
    key3 UInt64, 
    attr UInt64
) ENGINE = Join(ALL, INNER, key3, key2, key1);

-- Option 1: Combine into single key
CREATE TABLE tj (
    combined_key String,  -- Format: "key1:key2:key3"
    attr UInt64
) ENGINE = Join(ALL, INNER, combined_key);

INSERT INTO tj
SELECT 
    concat(toString(key1), ':', toString(key2), ':', toString(key3)) AS combined_key,
    attr
FROM source;

-- Option 2: Use Dictionary for complex keys
CREATE DICTIONARY tj_dict
(
    key1 UInt64,
    key2 UInt64,
    key3 UInt64,
    attr UInt64
)
PRIMARY KEY key1, key2, key3
SOURCE(CLICKHOUSE(...))
LAYOUT(COMPLEX_KEY_HASHED());
```

**Scenario 4: String + Date32 composite keys (version 25.6)**

```text
Code: 121. DB::Exception: Unsupported JOIN keys of type hashed in StorageJoin
```

**Cause:** Mixed types like String + Date32 as composite keys can create unsupported hash types, especially in mutations (ALTER TABLE UPDATE) or INSERT operations. Worked in earlier versions but broke in 25.6.

**Solution:**
```sql
-- Option 1: Convert all keys to same type (String)
CREATE TABLE join_table (
    loan_identifier String,
    mrp String,  -- Convert Date32 to String: toString(date_column)
    value Int32
) ENGINE = Join(ANY, LEFT, loan_identifier, mrp);

INSERT INTO join_table
SELECT 
    loan_identifier,
    toString(monthly_reporting_period) AS mrp,
    value
FROM source;

-- Option 2: Use Dictionary (recommended for complex scenarios)
CREATE DICTIONARY join_dict
(
    loan_identifier String,
    mrp Date32,
    value Int32
)
PRIMARY KEY loan_identifier, mrp
SOURCE(CLICKHOUSE(TABLE 'source_table'))
LAYOUT(COMPLEX_KEY_HASHED());

-- Use dictGet instead of JOIN:
ALTER TABLE target_table
UPDATE column = dictGet('join_dict', 'value', (loan_identifier, monthly_reporting_period))
WHERE true;
```

**Scenario 5: SELECT from StorageJoin with composite keys**

```text
Code: 121. DB::Exception: Unsupported JOIN keys in StorageJoin. Type: 11
```

**Cause:** `SELECT * FROM join_table` doesn't work with composite keys because StorageJoin doesn't store the original keys - only the hashed values. However, `joinGet()` still works.

**Solution:**
```sql
-- SELECT directly fails with composite keys:
-- SELECT * FROM join_table;  -- ERROR

-- But joinGet works:
SELECT joinGet('join_table', 'value', toUInt64(1), '32');  -- OK

-- Workaround: Use source table for SELECT:
-- Keep a copy in regular MergeTree:
CREATE TABLE join_data (
    key1 UInt64,
    key2 String,
    value String
) ENGINE = MergeTree
ORDER BY (key1, key2);

CREATE MATERIALIZED VIEW join_table 
ENGINE = Join(ANY, LEFT, key1, key2)
AS SELECT * FROM join_data;

-- Now you can SELECT from join_data:
SELECT * FROM join_data WHERE key1 = 1;
```

## Prevention best practices {#prevention}

1. **Use ClickHouse 24.3 or later**
   - New analyzer is enabled by default
   - Most StorageJoin composite key issues are resolved
   - Better query rewriting and optimization

2. **Prefer Dictionaries for lookup tables**
   ```sql
   -- Instead of Join engine:
   ENGINE = Join(ANY, LEFT, key1, key2)
   
   -- Use Dictionary:
   LAYOUT(COMPLEX_KEY_HASHED())
   ```
   Dictionaries support complex keys better and have more features

3. **Limit join keys to single column when possible**
   - Create composite key string instead of multiple columns
   - Simpler, more compatible, works across all versions
   - Example: `concat(toString(key1), ':', toString(key2))`

4. **Use consistent key types**
   - Don't mix String and Date/DateTime
   - Convert all keys to same type (usually String)
   - Avoid UUID directly - convert to String

5. **Test after upgrades**
   ```sql
   -- After upgrading ClickHouse, test Join tables:
   SELECT * FROM your_join_table LIMIT 10;
   
   -- Test actual joins:
   SELECT * FROM main LEFT JOIN your_join_table USING (keys) LIMIT 10;
   ```

6. **Monitor for regressions**
   - ClickHouse 23.9-23.12 had regressions
   - Check release notes for Join engine changes
   - Test in staging before production upgrades

## When to use Join engine vs alternatives {#when-to-use}

**Use Join engine when:**
- Single join key (simple types: Int, String)
- Small dimension table (fits in RAM)
- Very frequent joins on same table
- Using ClickHouse 24.3+

**Use Dictionary when:**
- Complex composite keys (2+ columns)
- Need key-value lookup functionality
- Want automatic cache updates
- More control over memory and refresh

**Use regular MergeTree when:**
- Large tables that don't fit in RAM
- Infrequent joins
- Need flexibility in query patterns
- Complex join conditions

## Related settings {#related-settings}

```sql
-- Enable new analyzer (23.9-24.2)
SET allow_experimental_analyzer = 1;

-- Check current analyzer status (24.3+)
SELECT value FROM system.settings WHERE name = 'allow_experimental_analyzer';
```
