---
sidebar_label: 'Publication Management'
description: 'Best practices for managing PostgreSQL publications with ClickPipes'
slug: /integrations/clickpipes/postgres/source/publication-management
title: 'PostgreSQL Publication Management for ClickPipes'
---

# PostgreSQL Publication Management for ClickPipes

This guide covers best practices and considerations for managing PostgreSQL publications when using ClickPipes for data replication.

## Publication Creation Options {#publication-creation-options}

You have two main approaches for managing publications with ClickPipes:

### Option 1: Automatic Publication Creation (Let ClickPipes Manage It) {#automatic-publication-creation}

If you want ClickPipes to handle publication management and not worry about the intricacies of PostgreSQL publications, simply **don't specify a publication** during ClickPipe creation. ClickPipes will automatically create a publication scoped to only the tables you select for replication.

**Requirements:**
- The ClickPipes user must have **table owner permissions** for all tables you want to replicate

**Advantages:**
- No manual publication management required
- Publication is automatically scoped to only selected tables
- Same cost-effective billing as table-specific publications (only pay for selected tables)
- Easiest approach for getting started

**Disadvantages:**
- Requires higher privileges (table owner permissions)
- If you add tables to the pipe later, ClickPipes will need to modify the publication, requiring continued owner permissions

### Option 2: Manual Publication Creation (Recommended for Production) {#manual-publication-creation}

Create and manage the publication yourself before setting up the ClickPipe.

#### Table-Specific Publication (Recommended) {#table-specific-publication}

```sql
-- Create a publication for specific tables you wish to replicate
-- Replace 'schema.table1', 'schema.table2' with your actual schema and table names
CREATE PUBLICATION clickpipes_publication FOR TABLE schema.table1, schema.table2;
```

**Advantages:**
- Fine-grained control over which tables are included
- Only requires SELECT permissions on tables (not ownership)
- Clear visibility into what data will be replicated
- Same cost-effective billing as automatic creation (only pay for selected tables)

**Disadvantages:**
- Manual management required
- Must update publication when adding/removing tables from replication

#### All-Tables Publication (Use with Caution) {#all-tables-publication}

```sql
-- Creates publication for all current and future tables
CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

**Important Considerations:**
- Though ClickPipes will only replicate tables you select in the UI, PostgreSQL will send data changes from **all tables** over the network
- **You will be billed for the extra bytes** from tables you don't actually need
- This approach is generally not recommended for production use

## Permission Requirements {#permission-requirements}

### For Automatic Publication Creation {#automatic-permissions}
```sql
-- Grant table ownership (required for automatic publication creation)
ALTER TABLE schema.table1 OWNER TO clickpipes_user;
ALTER TABLE schema.table2 OWNER TO clickpipes_user;
```

### For Manual Publication Creation {#manual-permissions}
```sql
-- Minimal permissions (sufficient for manual publication approach)
GRANT USAGE ON SCHEMA "your_schema" TO clickpipes_user;
GRANT SELECT ON TABLE schema.table1, schema.table2 TO clickpipes_user;
ALTER USER clickpipes_user REPLICATION;

-- If you need to grant permissions for future tables in the schema:
ALTER DEFAULT PRIVILEGES IN SCHEMA "your_schema" GRANT SELECT ON TABLES TO clickpipes_user;
```

## Managing Publications Over Time {#managing-publications-over-time}

### Adding Tables to an Existing Publication {#adding-tables}

If you need to add tables to your ClickPipe later:

```sql
-- Add a single table
ALTER PUBLICATION clickpipes_publication ADD TABLE schema.new_table;

-- Add multiple tables
ALTER PUBLICATION clickpipes_publication ADD TABLE schema.table3, schema.table4;
```

### Removing Tables from a Publication {#removing-tables}

```sql
-- Remove a single table
ALTER PUBLICATION clickpipes_publication DROP TABLE schema.old_table;

-- Remove multiple tables
ALTER PUBLICATION clickpipes_publication DROP TABLE schema.table3, schema.table4;
```

### Viewing Publication Contents {#viewing-publication-contents}

```sql
-- See which tables are in your publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'clickpipes_publication';

-- See all publications
SELECT * FROM pg_publication;
```

## Best Practices {#best-practices}

1. **Choose either automatic creation or table-specific publications** for production workloads - both provide the same cost control, with automatic being easier and manual providing more control

2. **Use automatic creation** when you want ClickPipes to handle publication management and don't mind granting table owner privileges

3. **Plan your table selection carefully** - adding/removing tables later requires publication changes

4. **Avoid all-tables publications** unless you specifically need all tables - this is the only approach that increases costs

5. **Monitor your data usage** to ensure you're only paying for data you actually need

6. **Document your publication strategy** so team members understand the setup

## Billing Implications {#billing-implications}

- **Table-specific publications**: You pay only for data changes from explicitly listed tables
- **Automatic creation**: You pay only for data changes from selected tables (same cost as table-specific)
- **All-tables publications**: You pay for data changes from **all tables** in the database, even if ClickPipes only processes a subset - this is the costly approach to avoid

## Additional Resources {#additional-resources}

For more advanced publication options and syntax, see the [PostgreSQL documentation](https://www.postgresql.org/docs/current/sql-createpublication.html).

## Troubleshooting {#troubleshooting}

### Permission Errors {#permission-errors}
If you encounter permission errors:
1. Verify the ClickPipes user has the required permissions for your chosen approach
2. Check that the publication exists and contains the expected tables
3. Ensure the user has REPLICATION privileges

### Unexpected Billing {#unexpected-billing}
If you're seeing higher than expected data transfer costs:
1. Check if you're using an all-tables publication unintentionally
2. Verify your publication only contains the tables you need
3. Monitor which tables are actively changing in your database