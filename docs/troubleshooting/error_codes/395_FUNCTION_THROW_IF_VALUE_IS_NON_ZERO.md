---
slug: /troubleshooting/error-codes/395_FUNCTION_THROW_IF_VALUE_IS_NON_ZERO
sidebar_label: '395 FUNCTION_THROW_IF_VALUE_IS_NON_ZERO'
doc_type: 'reference'
keywords: ['error codes', 'FUNCTION_THROW_IF_VALUE_IS_NON_ZERO', '395']
title: '395 FUNCTION_THROW_IF_VALUE_IS_NON_ZERO'
description: 'ClickHouse error code - 395 FUNCTION_THROW_IF_VALUE_IS_NON_ZERO'
---

## Error Code 395: FUNCTION_THROW_IF_VALUE_IS_NON_ZERO

:::tip
This error occurs when the `throwIf` function evaluates to a non-zero (true) value.
The `throwIf` function is designed to intentionally throw an exception when its condition is met, and error code 395 is the standard error code for this behavior.
:::

### When you'll see it

You'll encounter this error in the following situations:

1. **Explicit use of `throwIf` function:**
   - When you deliberately use `throwIf()` in your query to validate data or enforce business rules
   - Example: `SELECT throwIf(number = 2) FROM numbers(5)`

2. **HTTP streaming queries:**
   - When an exception occurs mid-stream while data is being sent over HTTP
   - The error appears in the response body even after HTTP 200 status has been sent

3. **Testing and validation:**
   - When using `throwIf` to test error handling in applications
   - During data quality checks that use assertions

4. **Custom error codes (optional):**
   - With the setting `allow_custom_error_code_in_throwif = 1`, you can specify custom error codes
   - Example: `throwIf(1, 'test', toInt32(49))` - but this is generally not recommended

### Potential causes

1. **Intentional validation failure** - The most common cause, where `throwIf` is working as designed to catch invalid data

2. **Business rule violation** - Data doesn't meet expected criteria (e.g., checking for null values, out-of-range numbers, duplicate records)

3. **Test queries** - Using `throwIf` for debugging or testing error handling

4. **HTTP response timing** - In HTTP queries, error code 395 can appear mid-response when processing rows incrementally

### Quick fixes

**1. For legitimate validation failures:**

```sql
-- Review the condition causing the exception
SELECT throwIf(number = 3, 'Value 3 is not allowed') FROM numbers(10);
```

Fix: Adjust your data or query logic to avoid the triggering condition.

**2. For HTTP streaming issues:**

```sql
-- Enable response buffering to get complete results before sending HTTP headers
SELECT * FROM table WHERE condition 
SETTINGS wait_end_of_query=1, http_response_buffer_size=10485760;
```

**3. For unexpected errors in production:**

```sql
-- Replace throwIf with conditional logic
-- Instead of:
SELECT throwIf(value > 100, 'Value too large')

-- Use:
SELECT if(value > 100, NULL, value) FROM table;
```

**4. For testing/debugging:**

```sql
-- Use identity() function to bypass optimization and see raw performance
SELECT identity(column) FROM table WHERE NOT throwIf(column IS NULL);
```

### Important notes

- The `throwIf` function is **intentional** - it's meant to throw exceptions when the condition is true
- Error code 395 itself is not a bug; it indicates the function is working as designed
- When using custom error codes (with `allow_custom_error_code_in_throwif = 1`), thrown exceptions may have unexpected error codes, making debugging harder

### Related documentation

- [`throwIf` function documentation](/sql-reference/functions/other-functions#throwif)
- [HTTP Interface and error handling](/interfaces/http)
- [Session settings: allow_custom_error_code_in_throwif](/operations/settings/settings#allow_custom_error_code_in_throwif)