---
slug: /troubleshooting/error-codes/081_UNKNOWN_DATABASE
sidebar_label: '081 UNKNOWN_DATABASE'
doc_type: 'reference'
keywords: ['error codes', 'UNKNOWN_DATABASE', '081']
title: '081 UNKNOWN_DATABASE'
description: 'ClickHouse error code - 081 UNKNOWN_DATABASE'
---

# Error 81: UNKNOWN_DATABASE

:::tip
This error occurs when you attempt to access a database that doesn't exist, hasn't been created yet, or that you don't have permission to access.
This can happen due to typos, missing database creation steps, permission restrictions, or issues in distributed cluster configurations.
:::

## Most common causes {#most-common-causes}

1. **Database doesn't exist**
   - Typo in database name
   - Database not created yet (missing `CREATE DATABASE` step)
   - Database was dropped or deleted
   - Wrong database name in connection string or queries

2. **Permission and access issues**
   - User lacks permissions to access the database
   - Database exists but user's `GRANTS` don't include it
   - Row-level security or access policies restricting visibility
   - Cloud organization or service-level access restrictions

3. **Case sensitivity and naming issues**
   - Database name case mismatch (especially in distributed setups)
   - Special characters or reserved words in database names
   - Unquoted database names with spaces or special chars
   - Unicode or non-ASCII characters in names

4. **Distributed and cluster issues**
   - Database doesn't exist on all cluster nodes
   - Shard-specific database missing on some replicas
   - Cross-cluster query referencing database on other cluster
   - Materialized views or dictionaries referencing missing databases

5. **Connection and context issues**
   - Connected to wrong ClickHouse server or instance
   - Default database not set in connection
   - Database specified in connection string doesn't exist
   - Using wrong credentials or connection profile

6. **Schema migration and timing issues**
   - Scripts running before database creation completes
   - Race conditions in parallel migrations
   - Database dropped and recreated causing timing gaps
   - Incomplete rollback leaving references to deleted databases

## Common solutions {#common-solutions}

**1. Verify database exists and create if missing**

```sql
-- Error: Database 'analytics' doesn't exist
SELECT * FROM analytics.events;

-- Solution: Check if database exists
SHOW DATABASES LIKE 'analytics';

-- Create the database if missing
CREATE DATABASE IF NOT EXISTS analytics;

-- Then query the table
SELECT * FROM analytics.events;
```

**2. List available databases**

```sql
-- Check all databases you have access to
SHOW DATABASES;

-- Or query system table
SELECT name FROM system.databases ORDER BY name;

-- Check specific database with pattern
SHOW DATABASES LIKE '%prod%';
```

**3. Fix database name typos**

```sql
-- Error: Database 'analtyics' doesn't exist (typo)
USE analtyics;

-- Solution: Use correct spelling
USE analytics;

-- For queries, use correct database name
SELECT * FROM analytics.events WHERE date = today();
```

**4. Use qualified table names**

```sql
-- Error: Can occur if current database not set
SELECT * FROM events;

-- Solution: Always qualify table names with database
SELECT * FROM analytics.events;

-- Or set default database
USE analytics;
SELECT * FROM events;
```

**5. Check and grant permissions**

```sql
-- Error: User doesn't have access to database
SELECT * FROM restricted_db.sensitive_data;

-- Solution: Check current user's grants
SHOW GRANTS;

-- As admin, grant access to the database
GRANT SELECT ON restricted_db.* TO username;

-- Grant all privileges on database
GRANT ALL ON restricted_db.* TO username;

-- Create database and grant in one workflow
CREATE DATABASE IF NOT EXISTS analytics;
GRANT SELECT, INSERT ON analytics.* TO app_user;
```

**6. Handle case-sensitive database names**

```sql
-- Error: Database 'Analytics' vs 'analytics' mismatch
SELECT * FROM Analytics.events;

-- Solution: Use exact case as stored
SELECT name FROM system.databases WHERE name ILIKE 'analytics';

-- Always use consistent casing
SELECT * FROM analytics.events;

-- Or quote if using mixed case
CREATE DATABASE "MyDatabase";
SELECT * FROM "MyDatabase".events;
```

**7. Create database on all cluster nodes**

```sql
-- Error: Database exists on some nodes but not all
SELECT * FROM cluster('my_cluster', analytics.events);

-- Solution: Create database on all nodes using ON CLUSTER
CREATE DATABASE IF NOT EXISTS analytics ON CLUSTER my_cluster;

-- Verify database exists on all nodes
SELECT 
    hostName(),
    name as database
FROM clusterAllReplicas('my_cluster', system.databases)
WHERE name = 'analytics';

-- Create tables on cluster
CREATE TABLE analytics.events ON CLUSTER my_cluster
(
    timestamp DateTime,
    user_id UInt64,
    event String
)
ENGINE = ReplicatedMergeTree()
ORDER BY (timestamp, user_id);
```

**8. Fix materialized view references**

```sql
-- Error: Materialized view references non-existent database
CREATE MATERIALIZED VIEW analytics.daily_summary
ENGINE = SummingMergeTree()
ORDER BY date
AS SELECT 
    date,
    count() as events
FROM old_database.events  -- This database was dropped
GROUP BY date;

-- Solution: Create missing database or update reference
-- Option 1: Create the missing database
CREATE DATABASE IF NOT EXISTS old_database;

-- Option 2: Update materialized view to reference correct database
DROP VIEW IF EXISTS analytics.daily_summary;
CREATE MATERIALIZED VIEW analytics.daily_summary
ENGINE = SummingMergeTree()
ORDER BY date
AS SELECT 
    date,
    count() as events
FROM analytics.events  -- Correct database
GROUP BY date;
```

**9. Handle database in connection strings**

```sql
-- Error: Connection string specifies non-existent database
-- Connection: clickhouse://localhost:9000/nonexistent_db

-- Solution: Create database first or use existing one
-- Option 1: Create the database
CREATE DATABASE IF NOT EXISTS nonexistent_db;

-- Option 2: Connect without specifying database
-- Connection: clickhouse://localhost:9000/
-- Then specify database in queries

-- Option 3: Use default database
-- Connection: clickhouse://localhost:9000/default
```

**10. Verify database in migrations**

```sql
-- Error: Migration script assumes database exists
-- migration.sql
INSERT INTO analytics.events VALUES (...);

-- Solution: Always include database creation
-- migration.sql
CREATE DATABASE IF NOT EXISTS analytics;

-- Wait for creation to propagate in cluster environments
SYSTEM SYNC REPLICA analytics.events;

INSERT INTO analytics.events VALUES (...);
```

**11. Handle special characters in database names**

```sql
-- Error: Database with special characters not properly quoted
SELECT * FROM my-database.events;

-- Solution: Quote database names with special characters
SELECT * FROM `my-database`.events;

-- Better: Use underscores instead of hyphens
CREATE DATABASE my_database;
SELECT * FROM my_database.events;

-- Avoid spaces and special characters
CREATE DATABASE analytics_prod;  -- Good
-- CREATE DATABASE "analytics prod"; -- Works but not recommended
```

**12. Check database engine and access**

```sql
-- Some database engines may have special access requirements
-- Check database engine
SELECT 
    name,
    engine,
    data_path
FROM system.databases
WHERE name = 'analytics';

-- For MySQL/PostgreSQL database engines, verify connection
-- Error may occur if external database connection fails
CREATE DATABASE mysql_db
ENGINE = MySQL('remote_host:3306', 'database', 'user', 'password');

-- Test access
SELECT * FROM mysql_db.table LIMIT 1;

-- If connection fails, check credentials and connectivity
```

**13. Handle dropped database scenarios**

```sql
-- Error: Database was dropped but objects still reference it
-- Check for dependent objects
SELECT 
    database,
    name,
    engine,
    create_table_query
FROM system.tables
WHERE create_table_query LIKE '%old_database%';

-- Solution: Recreate database or update references
-- Option 1: Recreate the database
CREATE DATABASE old_database;

-- Option 2: Find and update all references
-- Drop dependent materialized views
DROP VIEW dependent_view;

-- Recreate with correct references
CREATE MATERIALIZED VIEW dependent_view AS
SELECT * FROM correct_database.events;
```

## Prevention tips {#prevention-tips}

1. **Always use `IF NOT EXISTS` in database creation**: Include `CREATE DATABASE IF NOT EXISTS` in all migration scripts and initialization code to prevent errors when database already exists
2. **Use qualified table names**: Always prefix table names with database names (`database.table`) to avoid ambiguity and make queries more portable across different contexts
3. **Verify database existence before operations**: In scripts and applications, check database existence using `SHOW DATABASES` or query `system.databases` before performing operations
4. **Use consistent naming conventions**: Adopt lowercase naming without special characters for databases to avoid case sensitivity and quoting issues across different environments
5. **Create databases `ON CLUSTER`**: In clustered environments, always use `ON CLUSTER` clause when creating databases to ensure consistency across all nodes
6. **Document database dependencies**: Maintain clear documentation of which databases are required by your tables, views, and applications, especially for materialized views and dictionaries
7. **Implement proper error handling**: In application code, catch `UNKNOWN_DATABASE` errors and provide clear messages to users, potentially with automatic database creation logic
8. **Test migrations in staging**: Always test database creation and migration scripts in staging environments that mirror production to catch missing database issues early
9. **Use configuration management**: Store database creation scripts in version control and use infrastructure-as-code tools to ensure databases exist before deploying dependent resources
10. **Monitor database permissions**: Regularly audit user permissions to databases using `SHOW GRANTS` to ensure users have appropriate access and identify permission-related issues early

## Related error codes {#related-error-codes}

- [UNKNOWN_TABLE (60)](/troubleshooting/error-codes/060_UNKNOWN_TABLE) - Table doesn't exist in database
- [ACCESS_DENIED (497)](/troubleshooting/error-codes/497_ACCESS_DENIED) - Insufficient permissions to access resource
- [DATABASE_ALREADY_EXISTS (82)](/troubleshooting/error-codes/082_DATABASE_ALREADY_EXISTS) - Attempting to create existing database
- [UNKNOWN_IDENTIFIER (47)](/troubleshooting/error-codes/047_UNKNOWN_IDENTIFIER) - Column or identifier not found