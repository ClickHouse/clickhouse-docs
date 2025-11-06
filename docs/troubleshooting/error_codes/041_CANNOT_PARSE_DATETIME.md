---
slug: /troubleshooting/error-codes/041_CANNOT_PARSE_DATETIME
sidebar_label: '041 CANNOT_PARSE_DATETIME'
doc_type: 'reference'
keywords: ['error codes', 'CANNOT_PARSE_DATETIME', '041', 'parseDateTime', 'timezone', 'format']
title: '041 CANNOT_PARSE_DATETIME'
description: 'ClickHouse error code - 041 CANNOT_PARSE_DATETIME'
---

# Error 41: CANNOT_PARSE_DATETIME

:::tip
This error occurs when ClickHouse cannot parse a string value as a DateTime. This typically happens with `parseDateTime()` or `parseDateTimeBestEffort()` functions when the date/time format doesn't match expectations, contains invalid values, or has incompatible timezone information.
:::

## Most common causes {#most-common-causes}

1. **Format string mismatch in parseDateTime()**
   - Format specifier doesn't match actual data format
   - Using wrong syntax variant (MySQL vs Joda)
   - Single-digit months/days with `%e` or `%c` format (MySQL syntax limitation)
   - Data missing required components (e.g., seconds in time string)
   - Literal characters in format don't match data

2. **ClickHouse 24.4-24.5 parseDateTime bugs (now fixed)**
   - Critical bug with `%F` (ISO 8601 date format)
   - Bug with `%D` (American MM/DD/YY format)
   - Bug with Joda `%E` format
   - Returned confusing error code 0 instead of proper error message
   - Fixed in 24.5.2+ and backported to relevant branches

3. **parseDateTimeBestEffort evaluation order issues**
   - Function evaluated before safety checks (notEmpty, IS NOT NULL)
   - WHERE clause conditions don't guarantee evaluation order
   - Empty strings or NULL values processed by parseDateTimeBestEffort
   - More common with new analyzer in 24.4+ versions

4. **Distributed table and analyzer interactions**
   - Query rewriting converts DateTime64 to string '0' incorrectly
   - Timezone precision mismatches in distributed queries
   - `report_time IN (toDateTime64(...))` fails with analyzer enabled
   - Epoch time (1970-01-01 00:00:00) conversion issues

5. **Timezone and format incompatibilities**
   - Missing seconds in ISO 8601 format (e.g., `2024-09-03T16:03Z` instead of `2024-09-03T16:03:00Z`)
   - Fractional seconds with timezone markers
   - Invalid or non-existent timezone transitions
   - 2-digit year formats requiring interpretation (1970-2070 range)

## What to do when you encounter this error {#what-to-do}

**1. Check your ClickHouse version**

```sql
SELECT version();

-- If using 24.4.x or 24.5.0-24.5.1, upgrade to 24.5.2+ or later
-- Critical parseDateTime bugs were fixed in these versions
```

**2. Examine the error message details**

The error typically indicates what failed to parse:

```text
Cannot read DateTime: neither Date nor Time was parsed successfully
Unable to parse fragment LITERAL from 2024 because literal / is expected
Cannot parse DateTime: while converting '0' to DateTime64(9, 'UTC')
```

**3. Test with sample data**

```sql
-- Test the problematic value
SELECT parseDateTime('your-datetime-value', '%Y-%m-%d %H:%M:%S');

-- Or use safe version
SELECT parseDateTimeOrNull('your-datetime-value', '%Y-%m-%d %H:%M:%S');

-- Test parseDateTimeBestEffort
SELECT parseDateTimeBestEffort('your-datetime-value');
```

**4. Check if analyzer is causing issues**

```sql
-- Try disabling the analyzer
SET allow_experimental_analyzer = 0;

-- Then run your query
```

## Quick fixes {#quick-fixes}

**1. Use safe parsing functions**

```sql
-- Instead of parseDateTimeBestEffort (throws on error):
SELECT parseDateTimeBestEffort(date_string) FROM table;

-- Use parseDateTimeBestEffortOrNull (returns NULL):
SELECT parseDateTimeBestEffortOrNull(date_string) FROM table;

-- Or parseDateTimeBestEffortOrZero (returns 1970-01-01):
SELECT parseDateTimeBestEffortOrZero(date_string) FROM table;
```

**2. Handle empty/NULL values before parsing**

```sql
-- ClickHouse doesn't guarantee WHERE clause evaluation order
-- Use CASE to ensure safety:
SELECT *
FROM table
WHERE CASE
    WHEN date_string IS NOT NULL AND date_string != ''
    THEN parseDateTimeBestEffortOrNull(date_string) > '2024-01-01'
    ELSE false
END;

-- Or use parseDateTimeBestEffortOrZero which handles empty strings:
SELECT *
FROM table
WHERE notEmpty(date_string) 
  AND parseDateTimeBestEffortOrZero(date_string) > '2024-01-01';
```

**3. Use correct format specifiers**

```sql
-- Common MySQL format patterns:
SELECT parseDateTime('2024-06-20 12:00:00', '%Y-%m-%d %H:%M:%S');
SELECT parseDateTime('06/20/2024', '%m/%d/%Y');  -- American date
SELECT parseDateTime('2024-06-20', '%Y-%m-%d');  -- Date only

-- For single-digit months/days, use Joda syntax instead:
-- This fails in MySQL syntax:
-- SELECT parseDateTime('9/3/2024', '%c/%e/%Y');

-- Use Joda syntax instead:
SELECT parseDateTimeInJodaSyntax('9/3/2024', 'M/d/yyyy');
```

**4. For distributed table issues - disable analyzer**

```sql
-- Workaround for distributed + DateTime64 + IN clause issues
SET allow_experimental_analyzer = 0;

-- Then run your query
SELECT *
FROM distributed_table
WHERE report_time IN (toDateTime64('1970-01-01 00:00:00', 9, 'UTC'));
```

**5. Fix incomplete ISO 8601 formats**

```sql
-- If your data is missing seconds:
-- Input: '2024-09-03T16:03Z'
-- Expected: '2024-09-03T16:03:00Z'

-- Option 1: Fix source data to include seconds

-- Option 2: Pre-process with string manipulation
SELECT parseDateTime(concat(substr(date_str, 1, 16), ':00Z'), '%Y-%m-%dT%H:%M:%SZ')
FROM table;

-- Option 3: Use parseDateTimeBestEffort (more flexible)
SELECT parseDateTimeBestEffort(date_str)
FROM table;
```

## Common specific scenarios {#common-scenarios}

**Scenario 1: parseDateTime broken in 24.5 with %F format**

```text
Code: 0. DB: while executing 'FUNCTION parseDateTime(formatDateTime(...), '%F %T')'. (OK)
```

**Cause:** Critical bug in ClickHouse 24.5.0-24.5.1 where `parseDateTime` with `%F`, `%D`, and Joda `%E` formats failed with error code 0.

**Solution:**
```sql
-- Upgrade to 24.5.2 or later (bug is fixed)

-- Temporary workaround - use explicit format:
-- Instead of %F (ISO 8601 short date):
SELECT parseDateTime('2024-06-20 1200', '%Y-%m-%d %H%M');

-- Or use parseDateTimeBestEffort:
SELECT parseDateTimeBestEffort('2024-06-20 1200', 'Europe/Paris');
```

**Scenario 2: parseDateTimeBestEffort with WHERE clause (analyzer issue)**

```text
Cannot read DateTime: neither Date nor Time was parsed successfully:
while executing 'FUNCTION parseDateTimeBestEffort(...)'
```

**Cause:** With new analyzer (24.4+), `parseDateTimeBestEffort` may be evaluated on empty/NULL values before WHERE conditions are checked. ClickHouse doesn't guarantee condition evaluation order.

**Solution:**
```sql
-- Option 1: Disable analyzer (temporary workaround)
SET allow_experimental_analyzer = 0;

-- Option 2: Use safe parsing function
SELECT *
FROM map_test
WHERE notEmpty(properties['somedate']) 
  AND parseDateTimeBestEffortOrZero(properties['somedate']) > '2022-06-15';

-- Option 3: Use CASE for guaranteed order
SELECT *
FROM map_test
WHERE CASE 
    WHEN notEmpty(properties['somedate'])
    THEN parseDateTimeBestEffortOrNull(properties['somedate']) > '2022-06-15'
    ELSE false
END;
```

**Reference:** [GitHub Issue #75296](https://github.com/ClickHouse/ClickHouse/issues/75296)

**Scenario 3: Single-digit month/day parsing with MySQL syntax**

```text
Code: 41. DB::Exception: Unable to parse fragment LITERAL from 2024 because literal / is expected but 2 provided
```

**Cause:** MySQL syntax `%e` (space-padded day) and `%c` (month 01-12) don't work correctly with single-digit values.

**Solution:**

```sql
-- Instead of MySQL syntax (fails):
SELECT parseDateTime('9/3/2024', '%c/%e/%Y');

-- Use Joda syntax (works):
SELECT parseDateTimeInJodaSyntax('9/3/2024', 'M/d/yyyy');

-- Or use parseDateTimeBestEffort:
SELECT parseDateTimeBestEffortUS('9/3/2024');  -- American format MM/DD/YYYY
```

**Scenario 4: Distributed table with DateTime64 IN clause**

```text
Code: 41. DB::Exception: Cannot parse DateTime: while converting '0' to DateTime64(9, 'UTC')
```

**Cause:** Query analyzer rewrites the query for distributed tables and incorrectly converts DateTime64 value to string '0' instead of proper format.

**Solution:**
```sql
-- Option 1: Disable analyzer
SET allow_experimental_analyzer = 0;

SELECT *
FROM distributed_table
WHERE report_time IN (toDateTime64('1970-01-01 00:00:00', 9, 'UTC'));

-- Option 2: Use equality instead of IN for single value
SELECT *
FROM distributed_table
WHERE report_time = toDateTime64('1970-01-01 00:00:00', 9, 'UTC');

-- Option 3: Use >= and <= instead
SELECT *
FROM distributed_table
WHERE report_time >= toDateTime64('1970-01-01 00:00:00', 9, 'UTC')
  AND report_time < toDateTime64('1970-01-02 00:00:00', 9, 'UTC');
```

**Scenario 5: ISO 8601 format missing seconds**

```text
could not parse 2024-09-03T16:03Z as a DateTime
```

**Cause:** ISO 8601 format requires seconds component. `2024-09-03T16:03Z` should be `2024-09-03T16:03:00Z`.

**Solution:**
```sql
-- Fix source data to include :00 for seconds

-- Or use parseDateTimeBestEffort (more flexible)
SELECT parseDateTimeBestEffort('2024-09-03T16:03Z');

-- Or pre-process to add seconds:
SELECT 
    if(
        date_str LIKE '%Z' AND length(date_str) = 17,
        concat(substr(date_str, 1, 16), ':00Z'),
        date_str
    ) AS fixed_date
FROM table;
```

## Prevention best practices {#prevention}

1. **Always use safe parsing functions in WHERE clauses**

   ```sql
   -- Prefer OrNull/OrZero variants
   WHERE parseDateTimeBestEffortOrNull(date_str) > '2024-01-01'
   
   -- Not: WHERE parseDateTimeBestEffort(date_str) > '2024-01-01'
   ```

2. **Use Joda syntax for flexible day/month parsing**

   ```sql
   -- For variable-length date components
   SELECT parseDateTimeInJodaSyntax('9/3/2024', 'M/d/yyyy');
   
   -- Instead of MySQL %e/%c which require padding
   ```

3. **Validate date formats before complex parsing**

   ```sql
   -- Check format first
   SELECT
       date_str,
       length(date_str) AS len,
       parseDateTimeOrNull(date_str, '%Y-%m-%d %H:%M:%S') AS parsed
   FROM table
   WHERE len >= 19;  -- YYYY-MM-DD HH:MM:SS is 19 chars
   ```

4. **Keep ClickHouse updated**

   ```sql
   -- Check version
   SELECT version();
   
   -- Upgrade from 24.4.x or 24.5.0-24.5.1 to avoid critical bugs
   -- These versions had significant parseDateTime issues
   ```

5. **Test with new analyzer disabled if issues arise**

   ```sql
   -- The new analyzer changes query rewriting behavior
   SET allow_experimental_analyzer = 0;
   
   -- Test if this resolves the issue
   -- Report bugs if only works with analyzer disabled
   ```

6. **Standardize datetime formats in source data**
   - Use consistent ISO 8601: `YYYY-MM-DD HH:MM:SS`
   - Always include seconds component
   - Use UTC or explicitly specify timezone
   - Avoid ambiguous formats (2-digit years, regional variants)

## Related settings {#related-settings}

```sql
-- Control analyzer behavior
SET allow_experimental_analyzer = 0;  -- Disable new analyzer

-- Timezone handling
SET session_timezone = 'UTC';  -- Set default timezone

-- Date/time parsing flexibility
SET date_time_input_format = 'best_effort';  -- More flexible parsing
```

## Format specifier reference {#format-specifiers}

**MySQL syntax (`parseDateTime`)**:
- `%Y` - 4-digit year (2024)
- `%m` - Month (01-12) zero-padded
- `%d` - Day (01-31) zero-padded
- `%H` - Hour 24h format (00-23)
- `%M` - Minute (00-59) - note: capital M!
- `%S` - Second (00-59)
- `%F` - ISO 8601 date (`%Y-%m-%d`)
- `%T` - ISO 8601 time (`%H:%M:%S`)
- `%D` - American date (`%m/%d/%y`)

**Joda syntax (`parseDateTimeInJodaSyntax`)**:
- `yyyy` - 4-digit year
- `M` - Month (1-12) no padding
- `d` - Day (1-31) no padding
- `HH` - Hour 24h format (00-23)
- `mm` - Minute (00-59)
- `ss` - Second (00-59)

**See also:** [ClickHouse parseDateTime documentation](https://clickhouse.com/docs/sql-reference/functions/type-conversion-functions#parsedatetime)

## When to use which function {#which-function}

| Function                          | Use Case                           | Error Handling     |
|-----------------------------------|------------------------------------|--------------------|
| `parseDateTime()`                 | Exact known format                 | Throws exception   |
| `parseDateTimeOrNull()`           | Exact format, allow failures       | Returns NULL       |
| `parseDateTimeBestEffort()`       | Unknown/variable formats           | Throws exception   |
| `parseDateTimeBestEffortOrNull()` | Unknown formats, allow failures    | Returns NULL       |
| `parseDateTimeBestEffortOrZero()` | Unknown formats, use default       | Returns 1970-01-01 |
| `parseDateTimeBestEffortUS()`     | American date formats (MM/DD/YYYY) | Throws exception   |
| `parseDateTimeInJodaSyntax()`     | Joda format, exact match           | Throws exception   |
