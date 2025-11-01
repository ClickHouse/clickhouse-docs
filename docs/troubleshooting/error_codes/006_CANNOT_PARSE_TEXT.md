---
slug: /troubleshooting/error-codes/006_CANNOT_PARSE_TEXT
sidebar_label: '006 CANNOT_PARSE_TEXT'
doc_type: 'reference'
keywords: ['error codes', 'CANNOT_PARSE_TEXT', '006', 'parse', 'CSV', 'TSV', 'JSON', 'format']
title: '006 CANNOT_PARSE_TEXT'
description: 'ClickHouse error code - 006 CANNOT_PARSE_TEXT'
---

# Error 6: CANNOT_PARSE_TEXT

:::tip
This error occurs when ClickHouse cannot parse text data according to the expected format.
This typically happens during data imports from CSV, TSV, JSON, or other text-based formats when the data doesn't match the expected schema or contains malformed values.
:::

## Most common causes {#most-common-causes}

1. **Incorrect format specification**
   - Using CSV format for tab-delimited files (should use TSV)
   - Format mismatch between actual data and declared format
   - Wrong delimiter character specified
   - Missing or incorrect escape characters

2. **Malformed CSV/TSV data**
   - Missing delimiters (commas or tabs)
   - Unescaped special characters in string fields
   - Quotes not properly closed or escaped
   - Embedded newlines without proper escaping
   - Extra or missing columns compared to table schema

3. **Data type mismatches**
   - String data in numeric columns
   - Invalid date/datetime formats
   - Values exceeding type boundaries (e.g., too large for Int32)
   - Empty strings where numbers are expected
   - Special characters in numeric fields

4. **Character encoding issues**
   - UTF-8 encoding errors
   - Byte order marks (BOM) at file beginning
   - Invalid characters in string fields
   - Mixed character encodings in the same file

5. **Inconsistent data structure**
   - Variable number of columns per row
   - Headers don't match data rows
   - Schema inference fails with complex nested data
   - Mixed data formats within same column

## What to do when you encounter this error {#what-to-do}

**1. Check the error message for specific details**

The error message typically indicates:
- Which row failed
- Which column had the problem
- What was expected vs. what was found
- The actual parsed text that failed

```text
Cannot parse input: expected ',' before: 'some_text': (at row 429980)
Row 429979: Column 8, name: blockspending, type: Int32, ERROR: text "<TAB><TAB>7027<TAB>181" is not like Int32
```

**2. Verify the actual file format**

```bash
# Check first few lines of your file
head -n 5 your_file.csv

# Check for tabs vs commas
cat your_file.csv | head -n 1 | od -c

# Check character encoding
file -i your_file.csv
```

**3. Test with a small sample**

```sql
-- Try parsing just the first few rows
SELECT * 
FROM file('sample.csv', 'CSV')
LIMIT 10;

-- Let ClickHouse infer the schema
DESCRIBE file('sample.csv', 'CSV');
```

**4. Check logs for more details**

```sql
SELECT
    event_time,
    query,
    exception
FROM system.query_log
WHERE exception_code = 6
  AND event_time > now() - INTERVAL 1 HOUR
ORDER BY event_time DESC
LIMIT 5;
```

## Quick fixes {#quick-fixes}

**1. Use correct format for your data**

```sql
-- For tab-delimited files
INSERT INTO table FROM INFILE 'file.tsv' FORMAT TSV;
-- Or
INSERT INTO table FROM INFILE 'file.tsv' FORMAT TSVWithNames;

-- For comma-delimited files
INSERT INTO table FROM INFILE 'file.csv' FORMAT CSV;
-- Or
INSERT INTO table FROM INFILE 'file.csv' FORMAT CSVWithNames;
```

**2. Skip malformed rows**

```sql
-- Skip specific number of bad rows
INSERT INTO table 
SELECT * FROM file('data.csv', 'CSV')
SETTINGS input_format_allow_errors_num = 100;

-- Skip percentage of bad rows
INSERT INTO table 
SELECT * FROM file('data.csv', 'CSV')
SETTINGS input_format_allow_errors_ratio = 0.1;  -- Allow 10% errors
```

**3. Handle NULL values correctly**

```sql
-- Treat empty fields as default values
SET input_format_null_as_default = 1;

-- For CSV specifically
SET input_format_csv_empty_as_default = 1;

-- Allow missing fields
SET input_format_skip_unknown_fields = 1;
```

**4. Use custom delimiters for tab-delimited CSV**

```sql
-- For tab-delimited data with CSV quoting
SET format_custom_escaping_rule = 'CSV';
SET format_custom_field_delimiter = '\x09';  -- Tab character

INSERT INTO table FROM INFILE 'data.tsv' FORMAT CustomSeparated;
```

**5. Specify schema explicitly**

```sql
-- Instead of relying on schema inference
SELECT * FROM file(
    'data.csv',
    'CSV',
    'id UInt64, name String, date Date, value Float64'
);
```

## Common specific scenarios {#common-scenarios}

**Scenario 1: CSV expected comma but found tab**

```text
Cannot parse input: expected ',' before: '<TAB><TAB>7027<TAB>181'
```

**Cause:** File is actually tab-delimited (TSV) but being read as CSV.

**Solution:**
```sql
-- Use TSV format instead
INSERT INTO table FROM INFILE 'file.tsv' FORMAT TSVWithNames;

-- Or if you must use CSV-style quoting with tabs
SET format_custom_escaping_rule = 'CSV';
SET format_custom_field_delimiter = '\x09';
INSERT INTO table FROM INFILE 'file.tsv' FORMAT CustomSeparated;
```

**Scenario 2: Malformed string with embedded delimiters**

```text
Cannot parse input: expected '\t' before: 'I49d(I\""\t\t\t13\t1350000'
```

**Cause:** String field contains delimiter characters (tabs, commas) and special characters that aren't properly escaped or quoted.

**Solution:**
```sql
-- Use CSV-style escaping for tab-delimited data
SET format_custom_escaping_rule = 'CSV';
SET format_custom_field_delimiter = '\x09';

-- Allow errors in problematic rows
SET input_format_allow_errors_num = 100;

INSERT INTO table FROM INFILE 'file.tsv' FORMAT CustomSeparated;
```

**Scenario 3: Syntax error at unexpected position**

```text
Syntax error: failed at position 1 ('85c59771') (line 1, col 1): 85c59771-ae5d-4a53-9eed...
```

**Cause:** Wrong format specified - file is TSV but being read as CSV.

**Solution:**
```sql
-- Check actual delimiter in file
-- If you see wide spacing, it's likely tabs not commas

-- Use TSV instead of CSV
SELECT * FROM file('data.tsv', 'TSVWithNames');
```

**Scenario 4: Cannot parse decimal type from Parquet**

```text
Cannot parse type Decimal(76, 38), expected non-empty binary data with size equal to or less than 32, got 36
```

**Cause:** Decimal precision in Parquet file exceeds ClickHouse maximum (Decimal256 max precision is 76, but internal representation limits apply).

**Solution:**
```sql
-- Read as String first, then convert
SELECT
    CAST(decimal_col AS Decimal(38, 10)) AS decimal_col
FROM file('data.parquet', 'Parquet', 'decimal_col String, ...');

-- Or use Double for very large values
SELECT
    toFloat64(decimal_col) AS decimal_col  
FROM file('data.parquet', 'Parquet', 'decimal_col String, ...');
```

**Scenario 5: Schema inference fails on complex data**

```text
The table structure cannot be extracted from a JSONEachRow format file
```

**Cause:** File is empty, inaccessible, or schema inference can't determine structure from sample.

**Solution:**
```sql
-- Increase bytes read for schema inference
SET input_format_max_bytes_to_read_for_schema_inference = 999999999;

-- Or specify schema manually
SELECT * FROM s3(
    'https://bucket/file.json',
    'JSONEachRow',
    'id UInt64, name String, data String'
);
```

## Prevention best practices {#prevention}

1. **Validate data format before importing**
   ```bash
   # Check actual delimiter
   head -n 1 file.csv | od -c
   
   # Verify consistent column count
   awk -F',' 'NR==1{cols=NF} NF!=cols{print "Line " NR " has " NF " columns"}' file.csv
   
   # Check for encoding issues
   file -i file.csv
   ```

2. **Use appropriate format for your data**
   - CSV: Comma-delimited with optional CSV-style quoting
   - TSV/TabSeparated: Tab-delimited, no quoting
   - TSVWithNames: Tab-delimited with header row
   - CustomSeparated: Custom delimiter with CSV-style quoting

3. **Test with small samples first**
   ```sql
   -- Test schema inference
   DESCRIBE file('sample.csv', 'CSV');
   
   -- Test parsing first 100 rows
   SELECT * FROM file('sample.csv', 'CSV') LIMIT 100;
   ```

4. **Specify schemas explicitly for production**
   ```sql
   -- Don't rely on inference for critical imports
   SELECT * FROM file(
       'data.csv',
       'CSV',  
       'id UInt64, timestamp DateTime, value Float64, status String'
   );
   ```

5. **Use settings to handle imperfect data**
   ```sql
   -- Common settings for dealing with real-world data
   SET input_format_allow_errors_ratio = 0.01;        -- Allow 1% errors
   SET input_format_null_as_default = 1;               -- Empty = default
   SET input_format_skip_unknown_fields = 1;           -- Ignore extra fields
   SET input_format_csv_empty_as_default = 1;          -- Empty CSV fields = default
   ```

6. **Monitor parsing errors**
   ```sql
   -- Set up monitoring query
   SELECT
       count() AS error_count,
       any(exception) AS sample_error
   FROM system.query_log
   WHERE exception_code = 6
     AND event_time > now() - INTERVAL 1 DAY;
   ```

## Related settings {#related-settings}

```sql
-- Error handling
SET input_format_allow_errors_num = 100;              -- Skip N bad rows
SET input_format_allow_errors_ratio = 0.1;            -- Skip up to 10% bad rows

-- NULL and default handling  
SET input_format_null_as_default = 1;                 -- NULL becomes default value
SET input_format_csv_empty_as_default = 1;            -- Empty CSV field = default
SET input_format_skip_unknown_fields = 1;             -- Ignore extra columns

-- Schema inference
SET input_format_max_bytes_to_read_for_schema_inference = 1000000;
SET schema_inference_make_columns_nullable = 0;       -- Don't infer Nullable types

-- CSV-specific
SET format_csv_delimiter = ',';                       -- CSV delimiter
SET format_csv_allow_single_quotes = 1;               -- Allow single quotes
SET format_csv_allow_double_quotes = 1;               -- Allow double quotes

-- Custom format
SET format_custom_escaping_rule = 'CSV';              -- Use CSV escaping
SET format_custom_field_delimiter = '\x09';           -- Tab delimiter

-- Date/time parsing
SET date_time_input_format = 'best_effort';           -- Flexible date parsing
```

## Debugging tips {#debugging-tips}

```sql
-- 1. Check what ClickHouse sees in the problematic row
SELECT * FROM file('data.csv', 'CSV')
WHERE rowNumberInAllBlocks() = 429980;  -- The row number from error

-- 2. Examine the raw bytes
SELECT hex(column_name) FROM file('data.csv', 'CSV', 'column_name String')
LIMIT 10;

-- 3. Test different formats
SELECT * FROM file('data.txt', 'TSV') LIMIT 5;
SELECT * FROM file('data.txt', 'CSV') LIMIT 5;
SELECT * FROM file('data.txt', 'CSVWithNames') LIMIT 5;

-- 4. Use LineAsString to see raw data
SELECT * FROM file('data.csv', 'LineAsString') LIMIT 10;
```
