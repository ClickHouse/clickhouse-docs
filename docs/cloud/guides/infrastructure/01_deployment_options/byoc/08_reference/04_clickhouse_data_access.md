---
title: 'ClickHouse data access'
slug: /cloud/reference/byoc/reference/clickhouse_data_access
sidebar_label: 'ClickHouse data access'
keywords: ['BYOC', 'bring your own cloud', 'data access', 'employee access', 'system.query_log', 'troubleshooting access', 'compliance']
description: 'What access ClickHouse employees have to customer data in BYOC deployments'
doc_type: 'reference'
---

ClickHouse employees have no access to your data by default. Your ClickHouse data, including all user tables and query results, stays inside your VPC. The only paths by which ClickHouse interacts with your deployment are described below — none of them grant access to customer table data.

## Routine operations {#routine-operations}

ClickHouse Cloud's control plane runs your BYOC deployment without reading customer data. The components that send data out of your VPC carry only operational metadata:

| Component | What leaves your VPC |
|-----------|----------------------|
| State exporter | Service state (health, status) to an SQS queue owned by ClickHouse Cloud. |
| Billing scraper | CPU and memory metrics to an S3 bucket owned by ClickHouse Cloud. |
| AlertManager | Cluster health alerts to ClickHouse Cloud. |

Query traffic, table contents, and schemas never flow through these channels. Logs and metrics stay inside your BYOC VPC.

## Troubleshooting access {#troubleshooting-access}

When ClickHouse engineers need to diagnose a problem in your deployment, they request just-in-time access through an internal escalation and approval workflow. Approved access is granted via a time-bound certificate and routed over [Tailscale](/cloud/reference/byoc/reference/network_security#tailscale-private-network) — never the public internet.

### What engineers can see {#what-engineers-can-see}

With approved troubleshooting access, engineers can read ClickHouse system tables only. This includes:

- `system.query_log` — query text and execution metadata for queries run against your service
- `system.tables`, `system.columns`, and similar system tables — schema and metadata
- Other `system.*` tables used for diagnostics (e.g., parts, mutations, replicas)

### What engineers cannot see {#what-engineers-cannot-see}

Engineers cannot read customer user tables. Access is scoped to system tables only.

### How access is enforced {#how-access-is-enforced}

- **Approval required**: every access request goes through an internal approval system with designated approvers. Engineers cannot self-grant access.
- **Time-bound certificates**: a temporary, time-bound certificate is generated per approved session. Access expires automatically.
- **Certificate-based authentication**: certificates replace password-based access for all human access to BYOC instances.
- **Read-only on system tables**: the certificate identity is scoped to system table reads.
- **No data exported**: logs and query results from troubleshooting sessions are never exported back to ClickHouse infrastructure.

## Auditing {#auditing}

Engineer activity is visible to you and audited by ClickHouse:

- **Customer-visible**: every query a ClickHouse engineer runs on your instance appears in your own `system.query_log`, including the query text and the certificate identity. You can audit this from your ClickHouse service directly.
- **ClickHouse-side**: all access requests, approvals, and Tailscale connections are logged and audited internally by ClickHouse's security team.

## Future controls {#future-controls}

Customer-controlled approval — where you approve each engineer access request before it takes effect — is on the roadmap. Today, approval is handled through ClickHouse's internal escalation process.

## Related {#related}

- [BYOC network security](/cloud/reference/byoc/reference/network_security) — how Tailscale and the network boundaries work
- [BYOC privilege](/cloud/reference/byoc/reference/privilege) — IAM roles created during BYOC setup
