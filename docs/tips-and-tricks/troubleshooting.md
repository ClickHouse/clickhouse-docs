---
sidebar_position: 1
slug: /tips-and-tricks/troubleshooting
sidebar_label: 'Troubleshooting'
doc_type: 'reference'
keywords: [
  'clickhouse troubleshooting',
  'clickhouse errors',
  'database troubleshooting',
  'clickhouse connection issues',
  'memory limit exceeded',
  'clickhouse performance problems',
  'database error messages',
  'clickhouse configuration issues',
  'connection refused error',
  'clickhouse debugging',
  'database connection problems',
  'troubleshooting guide'
]
title: 'Troubleshooting Common Issues'
description: 'Find solutions to the most common ClickHouse problems including slow queries, memory errors, connection issues, and configuration problems.'
---

# Troubleshooting common issues {#troubleshooting-common-issues}

Having problems with ClickHouse? Find the solutions to common issues here.

## Performance and errors {#performance-and-errors}

Queries running slowly, timeouts, or getting specific error messages like "Memory limit exceeded" or "Connection refused."

<details>
<summary><strong>Show performance and error solutions</strong></summary>

### Query performance {#query-performance}
- [Find which queries are using the most resources](/knowledgebase/find-expensive-queries)
- [Complete query optimization guide](/docs/optimize/query-optimization)
- [Optimize JOIN operations](/docs/best-practices/minimize-optimize-joins)
- [Run diagnostic queries to find bottlenecks](/docs/knowledgebase/useful-queries-for-troubleshooting)
<br/>
### Data insertion performance {#data-insertion-performance}
- [Speed up data insertion](/docs/optimize/bulk-inserts)
- [Set up asynchronous inserts](/docs/optimize/asynchronous-inserts)
<br/>
### Advanced analysis tools {#advanced-analysis-tools}
<!-- - [Profile with LLVM XRay](/docs/knowledgebase/profiling-clickhouse-with-llvm-xray) -->
- [Check what processes are running](/docs/knowledgebase/which-processes-are-currently-running)
- [Monitor system performance](/docs/operations/system-tables/processes)
<br/>
### Error messages {#error-messages}
- **"Memory limit exceeded"** → [Debug memory limit errors](/docs/guides/developer/debugging-memory-issues)
- **"Connection refused"** → [Fix connection problems](#connections-and-authentication)
- **"Login failures"** → [Set up users, roles, and permissions](/docs/operations/access-rights)
- **"SSL certificate errors"** → [Fix certificate problems](/docs/knowledgebase/certificate_verify_failed_error)
- **"Table/database errors"** → [Database creation guide](/docs/sql-reference/statements/create/database) | [Table UUID problems](/docs/engines/database-engines/atomic)
- **"Network timeouts"** → [Network troubleshooting](/docs/interfaces/http)
- **Other issues** → [Track errors across your cluster](/docs/operations/system-tables/errors)
</details>

## Memory and resources {#memory-and-resources}

High memory usage, out-of-memory crashes, or need help sizing your ClickHouse deployment.

<details>
<summary><strong>Show memory solutions</strong></summary>

### Memory debugging and monitoring: {#memory-debugging-and-monitoring}
- [Identify what's using memory](/docs/guides/developer/debugging-memory-issues)
- [Check current memory usage](/docs/operations/system-tables/processes)
- [Memory allocation profiling](/docs/operations/allocation-profiling)
- [Analyze memory usage patterns](/docs/operations/system-tables/query_log)
<br/>
### Memory configuration: {#memory-configuration}
- [Configure memory limits](/docs/operations/settings/memory-overcommit)
- [Server memory settings](/docs/operations/server-configuration-parameters/settings)
- [Session memory settings](/docs/operations/settings/settings)
<br/>
### Scaling and sizing: {#scaling-and-sizing}
- [Right-size your service](/docs/operations/tips)
- [Configure automatic scaling](/docs/manage/scaling)

</details>

## Connections and Authentication {#connections-and-authentication}

Can't connect to ClickHouse, authentication failures, SSL certificate errors, or client setup issues.

<details>
<summary><strong>Show connection solutions</strong></summary>

### Basic Connection issues {#basic-connection-issues}
- [Fix HTTP interface issues](/docs/interfaces/http)
- [Handle SSL certificate problems](/docs/knowledgebase/certificate_verify_failed_error)
- [User authentication setup](/docs/operations/access-rights)
<br/>
### Client interfaces {#client-interfaces}
- [Native ClickHouse clients](/docs/interfaces/natives-clients-and-interfaces)
- [MySQL interface problems](/docs/interfaces/mysql)
- [PostgreSQL interface issues](/docs/interfaces/postgresql)
- [gRPC interface configuration](/docs/interfaces/grpc)
- [SSH interface setup](/docs/interfaces/ssh)
<br/>
### Network and data {#network-and-data}
- [Network security settings](/docs/operations/server-configuration-parameters/settings)
- [Data format parsing issues](/docs/interfaces/formats)

</details>

## Setup and configuration {#setup-and-configuration}

Initial installation, server configuration, database creation, data ingestion issues, or replication setup.

<details>
<summary><strong>Show setup and configuration solutions</strong></summary>

### Initial setup {#initial-setup}
- [Configure server settings](/docs/operations/server-configuration-parameters/settings)
- [Set up security and access control](/docs/operations/access-rights)
- [Configure hardware properly](/docs/operations/tips)
<br/>
### Database management {#database-management}
- [Create and manage databases](/docs/sql-reference/statements/create/database)
- [Choose the right table engine](/docs/engines/table-engines)
<!-- - [Modify schemas safely](/docs/sql-reference/statements/alter/index) -->
<br/>
### Data operations {#data-operations}
- [Optimize bulk data insertion](/docs/optimize/bulk-inserts)
- [Handle data format problems](/docs/interfaces/formats)
- [Set up streaming data pipelines](/docs/optimize/asynchronous-inserts)
- [Improve S3 integration performance](/docs/integrations/s3/performance)
<br/>
### Advanced configuration {#advanced-configuration}
- [Set up data replication](/docs/engines/table-engines/mergetree-family/replication)
- [Configure distributed tables](/docs/engines/table-engines/special/distributed)
<!-- - [ClickHouse Keeper setup](/docs/guides/sre/keeper/index.md) -->
- [Set up backup and recovery](/docs/operations/backup)
- [Configure monitoring](/docs/operations/system-tables/overview)

</details>

## Still need help? {#still-need-help}

If you can't find a solution:

1. **Ask AI** - <KapaLink>Ask AI</KapaLink> for instant answers.
1. **Check system tables** - Run `SELECT * FROM system.processes` and `SELECT * FROM system.query_log ORDER BY event_time DESC LIMIT 10`
2. **Review server logs** - Look for error messages in your ClickHouse logs
3. **Ask the community** - [Join Our Community Slack](https://clickhouse.com/slack), [GitHub Discussions](https://github.com/ClickHouse/ClickHouse/discussions)
4. **Get professional support** - [ClickHouse Cloud support](https://clickhouse.com/support)