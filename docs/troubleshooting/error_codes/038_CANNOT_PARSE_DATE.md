---
slug: /troubleshooting/error-codes/038_CANNOT_PARSE_DATE
sidebar_label: '038 CANNOT_PARSE_DATE'
doc_type: 'reference'
keywords: ['error codes', 'CANNOT_PARSE_DATE', '038', 'date', 'parsing', 'format', 'toDate', 'DateTime']
title: '038 CANNOT_PARSE_DATE'
description: 'ClickHouse error code - 038 CANNOT_PARSE_DATE'
---

# Error 38: CANNOT_PARSE_DATE

:::tip
This error occurs when ClickHouse cannot parse a string value as a Date.
This typically happens when the date string format doesn't match the expected format, contains invalid values, or is too short/malformed.
:::

## Most common causes {#most-common-causes}

1. **Invalid date format or structure**
   - Date string too short (e.g., missing day or month)
   - Wrong date format (DD/MM/YYYY vs YYYY-MM-DD)
   - Missing separators or wrong separators
   - Empty strings in date columns
   - Non-standard date representations

2. **Invalid date component values**
   - Month value out of range (e.g., month 16)
   - Day value out of range (e.g., day 40)
   - Year outside supported range (Date: 1970-2149, Date32: 1900-2299)
   - February 30th or other impossible dates
   - Note: ClickHouse may return `1970-01-01` instead of error for some invalid values

3. **Using wrong parsing function**
   - Using `toDate()` when you need `parseDateTime()` with format string
   - Using MySQL format specifiers without proper function
   - Not using timezone parameter when needed
   - Wrong syntax variant (MySQL vs Joda)

4. **Format string issues in parseDateTime()**
   - Format string doesn't match actual data format
   - Using `%e` for single-digit days (requires padding)
   - Using `%D` (American date format MM/DD/YY) with wrong year interpretation
   - Using `%F` (ISO 8601 date) when seconds are missing
   - Bugs in specific format specifiers (fixed in recent versions)

5. **Data import mismatches**
   - CSV/JSON files with inconsistent date formats
   - ClickPipes parsing dates in unrecognized format
   - Source data has mixed date formats
   - Timezone information missing from timestamps

## What to do when you encounter this error {#what-to-do}

**1. Check the error message for details**

The error message usually indicates what went wrong:

```
Cannot parse date: value is too short: Cannot parse Date from String
Cannot parse string '2021-hi-10' as Date: syntax error at position 9
Value is too short
```

**2. Examine the problematic data**

```sql
-- Find rows that can't be parsed
SELECT date_string
FROM your_table
WHERE toDateOrNull(date_string) IS NULL
LIMIT 100;

-- Check string lengths
SELECT 
    date_string,
    length(date_string) AS len
FROM your_table
WHERE length(date_string) < 10  -- YYYY-MM-DD is 10 chars
LIMIT 100;
```

**3. Test parsing with sample data**

```sql
-- Test with actual value from error message
SELECT toDate('your-date-value');

-- Or use safe version
SELECT toDateOrNull('your-date-value');
```

**4. Check your ClickHouse version**

```sql
SELECT version();

-- Some parseDateTime bugs existed in 24.5 and were fixed
-- Check if upgrading helps
```

## Quick fixes {#quick-fixes}

**1. Use safe parsing functions**

```sql
-- Instead of toDate() which throws errors:
SELECT toDate(date_string) FROM table;

-- Use toDateOrNull() which returns NULL for invalid dates:
SELECT toDateOrNull(date_string) FROM table;

-- Or toDateOrZero() which returns 1970-01-01:
SELECT toDateOrZero(date_string) FROM table;
```

**2. Use `parseDateTimeBestEffort` for flexible parsing**

```sql
-- Automatically handles many date formats
SELECT parseDateTimeBestEffort('2/20/2004');  -- DD/MM/YYYY format
SELECT parseDateTimeBestEffortUS('2/3/2004'); -- MM/DD/YYYY format

-- With timezone
SELECT parseDateTimeBestEffort('2024-06-20 1200', 'Europe/Paris');

-- Convert to Date
SELECT toDate(parseDateTimeBestEffort('2/20/2004'));
```

**3. Use `parseDateTime` with explicit format**

```sql
-- Specify exact format (MySQL syntax)
SELECT parseDateTime('2024-06-20 1200', '%Y-%m-%d %H%M');

-- Common format patterns:
-- '%Y-%m-%d' for YYYY-MM-DD
-- '%Y-%m-%d %H:%M:%S' for YYYY-MM-DD HH:MM:SS
-- '%d/%m/%Y' for DD/MM/YYYY
-- '%m/%d/%Y' for MM/DD/YYYY (American)
```

**4. Use Joda syntax for complex formats**

```sql
-- For single-digit months/days
SELECT parseDateTimeInJodaSyntax('9/3/2024', 'M/d/YYYY');

-- Instead of problematic MySQL %e:
-- This fails:
-- SELECT parseDateTime('9/3/2024', '%c/%e/%Y');

-- This works:
SELECT parseDateTimeInJodaSyntax('9/3/2024', 'M/d/yyyy');
```

**5. Handle empty or invalid values in data**

```sql
-- Use CASE to handle empty strings
SELECT 
    CASE 
        WHEN date_string = '' THEN NULL
        ELSE toDateOrNull(date_string)
    END AS parsed_date
FROM your_table;

-- Or use coalesce with default
SELECT coalesce(toDateOrNull(date_string), '1970-01-01') AS parsed_date
FROM your_table;
```

## Common specific scenarios {#common-scenarios}

**Scenario 1: Value too short error**

```
Cannot parse date: value is too short: Cannot parse Date from String
```

**Cause:** Date string is missing components (e.g., "2024-06" instead of "2024-06-20").

**Solution:**

```sql
-- Instead of direct cast:
SELECT cast(release_date as Date) FROM movies;

-- Use safe conversion:
SELECT toDateOrNull(release_date) FROM movies;

-- Filter out short values first:
SELECT toDate(release_date)
FROM movies
WHERE length(release_date) >= 10;

-- Or pad/default short values:
SELECT 
    if(length(release_date) >= 10, 
       toDate(release_date), 
       NULL
    ) AS date
FROM movies;
```

**Scenario 2: parseDateTime broken with %F format (version 24.5 bug)**

```
Code: 0. DB::Exception: while executing 'FUNCTION parseDateTime(formatDateTime(...), '%F %T')'. (OK)
```

**Cause:** Bug in ClickHouse 24.5 where `parseDateTime` with `%F` (ISO 8601 date), `%D` (American date), and Joda `%E` formats failed with confusing error code 0.

**Solution:**

```sql
-- Upgrade to 24.5.2 or later where this is fixed

-- Temporary workaround - use different format specifier:
-- Instead of %F:
SELECT parseDateTime('2024-06-20 1200', '%Y-%m-%d %H%M');

-- Or use parseDateTimeBestEffort:
SELECT parseDateTimeBestEffort('2024-06-20 1200', 'Europe/Paris');
```

**Scenario 3: Single-digit months/days with %e format**

```
Code: 41. DB::Exception: Unable to parse fragment LITERAL from 2024 because literal / is expected but 2 provided
```

**Cause:** Using `%e` (day with leading space) or `%c` (month) with single-digit values doesn't work correctly in MySQL syntax.

**Solution:**

```sql
-- Instead of MySQL syntax (fails):
SELECT parseDateTime('9/3/2024', '%c/%e/%Y');

-- Use Joda syntax (works):
SELECT parseDateTimeInJodaSyntax('9/3/2024', 'M/d/yyyy');

-- Or use parseDateTimeBestEffort:
SELECT parseDateTimeBestEffortUS('9/3/2024');  -- American format
```

**Scenario 4: ClickPipes date format not recognized**

```
could not parse 2024-09-03T16:03Z as a DateTime
```

**Cause:** Date format missing seconds component (should be `2024-09-03T16:03:00Z`).

**Solution:**
- Fix source data to include seconds in ISO 8601 format
- Use a materialized column to parse with custom logic
- Pre-process data before sending to ClickPipes
