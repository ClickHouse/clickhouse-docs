---
slug: /troubleshooting/error-codes/1001_STD_EXCEPTION
sidebar_label: '1001 STD_EXCEPTION'
doc_type: 'reference'
keywords: ['error codes', 'STD_EXCEPTION', '1001']
title: '1001 STD_EXCEPTION'
description: 'ClickHouse error code - 1001 STD_EXCEPTION'
---

# Error 1001: STD_EXCEPTION

:::tip
The error message format is always: `std::exception. Code: 1001, type: [ExceptionType], e.what() = [actual error message]`

The `type` field tells you which external library or system component failed. Focus your troubleshooting there, not on ClickHouse itself.
:::

## What this error means {#what-this-error-means}

`STD_EXCEPTION` indicates that ClickHouse caught a C++ standard exception from an underlying library or system component. This is **not a ClickHouse bug** in most cases—it's ClickHouse reporting an error from:

- **External storage SDKs** (Azure Blob Storage, AWS S3, Google Cloud Storage)
- **Third-party libraries** (PostgreSQL client libraries, HDFS integration)
- **System-level failures** (network timeouts, file system errors)
- **C++ standard library errors** (`std::out_of_range`, `std::future_error`, etc.)

## Potential causes {#potential-causes}

### 1. Azure Blob Storage exceptions (most common in ClickHouse Cloud) {#azure-blob-storage-exceptions}

**`Azure::Storage::StorageException`**
- **400 errors**: The requested URI does not represent any resource on the server
- **403 errors**: Server failed to authenticate the request or insufficient permissions
- **404 errors**: The specified container/blob does not exist

**When you'll see it:**
- During merge operations with object storage backend
- When cleaning up temporary parts after failed inserts
- During destructor calls (`~MergeTreeDataPartWide`, `~MergeTreeDataPartCompact`)

**Real example from production:**

```
std::exception. Code: 1001, type: Azure::Storage::StorageException,
e.what() = 400 The requested URI does not represent any resource on the server.
RequestId:8e4bfa97-201e-0093-7ed7-bb478b000000
```

### 2. AWS S3 exceptions {#aws-s3-exceptions}

**Typical manifestations:**
- Throttling errors
- Missing object keys  
- Permission/credential failures
- Network connectivity issues to S3

### 3. PostgreSQL integration errors {#postgres-integration-errors}

**`pqxx::sql_error`**

**Real example:**

```
std::exception. Code: 1001, type: pqxx::sql_error,
e.what() = ERROR: cannot execute COPY during recovery
```

**Common scenarios:**
- PostgreSQL database/materialized view as external dictionary source
- PostgreSQL in recovery mode (read-only)
- Connection failures to external PostgreSQL instances

### 4. Iceberg table format errors {#iceberg-table-format-errors}

**`std::out_of_range`** - Key not found in schema mapping

**Real examples:**

```
std::exception. Code: 1001, type: std::out_of_range,
e.what() = unordered_map::at: key not found (version 25.6.2.6054)
```

**When you'll see it:**
- Querying Iceberg tables after ClickHouse version upgrades
- Schema evolution in Iceberg metadata (manifest files with older snapshots)
- Missing schema mappings between snapshots and manifest entries

**Affected versions:** 25.6.2.5983 - 25.6.2.6106, 25.8.1.3889 - 25.8.1.8277
**Fixed in:** 25.6.2.6107+, 25.8.1.8278+

### 5. HDFS integration errors {#hdfs-integration-errors}

**`std::out_of_range`** - Invalid URI parsing

**Real example:**

```
std::exception. Code: 1001, type: std::out_of_range, e.what() = basic_string
(in query: SELECT * FROM hdfsCluster('test_cluster_two_shards_localhost', '', 'TSV'))
```

**Cause:** Empty or malformed HDFS URI passed to `hdfsCluster()` function

### 6. System-level C++ exceptions {#system-level-cpp-exceptions}

**`std::future_error`** - Thread/async operation failures
**`std::out_of_range`** - Container access violations

## When you'll see it {#when-you-will-see-it}

### Scenario 1: ClickHouse Cloud - Azure object storage cleanup {#cloud-azure-os-cleanup}

**Context:** During background merge operations, temp parts cleanup, or destructor execution

**Stack trace pattern:**

```
~MergeTreeDataPartWide()
→ IMergeTreeDataPart::removeIfNeeded()
→ undoTransaction()
→ AzureObjectStorage::exists()
→ Azure::Storage::StorageException
```

**Why it happens:** 
ClickHouse tries to clean up temporary files in Azure Blob Storage, but the blob/container was already deleted or doesn't exist. This often occurs during:
- Failed merge rollback operations
- Concurrent deletion by multiple replicas
- Race conditions with container lifecycle

### Scenario 2: Iceberg table queries after version upgrade {#iceberg-table-queries}

**Error message:**

```
std::exception. Code: 1001, type: std::out_of_range,
e.what() = unordered_map::at: key not found
```

**Triggering query:**

```sql
SELECT * FROM icebergS3(
  's3://bucket/path/', 
  extra_credentials(role_arn='arn:aws:iam::...')
)
LIMIT 100;
```

**Why it happens:**

Version 25.6.2.5983 introduced a bug where ClickHouse couldn't find schema mappings for older Iceberg manifest entries with sequence numbers outside the current snapshot range.

### Scenario 3: PostgreSQL dictionary/materialized view {#postgres-dictionary-mv}

**Error message:**

```
std::exception. Code: 1001, type: pqxx::sql_error, 
e.what() = ERROR: cannot execute COPY during recovery
```

**Triggering operation:** Dictionary refresh or materialized view read from PostgreSQL source

**Why it happens:** External PostgreSQL instance is in recovery mode (read-only state)

### Scenario 4: HDFS table function with invalid URI {#hdfs-table-function-with-invalid-URI}

**Error message:**

```
std::exception. Code: 1001, type: std::out_of_range, e.what() = basic_string
```

**Triggering query:**

```sql
SELECT * FROM hdfsCluster('cluster', '', 'TSV');  -- Empty URI
```

## Quick fixes {#quick-fixes}

### Fix 1: Azure Storage exceptions (ClickHouse Cloud) {#azure-storage-exceptions}

**For 400/404 errors during merges:**

These are typically **benign** - ClickHouse is trying to clean up files that were already removed. The errors occur in destructors and are usually logged but don't affect functionality.

**If causing crashes (versions before 24.7):**

```sql
-- Check for ongoing merges
SELECT * FROM system.merges;

-- Wait for merges to complete or stop problematic merges
SYSTEM STOP MERGES table_name;
```

**Long-term fix:** Upgrade to ClickHouse 24.7+ where destructors have proper try/catch handling.

### Fix 2: Iceberg table errors {#iceberg-table-errors}

**Immediate fix:** Upgrade to patched version

```bash
# Required versions:
# - 25.6.2.6107 or higher
# - 25.8.1.8278 or higher  
# - 25.9.1.2261 or higher

# Check current version
SELECT version();

# Request upgrade through ClickHouse Cloud support if needed
```

### Fix 3: PostgreSQL integration errors {#postgres-integration-errors}

**For "cannot execute COPY during recovery":**

```sql
-- Option 1: Wait for PostgreSQL to exit recovery mode

-- Option 2: Switch to read-only queries
-- Use SELECT instead of materializing from PostgreSQL during recovery

-- Option 3: Point to PostgreSQL primary/writable replica
-- Update dictionary/materialized view source configuration
```

**Check PostgreSQL recovery status:**

```sql
-- On PostgreSQL side
SELECT pg_is_in_recovery();
```

### Fix 4: HDFS URI errors {#hdfs-uri-errors}

**Fix empty/invalid URIs:**

```sql
-- Instead of:
SELECT * FROM hdfsCluster('cluster', '', 'TSV');

-- Use valid HDFS path:
SELECT * FROM hdfsCluster('cluster', 'hdfs://namenode:8020/path/to/data/*.csv', 'CSV');
```

**Validate URI before passing to function:**

```sql
-- Ensure URI is not empty
SELECT * FROM hdfsCluster('cluster', 
    if(length(uri_variable) > 0, uri_variable, 'hdfs://default/path'), 
    'TSV'
);
```

## Understanding the root cause {#understanding-the-root-cause}

`STD_EXCEPTION` is a **symptom**, not a disease. Always look at:

1. **The `type:` field** - What external library threw the exception?
2. **The `e.what()` message** - What was the actual error?
3. **The stack trace** - Where in the code path did it originate?

Common patterns:

| `type:`                            | Origin                 | Typical cause                                |
|------------------------------------|------------------------|----------------------------------------------|
| `Azure::Storage::StorageException` | Azure Blob Storage SDK | Missing blobs, auth failures, network issues |
| `pqxx::sql_error`                  | PostgreSQL C++ library | External PostgreSQL errors                   |
| `std::out_of_range` (Iceberg)      | C++ standard library   | Missing schema/snapshot mappings             |
| `std::out_of_range` (HDFS)         | C++ standard library   | Invalid URI parsing                          |
| `std::future_error`                | C++ async operations   | Thread pool/async failures                   |

## Troubleshooting steps {#troubleshooting-steps}

### Step 1: Identify the exception type {#identify-exception-type}

```sql
-- Find recent STD_EXCEPTION errors
SELECT 
    event_time,
    query_id,
    exception,
    extract(exception, 'type: ([^,]+)') AS exception_type,
    extract(exception, 'e\\.what\\(\\) = ([^(]+)') AS error_message
FROM system.query_log
WHERE exception_code = 1001
  AND event_date >= today() - 1
ORDER BY event_time DESC
LIMIT 10;
```

### Step 2: Check for version-specific issues {#check-for-version-specific-issues}

```sql
SELECT version();

-- If using Iceberg and version is 25.6.2.5983 - 25.6.2.6106
-- OR 25.8.1.3889 - 25.8.1.8277
-- You need to upgrade to 25.6.2.6107+ or 25.8.1.8278+
```

### Step 3: Check object storage health (Cloud) {#check-boject-storage-health}

```sql
-- Check for Azure/S3 errors in logs
SELECT 
    event_time,
    message
FROM system.text_log
WHERE message LIKE '%Azure::Storage%'
   OR message LIKE '%S3%Exception%'
ORDER BY event_time DESC
LIMIT 20;
```

### Step 4: Check external integrations {#check-external-integrations}

```sql
-- For PostgreSQL dictionaries
SELECT 
    name,
    status,
    last_exception
FROM system.dictionaries
WHERE source LIKE '%postgresql%';

-- For HDFS paths
SHOW CREATE TABLE your_hdfs_table;
-- Verify URI is valid and not empty
```

## Related errors {#related-errors}

- **Error 210: `NETWORK_ERROR`** - Network-level failures (might escalate to STD_EXCEPTION)
- **Error 999: `KEEPER_EXCEPTION`** - Keeper/ZooKeeper failures (separate from STD_EXCEPTION)
- **Error 226: `NO_FILE_IN_DATA_PART`** - Missing data files (not the same as STD_EXCEPTION)

## Production notes {#prod-notes}

### Azure exceptions are often benign {#azure-exceptions-benign}

In ClickHouse Cloud with Azure backend, you may see many `Azure::Storage::StorageException` errors in logs during normal operation. These occur when:
- Multiple replicas try to clean up the same temporary part
- Background merges fail and rollback
- Destructors attempt to delete already-deleted blobs

**These don't affect data integrity** - ClickHouse handles them gracefully in versions 24.7+.

### Iceberg schema mapping issues {#iceberg-schema-mapping-issues}

If you use Iceberg tables:
- **Always keep ClickHouse updated** to the latest patch version
- Iceberg schema evolution can trigger errors in older ClickHouse versions
- The fix in 25.6.2.6107+ makes error handling more robust but may log warnings
