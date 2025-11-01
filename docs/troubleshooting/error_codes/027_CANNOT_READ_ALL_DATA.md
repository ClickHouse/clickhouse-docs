---
slug: /troubleshooting/error-codes/027_CANNOT_READ_ALL_DATA
sidebar_label: '027 CANNOT_READ_ALL_DATA'
doc_type: 'reference'
keywords: ['error codes', 'CANNOT_READ_ALL_DATA', '027', 'corrupted', 'truncated', 'S3', 'remote storage']
title: '027 CANNOT_READ_ALL_DATA'
description: 'ClickHouse error code - 027 CANNOT_READ_ALL_DATA'
---

# Error 27: CANNOT_READ_ALL_DATA

:::tip
This error occurs when ClickHouse expects to read a certain number of bytes from a file but receives fewer bytes than expected.
This typically indicates file corruption, truncation, or issues with remote storage reads.
:::

## Most common causes {#most-common-causes}

1. **File corruption or truncation**
   - Data part files corrupted on disk
   - Incomplete writes due to server crashes
   - Mark files (.mrk, .mrk2) truncated or corrupted
   - Column data files incomplete or damaged
   - Checksums mismatch after decompression

2. **Remote storage (S3/Object storage) issues**
   - Network interruptions during S3 reads
   - S3 authentication expiration mid-read
   - Eventual consistency issues with object storage
   - Missing or deleted objects in S3
   - S3 throttling causing incomplete reads

3. **LowCardinality column serialization issues**
   - Bug with LowCardinality columns when using `remote_filesystem_read_method=threadpool`
   - Invalid version for SerializationLowCardinality key column
   - Specific to S3 disks with certain data patterns
   - Fixed in recent versions but may still occur

4. **JSON/Dynamic column type issues**
   - Corrupted variant discriminator files (`.variant_discr.cmrk2`)
   - Issues with JSON field serialization
   - Problems reading Dynamic type metadata
   - SerializationObject state prefix errors

5. **Packed/compressed file format issues**
   - `data.packed` metadata corruption
   - Incomplete compression or decompression
   - Marks file doesn't match actual data
   - Issues with wide vs compact format parts

## What to do when you encounter this error {#what-to-do}

**1. Identify the corrupted part**

The error message specifies which part and column failed:

```text
Cannot read all data. Bytes read: 114. Bytes expected: 266.:
(while reading column operationName): (while reading from part
/var/lib/clickhouse/.../1670889600_0_33677_2140/ from mark 26)
```

**2. Check if the table is replicated**

```sql
-- Check table engine
SELECT engine
FROM system.tables
WHERE database = 'your_database' AND name = 'your_table';

-- If replicated, check replicas status
SELECT *
FROM system.replicas
WHERE database = 'your_database' AND table = 'your_table';
```

**3. Check for detached broken parts**

```sql
-- Check broken detached parts
SELECT
    database,
    table,
    name,
    reason
FROM system.detached_parts
WHERE name LIKE 'broken%'
ORDER BY modification_time DESC;
```

**4. Review logs for error context**

```sql
SELECT
    event_time,
    query_id,
    exception
FROM system.query_log
WHERE exception_code = 27
  AND event_time > now() - INTERVAL 1 HOUR
ORDER BY event_time DESC
LIMIT 10;
```

## Quick fixes {#quick-fixes}

**1. For replicated tables - refetch from other replicas**

```sql
-- ClickHouse will automatically refetch corrupted parts
-- You can force a sync:
SYSTEM RESTART REPLICA your_table;

-- Or detach and reattach the broken part to trigger refetch
-- (part will be refetched from other replicas automatically)
```

**2. For LowCardinality on S3 - use alternative read method**

```sql
-- Workaround for LowCardinality + S3 bug
SET remote_filesystem_read_method = 'read';  -- Instead of 'threadpool'

-- Then retry the query
-- Note: This has performance implications
```

**3. For corrupted parts - detach and rebuild**

```sql
-- For non-replicated tables, if you have backups
ALTER TABLE your_table DETACH PARTITION 'partition_id';

-- Restore from backup or reinsert data

-- For replicated tables, just detach and ClickHouse will refetch
ALTER TABLE your_table DETACH PARTITION 'partition_id';
ALTER TABLE your_table ATTACH PARTITION 'partition_id';
```

**4. For broken detached parts on restart**

```bash
-- If parts are truly broken with zero-byte files
-- Check for empty files
find /var/lib/clickhouse/disks/*/detached/broken-on-start_* -type f -size 0

-- Remove broken detached parts (they contain no valid data)
find /var/lib/clickhouse/disks/*/detached/broken-on-start_* -type d -exec rm -rf {} +
```

**5. Retry S3-related errors**

```sql
-- Increase retry settings for S3
SET s3_max_single_read_retries = 10;
SET s3_retry_attempts = 5;
SET s3_request_timeout_ms = 30000;

-- Then retry the query
-- Often S3 errors are transient
```

## Common specific scenarios {#common-scenarios}

**Scenario 1: LowCardinality column on S3 with threadpool read method**

```text
Cannot read all data. Bytes read: 114. Bytes expected: 266.:
(while reading column operationName): (while reading from part
/var/lib/clickhouse/disks/s3_disk/store/.../1670889600_0_33677_2140/)
```

**Cause:** Bug with LowCardinality columns when using `remote_filesystem_read_method=threadpool` on S3 storage. Specific data patterns trigger incomplete reads.

**Solution:**
```sql
-- Immediate workaround
SET remote_filesystem_read_method = 'read';

-- Then run your query
SELECT * FROM your_table;

-- Note: This setting has performance impact
-- Upgrade to latest ClickHouse version for permanent fix
```

**Scenario 2: JSON field variant discriminator corruption**

```text
Cannot read all data. Bytes read: 7. Bytes expected: 25.:
While reading or decompressing dimensions.Phone_number.variant_discr.cmrk2
```

**Cause:** Corruption in JSON/Dynamic column variant discriminator mark files.

**Solution:**
```sql
-- Check if table is replicated
-- If yes, ClickHouse will automatically handle it

-- For persistent issues, try to rebuild affected partitions
ALTER TABLE events DETACH PARTITION '202501';
ALTER TABLE events ATTACH PARTITION '202501';
```

**Scenario 3: Packed data format corruption on restart**

```text
Code: 32. DB::Exception: Attempt to read after eof. (ATTEMPT_TO_READ_AFTER_EOF)
while loading part all_10009167_10009239_16 from disk s3disk
```

**Cause:** Server restarted while writing packed format data, leaving `data.packed` metadata incomplete or corrupted.

**Solution:**
```bash
# Check for broken-on-start parts
clickhouse-client --query "
SELECT count()
FROM system.detached_parts
WHERE name LIKE 'broken-on-start%'"

# If files are zero bytes, safely remove them
find /var/lib/clickhouse/disks/*/detached/broken-on-start_* -type f -size 0 -delete

# For replicated tables, parts will be refetched automatically
# For non-replicated tables without backups, data is lost
```

**Scenario 4: S3 network interruption during read**

```text
Cannot read all data. Bytes read: 28248. Bytes expected: 38739.:
(while reading from part .../202206_10626_10770_3/ from mark 0)
Connection reset by peer
```

**Cause:** Network connection to S3 dropped during read, or S3 throttling occurred.

**Solution:**
```sql
-- Configure more aggressive S3 retries
SET s3_max_single_read_retries = 10;
SET s3_retry_attempts = 5;
SET s3_request_timeout_ms = 30000;

-- Retry the query
-- Error is usually transient
```

**Scenario 5: Invalid SerializationLowCardinality version**

```text
Invalid version for SerializationLowCardinality key column:
(while reading column valuation_result_type)
```

**Cause:** Rare race condition or corruption in LowCardinality column serialization, potentially related to concurrent reads during async inserts.

**Solution:**
```sql
-- Check if this is a replicated table
SELECT engine FROM system.tables WHERE name = 'your_table';

-- For SharedMergeTree, part will be marked as broken and refetched
-- Query may succeed on retry:
SELECT * FROM your_table; -- Retry the same query

-- If persistent, check for recent merges/mutations
SELECT * FROM system.mutations WHERE table = 'your_table' AND is_done = 0;
```

## Prevention best practices {#prevention}

1. **Always use replication for critical data**

   ```sql
   -- Use ReplicatedMergeTree instead of MergeTree
   ENGINE = ReplicatedMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}')
   
   -- Configure at least 2-3 replicas
   -- Corrupted parts will be automatically refetched
   ```

2. **Monitor S3/remote storage health**

   ```sql
   -- Check S3 error rates
   SELECT
       count() AS errors,
       any(exception) AS sample
   FROM system.query_log
   WHERE exception LIKE '%S3_ERROR%'
     AND event_time > now() - INTERVAL 1 DAY;
   ```

3. **Use appropriate settings for S3 reads**

   ```sql
   -- For production workloads with LowCardinality on S3
   SET remote_filesystem_read_method = 'read';
   
   -- Or configure in server config:
   -- <remote_filesystem_read_method>read</remote_filesystem_read_method>
   ```

4. **Avoid packed format for volatile environments**

   ```sql
   -- If experiencing frequent restarts
   -- Consider using wide format instead of compact/packed
   ALTER TABLE your_table
       MODIFY SETTING min_bytes_for_wide_part = 0;
   ```

5. **Monitor broken detached parts**

   ```sql
   -- Set up monitoring
   SELECT count()
   FROM system.detached_parts
   WHERE name LIKE 'broken%';
   
   -- Alert when count exceeds threshold
   -- Investigate logs when parts are being detached
   ```

6. **Regular backups**

   ```sql
   -- Use BACKUP/RESTORE or freeze partitions
   BACKUP TABLE your_table TO Disk('backups', 'backup_name');
   
   -- Or freeze specific partitions
   ALTER TABLE your_table FREEZE PARTITION '2024-01';
   ```

## Related error codes {#related-errors}

- **Error 3 `UNEXPECTED_END_OF_FILE`**: Similar to CANNOT_READ_ALL_DATA but typically indicates file was truncated
- **Error 32 `ATTEMPT_TO_READ_AFTER_EOF`**: Trying to read past end of file
- **Error 117 `INCORRECT_DATA`**: Data doesn't match expected format
- **Error 499 `S3_ERROR`**: Specific S3/object storage errors
- **Error 740 `POTENTIALLY_BROKEN_DATA_PART`**: Wrapper error indicating suspected corruption

## Related settings {#related-settings}

```sql
-- S3 retry configuration
SET s3_max_single_read_retries = 10;
SET s3_retry_attempts = 5;
SET s3_request_timeout_ms = 30000;

-- Remote filesystem read method
SET remote_filesystem_read_method = 'read';  -- Instead of 'threadpool'

-- Broken parts handling
SET max_broken_detached_parts = 100;  -- Alert threshold

-- Check current settings
SELECT name, value
FROM system.settings
WHERE name LIKE '%s3%' OR name LIKE '%broken%';
```
