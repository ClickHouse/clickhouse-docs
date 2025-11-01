---
slug: /troubleshooting/error-codes/242_TABLE_IS_READ_ONLY
sidebar_label: '242 TABLE_IS_READ_ONLY'
doc_type: 'reference'
keywords: ['error codes', 'TABLE_IS_READ_ONLY', '242', 'readonly', 'replica']
title: '242 TABLE_IS_READ_ONLY'
description: 'ClickHouse error code - 242 TABLE_IS_READ_ONLY'
---

# Error 242: TABLE_IS_READ_ONLY

:::tip
This error occurs when a table replica enters read-only mode, preventing write operations (INSERT, UPDATE, DELETE, ALTER). This is a protective measure ClickHouse takes when it cannot maintain consistency with other replicas, typically due to Keeper/ZooKeeper connection issues, metadata mismatches, or data corruption.
:::

## Most common causes {#most-common-causes}

1. **Keeper/ZooKeeper connection issues**
   - Connection loss (ZCONNECTIONLOSS) during critical operations
   - Session expired (ZSESSIONEXPIRED) causing replica to lose coordination
   - Operation timeout exceeding configured limits
   - Network partition between ClickHouse server and Keeper nodes
   - Keeper cluster losing quorum

2. **Metadata mismatch with ZooKeeper**
   - Local table metadata differs from metadata stored in ZooKeeper
   - TTL configuration discrepancies (common after failed ALTER queries)
   - Incomplete ALTER TABLE operations that updated ZooKeeper but not local metadata
   - Example: `Existing table metadata in ZooKeeper differs in TTL`

3. **Part validation failures**
   - Data corruption detected during part loading (ATTEMPT_TO_READ_AFTER_EOF)
   - Checksum mismatches in data files
   - Missing or corrupted mark files (CANNOT_READ_ALL_DATA)
   - Broken parts that cannot be loaded on startup
   - Example: `Cannot read all marks from file`

4. **Initialization failure scenarios**
   - Too many suspicious parts detected on startup
   - Local parts don't match ZooKeeper's expected set
   - Example: `The local set of parts doesn't look like the set of parts in ZooKeeper: 6.23 million rows are suspicious`
   - Replica cannot sync with other replicas during startup

5. **Resource exhaustion**
   - Disk space running low, triggering readonly protection
   - Too many parts accumulating (often > 300 parts)
   - Memory pressure preventing proper operations
   - Heavy INSERT workload overwhelming merge operations

6. **Failed ALTER operations**
   - ALTER TABLE partially applied (updated ZooKeeper but not all replicas)
   - DDL queue entry failed on some replicas
   - Concurrent ALTER PARTITION cancelling INSERT operations
   - Example: `Insert query was cancelled by concurrent ALTER PARTITION`

## Common solutions {#common-solutions}

**1. Check replica status**

```sql
-- Check which tables are in readonly mode
SELECT 
    database,
    table,
    engine,
    is_leader,
    is_readonly,
    total_replicas,
    active_replicas
FROM system.replicas
WHERE is_readonly = 1;

-- Check detailed replica status
SELECT 
    database,
    table,
    last_queue_update_exception,
    zookeeper_exception
FROM system.replicas
WHERE is_readonly = 1
FORMAT Vertical;
```

**2. Restart the replica (safest first step)**

```sql
-- Restart specific replica
SYSTEM RESTART REPLICA database.table_name;

-- Verify recovery
SELECT 
    database,
    table,
    is_readonly,
    last_queue_update_exception
FROM system.replicas
WHERE table = 'table_name';
```

**3. Check Keeper/ZooKeeper connectivity**

```sql
-- Verify Keeper is accessible
SELECT *
FROM system.zookeeper
WHERE path = '/clickhouse'
LIMIT 5;

-- Check for recent Keeper exceptions
SELECT 
    event_time,
    message
FROM system.text_log
WHERE level = 'Error'
  AND message LIKE '%KEEPER_EXCEPTION%'
  AND event_time > now() - INTERVAL 1 HOUR
ORDER BY event_time DESC
LIMIT 10;
```

**4. Force restore data (use with caution)**

This forces the replica to reinitialize from ZooKeeper, discarding suspicious local parts.

```bash
# Connect to Keeper pod (ClickHouse Cloud or self-hosted)
kubectl exec -it c-{service}-keeper-0 -n ns-{service} -- bash

# Use keeper-client
clickhouse keeper-client -h 0.0.0.0 -p 2181

# In keeper-client, create the flag node
create /clickhouse/tables/{table_uuid}/default/replicas/{replica_name}/flags/force_restore_data ""

# Exit keeper-client and restart the ClickHouse server
# Kubernetes:
kubectl delete pod c-{service}-server-0 -n ns-{service}

# Systemctl:
sudo systemctl restart clickhouse-server
```

**5. Fix metadata mismatch**

When you see: `Existing table metadata in ZooKeeper differs in TTL`

```bash
# Connect to Keeper
clickhouse keeper-client -h 0.0.0.0 -p 2181

# View current metadata
get /clickhouse/databases/{db_uuid}/metadata/{table_name}

# Set corrected metadata (example for TTL fix)
set "/clickhouse/databases/{db_uuid}/metadata/{table_name}" "ATTACH TABLE _ UUID '{table_uuid}'
(
    `column1` String,
    `column2` UInt64,
    `timestamp` DateTime
)
ENGINE = SharedMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}')
ORDER BY column1
TTL toStartOfHour(timestamp) + toIntervalHour(24)
SETTINGS index_granularity = 8192
"
```

Then restart the server for changes to take effect.

**6. Detach and reattach table**

```sql
-- Detach table (stops all operations)
DETACH TABLE database.table_name;

-- Reattach table (forces reinitialization)
ATTACH TABLE database.table_name;

-- Verify status
SELECT is_readonly FROM system.replicas WHERE table = 'table_name';
```

**7. Clean up broken parts**

```sql
-- Check for parts in problematic states
SELECT 
    database,
    table,
    name,
    active,
    marks,
    rows
FROM system.parts
WHERE database = 'your_database'
  AND table = 'your_table'
  AND active = 0;

-- Drop specific broken part (use with caution)
ALTER TABLE database.table_name DROP PART 'part_name';
```

## Common scenarios {#common-scenarios}

**Scenario 1: Keeper connection timeout**

```text
Code: 242. DB::Exception: Table is in readonly mode (replica path: /clickhouse/tables/{uuid}/default/replicas/c-server-0). 
(TABLE_IS_READ_ONLY)
```

**Cause:** Keeper/ZooKeeper session expired during operation.

**Solution:**

```sql
-- Check Keeper connectivity
SELECT * FROM system.zookeeper WHERE path = '/clickhouse' LIMIT 1;

-- Restart replica
SYSTEM RESTART REPLICA database.table_name;

-- If persists, check Keeper cluster health
-- May need to increase session timeout in config
```

**Scenario 2: Metadata mismatch after ALTER**

```text
Error: Existing table metadata in ZooKeeper differs in TTL
Table is in readonly mode
```

**Cause:** Failed ALTER TABLE operation left inconsistent metadata between local replica and ZooKeeper.

**Solution:**

```sql
-- Option 1: Try restarting replica first
SYSTEM RESTART REPLICA database.table_name;

-- Option 2: If restart doesn't work, manually fix metadata in Keeper
-- Use keeper-client to correct the metadata (see solution #5 above)

-- Option 3: Force restore data
-- Create force_restore_data flag in Keeper (see solution #4 above)
```

**Scenario 3: Suspicious parts on startup**

```text
Error: The local set of parts doesn't look like the set of parts in ZooKeeper: 
6.23 million rows are suspicious
Table is in readonly mode
```

**Cause:** Too many parts locally don't match what ZooKeeper expects, often after unclean shutdown or data corruption.

**Solution:**

```sql
-- Check part status
SELECT 
    name,
    active,
    rows,
    modification_time
FROM system.parts
WHERE table = 'your_table'
ORDER BY modification_time DESC
LIMIT 20;

-- Force restore from ZooKeeper
-- Create force_restore_data flag in Keeper (see solution #4 above)
-- This will discard suspicious local parts and resync
```

**Scenario 4: Part validation failure**

```text
Error: Cannot read all marks from file
ATTEMPT_TO_READ_AFTER_EOF
Table is in readonly mode
```

**Cause:** Corrupted data files or mark files preventing part from loading.

**Solution:**

```sql
-- Identify broken parts
SELECT 
    name,
    path,
    modification_time
FROM system.parts
WHERE table = 'your_table'
  AND active = 0;

-- Option 1: Drop broken part and fetch from another replica
ALTER TABLE database.table_name DROP PART 'broken_part_name';
SYSTEM SYNC REPLICA database.table_name;

-- Option 2: Force restore entire replica
-- Create force_restore_data flag in Keeper (see solution #4 above)
```

**Scenario 5: Concurrent ALTER cancelling INSERT**

```text
Error: Insert query was cancelled by concurrent ALTER PARTITION
Table is in readonly mode
```

**Cause:** ALTER PARTITION operation interfered with ongoing INSERT, putting replica in protective read-only mode.

**Solution:**

```sql
-- Check for ongoing mutations or merges
SELECT * FROM system.mutations WHERE is_done = 0;
SELECT * FROM system.merges;

-- Restart replica to recover
SYSTEM RESTART REPLICA database.table_name;

-- To prevent: Coordinate ALTER operations to avoid conflicts
-- Use SYNC modifier to wait for completion
ALTER TABLE database.table_name DROP PARTITION 'partition_id' SYNC;
```

**Scenario 6: Disk space exhaustion**

```text
Error: Not enough space on disk
Table is in readonly mode
```

**Cause:** Insufficient disk space triggered readonly protection.

**Solution:**

```sql
-- Check disk usage
SELECT 
    name,
    path,
    formatReadableSize(free_space) AS free,
    formatReadableSize(total_space) AS total,
    round(free_space / total_space * 100, 2) AS free_percent
FROM system.disks;

-- Free up space by dropping old partitions
ALTER TABLE database.table_name DROP PARTITION 'old_partition_id';

-- Or increase disk capacity (ClickHouse Cloud)
-- Contact support to expand storage
```