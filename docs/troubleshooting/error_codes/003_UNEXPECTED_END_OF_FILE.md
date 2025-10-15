---
slug: /troubleshooting/error-codes/003_UNEXPECTED_END_OF_FILE
sidebar_label: '003 UNEXPECTED_END_OF_FILE'
doc_type: 'reference'
keywords: ['error codes', 'UNEXPECTED_END_OF_FILE', '003', 'EOF', 'truncated', 'corrupted']
title: '003 UNEXPECTED_END_OF_FILE'
description: 'ClickHouse error code - 003 UNEXPECTED_END_OF_FILE'
---

# Error 3: UNEXPECTED_END_OF_FILE

:::tip
This error occurs when ClickHouse attempts to read data from a file but encounters an unexpected end-of-file (EOF) condition before reading all expected data. This typically indicates file truncation, corruption, or incomplete file writes.
:::

## Most common causes {#most-common-causes}

1. **Interrupted or incomplete file writes**
   - Server crash or restart during data write operations
   - Network interruption during remote file transfer
   - Disk I/O errors while writing data
   - Insufficient disk space during write operations
   - Missing fsync causing incomplete writes after restart

2. **File corruption or truncation**
   - Files truncated due to external processes
   - Metadata files corrupted or incomplete
   - S3/Object storage upload failures
   - Empty or zero-byte files in detached parts
   - Incomplete downloads from remote storage

3. **Part loading failures after restart**
   - Parts partially downloaded before server restart
   - Broken parts in detached directory with empty files
   - Metadata inconsistency (e.g., `data.packed` missing)
   - Marks files or column files truncated

4. **Remote storage issues**
   - S3/GCS connection interruptions during reads
   - Incomplete multipart uploads
   - Object storage eventual consistency issues
   - Authentication failures mid-read
   - Network timeouts truncating responses

5. **Filesystem cache corruption**
   - Cache files truncated or incomplete
   - Cache metadata out of sync with actual file size
   - Concurrent access corruption in cache
   - Disk issues affecting cache directory

## What to do when you encounter this error {#what-to-do}

**1. Identify which file is affected**

The error message usually indicates the specific file:

```
Code: 3. DB::Exception: Unexpected end of file while reading: 
Marks file '/path/to/part/column.mrk2' doesn't exist or is truncated
```

**2. Check logs for context**

```sql
-- Find recent errors
SELECT
    event_time,
    query,
    exception
FROM system.query_log
WHERE exception_code = 3
  AND event_time > now() - INTERVAL 1 HOUR
ORDER BY event_time DESC
LIMIT 10;
```

**3. Inspect broken parts**

```sql
-- Check for broken detached parts
SELECT
    database,
    table,
    name,
    reason,
    disk
FROM system.detached_parts
WHERE name LIKE 'broken%'
ORDER BY modification_time DESC;
```

**4. Check for empty files in detached parts**

```bash
# On the server, look for zero-byte files
find /var/lib/clickhouse/disks/*/detached/ -type f -size 0

# List broken parts
find /var/lib/clickhouse/disks/*/detached/ -name "broken-*"
```

## Quick fixes {#quick-fixes}

**1. For broken detached parts with empty files**

```bash
# Drop the broken detached parts (they contain no data anyway)
# First verify they are truly empty
find /var/lib/clickhouse/disks/s3disk/store/*/detached/broken-* -type d

# Then remove them
find /var/lib/clickhouse/disks/s3disk/store/*/detached/broken-* -type d -exec rm -rf {} +
```

**2. For replicated tables - refetch from other replicas**

```sql
-- If using replication, data can be recovered automatically
-- Check replica status
SELECT
    database,
    table,
    is_leader,
    total_replicas,
    active_replicas
FROM system.replicas
WHERE table = 'your_table';

-- Force check and refetch of missing parts
SYSTEM RESTART REPLICA your_table;
```

**3. For corrupted parts on non-replicated tables**

```sql
-- If part is detached and data exists elsewhere
ALTER TABLE your_table DROP DETACHED PART 'broken_part_name';

-- If you have backups
RESTORE TABLE your_table FROM Disk('backups', 'path/to/backup');
```

**4. For system tables with broken parts**

```sql
-- System tables can usually be truncated safely
TRUNCATE TABLE system.query_log;
TRUNCATE TABLE system.text_log;
TRUNCATE TABLE system.metric_log;

-- Or restart the server to rebuild
```

**5. For filesystem cache issues**

```sql
-- Disable cache temporarily
SET enable_filesystem_cache = 0;

-- Or clear corrupted cache
SYSTEM DROP FILESYSTEM CACHE '/path/to/corrupted/file';

-- Clear all cache (use with caution)
SYSTEM DROP FILESYSTEM CACHE;
```

## Common specific scenarios {#common-scenarios}

**Scenario 1: Broken parts after server restart**

```
Code: 32. DB::Exception: Attempt to read after eof.
while loading part all_41390134_41390134_0 on path store/.../all_41390134_41390134_0
```

**Cause:** Server restarted during part write, resulting in empty or truncated metadata files (especially with `data.packed` format).

**Solution:**

```bash
# Check for zero-byte files
ls -la /var/lib/clickhouse/disks/s3disk/store/.../detached/broken-on-start_*

# If files are empty (0 bytes), safely remove the broken parts
find /var/lib/clickhouse/disks/s3disk/store/*/detached/broken-on-start_* -type d -exec rm -rf {} +

# For replicated tables, parts will be refetched automatically
# For non-replicated tables, data is lost unless you have backups
```

**Scenario 2: Empty marks file**

```
Empty marks file: 0, must be: 75264
Code: 246. DB::Exception: CORRUPTED_DATA
```

**Cause:** Marks file is truncated or empty, often due to incomplete S3 writes or cache issues.

**Solution:**
```sql
-- Check if other replicas have the data
SELECT * FROM system.replicas WHERE table = 'your_table';

-- For SharedMergeTree, part will be automatically refetched
-- For non-replicated MergeTree, try to restore from backup

-- If this is a system table, just truncate it
TRUNCATE TABLE system.text_log;
```

**Scenario 3: Cannot read all data - bytes expected vs received**

```
Cannot read all data. Bytes read: 32. Bytes expected: 40.
while loading part 202311_0_158_42_159
```

**Cause:** File is truncated or corrupted, often occurs with projections after ALTER MODIFY COLUMN operations or incomplete merges.

**Solution:**

```sql
-- Check for broken projections
SHOW CREATE TABLE your_table;

-- If part is detached with broken projection:
-- 1. Extract data from packed format (if using Packed storage)
-- 2. Remove projection from extracted part
-- 3. Delete checksums.txt
-- 4. Attach the part back

-- For replicated tables, easier to just drop and refetch
ALTER TABLE your_table DROP DETACHED PART 'broken_part_name';
SYSTEM RESTART REPLICA your_table;
```

**Scenario 4: Filesystem cache "Having zero bytes" error**

```
Having zero bytes, but range is not finished: file offset: 0, cache file size: 11038
read type: CACHED, cache file path: /mnt/clickhouse-cache/.../0
```

**Cause:** Filesystem cache file is corrupted or truncated, often occurs with DiskEncrypted or remote reads.

**Solution:**

```sql
-- Drop specific file from cache
SYSTEM DROP FILESYSTEM CACHE '/path/to/file';

-- Or disable cache for the query
SET enable_filesystem_cache = 0;

-- For persistent issues, clear all cache
SYSTEM DROP FILESYSTEM CACHE;

-- Retry the query
```

**Scenario 5: S3/Remote storage read truncation**

```
Code: 3. DB::Exception: Unexpected end of file while reading from S3
Connection reset by peer
```

**Cause:** Network connection dropped during S3 read, authentication expired, or S3 throttling.

**Solution:**

```sql
-- Increase retry attempts and timeouts
SET s3_max_single_read_retries = 10;
SET s3_retry_attempts = 5;
SET s3_request_timeout_ms = 30000;

-- Check for authentication issues
-- Verify S3 credentials are valid and not expired

-- For ClickPipes/s3 table functions, retry the operation
-- The error is usually transient
```

**Reference:** Based on search results showing S3 authentication and network errors

## Prevention best practices {#prevention}

1. **For replicated tables**
   - Always use replication for critical data
   - Configure at least 2-3 replicas
   - Broken parts will be automatically refetched

2. **Ensure sufficient disk space**

   ```sql
   -- Monitor disk usage
   SELECT
       name,
       path,
       formatReadableSize(free_space) AS free,
       formatReadableSize(total_space) AS total,
       round(free_space / total_space * 100, 2) AS free_percent
   FROM system.disks;
   
   -- Alert when free space < 20%
   ```

3. **Monitor broken detached parts**

   ```sql
   -- Set up monitoring
   SELECT count()
   FROM system.detached_parts
   WHERE name LIKE 'broken%';
   
   -- Alert when count exceeds threshold
   -- Check max_broken_detached_parts setting
   ```

4. **Use proper shutdown procedures**

   ```bash
   # Graceful shutdown allows ClickHouse to finish writes
   systemctl stop clickhouse-server
   
   # Avoid kill -9 or forceful terminations
   ```

5. **Configure appropriate retry settings for remote storage**

   ```xml
   <clickhouse>
       <s3>
           <retry_attempts>5</retry_attempts>
           <request_timeout_ms>30000</request_timeout_ms>
       </s3>
   </clickhouse>
   ```

6. **Regular cleanup of broken parts**

   ```bash
   # Periodically clean up known-broken detached parts
   # Especially those with zero-byte files
   find /var/lib/clickhouse/disks/*/detached/broken-* -type f -size 0 -delete
   ```

## Related settings {#related-settings}

```sql
-- Control handling of broken parts
SET max_broken_detached_parts = 100;

-- S3 retry configuration
SET s3_max_single_read_retries = 10;
SET s3_retry_attempts = 5;
SET s3_request_timeout_ms = 30000;

-- Filesystem cache settings
SET enable_filesystem_cache = 1;
SET enable_filesystem_cache_on_write_operations = 1;

-- Check current broken parts limit
SELECT name, value
FROM system.settings
WHERE name LIKE '%broken%';
```

## When data is unrecoverable {#when-unrecoverable}

If you encounter this error and:
- The table is **not replicated**
- You have **no backups**
- The detached parts are **truly corrupted** (not just empty files from restart)

Then the data in those parts is **lost**. Prevention through replication and backups is critical.

For system tables (`query_log`, `text_log`, `metric_log`, etc.), data loss is usually acceptable - just truncate and continue.
