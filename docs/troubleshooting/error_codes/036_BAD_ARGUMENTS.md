---
slug: /troubleshooting/error-codes/036_BAD_ARGUMENTS
sidebar_label: '036 BAD_ARGUMENTS'
doc_type: 'reference'
keywords: ['error codes', 'BAD_ARGUMENTS', '036']
title: '036 BAD_ARGUMENTS'
description: 'ClickHouse error code - 036 BAD_ARGUMENTS'
---

# Error 36: BAD_ARGUMENTS

:::tip
This error occurs when a function or table function is called with an incorrect number of arguments or with arguments of incompatible types.
It typically indicates that parameters provided to a function don't match what the function expects.
:::
> 
## Most common causes {#most-common-causes}

1. **Wrong Number of Arguments**
    - Providing too many or too few arguments to a function
    - Misunderstanding function signature requirements (e.g., some functions expect arrays instead of multiple scalar arguments)
    - Table functions like `s3Cluster`, `file`, `url`, `mysql` receiving incorrect argument counts

2. **Incorrect Argument Types**
    - Passing a scalar value when an array is expected
    - Type mismatch between provided and expected parameters
    - Numeric types where strings are expected, or vice versa

3. **Function Signature Confusion**
    - Functions with overloaded signatures (accepting different argument counts)
    - Misreading documentation about optional vs required parameters
    - Using old syntax for functions that have been updated

4. **Table Function Argument Issues**
    - S3, file, URL, and remote table functions have specific argument order requirements
    - Missing required arguments like format or structure specifications
    - Extra arguments beyond what the function supports

## Common solutions {#common-solutions}

**1. Check Function Documentation**

Always verify the correct function signature in the ClickHouse [reference documentation](/sql-reference).
Pay attention to:
- Number of required vs optional arguments
- Argument types (scalars vs arrays)
- Argument order

**2. Use Arrays for Multi-Value Functions**

Many functions expect arrays rather than multiple scalar arguments:

```sql
-- WRONG: Multiple scalar arguments
SELECT multiSearchAny(text, 'ClickHouse', 'Clickhouse', 'clickHouse', 'clickhouse')

-- CORRECT: Array argument
SELECT multiSearchAny(text, ['ClickHouse', 'Clickhouse', 'clickHouse', 'clickhouse'])
```

**3. Verify Table Function Arguments**

For table functions, ensure you're providing arguments in the correct order:

```sql
-- S3Cluster with all parameters
SELECT * FROM s3Cluster(
    'cluster_name',    -- cluster
    'path',            -- URL/path
    'access_key',      -- credentials
    'secret_key',
    'format',          -- data format
    'structure',       -- column definition
    'compression'      -- optional
)
```

**4. Check for Missing Required Arguments**

Some functions have mandatory parameters that cannot be omitted:

```sql
-- WRONG: Missing required interval
SELECT tumble(now())

-- CORRECT: With required interval argument
SELECT tumble(now(), INTERVAL 1 HOUR)
```

**5. Use `DESCRIBE` or `EXPLAIN` to Validate**

Test your query structure before execution:

```sql
EXPLAIN SYNTAX
SELECT yourFunction(arg1, arg2);
```

**6. Review Error Message for Hints**

The error message often indicates what was expected:
```text
Number of arguments for function X doesn't match:
passed 5, should be 2
```

This tells you the function needs exactly 2 arguments, not 5.

## Common function-specific issues {#common-issues}

**Window Functions**
- `tumble()`, `hop()`, `tumbleStart()` require both timestamp and interval arguments
- Missing interval is a common mistake

**Search Functions**
- `multiSearchAny()`, `multiSearchAllPositions()` expect an array as the second argument
- Docs examples may sometimes show incorrect syntax

**Table Functions**
- `s3Cluster()` - Expects 1 to 6 arguments (varies by version)
- `generateRandom()` - Check structure specification
- Remote table functions - Verify connection parameters

## Prevention tips {#prevention-tips}

1. **Consult Documentation First**: Always check the official ClickHouse docs for function signatures
2. **Use IDE/Editor with ClickHouse Support**: Many editors can validate function calls
3. **Test in Development**: Validate queries in a non-production environment first
4. **Keep ClickHouse Updated**: Function signatures may change between versions
5. **Use `EXPLAIN` Queries**: Helps catch argument errors before execution

If you're experiencing this error:
1. Check the exact error message for what was passed vs what was expected
2. Review the function documentation for correct signature
3. Verify you're using arrays where required (not multiple scalar arguments)
4. Ensure all required arguments are provided in the correct order
5. Check if your ClickHouse version supports the function signature you're using