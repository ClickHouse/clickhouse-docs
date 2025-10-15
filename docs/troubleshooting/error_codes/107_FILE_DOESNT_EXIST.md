---
slug: /troubleshooting/error-codes/107_FILE_DOESNT_EXIST
sidebar_label: '107 FILE_DOESNT_EXIST'
doc_type: 'reference'
keywords: ['error codes', 'FILE_DOESNT_EXIST', '107']
title: '107 FILE_DOESNT_EXIST'
description: 'ClickHouse error code - 107 FILE_DOESNT_EXIST'
---

# Error 107: FILE_DOESNT_EXIST

:::tip
This error occurs when ClickHouse attempts to access a file that does not exist in the filesystem or object storage.
It typically indicates missing data part files, corrupted table parts, or issues with remote storage access.
:::

## Most common causes {#most-common-causes}

1. **Missing data part files**
    - Data part file deleted or moved during query execution
    - Part files missing: `data.bin`, `columns.txt`, `checksums.txt`, `.mrk2` files
    - Part removal race condition (file deleted after being listed but before being read)

2. **Corrupted or incomplete table parts**
    - Broken data parts missing essential files
    - Incomplete part downloads in replicated setups
    - Checksums file referencing non-existent files

3. **Merge or mutation issues**
    - Parts removed during ongoing merges while queries are reading them
    - Mutations creating parts with missing files
    - Column alterations leaving excess file references in checksums

4. **Object storage (S3/Azure) issues**
    - S3 key not found errors
    - Azure blob does not exist
    - Network issues preventing file access
    - Object storage eventual consistency problems

5. **Filesystem cache problems**
    - Cached metadata pointing to deleted files
    - Cache invalidation race conditions
    - Temporary files cleaned up prematurely

6. **Replication synchronization issues**
    - Part not yet downloaded to replica
    - Part removed on one replica while being fetched on another
    - Metadata inconsistency between replicas

## Common solutions {#common-solutions}

**1. Check table integrity**

```sql
-- Check for broken parts
CHECK TABLE your_table;

-- View part status
SELECT 
    database,
    table,
    name,
    active,
    modification_time,
    disk_name
FROM system.parts
WHERE table = 'your_table'
ORDER BY modification_time DESC;
```

**2. Look for stuck merges or mutations**

```sql
-- Check ongoing merges
SELECT *
FROM system.merges
WHERE table = 'your_table';

-- Check mutations
SELECT *
FROM system.mutations
WHERE database = 'your_database' 
  AND table = 'your_table'
  AND NOT is_done;
```

**3. Optimize or rebuild the affected table**

```sql
-- Force merge to consolidate parts
OPTIMIZE TABLE your_table FINAL;

-- If table is severely corrupted, may need to rebuild
```

**4. Check replication queue (for replicated tables)**

```sql
-- Check replication status
SELECT *
FROM system.replication_queue
WHERE table = 'your_table';

-- Check replica status
SELECT *
FROM system.replicas
WHERE table = 'your_table';
```

**5. Detach and reattach broken parts**

```sql
-- List parts
SELECT name FROM system.parts WHERE table = 'your_table';

-- Detach broken part
ALTER TABLE your_table DETACH PART 'part_name';

-- Part will be re-fetched from another replica (for replicated tables)
```

**6. For S3/object storage issues**

- Check S3 bucket permissions and access
- Verify network connectivity
- Check for S3 lifecycle policies deleting objects
- Review object storage logs

## Common scenarios {#common-scenarios}

**Scenario 1: File missing during query**

```
Error: File data/uuid/all_XXX_XXX_X/date.bin doesn't exist
```

**Cause:** Part was removed (merged or deleted) while the query was accessing it.

**Solution:**
- Retry the query (part removal race condition)
- Check if excessive merges are happening
- Verify table isn't being dropped/recreated

**Scenario 2: Missing marks file**

```
Error: Marks file '.../column.mrk2' doesn't exist
```

**Cause:** Part is broken or incompletely downloaded.

**Solution:**

```sql
-- Check and repair
CHECK TABLE your_table;

-- For replicated tables, detach broken part
ALTER TABLE your_table DETACH PART 'broken_part_name';
```

**Scenario 3: S3 object not found**

```
Error: The specified key does not exist (S3_ERROR)
```

**Cause:** S3 object deleted, never uploaded, or access denied.

**Solution:**
- Check S3 bucket for the object
- Verify S3 credentials and permissions
- Check S3 lifecycle policies
- For replicated tables, fetch from another replica

**Scenario 4: Checksums.txt references excess files**

```
Error: File 'column.sparse.idx.cmrk2' doesn't exist
```

**Cause:** Column alteration left stale file references in checksums.txt.

**Solution:**
- This is often a bug in ClickHouse during mutations
- Detach and reattach the part
- Or manually remove problematic parts

**Scenario 5: Azure blob missing**

```
Error: The specified blob does not exist
```

**Cause:** Azure storage object missing or access issues.

**Solution:**
- Verify Azure storage account access
- Check blob exists in container
- Review Azure storage logs

## Prevention tips {#prevention-tips}

1. **Use replicated tables:** Provides redundancy when parts go missing
2. **Monitor merges:** Watch for excessive or slow merge operations
3. **Regular integrity checks:** Run `CHECK TABLE` periodically
4. **Stable object storage:** Ensure S3/Azure configurations are stable
5. **Avoid manual file deletions:** Never manually delete part files
6. **Monitor disk space:** Full disks can cause incomplete writes
7. **Keep ClickHouse updated:** Bugs causing missing files are often fixed in newer versions

## Debugging steps {#debugging-steps}

1. **Identify the missing file:**

   ```
   Error message shows: File data/uuid/part_name/file.bin doesn't exist
   ```

2. **Check if part exists:**

   ```sql
   SELECT *
   FROM system.parts
   WHERE name = 'part_name';
   ```

3. **Check part log for part history:**

   ```sql
   SELECT 
       event_time,
       event_type,
       part_name,
       error
   FROM system.part_log
   WHERE part_name = 'part_name'
   ORDER BY event_time DESC;
   ```

4. **For replicated tables, check all replicas:**

   ```sql
   SELECT 
       hostName(),
       database,
       table,
       active_replicas,
       total_replicas
   FROM clusterAllReplicas('your_cluster', system.replicas)
   WHERE table = 'your_table';
   ```

5. **Check for recent merges:**

   ```sql
   SELECT *
   FROM system.part_log
   WHERE table = 'your_table'
      AND event_type IN ('MergeParts', 'RemovePart')
      AND event_time > now() - INTERVAL 1 HOUR
   ORDER BY event_time DESC;
   ```

6. **For object storage, check logs:**
    - S3: Check CloudTrail logs
    - Azure: Check Storage Analytics logs
    - Look for DELETE operations on the missing object

## Special considerations {#special-considerations}

**For SharedMergeTree / ClickHouse Cloud:**
- Parts are stored in shared object storage
- Missing files often indicate object storage issues
- Check both local cache and remote storage

**For replicated tables:**
- One replica's missing part can be fetched from others
- Detaching broken parts often triggers automatic recovery
- Check replication lag before detaching parts

**For mutations:**
- Mutations create new parts; missing files may indicate mutation failure
- Check `system.mutations` for failed mutations
- Old parts are kept until mutation completes

**During part removal:**
- Parts are removed after being merged into larger parts
- Race condition can occur if query starts before merge but reads after
- Usually resolved by query retry

If you're experiencing this error:
1. Retry the query (it could be a transient race condition)
2. Run `CHECK TABLE` to identify broken parts
3. Check `system.part_log` for recent part operations
4. For replicated tables, detach broken parts to trigger refetch
5. For object storage errors, verify storage access and permissions
6. If persistent, may indicate data corruption requiring restore from backup
