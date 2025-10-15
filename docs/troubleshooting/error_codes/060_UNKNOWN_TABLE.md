---
slug: /troubleshooting/error-codes/060_UNKNOWN_TABLE
sidebar_label: '060 UNKNOWN_TABLE'
doc_type: 'reference'
keywords: ['error codes', 'UNKNOWN_TABLE', '060']
title: '060 UNKNOWN_TABLE'
description: 'ClickHouse error code - 060 UNKNOWN_TABLE'
---

# Error 60: UNKNOWN_TABLE

:::tip
This error occurs when a query references a table that does not exist in the specified database.
It indicates that ClickHouse cannot find the table you're trying to access, either because it was never created, has been dropped, or you're referencing the wrong database.
:::

## Most common causes {#most-common-causes}

1. **Table name typo**
    - Misspelled table name
    - Incorrect capitalization (table names are case-sensitive)
    - Extra or missing characters in table name

2. **Wrong database context**
    - Querying a table in the wrong database
    - Database parameter not set correctly
    - Using table name without database prefix when not in the correct database context

3. **Table was dropped or renamed**
    - Table was deleted by another process
    - Table was renamed and old name is still being used
    - Temporary tables that have expired

4. **Incorrect database/table specification in connection**
    - HTTP interface with wrong `database` parameter
    - Wrong `X-ClickHouse-Database` header
    - JDBC/ODBC connection string with incorrect database

5. **Client or ORM confusion**
    - Client libraries using table name as database name
    - ORM frameworks misinterpreting table references
    - Query builders constructing incorrect table paths

6. **Distributed table or cluster issues**
    - Local table missing on some cluster nodes
    - Distributed table pointing to non-existent local tables
    - Replication lag causing temporary table unavailability

## Common solutions {#common-solutions}

**1. Verify the table exists**

```sql
-- List all tables in current database
SHOW TABLES;

-- List tables in specific database
SHOW TABLES FROM your_database;

-- Search for table across all databases
SELECT database, name 
FROM system.tables 
WHERE name LIKE '%your_table%';
```

**2. Use fully qualified table names**

```sql
-- WRONG: Ambiguous or missing database context
SELECT * FROM my_table;

-- CORRECT: Fully qualified table name
SELECT * FROM my_database.my_table;
```

**3. Check current database context**

```sql
-- See current database
SELECT currentDatabase();

-- Switch to correct database
USE your_database;

-- Or set database in connection string/parameters
```

**4. Verify HTTP interface database parameter**

```bash
# WRONG: Using table name as database parameter
curl 'http://localhost:8123/?database=my_table' -d 'SELECT * FROM my_table'

# CORRECT: Using correct database name
curl 'http://localhost:8123/?database=my_database' -d 'SELECT * FROM my_table'
```

**5. Check for distributed table issues**

```sql
-- Verify distributed table configuration
SELECT * FROM system.tables 
WHERE name = 'your_distributed_table' 
AND engine = 'Distributed';

-- Check if local tables exist on all nodes
SELECT 
    hostName(),
    database,
    name
FROM clusterAllReplicas('your_cluster', system.tables)
WHERE name = 'your_local_table';
```

**6. Look for similar table names**

Newer ClickHouse versions suggest similar table names:

```sql
-- If table doesn't exist, ClickHouse may suggest:
-- "Table doesn't exist. Maybe you meant: 'similar_table_name'"
```

## Common scenarios {#common-scenarios}

**Scenario 1: Client using table name as database name**

```
Error: Database my_table doesn't exist
```

**Cause:** HTTP client or ORM incorrectly passing table name as database parameter.

**Solution:** Check connection parameters and ensure `database` parameter contains the database name, not table name.

**Scenario 2: Missing distributed local tables**

```
Error: Table default.my_table_local doesn't exist
```

**Cause:** Distributed table configured but local tables don't exist on some cluster nodes.

**Solution:**

```sql
-- Create local table on all nodes
CREATE TABLE my_table_local ON CLUSTER your_cluster
(...) ENGINE = MergeTree() ...;
```

**Scenario 3: Temporary table expired**
```
Error: Table default.my_temp_table_1681159380741 doesn't exist
```

**Cause:** Temporary table was created by a process that has ended, or it expired.

**Solution:** Recreate the temporary table or check the process that creates it.

**Scenario 4: Wrong database context**

```
Error: Table default.my_table doesn't exist
```

But table exists in `production` database.

**Solution:**

```sql
-- Specify database explicitly
SELECT * FROM production.my_table;

-- Or switch database
USE production;
SELECT * FROM my_table;
```

**Scenario 5: Integration table disappeared**

```
Error: Table 'source_db.source_table' doesn't exist
```

**Cause:** Source table in external system (PostgreSQL/MySQL) was dropped.

**Solution:** Verify source table exists in source system and recreate ClickHouse integration if needed.

## Prevention tips {#prevention-tips}

1. **Always use fully qualified names:** Use `database.table` syntax in production code
2. **Verify table existence before queries:** Use `IF EXISTS` checks in scripts
3. **Set database context explicitly:** Don't rely on default database
4. **Use table existence checks:** Especially in automated processes
5. **Monitor table changes:** Track table creation/deletion events
6. **Document table dependencies:** Especially for distributed setups

## Debugging steps {#debugging-steps}

1. **List all available tables:**
   ```sql
   SHOW TABLES;
   ```

2. **Search for table across databases:**

   ```sql
   SELECT database, name, engine
   FROM system.tables
   WHERE name = 'your_table';
   ```

3. **Check current database:**

   ```sql
   SELECT currentDatabase();
   ```

4. **Verify connection parameters:**
    - Check HTTP `database` parameter
    - Verify `X-ClickHouse-Database` header
    - Review JDBC/ODBC connection string

5. **For distributed tables, check cluster:**

   ```sql
   -- See cluster configuration
   SELECT * FROM system.clusters WHERE cluster = 'your_cluster';
   
   -- Check table exists on all nodes
   SELECT hostName(), count()
   FROM clusterAllReplicas('your_cluster', system.tables)
   WHERE database = 'your_db' AND name = 'your_table'
   GROUP BY hostName();
   ```

6. **Check recent table operations:**

   ```sql
   SELECT 
       event_time,
       query,
       query_kind,
       databases,
       tables
   FROM system.query_log
   WHERE (has(tables, 'your_table') OR query LIKE '%your_table%')
     AND query_kind IN ('Create', 'Drop', 'Rename')
   ORDER BY event_time DESC
   LIMIT 10;
   ```

## Special considerations {#special-considerations}

**For HTTP interface users:**
- The `database` parameter specifies which database to use
- This is NOT the table name
- Common issue with ORMs and query builders

**For distributed tables:**
- The distributed table must exist
- Local tables must exist on all cluster nodes
- Use `ON CLUSTER` clause when creating tables

**For temporary tables:**
- Temporary tables are session-specific
- They disappear when the session ends
- Named with timestamps are often temp tables

**For integrations (MySQL/PostgreSQL):**
- Verify source table exists in source system
- Check connection to source system
- Review materialized view or integration configuration

If you're experiencing this error:
1. Double-check the table name for typos
2. Verify you're querying the correct database
3. Use fully qualified table names (`database.table`)
4. Check connection parameters (especially for HTTP interface)
5. Verify the table actually exists using `SHOW TABLES`
6. For distributed setups, check all cluster nodes
