---
slug: /troubleshooting/error-codes/050_UNKNOWN_TYPE
sidebar_label: '050 UNKNOWN_TYPE'
doc_type: 'reference'
keywords: ['error codes', 'UNKNOWN_TYPE', '050']
title: '050 UNKNOWN_TYPE'
description: 'ClickHouse error code - 050 UNKNOWN_TYPE'
---

# Error 50: UNKNOWN_TYPE

:::tip
This error occurs when ClickHouse encounters an unrecognized data type name, typically due to typos in type names, missing required type parameters, using types not available in your ClickHouse version, or incorrect syntax in complex type definitions.
:::

## Most common causes {#most-common-causes}

1. **Misspelled or incorrect type names**
   - Typos in common type names (Int32 vs Int23, String vs Str)
   - Case sensitivity issues (string vs String)
   - Wrong type family (using PostgreSQL or MySQL type names)
   - Deprecated type names in newer versions

2. **Missing required type parameters**
   - FixedString without length specification
   - Decimal without precision and scale
   - DateTime64 without precision parameter
   - Enum without value definitions
   - LowCardinality wrapping undefined types

3. **Complex nested type syntax errors**
   - Invalid Array, Tuple, or Map type definitions
   - Incorrect nesting of parameterized types
   - Missing parentheses or brackets in complex types
   - Wrong separator usage (comma vs space)

4. **Version-specific type availability**
   - Using types introduced in newer ClickHouse versions e.g. `Time` or `Time64` data types
   - Types removed or renamed in version upgrades. e.g deprecated `Object` data type
   - Experimental types not available in your build

5. **Type inference failures**
   - Ambiguous `NULL` types in `INSERT` statements
   - Empty arrays without explicit type specification
   - Complex expressions where type cannot be determined
   - Type conflicts in `UNION` queries

## Common solutions {#common-solutions}

**1. Fix typos in type names**

```sql
-- Error: Unknown type 'Int23'
CREATE TABLE users (
    id Int23,
    name String
) ENGINE = MergeTree() ORDER BY id;

-- Solution: Use correct type name
CREATE TABLE users (
    id Int32,
    name String
) ENGINE = MergeTree() ORDER BY id;
```

**2. Add required type parameters**

```sql
-- Error: FixedString requires length parameter
CREATE TABLE products (
    sku FixedString,
    name String
) ENGINE = MergeTree() ORDER BY sku;

-- Solution: Specify length parameter
CREATE TABLE products (
    sku FixedString(20),
    name String
) ENGINE = MergeTree() ORDER BY sku;
```

**3. Specify Decimal precision and scale**

```sql
-- Error: Decimal requires precision and scale
CREATE TABLE prices (
    product_id UInt64,
    price Decimal
) ENGINE = MergeTree() ORDER BY product_id;

-- Solution: Add precision and scale parameters
CREATE TABLE prices (
    product_id UInt64,
    price Decimal(18, 2)  -- 18 total digits, 2 after decimal
) ENGINE = MergeTree() ORDER BY product_id;

-- Alternative: Use Decimal32, Decimal64, or Decimal128
CREATE TABLE prices (
    product_id UInt64,
    price Decimal64(2)  -- 2 decimal places, range up to 18 digits
) ENGINE = MergeTree() ORDER BY product_id;
```

**4. Fix complex nested type syntax**

```sql
-- Error: Invalid Array type syntax
CREATE TABLE events (
    user_id UInt64,
    tags Array String
) ENGINE = MergeTree() ORDER BY user_id;

-- Solution: Use parentheses for Array element type
CREATE TABLE events (
    user_id UInt64,
    tags Array(String)
) ENGINE = MergeTree() ORDER BY user_id;
```

**5. Correct Tuple and Map type definitions**

```sql
-- Error: Invalid Tuple syntax
CREATE TABLE coordinates (
    location_id UInt64,
    point Tuple Float64, Float64
) ENGINE = MergeTree() ORDER BY location_id;

-- Solution: Wrap Tuple types in parentheses
CREATE TABLE coordinates (
    location_id UInt64,
    point Tuple(Float64, Float64)
) ENGINE = MergeTree() ORDER BY location_id;

-- Error: Invalid Map syntax
CREATE TABLE attributes (
    item_id UInt64,
    properties Map String String
) ENGINE = MergeTree() ORDER BY item_id;

-- Solution: Separate key and value types with comma
CREATE TABLE attributes (
    item_id UInt64,
    properties Map(String, String)
) ENGINE = MergeTree() ORDER BY item_id;
```

**6. Specify DateTime64 precision**

```sql
-- Error: DateTime64 requires precision parameter
CREATE TABLE logs (
    timestamp DateTime64,
    message String
) ENGINE = MergeTree() ORDER BY timestamp;

-- Solution: Add precision (3 for milliseconds, 6 for microseconds)
CREATE TABLE logs (
    timestamp DateTime64(3),  -- millisecond precision
    message String
) ENGINE = MergeTree() ORDER BY timestamp;

-- With timezone
CREATE TABLE logs (
    timestamp DateTime64(3, 'UTC'),
    message String
) ENGINE = MergeTree() ORDER BY timestamp;
```

**7. Enable experimental types**

```sql
-- Error: Object type not recognized
CREATE TABLE json_data (
    id UInt64,
    data Object('json')
) ENGINE = MergeTree() ORDER BY id;

-- Solution: Enable experimental Object type
SET allow_experimental_object_type = 1;

CREATE TABLE json_data (
    id UInt64,
    data Object('json')
) ENGINE = MergeTree() ORDER BY id;
```

**8. Fix Enum definitions**

```sql
-- Error: Enum requires value definitions
CREATE TABLE orders (
    order_id UInt64,
    status Enum
) ENGINE = MergeTree() ORDER BY order_id;

-- Solution: Define Enum values
CREATE TABLE orders (
    order_id UInt64,
    status Enum8('pending' = 1, 'processing' = 2, 'completed' = 3, 'cancelled' = 4)
) ENGINE = MergeTree() ORDER BY order_id;

-- Or use Enum16 for more values
CREATE TABLE orders (
    order_id UInt64,
    status Enum16('pending' = 1, 'processing' = 2, 'completed' = 3, 'cancelled' = 4)
) ENGINE = MergeTree() ORDER BY order_id;
```

**9. Specify types for Nullable and LowCardinality**

```sql
-- Error: Nullable/LowCardinality requires base type
CREATE TABLE data (
    id UInt64,
    category LowCardinality,
    optional Nullable
) ENGINE = MergeTree() ORDER BY id;

-- Solution: Wrap valid base types
CREATE TABLE data (
    id UInt64,
    category LowCardinality(String),
    optional Nullable(String)
) ENGINE = MergeTree() ORDER BY id;
```

**10. Use correct nested type syntax**

```sql
-- Error: Invalid nested Array syntax
CREATE TABLE matrix (
    id UInt64,
    data Array[Array[Int32]]
) ENGINE = MergeTree() ORDER BY id;

-- Solution: Use parentheses consistently
CREATE TABLE matrix (
    id UInt64,
    data Array(Array(Int32))
) ENGINE = MergeTree() ORDER BY id;
```

**11. Explicit type casting in queries**

```sql
-- Error: Type cannot be inferred from empty array
INSERT INTO events (user_id, tags) VALUES (1, []);

-- Solution: Cast to specific type
INSERT INTO events (user_id, tags) VALUES (1, CAST([] AS Array(String)));

-- Or specify in SELECT
INSERT INTO events (user_id, tags)
SELECT 1, [] :: Array(String);
```

## Prevention tips {#prevention-tips}

1. **Reference official documentation for type names**: Always check the ClickHouse documentation for exact type names and syntax, as type names are case-sensitive and must match exactly (e.g., `String` not `string`)
2. **Use type parameters consistently**: For parameterized types (FixedString, Decimal, DateTime64, Enum), always include required parameters and verify syntax in documentation before creating tables
3. **Test complex types incrementally**: When building complex nested types (Array of Tuples, Maps with complex values), test simpler versions first and add complexity gradually
4. **Validate type compatibility with ClickHouse version**: Before using newer data types, verify they're available in your ClickHouse version by checking release notes or testing in development first
5. **Use explicit type casting**: When dealing with `NULL`s, empty arrays, or ambiguous expressions, use explicit `CAST()` or `::` syntax to specify exact types
6. **Enable required experimental settings in session**: If using experimental types (Object, JSON, Variant), enable necessary settings at the session level and document these requirements for production
7. **Maintain type consistency across schema**: When creating related tables or views, ensure type definitions match exactly to avoid type inference issues in JOINs and UNION operations
8. **Use schema inference carefully**: When using table functions (s3, url, file), explicitly specify types instead of relying on inference to avoid UNKNOWN_TYPE errors from ambiguous data

## Related error codes {#related-error-codes}

- [ILLEGAL_TYPE_OF_ARGUMENT (43)](/troubleshooting/errors/ILLEGAL_TYPE_OF_ARGUMENT) - Wrong type used for function argument
- [CANNOT_CONVERT_TYPE (70)](/troubleshooting/errors/CANNOT_CONVERT_TYPE) - Type conversion not possible
- [TYPE_MISMATCH (386)](/troubleshooting/errors/TYPE_MISMATCH) - Types don't match in operation
- [UNKNOWN_IDENTIFIER (47)](/troubleshooting/errors/UNKNOWN_IDENTIFIER) - Column or identifier not found