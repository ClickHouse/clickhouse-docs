---
sidebar_label: 'Database audit log'
slug: /cloud/security/audit-logging/database-audit-log
title: 'Database audit log'
description: 'This page describes how users can review the database audit log'
doc_type: 'guide'
keywords: ['audit logging', 'database logs', 'compliance', 'security', 'monitoring']
---

# Database audit log {#database-audit-log}

ClickHouse provides database audit logs by default. This page focuses on security relevant logs. For more information on data recorded by the system, refer to the docs for [system tables](/operations/system-tables/overview).

:::tip Log retention
Information is logged directly to the system tables and are retained for up to 30 days by default. This period can be longer or shorter and is affected by the frequency of merges in the system. Customers may take additional measures to store logs for longer or export logs to a security information and event management (SIEM) system for long term storage. Details below.
:::

## Security relevant logs {#security-relevant-logs}

ClickHouse logs security relevant database events primarily to session and query logs. 

The [system.session_log](/operations/system-tables/session_log) records successful and failed login attempts, as well as the location of the authentication attempt. This information can be used to identify credential stuffing or brute force attacks against a ClickHouse instance.

Sample query showing login failures
```sql
select event_time
    ,type
    ,user
    ,auth_type
    ,client_address 
FROM clusterAllReplicas('default',system.session_log) 
WHERE type='LoginFailure' 
LIMIT 100
```

The [system.query_log](/operations/system-tables/query_log) captures query activity executed in a ClickHouse instance. This information can be useful to determine what queries a threat actor executed.

Sample query to search for activities of a "compromised_account" user
```sql
SELECT event_time
    ,address
    ,initial_user
    ,initial_address
    ,forwarded_for
    ,query 
FROM clusterAllReplicas('default', system.query_log) 
WHERE user=’compromised_account’
```

## Retaining log data within services {#reatining-log-data-within-services}

Customers needing longer retention or log durability can use materialized views to achieve these objectives. For more information on materialized views, what they are, benefits and how to implement review our [materialized views](/materialized-views) videos and documentation.

## Exporting logs {#exporting-logs}

System logs may be written or exported to a storage location using various formats that are compatible with SIEM systems. For more information, review our [table functions](/sql-reference/table-functions) docs. The most common methods are:
- [Write to S3](/sql-reference/table-functions/s3)
- [Write to GCS](/sql-reference/table-functions/gcs)
- [Write to Azure Blob Storage](/sql-reference/table-functions/azureBlobStorage)
